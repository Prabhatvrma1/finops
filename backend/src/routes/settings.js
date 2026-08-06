const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/cloud-accounts', settingsController.getCloudAccounts);
router.post('/cloud-accounts', settingsController.saveCloudAccount);
router.delete('/cloud-accounts/:id', settingsController.deleteCloudAccount);
router.post('/test-connection', settingsController.testConnection);
router.put('/global', settingsController.updateGlobalSettings);

module.exports = router;
