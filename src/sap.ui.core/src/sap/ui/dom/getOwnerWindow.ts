var fnGetOwnerWindow = function ownerWindow(oDomRef) {
    if (oDomRef.ownerDocument.parentWindow) {
        return oDomRef.ownerDocument.parentWindow;
    }
    return oDomRef.ownerDocument.defaultView;
};