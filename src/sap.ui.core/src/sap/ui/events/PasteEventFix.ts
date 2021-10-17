document.documentElement.addEventListener("paste", function (oEvent) {
    var oActiveElement = document.activeElement;
    if (oEvent.isTrusted && oActiveElement instanceof HTMLElement && !oActiveElement.contains(oEvent.target)) {
        var oNewEvent = new ClipboardEvent("paste", {
            bubbles: true,
            cancelable: true,
            clipboardData: oEvent.clipboardData
        });
        oActiveElement.dispatchEvent(oNewEvent);
        oEvent.stopImmediatePropagation();
        oEvent.preventDefault();
    }
}, true);