import { LuPhone } from "react-icons/lu";
import { useBalance } from "../hooks/getBalance";
import { useFaceDetection } from "../hooks/faceDetection";
import { useHandleMessage } from "../hooks/handleMessage";
import { useCloseCall } from "../hooks/closeCall";
import { useInitProcess } from "../hooks/initProcess";
import { useEffect, useRef, useState } from "react";
interface message {
  text: string;
  sender: "me" | "peer";
}
export default function Random() {
  const [allMessages, setAllMessages] = useState<message[]>([]);
  const messageInput = useRef<HTMLInputElement>(null);
  const [pipSmall, setPipSmall] = useState(false);
  const betRef = useRef<HTMLInputElement | null>(null);
  const [bet, setBet] = useState(0);
  const { pc, socket, selfviderRef, viderRef, connected } =
    useInitProcess(setAllMessages , setBet);
  const [noti, setNoti] = useState(false);
  const balance = useBalance();
  const { startCompetition, stopCompetition } = useFaceDetection(
    socket,
    //@ts-ignore
    viderRef,
  );
  const { handlemessage } = useHandleMessage(
    socket,
    //@ts-ignore
    setAllMessages,
    messageInput,
  );
  const { closecall } = useCloseCall(socket, pc);

  function handleBet() {
    if (!socket) return;
    setNoti(true);
    socket?.send(
      JSON.stringify({
        type: "bet-is-set",
        amount: betRef.current?.value,
      }),
    );
    setTimeout(() => {
      setNoti(false);
    }, 2000);
    setBet(Number(betRef.current?.value));
    if (!betRef.current) return;
    betRef.current.value = "";
  }

  function clearChat() {
    setAllMessages([]);
  }

  useEffect(() => {
    if (connected) {
      setTimeout(() => setPipSmall(true), 500);
    } else {
      setPipSmall(false);
    }
  }, [connected]);

  return (
    <>
      <div className="w-screen h-screen bg-black flex flex-col overflow-hidden">
        <div className="pl-7 pr-14 flex items-center justify-between h-18 px-5 py-3 border-b border-zinc-900 bg-zinc-950">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-600" />
            </div>
            <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-md font-mono tracking-widest">
              curr balance : {balance.toFixed(4)} Sols
            </div>
            <div
              className={`flex items-center gap-2.5 px-3 py-3 rounded-xl bg-zinc-950 border ${
                noti
                  ? "border-yellow-400 border-3 duration-200 ease-linear"
                  : "border-zinc-800 border duration-200"
              } text-zinc-300 text-md font-mono tracking-widest`}
            >
              curr Bet : {bet} Sols
            </div>
          </div>
          <div className="flex gap-8 ">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full border font-mono text-lg ${
                connected ? "border-green-800 " : "border-red-900 "
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-green-500" : "bg-red-600"}`}
              />
              {connected ? "connected" : "disconnected"}
            </div>
          </div>
        </div>

        <div className="flex flex-1 gap-4 p-4 overflow-hidden min-h-0">
          <div className="flex-1 min-w-250  relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-900 min-h-0">
            <video
              ref={viderRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            <div
              className={`absolute transition-all duration-800 ease-in-out rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800  ${
                pipSmall
                  ? "bottom-4 right-4 w-60 h-48"
                  : "inset-0 w-full h-full rounded-2xl"
              }`}
            >
              <video
                ref={selfviderRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col w-50 items-center justify-between gap-3 w-36 shrink-0 pb-100 pt-65 ">
            <div className="flex flex-col  gap-4 justify-center items-center">
              <input
                type="number"
                ref={betRef}
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    e.preventDefault();
                    handleBet();
                  }
                }}
                className="w-full px-3 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-md  hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-900 text-white transition-all duration-150 font-mono tracking-widest"
                placeholder="Enter amount"
              />
              <button
                onClick={handleBet}
                className="w-fit p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-md font-mono hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-900 transition-all duration-150"
              >
                Bet
              </button>
            </div>
            <div className="flex flex-col w-full items-center justify-center gap-3">
              <button
                onClick={startCompetition}
                className="group w-full flex items-center gap-2.5 px-3 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-md font-mono hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-900 transition-all duration-150"
              >
                <span className="w-2 h-2 rounded-full  bg-green-500 shrink-0" />
                Start competing
              </button>

              <button
                onClick={stopCompetition}
                className="group w-full flex items-center gap-2.5 px-3 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-md font-mono hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-900 transition-all duration-150"
              >
                <span className="w-2 h-2 rounded-full  bg-yellow-500 transition-colors shrink-0" />
                stop
              </button>

              <button
                onClick={closecall}
                className=" w-full flex items-center  gap-2.5 px-3 py-3 rounded-xl bg-zinc-950 border-2 border-red-900 text-zinc-300 text-md font-mono hover:bg-red-950/30 hover:border-red-900/60 hover:text-red-500 transition-all duration-150"
              >
                <LuPhone />
                end chat
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col gro shrink-0 bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden min-h-0">
            <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-zinc-900 bg-black shrink-0">
              <div className="flex items-center gap-3 justify-center">
                <div className="w-3 h-3 items-center rounded-full bg-green-600" />
                Chat with your opponent
              </div>
              <div className="">
                <button
                  onClick={clearChat}
                  className="bg-zinc-800 hover:bg-zinc-500 p-2 rounded-full transition-all duration-150"
                >
                  clear chat
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 min-h-0">
              {allMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`w-fit max-w-xs px-3.5 py-2 text-lg rounded-2xl break-words border-2 border-black ${
                    msg.sender === "me"
                      ? "bg-green-700 text-white ml-auto rounded-br-sm"
                      : "bg-blue-700 text-white rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="flex gap-2 p-3 border-t border-zinc-900 bg-black/20 shrink-0">
              <input
                ref={messageInput}
                type="text"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handlemessage();
                  }
                }}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-lg text-zinc-200 placeholder:text-zinc-400 transition-colors"
                placeholder="type here"
              />
              <button
                onClick={handlemessage}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl hover:bg-zinc-700 hover:text-white transition-all duration-150"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
