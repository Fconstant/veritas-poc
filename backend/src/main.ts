import 'dotenv/config';

import { DEFAULT_ADVANCED_MODEL, DEFAULT_FAST_MODEL } from '#/llm/config.js';
import { factCheckService } from '#/service/factCheckService.js';
import { FactCheckRequest } from './ws/types.js';
import { createWebSocketServer, handleWebSocketError } from '#/ws/index.js';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';

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
// app.post('/fact-check', async (req, res) => {
//   const request = FACT_CHECK_REQUEST_SCHEMA.parse(req.body);
//   try {
//     const result = await factCheckService(request);
//     res.json(result);
//   } catch (error) {
//     handleErrorResponse(error, res);
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

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket server
createWebSocketServer(httpServer, (socket) => {
  console.log('Client connected: ', socket.id);

  let currentFingerprint = '';
  // Handle fact check requests
  socket.on(
    'REQUEST_FACT_CHECK',
    async (content: string, data: FactCheckRequest) => {
      currentFingerprint = data.fingerprint;
      try {
        console.log(
          'Received fact check request: ',
          content.substring(0, Math.min(25, content.length)) + "...",
          data,
        );
        const fingerprint = data.fingerprint;

        socket.emit('UPDATE_STATUS', {
          status: 'PROCESSING',
          message: 'Started processing fact check request...',
          fingerprint,
        });

        const factCheckGenerator = factCheckService(content, data);
        for await (const result of factCheckGenerator) {
          if (currentFingerprint !== data.fingerprint) {
            break;
          }
          socket.emit('FACT_CHECK_RESULT', result);
        }

        if ((await factCheckGenerator.next()).done) {
          socket.emit('UPDATE_STATUS', {
            status: 'FINISHED',
            message: 'Fact check completed',
            fingerprint: data.fingerprint,
          });
        } else {
          socket.emit('UPDATE_STATUS', {
            status: 'INTERRUPTED',
            message: 'Fact check interrupted for unknown reason',
            fingerprint,
          });
        }
      } catch (error) {
        console.error('Error processing fact check:', error);
        handleWebSocketError(error, socket, data.fingerprint);
      }
    },
  );
});

httpServer.listen(PORT, () => {
  console.log(`Veritas API running on port ${PORT.toString()}`);
  console.log(`WebSocket server initialized`);
  const fastModel = DEFAULT_FAST_MODEL;
  const advancedModel = DEFAULT_ADVANCED_MODEL;
  console.log(
    `Fast model: ${fastModel.provider}/${fastModel.model}, API Key loaded? ${String(!!fastModel.apiKey)}`,
  );
  console.log(
    `Advanced model: ${advancedModel.provider}/${advancedModel.model}, API Key loaded? ${String(!!advancedModel.apiKey)}`,
  );
});
