/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/extend",
	"sap/ui/test/autowaiter/_utils",
	"./WaiterBase"
], function(extend, _utils, WaiterBase) {
	"use strict";

	var mTimeouts = {};
	var timeoutStatus = {
		TRACKED: "TRACKED",
		STARTER: "STARTED",
		FINISHED: "FINISHED",
		CLEARED: "CLEARED"
	};
	var fnInitiatorResolver;

	// initiatorId is the timeout id of the currently running timeout callback
	// for opa poll frame, will have the ID of the poll timeout
	// undefined means this is native event frame
	var iInitiatorId;

	var TimeoutWaiter = WaiterBase.extend("sap.ui.test.autowaiter._timeoutWaiter", {
		hasPending: function () {
			var aBlockingTimeoutIds = Object.keys(mTimeouts).filter(function (iID) {
				return isBlocking(iID);
			});
			var bHasBlockingTimeouts = aBlockingTimeoutIds.length > 0;
			logTrackedTimeouts(aBlockingTimeoutIds);
			return bHasBlockingTimeouts;
		},
		_getDefaultConfig: function () {
			return extend({
				maxDepth: 1, 		// count
				maxDelay: 1000, 	// milliseconds
				minDelay: 10 		// milliseconds
			}, WaiterBase.prototype._getDefaultConfig.call(this));
		},
		_getValidationInfo: function () {
			return extend({
				maxDepth: "numeric",
				maxDelay: "numeric",
				minDelay: "numeric"
			}, WaiterBase.prototype._getValidationInfo.call(this));
		},

		// private API used by the proimiseWaiter for detecting polling promises

		// return the current execution timeoutId or undefined if not currently in tracked timeout callback
		_getInitiatorId: function() {
			return iInitiatorId;
		},
		_isPolling: function(timeoutId) {
			return !isExecutionFlow(timeoutId);
		},
		_registerInitiatorResolverId: function(fnInitiatorResolverCallback) {
			fnInitiatorResolver = fnInitiatorResolverCallback;
		}
	});
	var oTimeoutWaiter = new TimeoutWaiter();

	function _resolveInitiatorId() {
		if (iInitiatorId) {
			return iInitiatorId;
		}
		if (fnInitiatorResolver) {
			return fnInitiatorResolver();
		}
	}

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
				initiator: _resolveInitiatorId(),
				func: _utils.functionToString(fnCallback),
				stack: _utils.resolveStackTrace(),
				status: timeoutStatus.TRACKED
			};
			var iID;

			// some timeouts do not need to be tracked, like the timeout for long-running promises
			if (tracking && tracking === 'TIMEOUT_WAITER_IGNORE') {
				iID = fnOriginal.apply(null, [fnCallback, iDelay].concat(aCallbackArgs.slice(1)));
				oTimeoutWaiter._oLogger.trace("Timeout with ID " + iID + " should not be tracked. " +
					" Delay: " + iDelay +
					" Initiator: " + iInitiatorId);

				return iID;
			}

			var fnWrappedCallback = function wrappedCallback() {
				// workaround for FF: the mTimeouts[iID] is sometimes cleaned by GC before it is released
				var oCurrentTimeout = mTimeouts[iID];
				if (!oCurrentTimeout) {
					oTimeoutWaiter._oLogger.trace("Timeout data for timeout with ID " + iID + " disapered unexpectedly");
					oCurrentTimeout = {};
				}
				iInitiatorId = iID;

				oTimeoutWaiter._oLogger.trace("Timeout with ID " + iID + " started");
				oCurrentTimeout.status = timeoutStatus.STARTED;
				try {
					fnCallback.apply(window, aCallbackArgs);
				} finally {
					iInitiatorId = undefined;
				}
				oTimeoutWaiter._oLogger.trace("Timeout with ID " + iID + " finished");
				oCurrentTimeout.status = timeoutStatus.FINISHED;
			};

			iID = fnOriginal.apply(null, [fnWrappedCallback, iDelay].concat(aCallbackArgs));
			oTimeoutWaiter._oLogger.trace("Timeout with ID " + iID + " is tracked. " +
				" Delay: " + iDelay +
				" Initiator: " + iInitiatorId);
			mTimeouts[iID] = oNewTimeout;

			return iID;
		};

		window[sClearName] = function wrappedClearTimeout(iID) {
			if (!iID) {
				oTimeoutWaiter._oLogger.trace("Could not clean timeout with invalid ID: " + iID);
				return;
			}

			var oCurrentTimeout = mTimeouts[iID];
			if (!oCurrentTimeout) {
				oTimeoutWaiter._oLogger.trace("Timeout data for timeout with ID " + iID + " disapered unexpectedly or timeout was not tracked intentionally");
				oCurrentTimeout = {};
			}

			oCurrentTimeout.status = timeoutStatus.CLEARED;
			oTimeoutWaiter._oLogger.trace("Timeout with ID " + iID + " cleared");
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
		oTimeoutWaiter._oHasPendingLogger.debug(sLogMessage);

		// log all tracked timeouts at trace
		var sTraceLogMessage = "Tracked timeouts";
		aTimeoutIds.forEach(function (iTimeoutID) {
			sTraceLogMessage += createLogForTimeout(iTimeoutID, mTimeouts[iTimeoutID],aBlockingTimeoutIds.some(function(currentValue){
				return currentValue == iTimeoutID;
			}),true);
		});
		oTimeoutWaiter._oHasPendingLogger.trace(sTraceLogMessage);
	}

	function isBlocking(iID) {
		var oCurrentTimeout = mTimeouts[iID];
		// we do not care for finished timeouts
		if (oCurrentTimeout.status !== timeoutStatus.TRACKED){
			return false;
		}

		// long runnes are some application level timeouts => we do not care for them
		if (oCurrentTimeout.delay > oTimeoutWaiter._mConfig.maxDelay) {
			return false;
		}

		// zero or up to some small delay timeouts are definitely execution flow so must be waited
		if (oCurrentTimeout.delay > oTimeoutWaiter._mConfig.minDelay) {
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
				if (depth >= oTimeoutWaiter._mConfig.maxDepth) {
					return false;
				}
				return isExecutionFlow(oCurrentTimeout.initiator,depth + 1);
			}
		}
		return true;
	}

	return oTimeoutWaiter;
}, true);
