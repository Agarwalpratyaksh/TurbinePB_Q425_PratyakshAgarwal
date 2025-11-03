import { Connection, 
    Keypair, 
    sendAndConfirmRawTransaction, 
    SystemProgram, 
    Transaction, 
    type Commitment,
    sendAndConfirmTransaction 
} from "@solana/web3.js";
import { 
    ExtensionType, 
    getMintLen,
    TYPE_SIZE,
    LENGTH_SIZE, 
    getMinimumBalanceForRentExemptAccount, 
    TOKEN_2022_PROGRAM_ID, 
    createInitializeMetadataPointerInstruction, 
    createInitializeMintInstruction, 
    updateMetadataPointerData, 
    createUpdateMetadataPointerInstruction,
    getOrCreateAssociatedTokenAccount,
    mintTo

} from "@solana/spl-token";
import {createInitializeInstruction, createUpdateFieldInstruction, pack, type TokenMetadata} from "@solana/spl-token-metadata";
import wallet from "/home/pratyaksh/.config/solana/id.json" with {type:"json"};
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

const mint = Keypair.generate();
const commitment:Commitment ="confirmed";
const connection = new Connection("https://api.devnet.solana.com",commitment);

const metadata:TokenMetadata = {
    mint:mint.publicKey,
    name:"PRX",
    symbol:"PRX",
    uri:"https://raw.githubusercontent.com/Agarwalpratyaksh/TurbinePB_Q425_AgarwalPratyaksh/refs/heads/main/Week2/Token_Mint/prx.json",
    updateAuthority:keypair.publicKey,
    additionalMetadata:[["description","My own token"]],
};

const mintLen = getMintLen([ExtensionType.MetadataPointer]);

const metadataLen = TYPE_SIZE + LENGTH_SIZE+ pack(metadata).length;

const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: keypair.publicKey,
    newAccountPubkey: mint.publicKey,
    lamports,
    space:mintLen,
    programId:TOKEN_2022_PROGRAM_ID
    });

const initializeMetaData = createInitializeMetadataPointerInstruction(
    mint.publicKey,
    keypair.publicKey,
    mint.publicKey,
    TOKEN_2022_PROGRAM_ID
);

const initializeMint = createInitializeMintInstruction(
    mint.publicKey,
    6,
    keypair.publicKey,
    null,
    TOKEN_2022_PROGRAM_ID
);

const initializeMetadataInstruction = createInitializeInstruction({
    mint: mint.publicKey,
    metadata: mint.publicKey,
    name:metadata.name,
    symbol:metadata.symbol,
    uri:metadata.uri,
    mintAuthority:keypair.publicKey,
    updateAuthority:keypair.publicKey,
    programId:TOKEN_2022_PROGRAM_ID
});

const updateMetadataInstruction = createUpdateFieldInstruction({
    programId:TOKEN_2022_PROGRAM_ID,
    metadata:mint.publicKey,
    updateAuthority:keypair.publicKey,
    field:metadata.additionalMetadata[0][0],
    value:metadata.additionalMetadata[0][1]
});

const transaction = new Transaction().add(
    createAccountInstruction,
    initializeMetaData,
    initializeMint,
    initializeMetadataInstruction,
    updateMetadataInstruction
);
const txnSignature = await sendAndConfirmTransaction(connection,transaction,[keypair,mint]);
console.log(`Mint created! Mint Address: https://explorer.solana.com/address/${mint.publicKey}?cluster=devnet`);
console.log(`Check out your TX here: https://explorer.solana.com/tx/${txnSignature}?cluster=devnet`);