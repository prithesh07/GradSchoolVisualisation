var redMarker = L.divIcon({
    className: 'custom-div-icon',
    html: `
        <svg width="5" height="5" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" r="2.5" fill="red" opacity="0.75" />
        </svg>
    `,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
});

var yellowMarker = L.divIcon({
    className: 'custom-div-icon',
    html: `
        <svg width="10" height="10" viewBox="0 0 10 10">
            <circle cx="5" cy="5" r="5" fill="yellow" opacity="1" />
        </svg>
    `,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
});


var map;
var markers = []; // Store markers here

function CreateGeoMap(reducedData) {
    if (!Array.isArray(reducedData)) {
        console.error("Reduced data is not an array");
        return;
    }

    var southWest = L.latLng(-80, -170);
    var northEast = L.latLng(80, 170);
    var bounds = L.latLngBounds(southWest, northEast);

    // Initialize the map
    map = L.map('map', {
        worldCopyJump: false,
        continuousWorld: false,
        noWrap: true,
        maxBounds: bounds,
        maxZoom: 10,
        minZoom: 1,
    }).setView([28, 0], 1);

    map.setMaxBounds(bounds);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    $.getJSON('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson', function (data) {
        const countryLayer = L.geoJson(data, {
            style: function (feature) {
                const isInRadarUni = radarUni.includes(feature.properties.sovereignt);
                return {
                    color: isInRadarUni ? 'blue' : 'gray',
                    weight: 1,
                    dashArray: '3',
                };
            },
            onEachFeature: function (feature, layer) {
                const countryName = feature.properties.sovereignt;

                layer.on('click', function () {
                    const existingIndex = radarUni.indexOf(countryName);

                    if (existingIndex !== -1) {
                        if (radarUni.length != 1) {
                            radarUni.splice(existingIndex, 1);
                            layer.setStyle({
                                color: 'gray',
                                weight: 1,
                            });
                        }

                    } else {
                        if (radarUni.length >= 5) {
                            const removedCountry = radarUni.shift();
                            // Find the layer with the removed country and set it to grey
                            countryLayer.eachLayer(function (l) {
                                if (l.feature.properties.sovereignt === removedCountry) {
                                    l.setStyle({
                                        color: 'gray',
                                        weight: 1,
                                    });
                                }
                            });
                        }

                        radarUni.push(countryName);
                        layer.setStyle({
                            color: 'blue',
                            weight: 1,
                        });
                    }
                    drawRadar(reducedData); // Update any visualizations depending on radarUni
                });
            },
        });

        countryLayer.addTo(map);
    });

    plotDots(reducedData);
}

var markerColors = new Map(); // A map to keep track of the marker colors

function plotDots(reducedData) {
    // Remove existing markers before plotting new ones
    markers.forEach(function (marker) {
        map.removeLayer(marker);
    });
    markers = []; // Clear the array

    reducedData.forEach(function (row) {
        var lat = parseFloat(row.Latitude);
        var lon = parseFloat(row.Longitude);
        var score = parseFloat(row.OverallScore);
        var rank2023 = parseFloat(row["2023 RANK"]);
        var rank2024 = parseFloat(row["2024 RANK"]);
        var institutionName = row.InstitutionName;

        if (!isNaN(lat) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            // Determine the initial icon based on lineChartUni
            var icon = lineChartUni.includes(institutionName) ? yellowMarker : redMarker;

            var marker = L.marker([lat, lon], { icon: icon }) // Set icon based on lineChartUni
                .addTo(map)
                .bindPopup(`University: ${institutionName}`);

            // Store the marker in the array
            markers.push(marker);

            // Initialize the marker's color in the map
            markerColors.set(marker, icon); // Track the marker's initial color

            // Add a click event listener to the marker
            marker.on('click', function () {
                drawCircle(score, institutionName, rank2023, rank2024);

                // Manage the university name in lineChartUni
                const existingIndex = lineChartUni.indexOf(institutionName);

                if (existingIndex !== -1) {
                    if (lineChartUni.length != 1) {

                        // If it exists, remove from lineChartUni and change marker to red
                        lineChartUni.splice(existingIndex, 1);
                        marker.setIcon(redMarker);
                        markerColors.set(marker, redMarker); // Update the map

                    }
                } else {
                    // If it doesn't exist, add to lineChartUni and change marker to yellow
                    if (lineChartUni.length >= 5) {
                        const removedUni = lineChartUni.shift(); // Remove from the beginning

                        // Find the marker for the removed institution and set it to red
                        const removedMarker = markers.find(m => m.getPopup().getContent().includes(removedUni));
                        if (removedMarker) {
                            removedMarker.setIcon(redMarker);
                            markerColors.set(removedMarker, redMarker);
                        }
                    }
                    lineChartUni.push(institutionName); // Add new at the end
                    marker.setIcon(yellowMarker);
                    markerColors.set(marker, yellowMarker); // Update the map
                }

                drawLineChart(reducedData); // Redraw line chart after changes
            });
        }
    });
}
