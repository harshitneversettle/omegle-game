use anchor_lang::prelude::*;
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;
use anchor_lang::system_program::{transfer, Transfer};

use crate::state::vault::Vault;

#[derive(Accounts)]
#[instruction(amount : u64 , match_id: u64 )]
pub struct InitVault<'info> {
    #[account(mut)]
    pub user1: Signer<'info>,
    ///CHECK: only for vault
    ///
    pub user2: UncheckedAccount<'info>,
    #[account(
        init ,
        payer = user1 ,
        space = 8 + Vault::INIT_SPACE ,
        seeds = [b"vault" , user1.key().as_ref() , user2.key().as_ref() , match_id.to_le_bytes().as_ref() ] ,
        bump
    )]
    pub vault_state: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitVault<'info> {
    pub fn handle_init(&mut self, amount : u64 , match_id: u64, bumps: &InitVaultBumps) -> Result<()> {
        let amount = self.vault_state.bet;
        self.vault_state.set_inner(Vault {
            maker: self.user1.key(),
            taker: self.user2.key(),
            bet: amount,
            bump: bumps.vault_state,
        });

        let transfer_accounts = Transfer {
            from: self.user1.to_account_info(),
            to: self.vault_state.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(self.system_program.to_account_info(), transfer_accounts);
        transfer(cpi_ctx, amount.checked_mul(LAMPORTS_PER_SOL).unwrap())?;
        Ok(())
    }
}
