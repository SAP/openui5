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
	 * Creates a property couple which has the same value at any
	 * time until one is deleted.
	 *
	 * @function
	 * @since 1.58
	 * @alias module:sap/base/util/defineCoupledProperty
	 * @param {object} oTarget Target object of the property couple
	 * @param {string} sTargetProperty Name of the target's property
	 * @param {object} oSource Source object of the property couple
	 * @param {string} sSourceProperty Name of the source's property
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	var defineCoupledProperty = function(oTarget, sTargetProperty, oSource, sSourceProperty) {
		var vValue = oSource[sSourceProperty];

		var oPropertyDescriptor = {
			configurable: true,
			get: function() {
				return vValue;
			},
			set: function(_vValue) {
				vValue = _vValue;
			}
		};

		Object.defineProperty(oTarget, sTargetProperty, oPropertyDescriptor);
		Object.defineProperty(oSource, sSourceProperty, oPropertyDescriptor);
	};

	return defineCoupledProperty;

});
