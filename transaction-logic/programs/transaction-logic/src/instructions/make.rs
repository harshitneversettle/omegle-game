use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::state::escrow::Escrow;

#[derive(Accounts)]
#[instruction(unique_key : u64 )]
pub struct Make<'info> {

    #[account(mut)]
    pub maker : Signer<'info> ,

    pub mint_a : Account<'info , Mint> ,
    pub mint_b : Account<'info , Mint> ,
    #[account(
        mut ,
        associated_token::mint = mint_a,
        associated_token::authority = maker,
    )]
    pub maker_ata_a : Account<'info , TokenAccount> ,

    #[account(
        init , 
        payer = maker ,
        space = 8 + Escrow::INIT_SPACE ,
        seeds = [b"escrow" , maker.key().as_ref(), unique_key.to_le_bytes().as_ref() ] , 
        bump ,
    )]
    pub escrow_state : Account<'info , Escrow> ,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,       
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl <'info> Make<'info> {
    pub fn handle_make(&mut self, receive: u64, unique_num: u64, bumps: &MakeBumps ) -> Result<()>{
        self.escrow_state.set_inner(Escrow{
            maker : self.maker.key() ,
            mint_a : self.mint_a.key() ,
            mint_b : self.mint_b.key() ,
            receive ,
            unique_num ,
            bump : bumps.escrow_state , 
        });
        Ok(())
    }
}