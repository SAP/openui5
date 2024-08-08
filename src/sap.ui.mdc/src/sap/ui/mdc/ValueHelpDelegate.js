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
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/FilterProcessor',
	"sap/ui/mdc/condition/FilterConverter",
	'sap/ui/mdc/condition/FilterOperatorUtil',
	"sap/ui/Device",
	"sap/ui/mdc/enums/FieldDisplay"
], (
	BaseDelegate,
	FilterType,
	ConditionValidated,
	Filter,
	FilterOperator,
	FilterProcessor,
	FilterConverter,
	FilterOperatorUtil,
	Device,
	FieldDisplay
) => {
	"use strict";

	const _applyFilters = function(aItems, oFilter, oValueHelp, oContent) {
		const aConditions = oContent.getConditions();
		const aContexts = FilterProcessor.apply(aItems, oFilter, (oBindingContext, sPath) => oBindingContext && oBindingContext.getProperty(sPath));
		return aContexts.find((oContext) => !this.findConditionsForContext(oValueHelp, oContent, oContext, aConditions).length);
	};

	/**
	 * Delegate for {@link sap.ui.mdc.ValueHelp}.
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
	 * Requests additional content for the value help.
	 *
	 * This function is called when the value help is opened or a key or description is requested.
	 *
	 * So depending on the value help {@link sap.ui.mdc.valuehelp.base.Content Content} used, all content controls and data need to be assigned.
	 * Once they are assigned and the data is set, the returned <code>Promise</code> needs to be resolved.
	 * Only then does the value help continue opening or reading data.<br/>By default, this method returns a <code>Promise</code> that resolves into <code>undefined</code>.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.Container} oContainer Container instance
	 * @param {string} sContentId ID of the content shown after this call to retrieve content
	 * @returns {Promise} <code>Promise</code> that is resolved if all content is available
	 * @public
	 */
	ValueHelpDelegate.retrieveContent = function (oValueHelp, oContainer, sContentId) {
		return Promise.resolve();
	};

	/**
	 * Checks if a <code>ListBinding</code> supports <code>$search</code>.<br/>By default, this method returns <code>false</code>.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.Content} oContent Content element
	 * @param {sap.ui.model.ListBinding} oListBinding <code>ListBinding</code>
	 * @returns {boolean} <code>true</code> if <code>$search</code> is supported
	 * @public
	 */
	ValueHelpDelegate.isSearchSupported = function (oValueHelp, oContent, oListBinding) {
		return false;
	};

	/**
	 * Controls if a type-ahead is opened or closed.<br/>By default, this method returns <code>false</code> if a given content is a {@link sap.ui.mdc.valuehelp.base.FilterableListContent FilterableListContent} but no (truthy) <code>filterValue</code> is applied. Otherwise, if the given content is either a {@link sap.ui.mdc.valuehelp.base.ListContent ListContent} with available contexts or any other type of {@link sap.ui.mdc.valuehelp.base.Content Content}, <code>true</code> is returned.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.Content} oContent <code>ValueHelp</code> Content requesting conditions configuration
	 * @returns {Promise<boolean>|boolean} Boolean or <code>Promise</code> that resolves into a <code>boolean</code> indicating the desired behavior
	 * @since 1.110.0
	 * @public
	 */
	ValueHelpDelegate.showTypeahead = function (oValueHelp, oContent) {
		if (Device.system.phone) {
			// on phone also open typeahead if no filter is set or no result is found
			return true;
		}

		if (!oContent || (oContent.isA("sap.ui.mdc.valuehelp.base.FilterableListContent") && !oContent.getFilterValue())) { // Do not show non-existing content or suggestions without filterValue
			return false;
		} else if (oContent.isA("sap.ui.mdc.valuehelp.base.ListContent")) { // All List-like contents should have some data to show
			const oListBinding = oContent.getListBinding();
			const iLength = oListBinding && oListBinding.getCurrentContexts().length;
			return iLength > 0;
		}
		return true; // All other content should be shown by default
	};

	/**
	 * Adjustable filtering for list-based contents.<br/>By default, this method updates a given {@link sap.ui.base.ManagedObject.AggregationBindingInfo AggregationBindingInfo} with the return value from the delegate's own {@link module:sap/ui/mdc/ValueHelpDelegate.getFilters getFilters}.
	 *
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content requesting conditions configuration
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to that is used to bind the list to the model
	 * @since 1.110.0
	 * @public
	 */
	ValueHelpDelegate.updateBindingInfo = function (oValueHelp, oContent, oBindingInfo) {
		oBindingInfo.parameters = {};
		oBindingInfo.filters = this.getFilters(oValueHelp, oContent);
	};

	/**
	 * Returns filters that are used when updating the binding of the <code>ValueHelp</code>.<br/>By default, this method returns a set of {@link sap.ui.model.Filter Filters} originating from an available {@link sap.ui.mdc.FilterBar FilterBar}, the delegate's own {@link module:sap/ui/mdc/ValueHelpDelegate.getFilterConditions getFilterConditions}, and/or the {@link sap.ui.mdc.valuehelp.base.FilterableListContent#getFilterFields filterFields} configuration of the given {@link sap.ui.mdc.valuehelp.base.FilterableListContent FilterableListContent}.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content requesting conditions configuration
	 * @returns {sap.ui.model.Filter[]} Array of filters
	 * @since 1.121
	 * @protected
	 */
	ValueHelpDelegate.getFilters = function (oValueHelp, oContent) {
		const oFilterBar = oContent.getActiveFilterBar();
		const oConditions = oFilterBar ? oFilterBar.getConditions() : oContent._oInitialFilterConditions || {};
		const oConditionTypes = oConditions && this.getTypesForConditions(oValueHelp, oContent, oConditions);
		const oFilter = oConditions && FilterConverter.createFilters(oConditions, oConditionTypes, undefined, oContent.getCaseSensitive());
		return oFilter ? [oFilter] : [];
	};

	/**
	 * Executes a filter in a <code>ListBinding</code> and resumes it, if suspended.<br/>By default, this method applies <code>filters</code> found in the given {@link sap.ui.base.ManagedObject.AggregationBindingInfo AggregationBindingInfo} to the given {@link sap.ui.model.ListBinding ListBinding}. A suspended <code>ListBinding</code> is also resumed afterwards.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.model.ListBinding} oListBinding List binding
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object that is be used to bind the list to the model
	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content requesting the binding update
	 * @since 1.110.0
	 * @public
	 */
	ValueHelpDelegate.updateBinding = function (oValueHelp, oListBinding, oBindingInfo, oContent) {
		oListBinding.filter(oBindingInfo.filters, FilterType.Application);
		if (oListBinding.isSuspended()) {
			oListBinding.resume();
		}
	};

	/**
	 * Executes a filter in a <code>ListBinding</code>.<br/>By default, this method returns a <code>Promise</code> that resolves into the given <code>ListBinding</code>.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.model.ListBinding} oListBinding List binding
	 * @param {int} iRequestedItems Number of requested items
	 * @returns {Promise<sap.ui.model.ListBinding>} <code>Promise</code> that is resolved if search is executed
	 * @public
	 */
	ValueHelpDelegate.executeFilter = function (oValueHelp, oListBinding, iRequestedItems) {
		return Promise.resolve(oListBinding);
	};

	/**
	 * Checks if the <code>ListBinding</code> is waiting for an update.
	 * As long as the context has not been set for <code>ListBinding</code>, the <code>ValueHelp</code> needs to wait.<br/>By default, this method returns <code>false</code> if no {@link sap.ui.model.ListBinding ListBinding} is available or the given <code>ListBinding</code> is suspended. Otherwise, it returns a <code>Promise</code> that resolves into a <code>boolean</code> value indicating that at least one context is available after retrieval.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.model.ListBinding} oListBinding <code>ListBinding</code> to check
	 * @param {int} iRequestedItems Number of requested items
	 * @returns {boolean|Promise<boolean>} <code>Promise</code> that is resolved once <code>ListBinding</code> has been updated
	 * @public
	 */
	ValueHelpDelegate.checkListBindingPending = function (oValueHelp, oListBinding, iRequestedItems) {
		if (!oListBinding || oListBinding.isSuspended()) {
			return false;
		}
		return Promise.resolve(oListBinding.getContexts(0, iRequestedItems)).then((aContexts) => {
			return aContexts.length === 0;
		});
	};

	//  InOut =====

	/**
	 * Callback invoked every time a {@link sap.ui.mdc.ValueHelp ValueHelp} fires a <code>select</code> event or the value of the corresponding field changes.
	 * This callback can be used to update external fields.<br/>By default, this method is empty.
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
	 * Finds all conditions that are represented by the given context for 'Select from list' scenarios.<br/>By default, this method only takes {@link sap.ui.mdc.condition.ConditionObject Condition} keys into consideration. This can be extended with payload-dependent filters.
	 *
	 * <b>Note:</b> This method replaces the former <code>isFilterableListItemSelected</code>.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content instance
	 * @param {sap.ui.model.Context} oContext Entry of a given list
	 * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions current conditions
	 * @returns {sap.ui.mdc.condition.ConditionObject[]} Conditions represented by the given context
	 * @public
	 * @since 1.118.0
	 */
	ValueHelpDelegate.findConditionsForContext = function (oValueHelp, oContent, oContext, aConditions) {
		const oValues = oContent.getItemFromContext(oContext);
		const oContextCondition = oValues && oContent.createCondition(oValues.key, oValues.description, oValues.payload);
		return aConditions.filter((oCondition) => {
			return this.compareConditions(oValueHelp, oContextCondition, oCondition);
		});
	};

	/**
	 * Allows control to customize selection behavior in valuelist scenarios
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.condition.ConditionObject} oConditionA Condition to compare
	 * @param {sap.ui.mdc.condition.ConditionObject} oConditionB Condition to compare
	 * @returns {boolean} <code>true</code> if conditions are considered equal
	 *
	 * @protected
	 * @since 1.124.2
	 */
	ValueHelpDelegate.compareConditions = function (oValueHelp, oConditionA, oConditionB) {
		if (oConditionA.operator === oConditionB.operator) {
			if (oConditionA.validated === ConditionValidated.Validated && oConditionA.validated === oConditionB.validated) {
				return oConditionA.values[0] === oConditionB.values[0];
			}
			return FilterOperatorUtil.getOperator(oConditionA.operator)?.compareConditions(oConditionA, oConditionB);
		}
		return false;
	};

	/**
	 * Provides the possibility to customize selection events in 'Select from list' scenarios.
	 * This enables an application to reuse conditions in collective search scenarios, instead of always creating new ones.<br/>By default, this method returns given changes without modification.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content instance
	 * @param {object} oChange Selection event configuration
	 * @param {sap.ui.mdc.enums.ValueHelpSelectionType} oChange.type Type of the selection change (add, remove)
	 * @param {sap.ui.mdc.condition.ConditionObject[]} oChange.conditions Array of changed conditions
	 * @returns {object} oResult Selection event configuration object
	 * @returns {sap.ui.mdc.enums.ValueHelpSelectionType} oResult.type Type of the selection change (add, remove)
	 * @returns {sap.ui.mdc.condition.ConditionObject[]} oResult.conditions Array of changed conditions
	 * @public
	 * @since 1.101.0
	 */
	ValueHelpDelegate.modifySelectionBehaviour = function (oValueHelp, oContent, oChange) {
		return oChange;
	};

	/**
	 * Provides the possibility to convey custom data in conditions.
	 * This enables an application to enhance conditions with data relevant for combined key or out parameter scenarios.<br/>By default, this method returns <code>undefined</code>.
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
	 * Provides type information for list content filtering.<br/>By default, this method returns an object of types per binding path, extracted from a binding template of the given {@link sap.ui.mdc.valuehelp.base.FilterableListContent FilterableListContent}.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content instance
	 * @param {object} oConditions Set of conditions to create filters for
	 * @returns {sap.ui.mdc.util.FilterTypeConfig} Returns a type map for property paths
	 * @public
	 * @since 1.101.0
	 */
	ValueHelpDelegate.getTypesForConditions = function (oValueHelp, oContent, oConditions) { // TODO: MDC.Table add UI.Table support
		const oConditionTypes = {};
		const oListBindingInfo = oContent && oContent.getListBindingInfo();

		if (oListBindingInfo && oListBindingInfo.template) {
			oListBindingInfo.template.mAggregations.cells.forEach((oCell) => {
				Object.values(oCell.mBindingInfos).forEach((oBindingInfo) => {
					oBindingInfo.parts.forEach((oPartInfo) => {
						oConditionTypes[oPartInfo.path] = { type: oPartInfo.type || null };
					});
				});
			}, {});
		}

		return oConditionTypes;
	};

	/**
	 * Provides an object of conditions per binding path.<br/>By default, this method returns an empty <code>object</code>.
	 *
	 * This method provides the initial set of conditions applied every time value help content is shown for the first time after opening its container.
	 * It is also relevant for <code>getItemForValue</code> scenarios that allow you to find a specific value help item (indicated by the availability of the <code>oConfig</code> argument).
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.FilterableListContent} oContent <code>ValueHelp</code> content instance
	 * @param {sap.ui.mdc.valuehelp.base.ItemForValueConfiguration} [oConfig] Configuration
	 * @returns {Promise<sap.ui.mdc.util.FilterConditionMap>|sap.ui.mdc.util.FilterConditionMap} Returns a map-like object containing conditions suitable for <code>Filter</code> creation
	 * @public
	 * @since 1.106.0
	 */
	ValueHelpDelegate.getFilterConditions = function (oValueHelp, oContent, oConfig) {
		if (this.getInitialFilterConditions) {
			return this.getInitialFilterConditions(oValueHelp, oContent, (oConfig && oConfig.control) || (oContent && oContent.getControl()));
		}
		return {};
	};

	/**
	 * Returns the content that is used for the autocomplete feature and for user input, if the entered text
	 * leads to more than one filter result.
	 *
	 * By default, this method searches and returns an entry from a set of relevant contexts of the given {@link sap.ui.mdc.valuehelp.base.ListContent ListContent}.
	 *
	 * To determine which columns are relevant for the search, the currently active displayMode {@link sap.ui.mdc.enums.FieldDisplay Display} of the connected control will be used.
	 * While a <code>Value</code> configuration will lead to a 'key'-only search, <code>DescriptionValue</code> leads to searching the description first and the key afterwards. Other modes work the same way.
	 *
	 * For each relevant column all items are searched for an exact match first and again with a startsWith filter afterwards, if necessary.
	 *
	 * If the <code>caseSensitive</code> property is disabled, whichever entry comes first, wins, whether the user's input is in lowercase or uppercase letters.
	 *
	 *
	 *
	 * {@link sap.ui.mdc.valuehelp.base.ListContent ListContent}
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.ListContent} oContent <code>ValueHelp</code> content instance
	 * @param {sap.ui.mdc.valuehelp.base.ItemForValueConfiguration} oConfig Configuration
	 * @returns {sap.ui.model.Context} Promise resolving in the <code>Context</code> that's relevant'
	 * @public
	 * @since 1.120.0
	 */
	ValueHelpDelegate.getFirstMatch = function (oValueHelp, oContent, oConfig) {

		let oResult;
		const aRelevantContexts = oContent.getListBinding(oConfig)?.getCurrentContexts();
		const sInputValue = oConfig.value;

		if (sInputValue && aRelevantContexts?.length) {
			const bCaseSensitive = oConfig.hasOwnProperty("caseSensitive") ? oConfig.caseSensitive : oContent.getCaseSensitive();
			const sKeyPath = oContent.getKeyPath();
			const sDescriptionPath = oConfig.checkDescription && oContent.getDescriptionPath();

			let aSearchFields;
			switch (oValueHelp.getDisplay()) {
				case FieldDisplay.Description:
					aSearchFields = [sDescriptionPath];
					break;
				case FieldDisplay.DescriptionValue:
					aSearchFields = [sDescriptionPath, sKeyPath];
					break;
				case FieldDisplay.ValueDescription:
					aSearchFields = [sKeyPath, sDescriptionPath];
					break;
				default:
					aSearchFields = [sKeyPath];
					break;
			}
			aSearchFields = aSearchFields.filter((oEntry) => !!oEntry);

			for (const sPath of aSearchFields) {
					const aFilters = [
						new Filter({ path: sPath, operator: FilterOperator.EQ, value1: sInputValue, caseSensitive: bCaseSensitive }),
						new Filter({ path: sPath, operator: FilterOperator.StartsWith, value1: sInputValue, caseSensitive: bCaseSensitive })
					];
					for (const oFilter of aFilters) {
						oResult = _applyFilters.call(this, aRelevantContexts, oFilter, oValueHelp, oContent);
						if (oResult) {
							return oResult;
						}
					}
			}
		}

		return oResult;
	};

	/**
	 * Determines is the filtering used for type-ahead is case sensitive.
	 * <br/>By default the value of the {@link sap.ui.mdc.valuehelp.base.ListContent#getCaseSensitive CaseSensitive} property of the content instance is returned.
	 * If <code>$search</code> or other methods are used this might depend on the backend logic.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.ListContent} oContent <code>ValueHelp</code> content instance
	 * @returns {boolean} If <code>true</code> the filtering is case sensitive
	 * @public
	 * @since 1.121.0
	 */
	ValueHelpDelegate.isFilteringCaseSensitive = function (oValueHelp, oContent) {
		return oContent.getCaseSensitive();
	};

	/**
	 * Determines if the value help is opened when the user focuses on the connected control.
	 * <br/>By default, the value of the {@link sap.ui.mdc.valuehelp.Popover#getOpensOnFocus opensOnFocus} property is returned.
	 *
	 * Currently this is only supported for the type-ahead container.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.Container} oContainer Container instance
	 * @returns {Promise<boolean>} If <code>true</code>, the value help is opened when user focuses on the connected field control
	 * @public
	 * @since 1.121.0
	 */
	ValueHelpDelegate.shouldOpenOnFocus = function (oValueHelp, oContainer) {
		let bShouldOpenOnFocus = false;

		/**
		 *  @deprecated since 1.121.0
		 */
		if (oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {
			bShouldOpenOnFocus = oContainer.getOpensOnFocus();
		}

		return Promise.resolve(bShouldOpenOnFocus);
	};

	/**
	 * Determines if the value help is opened when the user clicks into the connected control.
	 * <br/>By default, the value of the {@link sap.ui.mdc.valuehelp.Popover#getOpensOnClick opensOnClick} property is returned, if set, or the content configuration is checked.
	 *
	 * Currently this is only supported for the type-ahead container.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp The <code>ValueHelp</code> control instance
	 * @param {sap.ui.mdc.valuehelp.base.Container} oContainer Container instance
	 * @returns {Promise<boolean>} If <code>true</code>, the value help is opened when user clicks into the connected field control
	 * @public
	 * @since 1.121.0
	 */
	ValueHelpDelegate.shouldOpenOnClick = function (oValueHelp, oContainer) {
		let bShouldOpenOnClick = false;

		if (oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {
			if (Device.system.phone && (!oContainer.isSingleSelect() || !oContainer.isDialog())) {
				// on phones open:
				// - always for multi-select fields
				// - for singleSelect only if typeahead is not used as ValueHelp (ComboBox don't opens on click)
				bShouldOpenOnClick = true;
			} else {
				let bUseConent = true;

				/**
				 *  @deprecated since 1.121.0
				 */
				if (!oContainer.isPropertyInitial("opensOnClick")) {
					bUseConent = false;
					bShouldOpenOnClick = oContainer.getOpensOnClick();
				}

				if (bUseConent) {
					const oContent = oContainer._getContent();
					bShouldOpenOnClick = !!oContent && oContent.shouldOpenOnClick(); //If opensOnClick-property is not explicitly set, the content's preference is used instead.
				}
			}
		}

		return Promise.resolve(bShouldOpenOnClick);
	};

	return ValueHelpDelegate;
});