/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global"
], function (jQuery) {
	"use strict";

	/*
	 * @see https://promisesaplus.com
	 *
	 * 2.3.3.3. If then is a function, call it with x as this, first argument resolvePromise, and
	 * second argument rejectPromise, where:
	 * 2.3.3.3.1. If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
	 * 2.3.3.3.2. If/when rejectPromise is called with a reason r, reject promise with r.
	 * 2.3.3.3.3. If both resolvePromise and rejectPromise are called, or multiple calls to the same
	 * argument are made, the first call takes precedence, and any further calls are ignored.
	 * 2.3.3.3.4. If calling then throws an exception e,
	 * 2.3.3.3.4.1. If resolvePromise or rejectPromise have been called, ignore it.
	 * 2.3.3.3.4.2. Otherwise, reject promise with e as the reason.
	 *
	 * @param {function} fnThen
	 *   The "then" function
	 * @param {function} resolve
	 *   The [[Resolve]](promise, .) function
	 * @param {function} reject
	 *   The "reject" function
	 */
	function call(fnThen, resolve, reject) {
		var bOnce;

		/*
		 * @param {any} [vReason]
		 *   The reason for rejection
		 */
		function rejectPromise(vReason) {
			if (!bOnce) {
				bOnce = true;
				reject(vReason);
			}
		}

		/*
		 * @param {any} [vResult]
		 *   The thenable to wrap or the result to synchronously fulfill with
		 */
		function resolvePromise(vResult) {
			if (!bOnce) {
				bOnce = true;
				resolve(vResult);
			}
		}

		try {
			fnThen(resolvePromise, rejectPromise);
		} catch (e) {
			rejectPromise(e);
		}
	}

	/**
	 * Constructor for a SyncPromise which may wrap a thenable (e.g. native <code>Promise</code>)
	 * in order to observe settlement and provide synchronous access to the result.
	 *
	 * Implements https://promisesaplus.com except "2.2.4. onFulfilled or onRejected must not be
	 * called until the execution context stack contains only platform code."
	 *
	 * @param {function} fnExecutor
	 *   A function that is passed with the arguments resolve and reject...
	 *
	 * @private
	 * @ui5-restricted sap.ui.core,sap.ui.dt,sap.ui.model
	 */
	function SyncPromise(fnExecutor) {
		var iState, // undefined: pending, -1: rejected, 0: resolved but pending, 1: fulfilled
			fnReject,
			fnResolve,
			vResult,
			that = this;

		/*
		 * @param {any} [vReason]
		 *   The reason for rejection
		 */
		function reject(vReason) {
			vResult = vReason;
			jQuery.sap.assert(!iState, function () {
				return "Must not reject with " + vReason
					+ "; iState = " + iState + ", vResult = " + vResult;
			});
			iState = -1;
			if (fnReject) {
				fnReject(vReason);
				fnReject = fnResolve = null; // be nice to the garbage collector
			}
		}

		/*
		 * @param {any} [vResult0]
		 *   The thenable to wrap or the result to synchronously fulfill with
		 */
		function resolve(vResult0) {
			var fnThen;

			if (vResult0 === that) {
				reject(new TypeError("A promise cannot be resolved with itself."));
				return;
			}
			if (vResult0 instanceof SyncPromise) {
				if (vResult0.isFulfilled()) {
					resolve(vResult0.getResult());
					return;
				} else if (vResult0.isRejected()) {
					reject(vResult0.getResult());
					return;
				} else { // unwrap to access native thenable
					vResult0 = vResult0.getResult();
				}
			}
			jQuery.sap.assert(!iState, function () {
				return "Must not resolve with " + vResult0
					+ "; iState = " + iState + ", vResult = " + vResult;
			});

			iState = 0;
			vResult = vResult0;
			if (vResult && (typeof vResult === "function" || typeof vResult === "object")) {
				try {
					fnThen = vResult.then;
				} catch (e) {
					// 2.3.3.2. If retrieving the property x.then results in a thrown exception e,
					// reject promise with e as the reason.
					reject(e);
					return;
				}
				if (typeof fnThen === "function") {
					call(fnThen.bind(vResult), resolve, reject);
					return;
				}
			}
			iState = 1;
			if (fnResolve) {
				fnResolve(vResult);
				fnReject = fnResolve = null; // be nice to the garbage collector
			}
		}

		call(fnExecutor, resolve, reject);

		if (iState === undefined) {
			// make sure we wrap a native Promise while pending
			vResult = new Promise(function (resolve, reject) {
				fnResolve = resolve;
				fnReject = reject;
			});
			vResult.catch(function () {}); // avoid "Uncaught (in promise)"
		}

		/**
		 * Returns the current "result" of this {@link SyncPromise}.
		 *
		 * @returns {any}
		 *   The result in case this {@link SyncPromise} is already fulfilled, the reason if it is
		 *   already rejected, or the wrapped thenable if it is still pending
		 */
		this.getResult = function () {
			return vResult;
		};

		/**
		 * Tells whether this {@link SyncPromise} is fulfilled.
		 *
		 * @returns {boolean}
		 *   Whether this {@link SyncPromise} is fulfilled
		 */
		this.isFulfilled = function () {
			return iState === 1;
		};

		/**
		 * Tells whether this {@link SyncPromise} is still pending.
		 *
		 * @returns {boolean}
		 *   Whether this {@link SyncPromise} is still pending
		 */
		this.isPending = function () {
			return !iState;
		};

		/**
		 * Tells whether this {@link SyncPromise} is rejected.
		 *
		 * @returns {boolean}
		 *   Whether this {@link SyncPromise} is rejected
		 */
		this.isRejected = function () {
			return iState === -1;
		};
	}

	/**
	 * Returns a {@link SyncPromise} and deals with rejected cases only.
	 * Same as <code>then(undefined, fnOnRejected)</code>.
	 *
	 * @param {function} [fnOnRejected]
	 *   Callback function if this {@link SyncPromise} is rejected
	 * @returns {SyncPromise}
	 *   A new {@link SyncPromise}, or <code>this</code> in case it is settled and no corresponding
	 *   callback function is given
	 *
	 * @see #then
	 */
	SyncPromise.prototype.catch = function (fnOnRejected) {
		return this.then(undefined, fnOnRejected);
	};

	/**
	 * Returns a {@link SyncPromise} and calls the given handler as applicable, like
	 * <code>Promise.prototype.then</code>.
	 *
	 * @param {function} [fnOnFulfilled]
	 *   Callback function if this {@link SyncPromise} is fulfilled
	 * @param {function} [fnOnRejected]
	 *   Callback function if this {@link SyncPromise} is rejected
	 * @returns {SyncPromise}
	 *   A new {@link SyncPromise}, or <code>this</code> in case it is settled and no corresponding
	 *   callback function is given
	 */
	SyncPromise.prototype.then = function (fnOnFulfilled, fnOnRejected) {
		var fnCallback = this.isFulfilled() ? fnOnFulfilled : fnOnRejected,
			that = this;

		if (!this.isPending()) {
			return typeof fnCallback === "function"
				? new SyncPromise(function (resolve, reject) {
					resolve(fnCallback(that.getResult())); // Note: try/catch is present in c'tor!
				})
				: that;
		}
		return SyncPromise.resolve(this.getResult().then(fnOnFulfilled, fnOnRejected));
	};

	/**
	 * Returns a string representation of this {@link SyncPromise}. If it is resolved, a string
	 * representation of the result is returned; if it is rejected, a string representation of the
	 * reason is returned.
	 *
	 * @return {string} A string description of this {@link SyncPromise}
	 */
	SyncPromise.prototype.toString = function () {
		if (this.isPending()) {
			return "SyncPromise: pending";
		}
		return String(this.getResult());
	};

	/**
	 * Returns a new {@link SyncPromise} for the given array of values just like
	 * <code>Promise.all(aValues)</code>.
	 *
	 * @param {any[]} aValues
	 *   The values
	 * @returns {SyncPromise}
	 *   The {@link SyncPromise}
	 */
	SyncPromise.all = function (aValues) {
		return new SyncPromise(function (resolve, reject) {
			var iPending = aValues.length; // number of pending promises

			function checkFulfilled() {
				if (iPending === 0) {
					resolve(aValues); // Note: 1st reject/resolve wins!
				}
			}

			checkFulfilled();
			aValues = Array.prototype.slice.call(aValues);
			aValues.forEach(function (oValue, i) {
				SyncPromise.resolve(oValue).then(function (vResult0) {
					aValues[i] = vResult0;
					iPending -= 1;
					checkFulfilled();
				}, function (vReason) {
					reject(vReason); // Note: 1st reject/resolve wins!
				});
			});
		});
	};

	/**
	 * Returns a new {@link SyncPromise} that is rejected with the given reason.
	 *
	 * @param {any} [vReason]
	 *   The reason for rejection
	 * @returns {SyncPromise}
	 *   The {@link SyncPromise}
	 */
	SyncPromise.reject = function (vReason) {
		return new SyncPromise(function (resolve, reject) {
			reject(vReason);
		});
	};

	/**
	 * Returns <code>vResult</code> if it is already a {@link SyncPromise}, or a new
	 * {@link SyncPromise} wrapping the given thenable <code>vResult</code> or fulfilling with the
	 * given result.
	 *
	 * @param {any} [vResult]
	 *   The thenable to wrap or the result to synchronously fulfill with
	 * @returns {SyncPromise}
	 *   The {@link SyncPromise}
	 */
	SyncPromise.resolve = function (vResult) {
		return vResult instanceof SyncPromise
			? vResult
			: new SyncPromise(function (resolve, reject) {
				resolve(vResult);
			});
	};

	return SyncPromise;
}/*, bExport = false*/);
