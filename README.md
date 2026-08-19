# Verzel Events — Front-end

Front-end da plataforma de eventos e ingressos do desafio técnico Elite Dev (Verzel). Consome a API REST do back-end (Spring Boot) para autenticação, catálogo de eventos, reserva de assentos, pagamento simulado, emissão de ingressos com QR code e validação na portaria.

> Este README documenta apenas o front-end. Para a API, veja o README do back-end.

---

## Stack

- **React 19** + **Vite**
- **React Router DOM** — rotas e proteção por papel (role)
- **Context API** — autenticação (`AuthContext`), sem libs extras de estado global
- **Tailwind CSS 4** (via plugin `@tailwindcss/vite`, sem `tailwind.config.js`)
- **Axios** — cliente HTTP com interceptor de token
- **Framer Motion** — transições e animações
- **html5-qrcode** — leitura de QR code pela câmera (tela da portaria)
- **qrcode.react** — geração do QR code exibido no ingresso

---

## Como rodar o projeto

### Pré-requisitos
- Node.js 18+ e npm
- Back-end rodando em `http://localhost:8080` (veja o README do back-end)

### Passos

```bash
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

### Outros scripts

```bash
npm run build      # build de produção
npm run preview    # preview do build de produção
npm run lint        # eslint
```

---

## Estrutura de pastas

```
src/
├── assets/       # imagens e arquivos estáticos
├── components/   # componentes reutilizáveis
├── context/      # AuthContext (usuário logado, token, login/logout)
├── layouts/      # MainLayout (navbar + outlet das páginas internas)
├── pages/        # telas da aplicação
├── routes/       # ProtectedRoute (proteção de rotas por role)
├── services/     # chamadas à API, um arquivo por domínio
├── utils/        # funções auxiliares
├── App.jsx       # definição das rotas
└── main.jsx      # entrada da aplicação
```

---

## Autenticação

O `AuthContext` mantém o usuário logado (nome e role) e o token JWT, persistidos em `localStorage`. No carregamento da aplicação, o contexto restaura a sessão a partir do `localStorage` (com uma flag `loading` para evitar redirecionamentos precoces).

O `api.js` centraliza a instância do Axios: injeta o header `Authorization: Bearer <token>` em toda requisição autenticada, e normaliza erros da API (`message`/`error`/status) num formato único para tratamento consistente nas telas.

Rotas restritas por papel são protegidas pelo componente `ProtectedRoute`, que recebe as roles permitidas e redireciona usuários sem permissão ou não autenticados.

---

## Rotas

| Rota | Página | Acesso |
|---|---|---|
| `/login` | Login | Público |
| `/` | Home (lista de eventos) | Público |
| `/eventos/:id` | Detalhe do evento e mapa de assentos | Público |
| `/ingressos/compartilhado/:token` | Ingresso compartilhado | Público |
| `/pagamento` | Pagamento simulado | CLIENTE |
| `/meus-ingressos` | Meus ingressos | CLIENTE |
| `/portaria` | Validação de ingressos | PORTARIA |
| `/organizador` | Painel do organizador (catálogo TMDb + meus eventos) | ORGANIZADOR |
| `/organizador/staff/novo` | Criação de conta de staff (organizador/portaria) | ORGANIZADOR |

Todas as rotas exceto `/login` são renderizadas dentro do `MainLayout`, que traz a navbar com links condicionais por role.

---

## Páginas

- **Login** — login e cadastro de cliente na mesma tela, com abas animadas (Framer Motion) e layout dividido (branding de um lado, formulário do outro)
- **Home** — hero com busca e filtro por tipo, vitrine de destaque (`FeaturedShowcase`) e grid de eventos (`EventCard`), com fade-in escalonado nos cards
- **EventDetail** — pôster do evento, mapa de assentos com layout gerado dinamicamente a partir da capacidade (`gerarLayoutDinamico`), seleção múltipla e barra fixa de resumo/confirmação
- **Payment** — dados do cartão simulado, com contagem regressiva do tempo restante da reserva (expulsa o cliente para a Home se o tempo expirar) e tratamento de sucesso/falha parcial no pagamento
- **MyTickets** — grid de e-tickets do cliente, cada um com QR code (`qrcode.react`) e botão para copiar o link de compartilhamento
- **SharedTicket** — visualização pública de um ingresso por link, sem necessidade de login
- **Organizador** — busca no catálogo TMDb, formulário de criação de evento e listagem dos eventos publicados
- **Portaria** — validação de ingresso por código manual ou por leitura de QR com a câmera (`html5-qrcode`), com histórico de validações do evento selecionado
- **CreateStaff** — formulário para o organizador criar contas de PORTARIA ou ORGANIZADOR, com seleção visual do tipo de conta

---

## Camada de serviços (`services/`)

Cada arquivo em `services/` isola as chamadas de um domínio da API, todas passando pela instância central `api.js`:

- **api.js** — instância do Axios com interceptor de autenticação e tratamento de erro
- **eventService.js** — listagem de eventos (`GET /eventos`)
- **seatService.js** — assentos de um evento e criação de reserva, com `idempotencyKey` gerada via `crypto.randomUUID()` para evitar reservas duplicadas
- **paymentService.js** — pagamento de uma reserva
- **ticketService.js** — ingressos do cliente logado e ingresso compartilhado por token
- **organizadorService.js** — busca no catálogo TMDb, criação e listagem de eventos do organizador
- **portariaService.js** — validação de ingresso e histórico de validações
- **staffService.js** — criação de contas de PORTARIA/ORGANIZADOR

---

## Decisões técnicas

**Idempotência na reserva de assento**
`seatService.reservarAssento` gera uma `idempotencyKey` via `crypto.randomUUID()` a cada tentativa de reserva, evitando que um duplo clique ou retry de rede crie reservas duplicadas para o mesmo cliente — o back-end usa essa chave para retornar a reserva já existente em vez de criar uma nova.

**Sessão persistida em `localStorage`, não em cookie**
Como a API é *stateless* (JWT) e consumida de um front separado, optei por guardar token/nome/role em `localStorage` e restaurá-los no carregamento da aplicação, evitando exigir login a cada refresh de página.

**Leitura de QR code pela câmera na tela da portaria**
Além da validação manual por código, a tela de portaria usa `html5-qrcode` para ler o QR do ingresso diretamente pela câmera do dispositivo, agilizando a entrada de clientes no evento.

**Tratamento de erro centralizado no Axios**
O interceptor de resposta do `api.js` normaliza a mensagem de erro (vinda de `message` ou `error` no corpo da resposta) num formato único, para que as telas não precisem tratar o formato de erro do back-end individualmente.

**Mapa de assentos com layout gerado dinamicamente**
Em vez de um layout fixo, `EventDetail` calcula o número de fileiras a partir da capacidade do evento (10 assentos por fileira, com corredor central), permitindo que o mapa se adapte a eventos de qualquer tamanho sem precisar de configuração manual por evento.

**Contagem regressiva do tempo de reserva na tela de pagamento**
A tela de `Payment` calcula o tempo restante até a reserva mais próxima de expirar e atualiza a cada segundo; se o tempo chega a zero, o cliente é redirecionado de volta para a Home, evitando tentativas de pagamento sobre uma reserva já expirada no back-end.

---

## Uso de IA no desenvolvimento

Usei IA para auxiliar na construção do projeto — principalmente em configuração de ferramental (Vite, Tailwind), depuração de erros e em partes específicas onde eu tinha menos domínio prévio — e não para gerar o projeto como um todo. As decisões de fluxo, estrutura de telas e o design visual foram feitos por mim.

---

## Limitações conhecidas

- O cadastro de novo cliente (aba "Cadastro" na tela de Login) está incompleto: o `AuthContext` ainda não implementa a função `register` que consome `POST /auth/register`, então o cadastro pelo front não cria a conta de fato. O login de usuários já existentes (seed) funciona normalmente.
- Testes automatizados não implementados devido ao prazo do desafio.
- Sessão em `localStorage` (sem refresh token): o usuário precisa logar novamente após o JWT expirar.