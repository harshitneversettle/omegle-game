use anchor_lang::prelude::*;
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;
use anchor_lang::system_program::{transfer, Transfer};

use crate::state::vault::Vault;

#[derive(Accounts)]
#[instruction(match_id: u64 )]
pub struct Release<'info> {
    #[account(mut)]
    pub winner: Signer<'info>,

    #[account(
            mut ,
            seeds = [b"vault" , vault_state.maker.key().as_ref() , vault_state.taker.key().as_ref() , match_id.to_le_bytes().as_ref() ] ,
            bump ,
        )]
    pub vault_state: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}

impl<'info> Release<'info> {
    pub fn handle_release(&mut self , match_id: u64) -> Result<()> {
        let maker_key = self.vault_state.maker.key() ;
        let taker_key = self.vault_state.taker.key() ;
        let match_id = &match_id.to_le_bytes() ;
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"vault",
            maker_key.as_ref(),
            taker_key.as_ref(),
            match_id.as_ref(),
            &[self.vault_state.bump],
        ]];
        let transfer_accounts = Transfer {
            from: self.vault_state.to_account_info(),
            to: self.winner.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(self.system_program.to_account_info(), transfer_accounts, signer_seeds) ;
        transfer(cpi_ctx , 2*self.vault_state.bet.checked_mul(LAMPORTS_PER_SOL).unwrap())?;
        Ok(())
    }
}
