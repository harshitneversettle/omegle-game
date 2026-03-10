import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";

export function useBalance() {
  const connection = new Connection("https://api.devnet.solana.com");
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    (async () => {
      const balance = await connection.getBalance(publicKey!);
      setBalance(Number(balance) / LAMPORTS_PER_SOL);
    })();
  }, [publicKey]);

  return balance;
}
