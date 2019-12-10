/*
    Created:        2019/12/09 by James Austin - Trafford Data Lab
    Purpose:        To provide an easy method of filtering content on a web page
    Dependencies:   None
    Licence:        https://www.trafforddatalab.io/assets/LICENSE.txt
*/
function LabFilter(objOptions) {
    var context = this;

    // Function taking input from the filter UI and performing the filtering process
    this.doFilter = function () {
        try {
            var def_filterTerm = context.input.value.toLowerCase();    // convert the input to lowercase so we can match like-for-like with the content
            var el;

            // Loop through the content elements we have been given, looking for matches of def_filterTerms
            for (var i = 0; i < context.contentElements.length; i++) {
                el = context.contentElements[i];

                if (def_filterTerm == '' || el.innerHTML.toLowerCase().indexOf(def_filterTerm) > -1) {
                    // Either the filter has been cleared or a match has been found
                    el.parentNode.classList.add(context.matchedClass);
                    el.parentNode.classList.remove(context.unMatchedClass);
                }
                else {
                    // This is non-matching item and so needs to be removed
                    el.parentNode.classList.remove(context.matchedClass);
                    el.parentNode.classList.add(context.unMatchedClass);
                }
            }
        }
        catch (e) {
            // Some error has occurred preventing the filter from working. Alert the user and remove the UI
            alert('Sorry, there is an issue using the search facility in this browser.\nApologies for the inconvenience.');
            context.filterContainer.removeChild(context.form);
        }
    };

    try {
        // Main properties
        this.contentElements = (objOptions['contentElements'] == null) ? document.getElementsByTagName('filterTags') : objOptions['contentElements'];  // the DOM elements containing the filter terms to search, looks for <filterTags> as default
        this.matchedClass = (objOptions['matchedClass'] == null) ? null : String(objOptions['matchedClass']);                 // CSV of CSS classes that we want adding to an element when a filter match is found and removing when it's not
        this.unMatchedClass = (objOptions['unMatchedClass'] == null) ? 'hideContent' : String(objOptions['unMatchedClass']);  // CSV of CSS classes that we want removing from an element when a filter match is found and adding when it's not, defaults to our standard 'hideContent' class (e.g. display: none;)

        // User Interface properties
        this.filterContainer = (objOptions['filterContainer'] == null) ? null : objOptions['filterContainer'];                      // The HTML object to create the user interface for the filter within
        this.filterClass = (objOptions['filterClass'] == null) ? null : String(objOptions['filterClass']);                          // CSS class[es] to apply to the user interface
        this.filterPlaceholder = (objOptions['filterPlaceholder'] == null) ? 'search...' : String(objOptions['filterPlaceholder']); // text to display within the filter input box

        // Create the form element to contain the filter
        this.form = document.createElement('form');
        this.form.id = 'frmFilter';
        this.form.name = 'frmFilter';
        this.form.method = 'get';
        this.form.action = '';
        this.form.setAttribute('onSubmit', 'return false;');
        this.form.addEventListener('submit', this.doFilter);

        // Create the input box to enter the filter terms
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.id = 'filterTerm';
        this.input.name = 'filterTerm';
        this.input.placeholder = this.filterPlaceholder;
        this.input.addEventListener('input', this.doFilter);
        if (this.filterClass !== null) this.input.setAttribute('class', this.filterClass);

        // Display the User Interface
        this.form.appendChild(this.input);              // add the filter input box to the form
        this.filterContainer.appendChild(this.form);    // add the completed form to the HTML element provided to the function
    }
    catch(e) {
        // Attempt to write out the error to the console if possible and don't do anything further - the functionality of the filter is not critical to the page
        if (window.console && window.console.log) {
            window.console.log('Error in labFilter.js - see below for details:');
            window.console.log(e);
        }
    }
}
