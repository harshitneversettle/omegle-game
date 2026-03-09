import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Sender from "./components/sender";
import Receiver from "./components/receiver";
import Random from "./components/random";
import Test from "./components/test";
import Home from "./components/home";
import AboutProject from "./components/working";
import { clusterApiUrl } from "@solana/web3.js";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

function App() {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sender" element={<Sender />} />
              <Route path="/receiver" element={<Receiver />} />
              <Route path="/random" element={<Random />} />
              <Route path="/test" element={<Test />} />
              <Route path="/about-project" element={<AboutProject />} />
            </Routes>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
