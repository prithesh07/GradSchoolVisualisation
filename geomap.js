function CreateGeoMap(reducedData) {
    // Initialize Leaflet map with a default view
    var map = L.map('map').setView([0, 0], 1);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© Esri',
    }).addTo(map);

    // Custom SVG triangle marker
    var customMarker = L.divIcon({
        className: 'custom-div-icon',
        html: `
            <svg width="5" height="5" viewBox="0 0 5 5" xmlns="http://www.w3.org/2000/svg">
                <circle cx="2.5" cy="2.5" r="2.5" fill="red" opacity="0.5"/>
            </svg>
        `,
        iconSize: [10, 10], // Defines the overall size of the icon
        iconAnchor: [5, 5], // Positions the icon's anchor in the middle
    });

    reducedData.forEach(function (row) {
        console.log("GeoMap - row", row)
        var lat = parseFloat(row.Latitude);
        var lon = parseFloat(row.Longitude);
        var institutionName = row.InstitutionName; // Get the university name from the CSV

        // Check if the latitude and longitude are valid numbers within range
        if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            // Create a new marker and add it to the map
            L.marker([lat, lon], { icon: customMarker }).addTo(map)
                .bindPopup(`University: ${institutionName}`); // Display university name in the popup
        } else {
            console.error(`Invalid coordinates for row: ${JSON.stringify(row)}`);
        }
    });

}
