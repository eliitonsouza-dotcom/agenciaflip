# AGÊNCIA FLIP 1.0 Beta — Prompt para Claude Code

## Contexto

Desenvolva um sistema web chamado **Agência FLIP 1.0 Beta** para gerenciamento completo de produção de conteúdo de uma agência de marketing digital. Os proprietários são **Tom** e **Jéssica**.

O sistema deve funcionar localmente (sem necessidade de servidor externo na v1), com dados persistidos em arquivo local (JSON ou SQLite), e ser executado via `npm start` no navegador.

---

## Identidade Visual

- Fundo principal: `#0D0D0D` (preto)
- Acento primário: `#FF6600` (laranja neon)
- Texto principal: `#FFFFFF`
- Texto secundário: `#999999`
- Superfícies/cards: `#1A1A1A`
- Bordas sutis: `#2A2A2A`
- Fonte: Inter ou sistema sans-serif
- Nome do sistema exibido como: **AGÊNCIA FLIP** com o `1.0 beta` em tag pequena laranja ao lado

---

## Stack Tecnológica

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Banco de dados:** SQLite via `better-sqlite3` (arquivo local `flip.db`)
- **Armazenamento de logos:** pasta local `/uploads/logos/`
- **Variáveis de ambiente:** arquivo `.env` na raiz para chaves de API
- **Portas:** frontend em `3000`, backend em `3001`

---

## Estrutura de Pastas

```
agencia-flip/
├── client/          # React + Vite
│   └── src/
│       ├── pages/
│       ├── components/
│       └── styles/
├── server/          # Node + Express
│   ├── routes/
│   ├── db/
│   └── services/
├── uploads/
│   └── logos/
├── flip.db
├── .env.example
└── package.json
```

---

## Módulo 1 — Cadastro de Clientes

### Tela: Lista de clientes
- Cards com logo, nome do cliente e status (ativo/inativo)
- Botão "+ Novo cliente"
- Busca por nome

### Tela: Cadastro / Edição de cliente
Campos obrigatórios:
- **Nome do cliente** (texto)
- **Logo** (upload de imagem — JPG/PNG, salvo em `/uploads/logos/`)
- **Segmento** (ex: restaurante, clínica, varejo, serviços...)
- **Briefing fixo** (textarea grande) — inclui:
  - Tom de voz
  - Público-alvo
  - Produto/serviço principal
  - Cores da marca
  - Restrições e observações
- **Redes sociais ativas** (checkboxes: Facebook, Instagram)
- **Status** (ativo / inativo)

### Demanda avulsa
- Opção "Demanda avulsa" na criação de demanda, sem vínculo a cliente cadastrado
- Neste caso, o usuário preenche um briefing manual para aquela demanda específica

---

## Módulo 2 — Geração de Conteúdo por IA

### Tela: Nova demanda
Campos:
- **Cliente** (select com clientes cadastrados) OU toggle "Demanda avulsa"
- **Tipo de conteúdo:** Post feed / Story / Reels / Promocional / Institucional
- **Objetivo da peça** (texto livre — ex: "divulgar promoção de quinta")
- **Observações adicionais** (opcional)
- Botão: **Gerar conteúdo**

### Geração automática
Ao clicar em "Gerar conteúdo":

1. O sistema monta o prompt automaticamente combinando:
   - Briefing fixo do cliente (ou briefing manual se avulso)
   - Tipo de conteúdo selecionado
   - Objetivo da peça
   - Observações adicionais

2. Chama a **API da Anthropic (Claude)** para gerar:
   - Legenda principal
   - Sugestão de CTA (call to action)
   - Hashtags sugeridas

3. Chama a **API da OpenAI (DALL-E / GPT-4o)** para gerar:
   - 1 imagem baseada no briefing e objetivo

4. Resultado exibido na tela com:
   - Imagem gerada (com opção de "Gerar nova imagem")
   - Texto gerado (editável inline)
   - Botão "Salvar demanda"

### Variáveis de ambiente necessárias
```
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
META_APP_ID=
META_APP_SECRET=
META_ACCESS_TOKEN=
```

---

## Módulo 3 — Fluxo de Aprovação (2 Selos)

Cada demanda passa pelos seguintes status em ordem:

```
RASCUNHO → AGUARDANDO APROVAÇÃO INTERNA → APROVADO FLIP → AGUARDANDO APROVAÇÃO CLIENTE → APROVADO CLIENTE → AGENDADO → PUBLICADO
```

### Selo 1 — Aprovação FLIP (interna)
- Exibido para Tom e Jéssica na fila de aprovação
- Badge laranja com texto "FLIP" ao lado da demanda
- Ações: **Aprovar** | **Devolver para ajuste** (com campo de comentário)
- Ao aprovar: status muda para `APROVADO FLIP`

### Selo 2 — Aprovação Cliente
- Só aparece após o Selo 1 aprovado
- Badge verde com texto "CLIENTE"
- Dentro do sistema, Tom ou Jéssica marcam a aprovação do cliente (v1 — sem link externo ainda)
- Ações: **Marcar como aprovado pelo cliente** | **Devolver para ajuste**
- Ao aprovar: status muda para `APROVADO CLIENTE`
- **Somente após os 2 selos aprovados a chave de agendamento é liberada**

### Histórico de status
- Cada mudança de status registra: quem fez, quando, e comentário (se houver)
- Visível no detalhe da demanda como linha do tempo

---

## Módulo 4 — Planner e Agendamento

### Tela: Planner
- Calendário mensal com posts agendados por cliente (cada cliente com uma cor)
- Vista de lista alternativa (semana atual)
- Filtro por cliente

### Agendamento (só disponível com 2 selos aprovados)
Campos:
- **Data** (date picker)
- **Hora** (time picker)
- **Rede social:** Facebook | Instagram | Ambos
- **Tipo de publicação:** Feed | Story

Ao confirmar agendamento:
- Status muda para `AGENDADO`
- Aparece no calendário do planner
- Exibe confirmação: "Post agendado para [data] às [hora] no [rede]"

### Publicação via Meta Graph API
- No horário agendado (ou via botão manual "Publicar agora"), o sistema:
  1. Faz upload da imagem para o Meta
  2. Publica o post com a legenda
  3. Atualiza status para `PUBLICADO`
  4. Registra timestamp de publicação

---

## Módulo 5 — Tráfego Pago (Facebook Ads via MCP)

> Integração com o MCP do Facebook Ads já disponível em `https://mcp.facebook.com/ads`

### Tela: Tráfego
- Lista de campanhas ativas por cliente
- Botão "+ Nova campanha" a partir de um post já publicado

### Criar campanha (fluxo simplificado)
A partir de um post publicado, Tom ou Jéssica podem:
1. Selecionar o post publicado como criativo
2. Definir: objetivo, orçamento diário, data de início/fim, público (básico)
3. O sistema cria via MCP: Campanha → Conjunto de anúncios → Anúncio

### Relatório básico
- Por cliente: posts publicados, alcance, curtidas, comentários
- Por campanha: impressões, cliques, CPM, gasto total
- Dados puxados da API do Facebook Ads via MCP

---

## Navegação Principal (sidebar esquerda)

```
[ AGÊNCIA FLIP  1.0 beta ]

  Dashboard
  Clientes
  Nova demanda
  Fila de aprovação     [badge com número pendente]
  Planner
  Tráfego
  Configurações
```

---

## Tela: Dashboard

Visão geral rápida:
- Cards: posts pendentes de aprovação / posts agendados esta semana / posts publicados no mês
- Lista dos últimos 5 posts criados com status atual
- Atalho rápido: "Nova demanda"

---

## Tela: Fila de Aprovação

- Tabs: **Aguardando FLIP** | **Aguardando Cliente** | **Aprovados**
- Cada item mostra: thumbnail da imagem, nome do cliente, tipo, data de criação
- Clique abre o detalhe completo com ações de aprovação

---

## Tela: Configurações

- Dados da agência (nome, logo da agência)
- Chaves de API (campos para inserir ANTHROPIC_API_KEY, OPENAI_API_KEY, META tokens)
- Informações dos proprietários: **Tom** e **Jéssica**

---

## Regras de Negócio Importantes

1. **Agendamento bloqueado** enquanto qualquer um dos 2 selos não estiver aprovado — o botão de agendar deve aparecer desabilitado com tooltip explicativo
2. **Briefing sempre injetado** automaticamente nos prompts de IA — nunca gerar sem contexto do cliente
3. **Demanda avulsa** usa briefing manual, mas passa pelo mesmo fluxo de aprovação e agendamento
4. **Histórico imutável** — nenhuma alteração apaga o registro de status anterior
5. **Logos salvas localmente** em `/uploads/logos/` com nome único por cliente
6. **Dados persistem** entre sessões (SQLite local)

---

## Banco de Dados — Tabelas principais

```sql
clients (id, name, segment, logo_path, briefing, social_facebook, social_instagram, status, created_at)

demands (id, client_id, type, objective, notes, caption, hashtags, cta, image_path, status, created_at, updated_at)

demand_history (id, demand_id, from_status, to_status, changed_by, comment, changed_at)

schedules (id, demand_id, scheduled_at, network, post_type, published_at, meta_post_id)

campaigns (id, client_id, demand_id, name, objective, budget_daily, start_date, end_date, meta_campaign_id, status)
```

---

## Observações Finais para o Claude Code

- Iniciar com `npm install` e `npm run dev` funcionando sem configuração adicional (exceto `.env`)
- Criar um `.env.example` com todas as variáveis necessárias comentadas
- Seed de dados: criar 2 clientes de exemplo e 1 demanda de exemplo para facilitar testes
- Mensagens de erro amigáveis quando APIs não estiverem configuradas (ex: "Configure sua ANTHROPIC_API_KEY em Configurações")
- Todo o sistema em **português brasileiro**
- README.md com instruções de instalação passo a passo

---

*Agência FLIP 1.0 Beta — Desenvolvido para Tom e Jéssica*
