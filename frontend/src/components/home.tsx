export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient blobs */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600 opacity-10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500 opacity-10 blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-violet-500 rounded-sm rotate-12" />
          <span className="font-bold tracking-tight text-sm uppercase">
            BlinkDuel
          </span>
        </div>
        <div className="flex items-center gap-8 text-sm text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">
            How it works
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Leaderboard
          </a>
          <button className="px-4 py-2 bg-white text-zinc-950 rounded-full text-xs font-bold hover:bg-zinc-200 transition-colors">
            Connect
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Live matches happening now
        </div>

        <h1
          className="text-6xl md:text-8xl font-black leading-none tracking-tight mb-6"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Stare down
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
            your opponent.
          </span>
        </h1>

        <p className="text-zinc-400 text-lg max-w-md mb-10 leading-relaxed">
          Real-time blink detection over WebRTC. First to blink loses. No
          downloads. Just your face and your will.
        </p>

        <div className="flex items-center gap-4">
          <button className="px-8 py-3 bg-violet-600 hover:bg-violet-500 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95">
            Find a match
          </button>
          <button className="px-8 py-3 border border-white/10 hover:border-white/30 rounded-full text-sm text-zinc-300 hover:text-white transition-all">
            Watch live
          </button>
        </div>
      </section>

      {/* Stats bar */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-3 divide-x divide-white/10 border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm">
          {[
            { value: "12ms", label: "Detection latency" },
            { value: "98%", label: "Accuracy" },
            { value: "3.2k", label: "Matches played" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center py-6 gap-1"
            >
              <span className="text-2xl font-black text-white">
                {stat.value}
              </span>
              <span className="text-xs text-zinc-500 uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-28">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-10 text-center">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Connect",
              desc: "Join a room. Your webcam stream goes peer-to-peer via WebRTC — no server sees your video.",
            },
            {
              step: "02",
              title: "Stare",
              desc: "Face detection runs locally on your device. EAR algorithm tracks your eye aspect ratio in real time.",
            },
            {
              step: "03",
              title: "Win",
              desc: "First blink detected loses. Results are instant. Rematches are one click away.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-6 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/6 transition-colors group"
            >
              <div className="text-5xl font-black text-white/10 group-hover:text-violet-500/30 transition-colors mb-4">
                {item.step}
              </div>
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 text-center pb-28 px-6">
        <div className="inline-block border border-white/10 rounded-3xl px-12 py-10 bg-white/3 backdrop-blur-sm">
          <p className="text-zinc-400 text-sm mb-2">Ready to compete?</p>
          <h2 className="text-3xl font-black mb-6">Don't blink.</h2>
          <button className="px-10 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full font-bold text-sm hover:opacity-90 transition-opacity hover:scale-105 active:scale-95 transform">
            Start a match
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-8 py-6 flex items-center justify-between text-xs text-zinc-600">
        <span>© 2025 BlinkDuel</span>
        <span>Built with WebRTC + face-api.js</span>
      </footer>
    </div>
  );
}
