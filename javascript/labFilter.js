/*
    Created:        2019-12-09 by James Austin - Trafford Data Lab
    Updated:        2020-05-01 - improved accessibility
    Purpose:        To provide an easy method of filtering content on a web page
    Dependencies:   None
    Licence:        https://www.trafforddatalab.io/assets/LICENSE.txt

    Inputs:
        - filterContainer   : (HTML element) in which to create the form allowing the user to enter filter keywords
        - filterClass       : (String) CSS class name(s) to style the input field
        - filterPlaceholder : (String) placeholder text for the input field
        - filterTitle       : (String) tooltip for the input field
        - filterLabel       : (String) content for a label element associated with the input field
        - filterAriaLabel   : (String) content for the attribute helping give extra information to users of accessibility software
        - filterTags        : (HTML elements) containing the filter keywords to search on - they are child nodes of the elements to filter
        - noMatchesMsg      : (String) to display when no matches are found within the filterTags
        - noMatchesClass    : (String) CSS class name(s) to style the no matches message

    Example DOM hierachy:
        <span id="filterContainer"></span>

        <section>
            <div>
                <span class="filterTags"><!-- keyword1 keyword2 ... keywordN --></span>
                <p>This is an item you can filter.</p>
            </div>

            <div>
                <span class="filterTags"><!-- keyword1 keyword2 ... keywordN --></span>
                <p>This is another item you can filter.</p>
            </div>
        </section>
*/
function LabFilter(objOptions) {
    var context = this;

    // Function taking input from the filter UI and performing the filtering process
    this.doFilter = function () {
        try {
            var filterTerms = context.input.value.toLowerCase();    // convert the input to lowercase so we can match like-for-like with the content
            var numMatch = 0;   // a count of the total number of matches found

            // remove no results message if present
            if (context.elItemsContainer.contains(context.elNoMatchesMsg)) context.elItemsContainer.removeChild(context.elNoMatchesMsg);

            // remove all currently displayed items from their container - we add the matching ones back in below
            for (var i = 0; i < context.elItems.length; i++) {
                if (context.elItemsContainer.contains(context.elItems[i])) context.elItemsContainer.removeChild(context.elItems[i]);
            }

            // Loop through all elements containing the filter keywords for each item, looking for matches
            for (var i = 0; i < context.arrFilters.length; i++) {
                if (filterTerms == '' || context.arrFilters[i].indexOf(filterTerms) > -1) {
                    // Either the filter has been cleared or a match has been found
                    context.elItemsContainer.appendChild(context.elItems[i]);   // add the item to the container
                    numMatch++; // increment the match count
                }
            }

            // Report the result of the filter
            var resultMsg;

            if (numMatch == 0) {
                resultMsg = ' (no matches)';

                // No matches have been found so display message in the item container so that it is not just empty
                context.elItemsContainer.appendChild(context.elNoMatchesMsg);
            }
            else if (numMatch == context.elItems.length) {
                resultMsg = ' (showing all ' + context.elItems.length + ')';
            }
            else {
                resultMsg = ' (showing ' + numMatch + ' of ' + context.elItems.length + ')';
            }

            // now update the result count container with the result
            context.elResultContainer.removeChild(context.elResultMsg);
            context.elResultMsg = document.createTextNode(resultMsg);   // we need to have a reference to this text node so that we can remove it
            context.elResultContainer.appendChild(context.elResultMsg);
        }
        catch (e) {
            // Some error has occurred preventing the filter from working. Alert the user and remove the UI
            alert('Sorry, an issue occurred with the filter facility.\nIt will now be removed, apologies for the inconvenience.');
            context.elFilterUIContainer.removeChild(context.form);
        }
    };

    try {
        // Get an array of all HTML elements containing the keywords or 'tags' we are going to filter on. Looks for elements containing the .filterTags class by default
        var elFilters = (objOptions['filterTags'] == null) ? document.getElementsByClassName('filterTags') : objOptions['filterTags'];

        // Get an array of the parent elements of the filter keywords - these are effectively the elements we are going to show/hide when we do a search
        // We also need to create an array of the search keywords associated with each item as elFilters will be destroyed once we begin searching as the parent elements will be removed from the DOM
        this.elItems = new Array();        // this will be an array of DOM elements
        this.arrFilters = new Array();     // this will be an array of search terms, the index in the array corresponding to the item they belong to
        for (var i = 0; i < elFilters.length; i++) {
            this.elItems.push(elFilters[i].parentNode);
            this.arrFilters.push(elFilters[i].innerHTML.toLowerCase());
        }

        // The items to search on should be in some form of container, (e.g. div, section etc.) - we need to insert/remove the items in the DOM with reference to this
        this.elItemsContainer = this.elItems[0].parentNode;

        // Create a message to display if no results are found - this can be added and removed from elItemsContainer as required
        var noMatchesMsg = (objOptions['noMatchesMsg'] == null) ? 'Sorry, no matches were found.' : String(objOptions['noMatchesMsg']);
        this.elNoMatchesMsg = document.createElement('p');
        this.elNoMatchesMsg.appendChild(document.createTextNode(noMatchesMsg));
        if (objOptions['noMatchesClass'] != null) this.elNoMatchesMsg.setAttribute('class', String(objOptions['noMatchesClass']));

        // User Interface properties
        this.elFilterUIContainer = (objOptions['filterContainer'] == null) ? null : objOptions['filterContainer'];  // The HTML object to create the user interface for the filter within
        this.filterClass = (objOptions['filterClass'] == null) ? null : String(objOptions['filterClass']);  // CSS class[es] to apply to the user interface
        this.filterPlaceholder = (objOptions['filterPlaceholder'] == null) ? 'enter keywords...' : String(objOptions['filterPlaceholder']); // text to display within the filter input box
        this.filterTitle = (objOptions['filterTitle'] == null) ? '' : String(objOptions['filterTitle']);  // An optional descriptive title to appear in a tooltip
        this.filterAriaLabel = (objOptions['filterAriaLabel'] == null) ? 'Begin typing to automatically filter the items on the page.' : String(objOptions['filterLabel']);  // Extra instructions read aloud by screen readers to assist users
        this.filterLabel = (objOptions['filterLabel'] == null) ? null : String(objOptions['filterLabel']);  // An optional label to associate with the input box to further make the form more accessible

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
        this.input.addEventListener('input', this.doFilter);
        if (this.filterPlaceholder !== '') this.input.placeholder = this.filterPlaceholder;
        if (this.filterTitle !== '') this.input.title = this.filterTitle;
        if (this.filterAriaLabel !== '') this.input.setAttribute('aria-label', this.filterAriaLabel);
        if (this.filterClass !== null) this.input.setAttribute('class', this.filterClass);

        // Create the label associated with the input box if text has been provided and add it to the form
        if (this.filterLabel !== null) {
            this.label = document.createElement('label');
            this.label.setAttribute('for', this.input.id);
            this.label.appendChild(document.createTextNode(this.filterLabel));
            this.form.appendChild(this.label);
        }

        // Feedback status message on the number of items currently being shown
        this.elResultContainer = document.createElement('span');
        this.elResultContainer.setAttribute('role', 'status');      // required for screen readers to know the contents are dynamic
        this.elResultContainer.setAttribute('aria-live', 'polite'); // for maximum compatability with the above, and to ensure the updates don't interrupt the user
        this.elResultMsg = document.createTextNode(' (showing all ' + this.elItems.length + ').');  // all items will currently be shown when the filter initialises
        this.elResultContainer.appendChild(this.elResultMsg);

        // Display the User Interface
        this.form.appendChild(this.input);                  // add the filter input box to the form
        this.form.appendChild(this.elResultContainer);      // add the feedback message
        this.elFilterUIContainer.appendChild(this.form);    // add the completed form to the HTML element which is to display the filter UI
    }
    catch(e) {
        // Attempt to write out the error to the console if possible and don't do anything further - the functionality of the filter is not critical to the page
        if (window.console && window.console.log) {
            window.console.log('Error in labFilter.js - see below for details:');
            window.console.log(e);
        }
    }
}
