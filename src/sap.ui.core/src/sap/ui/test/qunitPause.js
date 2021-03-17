/*!
 * ${copyright}
 */

/*global QUnit */
sap.ui.define("sap/ui/test/qunitPause", [
], function () {
	"use strict";

	var PAUSE_RULES = {
		NONE: "none",
		TIMEOUT: "timeout",
		ASSERT: "assert",
		POLL: "poll"
	};
	var mTestTimeouts = {};
	var _mListeners = {
		pause: [],
		resume: []
	};
	var _mTestTimeout = {};
	var paused = false;
	var _pauseRule = PAUSE_RULES.NONE;
	var _bQUnitDone = false;

	function shouldPause () {
		return _pauseRule !== PAUSE_RULES.NONE && _pauseRule !== PAUSE_RULES.POLL;
	}

	function shouldPauseOnAssert () {
		return _pauseRule.indexOf(PAUSE_RULES.ASSERT) > -1;
	}

	function shouldPoll () {
		return _pauseRule.indexOf(PAUSE_RULES.POLL) > -1;
	}

	function isQUnit2 () {
		return QUnit.test.length === 2;
	}

	// hook into QUnit timeout.
	// should be called before QUnit is loaded
	function setupBeforeQUnit () {
		var fnOriginal = window.setTimeout;
		window.setTimeout = function wrappedSetTimeout (fnCallback, iDelay) {
			var iId = fnOriginal.apply(null, arguments);
			mTestTimeouts[iId] = {
				delay: iDelay || 0,
				callback: fnCallback,
				startTime: Date.now()
			};
			return iId;
		};
	}

	// hook into QUnit assertions.
	// should be called after QUnit is loaded e.g. in opaQunit
	function setupAfterQUnit () {
		var sPushMethod = isQUnit2() ? "pushResult" : "push";
		var origPush = QUnit.assert[sPushMethod];

		QUnit.assert[sPushMethod] = function () {
			var that = this;
			var aAssertArgs = arguments;
			var bPassed = isQUnit2() ? arguments[0].result : arguments[0];
			var bIsOpaTest = that.test && sap.ui.test && sap.ui.test.Opa && sap.ui.test.Opa.config.testName === that.test.testName;

			// if this is an OPA test and the rule says to pause - add a new promise to the OPA queue.
			// assuming that the assert is inside a success function,
			// the promise will be executed after the success and before other promises in the test
			if (bIsOpaTest && !bPassed && shouldPauseOnAssert()) {
				// - assertions are supposed to be added in a success; waitfors added in success are pushed to top of the queue -> this should be the very next waitfor after a fail
				// - on timeout an assertion result is pushed -> test is paused
				// - there is only one queue - it's ok to create a new Opa
				var oOpa = new sap.ui.test.Opa();
				var bPromisePending = true;

				emitPause();

				var oPausePromise = new Promise(function (resolve) {
					onResume(function () {
						if (bPromisePending) {
							bPromisePending = false;
							resolve();
						}
					});
					// the error message should be visible between pause and resume
					// => first add the assertion, then pause
					origPush.apply(that, aAssertArgs);
				});
				oOpa.iWaitForPromise(oPausePromise);
			} else {
				origPush.apply(that, aAssertArgs);
			}
		};
	}

	// QUnit (or OPA) should never timeout while the test is 'paused'
	// i.e. OPA should wait until 'resume' is called, and not timeout, even if OpaTimeout is reached.
	// => override the QUnit timeout function.
	// should be called at the beginning of test execution - right before Opa.emptyQueue()
	function setupBeforeOpaTest () {
		if (shouldPause()) {
			_mTestTimeout = mTestTimeouts[QUnit.config.timeout];
			if (!_mTestTimeout) {
				throw new Error("QUnitPause should be loaded before QUnit!");
			}

			_mTestTimeout.originalCallback = _mTestTimeout.callback;
			_mTestTimeout.callback = function () {

				emitPause();

				onResume(function () {
					// reduce the timeout with the time that has already elapsed
					var iNewTestTimeout = Math.max(0, _mTestTimeout.delay - (Date.now() - _mTestTimeout.startTime));
					// set a new timeout after 'resume'
					QUnit.config.timeout = setTimeout(_mTestTimeout.originalCallback, iNewTestTimeout);
				});
			};

			// clear the 'original' QUnit timeout and override it
			clearTimeout(QUnit.config.timeout);
			QUnit.config.timeout = setTimeout(_mTestTimeout.callback, QUnit.config.testTimeout);
			// clean up
			mTestTimeouts = {};
		}
	}

	function onPause () {
		return _addListener("pause").apply(this, arguments);
	}

	function onResume () {
		return _addListener("resume").apply(this, arguments);
	}

	function emitPause () {
		// pause only once and only if the rules require it
		if (shouldPause() && !paused) {
			paused = true;
			_callListeners("pause");
			// stop QUnit from timing out while the test is 'paused'
			clearTimeout(QUnit.config.timeout);
		} else if (!shouldPauseOnAssert()) {
			// if pausing on assert and already paused: assert failures may happen multiple times per waitFor -> just wait for the previous pause-on-assert to finish.
			// else (i.e. pause on timeout): call any attached listeners
			setTimeout(function () {
				emitResume();
			}, 0);
		}
	}

	function emitResume () {
		_callListeners("resume", true);
		paused = false;
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

	function _addListener (sEvent) {
		return function (fnCallback, vThis, aArgs) {
			_mListeners[sEvent].push({
				cb: fnCallback,
				context: vThis,
				args: aArgs,
				called: false // call each listener only once
			});
		};
	}

	function _callListeners (sEvent, bCallOnce) {
		_mListeners[sEvent].forEach(function (mListener) {
			if (!bCallOnce || !mListener.called) {
				mListener.cb.apply(mListener.context, mListener.args);
				mListener.called = true;
			}
		});
	}

	return {
		PAUSE_RULES: PAUSE_RULES,
		paused: paused,
		get pauseRule() {
			return _pauseRule;
		},
		set pauseRule(sRules) {
			// should accept multiple rules e.g. "timeout,assert"
			var aRules = sRules.split(",");
			_pauseRule = "";
			var sNewRule = aRules.filter(_isKnownRule).join(",");
			_pauseRule = sNewRule ? sNewRule : PAUSE_RULES.NONE;
		},
		shouldPause: shouldPause,
		shouldPauseOnAssert: shouldPauseOnAssert,
		shouldPoll: shouldPoll,
		setupAfterQUnit: setupAfterQUnit,
		setupBeforeQUnit: setupBeforeQUnit,
		setupBeforeOpaTest: setupBeforeOpaTest,
		onPause: onPause,
		onResume: onResume,
		emitPause: emitPause,
		emitResume: emitResume,
		pollForQUnitDone: pollForQUnitDone
	};
}, true);
