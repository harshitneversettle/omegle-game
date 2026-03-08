use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{self, Mint, Token, TokenAccount, TransferChecked}};

use crate::state::escrow::Escrow;

#[derive(Accounts)]
pub struct Take<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,
    pub mint_a: Account<'info, Mint>,
    pub mint_b: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = taker ,
        associated_token::mint=mint_b ,
        associated_token::authority=taker
    )]
    pub taker_ata_b: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = taker ,
        associated_token::mint=mint_a ,
        associated_token::authority=taker
    )]
    pub taker_ata_a: Account<'info, TokenAccount>,

    #[account(
        mut ,
        associated_token::mint=mint_a ,
        associated_token::authority = escrow_state.maker
    )]
    pub maker_ata_b : Account<'info , TokenAccount> ,
    #[account(
        mut ,
        seeds = [b"escrow" , escrow_state.maker.as_ref() , escrow_state.unique_num.to_le_bytes().as_ref() ] ,
        bump = escrow_state.bump ,
        has_one = mint_a ,
        has_one = mint_b ,
    )]
    pub escrow_state : Account<'info, Escrow>,

    #[account(
        mut ,
        seeds = [b"vault" , escrow_state.maker.as_ref()] ,
        bump ,
    )]
    pub vault : Account<'info , TokenAccount> ,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> Take<'info> {
    pub fn handle_take(&mut self , bumps : &TakeBumps) -> Result<()> {
        // phele vault se taker_ata_a
        let signer_seeds : &[&[&[u8]]] = &[&[
            b"escrow".as_ref() , 
            &self.escrow_state.maker.as_ref() ,
            &self.escrow_state.unique_num.to_le_bytes() ,
            &[self.escrow_state.bump],   
        ]] ;
        let transfer_accounts1 = TransferChecked{
            from : self.vault.to_account_info() ,
            mint : self.mint_a.to_account_info() ,
            to : self.taker_ata_a.to_account_info() ,
            authority : self.escrow_state.to_account_info()
        } ;
        let cpi_ctx1 = CpiContext::new_with_signer(self.token_program.to_account_info(), transfer_accounts1, signer_seeds);
        token::transfer_checked(cpi_ctx1, self.escrow_state.amount, 6)?;

        // fir taker_ata_b se maker_ata_b
        let transfer_accounts2 = TransferChecked{
            from : self.taker_ata_a.to_account_info() ,
            mint : self.mint_b.to_account_info() ,
            to : self.maker_ata_b.to_account_info() ,
            authority : self.taker.to_account_info()
        } ;
        let cpi_ctx2 = CpiContext::new(self.token_program.to_account_info(), transfer_accounts2);
        token::transfer_checked(cpi_ctx2, self.escrow_state.amount, 6)?;

        Ok(())
    }
}