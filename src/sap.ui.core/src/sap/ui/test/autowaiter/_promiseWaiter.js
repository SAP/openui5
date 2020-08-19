/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/autowaiter/_utils",
	"sap/ui/thirdparty/jquery",
	"./WaiterBase"
], function(_utils, jQueryDOM, WaiterBase) {
	"use strict";

	var aPendingPromises = [];

	var PromiseWaiter = WaiterBase.extend("sap.ui.test.autowaiter._promiseWaiter", {
		hasPending: function () {
			var bHasPendingPromises = aPendingPromises.length > 0;
			if (bHasPendingPromises) {
				logPendingPromises();
			}
			return bHasPendingPromises;
		},
		_getDefaultConfig: function () {
			return jQueryDOM.extend({
				maxDelay: 1000 // milliseconds; should be at least as big as _timeoutWaiter maxDelay
			}, WaiterBase.prototype._getDefaultConfig.call(this));
		},
		_getValidationInfo: function () {
			return jQueryDOM.extend({
				maxDelay: "numeric"
			}, WaiterBase.prototype._getValidationInfo.call(this));
		}
	});
	var oPromiseWaiter = new PromiseWaiter();

	function wrapPromiseFunction (sOriginalFunctionName) {
		var fnOriginal = Promise[sOriginalFunctionName];
		Promise[sOriginalFunctionName] = function () {

			var bTooLate = false;
			var mPendingPromise = {
				func: sOriginalFunctionName,
				args: _utils.argumentsToString(arguments),
				stack: _utils.resolveStackTrace()
			};
			var sPendingPromiseLog = createLogForPromise(mPendingPromise);

			// Timeout to detect long runners
			var iTimeout = setTimeout(function () {
				bTooLate = true;
				aPendingPromises.splice(aPendingPromises.indexOf(mPendingPromise), 1);
				oPromiseWaiter._oLogger.trace("Long-running promise is ignored:" + sPendingPromiseLog);
			}, oPromiseWaiter._mConfig.maxDelay,'TIMEOUT_WAITER_IGNORE');

			var fnCountDownPromises = function () {
				if (bTooLate) {
					// the timeout already counted down - do nothing
					return;
				}
				// count down and clear the timeout to make sure it is only counted down once
				aPendingPromises.splice(aPendingPromises.indexOf(mPendingPromise), 1);
				oPromiseWaiter._oLogger.trace("Promise complete:" + sPendingPromiseLog);
				clearTimeout(iTimeout);
			};

			var oPromise = fnOriginal.apply(this, arguments);
			aPendingPromises.push(mPendingPromise);
			oPromiseWaiter._oLogger.trace("New pending promise:" + sPendingPromiseLog);
			oPromise.then(fnCountDownPromises, fnCountDownPromises);
			return oPromise;
		};
	}

	wrapPromiseFunction("resolve");
	wrapPromiseFunction("all");
	wrapPromiseFunction("race");
	wrapPromiseFunction("reject");

	function createLogForPromise(mPromise) {
		return "\nPromise: Function: " + mPromise.func + " Args: " + mPromise.args + " Stack: " + mPromise.stack;
	}

	function logPendingPromises() {
		var sLogMessage = "There are " + aPendingPromises.length + " pending promises\n";
		aPendingPromises.forEach(function (mPromise) {
			sLogMessage += createLogForPromise(mPromise);
		});

		oPromiseWaiter._oHasPendingLogger.debug(sLogMessage);
	}

	return oPromiseWaiter;
}, true);