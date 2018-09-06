/*
    Created:        2018/06/19 by James Austin - Trafford Data Lab
    Purpose:        Setup script to handle the styling and behaviour for our leaflet.isochrones.js plugin
    Dependencies:   Leaflet.js (external library), leaflet.isochrones.js (internal library)
    Licence:        https://www.trafforddatalab.io/assets/LICENSE.txt
    Notes:
*/
function labSetupIsochronesPlugin() {
    // Setup the plugin with our specific options
    return L.control.isochrones({
        expandButtonStyleClass: 'isochrones-control-expand-button fa fa-bullseye',
        expandButtonContent: '',
        collapseButtonContent: '',
        collapseButtonStyleClass: 'isochrones-control-collapse-button fa fa-chevron-left',
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
        styleFn: styleIsochrones,
        mouseOverFn: highlightIsochrones,
        mouseOutFn: resetIsochrones,
        clickFn: clickIsochrones
    });
}

function labStyleIsochrones(feature) {
    // Handle the styling of the isochrone polygons
}

function labHighlightIsochrones(feature) {
    // Handle the highlighting behaviour when the user hovers/selects a particular polygon in the isochrones collection
}
