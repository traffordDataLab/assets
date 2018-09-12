/*
    Created:        2018/06/19 by James Austin - Trafford Data Lab
    Purpose:        Setup script to handle the styling and behaviour for our leaflet.isochrones.js plugin
    Dependencies:   Leaflet.js (external library), leaflet.isochrones.js (internal library)
    Licence:        https://www.trafforddatalab.io/assets/LICENSE.txt
    Notes:
*/
function labSetupIsochronesPlugin(objExtraOptions) {
    // First set up the standard options
    var options = {
        apiKey: '58d904a497c67e00015b45fc6862cde0265d4fd78ec660aa83220cdb',
        ajaxRequestFn: labAjax,
        expandButtonStyleClass: 'isochrones-control-expand-button fa fa-bullseye',
        expandButtonContent: '',
        collapseButtonContent: '',
        collapseButtonStyleClass: 'isochrones-control-collapse-button fa fa-caret-up',
        drawButtonContent: '',
        drawButtonStyleClass: 'fa fa-pencil',
        deleteButtonContent: '',
        deleteButtonStyleClass: 'fa fa-trash',
        distanceButtonContent: '',
        distanceButtonStyleClass: 'fa fa-road',
        timeButtonContent: '',
        timeButtonStyleClass: 'fa fa-clock-o',
        drivingButtonContent: '',
        drivingButtonStyleClass: 'fa fa-car',
        cyclingButtonContent: '',
        cyclingButtonStyleClass: 'fa fa-bicycle',
        walkingButtonContent: '',
        walkingButtonStyleClass: 'fa fa-male',
        accessibilityButtonContent: '',
        accessibilityButtonStyleClass: 'fa fa-wheelchair-alt',
        markerFn: labIsochroneMarker
    }

    // Now add any further options if supplied
    if (objExtraOptions != null) {
        for (var key in objExtraOptions) {
            options[key] = objExtraOptions[key];
        }
    }

    // Create and return the control
    return L.control.isochrones(options);
}

// Lab styling of the isochrone polygons
function labStyleIsochrones(feature) {
    return {
        color: '#fc6721',
        fillColor: '#fc6721',
        opacity: 0.5,
        fillOpacity: 0.2
    };
}

// Custom markers to appear at the origin of the isochrones 
function labIsochroneMarker(latLng, travelMode, measure) {
    var faClass;

    switch (travelMode) {
        case 'driving-car':
            faClass = 'fa fa-car'
            break;
        case 'cycling-regular':
            faClass = 'fa fa-bicycle'
            break;
        default:
            faClass = 'fa fa-male'
    }

    var customIcon = L.divIcon({ className: faClass + ' lab-isochrones-marker', iconAnchor: [12, 12] });

    return L.marker(latLng, { icon: customIcon });
}
