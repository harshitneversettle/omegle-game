interface message {
  text: string;
  sender: "me" | "peer";
}

export function useHandleMessage(
  socket: React.RefObject<WebSocket | null>,
  setAllMessages: React.Dispatch<React.SetStateAction<message[]>>,
  messageInput: React.RefObject<HTMLInputElement | null>,
) {
  function handlemessage() {
    if (!messageInput.current) return;
    // @ts-ignore
    const text = messageInput.current.value;
    setAllMessages((prev) => [
      ...prev,
      // @ts-ignore
      { text: text, sender: "me" },
    ]);
    socket.current?.send(
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

  return { handlemessage };
}
