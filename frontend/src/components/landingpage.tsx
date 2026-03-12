import { useGoogleLogin } from "@react-oauth/google";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {  useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  interface GoogleUser {
    email: string;
    name: string;
    firstname: string;
    picture: string;
    sub: number;
  }
  

  const [user, setUser] = useState<GoogleUser | null>(null);

  const handleGoogleSuccess = async (response: any) => {
    try {
      console.log(response);
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${response.access_token}` },
      });
      const userData = await res.json();
      console.log(userData);
      const useredata: GoogleUser = {
        name: userData.name,
        email: userData.email,
        firstname: userData.given_name,
        picture: userData.picture,
        sub: userData.sub,
      };
      setUser(useredata);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };
  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
  });
  return (
    <div
      className="min-h-screen bg-black text-white flex flex-col overflow-x-hidden"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&display=swap');`}</style>

      <nav className="flex items-center justify-between px-8 py-4 border-b border-zinc-900 bg-zinc-950">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
          <span className="ml-3 text-zinc-200 text-sm font-bold tracking-widest">
            DUEL.IO
          </span>
        </div>

        <div className="flex items-center gap-8 pr-2">
          <button
            onClick={() => navigate("/about-project")}
            className="px-4 py-2  text-lg text-zinc-200 transition-all"
          >
            about project
          </button>
          <button
            onClick={() => login()}
            className="text-lg text-zinc-300 hover:text-zinc-200 tracking-widest transition-colors"
          >
            {user ? `Welcome, ${user.firstname}!` : "sign in"}
          </button>
          <button
            onClick={() => {
              navigate("/random");
            }}
            className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-lg text-zinc-200 hover:bg-zinc-800 hover:border-zinc-500 transition-all"
          >
            get_started →
          </button>
          <WalletMultiButton
            style={{ backgroundColor: "#fbfcfb", color: "black" }}
          />
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center text-center px-6 py-32 gap-6 border-b border-zinc-900 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-950 text-md text-zinc-500 tracking-widest z-10">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          on Devnet now
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-zinc-100 leading-tight tracking-tight z-10">
          compete.
          <br />
          <span className="text-zinc-600">face to face.</span>
        </h1>
        <p className="text-zinc-500 text-md max-w-lg leading-relaxed tracking-wide z-10">
          connect with random peers , stake sols , challenge opponents live, in
          real-time. with no spectators.
        </p>
        <div className="flex gap-3 z-10">
          <button
            onClick={() => {
              window.location.href = "/random";
            }}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-100 text-black text-md font-bold rounded-xl hover:bg-white transition-all"
          >
            start competing <LuArrowRight size={14} />
          </button>
          <button
            onClick={() => {
              window.location.href = "/demo";
            }}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-950 border border-zinc-700 text-zinc-400 text-md rounded-xl hover:border-zinc-600 hover:text-white transition-all"
          >
            watch demo
          </button>
        </div>
      </section>

      <section className=" w-full gap-3 px-8 py-16 border-b border-zinc-900">
        <div className=" w-full flex gap-10 justify-center ">
          {[
            {
              dot: "bg-green-500",
              title: "Live Video Duels",
              desc: "Face your opponent in real-time with zero-latency peer-to-peer video.",
            },
            {
              dot: "bg-yellow-500",
              title: "Instant Matchmaking",
              desc: "Get paired with a opponent in under 10 seconds, chat and play.",
            },
            {
              dot: "bg-blue-500",
              title: "escrow-secured winnings",
              desc: "funds are locked in escrow before the match starts — released instantly to the winner, zero risk.",
            },
          ].map(({ dot, title, desc }) => (
            <div
              key={title}
              className="p-5 max-w-100 rounded-2xl bg-zinc-950 border border-zinc-900 flex flex-col gap-3 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                <span className="text-lg text-zinc-200 font-semibold tracking-wide">
                  {title}
                </span>
              </div>
              <p className="text-md text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-8 py-16 border-b border-zinc-900 flex flex-col items-center gap-12">
        <div className="w-full max-w-4xl rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950">
          <div className="w-full h-fit">
            <img src="/image.png" alt="" />
          </div>
        </div>
      </section>

      <section className="py-20 px-6 flex flex-col items-center text-center gap-5 border-b border-zinc-900 relative">
        <div className="absolute inset-0 pointer-events-none" />
        <h2 className="text-4xl font-bold text-zinc-100 z-10">
          your opponent is waiting.
        </h2>
        <p className="text-zinc-500 text-md max-w-md leading-relaxed z-10">
          join and challenge / earn .
        </p>
        <button className="z-10 flex items-center gap-2 px-8 py-3.5 bg-zinc-100 text-black text-sm font-bold rounded-xl hover:bg-white transition-all">
          create free account <LuArrowRight size={14} />
        </button>
      </section>

      <footer className="px-8 py-6 bg-zinc-950 flex items-center justify-between border-t border-zinc-900">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600" />
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="w-2 h-2 rounded-full bg-green-600" />
        </div>
      </footer>
    </div>
  );
}
