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
  arrived_at: number;
}
let all_sockets: Users[] = [];

let waiting_queue: Users[] = [];

let user1: WebSocket | null = null;
let user2: WebSocket | null = null;

let wss = new WebSocket.WebSocketServer({ port: 8080 });
let sender_socket: WebSocket | null = null;
let receiver_socket: WebSocket | null = null;
wss.on("connection", (socket) => {
  socket.on("message", (msg) => {
    console.log("incoming user");
    const message = JSON.parse(msg.toString());
    console.log(message);
    if (message.type == "random") {
      const message = JSON.parse(msg.toString());
      waiting_queue.push({
        username: message.name,
        socket: socket,
        arrived_at: message.arriving_time,
      });
      console.log("before pairing", waiting_queue.length);

      if (waiting_queue.length >= 2) {
        console.log("inside pairing", waiting_queue.length);
        // => it's time to pair
        user1 = waiting_queue.shift()?.socket!;
        user2 = waiting_queue.shift()?.socket!;
        // console.log(user1);
        // console.log(user2);
      }
      console.log("after pairing", waiting_queue.length);

      if(!user1) return ;
      user1.send(
        JSON.stringify({
          type: "create-offer",
        }),
      );
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
      console.log("insode cloese");
      waiting_queue = waiting_queue.filter((i) => i.socket !== socket);
      console.log(waiting_queue.length);
      console.log(waiting_queue);
      socket.send(
        JSON.stringify({
          type: "closed-connection",
        }),
      );
    } else if (message.type == "connection-closed") {
      if (socket == user1) {
        user2!.send(
          JSON.stringify({
            type: "connection-closed",
          }),
        );
      } else if (socket == user2) {
        user1!.send(
          JSON.stringify({
            type: "connection-closed",
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
