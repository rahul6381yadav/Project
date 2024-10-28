const multer = require('multer');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const fs = require('fs');
const { pathToFileURL } = require('url');
const app = express();

const uploadDir = path.join(__dirname, 'uploads');
const PORT = process.env.PORT || 5000;


if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Configure storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Use the defined upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append extension
    },
});


const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/; // Allowed file types
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File type not supported'), false);
    }
});


app.post('/api/upload', upload.single('profilePic'), (req, res) => {
    if (req.file) {
        res.status(200).json({ message: 'File uploaded successfully', filePath: req.file.path });
    } else {
        res.status(400).json({ message: 'File upload failed', error: req.file });
    }
});


app.post('/api/register', upload.single('profilePic'), [
    body('email').isEmail(),
    body('mobile').isMobilePhone(),
    body('password').isLength({ min: 6 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, mobile, password } = req.body;

    // Check if file is uploaded
    if (!req.file) {
        return res.status(400).json({ message: 'Profile picture is required' });
    }

    const profilePic = req.file.path;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            mobile,
            password: hashedPassword,
            profilePic,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare the password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // If credentials are correct
        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Update profile details
app.put('/api/profile', async (req, res) => {
    const { email, fullName, college, branch, graduationYear, courseDuration, program, city, achievements, currentWork, educationDetails } = req.body;

    try {
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { fullName, college, branch, graduationYear, courseDuration, program, city, achievements, currentWork, educationDetails },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Get profile details
app.get('/api/profile/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/profile/image/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const user = await User.findOne({ email });
        if (!user || !user.profilePic) {
            return res.status(404).json({ message: 'User or image not found' });
        }
        // Get the absolute path to the image file
        const imagePath = path.resolve(user.profilePic);
        const newpath = pathToFileURL(imagePath);
        // Check if the image file exists
        // if (!fs.existsSync(newpath)) {
        //     return res.status(404).json({ message: 'Image file not found',user:user.profilePic ,path:imagePath});
        // }
        // Serve the image file directly
        res.sendFile(String(imagePath));

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});