/*
    Created:        2023-01-11 by James Austin - Trafford Data Lab
    Purpose:        To remove notifications automatically from a page based on the date in the "data-added" attribute and potentially by type.
    Dependencies:   None
    Licence:        https://www.trafforddatalab.io/assets/LICENSE.txt

    Inputs:
        - daysElapsed:      (Integer) No. of days that can elapse before removing the notifications. If null the default is 14 days.
        - notificationType: (String) The type of notifications we want to remove (the text content within the notification element e.g. "new"). If null it will remove all.

    Example call:   RemoveElapsedNotifications({ daysElapsed: 12, notificationType: 'new' });
*/
function RemoveElapsedLabNotifications(objOptions) {
    try {
        // static/constant values
        var notificationBadges = document.getElementsByClassName('badge');  // Get all notification badge elements
        var dateNow = new Date();   // Get today's date to compare against the dates stored in the "data-added" attribute of the badge elements
        var dateAdded;  // Empty variable to hold the date stored in the "data-added" atttribute of each notification badge element
        var msPerDay = 24 * 60 * 60 * 1000; // number of milliseconds per day

        // user supplied parameters
        var daysElapsed = (objOptions['daysElapsed'] == null) ? 14 : objOptions['daysElapsed'];     // No. of days that can elapse before removing the notifications. Default = 14 days
        var notificationType = (objOptions['notificationType'] == null) ? null : objOptions['notificationType'];    // The type of notifications we want to remove (the text content within the notification element e.g. "new"). If null it will remove all.

        for (i = 0; i < notificationBadges.length; i++) {
            if (notificationBadges[i].hasAttribute("data-added") && (notificationType == null || notificationType == notificationBadges[i].textContent)) {
                dateAdded = new Date(notificationBadges[i].dataset.added);
                if ((dateNow - dateAdded) / msPerDay > daysElapsed) { // Not interested in absolute perfection for this calculation - just an approximation is good enough to hide those badges that were added over 14 days ago
                    notificationBadges[i].setAttribute("hidden", "hidden");     // hide the notification badge using HTML5 attribute
                    notificationBadges[i].setAttribute("aria-hidden", "true");  // belt-and-braces to ensure it's hidden from screen readers
                }
            }
        }
    }
    catch(e) {
        // An error occurred, but since this is only a helper function and not providing a critical service we can safely ignore it.
    }
}
