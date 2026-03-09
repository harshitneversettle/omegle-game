import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TransactionLogic } from "../target/types/transaction_logic";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import fs from "fs";
import {
  createMint,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { BN } from "bn.js";

describe("transaction-logic", () => {
  const provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);
  const connection = provider.connection;

  const program = anchor.workspace
    .transactionLogic as Program<TransactionLogic>;

  const user1 = Keypair.fromSecretKey(
    Uint8Array.from(
      JSON.parse(
        fs.readFileSync(
          "/home/titan/Desktop/webRTC/transaction-logic/maker.json",
          "utf8",
        ),
      ),
    ),
  );
  const user2 = Keypair.fromSecretKey(
    Uint8Array.from(
      JSON.parse(
        fs.readFileSync(
          "/home/titan/Desktop/webRTC/transaction-logic/taker.json",
          "utf8",
        ),
      ),
    ),
  );
  const maker = user1;
  const taker = user2;
  let mint_a;
  let mint_b;
  let maker_ata_a;
  let maker_ata_b;
  let taker_ata_a;
  let taker_ata_b;
  let escrow_pda;
  let bump;
  const unique_num = 1104;
  const amount = 10 * 10 ** 6; // means 10 tokens

  before("", async () => {
    mint_a = await createMint(connection, maker, maker.publicKey, null, 6);
    mint_b = await createMint(connection, taker, taker.publicKey, null, 6);
    maker_ata_a = await getOrCreateAssociatedTokenAccount(
      connection,
      maker,
      mint_a,
      maker.publicKey,
    );
    maker_ata_b = await getOrCreateAssociatedTokenAccount(
      connection,
      maker,
      mint_b,
      maker.publicKey,
    );
    taker_ata_a = await getOrCreateAssociatedTokenAccount(
      connection,
      taker,
      mint_a,
      taker.publicKey,
    );
    taker_ata_b = await getOrCreateAssociatedTokenAccount(
      connection,
      taker,
      mint_b,
      taker.publicKey,
    );
    await mintTo(
      connection,
      maker,
      mint_a,
      maker_ata_a.address,
      maker,
      100 * 10 ** 6,
    );
    await mintTo(
      connection,
      maker,
      mint_b,
      maker_ata_b.address,
      taker,
      100 * 10 ** 6,
    );
    await mintTo(
      connection,
      taker,
      mint_a,
      taker_ata_a.address,
      maker,
      100 * 10 ** 6,
    );
    await mintTo(
      connection,
      taker,
      mint_b,
      taker_ata_b.address,
      taker,
      100 * 10 ** 6,
    );
    [escrow_pda, bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        maker.publicKey.toBuffer(),
        new Uint8Array(new BigUint64Array([BigInt(unique_num)]).buffer),
      ],
      program.programId,
    );
  });

  it("testing make ", async () => {
    // solana airdrop 10 7zJKWL1qBYYExf23hRrcojrWVZJcpEg4tSQNFmqJJFm9 && solana airdrop 10 mwcfgyGrw3N36bEVMZFJzWQkidk2hLjGAZmf2m91QWC

    const ix = await program.methods
      .make(new BN(amount), new BN(unique_num))
      .accounts({
        maker: maker.publicKey,
        mintA: mint_a,
        mintB: mint_b,
        makerAtaA: maker_ata_a.address,
        escrowState: escrow_pda,
      })
      .signers([maker])
      .rpc();
    console.log(ix);
    const escrow_data = await program.account.escrow.fetch(escrow_pda);
    console.log(escrow_data.maker.toString());
    console.log(maker.publicKey.toString());
    console.log(escrow_data.mintA.toString());
    console.log(mint_a.toString());
    console.log(escrow_data.mintB.toString());
    console.log(mint_b.toString());
    console.log(escrow_data.amount);
  });

  it("testing take", async () => {
    const escrow_data = await program.account.escrow.fetch(escrow_pda);
    console.log("ye hai escrow data", escrow_data);
    let maker_escrow = escrow_data.maker;
    let [vault_pda, bump_vault] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), maker_escrow.toBuffer()],
      program.programId,
    );
    let vault_balance = (await getAccount(connection, vault_pda)).amount;
    console.log("before vault balance ", Number(vault_balance) / 10 ** 6);
    const ix = await program.methods
      .take(new BN(unique_num))
      .accounts({
        taker: taker.publicKey,
        maker: maker_escrow,
        mintA: mint_a,
        mintB: mint_b,
        takerAtaA: taker_ata_a.address,
        takerAtaB: taker_ata_b.address,
        makerAtaB: maker_ata_b.address,
        escrowState: escrow_pda,
        vault: vault_pda,
      })
      .signers([taker])
      .rpc();

    console.log(ix);

    vault_balance = (await getAccount(connection, vault_pda)).amount;
    console.log("after vault balance ", Number(vault_balance) / 10 ** 6);
  });

  it("testing refund", async () => {
    const escrow_data = await program.account.escrow.fetch(escrow_pda);
    // console.log("ye hai escrow data", escrow_data);
    let maker_escrow = escrow_data.maker;
    let [vault_pda, bump_vault] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), maker_escrow.toBuffer()],
      program.programId,
    );
    let vault_balance = (await getAccount(connection, vault_pda)).amount;
    console.log("vault balance before", Number(vault_balance) / 10 ** 6);

    const ix = await program.methods
      .take(new BN(unique_num))
      .accounts({
        maker: maker,
        mintA: mint_a,
        mintB: mint_b,
        makerAtaA: maker_ata_a.address,
        escrowState: escrow_pda,
        vault: vault_pda,
      })
      .signers([maker])
      .rpc();

    console.log(ix);
    vault_balance = (await getAccount(connection, vault_pda)).amount;
    console.log("vault balance after", Number(vault_balance) / 10 ** 6);
    console.log();
  });
});
