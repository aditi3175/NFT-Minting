import { useState, useEffect } from "react";
import { ethers } from "ethers";
import NFTContract from "./abi/MyNFT.json";
import { CONTRACT_ADDRESS, SEPOLIA_CHAIN_ID_DEC, SEPOLIA_CHAIN_ID_HEX, SEPOLIA_PARAMS } from "./contractConfig";
import "./index.css";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const contractAddress = CONTRACT_ADDRESS; 
  const baseURI =
    "https://ipfs.io/ipfs/QmVcio2y1UP7XdvaBhJkKWQT1bCKXXVeeyTVj1KMB9Mz5W/";

  function toGatewayURL(ipfsUrl) {
    if (!ipfsUrl) return null;
    if (ipfsUrl.startsWith("ipfs://")) {
      const cidPath = ipfsUrl.replace("ipfs://", "");
      return `https://ipfs.io/ipfs/${cidPath}`;
    }
    return ipfsUrl;
  }

  function withGatewayFallback(url) {
    if (!url) return [];
    try {
      const cidPath = url.includes("/ipfs/") ? url.split("/ipfs/")[1] : null;
      if (!cidPath) return [url];
      return [
        `https://ipfs.io/ipfs/${cidPath}`,
        `https://cloudflare-ipfs.com/ipfs/${cidPath}`,
        `https://dweb.link/ipfs/${cidPath}`,
      ];
    } catch {
      return [url];
    }
  }

  async function ensureSepolia() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    if (Number(network.chainId) === SEPOLIA_CHAIN_ID_DEC) return true;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SEPOLIA_PARAMS],
          });
          return true;
        } catch (addErr) {
          console.error("Add network failed", addErr);
          alert("Please add the Sepolia network in MetaMask.");
          return false;
        }
      }
      console.error("Switch network failed", switchError);
      alert("Please switch MetaMask to Sepolia.");
      return false;
    }
  }

  // Connect wallet - FIXED VERSION
  async function connectWallet() {
    if (!window.ethereum) {
      alert("Install MetaMask!");
      return;
    }

    setIsConnecting(true);
    try {
    
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const ok = await ensureSepolia();
      if (!ok) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const acct = await signer.getAddress();
      setAccount(acct);

      const nftContract = new ethers.Contract(
        contractAddress,
        NFTContract.abi,
        signer
      );
      setContract(nftContract);

      console.log("Connected to:", acct);
    } catch (error) {
      console.error("Connection failed:", error);
      if (error.code === 4001) {
        alert("Connection rejected by user");
      } else {
        alert("Failed to connect to MetaMask");
      }
    } finally {
      setIsConnecting(false);
    }
  }

  // Disconnect wallet
  function disconnectWallet() {
    setAccount(null);
    setContract(null);
    console.log("Wallet disconnected");
  }

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected from MetaMask
          disconnectWallet();
        } else if (account && accounts[0] !== account) {
          // User switched accounts - update the app
          setAccount(accounts[0]);
          // Recreate contract with new signer
          if (contract) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            provider.getSigner().then((signer) => {
              const nftContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                NFTContract.abi,
                signer
              );
              setContract(nftContract);
            });
          }
        }
      };

      const handleChainChanged = (chainId) => {
        // Reload on chain change (recommended by MetaMask)
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Cleanup
      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [account, contract]);

  // Load NFTs (read metadata -> image with gateway fallback)
  useEffect(() => {
    const loadNFTs = async () => {
      const items = await Promise.all(
        Array.from({ length: 16 }, async (_, idx) => {
          const tokenId = idx + 1;
          try {
            const metaUrl = `${baseURI}${tokenId}.json`;
            const res = await fetch(metaUrl, { cache: "no-store" });
            if (!res.ok) throw new Error("metadata not found");
            const meta = await res.json();
            const primary = toGatewayURL(meta.image) || `${baseURI}${tokenId}.jpg`;
            const candidates = withGatewayFallback(primary);
            return { name: meta.name || `NFT #${tokenId}` , imageCandidates: candidates };
          } catch (e) {
            const fallback = `${baseURI}${tokenId}.jpg`;
            return { name: `NFT #${tokenId}` , imageCandidates: [fallback] };
          }
        })
      );
      setNfts(items);
    };
    loadNFTs();
  }, []);

  // Mint NFT
  async function mintNFT() {
    if (!contract) return alert("Connect wallet first!");
    try {
      const ok = await ensureSepolia();
      if (!ok) return;
      const tx = await contract.mintNFT();
      await tx.wait();
      alert("NFT minted!");
    } catch (err) {
      console.error(err);
      alert("Mint failed");
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold mb-6">🚀 My NFT Collection</h1>

      {account ? (
        <div className="flex gap-4 mb-4">
          <p className="text-green-400">
            Connected: {account.substring(0, 6)}...
            {account.substring(account.length - 4)}
          </p>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-500 mb-4 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Connecting...
            </span>
          ) : (
            "Connect Wallet"
          )}
        </button>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full max-w-6xl">
        {nfts.map((nft, idx) => (
          <div
            key={idx}
            className="bg-gray-800 p-4 rounded-xl shadow-md flex flex-col items-center"
          >
            {(() => {
              const srcList = nft.imageCandidates || [];
              const first = srcList[0] || "";
              return (
                <img
                  src={first}
                  alt={nft.name}
                  className="rounded-lg w-full h-48 object-cover"
                  onError={(e) => {
                    const img = e.currentTarget;
                    const currentIndex = srcList.indexOf(img.src);
                    const next = srcList[currentIndex + 1];
                    if (next) img.src = next;
                  }}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              );
            })()}
            <h2 className="text-lg font-semibold mt-2">{nft.name}</h2>
            <button
              onClick={mintNFT}
              className="mt-3 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500"
            >
              Mint
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;