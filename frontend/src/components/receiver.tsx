import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useEffect, useRef } from "react";

export default function Receiver() {
  // this time receiver should ans only

  const receiverSocket = useRef<WebSocket | null>(null);
  let pc = useRef<RTCPeerConnection>(null);
  const videoref = useRef<HTMLVideoElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  let face_not_dectected_count = 0;

  function distance(p1: any, p2: any) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  useEffect(() => {
    let ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "receiver",
        }),
      );
      receiverSocket.current = ws;
    };

    ws.onmessage = async (msg) => {
      const message = JSON.parse(msg.data);

      if (message.type === "offer") {
        pc.current = new RTCPeerConnection();
        // Set the ontrack handler immediately after creating the RTCPeerConnection
        // track milega toh ye fire hoga

        if (!pc.current) return;
        pc.current.onicecandidate = (msg) => {
          if (msg.candidate) {
            receiverSocket.current?.send(
              JSON.stringify({
                type: "add-ice-candidates",
                candidate: msg.candidate,
              }),
            );
          }
        };
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        pc.current.addTrack(stream.getVideoTracks()[0]);

        pc.current.ontrack = (event) => {
          // console.log(pc);
          if (videoref.current) {
            videoref.current.srcObject = new MediaStream([event.track]);
          }
        };
        // ans banane se phele remote description set krna padha hai mandatory step hai
        await pc.current.setRemoteDescription(message.sdp);
        let answer = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answer);
        ws?.send(
          JSON.stringify({
            type: "create-answer",
            sdp: pc.current.localDescription,
          }),
        );
      } else if (message.type === "ice-candidates") {
        pc.current?.addIceCandidate(message.candidate);
      }
    };

    async function initFaceDetection() {
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
        videoref.current &&
        faceLandmarkerRef.current &&
        videoref.current.readyState === 4
      ) {
        const results = faceLandmarkerRef.current.detectForVideo(
          videoref.current,
          Date.now(),
        );
        if (!receiverSocket.current) return;
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

        if (EAR_left < 0.18 || EAR_right < 0.18) {
          alert("Blink detected");
        }
        if (results.faceLandmarks.length > 0) {
          console.log("Face detected");
        }
      }

      requestAnimationFrame(detect);
    }

    initFaceDetection();
  }, []);

  return (
    <>
      receiver
      <video
        ref={videoref}
        autoPlay
        playsInline
        className="w-[600px] h-[400px] bg-black"
      ></video>
    </>
  );
}
