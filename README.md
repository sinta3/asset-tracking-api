# Project Overview

a RESTful API for a simplified Asset Tracking System. The system allow
organisations to manage assets, assign them to users, and track their status — think
equipment, devices, or tools within a company.

## Tech Stack

- **Language:** Node.js
- **Framework:** Express
- **Database:** MySQL
- **ORM:** Sequelize
- **Auth:** JWT (jsonwebtoken) + bcrypt
- **Infrastructure:** Docker + Docker Compose
- **Testing:** Jest
- **Logger:** Winston
- **Validation:** Joi
- **Rate Limiter:** limiter
- **Code Formatter:** Prettier

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed on your machine

## Getting Started

### 1. Clone the repository

git clone https://github.com/your-username/your-repo.git
cd your-repo

### 2. Set up environment variables

Copy the example env file and fill in the values:

cp .env.example .env

| Variable                        | Description                                           |
|---------------------------------|-------------------------------------------------------|
| `DB_HOST`                       | MySQL host (use `service name` if use Docker)         |
| `DB_PORT`                       | MySQL port (default: `3306`)                          |
| `DB_NAME`                       | Database name                                         |
| `DB_USER`                       | Database user                                         |
| `DB_PASSWORD`                   | Database password                                     |
| `DB_TEST_NAME`                  | Separate database name used for integration tests     |
| `DB_TEST_PORT`                  | Separate database port used for integration tests     |
| `NODE_ENV`                      | Environment mode (e.g. `development`, `test`)         |
| `JWT_ACCESS_TOKEN_SECRET`       | Secret key used to sign JWT tokens                    |
| `JWT_ACCESS_TOKEN_EXPIRED_TIME` | Token expiry duration (e.g. `7d`, `1h`)               |
| `PORT`                          | Port the app runs on (default: `3000`)                |


### 3. Run the app

docker-compose up --build

The API will be available at `http://localhost:3000`.

### 4. Run database migrations

Once the containers are up, migrations already executed from the seed.sql file

### 5. Run integration tests

docker-compose exec app npm run test             # run all tests
docker-compose exec app npm run test -- --coverage  # with coverage report
docker-compose exec app npm run test -- --watchAll     # watch mode

Tests run against a separate database (`DB_TEST_NAME`) to avoid interfering with development data.

## Development Guidelines

Before committing, always run Prettier to ensure consistent code formatting:

npm run format

## Authentication

This project uses a custom auth implementation.

- **Passwords** are hashed using `bcrypt` before being stored in the database.
- **Sessions** are handled via **JWT**. On login, the server issues a signed token which
  the client includes in the `Authorization` header for subsequent requests:

Authorization: Bearer <token>

- Tokens are verified on protected routes via an auth middleware.
- On first registration as `admin`, an organization is automatically created and linked
  to the user. This ensures every asset management flow is scoped to an organization
  from the start.

## Design Decisions

### Authentication — JWT + bcrypt (custom, no third-party provider)

Several third-party options were evaluated: Firebase Auth, Auth0, Clerk, BetterAuth,
SuperTokens, and Supabase. Most were ruled out for one or more of the following reasons:
login and register flows are handled via client SDK on the frontend rather than the
backend (Firebase, Auth0), reliance on PostgreSQL as the underlying database which does
not align with this project's MySQL stack (SuperTokens, Supabase), or opinionated
toward TypeScript (Clerk, BetterAuth).

JWT was the natural fit: tokens are self-contained, can be customized to include
organization and role data directly, and integrate cleanly with this project's own MySQL
database. bcrypt handles password hashing. For a system scoped to organizations with a
defined set of roles (admin, member), this is sufficient, no SSO or social login is
required.

### Organization auto-creation on admin registration

When the first user registers as an `admin`, the system automatically creates and links
an organization to that user. This makes the end-to-end flow self-contained. There is
no separate organization setup step. It also enforces that every user, asset, and
assignment is always scoped to an organization. As a consequence, organization names
must be unique.

### Folder structure (MVC with shared service layer)

Two approaches were considered: feature-based modules and MVC organized by
responsibility. Feature-based modules were ruled out because the business logic in this
project is not isolated per feature. asset operations depend on user data, which would
cause decoupling issues if each feature were fully isolated.

MVC was chosen instead, with a clear split between controllers (handle HTTP
request/response), services (business logic), and models (table definitions). This
separation makes each layer independently readable and testable, and fits naturally with
Express's conventions.

### ORM (Sequelize)

Sequelize was chosen over alternatives (e.g. TypeORM) because of prior experience and
its migration support. Explicit table definitions via Sequelize models make the schema
easy to read and maintain, and with table definition provides a traceable record of schema
changes over time. It also integrates well with MySQL and Node.js without requiring
TypeScript.

### Rate limiting (limiter)

The `limiter` package was chosen because it implements the **token bucket algorithm**,
which is more memory-efficient than fixed-window approaches and avoids the edge-case
gap at window boundaries where bursts can slip through. Using a library over a manual
implementation keeps the code simple while fully meeting the functional requirement.

### Logging (Winston)

Winston was chosen for its detailed trace output and flexible configuration. All logging
is centralized in a single logger instance rather than scattered across the codebase,
this means any change to log format or transport only needs to be made in one place.

### Request validation (Joi via middleware)

Input validation is handled at the middleware layer, separate from business logic
validation in the service layer. This keeps controllers clean and makes validation
rules reusable across routes. Joi was chosen for its wide range of built-in validators
across data types and its customizable error messages.

### Asset assignment (`is_active` flag)

Current assignments are tracked via an `is_active` boolean on the `asset_assignments`
table rather than deleting records on unassignment. This allows historical assignment
data to be preserved for traceability while still making it straightforward to query
the currently active assignment for any asset.

### App and server separation

`app.js` and `server.js` are kept as separate files. `app.js` defines the Express
application, middleware, and routes. `server.js` handles the runtime (port binding,
startup). This separation makes the app easier to test in isolation and keeps the
startup logic from mixing with application configuration.

### Two databases (development + test)

A dedicated test database is configured separately from the development database. This
ensures integration tests always run against a clean, isolated state without touching
or corrupting development data.

### Code formatting (Prettier)

Prettier is used to enforce a consistent code style across the project, reducing noise
in diffs and avoiding style debates during code review.

### Integration test structure ( fixtures, helpers, and tests )

Integration tests are split into three parts: **fixtures** (test configuration and
setup config), **helpers** (reusable setup and teardown logic), and **tests** (the
actual test cases). This separation keeps each part isolated and focused —
configuration is centralized in fixtures, shared logic lives in helpers, and test
files stay focused purely on validating behavior. It also avoids duplication when
the same setup logic is needed across multiple test files.

### Docker base image (Node Alpine)

The Node Alpine image was chosen over the default Node image as the base for the
Docker container. Alpine-based images have a significantly smaller attack surface,
which translates to fewer vulnerabilities, validated through Snyk scanner experience
in a previous project. For the scope of this project, Alpine provides everything
needed without the overhead of a full Debian-based image.

### Error handling (centralized error handler middleware)

All errors are thrown from services and controllers without directly sending a response.
A single error handler middleware intercepts all thrown errors and is responsible for
sending the HTTP response. This keeps error response formatting consistent across the
entire application and avoids scattering response logic throughout the codebase.

## References

### Articles & Documentation

1. https://www.quora.com/Is-it-better-to-implement-my-own-user-authentication-or-use-3rd-party-authentication-services
2. https://dev.to/7xmohamed/authentication-explained-when-to-use-basic-bearer-oauth2-jwt-sso-4lc
3. https://www.w3schools.com/MySQL/mysql_intro.asp
4. https://blog.logrocket.com/organizing-express-js-project-structure-better-productivity/
5. https://dev.to/mr_ali3n/folder-structure-for-nodejs-expressjs-project-435l
6. https://medium.com/@jonoyanguren/mvc-pattern-in-nodejs-and-express-old-but-gold-46c21bee365a
7. https://stackoverflow.com/questions/59591275/how-and-why-does-express-uses-mvc-pattern
8. https://www.freecodecamp.org/news/how-to-build-an-event-app-with-node-js/
9. https://smit90.medium.com/sequelize-vs-typeorm-choosing-the-right-orm-for-your-node-js-project-a6f8a0cd2b8c
10. https://bootcampai.medium.com/why-do-we-need-a-database-connection-pool-217046c1fcfb
11. https://medium.com/databases-in-simple-words/uuid-vs-auto-increment-integer-for-ids-what-you-should-choose-20c9cc968600
12. https://stackoverflow.com/questions/338156/table-naming-dilemma-singular-vs-plural-names
13. https://en.wikipedia.org/wiki/Serial_number
14. https://www.geeksforgeeks.org/computer-organization-architecture/what-is-serial-number-in-computer/
15. https://docs.docker.com/guides/databases/
16. https://hub.docker.com/_/mysql
17. https://dev.mysql.com/doc
18. https://expressjs.com/
19. https://www.freecodecamp.org/news/how-to-build-a-secure-authentication-system-with-jwt-and-refresh-tokens/
20. https://medium.com/@artemkhrenov/the-complete-guide-to-joi-validation-in-production-node-js-applications-96acaddae056
21. https://sequelize.org/docs/v6/other-topics/transactions/
22. https://blog.logrocket.com/rate-limiting-node-js/
23. https://www.npmjs.com/package/limiter
24. https://medium.com/deno-the-complete-reference/5-npm-packages-for-rate-limiting-of-node-js-apps-cf0f76aff0a2
25. https://prettier.io/docs/install

### AI Tools

- **ChatGPT** — review integration tests, or skipped business flow
- **Claude** — brainstorming, design decision analysis, and generating integration tests, also help generating Docker Compose configuration