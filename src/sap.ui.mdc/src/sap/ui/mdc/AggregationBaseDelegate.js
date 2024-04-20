/*!
 * ${copyright}
 */

// sap.ui.mdc.AggregationBaseDelegate
sap.ui.define(['sap/ui/mdc/BaseDelegate', 'sap/ui/core/message/MessageType'], (BaseDelegate, MessageType) => {
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
	 * @abstract
	 */
	const AggregationBaseDelegate = Object.assign({}, BaseDelegate);

	/**
	 * Retrieves the relevant metadata for a given payload and returns the property info array.
	 * <br>By default, this method returns a <code>Promise</code> that resolves into <code>[]</code>.
	 *
	 * @param {sap.ui.mdc.Control} oControl Instance of an <code>sap.ui.mdc.Control</code>
	 * @returns {Promise<object[]>} Once resolved, an array of property info objects is returned
	 * @public
	 */
	AggregationBaseDelegate.fetchProperties = function(oControl) {
		return Promise.resolve([]);
	};

	/**
	 * Central hook to add items to the provided control instance.
	 * This method must return a promise that resolves with an instance of the implementing {@link sap.ui.mdc.Control Control} default aggregation.
	 *
	 * Consequently the parameter <code>mPropertyBag</code> is only passed during preprocessing. In runtime scenarios (such as opening a personalization dialog), this
	 * method might be called without the parameter <code>mPropertyBag</code>.
	 *
	 * @param {sap.ui.mdc.Control|Element} oControl Instance of an <code>sap.ui.mdc.Control</code>.
	 * <b>Note:</b> The <code>addItem</code> hook can be used during the processing of an SAPUI5 flexibility change.
	 * @param {string} sPropertyName The name of the property info object
	 * @param {Object} [mPropertyBag] Instance of property bag from SAPUI5 flexibility change API
	 *
	 * @abstract
	 * @public
	 */
	AggregationBaseDelegate.addItem = function(oControl, sPropertyName, mPropertyBag) {
		return Promise.resolve();
	};

	/**
	 * Triggers any necessary follow-up steps that need to be taken after the removal of created items via <code>removeItem</code>.
	 * The returned Boolean value inside the <code>Promise</code> can be used to prevent the default follow-up behavior of the SAPUI5 flexibility handling.
	 * <br>By default, this method returns a <code>Promise</code> that resolves into <code>true</code>. This will ensure, that the item will be destroyed subsequentially after it has been removed
	 * by the control.
	 *
	 * <b>Note:</b> The <code>removeItem</code> hook can be used during the processing of an SAPUI5 flexibility change.
	 * Consequently the parameter <code>mPropertyBag</code> is only passed during preprocessing. In runtime scenarios (such as opening a personalization dialog), this
	 * method might be called without the parameter <code>mPropertyBag</code>.
	 *
	 * @param {sap.ui.mdc.Control|Element} oControl Instance of a <code>sap.ui.mdc.Control</code>
	 * @param {sap.ui.core.Element} oItem The control instance that was removed
	 * @param {Object} [mPropertyBag] Instance of property bag from SAPUI5 flexibility
	 *
	 * @returns {Promise<boolean>} Promise resolving in a boolean, deciding whether the item should be destroyed (<code>true</code>) or kept (<code>false</code>) after removing it from the control aggregation.
	 *
	 * @public
	 */
	AggregationBaseDelegate.removeItem = function(oControl, oItem, mPropertyBag) {
		return Promise.resolve(true);
	};

	/**
	 * A validator to evaluate the theoretical control state.
	 * <br>By default, no state validation will be triggered.
	 *
	 * @param {sap.ui.mdc.Control} oControl Instance of an <code>sap.ui.mdc.Control</code>
	 * @param {Object} oState The theoretical external state representation of a mdc control. The representation of this format is similar as processed by {@link sap.ui.mdc.p13n.StateUtil StateUtil}
	 * @returns {Object} An object that must contain at least the <code>validation</code> attribute {@link sap.ui.core.MessageType MessageType}.
	 * If <code>warning</code> or <code>error</code> state types have been provided, the <code>message</code> is shown in addition.
	 *
	 * @private
	 */
	AggregationBaseDelegate.validateState = function(oControl, oState) {

		const sValidation = MessageType.None;

		return {
			validation: sValidation,
			/* Please provide a meaningful message here. */
			message: undefined
		};
	};

	/**
	 * Hook that will be executed when changes are done applying to controls during the XML flexibility change appliance process.
	 *
	 * @param {Element} oControl XML node of a mdc control
	 * @param {Object} mPropertyBag Property bag from SAPUI5 flexibility
	 *
	 * @abstract
	 * @public
	 */
	AggregationBaseDelegate.onAfterXMLChangeProcessing = function(oControl, mPropertyBag) {
		//Neccessary cleanups can be implemented here
	};

	/**
	 * A validator to evaluate the state of a mdc control.
	 *
	 * @param {sap.ui.mdc.Control} oControl Instance of a mdc control
	 * //TODO: available validation states? Only FilterBar relevant?
	 *
	 * @abstract
	 * @private
	 */
	AggregationBaseDelegate.determineValidationState = function(oControl) {
		return -1;
	};

	/**
	 * Visualizes the validation state of a mdc control.
	 *
	 * @param {sap.ui.mdc.Control} oControl Instance of a mdc control
	 * @param {object} [mValidation] Object Describing the validation result
	 *
	 * @abstract
	 * @private
	 */
	AggregationBaseDelegate.visualizeValidationState = function(oControl, mValidation) {};

	return AggregationBaseDelegate;
});