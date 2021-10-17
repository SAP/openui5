import URI from "sap/ui/thirdparty/URI";
import Device from "sap/ui/Device";
import Passport from "sap/ui/performance/trace/Passport";
import Interaction from "sap/ui/performance/trace/Interaction";
import XHRInterceptor from "sap/ui/performance/XHRInterceptor";
import BeaconRequest from "sap/ui/performance/BeaconRequest";
import Version from "sap/base/util/Version";
export class FESR {
    static getBeaconURL(...args: any) {
        return sBeaconURL;
    }
    static setActive(bActive: any, sUrl: any) {
        if (bActive && !bFesrActive) {
            oBeaconRequest = sUrl ? BeaconRequest.isSupported() && new BeaconRequest({ url: sUrl }) : null;
            sBeaconURL = sUrl;
            bFesrActive = true;
            Passport.setActive(true);
            Interaction.setActive(true);
            XHRInterceptor.register("PASSPORT_HEADER", "open", passportHeaderOverride);
            if (!oBeaconRequest) {
                XHRInterceptor.register("FESR", "open", fesrHeaderOverride);
            }
            Interaction.onInteractionStarted = onInteractionStarted;
            Interaction.onInteractionFinished = onInteractionFinished;
            Interaction.passportHeader = wmPassportHeader;
        }
        else if (!bActive && bFesrActive) {
            bFesrActive = false;
            Interaction.setActive(false);
            XHRInterceptor.unregister("FESR", "open");
            if (XHRInterceptor.isRegistered("PASSPORT_HEADER", "open")) {
                XHRInterceptor.register("PASSPORT_HEADER", "open", function () {
                    this.setRequestHeader("SAP-PASSPORT", Passport.header(Passport.traceFlags(), ROOT_ID, Passport.getTransactionId()));
                });
            }
            if (oBeaconRequest) {
                oBeaconRequest.send();
                clearTimeout(iBeaconTimeoutID);
                iBeaconTimeoutID = null;
                oBeaconRequest = null;
                sBeaconURL = null;
            }
            Interaction.onInteractionFinished = null;
            Interaction.onInteractionStarted = null;
        }
    }
    static getActive(...args: any) {
        return bFesrActive;
    }
    static onBeforeCreated(oFESRHandle: any, oInteraction: any) {
        return {
            stepName: oFESRHandle.stepName,
            appNameLong: oFESRHandle.appNameLong,
            appNameShort: oFESRHandle.appNameShort,
            timeToInteractive: oFESRHandle.timeToInteractive,
            interactionType: oFESRHandle.interactionType
        };
    }
}
var bFesrActive = false, sBeaconURL, oBeaconRequest, iBeaconTimeoutID, ROOT_ID = Passport.getRootId(), HOST = window.location.host, CLIENT_OS = Device.os.name + "_" + Device.os.version, CLIENT_MODEL = Device.browser.name + "_" + Device.browser.version, CLIENT_DEVICE = setClientDevice(), sAppVersion = "", sAppVersionFull = "", sFESRTransactionId, iStepCounter = 0, sPassportComponentInfo = "undetermined", sPassportAction = "undetermined_startup_0", sFESR, sFESRopt, wmPassportHeader = new WeakMap();
function setClientDevice() {
    var iClientId = 0;
    if (Device.system.combi) {
        iClientId = 1;
    }
    else if (Device.system.desktop) {
        iClientId = 2;
    }
    else if (Device.system.tablet) {
        iClientId = 4;
    }
    else if (Device.system.phone) {
        iClientId = 3;
    }
    return iClientId;
}
function formatInteractionStartTimestamp(iTimeStamp) {
    var oDate = new Date(iTimeStamp);
    return oDate.toISOString().replace(/[^\d]/g, "");
}
function isCORSRequest(sUrl) {
    var sHost = new URI(sUrl).host();
    return sHost && sHost !== HOST;
}
function passportHeaderOverride() {
    if (!isCORSRequest(arguments[1])) {
        if (!sFESRTransactionId) {
            sFESRTransactionId = Passport.getTransactionId();
        }
        var sPassportHeader = Passport.header(Passport.traceFlags(), ROOT_ID, Passport.getTransactionId(), sPassportComponentInfo, sPassportAction);
        this.setRequestHeader("SAP-PASSPORT", sPassportHeader);
        wmPassportHeader.set(this, sPassportHeader);
    }
}
function fesrHeaderOverride() {
    if (!isCORSRequest(arguments[1])) {
        if (sFESR && sFESRopt) {
            this.setRequestHeader("SAP-Perf-FESRec", sFESR);
            this.setRequestHeader("SAP-Perf-FESRec-opt", sFESRopt);
            sFESR = null;
            sFESRopt = null;
            sFESRTransactionId = Passport.getTransactionId();
        }
    }
}
function createFESR(oInteraction, oFESRHandle) {
    return [
        format(ROOT_ID, 32),
        format(sFESRTransactionId, 32),
        formatInt(oInteraction.navigation, 4),
        formatInt(oInteraction.roundtrip, 4),
        formatInt(oFESRHandle.timeToInteractive, 4),
        formatInt(oInteraction.completeRoundtrips, 2),
        format(sPassportAction, 40, true),
        formatInt(oInteraction.networkTime, 4),
        formatInt(oInteraction.requestTime, 4),
        format(CLIENT_OS, 10),
        "SAP_UI5"
    ].join(",");
}
function createFESRopt(oInteraction, oFESRHandle) {
    return [
        format(oFESRHandle.appNameShort, 20, true),
        format(oFESRHandle.stepName, 20, true),
        "",
        format(CLIENT_MODEL, 20),
        formatInt(oInteraction.bytesSent, 4),
        formatInt(oInteraction.bytesReceived, 4),
        "",
        "",
        formatInt(oInteraction.processing, 4),
        oInteraction.requestCompression ? "X" : "",
        "",
        "",
        "",
        "",
        formatInt(oInteraction.busyDuration, 4),
        formatInt(oFESRHandle.interactionType || 0, 4),
        format(CLIENT_DEVICE, 1),
        "",
        format(formatInteractionStartTimestamp(oInteraction.start), 20),
        format(oFESRHandle.appNameLong, 70, true)
    ].join(",");
}
function format(vField, iLength, bCutFromFront) {
    if (!vField) {
        vField = vField === 0 ? "0" : "";
    }
    else if (typeof vField === "number") {
        var iField = vField;
        vField = Math.round(vField).toString();
        if (vField.length > iLength || iField < 0) {
            vField = "-1";
        }
    }
    else {
        vField = bCutFromFront ? vField.substr(-iLength, iLength) : vField.substr(0, iLength);
    }
    return vField;
}
function formatInt(number, bytes) {
    if (typeof number !== "number") {
        number = "";
    }
    else {
        var max = Math.pow(256, bytes) / 2 - 1;
        number = Math.round(number);
        number = number >= 0 && number <= max ? number.toString() : "-1";
    }
    return number;
}
function formatVersion(sVersion) {
    var oVersion = new Version(sVersion);
    return "@" + oVersion.getMajor() + "." + oVersion.getMinor() + "." + oVersion.getPatch();
}
function createHeader(oFinishedInteraction, oFESRHandle) {
    sFESR = createFESR(oFinishedInteraction, oFESRHandle);
    sFESRopt = createFESRopt(oFinishedInteraction, oFESRHandle);
}
function onInteractionStarted(oInteraction) {
    iStepCounter++;
    sPassportComponentInfo = oInteraction ? oInteraction.component + sAppVersion : undefined;
    sPassportAction = oInteraction ? oInteraction.trigger + "_" + oInteraction.event + "_" + iStepCounter : undefined;
    return sPassportAction;
}
function onInteractionFinished(oFinishedInteraction) {
    var sStepName = oFinishedInteraction.trigger + "_" + oFinishedInteraction.event;
    var oFESRHandle = FESR.onBeforeCreated({
        stepName: sStepName,
        appNameLong: oFinishedInteraction.stepComponent || oFinishedInteraction.component,
        appNameShort: oFinishedInteraction.stepComponent || oFinishedInteraction.component,
        timeToInteractive: oFinishedInteraction.duration,
        interactionType: determineInteractionType(sStepName)
    }, oFinishedInteraction);
    if (oBeaconRequest || oFinishedInteraction.requests.length > 0) {
        createHeader(oFinishedInteraction, oFESRHandle);
        if (oBeaconRequest) {
            sFESRTransactionId = null;
        }
    }
    if (oBeaconRequest && sFESR && sFESRopt) {
        oBeaconRequest.append("SAP-Perf-FESRec", sFESR + "SAP-Perf-FESRec-opt" + sFESRopt);
        sendBeaconRequest();
    }
    if (sAppVersionFull != oFinishedInteraction.appVersion) {
        sAppVersionFull = oFinishedInteraction.appVersion;
        sAppVersion = sAppVersionFull ? formatVersion(sAppVersionFull) : "";
    }
    sPassportAction = "undefined";
}
function sendBeaconRequest() {
    if (!iBeaconTimeoutID) {
        iBeaconTimeoutID = setTimeout(function () {
            oBeaconRequest.send();
            clearTimeout(iBeaconTimeoutID);
            iBeaconTimeoutID = undefined;
        }, 60000);
    }
}
function determineInteractionType(sStepName) {
    var interactionType = 2;
    if (sStepName.indexOf("startup") !== -1) {
        interactionType = 1;
    }
    return interactionType;
}