import Measurement from "sap/ui/performance/Measurement";
import XHRInterceptor from "sap/ui/performance/XHRInterceptor";
import LoaderExtensions from "sap/base/util/LoaderExtensions";
import now from "sap/base/util/now";
import uid from "sap/base/util/uid";
import Log from "sap/base/Log";
import URI from "sap/ui/thirdparty/URI";
export class Interaction {
    static getAll(bFinalize: any) {
        if (bFinalize) {
            Interaction.end(true);
        }
        return aInteractions;
    }
    static filter(fnFilter: any) {
        var aFilteredInteractions = [];
        if (fnFilter) {
            for (var i = 0, l = aInteractions.length; i < l; i++) {
                if (fnFilter(aInteractions[i])) {
                    aFilteredInteractions.push(aInteractions[i]);
                }
            }
        }
        return aFilteredInteractions;
    }
    static getPending(...args: any) {
        return oPendingInteraction;
    }
    static clear(...args: any) {
        aInteractions = [];
    }
    static start(sType: any, oSrcElement: any) {
        var iTime = now();
        if (oPendingInteraction) {
            finalizeInteraction(iTime);
        }
        if (iInteractionStepTimer) {
            clearTimeout(iInteractionStepTimer);
        }
        iInteractionCounter = 0;
        if (window.performance.clearResourceTimings) {
            window.performance.clearResourceTimings();
        }
        var oComponentInfo = createOwnerComponentInfo(oSrcElement);
        oPendingInteraction = createMeasurement(iTime);
        oPendingInteraction.event = sType;
        oPendingInteraction.component = oComponentInfo.id;
        oPendingInteraction.appVersion = oComponentInfo.version;
        oPendingInteraction.start = iTime;
        if (oSrcElement && oSrcElement.getId) {
            oPendingInteraction.trigger = oSrcElement.getId();
        }
        if (Log.isLoggable(null, "sap.ui.Performance")) {
            console.time("INTERACTION: " + oPendingInteraction.trigger + " - " + oPendingInteraction.event);
        }
        if (Log.isLoggable()) {
            Log.debug("Interaction step started: trigger: " + oPendingInteraction.trigger + "; type: " + oPendingInteraction.event, "Interaction.js");
        }
    }
    static end(bForce: any) {
        if (oPendingInteraction) {
            if (bForce) {
                if (Log.isLoggable(null, "sap.ui.Performance")) {
                    console.timeEnd("INTERACTION: " + oPendingInteraction.trigger + " - " + oPendingInteraction.event);
                }
                finalizeInteraction(oPendingInteraction.preliminaryEnd || now());
                if (Log.isLoggable()) {
                    Log.debug("Interaction ended...");
                }
            }
            else {
                oPendingInteraction.preliminaryEnd = now();
                oPendingInteraction.processing = oPendingInteraction.preliminaryEnd - oPendingInteraction.start;
            }
        }
    }
    static getActive(...args: any) {
        return bInteractionActive;
    }
    static setActive(bActive: any) {
        if (bActive && !bInteractionActive) {
            registerXHROverrides();
            interceptScripts();
            LoaderExtensions.notifyResourceLoading = Interaction.notifyAsyncStep;
        }
        bInteractionActive = bActive;
    }
    static notifyNavigation(...args: any) {
        isNavigation = true;
    }
    static notifyShowBusyIndicator(oControl: any) {
        oControl._sapui_fesr_fDelayedStartTime = now() + oControl.getBusyIndicatorDelay();
    }
    static notifyHideBusyIndicator(oControl: any) {
        if (oControl._sapui_fesr_fDelayedStartTime) {
            var fBusyIndicatorShownDuration = now() - oControl._sapui_fesr_fDelayedStartTime;
            Interaction.addBusyDuration((fBusyIndicatorShownDuration > 0) ? fBusyIndicatorShownDuration : 0);
            delete oControl._sapui_fesr_fDelayedStartTime;
        }
    }
    static notifyStepStart(sEventId: any, oElement: any, bForce: any) {
        if (bInteractionActive) {
            if ((!oPendingInteraction && oCurrentBrowserEvent && !bInteractionProcessed) || bForce) {
                var sType;
                if (bForce) {
                    sType = "startup";
                }
                else {
                    sType = sEventId;
                }
                Interaction.start(sType, oElement);
                oPendingInteraction = Interaction.getPending();
                if (oPendingInteraction && !oPendingInteraction.completed && Interaction.onInteractionStarted) {
                    oPendingInteraction.passportAction = Interaction.onInteractionStarted(oPendingInteraction, bForce);
                }
                if (oCurrentBrowserEvent) {
                    oBrowserElement = oCurrentBrowserEvent.srcControl;
                }
                if (oElement && oElement.getId && oBrowserElement && oElement.getId() === oBrowserElement.getId()) {
                    bMatched = true;
                }
                oCurrentBrowserEvent = null;
                bInteractionProcessed = true;
                isNavigation = false;
                setTimeout(function () {
                    oCurrentBrowserEvent = null;
                    bInteractionProcessed = false;
                }, 0);
            }
            else if (oPendingInteraction && oBrowserElement && !bMatched) {
                var elem = oBrowserElement;
                if (elem && oElement.getId() === elem.getId()) {
                    oPendingInteraction.trigger = oElement.getId();
                    oPendingInteraction.event = sEventId;
                    bMatched = true;
                }
                else {
                    while (elem && elem.getParent()) {
                        elem = elem.getParent();
                        if (oElement.getId() === elem.getId()) {
                            oPendingInteraction.trigger = oElement.getId();
                            oPendingInteraction.event = sEventId;
                            break;
                        }
                    }
                }
            }
        }
    }
    static notifyAsyncStep(sStepName: any) {
        if (oPendingInteraction) {
            if (Log.isLoggable(null, "sap.ui.Performance") && sStepName) {
                console.time(sStepName);
            }
            var sInteractionId = oPendingInteraction.id;
            Interaction.notifyAsyncStepStart();
            return function () {
                Interaction.notifyAsyncStepEnd(sInteractionId);
                if (Log.isLoggable(null, "sap.ui.Performance") && sStepName) {
                    console.timeEnd(sStepName);
                }
            };
        }
        else {
            return function () { };
        }
    }
    static notifyAsyncStepStart(...args: any) {
        if (oPendingInteraction) {
            iInteractionCounter++;
            clearTimeout(iInteractionStepTimer);
            bIdle = false;
            if (Log.isLoggable()) {
                Log.debug("Interaction relevant step started - Number of pending steps: " + iInteractionCounter);
            }
        }
    }
    static notifyAsyncStepEnd(sId: any) {
        if (oPendingInteraction && sId === oPendingInteraction.id) {
            iInteractionCounter--;
            Interaction.notifyStepEnd(true);
            if (Log.isLoggable()) {
                Log.debug("Interaction relevant step stopped - Number of pending steps: " + iInteractionCounter);
            }
        }
    }
    static notifyStepEnd(bCheckIdle: any) {
        if (bInteractionActive && !bSuspended) {
            if (iInteractionCounter === 0 || !bCheckIdle) {
                if (bIdle || !bCheckIdle) {
                    Interaction.end(true);
                    if (Log.isLoggable()) {
                        Log.debug("Interaction stopped");
                    }
                    bIdle = false;
                }
                else {
                    Interaction.end();
                    bIdle = true;
                    if (iInteractionStepTimer) {
                        clearTimeout(iInteractionStepTimer);
                    }
                    iInteractionStepTimer = setTimeout(Interaction.notifyStepEnd, 250);
                    if (Log.isLoggable()) {
                        Log.debug("Interaction check for idle time - Number of pending steps: " + iInteractionCounter);
                    }
                }
            }
        }
    }
    static notifyEventStart(oEvent: any) {
        oCurrentBrowserEvent = bInteractionActive ? oEvent : null;
    }
    static notifyScrollEvent(oEvent: any) {
    }
    static notifyEventEnd(...args: any) {
        if (oCurrentBrowserEvent) {
            if (oCurrentBrowserEvent.type.match(/^(mousedown|touchstart|keydown)$/)) {
                Interaction.end(true);
            }
        }
    }
    static setStepComponent(sComponentName: any) {
        if (bInteractionActive && oPendingInteraction && sComponentName && !oPendingInteraction.stepComponent) {
            oPendingInteraction.stepComponent = sComponentName;
        }
    }
    static addBusyDuration(iDuration: any) {
        if (bInteractionActive && oPendingInteraction) {
            if (!oPendingInteraction.busyDuration) {
                oPendingInteraction.busyDuration = 0;
            }
            oPendingInteraction.busyDuration += iDuration;
        }
    }
}
var HOST = window.location.host, INTERACTION = "INTERACTION", isNavigation = false, aInteractions = [], oPendingInteraction = createMeasurement(), mCompressedMimeTypes = {
    "application/zip": true,
    "application/vnd.rar": true,
    "application/gzip": true,
    "application/x-tar": true,
    "application/java-archive": true,
    "image/jpeg": true,
    "application/pdf": true
}, sCompressedExtensions = "zip,rar,arj,z,gz,tar,lzh,cab,hqx,ace,jar,ear,war,jpg,jpeg,pdf,gzip";
function isCORSRequest(sUrl) {
    var sHost = new URI(sUrl).host();
    return sHost && sHost !== HOST;
}
function hexToAscii(sValue) {
    var hex = sValue.toString();
    var str = "";
    for (var n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str.trim();
}
function createMeasurement(iTime) {
    return {
        event: "startup",
        trigger: "undetermined",
        component: "undetermined",
        appVersion: "undetermined",
        start: iTime || window.performance.timing.fetchStart,
        end: 0,
        navigation: 0,
        roundtrip: 0,
        processing: 0,
        duration: 0,
        requests: [],
        measurements: [],
        sapStatistics: [],
        requestTime: 0,
        networkTime: 0,
        bytesSent: 0,
        bytesReceived: 0,
        requestCompression: "X",
        busyDuration: 0,
        id: uid(),
        passportAction: "undetermined_startup_0"
    };
}
function isCompleteMeasurement(oMeasurement) {
    if (oMeasurement.start > oPendingInteraction.start && oMeasurement.end < oPendingInteraction.end) {
        return oMeasurement;
    }
}
function isXHR(oRequestTiming) {
    var bComplete = oRequestTiming.startTime > 0 && oRequestTiming.startTime <= oRequestTiming.requestStart && oRequestTiming.requestStart <= oRequestTiming.responseEnd;
    return bComplete && oRequestTiming.initiatorType === "xmlhttprequest";
}
function aggregateRequestTiming(oRequest) {
    this.end = oRequest.responseEnd > this.end ? oRequest.responseEnd : this.end;
    oPendingInteraction.requestTime += (oRequest.responseEnd - oRequest.startTime);
    if (this.roundtripHigherLimit <= oRequest.startTime) {
        oPendingInteraction.navigation += (this.navigationHigherLimit - this.navigationLowerLimit);
        oPendingInteraction.roundtrip += (this.roundtripHigherLimit - this.roundtripLowerLimit);
        this.navigationLowerLimit = oRequest.startTime;
        this.roundtripLowerLimit = oRequest.startTime;
    }
    if (oRequest.responseEnd > this.roundtripHigherLimit) {
        this.roundtripHigherLimit = oRequest.responseEnd;
    }
    if (oRequest.requestStart > this.navigationHigherLimit) {
        this.navigationHigherLimit = oRequest.requestStart;
    }
}
function aggregateRequestTimings(aRequests) {
    var oTimings = {
        start: aRequests[0].startTime,
        end: aRequests[0].responseEnd,
        navigationLowerLimit: aRequests[0].startTime,
        navigationHigherLimit: aRequests[0].requestStart,
        roundtripLowerLimit: aRequests[0].startTime,
        roundtripHigherLimit: aRequests[0].responseEnd
    };
    aRequests.forEach(aggregateRequestTiming, oTimings);
    oPendingInteraction.navigation += (oTimings.navigationHigherLimit - oTimings.navigationLowerLimit);
    oPendingInteraction.roundtrip += (oTimings.roundtripHigherLimit - oTimings.roundtripLowerLimit);
    if (oPendingInteraction.networkTime) {
        var iTotalNetworkTime = oPendingInteraction.requestTime - oPendingInteraction.networkTime;
        oPendingInteraction.networkTime = iTotalNetworkTime / aRequests.length;
    }
    else {
        oPendingInteraction.networkTime = 0;
    }
    if (oPendingInteraction.processing === 0) {
        var iRelativeStart = oPendingInteraction.start - window.performance.timing.fetchStart;
        oPendingInteraction.duration = oTimings.end - iRelativeStart;
        oPendingInteraction.processing = oTimings.start - iRelativeStart;
    }
}
function finalizeInteraction(iTime) {
    if (oPendingInteraction) {
        var aAllRequestTimings = window.performance.getEntriesByType("resource");
        oPendingInteraction.end = iTime;
        oPendingInteraction.duration = oPendingInteraction.processing;
        oPendingInteraction.requests = aAllRequestTimings.filter(isXHR);
        oPendingInteraction.completeRoundtrips = 0;
        oPendingInteraction.measurements = Measurement.filterMeasurements(isCompleteMeasurement, true);
        if (oPendingInteraction.requests.length > 0) {
            aggregateRequestTimings(oPendingInteraction.requests);
        }
        oPendingInteraction.completeRoundtrips = oPendingInteraction.requests.length;
        var iProcessing = oPendingInteraction.processing - oPendingInteraction.navigation - oPendingInteraction.roundtrip;
        oPendingInteraction.processing = iProcessing > -1 ? iProcessing : 0;
        oPendingInteraction.completed = true;
        Object.freeze(oPendingInteraction);
        if (oPendingInteraction.duration !== 0 || oPendingInteraction.requests.length > 0 || isNavigation) {
            aInteractions.push(oPendingInteraction);
            var oFinshedInteraction = aInteractions[aInteractions.length - 1];
            if (Interaction.onInteractionFinished && oFinshedInteraction) {
                Interaction.onInteractionFinished(oFinshedInteraction);
            }
            if (Log.isLoggable()) {
                Log.debug("Interaction step finished: trigger: " + oPendingInteraction.trigger + "; duration: " + oPendingInteraction.duration + "; requests: " + oPendingInteraction.requests.length, "Interaction.js");
            }
        }
        oPendingInteraction = null;
        oCurrentBrowserEvent = null;
        isNavigation = false;
        bMatched = false;
    }
}
function createOwnerComponentInfo(oSrcElement) {
    var sId, sVersion;
    if (oSrcElement) {
        var Component, oComponent;
        Component = sap.ui.require("sap/ui/core/Component");
        if (Component) {
            while (oSrcElement && oSrcElement.getParent) {
                oComponent = Component.getOwnerComponentFor(oSrcElement);
                if (oComponent || oSrcElement instanceof Component) {
                    oComponent = oComponent || oSrcElement;
                    var oApp = oComponent.getManifestEntry("sap.app");
                    sId = oApp && oApp.id || oComponent.getMetadata().getName();
                    sVersion = oApp && oApp.applicationVersion && oApp.applicationVersion.version;
                }
                oSrcElement = oSrcElement.getParent();
            }
        }
    }
    return {
        id: sId ? sId : "undetermined",
        version: sVersion ? sVersion : ""
    };
}
var bInteractionActive = false, bInteractionProcessed = false, oCurrentBrowserEvent, oBrowserElement, bMatched = false, iInteractionStepTimer, bIdle = false, bSuspended = false, iInteractionCounter = 0, descScriptSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
function interceptScripts() {
    Object.defineProperty(HTMLScriptElement.prototype, "src", {
        set: function (val) {
            var fnDone;
            if (!this.dataset.sapUiCoreInteractionHandled) {
                fnDone = Interaction.notifyAsyncStep();
                this.addEventListener("load", function () {
                    fnDone();
                });
                this.addEventListener("error", function () {
                    fnDone();
                });
                this.dataset.sapUiCoreInteractionHandled = "true";
            }
            descScriptSrc.set.call(this, val);
        },
        get: descScriptSrc.get
    });
}
function registerXHROverrides() {
    XHRInterceptor.register(INTERACTION, "send", function () {
        if (this.pendingInteraction) {
            this.pendingInteraction.bytesSent += arguments[0] ? arguments[0].length : 0;
        }
    });
    XHRInterceptor.register(INTERACTION, "setRequestHeader", function (sHeader, sValue) {
        if (!this.requestHeaderLength) {
            this.requestHeaderLength = 0;
        }
        this.requestHeaderLength += (sHeader + "").length + (sValue + "").length;
    });
    XHRInterceptor.register(INTERACTION, "open", function () {
        var sEpp, sAction, sRootContextID;
        function handleInteraction(fnDone) {
            if (this.readyState === 4) {
                fnDone();
            }
        }
        if (oPendingInteraction) {
            if (!isCORSRequest(arguments[1])) {
                sEpp = Interaction.passportHeader.get(this);
                if (sEpp && sEpp.length >= 370) {
                    sAction = hexToAscii(sEpp.substring(150, 230));
                    if (parseInt(sEpp.substring(8, 10), 16) > 2) {
                        sRootContextID = sEpp.substring(372, 404);
                    }
                }
                if (!sEpp || sAction && sRootContextID && oPendingInteraction.passportAction.endsWith(sAction)) {
                    this.addEventListener("readystatechange", handleResponse.bind(this, oPendingInteraction.id));
                }
            }
            this.addEventListener("readystatechange", handleInteraction.bind(this, Interaction.notifyAsyncStep()));
            this.pendingInteraction = oPendingInteraction;
        }
    });
}
function checkCompression(sURL, sContentEncoding, sContentType, sContentLength) {
    var fileExtension = sURL.split(".").pop().split(/\#|\?/)[0];
    if (sContentEncoding === "gzip" || sContentEncoding === "br" || sContentType in mCompressedMimeTypes || (fileExtension && sCompressedExtensions.indexOf(fileExtension) !== -1) || sContentLength < 1024) {
        return true;
    }
    else {
        return false;
    }
}
function handleResponse(sId) {
    if (this.readyState === 4) {
        if (this.pendingInteraction && !this.pendingInteraction.completed && oPendingInteraction.id === sId) {
            var sContentLength = this.getResponseHeader("content-length"), bCompressed = checkCompression(this.responseURL, this.getResponseHeader("content-encoding"), this.getResponseHeader("content-type"), sContentLength), sFesrec = this.getResponseHeader("sap-perf-fesrec");
            this.pendingInteraction.bytesReceived += sContentLength ? parseInt(sContentLength) : 0;
            this.pendingInteraction.bytesReceived += this.getAllResponseHeaders().length;
            this.pendingInteraction.bytesSent += this.requestHeaderLength || 0;
            this.pendingInteraction.requestCompression = bCompressed && (this.pendingInteraction.requestCompression !== false);
            this.pendingInteraction.networkTime += sFesrec ? Math.round(parseFloat(sFesrec, 10) / 1000) : 0;
            var sSapStatistics = this.getResponseHeader("sap-statistics");
            if (sSapStatistics) {
                var aTimings = window.performance.getEntriesByType("resource");
                this.pendingInteraction.sapStatistics.push({
                    url: this.responseURL,
                    statistics: sSapStatistics,
                    timing: aTimings ? aTimings[aTimings.length - 1] : undefined
                });
            }
            delete this.requestHeaderLength;
            delete this.pendingInteraction;
        }
    }
}