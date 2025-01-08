# BUY ME COFFEE
This is a simple blockchain application that allows users to send a small amount of cryptocurrency to the developer as a token of appreciation.

you can see the running version in github pages https://vetri15.github.io/buy-me-coffee/. 
It is available in Sepolia Testnet as of now.


### SETUP INSTRUCTION

1. clone the repositroy with
```shell
git clone https://github.com/vetri15/buy-me-coffee.git
```

2. you can first set up the backend with changing to the folder and running npm install
```shell
cd buy-me-coffee-backend
npm install
```
3. environment variable need to updated with your private keys in the .env file. once updated make sure to encrypt the environment variables.
set the UPDATE_FRONT_END variable to true. inorder for the abi and deployed address to update in the front end.
```shell
npx dotenvx encrypt
```

‼️not running this code will expose your private keys to the Internet. do not proceed further without running the encrypt command.‼️.

4 . now the local hardhat node can be run for testing purposes using the below command
```shell
npx hardhat node
```

5 . there are utility scripts written for deploying the smart contract
```shell
npx hardhat run scripts/buy-coffee-deploy.js --network localhost
```
6 . Now the backend is set and the front-end is also updated.

7 . Run the Next js with the below command
```shell
cd..
cd buy-me-coffee-frontend
npm install
npm run dev
```
8 . Done! The application is up and running at http://localhost:3000/buy-me-coffee

