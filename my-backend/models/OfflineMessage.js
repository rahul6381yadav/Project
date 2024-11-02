const mongoose = require('mongoose');

const offlineMessageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    file: { type: String },  // Optional, path to the file if attached
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'delivered'], default: 'pending' },  // Tracks if message is delivered
});

const OfflineMessage = mongoose.model('OfflineMessage', offlineMessageSchema);

module.exports = OfflineMessage;
