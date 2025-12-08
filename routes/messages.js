const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', messageController.showMessages);
router.post('/', messageController.sendMessage);
router.patch('/:id/read', messageController.markAsRead);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;

