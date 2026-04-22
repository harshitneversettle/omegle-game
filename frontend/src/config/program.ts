import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import connection from "./connection";
import idl from "../../../transaction-logic/target/idl/transaction_logic.json";

export const getProgram = (
  publicKey: PublicKey,
  signTransaction: any,
  signAllTransactions: any,
) => {
  const provider = new AnchorProvider(
    connection,
    { publicKey, signTransaction, signAllTransactions } as any,
    { commitment: "confirmed" },
  );
  return new Program(idl as any, provider);
};
