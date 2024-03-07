/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/DelegateMediator",
	"sap/ui/fl/apply/_internal/DelegateMediatorNew"
], function(
	DelegateMediator,
	DelegateMediatorNew
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
		// @deprecated
		types: {
			READONLY: DelegateMediator.types.READONLY,
			WRITEONLY: DelegateMediator.types.WRITEONLY,
			COMPLETE: DelegateMediator.types.COMPLETE
		},

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
			DelegateMediator.registerDefaultDelegate(mPropertyBag);
		},

		/**
		 * Register model specific read delegate by the model type.
		 *
		 * @param {object} mPropertyBag - Property bag for read delegate
		 * @param {object} mPropertyBag.modelType - Read delegate model type
		 * @param {object} mPropertyBag.delegate - Path to read delegate
		 */
		registerReadDelegate(mPropertyBag) {
			DelegateMediatorNew.registerReadDelegate(mPropertyBag);
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
			DelegateMediatorNew.registerWriteDelegate(mPropertyBag);
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
			return DelegateMediator.getDelegateForControl(
				mPropertyBag.control,
				mPropertyBag.modifier,
				mPropertyBag.modelType,
				mPropertyBag.supportsDefault
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
		 * @param {boolean} [mPropertyBag.supportsDefault] - Include default delegate if no instance specific delegate is available
		 * @returns {Promise.<sap.ui.core.util.reflection.FlexDelegateInfo>} Delegate information including the lazy loaded instance of the delegate
		 */
		getReadDelegateForControl(mPropertyBag) {
			return DelegateMediatorNew.getReadDelegateForControl(
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
			return DelegateMediatorNew.getWriteDelegateForControl(
				mPropertyBag.control,
				mPropertyBag.modifier
			);
		},

		/**
		 * Returns a list of library names which needs to be required to get default delegates loaded.
		 * @returns {array} List of library names
		 * @deprecated since 1.123.0
		 */
		getKnownDefaultDelegateLibraries() {
			return DelegateMediator.getKnownDefaultDelegateLibraries();
		},

		/**
		 * Returns a list of required libraries for the given default delegate.
		 * If it is not a default delegate, an empty list is returned.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} mPropertyBag.sDelegateName - Name of the delegate
		 * @param {sap.ui.core.Element} mPropertyBag.oControl - Control for which the corresponding delegate was returned
		 * @param {string} [mPropertyBag.sModelType] - Model type, if none is provided the default model of oControl is taken instead
		 * @returns {string[]} Required libraries
 		 * @deprecated since 1.123.0
		 */
		getRequiredLibrariesForDefaultDelegate(mPropertyBag) {
			return DelegateMediator.getRequiredLibrariesForDefaultDelegate(
				mPropertyBag.delegateName,
				mPropertyBag.control,
				mPropertyBag.modelType
			);
		}
	};

	return DelegateMediatorAPI;
});
