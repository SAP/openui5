import EventProvider from "sap/ui/base/EventProvider";
import Element from "./Element";
import ShortcutHint from "./ShortcutHint";
import Popup from "./Popup";
import InvisibleText from "./InvisibleText";
import containsOrEquals from "sap/ui/dom/containsOrEquals";
import checkMouseEnterOrLeave from "sap/ui/events/checkMouseEnterOrLeave";
import Device from "sap/ui/Device";
var ShortcutHintsMixin = function (oControl) {
    this.sControlId = oControl.getId();
    this._hintConfigs = [];
};
ShortcutHintsMixin.init = function (oControl) {
    oControl._shortcutHintsMixin = new ShortcutHintsMixin(oControl);
};
ShortcutHintsMixin.addConfig = function (oControl, oConfig, oHintProviderControl) {
    if (Device.system.phone) {
        return;
    }
    if (/sap-ui-xx-noshortcuthints=true/.test(document.location.search)) {
        return;
    }
    var oMixin = oControl._shortcutHintsMixin;
    if (!oMixin) {
        ShortcutHintsMixin.init(oControl);
        oMixin = oControl._shortcutHintsMixin;
    }
    oMixin._hintConfigs.push(oConfig);
    oMixin.initHint(oConfig, oHintProviderControl);
};
ShortcutHintsMixin.hideAll = function () {
    var oControl;
    for (var sControlId in oHintRegistry.mControls) {
        oControl = Element.registry.get(sControlId);
        if (oControl) {
            oControl._shortcutHintsMixin.hideShortcutHint();
        }
    }
};
ShortcutHintsMixin.isDOMIDRegistered = function (sDOMRefID) {
    return oHintRegistry.mDOMNodes[sDOMRefID] && !!oHintRegistry.mDOMNodes[sDOMRefID].length;
};
ShortcutHintsMixin.isControlRegistered = function (sControlId) {
    return !!oHintRegistry.mControls[sControlId];
};
ShortcutHintsMixin.prototype._attachToEvents = function () {
    var oControl;
    if (!ShortcutHintsMixin.isControlRegistered(this.sControlId)) {
        oControl = Element.registry.get(this.sControlId);
        oControl.addEventDelegate(oHintsEventDelegate, this);
    }
};
ShortcutHintsMixin.prototype.register = function (sDOMRefID, oConfig, oHintProviderControl) {
    this._attachToEvents();
    if (!ShortcutHintsMixin.isControlRegistered(this.sControlId)) {
        var oControl = Element.registry.get(this.sControlId);
        oControl._originalExit = oControl.exit;
        oControl.exit = function () {
            if (oControl._originalExit) {
                oControl._originalExit.apply(oControl, arguments);
            }
            this.deregister();
        }.bind(this);
    }
    oHintRegistry.mControls[this.sControlId] = true;
    if (!oHintRegistry.mDOMNodes[sDOMRefID]) {
        oHintRegistry.mDOMNodes[sDOMRefID] = [];
    }
    oHintRegistry.mDOMNodes[sDOMRefID].push(new ShortcutHint(oHintProviderControl, oConfig));
};
ShortcutHintsMixin.prototype.deregister = function () {
    var aInfos = this.getRegisteredShortcutInfos(), i;
    delete oHintRegistry.mControls[this.sControlId];
    for (i = 0; i < aInfos.length; i++) {
        delete oHintRegistry.mDOMNodes[aInfos[i].id];
    }
};
ShortcutHintsMixin.prototype.initHint = function (oConfig, oHintProviderControl) {
    var oHintInfo = this._getShortcutHintInfo(oConfig);
    if (oHintInfo.message) {
        this.register(oHintInfo.id, { message: oHintInfo.message }, oHintProviderControl);
    }
    else if (oHintInfo.messageBundleKey) {
        this.register(oHintInfo.id, { messageBundleKey: oHintInfo.messageBundleKey }, oHintProviderControl);
    }
    else if (oHintInfo.event) {
        var oEventListeners = EventProvider.getEventList(oHintProviderControl)[oHintInfo.event], aAttachedCommands = [];
        if (oEventListeners) {
            aAttachedCommands = oEventListeners.reduce(function (aResults, oListener) {
                if (oListener.fFunction && oListener.fFunction._sapui_commandName) {
                    aResults.push(oListener.fFunction._sapui_commandName);
                }
                return aResults;
            }, []);
        }
        if (aAttachedCommands.length) {
            this.register(oHintInfo.id, {
                commandName: aAttachedCommands[0]
            }, oHintProviderControl);
        }
        else {
            oHintProviderControl.attachEvent("EventHandlerChange", function (oEvent) {
                var oFn = oEvent.getParameter("func");
                if (oEvent.getParameter("type") === "listenerAttached" && oFn && oFn._sapui_commandName && oEvent.getParameter("EventId") === oHintInfo.event) {
                    this.register(oHintInfo.id, {
                        commandName: oFn._sapui_commandName
                    }, oHintProviderControl);
                }
            }, this);
        }
    }
};
ShortcutHintsMixin.prototype._getShortcutHintInfos = function () {
    return this._hintConfigs.map(this._getShortcutHintInfo, this);
};
ShortcutHintsMixin.prototype._getShortcutHintInfo = function (option) {
    var id;
    if (option.domrefid) {
        id = option.domrefid;
    }
    else if (option.domrefid_suffix) {
        id = this.sControlId + option.domrefid_suffix;
    }
    else {
        id = this.sControlId;
    }
    return {
        id: id,
        event: option.event,
        position: option.position,
        messageBundleKey: option.messageBundleKey,
        message: option.message,
        addAccessibilityLabel: option.addAccessibilityLabel
    };
};
ShortcutHintsMixin.prototype.getRegisteredShortcutInfos = function () {
    return this._getShortcutHintInfos().filter(function (info) {
        return ShortcutHintsMixin.isDOMIDRegistered(info.id);
    }, this);
};
ShortcutHintsMixin.prototype.showShortcutHint = function (oHintInfos) {
    var sTimeoutID, sPosition = oHintInfos[0].position || "0 8", sMy = Popup.Dock.CenterTop, sOf = Popup.Dock.CenterBottom, oPopup = _getHintPopup(), $ShortcutHintRef = oHintInfos[0].ref, sShortcut = _getShortcutHintText(oHintInfos[0].id), mTooltips;
    if (!_isElementVisible($ShortcutHintRef) || !_isElementInViewport($ShortcutHintRef)) {
        return;
    }
    mTooltips = this._getControlTooltips();
    if (mTooltips[oHintInfos[0].id]) {
        sShortcut = mTooltips[oHintInfos[0].id].tooltip + " (" + sShortcut + ")";
    }
    if (!oPopup) {
        oPopup = _createShortcutHintPopup(sShortcut);
    }
    oPopup.oContent.children[0].textContent = sShortcut;
    if (!oPopup.isOpen()) {
        oPopup.open(1000, sMy, sOf, $ShortcutHintRef, sPosition, "flipfit", function (params) {
            oPopup.oContent.style.visibility = "hidden";
            if (sTimeoutID) {
                clearTimeout(sTimeoutID);
            }
            sTimeoutID = setTimeout(function () {
                if (!_isElementVisible($ShortcutHintRef) || !_isElementInViewport($ShortcutHintRef)) {
                    return;
                }
                oPopup.oContent.style.visibility = "visible";
            }, 1000);
            oPopup._applyPosition(oPopup._oLastPosition);
        });
    }
};
ShortcutHintsMixin.prototype.hideShortcutHint = function () {
    var oPopup = _getHintPopup();
    if (oPopup && oPopup.isOpen()) {
        oPopup.close();
    }
};
ShortcutHintsMixin.prototype._findShortcutOptionsForRef = function (domEventTarget) {
    var oHintInfo, aInfos = this.getRegisteredShortcutInfos(), i, aResultInfos = [];
    for (i = 0; i < aInfos.length; i++) {
        oHintInfo = aInfos[i];
        oHintInfo.ref = document.getElementById(oHintInfo.id);
        if (containsOrEquals(oHintInfo.ref, domEventTarget)) {
            aResultInfos.push(oHintInfo);
        }
    }
    return aResultInfos;
};
ShortcutHintsMixin.prototype._getControlTooltips = function () {
    var aInfos = this.getRegisteredShortcutInfos(), oControl = Element.registry.get(this.sControlId);
    return aInfos.reduce(function (mResult, oHintInfo) {
        var sTooltip = oControl._getTitleAttribute && oControl._getTitleAttribute(oHintInfo.id);
        if (!sTooltip) {
            sTooltip = oControl.getTooltip();
        }
        if (sTooltip) {
            mResult[oHintInfo.id] = {
                tooltip: sTooltip
            };
        }
        return mResult;
    }, {});
};
ShortcutHintsMixin.prototype._updateShortcutHintAccLabel = function (oHintInfo) {
    var oInvText, sInvTextId, oControl;
    if (!oHintInfo.addAccessibilityLabel) {
        return;
    }
    oControl = Element.registry.get(this.sControlId);
    if (!oControl.getAriaDescribedBy) {
        return;
    }
    oInvText = getInvisibleText(oControl);
    sInvTextId = oInvText.getId();
    oInvText.setText(_getShortcutHintText(oHintInfo.id));
    if (!oInvText.getText()) {
        oControl.removeAriaDescribedBy(sInvTextId);
    }
    else if (oControl.getAriaDescribedBy().indexOf(sInvTextId) === -1) {
        oControl.addAriaDescribedBy(sInvTextId);
    }
};
var oHintRegistry = Object.create(null);
oHintRegistry.mControls = {};
oHintRegistry.mDOMNodes = {};
var oHintsEventDelegate = {
    "onfocusin": function (oEvent) {
        var oShortcutHintRefs = this._findShortcutOptionsForRef(oEvent.target);
        if (!oShortcutHintRefs.length) {
            return;
        }
        ShortcutHintsMixin.hideAll();
        this._updateShortcutHintAccLabel(oShortcutHintRefs[0]);
        this.showShortcutHint(oShortcutHintRefs);
    },
    "onfocusout": function (oEvent) {
        var oShortcutHintRefs = this._findShortcutOptionsForRef(oEvent.target);
        if (!oShortcutHintRefs.length) {
            return;
        }
        this.hideShortcutHint();
    },
    "onmouseover": function (oEvent) {
        var oShortcutHintRefs = this._findShortcutOptionsForRef(oEvent.target), oDOMRef;
        if (!oShortcutHintRefs.length) {
            return;
        }
        oDOMRef = oShortcutHintRefs[0].ref;
        if (!_isElementFocusable(oDOMRef)) {
            return;
        }
        if (checkMouseEnterOrLeave(oEvent, oDOMRef)) {
            ShortcutHintsMixin.hideAll();
            this.showShortcutHint(oShortcutHintRefs);
        }
    },
    "onmouseout": function (oEvent) {
        var oShortcutHintRefs = this._findShortcutOptionsForRef(oEvent.target);
        if (!oShortcutHintRefs.length) {
            return;
        }
        if (checkMouseEnterOrLeave(oEvent, oShortcutHintRefs[0].ref)) {
            if (containsOrEquals(oShortcutHintRefs[0].ref, document.activeElement)) {
                return;
            }
            this.hideShortcutHint();
        }
    },
    "onAfterRendering": function () {
        var aInfos = this.getRegisteredShortcutInfos(), oElement, sDOMRefID;
        for (var i = 0; i < aInfos.length; i++) {
            sDOMRefID = aInfos[i].id;
            oElement = document.getElementById(sDOMRefID);
            oElement.setAttribute("aria-keyshortcuts", _getShortcutHintText(sDOMRefID));
        }
    }
};
function _getShortcutHintText(sDOMRefID) {
    var aHints = oHintRegistry.mDOMNodes[sDOMRefID];
    if (!aHints || !aHints.length) {
        return;
    }
    return aHints.map(function (oHint) {
        return oHint._getShortcutText();
    }).join(", ");
}
function getInvisibleText(oControl) {
    if (!oControl._shortcutInvisibleText) {
        var oFunc = oControl.exit;
        oControl._shortcutInvisibleText = new InvisibleText();
        oControl._shortcutInvisibleText.toStatic();
        oControl.exit = function () {
            this._shortcutInvisibleText.destroy();
            oFunc.call(this);
        };
    }
    return oControl._shortcutInvisibleText;
}
function _getHintPopup() {
    return ShortcutHintsMixin._popup;
}
function _createShortcutHintPopup(sTextContent) {
    var oPopup, oContainerElement, oTextContentElement;
    oContainerElement = document.createElement("span");
    oContainerElement.classList.add("sapUiHintContainer");
    oTextContentElement = document.createElement("div");
    oTextContentElement.classList.add("sapUiHintText");
    oTextContentElement.textContent = sTextContent;
    oContainerElement.appendChild(oTextContentElement);
    oPopup = new Popup(oContainerElement, false, false, false);
    oPopup.setAnimations(function ($ref, iDuration, callback) {
        setTimeout(callback, iDuration);
    }, function ($ref, iDuration, callback) {
        callback();
    });
    ShortcutHintsMixin._popup = oPopup;
    return oPopup;
}
function _isElementInViewport(oDomElement) {
    var mRect;
    if (!oDomElement) {
        return false;
    }
    mRect = oDomElement.getBoundingClientRect();
    return (mRect.top >= 0 && mRect.left >= 0 && mRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && mRect.right <= (window.innerWidth || document.documentElement.clientWidth));
}
function _isElementVisible(elem) {
    return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
}
function _elementHasTabIndex(elem) {
    var iTabIndex = elem.tabIndex;
    return iTabIndex != null && iTabIndex >= 0 && (elem.getAttribute("disabled") == null || elem.getAttribute("tabindex"));
}
function _isElementFocusable(elem) {
    return elem.nodeType == 1 && _isElementVisible(elem) && _elementHasTabIndex(elem);
}