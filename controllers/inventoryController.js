const InventoryItem = require('../models/InventoryItem');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.showInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ itemId: 1 }).lean();
    res.render('admin/inventory', {
      title: 'Inventory',
      currentPage: 'inventory',
      items: items || []
    });
  } catch (error) {
    console.error('Inventory list error:', error);
    res.render('admin/inventory', {
      title: 'Inventory',
      currentPage: 'inventory',
      items: [],
      error: 'Error loading inventory'
    });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { itemId, name, itemType, quantity, price } = req.body;
    if (!itemId || !name || !itemType || quantity === '' || price === '') {
      req.session.error = 'All fields are required';
      return req.session.save(() => res.redirect('/admin/inventory'));
    }
    const q = parseInt(quantity, 10);
    const p = parseFloat(price);
    if (!Number.isFinite(q) || q < 0 || !Number.isFinite(p) || p < 0) {
      req.session.error = 'Quantity and price must be valid numbers';
      return req.session.save(() => res.redirect('/admin/inventory'));
    }
    await InventoryItem.create({
      itemId: String(itemId).trim(),
      name: String(name).trim(),
      itemType: String(itemType).trim(),
      quantity: q,
      price: p,
      createdBy: req.session.user.id
    });
    req.session.success = 'Item added to inventory';
    req.session.save(() => res.redirect('/admin/inventory'));
  } catch (error) {
    console.error('Create inventory error:', error);
    if (error.code === 11000) {
      req.session.error = 'Item ID already exists';
    } else {
      req.session.error = 'Could not save item';
    }
    req.session.save(() => res.redirect('/admin/inventory'));
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, itemType, quantity, price } = req.body;
    const item = await InventoryItem.findById(id);
    if (!item) {
      req.session.error = 'Item not found';
      return req.session.save(() => res.redirect('/admin/inventory'));
    }
    if (name !== undefined) item.name = String(name).trim();
    if (itemType !== undefined) item.itemType = String(itemType).trim();
    if (quantity !== undefined && quantity !== '') {
      const q = parseInt(quantity, 10);
      if (!Number.isFinite(q) || q < 0) {
        req.session.error = 'Invalid quantity';
        return req.session.save(() => res.redirect('/admin/inventory'));
      }
      item.quantity = q;
    }
    if (price !== undefined && price !== '') {
      const p = parseFloat(price);
      if (!Number.isFinite(p) || p < 0) {
        req.session.error = 'Invalid price';
        return req.session.save(() => res.redirect('/admin/inventory'));
      }
      item.price = p;
    }
    await item.save();
    req.session.success = 'Item updated';
    req.session.save(() => res.redirect('/admin/inventory'));
  } catch (error) {
    console.error('Update inventory error:', error);
    req.session.error = 'Could not update item';
    req.session.save(() => res.redirect('/admin/inventory'));
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    await InventoryItem.findByIdAndDelete(id);
    req.session.success = 'Item removed';
    req.session.save(() => res.redirect('/admin/inventory'));
  } catch (error) {
    console.error('Delete inventory error:', error);
    req.session.error = 'Could not delete item';
    req.session.save(() => res.redirect('/admin/inventory'));
  }
};

exports.searchItems = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.json([]);
    }
    const rx = new RegExp(escapeRegex(q), 'i');
    const items = await InventoryItem.find({
      $or: [{ itemId: rx }, { name: rx }]
    })
      .select('itemId name itemType quantity price')
      .limit(25)
      .lean();
    res.json(items);
  } catch (error) {
    console.error('Inventory search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};
