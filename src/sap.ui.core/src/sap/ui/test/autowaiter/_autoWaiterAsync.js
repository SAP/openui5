/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/_ParameterValidator",
	"sap/ui/test/autowaiter/_autoWaiter",
	"sap/ui/test/autowaiter/_autoWaiterLogCollector"
], function ($, _OpaLogger, _ParameterValidator, _autoWaiter, _autoWaiterLogCollector) {
	"use strict";

	var oLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._autoWaiterAsync");
	var oConfigValidator = new _ParameterValidator({
		errorPrefix: "sap.ui.test.autowaiter._autoWaiterAsync#extendConfig"
	});
	var bWaitStarted;
	var sLastAutoWaiterLog;
	var config = {
		interval: 400, // milliseconds
		timeout: 15000 // milliseconds
	};

	function extendConfig(oConfig) {
		validateConfig(oConfig);
		$.extend(config, oConfig);
		_autoWaiter.extendConfig(config);
	}

	function waitAsync(fnCallback) {
		// start only one waiter at a time to prevent interference between the timeout detection of multiple waiters
		if (bWaitStarted) {
			notifyCallback({error: "waitAsync is already running and cannot be called again at this moment"});
			return;
		}

		var pollStartTime = Date.now();
		bWaitStarted = true;
		oLogger.debug("Start polling to check for pending asynchronous work");
		_autoWaiterLogCollector.start();
		fnCheck();

		function fnCheck() {
			var pollTimeElapsed = (Date.now() - pollStartTime);
			if (pollTimeElapsed <= config.timeout) {
				setTimeout(function() {
					if (_autoWaiter.hasToWait()) {
						sLastAutoWaiterLog = _autoWaiterLogCollector.getAndClearLog();
						fnCheck();
					} else {
						notifyCallback({log: "Polling finished successfully. There is no more pending asynchronous work for the moment"});
						bWaitStarted = false;
					}
				}, config.interval);
			} else {
				notifyCallback({error: "Polling stopped because the timeout of " + config.timeout +
					" milliseconds has been reached but there is still pending asynchronous work.\n" +
					"This is the last log of pending work:\n" + sLastAutoWaiterLog});
				bWaitStarted = false;
			}
		}

		function notifyCallback(mResult) {
			if (fnCallback) {
				fnCallback(mResult.error);
			}
			oLogger.debug(mResult.error || mResult.log);
			_autoWaiterLogCollector.stop();
		}
	}

	function validateConfig(oConfig) {
		oConfigValidator.validate({
			inputToValidate: oConfig,
			validationInfo: {
				interval: "numeric",
				timeout: "numeric"
			}
		});

		if (oConfig.timeout <= 0 || oConfig.interval <= 0) {
			throw new Error("Invalid polling config: Timeout and interval should be greater than 0");
		}
	}

	return {
		extendConfig: extendConfig,
		waitAsync: waitAsync
	};
}, true);
