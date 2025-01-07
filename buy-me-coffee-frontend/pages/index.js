import abi from "../constants/BuyMeACoffee.json";
import contractAddresses from "../constants/contractAddress.json";

import classNames from "classnames";
import { ethers } from "ethers";
import React, { useEffect, useState , useRef} from "react";

import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import basePath from "@/deployment.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const contractABI = abi.abi;
  let test = 2;

  const [networkId, setNetworkId] = useState(0);
  const [isTransactionReady, setIsTransactionReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Not Connected");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  let [currentAccount, setCurrentAccount] = useState("0x");
  let [contractAddress, setContractAddress] = useState("0x");

  let isMetamaskInstalled = useRef(false);
  let isWalletConnected = useRef(false);

  let ethereumObject = useRef();
  let provider = useRef();
  let network = useRef();

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const trimAddress = (address) => {
    return address.slice(0, 6) + "...." + address.slice(-4);
  };

  const initializeMetamask = () => {
    const { ethereum } = window;
    if (!ethereum) {
      return;
    }
    ethereumObject.current = window.ethereum;
    provider.current = new ethers.BrowserProvider(ethereumObject.current);
    isMetamaskInstalled.current = true;
    return;
  };

  const isNetworkSupported = (networkId) => {
    if (contractAddresses[networkId]) {
      return true;
    } else {
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      if (isMetamaskInstalled.current) {

        network.current = await provider.current.getNetwork();
        isWalletConnected.current = (network.current != null ? true : false) && (true);

        const accounts = await ethereumObject.current.request({
          method: "eth_requestAccounts",
        });
        isWalletConnected.current = (accounts.length > 0 ? true : false) && isWalletConnected.current;

        isWalletConnected.current = (isNetworkSupported(network.current.chainId) ? true : false) && isWalletConnected.current;

        if (isWalletConnected.current) {
          setNetworkId(network.current.chainId);
          console.log("setting contract address to : "+contractAddresses[BigInt(network.current.chainId).toString()]);
          contractAddress = contractAddresses[BigInt(network.current.chainId).toString()];
          await setContractAddress(
            contractAddresses[BigInt(network.current.chainId).toString()]
          );
          setCurrentAccount(accounts[0]);
        }
      }else{
        isWalletConnected.current = false;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const buyCoffee = async (amount) => {
    try {
      if (isTransactionReady) {
        const signer = await provider.current.getSigner();
        let buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        console.log("buying coffee..");
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "alex",
          message ? message : "Enjoy the coffee!",
          { value: ethers.parseEther(amount) }
        );

        console.log(coffeeTxn);
        let receipt = await provider.current.waitForTransaction(coffeeTxn.hash);

        console.log("mined ", coffeeTxn);
        console.log(receipt);

        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMemos = async () => {
    try {
      if (ethereumObject.current) {
        const signer = await provider.current.getSigner();
        console.log("current network: ", BigInt(network.current.chainId).toString());
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getNetworkName = (chainId) => {
    const networks = {
      1: "Ethereum Mainnet",
      31337: "Localhost",
      11155111: "Sepolia Testnet",
    };
    return networks[chainId] || "Unsupported Network";
  };

  const setupNewMemoListener = async () => {
    console.log("setting up event listener..");
    const signer = await provider.current.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Listen for the NewMemo event
    const filter = await contract.filters.NewMemo();
    contract.on(filter, (log) => {
      console.log("log received ", log);
      const parsedLog = contract.interface.parseLog(log.log, filter);
      console.log("parsed log: ", parsedLog);
      const { from, timestamp, name, message } = parsedLog.args;
      console.log("Memo received:", from, timestamp, name, message);

      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(Number(timestamp) * 1000),
          message,
          name,
        },
      ]);
    });
  };

  const handleNetworkChage = (chainId) => {
    console.log("chain changed to ", chainId);
    if (isNetworkSupported(chainId)) {
      getMemos();
      setIsTransactionReady(true);
      setErrorMessage(null);
    } else {
      setIsTransactionReady(false);
      setErrorMessage("Network not supported");
    }
    setNetworkId(chainId);
  };

  const handleAccountChange = (accounts) => {
    console.log("account changed to ", accounts[0]);
    setCurrentAccount(accounts[0]);
  };

  //when network is changed
  useEffect(() => {
    const setInitialization = async () => {
      initializeMetamask();
      await connectWallet();
      if (isMetamaskInstalled.current && isWalletConnected.current) {
        console.log("setting up chain and account event listeners");
        setupNewMemoListener();
        getMemos();
        ethereumObject.current.on("chainChanged", (chainId) => {
          handleNetworkChage(BigInt(chainId).toString());
        });
        ethereumObject.current.on("accountsChanged", (accounts) => {
          handleAccountChange(accounts);
        });
        setIsTransactionReady(true);
      } else {
        setIsTransactionReady(false);
        setErrorMessage("Metamask not installed or connected");
      }
    };

    setInitialization();

    return () => {
      if (provider.current) {
        console.log("removing listeners..");
        provider.current.removeAllListeners(); // Remove listeners on cleanup
      }
      if(contract){
        contract.removeAllListeners();
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>Buy me a coffee!</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={basePath + "favicon.ico"} />
      </Head>
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <div className={classNames(styles.network, styles.rightSide)}>
          {getNetworkName(networkId)}
        </div>
        <div
          className={classNames(
            styles.network,
            styles.leftSide,
            styles.connectButton,
            {
              [styles.redColorFont]: !isTransactionReady,
              [styles.normalColorFont]: isTransactionReady,
              [styles.connectButton]: !isTransactionReady,
            }
          )}
          onClick={connectWallet}
        >
          {isTransactionReady ? trimAddress(currentAccount) : errorMessage}
        </div>
        <main className={styles.main}>
          <h2 className={styles.memeosHeading}>Buy Me a Coffee 🍵 !!</h2>
          <div className={styles.imageWrapper}>
            <Image
              className={styles.logo}
              src={basePath + "coffee-removebg-preview.png"}
              alt="coffee image"
              width={180}
              height={180}
              priority
            />
          </div>

          <div className={styles.ctas}>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondary}
              onClick={() => {
                buyCoffee("0.001");
              }}
            >
              Buy me a coffee
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondary}
              onClick={() => {
                buyCoffee("0.003");
              }}
            >
              Buy me a Large coffee
            </a>
          </div>
          <form>
            <div className={[styles.secondary, styles.donor].join(" ")}>
              <input
                className={styles.donorName}
                type="text"
                placeholder="Name"
                onChange={onNameChange}
                value={name}
              />
              <textarea
                className={styles.donorMessage}
                rows={3}
                placeholder="Message"
                onChange={onMessageChange}
                value={message}
              />
            </div>
          </form>
          <div className={styles.memosWrapper}>
            <h2 className={styles.memeosHeading}>
              {memos.length > 0 ? "Memos" : "No memos yet..."}
            </h2>
            <ul>
              {memos.map((memo, index) => {
                return (
                  <ul className={styles.memos} key={index}>
                    <p className={styles.memoHeading}>{memo.name}</p>
                    <p className={styles.memoMessage}>{memo.message}</p>
                  </ul>
                );
              })}
            </ul>
          </div>
        </main>
      </div>
    </>
  );
}
