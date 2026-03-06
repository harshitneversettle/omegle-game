import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
import blinkDectection from "../handlers/blinking_logic";

export default function Random() {
  //   const ws = new WebSocket("ws://localhost:8080");
  interface message {
    text: string;
    sender: "me" | "peer";
  }
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const viderRef = useRef<HTMLVideoElement | null>(null);
  const selfviderRef = useRef<HTMLVideoElement | null>(null);
  // const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const [allMessages, setAllMessages] = useState<message[]>([]);
  const messageInput = useRef(null);

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
    async function selfcam() {
      const stream2 = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (!selfviderRef.current) return;
      selfviderRef.current.srcObject = stream2;
    }
    selfcam();
  }, []);
  useEffect(() => {
    let ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "random",
          name: "harshit",
        }),
      );
      setSocket(ws);

      ws.onmessage = async (msg) => {
        const message = JSON.parse(msg.data);
        if (message.type == "create-offer") {
          // create offer mtlb offer banana hai
          pc.current = new RTCPeerConnection();
          let stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          pc.current.addTrack(stream.getVideoTracks()[0]);
          pc.current.ontrack = (stream) => {
            if (viderRef.current) {
              viderRef.current.srcObject = new MediaStream([stream.track]);
            }
          };
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
          const offer = await pc.current.createOffer();
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
          let stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          pc.current.addTrack(stream.getVideoTracks()[0]);

          pc.current.ontrack = (stream) => {
            if (viderRef.current) {
              viderRef.current.srcObject = new MediaStream([stream.track]);
            }
          };
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
        } else if (message.type == "answer") {
          if (!pc.current) return;
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
          await pc.current.setRemoteDescription(message.sdp);
        } else if (message.type === "ice-candidates") {
          await pc.current?.addIceCandidate(message.candidate);
        } else if (message.type == "message") {
          console.log(allMessages);
          const text = message.payload.text;
          setAllMessages((prev) => [...prev, { text: text, sender: "peer" }]);
        }
      };
    };
    // initFaceDetection();
    //@ts-ignore
    // blinkDectection(socket!, viderRef);
  }, []);

  function closecall() {
    if (!socket) return;
    socket.send(
      JSON.stringify({
        type: "close",
      }),
    );
    pc.current?.close();
  }
  return (
    <>
      <div className=" h-screen flex gap-50 mt-10 justify-center   ">
        <div className="flex flex-col ml-25 ">
          partner's cam :{" "}
          <video
            ref={viderRef}
            autoPlay
            playsInline
            className="w-100 h-100"
          ></video>
          self cam :{" "}
          <video
            ref={selfviderRef}
            autoPlay
            playsInline
            className="w-100 h-100"
          ></video>
          <button
            className="bg-red-600 w-60  mt-4 mx-auto p-1 text-white rounded-full border-1 border-black hover:bg-red-400 "
            onClick={closecall}
          >
            close call
          </button>
        </div>
        <div className="">
          <div className="w-100 h-200 bg-zinc-900 border-2 border-gray-5 rounded-xl flex flex-col justify-between ">
            <div className="flex flex-col">
              <div className="m-3">
                {allMessages.map((i, index) => {
                  return (
                    <div
                      key={index}
                      className={` max-w-fit p-2  mt-3 rounded-2xl  break-words ${i.sender === "me" ? "bg-green-900 ml-auto rounded-br-none " : "bg-blue-900 rounded-bl-none"} `}
                    >
                      {i.text}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex p-2">
              <input
                ref={messageInput}
                type="text"
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    e.preventDefault();
                    handlemessage();
                  }
                }}
                name=""
                id=""
                className="bg-gray-400 text-black rounded-full p-2 w-90"
                placeholder="llll"
              />
              <button
                onClick={handlemessage}
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    e.preventDefault();
                    handlemessage();
                  }
                }}
                className="bg-blue-600 p-2 rounded-full w-17 ml-2 border-1 hover:border-black hover:bg-blue-500"
              >
                send lode
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
