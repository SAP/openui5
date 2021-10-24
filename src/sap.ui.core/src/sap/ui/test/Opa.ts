import Device from "sap/ui/Device";
import $ from "sap/ui/thirdparty/jquery";
import _LogCollector from "sap/ui/test/_LogCollector";
import _OpaLogger from "sap/ui/test/_OpaLogger";
import _ParameterValidator from "sap/ui/test/_ParameterValidator";
import _UsageReport from "sap/ui/test/_UsageReport";
import _OpaUriParameterParser from "sap/ui/test/_OpaUriParameterParser";
import _ValidationParameters from "sap/ui/test/_ValidationParameters";
export class Opa {
    static config = {};
    private static _uriParams = _OpaUriParameterParser._getOpaParams();
    private static _usageReport = new _UsageReport(Opa.config);
    static prototype = {
        getContext: Opa.getContext,
        waitFor: function (options) {
            var deferred = $.Deferred(), oFilteredConfig = Opa._createFilteredConfig(Opa._aConfigValuesForWaitFor);
            options = $.extend({}, oFilteredConfig, options);
            this._validateWaitFor(options);
            options._stack = createStack(1 + options._stackDropCount);
            delete options._stackDropCount;
            var _this = $.extend({}, this);
            deferred.promise(_this);
            queue.push({
                callback: function () {
                    var bCheckPassed = true;
                    if (options.check) {
                        try {
                            bCheckPassed = options.check.apply(this, arguments);
                        }
                        catch (oError) {
                            var sErrorMessage = "Failure in Opa check function\n" + getMessageForException(oError);
                            addErrorMessageToOptions(sErrorMessage, options, oError.stack);
                            deferred.reject(options);
                            return { error: true, arguments: arguments };
                        }
                    }
                    if (oStopQueueOptions) {
                        return { result: true, arguments: arguments };
                    }
                    if (!bCheckPassed) {
                        return { result: false, arguments: arguments };
                    }
                    if (options.success) {
                        var oWaitForCounter = Opa._getWaitForCounter();
                        try {
                            options.success.apply(this, arguments);
                        }
                        catch (oError) {
                            var sErrorMessage = "Failure in Opa success function\n" + getMessageForException(oError);
                            addErrorMessageToOptions(sErrorMessage, options, oError.stack);
                            deferred.reject(options);
                            return { error: true, arguments: arguments };
                        }
                        finally {
                            ensureNewlyAddedWaitForStatementsPrepended(oWaitForCounter, options);
                        }
                    }
                    deferred.resolve();
                    return { result: true, arguments: arguments };
                }.bind(this),
                options: options
            });
            return _this;
        },
        extendConfig: Opa.extendConfig,
        emptyQueue: Opa.emptyQueue,
        iWaitForPromise: function (oPromise) {
            return this._schedulePromiseOnFlow(oPromise);
        },
        _schedulePromiseOnFlow: function (oPromise, oOptions) {
            oOptions = oOptions || {};
            var mPromiseState = {};
            oOptions.check = function () {
                if (!mPromiseState.started) {
                    mPromiseState.started = true;
                    oPromise.then(function () {
                        mPromiseState.done = true;
                    }, function (error) {
                        mPromiseState.errorMessage = "Error while waiting for promise scheduled on flow" + (error ? ", details: " + error : "");
                    });
                }
                if (mPromiseState.errorMessage) {
                    throw new Error(mPromiseState.errorMessage);
                }
                else {
                    return !!mPromiseState.done;
                }
            };
            return this.waitFor(oOptions);
        },
        _validateWaitFor: function (oParameters) {
            oValidator.validate({
                validationInfo: _ValidationParameters.OPA_WAITFOR,
                inputToValidate: oParameters
            });
        }
    };
    private static _aConfigValuesForWaitFor = Object.keys(_ValidationParameters.OPA_WAITFOR_CONFIG);
    static extendConfig(oOptions: any) {
        var aComponents = ["actions", "assertions", "arrangements"];
        aComponents.filter(function (sArrangeActAssert) {
            return !!oOptions[sArrangeActAssert];
        }).forEach(function (sArrangeActAssert) {
            var oNewComponent = oOptions[sArrangeActAssert];
            var oNewComponentProto = Object.getPrototypeOf(oOptions[sArrangeActAssert]);
            var oCurrentConfig = Opa.config[sArrangeActAssert];
            var oCurrentConfigProto = Object.getPrototypeOf(Opa.config[sArrangeActAssert]);
            for (var sKey in oCurrentConfig) {
                if (!(sKey in oNewComponent)) {
                    oNewComponent[sKey] = oCurrentConfig[sKey];
                }
            }
            for (var sProtoKey in oCurrentConfigProto) {
                if (!(sProtoKey in oNewComponent)) {
                    oNewComponentProto[sProtoKey] = oCurrentConfigProto[sProtoKey];
                }
            }
        });
        Opa.config = $.extend(true, Opa.config, oOptions, Opa._uriParams);
        _OpaLogger.setLevel(Opa.config.logLevel);
    }
    static resetConfig(...args: any) {
        Opa.config = $.extend({
            arrangements: new Opa(),
            actions: new Opa(),
            assertions: new Opa(),
            timeout: 15,
            pollingInterval: 400,
            debugTimeout: 0,
            _stackDropCount: 0,
            executionDelay: executionDelayDefault,
            asyncPolling: false
        }, Opa._uriParams);
    }
    static getContext(...args: any) {
        return context;
    }
    static emptyQueue(...args: any) {
        if (isEmptyQueueStarted) {
            throw new Error("Opa is emptying its queue. Calling Opa.emptyQueue() is not supported at this time.");
        }
        isEmptyQueueStarted = true;
        oStopQueueOptions = null;
        oQueueDeferred = $.Deferred();
        internalEmpty();
        return oQueueDeferred.promise().fail(function (oOptions) {
            queue = [];
            if (oStopQueueOptions) {
                var sErrorMessage = oStopQueueOptions.qunitTimeout ? "QUnit timeout after " + oStopQueueOptions.qunitTimeout + " seconds" : "Queue was stopped manually";
                oOptions._stack = oStopQueueOptions.qunitTimeout && lastInternalWaitStack || createStack(1);
                addErrorMessageToOptions(sErrorMessage, oOptions);
            }
        }).always(function () {
            queue = [];
            timeout = -1;
            oQueueDeferred = null;
            lastInternalWaitStack = null;
            isEmptyQueueStarted = false;
        });
    }
    static stopQueue(...args: any) {
        Opa._stopQueue();
    }
    private static _stopQueue(oOptions: any) {
        queue = [];
        if (!oQueueDeferred) {
            oLogger.warning("stopQueue was called before emptyQueue, queued tests have never been executed", "Opa");
        }
        else {
            if (timeout !== -1) {
                clearTimeout(timeout);
            }
            oStopQueueOptions = oOptions || {};
            oQueueDeferred.reject(oStopQueueOptions);
        }
    }
    private static _createFilteredOptions(aAllowedProperties: any, oSource: any) {
        var oFilteredOptions = {};
        aAllowedProperties.forEach(function (sKey) {
            var vConfigValue = oSource[sKey];
            if (vConfigValue === undefined) {
                return;
            }
            oFilteredOptions[sKey] = vConfigValue;
        });
        return oFilteredOptions;
    }
    private static _createFilteredConfig(aAllowedProperties: any) {
        return Opa._createFilteredOptions(aAllowedProperties, Opa.config);
    }
    private static _getWaitForCounter(...args: any) {
        var iQueueLengthOnCreation = queue.length;
        return {
            get: function () {
                var iLength = queue.length - iQueueLengthOnCreation;
                return Math.max(iLength, 0);
            }
        };
    }
    constructor(extensionObject: any) {
        this.and = this;
        $.extend(this, extensionObject);
    }
}
var oLogger = _OpaLogger.getLogger("sap.ui.test.Opa"), oLogCollector = _LogCollector.getInstance(), queue = [], context = {}, timeout = -1, oStopQueueOptions, oQueueDeferred, isEmptyQueueStarted, lastInternalWaitStack, oValidator = new _ParameterValidator({
    errorPrefix: "sap.ui.test.Opa#waitFor"
});
oLogCollector.start();
function internalWait(fnCallback, oOptions) {
    if (window["sap-ui-debug"]) {
        oOptions.timeout = oOptions.debugTimeout;
    }
    var startTime = new Date();
    opaCheck();
    function opaCheck() {
        oLogger.timestamp("opa.check");
        oLogCollector.getAndClearLog();
        var oResult = fnCallback();
        lastInternalWaitStack = oOptions._stack;
        if (oResult.error) {
            oQueueDeferred.reject(oOptions);
            return;
        }
        if (oResult.result) {
            internalEmpty();
            return;
        }
        var iPassedSeconds = (new Date() - startTime) / 1000;
        if (oOptions.timeout === 0 || oOptions.timeout > iPassedSeconds) {
            timeout = setTimeout(opaCheck, oOptions.pollingInterval);
            return;
        }
        addErrorMessageToOptions("Opa timeout after " + oOptions.timeout + " seconds", oOptions);
        if (oOptions.error) {
            try {
                oOptions.error(oOptions, oResult.arguments);
            }
            finally {
                oQueueDeferred.reject(oOptions);
            }
        }
        else {
            oQueueDeferred.reject(oOptions);
        }
    }
}
function internalEmpty() {
    if (!queue.length) {
        if (oQueueDeferred) {
            oQueueDeferred.resolve();
        }
        return true;
    }
    var queueElement = queue.shift();
    timeout = setTimeout(function () {
        internalWait(queueElement.callback, queueElement.options);
    }, (Opa.config.asyncPolling ? queueElement.options.pollingInterval : 0) + Opa.config.executionDelay);
}
function ensureNewlyAddedWaitForStatementsPrepended(oWaitForCounter, oNestedInOptions) {
    var iNewWaitForsCount = oWaitForCounter.get();
    if (iNewWaitForsCount) {
        var aNewWaitFors = queue.splice(queue.length - iNewWaitForsCount, iNewWaitForsCount);
        aNewWaitFors.forEach(function (queueElement) {
            queueElement.options._nestedIn = oNestedInOptions;
        });
        queue = aNewWaitFors.concat(queue);
    }
}
function getMessageForException(oError) {
    var sExceptionText = oError.toString();
    if (oError.stack) {
        sExceptionText += "\n" + oError.stack;
    }
    var sErrorMessage = "Exception thrown by the testcode:'" + sExceptionText + "'";
    return sErrorMessage;
}
function addErrorMessageToOptions(sErrorMessage, oOptions, oErrorStack) {
    var sLogs = oLogCollector.getAndClearLog();
    if (sLogs) {
        sErrorMessage += "\nThis is what Opa logged:\n" + sLogs;
    }
    if (!oErrorStack && oOptions._stack) {
        sErrorMessage += addStacks(oOptions);
    }
    if (oOptions.errorMessage) {
        oOptions.errorMessage += "\n" + sErrorMessage;
    }
    else {
        oOptions.errorMessage = sErrorMessage;
    }
    oLogger.error(oOptions.errorMessage, "Opa");
}
function createStack(iDropCount) {
    iDropCount = (iDropCount || 0) + 2;
    if (Device.browser.mozilla) {
        iDropCount = iDropCount - 1;
    }
    var oError = new Error(), stack = oError.stack;
    if (!stack) {
        try {
            throw oError();
        }
        catch (oError2) {
            stack = oError2.stack;
        }
    }
    if (!stack) {
        return "";
    }
    stack = stack.split("\n");
    stack.splice(0, iDropCount);
    return stack.join("\n");
}
function addStacks(oOptions) {
    var sResult = "\nCallstack:\n";
    if (oOptions._stack) {
        sResult += oOptions._stack;
        delete oOptions._stack;
    }
    else {
        sResult += "Unknown";
    }
    if (oOptions._nestedIn) {
        sResult += addStacks(oOptions._nestedIn);
        delete oOptions._nestedIn;
    }
    return sResult;
}
var executionDelayDefault = 0;
if (Device.browser.safari) {
    executionDelayDefault = 50;
}
Opa.resetConfig();
_OpaLogger.setLevel(Opa.config.logLevel);