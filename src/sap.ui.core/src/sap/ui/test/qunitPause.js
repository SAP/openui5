/*!
 * ${copyright}
 */

/*global QUnit */
sap.ui.define("sap/ui/test/qunitPause", [
], function () {
	"use strict";

	var PAUSE_RULES = {
		NONE: "none",
		POLL: "poll"
	};
	var _pauseRule = PAUSE_RULES.NONE;
	var _bQUnitDone = false;

	function shouldPoll () {
		return _pauseRule.indexOf(PAUSE_RULES.POLL) > -1;
	}

	// checks if QUnit is done. Will call fnCallback with the result of the check.
	// iPollInterval (ms) - the time to wait before checking if QUnit is done
	function pollForQUnitDone (iPollInterval, fnCallback) {
		QUnit.begin(function () {
			_bQUnitDone = false;
		});

		var bCalled = false;
		if (!QUnit) {
			throw new Error("QUnitPause should start polling after QUnit is loaded!");
		} else if (_bQUnitDone) {
			fnCallback({
				qunitDone: true
			});
		} else if (shouldPoll()) {
			QUnit.done(function () {
				_bQUnitDone = true;
				if (!bCalled) {
					fnCallback({
						qunitDone: true
					});
				}
			});

			setTimeout(function () {
				if (!_bQUnitDone && !bCalled) {
					bCalled = true;
					fnCallback({
						qunitDone: false
					});
				}
			}, iPollInterval);
		}
	}

	function _isKnownRule (sRule) {
		var bIsKnown = false;
		for (var sKey in PAUSE_RULES) {
			if (PAUSE_RULES[sKey] === sRule) {
				bIsKnown = true;
			}
		}
		return bIsKnown;
	}
	var mResult = {
		PAUSE_RULES: PAUSE_RULES,
		shouldPoll: shouldPoll,
		pollForQUnitDone: pollForQUnitDone
	};

	Object.defineProperty(mResult, "pauseRule", {
		get: function () {
			return _pauseRule;
		},
		set: function (sRules) {
			// should accept multiple rules e.g. "timeout,assert"
			var aRules = sRules.split(",");
			_pauseRule = "";
			var sNewRule = aRules.filter(_isKnownRule).join(",");
			_pauseRule = sNewRule ? sNewRule : PAUSE_RULES.NONE;
		}
	});

	return mResult;
}, true);
