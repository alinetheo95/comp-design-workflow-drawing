// Bouncing Ball Sketch - using p5.js instance mode
var sketch2 = function(p) {
  // All variables are scoped to this instance
  var x, y; // Ball position
  var dx, dy; // Ball velocity
  var radius = 30; // Ball radius

  p.setup = function() {
    // Create the canvas and attach it to the container
    var canvas = p.createCanvas(800, 400);
    canvas.parent('canvas-container-2');

    // Initialize ball position and velocity
    x = p.width / 2;
    y = p.height / 2;
    dx = 4;
    dy = 3;
  };

  p.draw = function() {
    // Clear the background
    p.background(240);

    // Draw the ball
    p.fill(100, 180, 255);
    p.noStroke();
    p.ellipse(x, y, radius * 2);

    // Update ball position
    x += dx;
    y += dy;

    // Bounce off the edges
    if (x - radius < 0 || x + radius > p.width) {
      dx *= -1;
    }
    if (y - radius < 0 || y + radius > p.height) {
      dy *= -1;
    }
  };
};

// Create the instance
var myp5_2 = new p5(sketch2, 'canvas-container-2'); 