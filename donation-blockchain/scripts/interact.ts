// ...existing code...
import * as dotenv from "dotenv";
dotenv.config();

import { readFileSync } from "fs";
import path from "path";
import { ethers } from "ethers";

async function main() {
  const rpcUrl = process.env.RPC_URL ?? "http://127.0.0.1:8545";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) throw new Error("Set PRIVATE_KEY in .env (use local node key)");
  const wallet = new ethers.Wallet(PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`, provider);

  const artifactPath = path.resolve("artifacts", "contracts", "DonationVerifier.sol", "DonationVerifier.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;

  const address = process.env.DV_ADDRESS;
  if (!address) throw new Error("Set DV_ADDRESS in .env to the deployed contract address");

  const contract = new ethers.Contract(address, abi, provider);

  // list function names (ethers v6: use fragments; cast to access name safely)
  const fnNames = contract.interface.fragments
    .filter((f) => f.type === "function")
    .map((f) => (f as any).name as string)
    .filter(Boolean);
  console.log("Available contract functions:", fnNames);

  // Example: call a view function (replace 'someView' with a real function name)
  // const result = await contract.someView();
  // console.log("someView() =>", result);

  // Example: send a transaction (replace 'someTx' with a real state-changing function)
  // const contractWithSigner = contract.connect(wallet);
  // const tx = await contractWithSigner.someTx(arg1, arg2);
  // await tx.wait();
  // console.log("Tx confirmed:", tx.hash);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
// ...existing code...