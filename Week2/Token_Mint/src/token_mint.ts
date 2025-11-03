import { Connection, Keypair, PublicKey, type Commitment } from "@solana/web3.js";
import { 
    getOrCreateAssociatedTokenAccount, 
    mintTo,
    createAssociatedTokenAccountIdempotent,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
 } from "@solana/spl-token";
import wallet from "/home/pratyaksh/.config/solana/id.json" with {type:"json"};

let keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
console.log(`Wallet Public Key- ${keypair.publicKey}`);

let commitment:Commitment = "confirmed";
let connection = new Connection("https://api.devnet.solana.com",commitment);

let mint = new PublicKey("FYnpFNN2SUwk8JixzixP5g6rmtuJ6R4HniqfEYpt1Xyi");

let decimals = 1_000_000;

async function mintToUser(user:Keypair, mint:PublicKey, numToken:number) {
   
    try {
        let ata = await createAssociatedTokenAccountIdempotent(
            connection,
            keypair,
            mint,
            user.publicKey,
            {commitment:"confirmed"},
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        let txnSignature = await mintTo(
            connection,
            keypair,
            mint,
            ata,
            keypair,
            numToken * decimals,
            [],
            {commitment:"confirmed"},
            TOKEN_PROGRAM_ID       
        );

        let txnSignatureLink= `https://explorer.solana.com/tx/${txnSignature}?cluster=devnet`
        console.log(`${numToken} Token Allocated to User- ${user.publicKey} and txnSignature is - ${txnSignatureLink}`);
    } catch (e) {
        console.log(`Error Occurred!- ${e}`)
    }
}

await mintToUser(keypair,mint,100000); 
