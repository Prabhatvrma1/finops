"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface CloudAccount {
  id: string;
  provider: string;
  name: string;
  accountId: string;
  authType: string;
  roleArn?: string;
  region: string;
  status: string;
  lastSync: string;
}

const fetchAccounts = async () => {
  const res = await fetch(`${API_BASE}/api/settings/cloud-accounts`);
  if (!res.ok) throw new Error("Failed to fetch cloud accounts");
  const json = await res.json();
  return json.data;
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"AWS" | "GCP" | "AZURE">("AWS");
  const [authMethod, setAuthMethod] = useState<"role" | "keys">("role");
  
  // Form fields
  const [accountName, setAccountName] = useState("");
  const [roleArn, setRoleArn] = useState("");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [projectId, setProjectId] = useState("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["cloud-accounts"],
    queryFn: fetchAccounts
  });

  const accounts: CloudAccount[] = data?.accounts || [];
  const settings = data?.settings || { useMockData: true, slackAlertsEnabled: true, alertThresholdUSD: 500 };

  // Auto-dismiss notification after 4 seconds
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Add Account Mutation
  const addAccountMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch(`${API_BASE}/api/settings/cloud-accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save account");
      return res.json();
    },
    onSuccess: (res) => {
      showNotification(res.message || "Account connected successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["cloud-accounts"] });
      setAccountName("");
      setRoleArn("");
      setAccessKeyId("");
      setSecretAccessKey("");
      setProjectId("");
    },
    onError: () => {
      showNotification("Failed to connect account. Please check credentials.", "error");
    }
  });

  // Delete Account Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/api/settings/cloud-accounts/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      showNotification("Cloud account disconnected.", "success");
      queryClient.invalidateQueries({ queryKey: ["cloud-accounts"] });
    }
  });

  // Test Connection
  const handleTestConnection = async (provider: string, id?: string) => {
    if (id) setTestingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/settings/test-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider })
      });
      const json = await res.json();
      showNotification(json.message, "success");
    } catch {
      showNotification("Connection test failed.", "error");
    } finally {
      setTestingId(null);
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName) {
      showNotification("Please enter an account name.", "error");
      return;
    }

    addAccountMutation.mutate({
      provider: activeTab,
      name: accountName,
      roleArn: authMethod === "role" ? roleArn : undefined,
      accessKeyId: authMethod === "keys" ? accessKeyId : undefined,
      secretAccessKey: authMethod === "keys" ? secretAccessKey : undefined,
      region,
      projectId: activeTab === "GCP" ? projectId : undefined
    });
  };

  return (
    <div className="space-y-xl pb-24">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low p-6 rounded-2xl border border-white/5 shadow-lg">
        <div>
          <h1 className="font-headline-md font-bold text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">cloud_sync</span>
            Cloud Accounts & Integrations
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Connect multicloud providers to pull live billing data, configure IAM roles, and manage credentials.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface-variant/40 px-4 py-2 rounded-xl border border-white/10">
          <span className={`w-2.5 h-2.5 rounded-full ${settings.useMockData ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`}></span>
          <span className="font-label-sm text-on-surface">Mode: {settings.useMockData ? "Mock Strategy (Safe Demo)" : "Live Cloud APIs"}</span>
        </div>
      </div>

      {/* Alert / Toast */}
      {notification && (
        <div className={`p-4 rounded-xl flex justify-between items-center animate-[slideDown_0.3s_ease-out] ${notification.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300" : "bg-error/10 border border-error/30 text-error"}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">{notification.type === "success" ? "check_circle" : "error"}</span>
            <span className="font-body-md">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Connected Accounts Grid */}
      <div className="space-y-4">
        <h2 className="font-title-md font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">dns</span>
          Connected Cloud Environments ({accounts.length})
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-surface-container/50 p-5 rounded-xl border border-white/10 animate-pulse">
                <div className="h-6 bg-surface-variant/50 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-surface-variant/30 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-surface-variant/20 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant bg-surface-container/30 rounded-xl border border-white/5">
            <span className="material-symbols-outlined text-[48px] text-primary/30 mb-2">cloud_off</span>
            <p className="font-body-md">No cloud accounts connected yet. Add one below to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((acc) => (
              <div key={acc.id} className="bg-surface-container/50 p-5 rounded-xl border border-white/10 hover:border-primary/40 transition-all flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {acc.provider === "AWS" ? "A" : acc.provider === "GCP" ? "G" : "Az"}
                    </div>
                    <div>
                      <h3 className="font-title-md font-semibold text-on-surface">{acc.name}</h3>
                      <p className="font-label-sm text-on-surface-variant">{acc.authType} • {acc.region}</p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 font-label-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {acc.status}
                  </span>
                </div>

                <div className="bg-surface-variant/30 p-3 rounded-lg font-mono text-xs text-on-surface-variant flex justify-between items-center">
                  <span>ID: {acc.accountId}</span>
                  <span>Sync: {new Date(acc.lastSync).toLocaleTimeString()}</span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleTestConnection(acc.provider, acc.id)}
                    disabled={testingId === acc.id}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-variant hover:bg-primary/20 text-primary transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-sm ${testingId === acc.id ? 'animate-spin' : ''}`}>{testingId === acc.id ? "sync" : "build"}</span>
                    {testingId === acc.id ? "Testing..." : "Test Credentials"}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(acc.id)}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-error/10 hover:bg-error/20 text-error transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connect New Provider Form */}
      <div className="bg-surface-container-low p-6 rounded-2xl border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-4 gap-4">
          <h2 className="font-title-md font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_link</span>
            Connect New Cloud Provider
          </h2>
          <div className="flex gap-2">
            {(["AWS", "GCP", "AZURE"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-label-sm font-semibold transition-all cursor-pointer active:scale-95 ${
                  activeTab === tab
                    ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                    : "bg-surface-variant text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSaveAccount} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-sm text-on-surface-variant mb-1.5">Account Name / Label *</label>
              <input
                type="text"
                placeholder={`e.g. ${activeTab} Production Analytics`}
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full bg-surface-variant/50 border border-white/10 rounded-xl px-4 py-2.5 font-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block font-label-sm text-on-surface-variant mb-1.5">Default Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-surface-variant/50 border border-white/10 rounded-xl px-4 py-2.5 font-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
              >
                <option value="us-east-1">us-east-1 (N. Virginia)</option>
                <option value="us-west-2">us-west-2 (Oregon)</option>
                <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
                <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
                <option value="ap-south-1">ap-south-1 (Mumbai)</option>
              </select>
            </div>
          </div>

          {activeTab === "AWS" && (
            <div className="space-y-4 pt-2">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-body-md text-on-surface">
                  <input
                    type="radio"
                    name="authMethod"
                    checked={authMethod === "role"}
                    onChange={() => setAuthMethod("role")}
                    className="accent-primary"
                  />
                  IAM Role ARN (OIDC Recommended)
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-body-md text-on-surface">
                  <input
                    type="radio"
                    name="authMethod"
                    checked={authMethod === "keys"}
                    onChange={() => setAuthMethod("keys")}
                    className="accent-primary"
                  />
                  Access Key & Secret Key
                </label>
              </div>

              {authMethod === "role" ? (
                <div>
                  <label className="block font-label-sm text-on-surface-variant mb-1.5">AWS IAM Role ARN</label>
                  <input
                    type="text"
                    placeholder="arn:aws:iam::123456789012:role/CloudCostIQRole"
                    value={roleArn}
                    onChange={(e) => setRoleArn(e.target.value)}
                    className="w-full bg-surface-variant/50 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                  <p className="font-label-sm text-on-surface-variant mt-1">
                    Grant Cost Explorer read permissions (`ce:GetCostAndUsage`) to this IAM role.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-sm text-on-surface-variant mb-1.5">AWS Access Key ID</label>
                    <input
                      type="text"
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      value={accessKeyId}
                      onChange={(e) => setAccessKeyId(e.target.value)}
                      className="w-full bg-surface-variant/50 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-label-sm text-on-surface-variant mb-1.5">AWS Secret Access Key</label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••••••••••••••"
                      value={secretAccessKey}
                      onChange={(e) => setSecretAccessKey(e.target.value)}
                      className="w-full bg-surface-variant/50 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "GCP" && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block font-label-sm text-on-surface-variant mb-1.5">GCP Project ID</label>
                <input
                  type="text"
                  placeholder="my-finops-project-id"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-surface-variant/50 border border-white/10 rounded-xl px-4 py-2.5 font-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}

          {activeTab === "AZURE" && (
            <div className="p-4 bg-surface-variant/30 rounded-xl text-on-surface-variant font-body-md flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">info</span>
              Azure Cost Management API integration is ready for tenant connection. Enter your Subscription ID in the Account Name field above.
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleTestConnection(activeTab)}
              className="px-5 py-2.5 rounded-xl border border-white/10 font-label-sm font-semibold text-on-surface hover:bg-surface-variant transition-colors cursor-pointer active:scale-95"
            >
              Test API Connection
            </button>
            <button
              type="submit"
              disabled={addAccountMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-sm font-semibold hover:brightness-110 shadow-lg shadow-primary/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {addAccountMutation.isPending ? "Connecting..." : `Connect ${activeTab} Account`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
