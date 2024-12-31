const hre = require("hardhat");
const fs = require("fs");
require("@dotenvx/dotenvx").config();

//this will deploy to the localhost
//npx hardhat run scripts/buy-coffee-deploy.js --network localhost

async function main() {
  if (hre.network.name === "localhost") {

    console.log("Deploying contract to localhost");
    const buyMeACoffeeFactory = await hre.ethers.getContractFactory(
      "BuyMeACoffee"
    );
    const buyMeACoffee = await buyMeACoffeeFactory.deploy();
    await buyMeACoffee.waitForDeployment();
    console.log("BuyMeACoffee deployed to:", buyMeACoffee.target);

    if(Boolean(process.env.UPDATE_FRONT_END)){
      console.log("Updating front end files...");
      await updateAbi();
      await updateContractAddresses(buyMeACoffee.target);
      console.log("Completed updating front end files.");
    }

  }else if(hre.network.name === "sepolia"){

    console.log("deploying to sepolia");
    const buyMeACoffeeFactory = await hre.ethers.getContractFactory(
      "BuyMeACoffee"
    );
    const buyMeACoffee = await buyMeACoffeeFactory.deploy();
    await buyMeACoffee.waitForDeployment();
    console.log("BuyMeACoffee deployed to:", buyMeACoffee.target);
    console.log("Verifying contract...");
    


  }
}

async function updateAbi() {
  const frontEndAbiFileDestination = "../buy-me-coffee-frontend/constants/BuyMeACoffee.json"
  const artifactLocation = "../buy-me-coffee-backend/artifacts/contracts/BuyMeACoffee.sol/BuyMeACoffee.json";
  const ContractAbiArtifact = JSON.parse(fs.readFileSync(artifactLocation, "utf8"))
  fs.writeFileSync(frontEndAbiFileDestination, JSON.stringify(ContractAbiArtifact, null, 2));
}

async function updateContractAddresses(contractAddress) {
  const frontEndContractsFile = "../buy-me-coffee-frontend/constants/contractAddress.json";
  const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
  if (hre.network.name in contractAddresses) {
      if (!contractAddresses[hre.network.name].includes(contractAddress)) {
          contractAddresses[hre.network.name]=contractAddress;
      }
  } else {
      contractAddresses[hre.network.name] = [contractAddress];
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
