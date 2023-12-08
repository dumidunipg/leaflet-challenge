// Store API endpoint as queryURL
let queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//Perform a GET request to the query URL/
d3.json(queryURL).then(function (data) {
    console.log(data);
    //send data.features  object to createFeatures function
    createFeatures(data.features);
});

//function to return different colors for different depths 
function depthColor(depth){
    if (depth < 10) return "red";
    else if (depth < 20 )return "orange";
    else if (depth < 30) return "yellow";
    else if (depth < 40) return "green";
    else if (depth < 50) return "blue";
    else return "purple";
};

//function to return magnitude multiplied by for for visibility on map
function markerSize(magnitude) {
    return magnitude * 4
};

//function to add earthquake data onto the map with markers
function createFeatures(earthquakeData) {

    let earthquakeLayer = L.layerGroup();
    earthquakeData.forEach(function (feature){
        let marker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]],{
            radius: markerSize(feature.properties.mag),
            fillColor: depthColor(feature.geometry.coordinates[2]),
            color: "black",
            fillOpacity: 0.5
        });
        //Give each feature a popup that describes the place, time, magnitude, and depth of the earthquake
        marker.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
        earthquakeLayer.addLayer(marker);
    })

//send earthquake layer to createMap function
  createMap(earthquakeLayer);
}



function createMap(earthquakes) {
    //create base layers
    let mapLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {
        foo: 'bar', 
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    //create baseMaps object
    let baseMaps = {
        "Map": mapLayer,
        "Topographic Map": topo
    };
    //create overlay object to hold overlay
    let overlayMaps = {
        Earthquakes: earthquakes
    };
    //create map giving mapLayer and earthquakes layers
    let map = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [mapLayer, earthquakes]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(map);

      mapLegend(map);
    }

//create legend for the depths of each earthquake
function mapLegend(map) {
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function(map) {
        let div = L.DomUtil.create("div", "info legend");
        let depths = [0, 10, 20, 30, 40, 50];
      //https://www.igismap.com/legend-in-leafletjs-map-with-topojson/
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML += '<i style="background:' + depthColor(depths[i] + 1) + '"></i>' + depths[i] +(depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
            }
        return div;
    };

    legend.addTo(map);
}

