# Plataforma de Eventos e Ingressos

Projeto desenvolvido para o desafio técnico **Elite Dev — Verzel**: uma plataforma onde organizadores publicam eventos (a partir de um catálogo externo) e clientes reservam lugares, pagam de forma simulada e recebem ingressos com QR Code, validados na portaria na entrada do evento.

## Sumário

- [Stack utilizada](#stack-utilizada)
- [Como rodar o projeto](#como-rodar-o-projeto)
- [Credenciais de teste](#credenciais-de-teste)
- [Estrutura do front-end](#estrutura-do-front-end)
- [Decisões técnicas e de design](#decisões-técnicas-e-de-design)
- [Uso de IA no desenvolvimento](#uso-de-ia-no-desenvolvimento)
- [Limitações conhecidas](#limitações-conhecidas)
- [Deploy](#deploy)

---

## Stack utilizada

**Back-end:** Java + Spring Boot, Spring Security (JWT), PostgreSQL, integração com a API do TMDb.

**Front-end:** React (JavaScript) + Vite, Tailwind CSS (via `@theme`, sem `tailwind.config.js`), React Router, Axios, `qrcode.react` (geração de QR), `html5-qrcode` (leitura de QR pela câmera).

---

## Como rodar o projeto

### Pré-requisitos

- Docker
- Java 17+ e Maven (ou use o Maven Wrapper incluso)
- Node.js 18+

### 1. Banco de dados

Na raiz do back-end, suba o PostgreSQL via Docker:

```bash
docker compose up -d
```

### 2. Back-end

Ainda na raiz do back-end:

```bash
./mvnw spring-boot:run
```

*(No Windows: `mvnw.cmd spring-boot:run`)*

Não é necessário criar um arquivo `.env` — as configurações de conexão com o banco e a chave da API do TMDb já estão definidas em `application.properties` para o ambiente local.

A API sobe em `http://localhost:8080`.

### 3. Front-end

Na raiz do front-end:

```bash
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

### 4. Dados de teste

O `DataSeeder` já popula o banco automaticamente na subida da aplicação — não é necessário cadastrar nada manualmente para testar o fluxo completo.

---

## Credenciais de teste

Todos os usuários usam a senha **`123456`**.

| Papel | Nome | E-mail |
|---|---|---|
| Organizador | Organizador Demo | `organizador@verzel.com` |
| Cliente | Cliente Um | `cliente1@verzel.com` |
| Cliente | Cliente Dois | `cliente2@verzel.com` |
| Portaria | Portaria Demo | `portaria@verzel.com` |

**Evento pré-cadastrado:** *Matrix Resurrections* — Cinema, Sala 1 (Cine Verzel), R$ 35,00, 10 assentos (`A1` a `A10`), todos livres.

---

## Estrutura do front-end

```
src/
  components/   → peças reutilizáveis (EventCard, SeatMap, Navbar...)
  pages/        → uma tela por rota
  layouts/      → MainLayout (Navbar + Outlet)
  services/     → chamadas HTTP organizadas por domínio (api, eventService, seatService...)
  context/      → AuthContext (token, usuário, login/logout)
  routes/       → ProtectedRoute
  utils/        → helpers (mapeamento de imagem/cor por tipo de evento, estilo de validação)
```

### Fluxo de telas

`Login` → `Home` (busca e filtro de eventos) → `EventDetail` (mapa de assentos, seleção múltipla) → `Payment` (pagamento simulado, com expiração e recusa) → `MyTickets` (ingressos com QR) → `Portaria` (validação, câmera + digitação manual). Além de `SharedTicket` (visualização pública de um ingresso via link) e `Organizador` (criação de eventos a partir do catálogo do TMDb).

---

## Decisões técnicas e de design

Algumas escolhas feitas ao longo do desenvolvimento, e por quê:

- **Identidade visual escura, com tipografia condensada (Bebas Neue) e acento laranja-avermelhado** — buscando transmitir "plataforma de eventos/nightlife" em vez da estética genérica de SaaS corporativo. A tela de login usa um layout dividido (título de impacto + formulário) com glow de fundo, em vez do formulário centralizado padrão.
- **Reserva com seleção múltipla de assentos via `Promise.allSettled`** — como o back-end reserva um assento por requisição, o front dispara todas as chamadas em paralelo e trata sucessos e falhas (ex: `409 Conflict` por concorrência) de forma independente, sem que uma falha cancele as reservas que já deram certo.
- **Countdown de expiração da reserva no front, calculado a partir do `expiresAt`** — é só uma referência visual para o usuário; a fonte de verdade da expiração continua sendo o back-end.
- **QR Code gerado a partir do `codigoValidacao` (`reservaId:qrHash`)** — é essa string completa que a portaria precisa ler para validar; o QR é renderizado sobre fundo branco propositalmente, para garantir contraste e leitura confiável pela câmera mesmo com o restante da interface em tema escuro.
- **Filtros de evento calculados em memória no front** — como o `GET /eventos` já retorna a lista completa com todos os campos necessários, filtrar localmente evita idas e vindas à API a cada tecla digitada na busca.
- **Links de navegação da Navbar condicionais por `role`** — o usuário só vê o que pode acessar; isso é só a camada de UX, a proteção de fato é feita pelo `ProtectedRoute` (que redireciona para `/login` se não autenticado, ou para a Home se o papel não bate) e pelo próprio back-end.
- **QR Code funcional também na página pública de compartilhamento (`SharedTicket`)** — o link gerado mostra um QR real e válido. Isso é aceitável no escopo do desafio (que pede apenas a possibilidade de compartilhar via link), mas fica registrado como ponto de atenção: em um cenário de produção, valeria restringir a visualização do QR para convidados sem conta, mantendo a validação no portão baseada no hash assinado (que já impede a forja do código).

## Uso de IA no desenvolvimento

Utilizei IA (Claude) como par de desenvolvimento ao longo da construção do front-end, principalmente para:

- Estruturar decisões de arquitetura (organização de pastas, camada de serviços, `AuthContext`, `ProtectedRoute`) e discutir trade-offs antes de implementar.
- Auxílio em configurações que eu tinha menos domínio no momento, como alguns ajustes de Docker e a configuração inicial do Tailwind na versão mais recente.
- Apoio na padronização visual (paleta, tipografia, componentes) a partir de referências visuais que eu levantei antes de começar.

As decisões de produto, os ajustes finos no back-end (como a correção da geração/validação do hash do QR na portaria), os testes de cada fluxo e a validação de que tudo funcionava de ponta a ponta com o back-end real foram feitos por mim, testando manualmente cada etapa (inclusive cenários de concorrência, como duas reservas simultâneas para o mesmo assento).

## Limitações conhecidas

- O `CreateEventRequest` não possui campo de imagem, então eventos criados pelo organizador usam uma imagem padrão por tipo (Cinema/Show/Teatro) na listagem, mesmo quando um filme com pôster foi selecionado do catálogo do TMDb na criação.
- Não há endpoint de cancelamento de evento no back-end atual, então essa funcionalidade opcional não foi implementada.
- O painel do organizador lista os eventos criados, mas não oferece edição após a publicação.

## Deploy

A aplicação foi testada e validada localmente (fluxo garantido de ponta a ponta). O deploy está planejado da seguinte forma:

- **Front-end:** Vercel
- **Back-end:** Render
- **Banco de dados:** Neon (PostgreSQL)

*Se o deploy for concluído antes do envio final, os links públicos serão adicionados aqui.*