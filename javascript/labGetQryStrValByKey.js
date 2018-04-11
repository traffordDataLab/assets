/*
    Created:        2018/04/05 by James Austin - Trafford Data Lab
    Purpose:        To obtain data passed via a query string in the URL or an optional string
    Dependencies:   None
    Licence:        http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
*/
function labGetQryStrValByKey(key, str) {
    var def_str = (str === null) ? location.search : str;   // unless we have been given a specific string, search the URL query string for the key

    var qsVal = decodeURIComponent((RegExp(key + '=' + '(.+?)(&|$)').exec(def_str) || [, ])[1]);
    return (qsVal === "undefined") ? null : qsVal;
}
