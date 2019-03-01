/*
    Created:        2019/02/27 by James Austin - Trafford Data Lab
    Purpose:        Alter the luminosity of a given colour and return the new colour
    Dependencies:   None
    Licence:        https://www.trafforddatalab.io/assets/LICENSE.txt
    Notes:          Original code written by Craig Buckler (https://twitter.com/craigbuckler)
                    Description: https://www.sitepoint.com/javascript-generate-lighter-darker-color/
                    Demo: http://blogs.sitepointstatic.com/examples/tech/color-luminance/index.html
                    Only changes made by James Austin are more error trapping, input parsing and extra comments
*/
function changeLuminosity(hexColour, luminosityFactor) {
    // Ensure luminosityFactor value is a number between -1 (representing a 100% reduction) and 1 (representing a 100% increase). 0 returns the same colour supplied in hexColour
    var lum = parseFloat(luminosityFactor);
    lum = (Math.abs(luminosityFactor) <= 1) ? luminosityFactor : 0;

    // Process the hexColour string to ensure we have been given a valid colour value in hex format
    var hex = String(hexColour).replace(/[^0-9a-f]/gi, '');

    // Throw error if the processed colour value is not 3 or 6 characters long. E.g. both f00 or ff0000 are acceptable values for red
    if (!(hex.length != 3 || hex.length != 6)) {
        throw ('changeLuminosity: ' + hexColour + ' not valid hexadecimal value.');
    }

    // Convert to 6 character hex value if in shortened 3 character version
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    var newHex = "#", dec;

    // Process the red, green and blue components separately
    for (var i = 0; i < 3; i++) {
        // convert to decimal and change luminosity
        dec = parseInt(hex.substr(i*2, 2), 16);
        dec = Math.round(Math.min(Math.max(0, dec + (dec * lum)), 255)).toString(16);

        // convert back to hex and add to output string
        newHex += ("00" + dec).substr(dec.length);
    }

    return newHex;
}
