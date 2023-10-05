/*!
 * ${copyright}
 */

// sap.ui.mdc.AggregationBaseDelegate
sap.ui.define(['sap/ui/mdc/BaseDelegate', 'sap/ui/core/library'], function (BaseDelegate, coreLibrary) {
	"use strict";

	/**
	 * Base delegate implementation for {@link sap.ui.mdc.Control MDC Controls}. This delegate serves as base implementation for aggregation-based controls, such as:
	 *
	 * <ul>
	 * <li><code>sap.ui.mdc.Chart</code></li>
	 * <li><code>sap.ui.mdc.Table</code></li>
	 * <li><code>sap.ui.mdc.FilterBar</code></li>
	 * </ul>
	 *
	 * The <code>AggregationBaseDelegate</code> provides an interface for aggregation based functionality by providing an array of PropertyInfo objects,
	 * which can be used during runtime for personalization through the according <code>addItem</code> and <code>removeItem</code> hooks.
	 * Additional hooks for cleanup and validation mechanisms can be implemented through this delegate.
	 *
	 * @author SAP SE
	 *
	 * @namespace
	 * @public
	 * @since 1.82.0
	 * @alias module:sap/ui/mdc/AggregationBaseDelegate
	 * @extends module:sap/ui/mdc/BaseDelegate
	 */
	const AggregationBaseDelegate = Object.assign({}, BaseDelegate);

	/**
	 * Retrieves the relevant metadata for a given payload and returns the property info array.
	 *
	 * @param {sap.ui.mdc.Control} oControl Instance of an <code>sap.ui.mdc.Control</code>
	 * @returns {Promise<object[]>} Once resolved, an array of property info objects is returned
	 *
	 * @public
	 */
	AggregationBaseDelegate.fetchProperties = function(oControl) {
		return Promise.resolve([]);
	};

	/**
	 * Creates an instance of the implementing MDC Control's default aggregation.
	 *
	 * <b>Note:</b> The <code>addItem</code> hook can be used during the processing of an SAPUI5 flexibility change.
	 * Consequently the parameter <code>mPropertyBag</code> is only passed during preprocessing. In runtime scenarios (such as opening a personalization dialog), this
	 * method might be called without the parameter <code>mPropertyBag</code>.
	 *
	 * @param {sap.ui.mdc.Control} oControl Instance of an <code>sap.ui.mdc.Control</code>
	 * @param {string} sPropertyName The name of the property info object/JSON
	 * @param {Object} [mPropertyBag] Instance of property bag from SAPUI5 flexibility change API
	 *
	 * @returns {Promise} Promise that resolves with an instance of the implementing {@link sap.ui.mdc.Control Control} default aggregation.
	 * <b>Note:</b>
	 * This method always requires a return value once it has been called. If an item for a given property <code>sPropertyName</code>
	 * has already been created, it is required to either return the existing instance or create a new instance.
	 *
	 * @public
	 */
	AggregationBaseDelegate.addItem = function (oControl, sPropertyName, mPropertyBag) {
		return Promise.resolve();
	};

	/**
	 * Triggers any necessary follow-up steps that need to be taken after the removal of created items via <code>removeItem</code>.
	 * The returned Boolean value inside the <code>Promise</code> can be used to prevent the default follow-up behavior of the SAPUI5 flexibility handling.
	 *
	 * <b>Note:</b> The <code>removeItem</code> hook can be used during the processing of an SAPUI5 flexibility change.
	 * Consequently the parameter <code>mPropertyBag</code> is only passed during preprocessing. In runtime scenarios (such as opening a personalization dialog), this
	 * method might be called without the parameter <code>mPropertyBag</code>.
	 *
	 * @param {sap.ui.mdc.Control} oControl Instance of an <code>sap.ui.mdc.Control</code>
	 * @param {sap.ui.core.Element} oItem The control instance that was removed
	 * @param {Object} [mPropertyBag] Instance of property bag from SAPUI5 flexibility
	 *
	 * @returns {Promise} Promise that resolves with <code>true</code>, <code>false</code> to allow/prevent default behavior of the change
	 *
	 * @public
	 */
	AggregationBaseDelegate.removeItem = function(oControl, oItem, mPropertyBag) {
		return Promise.resolve(true);
	};

	/**
	 * A validator to evaluate the theoretical control state.
	 *
	 * @param {sap.ui.mdc.Control} oControl Instance of an <code>sap.ui.mdc.Control</code>
	 * @param {Object} oState The theoretical external state representation of an MDC control. The representation of this format is similar as processed by {@link sap.ui.mdc.p13n.StateUtil StateUtil}
	 * @returns {Object} An object that must contain at least the <code>validation</code> attribute {@link sap.ui.core.MessageType MessageType}.
	 * If <code>warning</code> or <code>error</code> state types have been provided, the <code>message</code> is shown in addition.
	 *
	 * @public
	 */
	AggregationBaseDelegate.validateState = function(oControl, oState) {

		const sValidation = coreLibrary.MessageType.None;

		return {
			validation: sValidation,
			/* Please provide a meaningful message here. */
			message: undefined
		};
	};

	/**
	 * Hook that will be executed when changes are done applying to controls during the XML flexibility change appliance process.
	 *
	 * @param {Object<sap.ui.mdc.Control>} oControl Instance of an MDC control
	 * @param {Object} mPropertyBag Property bag from SAPUI5 flexibility
	 *
	 * @public
	 */
	AggregationBaseDelegate.onAfterXMLChangeProcessing = function(oControl, mPropertyBag) {
		//Neccessary cleanups can be implemented here
	};

	/**
	 * A validator to evaluate the state of an MDC control.
	 *
	 * @param {sap.ui.mdc.Control} oControl Instance of a MDC control
	 * @param {map} [mValidation] Object Describing the validation result
	 *
	 * @public
	 */
	AggregationBaseDelegate.determineValidationState = function(oControl) {
		return oControl.checkValidationState ? oControl.checkValidationState() : -1;
	};

	/**
	 * Visualizes the validation state of an MDC control.
	 *
	 * @param {Object<sap.ui.mdc.Control>} oControl Instance of a MDC control
	 * @returns {map} mValidation Describes the validation result.
	 *
	 * @public
	 */
	AggregationBaseDelegate.visualizeValidationState = function(oControl, mValidation) {
	};

	return AggregationBaseDelegate;
});
