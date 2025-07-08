// 2D Drawing Sketch - using p5.js instance mode
var sketch1 = function(p) {
  // All variables are scoped to this instance
  var canvasWidth = 800;
  var canvasHeight = 400;
  var gridSpacing = 40;
  var canvas;

  p.setup = function() {
    canvas = p.createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container-1');
  };

let circles = [];

function setup() {
  angleMode(DEGREES);

  // Define circle positions and RGB color
  circles = [
    { x: 50, y: 100, color: [217, 137, 72] },
    { x: 100, y: 300, color: [217, 137, 72] },
    { x: 200, y: 80, color: [243, 110, 55] },
    { x: 250, y: 220, color: [241, 95, 49] },
    { x: 300, y: 340, color: [239, 66, 58] },
    { x: 350, y: 180, color: [236, 44, 61] },
    { x: 400, y: 70, color: [229, 35, 100] },
    { x: 450, y: 250, color: [208, 28, 103] },
    { x: 500, y: 350, color: [129, 97, 130] },
    { x: 600, y: 120, color: [92, 64, 91] },
    { x: 650, y: 300, color: [79, 47, 63] },
  ];
}

function draw() {
  background('#000000');
  strokeWeight(2);

  // First draw gradient lines
  for (let i = 0; i < circles.length - 1; i++) {
    drawGradientLine(circles[i], circles[i + 1], 50);
  }

  // Then draw all circles
  for (let circle of circles) {
    drawCircle(circle.x, circle.y, circle.color);
  }
}

function drawCircle(x, y, rgbArray) {
  fill(...rgbArray);
  noStroke();
  circle(x, y, 70);
}

// Interpolated line segments to simulate gradient
function drawGradientLine(c1, c2, steps) {
  for (let i = 0; i < steps; i++) {
    let t = i / (steps - 1);
    let x = lerp(c1.x, c2.x, t);
    let y = lerp(c1.y, c2.y, t);

    let r = lerp(c1.color[0], c2.color[0], t);
    let g = lerp(c1.color[1], c2.color[1], t);
    let b = lerp(c1.color[2], c2.color[2], t);

    stroke(r, g, b);
    point(x, y);
  }
  }
};

// Create the instance
var myp5_1 = new p5(sketch1, 'canvas-container-1'); 