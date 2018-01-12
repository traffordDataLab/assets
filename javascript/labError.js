/*
    Created:        2017/12/18 by James Austin - Trafford Data Lab
    Purpose:        To handle the event of errors correctly whether we are running on the live or development environment
    Licence:        http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
    Notes:          Assumes that all live environments we will be running from will be www. subdomains
*/
function labError(e) {
    if (location.href.indexOf("://www.") > -1) {
    	// If we're running from a live environment redirect to the error page and try to log the error in the console for phone/email support
        location.href = "http://www.traffordDataLab.io/error.html";
        if (window.console && console.log) console.log("Trafford Data Lab Error: " + e.message);
    }
    else {
    	// Otherwise show the error as we are running from a development environment
        alert("The following error occurred:\n" + e.message);
    }
}

function LabException(msg) {
    // Custom error object for creating exceptions in the correct format
    this.message = msg;
    this.name = "Trafford Data Lab Error";
}
