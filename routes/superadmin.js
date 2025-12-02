const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadminController');
const { isAuthenticated } = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.use(isAuthenticated);
router.use(checkRole('superadmin'));

router.get('/dashboard', superadminController.showDashboard);
router.get('/users', superadminController.showUsers);
router.post('/users', superadminController.createUser);
router.delete('/users/:id', superadminController.deleteUser);
router.post('/users/:id/reset-password', superadminController.resetPassword);

module.exports = router;

