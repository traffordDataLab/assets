/*
    Created:        2018/04/05 by James Austin - Trafford Data Lab
    Purpose:        To obtain data passed via a query string in the URL
    Dependencies:   None
    Licence:        http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
*/
function labGetQryStrValByKey(key) {
    var qsVal = decodeURI((RegExp(key + '=' + '(.+?)(&|$)').exec(location.search) || [, ])[1]);
    return (qsVal === "undefined") ? null : qsVal;
}
