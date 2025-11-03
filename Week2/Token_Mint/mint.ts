import {
  Connection,
  Keypair,
  clusterApiUrl,
  PublicKey,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} from "@metaplex-foundation/js";
import fs from "fs";

(async () => {

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const payer = Keypair.generate();

  console.log("Wallet PublicKey:", payer.publicKey.toBase58());

  const airdropSig = await connection.requestAirdrop(payer.publicKey, 1e9);
  await connection.confirmTransaction(airdropSig, "confirmed");
  console.log("Airdrop Tx:", airdropSig);

  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    9 
  );
  console.log("Mint Address:", mint.toBase58());

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );
  console.log("Token Account:", tokenAccount.address.toBase58());

  const mintTx = await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer,
    1_000_000_000 
  );
  console.log("Mint Trans Hash:", mintTx);


  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(payer))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: clusterApiUrl("devnet"),
        timeout: 60000,
      })
    );

  console.log("Uploading metadata...");

  const { uri } = await metaplex.nfts().uploadMetadata({
    name: "Proxy Donut Token",
    symbol: "PDT",
  });

  console.log("Metadata uploaded to:", uri);

  const { nft } = await metaplex.nfts().createSft({
    uri,
    name: "Galactic Donut Token 🍩",
    sellerFeeBasisPoints: 0,
    symbol: "GDT",
    mintAuthority: payer,
    updateAuthority: payer,
    decimals: 9,
  });

  console.log("✅ Metadata created and linked!");
  console.log("Metadata Address:", nft.metadataAddress.toBase58());
  console.log("Mint Address:", nft.mint.address.toBase58());


  const details = {
    name: "Galactic Donut Token 🍩",
    symbol: "GDT",
    mint: mint.toBase58(),
    mintTx,
    metadataUri: uri,
    metadataAddress: nft.metadataAddress.toBase58(),
    airdropTx: airdropSig,
    tokenAccount: tokenAccount.address.toBase58(),
  };

  fs.writeFileSync("mint-info.json", JSON.stringify(details, null, 2));

  console.log("\n🎉 Token minted and metadata uploaded successfully!");
})();
