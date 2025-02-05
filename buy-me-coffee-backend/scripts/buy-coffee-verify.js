const { run } = require("hardhat");
const hre = require("hardhat");
const { frontEndContractAddressesFile } = require("../frontend-update.config");
const fs = require("fs");

const CONSTRUCTOR_ARGUMENTS = [];

async function main() {
    if(hre.network.name === "sepolia"){
    console.log("Verifying contract...");
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractAddressesFile, "utf8"));
    const contractAddress = contractAddresses[hre.network.config.chainId.toString()];
    let args = CONSTRUCTOR_ARGUMENTS;
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already been verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });