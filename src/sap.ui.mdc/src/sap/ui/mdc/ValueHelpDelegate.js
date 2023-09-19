/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to execute model specific logic in ValueHelp
// ---------------------------------------------------------------------------------------

sap.ui.define([
	"sap/ui/mdc/BaseDelegate",
	"sap/ui/model/FilterType",
	"sap/ui/mdc/enums/ConditionValidated",
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/condition/FilterConverter'
], function(
	BaseDelegate,
	FilterType,
	ConditionValidated,
	Condition,
	FilterConverter
) {
	"use strict";

	/**
	 * Delegate for {@link sap.ui.mdc.ValueHelp ValueHelp}.<br>
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @namespace
	 * @author SAP SE
	 * @public
	 * @since 1.95.0
	 * @extends module:sap/ui/mdc/BaseDelegate
	 * @alias module:sap/ui/mdc/ValueHelpDelegate
	 */
	const ValueHelpDelegate = Object.assign({}, BaseDelegate);

	/**
	 * Requests the content of the value help.
	 *
	 * This function is called when the value help is opened or a key or description is requested.
	 *
	 * So depending on the value help content used, all content controls and data need to be assigned.
	 * Once they are assigned and the data is set, the returned <code>Promise</code> needs to be resolved.
	 * Only then does the value help continue opening or reading data.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.Container} oContainer Container instance
	 * @param {string} sContentId ID of the content shown after this call to retrieve content
	 *
	 * @returns {Promise} <code>Promise</code> that is resolved if all content is available
	 * @public
	 */
	ValueHelpDelegate.retrieveContent = function (oValueHelp, oContainer, sContentId) {
		return Promise.resolve();
	};

	/**
	 * Checks if a <code>ListBinding</code> supports <code>$search</code>.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.Content} oContent Content element
	 * @param {sap.ui.model.ListBinding} oListBinding <code>ListBinding</code>
	 * @returns {boolean} <code>true</code> if <code>$search</code> is supported
	 * @public
	 */
	ValueHelpDelegate.isSearchSupported = function(oValueHelp, oContent, oListBinding) {
		return false;
	};

	/**
	 * Controls if a type-ahead is opened or closed.
	 *
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
 	 * @param {sap.ui.mdc.valuehelp.base.Content} oContent <code>ValueHelp</code> Content requesting conditions configuration
 	 * @returns {Promise|boolean} Boolean or <code>Promise</code> resolving into a boolean indicating the desired behavior
	 * @since 1.110.0
	 * @public
	 */
	ValueHelpDelegate.showTypeahead = function (oValueHelp, oContent) {
		if (!oContent || (oContent.isA("sap.ui.mdc.valuehelp.base.FilterableListContent") && !oContent.getFilterValue())) { // Do not show non-existing content or suggestions without filterValue
			return false;
		} else if (oContent.isA("sap.ui.mdc.valuehelp.base.ListContent")) { // All List-like contents should have some data to show
			const oListBinding = oContent.getListBinding();
			const iLength = oListBinding && oListBinding.getAllCurrentContexts().length;
			return iLength > 0;
		}
		return true; // All other content should be shown by default
	};

	/**
	 * Adjustable filtering for list-based contents.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
 	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content requesting conditions configuration
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to that is used to bind the list to the model
	 * @since 1.110.0
	 * @public
	 */
	ValueHelpDelegate.updateBindingInfo = function(oValueHelp, oContent, oBindingInfo) {
		oBindingInfo.parameters = {};
		oBindingInfo.filters = [];

		const sFilterFields = oContent.getFilterFields();
		const sFieldSearch = oContent._getPriorityFilterValue();
		const oFilterBar = oContent._getPriorityFilterBar();
		const oConditions = oFilterBar ? oFilterBar.getInternalConditions() : oContent._oInitialFilterConditions || {};

		if (!oFilterBar && sFieldSearch && sFilterFields && sFilterFields !== "$search") {
			// add condition for Search value
			const oCondition = Condition.createCondition("Contains", [sFieldSearch], undefined, undefined, ConditionValidated.NotValidated);
			oConditions[sFilterFields] = [oCondition];
		}

		const oConditionTypes = oConditions && oContent._getTypesForConditions(oConditions);
		const oFilter = oConditions && FilterConverter.createFilters( oConditions, oConditionTypes, undefined, oContent.getCaseSensitive());

		if (oFilter) {
			oBindingInfo.filters = [oFilter];
		}
	};

	/**
	 * Executes a filter in a <code>ListBinding</code> and resumes it, if suspended.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.model.ListBinding} oListBinding List binding
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object that is be used to bind the list to the model
  	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content requesting the binding update
	 * @since 1.110.0
	 * @public
	 */
	ValueHelpDelegate.updateBinding = function(oValueHelp, oListBinding, oBindingInfo, oContent) {
		oListBinding.filter(oBindingInfo.filters, FilterType.Application);
		if (oListBinding.isSuspended()) {
			oListBinding.resume();
		}
	};

	/**
	 * Changes the search string.
	 *
	 * If <code>$search</code> is used, depending on which back-end service is used, the search string might need to be escaped.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {boolean} bTypeahead <code>true</code> if the search is called for a type-ahead
	 * @param {string} sSearch Search string
	 * @returns {string} Search string to use
	 * @since 1.97.0
	 * @private
	 * @ui5-restricted sap.fe
 	 * @deprecated (since 1.110.0) - replaced by {@link sap.ui.mdc.ValueHelpDelegate.updateBinding}
	 */
	 ValueHelpDelegate.adjustSearch = function(oValueHelp, bTypeahead, sSearch) {
		return sSearch;
	};

	/**
	 * Executes a filter in a <code>ListBinding</code>.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.model.ListBinding} oListBinding List binding
	 * @param {int} iRequestedItems Number of requested items
	 * @returns {Promise<sap.ui.model.ListBinding>} <code>Promise</code> that is resolved if search is executed
	 * @public
	 */
	ValueHelpDelegate.executeFilter = function(oValueHelp, oListBinding, iRequestedItems) {
		return Promise.resolve(oListBinding);
	};

	/**
	 * Checks if the <code>ListBinding</code> is waiting for an update.
	 * As long as the context has not been set for <code>ListBinding</code>,
	 * <code>ValueHelp</code> needs to wait.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.model.ListBinding} oListBinding <code>ListBinding</code> to check
	 * @param {int} iRequestedItems Number of requested items
	 * @returns {boolean|Promise<boolean>} <code>Promise</code> that is resolved once <code>ListBinding</code> has been updated
	 * @public
	 */
	ValueHelpDelegate.checkListBindingPending = function(oValueHelp, oListBinding, iRequestedItems) {
		if (!oListBinding || oListBinding.isSuspended()) {
			return false;
		}
		return Promise.resolve(oListBinding.getContexts(0, iRequestedItems)).then(function(aContexts) {
			return aContexts.length === 0;
		});
	};

	//  InOut =====

	/**
	 * Callback invoked every time a {@link sap.ui.mdc.ValueHelp ValueHelp} fires a <code>select</code> event or the value of the corresponding field changes.
	 * This callback can be used to update external fields.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.enums.ValueHelpPropagationReason} sReason Reason why the method was invoked
 	 * @param {object} oConfig Current configuration provided by the calling control
	 * @public
	 * @since 1.101.0
	 */
	ValueHelpDelegate.onConditionPropagation = function (oValueHelp, sReason, oConfig) {

	};

	/**
	 * Provides an initial condition configuration every time value help content is shown.
	 *
	 * <b>Note:</b> Make sure to provide the type information of the corresponding properties of
	 * the <code>FilterBar</code>.
	 *
	 * <b>Note:</b> Be aware that setting the condition for the search field or type-ahead could
	 * lead to unwanted side effects.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
 	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content requesting conditions configuration
	 * @param {sap.ui.core.Control} oControl Instance of the calling control
	 * @returns {Promise<object>|object} Returns a map of conditions suitable for a {@link sap.ui.mdc.FilterBar FilterBar} control
	 * @private
	 * @ui5-restricted sap.fe
	 * @since 1.101.0
	 * @deprecated (since 1.106.0) - replaced by {@link sap.ui.mdc.ValueHelpDelegate.getFilterConditions}
	 */
	ValueHelpDelegate.getInitialFilterConditions = function (oValueHelp, oContent, oControl) {

		const oConditions = {};
		return oConditions;

	};

	/**
	 * Provides the possibility to customize selections in 'Select from list' scenarios.
	 * By default, only condition keys are taken into consideration. This might be extended with payload dependent filters.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
 	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content instance
	 * @param {object} oItem - Entry of a given list
 	 * @param {method} oItem.getBindingContext - Get the binding context of this object for the given model name.
	 * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions current conditions
	 * @returns {boolean} <code>true</code> if item is selected
	 * @public
	 * @since 1.101.0
  	 * @deprecated (since 1.118.0) - replaced by {@link sap.ui.mdc.ValueHelpDelegate.findConditionsForContext}
	 * @name sap.ui.mdc.ValueHelpDelegate#isFilterableListItemSelected
	 * @function
	 */

	/**
	 * Find all conditions, which are represented by the given context for 'Select from list' scenarios.
	 * By default, only condition keys are considered. This may be extended with payload dependent filters.
	 *
	 * Note: this method replaces the former <code>isFilterableListItemSelected</code>
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
 	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content instance
	 * @param {sap.ui.model.Context} oContext Entry of a given list
	 * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions current conditions
	 * @returns {sap.ui.mdc.condition.ConditionObject[]} Conditions represented by the given context
	 * @private
	 * @public
	 * @since 1.118.0
	 */
	ValueHelpDelegate.findConditionsForContext = function (oValueHelp, oContent, oContext, aConditions) {
		const vKey = oContext.getObject(oContent.getKeyPath());
		return aConditions.filter(function (oCondition) {
			return oCondition.validated === ConditionValidated.Validated && vKey === oCondition.values[0];
		});
	};

	/**
	 * Provides the possibility to customize selection events in 'Select from list' scenarios.
	 * This enables an application to reuse conditions in collective search scenarios, instead of always creating new ones.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
 	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content instance
	 * @param {object} oChange Selection event configuration
	 * @param {sap.ui.mdc.enums.ValueHelpSelectionType} oChange.type Type of the selection change (add, remove)
	 * @param {object[]} oChange.conditions Array of changed conditions with structure {@link sap.ui.mdc.condition.ConditionObject ConditionObject}
	 * @returns {object} oRestult Selection event configuration object
	 * @returns {sap.ui.mdc.enums.ValueHelpSelectionType} oRestult.type Type of the selection change (add, remove)
	 * @returns {object[]} oRestult.conditions Array of changed conditions with structure {@link sap.ui.mdc.condition.ConditionObject ConditionObject}
	 * @public
	 * @since 1.101.0
	 */
	ValueHelpDelegate.modifySelectionBehaviour = function (oValueHelp, oContent, oChange) {
		return oChange;
	};

	/**
	 * Provides the possibility to convey custom data in conditions.
	 * This enables an application to enhance conditions with data relevant for combined key or out parameter scenarios.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content instance
	 * @param {any[]} aValues Key and description pair for the condition that is created
	 * @param {sap.ui.model.Context} [oContext] Optional additional context
	 * @returns {undefined|object} Optionally returns a serializable object to be stored in the condition payload field
	 * @public
	 * @since 1.101.0
	 */
	ValueHelpDelegate.createConditionPayload = function (oValueHelp, oContent, aValues, oContext) {
		return undefined;
	};

	/**
	 * Provides type information for list content filtering.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content instance
	 * @param {object} oConditions Set of conditions to create filters for
	 * @returns {object} Returns a type map for property paths
	 * @public
	 * @since 1.101.0
	 */
	ValueHelpDelegate.getTypesForConditions = function (oValueHelp, oContent, oConditions) {	// TODO: MDC.Table add UI.Table support
		const oConditionTypes = {};
		const oListBindingInfo = oContent && oContent.getListBindingInfo();

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

	/**
	 * Provides a map of conditions for the following situations:
	 * <ul>
	 * <li> Initial set of conditions applied every time value help content is shown for the first time since opening its container.</li>
	 * <li> Detailed set of conditions in <code>getItemForValue</code> scenarios that allow you to find a specific value help item (indicated by oConfig availability).</li>
	 * </ul>
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content instance
 	 * @param {object} [oConfig] Configuration
	 * @param {any} oConfig.value Value as entered by user
	 * @param {any} [oConfig.parsedValue] Value parsed by type to fit the data type of the key
	 * @param {object} [oConfig.context] Contextual information provided by condition payload or <code>inParameters</code>/<code>outParameters</code>. This is only filled if the description needs to be determined for an existing condition.
	 * @param {object} [oConfig.context.inParameter] In parameters of the current condition (<code>inParameter</code> are not used any longer, but it might be filled in older conditions stored in variants.)
	 * @param {object} [oConfig.context.ouParameter] Out parameters of the current condition (<code>outParameter</code> are not used any longer, but it might be filled in older conditions stored in variants.)
	 * @param {object} [oConfig.context.payload] Payload of the current condition
	 * @param {sap.ui.core.Control} oConfig.control Instance of the calling control
	 * @param {sap.ui.model.Context} [oConfig.bindingContext] <code>BindingContext</code> of the checked field. Inside a table, the <code>ValueHelp</code> element might be connected to a different row.
	 * @param {boolean} oConfig.checkKey If set, the value help checks only if there is an item with the given key. This is set to <code>false</code> if the value cannot be a valid key because of type validation.
	 * @param {boolean} oConfig.checkDescription If set, the value help checks only if there is an item with the given description. This is set to <code>false</code> if only the key is used in the field.
	 * @returns {Promise<object>|object} Returns a map of conditions
	 * @public
	 * @since 1.106.0
	 */
	ValueHelpDelegate.getFilterConditions = function (oValueHelp, oContent, oConfig) {
		if (this.getInitialFilterConditions) {
			return this.getInitialFilterConditions(oValueHelp, oContent, (oConfig && oConfig.control) || (oContent && oContent.getControl()));
		}
		return {};
	};

	return ValueHelpDelegate;
});
