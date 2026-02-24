import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "@nomicfoundation/hardhat-ignition";
import * as dotenv from "dotenv";

dotenv.config();

// Get environment variables or use placeholders for local testing
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

// Skip validation during compilation, but still warn
if (!INFURA_API_KEY || !PRIVATE_KEY) {
  console.warn("Warning: Missing or invalid INFURA_API_KEY or PRIVATE_KEY in .env file");
  console.warn("Compilation will continue, but deployment will fail without valid credentials");
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: "0.8.19" },
      { version: "0.8.20" },
      { version: "0.8.21" }
    ],
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      type: "http"
    }
  }
};

export default config;