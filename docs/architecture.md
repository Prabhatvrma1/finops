# CloudCostIQ — Architecture Deep Dive

## System Architecture

CloudCostIQ follows a **microservices architecture** — instead of one giant application, we split functionality into small, independent services that communicate over HTTP. This is important because:

1. **Independent scaling** — If the frontend gets 10x traffic, scale only the frontend
2. **Technology freedom** — Use Node.js for APIs, Python for ML, React for UI
3. **Fault isolation** — If the analytics service crashes, the dashboard still works
4. **Team independence** — Different teams can work on different services

## High-Level Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend as React Frontend
    participant Backend as Node.js Backend
    participant DB as PostgreSQL
    participant Cache as Redis
    participant AWS as AWS Cost Explorer
    participant Azure as Azure Cost Mgmt
    participant GCP as GCP Billing
    participant Python as Python Analytics
    participant AI as OpenAI/Claude API

    Note over Backend: Scheduled Job (Daily)
    Backend->>AWS: GET cost & usage data
    Backend->>Azure: GET cost & usage data
    Backend->>GCP: GET billing data
    Backend->>Backend: Normalize & unify data
    Backend->>DB: Store CostRecords

    Note over User: User opens dashboard
    User->>Frontend: Navigate to dashboard
    Frontend->>Backend: GET /api/costs?range=30d
    Backend->>Cache: Check cache
    alt Cache hit
        Cache-->>Backend: Return cached data
    else Cache miss
        Backend->>DB: Query cost records
        DB-->>Backend: Return records
        Backend->>Cache: Store in cache (TTL: 5min)
    end
    Backend-->>Frontend: JSON response
    Frontend->>Frontend: Render charts & cards

    Note over User: User requests forecast
    User->>Frontend: Click "Forecast" tab
    Frontend->>Backend: GET /api/forecast
    Backend->>Python: POST /forecast (historical data)
    Python->>Python: Run Prophet model
    Python-->>Backend: Predictions + confidence intervals
    Backend-->>Frontend: Forecast data
    Frontend->>Frontend: Render forecast chart

    Note over User: User asks AI question
    User->>Frontend: "Why is my AWS bill high?"
    Frontend->>Backend: POST /api/chat
    Backend->>Backend: Gather cost context
    Backend->>AI: Send prompt + context
    AI-->>Backend: Generated response
    Backend-->>Frontend: Stream response
    Frontend->>User: Display AI answer
```

## Service Communication Map

```mermaid
graph LR
    subgraph "Public (Internet-facing)"
        FE[React Frontend :5173]
    end

    subgraph "Internal Services"
        BE[Node.js Backend :4000]
        PY[Python Analytics :8000]
    end

    subgraph "Data Stores"
        PG[(PostgreSQL :5432)]
        RD[(Redis :6379)]
    end

    subgraph "External APIs"
        AWS[AWS APIs]
        AZ[Azure APIs]
        GC[GCP APIs]
        OAI[OpenAI API]
    end

    subgraph "Monitoring"
        PR[Prometheus :9090]
        GR[Grafana :3001]
    end

    FE -->|REST API calls| BE
    BE -->|SQL queries| PG
    BE -->|Cache get/set| RD
    BE -->|HTTP| PY
    BE -->|SDK calls| AWS
    BE -->|SDK calls| AZ
    BE -->|SDK calls| GC
    BE -->|API calls| OAI
    PY -->|SQL queries| PG
    PR -->|Scrape /metrics| BE
    PR -->|Scrape /metrics| PY
    GR -->|Query| PR
```

## Database Schema (ERD)

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string name
        string role
        timestamp created_at
        timestamp updated_at
    }

    COST_RECORDS {
        uuid id PK
        date record_date
        string provider
        string service
        string region
        decimal amount
        string currency
        string environment
        string project
        string owner
        jsonb tags
        jsonb metadata
        timestamp created_at
    }

    BUDGETS {
        uuid id PK
        uuid user_id FK
        string name
        decimal limit_amount
        string period
        string provider
        decimal alert_threshold
        boolean is_active
        timestamp created_at
    }

    RECOMMENDATIONS {
        uuid id PK
        string type
        string provider
        string resource_id
        string resource_name
        string current_config
        string recommended_config
        decimal estimated_savings
        string priority
        string status
        timestamp created_at
    }

    ALERTS {
        uuid id PK
        uuid budget_id FK
        string type
        string severity
        string message
        decimal actual_amount
        decimal threshold_amount
        boolean is_acknowledged
        timestamp triggered_at
    }

    USERS ||--o{ BUDGETS : "creates"
    BUDGETS ||--o{ ALERTS : "triggers"
```

## Key Design Decisions

### Why Express over NestJS?
- **Simpler to learn** — Express is minimal and explicit, making it easier to understand what's happening
- **More flexibility** — NestJS adds opinions and abstractions that are great for large teams but add complexity
- **Industry standard** — Express is the most widely used Node.js framework

### Why Sequelize ORM?
- **SQL generation** — Writes SQL for you, preventing SQL injection attacks
- **Migrations** — Version-controls your database schema changes
- **Model definitions** — Define your data structure in JavaScript, not raw SQL
- **Multi-DB support** — Works with PostgreSQL, MySQL, SQLite (easy testing)

### Why Zustand over Redux?
- **90% less boilerplate** — Redux requires actions, reducers, dispatchers; Zustand is just a hook
- **Simpler mental model** — State is just a JavaScript object with updater functions
- **Built-in devtools** — Great debugging without extra setup

### Why FastAPI for Python service?
- **Performance** — Async support makes it faster than Flask
- **Auto-documentation** — Swagger docs generated automatically
- **Type safety** — Pydantic models validate data automatically
- **ML-friendly** — Python ecosystem is best for data science

### Why separate Python service?
- **Best tool for the job** — Python has Prophet, scikit-learn, pandas — Node.js doesn't
- **Independent scaling** — Forecasting is CPU-intensive; scale it independently
- **12-Factor App** — Each service does ONE thing well

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        direction TB
        L1[Layer 1: Network - HTTPS/TLS]
        L2[Layer 2: API Gateway - Rate Limiting, CORS]
        L3[Layer 3: Authentication - JWT Tokens]
        L4[Layer 4: Authorization - Role-Based Access]
        L5[Layer 5: Input Validation - express-validator]
        L6[Layer 6: Database - Parameterized Queries via ORM]
        L7[Layer 7: Secrets - Environment Variables / Vault]
    end

    L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7
```

## Environment Strategy

| Environment | Purpose | Database | Cloud APIs | Deployment |
|------------|---------|----------|------------|------------|
| **Local** | Development | Docker PostgreSQL | Mock data | docker-compose |
| **Dev** | Integration testing | Cloud-hosted DB | Real APIs (sandbox) | K8s dev namespace |
| **Prod** | Production | Managed RDS (multi-AZ) | Real APIs | K8s prod namespace |
