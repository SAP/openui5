import Log from "sap/base/Log";
import URI from "sap/ui/thirdparty/URI";
import now from "sap/base/util/now";
var URI = window.URI;
function PerfMeasurement() {
    function Measurement(sId, sInfo, iStart, iEnd, aCategories) {
        this.id = sId;
        this.info = sInfo;
        this.start = iStart;
        this.end = iEnd;
        this.pause = 0;
        this.resume = 0;
        this.duration = 0;
        this.time = 0;
        this.categories = aCategories;
        this.average = false;
        this.count = 0;
        this.completeDuration = 0;
    }
    function matchCategories(aCategories) {
        if (!aRestrictedCategories) {
            return true;
        }
        if (!aCategories) {
            return aRestrictedCategories === null;
        }
        for (var i = 0; i < aRestrictedCategories.length; i++) {
            if (aCategories.indexOf(aRestrictedCategories[i]) > -1) {
                return true;
            }
        }
        return false;
    }
    function checkCategories(aCategories) {
        if (!aCategories) {
            aCategories = ["javascript"];
        }
        aCategories = typeof aCategories === "string" ? aCategories.split(",") : aCategories;
        if (!matchCategories(aCategories)) {
            return null;
        }
        return aCategories;
    }
    function hasCategory(oMeasurement, aCategories) {
        for (var i = 0; i < aCategories.length; i++) {
            if (oMeasurement.categories.indexOf(aCategories[i]) > -1) {
                return true;
            }
        }
        return aCategories.length === 0;
    }
    var bActive = false, fnXHR = XMLHttpRequest, aRestrictedCategories = null, aAverageMethods = [], aOriginalMethods = [], mMethods = {}, mMeasurements = {};
    this.getActive = function () {
        return bActive;
    };
    this.setActive = function (bOn, aCategories) {
        var fnEnd, fnStart;
        if (!aCategories) {
            aCategories = null;
        }
        else if (typeof aCategories === "string") {
            aCategories = aCategories.split(",");
        }
        aRestrictedCategories = aCategories;
        if (bActive === bOn) {
            return;
        }
        bActive = bOn;
        if (bActive) {
            for (var sName in mMethods) {
                this[sName] = mMethods[sName].bind(this);
            }
            mMethods = {};
            fnEnd = this.end;
            fnStart = this.start;
            XMLHttpRequest = function () {
                var oXHR = new fnXHR(), fnOpen = oXHR.open, sMeasureId;
                oXHR.open = function () {
                    sMeasureId = new URI(arguments[1], new URI(document.baseURI).search("")).href();
                    fnStart(sMeasureId, "Request for " + sMeasureId, "xmlhttprequest");
                    oXHR.addEventListener("loadend", fnEnd.bind(null, sMeasureId));
                    fnOpen.apply(this, arguments);
                };
                return oXHR;
            };
        }
        else {
            XMLHttpRequest = fnXHR;
        }
        return bActive;
    };
    mMethods["start"] = function (sId, sInfo, aCategories) {
        if (!bActive) {
            return;
        }
        aCategories = checkCategories(aCategories);
        if (!aCategories) {
            return;
        }
        var iTime = now(), oMeasurement = new Measurement(sId, sInfo, iTime, 0, aCategories);
        if (Log.getLevel("sap.ui.Performance") >= 4 && window.console && console.time) {
            console.time(sInfo + " - " + sId);
        }
        Log.info("Performance measurement start: " + sId + " on " + iTime);
        if (oMeasurement) {
            mMeasurements[sId] = oMeasurement;
            return this.getMeasurement(oMeasurement.id);
        }
        else {
            return false;
        }
    };
    mMethods["pause"] = function (sId) {
        if (!bActive) {
            return;
        }
        var iTime = now();
        var oMeasurement = mMeasurements[sId];
        if (oMeasurement && oMeasurement.end > 0) {
            return false;
        }
        if (oMeasurement && oMeasurement.pause == 0) {
            oMeasurement.pause = iTime;
            if (oMeasurement.pause >= oMeasurement.resume && oMeasurement.resume > 0) {
                oMeasurement.duration = oMeasurement.duration + oMeasurement.pause - oMeasurement.resume;
                oMeasurement.resume = 0;
            }
            else if (oMeasurement.pause >= oMeasurement.start) {
                oMeasurement.duration = oMeasurement.pause - oMeasurement.start;
            }
        }
        if (oMeasurement) {
            Log.info("Performance measurement pause: " + sId + " on " + iTime + " duration: " + oMeasurement.duration);
            return this.getMeasurement(oMeasurement.id);
        }
        else {
            return false;
        }
    };
    mMethods["resume"] = function (sId) {
        if (!bActive) {
            return;
        }
        var iTime = now();
        var oMeasurement = mMeasurements[sId];
        if (oMeasurement && oMeasurement.pause > 0) {
            oMeasurement.pause = 0;
            oMeasurement.resume = iTime;
        }
        if (oMeasurement) {
            Log.info("Performance measurement resume: " + sId + " on " + iTime + " duration: " + oMeasurement.duration);
            return this.getMeasurement(oMeasurement.id);
        }
        else {
            return false;
        }
    };
    mMethods["end"] = function (sId) {
        if (!bActive) {
            return;
        }
        var iTime = now();
        var oMeasurement = mMeasurements[sId];
        if (oMeasurement && !oMeasurement.end) {
            Log.info("Performance measurement end: " + sId + " on " + iTime);
            oMeasurement.end = iTime;
            if (oMeasurement.end >= oMeasurement.resume && oMeasurement.resume > 0) {
                oMeasurement.duration = oMeasurement.duration + oMeasurement.end - oMeasurement.resume;
                oMeasurement.resume = 0;
            }
            else if (oMeasurement.pause > 0) {
                oMeasurement.pause = 0;
            }
            else if (oMeasurement.end >= oMeasurement.start) {
                if (oMeasurement.average) {
                    oMeasurement.completeDuration += (oMeasurement.end - oMeasurement.start);
                    oMeasurement.count++;
                    oMeasurement.duration = oMeasurement.completeDuration / oMeasurement.count;
                    oMeasurement.start = iTime;
                }
                else {
                    oMeasurement.duration = oMeasurement.end - oMeasurement.start;
                }
            }
            if (oMeasurement.end >= oMeasurement.start) {
                oMeasurement.time = oMeasurement.end - oMeasurement.start;
            }
        }
        if (oMeasurement) {
            if (Log.getLevel("sap.ui.Performance") >= 4 && window.console && console.timeEnd) {
                console.timeEnd(oMeasurement.info + " - " + sId);
            }
            return this.getMeasurement(sId);
        }
        else {
            return false;
        }
    };
    mMethods["clear"] = function () {
        mMeasurements = {};
    };
    mMethods["remove"] = function (sId) {
        delete mMeasurements[sId];
    };
    mMethods["add"] = function (sId, sInfo, iStart, iEnd, iTime, iDuration, aCategories) {
        if (!bActive) {
            return;
        }
        aCategories = checkCategories(aCategories);
        if (!aCategories) {
            return false;
        }
        var oMeasurement = new Measurement(sId, sInfo, iStart, iEnd, aCategories);
        oMeasurement.time = iTime;
        oMeasurement.duration = iDuration;
        if (oMeasurement) {
            mMeasurements[sId] = oMeasurement;
            return this.getMeasurement(oMeasurement.id);
        }
        else {
            return false;
        }
    };
    mMethods["average"] = function (sId, sInfo, aCategories) {
        if (!bActive) {
            return;
        }
        aCategories = checkCategories(aCategories);
        if (!aCategories) {
            return;
        }
        var oMeasurement = mMeasurements[sId], iTime = now();
        if (!oMeasurement || !oMeasurement.average) {
            this.start(sId, sInfo, aCategories);
            oMeasurement = mMeasurements[sId];
            oMeasurement.average = true;
        }
        else {
            if (!oMeasurement.end) {
                oMeasurement.completeDuration += (iTime - oMeasurement.start);
                oMeasurement.count++;
            }
            oMeasurement.start = iTime;
            oMeasurement.end = 0;
        }
        return this.getMeasurement(oMeasurement.id);
    };
    this.getMeasurement = function (sId) {
        var oMeasurement = mMeasurements[sId];
        if (oMeasurement) {
            var oCopy = {};
            for (var sProp in oMeasurement) {
                oCopy[sProp] = oMeasurement[sProp];
            }
            return oCopy;
        }
        else {
            return false;
        }
    };
    this.getAllMeasurements = function (bCompleted) {
        return this.filterMeasurements(function (oMeasurement) {
            return oMeasurement;
        }, bCompleted);
    };
    this.filterMeasurements = function () {
        var oMeasurement, bValid, i = 0, aMeasurements = [], fnFilter = typeof arguments[i] === "function" ? arguments[i++] : undefined, bCompleted = typeof arguments[i] === "boolean" ? arguments[i++] : undefined, aCategories = Array.isArray(arguments[i]) ? arguments[i] : [];
        for (var sId in mMeasurements) {
            oMeasurement = this.getMeasurement(sId);
            bValid = (bCompleted === false && oMeasurement.end === 0) || (bCompleted !== false && (!bCompleted || oMeasurement.end));
            if (bValid && hasCategory(oMeasurement, aCategories) && (!fnFilter || fnFilter(oMeasurement))) {
                aMeasurements.push(oMeasurement);
            }
        }
        return aMeasurements;
    };
    this.registerMethod = function (sId, oObject, sMethod, aCategories) {
        var fnMethod = oObject[sMethod];
        if (fnMethod && typeof fnMethod === "function") {
            var bFound = aAverageMethods.indexOf(fnMethod) > -1;
            if (!bFound) {
                aOriginalMethods.push({ func: fnMethod, obj: oObject, method: sMethod, id: sId });
                var that = this;
                oObject[sMethod] = function () {
                    that.average(sId, sId + " method average", aCategories);
                    var result = fnMethod.apply(this, arguments);
                    that.end(sId);
                    return result;
                };
                aAverageMethods.push(oObject[sMethod]);
                return true;
            }
        }
        else {
            Log.debug(sMethod + " in not a function. Measurement.register failed");
        }
        return false;
    };
    this.unregisterMethod = function (sId, oObject, sMethod) {
        var fnFunction = oObject[sMethod], iIndex = aAverageMethods.indexOf(fnFunction);
        if (fnFunction && iIndex > -1) {
            oObject[sMethod] = aOriginalMethods[iIndex].func;
            aAverageMethods.splice(iIndex, 1);
            aOriginalMethods.splice(iIndex, 1);
            return true;
        }
        return false;
    };
    this.unregisterAllMethods = function () {
        while (aOriginalMethods.length > 0) {
            var oOrig = aOriginalMethods[0];
            this.unregisterMethod(oOrig.id, oOrig.obj, oOrig.method);
        }
    };
    var aMatch = location.search.match(/sap-ui-measure=([^\&]*)/);
    if (aMatch && aMatch[1]) {
        if (aMatch[1] === "true" || aMatch[1] === "x" || aMatch[1] === "X") {
            this.setActive(true);
        }
        else {
            this.setActive(true, aMatch[1]);
        }
    }
    else {
        var fnInactive = function () {
            return null;
        };
        for (var sName in mMethods) {
            this[sName] = fnInactive;
        }
    }
}