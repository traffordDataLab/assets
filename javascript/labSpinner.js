/*
    Created:        2018/04/06 by James Austin - Trafford Data Lab
    Purpose:        Inform the user that something is happening
    Dependencies:   Font-awesome (external CSS)
    Licence:        https://www.trafforddatalab.io/assets/LICENSE.txt
*/
var lab_spinner = {     // Use non-standard naming convention to avoid conflicts
    container: null,
    icon: null
};

function startLabSpinner() {
    // create container
    lab_spinner.container = document.createElement('div');
    lab_spinner.container.setAttribute('style', 'position: absolute; width: 100%; height: 100%; top: 0, left: 0; background-color: rgba(50,50,50,0.5); z-index: 999998');

    // create icon
    lab_spinner.icon = document.createElement('div');
    lab_spinner.icon.setAttribute('class', 'fa fa-spinner fa-pulse');
    lab_spinner.icon.setAttribute('style', 'position: absolute; top: 50%; left: 50%; margin: -50px 0 0 -50px; color: #fff; z-index: 999999; font-size: 100px;');

    lab_spinner.container.appendChild(lab_spinner.icon);    // add the icon to the containers
    document.body.appendChild(lab_spinner.container);               // add the container to the body of the page
}

function stopLabSpinner() {
    document.body.removeChild(lab_spinner.container);               // remove the container from the body of the updateLegend

    // Clean up
    lab_spinner.container = null;
    lab_spinner.icon = null;
}
