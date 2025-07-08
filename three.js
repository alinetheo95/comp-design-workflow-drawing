// spatial-canvas-sketch.js
// Interactive p5.js sketch: grid, primitives, zoom, and pan

// Zoom Pan Sketch - using p5.js instance mode
var sketch3 = function(p) {
  // All variables are scoped to this instance
  var canvasWidth = 800;
  var canvasHeight = 400;
  var gridSpacing = 40;
  var zoom = 1;
  var offsetX = 0;
  var offsetY = 0;
  var isDragging = false;
  var lastMouseX, lastMouseY;
  var canvas;

  p.setup = function() {
    canvas = p.createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container-3');
  };

  p.draw = function() {
    p.background(250);
    // Apply pan and zoom
    p.translate(p.width / 2 + offsetX, p.height / 2 + offsetY);
    p.scale(zoom);
    p.translate(-p.width / 2, -p.height / 2);

    drawGrid();
    drawPrimitives();
  };

  function drawGrid() {
    p.stroke(200);
    p.strokeWeight(1);
    for (var x = 0; x <= p.width; x += gridSpacing) {
      p.line(x, 0, x, p.height);
    }
    for (var y = 0; y <= p.height; y += gridSpacing) {
      p.line(0, y, p.width, y);
    }
  }

  function drawPrimitives() {
    // Rectangle
    p.fill(255, 100, 100);
    p.rect(120, 80, 100, 60);
    // Ellipse
    p.fill(100, 180, 255);
    p.ellipse(350, 200, 90, 90);
    // Line
    p.stroke(80, 200, 120);
    p.strokeWeight(4);
    p.line(500, 100, 700, 300);
    // Triangle
    p.noStroke();
    p.fill(255, 220, 80);
    p.triangle(600, 80, 750, 60, 700, 200);
  }

  p.mouseWheel = function(event) {
    // Only zoom if mouse is over this canvas
    if (canvas && canvas.elt.matches(':hover')) {
      var zoomFactor = 1.05;
      if (event.delta > 0) {
        zoom /= zoomFactor;
      } else {
        zoom *= zoomFactor;
      }
      zoom = p.constrain(zoom, 0.2, 5);
      return false;
    }
  };

  p.mousePressed = function() {
    // Only start panning if mouse is over this canvas
    if (canvas && canvas.elt.matches(':hover') && p.mouseButton === p.LEFT && p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      isDragging = true;
      lastMouseX = p.mouseX;
      lastMouseY = p.mouseY;
    }
  };

  p.mouseDragged = function() {
    // Pan with left mouse button
    if (isDragging && canvas && canvas.elt.matches(':hover')) {
      offsetX += p.mouseX - lastMouseX;
      offsetY += p.mouseY - lastMouseY;
      lastMouseX = p.mouseX;
      lastMouseY = p.mouseY;
    }
  };

  p.mouseReleased = function() {
    isDragging = false;
  };
};

// Create the instance
var myp5_3 = new p5(sketch3, 'canvas-container-3'); 