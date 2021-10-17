var oResolved = new SyncPromise(function (resolve, reject) {
    resolve();
});
function call(fnThen, resolve, reject) {
    var bOnce;
    function rejectPromise(vReason) {
        if (!bOnce) {
            bOnce = true;
            reject(vReason);
        }
    }
    function resolvePromise(vResult) {
        if (!bOnce) {
            bOnce = true;
            resolve(vResult);
        }
    }
    try {
        fnThen(resolvePromise, rejectPromise);
    }
    catch (e) {
        rejectPromise(e);
    }
}
function hasThen(vValue) {
    return vValue && (typeof vValue === "function" || typeof vValue === "object") && "then" in vValue;
}
function SyncPromise(fnExecutor) {
    var bCaught = false, iState, fnReject, fnResolve, vResult, that = this;
    function reject(vReason) {
        vResult = vReason;
        iState = -1;
        if (!bCaught && SyncPromise.listener) {
            SyncPromise.listener(that, false);
        }
        if (fnReject) {
            fnReject(vReason);
            fnReject = fnResolve = null;
        }
    }
    function resolve(vResult0) {
        var fnThen;
        if (vResult0 === that) {
            reject(new TypeError("A promise cannot be resolved with itself."));
            return;
        }
        if (vResult0 instanceof SyncPromise) {
            if (vResult0.isFulfilled()) {
                resolve(vResult0.getResult());
                return;
            }
            else if (vResult0.isRejected()) {
                vResult0.caught();
                reject(vResult0.getResult());
                return;
            }
            else {
                vResult0.caught();
                vResult0 = vResult0.getResult();
            }
        }
        iState = 0;
        vResult = vResult0;
        if (hasThen(vResult)) {
            try {
                fnThen = vResult.then;
            }
            catch (e) {
                reject(e);
                return;
            }
            if (typeof fnThen === "function") {
                call(fnThen.bind(vResult), resolve, reject);
                return;
            }
        }
        iState = 1;
        if (fnResolve) {
            fnResolve(vResult);
            fnReject = fnResolve = null;
        }
    }
    this.caught = function () {
        if (!bCaught) {
            bCaught = true;
            if (SyncPromise.listener && this.isRejected()) {
                SyncPromise.listener(this, true);
            }
        }
    };
    this.getResult = function () {
        return vResult;
    };
    this.isFulfilled = function () {
        return iState === 1;
    };
    this.isPending = function () {
        return !iState;
    };
    this.isRejected = function () {
        return iState === -1;
    };
    call(fnExecutor, resolve, reject);
    if (iState === undefined) {
        vResult = new Promise(function (resolve, reject) {
            fnResolve = resolve;
            fnReject = reject;
        });
        vResult.catch(function () { });
    }
}
SyncPromise.prototype.catch = function (fnOnRejected) {
    return this.then(undefined, fnOnRejected);
};
SyncPromise.prototype.finally = function (fnOnFinally) {
    if (typeof fnOnFinally === "function") {
        return this.then(function (vResult) {
            return SyncPromise.resolve(fnOnFinally()).then(function () {
                return vResult;
            }).unwrap();
        }, function (vReason) {
            return SyncPromise.resolve(fnOnFinally()).then(function () {
                throw vReason;
            }).unwrap();
        });
    }
    return this.then(fnOnFinally, fnOnFinally);
};
SyncPromise.prototype.then = function (fnOnFulfilled, fnOnRejected) {
    var fnCallback = this.isFulfilled() ? fnOnFulfilled : fnOnRejected, bCallbackIsFunction = typeof fnCallback === "function", bPending = this.isPending(), that = this;
    if (bPending || bCallbackIsFunction) {
        this.caught();
    }
    if (!bPending) {
        return bCallbackIsFunction ? new SyncPromise(function (resolve, reject) {
            resolve(fnCallback(that.getResult()));
        }) : this;
    }
    return SyncPromise.resolve(this.getResult().then(fnOnFulfilled, fnOnRejected));
};
SyncPromise.prototype.toString = function () {
    if (this.isPending()) {
        return "SyncPromise: pending";
    }
    return String(this.getResult());
};
SyncPromise.prototype.unwrap = function () {
    this.caught();
    if (this.isRejected()) {
        throw this.getResult();
    }
    return this.getResult();
};
SyncPromise.all = function (aValues) {
    return new SyncPromise(function (resolve, reject) {
        var bDone = false, iPending = 0;
        function checkFulfilled() {
            if (bDone && iPending === 0) {
                resolve(aValues);
            }
        }
        aValues = Array.prototype.slice.call(aValues);
        aValues.forEach(function (vValue, i) {
            if (vValue !== aValues[i + 1] && hasThen(vValue)) {
                iPending += 1;
                vValue.then(function (vResult0) {
                    do {
                        aValues[i] = vResult0;
                        i -= 1;
                    } while (i >= 0 && vValue === aValues[i]);
                    iPending -= 1;
                    checkFulfilled();
                }, function (vReason) {
                    reject(vReason);
                });
            }
        });
        bDone = true;
        checkFulfilled();
    });
};
SyncPromise.isThenable = function (vValue) {
    try {
        return !!hasThen(vValue) && typeof vValue.then === "function";
    }
    catch (e) {
        return false;
    }
};
SyncPromise.reject = function (vReason) {
    return new SyncPromise(function (resolve, reject) {
        reject(vReason);
    });
};
SyncPromise.resolve = function (vResult) {
    if (vResult === undefined) {
        return oResolved;
    }
    if (vResult instanceof SyncPromise) {
        return vResult;
    }
    return new SyncPromise(function (resolve, reject) {
        resolve(vResult);
    });
};