function isCrossOriginURL(sHref) {
    var oURL = new URL(sHref, document.baseURI);
    return (oURL.origin === "null" || window.location.origin === "null" || oURL.origin !== window.location.origin);
}