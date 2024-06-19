const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const TIMEOUT = 500; // milliseconds

const API_URLS = {
  'p': 'http://20.244.56.144/test/primes',
  'f': 'http://20.244.56.144/test/fibo',
  'e': 'http://20.244.56.144/test/even',
  'r': 'http://20.244.56.144/test/rand'
};

let storedNumbers = [];

async function fetchNumbers(url) {
  try {
    const response = await axios.get(url, { timeout: TIMEOUT });
    return response.data.numbers || [];
  } catch (error) {
    return [];
  }
}

function addToWindow(newNumbers, window, windowSize) {
  const uniqueNumbers = new Set(window);
  newNumbers.forEach(num => uniqueNumbers.add(num));
  const updatedWindow = Array.from(uniqueNumbers).slice(-windowSize);
  return updatedWindow;
}

app.get('/numbers/:numberid', async (req, res) => {
  const numberId = req.params.numberid;

  if (!API_URLS[numberId]) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  const prevState = [...storedNumbers];
  const newNumbers = await fetchNumbers(API_URLS[numberId]);
  storedNumbers = addToWindow(newNumbers, storedNumbers, WINDOW_SIZE);
  const avg = storedNumbers.length ? (storedNumbers.reduce((a, b) => a + b, 0) / storedNumbers.length).toFixed(2) : 0;

  return res.json({
    windowPrevState: prevState,
    windowCurrState: storedNumbers,
    numbers: newNumbers,
    avg: parseFloat(avg)
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
