import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";

export default function Test() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  function getEAR(vert1: number, vert2: number, horiz: number) {
    const ans = (vert1 + vert2) / (2 * horiz);
    return ans;
  }
  function getDist(p1: { x: number; y: number }, p2: { x: number; y: number }) {
    const first = Math.pow(p2.x - p1.x, 2);
    const second = Math.pow(p2.y - p1.y, 2);
    const diff = second + first;
    const dist = Math.sqrt(diff);
    return dist;
  }
  useEffect(() => {
    async function call() {
      console.log("inside test");
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.ageGenderNet.loadFromUri("/models"),
      ]);
      console.log("loaded   ");
      setModelsLoaded(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }
    const intyerval = setInterval(async () => {
      if (!modelsLoaded || !videoRef.current) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks();

      // console.log("left eye", detection?.landmarks.getLeftEye());
      // console.log("right eye", detection?.landmarks.getRightEye());
      const left_eye = detection?.landmarks.getLeftEye();
      const right_eye = detection?.landmarks.getRightEye();
      const p1_left = left_eye![0];
      const p2_left = left_eye![1];
      const p3_left = left_eye![2];
      const p4_left = left_eye![3];
      const p5_left = left_eye![4];
      const p6_left = left_eye![5];

      const p1_right = right_eye![0];
      const p2_right = right_eye![1];
      const p3_right = right_eye![2];
      const p4_right = right_eye![3];
      const p5_right = right_eye![4];
      const p6_right = right_eye![5];
      // console.log("point 0 : ", p0_left);
      // console.log(p1_left);

      const vert1_Left = getDist(p2_left, p6_left);
      const vert2_Left = getDist(p3_left, p5_left);
      const horz_Left = getDist(p1_left, p4_left);

      const vert1_Right = getDist(p2_right, p6_right);
      const vert2_Right = getDist(p3_right, p5_right);
      const horz_Right = getDist(p1_right, p4_right);
      const EAR_left = getEAR(vert1_Left, vert2_Left, horz_Left);
      const EAR_right = getEAR(vert1_Right, vert2_Right, horz_Right);
      console.log(EAR_left, EAR_right);

      if (EAR_left < 0.22 || EAR_right < 0.22) {
        alert("Blink detected");
      }
      // console.log(vert1_Left, vert2_Left, horz_Left);
    }, 100);

    call();
  }, []);

  return (
    <>
      <video ref={videoRef} autoPlay playsInline />
    </>
  );
}
