import { io, Socket } from 'socket.io-client';
import CryptoJS from 'crypto-js';
import { API_CONFIG } from '../config/api';
import {
  FactCheckRequest,
  FactCheckResult,
  UpdateStatus,
  ChunkCount,
  VerificationState,
  VerificationStatus,
  ClientToServerEvents,
  ServerToClientEvents
} from '../types/api';

export class FactCheckService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private currentFingerprint: string | null = null;
  private processedText: string = '';
  private state: VerificationState = {
    status: 'idle',
    results: []
  };
  private listeners: Map<string, ((state: VerificationState) => void)[]> = new Map();

  constructor(private backendUrl: string = API_CONFIG.BACKEND_URL) {}

  /**
   * Gera um fingerprint MD5 único para a sessão
   */
  private generateFingerprint(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const input = `${timestamp}-${random}`;
    return CryptoJS.MD5(input).toString();
  }

  /**
   * Conecta ao WebSocket do backend
   */
  private async connect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.socket = io(this.backendUrl, {
        transports: ['websocket', 'polling'], // Adicionar fallback para polling
        timeout: API_CONFIG.WEBSOCKET_TIMEOUT,
        forceNew: true, // Forçar nova conexão
        reconnection: true, // Habilitar reconexão automática
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('✅ Conectado ao backend WebSocket');
        console.log('🔗 Socket ID:', this.socket?.id);
        console.log('🌐 URL:', this.backendUrl);
        this.updateState({ status: 'idle' });
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erro ao conectar com o backend:', error);
        console.error('🌐 URL tentada:', this.backendUrl);
        console.error('📊 Detalhes do erro:', {
          message: error.message,
          type: (error as any).type || 'unknown',
          description: (error as any).description || 'No description available'
        });
        this.updateState({ 
          status: 'error', 
          error: `Erro ao conectar com o servidor: ${error.message}` 
        });
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Desconectado do backend:', reason);
        this.updateState({ status: 'idle' });
      });

      // Eventos específicos da verificação de fatos
      this.socket.on('FACT_CHECK_RESULT', (result: FactCheckResult) => {
        console.log('Resultado recebido:', result);
        this.updateState({
          results: [...this.state.results, result]
        });
      });

      this.socket.on('UPDATE_STATUS', (status: UpdateStatus) => {
        console.log('Status atualizado:', status);
        
        let newStatus: VerificationStatus = 'idle';
        switch (status.data.status) {
          case 'PROCESSING':
            newStatus = 'processing';
            break;
          case 'FINISHED':
            newStatus = 'finished';
            break;
          case 'EXCEPTION':
            newStatus = 'error';
            break;
          case 'INTERRUPTED':
            newStatus = 'interrupted';
            break;
        }

        this.updateState({
          status: newStatus,
          message: status.data.message
        });
      });

      this.socket.on('CHUNK_COUNT', (chunkCount: ChunkCount) => {
        console.log('Contagem de chunks:', chunkCount);
        console.log(`📦 Texto dividido em ${chunkCount.data.chunkCount} chunks para processamento`);
        this.updateState({
          chunkCount: chunkCount.data.chunkCount
        });
      });
    });
  }

  /**
   * Atualiza o estado interno e notifica os listeners
   */
  private updateState(updates: Partial<VerificationState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Notifica todos os listeners registrados
   */
  private notifyListeners(): void {
    this.listeners.forEach((listeners) => {
      listeners.forEach(listener => listener(this.state));
    });
  }

  /**
   * Registra um listener para mudanças de estado
   */
  public onStateChange(listener: (state: VerificationState) => void): () => void {
    const id = Math.random().toString(36).substring(2);
    if (!this.listeners.has(id)) {
      this.listeners.set(id, []);
    }
    this.listeners.get(id)!.push(listener);

    // Retorna função para remover o listener
    return () => {
      const listeners = this.listeners.get(id);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
        if (listeners.length === 0) {
          this.listeners.delete(id);
        }
      }
    };
  }

  /**
   * Testa a conectividade com o backend
   */
  public async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testando conectividade com o backend...');
      console.log('🌐 URL:', this.backendUrl);
      
      // Testa HTTP primeiro
      const response = await fetch(`${this.backendUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const healthData = await response.json();
      console.log('✅ Health check OK:', healthData);
      
      // Testa WebSocket
      await this.connect();
      console.log('✅ WebSocket conectado');
      
      return true;
    } catch (error) {
      console.error('❌ Teste de conectividade falhou:', error);
      return false;
    }
  }

  /**
   * Envia uma requisição de verificação de fatos
   */
  public async requestFactCheck(
    content: string, 
    options: {
      researchThreshold?: number;
      apiKeys?: {
        gemini?: string;
        tavily?: string;
      };
    } = {}
  ): Promise<string> {
    if (!content.trim()) {
      throw new Error('Conteúdo não pode estar vazio');
    }

    try {
      // Garante conexão com o backend (auto-conectável)
      if (!this.isConnected()) {
        await this.connect();
      }

      // Gera novo fingerprint
      this.currentFingerprint = this.generateFingerprint();

      // Armazena o texto processado
      this.processedText = content;

      // Limpa resultados anteriores
      this.updateState({
        status: 'connecting',
        results: [],
        chunkCount: undefined,
        error: undefined,
        message: 'Conectando ao servidor...'
      });

      // Prepara a requisição
      const request: FactCheckRequest = {
        fingerprint: this.currentFingerprint,
        researchThreshold: options.researchThreshold ?? API_CONFIG.DEFAULT_RESEARCH_THRESHOLD,
        apiKeys: options.apiKeys
      };

      // Envia a requisição (garantir socket inicializado)
      if (!this.socket) {
        throw new Error('Conexão com o backend não está disponível.');
      }
      this.socket.emit('REQUEST_FACT_CHECK', content, request);

      return this.currentFingerprint;
    } catch (error) {
      console.error('Erro ao enviar requisição de verificação:', error);
      this.updateState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  }

  /**
   * Obtém o estado atual da verificação
   */
  public getState(): VerificationState {
    return { ...this.state };
  }

  /**
   * Obtém o texto processado
   */
  public getProcessedText(): string {
    return this.processedText;
  }

  /**
   * Limpa o estado atual
   */
  public reset(): void {
    this.updateState({
      status: 'idle',
      results: [],
      chunkCount: undefined,
      error: undefined,
      message: undefined
    });
    this.processedText = '';
  }

  /**
   * Desconecta do WebSocket
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.updateState({ status: 'idle' });
  }

  /**
   * Verifica se está conectado
   */
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Instância singleton do serviço
export const factCheckService = new FactCheckService();
