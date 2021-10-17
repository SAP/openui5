import Log from "sap/base/Log";
import Component from "../../Component";
import Element from "../../Element";
import Router from "../../routing/Router";
export class EventBroadcaster {
    static getEventsExcludeList(...args: any) {
        return JSON.parse(JSON.stringify(EventsExcludeList));
    }
    static setEventsExcludeList(oConfig: any) {
        if (this._isValidConfig(oConfig)) {
            EventsExcludeList = JSON.parse(JSON.stringify(oConfig));
        }
        else {
            if (Log.isLoggable()) {
                Log.error("Provided ExcludeList configuration is not valid. Continuing to use previously/default set configuration.");
            }
        }
    }
    static enable(...args: any) {
        Element._interceptEvent = function (sEventId, oElement, mParameters) {
            EventBroadcaster.broadcastEvent(sEventId, oElement, mParameters);
        };
        Router._interceptRouteMatched = function (sControlId, oRouter) {
            EventBroadcaster.broadcastRouteMatched(Router.M_EVENTS.ROUTE_MATCHED, sControlId, oRouter);
        };
    }
    static disable(...args: any) {
        if (Element._interceptEvent) {
            delete Element._interceptEvent;
        }
        if (Router._interceptRouteMatched) {
            delete Router._interceptRouteMatched;
        }
    }
    static broadcastEvent(sEventId: any, oElement: any, mParameters: any) {
        var oTimeFired = new Date();
        setTimeout(function () {
            var oData = {}, oComponentInfo;
            if (EventBroadcaster._shouldExpose(sEventId, oElement)) {
                oComponentInfo = EventBroadcaster._createOwnerComponentInfo(oElement);
                oData = {
                    componentId: oComponentInfo.id,
                    componentVersion: oComponentInfo.version,
                    eventName: sEventId,
                    targetId: oElement.getId(),
                    targetType: oElement.getMetadata().getName(),
                    timestamp: oTimeFired.getTime()
                };
                if (Log.isLoggable()) {
                    Log.debug("EventBroadcaster: Broadcast Event: ", JSON.stringify(oData));
                }
                oData.additionalAttributes = mParameters;
                EventBroadcaster._dispatchCustomEvent(oData);
            }
        });
    }
    static broadcastRouteMatched(sEventId: any, sElementId: any, oRouter: any) {
        var oTimeFired = new Date();
        setTimeout(function () {
            var oComponentInfo = EventBroadcaster._createOwnerComponentInfo(sap.ui.getCore().byId(sElementId)), oData = {
                componentId: oComponentInfo.id,
                componentVersion: oComponentInfo.version,
                eventName: sEventId,
                targetId: sElementId,
                targetType: "sap.ui.core.routing.Router",
                timestamp: oTimeFired.getTime(),
                additionalAttributes: {
                    fullURL: document && document.baseURI,
                    hash: oRouter.getHashChanger().getHash(),
                    previousHash: EventBroadcaster._previousHash
                }
            };
            EventBroadcaster._previousHash = oData.additionalAttributes.hash;
            if (Log.isLoggable()) {
                Log.debug("EventBroadcaster: Broadcast Route Matched: ", JSON.stringify(oData));
            }
            EventBroadcaster._dispatchCustomEvent(oData);
        });
    }
    private static _dispatchCustomEvent(oData: any) {
        var oCustomEvent = new window.CustomEvent("UI5Event", {
            detail: oData
        });
        window.dispatchEvent(oCustomEvent);
    }
    private static _shouldExpose(sEventId: any, oElement: any) {
        var oExcludeListConfig = EventBroadcaster.getEventsExcludeList(), bExposeGlobal = oExcludeListConfig.global.indexOf(sEventId) === -1 && EventBroadcaster._isPublicElementEvent(sEventId, oElement), bExposeControl = EventBroadcaster._isTrackableControlEvent(oExcludeListConfig, sEventId, oElement);
        return bExposeGlobal && bExposeControl;
    }
    private static _isTrackableControlEvent(oConfig: any, sEventId: any, oElement: any) {
        var aExclude, aInclude, bTrackable = true, sName = oElement.getMetadata().getName();
        if (oConfig.controls[sName]) {
            aExclude = oConfig.controls[sName].exclude;
            aInclude = oConfig.controls[sName].include;
            if (!aExclude && !aInclude) {
                bTrackable = false;
            }
            if (aInclude && aInclude.indexOf(sEventId) > -1) {
                bTrackable = true;
            }
            if (aExclude && aExclude.indexOf(sEventId) > -1) {
                bTrackable = false;
            }
        }
        return bTrackable;
    }
    private static _isPublicElementEvent(sEventId: any, oElement: any) {
        return oElement.getMetadata().hasEvent(sEventId);
    }
    private static _isValidConfig(oConfig: any) {
        var bGlobal = oConfig.hasOwnProperty("global"), bControls = oConfig.hasOwnProperty("controls");
        return bGlobal && bControls;
    }
    private static _createOwnerComponentInfo(oSrcElement: any) {
        var sId, sVersion, oComponent, oApp;
        if (oSrcElement) {
            while (oSrcElement && oSrcElement.getParent) {
                oComponent = Component.getOwnerComponentFor(oSrcElement);
                if (oComponent || oSrcElement.getMetadata().isA("sap.ui.core.Component")) {
                    oComponent = oComponent || oSrcElement;
                    oApp = oComponent.getManifestEntry("sap.app");
                    sId = oApp && oApp.id || oComponent.getMetadata().getName();
                    sVersion = oApp && oApp.applicationVersion && oApp.applicationVersion.version;
                }
                oSrcElement = oSrcElement.getParent();
            }
        }
        return {
            id: sId || "undetermined",
            version: sVersion || ""
        };
    }
}
var EventsExcludeList = {
    global: ["modelContextChange", "beforeRendering", "afterRendering", "propertyChanged", "beforeGeometryChanged", "geometryChanged", "aggregationChanged", "componentCreated", "afterInit", "updateStarted", "updateFinished", "load", "scroll"],
    controls: {}
};