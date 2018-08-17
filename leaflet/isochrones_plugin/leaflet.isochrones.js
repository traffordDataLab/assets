/*
    Created:        2018/06/12 by James Austin - Trafford Data Lab
    Purpose:        Uses openrouteservice API to create isochrones showing areas within reach of certain travel times based on different modes of travel or distance. See https://wiki.openstreetmap.org/wiki/Isochrone for more information
    Dependencies:   Leaflet.js (external library), openrouteservice.org API (requires a key - free service available via registration)
    Licence:        https://www.trafforddatalab.io/assets/LICENSE.txt
    Notes:          Can be displayed in a collapsed or expanded state. Content for all GUI elements can be html or an icon etc.
*/
L.Control.Isochrones = L.Control.extend({
    options: {
        // Leaflet positioning options
        position: 'topleft',                        // Leaflet control pane position
        layerGroup: null,                           // Leaflet layer to add the isochones to
        pane: 'overlayPane',                        // Leaflet pane to add the layerGroup to
        zIndexMouseMarker: 9000,                    // Needs to be greater than any other layer in the map - this is an invisible marker tied to the mouse pointer when the control is activated to prevent clicks interacting with other map objects

        // Main control settings and styling
        collapsed: true,                            // Operates in a similar way to the Leaflet layer control - can be collapsed into a standard single control which expands on-click (true) or is displayed fully expanded (false)
        controlContainerStyleClass: '',             // The container for the plugin control will usually be styled with the standard Leaflet control styling, however this option allows for customisation

        // If collapsed == true a toggle button is displayed to expand the control onclick/touch
        toggleButtonStyleClass: 'isochrones-control-toggle',              // Allow options for styling - if you want to use an icon from services like fontawesome pass the declarations here, e.g. 'fa fa-home' etc.
        toggleButtonContent: '&Delta;',          // HTML to display within the control if it is collapsed. If you want an icon from services like Fontawesome pass '' for this value and set the StyleClass option
        toggleButtonTooltip: 'Show reachability options',     // Tooltip to appear on-hover

        settingsContainerStyleClass: 'isochrones-control-settings-container', // The container holding the user interface controls which is displayed if collapsed is false, or when the user expands the control by clicking on the toggle button
        settingsButtonStyleClass: 'isochrones-control-settings-button',      // Generic class to style the setting buttons uniformly - further customisation per button is available with specific options below
        activeStyleClass: 'isochrones-control-active',              // Indicate to the user which button is active in the settings and the collapsed state of the control if settings are active
        errorStyleClass: 'isochrones-control-error',

        // Collapse button displayed within the settings container if collapsed == true
        collapseButtonContent: '&lt;',
        collapseButtonStyleClass: 'isochrones-control-collapse-button',
        collapseButtonTooltip: 'Hide reachability options',

        // Draw isochrones button
        drawButtonContent: 'Draw',
        drawButtonStyleClass: '',
        drawButtonTooltip: 'Draw reachability',

        // Delete button to remove any current isochrones drawn on the map
        deleteButtonContent: 'Del',
        deleteButtonStyleClass: '',
        deleteButtonTooltip: 'Delete reachability',

        // Isochone calculation mode - either time or distance
        timeButtonContent: 'Time',
        timeButtonStyleClass: '',
        timeButtonTooltip: 'Reachability based on time',

        distanceButtonContent: 'Dist',
        distanceButtonStyleClass: '',
        distanceButtonTooltip: 'Reachability based on distance',

        // API settings
        ajaxRequestFn: null,                        // External function to make the actual call to the API via AJAX - if null will attempt to use simpleAjaxRequest
        apiKey: '58d904a497c67e00015b45fc6862cde0265d4fd78ec660aa83220cdb',                                 // openrouteservice API key - the service which returns the isochrone polygons based on the various options/parameters TODO: Remove this when we ship the code as this is our personal key
        rangeType: 'distance',                      // Can be either by distance or time - any value other than 'distance' is assumed to be 'time'

        rangeControlDistanceTitle: 'Range (kilometres)',
        rangeControlDistanceMin: 0.5,
        rangeControlDistanceMax: 3,
        rangeControlDistanceInterval: 0.5,
        rangeControlDistanceUnits: 'km',            // Can be either 'm', 'km' or 'mi'

        rangeControlTimeTitle: 'Range (minutes)',
        rangeControlTimeMin: 5,                     // \
        rangeControlTimeMax: 30,                    //  > All these values need to be multiplied by 60 to convert to seconds - no other unit of time is allowed
        rangeControlTimeInterval: 5,                // /

        // Mode of travel options based on travel time
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

        travelModeWheelchairContent: 'A',
        travelModeCarTooltip: 'Wheelchair',
        travelModeCarStyleClass: '',
        travelModeCarProfile: 'wheelchair',        // API options

        // Isocrone styling and interaction
        styleFn: null,                              // External function to call which styles the isochrones returned from API call
        mouseOverFn: null,                          // External function to call when a mouseover event occurs on an isochrone
        mouseOutFn: null,                           // External function to call when a mouseout event occurs on an isochrone
        clickFn: null,                              // External function to call when a click event occurs on an isochrone

        markerDistance: null,                       // \
        markerWalk: null,                           //  \
        markerBike: null,                           //    > The marker to use at the centre of isochrones based on the modes of travel etc.
        markerCar: null,                            //  /
        markerWheelchair: null                      // /
    },

    onAdd: function (map) {
        // Initial settings
        this._map = map;
        this._collapsed = this.options.collapsed;
        this._drawMode = false;
        this._deleteMode = false;
        this._mouseMarker = null;   // invisible Leaflet marker to follow the mouse pointer when control is activated
        this.isochrones = null;     // set to a Leaflet GeoJSON FeatureGroup when the API returns data
        this.layerGroup = (this.options.layerGroup == null) ? L.layerGroup(null, { pane: this.options.pane }) : this.options.layerGroup;   // holds the isochrone GeoJSON FeatureGroup(s)

        // Add the LayerGroup to the map ready for the isochrones to be added
        this.layerGroup.addTo(this._map);

        // Main container for the control - this is added to the map in the Leaflet control pane
        this._container = L.DomUtil.create('div', 'leaflet-bar ' + this.options.controlContainerStyleClass);
        L.DomEvent.disableClickPropagation(this._container);

        // Create the components for the user interface
        this._createUI();

        // Fire event to inform that the control has been added to the map
        this._map.fire('isochrones:control_added');

        return this._container;
    },

    onRemove: function (map) {
        // clean up - remove any styles, event listeners, layers etc.
        this._deactivateDraw();
        this.layerGroup.removeFrom(this._map);
        this.layerGroup.clearLayers();

        // Fire event to inform that the control has been removed from the map
        this._map.fire('isochrones:control_removed');
    },

    _createUI: function () {
        // Container for the user interface controls - these will be displayed permanently if the collapsed option is false, otherwise when the user clicks on the collapsed control toggle button
        this._uiContainer = L.DomUtil.create('div', this.options.settingsContainerStyleClass);
        this._container.appendChild(this._uiContainer);

        // Close button to toggle the user interface into the collapsed state if collapsed == true
        if (this._collapsed) this._createButton('span', this.options.collapseButtonContent, this.options.collapseButtonTooltip, this.options.collapseButtonStyleClass, this._uiContainer, this._collapse);

        // Draw button - to create isochrones
        this._drawControl = this._createButton('span', this.options.drawButtonContent, this.options.drawButtonTooltip, this.options.settingsButtonStyleClass + ' ' + this.options.drawButtonStyleClass, this._uiContainer, this._toggleDraw);

        // Delete button - to remove isochrones
        this._deleteControl = this._createButton('span', this.options.deleteButtonContent, this.options.deleteButtonTooltip, this.options.settingsButtonStyleClass + ' ' + this.options.deleteButtonStyleClass, this._uiContainer, this._toggleDelete);

        // If the control is in its collapsed state, create a standard size control button to act as a toggle to expand
        if (this._collapsed) {
            // Create a container for the toggle button - because we cannot easily hide a link tag created via the _createButton function adding the .isochrones-control-hide CSS class
            this._toggleButtonContainer = L.DomUtil.create('div', '');
            this._container.appendChild(this._toggleButtonContainer);

            // Create a button to expand the control to reveal the full user interface - this is automatically added to the main container
            this._toggleButton = this._createButton('a', this.options.toggleButtonContent, this.options.toggleButtonTooltip, this.options.toggleButtonStyleClass, this._toggleButtonContainer, this._expand);

            // Hide the UI initially as the control is in the collapsed state
            L.DomUtil.addClass(this._uiContainer, 'isochrones-control-hide');
        }
    },

    // An amended version of the Leaflet.js function of the same name, (c) 2010-2018 Vladimir Agafonkin, (c) 2010-2011 CloudMade
    _createButton: function (tag, html, title, className, container, fn) {
        // Create a control button
        var button = L.DomUtil.create(tag, className, container);
        button.innerHTML = html;
        button.title = title;
        if (tag === 'a') button.href = '#';

        // For assistive technologies e.g. screen readers
        button.setAttribute('role', 'button');
		button.setAttribute('aria-label', title);

        // Set events
        L.DomEvent
            .on(button, 'mousedown dblclick', L.DomEvent.stopPropagation)
            .on(button, 'click', L.DomEvent.stop)
            .on(button, 'click', fn, this);     // send 'this' context to the event handler

		return button;
	},

    _expand: function () {
        // Show the user interface container
        L.DomUtil.removeClass(this._uiContainer, 'isochrones-control-hide');

        // Hide the toggle container
        L.DomUtil.addClass(this._toggleButtonContainer, 'isochrones-control-hide');

        // Remove the active class from the control container if either the draw or delete modes are active
        if (L.DomUtil.hasClass(this._container, this.options.activeStyleClass)) L.DomUtil.removeClass(this._container, this.options.activeStyleClass);
    },

    _collapse: function () {
        // Hide the user interface container
        L.DomUtil.addClass(this._uiContainer, 'isochrones-control-hide');

        // Show the toggle container
        L.DomUtil.removeClass(this._toggleButtonContainer, 'isochrones-control-hide');

        // Add the active class to the control container if either the draw or delete modes are active
        if ((this._drawMode || this._deleteMode) && !L.DomUtil.hasClass(this._container, this.options.activeStyleClass)) L.DomUtil.addClass(this._container, this.options.activeStyleClass);
    },

    // Toggle the draw control between active and inactive states
    _toggleDraw: function () {
        if (this._deleteMode) this._deactivateDelete();    // deactivate the delete control

        (this._drawMode) ? this._deactivateDraw() : this._activateDraw();
    },

    // Toggle the delete control between active and inactive states
    _toggleDelete: function () {
        if (this._drawMode) this._deactivateDraw();    // deactivate the draw control

        (this._deleteMode) ? this._deactivateDelete() : this._activateDelete();
    },

    _activateDraw: function () {
        // Set the flag to true and add active class to the draw button to show it's currently selected
        this._drawMode = true;
        L.DomUtil.addClass(this._drawControl, this.options.activeStyleClass);

        // Deactivate delete mode if currently active
        if (this._deleteMode) this._deactivateDelete();

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
            .on('click', this._callApi, this)
            .addTo(this._map);

        // Add a duplicate mouse move event to the map in case the mouse pointer goes outside of the mouseMarker
        this._map.on('mousemove', this._onMouseMove, this);

        // Fire an event to indicate that the control is active - in case we want to run some external code etc.
        this._map.fire('isochrones:activated');
    },

    _deactivateDraw: function () {
        this._drawMode = false;     // ensure we explicitly set the mode - we may not have come here from a click on the main control
        L.DomUtil.removeClass(this._drawControl, this.options.activeStyleClass);    // remove the selected style

        // Remove the mouse marker and its events from the map and destroy the marker
        if (this._mouseMarker !== null) {
            this._mouseMarker
                .off('mousemove', this._onMouseMove, this)
                .off('click', this._callApi, this)
                .removeFrom(this._map);
            this._mouseMarker = null;
        }

        // Remove map events
        this._map.off('mousemove', this._onMouseMove, this);

        // Fire an event to indicate that the control is active - in case we want to run some external code etc.
        this._map.fire('isochrones:deactivated');
    },

    _activateDelete: function () {
        // We want to delete some isochrones
        var isochronesNum = this.layerGroup.getLayers().length;

        if (isochronesNum > 0) {
            // We have some isochrones to delete - how many?
            if (isochronesNum == 1) {
                // Only one, so delete it automatically - no need to change the state of this._deleteMode
                this.layerGroup.clearLayers();
                this.isochones = null;

                // Inform that an isochrone FeatureGroup has been deleted
                this._map.fire('isochrones:delete');
            }
            else {
                // We have more than one so the user will need to choose which to delete. Therefore set the control in delete mode and wait for the user event
                this._deleteMode = true;
                L.DomUtil.addClass(this._deleteControl, this.options.activeStyleClass);   // add the selected class to the delete button
            }
        }
        else {
            // There are no isochrones to delete so warn the user by flashing the button
            this._showError(this._deleteControl);
        }
    },

    _deactivateDelete: function () {
        // The delete control is currently activate so deactivate it now
        this._deleteMode = false;
        L.DomUtil.removeClass(this._deleteControl, this.options.activeStyleClass); // remove the selected class from the delete button

        // If collapsed == true, remove the active class from the collapsed control
        if (L.DomUtil.hasClass(this._container, this.options.activeStyleClass)) L.DomUtil.removeClass(this._container, this.options.activeStyleClass);
    },

    // Removes a particular FeatureGroup of isochrones from the LayerGroup.
    // Called when an isochrone FeatureGroup is clicked on whilst the plugin is in delete mode
    _delete: function (e) {
        var parent = e.sourceTarget._eventParents;

        for (var key in parent) {
            if (parent.hasOwnProperty(key) && key != '<prototype>') parent[key].removeFrom(this.layerGroup);
        }

        // Deactivate the delete control if there are no more isochrones left
        if (this.layerGroup.getLayers().length == 0) this._deactivateDelete();

        // Inform that an isochrone FeatureGroup has been deleted
        this._map.fire('isochrones:delete');
    },

    // Show a visible error to the user if something has gone wrong
    _showError: function (control) {
        var css = this.options.errorStyleClass;

        // Add the error class to the control
        L.DomUtil.addClass(control, css);

        // Remove the error class from the control after 0.5 seconds
        setTimeout(function () {
            L.DomUtil.removeClass(control, css);
        }, 500);
    },

    // Deals with updating the position of the invisible Leaflet marker that chases the mouse pointer.
    // This is used to determine the coordinates on the map when the user clicks/touches to create an isochrone
    _onMouseMove: function (e) {
		var newPos = this._map.mouseEventToLayerPoint(e.originalEvent);
		var latlng = this._map.layerPointToLatLng(newPos);

        // Update the mouse marker position
		this._mouseMarker.setLatLng(latlng);

		L.DomEvent.preventDefault(e.originalEvent);
	},

    // Main function to make the actual call to the API and display the resultant isochrones on the map
    _callApi: function (e) {
        var latLng = e.latlng;

        // Create the URL to pass to the API
        // TODO: Needs to get values from options and internally based on the current settings
        var apiUrl = 'https://api.openrouteservice.org/isochrones?api_key=' + this.options.apiKey;
        apiUrl += '&locations=' + latLng.lng + '%2C' + latLng.lat;
        apiUrl += '&profile=driving-car&range_type=time&range=180&interval=60&location_type=start';

        // Inform that we are calling the API - could be useful for starting a spinner etc. to indicate to the user that something is happening if there is a delay
        this._map.fire('isochrones:api_call_start');

        // Store the context for use within the API callback below
        var context = this;

        // Call the API
        try {
            var ajaxFn = this.options.ajaxRequestFn;            // This is the external function to use which makes the actual AJAX request to the API
            if (ajaxFn == null) ajaxFn = simpleAjaxRequest;     // If it is null, attempt to use the simple function included in leaflet.isochrones_utilities.js

            ajaxFn(apiUrl, function (data) {
                if (data == null) {
                    // Fire event to inform that no data was returned
                    context._map.fire('isochrones:no_data');

                    // Log more specific details in the javascript console
                    if (console.log) console.log('Leaflet.isochrones.js error calling API, no data returned. Likely cause is API unavailable or bad parameters.');
                }
                else {
                    /*
                        ISSUE: The GeoJSON features returned from the API are in the order smallest to largest in terms of the area of the polygons.
                        This causes us a problem as when they are displayed on the map, the largest polygon covers all the others, preventing us interacting with the other polygons.
                        The solution is to reverse the order of the features, however this is not as simple as sorting due to how Leaflet deals with layers.
                        Each layer is given an id. When you add layers to layergroup objects, it doesn't matter the order you add them, what matters is the id sequence.
                        Therefore we need to generate new a new id for each layer, with the larger polygon layers given lower ids than the smaller.
                    */

                    // Create a Leaflet GeoJSON FeatureGroup object from the GeoJSON returned from the API (NOTE: this object is accessible externally)
                    context.isochrones = L.geoJSON(data, { style: context.options.styleFn });

                    // Load the layers into an array so that we can sort them in decending id order if there are more than 1
                    var arrLayers = context.isochrones.getLayers();

                    // Now remove all the layers from the object - we will be adding them back once we've reorded them
                    context.isochrones.clearLayers();

                    if (arrLayers.length > 0) {
                        // Sort the array in decending order of the internal Leaflet id
                        arrLayers.sort(function (a, b) { return b['_leaflet_id'] - a['_leaflet_id'] });

                        for (var i = 0; i < arrLayers.length; i++) {
                            // Wipe the internal Leaflet layer id and...
                            arrLayers[i]['_leaflet_id'] = null;

                            // ...force Leaflet to assign a new one
                            L.Util.stamp(arrLayers[i]);

                            // Now add the layer with its new id to the Leaflet GeoJSON FeatureGroup object
                            context.isochrones.addLayer(arrLayers[i]);

                            // Add events to the layer - do here whilst we're looping through the array rather than after using the Leaflet eachLayer() method
                            arrLayers[i].on({
                                mouseover: (function (e) { if (context.options.mouseOverFn != null) context.options.mouseOverFn(e, context.isochrones) }),
                                mouseout: (function (e) { if (context.options.mouseOutFn != null) context.options.mouseOutFn(e, context.isochrones) }),
                                click: (function(e) {
                                    if (context._deleteMode) {
                                        // If we're in delete mode, call the delete function
                                        L.DomEvent.stopPropagation(e);
                                        context._delete(e);
                                    }
                                    else {
                                        // Otherwise, if there is a user-defined click function, call that instead
                                        if (context.options.clickFn != null) context.options.clickFn(e, context.isochrones);
                                    }
                                })
                            });
                        }

                        // Add the GeoJSON FeatureGroup to the LayerGroup
                        context.isochrones.addTo(context.layerGroup);

                        // Fire event to inform that isochrones have been drawn successfully
                        context._map.fire('isochrones:displayed');
                    }
                    else {
                        // Fire event to inform that no data was returned
                        context._map.fire('isochrones:no_data');

                        // Log more specific details in the javascript console
                        if (console.log) console.log('Leaflet.isochrones.js: API returned data but no GeoJSON layers.');
                    }
                }

                // Inform that we have completed calling the API - could be useful for stopping a spinner etc. to indicate to the user that something was happening. Doesn't indicate success
                context._map.fire('isochrones:api_call_end');
            });
        }
        catch (e) {
            // Fire event to inform that an error occurred calling the API
            context._map.fire('isochrones:error');

            // Fire event to inform that no data was returned
            context._map.fire('isochrones:no_data');

            // Inform that we have completed calling the API - could be useful for stopping a spinner etc. to indicate to the user that something was happening.
            context._map.fire('isochrones:api_call_end');

            // Log the error in the console
            if (console.log) console.log('Leaflet.isochrones.js error attempting to call API.\nLikely cause is function simpleAjaxRequest has not been included and no alternative has been specified.\nSee docs for more details, actual error below.\n' + e);
        }
    }
});

L.control.isochrones = function (options) {
    return new L.Control.Isochrones(options);
};
