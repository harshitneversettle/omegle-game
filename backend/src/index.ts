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

interface RoomType {
  user1: WebSocket;
  user2: WebSocket;
}

let waiting_queue: Users[] = [];
let alive_sockets = new Set<WebSocket>();
let RoomtoSocket = new Map<string, RoomType>();
let SockettoRoom = new Map<WebSocket, string>();
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

      if (waiting_queue.length >= 2) {
        // => it's time to pair
        user1 = waiting_queue.shift()?.socket!;
        user2 = waiting_queue.shift()?.socket!;
        const roomId = `roomId${Date.now()}`;
        RoomtoSocket.set(roomId, { user1, user2 });
        SockettoRoom.set(user1, roomId);
        SockettoRoom.set(user2, roomId);
      }
      if (!user1) return;
      user1.send(
        JSON.stringify({
          type: "create-offer",
        }),
      );
      setInterval(() => {
        waiting_queue.forEach((i) => {
          const temp_socket = i.socket;
          temp_socket.ping;
          temp_socket.on("message", () => {});
        });
      }, 10000);
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

  socket.on("ping", () => {
    alive_sockets.add(socket);
  });

  socket.on("close", () => {
    alive_sockets.delete(socket);
    const roomId = SockettoRoom.get(socket);
    const user1 = RoomtoSocket.get(roomId!)?.user1;
    const user2 = RoomtoSocket.get(roomId!)?.user2;
    if (!user1 || !user2 || !roomId) return;
    if (socket == user1) {
      // notify user2 ki connection close ho gaya
      // and user2 ko waiting queue me daalo , coz user1 ne connection break kiya hai
      user2?.send(
        JSON.stringify({
          type: "partner-gone",
        }),
      );
      waiting_queue.push({
        username: "null",
        socket: user2,
        arrived_at: Date.now(),
      });
    } else {
      // user2 ne connection break kiya hai
      user1?.send(
        JSON.stringify({
          type: "partner-gone",
        }),
      );
      waiting_queue.push({
        username: "null",
        socket: user1,
        arrived_at: Date.now(),
      });
    }
    RoomtoSocket.delete(roomId);
    SockettoRoom.delete(socket); // ye vo socket hai jiska close message aaya hai
    SockettoRoom.delete(socket == user1 ? user2 : user1); // ye partner socket hia
  });
});
