import 'dotenv/config';

import { DEFAULT_ADVANCED_MODEL, DEFAULT_FAST_MODEL } from '#/llm/config.js';
import { factCheckService } from '#/service/factCheckService.js';
import { FACT_CHECK_REQUEST_SCHEMA, FactCheckRequest } from '#/types.js';
import { handleErrorResponse } from '#/utils/errors.js';
import { createWebSocketServer, handleWebSocketError, UpdateStatusMessage } from '#/ws/index.js';
import compression from 'compression';
import cors from 'cors';
import express from "express";
import helmet from 'helmet';
import { createServer } from "http";

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
  const request = FACT_CHECK_REQUEST_SCHEMA.parse(req.body);
  try {
    const result = await factCheckService(request);
    res.json(result);
  } catch (error) {
    handleErrorResponse(error, res);
  }
});

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
  console.log('Client connected:', socket.id);

  // Handle fact check requests
  socket.on('REQUEST_FACT_CHECK', async (data: FactCheckRequest) => {
    try {
      console.log('Received fact check request:', data);

      // Send status update
      const statusMessage: UpdateStatusMessage = {
        type: 'UPDATE_STATUS',
        data: { status: 'processing', message: 'Processing fact check request...' }
      };
      socket.emit('UPDATE_STATUS', statusMessage.data);

      const result = await factCheckService(data);

      socket.emit('FACT_CHECK_RESULT', result);

      // Send completion status
      const completionMessage: UpdateStatusMessage = {
        type: 'UPDATE_STATUS',
        data: { status: 'completed', message: 'Fact check completed' }
      };
      socket.emit('UPDATE_STATUS', completionMessage.data);

    } catch (error) {
      console.error('Error processing fact check:', error);
      handleWebSocketError(error, socket);
    }
  });

});

httpServer.listen(PORT, () => {
  console.log(`Veritas API running on port ${PORT.toString()}`);
  console.log(`WebSocket server initialized`);
  const fastModel = DEFAULT_FAST_MODEL;
  const advancedModel = DEFAULT_ADVANCED_MODEL;
  console.log(`Fast model: ${fastModel.provider}/${fastModel.model}, API Key loaded? ${String(!!fastModel.apiKey)}`);
  console.log(`Advanced model: ${advancedModel.provider}/${advancedModel.model}, API Key loaded? ${String(!!advancedModel.apiKey)}`);
});
