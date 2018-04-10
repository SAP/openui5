/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	'sap/base/Log',
	'sap/base/util/getObject'
], function(Log, getObject) {
	"use strict";


	/**
	 * Replaces the defined property stub with an actual property value
	 *
	 * @param {object} oTarget Target object of the property stub
	 * @param {string} sProperty Name of the stubbed property
	 * @param {any} vValue The actual property value
	 * @private
	 */
	function definePropertyValue(oTarget, sProperty, vValue) {
		Object.defineProperty(oTarget, sProperty, {
			value: vValue,
			writable: true,
			configurable: true
		});
	}

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
				// set to undefined to avoid infinite loops
				definePropertyValue(oTarget, sProperty, undefined);
				var vValue = fnCallback();
				definePropertyValue(oTarget, sProperty, vValue);
				return vValue;
			},
			set: function(vValue) {
				definePropertyValue(oTarget, sProperty, vValue);
			}
		};

		Object.defineProperty(oTarget, sProperty, oPropertyDescriptor);
	};

	return lazyProperty;

});
