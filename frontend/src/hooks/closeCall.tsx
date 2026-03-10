export function useCloseCall(
  socket: React.RefObject<WebSocket | null> ,
  pc: React.RefObject<RTCPeerConnection | null>,
) {
  function closecall() {
    if (!socket.current) return;
    socket.current.send(
      JSON.stringify({
        type: "close",
      }),
    );
    pc.current?.close();
    pc.current?.close();
    socket.current.close();
    socket.current.send(
      JSON.stringify({
        type: "connection-closed",
      }),
    );
  }

  return { closecall };
}
