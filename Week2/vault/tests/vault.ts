import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TOKEN_2022_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { TokenVault } from "../target/types/token_vault";
import { PublicKey } from "@solana/web3.js";

describe("token_vault", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TokenVault as Program<TokenVault>;
  const user = provider.wallet;

  let mint: PublicKey;
  let userTokenAccount: PublicKey;
  let vaultTokenAccount: PublicKey;
  let vaultPDA: PublicKey;
  let bump: number;

  it("Initializes Vault and deposits tokens", async () => {
    // Create Token-22 mint
    mint = await createMint(
      provider.connection,
      user.payer,
      user.publicKey,
      null,
      0,
      TOKEN_2022_PROGRAM_ID
    );

    // Create vault PDA
    [vaultPDA, bump] = await PublicKey.findProgramAddress(
      [Buffer.from("vault"), user.publicKey.toBuffer()],
      program.programId
    );

    // Get or create user token account
    const userToken = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      user.payer,
      mint,
      user.publicKey,
      true,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    userTokenAccount = userToken.address;

    // Mint tokens to user
    await mintTo(provider.connection, user.payer, mint, userTokenAccount, user.payer, 1000, [], undefined, TOKEN_2022_PROGRAM_ID);

    // Initialize vault (vault token account will be created)
    await program.methods
      .initializeVault()
      .accounts({
        user: user.publicKey,
        vault: vaultPDA,
        vaultTokenAccount: vaultPDA, // PDA will be used
        mint: mint,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("Vault initialized:", vaultPDA.toBase58());

    // Deposit 500 tokens
    await program.methods
      .depositTokens(new anchor.BN(500))
      .accounts({
        user: user.publicKey,
        userTokenAccount: userTokenAccount,
        vault: vaultPDA,
        vaultTokenAccount: vaultPDA, // PDA token account
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();

    console.log("Tokens deposited into vault");
  });
});
