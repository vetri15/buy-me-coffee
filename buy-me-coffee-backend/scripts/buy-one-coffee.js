const hre = require("hardhat");

//this is a utility script that buys one coffee for the user
//npx hardhat run scripts/buy-one-coffee.js --network localhost

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
  // Get the example accounts we'll be working with.
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // We get the contract to deploy.
  const buyMeACoffeeFactory = await hre.ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await new ethers.Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3" , buyMeACoffeeFactory.interface ,ethers.provider);

  console.log("BuyMeACoffee deployed to:", buyMeACoffee.target);

  // Check balances before the coffee purchase.
  const addresses = [owner.address, tipper.address, buyMeACoffee.target];
  console.log("== start ==");
  await printBalances(addresses);

  // Buy the owner a few coffees.
  const coffeeTip = {value: hre.ethers.parseEther("1")};
  const largeCoffeeTip = {value: hre.ethers.parseEther("3")}
  await buyMeACoffee.connect(tipper).buyCoffee("Duke", "a one dollar coffee", coffeeTip);

  // Check balances after the coffee purchase.
  console.log("== bought coffee ==");
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