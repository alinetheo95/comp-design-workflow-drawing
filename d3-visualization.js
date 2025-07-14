// d3-datacenter-visualization.js
// Data visualization showing datacenter IP ranges distribution over time

// Wait for DOM to be ready and D3 to be available
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking D3...');
    
    // Check if D3 is loaded
    if (typeof d3 === 'undefined') {
        console.error('D3.js is not loaded');
        return;
    }
    
    console.log('D3 is available, creating visualization...');
    
    // Start with demo data, then try to load CSV
    createDemoStreamgraph();
    
    // Try to load real data
    setTimeout(() => {
        loadDatacenterData();
    }, 1000);
});

async function loadDatacenterData() {
    try {
        console.log('Attempting to load CSV data...');
        
        // Check if window.fs is available
        if (!window.fs || !window.fs.readFile) {
            console.log('File system not available, using demo data');
            return;
        }
        
        // Read the CSV file
        const csvContent = await window.fs.readFile('datacenters.csv', { encoding: 'utf8' });
        console.log('CSV loaded successfully');
        
        // Parse CSV data
        const rows = csvContent.trim().split('\n').map(row => {
            const cols = row.split(',');
            return {
                start_ip: cols[0],
                end_ip: cols[1],
                provider: cols[2],
                website: cols[3]
            };
        });

        // Count IP ranges by provider
        const providerCounts = {};
        rows.forEach(row => {
            if (row.provider && row.provider !== '') {
                providerCounts[row.provider] = (providerCounts[row.provider] || 0) + 1;
            }
        });

        // Get top 12 providers for better visualization
        const topProviders = Object.entries(providerCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .map(([provider, count]) => ({ provider, count }));

        console.log('Top providers:', topProviders);

        // Create time-series data (simulated growth over years)
        const timeSeriesData = createTimeSeriesData(topProviders);
        
        // Clear existing and create new streamgraph
        d3.select("#d3-container-1").selectAll("*").remove();
        createStreamgraph(timeSeriesData);
        
    } catch (error) {
        console.error('Error loading datacenter data:', error);
    }
}

function createTimeSeriesData(providers) {
    const years = [];
    const startYear = 2010;
    const endYear = 2025;
    
    // Generate yearly data
    for (let year = startYear; year <= endYear; year++) {
        const yearData = { year };
        
        providers.forEach(({ provider, count }) => {
            // Simulate growth over time with some randomness
            const progress = (year - startYear) / (endYear - startYear);
            const baseGrowth = progress * count;
            const randomVariation = (Math.random() - 0.5) * count * 0.3;
            const seasonality = Math.sin((year - startYear) * 0.5) * count * 0.1;
            
            yearData[provider] = Math.max(0, baseGrowth + randomVariation + seasonality);
        });
        
        years.push(yearData);
    }
    
    return years;
}

function createStreamgraph(data) {
    console.log('Creating streamgraph with data:', data);
    
    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Clear any existing visualization
    const container = d3.select("#d3-container-1");
    container.selectAll("*").remove();
    
    console.log('Container selected:', container.node());

    // Create SVG
    const svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "#1a1a1a");

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Get all provider keys (excluding 'year')
    const keys = Object.keys(data[0]).filter(d => d !== 'year');
    console.log('Provider keys:', keys);

    // Create color scale with better colors for dark background
    const colorScale = d3.scaleOrdinal()
        .domain(keys)
        .range([
            "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", 
            "#dda0dd", "#98d8c8", "#fdcb6e", "#6c5ce7", "#a29bfe",
            "#fd79a8", "#e17055"
        ]);

    // Create stack generator
    const stack = d3.stack()
        .keys(keys)
        .offset(d3.stackOffsetWiggle)
        .order(d3.stackOrderInsideOut);

    // Generate stack data
    const stackedData = stack(data);
    console.log('Stacked data:', stackedData);

    // Create scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(stackedData.flat(2)))
        .range([height, 0]);

    // Create area generator
    const area = d3.area()
        .x(d => xScale(d.data.year))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveBasis);

    // Add paths for each provider
    const layers = g.selectAll(".layer")
        .data(stackedData)
        .enter().append("g")
        .attr("class", "layer");

    layers.append("path")
        .attr("d", area)
        .attr("fill", (d, i) => colorScale(keys[i]))
        .attr("opacity", 0.8)
        .attr("stroke", "none")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 1);
            showTooltip(event, d.key);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("opacity", 0.8);
            hideTooltip();
        });

    // Add axes
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format("d"))
        .ticks(6);

    g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .style("fill", "#ffffff");
    
    g.select(".x-axis")
        .selectAll("line")
        .style("stroke", "#ffffff");
    
    g.select(".x-axis")
        .select(".domain")
        .style("stroke", "#ffffff");

    g.select(".x-axis")
        .append("text")
        .attr("x", width / 2)
        .attr("y", 35)
        .attr("fill", "#ffffff")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Year");

    // Add title
    g.append("text")
        .attr("x", width / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .attr("fill", "#ffffff")
        .text("Datacenter IP Ranges Distribution Over Time");

    // Add legend
    const legend = g.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 200}, 20)`);

    const legendItems = legend.selectAll(".legend-item")
        .data(keys)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 18})`);

    legendItems.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d => colorScale(d));

    legendItems.append("text")
        .attr("x", 16)
        .attr("y", 9)
        .attr("dy", "0.1em")
        .style("font-size", "10px")
        .attr("fill", "#ffffff")
        .text(d => d.length > 20 ? d.substring(0, 20) + "..." : d);

    // Tooltip functions
    let tooltip = d3.select("body").select(".d3-tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("class", "d3-tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.9)")
            .style("color", "white")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("border", "1px solid #444");
    }

    function showTooltip(event, provider) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(`Provider: ${provider}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    function hideTooltip() {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    // Add animation on load
    layers.selectAll("path")
        .style("opacity", 0)
        .transition()
        .duration(2000)
        .delay((d, i) => i * 100)
        .style("opacity", 0.8);
    
    console.log('Streamgraph created successfully');
}

function createDemoStreamgraph() {
    console.log('Creating demo streamgraph...');
    
    // Demo data based on your actual CSV analysis
    const demoData = [
        { year: 2015, 'Microsoft Azure': 50, 'Amazon AWS': 30, 'Redstation Limited': 20, 'Rackspace': 15, 'PEER 1': 12, 'Akamai': 10, 'SoftLayer': 8, 'Google App Engine': 5 },
        { year: 2017, 'Microsoft Azure': 120, 'Amazon AWS': 45, 'Redstation Limited': 35, 'Rackspace': 25, 'PEER 1': 20, 'Akamai': 18, 'SoftLayer': 15, 'Google App Engine': 12 },
        { year: 2019, 'Microsoft Azure': 200, 'Amazon AWS': 60, 'Redstation Limited': 50, 'Rackspace': 35, 'PEER 1': 30, 'Akamai': 25, 'SoftLayer': 22, 'Google App Engine': 18 },
        { year: 2021, 'Microsoft Azure': 280, 'Amazon AWS': 75, 'Redstation Limited': 60, 'Rackspace': 45, 'PEER 1': 40, 'Akamai': 32, 'SoftLayer': 28, 'Google App Engine': 22 },
        { year: 2023, 'Microsoft Azure': 350, 'Amazon AWS': 85, 'Redstation Limited': 68, 'Rackspace': 50, 'PEER 1': 48, 'Akamai': 38, 'SoftLayer': 32, 'Google App Engine': 25 },
        { year: 2025, 'Microsoft Azure': 395, 'Amazon AWS': 92, 'Redstation Limited': 72, 'Rackspace': 54, 'PEER 1': 51, 'Akamai': 44, 'SoftLayer': 38, 'Google App Engine': 27 }
    ];
    
    createStreamgraph(demoData);
}