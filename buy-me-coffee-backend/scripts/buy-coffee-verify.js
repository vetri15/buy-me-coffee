const { run } = require("hardhat");
const hre = require("hardhat");

//this will deploy to the localhost
//npx hardhat run scripts/buy-coffee-deploy.js --network localhost

//deployed counter to 0xA91a24D350E19f912078FD91e30a0D36b1BeCbBb;

const CONTRACT_ADDRESS = "0xA91a24D350E19f912078FD91e30a0D36b1BeCbBb";
const CONSTRUCTOR_ARGUMENTS = [];

async function main() {
    if(hre.network.name === "sepolia"){
    console.log("Verifying contract...");
    let contractAddress = CONTRACT_ADDRESS;
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