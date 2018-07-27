/*
    Created:        2018/06/12 by James Austin - Trafford Data Lab
    Purpose:        Uses openrouteservice API to create isochrones showing areas within reach of certain travel times based on different modes of travel or distance. See https://wiki.openstreetmap.org/wiki/Isochrone for more information
    Dependencies:   Leaflet.js (external library), openrouteservice.org API (requires a key - free service available via registration)
    Licence:        https://www.trafforddatalab.io/assets/LICENSE.txt
    Notes:          Can be displayed as a stand-alone control or as part of an existing group, e.g. zoom control. Content for all GUI elements can be html or an icon etc.
*/
L.Control.Isochrones = L.Control.extend({
    options: {
        // General plugin control options
        position: 'topleft',                        // Leaflet control pane position
        zIndexMouseMarker: 9000,                    // Needs to be greater than any other layer in the map
        apiKey: '58d904a497c67e00015b45fc6862cde0265d4fd78ec660aa83220cdb',                                 // openrouteservice API key - the service which returns the isochrone polygons based on the various options/parameters

        // Control to initialise the plugin
        mainControlContainer: null,                 // the container for the plugin control to be displayed within - a value of null creates a new container, otherwise you can specify an existing control container to add this control to, e.g. the zoom control etc.
        mainControlContent: '*',                    // HTML to display within the control 'button'. If you want an icon from services like Fontawesome pass '' for this value and set the StyleClass option
        mainControlTooltip: 'Show reachability',    // tooltip to appear on-hover
        mainControlStyleClass: '',                  // allow options for styling - if you want to use an icon from services like fontawesome pass the declarations here, e.g. 'fa fa-home' etc.

        // Delete control to remove any current isochrones drawn on the map
        deleteControlContent: 'X',
        deleteControlTooltip: 'Remove reachability',
        deleteControlStyleClass: '',

        // Settings control to display the various options available for creating isochrones
        settingsControlContent: 'S',
        settingsControlTooltip: 'Change settings',
        settingsControlStyleClass: '',

        // Minimise the settings UI once opened via the settings control
        minimiseControlContent: '-',
        minimiseControlTooltip: 'Minimise settings',
        minimiseControlStyleClass: '',

        // The method used to create the isochrones
        rangeType: 'distance',                      // can be either by distance or time - any value other than 'distance' is assumed to be 'time'
        rangeTypeDistanceLabel: 'Distance',         // the label to appear next to the distance radio button option
        rangeTypeTimeLabel: 'Travel time',          // same as above but for the time option

        rangeControlDistanceTitle: 'Range (kilometres)',
        rangeControlDistanceMin: 0.5,
        rangeControlDistanceMax: 3,
        rangeControlDistanceInterval: 0.5,
        rangeControlDistanceUnits: 'km',            // can be either 'm', 'km' or 'mi'

        rangeControlTimeTitle: 'Range (minutes)',
        rangeControlTimeMin: 5,                     // \
        rangeControlTimeMax: 30,                    //  > all these values need to be multiplied by 60 to convert to seconds - no other unit of time is allowed
        rangeControlTimeInterval: 5,                // /

        // Options to select when choosing to create isochrones based on travel time
        travelModeWalkContent:  'W',
        travelModeWalkTooltip: 'Walking',
        travelModeWalkStyleClass: '',
        travelModeWalkProfile: 'foot-walking',      // API options, choices are 'foot-walking' and 'foot-hiking'

        travelModeBikeContent: 'B',
        travelModeBikeTooltip: 'Bicycle',
        travelModeBikeStyleClass: '',
        travelModeBikeProfile: 'cycling-regular',   // API options, choices are 'cycling-regular', 'cycling-road', 'cycling-safe', 'cycling-mountain' and 'cycling-tour'

        travelModeCarContent: 'C',
        travelModeCarTooltip: 'Car',
        travelModeCarStyleClass: '',
        travelModeCarProfile: 'driving-car',        // API options, choices are 'driving-car' and 'driving-hgv'

        // Styling Options
        polyStyleFn: null,                          //   -external function to call which styles the polygons returned from API call and when the user hovers over them - gives full control over the styling
        highlightFn: null,                          // /
        markerDistance: null,                       // the marker to use at the centre of isochrones based on distance
        markerWalk: null,                           // the marker to use at the centre of isochrones based on walking time
        markerBike: null,                           // the marker to use at the centre of isochrones based on cycling time
        markerCar: null                             // the marker to use at the centre of isochrones based on driving time
    },

    onAdd: function (map) {
        this._map = map;
        this._mapContainer = map.getContainer();
        this._mode = 0;             // 0 = not in create mode, 1 = create mode
        this._mouseMarker = null;   // invisible Leaflet marker to follow the mouse pointer when control is activated

        // Container for the control - either one passed in the options arguments or create a new one
        this._mainControlContainer = (!this.options.mainControlContainer) ? L.DomUtil.create('div', 'leaflet-bar') : this.options.mainControlContainer;

        // Create main control button as a link - as per Leaflet convention
        this._mainButton = L.DomUtil.create('a', this.options.mainControlStyleClass, this._mainControlContainer);
        this._mainButton.innerHTML = this.options.mainControlContent;
        this._mainButton.href = '#';
        this._mainButton.title = this.options.mainControlTooltip;

        // For assistive technologies e.g. screen readers
        this._mainButton.setAttribute('role', 'button');
		this._mainButton.setAttribute('aria-label', this._mainButton.title);

        // Set events
        L.DomEvent
            .on(this._mainButton, 'mousedown dblclick', L.DomEvent.stopPropagation)
            .on(this._mainButton, 'click', L.DomEvent.stop)
            .on(this._mainButton, 'click', this._toggleMode, this);     // send 'this' context to the event handler

        return this._mainControlContainer;
    },

    onRemove: function (map) {
        // clean up - remove any styles and event listeners etc.
        this._deactivateControl();
    },

    _toggleMode: function () {
        // Toggle the control between active and inactive states
        this._mode = Math.abs(this._mode - 1);
        (this._mode == 1) ? this._activateControl() : this._deactivateControl();
    },

    _activateControl: function () {
        // Add the isochronesControlActive class to the map container to indicate the control is active
        L.DomUtil.addClass(this._mapContainer, 'isochronesControlActive');

        /*
            Using a technique deployed in Jacob Toye's Leaflet.Draw plugin:
            We create an invisible mouse marker to capture the click event to give us a lat/lng to calculate the isochrones
        */
        if (!this._mouseMarker) {
            this._mouseMarker = L.marker(this._map.getCenter(), {
                icon: L.divIcon({
                    className: 'leaflet-crosshair',
                    iconAnchor: [20, 20],
                    iconSize: [40, 40]
                }),
                opacity: 0,
                zIndexOffset: this.options.zIndexMouseMarker
            });
        }

        // Add events to the marker and then add the marker to the map
        this._mouseMarker
            .on('mousemove', this._onMouseMove, this)
            .once('click', this._createIsochrones, this)
            .addTo(this._map);

        // Add a duplicate mouse move event to the map in case the mouse pointer goes outside of the mouseMarker
        this._map.on('mousemove', this._onMouseMove, this);
    },

    _deactivateControl: function () {
        // Remove the isochronesControlActive class from the map container
        L.DomUtil.removeClass(this._mapContainer, 'isochronesControlActive');

        // Remove the mouse marker and its events from the map and destroy the marker
        if (this._mouseMarker !== null) {
            this._mouseMarker
                .off('mousemove', this._onMouseMove, this)
                .removeFrom(this._map);
            this._mouseMarker = null;
        }

        // Remove map events
        this._map.off('mousemove', this._onMouseMove, this);
    },

    _onMouseMove: function (e) {
		var newPos = this._map.mouseEventToLayerPoint(e.originalEvent);
		var latlng = this._map.layerPointToLatLng(newPos);

        // Update the mouse marker position
		this._mouseMarker.setLatLng(latlng);

		L.DomEvent.preventDefault(e.originalEvent);
	},

    _createIsochrones: function (e) {
        var latLng = e.latlng;

        // Create the URL to pass to the API
        // TODO: Needs to get values from options and internally based on the current settings
        var apiUrl = 'https://api.openrouteservice.org/isochrones?api_key=' + this.options.apiKey;
        apiUrl += '&locations=' + latLng.lng + '%2C' + latLng.lat;
        apiUrl += '&profile=driving-car&range_type=time&range=60&location_type=start';

        // Store the context
        var context = this;

        // Call the API
        // TODO: need to handle this much more elegantly and factor in styling options etc.
        labAjax(apiUrl, function (data) {
            L.geoJSON(data).addTo(context._map);
        });

        this._mode = 0;
        this._deactivateControl();
    }
});

L.control.isochrones = function (options) {
    return new L.Control.Isochrones(options);
};
