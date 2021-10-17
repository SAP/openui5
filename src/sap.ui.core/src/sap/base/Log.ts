import now from "sap/base/util/now";
export class Log {
    static Level = {
        NONE: -1,
        FATAL: 0,
        ERROR: 1,
        WARNING: 2,
        INFO: 3,
        DEBUG: 4,
        TRACE: 5,
        ALL: (5 + 1)
    };
    static fatal(sMessage: any, sDetails: any, sComponent: any, fnSupportInfo: any) {
        log(Log.Level.FATAL, sMessage, sDetails, sComponent, fnSupportInfo);
    }
    static error(sMessage: any, sDetails: any, sComponent: any, fnSupportInfo: any) {
        log(Log.Level.ERROR, sMessage, sDetails, sComponent, fnSupportInfo);
    }
    static warning(sMessage: any, sDetails: any, sComponent: any, fnSupportInfo: any) {
        log(Log.Level.WARNING, sMessage, sDetails, sComponent, fnSupportInfo);
    }
    static info(sMessage: any, sDetails: any, sComponent: any, fnSupportInfo: any) {
        log(Log.Level.INFO, sMessage, sDetails, sComponent, fnSupportInfo);
    }
    static debug(sMessage: any, sDetails: any, sComponent: any, fnSupportInfo: any) {
        log(Log.Level.DEBUG, sMessage, sDetails, sComponent, fnSupportInfo);
    }
    static trace(sMessage: any, sDetails: any, sComponent: any, fnSupportInfo: any) {
        log(Log.Level.TRACE, sMessage, sDetails, sComponent, fnSupportInfo);
    }
    static setLevel(iLogLevel: any, sComponent: any, _bDefault: any) {
        sComponent = sComponent || sDefaultComponent || "";
        if (!_bDefault || mMaxLevel[sComponent] == null) {
            mMaxLevel[sComponent] = iLogLevel;
            var sLogLevel;
            Object.keys(Log.Level).forEach(function (sLevel) {
                if (Log.Level[sLevel] === iLogLevel) {
                    sLogLevel = sLevel;
                }
            });
            log(Log.Level.INFO, "Changing log level " + (sComponent ? "for '" + sComponent + "' " : "") + "to " + sLogLevel, "", "sap.base.log");
        }
    }
    static getLevel(sComponent: any) {
        return level(sComponent || sDefaultComponent);
    }
    static isLoggable(iLevel: any, sComponent: any) {
        return (iLevel == null ? Log.Level.DEBUG : iLevel) <= level(sComponent || sDefaultComponent);
    }
    static logSupportInfo(bEnabled: any) {
        bLogSupportInfo = bEnabled;
    }
    static getLogEntries(...args: any) {
        return aLog.slice();
    }
    static getLogEntriesLimit(...args: any) {
        return iLogEntriesLimit;
    }
    static setLogEntriesLimit(iLimit: any) {
        if (iLimit < 0) {
            throw new Error("The log entries limit needs to be greater than or equal to 0!");
        }
        iLogEntriesLimit = iLimit;
        if (aLog.length >= iLogEntriesLimit) {
            discardLogEntries();
        }
    }
    static addLogListener(oListener: any) {
        getLogEntryListenerInstance().attach(this, oListener);
    }
    static removeLogListener(oListener: any) {
        getLogEntryListenerInstance().detach(this, oListener);
    }
    static getLogger(sComponent: any, iDefaultLogLevel: any) {
        if (!isNaN(iDefaultLogLevel) && mMaxLevel[sComponent] == null) {
            mMaxLevel[sComponent] = iDefaultLogLevel;
        }
        return new Logger(sComponent);
    }
}
var sDefaultComponent, aLog = [], mMaxLevel = { "": Log.Level.ERROR }, iLogEntriesLimit = 3000, oListener = null, bLogSupportInfo = false;
function pad0(i, w) {
    return ("000" + String(i)).slice(-w);
}
function level(sComponent) {
    return (!sComponent || isNaN(mMaxLevel[sComponent])) ? mMaxLevel[""] : mMaxLevel[sComponent];
}
function discardLogEntries() {
    var iLogLength = aLog.length;
    if (iLogLength) {
        var iEntriesToKeep = Math.min(iLogLength, Math.floor(iLogEntriesLimit * 0.7));
        if (oListener) {
            oListener.onDiscardLogEntries(aLog.slice(0, iLogLength - iEntriesToKeep));
        }
        if (iEntriesToKeep) {
            aLog = aLog.slice(-iEntriesToKeep, iLogLength);
        }
        else {
            aLog = [];
        }
    }
}
function getLogEntryListenerInstance() {
    if (!oListener) {
        oListener = {
            listeners: [],
            onLogEntry: function (oLogEntry) {
                for (var i = 0; i < oListener.listeners.length; i++) {
                    if (oListener.listeners[i].onLogEntry) {
                        oListener.listeners[i].onLogEntry(oLogEntry);
                    }
                }
            },
            onDiscardLogEntries: function (aDiscardedLogEntries) {
                for (var i = 0; i < oListener.listeners.length; i++) {
                    if (oListener.listeners[i].onDiscardLogEntries) {
                        oListener.listeners[i].onDiscardLogEntries(aDiscardedLogEntries);
                    }
                }
            },
            attach: function (oLog, oLstnr) {
                if (oLstnr) {
                    oListener.listeners.push(oLstnr);
                    if (oLstnr.onAttachToLog) {
                        oLstnr.onAttachToLog(oLog);
                    }
                }
            },
            detach: function (oLog, oLstnr) {
                for (var i = 0; i < oListener.listeners.length; i++) {
                    if (oListener.listeners[i] === oLstnr) {
                        if (oLstnr.onDetachFromLog) {
                            oLstnr.onDetachFromLog(oLog);
                        }
                        oListener.listeners.splice(i, 1);
                        return;
                    }
                }
            }
        };
    }
    return oListener;
}
function log(iLevel, sMessage, sDetails, sComponent, fnSupportInfo) {
    if (!fnSupportInfo && !sComponent && typeof sDetails === "function") {
        fnSupportInfo = sDetails;
        sDetails = "";
    }
    if (!fnSupportInfo && typeof sComponent === "function") {
        fnSupportInfo = sComponent;
        sComponent = "";
    }
    sComponent = sComponent || sDefaultComponent;
    if (iLevel <= level(sComponent)) {
        var fNow = now(), oNow = new Date(fNow), iMicroSeconds = Math.floor((fNow - Math.floor(fNow)) * 1000), oLogEntry = {
            time: pad0(oNow.getHours(), 2) + ":" + pad0(oNow.getMinutes(), 2) + ":" + pad0(oNow.getSeconds(), 2) + "." + pad0(oNow.getMilliseconds(), 3) + pad0(iMicroSeconds, 3),
            date: pad0(oNow.getFullYear(), 4) + "-" + pad0(oNow.getMonth() + 1, 2) + "-" + pad0(oNow.getDate(), 2),
            timestamp: fNow,
            level: iLevel,
            message: String(sMessage || ""),
            details: String(sDetails || ""),
            component: String(sComponent || "")
        };
        if (bLogSupportInfo && typeof fnSupportInfo === "function") {
            oLogEntry.supportInfo = fnSupportInfo();
        }
        if (iLogEntriesLimit) {
            if (aLog.length >= iLogEntriesLimit) {
                discardLogEntries();
            }
            aLog.push(oLogEntry);
        }
        if (oListener) {
            oListener.onLogEntry(oLogEntry);
        }
        if (console) {
            var isDetailsError = sDetails instanceof Error, logText = oLogEntry.date + " " + oLogEntry.time + " " + oLogEntry.message + " - " + oLogEntry.details + " " + oLogEntry.component;
            switch (iLevel) {
                case Log.Level.FATAL:
                case Log.Level.ERROR:
                    isDetailsError ? console.error(logText, "\n", sDetails) : console.error(logText);
                    break;
                case Log.Level.WARNING:
                    isDetailsError ? console.warn(logText, "\n", sDetails) : console.warn(logText);
                    break;
                case Log.Level.INFO:
                    if (console.info) {
                        isDetailsError ? console.info(logText, "\n", sDetails) : console.info(logText);
                    }
                    else {
                        isDetailsError ? console.log(logText, "\n", sDetails) : console.log(logText);
                    }
                    break;
                case Log.Level.DEBUG:
                    isDetailsError ? console.debug(logText, "\n", sDetails) : console.debug(logText);
                    break;
                case Log.Level.TRACE:
                    isDetailsError ? console.trace(logText, "\n", sDetails) : console.trace(logText);
                    break;
            }
            if (console.info && oLogEntry.supportInfo) {
                console.info(oLogEntry.supportInfo);
            }
        }
        return oLogEntry;
    }
}
function Logger(sComponent) {
    this.fatal = function (msg, detail, comp, support) { Log.fatal(msg, detail, comp || sComponent, support); return this; };
    this.error = function (msg, detail, comp, support) { Log.error(msg, detail, comp || sComponent, support); return this; };
    this.warning = function (msg, detail, comp, support) { Log.warning(msg, detail, comp || sComponent, support); return this; };
    this.info = function (msg, detail, comp, support) { Log.info(msg, detail, comp || sComponent, support); return this; };
    this.debug = function (msg, detail, comp, support) { Log.debug(msg, detail, comp || sComponent, support); return this; };
    this.trace = function (msg, detail, comp, support) { Log.trace(msg, detail, comp || sComponent, support); return this; };
    this.setLevel = function (level, comp) { Log.setLevel(level, comp || sComponent); return this; };
    this.getLevel = function (comp) { return Log.getLevel(comp || sComponent); };
    this.isLoggable = function (level, comp) { return Log.isLoggable(level, comp || sComponent); };
}