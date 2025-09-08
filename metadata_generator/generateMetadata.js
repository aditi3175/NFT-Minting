import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname banane ka ESM tareeka
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Kitne NFT ke liye metadata banana hai
const totalNFTs = 16;

// Metadata folder banado agar nahi hai toh
const metadataDir = path.join(__dirname, "metadata");
if (!fs.existsSync(metadataDir)) {
  fs.mkdirSync(metadataDir);
}

for (let i = 1; i <= totalNFTs; i++) {
  const metadata = {
    name: `NFT #${i}`,
    description: "This is a sample NFT metadata stored on IPFS",
    image: `ipfs://QmVcio2y1UP7XdvaBhJkKWQT1bCKXXVeeyTVj1KMB9Mz5W/${i}.jpg`,
    attributes: [
      { trait_type: "Generation", value: "1" },
      { trait_type: "Rarity", value: "Common" },
    ],
  };

  fs.writeFileSync(
    path.join(metadataDir, `${i}.json`),
    JSON.stringify(metadata, null, 2)
  );

  console.log(`✅ Metadata file ${i}.json created`);
}
