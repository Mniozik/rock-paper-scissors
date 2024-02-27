// nodemon index.js

const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const server = http.createServer(app);
const WebSocket = require("ws");
const wss = new WebSocket.Server({ server });

const rooms = {};
const responseBuffer = new ArrayBuffer(64);
const responseView = new DataView(responseBuffer);
let onlineUsers = 0;


app.use(express.static(path.join(__dirname, "client")));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

wss.on('connection', (socket) => {
    console.log('Connected -> Online users: ', onlineUsers += 1);

    socket.on('message', (message) => {

        const messageView = new DataView(toArrayBuffer(message))
        const messageType = messageView.getUint8(0)

        switch (messageType) {

            case 1: // createGame
                const roomUniqueID = makeid(6);
                rooms[roomUniqueID] = {};
                socket.roomUniqueID = roomUniqueID;
                rooms[socket.roomUniqueID].playersAmount = 1;
                rooms[socket.roomUniqueID].playersRestart = 0; //RestartButton
                rooms[socket.roomUniqueID].roundsAmount = messageView.getUint8(1);

                responseView.setUint8(0, 1); // (newGame)
                for (let i = 0; i < roomUniqueID.length; i++) {
                    responseView.setUint8(i + 1, roomUniqueID.charCodeAt(i));
                }
                socket.send(responseBuffer); //wysyla do tego ktory nawiazal to polaczenie z serwerem
                break;

            case 2: // joinGame


                let join_roomUniqueID = '';
                let lengthID = messageView.getUint8(1);
                for (let i = 0; i < lengthID; i++) { // RoomID has a 6 characters
                    join_roomUniqueID += String.fromCharCode(messageView.getUint8(i + 2));
                }

                if (rooms[join_roomUniqueID] != null) {
                    if (rooms[join_roomUniqueID].playersAmount < 2) {
                        rooms[join_roomUniqueID].playersAmount += 1;

                        socket.roomUniqueID = join_roomUniqueID;

                        // ScoreBoard
                        rooms[socket.roomUniqueID].p1Score = 0;
                        rooms[socket.roomUniqueID].p2Score = 0;

                        // SEND
                        responseView.setUint8(0, 3);

                        socket.send(responseBuffer); //bez tego nie dostanie ten, ktory (join) [czyli ten ktory nawiazal to polaczenie]
                        wss.clients.forEach((client) => {
                            if (client.roomUniqueID === join_roomUniqueID && client !== socket) {
                                client.send(responseBuffer); //ten co stworzyl zeby mu wznowilo [tu wysylamy do tego ktory pokoj stworzyl, bo na tym polaczeniu jest ten ktory dolacza]
                            }
                        });
                    } else {
                        console.log("FULL ROOM: Someone want's to join full room.");
                        responseView.setUint8(0, 8);
                        responseView.setUint8(1, 1); //fullRoom
                        socket.send(responseBuffer); //Room that you want to join is full, sorry.


                    }
                } else {
                    console.log("NOT EXIST ROOM: Someone want's to join not exist room.");
                    responseView.setUint8(0, 8);
                    responseView.setUint8(1, 2); //notExistRoom
                    socket.send(responseBuffer); //Room that you want to join is full, sorry.
                }
                break;

            case 4: //p1Choice
                let playerChoice_1 = messageView.getUint8(1);
                rooms[socket.roomUniqueID].p1Choice = playerChoice_1;
                responseView.setUint8(0, 4);
                responseView.setUint8(1, playerChoice_1);

                wss.clients.forEach((client) => {
                    if (client.roomUniqueID === socket.roomUniqueID) {
                        client.send(responseBuffer); //wysylamy do dwojki bedacych w tym pokoju
                    }
                });
                if (rooms[socket.roomUniqueID].p2Choice != null) {
                    declareWinner(socket.roomUniqueID);
                }
                break;

            case 5: //p2Choice
                let playerChoice_2 = messageView.getUint8(1);
                rooms[socket.roomUniqueID].p2Choice = playerChoice_2;
                responseView.setUint8(0, 5);
                responseView.setUint8(1, playerChoice_2);

                wss.clients.forEach((client) => {
                    if (client.roomUniqueID === socket.roomUniqueID) {
                        client.send(responseBuffer);
                    }
                });
                if (rooms[socket.roomUniqueID].p1Choice != null) {
                    declareWinner(socket.roomUniqueID);
                }
                break;

            case 7: //restartGame()
                rooms[socket.roomUniqueID].playersRestart += 1;
                responseView.setUint8(0, 7); // RestartGame
                if (rooms[socket.roomUniqueID].playersRestart >= 2) {
                    rooms[socket.roomUniqueID].playersRestart = 0;
                    wss.clients.forEach((client) => {
                        responseView.setUint8(1, 2); // ReadytoRestart
                        if (client.roomUniqueID === socket.roomUniqueID) {
                            client.send(responseBuffer);
                        }
                    });
                } else {
                    wss.clients.forEach((client) => {
                        responseView.setUint8(1, 1); // NotReadytoRestart
                        if (client.roomUniqueID === socket.roomUniqueID && client !== socket) {
                            client.send(responseBuffer);
                        }
                    });

                }
                break;
        }

    });
    socket.on('close', () => {
        console.log('Disconnected -> Online users: ', onlineUsers -= 1);
    });
});

server.listen(5000, () => {
    console.log('Start: index.js - listen port 5000');
});

function declareWinner(roomUniqueID) {
    let p1Choice = rooms[roomUniqueID].p1Choice;
    let p2Choice = rooms[roomUniqueID].p2Choice;
    let winner = null;
    if (p1Choice === p2Choice) {
        winner = 3;
    }
    else if (p1Choice == 2) {
        if (p2Choice == 3) { // Poprawienie porównania
            winner = 2;
        }
        else {
            winner = 1;
        }
    }
    else if (p1Choice == 1) {
        if (p2Choice == 3) { // Poprawienie porównania
            winner = 1;
        }
        else {
            winner = 2;
        }
    }
    else if (p1Choice == 3) {
        if (p2Choice == 2) { // Poprawienie porównania
            winner = 1;
        }
        else {
            winner = 2;
        }
    }

    if (winner == 1) {
        rooms[roomUniqueID].p1Score += 1;
    }
    else if (winner == 2) {
        rooms[roomUniqueID].p2Score += 1;
    }

    let p1Score = rooms[roomUniqueID].p1Score;
    let p2Score = rooms[roomUniqueID].p2Score;

    responseView.setUint8(0, 6);
    responseView.setUint8(1, winner);
    responseView.setUint8(2, p1Score);
    responseView.setUint8(3, p2Score);
    // Update - General winner
    if (p1Score >= rooms[roomUniqueID].roundsAmount || p2Score >= rooms[roomUniqueID].roundsAmount) {
        if (p1Score > p2Score) {
            responseView.setUint8(4, 1); //Player1 win's
            console.log("p1Wins");
        } else {
            responseView.setUint8(4, 2); //Player2 win's
            console.log("p2Wins");
        }
    } else {
        responseView.setUint8(4, 0); //No one win's yet
    }

    wss.clients.forEach((client) => {
        if (client.roomUniqueID === roomUniqueID) {
            client.send(responseBuffer);
        }
    });

    rooms[roomUniqueID].p1Choice = null;
    rooms[roomUniqueID].p2Choice = null;
};

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

function toArrayBuffer(buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new DataView(arrayBuffer);

    for (let i = 0; i < buffer.length; i++) {
        view.setUint8(i, buffer[i]);
    }
    return arrayBuffer;
};
