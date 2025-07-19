// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYWxpbmV0aGVvIiwiYSI6ImNtZDZrbzFyeDBhd2Uya3BzejF4ZHh2MDIifQ.vz9lDJXrEO9vAAlfW4ngPQ';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'mapbox-container-1',
    style: 'mapbox://styles/mapbox/streets-v12',
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
});

// Handle map clicks
map.on('click', (e) => {
    const coordinates = e.lngLat;
    console.log(`Clicked at: ${coordinates.lng}, ${coordinates.lat}`);
    
    // Create popup at click location
    new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`<p>Longitude: ${coordinates.lng}</p>`)
        .addTo(map);
});