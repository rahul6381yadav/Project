const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const User = require('./models/User');
const Message = require('./models/Message');
const News = require('./models/News');
const Discussion = require('./models/Discussion');

const OfflineMessage = require('./models/OfflineMessage');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://10.0.2.2:5000", // Replace with your frontend URL
        methods: ["GET", "POST"],
        credentials: true
    }
});

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Configure storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage: storage });

// Online users tracking
const onlineUsers = {};
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('online', async (userEmail) => {
        onlineUsers[userEmail] = socket.id;

        try {
            // Find user by email to get the ObjectId
            const user = await User.findOne({ email: userEmail });
            if (!user) {
                console.error('User not found for email:', userEmail);
                return;
            }

            // Retrieve offline messages for this user by their ObjectId
            const messages = await OfflineMessage.find({ receiverId: user._id });
            messages.forEach(async (msg) => {
                io.to(socket.id).emit('receiveMessage', msg);

                // Use deleteOne instead of remove
                await OfflineMessage.deleteOne({ _id: msg._id });
            });
        } catch (error) {
            console.error("Error in online event:", error);
        }
    });


    socket.on('send_message', async ({ senderEmail, receiverEmail, text, timestamp }) => {
        try {
            const sender = await User.findOne({ email: senderEmail });
            const receiver = await User.findOne({ email: receiverEmail });

            if (!sender || !receiver) return;

            const newMessage = new Message({ senderId: sender._id, receiverId: receiver._id, text, timestamp });
            await newMessage.save(); // Save the message in the main Message collection

            // Check if the receiver is online
            if (onlineUsers[receiverEmail]) {
                io.to(onlineUsers[receiverEmail]).emit('receiveMessage', newMessage);
            } else {
                // Store the message for the offline user
                const offlineMessage = new OfflineMessage({
                    senderId: sender._id,
                    receiverId: receiver._id,
                    text,
                    timestamp,
                });
                await offlineMessage.save();
                console.log("Offline message saved for user:", receiverEmail);
            }
        } catch (error) {
            console.error('Error in send_message:', error);
        }
    });

    socket.on('disconnect', () => {
        const userEmail = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
        if (userEmail) delete onlineUsers[userEmail];
        console.log(`User ${socket.id} disconnected`);
    });
});

app.post('/api/upload', upload.single('profilePic'), (req, res) => {
    if (req.file) {
        res.status(200).json({ message: 'File uploaded successfully', filePath: req.file.path });
    } else {
        res.status(400).json({ message: 'File upload failed', error: req.file });
    }
});



app.post('/api/register', upload.single('profilePic'), [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail(),
    body('mobile').isMobilePhone(),
    body('password').isLength({ min: 6 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, mobile, password } = req.body;

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
            fullName,
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

// app.get('/api/profile/image/:email', async (req, res) => {
//     const { email } = req.params;
//     try {
//         const users = await User.findOne({ email });
//         if (!users || !users.profilePic) {
//             return res.status(404).json({ message: 'User or image not found' });
//         }
//         res.json({ profilePic:users.profilePic })
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

app.get('/api/users/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const users = await User.find({ email:{$ne:email} });
        res.json({ users });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.get('/api/messages/:userEmail/:friendEmail', async (req, res) => {
    const { userEmail, friendEmail } = req.params;

    try {
        const user = await User.findOne({ email: userEmail });
        const friend = await User.findOne({ email: friendEmail });

        if (!user || !friend) {
            return res.status(404).json({ message: 'User or friend not found' });
        }

        // Get all messages between user and friend
        const messages = await Message.find({
            $or: [
                { senderId: user._id, receiverId: friend._id },
                { senderId: friend._id, receiverId: user._id },
            ],
        }).sort({ timestamp: 1 })
        .populate('senderId', 'email') // Populate sender's email
        .populate('receiverId', 'email'); // Populate receiver's email

        // Transform the response to include senderEmail and receiverEmail
        const formattedMessages = messages.map(msg => ({
            senderEmail: msg.senderId.email,
            receiverEmail: msg.receiverId.email,
            text: msg.text,
            timestamp: msg.timestamp
        }));

        res.json(formattedMessages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// app.post('/api/request/:email', async (req, res) => {
//     console.log("rahul yadav");
//     const { email } = req.params; // This is the email of the user receiving the request
//     const { fromId } = req.body; // This should be the ID of the user sending the request

//     try {
//         // Find the user by email to get their user ID
//         const user = await User.findOne({ email: email });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found',email:email });
//         }


//         // Update the user by their ID
//         const updatedUser = await User.findByIdAndUpdate(user._id, {
//             $push: { requests: { from: fromId, status: 'pending'} },
//         }, { new: true }); // Optionally return the updated user

//         res.status(200).json({ message: 'Friend request sent' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to send friend request', error: error.message });
//     }
// });

// Send friend request endpoint
app.post('/api/request', async (req, res) => {
    const { sender: senderEmail, receiver: receiverEmail } = req.body;

    try {
        const sender = await User.findOne({ email: senderEmail });
        const receiver = await User.findOne({ email: receiverEmail });

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'Sender or receiver not found' });
        }

        // Check if the request already exists to prevent duplicates
        const existingRequest = receiver.requests.find(req => req.from === senderEmail);
        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already sent' });
        }

        // Add the friend request to the receiver's requests array
        receiver.requests.push({ from: senderEmail, status: 'pending' });
        await receiver.save();

        res.status(200).json({ message: 'Friend request sent successfully' });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ message: 'Error sending friend request' });
    }
});






//router
app.patch('/request/:userId/:requestId', async (req, res) => {
    const { userId, requestId } = req.params;
    const { status } = req.body;
    await User.updateOne(
        { _id: userId, 'requests._id': requestId },
        { 'requests.$.status': status }
    );
    res.json({ message: 'Friend request status updated' });
});


//router
app.get('/api/friends/status/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch accepted friends based on user friend list
        const accepted = await User.find({ _id: { $in: user.friends } }, 'email _id');

        // Fetch pending requests using the `requests` field
        const pendingRequests = user.requests.filter(request => request.status === 'pending');
        const pending = await User.find({ email: { $in: pendingRequests.map(req => req.from) } }, 'email _id');
        
        res.json({ accepted, pending });
    } catch (error) {
        console.error("Error retrieving friends' status:", error);
        res.status(500).json({ message: 'Error retrieving friends' });
    }
});
// Assuming you have a Friend model and a User model
app.post('/api/friends/accept', async (req, res) => {
    const { friendEmail, userEmail } = req.body;

    try {
        const user = await User.findOne({ email: userEmail });
        const friend = await User.findOne({email:friendEmail});

        if (!user || !friend) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find and update the request in the friend's `requests` array
        const requestIndex = user.requests.findIndex(
            (request) => request.from === friendEmail && request.status === 'pending'
        );

        if (requestIndex === -1) {
            return res.status(400).json({ message: "No pending request found" });
        }

        // Update the request status to 'accepted' and add to friends list
        user.requests[requestIndex].status = 'accepted';
        user.friends.push(friend._id);
        friend.friends.push(user._id);

        // Save changes to both users
        await user.save();
        await friend.save();

        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



app.post('/api/friends/reject', async (req, res) => {
    const { userEmail, friendEmail } = req.body;

    try {
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find and remove the friend request
        user.requests = user.requests.filter(req => !(req.from === friendEmail && req.status === 'pending'));
        await user.save();

        res.status(200).json({ message: 'Friend request rejected' });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        res.status(500).json({ message: 'Error rejecting friend request' });
    }
});




app.post('/api/news', async (req, res) => {
    const { title, content, author } = req.body;

    // Check if the user is authorized to add news
    if (author !== 'rahul6381yadav@gmail.com') {
        return res.status(403).json({ message: 'You do not have permission to add news updates.' });
    }

    try {
        const news = new News({ title, content, author });
        await news.save();
        res.status(201).json({ message: 'News added successfully', news });
    } catch (error) {
        console.error('Error adding news:', error);
        res.status(500).json({ message: 'An error occurred while adding news.' });
    }
});

// GET /api/news - Get all news updates
app.get('/api/news', async (req, res) => {
    try {
        const newsList = await News.find().sort({ createdAt: -1 }); // Sort by latest
        res.status(200).json(newsList);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ message: 'An error occurred while fetching news.' });
    }
});





// Get all discussions
// POST /api/discussions
app.post('/api/discussions', async (req, res) => {
    const { title, content, author } = req.body;
    try {
        const discussion = new Discussion({ title, content, author });
        await discussion.save();
        res.status(201).json({ message: 'Discussion created successfully', discussion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create discussion' });
    }
});


// Add a comment to a discussion
app.post('/api/discussions/:id/comments', async (req, res) => {
    const { id } = req.params;
    const { author, content } = req.body;
    try {
        const discussion = await Discussion.findById(id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' });
        }

        const comment = { author, content };
        discussion.comments.push(comment);
        await discussion.save();

        res.status(200).json({ message: 'Comment added successfully', discussion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add comment' });
    }
});


app.get('/api/profile/image/:email', async (req, res) => {
    const { email } = req.params;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user || !user.profilePic) {
            // If user or profilePic not found, respond with 404
            return res.status(404).json({ message: 'User or image not found' });
        }

        // Respond with the profilePic URL or path
        res.json({ profilePic: user.profilePic });
    } catch (error) {
        console.error('Error fetching profile image:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Like a discussion
// app.post('/api/discussions/:id/like', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const discussion = await Discussion.findById(id);
//         if (!discussion) {
//             return res.status(404).json({ message: 'Discussion not found' });
//         }

//         discussion.likes += 1;
//         await discussion.save();

//         res.status(200).json({ message: 'Discussion liked', likes: discussion.likes });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to like discussion' });
//     }
// });

// Toggle like for a discussion by ID
app.post('/api/discussions/:id/like', async (req, res) => {
    const { id } = req.params;
    const { userEmail } = req.body; // Get the user's email from the request body

    try {
        const discussion = await Discussion.findById(id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' });
        }

        const userIndex = discussion.likedBy.indexOf(userEmail);

        if (userIndex === -1) {
            // User has not liked the discussion, so add their like
            discussion.likes += 1;
            discussion.likedBy.push(userEmail);
        } else {
            // User has already liked the discussion, so remove their like
            discussion.likes -= 1;
            discussion.likedBy.splice(userIndex, 1); // Remove user from likedBy array
        }

        await discussion.save();

        res.status(200).json({ message: 'Like toggled', likes: discussion.likes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to toggle like' });
    }
});



// Get all discussions with comments sorted by time (most recent first)
app.get('/api/discussions', async (req, res) => {
    try {
        const discussions = await Discussion.find().sort({ createdAt: -1 }).lean();
        // Sort comments by createdAt in descending order
        discussions.forEach(discussion => {
            discussion.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
        res.status(200).json(discussions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch discussions' });
    }
});
