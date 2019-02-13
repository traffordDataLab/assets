/*
    Created:        2019/02/13 by James Austin - Trafford Data Lab
    Purpose:        Create Mapbox GL vector tile layers to use within a Leaflet map
    Dependencies:   Leaflet.js (http://www.leafletjs.com), mapbox-gl.js (https://docs.mapbox.com/mapbox-gl-js/api/), leaflet-mapbox-gl.js (https://github.com/mapbox/mapbox-gl-leaflet)
    Licence:        https://www.trafforddatalab.io/assets/LICENSE.txt
    Notes:          MaxZoom fixed to 18 as this is the limit for OS Zoomstack. Raster tile layers in labCreateTileLayer.js have also bee fixed to this value for consistency.
                    The 'error' parameter in the L.mapboxGL declarations is a Trafford Data Lab addition, currently within a branch of a fork of the mapbox-gl-leaflet repo (https://github.com/traffordDataLab/mapbox-gl-leaflet/tree/error_handler).
*/
function labCreateVectorTileLayer(type) {
    // Vector tiles (requires mapbox-gl.js and leaflet-mapbox-gl.js libraries)
    switch (type) {
        case 'OSZoomstack.Light':
            return L.mapboxGL({
                style: 'https://s3-eu-west-1.amazonaws.com/tiles.os.uk/styles/open-zoomstack-light/style.json',
                accessToken: 'no-token',
                attribution: 'Tiles: <a href="https://www.ordnancesurvey.co.uk/business-and-government/products/os-open-zoomstack.html" target="_blank">OS Open Zoomstack</a> Light',
                minZoom: 3,
                maxZoom: 18,
                error: vectorTileErrorZoomstackLight    // external error function to call, (has to be external so that the map and layers can be referenced)
            });

        case 'OSZoomstack.Night':
            return L.mapboxGL({
                style: 'https://s3-eu-west-1.amazonaws.com/tiles.os.uk/styles/open-zoomstack-night/style.json',
                accessToken: 'no-token',
                attribution: 'Tiles: <a href="https://www.ordnancesurvey.co.uk/business-and-government/products/os-open-zoomstack.html" target="_blank">OS Open Zoomstack</a> Night',
                minZoom: 3,
                maxZoom: 18,
                error: vectorTileErrorZoomstackNight    // external error function to call, (has to be external so that the map and layers can be referenced)
            });

        case 'OSZoomstack.Outdoor':
            return L.mapboxGL({
                style: 'https://s3-eu-west-1.amazonaws.com/tiles.os.uk/styles/open-zoomstack-outdoor/style.json',
                accessToken: 'no-token',
                attribution: 'Tiles: <a href="https://www.ordnancesurvey.co.uk/business-and-government/products/os-open-zoomstack.html" target="_blank">OS Open Zoomstack</a> Outdoor',
                minZoom: 3,
                maxZoom: 18,
                error: vectorTileErrorZoomstackOutdoor    // external error function to call, (has to be external so that the map and layers can be referenced)
            });

        case 'OSZoomstack.Road':
            return L.mapboxGL({
                style: 'https://s3-eu-west-1.amazonaws.com/tiles.os.uk/styles/open-zoomstack-road/style.json',
                accessToken: 'no-token',
                attribution: 'Tiles: <a href="https://www.ordnancesurvey.co.uk/business-and-government/products/os-open-zoomstack.html" target="_blank">OS Open Zoomstack</a> Road',
                minZoom: 3,
                maxZoom: 18,
                error: vectorTileErrorZoomstackRoad    // external error function to call, (has to be external so that the map and layers can be referenced)
            });

        default:
            // return a blank raster tile layer if requested vector tiles can't be found
            return L.tileLayer('', {
                attribution: '',
                minZoom: 3,
                maxZoom: 18
            });
    }
}
