const { run } = require("hardhat");
const hre = require("hardhat");

//this will deploy to the localhost
//npx hardhat run scripts/buy-coffee-deploy.js --network localhost

//deployed counter to 0xA91a24D350E19f912078FD91e30a0D36b1BeCbBb;

async function main() {
    if(hre.network.name === "sepolia"){
    // console.log("deploying to sepolia");
    // const counterFactory = await hre.ethers.getContractFactory(
    //   "Counter"
    // );
    // const counter = await counterFactory.deploy();
    // await counter.waitForDeployment();
    // console.log("BuyMeACoffee deployed to:", counter.target);
    console.log("Verifying contract...");
    contractAddress = "0xA91a24D350E19f912078FD91e30a0D36b1BeCbBb";
    args = [];
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
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



