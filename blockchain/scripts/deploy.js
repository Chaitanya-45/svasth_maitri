const { ethers } = require("hardhat");

async function main() {
  const DonationVerifier = await ethers.getContractFactory("DonationVerifier");
  console.log("Deploying DonationVerifier...");
  const donationVerifier = await DonationVerifier.deploy();
  await donationVerifier.deployed();
  console.log("DonationVerifier deployed to:", donationVerifier.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });