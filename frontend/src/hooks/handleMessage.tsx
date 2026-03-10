interface message {
  text: string;
  sender: string;
}

export function useHandleMessage(
  socket: WebSocket | null,
  setAllMessages: React.Dispatch<React.SetStateAction<message[]>>,
  messageInput: React.RefObject<null>,
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
    socket?.send(
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
