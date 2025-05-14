const express = require('express');
const router = express.Router();
const axios = require('axios');

require('dotenv').config();

router.get('/', async (req, res) => {
  const searchTerm = req.query.term;
  const token = process.env.ARTSY_XAPP_TOKEN;

  console.log('Artsy token:', token);


  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  console.log('🔍 /api/search called with term:', searchTerm);


  try {
    // Use the actual Artists API instead of general search
    const artistRes = await axios.get(
      `https://api.artsy.net/api/artists?term=${encodeURIComponent(searchTerm)}&size=10`,
      {
        headers: {
          'X-XAPP-Token': token
        }
      }
    );

    const artists = artistRes.data._embedded.artists.map((artist) => ({
      artistId: artist.id,
      name: artist.name,
      //birthday: artist.birthday || '',
      //deathday: artist.deathday || '',
      //nationality: artist.nationality || '',
      imageUrl: artist._links?.thumbnail?.href || ''
    }));

    res.json({ artists });

    console.log('Returned JSON:', { artists }); // Log the returned JSON
    

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
