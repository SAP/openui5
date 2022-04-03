/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/autowaiter/_utils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/test/autowaiter/_timeoutWaiter",
	"./WaiterBase"
], function (_utils, jQueryDOM, _timeoutWaiter, WaiterBase) {
	"use strict";

	var aPromises = [];
	var OriginalPromise = window.Promise; // save it to avoid 'max call stack exceeded'
	var aStaticMethods = ["resolve", "reject", "all", "race", "allSettled"];
	var thenMicrotaskPromise;	// defined only during .then() call

	var PromiseWaiter = WaiterBase.extend("sap.ui.test.autowaiter._promiseWaiter", {
		hasPending: function () {
			var aPendingPromises = aPromises.filter(function (mPromise) {
				return !!mPromise.pending && !_isPolling(mPromise);
			});

			if (aPendingPromises.length > 0) {
				var sLogMessage = "There are " + aPendingPromises.length + " pending promises\n";
				aPendingPromises.forEach(function (mPromise) {
					sLogMessage += _createLogForPromise(mPromise);
				});
				oPromiseWaiter._oHasPendingLogger.debug(sLogMessage);
			}

			return aPendingPromises.length > 0;
		},
		_getDefaultConfig: function () {
			return jQueryDOM.extend({
				maxDelay: 1000 // milliseconds; should be at least as big as _timeoutWaiter maxDelay
			}, WaiterBase.prototype._getDefaultConfig.call(this));
		},
		_getValidationInfo: function () {
			return jQueryDOM.extend({
				maxDelay: "numeric"
			}, WaiterBase.prototype._getValidationInfo.call(this));
		}
	});
	var oPromiseWaiter = new PromiseWaiter();

	// register the extended initiator resolver that "sees" over promise .then()
	_timeoutWaiter._registerInitiatorResolverId(function() {
		return thenMicrotaskPromise ? thenMicrotaskPromise.completorTimeoutId : undefined;
	});

	function _createLogForPromise(mPromise) {
		return "\nPromise: Args: " + mPromise.args + "\n Stack: " + mPromise.stack;
	}

	function _resolveInitiatorTimeoutId() {
		var initiatorTimeoutId = _timeoutWaiter._getInitiatorId();
		if (!initiatorTimeoutId && thenMicrotaskPromise) {
			initiatorTimeoutId = thenMicrotaskPromise.completorTimeoutId;
		}
		return initiatorTimeoutId;
	}

	function _resolveCompletorTimeoutId() {
		var completorTimeoutId = _timeoutWaiter._getInitiatorId();
		return completorTimeoutId;
	}

	function _trackPromise(sArguments) {
		var mPendingPromise = {
			args: sArguments,
			stack: _utils.resolveStackTrace(),
			pending: true,
			tooLate: false,
			initiatorTimeoutId: _resolveInitiatorTimeoutId(),
			longRunnerTimeoutId: setTimeout(function () {
				// Timeout to detect long runners
				mPendingPromise.tooLate = true;
				mPendingPromise.pending = false;
				oPromiseWaiter._oLogger.trace("Long-running promise is ignored:" + _createLogForPromise(mPendingPromise));
			}, oPromiseWaiter._mConfig.maxDelay,'TIMEOUT_WAITER_IGNORE')
		};

		oPromiseWaiter._oLogger.trace("New pending promise:" + _createLogForPromise(mPendingPromise));
		aPromises.push(mPendingPromise);

		return mPendingPromise;
	}

	function _untrackPromise(mPendingPromise) {
		if (!mPendingPromise) {
			return;
		}
		// if initiatorId was not resolved initially, like in .then(new Promise) initial case, we will save it on resolve()
		mPendingPromise.completorTimeoutId = _resolveCompletorTimeoutId();
		mPendingPromise.endTime = Date.now();
		if (mPendingPromise.tooLate) {
			// the timeout already counted down - do nothing
			return;
		} else {
			// count down and clear the timeout to make sure it is only counted down once
			mPendingPromise.pending = false;
			oPromiseWaiter._oLogger.trace("Promise complete:" + _createLogForPromise(mPendingPromise));
			clearTimeout(mPendingPromise.longRunnerTimeoutId);
		}
	}

	function _isPolling(mCurrentPromise) {
		// any promise created from polling timeout is assumed to be polling
		if (mCurrentPromise.initiatorTimeoutId && _timeoutWaiter._isPolling(mCurrentPromise.initiatorTimeoutId)) {
			oPromiseWaiter._oLogger.trace("Polling promise is ignored:" + _createLogForPromise(mCurrentPromise));
			return true;
		}
		return false;
	}

	var WrappedPromise = function (fnOriginalExecutor, tracking) {
		var mPendingPromise;

		var fnWrappedExecutor = function (fnOriginalResolve, fnOriginalReject) {
			var sArguments = _utils.functionToString(fnOriginalExecutor);

			if (window.ES6Promise && sArguments === "'function noop() {}'") {
				oPromiseWaiter._oLogger.trace("Ignoring internal constructor of ES6 Promise polyfill");
				return fnOriginalExecutor(fnOriginalResolve, fnOriginalReject);
			} else if (sArguments === "'function () { [native code] }'") {
				oPromiseWaiter._oLogger.trace("Ignoring internal Promise constructor");
				return fnOriginalExecutor(fnOriginalResolve, fnOriginalReject);
			} else if (tracking === "PROMISE_WAITER_IGNORE") {
				oPromiseWaiter._oLogger.trace("Ignoring Promise marked to ignore");
				return fnOriginalExecutor(fnOriginalResolve, fnOriginalReject);
			} else {
				mPendingPromise = _trackPromise(sArguments);
				var fnWrappedResolve = function wrappedResolve () {
					_untrackPromise(mPendingPromise);
					fnOriginalResolve.apply(this, arguments);
				};
				var fnWrappedReject = function wrappedReject() {
					_untrackPromise(mPendingPromise);
					fnOriginalReject.apply(this, arguments);
				};
				// call the original function which does the promised async work
				return fnOriginalExecutor(fnWrappedResolve, fnWrappedReject);
			}
		};

		// create a Promise instance with the wrapped resolution and rejection functions
		var wrappedPromiseInstance = new OriginalPromise(fnWrappedExecutor);

		// override .then() method of the promise instance so we can track
		function _wrapPromiseInstanceThen(promiseInstance) {
			var fnOriginalThen = promiseInstance.then;

			promiseInstance.then = function wrappedThen(fnOriginalResolvedCallback,fnOriginalRejectedCallback) {

				var wrappedThenCallback = fnOriginalResolvedCallback;
				if (fnOriginalResolvedCallback) {
					var wrappedThenCallback = function wrappedThenCallback() {
						// save current promise in a global var so that everyonme down the call stack in the current microtask can use it
						thenMicrotaskPromise = mPendingPromise;
						var fnOriginalThenCallbackResult = fnOriginalResolvedCallback.apply(this,arguments);
						thenMicrotaskPromise = undefined;
						return fnOriginalThenCallbackResult;
					};
				}

				var fnOriginalThenResult = fnOriginalThen.apply(this,[wrappedThenCallback,fnOriginalRejectedCallback]);

				// thenResult is a naitive promise and we need to override the .then() method again to cover the promise chaining scenario
				//return _wrapPromiseInstanceThen(fnOriginalThenResult);
				return fnOriginalThenResult;
			};

			return promiseInstance;
		}

		// return the wrapped promise
		return _wrapPromiseInstanceThen(wrappedPromiseInstance);
	};

	// copy instance methods (then, catch, finally).
	// make the prototype directly equal to the OriginalPromise prototype because we want
	// all old and new promise instances to be instanceof the OriginalPromise (to avoid type runtime errors)
	WrappedPromise.prototype = OriginalPromise.prototype;
	WrappedPromise.prototype.constructor = WrappedPromise;

	// add wrapped static methods
	aStaticMethods.forEach(function (sFunction) {
		if (OriginalPromise[sFunction]) {
			WrappedPromise[sFunction] = OriginalPromise[sFunction];
		}
	});

	// overwrite the global Promise object
	window.Promise = WrappedPromise;

	return oPromiseWaiter;
}, true);