import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";

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

  function handlemessage() {
    if (!messageInput.current) return;
    // @ts-ignore
    console.log("array : ", allMessages);
    setAllMessages((prev) => [
      ...prev,
      // @ts-ignore
      { text: messageInput.current.value, sender: "me" },
    ]);
    socket?.send(
      JSON.stringify({
        type: "message",
        payload: {
          // @ts-ignore
          text: messageInput.current.value,
        },
      }),
    );
  }
  function distance(p1: any, p2: any) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  async function initFaceDetection() {
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
    if (
      viderRef.current &&
      faceLandmarkerRef.current &&
      viderRef.current.readyState === 4
    ) {
      const results = faceLandmarkerRef.current.detectForVideo(
        viderRef.current,
        Date.now(),
      );
      if (!socket) return;
      if (!results.faceLandmarks[0]) {
        alert("Face not detected");
        requestAnimationFrame(detect);
      }
      5173;
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
      }
      // if (results.faceLandmarks.length > 0) {
      //   console.log("Face detected");
      // }
    }
    requestAnimationFrame(detect);
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
          // console.log(pc.current);
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
  }, []);

  function closecall() {
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
                name=""
                id=""
                className="bg-gray-400 text-black rounded-full p-2 w-90"
                placeholder="llll"
              />
              <button
                onClick={handlemessage}
                className="bg-blue-600 p-2 rounded-full w-17 ml-2 border-1 hover:border-black hover:bg-blue-500"
              >
                send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
