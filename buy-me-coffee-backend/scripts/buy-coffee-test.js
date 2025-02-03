const hre = require("hardhat");

//the below script will run the deploy the contract to the localhost and test
//npx hardhat run scripts/buy-coffee-test.js --network localhost

// Returns the Ether balance of a given address.
async function getBalance(address) {
  const balanceBigInt = await hre.ethers.provider.getBalance(address);
  return ethers.formatEther(balanceBigInt, "ether");
}

// Logs the Ether balances for a list of addresses.
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx ++;
  }
}

// Logs the memos stored on-chain from coffee purchases.
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = new Date(Number(memo.timestamp) * 1000);
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`);
  }
}

async function main() {

   if (hre.network.name != "localhost") {
      throw new Error("This script should only be run on localhost");
   }
  // Get the example accounts we'll be working with.
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // We get the contract to deploy.
  const buyMeACoffeeFactory = await hre.ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await buyMeACoffeeFactory.deploy();

  // Deploy the contract.
  await buyMeACoffee.waitForDeployment();
  console.log("BuyMeACoffee deployed to:", buyMeACoffee.target);

  // Check balances before the coffee purchase.
  const addresses = [owner.address, tipper.address, buyMeACoffee.target];
  console.log("== start ==");
  await printBalances(addresses);

  // Buy the owner a few coffees.
  const coffeeTip = {value: hre.ethers.parseEther("1")};
  const largeCoffeeTip = {value: hre.ethers.parseEther("3")}
  await buyMeACoffee.connect(tipper).buyCoffee("adam", "You're the best!", coffeeTip);
  await buyMeACoffee.connect(tipper2).buyCoffee("bob", "Amazing teacher", coffeeTip);
  await buyMeACoffee.connect(tipper3).buyCoffee("cate", "I love my Proof of Knowledge", largeCoffeeTip);

  // Check balances after the coffee purchase.
  console.log("== bought coffee ==");
  await printBalances(addresses);

  // Withdraw.
  await buyMeACoffee.connect(owner).withdrawTips();

  // Check balances after withdrawal.
  console.log("== withdrawTips ==");
  await printBalances(addresses);

  // Check out the memos.
  console.log("== memos ==");
  const memos = await buyMeACoffee.getMemos();
  printMemos(memos);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });