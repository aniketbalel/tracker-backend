require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// API endpoint to track number
app.post('/api/track', async (req, res) => {
  const { number } = req.body;

  // Validate Indian mobile number
  if (!/^[6-9]\d{9}$/.test(number)) {
    return res.status(400).json({ error: 'Invalid Indian mobile number' });
  }

  try {
    // Numverify API call
    const numverifyResponse = await axios.get(
      `http://apilayer.net/api/validate?access_key=${process.env.NUMVERIFY_API_KEY}&number=+91${number}`
    );
    const { location, carrier } = numverifyResponse.data;

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // OpenCage API call
    const opencageResponse = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${process.env.OPENCAGE_API_KEY}`
    );
    const { lat, lng } = opencageResponse.data.results[0].geometry;

    res.json({
      city: location,
      carrier,
      coordinates: { lat, lng }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));