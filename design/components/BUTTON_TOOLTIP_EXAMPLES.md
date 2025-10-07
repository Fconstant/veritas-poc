# Exemplos de Uso: Tooltip em Botões Desabilitados

Este documento contém exemplos práticos de como usar tooltips em botões desabilitados para melhorar a acessibilidade.

## 📝 Exemplos por Contexto

### 1. Formulário Incompleto

```tsx
<Button
  variant="filled"
  disabled={!formValid}
  disabledTooltip={
    !formValid && "Preencha todos os campos obrigatórios para continuar"
  }
>
  Salvar
</Button>
```

**Quando usar**: Formulários com campos obrigatórios

---

### 2. Falta de Permissão

```tsx
<Button
  variant="outlined"
  disabled={!hasPermission}
  disabledTooltip={
    !hasPermission && "Você não tem permissão para executar esta ação. Entre em contato com o administrador."
  }
>
  Deletar Usuário
</Button>
```

**Quando usar**: Ações que requerem permissões específicas

---

### 3. Limite de Quota/Recursos

```tsx
<Button
  variant="filled"
  disabled={limiteAtingido}
  disabledTooltip={
    limiteAtingido && "Você atingiu o limite de 5 verificações por dia. Faça upgrade para continuar."
  }
>
  Verificar Texto
</Button>
```

**Quando usar**: Limites de uso, quotas, planos

---

### 4. Dependência Não Satisfeita

```tsx
<Button
  variant="filled"
  disabled={!apiKeysConfigured}
  disabledTooltip={
    !apiKeysConfigured && "Configure suas API keys antes de verificar textos"
  }
>
  Começar Verificação
</Button>
```

**Quando usar**: Quando uma ação depende de outra configuração

---

### 5. Seleção Necessária

```tsx
<Button
  variant="outlined"
  disabled={selectedItems.length === 0}
  disabledTooltip={
    selectedItems.length === 0 && "Selecione pelo menos um item para exportar"
  }
>
  <Download />
  Exportar Selecionados
</Button>
```

**Quando usar**: Ações que requerem seleção de itens

---

### 6. Processamento em Andamento

```tsx
<Button
  variant="filled"
  disabled={isProcessing}
  disabledTooltip={
    isProcessing && "Aguarde o processamento atual terminar antes de iniciar outro"
  }
>
  Nova Verificação
</Button>
```

**Quando usar**: Quando uma operação assíncrona está em andamento

---

### 7. Validação de Dados

```tsx
<Button
  variant="filled"
  disabled={!emailValid}
  disabledTooltip={
    !emailValid && "Digite um endereço de email válido (exemplo: usuario@dominio.com)"
  }
>
  Enviar Convite
</Button>
```

**Quando usar**: Quando dados precisam ser validados

---

### 8. Limite de Caracteres

```tsx
<Button
  variant="filled"
  disabled={text.length > MAX_LENGTH}
  disabledTooltip={
    text.length > MAX_LENGTH && 
    `Texto muito longo! Limite: ${MAX_LENGTH} caracteres. Atual: ${text.length}`
  }
>
  Verificar
</Button>
```

**Quando usar**: Quando há limites de tamanho/quantidade

---

### 9. Múltiplas Condições

```tsx
const getDisabledReason = () => {
  if (!nameValid) return "O nome deve ter pelo menos 3 caracteres";
  if (!emailValid) return "Digite um email válido";
  if (!termsAccepted) return "Você precisa aceitar os termos de serviço";
  return null;
};

<Button
  variant="filled"
  disabled={!allValid}
  disabledTooltip={getDisabledReason()}
>
  Criar Conta
</Button>
```

**Quando usar**: Quando há múltiplas validações

---

### 10. Tooltip com Formatação

```tsx
<Button
  variant="outlined"
  disabled={!ready}
  disabledTooltip={
    !ready && (
      <div className="text-left">
        <div className="font-semibold mb-1">Para continuar:</div>
        <div>✓ Verificar email</div>
        <div>✓ Completar perfil</div>
        <div>✗ Adicionar foto de perfil</div>
      </div>
    )
  }
>
  Ativar Perfil
</Button>
```

**Quando usar**: Quando precisa mostrar múltiplos requisitos de forma clara

---

## 🎯 Boas Práticas

### ✅ Faça:

- Use linguagem clara e objetiva
- Explique **o que** falta e **como** resolver
- Seja específico (não genérico)
- Mantenha o texto curto (idealmente < 80 caracteres)
- Use tom amigável e útil

### ❌ Evite:

- Mensagens muito longas (considere usar um modal)
- Jargão técnico desnecessário
- Ser vago ("Algo está errado")
- Tom negativo ou culpador
- Repetir informações óbvias na tela

---

## 📊 Comparação de Impacto

### Sem Tooltip (Menos Acessível)
```tsx
<Button variant="filled" disabled>
  Salvar
</Button>
```
**Problema**: Usuário não sabe por que não pode salvar

### Com Tooltip (Mais Acessível)
```tsx
<Button 
  variant="filled" 
  disabled
  disabledTooltip="Preencha o campo 'Nome' para salvar"
>
  Salvar
</Button>
```
**Benefício**: Usuário sabe exatamente o que fazer

---

## 🧪 Como Testar

1. **Mouse**: Passe o mouse sobre o botão desabilitado
2. **Teclado**: Use Tab para navegar até o botão e veja o tooltip
3. **Touch**: Toque no botão desabilitado em um dispositivo móvel
4. **Screen Reader**: Verifique se aria-disabled está presente

---

## 📚 Recursos Adicionais

- [Documentação completa](./BUTTON_DISABLED_TOOLTIP.md)
- [Stories no Ladle](http://localhost:61000/?story=ui-button-disabled-with-tooltip--filled-disabled-with-tooltip)
- [Componente Button](../button.tsx)
