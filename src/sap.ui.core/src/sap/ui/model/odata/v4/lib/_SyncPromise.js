/*!
 * ${copyright}
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * Constructor for a SyncPromise to wrap the given promise in order to observe settlement and
	 * provide synchronous access to the result.
	 *
	 * Implements https://github.com/promises-aplus/promises-spec except:
	 * <ul>
	 * <li> "4. onFulfilled or onRejected
	 * must not be called until the execution context stack contains only platform code."
	 * <li> Interoperability is limited to <code>Promise</code> instances (use
	 * <code>Promise.resolve</code> to wrap e.g. a <code>jQuery.Deferred</code> instance).
	 * </ul>
	 *
	 * @param {Promise|SyncPromise|any} oPromise
	 *   The promise to wrap or the result to synchronously fulfill with
	 * @param {function} [fnCallback]
	 *   Function to apply to the result of the SyncPromise to be wrapped
	 * @param {any[]} [aValues]
	 *   The values to be combined via the static method <code>SyncPromise.all</code>
	 * @returns {SyncPromise}
	 *   The SyncPromise created
	 */
	function SyncPromise(oPromise, fnCallback, aValues) {
		var bFulfilled = false,
			iPending,
			bRejected = false,
			that = this,
			vResult = that; // "pending"

		// needed for SyncPromise.all()
		function checkFulfilled() {
			if (iPending === 0) {
				vResult = aValues;
				bFulfilled = true;
			}
		}

		if (aValues) {
			iPending = aValues.length; // number of pending promises
			checkFulfilled();
			aValues.forEach(function (oValue, i) {
				resolve(oValue).then(function (vResult0) {
					aValues[i] = vResult0;
					iPending -= 1;
					checkFulfilled();
				}, function (vReason) {
					if (!bRejected) {
						vResult = vReason;
						bRejected = true;
					}
				});
			});
		} else if (typeof fnCallback === "function") {
			try {
				vResult = fnCallback(oPromise.getResult());
				bFulfilled = true;
				oPromise = null; // be nice to the garbage collector
				if (vResult instanceof Promise || vResult instanceof SyncPromise) {
					return new SyncPromise(vResult);
				}
			} catch (e) {
				vResult = e;
				bRejected = true;
				oPromise = null;
			}
		} else if (oPromise instanceof Promise || oPromise instanceof SyncPromise) {
			oPromise.then(function (vResult0) {
				vResult = vResult0;
				bFulfilled = true;
				oPromise = null;
			}, function (vReason) {
				vResult = vReason;
				bRejected = true;
				oPromise = null;
			});
		} else {
			vResult = oPromise;
			bFulfilled = true;
		}

		/**
		 * @param {function} [fnOnRejected]
		 *   Callback function if this SyncPromise is rejected
		 * @returns {SyncPromise}
		 *   A new SyncPromise
		 */
		this.catch = function (fnOnRejected) {
			return this.then(undefined, fnOnRejected);
		};

		/**
		 * @returns {any}
		 *   The result in case this SyncPromise is already fulfilled or <code>this</code> if it is
		 *   still pending
		 */
		this.getResult = function () {
			return vResult;
		};

		/**
		 * @returns {boolean}
		 *   Whether this SyncPromise is fulfilled
		 */
		this.isFulfilled = function () {
			return bFulfilled;
		};

		/**
		 * @returns {boolean}
		 *   Whether this SyncPromise is rejected
		 */
		this.isRejected = function () {
			return bRejected;
		};

		/**
		 * @param {function} [fnOnFulfilled]
		 *   Callback function if this SyncPromise is fulfilled
		 * @param {function} [fnOnRejected]
		 *   Callback function if this SyncPromise is rejected
		 * @returns {SyncPromise}
		 *   A new SyncPromise
		 */
		this.then = function (fnOnFulfilled, fnOnRejected) {
			if (bFulfilled || bRejected) {
				return new SyncPromise(that, bFulfilled ? fnOnFulfilled : fnOnRejected);
			}
			return new SyncPromise(oPromise.then(fnOnFulfilled, fnOnRejected));
		};
	}

	function resolve(oPromise) {
		return oPromise instanceof SyncPromise ? oPromise : new SyncPromise(oPromise);
	}

	return {
		/**
		 * Returns a new SyncPromise for the given array of values just like
		 * <code>Promise.all(aValues)</code>.
		 *
		 * @param {any[]} aValues
		 *   The values
		 * @returns {SyncPromise}
		 *   The SyncPromise
		 */
		all : function (aValues) {
			return new SyncPromise(null, null, aValues.slice());
		},

		/**
		 * Returns a "get*" method corresponding to the given "fetch*" method.
		 *
		 * @param {string} sFetch
		 *   A "fetch*" method's name
		 * @param {boolean} [bThrow=false]
		 *   Whether the "get*" method throws if the promise is not fulfilled
		 * @returns {function}
		 *   A "get*" method returning the "fetch*" method's result or
		 *   <code>undefined</code> in case the promise is not (yet) fulfilled
		 */
		createGetMethod : function (sFetch, bThrow) {
			return function () {
				var oSyncPromise = this[sFetch].apply(this, arguments);

				if (oSyncPromise.isFulfilled()) {
					return oSyncPromise.getResult();
				} else if (bThrow) {
					throw oSyncPromise.isRejected()
						? oSyncPromise.getResult()
						: new Error("Result pending");
				}
			};
		},

		/**
		 * Returns a "request*" method corresponding to the given "fetch*" method.
		 *
		 * @param {string} sFetch
		 *   A "fetch*" method's name
		 * @returns {function}
		 *   A "request*" method returning the "fetch*" method's result wrapped via
		 *   <code>Promise.resolve()</code>
		 */
		createRequestMethod : function (sFetch) {
			return function () {
				return Promise.resolve(this[sFetch].apply(this, arguments));
			};
		},

		// reject not implemented as there is no use case so far

		/**
		 * Returns a SyncPromise wrapping the given promise <code>oPromise</code> or
		 * <code>oPromise</code> if it is already a SyncPromise.
		 *
		 * @param {Promise|SyncPromise} oPromise
		 *   The promise to wrap
		 * @returns {SyncPromise}
		 *   The SyncPromise
		 */
		resolve : resolve
	};
}/*, bExport = false*/);
