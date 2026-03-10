import { useFaceDetection } from "./faceDetection";

export function useStartCompetition(
 
) {
  const { initFaceDetection } = useFaceDetection(
    socket,
    viderRef,
    competition_stat,
  );
  function startCompetition() {
    if (!socket.current) {
      return;
    }
    // console.log("sending server a message (start)");
    competition_stat.current = "start";
    socket.current.send(
      JSON.stringify({
        type: "match-started",
      }),
    );
    setLockInput(true);
    initFaceDetection();
  }
  return { startCompetition };
}

