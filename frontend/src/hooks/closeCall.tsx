export function useCloseCall(
  socket: React.RefObject<WebSocket | null>,
  pc: React.RefObject<RTCPeerConnection | null>,
  setPipSmall: React.Dispatch<React.SetStateAction<boolean>>,
) {
  function closecall() {
    if (!socket.current) return;
    socket.current.send(    // this is actually closing the connection 
      JSON.stringify({
        type: "close",
      }),
    );
    pc.current?.close();
    socket.current.close();
    setPipSmall(false);
    socket.current.send(
      // this is propagates the info of closing connection 
      JSON.stringify({
        type: "connection-closed",
      }),
    );
  }

  return { closecall };
}
