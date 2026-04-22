use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::state::vault::Vault;
use crate::errors::CustomError;

#[derive(Accounts)]
#[instruction(match_id: u64)]
pub struct ClaimVault<'info> {
    #[account(mut)]
    pub winner: Signer<'info>,
    /// CHECK:
    pub loser: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"vault", vault_state.maker.as_ref(), vault_state.taker.as_ref(), match_id.to_le_bytes().as_ref()],
        bump = vault_state.bump,
        close = winner
    )]
    pub vault_state: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}

impl<'info> ClaimVault<'info> {
    pub fn handle_claim(&mut self, match_id: u64) -> Result<()> {
        require!(
            self.winner.key() == self.vault_state.maker
                || self.winner.key() == self.vault_state.taker,
            CustomError::NotAPlayer
        );

        let total = self.vault_state.to_account_info().lamports();
        let bump = self.vault_state.bump;
        let match_id_bytes = match_id.to_le_bytes();

        let seeds: &[&[u8]] = &[
            b"vault",
            self.vault_state.maker.as_ref(),
            self.vault_state.taker.as_ref(),
            match_id_bytes.as_ref(),
            &[bump],
        ];
        let signer_seeds = &[seeds];

        let transfer_accounts = Transfer {
            from: self.vault_state.to_account_info(),
            to: self.winner.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            self.system_program.to_account_info(),
            transfer_accounts,
            signer_seeds,
        );
        transfer(cpi_ctx, total)?;
        Ok(())
    }
}