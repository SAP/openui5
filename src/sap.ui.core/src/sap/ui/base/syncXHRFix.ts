var fnXHRFix = function () {
    (function () {
        var bSyncRequestOngoing = false, bPromisesQueued = false;
        var _then = Promise.prototype.then, _catch = Promise.prototype.catch, _timeout = window.setTimeout, _interval = window.setInterval, aQueue = [];
        function addPromiseHandler(fnHandler) {
            if (!bPromisesQueued) {
                bPromisesQueued = true;
                _timeout(function () {
                    var aCurrentQueue = aQueue;
                    aQueue = [];
                    bPromisesQueued = false;
                    aCurrentQueue.forEach(function (fnQueuedHandler) {
                        fnQueuedHandler();
                    });
                }, 0);
            }
            aQueue.push(fnHandler);
        }
        function wrapPromiseHandler(fnHandler, oScope, bCatch) {
            if (typeof fnHandler !== "function") {
                return fnHandler;
            }
            return function () {
                var aArgs = Array.prototype.slice.call(arguments);
                if (bSyncRequestOngoing || bPromisesQueued) {
                    return new Promise(function (resolve, reject) {
                        addPromiseHandler(function () {
                            var oResult;
                            try {
                                oResult = fnHandler.apply(window, aArgs);
                                resolve(oResult);
                            }
                            catch (oException) {
                                reject(oException);
                            }
                        });
                    });
                }
                return fnHandler.apply(window, aArgs);
            };
        }
        Promise.prototype.then = function (fnThen, fnCatch) {
            var fnWrappedThen = wrapPromiseHandler(fnThen), fnWrappedCatch = wrapPromiseHandler(fnCatch);
            return _then.call(this, fnWrappedThen, fnWrappedCatch);
        };
        Promise.prototype.catch = function (fnCatch) {
            var fnWrappedCatch = wrapPromiseHandler(fnCatch);
            return _catch.call(this, fnWrappedCatch);
        };
        function wrapTimerHandler(vHandler) {
            var fnWrappedHandler = function () {
                var aArgs, fnHandler;
                if (bPromisesQueued) {
                    aArgs = [fnWrappedHandler, 0].concat(arguments);
                    _timeout.apply(window, aArgs);
                }
                else {
                    fnHandler = typeof vHandler !== "function" ? new Function(vHandler) : vHandler;
                    fnHandler.apply(window, arguments);
                }
            };
            return fnWrappedHandler;
        }
        window.setTimeout = function (vHandler) {
            var aArgs = Array.prototype.slice.call(arguments);
            if (aArgs.length !== 0) {
                aArgs[0] = wrapTimerHandler(vHandler);
            }
            return _timeout.apply(window, aArgs);
        };
        window.setInterval = function (vHandler) {
            var aArgs = Array.prototype.slice.call(arguments);
            if (aArgs.length !== 0) {
                aArgs[0] = wrapTimerHandler(vHandler);
            }
            return _interval.apply(window, aArgs);
        };
        window.XMLHttpRequest = new Proxy(window.XMLHttpRequest, {
            construct: function (oTargetClass, aArguments, oNewTarget) {
                var oXHR = new oTargetClass(), bSync = false, bDelay = false, iReadyState = 0, oProxy;
                function wrapHandler(fnHandler) {
                    var fnWrappedHandler = function (oEvent) {
                        var iCurrentState = oXHR.readyState;
                        function callHandler() {
                            iReadyState = iCurrentState;
                            if (fnWrappedHandler.active) {
                                return fnHandler.call(oProxy, oEvent);
                            }
                        }
                        if (!bSync && bSyncRequestOngoing) {
                            bDelay = true;
                        }
                        if (bDelay) {
                            _timeout(callHandler, 0);
                            return true;
                        }
                        return callHandler();
                    };
                    fnHandler.wrappedHandler = fnWrappedHandler;
                    fnWrappedHandler.active = true;
                    return fnWrappedHandler;
                }
                function unwrapHandler(fnHandler) {
                    return deactivate(fnHandler.wrappedHandler);
                }
                function deactivate(fnWrappedHandler) {
                    if (typeof fnWrappedHandler === "function") {
                        fnWrappedHandler.active = false;
                    }
                    return fnWrappedHandler;
                }
                oProxy = new Proxy(oXHR, {
                    get: function (oTarget, sPropName, oReceiver) {
                        var vProp = oTarget[sPropName];
                        switch (sPropName) {
                            case "readyState": return iReadyState;
                            case "addEventListener": return function (sName, fnHandler, bCapture) {
                                vProp.call(oTarget, sName, wrapHandler(fnHandler), bCapture);
                            };
                            case "removeEventListener": return function (sName, fnHandler, bCapture) {
                                vProp.call(oTarget, sName, unwrapHandler(fnHandler), bCapture);
                            };
                            case "open": return function (sMethod, sUrl, bAsync) {
                                bSync = bAsync === false;
                                vProp.apply(oTarget, arguments);
                                iReadyState = oTarget.readyState;
                            };
                            case "send": return function () {
                                bSyncRequestOngoing = bSync;
                                try {
                                    vProp.apply(oTarget, arguments);
                                }
                                finally {
                                    iReadyState = oTarget.readyState;
                                    bSyncRequestOngoing = false;
                                }
                            };
                        }
                        if (typeof vProp === "function") {
                            return function () {
                                return vProp.apply(oTarget, arguments);
                            };
                        }
                        return vProp;
                    },
                    set: function (oTarget, sPropName, vValue) {
                        if (sPropName.indexOf("on") === 0) {
                            deactivate(oTarget[sPropName]);
                            if (typeof vValue === "function") {
                                oTarget[sPropName] = wrapHandler(vValue);
                                return true;
                            }
                        }
                        oTarget[sPropName] = vValue;
                        return true;
                    }
                });
                oProxy.addEventListener("readystatechange", function () { });
                return oProxy;
            }
        });
    })();
};