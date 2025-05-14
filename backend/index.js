//entry point to Node.js + Express backend

const express = require('express'); //creates the server and handles routing.
const mongoose = require('mongoose'); //connects and interacts with MongoDB.
const cors = require('cors'); //allows Angular frontend (on another port) to talk to the backend.
const cookieParser = require('cookie-parser'); //helps read cookies (used for JWT auth).

require('dotenv').config();


//creates an Express app.
const app = express();
const PORT = process.env.PORT || 5000; //port to listen on 


// middleware: pre-processing logic for requests
app.use(cookieParser());

app.use(express.json()); //parses JSON request bodies
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); //access cookies from request
app.use(cors({
  origin: ['http://localhost:4200', 'https://csci571-jeannie-project.uw.r.appspot.com'],
  credentials: true
}));



// Add this near your other middleware, before your routes
const path = require('path'); // You already have this imported


// MongoDB Connection (hardcoded credentials)
//Use the HW3 database for all operations
const MONGO_URI = 'mongodb+srv://jeanniejiang426:jj4262001@cluster0.jy4iy.mongodb.net/HW3?appName=Cluster0"';



mongoose.set('strictQuery', false);
mongoose.set('debug', true); 

mongoose.connect(MONGO_URI)
// mongoose.connect(MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

//Basic Test Route
// GET route at the URL path /api/test
//makes a GET request to http://localhost:5000/api/test, server respond with a JSON object.
app.get('/api/test', (req, res) => {
  res.json({ message: 'API works' }); //http://localhost:5000/api/test
});

//Routes
//importing routes from routes folder
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

//search route
const searchRoutes = require('./routes/search');
app.use('/api/search', require('./routes/search'));



//favorites route
const favoritesRoutes = require('./routes/favorites');
app.use('/api/favorites', favoritesRoutes);

//artist route
const artistRoutes = require('./routes/artist');
app.use('/api/artist', artistRoutes);

//artwork route and genes route
const artworkRoutes = require('./routes/artwork');
app.use('/api/artwork', artworkRoutes);


// app.use(express.static(path.join(__dirname, '../frontend/dist/frontend')));
app.use(express.static(path.join(__dirname, '../frontend/dist/frontend/browser')));
app.get('*', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../frontend/dist/frontend/browser/index.html'));
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Error serving application');
  }
});



app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/frontend/index.html'));
});


// Start Server - Starts express server and listens for requests.
//starts the web server and makes it listen for incoming requests, PORT = 5000
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

module.exports = app;



