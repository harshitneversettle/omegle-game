export function useStopCompetition(
  socket: React.RefObject<WebSocket | null>,
  competition_stat: React.RefObject<string>,
  setLockInput: React.Dispatch<React.SetStateAction<boolean>>,
) {
  function stopCompetition() {
    if (!socket.current) {
      return;
    }
    console.log("sending server a message (stop)");
    competition_stat.current = "stop";
    setLockInput(false);
    socket.current.send(
      JSON.stringify({
        type: "match-stopped",
      }),
    );
  }
  return { stopCompetition };
}
