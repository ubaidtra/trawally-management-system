const express = require('express');
const router = express.Router();
const ceoController = require('../controllers/ceoController');
const { isAuthenticated } = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.use(isAuthenticated);
router.use(checkRole('ceo'));

router.get('/dashboard', ceoController.showDashboard);
router.get('/reports', ceoController.showReports);

module.exports = router;

