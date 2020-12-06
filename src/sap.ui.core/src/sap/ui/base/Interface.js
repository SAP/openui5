/*!
 * ${copyright}
 */

// Provides class sap.ui.base.Interface
sap.ui.define([], function() {
	"use strict";

	// lazy dependency to avoid cycle
	var BaseObject;

	/**
	 * Constructs a facade for the given object, containing only the named methods.
	 *
	 * For each method named in <code>aMethods</code>, a wrapper function will be added to the facade.
	 * When called, the wrapper function calls the method with the same name in the original <code>oObject</code>,
	 * passing all its call parameters to it without modification. A return value of the original method will
	 * be returned to the caller. Before returning it, values of type <code>sap.ui.base.Object</code> will be
	 * replaced by their facades, calling {@link sap.ui.base.Object#getInterface getInterface} on them.
	 *
	 * It is possible to create different facades exposing different sets of methods for the same object,
	 * but as <code>getInterface</code> can only return one of those interfaces, the special handling of the
	 * return values doesn't support multiple facades per object.
	 *
	 *
	 * @class A class whose instances act as a facade for other objects.
	 *
	 * <b>Note:</b> If a class returns a facade in its constructor, only the defined functions will be visible,
	 * no internals of the class can be accessed.
	 *
	 * @author Malte Wedel, Daniel Brinkmann
	 * @version ${version}
	 * @param {sap.ui.base.Object} oObject
	 *   Object for which a facade should be created
	 * @param {string[]} aMethods
	 *   Names of the methods, that should be available in the new facade
	 *
	 * @public
	 * @alias sap.ui.base.Interface
	 */
	// _bReturnFacade: If true, the return value of a function call is this created Interface instance instead of the BaseObject interface
	var Interface = function(oObject, aMethods, _bReturnFacade) {

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
					if (_bReturnFacade) {
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
