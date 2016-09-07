/*!
 * ${copyright}
 */

/*global XMLHttpRequest */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/_LogCollector"
], function ($, _LogCollector) {
	"use strict";

	var MAX_TIMEOUT_DEPTH = 3;
	var MAX_TIMEOUT_DELAY = 1000;
	var oLogger = $.sap.log.getLogger("sap.ui.test._timeoutCounter", _LogCollector.DEFAULT_LEVEL_FOR_OPA_LOGGERS);
	var mTimeouts = {};

	var fnOriginalSetTimeout = setTimeout;
	var iCurrentDepth = 0;

	window.setTimeout = function (fnCallback, iDelay) {
		var fnWrappedCallback = function () {
			iCurrentDepth = mTimeouts[iID] + 1;

			untrackTimeout(iID);
			try {
				fnCallback();
			} finally {
				iCurrentDepth = 0;
			}
		};

		// do not track long runners and call the original directly
		if (iDelay > MAX_TIMEOUT_DELAY) {
			return fnOriginalSetTimeout.apply(this, arguments);
		}

		var iID = fnOriginalSetTimeout.call(this, fnWrappedCallback, iDelay);

		mTimeouts[iID] = iCurrentDepth;

		return iID;
	};

	var fnOriginalClearTimeout = clearTimeout;

	window.clearTimeout = function (iID) {
		untrackTimeout(iID);
		return fnOriginalClearTimeout.apply(this, arguments);
	};

	function untrackTimeout (iId) {
		delete mTimeouts[iId];
	}

	return {
		hasPendingTimeouts: function () {
			var aTotalTimeouts = Object.keys(mTimeouts);
			var iNumberOfBlockingTimeouts = aTotalTimeouts.filter(function (iID) {
				return mTimeouts[iID] < MAX_TIMEOUT_DEPTH;
			}).length;
			var bHasPendingTimeouts = iNumberOfBlockingTimeouts > 0;
			if (bHasPendingTimeouts) {
				oLogger.debug("There are '" + iNumberOfBlockingTimeouts + "' open blocking Timeouts. And " + (aTotalTimeouts.length - iNumberOfBlockingTimeouts) + " non blocking timeouts");
			}
			return bHasPendingTimeouts;
		},
		untrackTimeout: untrackTimeout
	};
}, true);