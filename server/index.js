const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', project: 'Block-118', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 Block-118 server running on port ${PORT}`);
});
