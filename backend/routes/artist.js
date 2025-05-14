const express = require('express');
const router = express.Router();
const axios = require('axios');

require('dotenv').config();

router.get('/:artistId', async (req, res) => {
  const { artistId } = req.params;
  const token = process.env.ARTSY_XAPP_TOKEN;

  if (!artistId) {
    return res.status(400).json({ error: 'Artist ID is required' });
  }

  try {
    const response = await axios.get(
      `https://api.artsy.net/api/artists/${artistId}`,
      {
        headers: {
          'X-XAPP-Token': token
        }
      }
    );

    const artist = response.data;

    const artistDetails = {
      artistId: artist.id,
      name: artist.name,
      birthday: artist.birthday || '',
      deathday: artist.deathday || '',
      nationality: artist.nationality || '',
      biography: artist.biography || '',
      imageUrl: artist._links?.thumbnail?.href || ''
    };

    res.json(artistDetails);

  } catch (err) {
    console.error('Error fetching artist details:', err.message);
    res.status(500).json({ error: 'Failed to fetch artist info' });
  }
});

//need to set up similar artists endpoint
//https://api.artsy.net/api/artists?similar_to_artist_id=4d8b928b4eb68a1b2c0001f2
// GET /similar/:artistId — Fetch similar artists
router.get('/similar/:artistId', async (req, res) => {
  const { artistId } = req.params;
  const token = process.env.ARTSY_XAPP_TOKEN;

  if (!artistId) {
    return res.status(400).json({ error: 'Artist ID is required' });
  }

  try {
    const response = await axios.get(
      `https://api.artsy.net/api/artists?similar_to_artist_id=${artistId}`,
      {
        headers: {
          'X-XAPP-Token': token
        }
      }
    );

    const similarArtists = response.data._embedded.artists.map((artist) => ({
      artistId: artist.id,
      name: artist.name,
      birthday: artist.birthday || '',
      deathday: artist.deathday || '',
      nationality: artist.nationality || '',
      imageUrl: artist._links?.thumbnail?.href || ''
    }));

    res.json(similarArtists);

  } catch (err) {
    console.error('Error fetching similar artists:', err.message);
    res.status(500).json({ error: 'Failed to fetch similar artists' });
  }
});


module.exports = router;



