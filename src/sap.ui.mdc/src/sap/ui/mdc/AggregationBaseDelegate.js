/*!
 * ${copyright}
 */

// sap.ui.mdc.AggregationBaseDelegate
sap.ui.define(['sap/ui/mdc/BaseDelegate', 'sap/ui/core/library'], function (BaseDelegate, coreLibrary) {
	"use strict";

	/**
	 * ListBase Delegate for {@link sap.ui.mdc.Control MDC Control}. Extend this object in your project to use all functionalites for the following MDC Controls:
	 *
	 * <ul>
	 * <li><code>sap.ui.mdc.Chart</code></li>
	 * <li><code>sap.ui.mdc.Table</code></li>
	 * <li><code>sap.ui.mdc.FilterBar</code></li>
	 * </ul>
	 *
	 * In advance to the <code>BaseDelegate</code> the <code>AggregationBaseDelegate</code> provides capabilities to provide an property info array, and implement
	 * hooks to customize the control creation and cleanup for the implementing MDC Control default aggregation.
	 *
	 * <b>Note:</b>
	 * The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.82.0
	 * @alias sap.ui.mdc.AggregationBaseDelegate
	 */
	var AggregationBaseDelegate = Object.assign(BaseDelegate, {

		/**
	 	 * Retrieves the relevant metadata for a given payload and returns the property info array.
		 *
		 * @param {Object} oControl MDC Control instance
		 * @returns {Promise} Once resolved, an array of property info objects is returned
		 */
		fetchProperties: function(oControl) {
			return Promise.resolve([]);
		},

		/**
		 * Creates an instance of the implementing MDC Control's default aggregation.
		 *
		 * @param {string} sPropertyName The name of the property info object/JSON
		 * @param {Object<sap.ui.mdc.Control>} oControl Instance of a MDC Control
		 * @param {Object} [mPropertyBag] Instance of property bag from SAPUI5 flexibility change API
		 * <b>Note:</b>
		 * The <code>addItem</code> Hook may be used during SAPUI5 flexibility change appliance and during runtime.
		 * Consequently the parameter <code>mPropertyBag</code> is only being passed once a change is being applied
		 * during flexibility processing. In runtime scenarios (such as opening a personalization dialog), this
		 * method might be called without the parameter <code>mPropertyBag</code>.
		 *
		 * @returns {Promise} Promise that resolves with an instance of the implementing {@link sap.ui.mdc.Control Control} default aggregation.
		 * <b>Note:</b>
		 * This method always expects a return value once it has been called. In case an item for a given property <code>sPropertyName</code>
		 * has already been created it is epected to either create a new instance or return the existing instance.
		 *
		 * @public
		 */
		addItem: function (sPropertyName, oControl, mPropertyBag) {
			return Promise.resolve();
		},

		/**
		 * Triggers any necessary follow-up steps that need to be taken after the removal of created items via <code>addItem</code>.
		 * The returned Boolean value inside the <code>Promise</code> can be used to prevent the default follow-up behavior of the SAPUI5 flexibility handling.
		 *
		 * @param {sap.ui.core.Control} oItem The control instance that was removed
		 * @param {sap.ui.mdc.Control} oControl Instance of a filter bar
		 * @param {Object} [mPropertyBag] Instance of property bag from SAPUI5 flexibility
		 * <b>Note:</b>
		 * The <code>addItem</code> Hook may be used during SAPUI5 flexibility change appliance and during runtime.
		 * Consequently the parameter <code>mPropertyBag</code> is only being passed once a change is being applied
		 * during flexibility processing. In runtime scenarios (such as opening a personalization dialog), this
		 * method might be called without the parameter <code>mPropertyBag</code>.
		 *
		 * @returns {Promise} Promise that resolves with <code>true</code>, <code>false</code> to allow/prevent default behavior of the change
		 * @public
		 */
		removeItem: function(oItem, oControl, mPropertyBag) {
			return Promise.resolve(true);
		},

		/**
		 * A validator to evaluate the theoretical control state.
		 *
		 * @param {Object<sap.ui.mdc.Control>} oControl Instance of an MDC control
		 * @param {Object} oState The theoretical external state representation of an MDC control
		 *
		 * @returns {Object} An object that must contain at least the <code>validation</code> attribute {@link sap.ui.core.MessageType MessageType}.
		 * If <code>warning</code> or <code>error</code> state types have been provided, the <code>message</code> is shown in addition.
		 */
		validateState: function(oControl, oState) {

			var sValidation = coreLibrary.MessageType.None;

			return {
				validation: sValidation,
				/* Please provide a meaningful message here. */
				message: undefined
			};
		},

		/**
		 * Hook that will be executed when changes are done applying to controls during the XML flexibility change appliance process.
		 *
		 * @param {Object<sap.ui.mdc.Control>} oControl Instance of an MDC control
		 * @param {Object} mPropertyBag Property bag from SAPUI5 flexibility
		 *
		 */
		onAfterXMLChangeProcessing: function(oControl, mPropertyBag) {
			//Neccessary cleanups can be implemented here
		}


	});

	return AggregationBaseDelegate;
});
