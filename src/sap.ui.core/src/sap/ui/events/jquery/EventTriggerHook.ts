import Log from "sap/base/Log";
import containsOrEquals from "sap/ui/dom/containsOrEquals";
import jQuery from "sap/ui/thirdparty/jquery";
import uid from "sap/base/util/uid";
var mTriggerEventInfo = {};
function fnTriggerHook(oEvent) {
    var bIsLoggable = Log.isLoggable(Log.Level.DEBUG), mEventInfo = mTriggerEventInfo[oEvent.type], fnOriginalTriggerHook = mEventInfo.originalTriggerHook, t0 = window.performance.now(), t1, sId, oDomInfo;
    if (!oEvent.isPropagationStopped() && !oEvent.isSimulated) {
        for (sId in mEventInfo.domRefs) {
            oDomInfo = mEventInfo.domRefs[sId];
            if (oDomInfo.excludedDomRefs.indexOf(oEvent.target) === -1 && containsOrEquals(oDomInfo.domRef, oEvent.target)) {
                oEvent.preventDefault();
                oEvent.stopImmediatePropagation();
                if (bIsLoggable) {
                    t1 = window.performance.now();
                    Log.debug("Perf: jQuery trigger suppression event handler " + oEvent.type + " took " + (t1 - t0) + " milliseconds.");
                }
                return false;
            }
        }
    }
    if (fnOriginalTriggerHook) {
        return fnOriginalTriggerHook.call(this, oEvent);
    }
}
function _applyTriggerHook(sEventType) {
    if (!jQuery.event.special[sEventType]) {
        jQuery.event.special[sEventType] = {};
    }
    var oSpecialEvent = jQuery.event.special[sEventType], originalTriggerHook = oSpecialEvent.trigger;
    oSpecialEvent.trigger = fnTriggerHook;
    return originalTriggerHook;
}
function suppressTriggeredEvent(sEventType, oDomRef, aExcludedDomRefs) {
    var mEventInfo = mTriggerEventInfo[sEventType];
    var sId = uid();
    if (!mEventInfo) {
        mEventInfo = mTriggerEventInfo[sEventType] = {
            domRefs: {},
            originalTriggerHook: _applyTriggerHook(sEventType)
        };
    }
    mEventInfo.domRefs[sId] = {
        domRef: oDomRef,
        excludedDomRefs: [].concat(aExcludedDomRefs)
    };
    return {
        id: sId,
        type: sEventType
    };
}
function releaseTriggeredEvent(oHandler) {
    if (!oHandler) {
        Log.error("Release trigger events must not be called without passing a valid handler!");
        return;
    }
    var mEventInfo = mTriggerEventInfo[oHandler.type];
    if (!mEventInfo) {
        return;
    }
    else if (!mEventInfo.domRefs[oHandler.id] || !mEventInfo.domRefs[oHandler.id].domRef) {
        Log.warning("Release trigger event for event type " + oHandler.type + "on Control " + oHandler.id + ": DomRef does not exists");
        return;
    }
    delete mEventInfo.domRefs[oHandler.id];
}