/*
    Created:        2019/02/27 by James Austin - Trafford Data Lab
    Purpose:        Create an SVG marker to use as the L.marker object on Leaflet maps to represent point data in GeoJSON
    Dependencies:   Leaflet.js (external library), changeLuminosity.js (internal library), lab_marker_shadow.png (internal graphic)
    Licence:        https://www.trafforddatalab.io/assets/LICENSE.txt
    Notes:          Thanks to Paul Wujek for the tip to base64 encode the URL of the SVG image here: https://groups.google.com/forum/#!topic/leaflet-js/GSisdUm5rEc
*/
function labMarkerSVG(objOptions) {
    // Process the parameters
    var colour = (objOptions['color'] == null) ? '#fc6721' : objOptions['color'];         // NOTE: deliberate HTML spelling of "colour" as "color" as it is an input key of the objOptions object to comply with standards
    var gradientLight, gradientDark;

    // Calculate the light and dark gradient values to shade the marker
    try {
        gradientLight = changeLuminosity(colour, 0.8);
        gradientDark = changeLuminosity(colour, -0.61);
    }
    catch (e) {
        // The colour value provided is not valid so default to Lab orange
        colour = '#fc6721';
        gradientLight = '#ffb93b';
        gradientDark = '#62280d';
    }

    var objLeafletIconOptions;     // object to hold the parameters to pass to L.icon. Values depend on the size of the marker, therefore are set below

    var size = objOptions['size'];
    if (size === 'small') {
        objLeafletIconOptions = {
            iconSize: [12, 20],
            iconAnchor: [12, 20],
            popupAnchor: [-6, -15],
            tooltipAnchor: [0, 0],
            shadowAnchor: [11, 11],
        }
    }
    else if (size === 'large') {
        objLeafletIconOptions = {
            iconSize: [18, 30],
            iconAnchor: [18, 30],
            popupAnchor: [-9, -25],
            tooltipAnchor: [0, 0],
            shadowAnchor: [12, 12],
        }
    }
    else {
        size = 'medium';

        objLeafletIconOptions = {
            iconSize: [15, 25],
            iconAnchor: [15, 25],
            popupAnchor: [-8, -20],
            tooltipAnchor: [0, 0],
            shadowAnchor: [11, 11]
        }
    }

    // Create the SVG image using the calculated colours for the gradient of the marker
    var svg  = '<?xml version="1.0" encoding="UTF-8"?>';
        svg += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
        svg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" width="15" height="25" viewBox="0, 0, 15, 25">';
        svg += '    <defs>';
        svg += '        <linearGradient id="Gradient_1" gradientUnits="userSpaceOnUse" x1="3.15" y1="21.575" x2="6.301" y2="21.575" gradientTransform="matrix(0.942, -0.336, 0.336, 0.942, 0, 0)">';
        svg += '            <stop offset="0" stop-color="#C2BBBB"/>';
        svg += '            <stop offset="0.311" stop-color="#FFFFFF"/>';
        svg += '            <stop offset="0.52" stop-color="#9E9E9E"/>';
        svg += '            <stop offset="1" stop-color="#040404"/>';
        svg += '        </linearGradient>';
        svg += '        <linearGradient id="Gradient_2" gradientUnits="userSpaceOnUse" x1="5.877" y1="19.799" x2="3.697" y2="21.33" gradientTransform="matrix(0.944, -0.33, 0.33, 0.944, 0, 0)">';
        svg += '            <stop offset="0" stop-color="#000000"/>';
        svg += '            <stop offset="0.426" stop-color="#000000" stop-opacity="0.665"/>';
        svg += '            <stop offset="1" stop-color="#1B1B1B" stop-opacity="0"/>';
        svg += '        </linearGradient>';
        svg += '        <radialGradient id="Gradient_3" gradientUnits="userSpaceOnUse" cx="-3.894" cy="-4.09" r="9.985" gradientTransform="matrix(-1, -0, 0, -1, 0, 0)">';
        svg += '            <stop offset="0" stop-color="' + gradientLight + '"/>';
        svg += '            <stop offset="0.411" stop-color="' + colour + '"/>';
        svg += '            <stop offset="1" stop-color="' + gradientDark + '"/>';
        svg += '        </radialGradient>';
        svg += '    </defs>';
        svg += '    <g id="lab_marker_pin">';
        svg += '        <path d="M9.496,12.558 L9.496,12.558 C10.316,12.266 11.217,12.693 11.509,13.513 L14.856,22.895 C15.148,23.714 14.721,24.616 13.901,24.908 L13.901,24.908 C13.082,25.2 12.18,24.773 11.888,23.953 L8.542,14.571 C8.249,13.752 8.677,12.85 9.496,12.558 z" fill="url(#Gradient_1)" id="pin_stalk"/>';
        svg += '        <path d="M11.578,13.689 C11.58,13.692 11.576,13.687 11.578,13.689 C11.634,13.82 11.677,13.966 11.734,14.097 C12.119,15.2 14.7,21.748 13.137,21.905 C11.484,22.07 10.455,19.795 8.775,15.13 L8.642,14.775 C9.181,14.725 9.492,14.618 9.878,14.492 C10.056,14.434 10.46,14.273 10.77,14.134 C10.973,14.043 11.383,13.826 11.551,13.714 C11.558,13.71 11.572,13.694 11.578,13.689 z" fill="url(#Gradient_2)" id="pin_stalk_shadow"/>';
        svg += '        <path d="M7.503,0 C11.617,0.002 14.95,3.338 14.948,7.451 C14.946,11.565 11.61,14.898 7.497,14.896 C3.383,14.894 0.05,11.558 0.052,7.444 C0.054,3.331 3.39,-0.002 7.503,0 z" fill="url(#Gradient_3)" id="pin_head"/>';
        svg += '    </g>';
        svg += '</svg>';

    // Add icon and shadow URL parameters to the icon object to pass to L.icon
    objLeafletIconOptions.iconUrl = 'data:image/svg+xml;base64,' + btoa(svg);
    objLeafletIconOptions.shadowUrl = 'lab_marker_shadow.png';

    // Create and return the Leaflet icon object
    return L.icon(objLeafletIconOptions);
}
