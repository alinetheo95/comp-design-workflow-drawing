// D3.js visualization code
function createD3Visualization() {
  // Set dimensions
  const width = 800;
  const height = 600;
  const margin = {top: 20, right: 30, bottom: 40, left: 40};

  // Create SVG element in the container
  const svg = d3.select("#d3-container-1")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Your D3.js code here
  // Example: simple circle
  svg.append("circle")
     .attr("cx", width/2)
     .attr("cy", height/2)
     .attr("r", 50)
     .style("fill", "steelblue");
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', createD3Visualization);