# hackforge

# run these commands for the blockchain
first run the npx hardhat node (to create local testnet tokens)
npx hardhat compile                                                     
npx hardhat run interact.ts --network localhost                                                       
npx hardhat run scripts/deploy.ts --network localhost

then take contract address and paste it wherever needed