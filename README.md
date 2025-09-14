# Mezon LLV Baicao Bot - NestJS

This repository contains how to deploy a Mezon LLV Baicao Bot built using NestJS.

## Overview

This project demonstrates how to create a LLV Baicao Bot using NestJS as the backend framework for the Mezon bot. It provides a starting point for developers looking to build their own conversational applications.

## Getting Started

### Creating a LLV Baicao Bot

1. Visit the [Mezon Developer Portal](https://mezon.ai/developers/applications)
2. Sign in with your Mezon account or create one
3. Click on "New Application" to create a new bot
4. Fill in the required details for your bot:
  - Name
  - Description
5. After creation, navigate to the "Bot" section to get your bot token
6. Copy the bot token and bot ID to use in your `.env` file

### Integrating with Your NestJS App

Once you have your bot credentials, you can use them to connect your NestJS application to the Mezon platform. The example code in this repository demonstrates how to set up the connection and handle bot events.

## Prerequisites

- Node.js (v14+)
- npm or yarn
- NestJS CLI

## Installation

```bash
# Clone the repository
git clone https://github.com/VinhPham131/LLV-mezon-bot

# Navigate to the project directory
cd LLV-mezon-bot

# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the root directory and add the following configuration:

```
# Bot configuration
MEZON_TOKEN=
BOT_ID=
POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
REDIS_URL=

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```
## Steps to deploy on replit.com
steps 1: Create account on replit
steps 2: click import code from , and choose github , add your repo.
steps 3: add secret in success
steps 4: click deploy

## Steps to create postgresql in cloud with console.neon
steps 1: Create account on console.neon
steps 2: choose create postgreSQL 
steps 3: click connect and get the command psql to connect -> import to secret

## Project Structure

```
src/
├── bot/              # Bot-specific modules and services
├── main.ts           # Application entry point
└── app.module.ts     # Main application module
test/
```

## Features

- NestJS architecture with dependency injection
- Mezon bot framework integration
- Example conversation flows
- Middleware for message processing
- Ready for deployment

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.