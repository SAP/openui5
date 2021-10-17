var fnIsSpecialKey = function (oEvent) {
    function isModifierKey(oEvent) {
        var sKey = oEvent.key;
        return (sKey === "Shift") || (sKey === "Control") || (sKey === "Alt") || (sKey === "AltGraph") || (sKey === "CapsLock") || (sKey === "NumLock");
    }
    function isArrowKey(oEvent) {
        var sKey = oEvent.key;
        return (sKey === "ArrowLeft") || (sKey === "ArrowUp") || (sKey === "ArrowRight") || (sKey === "ArrowDown");
    }
    var sKey = oEvent.key, bSpecialKey = isModifierKey(oEvent) || isArrowKey(oEvent) || sKey === "PageUp" || sKey === "PageDown" || sKey === "End" || sKey === "Home" || sKey === "PrintScreen" || sKey === "Insert" || sKey === "Delete" || sKey === "F1" || sKey === "F2" || sKey === "F3" || sKey === "F4" || sKey === "F5" || sKey === "F6" || sKey === "F7" || sKey === "F8" || sKey === "F9" || sKey === "F10" || sKey === "F11" || sKey === "F12" || sKey === "Pause" || sKey === "Backspace" || sKey === "Tab" || sKey === "Enter" || sKey === "Escape" || sKey === "ScrollLock";
    switch (oEvent.type) {
        case "keydown":
        case "keyup":
        case "keypress": return bSpecialKey;
        default: return false;
    }
};