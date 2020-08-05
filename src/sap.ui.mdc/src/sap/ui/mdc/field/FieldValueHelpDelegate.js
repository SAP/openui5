/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to execute model specific logic in FieldBase
// ---------------------------------------------------------------------------------------

sap.ui.define([
	'sap/ui/mdc/field/FieldHelpBaseDelegate',
	'sap/ui/model/FilterType'
], function(
		FieldHelpBaseDelegate,
		FilterType
) {
	"use strict";
	/**
	 * Delegate class for sap.ui.mdc.base.FieldValueHelp.<br>
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldvalueHelp
	 * @experimental
	 * @since 1.77.0
	 * @alias sap.ui.mdc.field.FieldValueHelpDelegate
	 */
	var FieldValueHelpDelegate = Object.assign({}, FieldHelpBaseDelegate);

	/**
	 * Requests to set the <code>filterFields</code> property of the <code>FieldValueHelp</code> element.
	 *
	 * This function is called when the field help is opened for suggestion.
	 * If no search is supported, content controls are not needed right now as the field help is not opened in this case.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.mdc.base.FieldHelpBase} oFieldHelp Field help instance
	 * @returns {Promise} Promise that is resolved if the <code>FilterFields</code> property is set
	 */
	FieldValueHelpDelegate.determineSearchSupported = function(oPayload, oFieldHelp) {

	};

	/**
	 * Checks if a <code>ListBinding</code> supports $Search.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.model.ListBinding} oListBinding ListBinding
	 * @returns {boolean} true if $search is supported
	 */
	FieldValueHelpDelegate.isSearchSupported = function(oPayload, oListBinding) {

		return false; // only on V4

	};

	/**
	 * Executes a search in a <code>ListBinding</code>.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.model.ListBinding} oListBinding ListBinding
	 * @param {string} sSearch Search string
	 */
	FieldValueHelpDelegate.executeSearch = function(oPayload, oListBinding, sSearch) {

		// only on V4

	};

	/**
	 * Executes a filter in a <code>ListBinding</code>.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.model.ListBinding} oListBinding List binding
	 * @param {sap.ui.model.Filter} oFilter Filter
	 * @param {function} fnCallback Callback function after result has been received
	 * @param {integer} iRequestedItems Number of requested items
	 * @since 1.81.0
	 */
	FieldValueHelpDelegate.executeFilter = function(oPayload, oListBinding, oFilter, fnCallback, iRequestedItems) {

		if (oListBinding.isA("sap.ui.model.json.JSONListBinding")) { // TODO: find way unique for all ListBindings
			oListBinding.filter(oFilter, FilterType.Application);
			fnCallback();
		} else { // oData V2
			oListBinding.attachEventOnce("dataReceived", fnCallback);
			oListBinding.initialize();
			oListBinding.filter(oFilter, FilterType.Application);
			oListBinding.getContexts(0, iRequestedItems); // trigger request. not all entries needed, we only need to know if there is one, none or more
		}

	};

	/**
	 * Checks if at least one <code>PropertyBinding</code> is waiting for an update.
	 * As long as the value has not been set for <code>PropertyBinding</code>,
	 * <code>FieldValueHelp</code> needs to wait.
	 *
	 * This check is used when selecting the description for a key if in parameters are used.
	 * The description can only be determined if the values of the in parameters are known.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.model.PropertyBinding[]} aBindings <code>PropertyBinding</code> array to check
	 * @returns {null|Promise} <code>Promise</code> that is resolved once every <code>PropertyBinding</code> has been updated
	 * @since 1.80.0
	 */
	FieldValueHelpDelegate.checkBindingsPending = function(oPayload, aBindings) {

		// only on V4
		return null;

	};

	return FieldValueHelpDelegate;

});