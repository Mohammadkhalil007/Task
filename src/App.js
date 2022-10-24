import { ethers } from "ethers";
import axios from "axios";
import { useState, useEffect } from "react";
import mainAbi from "./Abi/mainAbi.json";
import tokenAbi from "./Abi/tokenAbi.json";
import "./App.css";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [message, setMessage] = useState("");
  const [tokensAmount, setTokensAmount] = useState(0);

  let [file, setFile] = useState();

  const connectWallet = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("You need to install metamask to use this Dapp");
    } else {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setWalletAddress(...accounts);
    }
  };

  const onChange = (e) => {
    setFile(e.target.files[0]);
  };

  const buyTokens = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const { chainId } = await provider.getNetwork();
    if (chainId != "97") {
      alert("Switch to BSC testnet to use this Dapp");
      return;
    }
    console.log(process.env.REACT_APP_TOKEN_ADDR);
    const tokenContract = new ethers.Contract(
      `${process.env.REACT_APP_TOKEN_ADDR}`,
      tokenAbi,
      signer
    );

    let txn = await tokenContract.buyToken(tokensAmount.toString(), {
      value: (tokensAmount * 100).toString(),
    });
    await txn.wait();

    console.log(`See Transaction: https://testnet.bscscan.com/tx/${txn.hash}`);
  };

  const mintHammer = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const { chainId } = await provider.getNetwork();
    if (chainId != "97") {
      alert("Switch to BSC testnet to use this Dapp");
      return;
    }
    setMessage("Your image is uploading to IPFS. Please Wait");
    const formData = new FormData();
    formData.append("file", file);

    const resFile = await axios({
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data: formData,
      headers: {
        pinata_api_key: `${process.env.REACT_APP_PINATA_KEY}`,
        pinata_secret_api_key: `${process.env.REACT_APP_PINATA_KEY2}`,
        "Content-Type": "multipart/form-data",
      },
    });

    const ImgHash = `https://gateway.pinata.cloud/ipfs:/${resFile.data.IpfsHash}`;
    setMessage("Image uploaded, Now Minting on Blockchain");
    // Blockchain Minting Start Here
    const nftContract = new ethers.Contract(
      `${process.env.REACT_APP_CONTRACT_ADDR}`,
      mainAbi,
      signer
    );
    const tokenContract = new ethers.Contract(
      `${process.env.REACT_APP_TOKEN_ADDR}`,
      tokenAbi,
      signer
    );

    let allowance = await tokenContract.allowance(
      walletAddress,
      `${process.env.REACT_APP_CONTRACT_ADDR}`
    );

    if (allowance <= ethers.utils.parseUnits("100", 18)) {
      let approveTxn = await tokenContract.approve(
        `${process.env.REACT_APP_CONTRACT_ADDR}`,
        ethers.utils.parseUnits("100", 18)
      );
      await approveTxn.wait();
    }

    let mintTxn = await nftContract.mintHammer(walletAddress, ImgHash);

    await mintTxn.wait();
    console.log(
      `See Transaction: https://testnet.bscscan.com/tx/${mintTxn.hash}`
    );
  };

  const mintOpenApe = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const { chainId } = await provider.getNetwork();
    if (chainId != "97") {
      alert("Switch to BSC testnet to use this Dapp");
      return;
    }
    setMessage("Your image is uploading to IPFS. Please Wait");
    const formData = new FormData();
    formData.append("file", file);

    const resFile = await axios({
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data: formData,
      headers: {
        pinata_api_key: `${process.env.REACT_APP_PINATA_KEY}`,
        pinata_secret_api_key: `${process.env.REACT_APP_PINATA_KEY2}`,
        "Content-Type": "multipart/form-data",
      },
    });

    const ImgHash = `https://gateway.pinata.cloud/ipfs:/${resFile.data.IpfsHash}`;
    setMessage("Image uploaded, Now Minting on Blockchain");
    // Blockchain Minting Start Here
    const nftContract = new ethers.Contract(
      `${process.env.REACT_APP_CONTRACT_ADDR}`,
      mainAbi,
      signer
    );
    const tokenContract = new ethers.Contract(
      `${process.env.REACT_APP_TOKEN_ADDR}`,
      tokenAbi,
      signer
    );

    let allowance = await tokenContract.allowance(
      walletAddress,
      `${process.env.REACT_APP_CONTRACT_ADDR}`
    );

    if (allowance <= ethers.utils.parseUnits("100", 18)) {
      let approveTxn = await tokenContract.approve(
        `${process.env.REACT_APP_CONTRACT_ADDR}`,
        ethers.utils.parseUnits("100", 18)
      );
      await approveTxn.wait();
    }

    let mintTxn = await nftContract.mintOpenApe(walletAddress, ImgHash);

    await mintTxn.wait();
    console.log(
      `See Transaction: https://testnet.bscscan.com/tx/${mintTxn.hash}`
    );
  };

  return (
    <div className="App">
      <h1></h1>
      <div className="buttons">
        {walletAddress ? (
          <>
            {" "}
            <div>
              <h2>Buy Tokens</h2>
              <input
                style={{ height: "20px" }}
                type="number"
                min="1"
                onKeyPress={(e) => {
                  if (e.code === "Minus") {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  setTokensAmount(e.target.value);
                }}
              />
              <button onClick={buyTokens}>Buy Tokens</button>
            </div>
            <div>
              <h2>Mint NFTs</h2>
              <p>{message}</p>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={onChange}
              />
              <button onClick={mintHammer}>Mint Hammer </button>
              <button onClick={mintOpenApe}>Mint Open Ape</button>
            </div>
            <p style={{ color: "red" }}>
              ** Contracts are deployed on BSC testnet
            </p>
          </>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </div>
    </div>
  );
}

export default App;
