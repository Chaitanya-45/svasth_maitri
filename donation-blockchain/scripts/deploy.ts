import * as dotenv from "dotenv";
dotenv.config();

import { readFileSync } from "fs";
import path from "path";
import { ethers } from "ethers";

async function main() {
  const INFURA_API_KEY = process.env.INFURA_API_KEY;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  if (!INFURA_API_KEY || !PRIVATE_KEY) {
    throw new Error("Please set INFURA_API_KEY and PRIVATE_KEY in your .env file");
  }

  console.log("Using Infura project:", INFURA_API_KEY.slice(0, 6) + "...");
  const rpcUrl = process.env.RPC_URL ?? `https://sepolia.infura.io/v3/${INFURA_API_KEY}`;
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`, provider);
  const deployer = await wallet.getAddress();

  // check balance first (avoid INSUFFICIENT_FUNDS)
  const balance = await provider.getBalance(deployer);
  console.log("Deployer address:", deployer);
  console.log("Balance (wei):", balance.toString());

  // Abort if balance is too low (adjust threshold as needed)
  const minNeeded = ethers.parseEther("0.001"); // change if you want higher
  if (balance < minNeeded) {
    throw new Error(
      `Insufficient funds for deployment. Balance ${ethers.formatEther(balance)} ETH < required ${ethers.formatEther(minNeeded)} ETH. Fund the account or use a local/funded key.`
    );
  }

  // load compiled artifact produced by Hardhat
  const artifactPath = path.resolve("artifacts", "contracts", "DonationVerifier.sol", "DonationVerifier.json");
  const raw = readFileSync(artifactPath, "utf8");
  const artifact = JSON.parse(raw);

  const abi = artifact.abi;
  const bytecode = artifact.bytecode;
  if (!abi || !bytecode) throw new Error("ABI or bytecode not found in artifact");

  console.log("Deploying DonationVerifier...");

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy(); // pass constructor args if needed
  const deployTx = await contract.deploymentTransaction(); // v6 method

  console.log("Deployment tx hash:", deployTx?.hash ?? "unknown");

  // wait for deployment completion
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("DonationVerifier deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Deployment failed:", err?.message ?? err);
    process.exit(1);
  });