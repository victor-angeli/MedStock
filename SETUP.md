# MedStock — Setup Inicial

## Pré-requisitos
- Node.js 18+
- PostgreSQL 14+ rodando localmente (ou via Docker)
- npm 9+

---

## 1. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 2. Backend

```bash
cd backend
npm install

# Copiar e configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do PostgreSQL

# Criar banco e rodar migrations
npm run db:migrate

# Gerar client do Prisma
npm run db:generate

# Popular banco com dados iniciais
npm run db:seed

# Iniciar servidor
npm run dev
# → http://localhost:3001
```

---

## 3. Credenciais padrão (após seed)

| Usuário | Email | Senha | Cargo |
|---------|-------|-------|-------|
| Admin | admin@medstock.com | admin123 | Administrador |
| Farmacêutica | juliana@medstock.com | farm123 | Farmacêutico |

---

## 4. Estrutura do Projeto

```
MedStock/
├── frontend/               # React + TypeScript + Vite
│   └── src/
│       ├── components/     # Componentes reutilizáveis
│       │   └── layout/     # Sidebar, Topbar
│       ├── layouts/        # AppLayout, AuthLayout
│       ├── lib/            # utils, api (axios)
│       ├── pages/          # Uma página por rota
│       └── store/          # Zustand (auth)
│
└── backend/                # Node.js + Express + TypeScript
    ├── prisma/
    │   └── schema.prisma   # Schema do banco (PostgreSQL)
    └── src/
        ├── database/       # Seed
        ├── lib/            # Prisma client
        ├── middleware/     # Auth, errorHandler
        └── routes/         # auth, medicamentos, movimentacoes...
```

---

## 5. Variáveis de ambiente (.env)

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/medstock_db"
JWT_SECRET="chave-secreta-longa-e-aleatoria"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```
