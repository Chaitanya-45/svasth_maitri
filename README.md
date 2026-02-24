# SvasthMaitri

Team: AdaCode

SvasthMaitri is a multilingual healthcare donation and redistribution platform focused on reducing biomedical waste and improving equitable access to medicines, medical equipment, and blood support.

The platform connects citizens, verified volunteers, and healthcare institutions through a transparent digital pipeline that combines a web application, backend services, blockchain verification, and AI-assisted redistribution.

## Problem Statement

Telangana generates nearly 20,500 kilograms of biomedical waste every day. At the same time, a significant portion of household medicines remains unused and is often discarded unsafely. This creates:

- soil and water pollution,
- risks for sanitation workers,
- unnecessary carbon emissions from avoidable re-manufacturing,
- and a supply-demand gap where some regions face scarcity while others have usable surplus.

Many rural and financially constrained communities still struggle to access essential medicines, assistive medical equipment, and timely blood support.

## Our Solution

SvasthMaitri addresses this surplus-scarcity imbalance through a structured donation ecosystem:

- donors can contribute medicines and equipment,
- verified channels improve safe and ethical redistribution,
- admins can monitor and route resources,
- emergency workflows accelerate response during crises,
- and blockchain records improve trust with immutable donation traces.

The solution is designed for sustainability, transparency, and accessibility, including support for regional language experiences.

## Key Features

### 1) Medicine and Equipment Donation Flows
- guided donor forms,
- donation lifecycle updates,
- admin visibility and handling.

### 2) Emergency and Disaster Mode
- rapid response pathways,
- dedicated emergency donation/request screens,
- faster volunteer and resource mobilization during crises.

### 3) AI-Assisted Redistribution
- identifies likely mismatches between available resources and regional demand,
- helps prioritize where resources should move next.

### 4) Blockchain Verification Layer
- smart contracts maintain tamper-evident donation records,
- improves traceability and confidence in the donation process.

### 5) Community and Accessibility Focus
- multilingual and inclusive interface direction,
- practical UX for both urban and rural usage contexts.

## Repository Structure

```text
.
├── back-end/                  # Node/Express backend service
├── blockchain/                # Hardhat + Solidity workspace (JS)
├── donation-blockchain/       # Hardhat + Solidity workspace (TS)
├── front-end/                 # React + Vite frontend
├── server.js                  # Root backend entry
├── package.json
└── README.md
```

## High-Level Architecture

1. Frontend (React + Vite)
	- user and admin interfaces for donation, emergency, and operations.

2. Backend (Node.js + Express)
	- API routes, workflow orchestration, integrations.

3. Data and Identity (Firebase)
	- operational records, authentication, and supporting data services.

4. Blockchain (Hardhat + Solidity)
	- immutable verification records for donation-related events.

5. AI Layer
	- redistribution suggestions for better supply-demand balancing.

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Material UI
- Ethers.js (for blockchain interactions)

### Backend
- Node.js
- Express
- Firebase Admin SDK
- Multer / utility middleware as used by the service

### Blockchain
- Solidity
- Hardhat
- Ethers.js

## How to Run (Local Development)

### 1) Install dependencies

From root:

```bash
npm install
```

Then install per module:

```bash
cd back-end && npm install
cd ../front-end && npm install
cd ../blockchain && npm install
cd ../donation-blockchain && npm install
```

### 2) Start backend

From root:

```bash
node server.js
```

Or from backend module:

```bash
cd back-end
node server.js
```

### 3) Start frontend

```bash
cd front-end
npm run dev
```

### 4) Run blockchain locally (example)

For `blockchain/`:

```bash
cd blockchain
npx hardhat node
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

For `donation-blockchain/`:

```bash
cd donation-blockchain
npx hardhat compile
npx hardhat run scripts/deploy.ts --network localhost
```

## Impact

SvasthMaitri aims to:

- reduce preventable biomedical and household medicine waste,
- improve access to essential healthcare resources,
- increase trust in donation lifecycle tracking,
- support faster emergency response,
- and promote a more sustainable healthcare ecosystem.

## Project Vision

SvasthMaitri is built as a scalable civic-health infrastructure model where verified redistribution, transparent records, and intelligent routing can help transform healthcare resource utilization across regions.