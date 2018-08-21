/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Creates a property stub which allows to retrieve the according property value lazily
	 * <strong>Note:</strong> Within the callback the property value shows as undefined and
	 * should not be set other than via assignment (no <code>Object.defineProperty</code>).
	 * The function callback should return the actual property's value like that:
	 * @example
	 * sap.ui.require(["sap/base/util/defineLazyProperty"], function(defineLazyProperty){
	 *		var oTarget = {};
	 *		defineLazyProperty(oTarget, "sProp", function() {
	 *			return 7;
	 *		});
	 *		console.log(oTarget["sProp"]); // should be 7
	 * });
	 *
	 * @function
	 * @alias module:sap/base/util/defineLazyProperty
	 * @param {object} oTarget Target object of the property stub
	 * @param {string} sProperty Name of the stubbed property
	 * @param {function} fnCallback Function callback which returns the property value
	 * @param {function} [sMarker] Marker to allow identification of the according property descriptor
	 *	like <code>Object.getOwnPropertyDescriptor(oTarget, sProperty).get[sMarker]</code>
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	var lazyProperty = function(oTarget, sProperty, fnCallback, sMarker) {

		var oPropertyDescriptor = {
			configurable: true,
			get: function() {
				delete oTarget[sProperty];
				oTarget[sProperty] = fnCallback();
				return oTarget[sProperty];
			},
			set: function(vValue) {
				delete oTarget[sProperty];
				oTarget[sProperty] = vValue;
			}
		};
		if (sMarker) {
			oPropertyDescriptor.get[sMarker] = true;
		}

		Object.defineProperty(oTarget, sProperty, oPropertyDescriptor);
	};

	return lazyProperty;

});
