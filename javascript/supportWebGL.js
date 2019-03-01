/*
    Created:        2019/03/01 by James Austin - Trafford Data Lab
    Purpose:        Check if the browser is capable of WebGL
    Dependencies:   None
    Licence:        https://www.trafforddatalab.io/assets/LICENSE.txt
    Notes:          Created from an answer on: https://stackoverflow.com/questions/11871077/proper-way-to-detect-webgl-support
*/
function supportWebGL () {
    try {
        var canvas = document.createElement('canvas');
        return !!window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    }
    catch(e) {
        return false;
    }
}
