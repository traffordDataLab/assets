/*
    Created:        2017/12/15 by James Austin - Trafford Data Lab
    Purpose:        To fetch data from files, APIs, SPARQL sources etc. via AJAX and pass the data back via a callback function.
    Dependencies:   labError.js (internal library)
    Licence:        http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
*/
function labAjax(url, callback, objOptions) {
    var def_method = 'GET';         // The request method to use, e.g. GET, POST etc.
    var def_type = 'json';          // The data format we are returning
    var def_header = null;          // If we need to send a header along with the request, in the format { header: "string", value: "string" }
    var def_cache = true;           // Whether we want to cache the data once we've loaded it
    var def_cacheObj = ajaxCache;   // Object to store the cached data - either one passed to us in the options or using the global var
    var def_forceRefresh = false;   // Whether to load the data from source irrespective of whether there is a cached version

    if (objOptions != null) {
        if (objOptions['method'] != null) def_method = String(objOptions['method']);
        if (objOptions['type'] != null) def_type = String(objOptions['type']);
        if (objOptions['header'] != null) def_header = objOptions['header'];
        if (objOptions['cache'] === false) def_cache = false;
        if (objOptions['cacheObj'] != null) def_cacheObj = objOptions['cacheObj'];
        if (objOptions['forceRefresh'] === true) def_forceRefresh = true;
    }

    if (def_forceRefresh === false && def_cacheObj[url] != null) {
        callback(def_cacheObj[url]);   // The data has already been cached so return it from there
    }
    else {
        // Load the data from the source implementing AJAX in native JavaScript
        if (window.XMLHttpRequest) {
            // if the browser supports XMLHttpRequest attempt to load content
            var xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    // we are ready to process the result
                    var ajaxResult;

                    switch (def_type) {
                      case 'json':
                        ajaxResult = JSON.parse(xmlhttp.responseText);
                        break;
                      case 'xml':
                        ajaxResult = xmlhttp.responseXML;
                        break;
                      default:
                        // Just treat it as text
                        ajaxResult = xmlhttp.responseText;
                    }

                    if (def_cache === true) def_cacheObj[url] = ajaxResult;   // Cache the data if required
                    callback(ajaxResult);
                }
            }

            xmlhttp.open(def_method, url + '?t=' + Math.random(), true);   // ?t= etc. to avoid potential cache issues on the source
            if (def_header !== null) xmlhttp.setRequestHeader(String(def_header['header']), String(def_header['value'])); // Optional headers to send along with the XMLHttpRequest
            xmlhttp.send();
        }
        else {
            labError(new LabException("Error in labAjax(). Failed to load the following: " + url + " as browser doesn't support XMLHttpRequest."));
        }
    }
}

var ajaxCache = {};     // Global variable to hold cached data returned from AJAX queries in the format: { '<url>': {<data>} }