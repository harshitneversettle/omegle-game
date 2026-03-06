import WebSocket = require("ws");

// we have to do always thses stape to ensure a connection , or more precisely a singlalling  server
// identify-as-sender
// identify-as-reveiver
// create-offer
// create-answer
// add-ice-candidates

// A random whole number between 1 and 10 (inclusive):
// let x = Math.floor((Math.random() * 10) + 1);

interface Users {
  username: string;
  socket: WebSocket;
}
let all_sockets: Users[] = [];

function getRandomIdx(length: number) {
  let min = 0;
  let max = length;
  // +1 is because if we not add 1 the max will be excluded , isme nhi kiya coz array ka index hai -1 hi chaiye humesha
  const first = Math.floor(Math.random() * (max - min) + min);
  let second = Math.floor(Math.random() * (max - min) + min);

  while (second === first) {
    second = Math.floor(Math.random() * (max - min) + min);
  }

  return [first, second];
}

let user1: WebSocket | null = null;
let user2: WebSocket | null = null;

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
        // console.log("1");
        // @ts-ignore
        const [rand1, rand2] = getRandomIdx(all_sockets.length);
        // console.log(rand1);
        // console.log(rand2);
        // console.log(rand);
        // @ts-ignore
        if (!all_sockets[rand1] || !all_sockets[rand2]) {
          return;
        }
        // console.log("2");
        // @ts-ignore
        user1 = all_sockets[rand1].socket;
        // @ts-ignore
        user2 = all_sockets[rand2].socket;
        // console.log(user1);
        // console.log(user2);
        user1?.send(JSON.stringify({ type: "create-offer" }));
        // all_sockets[1]!.socket.send(JSON.stringify({ type: "create-answer" }));
      }
    } else if (message.type == "offer") {
      user2!.send(
        JSON.stringify({
          type: "offer",
          sdp: message.sdp,
        }),
      );
    } else if (message.type == "answer") {
      user1!.send(
        JSON.stringify({
          type: "answer",
          sdp: message.sdp,
        }),
      );
    } else if (message.type == "add-ice-candidates") {
      if (socket == user1) {
        user2!.send(
          JSON.stringify({
            type: "ice-candidates",
            candidate: message.candidate,
          }),
        );
      } else if (socket == user2) {
        user1!.send(
          JSON.stringify({
            type: "ice-candidates",
            candidate: message.candidate,
          }),
        );
      }
    } else if (message.type == "message") {
      if (socket == user1) {
        user2!.send(
          JSON.stringify({
            type: "message",
            payload: {
              text: message.payload.text,
            },
          }),
        );
      } else if (socket == user2) {
        user1!.send(
          JSON.stringify({
            type: "message",
            payload: {
              text: message.payload.text,
            },
          }),
        );
      }
    } else if (message.type == "close") {
      console.log("insode cloese")
      console.log(all_sockets);
      all_sockets = all_sockets.filter((i) => i.socket !== socket);
      console.log(all_sockets)
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
