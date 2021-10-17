import jQuery from "jquery.sap.global";
import Log from "sap/base/Log";
import uid from "sap/base/util/uid";
import escapeRegExp from "sap/base/strings/escapeRegExp";
(function (window) {
    var skipSuffix = "_skip", rIdRegex = /\|id-[0-9]+-[0-9]+/, skipRegex = new RegExp(skipSuffix + "[0-9]*$"), routes = [], hashHistory = [], mSkipHandler = {}, skipIndex = 0, currentHash, sIdSeperator = "|", aHashChangeBuffer = [], bInProcessing = false, defaultHandler, bInitialized = false;
    jQuery.sap.history = function (mSettings) {
        if (!jQuery.isPlainObject(mSettings)) {
            return;
        }
        if (!bInitialized) {
            var jWindowDom = jQuery(window), sHash = (window.location.href.split("#")[1] || "");
            jWindowDom.on("hashchange", detectHashChange);
            if (Array.isArray(mSettings.routes)) {
                var i, route;
                for (i = 0; i < mSettings.routes.length; i++) {
                    route = mSettings.routes[i];
                    if (route.path && route.handler) {
                        jQuery.sap.history.addRoute(route.path, route.handler);
                    }
                }
            }
            if (typeof mSettings.defaultHandler === "function") {
                defaultHandler = mSettings.defaultHandler;
            }
            hashHistory.push(sHash);
            if (sHash.length > 1) {
                jWindowDom.trigger("hashchange", [true]);
            }
            else {
                currentHash = sHash;
            }
            bInitialized = true;
        }
    };
    jQuery.sap.history.addHistory = function (sIdf, oStateData, bBookmarkable, bVirtual) {
        var sUid, sHash;
        if (bBookmarkable === undefined) {
            bBookmarkable = true;
        }
        if (!bVirtual) {
            sHash = preGenHash(sIdf, oStateData);
            sUid = getAppendId(sHash);
            if (sUid) {
                sHash += (sIdSeperator + sUid);
            }
            sHash += (sIdSeperator + (bBookmarkable ? "1" : "0"));
        }
        else {
            sHash = getNextSuffix(currentHash);
        }
        aHashChangeBuffer.push(sHash);
        mSkipHandler[sHash] = true;
        window.location.hash = sHash;
        return sHash;
    };
    jQuery.sap.history.addVirtualHistory = function () {
        jQuery.sap.history.addHistory("", undefined, false, true);
    };
    jQuery.sap.history.addRoute = function (sIdf, fn, oThis) {
        if (oThis) {
            fn = jQuery.proxy(fn, oThis);
        }
        var oRoute = {};
        oRoute.sIdentifier = sIdf;
        oRoute["action"] = fn;
        routes.push(oRoute);
        return this;
    };
    jQuery.sap.history.setDefaultHandler = function (fn) {
        defaultHandler = fn;
    };
    jQuery.sap.history.getDefaultHandler = function () {
        return defaultHandler;
    };
    jQuery.sap.history.backToHash = function (sHash) {
        sHash = sHash || "";
        var iSteps;
        if (hashHistory.length === 1) {
            if (typeof defaultHandler === "function") {
                defaultHandler();
            }
        }
        else {
            iSteps = calculateStepsToHash(currentHash, sHash);
            if (iSteps < 0) {
                window.history.go(iSteps);
            }
            else {
                Log.error("jQuery.sap.history.backToHash: " + sHash + "is not in the history stack or it's after the current hash");
            }
        }
    };
    jQuery.sap.history.backThroughPath = function (sPath) {
        sPath = sPath || "";
        sPath = window.encodeURIComponent(sPath);
        var iSteps;
        if (hashHistory.length === 1) {
            if (typeof defaultHandler === "function") {
                defaultHandler();
            }
        }
        else {
            iSteps = calculateStepsToHash(currentHash, sPath, true);
            if (iSteps < 0) {
                window.history.go(iSteps);
            }
            else {
                Log.error("jQuery.sap.history.backThroughPath: there's no history state which has the " + sPath + " identifier in the history stack before the current hash");
            }
        }
    };
    jQuery.sap.history.back = function (iSteps) {
        if (hashHistory.length === 1) {
            if (typeof defaultHandler === "function") {
                defaultHandler(jQuery.sap.history.NavType.Back);
            }
        }
        else {
            if (!iSteps) {
                iSteps = 1;
            }
            window.history.go(-1 * iSteps);
        }
    };
    jQuery.sap.history.NavType = {
        Back: "_back",
        Forward: "_forward",
        Bookmark: "_bookmark",
        Unknown: "_unknown"
    };
    function calculateStepsToHash(sCurrentHash, sToHash, bPrefix) {
        var iCurrentIndex = hashHistory.indexOf(sCurrentHash), iToIndex, i, tempHash;
        if (iCurrentIndex > 0) {
            if (bPrefix) {
                for (i = iCurrentIndex - 1; i >= 0; i--) {
                    tempHash = hashHistory[i];
                    if (tempHash.indexOf(sToHash) === 0 && !isVirtualHash(tempHash)) {
                        return i - iCurrentIndex;
                    }
                }
            }
            else {
                iToIndex = hashHistory.indexOf(sToHash);
                if ((iToIndex === -1) && sToHash.length === 0) {
                    return -1 * iCurrentIndex;
                }
                if ((iToIndex > -1) && (iToIndex < iCurrentIndex)) {
                    return iToIndex - iCurrentIndex;
                }
            }
        }
        return 0;
    }
    function detectHashChange(oEvent, bManual) {
        var sHash = (window.location.href.split("#")[1] || "");
        sHash = formatHash(sHash);
        if (bManual || !mSkipHandler[sHash]) {
            aHashChangeBuffer.push(sHash);
        }
        if (!bInProcessing) {
            bInProcessing = true;
            if (aHashChangeBuffer.length > 0) {
                var newHash = aHashChangeBuffer.shift();
                if (mSkipHandler[newHash]) {
                    reorganizeHistoryArray(newHash);
                    delete mSkipHandler[newHash];
                }
                else {
                    onHashChange(newHash);
                }
                currentHash = newHash;
            }
            bInProcessing = false;
        }
    }
    function formatHash(hash, bRemoveId) {
        var sRes = hash, iSharpIndex = hash ? hash.indexOf("#") : -1;
        if (iSharpIndex === 0) {
            sRes = sRes.slice(iSharpIndex + 1);
        }
        if (bRemoveId) {
            sRes = sRes.replace(rIdRegex, "");
        }
        return sRes;
    }
    function getNextSuffix(sHash) {
        var sPath = sHash ? sHash : "";
        if (isVirtualHash(sPath)) {
            var iIndex = sPath.lastIndexOf(skipSuffix);
            sPath = sPath.slice(0, iIndex);
        }
        return sPath + skipSuffix + skipIndex++;
    }
    function preGenHash(sIdf, oStateData) {
        var sEncodedIdf = encodeURIComponent(sIdf);
        var sEncodedData = encodeURIComponent(JSON.stringify(oStateData));
        return sEncodedIdf + sIdSeperator + sEncodedData;
    }
    function getAppendId(sHash) {
        var iIndex = hashHistory.indexOf(currentHash), i, sHistory;
        if (iIndex > -1) {
            for (i = 0; i < iIndex + 1; i++) {
                sHistory = hashHistory[i];
                if (sHistory.slice(0, sHistory.length - 2) === sHash) {
                    return uid();
                }
            }
        }
        return "";
    }
    function reorganizeHistoryArray(sHash) {
        var iIndex = hashHistory.indexOf(currentHash);
        if (!(iIndex === -1 || iIndex === hashHistory.length - 1)) {
            hashHistory.splice(iIndex + 1, hashHistory.length - 1 - iIndex);
        }
        hashHistory.push(sHash);
    }
    function isVirtualHash(sHash) {
        return skipRegex.test(sHash);
    }
    function calcStepsToRealHistory(sCurrentHash, bForward) {
        var iIndex = hashHistory.indexOf(sCurrentHash), i;
        if (iIndex !== -1) {
            if (bForward) {
                for (i = iIndex; i < hashHistory.length; i++) {
                    if (!isVirtualHash(hashHistory[i])) {
                        return i - iIndex;
                    }
                }
            }
            else {
                for (i = iIndex; i >= 0; i--) {
                    if (!isVirtualHash(hashHistory[i])) {
                        return i - iIndex;
                    }
                }
                return -1 * (iIndex + 1);
            }
        }
    }
    function onHashChange(sHash) {
        var oRoute, iStep, oParsedHash, iNewHashIndex, sNavType;
        if (currentHash === undefined) {
            oParsedHash = parseHashToObject(sHash);
            if (!oParsedHash || !oParsedHash.bBookmarkable) {
                if (typeof defaultHandler === "function") {
                    defaultHandler(jQuery.sap.history.NavType.Bookmark);
                }
                return;
            }
        }
        if (sHash.length === 0) {
            if (typeof defaultHandler === "function") {
                defaultHandler(jQuery.sap.history.NavType.Back);
            }
        }
        else {
            iNewHashIndex = hashHistory.indexOf(sHash);
            if (iNewHashIndex === 0) {
                oParsedHash = parseHashToObject(sHash);
                if (!oParsedHash || !oParsedHash.bBookmarkable) {
                    if (typeof defaultHandler === "function") {
                        defaultHandler(jQuery.sap.history.NavType.Back);
                    }
                    return;
                }
            }
            if (isVirtualHash(sHash)) {
                if (isVirtualHash(currentHash)) {
                    iStep = calcStepsToRealHistory(sHash, false);
                    window.history.go(iStep);
                }
                else {
                    var sameFamilyRegex = new RegExp(escapeRegExp(currentHash + skipSuffix) + "[0-9]*$");
                    if (sameFamilyRegex.test(sHash)) {
                        iStep = calcStepsToRealHistory(sHash, true);
                        if (iStep) {
                            window.history.go(iStep);
                        }
                        else {
                            window.history.back();
                        }
                    }
                    else {
                        iStep = calcStepsToRealHistory(sHash, false);
                        window.history.go(iStep);
                    }
                }
            }
            else {
                if (iNewHashIndex === -1) {
                    sNavType = jQuery.sap.history.NavType.Unknown;
                    hashHistory.push(sHash);
                }
                else {
                    if (hashHistory.indexOf(currentHash, iNewHashIndex + 1) === -1) {
                        sNavType = jQuery.sap.history.NavType.Forward;
                    }
                    else {
                        sNavType = jQuery.sap.history.NavType.Back;
                    }
                }
                oParsedHash = parseHashToObject(sHash);
                if (oParsedHash) {
                    oRoute = findRouteByIdentifier(oParsedHash.sIdentifier);
                    if (oRoute) {
                        oRoute.action.apply(null, [oParsedHash.oStateData, sNavType]);
                    }
                }
                else {
                    Log.error("hash format error! The current Hash: " + sHash);
                }
            }
        }
    }
    function findRouteByIdentifier(sIdf) {
        var i;
        for (i = 0; i < routes.length; i++) {
            if (routes[i].sIdentifier === sIdf) {
                return routes[i];
            }
        }
    }
    function parseHashToObject(sHash) {
        if (isVirtualHash(sHash)) {
            var i = sHash.lastIndexOf(skipSuffix);
            sHash = sHash.slice(0, i);
        }
        var aParts = sHash.split(sIdSeperator), oReturn = {};
        if (aParts.length === 4 || aParts.length === 3) {
            oReturn.sIdentifier = window.decodeURIComponent(aParts[0]);
            oReturn.oStateData = JSON.parse(window.decodeURIComponent(aParts[1]));
            if (aParts.length === 4) {
                oReturn.uid = aParts[2];
            }
            oReturn.bBookmarkable = aParts[aParts.length - 1] === "0" ? false : true;
            return oReturn;
        }
        else {
            return null;
        }
    }
})(this);