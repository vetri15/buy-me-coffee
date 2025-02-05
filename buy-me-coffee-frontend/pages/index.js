import abi from '../constants/BuyMeACoffee.json';
import contractAddresses from '../constants/contractAddress.json';
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import basePath from '@/deployment.config';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  
  let contractAddress = "0x";
  const contractABI = abi.abi;
  let test = 2;
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  useEffect(() => {
    window.setMemos = setMemos;
  }, [memos]);

  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({method: 'eth_accounts'})
      console.log("available accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure metamask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const buyCoffee = async (amount) => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        console.log(signer.address);
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..")
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          {value: ethers.parseEther(amount)}
        );
        // const coffeeTxn = await buyMeACoffee.getMemos();
        console.log(coffeeTxn);

        let receipt = await provider.waitForTransaction(coffeeTxn.hash);

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
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        console.log("current network: ", BigInt(network.chainId).toString());
        contractAddress = contractAddresses[BigInt(network.chainId).toString()];
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


  



  useEffect(() => {
    
    // Create an event handler function for when someone sends us a new memo.
    const setupEventListener = async () => {
      console.log("setting up event listener..");
      const {ethereum} = window;
      if (!ethereum) {
        console.error("Ethereum object not found, install MetaMask.");
        return;
      }
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Listen for the NewMemo event
      const filter = await contract.filters.NewMemo();
      const buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      buyMeACoffee.on(filter, (log) => {
        
        console.log("log received ", log);
        const parsedLog = buyMeACoffee.interface.parseLog(log.log , filter);
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

      })

    }
    
    isWalletConnected();
    getMemos();
    setupEventListener();
      


    return () => {
      if (provider && contract) {
        provider.removeAllListeners(); // Remove listeners on cleanup
      }
    }
  }, []);




  return (
    <>
      <Head>
        <title>Buy me a coffee!</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <main className={styles.main}>
        <h2 className={styles.memeosHeading}>Buy Me a Coffee 🍵 !!</h2>
          <div className={styles.imageWrapper}>
          <Image
            className={styles.logo}
            src={basePath+"coffee-removebg-preview.png"}
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
              onClick={() => {buyCoffee("0.001")}}
            >
              Buy me a coffee
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondary}
              onClick={() => {buyCoffee("0.003")}}
            >
              Buy me a Large coffee
            </a>
          </div>
          <form>
          <div className={[styles.secondary,styles.donor].join(' ')}>
            <input className={styles.donorName} type='text' placeholder='Name' onChange={onNameChange} value={name}/>
            <textarea className={styles.donorMessage} rows={3} placeholder='Message' onChange={onMessageChange} value={message}/>
          </div>
          </form>
          <div className={styles.memosWrapper}>
            <h2 className={styles.memeosHeading}>{memos.length > 0 ? "Memos" : "No memos yet..." }</h2>
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
