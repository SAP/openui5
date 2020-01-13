/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/_ParameterValidator",
	"sap/ui/test/autowaiter/_utils",
	"sap/ui/thirdparty/jquery"
], function(_OpaLogger, _ParameterValidator, _utils, jQueryDOM) {
	"use strict";

	var oLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._timeoutWaiter");
	var oHasPendingLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._timeoutWaiter#hasPending");
	var oConfigValidator = new _ParameterValidator({
		errorPrefix: "sap.ui.test.autowaiter._timeoutWaiter#extendConfig"
	});
	var mTimeouts = {};
	var iDefaultMaxDepth = 1; 		// count
	var iDefaultMaxDelay = 1000; 	// milliseconds
	var iDefaultMinDelay = 10; 		// milliseconds
	var config = {
		maxDepth: iDefaultMaxDepth,
		maxDelay: iDefaultMaxDelay,
		minDelay: iDefaultMinDelay
	};
	var timeoutStatus = {
		TRACKED: "TRACKED",
		STARTER: "STARTED",
		FINISHED: "FINISHED",
		CLEARED: "CLEARED"
	};

	// initiatorId is the timeout id of the currently running timeout callback
	// for opa poll frame, will have the ID of the poll timeout
	// undefined means this is native event frame
	var iInitiatorId;

	function createTimeoutWrapper (sName) {
		var sSetName = "set" + sName;
		var sClearName = "clear" + sName;
		var fnOriginal = window[sSetName];
		// set immediate is not standard
		if (!fnOriginal) {
			return;
		}
		var fnOriginalClear = window[sClearName];

		window[sSetName] = function wrappedSetTimeout(fnCallback, iDelay, tracking) {
			iDelay = iDelay || 0;
			var aCallbackArgs = Array.prototype.slice.call(arguments, 2);
			var oNewTimeout = {
				delay: iDelay,
				initiator: iInitiatorId,
				func: _utils.functionToString(fnCallback),
				stack: _utils.resolveStackTrace(),
				status: timeoutStatus.TRACKED
			};
			var iID;

			// some timeouts do not need to be tracked, like the timeout for long-running promises
			if (tracking && tracking === 'TIMEOUT_WAITER_IGNORE') {
				iID = fnOriginal.apply(null, [fnCallback, iDelay].concat(aCallbackArgs.slice(1)));
				oLogger.trace("Timeout with ID " + iID + " should not be tracked. " +
					" Delay: " + iDelay +
					" Initiator: " + iInitiatorId);

				return iID;
			}

			var fnWrappedCallback = function wrappedCallback() {
				// workaround for FF: the mTimeouts[iID] is sometimes cleaned by GC before it is released
				var oCurrentTimeout = mTimeouts[iID];
				if (!oCurrentTimeout) {
					oLogger.trace("Timeout data for timeout with ID " + iID + " disapered unexpectedly");
					oCurrentTimeout = {};
				}
				iInitiatorId = iID;

				oLogger.trace("Timeout with ID " + iID + " started");
				oCurrentTimeout.status = timeoutStatus.STARTED;
				try {
					fnCallback();
				} finally {
					iInitiatorId = undefined;
				}
				oLogger.trace("Timeout with ID " + iID + " finished");
				oCurrentTimeout.status = timeoutStatus.FINISHED;
			};

			iID = fnOriginal.apply(null, [fnWrappedCallback, iDelay].concat(aCallbackArgs));
			oLogger.trace("Timeout with ID " + iID + " is tracked. " +
				" Delay: " + iDelay +
				" Initiator: " + iInitiatorId);
			mTimeouts[iID] = oNewTimeout;

			return iID;
		};

		window[sClearName] = function wrappedClearTimeout(iID) {
			if (!iID) {
				oLogger.trace("Could not clean timeout with invalid ID: " + iID);
				return;
			}

			var oCurrentTimeout = mTimeouts[iID];
			if (!oCurrentTimeout) {
				oLogger.trace("Timeout data for timeout with ID " + iID + " disapered unexpectedly or timeout was not tracked intentionally");
				oCurrentTimeout = {};
			}

			oCurrentTimeout.status = timeoutStatus.CLEARED;
			oLogger.trace("Timeout with ID " + iID + " cleared");
			fnOriginalClear(iID);
		};
	}

	createTimeoutWrapper("Timeout");
	createTimeoutWrapper("Immediate");

	function createLogForTimeout(iTimeoutID, oTimeout,bBlocking,bDetails) {
		return "\nTimeout: ID: " + iTimeoutID +
			" Type: " + (bBlocking ? "BLOCKING" : "NOT BLOCKING") +
			" Status: " + oTimeout.status +
			" Delay: " + oTimeout.delay +
			" Initiator: " + oTimeout.initiator +
			(bDetails ? ("\nFunction: " + oTimeout.func) : "") +
			(bDetails ? ("\nStack: " + oTimeout.stack) : "");
	}

	function logTrackedTimeouts(aBlockingTimeoutIds) {
		var aTimeoutIds = Object.keys(mTimeouts);
		// log overview of blocking timeouts at debug
		var sLogMessage = "Found " + aBlockingTimeoutIds.length + " blocking out of " + aTimeoutIds.length + " tracked timeouts";
		aBlockingTimeoutIds.forEach(function (iTimeoutID) {
			sLogMessage += createLogForTimeout(iTimeoutID, mTimeouts[iTimeoutID],aBlockingTimeoutIds.some(function(currentValue){
				return currentValue == iTimeoutID;
			}),true);
		});
		// show the pending timeout details into the timeout message
		oHasPendingLogger.debug(sLogMessage);

		// log all tracked timeouts at trace
		var sTraceLogMessage = "Tracked timeouts";
		aTimeoutIds.forEach(function (iTimeoutID) {
			sTraceLogMessage += createLogForTimeout(iTimeoutID, mTimeouts[iTimeoutID],aBlockingTimeoutIds.some(function(currentValue){
				return currentValue == iTimeoutID;
			}),true);
		});
		oHasPendingLogger.trace(sTraceLogMessage);
	}

	function isBlocking(iID) {
		var oCurrentTimeout = mTimeouts[iID];
		// we do not care for finished timeouts
		if (oCurrentTimeout.status !== timeoutStatus.TRACKED){
			return false;
		}

		// long runnes are some application level timeouts => we do not care for them
		if (oCurrentTimeout.delay > config.maxDelay ) {
			return false;
		}

		// zero or up to some small delay timeouts are definitely execution flow so must be waited
		if (oCurrentTimeout.delay > config.minDelay) {
			return isExecutionFlow(iID);
		}

		// all that are left should be waited for
		return true;
	}

	// analyse recursively if this timeout is either execution flow or polling
	function isExecutionFlow(currentId,depth) {
		depth = depth || 1;
		var oCurrentTimeout = mTimeouts[currentId];

		// initiator could be untracked or lost so consider as flow
		if (oCurrentTimeout.initiator && mTimeouts[oCurrentTimeout.initiator])	{
			// if the initiator has the same timeout => check recursively for its parrent
			if (oCurrentTimeout.delay == mTimeouts[oCurrentTimeout.initiator].delay) {
				// if maxDepth chain has equal delays => this is a poll chain
				if (depth >= config.maxDepth) {
					return false;
				}
				return isExecutionFlow(oCurrentTimeout.initiator,depth + 1);
			}
		}
		return true;
	}

	return {
		hasPending: function () {
			var aBlockingTimeoutIds = Object.keys(mTimeouts).filter(function (iID) {
				return isBlocking(iID);
			});
			var bHasBlockingTimeouts = aBlockingTimeoutIds.length > 0;
			logTrackedTimeouts(aBlockingTimeoutIds);
			return bHasBlockingTimeouts;
		},
		extendConfig: function (oConfig) {
			oConfig = oConfig && oConfig.timeoutWaiter || {
				maxDepth: iDefaultMaxDepth,
				maxDelay: iDefaultMaxDelay
			};
			oConfigValidator.validate({
				inputToValidate: oConfig,
				validationInfo: {
					maxDepth: "numeric",
					maxDelay: "numeric",
					minDelay: "numeric"
				}
			});
			jQueryDOM.extend(config, oConfig);
		}
	};
}, true);
