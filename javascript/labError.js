/*
    Created:        2017/12/18 by James Austin - Trafford Data Lab
    Purpose:        To handle the event of errors correctly whether we are running on the live or development environment
    Licence:        http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
    Notes:          Assumes that all live environments we will be running from will be www. subdomains
*/
function labError(e) {
    if (location.href.substring(0, 12) = 'https://www.') {
    	// If we're running from a live environment redirect to the error page
        location.href = "https://www.trafforddatalab.io/error.html";
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
