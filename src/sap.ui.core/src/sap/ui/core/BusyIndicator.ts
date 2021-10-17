import jQuery from "sap/ui/thirdparty/jquery";
import EventProvider from "../base/EventProvider";
import Popup from "./Popup";
import BusyIndicatorUtils from "./BusyIndicatorUtils";
import library from "sap/ui/core/library";
import FESR from "sap/ui/performance/trace/FESR";
import Interaction from "sap/ui/performance/trace/Interaction";
import Log from "sap/base/Log";
import assert from "sap/base/assert";
import now from "sap/base/util/now";
var BusyIndicatorSize = library.BusyIndicatorSize;
var BusyIndicator = Object.assign(new EventProvider(), {
    oPopup: null,
    oDomRef: null,
    bOpenRequested: false,
    iDEFAULT_DELAY_MS: 1000,
    sDOM_ID: "sapUiBusyIndicator"
});
BusyIndicator.M_EVENTS = {
    Open: "Open",
    Close: "Close"
};
BusyIndicator._bShowIsDelayed = undefined;
BusyIndicator._init = function () {
    var oRootDomRef = document.createElement("div");
    oRootDomRef.id = this.sDOM_ID;
    var oBusyContainer = document.createElement("div");
    this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core");
    var sTitle = this._oResBundle.getText("BUSY_TEXT");
    delete this._oResBundle;
    oBusyContainer.className = "sapUiBusy";
    oBusyContainer.setAttribute("tabindex", "0");
    oBusyContainer.setAttribute("role", "progressbar");
    oBusyContainer.setAttribute("alt", "");
    oBusyContainer.setAttribute("title", sTitle);
    oRootDomRef.appendChild(oBusyContainer);
    var oBusyElement = BusyIndicatorUtils.getElement(BusyIndicatorSize.Large);
    oBusyElement.setAttribute("title", sTitle);
    oRootDomRef.appendChild(oBusyElement);
    this.oDomRef = oRootDomRef;
    this.oPopup = new Popup(oRootDomRef);
    this.oPopup.setModal(true, "sapUiBlyBusy");
    this.oPopup.setShadow(false);
    this.oPopup.attachOpened(function (oEvent) {
        this._onOpen(oEvent);
    }, this);
};
BusyIndicator._onOpen = function (oEvent) {
    var oDomRef = document.getElementById(BusyIndicator.sDOM_ID);
    oDomRef.style.height = "100%";
    oDomRef.style.width = "100%";
    var oAnimation = oDomRef.querySelector(".sapUiLocalBusyIndicator");
    oAnimation.className += " sapUiLocalBusyIndicatorFade";
    if (oDomRef) {
        oDomRef.focus();
    }
    this.fireOpen({
        $Busy: this.oPopup._$()
    });
};
BusyIndicator.show = function (iDelay) {
    Log.debug("sap.ui.core.BusyIndicator.show (delay: " + iDelay + ") at " + new Date().getTime());
    assert(iDelay === undefined || (typeof iDelay == "number" && (iDelay % 1 == 0)), "iDelay must be empty or an integer");
    if (!document.body || !sap.ui.getCore().isInitialized()) {
        if (BusyIndicator._bShowIsDelayed === undefined) {
            sap.ui.getCore().attachInit(function () {
                if (BusyIndicator._bShowIsDelayed) {
                    BusyIndicator.show(iDelay);
                }
            });
        }
        BusyIndicator._bShowIsDelayed = true;
        return;
    }
    if ((iDelay === undefined) || ((iDelay != 0) && (parseInt(iDelay) == 0)) || (parseInt(iDelay) < 0)) {
        iDelay = this.iDEFAULT_DELAY_MS;
    }
    if (FESR.getActive()) {
        this._fDelayedStartTime = now() + iDelay;
    }
    if (!this.oDomRef) {
        this._init();
    }
    this.bOpenRequested = true;
    if (iDelay === 0) {
        this._showNowIfRequested();
    }
    else {
        setTimeout(this["_showNowIfRequested"].bind(this), iDelay);
    }
};
BusyIndicator._showNowIfRequested = function () {
    Log.debug("sap.ui.core.BusyIndicator._showNowIfRequested (bOpenRequested: " + this.bOpenRequested + ") at " + new Date().getTime());
    if (!this.bOpenRequested) {
        return;
    }
    var iOffsetX = (window.scrollX === undefined ? window.pageXOffset : window.scrollX);
    var iOffsetY = (window.scrollY === undefined ? window.pageYOffset : window.scrollY);
    var sOffset = iOffsetX + " " + iOffsetY;
    this.bOpenRequested = false;
    this.oPopup.open(0, Popup.Dock.LeftTop, Popup.Dock.LeftTop, document, sOffset);
};
BusyIndicator.hide = function () {
    Log.debug("sap.ui.core.BusyIndicator.hide at " + new Date().getTime());
    if (this._fDelayedStartTime) {
        var fBusyIndicatorShownDuration = now() - this._fDelayedStartTime;
        Interaction.addBusyDuration((fBusyIndicatorShownDuration > 0) ? fBusyIndicatorShownDuration : 0);
        delete this._fDelayedStartTime;
    }
    var bi = BusyIndicator;
    if (BusyIndicator._bShowIsDelayed === true) {
        BusyIndicator._bShowIsDelayed = false;
    }
    bi.bOpenRequested = false;
    if (bi.oDomRef) {
        var oAnimation = bi.oDomRef.querySelector(".sapUiLocalBusyIndicator");
        jQuery(oAnimation).removeClass("sapUiLocalBusyIndicatorFade");
        this.fireClose({
            $Busy: this.oPopup._$()
        });
        bi.oPopup.close(0);
    }
};
BusyIndicator.attachOpen = function (fnFunction, oListener) {
    this.attachEvent(BusyIndicator.M_EVENTS.Open, fnFunction, oListener);
    return this;
};
BusyIndicator.detachOpen = function (fnFunction, oListener) {
    this.detachEvent(BusyIndicator.M_EVENTS.Open, fnFunction, oListener);
    return this;
};
BusyIndicator.attachClose = function (fnFunction, oListener) {
    this.attachEvent(BusyIndicator.M_EVENTS.Close, fnFunction, oListener);
    return this;
};
BusyIndicator.detachClose = function (fnFunction, oListener) {
    this.detachEvent(BusyIndicator.M_EVENTS.Close, fnFunction, oListener);
    return this;
};
BusyIndicator.fireOpen = function (mParameters) {
    this.fireEvent(BusyIndicator.M_EVENTS.Open, mParameters);
};
BusyIndicator.fireClose = function (mParameters) {
    this.fireEvent(BusyIndicator.M_EVENTS.Close, mParameters);
};