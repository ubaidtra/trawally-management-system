const express = require('express');
const router = express.Router();
const deploymentController = require('../controllers/deploymentController');
const { isAuthenticated } = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.use(isAuthenticated);
router.use(checkRole('admin'));

router.post('/', deploymentController.createDeployment);
router.put('/:id', deploymentController.updateDeployment);
router.delete('/:id', deploymentController.deleteDeployment);
router.get('/api', deploymentController.showDeployments);

module.exports = router;

