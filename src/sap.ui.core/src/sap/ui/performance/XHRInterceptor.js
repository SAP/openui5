/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/base/util/getObject", "sap/base/log"], function(getObject, log) {
	"use strict";

	/**
	 * XHRInterceptor provides convenience for overriding XHR methods inside of sap/ui/performance.
	 *
	 * Modules can register functions as callbacks to the actual XHR methods instead of overwriting them
	 * explicitly. Registered functions get called in order of their registration with the same context
	 * and the same arguments the initial call was set up with.
	 *
	 * @module
	 * @private
	 */
	var XHRINTERCEPTOR = "XHRInterceptor";

	/**
	 * Registry for storing functions by registry keys (names).
	 *
	 * @private
	 */
	var mRegistry = Object.create(null);

	/**
	 * Ordered overrides array for storing by original XHR function name.
	 *
	 * @private
	 */
	var mOverrides = Object.create(null);

	/**
	 * Original XHR functions
	 * @private
	 */
	var mXHRFunctions = Object.create(null);

	/**
	 * Creates the initial override for an original XHR method.
	 *
	 * @param {string} sXHRMethod Name of the actual XHR method
	 * @param {function} fnCallback The registered callback function
	 * @private
	 */
	function createOverride(sXHRMethod, fnCallback) {

		mOverrides[sXHRMethod] = [];

		//  backup the original function
		mXHRFunctions[sXHRMethod] = window.XMLHttpRequest.prototype[sXHRMethod];

		window.XMLHttpRequest.prototype[sXHRMethod] = function() {
			var oArgs = arguments;

			// call the original function first
			mXHRFunctions[sXHRMethod].apply(this, oArgs);

			// call the registered callbacks in order of their registration
			mOverrides[sXHRMethod].forEach(function(fnCallback) {
				fnCallback.apply(this, oArgs);
			}.bind(this));

		};

	}

	/**
	 * Stores a function callback in registry and according overrides array.
	 *
	 * @param {string} sName Name under which the function is registered
	 * @param {string} sXHRMethod Name of the actual XHR method
	 * @param {function} fnCallback The registered callback function
	 * @private
	 */
	function storeFunction(sName, sXHRMethod, fnCallback) {
		var fnOldFunction = getObject(mRegistry, sName, true)[sXHRMethod];

		if (fnOldFunction) {
			// overwrite the old function
			var iIndex = mOverrides[sXHRMethod].indexOf(fnOldFunction);
			mOverrides[sXHRMethod][iIndex] = fnCallback;
		} else {
			// handle the newly registered function
			getObject(mRegistry, sName, true)[sXHRMethod] = fnCallback;
			mOverrides[sXHRMethod].push(fnCallback);
		}
	}


	return {
		/**
		 * Register a function callback which gets called as it would be an own method of XHR.
		 *
		 * @param {string} sName Name under which the function is registered
		 * @param {string} sXHRMethod Name of the actual XHR method
		 * @param {function} fnCallback The registered callback function
		 * @private
		 */
		register: function(sName, sXHRMethod, fnCallback) {
			log.debug("Register '" + sName + "' for XHR function '" + sXHRMethod + "'", XHRINTERCEPTOR);

			// initially the override needs to be placed per XHR method
			if (!mOverrides[sXHRMethod]) {
				createOverride(sXHRMethod, fnCallback);
			}
			storeFunction(sName, sXHRMethod, fnCallback);
		},

		/**
		 * Unregister a registered function.
		 *
	     * @param {string} sName Name under which the function is registered
		 * @param {string} sXHRMethod Name of the actual XHR method
		 * @return {boolean} True if unregister was successful
		 * @private
		 */
		unregister: function(sName, sXHRMethod) {
			var bRemove = this.isRegistered(sName, sXHRMethod);
			if (bRemove) {

				// remove the function from the override array
				mOverrides[sXHRMethod] = mOverrides[sXHRMethod].filter(function(fnCallback) {
					return fnCallback !== mRegistry[sName][sXHRMethod];
				});

				// remove the registry entry
				delete mRegistry[sName][sXHRMethod];
				// if there are no other registered functions we remove the entire registry entry
				if (Object.keys(mRegistry[sName]).length === 0) {
					delete mRegistry[sName];
				}
			}
			log.debug("Unregister '" + sName + "' for XHR function '" + sXHRMethod + (bRemove ? "'" : "' failed"), XHRINTERCEPTOR);
			return bRemove;
		},

		/*
		 * Check if a function is registered
	     * @param {string} sName Name under which the function is registered
		 * @param {string} sXHRMethod Name of the actual XHR method
		 * @private
		 */
		isRegistered: function(sName, sXHRMethod) {
			return mRegistry[sName] && mRegistry[sName][sXHRMethod];
		}

	};

});
