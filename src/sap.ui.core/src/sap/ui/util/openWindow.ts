var fnOpenWindow = function openWindow(sUrl, sWindowName) {
    var sWindowFeatures = "noopener,noreferrer";
    return window.open(sUrl, sWindowName, sWindowFeatures);
};