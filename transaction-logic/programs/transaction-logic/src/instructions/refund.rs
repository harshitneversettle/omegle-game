use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, TransferChecked},
};

use crate::state::escrow::Escrow;

#[derive(Accounts)]
#[instruction(unique_num : u64)]
pub struct Refund<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    pub mint_a: Account<'info, Mint>,
    pub mint_b: Account<'info, Mint>,

    #[account(
        mut ,
        associated_token::mint = mint_a ,
        associated_token::authority = maker ,
    )]
    pub maker_ata_a: Account<'info, TokenAccount>,

    #[account(
        mut ,
        seeds = [b"vault" , maker.key().as_ref()] ,
        bump ,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut ,
        seeds = [b"escrow" , maker.key().as_ref(), unique_num.to_le_bytes().as_ref() ] , 
        bump ,
        has_one = mint_a ,
        has_one = mint_b ,
        has_one = maker ,
    )]
    pub escrow_state: Account<'info, Escrow>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> Refund<'info> {
    pub fn handle_refund(&mut self, unique_num: u64, bumps: &RefundBumps) -> Result<()> {
        // refund mtlb vault -> maker_ata_a

        let signer_seeds: &[&[&[u8]]] = &[&[
            b"escrow".as_ref(),
            self.escrow_state.maker.as_ref(),
            &self.escrow_state.unique_num.to_le_bytes(),
            &[self.escrow_state.bump],
        ]];

        let transfer_accounts = TransferChecked {
            from: self.vault.to_account_info(),
            to: self.maker_ata_a.to_account_info(),
            mint: self.mint_a.to_account_info(),
            authority: self.escrow_state.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            transfer_accounts,
            signer_seeds,
        );
        token::transfer_checked(cpi_ctx, self.escrow_state.amount, self.mint_a.decimals)?;
        Ok(())
    }
}
