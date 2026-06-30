# Local Development Setup Guide (Without Docker)

This guide walks you through setting up and running the **DevBoard** application locally on your machine without using Docker.

---

## Prerequisites

Before starting, ensure you have the following installed:
- **Node.js** (v20 or higher recommended)
- **pnpm** (v10 or higher recommended). You can install it globally via npm:
  ```bash
  npm install -g pnpm
  ```
- **PostgreSQL** (v16 recommended)

---

## Step 1: Install & Set Up PostgreSQL

### 1. Installation
* **Windows**: Download and run the installer from the [official PostgreSQL downloads page](https://www.postgresql.org/download/windows/).
* **macOS**: Install via Homebrew:
  ```bash
  brew install postgresql@16
  brew services start postgresql@16
  ```
* **Linux (Ubuntu/Debian)**:
  ```bash
  sudo apt update
  sudo apt install postgresql postgresql-contrib
  sudo systemctl start postgresql
  sudo systemctl enable postgresql
  ```

### 2. Configure Database and User
Open your PostgreSQL shell (`psql` via terminal or pgAdmin) and run the following commands to create the default user and database used by the application:

```sql
-- Create the role with password
CREATE ROLE devboard WITH LOGIN PASSWORD 'devboard123' CREATEDB;

-- Create the database owned by the new role
CREATE DATABASE devboard_db OWNER devboard;

-- (Optional) Grant all privileges on the database to devboard
GRANT ALL PRIVILEGES ON DATABASE devboard_db TO devboard;
```

---

## Step 2: Configure Environment Variables

1. Navigate to the API service directory: [apps/api](file:///c:/Users/aakas/Project/DevBoard/apps/api)
2. Create/edit the `.env` file and set your database connection string and secret:

```env
DATABASE_URL="postgresql://devboard:devboard123@localhost:5432/devboard_db"
REDIS_URL="redis://localhost:6379"
PORT=4000
NODE_ENV=development
JWT_SECRET="devboard-super-secret-key-change-in-production"
JWT_EXPIRES_IN="15m"
CORS_ORIGIN="http://localhost:5173"
```

> [!NOTE]
> If you used a different PostgreSQL user, password, or port during installation, update the `DATABASE_URL` connection string accordingly:
> `postgresql://<user>:<password>@localhost:<port>/<database_name>`

---

## Step 3: Install Project Dependencies

Run the package installer from the **root** of the workspace directory. This will resolve all local packages/workspaces and install their dependencies:

```bash
pnpm install
```

---

## Step 4: Run Prisma Migrations

To create the required tables in your local PostgreSQL database, apply the migrations from the root folder:

```bash
pnpm --filter @devboard/api exec prisma migrate deploy
```

*(Alternatively, run `npx prisma migrate deploy` directly from inside the [apps/api](file:///c:/Users/aakas/Project/DevBoard/apps/api) directory).*

---

## Step 5: Start Development Servers

Start both the backend API and the frontend web servers simultaneously in development mode by running the following command in the **root** folder:

```bash
pnpm dev
```

This will spin up:
- **Backend API**: Running at [http://localhost:4000](http://localhost:4000)
- **Frontend Web App**: Running at [http://localhost:5173](http://localhost:5173)

---

## Troubleshooting

### Port Conflicts
If port `4000` (API) or `5173` (Frontend) is already in use by another local application:
- **API Port**: Change the `PORT` variable in [apps/api/.env](file:///c:/Users/aakas/Project/DevBoard/apps/api/.env).
- **Frontend Port**: Modify the port number in the Vite configuration or start script.
