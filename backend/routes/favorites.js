//auth only
//add artist to favorites
//delete artist from favorites
//get all favorites

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/user');
require('dotenv').config();

// Middleware: Auth checker
//Checks if a JWT token is present in cookies

//jwt.verify
//extracts the user's ID (req.userId = decoded.id) if valid
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not logged in' });

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /api/favorites
router.get('/', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({ favorites: user.favorites });
});

// POST /api/favorites
router.post('/', requireAuth, async (req, res) => {
  const { artistId } = req.body;
  const token = process.env.ARTSY_XAPP_TOKEN;

  if (!artistId) return res.status(400).json({ error: 'Missing artistId' });

  const user = await User.findById(req.userId);

  const alreadyFavorited = user.favorites.some(fav => fav.artistId === artistId);
  if (alreadyFavorited) return res.status(409).json({ error: 'Already favorited' });

  const response = await axios.get(`https://api.artsy.net/api/artists/${artistId}`, {
    headers: { 'X-XAPP-Token': token }
  });

  const artist = response.data;
  user.favorites.unshift({
    artistId: artist.id,
    name: artist.name,
    birthday: artist.birthday || '',
    deathday: artist.deathday || '',
    nationality: artist.nationality || '',
    imageUrl: artist._links?.thumbnail?.href || '',
    timestamp: new Date()
  });

  await user.save();
  res.json({ message: 'Artist added to favorites', favorites: user.favorites });
});

// DELETE /api/favorites/:artistId
router.delete('/:artistId', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  const id = req.params.artistId;

  user.favorites = user.favorites.filter(fav => fav.artistId !== id);
  await user.save();

  res.json({ message: 'Artist removed', favorites: user.favorites });
});

module.exports = router;
