const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const staffController = require('../controllers/staffController');
const attendanceController = require('../controllers/attendanceController');
const breakfastController = require('../controllers/breakfastController');
const contractController = require('../controllers/contractController');
const serviceController = require('../controllers/serviceController');
const invoiceController = require('../controllers/invoiceController');
const { isAuthenticated } = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.use(isAuthenticated);
router.use(checkRole('admin'));

router.get('/dashboard', adminController.showDashboard);

router.get('/staff', staffController.showStaff);
router.post('/staff', staffController.createStaff);
router.put('/staff/:id', staffController.updateStaff);
router.patch('/staff/:id/status', staffController.toggleStatus);
router.delete('/staff/:id', staffController.deleteStaff);

router.get('/attendance', attendanceController.showAttendance);
router.post('/attendance', attendanceController.recordAttendance);

router.get('/breakfast', breakfastController.showBreakfast);
router.post('/breakfast', breakfastController.recordBreakfast);
router.delete('/breakfast/:id', breakfastController.deleteBreakfast);

router.get('/contracts', contractController.showContracts);
router.post('/contracts', contractController.createContract);
router.patch('/contracts/:id/payment', contractController.updatePaymentStatus);
router.patch('/contracts/:id/status', contractController.updateStatus);
router.delete('/contracts/:id', contractController.deleteContract);
router.get('/contracts/:id/invoice', invoiceController.printContractInvoice);
router.get('/contracts/:id/receipt', invoiceController.printContractReceipt);

router.get('/services', serviceController.showServices);
router.post('/services', serviceController.createService);
router.patch('/services/:id/payment', serviceController.updatePaymentStatus);
router.patch('/services/:id/status', serviceController.updateStatus);
router.delete('/services/:id', serviceController.deleteService);
router.get('/services/:id/invoice', invoiceController.printServiceInvoice);
router.get('/services/:id/receipt', invoiceController.printServiceReceipt);

module.exports = router;

