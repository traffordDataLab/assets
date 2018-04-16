/*
    Created:        2017/12/15 by James Austin - Trafford Data Lab
    Purpose:        Create Leaflet map tile layers
    Dependencies:   Leaflet.js (http://www.leafletjs.com)
    Licence:        https://www.trafforddatalab.io/assets/LICENSE.txt
    Notes:          MaxZoom fixed to 19 for consistency
*/
function labCreateTileLayer(type) {

    switch (type) {
        case 'CartoDB.Positron':
            return L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
            	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
            	subdomains: 'abcd',
                minZoom: 3,
            	maxZoom: 19
            });

        case 'OpenStreetMap.Mapnik':
            return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                minZoom: 3,
            	maxZoom: 19
            });

        case 'Esri.WorldImagery':
            return L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                minZoom: 3,
                maxZoom: 19
            });

        case 'Stamen.TonerLite':
            return L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
            	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            	subdomains: 'abcd',
            	minZoom: 3,
            	maxZoom: 19,
            	ext: 'png'
            });

        case 'Esri.WorldStreetMap':
            return L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
            	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
                minZoom: 3,
                maxZoom: 19
            });

        default:
            // Blank tile layer - useful for printing etc.
            return L.tileLayer('', {
                attribution: '',
                minZoom: 3,
                maxZoom: 19
            });
    }

}
