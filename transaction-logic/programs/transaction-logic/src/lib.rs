use anchor_lang::prelude::*;

mod instructions;
mod state;
mod errors;

use instructions::*;

declare_id!("9bM5XZsQdDrN4Qq6QzgRb697kCMmf41tqPGGB3YYe1Bf");

#[program]
pub mod transaction_logic {
    use super::*;

    pub fn init_vault(ctx: Context<InitVault>, amount: u64, match_id: u64) -> Result<()> {
        ctx.accounts.handle_init(amount, match_id, &ctx.bumps)?;
        Ok(())
    }

    pub fn join_vault(ctx: Context<JoinVault>, match_id: u64) -> Result<()> {
        ctx.accounts.handle_join()?;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, match_id: u64) -> Result<()> {
        ctx.accounts.handle_depposit(match_id)?;
        Ok(())
    }

    pub fn claim_vault(ctx: Context<ClaimVault>, match_id: u64) -> Result<()> {
        ctx.accounts.handle_claim(match_id)?;
        Ok(())
    }

    pub fn release(ctx: Context<Release>, match_id: u64) -> Result<()> {
        ctx.accounts.handle_release(match_id)?;
        Ok(())
    }
}