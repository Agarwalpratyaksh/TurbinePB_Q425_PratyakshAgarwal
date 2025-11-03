import { Keypair,Connection, type Commitment } from "@solana/web3.js";
import {createMint, createMintToInstruction} from "@solana/spl-token";
import wallet from "/home/pratyaksh/.config/solana/id.json" with {type:"json"};

let arr = new Uint8Array(wallet);
let keypair = Keypair.fromSecretKey(arr);
console.log(`MY Keypair : ${keypair.publicKey}`);

let commitment:Commitment = "confirmed";
let connection = new Connection("https://api.devnet.solana.com",commitment);
async function mint() {
    try {
        let mint = await createMint(
    connection,
    keypair,
    keypair.publicKey,
    null,
    6
);
console.log(`Mint created with address : ${mint}`);
    } catch (e) {
        console.log(`Error occurred : ${e}`)
    }
}
await mint();
