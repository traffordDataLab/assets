/*
    Created:        2018/06/19 by James Austin - Trafford Data Lab
    Purpose:        Setup script to handle the styling and behaviour for our leaflet.reachability.js plugin
    Dependencies:   Leaflet.js (external library), leaflet.reachability.js (internal library)
    Licence:        https://www.trafforddatalab.io/assets/LICENSE.txt
    Notes:
*/
function labSetupReachabilityPlugin(objExtraOptions) {
    // First set up the standard options
    var options = {
        apiKey: '58d904a497c67e00015b45fc6862cde0265d4fd78ec660aa83220cdb',
        ajaxRequestFn: labAjax,
        expandButtonStyleClass: 'reachability-control-expand-button fa fa-bullseye',
        expandButtonContent: '',
        collapseButtonContent: '',
        collapseButtonStyleClass: 'reachability-control-collapse-button fa fa-caret-up',
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
        markerFn: labReachabilityMarker
    }

    // Now add any further options if supplied
    if (objExtraOptions != null) {
        for (var key in objExtraOptions) {
            options[key] = objExtraOptions[key];
        }
    }

    // Create and return the control
    return L.control.reachability(options);
}

// Lab styling of the isolines polygons
function labStyleIsolines(feature) {
    return {
        color: '#fc6721',
        fillColor: '#757575',
        opacity: 0.8,
        fillOpacity: 0.1,
        weight: 4,
        dashArray: '1,6',
        lineCap: 'square'
    };
}



// Custom markers to appear at the origin of the isolines
function labReachabilityMarker(latLng, travelMode, measure) {
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

    var customIcon = L.divIcon({ className: faClass + ' lab-reachability-marker', iconAnchor: [12, 12] });

    return L.marker(latLng, { icon: customIcon });
}
