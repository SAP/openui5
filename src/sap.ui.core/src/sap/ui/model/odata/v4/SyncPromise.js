/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.SyncPromise

/**
 * A wrapper around a Promise which observes settlement and provides synchronous access to result.
 *
 * Implements https://github.com/promises-aplus/promises-spec except:
 * <ul>
 * <li> "4. onFulfilled or onRejected
 * must not be called until the execution context stack contains only platform code."
 * <li> Interoperability is limited to <code>Promise</code> instances (use
 * <code>Promise.resolve</code> to wrap e.g. a <code>jQuery.Deferred</code> instance).
 * </ul>
 *
 * @namespace
 * @name sap.ui.model.odata.v4
 * @private
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * Constructor for a SyncPromise to wrap the given promise.
	 *
	 * @param {Promise|SyncPromise|any} oPromise
	 *   the promise to wrap or the result to synchronously fulfill with
	 * @param {function} [fnCallback]
	 *   function to apply to the result of the SyncPromise to be wrapped
	 * @returns {SyncPromise}
	 *   the SyncPromise created
	 */
	function SyncPromise(oPromise, fnCallback) {
		var bFulfilled = false,
			bRejected = false,
			vResult,
			that = this;

		if (typeof fnCallback === "function") {
			try {
				vResult = fnCallback(oPromise.getResult());
				bFulfilled = true;
				if (vResult instanceof Promise || vResult instanceof SyncPromise) {
					return new SyncPromise(vResult);
				}
			} catch (e) {
				vResult = e;
				bRejected = true;
			}
		} else if (oPromise instanceof Promise || oPromise instanceof SyncPromise) {
			vResult = that; // "pending"
			oPromise.then(function (vResult0) {
				vResult = vResult0;
				bFulfilled = true;
			}, function (vReason) {
				vResult = vReason;
				bRejected = true;
			});
		} else {
			vResult = oPromise;
			bFulfilled = true;
		}

		/**
		 * @returns {any}
		 *   the result in case this SyncPromise is already fulfilled or <code>this</code> if it is
		 *   still pending
		 */
		this.getResult = function () {
			return vResult;
		};

		/**
		 * @returns {boolean}
		 *   whether this SyncPromise is fulfilled
		 */
		this.isFulfilled = function () {
			return bFulfilled;
		};

		/**
		 * @returns {boolean}
		 *   whether this SyncPromise is rejected
		 */
		this.isRejected = function () {
			return bRejected;
		};

		/**
		 * @param {function} [fnOnFulfilled]
		 *   callback function if this SyncPromise is fulfilled
		 * @param {function} [fnOnRejected]
		 *   callback function if this SyncPromise is rejected
		 * @returns {SyncPromise}
		 *   a new SyncPromise
		 */
		this.then = function (fnOnFulfilled, fnOnRejected) {
			if (bFulfilled || bRejected) {
				return new SyncPromise(that, bFulfilled ? fnOnFulfilled : fnOnRejected);
			}
			return new SyncPromise(oPromise.then(fnOnFulfilled, fnOnRejected));
		};
	}

	return {
		/**
		 * Returns a SyncPromise wrapping the given promise <code>oPromise</code> or
		 * <code>oPromise</code> if it is already a SyncPromise.
		 *
		 * @param {Promise|SyncPromise} oPromise
		 *   the promise to wrap
		 * @returns {SyncPromise}
		 *   the SyncPromise
		 */
		resolve : function (oPromise) {
			return oPromise instanceof SyncPromise ? oPromise : new SyncPromise(oPromise);
		}
	};
}/*, bExport = false*/);
