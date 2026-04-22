use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub maker: Pubkey,
    pub taker: Pubkey,
    pub bet: u64,
    pub match_id: u64,
    pub bump: u8,
}