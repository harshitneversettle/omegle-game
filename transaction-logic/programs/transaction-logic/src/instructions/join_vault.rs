use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;
use crate::state::vault::Vault;

#[derive(Accounts)]
#[instruction(match_id: u64)]
pub struct JoinVault<'info> {
    #[account(mut)]
    pub user2: Signer<'info>,
    /// CHECK:
    pub user1: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"vault", user1.key().as_ref(), user2.key().as_ref(), match_id.to_le_bytes().as_ref()],
        bump = vault_state.bump,
    )]
    pub vault_state: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}

impl<'info> JoinVault<'info> {
    pub fn handle_join(&mut self) -> Result<()> {
        let amount = self.vault_state.bet;
        let transfer_accounts = Transfer {
            from: self.user2.to_account_info(),
            to: self.vault_state.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(self.system_program.to_account_info(), transfer_accounts);
        transfer(cpi_ctx, amount.checked_mul(LAMPORTS_PER_SOL).unwrap())?;
        Ok(())
    }
}