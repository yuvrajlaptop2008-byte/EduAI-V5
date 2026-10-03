# Docker Orchestration & Local Environment Guide — Marks App

> **Infrastructure**: Multi-Container Docker Compose Stack  
> **Containers**: PostgreSQL, MongoDB, Redis, Payload CMS, Appsmith, Meilisearch, Node API, Vite Frontend, NGINX Gateway  

---

## 1. System Prerequisites

1. **Docker Engine**: Docker Desktop `v24.x+` (Ensure WSL 2 backend is enabled on Windows).
2. **Docker Compose**: `v2.20+`.
3. **RAM**: Minimum 8 GB available memory allocated to Docker (16 GB recommended for full local stack).

---

## 2. Quickstart: Launching the Complete Stack

### 2.1 Clone Environment Template
```bash
cp .env.example .env
```
Ensure database passwords and secrets in `.env` are populated.

### 2.2 Build and Start Containers
```bash
# Start all 9 services in detached mode
docker compose up -d --build
```

### 2.3 Verify Container Healthchecks
```bash
docker compose ps
```
All containers should report `Up (healthy)` or `Up`:

```
NAME                     IMAGE                         STATUS                    PORTS
marksapp_postgres        postgres:16-alpine            Up (healthy)              0.0.0.0:5432->5432/tcp
marksapp_mongodb         mongo:7.0                     Up (healthy)              0.0.0.0:27017->27017/tcp
marksapp_redis           redis:7.2-alpine              Up (healthy)              0.0.0.0:6379->6379/tcp
marksapp_meilisearch     getmeili/meilisearch:v1.7     Up                        0.0.0.0:7700->7700/tcp
marksapp_payload_cms     node:20-alpine                Up                        0.0.0.0:3000->3000/tcp
marksapp_appsmith        appsmith/appsmith-ce:v1.9     Up                        0.0.0.0:8090->80/tcp
marksapp_backend_api     node:20-alpine                Up                        0.0.0.0:4000->4000/tcp
marksapp_frontend        node:20-alpine                Up                        0.0.0.0:5173->5173/tcp
marksapp_gateway         nginx:alpine                  Up                        0.0.0.0:80->80/tcp
```

---

## 3. Local Web Endpoints & Credentials

| Service | Host Port | Reverse Proxy Path | Default Credentials |
|---|---|---|---|
| **NGINX Gateway** | `80` | `http://localhost/` | — |
| **Frontend Web App** | `5173` | `http://localhost/` | — |
| **Backend API** | `4000` | `http://localhost/api/` | — |
| **Payload CMS** | `3000` | `http://localhost/cms/` | Defined during first `/admin` visit |
| **Appsmith Internal Ops**| `8090` | `http://localhost/ops/` | `admin@marksapp.io` / set on first boot |
| **Meilisearch Search** | `7700` | `http://localhost/search/`| Master Key from `.env` |
| **PostgreSQL Database** | `5432` | `localhost:5432` | User: `marksapp_admin`, Pass: `postgres_secure_pwd`, DB: `marksapp_core` |
| **MongoDB Database** | `27017` | `localhost:27017` | User: `mongo_admin`, Pass: `mongo_secure_pwd`, DB: `marksapp_questions` |
| **Redis In-Memory** | `6379` | `localhost:6379` | Pass: `redis_secure_pwd` |

---

## 4. Useful Docker Commands

```bash
# View aggregated real-time logs
docker compose logs -f

# View logs for a specific service (e.g. backend or redis)
docker compose logs -f backend-api
docker compose logs -f redis

# Open PostgreSQL interactive shell
docker compose exec postgres psql -U marksapp_admin -d marksapp_core

# Open MongoDB interactive shell (mongosh)
docker compose exec mongodb mongosh -u mongo_admin -p mongo_secure_pwd --authenticationDatabase admin

# Open Redis CLI with authentication
docker compose exec redis redis-cli -a redis_secure_pwd

# Stop all containers (preserve database data)
docker compose stop

# Destroy all containers and remove persistent volumes (hard reset)
docker compose down -v
```
