import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { distance } from "../helpers";
import { useRef } from "react";

export function useFaceDetection(
  socket: React.RefObject<WebSocket | null>,
  viderRef: React.RefObject<HTMLVideoElement | null>,
  competition_stat: React.RefObject<string>,
  blinkRef: React.RefObject<boolean>,
  setLockInput: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  async function initFaceDetection() {
    console.log("Initializing face detection..");
    if (competition_stat.current !== "start") return;
    // console.log("Initializing face detection..");
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
    console.log("Detecting...");
    if (competition_stat.current != "start") return;
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
        blinkRef.current = true;
        socket.current?.send(
          JSON.stringify({
            type: "blinked",
          }),
        );
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
        (vertical1_left + vertical2_left) / (2 * horizontal_left); // on blinking , verticle distance 0 hota hai but horizontal hamesha same hota hai
      const EAR_right =
        (vertical1_right + vertical2_right) / (2 * horizontal_right);

      if (EAR_left < 0.28 || EAR_right < 0.28) {
        alert("Blink detected");
        socket.current?.send(JSON.stringify({ type: "blink-detected" }));
        competition_stat.current = "stop";
        setLockInput(false);
      }
    }
    requestAnimationFrame(detect);
  }

  return { initFaceDetection };
}
