const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

app.use(express.json());

async function fetchAnimeData(searchQuery) {
  const url = `https://web.animerco.org/?s=${encodeURIComponent(searchQuery)}`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const results = [];

    $('.search-card').each((index, element) => {
      const link = $(element).find('a').attr('href');
      const imgSrc = $(element).find('a').attr('data-src');
      const title = $(element).find('h3').text().trim();
      const aired = $(element).find('.anime-aired').text().trim();
      const rating = $(element).find('.badge').text().trim();

      results.push({
        link,
        imgSrc,
        title,
        aired,
        rating
      });
    });

    return results;
  } catch (error) {
    console.error('Error fetching anime data:', error);
    throw error;
  }
}

app.get('/api/anime', async (req, res) => {
  const searchQuery = req.query.q;

  if (!searchQuery) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  try {
    const animeData = await fetchAnimeData(searchQuery);
    res.json(animeData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching anime data.' });
  }
});

app.get('/', (req, res) => {
  res.send('Use /api/anime?q=<query> to search for anime data.');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
