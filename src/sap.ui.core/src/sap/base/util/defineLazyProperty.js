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
	 * <strong>Note:</strong> Within the callback the property value shows as undefined
	 *
	 * @param {object} oTarget Target object of the property stub
	 * @param {string} sProperty Name of the stubbed property
	 * @param {function} fnCallback Function callback which returns the property value
	 * @private
	 */
	var lazyProperty = function(oTarget, sProperty, fnCallback) {

		var oPropertyDescriptor = {
			configurable: true,
			get: function() {
				delete oTarget[sProperty];
				var vValue = fnCallback();
				return vValue || oTarget[sProperty];
			},
			set: function(vValue) {
				delete oTarget[sProperty];
				oTarget[sProperty] = vValue;
			}
		};

		Object.defineProperty(oTarget, sProperty, oPropertyDescriptor);
	};

	return lazyProperty;

});
