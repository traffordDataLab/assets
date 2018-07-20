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
        apiKey: '',                                 // openrouteservice API key - the service which returns the isochrone polygons based on the various options/parameters

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
        this._mode = 0;         // 0 = not in create mode, 1 = create mode
        this._latlng = null;

        // Container for the control - either one passed in the options arguments or create a new one
        this._mainControlContainer = (!this.options.mainControlContainer) ? L.DomUtil.create('div', 'leaflet-bar') : this.options.mainControlContainer;

        // Create main control button as a link - as per Leaflet convention
        var link = L.DomUtil.create('a', this.options.mainControlStyleClass, this._mainControlContainer);
        link.innerHTML = this.options.mainControlContent;
        link.href = '#';
        link.title = this.options.mainControlTooltip;

        // For assistive technologies e.g. screen readers
        link.setAttribute('role', 'button');
		link.setAttribute('aria-label', link.title);

        // Set events
        L.DomEvent
            .on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', this._modeSwitch, this);

        return this._mainControlContainer;
    },

    onRemove: function (map) {
        // TODO: Need to cleanly remove the plugin and associated event listeners from the map
    },

    _toggle: function (toggleVal) {
        // toggle a value passed to it between 0 and 1.  If argument is not 0 or 1 null is returned
        return (toggleVal === 0 || toggleVal === 1) ? Math.abs(toggleVal - 1) : null;
    },

    _modeSwitch: function () {
        this._mode = this._toggle(this._mode);
        console.log('mode = ' + this._mode);

        (this._mode == 1) ? this._activateControl() : this._deactivateControl();
    },

    _activateControl: function () {
        console.log('in activate');
        // Add the isochronesControlActive and leaflet-crosshair classes to the map container to indicate the control is active
        if (!L.DomUtil.hasClass(this._mapContainer, 'isochronesControlActive')) L.DomUtil.addClass(this._mapContainer, 'isochronesControlActive');
        if (!L.DomUtil.hasClass(this._mapContainer, 'leaflet-crosshair')) L.DomUtil.addClass(this._mapContainer, 'leaflet-crosshair');

        /*
            The leaflet-interactive CSS class is applied to any layers added to the map which the user can interact with. This class changes the cursor to a pointer.
            We want the cursor to be a crosshair so we need to add leaflet-crosshair class to each interactive layer so that the cursor is always a crosshair whilst in isochrone mode.
            Get the list of elements each time to ensure any new interactive elements added to the map at any time are included.
        */
        this._iMapElements = document.getElementsByClassName('leaflet-interactive');
        for (var i = 0; i < this._iMapElements.length; i++) {
            L.DomUtil.addClass(this._iMapElements[i], 'leaflet-crosshair');
        }

        // Add an event handler to the map for a click event
        this._map.on('click', this._createIsochrones, this);    // "this" is very important - send the context to the event handler so that we can refer to methods within the object
        this._mode = 1;
    },

    _deactivateControl: function () {
        console.log('in deactivate');
        // Remove the isochronesControlActive and leaflet-crosshair classes from the map container
        if (L.DomUtil.hasClass(this._mapContainer, 'isochronesControlActive')) L.DomUtil.removeClass(this._mapContainer, 'isochronesControlActive');
        if (L.DomUtil.hasClass(this._mapContainer, 'leaflet-crosshair')) L.DomUtil.removeClass(this._mapContainer, 'leaflet-crosshair');

        // Remove the leaflet-crosshair class from all interactive map elements
        for (var i = 0; i < this._iMapElements.length; i++) {
            L.DomUtil.removeClass(this._iMapElements[i], 'leaflet-crosshair');
        }

        // Remove the event handler for the click event
        this._map.off('click', this._createIsochrones, this);
        this._mode = 0;
    },

    _createIsochrones: function (e) {
        console.log('in create');
        alert("You clicked the map at " + e.latlng);
        this._deactivateControl();
    }
});

L.control.isochrones = function (options) {
    return new L.Control.Isochrones(options);
};
