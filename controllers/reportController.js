const Contract = require('../models/Contract');

exports.printContractAgreement = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findById(id).populate('assignedStaff');
    
    if (!contract) {
      req.session.error = 'Contract not found';
      return res.redirect('/admin/contracts');
    }
    
    const html = generateContractHTML(contract);
    res.send(html);
  } catch (error) {
    console.error('Print contract error:', error);
    req.session.error = 'Error generating contract';
    res.redirect('/admin/contracts');
  }
};

function generateContractHTML(contract) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Contract - ${contract.clientName}</title>
      <style>
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
        }
        .print-btn:hover { background: #1e3a8a; }
        @media print { .print-btn { display: none; } }
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          line-height: 1.6;
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
        .footer {
          margin-top: 50px;
          border-top: 2px solid #1e40af;
          padding-top: 20px;
        }
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
        }
        .signature-box {
          width: 45%;
        }
        .signature-line {
          border-top: 1px solid #000;
          margin-top: 50px;
          padding-top: 5px;
        }
      </style>
    </head>
    <body>
      <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
      <div class="header">
        <h1>Trawally Electrics & Plumbing Company</h1>
        <p>Professional Electrical and Plumbing Services</p>
        <p>Contact: +2203980627 | +2207980698</p>
      </div>
      
      <div class="section">
        <h2>Contract Agreement</h2>
        <div class="info-row">
          <strong>Contract ID:</strong> ${contract._id}
        </div>
        <div class="info-row">
          <strong>Date:</strong> ${new Date(contract.createdAt).toLocaleDateString()}
        </div>
      </div>
      
      <div class="section">
        <h2>Client Information</h2>
        <div class="info-row">
          <strong>Name:</strong> ${contract.clientName}
        </div>
        <div class="info-row">
          <strong>Phone:</strong> ${contract.clientPhone}
        </div>
        <div class="info-row">
          <strong>Address:</strong> ${contract.clientAddress}
        </div>
      </div>
      
      <div class="section">
        <h2>Service Details</h2>
        <div class="info-row">
          <strong>Service Type:</strong> ${contract.serviceType}
        </div>
        <div class="info-row">
          <strong>Description:</strong> ${contract.description}
        </div>
        <div class="info-row">
          <strong>Start Date:</strong> ${new Date(contract.startDate).toLocaleDateString()}
        </div>
        ${contract.endDate ? `<div class="info-row"><strong>End Date:</strong> ${new Date(contract.endDate).toLocaleDateString()}</div>` : ''}
      </div>
      
      <div class="section">
        <h2>Assigned Staff</h2>
        ${contract.assignedStaff && contract.assignedStaff.length > 0 ? contract.assignedStaff.map(staff => `
          <div class="info-row">
            - ${staff.name} (${staff.specialization})
          </div>
        `).join('') : '<div class="info-row">No staff assigned yet</div>'}
      </div>
      
      <div class="section">
        <h2>Financial Terms</h2>
        <div class="info-row">
          <strong>Total Fee:</strong> D ${contract.totalFee.toLocaleString()}
        </div>
        <div class="info-row">
          <strong>Payment Status:</strong> ${contract.paymentStatus.toUpperCase()}
        </div>
      </div>
      
      <div class="section">
        <h2>Terms and Conditions</h2>
        <p>1. The client agrees to pay the total fee as specified above.</p>
        <p>2. Trawally Electrics & Plumbing Company will provide professional services as described.</p>
        <p>3. Any changes to the scope of work must be agreed upon in writing.</p>
        <p>4. Payment terms must be honored as per agreement.</p>
      </div>
      
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line">
            Client Signature
          </div>
        </div>
        <div class="signature-box">
          <div class="signature-line">
            Company Representative
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p style="text-align: center; color: #666;">
          This is a legally binding agreement between the client and Trawally Electrics & Plumbing Company
        </p>
      </div>
    </body>
    </html>
  `;
}

module.exports = exports;

