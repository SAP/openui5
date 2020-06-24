/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/DelegateMediator"
], function(
	DelegateMediator
) {
	"use strict";

	/**
	 * Provides an API to handle default delegates into the application.
	 *
	 * @namespace sap.ui.fl.apply.api.DelegateMediatorAPI
	 * @experimental Since 1.80
	 * @since 1.80
	 * @private
	 * @ui5-restricted
	 */
	var DelegateMediatorAPI = /** @lends sap.ui.fl.apply.api.DelegateMediatorAPI */{
		/**
		 * Register default delegate by model type.
		 *
		 * @param {object} mPropertyBag - Property bag for default delegate
		 * @param {object} mPropertyBag.modelType - default delegate model type
		 * @param {object} mPropertyBag.delegate - path to default delegate
		 */
		registerDefaultDelegate: function (mPropertyBag) {
			DelegateMediator.registerDefaultDelegate(mPropertyBag);
		},


		/**
		 * Returns the delegate object for the requested control.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.core.Element|DomNode} mPropertyBag.control - The control for which the corresponding delegate should be returned
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - The control tree modifier
		 * @param {string} [mPropertyBag.modelType] - The model type is required in case you passed the XmlTreeModifier
		 * @returns {Promise.<object>} Returns the delegate information including the lazy loaded instance of the delegate
		 */
		getDelegateForControl: function (mPropertyBag) {
			return DelegateMediator.getDelegateForControl(mPropertyBag.control, mPropertyBag.modifier, mPropertyBag.modelType);
		}
	};

	return DelegateMediatorAPI;
},  /* bExport= */false);
