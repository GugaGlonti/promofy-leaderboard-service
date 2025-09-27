# Promofy Leaderboard Service

Critical microservice for promotional rewards, ensuring accurate, consistent, and auditable leaderboard rankings for reward distribution.

## Setup

After cloning the repository, navigate to the project directory and install dependencies:

```bash
npm install
```

## Development Environment

In order to develop the service, you will need start a Kafka, a Redis and a Postgres instance. You can use Docker to run these services locally:

```bash
npm run dev
```

After the services are up, copy the `.env.example` file to `.development.env` and adjust any necessary environment variables if needed.

Run the development server with:

```bash
npm run start:dev
```

## Production Environment

For production run the following command to start the service:

```bash
npm run prod
```

This will build the project and start the service along with the necessary dependencies.

## API Documentation

An extensive API documentation is available via Swagger UI at `http://localhost:3000/api` when the service is running.
The OpenAPI json file can be found at `http://localhost:3000/api-json`.
