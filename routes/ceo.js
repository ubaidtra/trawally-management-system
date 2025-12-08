const express = require('express');
const router = express.Router();
const ceoController = require('../controllers/ceoController');
const messageController = require('../controllers/messageController');
const { isAuthenticated } = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.use(isAuthenticated);
router.use(checkRole('ceo'));

router.get('/dashboard', ceoController.showDashboard);
router.get('/reports', ceoController.showReports);

router.get('/contracts', ceoController.showContracts);
router.get('/contracts/:id', ceoController.showContractDetails);
router.get('/contracts/:id/invoice', invoiceController.printContractInvoice);
router.get('/contracts/:id/receipt', invoiceController.printContractReceipt);

router.get('/services', ceoController.showServices);
router.get('/services/:id', ceoController.showServiceDetails);
router.get('/services/:id/invoice', invoiceController.printServiceInvoice);
router.get('/services/:id/receipt', invoiceController.printServiceReceipt);

router.get('/messages', messageController.showMessages);
router.post('/messages', messageController.sendMessage);
router.patch('/messages/:id/read', messageController.markAsRead);
router.delete('/messages/:id', messageController.deleteMessage);

module.exports = router;

