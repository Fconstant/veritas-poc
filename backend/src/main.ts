import 'dotenv/config'

import express from "express";
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { FACT_CHECK_REQUEST_SCHEMA } from './types.js';
import { factCheckService } from './service/factCheckService.js';
import { DEFAULT_ADVANCED_MODEL, DEFAULT_FAST_MODEL } from './llm/config.js';
import * as Consts from './constants.js';

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

    if (request.text.length > Consts.MAX_TEXT_LENGTH) {
      res.status(400).json({ error: 'Text too long (max 5000 characters)' });
      return;
    }

    const result = await factCheckService(request);
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
  console.log(`Veritas API running on port ${PORT.toString()}`);
  const fastModel = DEFAULT_FAST_MODEL;
  const advancedModel = DEFAULT_ADVANCED_MODEL;
  console.log(`Fast model: ${fastModel.provider}/${fastModel.model}, API Key loaded? ${String(!!fastModel.apiKey)}`);
  console.log(`Advanced model: ${advancedModel.provider}/${advancedModel.model}, API Key loaded? ${String(!!advancedModel.apiKey)}`);
});
