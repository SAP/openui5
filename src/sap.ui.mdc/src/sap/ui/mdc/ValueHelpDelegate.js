/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to execute model specific logic in ValueHelp
// ---------------------------------------------------------------------------------------

sap.ui.define([
	"sap/ui/mdc/BaseDelegate",
	"sap/ui/model/FilterType",
	"sap/ui/mdc/enum/ConditionValidated"
], function(
	BaseDelegate,
	FilterType,
	ConditionValidated
) {
	"use strict";

	/**
	 * Delegate for {@link sap.ui.mdc.ValueHelp ValueHelp}.<br>
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @experimental As of version 1.95
	 * @since 1.95.0
	 * @extends module:sap/ui/mdc/BaseDelegate
	 * @alias module:sap/ui/mdc/ValueHelpDelegate
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
	 * @param {string} sContentId id of the content shown after this call to retrieveContent
	 *
	 * @returns {Promise} Promise that is resolved if all content is available
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	ValueHelpDelegate.retrieveContent = function (oPayload, oContainer, sContentId) {
		return Promise.resolve();
	};

	/**
	 * Checks if a <code>ListBinding</code> supports $Search.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.mdc.valuehelp.base.Content} oContent Content element
	 * @param {sap.ui.model.ListBinding} oListBinding ListBinding
	 * @returns {boolean} true if $search is supported
	 * @private
	 * @ui5-restricted sap.ui.mdc.ValueHelp
	 */
	ValueHelpDelegate.isSearchSupported = function(oPayload, oContent, oListBinding) {
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
	 * Changes the search string.
	 *
	 * If <code>$search</code> is used, depending on which back-end service is used, the search string might need to be escaped.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {boolean} bTypeahead <code>true</code> if the search is called for a type-ahead
	 * @param {string} sSearch Search string
	 * @returns {string} Search string to use
	 * @since 1.97.0
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
	 * <code>ValueHelp</code> needs to wait.
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

	//  InOut =====

	/**
	 * Callback invoked everytime a {@link sap.ui.mdc.ValueHelp ValueHelp} fires a select event or the value of the corresponding field changes
	 * This callback may be used to update external fields.
	 *
	 * @param {object} oPayload Payload for delegate
  	 * @param {sap.ui.mdc.ValueHelp} oValueHelp <code>ValueHelp</code> control instance receiving the <code>controlChange</code>
	 * @param {sap.ui.mdc.enum.PropagationReason} sReason Reason why the method was invoked
 	 * @param {object} oConfig current configuration provided by the calling control
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.101.0
	 */
	ValueHelpDelegate.onConditionPropagation = function (oPayload, oValueHelp, sReason, oConfig) {

	};

	/**
	 * Provides an initial condition configuration everytime a value help content is shown.
	 *
	 * @param {object} oPayload Payload for delegate
 	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent ValueHelp content requesting conditions configuration
	 * @param {sap.ui.core.Control} oControl Instance of the calling control
	 * @returns {Promise<object>|object} Returns a map of conditions suitable for a sap.ui.mdc.FilterBar control
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.101.0
	 */
	ValueHelpDelegate.getInitialFilterConditions = function (oPayload, oContent, oControl) {

		var oConditions = {};
		return oConditions;

	};

	/**
	 * Provides the possibility to customize selections in 'Select from list' scenarios.
	 * By default, only condition keys are considered. This may be extended with payload dependent filters.
	 *
	 * @param {object} oPayload Payload for delegate
 	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content instance
	 * @param {sap.ui.core.Element} oItem Entry of a given list
	 * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions current conditions
	 * @returns {boolean} True, if item is selected
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.101.0
	 */
	ValueHelpDelegate.isFilterableListItemSelected = function (oPayload, oContent, oItem, aConditions) {
		var sModelName = oContent._getListBindingInfo().model;
		var oContext = oItem && oItem.getBindingContext(sModelName);
		var oItemData = oContent._getItemFromContext(oContext);

		for (var i = 0; i < aConditions.length; i++) {
			var oCondition = aConditions[i];
			if (oCondition.validated === ConditionValidated.Validated && oItemData.key === oCondition.values[0]) { // TODO: check for specific EQ operator
				return true;
			}
		}

		return false;
	};

	/**
	 * Provides the possibility to customize selection events in 'Select from list' scenarios.
	 * This enables an application to reuse conditions in collective search scenarios, instead of always creating new ones.
	 *
	 * @param {object} oPayload Payload for delegate
 	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content instance
	 * @param {object} oChange Selection event configuration
	 * @param {sap.ui.mdc.enum.SelectType} oChange.type Type of the selection change (add, remove)
	 * @param {object[]} oChange.conditions Array of changed conditions with structure {@link sap.ui.mdc.condition.ConditionObject ConditionObject}
	 * @returns {object} oRestult Selection event configuration object
	 * @returns {sap.ui.mdc.enum.SelectType} oRestult.type Type of the selection change (add, remove)
	 * @returns {object[]} oRestult.conditions Array of changed conditions with structure {@link sap.ui.mdc.condition.ConditionObject ConditionObject}
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.101.0
	 */
	ValueHelpDelegate.modifySelectionBehaviour = function (oPayload, oContent, oChange) {
		return oChange;
	};

	/**
	 * Provides the possibility to convey custom data in conditions.
	 * This enables an application to enhance conditions with data relevant for combined key or outparameter scenarios.
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content instance
	 * @param {any[]} aValues key, description pair for the condition which is to be created.
	 * @param {sap.ui.model.Context} [oContext] optional additional context
	 * @returns {undefined|object} Optionally returns a serializeable object to be stored in the condition payload field.
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.101.0
	 */
	ValueHelpDelegate.createConditionPayload = function (oPayload, oContent, aValues, oContext) {
		return undefined;
	};

	/**
	 * Provides type information for listcontent filtering
	 *
	 * @param {object} oPayload Payload for delegate
	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content instance
	 * @param {object} oConditions set of conditions to create filters for
	 * @returns {object} Returns a type map for property paths
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.101.0
	 */
	ValueHelpDelegate.getTypesForConditions = function (oPayload, oContent, oConditions) {	// TODO: MDC.Table add UI.Table support
		var oConditionTypes = {};
		var oListBindingInfo = oContent && oContent._getListBindingInfo();

		if (oListBindingInfo && oListBindingInfo.template) {
			oListBindingInfo.template.mAggregations.cells.forEach(function (oCell) {
				Object.values(oCell.mBindingInfos).forEach(function (oBindingInfo) {
					oBindingInfo.parts.forEach(function (oPartInfo) {
						oConditionTypes[oPartInfo.path] = {type: oPartInfo.type || null};
					});
				});
			}, {});
		}

		return oConditionTypes;
	};

	/* ValueHelpDelegate.getCount = function (oPayload, oContent, aConditions, sGroup) {
		return 0;
	}; */

	return ValueHelpDelegate;
});
