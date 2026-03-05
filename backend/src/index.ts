import WebSocket = require("ws");

// we have to do always thses stape to ensure a connection , or more precisely a singlalling  server
// identify-as-sender
// identify-as-reveiver
// create-offer
// create-answer
// add-ice-candidates

interface Users {
  username: string;
  socket: WebSocket;
}
const all_sockets: Users[] = [];

let wss = new WebSocket.WebSocketServer({ port: 8080 });
let sender_socket: WebSocket | null = null;
let receiver_socket: WebSocket | null = null;
wss.on("connection", (socket) => {
  socket.on("message", (msg) => {
    const message = JSON.parse(msg.toString());
    if (message.type == "random") {
      const message = JSON.parse(msg.toString());
      all_sockets.push({
        username: message.name,
        socket: socket,
      });
      if (all_sockets.length >= 2) {
        all_sockets[0]!.socket.send(JSON.stringify({ type: "create-offer" }));
        // all_sockets[1]!.socket.send(JSON.stringify({ type: "create-answer" }));
      }
    } else if (message.type == "offer") {
      all_sockets[1]?.socket.send(
        JSON.stringify({
          type: "offer",
          sdp: message.sdp,
        }),
      );
    } else if (message.type == "answer") {
      all_sockets[0]?.socket.send(
        JSON.stringify({
          type: "answer",
          sdp: message.sdp,
        }),
      );
    } else if (message.type == "add-ice-candidates") {
      if (socket == all_sockets[0]?.socket) {
        all_sockets[1]?.socket.send(
          JSON.stringify({
            type: "ice-candidates",
            candidate: message.candidate,
          }),
        );
      } else if (socket == all_sockets[1]?.socket) {
        all_sockets[0]?.socket.send(
          JSON.stringify({
            type: "ice-candidates",
            candidate: message.candidate,
          }),
        );
      }
    }
  //  if (message.type == "sender") {
  //     console.log("sender is set");
  //     sender_socket = socket;
  //   } else if (message.type === "receiver") {
  //     console.log("receiver is set");
  //     receiver_socket = socket;
  //   } else if (message.type === "create-offer") {
  //     console.log("offer incoming");
  //     // => sender sending offer to receiver
  //     receiver_socket?.send(
  //       JSON.stringify({ type: "offer", sdp: message.sdp }),
  //     );
  //   } else if (message.type === "create-answer") {
  //     console.log("ans incoming");
  //     // => receiver sending answer to sender
  //     sender_socket?.send(JSON.stringify({ type: "answer", sdp: message.sdp }));
  //   } else if (message.type === "add-ice-candidates") {
  //     console.log("ice candidates incoming ");
  //     if (socket == sender_socket) {
  //       receiver_socket?.send(
  //         JSON.stringify({
  //           type: "ice-candidates",
  //           candidate: message.candidate,
  //         }),
  //       );
  //     } else {
  //       sender_socket?.send(
  //         JSON.stringify({
  //           type: "ice-candidates",
  //           candidate: message.candidate,
  //         }),
  //       );
  //     }
  //   }
  });
});
