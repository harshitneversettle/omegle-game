use anchor_lang::prelude::*;

mod instructions;
mod state;

use instructions::*;

declare_id!("9bM5XZsQdDrN4Qq6QzgRb697kCMmf41tqPGGB3YYe1Bf");

#[program]
pub mod transaction_logic {
    use super::*;

    pub fn make(ctx: Context<Make>, amount: u64,  unique_num: u64) -> Result<()> {
        ctx.accounts
            .handle_make(amount, unique_num , &ctx.bumps)?;
        Ok(())
    }

    pub fn take(ctx : Context<Take> ) -> Result<()> {
        ctx.accounts.handle_take(&ctx.bumps)?;
        Ok(())
    }
}
