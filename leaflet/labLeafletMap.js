/*
    Created:        2017/12/19 by James Austin - Trafford Data Lab
    Purpose:        Main library for creating Lab maps using Leaflet
    Dependencies:   Leaflet.js (external library), labCreateTileLayer.js (internal library)
    Licence:        http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
*/
function LabLeafletMap(objOptions) {
    var context = this;

	// ######### Properties #########
    this.attributes = (objOptions['attributes'] == null) ? { center: [53.4189, -2.33], zoom: 12, minZoom: 10, zoomDelta: 0.25, zoomSnap: 0 } : objOptions['attributes'];  // The attributes object contains the lat, lng, zoom etc. parameters to control the appearance of the map on load.
    this.attributes['zoomControl'] = false;           // added manually if required
    this.attributes['attributionControl'] = false;    // added manually so that we can put it in the bottom-left corner

    this.containerId = (objOptions['containerId'] == null) ? 'map' : String(objOptions['containerId']);         // The div that the map will be created within.
    this.map = (objOptions['map'] == null) ? L.map(this.containerId, this.attributes) : objOptions['map'];      // The actual Leaflet map object. In the Leaflet docs, everywhere they refer to 'map' we write 'this.map'.
    this.title = (objOptions['title'] == null) ? '' : String(objOptions['title']);                              // String content for the map title. Can contain HTML.
    this.about = (objOptions['about'] == null) ? '' : String(objOptions['about']);                              // String content for information about the map. Can contain HTML.
    this.aboutToggle = (objOptions['aboutToggle'] == 1) ? 1 : 0;                                                // Toggle state for whether the info panel is visible or not. Default is hidden.
    this.legendToggle = (objOptions['legendToggle'] == 0) ? 0 : 1;                                              // Toggle state for the legend. Default is visible so long as there is content, otherwise the legend control is completely invisible.
    this.filterGUI = (objOptions['filterGUI'] == null) ? '' : String(objOptions['filterGUI']);                  // HTML content to create form elements used to filter some aspect(s) of the content being displayed on the map.
    this.info = (objOptions['info'] == null) ? '' : String(objOptions['info']);                                 // Default string content to display within the info container. This is primarily used to display data values when hovering/selecting elements on the map.
    this.infoDockId = (objOptions['infoDockId'] == null) ? '' : String(objOptions['infoDockId']);               // The id of the div which contains the infoContainer div. This allows for the info content to scroll within the dock. If no id is supplied a div is created automatically and added to the main panel control. Supplying an id allows for flexible displays where the info panel is outside the map container.
    this.legend = (objOptions['legend'] == null) ? '' : String(objOptions['legend']);                           // The string content to display within the legend control. Can contain HTML.

    // Create the base layers object if it hasn't been supplied. This object is used in the layer control to change the tile layers of the map
    if (objOptions['baseLayers'] == null) {
        this.baseLayers = {
            "Light": labCreateTileLayer("CartoDB.Positron"),
            "Satellite": labCreateTileLayer("Esri.WorldImagery"),
            "None": labCreateTileLayer(null)
        }
    }
    else {
        this.baseLayers = objOptions['baseLayers'];
    }

    // Create the overlay layers object if it hasn't been supplied. These are layers that we want to be able to toggle on/off in the layer control which are not a base (tile) layers
    this.overlayLayers = (objOptions['overlayLayers'] == null) ? {} : objOptions['overlayLayers'];

    // Ordnance Survey attributions, a generic one and a specific Trafford Council addition with licence number
    var dateNow = new Date();
    this.attributionOS = 'Contains National Statistics &amp; OS data <a href="https://www.ons.gov.uk/methodology/geography/licences">&copy; Crown copyright and database right ' + dateNow.getFullYear() + '</a>';
    this.attributionTraffordOS = ' OS 1000023172. Use of this data is subject to <a href="https://www.ordnancesurvey.co.uk/business-and-government/help-and-support/public-sector/guidance/acknowledgments.html#moduleAccordion117220121119-4">terms and conditions</a>';
    // ###########################


    // ######### Map Pane Setup #########
    // create custom map panes for specific case where we need to control the order (z-index) in which layers are displayed
    this.map.createPane("pane_data_overlay");       // intended for non-administrative boundary data e.g. parks, watercourses etc.
    this.map.createPane("pane_geography_overlay");  // intended for administrative boundaries created using polylines so that you can interact with layers below
    this.map.createPane("pane_labels");             // intended for labelling for the either of the above layers

    // set the z-index of the panes to required values (NOTE: default overlay panes are 400, shadow panes are 500 and markers are 600)
    this.map.getPane("pane_data_overlay").style.zIndex = 425;
    this.map.getPane("pane_geography_overlay").style.zIndex = 450;
    this.map.getPane("pane_labels").style.zIndex = 475;
    // ###########################


    // ######### Internal Helper Functions #########
    // generic function to toggle a value passed to it between 0 and 1.  If argument is not 0 or 1 null is returned
    this.toggle = function (toggleVal) {
        if (toggleVal === 0 || toggleVal === 1) {
            return Math.abs(toggleVal - 1);
        }
        else {
            return null;
        }
    };

    // function to assign the correct styles to the about panel and associated toggle button
    this.toggleAbout = function (doToggle) {
        // Check if we are toggling the value - usually not on the first call as we just want to set the CSS classes
        if (doToggle !== false) context.aboutToggle = context.toggle(context.aboutToggle);

        if (context.aboutToggle == 0) {
            // about container is currently hidden
            L.DomUtil.removeClass(context.toggleAboutBtn, 'fa-chevron-circle-up');
            L.DomUtil.addClass(context.toggleAboutBtn, 'fa-chevron-circle-down');
            L.DomUtil.addClass(context.toggleAboutBtn, 'toggleGadgetHiddenState');
            L.DomUtil.addClass(context.aboutContainer, 'hideContent');
        }
        else {
            // about container is currently visible
            L.DomUtil.removeClass(context.toggleAboutBtn, 'fa-chevron-circle-down');
            L.DomUtil.addClass(context.toggleAboutBtn, 'fa-chevron-circle-up');
            L.DomUtil.removeClass(context.toggleAboutBtn, 'toggleGadgetHiddenState');
            L.DomUtil.removeClass(context.aboutContainer, 'hideContent');
        }
    };

    // function to assign the correct styles to the about panel and associated toggle button
    this.toggleLegend = function (doToggle) {
        // Check if we are toggling the value - usually not on the first call as we just want to set the CSS classes
        if (doToggle !== false) context.legendToggle = context.toggle(context.legendToggle);

        if (context.legendToggle == 0) {
            // legend container is currently hidden
            L.DomUtil.removeClass(context.toggleLegendBtn, 'fa-chevron-circle-down');
            L.DomUtil.addClass(context.toggleLegendBtn, 'fa-chevron-circle-up');
            L.DomUtil.addClass(context.toggleLegendBtn, 'toggleGadgetHiddenState');
            L.DomUtil.addClass(context.legendContainer, 'hideContent');
        }
        else {
            // legend container is currently visible
            L.DomUtil.removeClass(context.toggleLegendBtn, 'fa-chevron-circle-up');
            L.DomUtil.addClass(context.toggleLegendBtn, 'fa-chevron-circle-down');
            L.DomUtil.removeClass(context.toggleLegendBtn, 'toggleGadgetHiddenState');
            L.DomUtil.removeClass(context.legendContainer, 'hideContent');
        }
    };
    // ###########################


    // ######### Attribution Control #########
    // add the attribution control so that we can position it in the bottom-left
    this.attribution = L.control.attribution({ position: 'bottomleft', prefix: 'Drawn by <a href="https://www.trafforddatalab.io">Trafford Data Lab</a> using <a href="http://www.leafletjs.com">Leaflet</a>' }).addTo(this.map);
    // ###########################


    // ######### Geolocate Control #########
    // Add the geolocate control - within a try/catch in case the plugin can't be loaded from the CDN
    try {
        L.control.locate({
            icon: 'fa fa-compass',
            iconLoading: 'fa fa-spinner fa-pulse',
            position: 'topleft',
            strings: { title: 'Show/hide my location' },
            createButtonCallback: function (container, options) {
                // Override the internal button creation function so that we can add our own custom CSS class 'geoLocateMapControl'
                var link = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single geoLocateMapControl', container);
                link.title = options.strings.title;
                var icon = L.DomUtil.create(options.iconElementTag, options.icon, link);
                return { link: link, icon: icon };
            }
        }).addTo(this.map);
    }
    catch (e) {
        // Do nothing - for some reason we couldn't create the geoLocate control but it's not critical
    }
    // ###########################


    // ######### Layer Control #########
    // function so that we can call it when required e.g. when layers are dynamically created
    this.updateLayerControl = function () {
        if (this.layerControl !== undefined) this.layerControl.remove(); // remove existing control from the map first
        this.layerControl = L.control.layers(this.baseLayers, this.overlayLayers, { position: 'topleft', sortLayers: true }).addTo(this.map);
    };
    this.updateLayerControl();      // call the layer control update function to initially display the control
    // ###########################


    // ######### Legend Control #########
    this.legendControl = L.control({ position: 'bottomleft' });
    this.legendControl.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'labMapControls legendControl');
        return this._div;
    };
    this.legendControl.addTo(this.map);
    this.legendControlContainer = this.legendControl.getContainer();    // get the control container, not the div holding the content of the legend

    // legend toggle button
    this.toggleLegendBtn = document.createElement('div');                                   // creating the toggle button..
    this.toggleLegendBtn.setAttribute('class', 'fa fa-chevron-circle-down toggleGadget');   // ..adding the CSS..
    this.toggleLegendBtn.addEventListener('click', this.toggleLegend);                      // ..and the click event..
    this.legendControlContainer.appendChild(this.toggleLegendBtn);                          // ..finally adding it to the title container

    // create the container to hold the legend content
    this.legendContainer = L.DomUtil.create('div', 'legendContainer noFloat');
    this.legendControlContainer.appendChild(this.legendContainer);      // add the legend content div to the control
    // function so that we can call it when required e.g. when layers are dynamically created
    this.updateLegend = function (content) {
        if (content == null || content == '') {
            // if there is no content to display, hide the control by adding the CSS class 'hideContent' if it's not already present (this is because all controls have our labMapControl CSS class added to them, so we ned to hide the entire control)
            if (!L.DomUtil.hasClass(this.legendControlContainer, 'hideContent')) L.DomUtil.addClass(this.legendControlContainer, 'hideContent');
        }
        else {
            this.legendContainer.innerHTML = content;
            // remove the CSS class to hide the control if it's present
            if (L.DomUtil.hasClass(this.legendControlContainer, 'hideContent')) L.DomUtil.removeClass(this.legendControlContainer, 'hideContent');
        }
    };
    this.updateLegend(this.legend);     // call the legend update function in case we have default content to display
    this.toggleLegend(false);           // set the CSS classes according to the default toggle state
    // ###########################


    // ######### Main Panel (and sub-items) Control #########
    // map title and toggle button to hide/show the about panel - to be displayed within the mainPanel control
    this.titleContainer = L.DomUtil.create('div', 'titleContainer');                        // the container for the title content
    this.toggleAboutBtn = document.createElement('div');                                    // creating the toggle button..
    this.toggleAboutBtn.setAttribute('class', 'fa fa-chevron-circle-down toggleGadget');    // ..adding the CSS..
    this.toggleAboutBtn.addEventListener('click', this.toggleAbout);                        // ..and the click event..
    this.titleContainer.appendChild(this.toggleAboutBtn);                                   // ..finally adding it to the title container
    this.titleContainer.appendChild(document.createTextNode(this.title));                   // add the title text to the title container

    // about this map information
    this.aboutContainer = L.DomUtil.create('div', 'aboutContainer');
    this.aboutContainer.innerHTML = this.about;

    // Add classes based on whether we are initially showing the about section or not to both the toggle button and the about container
    this.toggleAbout(false);

    // potential filter controls
    this.filterContainer = L.DomUtil.create('div', 'filterContainer');
    // function so that we can call it when required e.g. when layers are dynamically created
    this.updateFilterGUI = function (content) {
        this.filterContainer.innerHTML = content;
    };
    this.updateFilterGUI(this.filterGUI);     // call the filter GUI update function in case we have content to display

    // info panel for displaying values on-hover etc.
    this.infoContainer = L.DomUtil.create('div', 'infoContainer');

    // create the main display panel control which contains the map title, about description, any dataset/filtering options and the information to be displayed when hovering over objects on the map
    this.mainPanelControl = L.control({ position: 'topright' });
    this.mainPanelControl.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'labMapControls mainPanelControl');
        return this._div;
    };
    this.mainPanelControl.addTo(this.map);

    // add all containers to be displayed within the mainPanel control to its container
    this.mainPanelContainer = this.mainPanelControl.getContainer();
    this.mainPanelContainer.appendChild(this.titleContainer);
    this.mainPanelContainer.appendChild(this.aboutContainer);
    this.mainPanelContainer.appendChild(this.filterContainer);

    if (this.infoDockId == '') {
        // We are adding the info container to the main panel, so we need to create the dock div to add it to, allowing scrolling to occur etc.
        this.infoDockContainer = L.DomUtil.create('div', 'infoDockContainer');

        // now add the divs into their correct containers
        this.infoDockContainer.appendChild(this.infoContainer);
        this.mainPanelContainer.appendChild(this.infoDockContainer);
    }
    else {
        // The map creator has provided a dock container for the info panel so just add the infoContainer to it
        this.infoDockContainer = document.getElementById(this.infoDockId);
        this.infoDockContainer.appendChild(this.infoContainer);
    }

    // function to update the info content so that we can call it when required e.g. when hovering over Layers
    this.updateInfo = function (content) {
        if (content == null) content = this.info;   // This ensures any default text is displayed if nothing is passed to the function
        this.infoContainer.innerHTML = content;

        // hide the info container if there's no content to display or show it if there is
        if (content == null || content == '') {
            if (L.DomUtil.hasClass(this.infoDockContainer, 'hideContent') == false) L.DomUtil.addClass(this.infoDockContainer, 'hideContent');
        }
        else {
            if (L.DomUtil.hasClass(this.infoDockContainer, 'hideContent')) L.DomUtil.removeClass(this.infoDockContainer, 'hideContent');
        }
    };
    this.updateInfo();     // call the info panel update function in case we want to display default text
    // ###########################


    // ######### Map Event Setters #########
    // Prevent the map from scrolling/zooming when the mouse pointer is within the main panel or the legend
    this.stopProp = L.DomEvent.stopPropagation;
    this.clickEventHandler = L.Browser.touch && ('ontouchstart' in document.documentElement) ? 'touchstart' : 'click';

    L.DomEvent
        .on(this.mainPanelContainer, this.clickEventHandler, this.stopProp)
        .on(this.mainPanelContainer, 'mousedown', this.stopProp)
        .on(this.mainPanelContainer, 'dblclick', this.stopProp)
        .on(this.mainPanelContainer, 'mousewheel', this.stopProp)
        .on(this.mainPanelContainer, 'pointerdown', this.stopProp)
        .on(this.legendControlContainer, this.clickEventHandler, this.stopProp)
        .on(this.legendControlContainer, 'mousedown', this.stopProp)
        .on(this.legendControlContainer, 'dblclick', this.stopProp)
        .on(this.legendControlContainer, 'mousewheel', this.stopProp)
        .on(this.legendControlContainer, 'pointerdown', this.stopProp)
    // ###########################
}
