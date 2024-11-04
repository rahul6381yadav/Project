const mongoose = require('mongoose');

const DiscussionSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: String,
    email: String,
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }], // Array to store emails of users who liked the discussion
    comments: [
        {
            author: String,
            content: String,
            createdAt: { type: Date, default: Date.now },
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Discussion', DiscussionSchema);
