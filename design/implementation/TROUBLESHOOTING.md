# 🔧 Troubleshooting - Erro de WebSocket

## Problema Identificado
Erro: `websocket error` ao clicar em "Verificar Fatos"

## ✅ Soluções Implementadas

### 1. **Configuração Robusta do Socket.IO**
- ✅ Adicionado fallback para `polling` além de `websocket`
- ✅ Habilitado reconexão automática
- ✅ Configuração de timeout melhorada
- ✅ Logs detalhados para debug

### 2. **Teste de Conectividade**
- ✅ Método `testConnection()` que testa HTTP e WebSocket
- ✅ Verificação antes de enviar requisições
- ✅ Mensagens de erro mais específicas

### 3. **Debug Panel**
- ✅ Painel de debug temporário na interface
- ✅ Mostra status de conexão em tempo real
- ✅ Botão para testar conectividade manualmente

## 🚀 Como Testar Agora

### Passo 1: Verificar Backend
```bash
# Terminal 1 - Backend
cd /Users/andreazevedo/Documents/GitHub/veritas-poc/backend
npm run dev

# Terminal 2 - Testar Health Check
curl http://localhost:3000/health
```

### Passo 2: Verificar Frontend
```bash
# Terminal 3 - Frontend
cd /Users/andreazevedo/Documents/GitHub/veritas-poc/frontend
pnpm dev
```

### Passo 3: Usar Debug Panel
1. Abra o frontend em `http://localhost:3001`
2. Clique no botão "Debug" no canto inferior direito
3. Clique em "Testar Conexão"
4. Verifique os logs no console do navegador

## 🔍 Logs Esperados

### ✅ Sucesso:
```
🧪 Testando conectividade com o backend...
🌐 URL: http://localhost:3000
✅ Health check OK: {status: "ok", timestamp: "..."}
✅ Conectado ao backend WebSocket
🔗 Socket ID: abc123
🌐 URL: http://localhost:3000
✅ WebSocket conectado
```

### ❌ Erro:
```
❌ Erro ao conectar com o backend: Error: xhr poll error
🌐 URL tentada: http://localhost:3000
📊 Detalhes do erro: {message: "...", type: "...", description: "..."}
```

## 🛠️ Possíveis Causas e Soluções

### 1. **Backend não está rodando**
**Sintoma:** Health check falha
**Solução:** 
```bash
cd backend && npm run dev
```

### 2. **Porta ocupada**
**Sintoma:** Erro de conexão recusada
**Solução:**
```bash
# Verificar processos na porta 3000
lsof -i :3000
# Matar processo se necessário
kill -9 <PID>
```

### 3. **CORS Issues**
**Sintoma:** Erro de CORS no console
**Solução:** Backend já configurado com CORS `*`

### 4. **Firewall/Proxy**
**Sintoma:** Timeout de conexão
**Solução:** Verificar configurações de rede

### 5. **Socket.IO Version Mismatch**
**Sintoma:** Erro de protocolo
**Solução:** Versões compatíveis já instaladas

## 📊 Monitoramento

### Console do Navegador
- Abra DevTools (F12)
- Vá para aba "Console"
- Procure por logs com emojis: 🧪 ✅ ❌ 📊

### Network Tab
- Abra DevTools (F12)
- Vá para aba "Network"
- Filtre por "WS" (WebSocket)
- Verifique conexões ativas

## 🔄 Próximos Passos

1. **Teste a conectividade** usando o Debug Panel
2. **Verifique os logs** no console do navegador
3. **Confirme que o backend está rodando** na porta 3000
4. **Tente novamente** clicar em "Verificar Fatos"

## 📞 Se o Problema Persistir

1. **Copie os logs completos** do console
2. **Verifique a URL** mostrada no Debug Panel
3. **Teste o health check** manualmente: `curl http://localhost:3000/health`
4. **Verifique se há erros** no terminal do backend

## 🎯 Resultado Esperado

Após implementar essas correções, você deve ver:
- ✅ Conexão WebSocket estabelecida
- ✅ Logs detalhados no console
- ✅ Debug Panel mostrando "Conectado"
- ✅ Verificação de fatos funcionando normalmente

