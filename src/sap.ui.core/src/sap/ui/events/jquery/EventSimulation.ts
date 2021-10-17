import Version from "sap/base/util/Version";
import PseudoEvents from "sap/ui/events/PseudoEvents";
import checkMouseEnterOrLeave from "sap/ui/events/checkMouseEnterOrLeave";
import ControlEvents from "sap/ui/events/ControlEvents";
import Device from "sap/ui/Device";
import TouchToMouseMapping from "sap/ui/events/TouchToMouseMapping";
import jQuery from "sap/ui/thirdparty/jquery";
export class oEventSimulation {
    static aAdditionalControlEvents = [];
    static aAdditionalPseudoEvents = [];
    private static _createSimulatedEvent(sSimEventName: any, aOrigEvents: any, fnHandler: any) {
        var sHandlerKey = "__" + sSimEventName + "Handler";
        var sSapSimEventName = "sap" + sSimEventName;
        this.aAdditionalControlEvents.push(sSapSimEventName);
        this.aAdditionalPseudoEvents.push({
            sName: sSimEventName,
            aTypes: [sSapSimEventName],
            fnCheck: function (oEvent) {
                return true;
            }
        });
        jQuery.event.special[sSapSimEventName] = {
            add: function (oHandle) {
                var that = this, $this = jQuery(this), oAdditionalConfig = {
                    domRef: that,
                    eventName: sSimEventName,
                    sapEventName: sSapSimEventName,
                    eventHandle: oHandle
                };
                var fnHandlerWrapper = function (oEvent) {
                    fnHandler(oEvent, oAdditionalConfig);
                };
                oHandle.__sapSimulatedEventHandler = fnHandlerWrapper;
                for (var i = 0; i < aOrigEvents.length; i++) {
                    $this.on(aOrigEvents[i], fnHandlerWrapper);
                }
            },
            remove: function (oHandle) {
                var $this = jQuery(this);
                var fnHandler = oHandle.__sapSimulatedEventHandler;
                $this.removeData(sHandlerKey + oHandle.guid);
                for (var i = 0; i < aOrigEvents.length; i++) {
                    jQuery.event.remove(this, aOrigEvents[i], fnHandler);
                }
            }
        };
    }
    private static _handleMouseToTouchEvent(oEvent: any, oConfig: any) {
        if (oEvent.isMarked("delayedMouseEvent")) {
            return;
        }
        var $DomRef = jQuery(oConfig.domRef), oControl = jQuery.fn.control ? jQuery(oEvent.target).control(0) : null, sTouchStartControlId = $DomRef.data("__touchstart_control"), oTouchStartControlDOM = sTouchStartControlId && window.document.getElementById(sTouchStartControlId);
        if (oEvent.type === "mouseout" && !checkMouseEnterOrLeave(oEvent, oConfig.domRef) && (!oTouchStartControlDOM || !checkMouseEnterOrLeave(oEvent, oTouchStartControlDOM))) {
            return;
        }
        var oNewEvent = jQuery.event.fix(oEvent.originalEvent || oEvent);
        oNewEvent.type = oConfig.sapEventName;
        if (oNewEvent.isMarked("firstUIArea")) {
            oNewEvent.setMark("handledByUIArea", false);
        }
        var aTouches = [{
                identifier: 1,
                pageX: oNewEvent.pageX,
                pageY: oNewEvent.pageY,
                clientX: oNewEvent.clientX,
                clientY: oNewEvent.clientY,
                screenX: oNewEvent.screenX,
                screenY: oNewEvent.screenY,
                target: oNewEvent.target,
                radiusX: 1,
                radiusY: 1,
                rotationAngle: 0
            }];
        switch (oConfig.eventName) {
            case "touchstart": if (oControl) {
                $DomRef.data("__touchstart_control", oControl.getId());
            }
            case "touchmove":
                oNewEvent.touches = oNewEvent.changedTouches = oNewEvent.targetTouches = aTouches;
                break;
            case "touchend":
                oNewEvent.changedTouches = aTouches;
                oNewEvent.touches = oNewEvent.targetTouches = [];
                break;
        }
        if (oConfig.eventName === "touchstart" || $DomRef.data("__touch_in_progress")) {
            $DomRef.data("__touch_in_progress", "X");
            if (oEvent.type === "mouseout") {
                oNewEvent.setMarked("fromMouseout");
            }
            if (oConfig.eventName !== "touchstart" && (!oControl || oControl.getId() !== sTouchStartControlId)) {
                oNewEvent.setMark("scopeCheckId", sTouchStartControlId);
            }
            if (oEvent.type !== "dragstart") {
                oConfig.eventHandle.handler.call(oConfig.domRef, oNewEvent);
            }
            if ((oConfig.eventName === "touchend" || oEvent.type === "dragstart") && !oNewEvent.isMarked("fromMouseout")) {
                $DomRef.removeData("__touch_in_progress");
                $DomRef.removeData("__touchstart_control");
            }
        }
    }
    private static _initTouchEventSimulation(...args: any) {
        this._createSimulatedEvent("touchstart", ["mousedown"], this._handleMouseToTouchEvent);
        this._createSimulatedEvent("touchend", ["mouseup", "mouseout"], this._handleMouseToTouchEvent);
        this._createSimulatedEvent("touchmove", ["mousemove", "dragstart"], this._handleMouseToTouchEvent);
    }
    private static _initContextMenuSimulation(...args: any) {
        var fnSimulatedFunction = function (oEvent, oConfig) {
            var oNewEvent = jQuery.event.fix(oEvent.originalEvent || oEvent);
            oNewEvent.type = oConfig.sapEventName;
            if (!window.getSelection || !window.getSelection() || window.getSelection().toString() === "") {
                oConfig.eventHandle.handler.call(oConfig.domRef, oNewEvent);
            }
        };
        this._createSimulatedEvent("contextmenu", ["taphold"], fnSimulatedFunction);
    }
    private static _initMouseEventSimulation(bBlackberryDevice: any) {
        var bFingerIsMoved = false, iMoveThreshold = jQuery.vmouse.moveDistanceThreshold, iStartX, iStartY, iOffsetX, iOffsetY, iLastTouchMoveTime;
        var fnCreateNewEvent = function (oEvent, oConfig, oMappedEvent) {
            var oNewEvent = jQuery.event.fix(oEvent.originalEvent || oEvent);
            oNewEvent.type = oConfig.sapEventName;
            delete oNewEvent.touches;
            delete oNewEvent.changedTouches;
            delete oNewEvent.targetTouches;
            oNewEvent.screenX = oMappedEvent.screenX;
            oNewEvent.screenY = oMappedEvent.screenY;
            oNewEvent.clientX = oMappedEvent.clientX;
            oNewEvent.clientY = oMappedEvent.clientY;
            oNewEvent.ctrlKey = oMappedEvent.ctrlKey;
            oNewEvent.altKey = oMappedEvent.altKey;
            oNewEvent.shiftKey = oMappedEvent.shiftKey;
            oNewEvent.button = 0;
            return oNewEvent;
        };
        var fnTouchMoveToMouseHandler = function (oEvent, oConfig) {
            if (oEvent.isMarked("handledByTouchToMouse")) {
                return;
            }
            oEvent.setMarked("handledByTouchToMouse");
            if (!bFingerIsMoved) {
                var oTouch = oEvent.originalEvent.touches[0];
                bFingerIsMoved = (Math.abs(oTouch.pageX - iStartX) > iMoveThreshold || Math.abs(oTouch.pageY - iStartY) > iMoveThreshold);
            }
            if (bBlackberryDevice) {
                if (iLastTouchMoveTime && oEvent.timeStamp - iLastTouchMoveTime < 50) {
                    return;
                }
                iLastTouchMoveTime = oEvent.timeStamp;
            }
            var oNewEvent = fnCreateNewEvent(oEvent, oConfig, oEvent.touches[0]);
            setTimeout(function () {
                oNewEvent.setMark("handledByUIArea", false);
                oConfig.eventHandle.handler.call(oConfig.domRef, oNewEvent);
            }, 0);
        };
        var fnTouchToMouseHandler = function (oEvent, oConfig) {
            if (oEvent.isMarked("handledByTouchToMouse")) {
                return;
            }
            oEvent.setMarked("handledByTouchToMouse");
            var oNewStartEvent, oNewEndEvent, bSimulateClick;
            function createNewEvent() {
                return fnCreateNewEvent(oEvent, oConfig, oConfig.eventName === "mouseup" ? oEvent.changedTouches[0] : oEvent.touches[0]);
            }
            if (oEvent.type === "touchstart") {
                var oTouch = oEvent.originalEvent.touches[0];
                bFingerIsMoved = false;
                iLastTouchMoveTime = 0;
                iStartX = oTouch.pageX;
                iStartY = oTouch.pageY;
                iOffsetX = Math.round(oTouch.pageX - jQuery(oEvent.target).offset().left);
                iOffsetY = Math.round(oTouch.pageY - jQuery(oEvent.target).offset().top);
                oNewStartEvent = createNewEvent();
                setTimeout(function () {
                    oNewStartEvent.setMark("handledByUIArea", false);
                    oConfig.eventHandle.handler.call(oConfig.domRef, oNewStartEvent);
                }, 0);
            }
            else if (oEvent.type === "touchend") {
                oNewEndEvent = createNewEvent();
                bSimulateClick = !bFingerIsMoved;
                setTimeout(function () {
                    oNewEndEvent.setMark("handledByUIArea", false);
                    oConfig.eventHandle.handler.call(oConfig.domRef, oNewEndEvent);
                    if (bSimulateClick) {
                        oNewEndEvent.type = "click";
                        oNewEndEvent.getPseudoTypes = jQuery.Event.prototype.getPseudoTypes;
                        oNewEndEvent.setMark("handledByUIArea", false);
                        oNewEndEvent.offsetX = iOffsetX;
                        oNewEndEvent.offsetY = iOffsetY;
                        oConfig.eventHandle.handler.call(oConfig.domRef, oNewEndEvent);
                    }
                }, 0);
            }
        };
        this._createSimulatedEvent("mousedown", ["touchstart"], fnTouchToMouseHandler);
        this._createSimulatedEvent("mousemove", ["touchmove"], fnTouchMoveToMouseHandler);
        this._createSimulatedEvent("mouseup", ["touchend", "touchcancel"], fnTouchToMouseHandler);
    }
    private static _init(aEvents: any) {
        this.aAdditionalControlEvents.push("swipe", "tap", "swipeleft", "swiperight", "scrollstart", "scrollstop");
        this.aAdditionalPseudoEvents.push({
            sName: "swipebegin",
            aTypes: ["swipeleft", "swiperight"],
            fnCheck: function (oEvent) {
                var bRtl = sap.ui.getCore().getConfiguration().getRTL();
                return (bRtl && oEvent.type === "swiperight") || (!bRtl && oEvent.type === "swipeleft");
            }
        });
        this.aAdditionalPseudoEvents.push({
            sName: "swipeend",
            aTypes: ["swipeleft", "swiperight"],
            fnCheck: function (oEvent) {
                var bRtl = sap.ui.getCore().getConfiguration().getRTL();
                return (!bRtl && oEvent.type === "swiperight") || (bRtl && oEvent.type === "swipeleft");
            }
        });
        if (jQVersion.compareTo("1.9.1") < 0) {
            aEvents = aEvents.concat(this.aAdditionalControlEvents);
        }
        else {
            aEvents = this.aAdditionalControlEvents.concat(aEvents);
        }
        for (var i = 0; i < this.aAdditionalPseudoEvents.length; i++) {
            PseudoEvents.addEvent(this.aAdditionalPseudoEvents[i]);
        }
        return aEvents;
    }
}
var jQVersion = Version(jQuery.fn.jquery);
if (Device.browser.webkit && /Mobile/.test(navigator.userAgent) && Device.support.touch) {
    TouchToMouseMapping.init(window.document);
    oEventSimulation.disableTouchToMouseHandling = TouchToMouseMapping.disableTouchToMouseHandling;
}
if (!oEventSimulation.disableTouchToMouseHandling) {
    oEventSimulation.disableTouchToMouseHandling = jQuery.noop;
}
if (Device.support.touch) {
    ControlEvents.events.push("touchstart", "touchend", "touchmove", "touchcancel");
}
(function initTouchEventSupport() {
    oEventSimulation.touchEventMode = "SIM";
    if (Device.support.touch) {
        oEventSimulation.touchEventMode = "ON";
        if (jQVersion.compareTo("3.0.0") < 0) {
            jQuery.event.props.push("touches", "targetTouches", "changedTouches");
        }
    }
    oEventSimulation._initTouchEventSimulation();
    if (Device.os.ios) {
        oEventSimulation._initContextMenuSimulation();
    }
    if (Device.support.touch) {
        oEventSimulation.disableTouchToMouseHandling();
        oEventSimulation._initMouseEventSimulation(Device.os.blackberry);
    }
    ControlEvents.events = oEventSimulation._init(ControlEvents.events);
}());