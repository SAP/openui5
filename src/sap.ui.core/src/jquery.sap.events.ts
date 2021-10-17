import jQuery from "jquery.sap.global";
import ControlEvents from "sap/ui/events/ControlEvents";
import PseudoEvents from "sap/ui/events/PseudoEvents";
import fnCheckMouseEnterOrLeave from "sap/ui/events/checkMouseEnterOrLeave";
import fnIsSpecialKey from "sap/ui/events/isSpecialKey";
import fnIsMouseEventDelayed from "sap/ui/events/isMouseEventDelayed";
import F6Navigation from "sap/ui/events/F6Navigation";
import EventSimulation from "sap/ui/events/jquery/EventSimulation";
import KeyCodes from "sap/ui/events/KeyCodes";
import defineCoupledProperty from "sap/base/util/defineCoupledProperty";
jQuery.sap.PseudoEvents = PseudoEvents.events;
jQuery.sap.ControlEvents = ControlEvents.events;
jQuery.sap.disableTouchToMouseHandling = EventSimulation.disableTouchToMouseHandling;
defineCoupledProperty(jQuery.sap, "touchEventMode", EventSimulation, "touchEventMode");
jQuery.sap.bindAnyEvent = ControlEvents.bindAnyEvent;
jQuery.sap.unbindAnyEvent = ControlEvents.unbindAnyEvent;
jQuery.sap.checkMouseEnterOrLeave = fnCheckMouseEnterOrLeave;
jQuery.sap.isSpecialKey = function (oEvent) {
    if (oEvent.key) {
        return fnIsSpecialKey(oEvent);
    }
    function isModifierKey(oEvent) {
        var iKeyCode = oEvent.which;
        return (iKeyCode === KeyCodes.SHIFT) || (iKeyCode === KeyCodes.CONTROL) || (iKeyCode === KeyCodes.ALT) || (iKeyCode === KeyCodes.CAPS_LOCK) || (iKeyCode === KeyCodes.NUM_LOCK);
    }
    function isArrowKey(oEvent) {
        var iKeyCode = oEvent.which, bArrowKey = (iKeyCode >= 37 && iKeyCode <= 40);
        switch (oEvent.type) {
            case "keydown":
            case "keyup": return bArrowKey;
            case "keypress": return iKeyCode === 0;
            default: return false;
        }
    }
    var iKeyCode = oEvent.which, bSpecialKey = isModifierKey(oEvent) || isArrowKey(oEvent) || (iKeyCode >= 33 && iKeyCode <= 36) || (iKeyCode >= 44 && iKeyCode <= 46) || (iKeyCode >= 112 && iKeyCode <= 123) || (iKeyCode === KeyCodes.BREAK) || (iKeyCode === KeyCodes.BACKSPACE) || (iKeyCode === KeyCodes.TAB) || (iKeyCode === KeyCodes.ENTER) || (iKeyCode === KeyCodes.ESCAPE) || (iKeyCode === KeyCodes.SCROLL_LOCK);
    switch (oEvent.type) {
        case "keydown":
        case "keyup": return bSpecialKey;
        case "keypress": return (iKeyCode === 0 || iKeyCode === KeyCodes.BACKSPACE || iKeyCode === KeyCodes.ESCAPE || iKeyCode === KeyCodes.ENTER) || false;
        default: return false;
    }
};
jQuery.sap.handleF6GroupNavigation = function (oEvent, oSettings) {
    if (!oEvent.key && oEvent.keyCode === KeyCodes.F6) {
        oEvent.key = "F6";
    }
    return F6Navigation.handleF6GroupNavigation(oEvent, oSettings);
};
jQuery.sap._FASTNAVIGATIONKEY = F6Navigation.fastNavigationKey;
jQuery.sap._refreshMouseEventDelayedFlag = function (oNavigator) {
    jQuery.sap.isMouseEventDelayed = fnIsMouseEventDelayed.apply(this, arguments);
};
jQuery.sap._refreshMouseEventDelayedFlag(navigator);