console.log("Start: client.js");

// ---- Localhost or WebPage? 
const socket = new WebSocket("ws://localhost:5000");  

// const socket = new WebSocket("wss://9651-85-221-130-220.ngrok-free.app"); 
// // ngrok http 5000

socket.binaryType = 'arraybuffer'; 

let roomUniqueID = null;
let player1 = false;
const messageBuffer = new ArrayBuffer(64); 
const messageView = new DataView(messageBuffer);


function createGame() {
    let form = document.getElementById('myForm');
    let choose = form.querySelector('input[name="roundAmount"]:checked');

    if (choose) {
        let roundsAmount = choose.value;
        console.log('Wybrana ilość rund: ' + roundsAmount);
        player1 = true;
        messageView.setUint8(0, 1); //createGame
        messageView.setUint8(1, roundsAmount); 
        socket.send(messageBuffer);
        // document.getElementById("gameSetup").style.display = "none";
    } else {
        // document.getElementById("roundAmountEmpty").innerHTML = "Choose amount of rounds.";
        visibleTimeout("roundAmountEmpty");
    }
};

function createGameSetup() {
    document.getElementById('initial').style.display = "none";
    document.getElementById("gameSetup").style.display = "block";
};

function joinGame() {
    const roomUniqueID = document.getElementById('roomUniqueID').value;
    let lengthID = roomUniqueID.length;
    messageView.setUint8(0, 2);
    messageView.setUint8(1, lengthID); //How many characters got RoomID

    for (let i = 0; i < lengthID; i++) {
        messageView.setUint8(i + 2, roomUniqueID.charCodeAt(i));
    }
    socket.send(messageBuffer);
};

function restartGame() {
    const messageBuffer = new ArrayBuffer(1); 
    const messageView = new DataView(messageBuffer);
    messageView.setUint8(0, 7); 
    socket.send(messageBuffer);
    document.getElementById("restartButton").style.display = "none";
    // document.getElementById("resultArea").style.display = "none";

    // document.getElementById("restartRoom1").style.display = "block";
    document.getElementById("restartRoom1").style.display = "inline-block";
};

socket.addEventListener('message', (event) => {
    const messageBuffer = event.data;
    const messageView = new DataView(messageBuffer)

    const messageType = messageView.getUint8(0);
    switch (messageType) {
        case 1:
            let roomUniqueID = '';
            for (let i = 1; i < 7; i++) {
                roomUniqueID += String.fromCharCode(messageView.getUint8(i));
            }
            
            document.getElementById('initial').style.display = "none";
            // document.getElementById('gamePlay').style.display = "block";
            document.getElementById('waitingArea').style.display = "block";
            document.getElementById('buttonCreateGame2').disabled = true;


            let copyButton = document.createElement("button");
            copyButton.style.display = "block";
            copyButton.innerText = "Copy Code";
            copyButton.className = "copyButton"
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(roomUniqueID).then(function () {
                    console.log('Copy to clipboard (success) ');
                }, function (err) {
                    console.error('Copy to clipboard (error) ', err);
                });
            });

            // document.getElementById('waitingArea').innerHTML = `Waiting for opponent, share roomID: ${roomUniqueID}`;
            document.getElementById('waitingArea').innerHTML = `Waiting for opponent, share roomID: <span style="color: #314732; font-weight: bold; font-size: larger;"> ${roomUniqueID}</span>`;

            document.getElementById('waitingArea').appendChild(copyButton);
            break;
        case 4:
            if (!player1) { 
                let playerChoice_1 = messageView.getUint8(1);
                createOpponentChoiceButton(playerChoice_1);
            }
            break;
        case 5:
            if (player1) {
                let playerChoice_2 = messageView.getUint8(1);
                createOpponentChoiceButton(playerChoice_2);
            }
            break;
        case 6:
            let winner = messageView.getUint8(1);
            let p1Score = messageView.getUint8(2);
            let p2Score = messageView.getUint8(3);
            let pWins = messageView.getUint8(4); //if someone wins whole game
            let winnerText = "";

            if (player1) {
                if (winner == 1) {
                    winnerText = "You win. &#128521";
                }
                else if (winner == 2) {
                    winnerText = "You lose. &#128532";
                }
                else {
                    winnerText = "It's a draw. &#128528";
                }
            }
            else {
                if (winner == 2) {
                    winnerText = "You win. &#128521";
                }
                else if (winner == 1) {
                    winnerText = "You lose. &#128532";
                }
                else {
                    winnerText = "It's a draw. &#128528";
                }
            }

            document.getElementById("opponentBefore").style.display = "none";
            document.getElementById("opponentAfter").style.display = "none";
            document.getElementById("opponentButton").style.display = "block";
            document.getElementById("resultArea").innerHTML = winnerText;
            document.getElementById("restartButton").style.display = "block";
            document.getElementById("ResultRestart").style.display = "block";

            if (player1) {
                document.getElementById("player1Score").innerHTML = "You: " + p1Score.toString();
                document.getElementById("player2Score").innerHTML = "Opponent: " + p2Score.toString();
                if (pWins != 0) {
                    if (pWins == 1) {
                        document.getElementById("player1Score").style.backgroundColor = "gold";
                        document.getElementById("scoreBoardMain").innerHTML = "You win this clash.";
                    } else if (pWins == 2) {
                        document.getElementById("player2Score").style.backgroundColor = "gold";
                        document.getElementById("scoreBoardMain").innerHTML = "You lose this clash.";
                    }
                    document.getElementById("WinnerRestart").style.display = "flex";
                    document.getElementById("restartButton").style.display = "none";
                    // document.getElementById("MenuButton").style.display = "block";
                }
            }
            else {
                document.getElementById("player1Score").innerHTML = "You: " + p2Score.toString();
                document.getElementById("player2Score").innerHTML = "Opponent: " + p1Score.toString();
                if (pWins != 0) {
                    if (pWins == 1) {
                        document.getElementById("player2Score").style.backgroundColor = "gold";
                        document.getElementById("scoreBoardMain").innerHTML = "You lose this clash.";
                    } else if (pWins == 2) {
                        document.getElementById("player1Score").style.backgroundColor = "gold";
                        document.getElementById("scoreBoardMain").innerHTML = "You win this clash.";
                    }
                    document.getElementById("WinnerRestart").style.display = "flex";
                    document.getElementById("restartButton").style.display = "none";
                    // document.getElementById("MenuButton").style.display = "block";
                }
            }
            break;
        case 3:
            document.getElementById("initial").style.display = "none";
            document.getElementById("gameSetup").style.display = "none";
            document.getElementById("waitingArea").style.display = "none";
            document.getElementById("gameArea").style.display = "flex";
            // document.getElementById("ScoreInfo").style.display = "block";
            document.getElementById("winnerArea").style.display = "block";


            document.getElementById("opponentBefore").style.display = "block";

            break;
        case 7: //RestartGame

            if (messageView.getUint8(1) == 1) {
                // document.getElementById("restartRoom2").style.display = "block";
                document.getElementById("restartRoom2").style.display = "inline-block";
              

            } else {
                document.getElementById("player1Choice").innerHTML = `
                <button class="rock" onclick="sendChoice(1)">Rock</button>
                <button class="paper" onclick="sendChoice(2)">Paper</button>
                <button class="scissors" onclick="sendChoice(3)">Scissors</button>
                `;
                document.getElementById("opponentBefore").style.display = "block";
                document.getElementById("opponentButton").style.display = "none";
                document.getElementById("ResultRestart").style.display = "none";
                document.getElementById("resultArea").innerHTML = ""; 
                
                document.getElementById("restartButton").style.display = "none";
                document.getElementById("restartRoom1").style.display = "none";
                document.getElementById("restartRoom2").style.display = "none";
               
            }
            break;
        case 8:
            // All errors got from server. 
            let errorType = messageView.getUint8(1);
            if (errorType == 1) {
                console.log("Room that you want to join is full, sorry.");
                visibleTimeout("fullRoom");
            } else if (errorType == 2) {
                console.log("Game with your roomID not exist, sorry.");
                visibleTimeout("notExistRoom");
            }
    }
});

function sendChoice(playerChoice) {
    const choiceEvent = player1 ? 4 : 5; // 4 - p1Choice, 5 - p2Choice
    const messageBuffer = new ArrayBuffer(2);
    const messageView = new DataView(messageBuffer);
    messageView.setUint8(0, choiceEvent); 
    messageView.setUint8(1, playerChoice)
    socket.send(messageBuffer);


    if (playerChoice == 1) {
        var buttonClass = "rock";
    } else if (playerChoice == 2) {
        var buttonClass = "paper";
    } else if (playerChoice == 3) {
        var buttonClass = "scissors";
    } else {
        console.log("Wrong choice!");
    }

    let playerChoiceButton = document.createElement("button");
    playerChoiceButton.id = playerChoiceButton; 
    playerChoiceButton.classList.add(buttonClass);
    playerChoiceButton.style.display = "block";
    playerChoiceButton.innerText = playerChoice;

    document.getElementById("player1Choice").innerHTML = "";
    document.getElementById("player1Choice").appendChild(playerChoiceButton);

};

function createOpponentChoiceButton(playerChoice) {
    document.getElementById("opponentBefore").style.display = "none";
    document.getElementById("opponentAfter").style.display = "block";

    if (playerChoice == 1) {
        var buttonClass = "rock";
    } else if (playerChoice == 2) {
        var buttonClass = "paper";
    } else if (playerChoice == 3) {
        var buttonClass = "scissors";
    } else {
        console.log("Wrong choice!");
    }

    let opponentButton = document.createElement("button");
    opponentButton.id = "opponentButton";
    opponentButton.classList.add(buttonClass);
    opponentButton.style.display = "none";
    opponentButton.innerText = playerChoice;
    document.getElementById("opponentButtonPlace").innerHTML = "";
    document.getElementById("opponentButtonPlace").appendChild(opponentButton);
};  

function visibleTimeout(elementID) {
    const handleElementID = document.getElementById(elementID);
    handleElementID.style.display = "block";
    // handleElementID.style.display = "flex";
    setTimeout(function() {
        handleElementID.style.display = "none";
    }, 3000);
};
