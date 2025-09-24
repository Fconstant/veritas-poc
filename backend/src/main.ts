import 'dotenv/config';

import { DEFAULT_ADVANCED_MODEL, DEFAULT_FAST_MODEL } from '#/llm/config.js';
import { factCheckService } from '#/service/factCheckService.js';
import { ChunkCount, createWebSocketServer, handleWebSocketError } from '#/ws/index.js';
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

const DEFAULT_PORT = 3000;
const PORT = Number(process.env.PORT ?? DEFAULT_PORT);

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket server
createWebSocketServer(httpServer, (socket) => {
  console.log('Client connected: ', socket.id);

  let currentFingerprint = '';
  // Handle fact check requests
  socket.on('REQUEST_FACT_CHECK', async (content, data) => {
    currentFingerprint = data.fingerprint;
    try {
      console.log(
        'Received fact check request: ',
        content.substring(0, Math.min(25, content.length)) + '...',
        data,
      );
      const fingerprint = data.fingerprint;

      socket.emit('UPDATE_STATUS', {
        data: {
          status: 'PROCESSING',
          message: 'Started processing fact check request...',
        },
        meta: {
          fingerprint,
        },
      });

      const factCheckGenerator = factCheckService(content, data);
      for await (const result of factCheckGenerator) {
        if (currentFingerprint !== result.meta.fingerprint) {
          break;
        }

        type Res = typeof result
        const isChunkCount = (v: Res): v is ChunkCount => "chunkCount" in result.data;

        if (isChunkCount(result)) {
          socket.emit('CHUNK_COUNT', result);
        } else {
          socket.emit('FACT_CHECK_RESULT', result);
        }
      }

      if ((await factCheckGenerator.next()).done) {
        socket.emit('UPDATE_STATUS', {
          data: {
            status: 'FINISHED',
            message: 'Fact check completed',
          },
          meta: {
            fingerprint: data.fingerprint,
          },
        });
      } else {
        socket.emit('UPDATE_STATUS', {
          data: {
            status: 'INTERRUPTED',
            message: 'Fact check interrupted for unknown reason',
          },
          meta: {
            fingerprint,
          },
        });
      }
    } catch (error) {
      console.error('Error processing fact check:', error);
      handleWebSocketError(error, socket, data.fingerprint);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Veritas API running on port ${PORT.toString()}`);
  console.log(`WebSocket server initialized`);
  const fastModel = DEFAULT_FAST_MODEL;
  const advancedModel = DEFAULT_ADVANCED_MODEL;
  console.log(
    `Fast model: ${fastModel.provider}/${fastModel.model}`,
  );
  console.log(
    `Advanced model: ${advancedModel.provider}/${advancedModel.model}`,
  );
});
