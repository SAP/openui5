/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/_LogCollector",
	"sap/ui/test/_ParameterValidator",
	"sap/ui/test/autowaiter/_autoWaiter",
	"sap/ui/test/autowaiter/_timeoutCounter"
], function ($, _LogCollector, _ParameterValidator, _autoWaiter, _timeoutCounter) {
	"use strict";

	var oLogger = $.sap.log.getLogger("sap.ui.test.autowaiter._autoWaiterAsync", _LogCollector.DEFAULT_LEVEL_FOR_OPA_LOGGERS);
	var oConfigValidator = new _ParameterValidator({
		errorPrefix: "sap.ui.test.autowaiter._autoWaiterAsync#extendConfig"
	});
	var bWaitStarted;
	var config = {
		interval: 400, // milliseconds
		timeout: 15 // seconds
	};

	function extendConfig(oConfig) {
		validateConfig(oConfig);
		$.extend(config, oConfig);
		if (oConfig.timeoutCounter) {
			_timeoutCounter.extendConfig(oConfig.timeoutCounter);
		}
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
		fnCheck();

		function fnCheck () {
			var pollTimeElapsed = (Date.now() - pollStartTime) / 1000;
			if (pollTimeElapsed <= config.timeout) {
				if (!_autoWaiter.hasToWait()) {
					notifyCallback({log: "Polling finished successfully. There is no more pending asynchronous work for the moment"});
					bWaitStarted = false;
				} else {
					setTimeout(fnCheck, config.interval);
				}
			} else {
				notifyCallback({error: "Polling stopped because the timeout of " + config.timeout +
					" seconds has been reached but there is still pending asynchronous work"});
				bWaitStarted = false;
			}
		}

		function notifyCallback(mResult) {
			if (fnCallback) {
				fnCallback(mResult.error);
			}
			oLogger.debug(mResult.error || mResult.log);
		}
	}

	function validateConfig (oConfig) {
		oConfigValidator.validate({
			inputToValidate: oConfig,
			validationInfo: {
				interval: "numeric",
				timeout: "numeric",
				timeoutCounter: "object"
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