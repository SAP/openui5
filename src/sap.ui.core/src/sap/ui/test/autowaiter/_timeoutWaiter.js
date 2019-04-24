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

	var oLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._timeoutWaiter");
	var oHasPendingLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._timeoutWaiter#hasPending");
	var oConfigValidator = new _ParameterValidator({
		errorPrefix: "sap.ui.test.autowaiter._timeoutWaiter#extendConfig"
	});
	var mTimeouts = {};
	var config = {
		maxDepth: 3, // count
		maxDelay: 1000 // milliseconds
	};

	var iCurrentDepth = 0;

	function createTimeoutWrapper (sName) {
		var sSetName = "set" + sName;
		var sClearName = "clear" + sName;
		var fnOriginal = window[sSetName];
		// set immediate is not standard
		if (!fnOriginal) {
			return;
		}
		var fnOriginalClear = window[sClearName];
		window[sSetName] = function (fnCallback, iDelay) {
			var fnWrappedCallback = function () {
				// workaround for FF: the mTimeouts[iID] is sometimes cleaned by GC before it is released
				iCurrentDepth = (mTimeouts[iID] ? mTimeouts[iID].depth : 0) + 1;
				delete mTimeouts[iID];
				try {
					fnCallback();
					oLogger.trace("Timeout with ID " + iID + " finished");
				} finally {
					iCurrentDepth = 0;
				}
			};

			var iID;
			var mPendingTimeout = {
				depth: iCurrentDepth,
				delay: iDelay,
				func: _utils.functionToString(fnCallback),
				stack: _utils.resolveStackTrace()
			};

			// do not track long runners and call the original directly
			// any deeper nested timeouts are non-blocking and will not be wrapped
			if (iDelay >= config.maxDelay) {
				iID = fnOriginal(fnCallback, iDelay);
				oLogger.trace("Timeout delay " + iDelay + " reached the limit of " + config.maxDelay +
					". Long-running timeout is ignored:" + createLogForTimeout(iID, mPendingTimeout));
			} else {
				iID = fnOriginal(fnWrappedCallback, iDelay);
				oLogger.trace("Timeout with ID " + iID + " scheduled. Delay: " + iDelay + " Depth: " + iCurrentDepth);
				mTimeouts[iID] = mPendingTimeout;

				// do not track non-blocking timeouts
				// these are deeply nested timeouts which probably form a continuous polling process
				// continue to wrap deeper calls in order to correctly ignore them later
				if (iCurrentDepth >= config.maxDepth) {
					oLogger.trace("Timeout depth reached the limit of " + config.maxDepth +
						". Non-blocking timeout is ignored:" + createLogForTimeout(iID, mTimeouts[iID]));
					mTimeouts[iID].nonBlocking = true;
				}
			}

			return iID;
		};

		window[sClearName] = function (iID) {
			delete mTimeouts[iID];
			oLogger.trace("Timeout with ID " + iID + " cleared");
			return fnOriginalClear(iID);
		};
	}

	createTimeoutWrapper("Timeout");
	createTimeoutWrapper("Immediate");

	function createLogForTimeout(iTimeoutID, mTimeout) {
		return "\nTimeout: ID: " + iTimeoutID + " Delay: " + mTimeout.delay + " Depth: " + mTimeout.depth +
			" Function: " + mTimeout.func + " Stack: " + mTimeout.stack;
	}

	function logPendingTimeouts(aBlockingTimeoutIds) {
		var sLogMessage = "There are " + aBlockingTimeoutIds.length + " open blocking timeouts";
		aBlockingTimeoutIds.forEach(function (iTimeoutID) {
			sLogMessage += createLogForTimeout(iTimeoutID, mTimeouts[iTimeoutID]);
		});
		oHasPendingLogger.debug(sLogMessage);
	}

	return {
		hasPending: function () {
			var aBlockingTimeoutIds = Object.keys(mTimeouts).filter(function (iID) {
				return !mTimeouts[iID].nonBlocking;
			});
			var bHasPendingTimeouts = aBlockingTimeoutIds.length > 0;
			if (bHasPendingTimeouts) {
				logPendingTimeouts(aBlockingTimeoutIds);
			}
			return bHasPendingTimeouts;
		},
		extendConfig: function (oConfig) {
			oConfigValidator.validate({
				inputToValidate: oConfig,
				validationInfo: {
					maxDepth: "numeric",
					maxDelay: "numeric"
				}
			});
			$.extend(config, oConfig);
		}
	};
}, true);
