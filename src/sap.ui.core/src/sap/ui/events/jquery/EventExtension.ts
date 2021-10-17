import jQuery from "sap/ui/thirdparty/jquery";
import PseudoEvents from "sap/ui/events/PseudoEvents";
var EventExtension = Object.create(null);
var _bIsApplied = false;
EventExtension.apply = function () {
    if (_bIsApplied) {
        return;
    }
    _bIsApplied = true;
    jQuery.Event.prototype.getPseudoTypes = function () {
        var aPseudoTypes = [];
        if (PseudoEvents.getBasicTypes().indexOf(this.type) != -1) {
            var ilength = PseudoEvents.order.length;
            var oPseudo = null;
            for (var i = 0; i < ilength; i++) {
                oPseudo = PseudoEvents.events[PseudoEvents.order[i]];
                if (oPseudo.aTypes && oPseudo.aTypes.indexOf(this.type) > -1 && oPseudo.fnCheck && oPseudo.fnCheck(this)) {
                    aPseudoTypes.push(oPseudo.sName);
                }
            }
        }
        this.getPseudoTypes = function () {
            return aPseudoTypes.slice();
        };
        return aPseudoTypes.slice();
    };
    jQuery.Event.prototype.isPseudoType = function (sType) {
        var aPseudoTypes = this.getPseudoTypes();
        if (sType) {
            return aPseudoTypes.indexOf(sType) > -1;
        }
        else {
            return aPseudoTypes.length > 0;
        }
    };
    jQuery.Event.prototype.getOffsetX = function () {
        if (this.type == "click" && this.offsetX) {
            return this.offsetX;
        }
        return 0;
    };
    jQuery.Event.prototype.getOffsetY = function () {
        if (this.type == "click" && this.offsetY) {
            return this.offsetY;
        }
        return 0;
    };
    var createStopImmediatePropagationFunction = function (fnStopImmediatePropagation) {
        return function (bStopHandlers) {
            fnStopImmediatePropagation.apply(this, arguments);
            if (bStopHandlers) {
                this._bIsStopHandlers = true;
            }
        };
    };
    var fnStopImmediatePropagation = jQuery.Event.prototype.stopImmediatePropagation;
    jQuery.Event.prototype.stopImmediatePropagation = createStopImmediatePropagationFunction(fnStopImmediatePropagation);
    jQuery.Event.prototype.isImmediateHandlerPropagationStopped = function () {
        return !!this._bIsStopHandlers;
    };
    var fnGetNativeEvent = function (oEvent) {
        while (oEvent && oEvent.originalEvent && oEvent !== oEvent.originalEvent) {
            oEvent = oEvent.originalEvent;
        }
        return oEvent;
    };
    jQuery.Event.prototype.setMark = function (sKey, vValue) {
        sKey = sKey || "handledByControl";
        vValue = arguments.length < 2 ? true : vValue;
        var oNativeEvent = fnGetNativeEvent(this);
        oNativeEvent["_sapui_" + sKey] = vValue;
    };
    jQuery.Event.prototype.isMarked = function (sKey) {
        return !!this.getMark(sKey);
    };
    jQuery.Event.prototype.getMark = function (sKey) {
        sKey = sKey || "handledByControl";
        var oNativeEvent = fnGetNativeEvent(this);
        return oNativeEvent["_sapui_" + sKey];
    };
    jQuery.Event.prototype.setMarked = jQuery.Event.prototype.setMark;
};