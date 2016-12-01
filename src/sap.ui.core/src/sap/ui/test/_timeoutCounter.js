/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/_LogCollector"
], function ($, _LogCollector) {
	"use strict";

	var MAX_TIMEOUT_DEPTH = 3;
	var MAX_TIMEOUT_DELAY = 1000;
	var oLogger = $.sap.log.getLogger("sap.ui.test._timeoutCounter", _LogCollector.DEFAULT_LEVEL_FOR_OPA_LOGGERS);
	var mTimeouts = {};

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
				iCurrentDepth = mTimeouts[iID] + 1;

				delete mTimeouts[iID];
				try {
					fnCallback();
				} finally {
					iCurrentDepth = 0;
				}
			};

			// do not track long runners and call the original directly
			if (iDelay >= MAX_TIMEOUT_DELAY) {
				return fnOriginal.apply(this, arguments);
			}

			var iID = fnOriginal.call(this, fnWrappedCallback, iDelay);

			mTimeouts[iID] = iCurrentDepth;

			return iID;
		};

		window[sClearName] = function (iID) {
			delete mTimeouts[iID];
			return fnOriginalClear.apply(this, arguments);
		};
	}

	createTimeoutWrapper("Timeout");
	createTimeoutWrapper("Immediate");

	var iPendingPromises = 0;

	function wrapPromiseFunction (sOriginalFunctionName) {
		var fnOriginal = Promise[sOriginalFunctionName];
		Promise[sOriginalFunctionName] = function () {

			var bTooLate = false;

			// Timeout to detect long runners
			var iTimeout = setTimeout(function () {
				bTooLate = true;
				iPendingPromises--;
			}, MAX_TIMEOUT_DELAY);

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
		hasPendingTimeouts: function () {
			var aTotalTimeouts = Object.keys(mTimeouts);
			var iNumberOfBlockingTimeouts = aTotalTimeouts.filter(function (iID) {
				return mTimeouts[iID] < MAX_TIMEOUT_DEPTH;
			}).length;
			var bHasPendingTimeouts = iNumberOfBlockingTimeouts > 0;
			// promise synchronization uses setTimeout so first check the Promise then the timeout
			if (iPendingPromises > 0) {
				oLogger.debug("There are " + iPendingPromises + " pending microtasks");
				return true;
			}
			if (bHasPendingTimeouts) {
				oLogger.debug("There are '" + iNumberOfBlockingTimeouts + "' open blocking Timeouts. And " + (aTotalTimeouts.length - iNumberOfBlockingTimeouts) + " non blocking timeouts");
			}
			return bHasPendingTimeouts;
		}
	};
}, true);