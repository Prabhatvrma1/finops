const { generateTopology, generateCarbon, generateDrift } = require('../utils/mockData');

// In a real application, these endpoints would fetch live state from
// AWS EKS APIs, Prometheus, OpenCost, and Terraform state files.

exports.getTopology = async (req, res, next) => {
  try {
    const topology = generateTopology();
    res.json({ success: true, data: topology });
  } catch (error) {
    next(error);
  }
};

exports.getCarbon = async (req, res, next) => {
  try {
    const carbon = generateCarbon();
    res.json({ success: true, data: carbon });
  } catch (error) {
    next(error);
  }
};

exports.getDrift = async (req, res, next) => {
  try {
    const drift = generateDrift();
    res.json({ success: true, data: drift });
  } catch (error) {
    next(error);
  }
};
