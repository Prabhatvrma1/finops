const express = require('express');
const router = express.Router();
const infrastructureController = require('../controllers/infrastructureController');

// const { protect } = require('../middleware/auth');
// router.use(protect);

router.get('/topology', infrastructureController.getTopology);
router.get('/carbon', infrastructureController.getCarbon);
router.get('/drift', infrastructureController.getDrift);

module.exports = router;
