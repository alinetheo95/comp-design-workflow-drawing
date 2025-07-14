// d3-visualization.js
// D3.js visualization with color transitions based on CSV data

(function() {
  console.log('D3 script starting...');
  console.log('D3 loaded:', typeof d3 !== 'undefined');
  
  // Your color scheme from the 3D scene
  const colorScheme = [
    [217, 137, 72],   // Orange-brown
    [217, 137, 72],   // Orange-brown (duplicate)
    [243, 110, 55],   // Orange
    [241, 95, 49],    // Orange-red
    [239, 66, 58],    // Red-orange
    [236, 44, 61],    // Red
    [229, 35, 100],   // Red-pink
    [208, 28, 103],   // Pink-red
    [129, 97, 130],   // Purple
    [92, 64, 91],     // Dark purple
    [79, 47, 63],     // Dark purple-brown
  ];

  // Convert RGB arrays to CSS rgb strings
  const colors = colorScheme.map(rgb => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);

  // SVG dimensions and margins - make it larger and responsive
  const margin = { top: 30, right: 50, bottom: 60, left: 70 };
  
  // Function to get responsive dimensions
  function getResponsiveDimensions() {
    const containerWidth = document.getElementById('d3-container-1').clientWidth || 800;
    const responsiveWidth = Math.min(containerWidth - 40, 800); // Max 800px
    const responsiveHeight = responsiveWidth * 0.6; // 60% aspect ratio
    
    return {
      width: responsiveWidth - margin.left - margin.right,
      height: responsiveHeight - margin.top - margin.bottom
    };
  }
  
  // Get initial dimensions
  const dimensions = getResponsiveDimensions();
  const width = dimensions.width;
  const height = dimensions.height;

  // Check if container exists
  const container = d3.select('#d3-container-1');
  console.log('Container found:', !container.empty());

  // Create SVG element with responsive dimensions
  const svg = container
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('background-color', '#000000')
    .style('max-width', '100%')
    .style('height', 'auto');

  console.log('SVG created');

  // Create main group element
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Scales
  let xScale = d3.scaleLinear().range([0, width]);
  let yScale = d3.scaleLinear().range([height, 0]);
  let radiusScale = d3.scaleSqrt().range([8, 40]); // Increased circle sizes
  let colorScale = d3.scaleOrdinal().range(colors);

  // Axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  // Append axis groups
  const xAxisGroup = g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`);

  const yAxisGroup = g.append('g')
    .attr('class', 'y-axis');

  // Tooltip
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.8)')
    .style('color', 'white')
    .style('padding', '8px')
    .style('border-radius', '4px')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .style('z-index', '1000');

  // Generic sample data
  let currentData = [
    { id: 1, x: 10, y: 20, size: 15, category: 'A', value: 100 },
    { id: 2, x: 25, y: 35, size: 25, category: 'B', value: 200 },
    { id: 3, x: 40, y: 15, size: 18, category: 'C', value: 150 },
    { id: 4, x: 55, y: 45, size: 30, category: 'A', value: 300 },
    { id: 5, x: 70, y: 25, size: 12, category: 'D', value: 80 },
    { id: 6, x: 85, y: 40, size: 22, category: 'B', value: 250 },
    { id: 7, x: 15, y: 50, size: 20, category: 'C', value: 180 },
    { id: 8, x: 60, y: 10, size: 28, category: 'D', value: 320 },
    { id: 9, x: 80, y: 30, size: 16, category: 'A', value: 120 },
    { id: 10, x: 35, y: 55, size: 24, category: 'B', value: 280 },
    { id: 11, x: 90, y: 20, size: 14, category: 'C', value: 90 }
  ];

  // Function to update visualization
  function updateVisualization(data) {
    console.log('Updating visualization with data:', data.length, 'points');

    // Update scales based on data
    xScale.domain(d3.extent(data, d => d.x));
    yScale.domain(d3.extent(data, d => d.y));
    radiusScale.domain(d3.extent(data, d => d.size));
    colorScale.domain([...new Set(data.map(d => d.category))]);

    // Update axes with smooth transition
    xAxisGroup.transition()
      .duration(1000)
      .call(xAxis);

    yAxisGroup.transition()
      .duration(1000)
      .call(yAxis);

    // Bind data to circles
    const circles = g.selectAll('.data-circle')
      .data(data, d => d.id);

    // Remove exiting circles
    circles.exit()
      .transition()
      .duration(800)
      .attr('r', 0)
      .style('opacity', 0)
      .remove();

    // Add new circles
    const circlesEnter = circles.enter()
      .append('circle')
      .attr('class', 'data-circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 0)
      .style('fill', d => colorScale(d.category))
      .style('opacity', 0)
      .style('cursor', 'pointer');

    // Merge enter and update selections
    const circlesUpdate = circlesEnter.merge(circles);

    // Animate circles to new positions
    circlesUpdate.transition()
      .duration(1200)
      .ease(d3.easeElastic.period(0.4))
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', d => radiusScale(d.size))
      .style('fill', d => colorScale(d.category))
      .style('opacity', 0.8);

    // Add hover interactions
    circlesUpdate
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', radiusScale(d.size) * 1.3)
          .style('opacity', 1)
          .style('stroke', '#333')
          .style('stroke-width', 2);

        tooltip.transition()
          .duration(200)
          .style('opacity', .9);

        tooltip.html(`
          <strong>Category:</strong> ${d.category}<br/>
          <strong>Value:</strong> ${d.value}<br/>
          <strong>Size:</strong> ${d.size}<br/>
          <strong>Position:</strong> (${d.x.toFixed(1)}, ${d.y.toFixed(1)})
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', radiusScale(d.size))
          .style('opacity', 0.8)
          .style('stroke', 'none');

        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      })
      .on('click', function(event, d) {
        // Add click animation
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', radiusScale(d.size) * 1.5)
          .transition()
          .duration(150)
          .attr('r', radiusScale(d.size));

        console.log('Clicked circle:', d);
      });

    console.log('Visualization updated');
  }

  // Function to load CSV data
  function loadCSVData(csvFile) {
    console.log('Attempting to load CSV:', csvFile);
    d3.csv(csvFile).then(function(data) {
      console.log('CSV loaded successfully:', data);
      // Process CSV data - adjust these column names to match your CSV
      const processedData = data.map((d, i) => ({
        id: i + 1,
        x: +d.x_column || Math.random() * 100,  // Replace 'x_column' with actual column name
        y: +d.y_column || Math.random() * 60,   // Replace 'y_column' with actual column name
        size: +d.size_column || Math.random() * 30 + 5,  // Replace 'size_column' with actual column name
        category: d.category_column || 'Unknown',  // Replace 'category_column' with actual column name
        value: +d.value_column || Math.random() * 400   // Replace 'value_column' with actual column name
      }));

      updateVisualization(processedData);
    }).catch(function(error) {
      console.log('Error loading CSV:', error);
      console.log('Using sample data instead');
      updateVisualization(currentData);
    });
  }

  // Function to generate random data for demo
  function generateRandomData() {
    const categories = ['A', 'B', 'C', 'D'];
    const newData = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      x: Math.random() * 100,
      y: Math.random() * 60,
      size: Math.random() * 25 + 5,
      category: categories[Math.floor(Math.random() * categories.length)],
      value: Math.random() * 400 + 50
    }));
    
    console.log('Generated new random data');
    updateVisualization(newData);
  }

  // Initialize visualization with sample data
  console.log('Initializing visualization...');
  updateVisualization(currentData);

  // Auto-update demo every 4 seconds
  setInterval(generateRandomData, 4000);

  // Expose functions globally for external use
  window.d3Viz = {
    loadCSV: loadCSVData,
    updateData: updateVisualization,
    generateDemo: generateRandomData
  };

  console.log('D3 visualization setup complete!');

  // Try to load your CSV after everything is set up
  setTimeout(() => {
    console.log('Attempting to load datacenters.csv...');
    loadCSVData('datacenters.csv');
  }, 1000);

})();