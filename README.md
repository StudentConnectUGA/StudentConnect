# Student Connect

Student Connect is a Next.js web platform that enables students to discover and connect with peer tutors based on completed coursework and subject mastery. The platform is optimized for deployment on **Vercel** and follows a modern full-stack architecture using **Next.js App Router**, **NextAuth**, and **PostgreSQL (Prisma ORM).**

---

## 🚀 Getting Started

### 1️⃣ Install Dependencies

```bash
npm install
# or
yarn install
```

### 2️⃣ Configure Environment Variables

Create both `.env` and `.env.local` at the project root:

#### `.env`

> **Used by Prisma** (database connection)

```env
DATABASE_URL="postgresql://postgres@localhost:5432/student_connect_dev"
```

#### `.env.local`

> **Used by Next.js**

```env
GOOGLE_CLIENT_ID=130066559799-3s84mj......os32anldou.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-1......ORKLSp3LMK7K

NEXTAUTH_SECRET="7a2Qc8f9F2k....UC++sWG1kEsI="
NEXTAUTH_URL=http://localhost:3000
```

Run Prisma setup steps:

```bash
npx prisma db push
```

(Optional) View your database:

```bash
npx prisma studio
```

---

## 🧩 Development Server

Start the app locally:

```bash
npm run dev
```

Open your browser:

👉 [http://localhost:3000](http://localhost:3000)

Any changes under `app/` will hot-reload automatically.

---

## 🐳 Docker Support (for Testing)

If you plan to run authenticated Playwright tests, ensure:

* Docker is installed:

  * [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
* Docker Compose is installed:

  * [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)

Then run:

```bash
docker compose up -d
```

This will start required dependencies (e.g., test database).

---

## 🧪 Testing

This project uses **Playwright** for full E2E + API integration testing.

Also, the tests must run with the dev server active (see above). It does not start the server automatically.

> Authenticated tests require a one-time manual Google Sign-In to create a Playwright session state.

Run the entire test suite:

```bash
./run-tests.sh
```

Force re-authentication (in case of session expiration):

Just delete the generated authentication state file at `playwright/.auth/user.json` and re-run:

```bash
./run-tests.sh
```

---
