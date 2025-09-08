## NFT-Minting – Sepolia Mint DApp

A simple ERC‑721 NFT project with a React (Vite) frontend. Anyone connected to MetaMask on Sepolia can mint using the shared contract address.

### Tech
- Solidity (OpenZeppelin ERC721)
- Hardhat (TypeScript)
- React + Vite + ethers v6
- IPFS for images/metadata

---

## Prerequisites
- Node.js LTS installed
- MetaMask on browser
- Sepolia test ETH

---

## Setup
```bash
git clone <your-repo-url>
cd NFT-Minting
npm install
cd frontend && npm install
```

Create a `.env` in repo root (do not commit):
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<PROJECT_ID>
PRIVATE_KEY=0x<your-private-key>
ETHERSCAN_API_KEY=<optional>
```

---

## Contract: Deploy to Sepolia
```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
```
Copy the printed contract address and set it in the frontend config:

`frontend/src/contractConfig.js`
```js
export const CONTRACT_ADDRESS = "0x...your_deployed_address";
```

The frontend already enforces Sepolia and auto‑switches the network in MetaMask.

---

## Frontend: Run locally
```bash
cd frontend
npm run dev
```
Open the shown localhost URL (served over HTTPS on Vercel when deployed).

---

## Deploy frontend (Vercel)
1) Push repo to GitHub.
2) On Vercel: New Project → Import repo.
3) Framework: Vite
4) Install: `npm ci`
5) Build: `npm run build`
6) Output dir: `frontend/dist`

No frontend env vars are required unless you add private gateway keys.

---

## IPFS
- CIDs/URLs are public by design.
- Don’t commit private gateway API keys (Pinata/Infura/Web3.Storage). If used, store in `.env` and configure on Vercel as Environment Variables.
- For pre‑reveal, deploy with a placeholder `baseURI` and later call `setBaseURI` to reveal.

---

## Security / Git hygiene
- Never commit `.env` or private keys (gitignored).
- `node_modules`, Hardhat `artifacts`/`cache` are ignored.
- It’s fine to commit the ABI and `CONTRACT_ADDRESS`.

---

## Useful scripts
```bash
# Compile
npx hardhat compile

# Run tests (if any)
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia
```

---

## Folder structure
- `contracts/myNFT.sol` – ERC721 contract
- `scripts/deploy.ts` – deployment script
- `frontend/` – React app (Vite)
- `metadata_generator/` – helper to generate metadata (optional)

---

## Troubleshooting
- Images not loading: ensure your IPFS paths and extensions match the frontend (e.g., `1.jpg..16.jpg`) or fetch `image` from metadata JSONs.
- MetaMask network error: the app will prompt to switch/add Sepolia automatically.


