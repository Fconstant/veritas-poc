
import express from "express";
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { FACT_CHECK_REQUEST_SCHEMA } from './types.js';
import { factCheck } from './factCheck.js';
import dotenv from 'dotenv'
import { DEFAULT_ADVANCED_MODEL, DEFAULT_FAST_MODEL } from './llm/config.js';

dotenv.config()

// Express app setup
const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Single fact-check endpoint
app.post('/fact-check', async (req, res) => {
  try {
    const request = FACT_CHECK_REQUEST_SCHEMA.parse(req.body);

    if (!request.text || request.text.trim().length === 0) {
      res.status(400).json({ error: 'Text is required' });
      return
    }

    if (request.text.length > 5000) {
      res.status(400).json({ error: 'Text too long (max 5000 characters)' });
      return;
    }

    const result = await factCheck(request);
    res.json(result);
  } catch (error) {
    console.error('Fact-check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// // Batch fact-check endpoint
// app.post('/fact-check/batch', async (req, res) => {
//   try {
//     const { requests } = req.body;

//     if (!Array.isArray(requests) || requests.length === 0) {
//       return res.status(400).json({ error: 'Requests array is required' });
//     }

//     if (requests.length > 10) {
//       return res.status(400).json({ error: 'Max 10 requests per batch' });
//     }

//     const results = await Promise.all(requests.map(factCheck));
//     res.json({ results });
//   } catch (error) {
//     console.error('Batch fact-check error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// Cache management endpoints
// app.get('/cache/stats', (req, res) => {
//   res.json({
//     size: cache.size,
//     keys: Array.from(cache.keys()).slice(0, 10),
//   });
// });

// app.delete('/cache', (req, res) => {
//   cache.clear();
//   res.json({ message: 'Cache cleared' });
// });

const DEFAULT_PORT = 3000;
const PORT = Number(process.env.PORT ?? DEFAULT_PORT);

app.listen(PORT, () => {
  console.log(`Political fact-checker API running on port ${PORT.toString()}`);
  console.log(`Fast model: ${DEFAULT_FAST_MODEL.provider}/${DEFAULT_FAST_MODEL.model}`);
  console.log(`Advanced model: ${DEFAULT_ADVANCED_MODEL.provider}/${DEFAULT_ADVANCED_MODEL.model}`);
});
