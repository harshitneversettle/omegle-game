import { useEffect, useRef } from "react";

export default function Sender() {
  // this is sender , first we have to tell signaling server ki ye sender hai , iska ip (or whatever) apne paas store krlo

  const senderSocket = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "sender" }));
      senderSocket.current = ws;
    };
  }, []);

  async function startcall() {
    const pc = new RTCPeerConnection();
    pc.ontrack = (event) => {
      console.log(event);
      console.log(videoRef.current);
      if (videoRef.current) {
        videoRef.current.srcObject = new MediaStream([event.track]);
      }
    };

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer(); // sdp is created here
      await pc.setLocalDescription(offer);
      // now send the offer to the singlalling server , make sure the ws instance should be there
      senderSocket.current?.send(
        JSON.stringify({
          type: "create-offer",
          sdp: pc.localDescription,
        }),
      );
    };
    pc.onicecandidate = (msg) => {
      if (msg.candidate) {
        senderSocket.current?.send(
          JSON.stringify({
            type: "add-ice-candidates",
            candidate: msg.candidate,
          }),
        );
      }
    };

    if (!senderSocket) return;
    // receiver side se jo sdp aaya hai usko remote set krna hai
    if (!senderSocket.current) return;
    senderSocket.current.onmessage = async (msg) => {
      let message = JSON.parse(msg.data);
      if (message.type === "answer") {
        await pc.setRemoteDescription(message.sdp);
      } else if (message.type === "ice-candidates") {
        pc?.addIceCandidate(message.candidate);
      }
    };

    let stream = null;
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    console.log(pc);
    if (stream) pc.addTrack(stream.getVideoTracks()[0]);
  }
  return (
    <>
      <div className="">
        hello , this is sender <button onClick={startcall}>start call</button>
        <video ref={videoRef} autoPlay playsInline></video>
      </div>
    </>
  );
}
