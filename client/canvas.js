const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const rockImage = new Image();
rockImage.src = "./items/rock.png";

const paperImage = new Image();
paperImage.src = "./items/paper.png";

const scissorsImage = new Image();
scissorsImage.src = "./items/scissors.png";


const setCanvasDimensions = () => {
    canvas.width = window.innerWidth;
};
canvas.height = 215;


window.addEventListener("resize", () => {
    setCanvasDimensions();
});


const initialAngle = 0; // Początkowy kąt obrotu
const amplitude = 20; // Wielkość ruchu w lewo i prawo w stopniach
const frameRate = 5;

let currentAngle1 = initialAngle;
let currentAngle2 = initialAngle;
let currentAngle3 = initialAngle;
let direction1 = 1; // 1 -> ruch w prawo | -1  <- ruch w lewo
let direction2 = 1;
let direction3 = 1;

function paint() {
    // const CanvasWidth = canvas.width - 150;
    const CanvasWidth = canvas.width - 225;
    const x_rockImage = CanvasWidth / 2 - rockImage.width - 25;
    const x_paperImage = CanvasWidth / 2;
    const x_scissorsImage = CanvasWidth / 2 + scissorsImage.width + 35;
    const y = 15;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- ROCK IMAGE ---
    currentAngle1 += direction1 * amplitude;

    if (currentAngle1 >= initialAngle + amplitude || currentAngle1 <= initialAngle - amplitude) {
        direction1 *= -1;
    }

    ctx.translate(x_rockImage + rockImage.width / 2, y + rockImage.height / 2);
    ctx.rotate((currentAngle1 * Math.PI) / 180);
    ctx.drawImage(rockImage, -rockImage.width / 2, -rockImage.height / 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

     // --- PAPER IMAGE ---
    currentAngle2 += direction2 * amplitude;

    if (currentAngle2 >= initialAngle + amplitude || currentAngle2 <= initialAngle - amplitude) {
        direction2 *= -1;
    }

    ctx.translate(x_paperImage + paperImage.width / 2, y + paperImage.height / 2);
    ctx.rotate((currentAngle2 * Math.PI) / 180);
    ctx.drawImage(paperImage, -paperImage.width / 2, -paperImage.height / 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

     // --- SCISSORS IMAGE ---
    currentAngle3 += direction3 * amplitude;

    if (currentAngle3 >= initialAngle + amplitude || currentAngle3 <= initialAngle - amplitude) {
        direction3 *= -1;
    }

    ctx.translate(x_scissorsImage + scissorsImage.width / 2, y + scissorsImage.height / 2);
    ctx.rotate((currentAngle3 * Math.PI) / 180);
    ctx.drawImage(scissorsImage, -scissorsImage.width / 2, -scissorsImage.height / 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    setTimeout(paint, 1000 / frameRate);
}

setCanvasDimensions();
paint();
