# AGÊNCIA FLIP 1.0 Beta

Sistema de gestão de conteúdo para agências de marketing digital.
Desenvolvido para **Tom e Jéssica**.

---

## Requisitos

- Node.js 18+
- npm 9+

---

## Instalação

### 1. Clone ou extraia o projeto

```bash
cd agencia-flip
```

### 2. Instale as dependências

```bash
npm run install:all
```

Este comando instala as dependências da raiz, do client e do server.

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Abra o arquivo `.env` e preencha suas chaves de API (você também pode configurar direto no sistema em **Configurações**).

### 4. Inicie o sistema

```bash
npm start
```

O sistema vai abrir em:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

---

## Chaves de API necessárias

| Chave | Para quê | Onde obter |
|-------|----------|------------|
| `ANTHROPIC_API_KEY` | Gerar textos e legendas com Claude | https://console.anthropic.com/ |
| `OPENAI_API_KEY` | Gerar imagens com DALL-E | https://platform.openai.com/api-keys |
| `META_ACCESS_TOKEN` | Publicar no Facebook e Instagram | https://developers.facebook.com/ |
| `META_PAGE_ID_FACEBOOK` | ID da página do Facebook | No Meta Business Suite |
| `META_PAGE_ID_INSTAGRAM` | ID do Instagram Business | No Meta Business Suite |

> As chaves também podem ser inseridas direto na tela de **Configurações** do sistema, sem precisar editar o arquivo `.env`.

---

## Funcionalidades

- **Cadastro de clientes** com logo e briefing permanente
- **Geração de conteúdo por IA** (Claude para texto + DALL-E para imagens) com briefing injetado automaticamente
- **Fluxo de 2 selos**: aprovação interna (FLIP) + aprovação do cliente
- **Planner** com calendário mensal de publicações
- **Agendamento** com bloqueio automático até os 2 selos aprovados
- **Publicação automática** via Meta Graph API (Facebook + Instagram)
- **Campanhas de tráfego pago** via Facebook Ads MCP

---

## Estrutura de pastas

```
agencia-flip/
├── client/          # React + Vite (frontend)
├── server/          # Node.js + Express (backend)
├── uploads/logos/   # Logos dos clientes
├── flip.db          # Banco de dados SQLite (criado automaticamente)
├── .env             # Suas chaves de API
└── .env.example     # Modelo de configuração
```

---

## Fluxo de aprovação

```
Nova demanda → Gerar com IA → Enviar para aprovação
  → [Selo FLIP] Tom ou Jéssica aprovam
  → [Selo Cliente] Marcar aprovação do cliente
  → Agendar data/hora/rede
  → Publicar automaticamente
```

---

## Suporte

Em caso de dúvidas, consulte o arquivo `AGENCIA_FLIP_prompt_claudecode.md` para o escopo completo do sistema.

---

*Agência FLIP 1.0 Beta — Tom & Jéssica*
