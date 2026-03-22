import { getProvider, Program } from "@coral-xyz/anchor";
import idl from "../../../transaction-logic/target/idl/transaction_logic.json"

export const getProgram = () => {
  const provider = getProvider();
  if (!provider) return null;
  return new Program(idl as any, provider);
};
