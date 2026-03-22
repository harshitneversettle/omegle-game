use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, TransferChecked};

use crate::state::escrow::Escrow;

#[derive(Accounts)]
#[instruction(amount: u64, unique_num: u64 )]
pub struct Make<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    pub mint_a: Account<'info, Mint>,
    pub mint_b: Account<'info, Mint>,
    #[account(
        init_if_needed ,
        payer = maker,
        associated_token::mint = mint_a,
        associated_token::authority = maker,
    )]
    pub maker_ata_a: Account<'info, TokenAccount>,
    #[account(
        init_if_needed ,
        payer = maker,
        associated_token::mint = mint_b,
        associated_token::authority = maker,
    )]
    pub maker_ata_b: Account<'info, TokenAccount>,
    #[account(
        init ,
        payer = maker ,
        space = 8 + Escrow::INIT_SPACE ,
        seeds = [b"escrow" , maker.key().as_ref(), unique_num.to_le_bytes().as_ref() ] , 
        bump ,
    )]
    pub escrow_state: Account<'info, Escrow>,

    #[account(
        init,
        payer = maker ,
        token::mint = mint_a ,
        token::authority = escrow_state ,
        seeds = [b"vault" , maker.key().as_ref()] ,
        bump ,
    )]
    pub vault: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> Make<'info> {
    pub fn handle_make(&mut self, amount: u64, unique_num: u64, bumps: &MakeBumps) -> Result<()> {
        self.escrow_state.set_inner(Escrow {
            maker: self.maker.key(),
            mint_a: self.mint_a.key(),
            mint_b: self.mint_b.key(),
            amount,
            unique_num,
            bump: bumps.escrow_state,
        });

        // maker_ata_a -> vault

        let transfer_accounts = TransferChecked {
            from: self.maker_ata_a.to_account_info(),
            mint: self.mint_a.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.maker.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(self.token_program.to_account_info(), transfer_accounts);
        token::transfer_checked(cpi_ctx, amount, self.mint_a.decimals)?;
        Ok(())
    }
}
