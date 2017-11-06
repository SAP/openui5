/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/_ParameterValidator",
	"sap/ui/test/autowaiter/_utils"
], function ($, _OpaLogger, _ParameterValidator, _utils) {
	"use strict";

	var oLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._promiseWaiter");
	var oHasPendingLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._promiseWaiter#hasPending");
	var oConfigValidator = new _ParameterValidator({
		errorPrefix: "sap.ui.test.autowaiter._promiseCounter#extendConfig"
	});
	var iDefaultMaxDelay = 1000; // milliseconds; should be at least as big as _timeoutWaiter maxDelay
	var config = {
		maxDelay: iDefaultMaxDelay
	};

	var aPendingPromises = [];

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
				oLogger.trace("Long-running promise is ignored:" + sPendingPromiseLog);
			}, config.maxDelay);

			var fnCountDownPromises = function () {
				if (bTooLate) {
					// the timeout already counted down - do nothing
					return;
				}
				// count down and clear the timeout to make sure it is only counted down once
				aPendingPromises.splice(aPendingPromises.indexOf(mPendingPromise), 1);
				oLogger.trace("Promise complete:" + sPendingPromiseLog);
				clearTimeout(iTimeout);
			};

			var oPromise = fnOriginal.apply(this, arguments);
			aPendingPromises.push(mPendingPromise);
			oLogger.trace("New pending promise:" + sPendingPromiseLog);
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

		oHasPendingLogger.debug(sLogMessage);
	}

	return {
		hasPending: function () {
			var bHasPendingPromises = aPendingPromises.length > 0;
			if (bHasPendingPromises) {
				logPendingPromises();
			}
			return bHasPendingPromises;
		},
		extendConfig: function (oConfig) {
			var iConfigMaxDelay = oConfig && oConfig.timeoutWaiter && oConfig.timeoutWaiter.maxDelay;
			oConfig = {
				maxDelay: iConfigMaxDelay || iDefaultMaxDelay
			};
			oConfigValidator.validate({
				inputToValidate: oConfig,
				validationInfo: {
					maxDelay: "numeric"
				}
			});
			$.extend(config, oConfig);
		}
	};
}, true);
