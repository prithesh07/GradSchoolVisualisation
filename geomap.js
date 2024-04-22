function CreateGeoMap(reducedData) {
    // Define the map bounds to prevent infinite panning or spanning
    var southWest = L.latLng(-80, -170); // Southwestern boundary
    var northEast = L.latLng(80, 170); // Northeastern boundary
    var bounds = L.latLngBounds(southWest, northEast); // Define map bounds

    // Initialize Leaflet map with a default view and set bounds
    var map = L.map('map', {
        worldCopyJump: false, // Prevents map repetition
        continuousWorld: false, // Prevents infinite scrolling
        noWrap: true, // Stops map from wrapping horizontally
        maxBounds: bounds, // Limits panning within defined bounds
        maxZoom: 10, // Maximum zoom level
        minZoom: 1, // Minimum zoom level
    }).setView([28, 0], 1); // Default view and zoom level

    // Set the bounds to limit the map's panning
    map.setMaxBounds(bounds);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Define custom circle marker
    var customMarker = L.divIcon({
        className: 'custom-div-icon',
        html: `
            <svg width="5" height="5" viewBox="0 0 5 5" xmlns="http://www.w3.org/2000/svg">
                <circle cx="2.5" cy="2.5" r="2.5" fill="red" opacity="0.5" />
            </svg>
        `,
        iconSize: [10, 10], // Defines the overall size of the icon
        iconAnchor: [5, 5], // Positions the icon's anchor in the middle
    });

    // Load GeoJSON data for country borders
    $.getJSON('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson', function (data) {
        L.geoJson(data, {
            style: function (feature) {
                return {
                    color: 'gray', // Default path color
                    weight: 1, // Default stroke width
                    dashArray: '3', // Optional: adds a dashed pattern to the path
                };
            },
            onEachFeature: function (feature, layer) {
                // Highlight border when a country is clicked
                layer.on('click', function (e) {
                    console.log("clicked feature", feature.properties.sovereignt)
                    //function to create bar will be called here
                    //CreateBarChart(feature.properties.sovereignt);
                    layer.setStyle({
                        weight: 1, // Stroke width when clicked
                        color: 'blue', // Border color when clicked
                        dashArray: '', // Remove dashes
                    });
                });
            },
        }).addTo(map);
    });

    // Add university markers to the map
    reducedData.forEach(function (row) {
        var lat = parseFloat(row.Latitude);
        var lon = parseFloat(row.Longitude);
        var institutionName = row.InstitutionName;

        if (!isNaN(lat) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            L.marker([lat, lon], { icon: customMarker })
                .addTo(map)
                .bindPopup(`University: ${institutionName}`);
        }
    });
}
