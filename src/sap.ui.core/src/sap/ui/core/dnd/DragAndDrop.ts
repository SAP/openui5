import Device from "sap/ui/Device";
import UIArea from "../UIArea";
import jQuery from "sap/ui/thirdparty/jquery";
var DnD = {}, oDragControl = null, oDropControl = null, oValidDropControl = null, aValidDragInfos = [], aValidDropInfos = [], oDragSession = null, $DropIndicator, $GhostContainer, sCalculatedDropPosition, iTargetEnteringTime, mLastIndicatorStyle = {}, oDraggableAncestorNode;
function addStyleClass(oElement, sStyleClass) {
    if (!oElement) {
        return;
    }
    if (oElement.addStyleClass) {
        oElement.addStyleClass(sStyleClass);
    }
    else {
        oElement.$().addClass(sStyleClass);
    }
}
function removeStyleClass(oElement, sStyleClass) {
    if (!oElement) {
        return;
    }
    if (oElement.removeStyleClass) {
        oElement.removeStyleClass(sStyleClass);
    }
    else {
        oElement.$().removeClass(sStyleClass);
    }
}
function dispatchEvent(oEvent, sEventName) {
    var oControl = jQuery(oEvent.target).control(0, true);
    if (!oControl) {
        return;
    }
    var oNewEvent = jQuery.Event(null, oEvent);
    oNewEvent.type = sEventName;
    oControl.getUIArea()._handleEvent(oNewEvent);
}
function isSelectableElement(oElement) {
    return !oElement.disabled && /^(input|textarea)$/.test(oElement.localName);
}
function setDragGhost(oDragControl, oEvent) {
    if (!oDragControl || !oDragControl.getDragGhost) {
        return;
    }
    var oDragGhost = oDragControl.getDragGhost();
    if (!oDragGhost) {
        return;
    }
    if (!$GhostContainer) {
        $GhostContainer = jQuery("<div class=\"sapUiDnDGhostContainer\"></div>");
        jQuery(document.body).append($GhostContainer);
    }
    $GhostContainer.append(oDragGhost);
    window.setTimeout(function () { $GhostContainer.empty(); }, 0);
    var oOriginalEvent = oEvent.originalEvent;
    oOriginalEvent.dataTransfer.setDragImage(oDragGhost, oOriginalEvent.offsetX, oOriginalEvent.offsetY);
}
function createDragSession(oEvent) {
    var mData = {}, mIndicatorConfig, oDataTransfer = oEvent.originalEvent.dataTransfer, setTransferData = function (sType, sData) {
        oDataTransfer.setData(sType, sData);
    };
    return {
        setData: function (sKey, sData) {
            sData = "" + sData;
            mData[sKey] = sData;
            setTransferData(sKey, sData);
        },
        getData: function (sKey) {
            return mData[sKey];
        },
        setTextData: function (sData) {
            sData = "" + sData;
            mData["text/plain"] = sData;
            mData["text"] = sData;
            setTransferData("text/plain", sData);
            setTransferData("text", sData);
        },
        getTextData: function () {
            return mData["text/plain"];
        },
        setComplexData: function (sKey, vData) {
            mData[sKey] = vData;
        },
        getComplexData: function (sKey) {
            return mData[sKey];
        },
        getIndicator: function () {
            return $DropIndicator && $DropIndicator[0];
        },
        setIndicatorConfig: function (mConfig) {
            mIndicatorConfig = mConfig;
        },
        getIndicatorConfig: function (mConfig) {
            return mIndicatorConfig;
        },
        getDragControl: function () {
            return oDragControl;
        },
        getDropControl: function () {
            return oValidDropControl;
        },
        setDropControl: function (oControl) {
            oValidDropControl = oControl;
        },
        getDropInfo: function () {
            return aValidDropInfos[0] || null;
        },
        getDropPosition: function () {
            return sCalculatedDropPosition;
        }
    };
}
function closeDragSession(oEvent) {
    oDragControl = oDropControl = oValidDropControl = oDragSession = null;
    sCalculatedDropPosition = "";
    aValidDragInfos = [];
    aValidDropInfos = [];
}
function getDropIndicator() {
    if ($DropIndicator) {
        return $DropIndicator;
    }
    $DropIndicator = jQuery("<div class='sapUiDnDIndicator'></div>");
    jQuery(sap.ui.getCore().getStaticAreaRef()).append($DropIndicator);
    return $DropIndicator;
}
function hideDropIndicator() {
    if ($DropIndicator) {
        $DropIndicator.removeAttr("style");
        $DropIndicator.hide();
        mLastIndicatorStyle = {};
    }
}
function showDropIndicator(oEvent, oDropTarget, sDropPosition, sDropLayout) {
    if (!oDropTarget) {
        return;
    }
    var mIndicatorConfig = oEvent.dragSession && oEvent.dragSession.getIndicatorConfig(), mClientRect = oDropTarget.getBoundingClientRect(), iPageYOffset = window.pageYOffset, iPageXOffset = window.pageXOffset, $Indicator = getDropIndicator(), sRelativePosition, mStyle = {}, mDropRect = {
        top: mClientRect.top + iPageYOffset,
        bottom: mClientRect.bottom + iPageYOffset,
        left: mClientRect.left + iPageXOffset,
        right: mClientRect.right + iPageXOffset,
        width: mClientRect.width,
        height: mClientRect.height
    };
    if (!sDropPosition || sDropPosition == "On") {
        sRelativePosition = "On";
        sDropLayout = "";
    }
    else if (sDropLayout == "Horizontal") {
        var iCursorX = oEvent.pageX - mDropRect.left;
        mStyle.height = mDropRect.height;
        mStyle.top = mDropRect.top;
        if (sDropPosition == "Between") {
            mStyle.width = "";
            if (iCursorX < mDropRect.width * 0.5) {
                sRelativePosition = "Before";
                mStyle.left = mDropRect.left;
            }
            else {
                sRelativePosition = "After";
                mStyle.left = mDropRect.right;
            }
        }
        else if (sDropPosition == "OnOrBetween") {
            if (iCursorX < mDropRect.width * 0.25) {
                sRelativePosition = "Before";
                mStyle.left = mDropRect.left;
                mStyle.width = "";
            }
            else if (iCursorX > mDropRect.width * 0.75) {
                sRelativePosition = "After";
                mStyle.left = mDropRect.right;
                mStyle.width = "";
            }
            else {
                sRelativePosition = "On";
            }
        }
        if (sRelativePosition != "On" && sap.ui.getCore().getConfiguration().getRTL()) {
            sRelativePosition = (sRelativePosition == "After") ? "Before" : "After";
        }
    }
    else {
        var iCursorY = oEvent.pageY - mDropRect.top;
        mStyle.width = mDropRect.width;
        mStyle.left = mDropRect.left;
        if (sDropPosition == "Between") {
            mStyle.height = "";
            if (iCursorY < mDropRect.height * 0.5) {
                sRelativePosition = "Before";
                mStyle.top = mDropRect.top;
            }
            else {
                sRelativePosition = "After";
                mStyle.top = mDropRect.bottom;
            }
        }
        else if (sDropPosition == "OnOrBetween") {
            if (iCursorY < mDropRect.height * 0.25) {
                sRelativePosition = "Before";
                mStyle.top = mDropRect.top;
                mStyle.height = "";
            }
            else if (iCursorY > mDropRect.height * 0.75) {
                sRelativePosition = "After";
                mStyle.top = mDropRect.bottom;
                mStyle.height = "";
            }
            else {
                sRelativePosition = "On";
            }
        }
    }
    if (mIndicatorConfig && mIndicatorConfig.display == "none") {
        return sRelativePosition;
    }
    if (sRelativePosition == "On") {
        mStyle.top = mDropRect.top;
        mStyle.left = mDropRect.left;
        mStyle.width = mDropRect.width;
        mStyle.height = mDropRect.height;
        sDropPosition = sRelativePosition;
    }
    else {
        sDropPosition = "Between";
    }
    if (mLastIndicatorStyle.top != mStyle.top || mLastIndicatorStyle.left != mStyle.left || mLastIndicatorStyle.width != mStyle.width || mLastIndicatorStyle.height != mStyle.height) {
        $Indicator.attr("data-drop-layout", sDropLayout);
        $Indicator.attr("data-drop-position", sDropPosition);
        $Indicator.css(Object.assign(mStyle, mIndicatorConfig));
        $Indicator.show();
        mLastIndicatorStyle = mStyle;
    }
    return sRelativePosition;
}
function getDragDropConfigs(oControl) {
    var oParent = oControl.getParent(), aSelfConfigs = (oControl.getDragDropConfig) ? oControl.getDragDropConfig() : [], aParentConfigs = (oParent && oParent.getDragDropConfig) ? oParent.getDragDropConfig() : [];
    return aSelfConfigs.concat(aParentConfigs);
}
function getValidDragInfos(oDragControl) {
    var aDragDropConfigs = getDragDropConfigs(oDragControl);
    return aDragDropConfigs.filter(function (oDragOrDropInfo) {
        return oDragOrDropInfo.isDraggable(oDragControl);
    });
}
function getValidDropInfos(oDropControl, aDragInfos, oEvent) {
    var aDragDropConfigs = getDragDropConfigs(oDropControl);
    aDragInfos = aDragInfos || [];
    return aDragDropConfigs.filter(function (oDragOrDropInfo) {
        return !oDragOrDropInfo.isA("sap.ui.core.dnd.IDragInfo");
    }).concat(aDragInfos).filter(function (oDropInfo) {
        if (!oDropInfo.isDroppable(oDropControl, oEvent)) {
            return false;
        }
        var sDropGroupName = oDropInfo.getGroupName();
        if (!sDropGroupName) {
            return true;
        }
        return aDragInfos.some(function (oDragInfo) {
            return oDragInfo.getGroupName() == sDropGroupName;
        });
    });
}
function setDropEffect(oEvent, oDropInfo) {
    oEvent.preventDefault();
    var sDropEffect = oDropInfo.getDropEffect().toLowerCase();
    oEvent.originalEvent.dataTransfer.dropEffect = sDropEffect;
}
function showDropPosition(oEvent, oDropInfo, oValidDropControl) {
    var sTargetAggregation = oDropInfo.getTargetAggregation();
    if (!sTargetAggregation) {
        return showDropIndicator(oEvent, oValidDropControl.getDomRef());
    }
    var oTargetDomRef;
    if (oEvent.getMark("DragWithin") == sTargetAggregation) {
        oTargetDomRef = oValidDropControl.getDomRefForSetting(sTargetAggregation);
    }
    oTargetDomRef = oTargetDomRef || oValidDropControl.getDomRef();
    return showDropIndicator(oEvent, oTargetDomRef, oDropInfo.getDropPosition(true), oDropInfo.getDropLayout(true));
}
DnD.preprocessEvent = function (oEvent) {
    if (oDragSession && oEvent.type.indexOf("dr") == 0) {
        oEvent.dragSession = oDragSession;
    }
    var sEventHandler = "onbefore" + oEvent.type;
    if (DnD[sEventHandler]) {
        DnD[sEventHandler](oEvent);
    }
};
DnD.postprocessEvent = function (oEvent) {
    var sEventHandler = "onafter" + oEvent.type;
    if (DnD[sEventHandler]) {
        DnD[sEventHandler](oEvent);
    }
};
DnD.onbeforemousedown = function (oEvent) {
    if ((Device.browser.firefox) && isSelectableElement(oEvent.target)) {
        oDraggableAncestorNode = jQuery(oEvent.target).closest("[data-sap-ui-draggable=true]").prop("draggable", false)[0];
    }
};
DnD.onbeforemouseup = function (oEvent) {
    if (oDraggableAncestorNode) {
        oDraggableAncestorNode.draggable = true;
        oDraggableAncestorNode = null;
    }
};
DnD.onbeforedragstart = function (oEvent) {
    if (!oEvent.target.draggable) {
        return;
    }
    if (isSelectableElement(document.activeElement)) {
        oEvent.target.getAttribute("data-sap-ui-draggable") && oEvent.preventDefault();
        return;
    }
    oDragControl = jQuery(oEvent.target).control(0, true);
    if (!oDragControl) {
        return;
    }
    aValidDragInfos = getValidDragInfos(oDragControl);
    if (!aValidDragInfos.length) {
        return;
    }
    if (Device.browser.firefox && oEvent.originalEvent.dataTransfer.types.length === 0) {
        oEvent.originalEvent.dataTransfer.setData("ui5/dummyDataForFirefox", "data");
    }
    oEvent.dragSession = oDragSession = createDragSession(oEvent);
};
DnD.onafterdragstart = function (oEvent) {
    if (!aValidDragInfos.length || oEvent.isDefaultPrevented()) {
        closeDragSession();
        return;
    }
    aValidDragInfos = oEvent.isMarked("NonDraggable") ? [] : aValidDragInfos.filter(function (oDragInfo) {
        return oDragInfo.fireDragStart(oEvent);
    });
    if (!aValidDragInfos.length) {
        oEvent.preventDefault();
        closeDragSession();
        return;
    }
    setDragGhost(oDragControl, oEvent);
    addStyleClass(oDragControl, "sapUiDnDDragging");
    if (jQuery(oEvent.target).closest(".sapUiScrollDelegate")[0]) {
        jQuery("html").addClass("sapUiDnDNoScrolling");
    }
};
DnD.onbeforedragenter = function (oEvent) {
    var oControl = jQuery(oEvent.target).control(0, true);
    if (oControl && oDropControl === oControl) {
        oEvent.setMark("DragWithin", "SameControl");
    }
    else {
        iTargetEnteringTime = Date.now();
        oDropControl = oControl;
    }
    var aDropInfos = [];
    oValidDropControl = oControl;
    for (var i = 0; i < 20 && oValidDropControl; i++, oValidDropControl = oValidDropControl.getParent()) {
        aDropInfos = getValidDropInfos(oValidDropControl, aValidDragInfos, oEvent);
        if (aDropInfos.length) {
            break;
        }
    }
    if (oEvent.getMark("DragWithin") != "SameControl") {
        aValidDropInfos = aDropInfos;
        if (oDragSession) {
            oDragSession.setIndicatorConfig(null);
        }
    }
    if (!aValidDropInfos.length) {
        oValidDropControl = null;
    }
    else if (!oDragSession) {
        oEvent.dragSession = oDragSession = createDragSession(oEvent);
    }
};
DnD.onafterdragenter = function (oEvent) {
    if (!oValidDropControl || oEvent.isMarked("NonDroppable")) {
        aValidDropInfos = [];
    }
    else if (oEvent.getMark("DragWithin") != "SameControl") {
        aValidDropInfos = aValidDropInfos.filter(function (oDropInfo) {
            return oDropInfo.fireDragEnter(oEvent);
        });
    }
    var oValidDropInfo = aValidDropInfos[0];
    if (!oValidDropInfo || oValidDropInfo.getDropEffect() == "None") {
        hideDropIndicator();
        sCalculatedDropPosition = "";
    }
    else {
        setDropEffect(oEvent, oValidDropInfo);
        sCalculatedDropPosition = showDropPosition(oEvent, oValidDropInfo, oValidDropControl);
    }
};
DnD.onbeforedragover = function (oEvent) {
    var iCurrentTime = Date.now();
    if (iCurrentTime - iTargetEnteringTime >= 1000) {
        dispatchEvent(oEvent, "longdragover");
        iTargetEnteringTime = iCurrentTime;
    }
};
DnD.onafterdragover = function (oEvent) {
    var oValidDropInfo = aValidDropInfos[0];
    if (!oValidDropInfo || oValidDropInfo.getDropEffect() == "None") {
        return;
    }
    aValidDropInfos.forEach(function (oDropInfo) {
        oDropInfo.fireDragOver(oEvent);
    });
    setDropEffect(oEvent, oValidDropInfo);
    if (oValidDropInfo && oValidDropInfo.getDropPosition(true) == "On") {
        return;
    }
    sCalculatedDropPosition = showDropPosition(oEvent, oValidDropInfo, oValidDropControl);
};
DnD.onbeforedrop = function (oEvent) {
    if (aValidDropInfos.length) {
        oEvent.preventDefault();
    }
};
DnD.onafterdrop = function (oEvent) {
    aValidDropInfos.forEach(function (oDropInfo) {
        oDropInfo.fireDrop(oEvent);
    });
    this.iDragEndTimer = window.requestAnimationFrame(this.onafterdragend.bind(this, oEvent));
};
DnD.onafterdragend = function (oEvent) {
    this.iDragEndTimer = window.cancelAnimationFrame(this.iDragEndTimer);
    aValidDragInfos.forEach(function (oDragInfo) {
        oDragInfo.fireDragEnd(oEvent);
    });
    removeStyleClass(oDragControl, "sapUiDnDDragging");
    jQuery("html").removeClass("sapUiDnDNoScrolling");
    hideDropIndicator();
    closeDragSession();
};
UIArea.addEventPreprocessor(DnD.preprocessEvent);
UIArea.addEventPostprocessor(DnD.postprocessEvent);