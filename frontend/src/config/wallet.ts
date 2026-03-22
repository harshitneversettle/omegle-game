import { useWallet } from "@solana/wallet-adapter-react";

export default function wallet() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  return { publicKey, signTransaction, signAllTransactions };
}
