const Contract = require('../models/Contract');
const Service = require('../models/Service');
const Deployment = require('../models/Deployment');

exports.printContractInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findById(id);
    
    if (!contract) {
      req.session.error = 'Contract not found';
      return res.redirect('/admin/contracts');
    }
    
    const deployments = await Deployment.find({ contract: id })
      .populate('staff', 'name specialization')
      .catch(() => []);
    
    const html = generateInvoiceHTML(contract, deployments, 'contract');
    res.send(html);
  } catch (error) {
    console.error('Print invoice error:', error);
    req.session.error = 'Error generating invoice';
    res.redirect('/admin/contracts');
  }
};

exports.printServiceInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    
    if (!service) {
      req.session.error = 'Service not found';
      return res.redirect('/admin/services');
    }
    
    const deployments = await Deployment.find({ service: id })
      .populate('staff', 'name specialization')
      .catch(() => []);
    
    const html = generateInvoiceHTML(service, deployments, 'service');
    res.send(html);
  } catch (error) {
    console.error('Print invoice error:', error);
    req.session.error = 'Error generating invoice';
    res.redirect('/admin/services');
  }
};

exports.printContractReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findById(id);
    
    if (!contract) {
      req.session.error = 'Contract not found';
      return res.redirect('/admin/contracts');
    }
    
    if (contract.paymentStatus !== 'paid') {
      req.session.error = 'Receipt can only be printed for paid items';
      return res.redirect('/admin/contracts');
    }
    
    const deployments = await Deployment.find({ contract: id })
      .populate('staff', 'name specialization')
      .catch(() => []);
    
    const html = generateReceiptHTML(contract, deployments, 'contract');
    res.send(html);
  } catch (error) {
    console.error('Print receipt error:', error);
    req.session.error = 'Error generating receipt';
    res.redirect('/admin/contracts');
  }
};

exports.printServiceReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    
    if (!service) {
      req.session.error = 'Service not found';
      return res.redirect('/admin/services');
    }
    
    if (service.paymentStatus !== 'paid') {
      req.session.error = 'Receipt can only be printed for paid items';
      return res.redirect('/admin/services');
    }
    
    const deployments = await Deployment.find({ service: id })
      .populate('staff', 'name specialization')
      .catch(() => []);
    
    const html = generateReceiptHTML(service, deployments, 'service');
    res.send(html);
  } catch (error) {
    console.error('Print receipt error:', error);
    req.session.error = 'Error generating receipt';
    res.redirect('/admin/services');
  }
};

function generateInvoiceHTML(item, deployments, type) {
  const isUnpaid = item.paymentStatus === 'unpaid';
  const itemType = type === 'contract' ? 'Contract' : 'Service';
  const dateField = type === 'contract' ? item.startDate : item.serviceDate;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${item.clientName}</title>
      <style>
        @media print {
          .print-btn { display: none; }
          .unpaid-stamp { 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
        }
        .print-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #1e40af;
          color: white;
          border: none;
          padding: 12px 24px;
          cursor: pointer;
          border-radius: 5px;
          font-size: 16px;
          z-index: 1000;
        }
        .print-btn:hover { background: #1e3a8a; }
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          line-height: 1.6;
          position: relative;
        }
        .unpaid-stamp {
          position: absolute;
          top: 150px;
          right: 50px;
          transform: rotate(-15deg);
          font-size: 48px;
          font-weight: bold;
          color: #dc2626;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          border: 5px solid #dc2626;
          padding: 20px 40px;
          background: rgba(255, 255, 255, 0.9);
          z-index: 100;
          letter-spacing: 5px;
          box-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #1e40af;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #1e40af;
          margin: 0;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .invoice-info-left, .invoice-info-right {
          width: 48%;
        }
        .section {
          margin: 20px 0;
        }
        .section h2 {
          color: #1e40af;
          border-bottom: 2px solid #f97316;
          padding-bottom: 5px;
        }
        .info-row {
          margin: 10px 0;
        }
        .info-row strong {
          display: inline-block;
          width: 150px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .table th, .table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        .table th {
          background-color: #1e40af;
          color: white;
        }
        .table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .total-section {
          margin-top: 30px;
          text-align: right;
        }
        .total-row {
          font-size: 18px;
          font-weight: bold;
          padding: 10px;
          background-color: #f3f4f6;
        }
        .footer {
          margin-top: 50px;
          border-top: 2px solid #1e40af;
          padding-top: 20px;
          text-align: center;
          color: #666;
        }
      </style>
    </head>
    <body>
      ${isUnpaid ? '<div class="unpaid-stamp">UNPAID</div>' : ''}
      <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
      
      <div class="header">
        <h1>Trawally Electrics & Plumbing Company</h1>
        <p>Professional Electrical and Plumbing Services</p>
        <p>Contact: +2203980627 | +2207980698</p>
      </div>
      
      <div class="invoice-info">
        <div class="invoice-info-left">
          <h2>INVOICE</h2>
          <div class="info-row">
            <strong>Invoice Number:</strong> ${itemType}-${item._id.toString().substring(0, 8).toUpperCase()}
          </div>
          <div class="info-row">
            <strong>Date:</strong> ${new Date(item.createdAt).toLocaleDateString()}
          </div>
          <div class="info-row">
            <strong>Payment Status:</strong> 
            <span style="color: ${isUnpaid ? '#dc2626' : '#10b981'}; font-weight: bold;">
              ${item.paymentStatus.toUpperCase()}
            </span>
          </div>
        </div>
        <div class="invoice-info-right">
          <h2>Bill To</h2>
          <div class="info-row">
            <strong>Name:</strong> ${item.clientName}
          </div>
          <div class="info-row">
            <strong>Phone:</strong> ${item.clientPhone}
          </div>
          <div class="info-row">
            <strong>Address:</strong> ${item.clientAddress}
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>Service Details</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Service Type</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${item.description}</td>
              <td>${item.serviceType}</td>
              <td>${new Date(dateField).toLocaleDateString()}</td>
              <td>D ${item.totalFee.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="total-section">
        <table class="table" style="width: 300px; margin-left: auto;">
          <tbody>
            <tr class="total-row">
              <td><strong>Total Amount:</strong></td>
              <td>D ${item.totalFee.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="footer">
        <p><strong>Payment Terms:</strong> Payment is due upon receipt of this invoice.</p>
        <p>Thank you for your business!</p>
        <p style="margin-top: 20px; font-size: 12px;">
          This is an official invoice from Trawally Electrics & Plumbing Company
        </p>
      </div>
    </body>
    </html>
  `;
}

function generateReceiptHTML(item, deployments, type) {
  const itemType = type === 'contract' ? 'Contract' : 'Service';
  const dateField = type === 'contract' ? item.startDate : item.serviceDate;
  const totalAmount = item.totalFee;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${item.clientName}</title>
      <style>
        @media print {
          .print-btn { display: none; }
          .paid-stamp { 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
        }
        .print-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #1e40af;
          color: white;
          border: none;
          padding: 12px 24px;
          cursor: pointer;
          border-radius: 5px;
          font-size: 16px;
          z-index: 1000;
        }
        .print-btn:hover { background: #1e3a8a; }
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          line-height: 1.6;
          position: relative;
        }
        .paid-stamp {
          position: absolute;
          top: 150px;
          right: 50px;
          transform: rotate(-15deg);
          font-size: 48px;
          font-weight: bold;
          color: #10b981;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          border: 5px solid #10b981;
          padding: 20px 40px;
          background: rgba(255, 255, 255, 0.9);
          z-index: 100;
          letter-spacing: 5px;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #10b981;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #10b981;
          margin: 0;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .receipt-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .receipt-info-left, .receipt-info-right {
          width: 48%;
        }
        .section {
          margin: 20px 0;
        }
        .section h2 {
          color: #10b981;
          border-bottom: 2px solid #f97316;
          padding-bottom: 5px;
        }
        .info-row {
          margin: 10px 0;
        }
        .info-row strong {
          display: inline-block;
          width: 150px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .table th, .table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        .table th {
          background-color: #10b981;
          color: white;
        }
        .table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .total-section {
          margin-top: 30px;
          text-align: right;
        }
        .total-row {
          font-size: 18px;
          font-weight: bold;
          padding: 10px;
          background-color: #d1fae5;
          color: #065f46;
        }
        .footer {
          margin-top: 50px;
          border-top: 2px solid #10b981;
          padding-top: 20px;
          text-align: center;
          color: #666;
        }
        .payment-confirmation {
          background-color: #d1fae5;
          border: 2px solid #10b981;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="paid-stamp">PAID</div>
      <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
      
      <div class="header">
        <h1>Trawally Electrics & Plumbing Company</h1>
        <p>Professional Electrical and Plumbing Services</p>
        <p>Contact: +2203980627 | +2207980698</p>
      </div>
      
      <div class="receipt-info">
        <div class="receipt-info-left">
          <h2>RECEIPT</h2>
          <div class="info-row">
            <strong>Receipt Number:</strong> RCP-${itemType}-${item._id.toString().substring(0, 8).toUpperCase()}
          </div>
          <div class="info-row">
            <strong>Date:</strong> ${new Date().toLocaleDateString()}
          </div>
          <div class="info-row">
            <strong>Payment Status:</strong> 
            <span style="color: #10b981; font-weight: bold;">
              PAID
            </span>
          </div>
        </div>
        <div class="receipt-info-right">
          <h2>Paid By</h2>
          <div class="info-row">
            <strong>Name:</strong> ${item.clientName}
          </div>
          <div class="info-row">
            <strong>Phone:</strong> ${item.clientPhone}
          </div>
          <div class="info-row">
            <strong>Address:</strong> ${item.clientAddress}
          </div>
        </div>
      </div>
      
      <div class="payment-confirmation">
        <h2 style="margin-top: 0; color: #065f46;">Payment Confirmed</h2>
        <p style="font-size: 18px; margin: 10px 0;">
          <strong>Amount Paid:</strong> D ${totalAmount.toLocaleString()}
        </p>
        <p style="margin: 10px 0;">
          <strong>Payment Date:</strong> ${new Date().toLocaleDateString()}
        </p>
      </div>
      
      <div class="section">
        <h2>Service Details</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Service Type</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${item.description}</td>
              <td>${item.serviceType}</td>
              <td>${new Date(dateField).toLocaleDateString()}</td>
              <td>D ${item.totalFee.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="total-section">
        <table class="table" style="width: 300px; margin-left: auto;">
          <tbody>
            <tr class="total-row">
              <td><strong>Total Paid:</strong></td>
              <td>D ${totalAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="footer">
        <p><strong>Thank you for your payment!</strong></p>
        <p>This receipt confirms that payment has been received in full.</p>
        <p style="margin-top: 20px; font-size: 12px;">
          This is an official receipt from Trawally Electrics & Plumbing Company
        </p>
      </div>
    </body>
    </html>
  `;
}

module.exports = exports;

