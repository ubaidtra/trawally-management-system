const InventoryItem = require('../models/InventoryItem');
const Sale = require('../models/Sale');

const RECEIPT_COMPANY = {
  name: 'Trawally Electrics & Plumbing Company',
  phones: ['+220 398 0627', '+220 798 0698'],
  hours: 'Mon–Fri 8:00 AM – 6:00 PM · Sat 9:00 AM – 4:00 PM · Sun emergency only'
};

exports.showSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.render('admin/sales', {
      title: 'Sales',
      currentPage: 'sales',
      sales: sales || []
    });
  } catch (error) {
    console.error('Sales list error:', error);
    res.render('admin/sales', {
      title: 'Sales',
      currentPage: 'sales',
      sales: [],
      error: 'Error loading sales'
    });
  }
};

exports.createSale = async (req, res) => {
  const buyerName =
    typeof req.body.buyerName === 'string' ? req.body.buyerName.trim() : '';
  if (!buyerName) {
    return res.status(400).json({ error: 'Buyer name is required' });
  }

  const itemsPayload = req.body.items;
  if (!Array.isArray(itemsPayload) || itemsPayload.length === 0) {
    return res.status(400).json({ error: 'Add at least one item to the sale' });
  }

  const rollbacks = [];
  try {
    const lines = [];
    let total = 0;

    for (const row of itemsPayload) {
      const inventoryItemId = row.inventoryItemId;
      const quantity = parseInt(row.quantity, 10);
      if (!inventoryItemId || !Number.isFinite(quantity) || quantity < 1) {
        throw new Error('Invalid line: check item and quantity');
      }

      const updated = await InventoryItem.findOneAndUpdate(
        { _id: inventoryItemId, quantity: { $gte: quantity } },
        { $inc: { quantity: -quantity } },
        { new: true }
      );

      if (!updated) {
        throw new Error('Not enough stock or item no longer available');
      }

      rollbacks.push({ id: updated._id, quantity });

      const unitPrice = updated.price;
      const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
      total += lineTotal;

      lines.push({
        inventoryItem: updated._id,
        itemId: updated.itemId,
        name: updated.name,
        itemType: updated.itemType,
        quantity,
        unitPrice,
        lineTotal
      });
    }

    total = Math.round(total * 100) / 100;
    const sale = await Sale.create({
      lines,
      total,
      buyerName,
      createdBy: req.session.user.id
    });

    return res.json({
      ok: true,
      saleId: sale._id.toString(),
      total: sale.total
    });
  } catch (error) {
    for (const r of rollbacks.reverse()) {
      await InventoryItem.updateOne({ _id: r.id }, { $inc: { quantity: r.quantity } });
    }
    console.error('Create sale error:', error);
    return res.status(400).json({ error: error.message || 'Sale could not be recorded' });
  }
};

exports.printSaleReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id).lean();
    if (!sale) {
      req.session.error = 'Sale not found';
      return res.redirect('/admin/sales');
    }
    const html = receiptHtml(sale);
    if (req.query.download === '1') {
      res.setHeader('Content-Disposition', `attachment; filename="sale-receipt-${id}.html"`);
    }
    res.type('html').send(html);
  } catch (error) {
    console.error('Sale receipt error:', error);
    req.session.error = 'Could not open receipt';
    res.redirect('/admin/sales');
  }
};

function receiptHtml(sale) {
  const date = new Date(sale.createdAt).toLocaleString();
  const buyer =
    sale.buyerName && String(sale.buyerName).trim()
      ? escapeHtml(String(sale.buyerName).trim())
      : '—';
  const rows = sale.lines
    .map(
      (l) => `
    <tr>
      <td>${escapeHtml(l.itemId)}</td>
      <td>${escapeHtml(l.name)}</td>
      <td>${escapeHtml(l.itemType)}</td>
      <td class="num">${l.quantity}</td>
      <td class="num">${formatMoney(l.unitPrice)}</td>
      <td class="num">${formatMoney(l.lineTotal)}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sale receipt</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; color: #111; }
    h1 { font-size: 1.35rem; margin-bottom: 0.25rem; }
    .company-contact { color: #444; font-size: 0.85rem; line-height: 1.5; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
    .company-contact strong { color: #111; }
    .meta { color: #555; font-size: 0.9rem; margin-bottom: 1.5rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th, td { border: 1px solid #ccc; padding: 0.5rem 0.6rem; text-align: left; }
    th { background: #f3f4f6; }
    .num { text-align: right; }
    tfoot td { font-weight: 600; }
    .actions { margin-top: 1.5rem; display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .btn { padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #2563eb; background: #2563eb; color: #fff; cursor: pointer; font-size: 0.9rem; text-decoration: none; display: inline-block; }
    .btn.secondary { background: #fff; color: #2563eb; }
    @media print { .actions { display: none; } body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(RECEIPT_COMPANY.name)}</h1>
  <div class="company-contact">
    <strong>Phone:</strong> ${escapeHtml(RECEIPT_COMPANY.phones.join(' · '))}<br>
    <strong>Hours:</strong> ${escapeHtml(RECEIPT_COMPANY.hours)}
  </div>
  <p class="meta">Sale receipt &middot; ${escapeHtml(date)}<br>Buyer: <strong>${buyer}</strong><br>Reference: ${escapeHtml(String(sale._id))}</p>
  <table>
    <thead>
      <tr>
        <th>Item ID</th>
        <th>Item name</th>
        <th>Type</th>
        <th class="num">Qty</th>
        <th class="num">Unit price</th>
        <th class="num">Line total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="5">Total</td>
        <td class="num">${formatMoney(sale.total)}</td>
      </tr>
    </tfoot>
  </table>
  <div class="actions">
    <button type="button" class="btn" onclick="window.print()">Print</button>
    <a class="btn secondary" href="/admin/sales/${sale._id}/receipt?download=1">Download HTML</a>
    <a class="btn secondary" href="/admin/sales">Back to sales</a>
  </div>
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(n) {
  return 'D ' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
