import { useEffect, useRef, useState } from "react";

interface message {
  text: string;
  sender: "me" | "peer";
}
export function useInitProcess(
  socket: React.RefObject<WebSocket | null>,
  stream: React.RefObject<MediaStream | null>,
  selfviderRef: React.RefObject<HTMLVideoElement | null>,
  viderRef: React.RefObject<HTMLVideoElement | null>,
  setAllMessages: React.Dispatch<React.SetStateAction<message[]>> | null,
  setBet: React.Dispatch<React.SetStateAction<number>>,
  setNoti: React.Dispatch<React.SetStateAction<boolean>>,
  setLockInput: React.Dispatch<React.SetStateAction<boolean>>,
  competition_stat: React.RefObject<string>,
  initFaceDetection: () => Promise<void>,
  setWinningStatus: React.Dispatch<React.SetStateAction<boolean>>,
) {
  let pc = useRef<RTCPeerConnection | null>(null);
  //   const [socket, setSocket] = useState<WebSocket | null>(null);

  const [connected, setConnected] = useState(false);

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
        // setSocket(ws);
        socket.current = ws;
      };

      ws.onmessage = async (msg) => {
        const message = JSON.parse(msg.data);
        if (message.type == "create-offer") {
          // create offer mtlb offer banana hai
          if (!stream.current) {
            // console.error("Camera not ready yet");
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
          if (!socket.current) return;
          socket.current.send(
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
            // console.log(connectionState);
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
          if (!setAllMessages) return;
          const text = message.payload.text;
          setAllMessages((prev) => [...prev, { text: text, sender: "peer" }]);
        } else if (message.type == "closed-connection") {
          setConnected(false);
        } else if (message.type == "bet-set-amount") {
          setBet(message.amount);
          setNoti(true);
        } else if (message.type == "match-started-server") {
          console.log(
            "match-started-server received, calling initFaceDetection",
          );
          console.log("server message : start");
          setLockInput(true);
          competition_stat.current = "start";
          initFaceDetection();
        } else if (message.type == "match-stopped-server") {
          console.log("server message : stop");
          setLockInput(false);
          competition_stat.current = "stop";
        } else if ((message.type = "peer-blinked")) {
          console.log("you won nigga");
          setWinningStatus(true);
        }
      };
    }
    initprocess();
  }, []);

  return {
    pc,
    socket,
    selfviderRef,
    viderRef,
    connected,
    setAllMessages,
  };
}
