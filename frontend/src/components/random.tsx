import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
import { LuPhone, LuVideo } from "react-icons/lu";

export default function Random() {
  //   const ws = new WebSocket("ws://localhost:8080");
  interface message {
    text: string;
    sender: "me" | "peer";
  }
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const viderRef = useRef<HTMLVideoElement | null>(null);
  const selfviderRef = useRef<HTMLVideoElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const [allMessages, setAllMessages] = useState<message[]>([]);
  const messageInput = useRef(null);
  const stream = useRef<MediaStream | null>(null);
  const [connected, setConnected] = useState(false);
  const competition_stat = useRef("paused");
  const [pipSmall, setPipSmall] = useState(false);

  function distance(p1: any, p2: any) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function startCompetition() {
    competition_stat.current = "start";
    initFaceDetection();
  }
  function stopCompetition() {
    competition_stat.current = "stop";
  }
  async function initFaceDetection() {
    if (competition_stat.current !== "start") return;
    console.log("Initializing face detection..");
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm",
    );

    const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      },
      runningMode: "VIDEO",
    });

    faceLandmarkerRef.current = faceLandmarker;

    detect();
  }
  function detect() {
    if (competition_stat.current !== "start") return;
    if (
      viderRef &&
      faceLandmarkerRef.current &&
      viderRef.current!.readyState === 4
    ) {
      const results = faceLandmarkerRef.current.detectForVideo(
        viderRef.current!,
        Date.now(),
      );
      if (!socket) return;
      if (!results.faceLandmarks[0]) {
        alert("Face not detected");
        requestAnimationFrame(detect);
      }
      if (!results.faceLandmarks.length) return;
      const landmarks = results.faceLandmarks[0];
      const p1_left = landmarks[33] || null;
      const p2_left = landmarks[160] || null;
      const p3_left = landmarks[158] || null;
      const p4_left = landmarks[133] || null;
      const p5_left = landmarks[153] || null;
      const p6_left = landmarks[144] || null;

      if (
        !p1_left ||
        !p2_left ||
        !p3_left ||
        !p4_left ||
        !p5_left ||
        !p6_left
      ) {
        alert("Eyes are not visible");
      }
      const p1_right = landmarks[362] || null;
      const p2_right = landmarks[385] || null;
      const p3_right = landmarks[387] || null;
      const p4_right = landmarks[263] || null;
      const p5_right = landmarks[373] || null;
      const p6_right = landmarks[380] || null;
      if (
        !p1_right ||
        !p2_right ||
        !p3_right ||
        !p4_right ||
        !p5_right ||
        !p6_right
      ) {
        alert("Eyes are not visible");
      }
      const vertical1_left = distance(p2_left, p6_left);
      const vertical2_left = distance(p3_left, p5_left);
      const horizontal_left = distance(p1_left, p4_left);

      const vertical1_right = distance(p2_right, p6_right);
      const vertical2_right = distance(p3_right, p5_right);
      const horizontal_right = distance(p1_right, p4_right);

      const EAR_left =
        (vertical1_left + vertical2_left) / (2 * horizontal_left); // on blinking , verticle distance is 0 but horizontal is always the same
      const EAR_right =
        (vertical1_right + vertical2_right) / (2 * horizontal_right);

      // console.log("EAR left ", EAR_left);
      // console.log("EAR right ", EAR_right);
      //  0.3001998922706451;

      // open left = 0.33    open right = 0.36

      if (EAR_left < 0.28 || EAR_right < 0.28) {
        alert("Blink detected");
        initFaceDetection();
      }
      // if (results.faceLandmarks.length > 0) {
      //   console.log("Face detected");
      // }
    }
    requestAnimationFrame(detect);
  }

  function clearChat() {
    setAllMessages([]);
  }

  function handlemessage() {
    if (!messageInput.current) return;
    // @ts-ignore
    const text = messageInput.current.value;
    setAllMessages((prev) => [
      ...prev,
      // @ts-ignore
      { text: text, sender: "me" },
    ]);
    socket?.send(
      JSON.stringify({
        type: "message",
        payload: {
          // @ts-ignore
          text: text,
        },
      }),
    );
    // @ts-ignore
    messageInput.current.value = "";
  }

  let pc = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (connected) {
      setTimeout(() => setPipSmall(true), 500);
    } else {
      setPipSmall(false);
    }
  }, [connected]);

  useEffect(() => {
    async function initprocess() {
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      // guard for checking that stream is there or not because camera access me thodi der lag skti hai
      if (selfviderRef.current) {
        selfviderRef.current.srcObject = stream.current;
      }

      let ws = new WebSocket("ws://localhost:8080");
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: "new-connection",
            username: "harshit",
            arriving_time: Date.now(),
          }),
        );
        setSocket(ws);
      };

      ws.onmessage = async (msg) => {
        const message = JSON.parse(msg.data);
        if (message.type == "create-offer") {
          // create offer mtlb offer banana hai
          if (!stream.current) {
            console.error("Camera not ready yet");
            return;
          }
          pc.current = new RTCPeerConnection();

          // always set ontrack before addtrack
          pc.current.ontrack = (event) => {
            if (viderRef.current && event.streams[0]) {
              viderRef.current.srcObject = event.streams[0];
            }
          };
          pc.current.addTrack(
            stream.current!.getVideoTracks()[0],
            stream.current!,
          );
          const offer = await pc.current.createOffer();
          pc.current.onicecandidate = (msg) => {
            if (msg.candidate) {
              ws.send(
                JSON.stringify({
                  type: "add-ice-candidates",
                  candidate: msg.candidate,
                }),
              );
            }
          };
          await pc.current.setLocalDescription(offer);
          ws?.send(
            JSON.stringify({
              type: "offer",
              sdp: offer,
            }),
          );
        } else if (message.type == "offer") {
          // offer aaya hai , uske liye ans banana hai
          pc.current = new RTCPeerConnection();
          // always set ontrack before addtrack
          pc.current.ontrack = (event) => {
            if (viderRef.current && event.streams[0]) {
              viderRef.current.srcObject = event.streams[0];
            }
          };
          pc.current.addTrack(
            stream.current!.getVideoTracks()[0],
            stream.current!,
          );
          // ans banane se phele remote description set krna padha hai mandatory step hai
          await pc.current.setRemoteDescription(message.sdp);
          const answer = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answer);
          ws.send(
            JSON.stringify({
              type: "answer",
              sdp: answer,
            }),
          );
          pc.current.onicecandidate = (msg) => {
            const connectionState = pc.current?.iceConnectionState;
            if (connectionState === "connected") setConnected(true);
            if (msg.candidate) {
              ws.send(
                JSON.stringify({
                  type: "add-ice-candidates",
                  candidate: msg.candidate,
                }),
              );
            }
          };
        } else if (message.type == "answer") {
          if (!pc.current) return;
          pc.current.onicecandidate = (msg) => {
            const connectionState = pc.current?.iceConnectionState;
            if (connectionState === "connected") setConnected(true);
            console.log(connectionState);
            if (msg.candidate) {
              ws.send(
                JSON.stringify({
                  type: "add-ice-candidates",
                  candidate: msg.candidate,
                }),
              );
            }
          };
          await pc.current.setRemoteDescription(message.sdp);
        } else if (message.type === "ice-candidates") {
          await pc.current?.addIceCandidate(message.candidate);
        } else if (message.type == "message") {
          console.log(allMessages);
          const text = message.payload.text;
          setAllMessages((prev) => [...prev, { text: text, sender: "peer" }]);
        } else if (message.type == "closed-connection") {
          setConnected(false);
        }
      };
    }

    initprocess();
    // initFaceDetection();
  }, []);

  function closecall() {
    if (!socket) return;
    socket.send(
      JSON.stringify({
        type: "close",
      }),
    );
    pc.current?.close();
    pc.current?.close();
    socket.close();
    socket?.send(
      JSON.stringify({
        type: "connection-closed",
      }),
    );
  }
  return (
    <>
      <div className="w-screen h-screen bg-black flex flex-col overflow-hidden">
        <div className="pl-7 pr-14 flex items-center justify-between h-18 px-5 py-3 border-b border-zinc-900 bg-zinc-950">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-600" />
          </div>

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

          <div className="flex flex-col w-50 items-center justify-center gap-3 w-36 shrink-0">
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

            <button className="group w-full flex items-center gap-2.5 px-3 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-md font-mono hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-900 transition-all duration-150">
              <span className="w-2 h-2 rounded-full bg-blue-500 transition-colors shrink-0" />
              mute
            </button>

            <button
              onClick={closecall}
              className=" w-full flex items-center  gap-2.5 px-3 py-3 rounded-xl bg-zinc-950 border-2 border-red-900 text-zinc-300 text-md font-mono hover:bg-red-950/30 hover:border-red-900/60 hover:text-red-500 transition-all duration-150"
            >
              <LuPhone />
              end chat
            </button>
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
