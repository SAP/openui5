import EventTriggerHook from "sap/ui/events/jquery/EventTriggerHook";
import Log from "sap/base/Log";
import jQuery from "sap/ui/thirdparty/jquery";
var BlockLayerUtils = {}, aPreventedEvents = ["focusin", "focusout", "keydown", "keypress", "keyup", "mousedown", "touchstart", "touchmove", "mouseup", "touchend", "click"], rForbiddenTags = /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr|tr)$/i;
BlockLayerUtils.block = function (oControl, sBlockedLayerId, sBlockedSection) {
    var oParentDomRef, sTag, oBlockState, oBlockLayerDOM;
    if (oControl) {
        oParentDomRef = oControl.getDomRef(sBlockedSection);
        if (!oParentDomRef) {
            oParentDomRef = oControl.getDomRef();
        }
        if (!oParentDomRef) {
            Log.warning("BlockLayer could not be rendered. The outer Control instance is not valid anymore or was not rendered yet.");
            return;
        }
        sTag = oParentDomRef.tagName;
        if (rForbiddenTags.test(sTag)) {
            Log.warning("BusyIndicator cannot be placed in elements with tag '" + sTag + "'.");
            return;
        }
        oBlockLayerDOM = fnAddHTML(oParentDomRef, sBlockedLayerId);
        oBlockState = {
            $parent: jQuery(oParentDomRef),
            $blockLayer: jQuery(oBlockLayerDOM)
        };
        if (oBlockState.$parent.css("position") == "static") {
            if (oParentDomRef.style && oParentDomRef.style.position === "static") {
                oBlockState.originalPosition = "static";
            }
            oBlockState.$parent.css("position", "relative");
            oBlockState.positionChanged = true;
        }
        fnHandleInteraction.call(oBlockState, true);
    }
    else {
        Log.warning("BlockLayer couldn't be created. No Control instance given.");
    }
    return oBlockState;
};
BlockLayerUtils.unblock = function (oBlockState) {
    if (oBlockState) {
        if (oBlockState.originalPosition) {
            oBlockState.$parent.css("position", oBlockState.originalPosition);
        }
        else if (oBlockState.positionChanged) {
            oBlockState.$parent.css("position", "");
        }
        fnHandleInteraction.call(oBlockState, false);
        oBlockState.$blockLayer.remove();
    }
};
BlockLayerUtils.addAriaAttributes = function (oDOM) {
    var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core");
    oDOM.setAttribute("role", "progressbar");
    oDOM.setAttribute("aria-valuemin", "0");
    oDOM.setAttribute("aria-valuemax", "100");
    oDOM.setAttribute("aria-valuetext", oResourceBundle.getText("BUSY_VALUE_TEXT"));
    oDOM.setAttribute("alt", "");
    oDOM.setAttribute("tabindex", "0");
    oDOM.setAttribute("title", oResourceBundle.getText("BUSY_TEXT"));
};
BlockLayerUtils.toggleAnimationStyle = function (oBlockState, bShow) {
    var $BS = jQuery(oBlockState.$blockLayer.get(0));
    if (bShow) {
        $BS.removeClass("sapUiHiddenBusyIndicatorAnimation");
        $BS.removeClass("sapUiBlockLayerOnly");
    }
    else {
        $BS.addClass("sapUiBlockLayerOnly");
        $BS.addClass("sapUiHiddenBusyIndicatorAnimation");
    }
};
function fnAddHTML(oBlockSection, sBlockedLayerId) {
    var oContainer = document.createElement("div");
    oContainer.id = sBlockedLayerId;
    oContainer.className = "sapUiBlockLayer ";
    BlockLayerUtils.addAriaAttributes(oContainer);
    oBlockSection.appendChild(oContainer);
    return oContainer;
}
function fnHandleInteraction(bEnabled) {
    if (bEnabled) {
        var oParentDOM = this.$parent.get(0);
        if (oParentDOM) {
            this.fnRedirectFocus = redirectFocus.bind(this);
            this.oTabbableBefore = createTabbable(this.fnRedirectFocus);
            this.oTabbableAfter = createTabbable(this.fnRedirectFocus);
            oParentDOM.parentNode.insertBefore(this.oTabbableBefore, oParentDOM);
            oParentDOM.parentNode.insertBefore(this.oTabbableAfter, oParentDOM.nextSibling);
            this._fnSuppressDefaultAndStopPropagationHandler = suppressDefaultAndStopPropagation.bind(this);
            this._aSuppressHandler = registerInteractionHandler.call(this, this._fnSuppressDefaultAndStopPropagationHandler);
        }
        else {
            Log.warning("fnHandleInteraction called with bEnabled true, but no DOMRef exists!");
        }
    }
    else {
        if (this.oTabbableBefore) {
            removeTabbable(this.oTabbableBefore, this.fnRedirectFocus);
            delete this.oTabbableBefore;
        }
        if (this.oTabbableAfter) {
            removeTabbable(this.oTabbableAfter, this.fnRedirectFocus);
            delete this.oTabbableAfter;
        }
        delete this.fnRedirectFocus;
        deregisterInteractionHandler.call(this, this._fnSuppressDefaultAndStopPropagationHandler);
    }
    function suppressDefaultAndStopPropagation(oEvent) {
        var bTargetIsBlockLayer = oEvent.target === this.$blockLayer.get(0), oTabbable;
        if (bTargetIsBlockLayer && oEvent.type === "keydown" && oEvent.keyCode === 9) {
            Log.debug("Local Busy Indicator Event keydown handled: " + oEvent.type);
            oTabbable = oEvent.shiftKey ? this.oTabbableBefore : this.oTabbableAfter;
            oTabbable.setAttribute("tabindex", -1);
            this.bIgnoreFocus = true;
            oTabbable.focus();
            this.bIgnoreFocus = false;
            oTabbable.setAttribute("tabindex", 0);
            oEvent.stopImmediatePropagation();
        }
        else if (bTargetIsBlockLayer && (oEvent.type === "mousedown" || oEvent.type === "touchstart")) {
            Log.debug("Local Busy Indicator click handled on busy area: " + oEvent.target.id);
            oEvent.stopImmediatePropagation();
        }
        else {
            Log.debug("Local Busy Indicator Event Suppressed: " + oEvent.type);
            oEvent.preventDefault();
            oEvent.stopImmediatePropagation();
        }
    }
    function redirectFocus() {
        if (!this.bIgnoreFocus) {
            this.$blockLayer.get(0).focus();
        }
    }
    function createTabbable(fnRedirectFocus) {
        var oBlockSpan = document.createElement("span");
        oBlockSpan.setAttribute("tabindex", 0);
        oBlockSpan.classList.add("sapUiBlockLayerTabbable");
        oBlockSpan.addEventListener("focusin", fnRedirectFocus);
        return oBlockSpan;
    }
    function removeTabbable(oBlockSpan, fnRedirectFocus) {
        if (oBlockSpan.parentNode) {
            oBlockSpan.parentNode.removeChild(oBlockSpan);
        }
        oBlockSpan.removeEventListener("focusin", fnRedirectFocus);
    }
    function registerInteractionHandler(fnHandler) {
        var aSuppressHandler = [], oParentDOM = this.$parent.get(0), oBlockLayerDOM = this.$blockLayer.get(0);
        for (var i = 0; i < aPreventedEvents.length; i++) {
            oParentDOM.addEventListener(aPreventedEvents[i], fnHandler, {
                capture: true,
                passive: false
            });
            aSuppressHandler.push(EventTriggerHook.suppress(aPreventedEvents[i], oParentDOM, oBlockLayerDOM));
        }
        this.$blockLayer.on("keydown", fnHandler);
        return aSuppressHandler;
    }
    function deregisterInteractionHandler(fnHandler) {
        var i, oParentDOM = this.$parent.get(0), oBlockLayerDOM = this.$blockLayer.get(0);
        if (oParentDOM) {
            for (i = 0; i < aPreventedEvents.length; i++) {
                oParentDOM.removeEventListener(aPreventedEvents[i], fnHandler, {
                    capture: true,
                    passive: false
                });
            }
        }
        if (this._aSuppressHandler) {
            for (i = 0; i < this._aSuppressHandler.length; i++) {
                EventTriggerHook.release(this._aSuppressHandler[i]);
            }
        }
        if (oBlockLayerDOM) {
            this.$blockLayer.off("keydown", fnHandler);
        }
    }
}