/*!
 * ${copyright}
 */

// Provides class sap.ui.base.Interface
sap.ui.define([], function() {
	"use strict";

	// lazy dependency to avoid cycle
	var BaseObject;

	/**
	 * Constructs an instance of sap.ui.base.Interface which restricts access to methods marked as public.
	 *
	 * @class A class that creates an Interface for an existing class. If a class returns the interface in its constructor,
	 *        only the defined functions will be visible, no internals of the class can be accessed.
	 *
	 * @author Malte Wedel, Daniel Brinkmann
	 * @version ${version}
	 * @param {sap.ui.base.Object}
	 *            oObject the instance that needs an interface created
	 * @param {string[]}
	 *            aMethods the names of the methods, that should be available on this interface
	 *
	 * @public
	 * @alias sap.ui.base.Interface
	 */
	// bFacade: If true, the return value of a function call is this created Interface instance instead of the BaseObject interface
	var Interface = function(oObject, aMethods, bFacade) {

		// if object is null or undefined, return itself
		if (!oObject) {
			return oObject;
		}

		// resolve lazy dependency
		BaseObject = BaseObject || sap.ui.requireSync('sap/ui/base/Object');

		function fCreateDelegator(oObject, sMethodName) {
			return function() {
					// return oObject[sMethodName].apply(oObject, arguments);
					var tmp = oObject[sMethodName].apply(oObject, arguments);
					// to avoid to hide the implementation behind the interface you need
					// to override the getInterface function in the object or create the interface with bFacade = true
					if (bFacade) {
						return this;
					} else {
						return (tmp instanceof BaseObject) ? tmp.getInterface() : tmp;
					}
				};
		}

		// if there are no methods return
		if (!aMethods) {
			return {};
		}

		var sMethodName;

		// create functions for all delegated methods
		// PERFOPT: 'cache' length of aMethods to reduce # of resolutions
		for (var i = 0, ml = aMethods.length; i < ml; i++) {
			sMethodName = aMethods[i];
			//!oObject[sMethodName] for 'lazy' loading interface methods ;-)
			if (!oObject[sMethodName] || typeof oObject[sMethodName] === "function") {
				this[sMethodName] = fCreateDelegator(oObject, sMethodName);
			}
		}

	};

	return Interface;

}, /* bExport= */ true);
