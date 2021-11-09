/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to execute model specific logic in ValueHelp
// ---------------------------------------------------------------------------------------

sap.ui.define([
	"sap/ui/mdc/BaseDelegate",
	"sap/ui/model/FilterType"
], function(
	BaseDelegate,
	FilterType
) {
	"use strict";

	/**
	 * @class Delegate class for {@link sap.ui.mdc.ValueHelp ValueHelp}.<br>
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 * @experimental As of version 1.95
	 * @since 1.95.0
	 * @alias sap.ui.mdc.ValueHelpDelegate
	 */
	var ValueHelpDelegate = Object.assign({}, BaseDelegate);

	/**
	 * Requests the content of the value help.
	 *
	 * This function is called when the value help is opened or a key or description is requested.
	 *
	 * So, depending on the value help content used, all content controls and data need to be assigned.
	 * Once they are assigned and the data is set, the returned <code>Promise</code> needs to be resolved.
	 * Only then does the value help continue opening or reading data.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.mdc.valuehelp.base.Container} oContainer Container instance
	 * @returns {Promise} Promise that is resolved if all content is available
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	ValueHelpDelegate.retrieveContent = function (oPayload, oContainer) {
		return Promise.resolve();
	};

	/**
	 * Checks if a <code>ListBinding</code> supports $Search.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.model.ListBinding} oListBinding ListBinding
	 * @returns {boolean} true if $search is supported
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	ValueHelpDelegate.isSearchSupported = function(oPayload, oListBinding) {
		return false;
	};

	/**
	 * Executes a search in a <code>ListBinding</code>.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.model.ListBinding} oListBinding ListBinding
	 * @param {string} sSearch Search string
	 * @returns {Promise} Promise that is resolved if search is executed
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	ValueHelpDelegate.executeSearch = function(oPayload, oListBinding, sSearch) {
		return Promise.resolve();
	};

	/**
	 * Changes the search String
	 *
	 * If <code>$search</code> is used, depending on the backend, the search string might need to be escaped.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {boolean} bTypeahead True if the search is called for a typeahed
	 * @param {string} sSearch Search string
	 * @returns {string} search string to use
	 * @since: 1.97.0
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	 ValueHelpDelegate.adjustSearch = function(oPayload, bTypeahead, sSearch) {

		return sSearch;

	};

	/**
	 * Executes a filter in a <code>ListBinding</code>.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.model.ListBinding} oListBinding List binding
	 * @param {sap.ui.model.Filter} oFilter Filter
	 * @param {int} iRequestedItems Number of requested items
	 * @returns {Promise<sap.ui.model.ListBinding>} Promise that is resolved if search is executed
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	ValueHelpDelegate.executeFilter = function(oPayload, oListBinding, oFilter, iRequestedItems) {

		if (oListBinding.isA("sap.ui.model.json.JSONListBinding")) { // TODO: find way unique for all ListBindings
			oListBinding.filter(oFilter, FilterType.Application);
			return Promise.resolve(oListBinding);
		} else { // oData V2
			var fnResolve;
			var fnCallback = function() {
				fnResolve(oListBinding);
			};
			oListBinding.attachEventOnce("dataReceived", fnCallback);
			oListBinding.initialize();
			oListBinding.filter(oFilter, FilterType.Application);
			oListBinding.getContexts(0, iRequestedItems); // trigger request. not all entries needed, we only need to know if there is one, none or more
			return new Promise(function(fResolve, fReject) {
				fnResolve = fResolve;
			});
		}

	};

	/**
	 * Checks if at least one <code>PropertyBinding</code> is waiting for an update.
	 * As long as the value has not been set for <code>PropertyBinding</code>,
	 * <code>ValueHelp</code> needs to wait.
	 *
	 * This check is used when selecting the description for a key if in parameters are used.
	 * The description can only be determined if the values of the in parameters are known.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.model.PropertyBinding[]} aBindings <code>PropertyBinding</code> array to check
	 * @returns {null|Promise} <code>Promise</code> that is resolved once every <code>PropertyBinding</code> has been updated
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	ValueHelpDelegate.checkBindingsPending = function(oPayload, aBindings) {
		return null;
	};

	/**
	 * Checks if the <code>ListBinding</code> is waiting for an update.
	 * As long as the context has not been set for <code>ListBinding</code>,
	 * <code>FieldValueHelp</code> needs to wait.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.model.ListBinding} oListBinding <code>ListBinding</code> to check
	 * @param {object} oListBindingInfo <code>ListBindingInfo</code> to check
	 * @returns {boolean|Promise<boolean>} <code>Promise</code> that is resolved once <code>ListBinding</code> has been updated
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	ValueHelpDelegate.checkListBindingPending = function(oPayload, oListBinding, oListBindingInfo) {
		return false;
	};

	return ValueHelpDelegate;
});
