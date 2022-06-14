/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"../p13n/Actions",
	"../p13n/Assertions",
	"./Actions"
], function(
	Opa5,
	p13nActions,
	p13nAssertions,
	TableActions
) {
	"use strict";

	/**
	 * @namespace onTheMDCTable
	 */
	Opa5.createPageObjects({
		onTheMDCTable: {
			actions: {
				/**
				 * @typedef {object} FilterPersonalizationConfiguration
				 * @property {string} key Key of the value that is the result of the personalization
				 * @property {string} operator Operator defining how the items are filtered
				 * @property {string[]} values Filter values for the given operator
				 * @property {string} inputControl <code>Control</code> that is used as input for the value
				 */

				/**
				 * OPA5 test action
				 * 1. Opens the personalization dialog of a given table.
				 * 2. Executes the given <code>FilterPersonalizationConfiguration</code>.
				 * 3. Closes the personalization dialog.
				 * @memberof onTheMDCTable
				 * @method iPersonalizeFilter
				 * @param {sap.ui.core.Control | string} oControl Instance / ID of the <code>Control</code> that is filtered
				 * @param {FilterPersonalizationConfiguration[]} aSettings Array containing the filter personalization configuration objects
				 * @param {function} fnOpen A function that opens the personalization dialog of the given control
				 * @param {boolean} bCancel Cancel the personalization dialog after the configuration has been done instead of confirming it
				 * @returns {Promise} OPA waitFor
				 * @public
				 */
				iPersonalizeFilter: function(oControl, aSettings, fnOpen, bCancel) {
					return p13nActions.iPersonalizeFilter.call(this, oControl, aSettings, fnOpen || TableActions.iOpenThePersonalizationDialog, bCancel);
				},
				/**
				 * @typedef {object} GroupPersonalizationConfiguration
				 * @property {string} key of the item that is the result of the personalization
				 * @property {boolean} showFieldAsColumn Determines if the Show Field as Column checkbox is checked
				 */

				/**
				 * Opa5 test action:
				 * 1. Opens the personalization dialog of a given table.
				 * 2. Executes the given <code>GroupPersonalizationConfiguration</code>.
				 * 3. Closes the personalization dialog.
				 * @memberof onTheMDCTable
				 * @method iPersonalizeGroup
				 * @param {sap.ui.core.Control | string} oControl Instance / ID of the control that is reset
				 * @param {GroupPersonalizationConfiguration[]} aSettings An array containing the group personalization configuration objects //TODO: try do define the typedef in only one central space
				 * @returns {Promise} Opa waitFor
				 * @public
				 */
				iPersonalizeGroup: function(oControl, aSettings) {
					return p13nActions.iPersonalizeGroup.call(this, oControl, aSettings, TableActions.iOpenThePersonalizationDialog);
				},
				/**
				 * OPA5 test action
				 * 1. Opens the personalization dialog of a given table.
				 * 2. Selects all columns determined by the given labels. Also deselects all other columns that are selected but not included in the given labels.
				 * 3. Closes the personalization dialog.
				 * @memberof onTheMDCTable
				 * @method iPersonalizeColumns
				 * @param {sap.ui.core.Control | string} oControl Instance / ID of the control that is personalized
				 * @param {string[]} aItems Array containing the labels of the columns that are the result of the personalization
				 * @returns {Promise} Opa waitFor
				 * @public
				 */
				iPersonalizeColumns: function(oControl, aItems) {
					return p13nActions.iPersonalizeColumns.call(this, oControl, aItems, TableActions.iOpenThePersonalizationDialog);
				},
				/**
				 * @typedef {object} SortPersonalizationConfiguration
				 * @property {string} key Key of the item that is the result of the personalization
				 * @property {boolean} descending Determines whether the sort direction is descending
				 */

				/**
				 * OPA5 test action
				 * 1. Opens the personalization dialog of a given table.
				 * 2. Executes the given <code>SortPersonalizationConfiguration</code>.
				 * 3. Closes the personalization dialog.
				 * @memberof onTheMDCTable
				 * @method iPersonalizeSort
				 * @param {sap.ui.core.Control | string} oControl Instance / ID of the <code>Control</code> that is sorted
				 * @param {SortPersonalizationConfiguration[]} aSettings Array containing the sort personalization configuration objects
				 * @returns {Promise} OPA waitFor
				 * @public
				 */
				iPersonalizeSort: function(oControl, aSettings) {
					return p13nActions.iPersonalizeSort.call(this, oControl, aSettings, TableActions.iOpenThePersonalizationDialog);
				},
				/**
				 * Opa5 test action
				 * 1. Opens the personalization dialog of a given table.
				 * 2. Presses the Reset personalization button.
				 * 3. Confirms the Reset dialog.
				 * 4. Closes the personalization dialog.
				 * @memberof onTheMDCTable
				 * @method iResetThePersonalization
				 * @param {sap.ui.core.Control | string} oControl Instance / ID of the <code>Control</code> that is reset
				 * @returns {Promise} OPA waitFor
				 * @public
				 */
				iResetThePersonalization: function(oControl) {
					return p13nActions.iResetThePersonalization.call(this, oControl, TableActions.iOpenThePersonalizationDialog);
				}
			},
			assertions: {
				/**
				 * @typedef {object} FilterPersonalizationConfiguration
				 * @property {string} key Key of the value that is the result of the personalization
				 * @property {string} operator Operator defining how the items are filtered
				 * @property {string[]} values Filter values for the given operator
				 * @property {string} inputControl <code>Control</code> that is used as input for the value
				 */

				/**
				 * OPA5 test assertion
				 * 1. Opens the personalization dialog of a given table.
				 * 2. Executes the given <code>FilterPersonalizationConfiguration</code>.
				 * 3. Closes the personalization dialog.
				 * @memberof onTheMDCTable
				 * @method iCheckFilterPersonalization
				 * @param {sap.ui.core.Control | string} oControl Instance / ID of the <code>Control</code> that is filtered
				 * @param {FilterPersonalizationConfiguration[]} aConfigurations Array containing the filter personalization configuration objects
				 * @returns {Promise} OPA waitFor
				 */
				iCheckFilterPersonalization: function(oControl, aConfigurations) {
					return p13nAssertions.iCheckFilterPersonalization.call(this, oControl, aConfigurations, TableActions.iOpenThePersonalizationDialog);
				},

				/**
				 * OPA5 test assertion
				 * 1. Opens the personalization dialog of a given table.
				 * 2. Checks the availability of the provided filter texts (by opening and comparing the available items in the ComboBox)
				 * 3. Closes the personalization dialog.
				 * @memberof onTheMDCTable
				 * @method iCheckAvailableFilters
				 * @param {sap.ui.core.Control | string} oControl Instance / ID of the <code>Control</code> that is filtered
				 * @param {string[]} aFilters Array containing the names of selectable filters
				 * @returns {Promise} OPA waitFor
				 */
				iCheckAvailableFilters: function(oControl, aFilters) {
					return p13nAssertions.iCheckAvailableFilters.call(this, oControl, aFilters, TableActions.iOpenThePersonalizationDialog);
				}
			}
		}
	});

});