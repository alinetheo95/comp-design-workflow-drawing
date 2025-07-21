// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYWxpbmV0aGVvIiwiYSI6ImNtZDZrbzFyeDBhd2Uya3BzejF4ZHh2MDIifQ.vz9lDJXrEO9vAAlfW4ngPQ';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'mapbox-container-1',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-74.006, 40.7128], // New York City
    zoom: 11
});

// Navigation controls (zoom in/out, compass)
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// Fullscreen button
map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

// Scale bar
map.addControl(new mapboxgl.ScaleControl({
    maxWidth: 80,
    unit: 'metric'
}), 'bottom-left');

 // Wait for map to load before adding markers
map.on('load', () => {

    // Load subway stations GeoJSON (Point geometry)
    fetch('subway-stations.geojson')
        .then(response => {
            console.log('Fetch status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Subway stations GeoJSON loaded:', data);
            console.log('Number of stations:', data.features ? data.features.length : 0);
            
            // Add the GeoJSON source
            map.addSource('subway-stations', {
                type: 'geojson',
                data: data
            });

            // Add circle layer for Point geometry (subway stations)
            map.addLayer({
                id: 'subway-stations-layer',
                type: 'circle',
                source: 'subway-stations',
                paint: {
                    'circle-color': [
                        'case',
                        // Color by line if the property exists
                        ['has', 'line'], 
                        [
                            'match',
                            ['get', 'line'],
                            'A', '#0039A6',
                            'B', '#FF6319', 
                            'C', '#0039A6',
                            'D', '#FF6319',
                            'E', '#0039A6',
                            'F', '#FF6319',
                            'G', '#6CBE45',
                            'J', '#996633',
                            'L', '#A7A9AC',
                            'M', '#FF6319',
                            'N', '#FCCC0A',
                            'Q', '#FCCC0A',
                            'R', '#FCCC0A',
                            'S', '#808183',
                            'W', '#FCCC0A',
                            'Z', '#996633',
                            '1', '#EE352E',
                            '2', '#EE352E',
                            '3', '#EE352E',
                            '4', '#00933C',
                            '5', '#00933C',
                            '6', '#00933C',
                            '7', '#B933AD',
                            '#FF5733' // default color
                        ],
                        '#816182' // default purple if no line property
                    ],
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        10, 3,  // At zoom 10, radius = 3px
                        15, 6,  // At zoom 15, radius = 6px
                        18, 10  // At zoom 18, radius = 10px
                    ],
                    'circle-stroke-color': '#FFFFFF',
                    'circle-stroke-width': 1,
                    'circle-opacity': 0.8
                }
            });

            // Calculate bounds to fit all subway stations
            const bounds = new mapboxgl.LngLatBounds();
            let stationCount = 0;
            
            if (data.features) {
                data.features.forEach(feature => {
                    if (feature.geometry && feature.geometry.type === 'Point') {
                        bounds.extend(feature.geometry.coordinates);
                        stationCount++;
                    }
                });
                
                console.log(`Processed ${stationCount} subway stations`);
                
                // Fit map to show all subway stations
                if (!bounds.isEmpty()) {
                    map.fitBounds(bounds, { 
                        padding: 50,
                        maxZoom: 13 // Don't zoom in too much
                    });
                    console.log('Map fitted to subway stations bounds');
                } else {
                    console.warn('No valid coordinates found to fit bounds');
                }
            }
            
            console.log('Subway stations layer added successfully!');
        })
        .catch(error => {
            console.error('Error loading subway stations:', error);
            
            // Specific error guidance
            if (error.message.includes('404')) {
                console.error('❌ API endpoint not found');
            } else if (error.message.includes('Failed to fetch')) {
                console.error('❌ Network error or CORS issue');
            }
        });
});

// Add click handler to show station info
map.on('click', 'subway-stations-layer', (e) => {
    const properties = e.features[0].properties;
    console.log('Station properties:', properties); // Debug: see what properties exist
    
    // Close any existing popups first
    const existingPopups = document.getElementsByClassName('mapboxgl-popup');
    if (existingPopups.length > 0) {
        // Remove all existing popups
        Array.from(existingPopups).forEach(popup => popup.remove());
    }
    
    let stationName = 'Subway Station';
    let lines = '';
    
    // Parse the HTML description to extract useful information
    if (properties.description) {
        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = properties.description;
        
        // Extract information from the HTML structure
        const listItems = tempDiv.querySelectorAll('li');
        listItems.forEach(item => {
            const nameSpan = item.querySelector('.atr-name');
            const valueSpan = item.querySelector('.atr-value');
            
            if (nameSpan && valueSpan) {
                const fieldName = nameSpan.textContent.trim();
                const fieldValue = valueSpan.textContent.trim();
                
                switch(fieldName) {
                    case 'NAME':
                        stationName = fieldValue;
                        break;
                    case 'LINE':
                        lines = fieldValue;
                        break;
                }
            }
        });
    }
    
    // Fallback: try direct properties if HTML parsing didn't work
    if (stationName === 'Subway Station') {
        stationName = properties.name || properties.station_name || properties.NAME || 'Subway Station';
    }
    if (!lines) {
        lines = properties.line || properties.lines || properties.LINE || '';
    }
    
    console.log('Extracted - Name:', stationName, 'Lines:', lines); // Debug output
    
    // Build the popup HTML with extracted data
    let popupHTML = `<h3 style="margin: 0 0 8px 0; font-size: 14px; color: black;">${stationName}</h3>`;
    
    if (lines) {
        // Split lines by dash and create colored badges
        const lineArray = lines.split('-');
        let lineHTML = '<p style="margin: 0; font-size: 12px; color: black;"><strong>Lines:</strong> ';
        lineArray.forEach((line, index) => {
            const lineColor = getLineColor(line.trim());
            lineHTML += `<span style="background-color: ${lineColor}; color: white; padding: 1px 4px; border-radius: 2px; margin: 1px; font-weight: bold; font-size: 10px;">${line.trim()}</span>`;
        });
        lineHTML += '</p>';
        popupHTML += lineHTML;
    }
    
    new mapboxgl.Popup({
        maxWidth: '200px',
        closeButton: true,
        closeOnClick: false
    })
        .setLngLat(e.lngLat)
        .setHTML(popupHTML)
        .addTo(map);
});

// Helper function to get official MTA line colors
function getLineColor(line) {
    const colors = {
        "1": "#EE352E", "2": "#EE352E", "3": "#EE352E",
        "4": "#00933C", "5": "#00933C", "6": "#00933C", "6X": "#00933C",
        "7": "#B933AD", "7X": "#B933AD",
        "A": "#0039A6", "C": "#0039A6", "E": "#0039A6",
        "B": "#FF6319", "D": "#FF6319", "F": "#FF6319", "M": "#FF6319",
        "G": "#6CBE45",
        "J": "#996633", "Z": "#996633",
        "L": "#A7A9AC",
        "N": "#FCCC0A", "Q": "#FCCC0A", "R": "#FCCC0A", "W": "#FCCC0A",
        "S": "#808183", "SI": "#808183"
    };
    return colors[line] || "#666666";
}

// Change cursor on hover
map.on('mouseenter', 'subway-stations-layer', () => {
    map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'subway-stations-layer', () => {
    map.getCanvas().style.cursor = '';
});
