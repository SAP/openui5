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
	 * Tells whether the given value is a function or object with a "then" property. These are the
	 * candidates for "thenables".
	 *
	 * @param {any} vValue
	 *   Any value
	 * @returns {boolean}
	 *   See above
	 */
	function hasThen(vValue) {
		return vValue && (typeof vValue === "function" || typeof vValue === "object")
			&& "then" in vValue;
	}

	/**
	 * Constructor for a {@link sap.ui.base.SyncPromise} which may wrap a thenable (e.g. native
	 * <code>Promise</code>) in order to observe settlement and later provide synchronous access to
	 * the result.
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
		var bCaught = false,
			iState, // undefined: pending, -1: rejected, 0: resolved but pending, 1: fulfilled
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
			iState = -1;

			if (!bCaught && SyncPromise.listener) {
				SyncPromise.listener(that, false);
			}

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
					vResult0.caught(); // might have been uncaught so far
					reject(vResult0.getResult());
					return;
				} else {
					vResult0.caught(); // make sure it will never count as uncaught
					vResult0 = vResult0.getResult(); // unwrap to access native thenable
				}
			}

			iState = 0;
			vResult = vResult0;
			if (hasThen(vResult)) {
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

		/**
		 * Marks this {@link sap.ui.base.SyncPromise} as caught and informs the optional
		 * {@link sap.ui.base.SyncPromise.listener}. Basically, it has the same effect as
		 * {@link #catch}, but with less overhead. Use it together with {@link #isRejected} and
		 * {@link #getResult} in cases where the rejection is turned into <code>throw</code>.
		 */
		this.caught = function () {
			if (!bCaught) {
				bCaught = true; // MUST NOT become uncaught later on!
				if (SyncPromise.listener && this.isRejected()) {
					SyncPromise.listener(this, true);
				}
			}
		};

		/**
		 * Returns the current "result" of this {@link sap.ui.base.SyncPromise}.
		 *
		 * @returns {any}
		 *   The result in case this {@link sap.ui.base.SyncPromise} is already fulfilled, the
		 *   reason if it is already rejected, or the wrapped thenable if it is still pending
		 */
		this.getResult = function () {
			return vResult;
		};

		/**
		 * Tells whether this {@link sap.ui.base.SyncPromise} is fulfilled.
		 *
		 * @returns {boolean}
		 *   Whether this {@link sap.ui.base.SyncPromise} is fulfilled
		 */
		this.isFulfilled = function () {
			return iState === 1;
		};

		/**
		 * Tells whether this {@link sap.ui.base.SyncPromise} is still pending.
		 *
		 * @returns {boolean}
		 *   Whether this {@link sap.ui.base.SyncPromise} is still pending
		 */
		this.isPending = function () {
			return !iState;
		};

		/**
		 * Tells whether this {@link sap.ui.base.SyncPromise} is rejected.
		 *
		 * @returns {boolean}
		 *   Whether this {@link sap.ui.base.SyncPromise} is rejected
		 */
		this.isRejected = function () {
			return iState === -1;
		};

		call(fnExecutor, resolve, reject);

		if (iState === undefined) {
			// make sure we wrap a native Promise while pending
			vResult = new Promise(function (resolve, reject) {
				fnResolve = resolve;
				fnReject = reject;
			});
			vResult.catch(function () {}); // avoid "Uncaught (in promise)"
		}
	}

	/**
	 * Returns a {@link sap.ui.base.SyncPromise} and deals with rejected cases only. Same as
	 * <code>then(undefined, fnOnRejected)</code>.
	 *
	 * @param {function} [fnOnRejected]
	 *   Callback function if this {@link sap.ui.base.SyncPromise} is rejected
	 * @returns {sap.ui.base.SyncPromise}
	 *   A new {@link sap.ui.base.SyncPromise}, or <code>this</code> in case it is settled and no
	 *   corresponding callback function is given
	 *
	 * @see #then
	 */
	SyncPromise.prototype.catch = function (fnOnRejected) {
		return this.then(undefined, fnOnRejected);
	};

	/**
	 * Returns a {@link sap.ui.base.SyncPromise} and calls the given handler as applicable, like
	 * <code>Promise.prototype.then</code>. This {@link sap.ui.base.SyncPromise} is marked as
	 * {@link #caught} unless <code>this</code> is returned. Note that a new
	 * {@link sap.ui.base.SyncPromise} returned from this method may already be rejected, but not
	 * yet caught.
	 *
	 * @param {function} [fnOnFulfilled]
	 *   Callback function if this {@link sap.ui.base.SyncPromise} is fulfilled
	 * @param {function} [fnOnRejected]
	 *   Callback function if this {@link sap.ui.base.SyncPromise} is rejected
	 * @returns {sap.ui.base.SyncPromise}
	 *   A new {@link sap.ui.base.SyncPromise}, or <code>this</code> in case it is settled and no
	 *   corresponding callback function is given
	 */
	SyncPromise.prototype.then = function (fnOnFulfilled, fnOnRejected) {
		var fnCallback = this.isFulfilled() ? fnOnFulfilled : fnOnRejected,
			bCallbackIsFunction = typeof fnCallback === "function",
			bPending = this.isPending(),
			that = this;

		if (bPending || bCallbackIsFunction) {
			this.caught();
		} // else: returns this

		if (!bPending) {
			return bCallbackIsFunction
				? new SyncPromise(function (resolve, reject) {
					resolve(fnCallback(that.getResult())); // Note: try/catch is present in c'tor!
				})
				: this;
		}
		return SyncPromise.resolve(this.getResult().then(fnOnFulfilled, fnOnRejected));
	};

	/**
	 * Returns a string representation of this {@link sap.ui.base.SyncPromise}. If it is resolved, a
	 * string representation of the result is returned; if it is rejected, a string representation
	 * of the reason is returned.
	 *
	 * @return {string} A string description of this {@link sap.ui.base.SyncPromise}
	 */
	SyncPromise.prototype.toString = function () {
		if (this.isPending()) {
			return "SyncPromise: pending";
		}
		return String(this.getResult());
	};

	/**
	 * Returns a new {@link sap.ui.base.SyncPromise} for the given array of values just like
	 * <code>Promise.all(aValues)</code>.
	 *
	 * @param {any[]} aValues
	 *   The values as an iterable object such as an <code>Array</code> or <code>String</code>
	 *   which is supported by <code>Array.prototype.slice</code>
	 * @returns {sap.ui.base.SyncPromise}
	 *   The {@link sap.ui.base.SyncPromise}
	 */
	SyncPromise.all = function (aValues) {
		return new SyncPromise(function (resolve, reject) {
			var iPending; // number of pending promises

			function checkFulfilled() {
				if (iPending === 0) {
					resolve(aValues); // Note: 1st reject/resolve wins!
				}
			}

			aValues = Array.prototype.slice.call(aValues);
			iPending = aValues.length;
			checkFulfilled();
			aValues.forEach(function (vValue, i) {
				if (hasThen(vValue)) {
					SyncPromise.resolve(vValue).then(function (vResult0) {
						aValues[i] = vResult0;
						iPending -= 1;
						checkFulfilled();
					}, function (vReason) {
						reject(vReason); // Note: 1st reject/resolve wins!
					});
				} else { // cannot be a "thenable"
					iPending -= 1;
					checkFulfilled();
				}
			});
		});
	};

	/**
	 * Optional listener function which is called with a {@link sap.ui.base.SyncPromise} instance
	 * and a boolean flag telling whether that instance became "caught" or not. An instance becomes
	 * "uncaught" as soon as it is rejected and not yet "caught". It becomes "caught" as soon as an
	 * "fnOnRejected" handler is given to {@link #then} for the first time.
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.base.SyncPromise.listener
	 * @param {sap.ui.base.SyncPromise} oSyncPromise
	 *   A rejected {@link sap.ui.base.SyncPromise}
	 * @param {boolean} bCaught
	 *   <code>false</code> if the {@link sap.ui.base.SyncPromise} instance just became "uncaught",
	 *   <code>true</code> if it just became "caught"
	 */

	/**
	 * Returns a new {@link sap.ui.base.SyncPromise} that is rejected with the given reason.
	 *
	 * @param {any} [vReason]
	 *   The reason for rejection
	 * @returns {sap.ui.base.SyncPromise}
	 *   The {@link sap.ui.base.SyncPromise}
	 */
	SyncPromise.reject = function (vReason) {
		return new SyncPromise(function (resolve, reject) {
			reject(vReason);
		});
	};

	/**
	 * Returns <code>vResult</code> if it is already a {@link sap.ui.base.SyncPromise}, or a new
	 * {@link sap.ui.base.SyncPromise} wrapping the given thenable <code>vResult</code> or
	 * fulfilling with the given result.
	 *
	 * @param {any} [vResult]
	 *   The thenable to wrap or the result to synchronously fulfill with
	 * @returns {sap.ui.base.SyncPromise}
	 *   The {@link sap.ui.base.SyncPromise}
	 */
	SyncPromise.resolve = function (vResult) {
		return vResult instanceof SyncPromise
			? vResult
			: new SyncPromise(function (resolve, reject) {
				resolve(vResult);
			});
	};

	return SyncPromise;
}, /* bExport= */ true);
