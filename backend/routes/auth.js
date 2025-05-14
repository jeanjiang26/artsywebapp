//Defines all the API routes (HTTP endpoints) your backend serves.

//Routes act as the entry point → they call functions in controllers/

//auth.js routes for /register, /login

//favorites.js, artists.js

//user registration route

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
//const authenticateUser = require('../middleware');


//for gravatar
const crypto = require('crypto');

function getGravatarUrl(email) {
  const trimmed = email.trim().toLowerCase();
  // Use SHA1 hash as specified in the instructions
  const hash = crypto.createHash('sha1').update(trimmed).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
}
  


// Register route (first time making account)
router.post('/register', async (req, res) => {

    

    const { fullname, email, password } = req.body;



    if (!fullname || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    

    try {
        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
        return res.status(409).json({ error: 'Email already registered.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // gravatar
        const profileImageUrl = getGravatarUrl(email);

        // Create user
        const newUser = new User({ 
            fullname, 
            email, 
            password: hashedPassword, 
            profileImageUrl
        });
        await newUser.save();

        //generate JWT
        const token = jwt.sign({ id: newUser._id }, 'your_jwt_secret', { expiresIn: '1h' });

        console.log(token);
        //send cookie and response
        res.cookie('token', token, {
        httpOnly: true,
        maxAge: 3600000 // 1 hour
        }).json({ message: 'User registered successfully', user: { fullname, email } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
});


//login route
router.post('/login', async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    //if user exists
    try{
        //check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // pw
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        //generate JWT
        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

        console.log(token);

        //set cookie
        res.cookie('token', token, {
          httpOnly: true,
          maxAge: 3600000,
          sameSite: 'Strict',
          secure: process.env.NODE_ENV === 'production',
        });
        res.json({
          message: 'Login successful',
          // user: { fullname: user.fullname, email: user.email },
          user: { fullname: user.fullname, email: user.email, profileImageUrl: user.profileImageUrl }

        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong.' });
      }
});



const authenticateUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};


//protected route example
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

router.get('/status', async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ isAuthenticated: false });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.json({ isAuthenticated: false });
        }
        res.json({ isAuthenticated: true, user });
    } catch (err) {
        return res.json({ isAuthenticated: false });
    }
});


//logout route
router.post('/logout', (req, res) => {
    res.clearCookie('token').json({ message: 'Logged out' });
  });
  

//delete account route
router.delete('/delete', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
  
    try {
      const data = jwt.verify(token, 'your_jwt_secret');
      await User.findByIdAndDelete(data.id);
      res.clearCookie('token').json({ message: 'Account deleted' });
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

//middleware


module.exports = router;

