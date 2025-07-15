// d3-visualization-relational.js
// Network diagram showing relationships between flooding, human systems, and vulnerable areas

document.addEventListener('DOMContentLoaded', function() {
    console.log('Loading flooding network diagram...');
    
    // Check if D3 is available
    if (typeof d3 === 'undefined') {
        console.error('D3.js is not loaded');
        return;
    }
    
    console.log('D3 is available, creating network diagram...');
    createFloodingNetworkDiagram();
});

function createFloodingNetworkDiagram() {
    console.log('Creating circular flooding network diagram...');
    
    // Set up dimensions
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2 - 80;

    // Clear any existing visualization
    d3.select("#d3-container-2").selectAll("*").remove();

    // Create SVG
    const svg = d3.select("#d3-container-2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "#000000");

    const g = svg.append("g")
        .attr("transform", `translate(${(width + margin.left + margin.right) / 2},${(height + margin.top + margin.bottom) / 2})`);

    // Your exact color palette
    const colors = ["#d98948", "#f36e37", "#f15f35", "#ef423a", "#ec2c3d", "#e52364", "#d01c67", "#816182", "#5c405b", "#4f2f3f"];

    // Define your categories
    const categories = [
        { name: "Human", color: "#d98948", connections: 8 },
        { name: "Climate\nChange", color: "#d98948", connections: 6 },
        { name: "Increased\nFlooding", color: "#f36e37", connections: 7 },
        { name: "Areas\nAffected", color: "#f15f35", connections: 5 },
        { name: "Community", color: "#ef423a", connections: 4 },
        { name: "Built\nEnvironment", color: "#ec2c3d", connections: 6 },
        { name: "Physical\nInfrastructure", color: "#e52364", connections: 5 },
        { name: "Natural\nEnvironment", color: "#d01c67", connections: 4 },
        { name: "Higher\nTemperatures", color: "#816182", connections: 3 },
        { name: "Digital\nInfrastructure", color: "#5c405b", connections: 2 },
        { name: "AI Systems", color: "#4f2f3f", connections: 5 }
    ];

    // Create connection matrix (simplified)
    const connections = [
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1], // Human
        [1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1], // Climate Change
        [1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0], // Increased Flooding
        [1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0], // Areas Affected
        [1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1], // Community
        [1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1], // Built Environment
        [1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1], // Physical Infrastructure
        [1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0], // Natural Environment
        [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Higher Temperatures
        [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1], // Digital Infrastructure
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]  // AI Systems
    ];

    // Calculate positions around the circle
    const angleStep = (2 * Math.PI) / categories.length;
    categories.forEach((d, i) => {
        const angle = i * angleStep - Math.PI / 2;
        d.x = Math.cos(angle) * radius;
        d.y = Math.sin(angle) * radius;
        d.angle = angle;
        d.index = i;
    });

    // Create curved connections
    const connectionPaths = [];
    for (let i = 0; i < categories.length; i++) {
        for (let j = i + 1; j < categories.length; j++) {
            if (connections[i][j]) {
                connectionPaths.push({
                    source: categories[i],
                    target: categories[j],
                    strength: Math.random() * 0.5 + 0.3 // Random strength for visual variety
                });
            }
        }
    }

    // Create gradient definitions for connections
    const defs = svg.append("defs");
    connectionPaths.forEach((d, i) => {
        const gradient = defs.append("linearGradient")
            .attr("id", `gradient-${i}`)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", d.source.x)
            .attr("y1", d.source.y)
            .attr("x2", d.target.x)
            .attr("y2", d.target.y);

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", d.source.color)
            .attr("stop-opacity", 0.6);

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", d.target.color)
            .attr("stop-opacity", 0.6);
    });

    // Draw connections first (so they appear behind nodes)
    const connectionGroup = g.append("g").attr("class", "connections");
    
    connectionPaths.forEach((d, i) => {
        // Create curved path
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 0.7; // Curve amount
        
        const path = connectionGroup.append("path")
            .attr("d", `M ${d.source.x} ${d.source.y} A ${dr} ${dr} 0 0 1 ${d.target.x} ${d.target.y}`)
            .attr("stroke", `url(#gradient-${i})`)
            .attr("stroke-width", d.strength * 6)
            .attr("fill", "none")
            .attr("opacity", 0.9);
    });

    // Create node groups
    const nodeGroup = g.append("g").attr("class", "nodes");
    
    const nodes = nodeGroup.selectAll(".node")
        .data(categories)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x}, ${d.y})`);

    // Add circles for each category
    nodes.append("circle")
        .attr("r", d => 25 + d.connections * 5) // Size based on connections
        .attr("fill", d => d.color)
        .attr("opacity", 0.8)
        .style("cursor", "pointer");

    // Add labels
    nodes.each(function(d) {
        const lines = d.name.split('\n');
        const textGroup = d3.select(this);
    
        lines.forEach((line, i) => {
            textGroup.append("text")
                .text(line)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("dy", (i - (lines.length - 1) / 2) * 12) // Adjust line spacing
                .attr("fill", "#ffffff")
                .attr("font-size", "10px")
                .attr("font-family", "Courier New, monospace")
                .attr("font-weight", "bold")
                .style("text-shadow", "1px 1px 2px rgba(228, 228, 228, 0.8)")
                .style("pointer-events", "none");
    });
});


    // Add hover effects
    nodes.on("mouseover", function(event, d) {
        // Highlight connected paths
        connectionGroup.selectAll("path")
            .transition()
            .duration(200)
            .attr("opacity", path => {
                const pathData = connectionPaths[connectionGroup.selectAll("path").nodes().indexOf(path)];
                return (pathData.source === d || pathData.target === d) ? 0.8 : 0.1;
            });

        // Enlarge hovered node
        d3.select(this).select("circle")
            .transition()
            .duration(200)
            .attr("r", 20 + d.connections * 2 + 5);

        showNetworkTooltip(event, d);
    })
    .on("mouseout", function(event, d) {
        // Reset all connections
        connectionGroup.selectAll("path")
            .transition()
            .duration(200)
            .attr("opacity", 0.4);

        // Reset node size
        d3.select(this).select("circle")
            .transition()
            .duration(200)
            .attr("r", 20 + d.connections * 2);

        hideNetworkTooltip();
    });

    // Add animations
    nodes.selectAll("circle")
        .style("opacity", 0)
        .attr("r", 0)
        .transition()
        .duration(1000)
        .delay((d, i) => i * 100)
        .style("opacity", 0.9)
        .attr("r", d => 25 + d.connections * 6)
        .ease(d3.easeElastic);

    connectionGroup.selectAll("path")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .delay(500)
        .style("opacity", 0.6);

    nodes.selectAll("text")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100 + 800)
        .style("opacity", 1);
}

// Tooltip functions for network diagram
let networkTooltip = null;

function showNetworkTooltip(event, d) {
    if (!networkTooltip) {
        networkTooltip = d3.select("body")
            .append("div")
            .attr("class", "network-tooltip")
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.9)")
            .style("color", "white")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("border", "2px solid " + d.color)
            .style("font-family", "Courier New, monospace");
    }
    
    networkTooltip.transition()
        .duration(200)
        .style("opacity", 1);
    
    const descriptions = {
        "human": "Central node representing human communities and decision-making systems",
        "natural_env": "Natural ecosystems and environmental conditions",
        "climate_change": "Long-term shifts in global climate patterns",
        "higher_temp": "Rising temperatures due to climate change",
        "increased_flooding": "More frequent and severe flooding events",
        "built_env": "Human-constructed spaces and infrastructure",
        "physical_infra": "Roads, buildings, utilities, and physical systems",
        "digital_infra": "Communication networks, data systems, and technology",
        "community": "Local neighborhoods and social networks",
        "areas_affected": "Geographic regions impacted by flooding",
        "ai_systems": "Artificial intelligence and monitoring technologies"
    };
    
    networkTooltip.html(`
        <strong>${d.name}</strong><br>
        Type: ${d.type}<br>
        ${descriptions[d.id] || 'Network component'}
    `)
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 10) + "px");
}

function hideNetworkTooltip() {
    if (networkTooltip) {
        networkTooltip.transition()
            .duration(200)
            .style("opacity", 0);
    }
}