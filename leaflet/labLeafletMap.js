/*
    Created:        2017/12/19 by James Austin - Trafford Data Lab
    Purpose:        Main library for creating Lab maps using Leaflet
    Dependencies:   Leaflet.js (external library), labCreateTileLayer.js (internal library)
    Licence:        http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
*/
function LabLeafletMap(objOptions) {
    var context = this;

	// ### Properties ###
    this.attributes = (objOptions['attributes'] == null) ? { center: [53.4189, -2.33], zoom: 12, minZoom: 10 } : objOptions['attributes'];  // The attributes object contains the lat, lng, zoom etc. parameters to control the appearance of the map on load.
    this.attributes['zoomControl'] = false;           // added manually as we need to reference the container
    this.attributes['attributionControl'] = false;    // added manually so that we can put it in the bottom-left corner

    this.containerId = (objOptions['containerId'] == null) ? 'map' : String(objOptions['containerId']);         // The div that the map will be created within.
    this.map = (objOptions['map'] == null) ? L.map(this.containerId, this.attributes) : objOptions['map'];      // The actual Leaflet map object. In the Leaflet docs, everywhere they refer to 'map' we write 'this.map'.
    this.title = (objOptions['title'] == null) ? '' : String(objOptions['title']);                              // String content for the map title. Can contain HTML.
    this.about = (objOptions['about'] == null) ? '' : String(objOptions['about']);                              // String content for information about the map. Can contain HTML.
    this.aboutToggle = (objOptions['aboutToggle'] == 1) ? 1 : 0;                                                // Toggle state for whether the info panel is visible or not. Default is hidden.
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


    // ### Map Pane Setup ###
    // create custom map panes to control the order (z-index) in which layers are displayed
    this.map.createPane("pane_geography_overlay");
    this.map.createPane("pane_labels");

    // set the z-index of the panes to required values (NOTE: default overlay panes are 400, shadow panes are 500 and markers are 600)
    this.map.getPane("pane_geography_overlay").style.zIndex = 450;
    this.map.getPane("pane_labels").style.zIndex = 490;

    // disable pointer events on the geography overlay and labels panes so that the layers underneath register the clicks/taps
    this.map.getPane("pane_geography_overlay").style.pointerEvents = "none";
    this.map.getPane("pane_labels").style.pointerEvents = "none";


    // ### Map Controls ###
    // add the attribution control so that we can position it in the bottom-left
    this.attribution = L.control.attribution({ position: 'bottomleft', prefix: 'Drawn by <a href="https://www.trafforddatalab.io">Trafford Data Lab</a> using <a href="http://www.leafletjs.com">Leaflet</a>' }).addTo(this.map);

    // add the zoom control manually so that we can reference it to add other controls to it e.g. geolocate
    this.zoom = L.control.zoom().addTo(this.map);

    // Add the geolocate control - within a try/catch in case the plugin can't be loaded from the CDN
    try {
        this.locate = L.control.locate({
            icon: 'fa fa-compass',
            iconLoading: 'fa fa-spinner fa-pulse',
            position: 'bottomright',
            strings: { title: 'Show/hide my location' },
            createButtonCallback: function (container, options) {
                L.DomUtil.addClass(container, 'hideContent')  // We're not using the container supplied from the plugin - we're using the zoom control as the container
                var link = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single geoLocateMapControl', context.zoom.getContainer());
                link.title = options.strings.title;
                var icon = L.DomUtil.create(options.iconElementTag, options.icon, link);
                return { link: link, icon: icon };
            }
        }).addTo(this.map);
    }
    catch (e) {
        // Do nothing - for some reason we couldn't create the geoLocate control but it's not critical
        this.locate = null;
    }

    // map layer control
    // function so that we can call it when required e.g. when layers are dynamically created
    this.updateLayerControl = function () {
        if (this.layerControl !== undefined) this.layerControl.remove(); // remove existing control from the map
        this.layerControl = L.control.layers(this.baseLayers, this.overlayLayers, { position: 'topleft', sortLayers: true }).addTo(this.map);
        L.DomUtil.addClass(this.layerControl.getContainer(), 'layerControl');
    };
    this.updateLayerControl();      // call the layer control update function to initially display the control

    // legend control
    this.legendControl = L.control({ position: 'bottomleft' });
    this.legendControl.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'labMapControls legendControl');
        return this._div;
    };
    this.legendControl.addTo(this.map);
    // create the container to hold the legend content
    this.legendContainer = L.DomUtil.create('div', 'legendContainer');
    this.legendControlContainer = this.legendControl.getContainer();    // this is the control container, not the div holding the content of the legend
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

    // map title and toggle button to hide/show the about panel - to be displayed within the mainPanel control
    this.toggleAboutStyles = function () {
        if (context.aboutToggle == 0) {
            // about section is currently hidden
            L.DomUtil.addClass(context.toggleAboutBtn, 'aboutToggleHiddenState');
            L.DomUtil.addClass(context.aboutContainer, 'hideContent');
        }
        else {
            // about section is currently visible
            L.DomUtil.removeClass(context.toggleAboutBtn, 'aboutToggleHiddenState');
            L.DomUtil.removeClass(context.aboutContainer, 'hideContent');
        }
    };

    this.toggleAbout = function () {
        context.aboutToggle = Math.abs(context.aboutToggle - 1);  // toggle the value between 0 and 1
        context.toggleAboutStyles();
    };

    this.titleContainer = L.DomUtil.create('div', 'titleContainer');            // the container for the title content
    this.toggleAboutBtn = document.createElement('div');                        // creating the toggle button..
    this.toggleAboutBtn.setAttribute('class', 'fa fa-info-circle aboutToggle'); // ..adding the CSS..
    this.toggleAboutBtn.addEventListener('click', this.toggleAbout);            // ..and the click event..
    this.titleContainer.appendChild(this.toggleAboutBtn);                       // ..finally adding it to the title container
    this.titleContainer.appendChild(document.createTextNode(this.title));       // add the title text to the title container

    // about this map information
    this.aboutContainer = L.DomUtil.create('div', 'aboutContainer');
    this.aboutContainer.innerHTML = this.about;

    // Add classes based on whether we are initially showing the about section or not to both the toggle button and the about container
    this.toggleAboutStyles();

    // potential filter controls
    this.filterContainer = L.DomUtil.create('div', 'filterContainer');
    // function so that we can call it when required e.g. when layers are dynamically created
    this.updateFilterGUI = function (content) {
        this.filterContainer.innerHTML = content;
    };
    this.updateFilterGUI(this.filterGUI);     // call the filter GUI update function in case we have content to display

    // info panel for displaying values on-hover etc.
    this.infoContainer = L.DomUtil.create('div', 'infoContainer');
    // function so that we can call it when required e.g. when hovering over Layers
    this.updateInfo = function (content) {
        if (content == null) content = this.info;   // This ensures any default text is displayed if nothing is passed to the function
        this.infoContainer.innerHTML = content;
    };
    this.updateInfo();     // call the info panel update function in case we want to display default text

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
}
