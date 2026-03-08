import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TransactionLogic } from "../target/types/transaction_logic";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import fs from "fs";
import {
  createMint,
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

  it("Is initialized!", async () => {
    const maker = user1;
    const taker = user2;
    const mint_a = await createMint(
      connection,
      maker,
      maker.publicKey,
      null,
      6,
    );

    // solana airdrop 10 7zJKWL1qBYYExf23hRrcojrWVZJcpEg4tSQNFmqJJFm9 && solana airdrop 10 mwcfgyGrw3N36bEVMZFJzWQkidk2hLjGAZmf2m91QWC

    const mint_b = await createMint(
      connection,
      taker,
      taker.publicKey,
      null,
      6,
    );

    const maker_ata_a = await getOrCreateAssociatedTokenAccount(
      connection,
      maker,
      mint_a,
      maker.publicKey,
    );
    await mintTo(
      connection,
      maker,
      mint_a,
      maker_ata_a.address,
      maker,
      1000 * 10 ** 6,
    );

    const unique_num = 1104;

    const [escrow_pda, bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        maker.publicKey.toBuffer(),
        new Uint8Array(new BigUint64Array([BigInt(unique_num)]).buffer),
      ],
      program.programId,
    );
    const receive = 10;
    const make_amaount = 10;
    const ix = await program.methods
      .make(new BN(receive), new BN(unique_num), new BN(make_amaount))
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
    console.log(escrow_data.receive);
  });
});
