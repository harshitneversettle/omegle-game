export function useCloseCall(
  socket: WebSocket | null,
  pc: React.RefObject<RTCPeerConnection | null>,
) {
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

  return { closecall };
}
