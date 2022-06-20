/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"./Actions",
	"./Assertions",
	"../p13n/Actions"
], function(
	Opa5,
	filterBarActions,
	filterBarAssertions,
	p13nActions
) {
	"use strict";

	Opa5.createPageObjects({
		onFilterBar: {
			actions: {
				/**
				 * OPA5 test action
				 * <ol>
				 * 	<li>
				 * 		Opens the personalization dialog of the given <code>FilterBar</code>.
				 * 	</li>
				 *  <li>
				 * 		Navigates to the "Group" tab.
				 * 	</li>
				 * 	<li>
				 * 		Opens all groups and selects / deselects all <code>FilterFields</code> depending on <code>oSettings</code>. Only the labels defined in <code>oSettings</code> will be selected, others will be deselected.
				 * 	</li>
				 * 	<li>
				 * 		Closes the personalization dialog.
				 * 	</li>
				 * </ol>
				 * @param {sap.ui.core.Control | string} oFilterBar Instance / ID of the <code>FilterBar</code> that is filtered
				 * @param {Object} oSettings Map containing the settings for the filter personalization. Key is the label of the given group in the <code>FilterBar</code> personalization dialog, and value is an array containing the labels of the <code>FilterField</code>
				 * @returns
				 */
				iPersonalizeFilter: function(oFilterBar, oSettings) {
					return p13nActions.iPersonalizeFilterBar.call(this, oFilterBar, oSettings, filterBarActions.iOpenThePersonalizationDialog);
				},
				/**
				 * OPA5 test action
				 * <ol>
				 * 	<li>
				 * 		Opens the personalization dialog of the given <code>FilterBar</code>.
				 * 	</li>
				 * 	<li>
				 * 		Presses the reset personalization button.
				 * 	</li>
				 * 	<li>
				 * 		Confirms the reset dialog.
				 * 	</li>
				 * 	<li>
				 * 		Closes the personalization dialog.
				 * 	</li>
				 * </ol>
				 * @param {sap.ui.core.Control | string} oFilterBar Instance / ID of the <code>FilterBar</code>
				 * @returns
				 */
				iResetThePersonalization: function(oFilterBar) {
					return p13nActions.iResetThePersonalization.call(this, oFilterBar, filterBarActions.iOpenThePersonalizationDialog);
				},
				/**
				 * OPA5 test action
				 * Presses the apply filters button of the <code>FilterBar</code>.
				 * @param {sap.ui.core.Control | string} oFilterBar Instance / ID of the <code>FilterBar</code>
				 * @returns
				 */
				iExpectSearch: function(oFilterBar) {
					return filterBarActions.iExpectSearch.call(this, oFilterBar);
				},
				/**
				 * OPA5 test action
				 * <ol>
				 * 	<li>
				 * 		Opens the personalization dialog of the given <code>FilterBar</code>.
				 * 	</li>
				 *	<li>
				 * 		Navigates to the "Group" tab.
				 *	</li>
				 * 	<li>
				 * 		Opens the given groups and enters all values in the <code>FilterFields</code> depending on <code>oSettings</code>.
				 * 	</li>
				 * 	<li>
				 * 		Closes the personalization dialog.
				 * 	</li>
				 * </ol>
				 * @param {sap.ui.core.Control | string} oFilterBar Instance / ID of the <code>FilterBar</code>
				 * @param {Object} mSettings Map containing the settings for the filter values. Key is the label of the given group in the <code>FilterBar</code> personalization dialog, and value is an object containing the label of the <code>FilterField</code> and the values that are entered
				 * @returns
				 */
				iEnterFilterValue: function(oFilterBar, mSettings) {
					return filterBarActions.iEnterFilterValue.call(this, oFilterBar, mSettings);
				},
				/**
				 * OPA5 test action
				 * Clears all values of a <code>FilterField</code> with a given label on the <code>FilterBar</code>.
				 * @param {sap.ui.core.Control | string} oFilterBar Instance / ID of the <code>FilterBar</code>
				 * @param {string} sFilterLabel Label of the <code>FilterField</code>
				 * @returns
				 */
				iClearFilterValue: function(oFilterBar, sFilterLabel) {
					return filterBarActions.iClearFilterValue.call(this, oFilterBar, sFilterLabel);
				},

				iChangeAdaptFiltersView: function(sViewMode) {
					return filterBarActions.iChangeAdaptFiltersView.apply(this, arguments);
				},
				iPressOnTheAdaptFiltersButton: function() {
					return filterBarActions.iPressOnTheAdaptFiltersButton.apply(this, arguments);
				}
            },
            assertions: {
				/**
				 * OPA5 test action
				 * Checks if given <code>FilterFields</code> are displayed on a given <code>FilterBar</code>.
				 * Depending on the <code>vSettings</code> type this function can be used in two different ways:
				 * <ul>
				 * 	<li>
				 *		<code>vSettings</code> is an array of strings:
				 * 		Checks if all given strings are labels for <code>FilterFields</code> on a given <code>FilterBar</code>.
				 * 	</li>
				 * 	<li>
				 *  	<code>vSettings</code> is an object:
				 * 		Checks for each key in the object if there is a label for a <code>FilterFields</code> of a given <code>FilterBar</code>.
				 * 		The value of that key is an array containing objects with the operators and values that are expected for the given <code>FilterFields</code>.
				 * 		If the value is an empty array, the given <code>FilterFields</code> doesn't have a value.
				 *  </li>
				 * </ul>
				 * @param {sap.ui.core.Control | string} oFilterBar Instance / ID of the <code>FilterBar</code>
				 * @param {string[] | Object} vSettings
				 * @returns
				 */
				iShouldSeeFilters: function(oFilterBar, vSettings) {
					return filterBarAssertions.iShouldSeeFilters.call(this, oFilterBar, vSettings);
				},

				iShouldSeeTheFilterBar: function() {
					return filterBarAssertions.iShouldSeeTheFilterBar.apply(this, arguments);
				},
				iShouldSeeTheFilterFieldsWithLabels: function(aLabelNames) {
					return filterBarAssertions.iShouldSeeTheFilterFieldsWithLabels.apply(this, arguments);
				},
				iShouldSeeTheAdaptFiltersButton: function() {
					return filterBarAssertions.iShouldSeeTheAdaptFiltersButton.apply(this, arguments);
				}
			}
        }
    });

});
