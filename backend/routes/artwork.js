const express = require('express');
const router = express.Router();
const axios = require('axios');

require('dotenv').config();

// GET /api/artwork/:artistId
// Retrieves artworks for a specific artist
router.get('/:artistId', async (req, res) => {
  const { artistId } = req.params;
  const token = process.env.ARTSY_XAPP_TOKEN;

  if (!artistId) {
    return res.status(400).json({ error: 'Artist ID is required' });
  }

  try {
    const response = await axios.get(
      `https://api.artsy.net/api/artworks?artist_id=${artistId}&size=10`,
      {
        headers: {
          'X-XAPP-Token': token
        }
      }
    );

    const artworks = response.data._embedded?.artworks.map(art => ({
      title: art.title,
      date: art.date || '',
      imageUrl: art._links?.thumbnail?.href || '',
      id: art.id // Optional: expose artwork ID for follow-up requests
    })) || [];

    if (artworks.length === 0) {
      return res.status(404).json({ error: 'No artworks found for this artist.' });
    }

    res.json({ artworks });

  } catch (err) {
    console.error('Failed to fetch artworks:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
});

// GET /api/artwork/details/:artworkId
// Retrieves detailed info for a single artwork
router.get('/details/:artworkId', async (req, res) => {
  const { artworkId } = req.params;
  const token = process.env.ARTSY_XAPP_TOKEN;

  if (!artworkId) {
    return res.status(400).json({ error: 'Artwork ID is required' });
  }

  try {
    const response = await axios.get(`https://api.artsy.net/api/artworks/${artworkId}`, {
      headers: {
        'X-XAPP-Token': token
      }
    });

    res.json({ artwork: response.data });

  } catch (err) {
    console.error('failed to fetch artwork details:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch artwork details' });
  }
});

//The Genes endpoint get metadata about the artworks in Artsy
//aka category
// GET /api/artwork/genes/:artworkId
router.get('/genes/:artworkId', async (req, res) => {
  const { artworkId } = req.params;
  const token = process.env.ARTSY_XAPP_TOKEN;

  if (!artworkId) {
    return res.status(400).json({ error: 'Artwork ID is required' });
  }

  try {
    //get artwork details to extract genes link
    const artworkRes = await axios.get(`https://api.artsy.net/api/artworks/${artworkId}`, {
      headers: { 'X-XAPP-Token': token }
    });

    const genesUrl = artworkRes.data._links?.genes?.href;
    if (!genesUrl) {
      return res.status(404).json({ error: 'No gene categories available for this artwork.' });
    }

    //get the genes from link
    const genesRes = await axios.get(genesUrl, {
      headers: { 'X-XAPP-Token': token }
    });

    const genes = genesRes.data._embedded?.genes.map(gene => ({
      name: gene.name,
      //description: gene.description || '',
      imageUrl: gene._links?.thumbnail?.href || ''
    })) || [];

    res.json({ genes });

  } catch (err) {
    console.error('🔴 Failed to fetch genes:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch genes' });
  }
});




module.exports = router;
