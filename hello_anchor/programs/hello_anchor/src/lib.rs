use anchor_lang::prelude::*;

declare_id!("GGVQfeUQaVQ2YBbb8JEoVnN6PTAwsLekPXYffNheZf8C");

#[program]
pub mod hello_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Hello solana");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
