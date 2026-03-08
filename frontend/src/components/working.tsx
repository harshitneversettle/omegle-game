import { useNavigate } from "react-router-dom";

export default function AboutProject() {
  const steps = [
    {
      num: "01",
      title: "Connect",
      desc: "Two players matched via WebRTC peer-to-peer — direct browser to browser, zero media touches any server.",
    },
    {
      num: "02",
      title: "Negotiate",
      desc: "Players chat and agree on a stake amount via in-call end-to-end encrypted messaging.",
    },
    {
      num: "03",
      title: "Escrow",
      desc: "Both players lock SOL into an on-chain escrow contract. Once triggered, immutable — no one can reverse it.",
    },
    {
      num: "04",
      title: "Compete",
      desc: "Staring contest begins. Blink detection runs locally. First to blink loses. Contract executes instantly.",
    },
    {
      num: "05",
      title: "Call Ends",
      desc: "Room destroyed. All messages permanently deleted. No logs, no recordings, no history. Ever.",
    },
  ];

  const stack = [
    {
      dot: "bg-green-500",
      layer: "Video",
      tech: "WebRTC — P2P, no relay server",
    },
    {
      dot: "bg-blue-500",
      layer: "Realtime Chat",
      tech: "Socket.io — end-to-end encrypted",
    },
    {
      dot: "bg-yellow-500",
      layer: "Room State",
      tech: "Redis — roomId → player mapping",
    },
    {
      dot: "bg-purple-500",
      layer: "Blockchain",
      tech: "Solana — ~400ms finality",
    },
    { dot: "bg-red-500", layer: "Escrow", tech: "On-chain Solana program" },
  ];

  const props = [
    {
      dot: "bg-green-500",
      title: "Non-custodial",
      desc: "Platform never holds your funds. The escrow contract does.",
    },
    {
      dot: "bg-blue-500",
      title: "Ephemeral",
      desc: "No message history, no recordings, no logs.",
    },
    {
      dot: "bg-yellow-500",
      title: "Private",
      desc: "P2P video — zero data touches Nano Banana servers.",
    },
    {
      dot: "bg-red-500",
      title: "Trustless",
      desc: "Escrow executes on-chain. Code decides, not humans.",
    },
    {
      dot: "bg-purple-500",
      title: "Fast",
      desc: "Solana settles in under a second.",
    },
  ];
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen bg-black text-white flex flex-col overflow-x-hidden"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&display=swap');`}</style>

      <nav className="flex items-center justify-between px-8 py-4 border-b border-zinc-900 bg-zinc-950 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/demo")}
            className="px-4 py-2 text-lg text-zinc-400  border-zinc-700 tracking-widest"
          >
            Demo
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-lg text-zinc-200 hover:bg-zinc-800 transition-all"
          >
            landing page
          </button>
        </div>
      </nav>

      <section
        className="flex flex-col items-center justify-center text-center px-6 py-28 border-b border-zinc-900 relative"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <h1 className="text-5xl md:text-7xl font-bold text-zinc-100 leading-tight tracking-tight mb-4">
          stake SOL.
          <br />
          <span className="text-zinc-600">don't blink.</span>
        </h1>
        <p className="text-zinc-500 text-md max-w-lg leading-relaxed mt-4">
          a peer-to-peer staking arena — stake SOL, lock eyes, and the last one
          to blink takes the pot. secured by solana. witnessed by no one.
        </p>
      </section>

      <section className="px-8 py-16 border-b border-zinc-900 max-w-5xl mx-auto w-full">
        <p className="text-lg text-zinc-600 tracking-widest mb-2">
          what it actually is ??
        </p>
        <h2 className="text-3xl font-bold text-zinc-100 mb-4">
          a trustless 1v1 staking game
        </h2>
        <p className="text-zinc-500 text-md leading-relaxed max-w-2xl">
          _____ is a real-time 1v1 staking game where two players connect over
          live video, negotiate a stake in SOL, lock funds into an on-chain
          escrow, and compete in the oldest game known to man — a staring
          contest. whoever blinks first loses everything they staked. no judges.
          no third parties. just you, your opponent, and the blockchain.
        </p>
      </section>

      <section className="px-8 py-16 border-b border-zinc-900 max-w-5xl mx-auto w-full">
        <p className="text-lg text-zinc-600 tracking-widest mb-2">
          how it works
        </p>
        <h2 className="text-2xl font-bold text-zinc-100 mb-8">
          five steps to losing your SOL
        </h2>
        <div className="flex flex-col gap-3">
          {steps.map(({ num, title, desc }) => (
            <div
              key={num}
              className="flex items-start gap-6 p-5 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all"
            >
              <span className="text-3xl font-bold text-zinc-800 shrink-0 w-10">
                {num}
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold text-zinc-200 tracking-wide">
                  {title}
                </span>
                <span className="text-md text-zinc-500 leading-relaxed">
                  {desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-8 py-16 border-b border-zinc-900 max-w-5xl mx-auto w-full">
        <p className="text-lg text-zinc-600 tracking-widest mb-2">
          how connection is made
        </p>
        <h2 className="text-2xl font-bold text-zinc-100 mb-8">
          Diagram to demonstrate connection formation
        </h2>
        <div className="flex flex-col gap-3">
          <img src="/connection_diagram.png" alt="" />
        </div>
      </section>

      <section className="px-8 py-16 border-b border-zinc-900 max-w-5xl mx-auto w-full">
        <p className="text-lg text-zinc-600 tracking-widest mb-2">tech stack</p>
        <h2 className="text-2xl font-bold text-zinc-100 mb-8">
          what's under the hood
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {stack.map(({ dot, layer, tech }) => (
            <div
              key={layer}
              className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                <span className="text-md text-zinc-500 tracking-widest uppercase">
                  {layer}
                </span>
              </div>
              <span className="text-sm text-zinc-200">{tech}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-8 py-16 border-b border-zinc-900 max-w-5xl mx-auto w-full">
        <p className="text-lg text-zinc-600 tracking-widest mb-2">
          key properties
        </p>
        <h2 className="text-2xl font-bold text-zinc-100 mb-8">
          why it's different
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {props.map(({ dot, title, desc }) => (
            <div
              key={title}
              className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all flex flex-col gap-2"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                <span className="text-md font-semibold text-zinc-200">
                  {title}
                </span>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 flex flex-col items-center text-center gap-5 max-w-5xl mx-auto w-full">
        <h2 className="text-4xl font-bold text-zinc-100">
          ready to not blink?
        </h2>
        <p className="text-zinc-600 text-md max-w-sm leading-relaxed">
          stake SOL, don't blink, take the sol.
        </p>
        <button
          onClick={() => navigate("/random")}
          className="flex items-center gap-2 px-8 py-3.5 bg-zinc-100 text-black text-sm font-bold rounded-xl hover:bg-white transition-all"
        >
          start competing
        </button>
      </section>

      <footer className="px-8 py-5 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600" />
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="w-2 h-2 rounded-full bg-green-600" />
        </div>
      </footer>
    </div>
  );
}
