# Pay Wallet - Digital Wallet & NFT Management Platform

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Modules](#modules)
- [Database Schema](#database-schema)
- [Smart Contract Integration](#smart-contract-integration)
- [Development Guide](#development-guide)
- [Deployment](#deployment)

## 🌟 Overview

Pay Wallet is a comprehensive digital wallet and NFT management platform built with NestJS and MongoDB. It provides secure wallet management, token transfers, NFT handling, social features, and blockchain integration.

### Key Features

- 🔐 **Secure Wallet Management** - Create and manage cryptocurrency wallets
- 💰 **Token Transfers** - Support for ERC20, ERC721, and ERC1155 tokens
- 🎨 **NFT Management** - Complete NFT lifecycle management
- 👥 **Social Features** - Friend system with requests, blocking, and social interactions
- 🔑 **Authentication** - JWT-based auth with Twitter OAuth integration
- 🌐 **Multi-chain Support** - Support for multiple blockchain networks
- 📊 **Transaction History** - Complete transaction tracking and analytics

## 🏗️ Architecture

The project follows a modular Nx monorepo structure:

```
pay-wallet/
├── apps/
│   └── wallet-ms/              # Main wallet microservice
├── libs/
│   ├── domain/                 # Shared domain entities and DTOs
│   └── common/                 # Shared utilities and constants
└── scripts/                    # Deployment and utility scripts
```

### Technology Stack

- **Backend**: NestJS, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Passport
- **Blockchain**: ethers.js, Web3
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Docker, Kubernetes

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Yarn package manager
- MongoDB
- Redis (for caching)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pay-wallet

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the development server
nx serve wallet-ms
```

### Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/pay-wallet
MONGODB_DATABASE=pay-wallet

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URI=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret
COOKIE_DOMAIN=localhost

# Blockchain
RPC_URL=https://mainnet.base.org
PRIVATE_KEY=your-private-key

# API
API_KEY=your-api-key
HOST_URL=http://localhost:3000
FRONTEND_URL=http://localhost:4200

# Features
ENABLE_REGISTER=true
ENABLE_SWAGGER=true
NODE_ENV=development
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All endpoints require JWT authentication unless specified otherwise.

```bash
Authorization: Bearer <jwt-token>
```

### Core Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/twitter` - Twitter OAuth login

#### Wallet Management
- `GET /wallets` - Get user wallets
- `POST /wallets/create` - Create new wallet
- `POST /wallets/transfer` - Transfer tokens
- `POST /wallets/transfer-nft-721` - Transfer ERC721 NFTs
- `POST /wallets/transfer-nft-1155` - Transfer ERC1155 NFTs

#### NFT Management
- `GET /nft` - List NFTs with filters
- `GET /nft/:id` - Get NFT details
- `POST /nft` - Create NFT record
- `PUT /nft/:id` - Update NFT
- `GET /nft/collections` - Get collections

#### Social Features
- `POST /friendship/request` - Send friend request
- `PUT /friendship/respond` - Accept/reject friend request
- `GET /friendship/friends` - List friends
- `GET /friendship/not-friends` - Get users not in friend list
- `POST /friendship/block` - Block user

#### Transactions
- `GET /transactions` - Get transaction history
- `GET /transactions/:id` - Get transaction details

## 🔧 Modules

### 1. Wallet Module (`apps/wallet-ms/src/wallet/`)

Handles wallet creation, management, and token transfers.

**Key Features:**
- Wallet creation and encryption
- Token balance checking
- ERC20/ERC721/ERC1155 transfers
- Multi-chain support

**Main Files:**
- `wallet.service.ts` - Core wallet operations
- `wallet.controller.ts` - API endpoints
- `wallet.module.ts