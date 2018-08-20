/*
    Created:        2017/12/15 by James Austin - Trafford Data Lab
    Purpose:        To fetch data from files, APIs, SPARQL sources etc. via AJAX and pass the data back via a callback function.
    Dependencies:   labError.js (internal library)
    Licence:        https://www.trafforddatalab.io/assets/LICENSE.txt
*/
function labAjax(url, callback, objOptions) {
    // Set the default values for the options - NOTE: there is no syncronous option as this has generally been deprecated, therefore all calls are asyncronous
    var def_method = 'GET';             // The request method to use, e.g. GET, POST etc.
    var def_data = null;                // Specifies any data you want to send along with the request, usually in POST requests
    var def_type = 'json';              // The data format we are returning - default is JSON as this is the most common usage for us
    var def_header = null;              // If we need to send a header along with the request, in an array format [{ header: "string", value: "string" }] or [{ header: "string1", value: "string1" }, { header: "string2", value: "string2" }] etc.
    var def_withCredentials = false;    // Indicates whether or not cross-site Access-Control requests should be made using credentials such as cookies, authorization headers or TLS client certificates. Setting withCredentials has no effect on same-site requests.
    var def_eventProgress = null;       // Event handler for reporting progress of the transfer
    var def_eventLoad = null;           // Event handler for reporting when the transfer has completed
    var def_eventError = null;          // Event handler for reporting an error with the transfer
    var def_eventAbort = null;          // Event handler for reporting when a transfer has been cancelled
    var def_eventEnd = null;            // Event handler for reporting when a transfer has finished, whether that's a successful load, abort or error
    var def_unsuccessfulRequest = null; // A user defined function to be called if xmlhttp.status >= 300
    var def_cache = false;              // Whether we want to cache the data once we've loaded it
    var def_cacheObj = ajaxCache;       // Object to store the cached data - either one passed to us in the options or using the global var
    var def_forceRefresh = false;       // Whether to load the data from source irrespective of whether there is a cached version

    if (objOptions != null) {
        if (objOptions['method'] != null) def_method = String(objOptions['method']);
        if (objOptions['data'] != null) def_data = String(objOptions['data']);
        if (objOptions['type'] != null) def_type = String(objOptions['type']);
        if (objOptions['header'] != null) def_header = objOptions['header'];
        if (objOptions['withCredentials'] === true) def_withCredentials = true;
        if (objOptions['eventProgress'] != null) def_eventProgress = objOptions['eventProgress'];
        if (objOptions['eventLoad'] != null) def_eventLoad = objOptions['eventLoad'];
        if (objOptions['eventError'] != null) def_eventError = objOptions['eventError'];
        if (objOptions['eventAbort'] != null) def_eventAbort = objOptions['eventAbort'];
        if (objOptions['eventEnd'] != null) def_eventEnd = objOptions['eventEnd'];
        if (objOptions['unsuccessfulRequest'] != null) def_unsuccessfulRequest = objOptions['unsuccessfulRequest'];
        if (objOptions['cache'] === true) def_cache = true;
        if (objOptions['cacheObj'] != null) def_cacheObj = objOptions['cacheObj'];
        if (objOptions['forceRefresh'] === true) def_forceRefresh = true;
    }

    if (def_forceRefresh === false && def_cacheObj[url] != null) {
        callback(def_cacheObj[url]);   // The data has already been cached so return it from there
    }
    else {
        // Attempt to load the data from the source implementing AJAX in native JavaScript, so long as the browser supports XMLHttpRequest
        if (window.XMLHttpRequest) {
            var xmlhttp = new XMLHttpRequest();

            // Set up the handler to check the status of the request and perform the processing once complete
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
                else if (xmlhttp.status >= 300) {
                    // Not a successful response, perhaps a 404 etc. so abort
                    if (def_unsuccessfulRequest != null) def_unsuccessfulRequest(xmlhttp);    // call user-defined function if specified with the xmlhttp object
                    xmlhttp.abort();
                    callback(null);
                }
            };

            // Set up an error handler in case the process fails
            xmlhttp.onerror = function () {
                xmlhttp.abort();
                callback(null); // failed to process the request - perhaps CORS issues, i.e. 403, 405 responses etc.
            };

            try {
                // Add any event handlers if they have been supplied
                if (def_eventProgress != null) xmlhttp.addEventListener("progress", def_eventProgress);
                if (def_eventLoad != null) xmlhttp.addEventListener("load", def_eventLoad);
                if (def_eventError != null) xmlhttp.addEventListener("error", def_eventError);
                if (def_eventAbort != null) xmlhttp.addEventListener("abort", def_eventAbort);
                if (def_eventEnd != null) xmlhttp.addEventListener("loadend", def_eventEnd);

                // Open the request - 3rd argument == true to denote an asyncronous request
                xmlhttp.open(def_method, url, true);

                // if we need to make a credentialed request
                if (def_withCredentials && ("withCredentials" in xmlhttp)) xmlhttp.withCredentials = true;

                // Optional header(s) to send along with the XMLHttpRequest
                if (def_header !== null && Array.isArray(def_header)) {
                    for (var i = 0; i < def_header.length; i++) {
                        xmlhttp.setRequestHeader(def_header[i]['header'], def_header[i]['value']);
                    }
                }

                (def_data == null) ? xmlhttp.send() : xmlhttp.send(def_data); // Attempt to make the request
            }
            catch(e) {
                xmlhttp.abort();
                callback(null); // failed to process the request - perhaps bad arguments. Quit nicely
            }
        }
        else {
            labError(new LabException("Error in labAjax(). Failed to load the following: " + url + " as browser doesn't support XMLHttpRequest."));
        }
    }
}

var ajaxCache = {};     // Global variable to hold cached data returned from AJAX queries in the format: { '<url>': {<data>} }
