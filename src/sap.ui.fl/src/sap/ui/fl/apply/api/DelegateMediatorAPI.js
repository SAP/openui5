/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/DelegateMediator"
], function(
	DelegateMediator
) {
	"use strict";

	/**
	 * Provides an API to handle default delegates.
	 *
	 * @namespace sap.ui.fl.apply.api.DelegateMediatorAPI
	 * @since 1.80
	 * @private
	 * @ui5-restricted
	 */
	const DelegateMediatorAPI = /** @lends sap.ui.fl.apply.api.DelegateMediatorAPI */{
		/**
		 * Registers the default delegate by model type.
		 *
		 * @param {object} mPropertyBag - Property bag for default delegate
		 * @param {object} mPropertyBag.modelType - Default delegate model type
		 * @param {object} mPropertyBag.delegate - Path to default delegate
		 * @param {object} mPropertyBag.delegateType - Defines the type of the default delegate.
		 * Please look at <code>DelegageMediatorAPI.types</code> for possible entries
	 	 * @param {object} [mPropertyBag.requiredLibraries] - Map of required libraries
		 * @deprecated since 1.123.0
		 */
		registerDefaultDelegate(mPropertyBag) {
			if (mPropertyBag.modelType !== "sap.ui.model.odata.v2.ODataModel" && mPropertyBag.modelType !== "sap.ui.model.odata.ODataModel") {
				DelegateMediator.registerReadDelegate(mPropertyBag);
			}
		},

		/**
		 * Register model specific read delegate by the model type.
		 *
		 * @param {object} mPropertyBag - Property bag for read delegate
		 * @param {object} mPropertyBag.modelType - Read delegate model type
		 * @param {object} mPropertyBag.delegate - Path to read delegate
		 */
		registerReadDelegate(mPropertyBag) {
			DelegateMediator.registerReadDelegate(mPropertyBag);
		},

		/**
		 * Registers a control specific write delegate by control type.
		 *
		 * @param {object} mPropertyBag - Property bag for control specific delegate
		 * @param {object} mPropertyBag.controlType - Control type
		 * @param {object} mPropertyBag.delegate - path to control specific delegate
		 * @param {object} [mPropertyBag.requiredLibraries] - Map of required libraries
		 * @param {object} [mPropertyBag.payload] - Payload for the delegate
		 */
		registerWriteDelegate(mPropertyBag) {
			DelegateMediator.registerWriteDelegate(mPropertyBag);
		},

		/**
		 * Returns the delegate object for the requested control.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.core.Element|DomNode} mPropertyBag.control - Control for which the corresponding delegate should be returned
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Control tree modifier
		 * @param {string} [mPropertyBag.modelType] - Model type; required in case you passed the <code>XmlTreeModifier</code>
		 * @param {boolean} [mPropertyBag.supportsDefault] - Include default delegate if no instance specific delegate is available
		 * @returns {Promise.<sap.ui.core.util.reflection.FlexDelegateInfo>} Delegate information including the lazy loaded instance of the delegate
		 * @deprecated since 1.123.0
		 */
		getDelegateForControl(mPropertyBag) {
			return DelegateMediator.getWriteDelegateForControl(
				mPropertyBag.control,
				mPropertyBag.modifier
			);
		},

		/**
		 * Returns the model specific read delegate for the requested control.
		 * The instancespcific read delegate is returned if available.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.core.Element|DomNode} mPropertyBag.control - Control for which the corresponding delegate should be returned
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Control tree modifier
		 * @param {string} [mPropertyBag.modelType] - Model type; required in case you passed the <code>XmlTreeModifier</code>
		 * @returns {Promise.<sap.ui.core.util.reflection.FlexDelegateInfo>} Delegate information including the lazy loaded instance of the delegate
		 */
		getReadDelegateForControl(mPropertyBag) {
			return DelegateMediator.getReadDelegateForControl(
				mPropertyBag.control,
				mPropertyBag.modifier,
				mPropertyBag.modelType,
				mPropertyBag.supportsDefault
			);
		},

		/**
		 * Returns the write delegate for the requested control.
	 	 * The instancespecific write delegate is returned if available.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {sap.ui.core.Element|DomNode} mPropertyBag.control - Control for which the corresponding delegate should be returned
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Control tree modifier
		 * @returns {Promise.<sap.ui.core.util.reflection.FlexDelegateInfo>} Delegate information including the lazy loaded instance of the delegate
		 */
		getWriteDelegateForControl(mPropertyBag) {
			return DelegateMediator.getWriteDelegateForControl(
				mPropertyBag.control,
				mPropertyBag.modifier
			);
		}
	};

	return DelegateMediatorAPI;
});
