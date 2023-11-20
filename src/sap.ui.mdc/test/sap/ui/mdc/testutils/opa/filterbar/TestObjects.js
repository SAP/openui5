/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"./Actions",
	"./Assertions",
	"../p13n/Actions",
	"../p13n/Assertions"
], function(
	Opa5,
	filterBarActions,
	filterBarAssertions,
	p13nActions,
	p13nAssertions
) {
	"use strict";

	/**
	 * @namespace onTheMDCFilterBar
	 */
	Opa5.createPageObjects({
		onTheMDCFilterBar: {
			actions: {
				/**
				 * OPA5 test action
				 * <ol>
				 * 	<li>
				 * 		Opens the personalization dialog of the given <code>sap.ui.mdc.FilterBar</code>.
				 * 	</li>
				 *  <li>
				 * 		Navigates to the Group tab.
				 * 	</li>
				 * 	<li>
				 * 		Opens all groups and selects / deselects all filter fields depending on <code>oSettings</code>. Only the labels defined in <code>oSettings</code> will be selected, others will be deselected.
				 * 	</li>
				 * 	<li>
				 * 		Closes the personalization dialog.
				 * 	</li>
				 * </ol>
				 * @memberof onTheMDCFilterBar
				 * @method iPersonalizeFilter
				 * @param {sap.ui.core.Control | string} oFilterBar Instance / ID of the <code>sap.ui.mdc.FilterBar</code> that is filtered
				 * @param {Object} oSettings Map containing the settings for the filter personalization. Key is the label of the given group in the <code>sap.ui.mdc.FilterBar</code> personalization dialog, and value is an array containing the labels of the <code>FilterField</code>
				 * @returns {Promise} OPA waitFor
				 */
				iPersonalizeFilter: function(oFilterBar, oSettings) {
					return p13nActions.iPersonalizeFilterBar.call(this, oFilterBar, oSettings, filterBarActions.iOpenThePersonalizationDialog);
				},
				/**
				 * OPA5 test action
				 * <ol>
				 * 	<li>
				 * 		Opens the personalization dialog of the given <code>sap.ui.mdc.FilterBar</code>.
				 * 	</li>
				 * 	<li>
				 * 		Presses the Reset personalization button.
				 * 	</li>
				 * 	<li>
				 * 		Confirms the Reset dialog.
				 * 	</li>
				 * 	<li>
				 * 		Closes the personalization dialog.
				 * 	</li>
				 * </ol>
				 * @memberof onTheMDCFilterBar
				 * @method iResetThePersonalization
				 * @param {sap.ui.core.Control | string} oFilterBar Instance / ID of the <code>sap.ui.mdc.FilterBar</code>
				 * @returns {Promise} OPA waitFor
				 */
				iResetThePersonalization: function(oFilterBar) {
					return p13nActions.iResetThePersonalization.call(this, oFilterBar, filterBarActions.iOpenThePersonalizationDialog);
				},
				/**
				 * OPA5 test action
				 * Presses the Apply Filters button of the <code>sap.ui.mdc.FilterBar</code>.
				 * @memberof onTheMDCFilterBar
				 * @method iExpectSearch
				 * @param {sap.ui.core.Control | string} oFilterBar Instance / ID of the <code>sap.ui.mdc.FilterBar</code>
				 * @returns {Promise} OPA waitFor
				 */
				iExpectSearch: function(oFilterBar) {
					return filterBarActions.iExpectSearch.call(this, oFilterBar);
				},
				/**
				 * OPA5 test action
				 * <ol>
				 * 	<li>
				 * 		Opens the personalization dialog of the given <code>sap.ui.mdc.FilterBar</code>.
				 * 	</li>
				 *	<li>
				 * 		Navigates to the Group tab.
				 *	</li>
				 * 	<li>
				 * 		Opens the given groups and enters all values in the <code>FilterFields</code> depending on <code>oSettings</code>.
				 * 	</li>
				 * 	<li>
				 * 		Closes the personalization dialog.
				 * 	</li>
				 * </ol>
				 * @memberof onTheMDCFilterBar
				 * @method iEnterFilterValue
				 * @param {sap.ui.core.Control | string} oFilterBar Instance / ID of the <code>sap.ui.mdc.FilterBar</code>
				 * @param {Object} mSettings Map containing the settings for the filter values. Key is the label of the given group in the <code>sap.ui.mdc.FilterBar</code> personalization dialog, and value is an object containing the label of the <code>FilterField</code> and the values that are entered
				 * @returns {Promise} OPA waitFor
				 */
				iEnterFilterValue: function(oFilterBar, mSettings) {
					return filterBarActions.iEnterFilterValue.call(this, oFilterBar, mSettings);
				},
				/**
				 * OPA5 test action
				 * Clears all values of a <code>FilterField</code> with a given label on the <code>sap.ui.mdc.FilterBar</code>.
				 * @memberof onTheMDCFilterBar
				 * @method iClearFilterValue
				 * @param {sap.ui.core.Control | string} oFilterBar Instance / ID of the <code>sap.ui.mdc.FilterBar</code>
				 * @param {string} sFilterLabel Label of the <code>FilterField</code>
				 * @returns {Promise} OPA waitFor
				 */
				iClearFilterValue: function(oFilterBar, sFilterLabel) {
					return filterBarActions.iClearFilterValue.call(this, oFilterBar, sFilterLabel);
				},
				/**
				 * OPA5 test action
				 * Changes the view of an open <code>sap.ui.mdc.p13n.panels.AdaptFiltersPanel</code> to the given view mode.
				 * @param {string} sViewMode The view mode
				 * @returns {Promise} OPA waitFor
				 */
				iChangeAdaptFiltersView: function(sViewMode) {
					return filterBarActions.iChangeAdaptFiltersView.apply(this, arguments);
				},
				/**
				 * OPA5 test action
				 * Checks if there is a button visible in the application with the Adapt Filters icon and presses that given button.
				 * @memberof onTheMDCFilterBar
				 * @method iPressOnTheAdaptFiltersButton
				 * @returns {Promise} OPA waitFor
				 */
				iPressOnTheAdaptFiltersButton: function() {
					return filterBarActions.iPressOnTheAdaptFiltersButton.apply(this, arguments);
				},
				/**
				 * OPA5 test action
				 * Searches for an open "Adapt Filters" dialog and presses the "Ok" button on it
				 * @returns {Promise} OPA waitFor
				 */
				iCloseTheAdaptFiltersDialogWithOk: function() {
					return filterBarActions.iCloseTheAdaptFiltersDialogWithOk.apply(this, arguments);
				},
				/**
				 * OPA5 test action
				 * Searches for an open "Adapt Filters" dialog and presses the "Ok" button on it
				 * @returns {Promise} OPA waitFor
				 */
				iCloseTheAdaptFiltersDialogWithCancel: function() {
					return filterBarActions.iCloseTheAdaptFiltersDialogWithCancel.apply(this, arguments);
				}
			},
			assertions: {
				/**
				 * OPA5 test assertion
				 * Checks if given filter fields are displayed on a given <code>sap.ui.mdc.FilterBar</code>.
				 * Depending on the <code>vSettings</code> type this function can be used in two different ways:
				 * <ul>
				 * 	<li>
				 *		<code>vSettings</code> is an array of strings:
				 * 		Checks if all given strings are labels for <code>FilterFields</code> on a given <code>sap.ui.mdc.FilterBar</code>.
				 * 	</li>
				 * 	<li>
				 *  	<code>vSettings</code> is an object:
				 * 		Checks for each key in the object if there is a label for a <code>FilterField</code> of a given <code>sap.ui.mdc.FilterBar</code>.
				 * 		The value of that key is an array containing objects with the operators and values that are expected for the given <code>FilterFields</code>.
				 * 		If the value is an empty array, the given <code>FilterFields</code> doesn't have a value.
				 *  </li>
				 * </ul>
				 * @memberof onTheMDCFilterBar
				 * @method iShouldSeeFilters
				 * @param {sap.ui.core.Control | string} oFilterBar Instance / ID of the <code>sap.ui.mdc.FilterBar</code>
				 * @param {string[] | Object} vSettings Settings in which the expected filters are defined
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeFilters: function(oFilterBar, vSettings) {
					return filterBarAssertions.iShouldSeeFilters.call(this, oFilterBar, vSettings);
				},

				/**
				 * OPA5 test assertion
				 * Checks if there is a <code>sap.ui.mdc.FilterBar</code> visible in the application.
				 * @memberof onTheMDCFilterBar
				 * @method iShouldSeeTheFilterBar
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeTheFilterBar: function() {
					return filterBarAssertions.iShouldSeeTheFilterBar.apply(this, arguments);
				},
				/**
				 * OPA5 test assertion
				 * Checks if there are filter fields visible in the application with given labels.
				 * @memberof onTheMDCFilterBar
				 * @method iShouldSeeTheFilterFieldsWithLabels
				 * @param {string[]} aLabelNames Array containing the labels of the expected <code>FilterFields</code>
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeTheFilterFieldsWithLabels: function(aLabelNames) {
					return filterBarAssertions.iShouldSeeTheFilterFieldsWithLabels.apply(this, arguments);
				},
				/**
				 * OPA5 test assertion
				 * Checks if there is a button visible in the application with the Adapt Filters icon.
				 * @memberof onTheMDCFilterBar
				 * @method iShouldSeeTheAdaptFiltersButton
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeTheAdaptFiltersButton: function() {
					return filterBarAssertions.iShouldSeeTheAdaptFiltersButton.apply(this, arguments);
				},


				iCheckAvailableFilters: function(oControl, aFilters) {
					return p13nAssertions.iCheckAvailableFilters.call(this, oControl, aFilters, filterBarActions.iOpenThePersonalizationDialog);
				}
			}
		}
	});

});
