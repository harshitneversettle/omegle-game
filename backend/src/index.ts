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

let wss = new WebSocket.WebSocketServer({ port: 8080 });

const getUsers = (
  SockettoRoom: Map<WebSocket, string>,
  RoomtoSocket: Map<string, RoomType>,
  socket: WebSocket,
) => {
  const roomId = SockettoRoom.get(socket);
  if (!roomId) return;
  const user1: WebSocket = RoomtoSocket.get(roomId)?.user1!;
  const user2: WebSocket = RoomtoSocket.get(roomId)?.user2!;

  return { user1, user2 };
};

function tryConnection() {
  if (waiting_queue.length >= 2) {
    // => it's time to pair
    const user1 = waiting_queue.shift()?.socket!;
    const user2 = waiting_queue.shift()?.socket!;
    if (user1 == user2) return;
    const roomId = `roomId${Date.now()}`;
    RoomtoSocket.set(roomId, { user1, user2 });
    SockettoRoom.set(user1, roomId);
    SockettoRoom.set(user2, roomId);
    if (!user1) return;
    user1.send(
      JSON.stringify({
        type: "create-offer",
      }),
    );
  }
}

wss.on("connection", (socket) => {
  socket.on("message", (msg) => {
    const message = JSON.parse(msg.toString());
    if (message.type == "new-connection") {
      const message = JSON.parse(msg.toString());
      waiting_queue.push({
        username: message.name,
        socket: socket,
        arrived_at: message.arriving_time,
      });
      tryConnection();
      setInterval(() => {
        waiting_queue.forEach((i) => {
          const temp_socket = i.socket;
          temp_socket.ping;
          temp_socket.on("message", () => {});
        });
      }, 10000);
    } else if (message.type == "offer") {
      const users = getUsers(SockettoRoom, RoomtoSocket, socket);
      if (!users) return;
      const { user1, user2 } = users;
      user2!.send(
        JSON.stringify({
          type: "offer",
          sdp: message.sdp,
        }),
      );
    } else if (message.type == "answer") {
      const roomId = SockettoRoom.get(socket);
      if (!roomId) return;
      const user1 = RoomtoSocket.get(roomId)?.user1;
      user1!.send(
        JSON.stringify({
          type: "answer",
          sdp: message.sdp,
        }),
      );
    } else if (message.type == "add-ice-candidates") {
      const users = getUsers(SockettoRoom, RoomtoSocket, socket);
      if (!users) return;
      const { user1, user2 } = users;
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
      const users = getUsers(SockettoRoom, RoomtoSocket, socket);
      if (!users) return;
      const { user1, user2 } = users;
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
      tryConnection();
    } else if (message.type == "connection-closed") {
      const users = getUsers(SockettoRoom, RoomtoSocket, socket);
      if (!users) return;
      const { user1, user2 } = users;
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
    } else if (message.type == "bet-is-set") {
      const users = getUsers(SockettoRoom, RoomtoSocket, socket);
      if (!users) return;
      const { user1, user2 } = users;
      if (socket == user1) {
        user2?.send(
          JSON.stringify({
            type: "bet-set-amount",
            amount: message.amount,
          }),
        );
      } else {
        user1?.send(
          JSON.stringify({
            type: "bet-set-amount",
            amount: message.amount,
          }),
        );
      }
    } else if (message.type == "match-started") {
      const users = getUsers(SockettoRoom, RoomtoSocket, socket);
      if (!users) return;
      const { user1, user2 } = users;
      console.log("cliend sensd message : start");
      if (socket == user1) {
        user2.send(
          JSON.stringify({
            type: "match-started-server",
          }),
        );
      } else if (socket == user2) {
        user1.send(
          JSON.stringify({
            type: "match-started-server",
          }),
        );
      }
    } else if (message.type == "match-stopped") {
      const users = getUsers(SockettoRoom, RoomtoSocket, socket);
      if (!users) return;
      const { user1, user2 } = users;

      console.log("cliend sensd message : stop");
      if (socket == user1) {
        user2.send(
          JSON.stringify({
            type: "match-stopped-server",
          }),
        );
      } else if (socket == user2) {
        user1.send(
          JSON.stringify({
            type: "match-stopped-server",
          }),
        );
      } else if (message.type == "blinked") {
        const users = getUsers(SockettoRoom, RoomtoSocket, socket);
        if (!users) return;
        const { user1, user2 } = users;
        if (socket == user1) {
          user2.send(
            JSON.stringify({
              type: "peer-blinked",
            }),
          );
        } else if (socket == user2) {
          user1.send(
            JSON.stringify({
              type: "peer-blinked",
            }),
          );
        }
      }
    }
  });

  socket.on("pong", () => {
    alive_sockets.add(socket);
  });

  socket.on("close", () => {
    alive_sockets.delete(socket);
    const roomId = SockettoRoom.get(socket);
    const users = getUsers(SockettoRoom, RoomtoSocket, socket);
    if (!users) return;
    const { user1, user2 } = users;
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
    tryConnection();
  });
});
