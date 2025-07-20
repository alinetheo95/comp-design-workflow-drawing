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
    // Create a marker
    const marker = new mapboxgl.Marker({
        color: '#666',    // Marker color
        scale: 1.0        // Marker size
    })
    .setLngLat([-73.9855, 40.7580])  // Position
    .setPopup(new mapboxgl.Popup().setHTML('<h3>Times Square</h3>'))
    .addTo(map);  // Add to map

// Add subway lines GeoJSON
    fetch('nyu-2451-34758-geojson.json')  // Ensure this file is in the same directory
        .then(res => res.json())
        .then(data => {
            map.addSource('subway-lines', {
                type: 'geojson',
                data: data
            });

            map.addLayer({
                id: 'subway-lines-layer',
                type: 'line',
                source: 'subway-lines',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#FF5733',
                    'line-width': 2
                }
            });
        })
        .catch(err => console.error('Error loading subway lines:', err));

});

