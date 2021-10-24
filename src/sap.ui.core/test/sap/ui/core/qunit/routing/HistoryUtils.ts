import Device from "sap/ui/Device";
import History from "sap/ui/core/routing/History";
import Log from "sap/base/Log";
export class HistoryUtils {
    static init(...args: any) {
        if (HistoryUtils._isOriginalReplaceStateFunctionActive() && History._bUsePushState) {
            window.history.replaceState = function () {
                fnSetCounter(fnGetCounter().value + 1);
                return fnOriginalReplaceState.apply(window.history, arguments);
            };
            window.history.pushState = function () {
                fnSetCounter(fnGetCounter().value + 1);
                return fnOriginalPushState.apply(window.history, arguments);
            };
        }
    }
    static check(vTolerance: any) {
        if (!History._bUsePushState) {
            return Promise.resolve();
        }
        var iTolerance = parseInt(vTolerance) || 50;
        return HistoryUtils._waitForHistoryAPIReset(iTolerance);
    }
    static exit(...args: any) {
        if (History._bUsePushState) {
            HistoryUtils._resetCounterAfterTimeOut().then(function () {
                if (!HistoryUtils._isOriginalReplaceStateFunctionActive() && History._bUsePushState) {
                    window.history.replaceState = fnOriginalReplaceState;
                    window.history.pushState = fnOriginalPushState;
                }
            });
        }
    }
    private static _waitForHistoryAPIReset(iTolerance: any) {
        var iPushStateRateLimit = mPushStateRateLimit[Device.browser.name].limit;
        var iTimeOut = mPushStateRateLimit[Device.browser.name].timeout;
        return new Promise(function (resolve) {
            if (fnGetCounter().value < (iPushStateRateLimit - iTolerance)) {
                resolve();
            }
            else {
                setTimeout(function () {
                    fnSetCounter(0);
                    resolve();
                }, iTimeOut);
            }
        });
    }
    private static _resetCounterAfterTimeOut(...args: any) {
        var iTimeOut = mPushStateRateLimit[Device.browser.name].timeout;
        return new Promise(function (resolve) {
            setTimeout(function () {
                if (fnGetCounter().timestamp + iTimeOut <= Date.now() && fnGetCounter().value > 0) {
                    fnSetCounter(0);
                    resolve();
                }
                resolve();
            }, iTimeOut + 300);
        });
    }
    private static _isOriginalReplaceStateFunctionActive(...args: any) {
        return window.history.replaceState === fnOriginalReplaceState;
    }
}
var mPushStateRateLimit = {};
mPushStateRateLimit[Device.browser.BROWSER.SAFARI] = {
    timeout: 30000,
    limit: 100
};
mPushStateRateLimit[Device.browser.BROWSER.FIREFOX] = {
    timeout: 10000,
    limit: 120
};
mPushStateRateLimit[Device.browser.BROWSER.CHROME] = {
    timeout: 10000,
    limit: 140
};
var Counter = function (iValue, iTimestamp) {
    return {
        value: parseInt(iValue) || 0,
        timestamp: parseInt(iTimestamp) || Date.now()
    };
};
var fnGetCounter = function () {
    try {
        return new Counter(sessionStorage.getItem("iReplaceStateCounter"), sessionStorage.getItem("iReplaceStateCounterTimestamp"));
    }
    catch (e) {
        return new Counter();
    }
};
var fnSetCounter = function (iReplaceStateCounter) {
    try {
        sessionStorage.setItem("iReplaceStateCounter", iReplaceStateCounter);
        sessionStorage.setItem("iReplaceStateCounterTimestamp", Date.now());
    }
    catch (e) {
        Log.info("SessionStorage not supported.");
    }
};
var fnOriginalReplaceState = window.history.replaceState;
var fnOriginalPushState = window.history.pushState;