try {
    // Without the activeElementFix, this would throw an "Unspecified error" exception in IE11
    var activeElement = document.activeElement;
    window.sapUiDomActiveElementAccessSucceeded = true;
    // parent.postMessage("ok", "*");
} catch (err) {
    window.sapUiDomActiveElementAccessSucceeded = false;
    window.sapUiDomActiveElementAccessError = err.message;
    // parent.postMessage(err.message, "*");
}