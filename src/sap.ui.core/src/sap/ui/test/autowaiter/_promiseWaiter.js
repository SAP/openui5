/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/_ParameterValidator"
], function ($, _OpaLogger, _ParameterValidator) {
	"use strict";

	var oHasPendingLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._promiseWaiter#hasPending");
	var oConfigValidator = new _ParameterValidator({
		errorPrefix: "sap.ui.test.autowaiter._promiseWaiter#extendConfig"
	});
	var config = {
		maxDelay: 1000 // milliseconds; should be at least as big as _timeoutWaiter maxDelay
	};

	var iPendingPromises = 0;

	function wrapPromiseFunction (sOriginalFunctionName) {
		var fnOriginal = Promise[sOriginalFunctionName];
		Promise[sOriginalFunctionName] = function () {

			var bTooLate = false;

			// Timeout to detect long runners
			var iTimeout = setTimeout(function () {
				bTooLate = true;
				iPendingPromises--;
			}, config.maxDelay);

			var fnCountDownPromises = function () {
				if (bTooLate) {
					// the timeout already counted down - do nothing
					return;
				}
				// count down and clear the timeout to make sure it is only counted down once
				iPendingPromises--;
				clearTimeout(iTimeout);
			};

			iPendingPromises++;
			var oPromise = fnOriginal.apply(this, arguments);
			oPromise.then(fnCountDownPromises, fnCountDownPromises);
			return oPromise;
		};
	}

	wrapPromiseFunction("resolve");
	wrapPromiseFunction("all");
	wrapPromiseFunction("race");
	wrapPromiseFunction("reject");

	return {
		hasPending: function () {
			var bHasPendingPromises = iPendingPromises > 0;
			if (bHasPendingPromises) {
				oHasPendingLogger.debug("There are " + iPendingPromises + " pending promises");
			}
			return bHasPendingPromises;
		},
		extendConfig: function (oConfig) {
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
