import { AnchorProvider } from "@coral-xyz/anchor";
import connection from "./connection";
import wallet from "./wallet";

export const getProvider = () => {
  const { publicKey, signAllTransactions, signTransaction } = wallet();
  console.log(publicKey);
  if (!publicKey || !signTransaction || !signAllTransactions) return null;
  const provider = new AnchorProvider(
    connection,
    { publicKey, signTransaction, signAllTransactions } as any,
    { commitment: "confirmed" },
  );
  return provider;
};
