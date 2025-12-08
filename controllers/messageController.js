const Message = require('../models/Message');
const User = require('../models/User');

exports.showMessages = async (req, res) => {
  try {
    const currentUserId = req.session.user.id;
    const userRole = req.session.user.role;
    
    const sentMessages = await Message.find({ sender: currentUserId })
      .populate('recipient', 'username role')
      .sort({ createdAt: -1 })
      .catch(() => []);
    
    const receivedMessages = await Message.find({ recipient: currentUserId })
      .populate('sender', 'username role')
      .sort({ createdAt: -1 })
      .catch(() => []);
    
    const unreadCount = receivedMessages.filter(m => !m.isRead).length;
    
    const recipients = await User.find({
      role: { $in: userRole === 'ceo' ? ['admin'] : ['ceo'] }
    }).select('username role').catch(() => []);
    
    res.render(`${userRole}/messages`, {
      title: 'Messages',
      currentPage: 'messages',
      sentMessages: sentMessages || [],
      receivedMessages: receivedMessages || [],
      unreadCount: unreadCount || 0,
      recipients: recipients || []
    });
  } catch (error) {
    console.error('Show messages error:', error);
    res.render(`${req.session.user.role}/messages`, {
      title: 'Messages',
      currentPage: 'messages',
      sentMessages: [],
      receivedMessages: [],
      unreadCount: 0,
      recipients: [],
      error: 'Error loading messages'
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, subject, message } = req.body;
    const senderId = req.session.user.id;
    const userRole = req.session.user.role;
    
    if (!recipientId || !subject || !message) {
      req.session.error = 'All fields are required';
      return req.session.save(() => res.redirect(`/${userRole}/messages`));
    }
    
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      req.session.error = 'Recipient not found';
      return req.session.save(() => res.redirect(`/${userRole}/messages`));
    }
    
    if (userRole === 'ceo' && recipient.role !== 'admin') {
      req.session.error = 'You can only message admins';
      return req.session.save(() => res.redirect(`/${userRole}/messages`));
    }
    
    if (userRole === 'admin' && recipient.role !== 'ceo') {
      req.session.error = 'You can only message the CEO';
      return req.session.save(() => res.redirect(`/${userRole}/messages`));
    }
    
    const newMessage = new Message({
      sender: senderId,
      recipient: recipientId,
      subject: subject.trim(),
      message: message.trim()
    });
    
    await newMessage.save();
    req.session.success = 'Message sent successfully';
    res.redirect(`/${userRole}/messages`);
  } catch (error) {
    console.error('Send message error:', error);
    req.session.error = 'Error sending message';
    res.redirect(`/${req.session.user.role}/messages`);
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.session.user.id;
    
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    if (message.recipient.toString() !== currentUserId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    message.isRead = true;
    message.readAt = new Date();
    await message.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Error marking message as read' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.session.user.id;
    const userRole = req.session.user.role;
    
    const message = await Message.findById(id);
    if (!message) {
      req.session.error = 'Message not found';
      return req.session.save(() => res.redirect(`/${userRole}/messages`));
    }
    
    if (message.sender.toString() !== currentUserId && message.recipient.toString() !== currentUserId) {
      req.session.error = 'Unauthorized';
      return req.session.save(() => res.redirect(`/${userRole}/messages`));
    }
    
    await Message.findByIdAndDelete(id);
    req.session.success = 'Message deleted successfully';
    res.redirect(`/${userRole}/messages`);
  } catch (error) {
    console.error('Delete message error:', error);
    req.session.error = 'Error deleting message';
    res.redirect(`/${req.session.user.role}/messages`);
  }
};

