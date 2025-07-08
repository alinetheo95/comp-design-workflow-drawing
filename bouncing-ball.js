var sketch2 = function(p) {
  var canvas;
  var circles = [];
  var radius = 35;
  var canvasWidth = 800;
  var canvasHeight = 400;

  p.setup = function() {
    canvas = p.createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container-2'); // same container as the old ball sketch
    p.angleMode(p.DEGREES);

    // Circle data with color and initial random velocity
    let baseData = [
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

    for (let data of baseData) {
      circles.push({
        x: data.x,
        y: data.y,
        color: data.color,
        dx: p.random(-3, 3),
        dy: p.random(-3, 3)
      });
    }
  };

  p.draw = function() {
    p.background(0);
    updateCirclePositions();
    drawGradientConnections();
    drawAllCircles();
  };

  function updateCirclePositions() {
    for (let c of circles) {
      c.x += c.dx;
      c.y += c.dy;

      // Bounce on canvas edges
      if (c.x - radius < 0 || c.x + radius > p.width) c.dx *= -1;
      if (c.y - radius < 0 || c.y + radius > p.height) c.dy *= -1;
    }
  }

  function drawAllCircles() {
    for (let c of circles) {
      p.noStroke();
      p.fill(...c.color);
      p.circle(c.x, c.y, radius * 2);
    }
  }

  function drawGradientConnections() {
    p.strokeWeight(2);
    for (let i = 0; i < circles.length - 1; i++) {
      drawGradientLine(circles[i], circles[i + 1], 50);
    }
  }

  function drawGradientLine(c1, c2, steps) {
    for (let i = 0; i < steps; i++) {
      let t = i / (steps - 1);
      let x = p.lerp(c1.x, c2.x, t);
      let y = p.lerp(c1.y, c2.y, t);
      let r = p.lerp(c1.color[0], c2.color[0], t);
      let g = p.lerp(c1.color[1], c2.color[1], t);
      let b = p.lerp(c1.color[2], c2.color[2], t);
      p.stroke(r, g, b);
      p.point(x, y);
    }
  }
};

// Create the instance and attach to canvas-container-2
var myp5_2 = new p5(sketch2, 'canvas-container-2');