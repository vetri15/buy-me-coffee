require("@nomicfoundation/hardhat-toolbox");
require("@dotenvx/dotenvx").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "localhost",
  networks: {
    hardhat: {
      //this test hardhat is configured with zero gas fees inorder to make testing easy.
      gas: 300000000000,
      blockGasLimit: 300000000000,
      maxFeePerGas : 0,
      maxPriorityFeePerGas: 0,
      initialBaseFeePerGas: 0,
      baseFeePerGas : 0,
      gasPrice : 0
    },
    localhost: {
      chainId: 31337,
      url: "http://127.0.0.1:8545/"
    },
    sepolia: {
      chainId: 11155111,
      url:  process.env.ALCHEMY_SEPOLIA_API_KEY ? "https://eth-sepolia.g.alchemy.com/v2/" + process.env.ALCHEMY_SEPOLIA_API_KEY : "https://eth-sepolia.g.alchemy.com/v2/demo",
      accounts: process.env.SEPOLIA_SECURE_PRIVATE_KEY_1 ? [process.env.SEPOLIA_SECURE_PRIVATE_KEY_1] : [],
      saveDeployments: true,
    },
  },
  etherscan: {
    apiKey: {
        sepolia: process.env.ETHERSCAN_API_KEY,
    }
  }
};
