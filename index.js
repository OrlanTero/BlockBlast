
import BlockBlast from "./components/BlockBlast.js";

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const canvas_width = 400;
const canvas_height = 700;

let GAME = null;

function animate() {
    // console.log("ANIMATE");
    requestAnimationFrame(animate);

    ctx.clearRect(0, 0, canvas_width, canvas_height);

    update();
    draw();
}

function draw() {
    GAME.draw(ctx);
}

function update() {
    GAME.update();
}

function init() {

    GAME = new BlockBlast(canvas, canvas_width, canvas_height);

    GAME.listen(ctx);

    animate();
}

init();