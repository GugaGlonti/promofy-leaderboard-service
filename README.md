# Promofy Leaderboard Service

Critical microservice for promotional rewards, ensuring accurate, consistent, and auditable leaderboard rankings for reward distribution.

## Quick Start Guide

After cloning the repository, navigate to the project directory and install dependencies:

```bash
npm install
```

## Development Environment

In order to develop the service, you will need start a Kafka, a Redis and a Postgres instance. You can use Docker to run these services locally:

```bash
npm run dev-env
```

After the services are up, copy the `.env.example` file to `.development.env` and adjust any necessary environment variables if needed.

Run the NestJS development server with:

```bash
npm run start:dev
```

## Technical Design Documentation

The technical design documentation can be found in the `docs` folder, including `technical-design.pdf` and `architecture.drawio`.

## API Documentation

An extensive API documentation is available via Swagger UI at `http://localhost:3000/api` when the service is running.
The OpenAPI json file can be found at `http://localhost:3000/api-json`.

## Kafka UI

A Kafka UI is available at `http://localhost:8080` when the service is running.
