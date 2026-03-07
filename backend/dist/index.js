"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
let all_sockets = [];
let waiting_queue = [];
let user1 = null;
let user2 = null;
let wss = new WebSocket.WebSocketServer({ port: 8080 });
let sender_socket = null;
let receiver_socket = null;
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
                user1 = waiting_queue.shift()?.socket;
                user2 = waiting_queue.shift()?.socket;
                // console.log(user1);
                // console.log(user2);
            }
            console.log("after pairing", waiting_queue.length);
            if (!user1)
                return;
            user1.send(JSON.stringify({
                type: "create-offer",
            }));
        }
        else if (message.type == "offer") {
            user2.send(JSON.stringify({
                type: "offer",
                sdp: message.sdp,
            }));
        }
        else if (message.type == "answer") {
            user1.send(JSON.stringify({
                type: "answer",
                sdp: message.sdp,
            }));
        }
        else if (message.type == "add-ice-candidates") {
            if (socket == user1) {
                user2.send(JSON.stringify({
                    type: "ice-candidates",
                    candidate: message.candidate,
                }));
            }
            else if (socket == user2) {
                user1.send(JSON.stringify({
                    type: "ice-candidates",
                    candidate: message.candidate,
                }));
            }
        }
        else if (message.type == "message") {
            if (socket == user1) {
                user2.send(JSON.stringify({
                    type: "message",
                    payload: {
                        text: message.payload.text,
                    },
                }));
            }
            else if (socket == user2) {
                user1.send(JSON.stringify({
                    type: "message",
                    payload: {
                        text: message.payload.text,
                    },
                }));
            }
        }
        else if (message.type == "close") {
            console.log("insode cloese");
            waiting_queue = waiting_queue.filter((i) => i.socket !== socket);
            console.log(waiting_queue.length);
            console.log(waiting_queue);
            socket.send(JSON.stringify({
                type: "closed-connection",
            }));
        }
        else if (message.type == "connection-closed") {
            if (socket == user1) {
                user2.send(JSON.stringify({
                    type: "connection-closed",
                }));
            }
            else if (socket == user2) {
                user1.send(JSON.stringify({
                    type: "connection-closed",
                }));
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
//# sourceMappingURL=index.js.map