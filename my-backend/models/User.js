
const mongoose = require('mongoose');


const requestSchema = new mongoose.Schema({
    from: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
});

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    profilePic: { type: String },
    fullName: { type: String },
    college: { type: String },
    branch: { type: String },
    graduationYear: { type: Number },
    courseDuration: { type: Number }, // 4 or 5 years
    program: { type: String, enum: ['BTech', 'MTech', 'PhD'] },
    city: { type: String },
    achievements: { type: String },
    currentWork: { type: String },
    educationDetails: { type: String },
    requests: [ requestSchema],
    friends: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],
});

module.exports = mongoose.model('User', userSchema);

