sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Actions",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Assertions",
	"test-resources/sap/ui/mdc/testutils/opa/table/Actions"
], function(
	/** @type sap.ui.test.Opa5 */ Opa5,
	/** @type sap.ui.test.Opa5 */ AppUnderTestActions,
	/** @type sap.ui.test.Opa5 */ AppUnderTestAssertions,
	/** @type sap.ui.test.Opa5 */ TableActions) {
	"use strict";

	Opa5.createPageObjects({
		onTheAppUnderTestMDCTable: {
			actions: {
				/**
				 * Just look at the screen
				 *
				 * @function
				 * @name iLookAtTheScreen
				 * @return {sap.ui.mdc.qunit.table.OpaTests.pages.Actions} Action object
				 * @private
				 */
				iLookAtTheScreen: function() {
					return AppUnderTestActions.iLookAtTheScreen.call(this);
				},

				/**
				 * Emulate a click action on the 'Select all' check box to select / deselect all rows.
				 *
				 * @function
				 * @name iClickOnSelectAllCheckBox
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iClickOnSelectAllCheckBox: function(oControl) {
					return AppUnderTestActions.iClickOnSelectAllCheckBox.call(this, oControl);
				},

				/**
				 * Emulate a click action on the 'Deselect all' icon to remove the selection on all visible rows.
				 *
				 * @function
				 * @name iClickOnClearAllIcon
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iClickOnClearAllIcon: function(oControl) {
					return AppUnderTestActions.iClickOnClearAllIcon.call(this, oControl);
				},

				/**
				 * Emulates a click action on the check box of one or multiple rows to select them.
				 *
				 * @function
				 * @name iClickOnRowSelectCheckBox
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @param {Number} iStartIndex Index from which the selection starts
				 * @param {Number} iEndIndex Index up to the selection ends
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iClickOnRowSelectCheckBox: function(oControl, iStartIndex, iEndIndex) {
					return AppUnderTestActions.iClickOnRowSelectCheckBox.call(this, oControl, iStartIndex, iEndIndex);
				},

				/**
				 * Performs a Press action on {@link sap.m.SegmentedButtonItem}
				 * 'showDetails' to display hidden columns in the pop-in area.
				 *
				 * @function
				 * @name iPressShowMoreButton
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iPressShowMoreButton: function(oControl) {
					return AppUnderTestActions.iPressShowMoreButton.call(this, oControl);
				},

				/**
				 * Performs a Press action on {@link sap.m.SegmentedButtonItem}
				 * 'hideDetails' to hide hidden columns from the pop-in area.
				 *
				 * @function
				 * @name iPressShowLessButton
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iPressShowLessButton: function(oControl) {
					return AppUnderTestActions.iPressShowLessButton.call(this, oControl);
				},

				/**
				 * Performs a Press action on {@link sap.m.Button}
				 * 'export-internalSplitBtn-textButton' to start the Excel export.
				 *
				 * @function
				 * @name iPressQuickExportButton
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iPressQuickExportButton: function(oControl) {
					return AppUnderTestActions.iPressQuickExportButton.call(this, oControl);
				},

				/**
				 * Performs a Press action on {@link sap.m.Button}
				 * 'export-internalSplitBtn-arrowButton' that shows up the
				 * additional {@link sap.ui.unified.Menu} with the items
				 * <ul>
				 *     <li>Export</li>
				 *     <li>Export as...</li>
				 * </ul>.
				 *
				 * @function
				 * @name iPressExportMenuButton
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iPressExportMenuButton: function(oControl) {
					return AppUnderTestActions.iPressExportMenuButton.call(this, oControl);
				},

				/**
				 * Performs a Press action on {@link sap.ui.unified.MenuItem} 'Export'
				 * that is shown up from {@link #iPressExportMenuButton}.
				 *
				 * @function
				 * @name iPressExportMenuButton
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iPressExportButtonInMenu: function() {
					return AppUnderTestActions.iPressExportButtonInMenu.call(this);
				},

				/**
				 * Performs a Press action on {@link sap.ui.unified.MenuItem} 'Export as...'
				 * that is shown up from {@link #iPressExportMenuButton}.
				 *
				 * @function
				 * @name iPressExportAsButtonInMenu
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iPressExportAsButtonInMenu: function() {
					return AppUnderTestActions.iPressExportAsButtonInMenu.call(this);
				},

				/**
				 * Fills in the data in the {@link sap.m.Dialog} 'exportSettingsDialog'
				 * that is shown up from {@link #iPressExportAsButtonInMenu} and triggers the excel export.
				 *
				 * @function
				 * @name iFillInExportSettingsDialog
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @param {Object} [mSettings] Excel export settings
				 * @param {String} [mSettings.fileName] Optional name for the exported file
				 * @param {String} [mSettings.fileType] Optional type the file should be exported tp XLSX/PDF
				 * @param {Boolean} [mSettings.includeFilterSettings] Optional flag whether to include the filter settings in the exported file
				 * @param {Boolean} [mSettings.splitCells] Optional flag whether to split columns with multiple values
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iFillInExportSettingsDialog: function(oControl, mSettings) {
					return AppUnderTestActions.iFillInExportSettingsDialog.call(this, oControl, mSettings);
				},

				/**
				 * Performs Press action on {@link sap.m.Button} 'exportSettingsDialog-exportButton'
				 * in {@link sap.m.Dialog} 'exportSettingsDialog'.
				 *
				 * @function
				 * @name iPressExportButtonInExportSettingsDialog
				 * @returns {Promise} OPA waitFor
				 */
				iPressExportButtonInExportSettingsDialog: function() {
					return AppUnderTestActions.iPressExportButtonInExportSettingsDialog.call(this);
				},

				/**
				 * Changes the {@link sap.ui.mdc.Table#multiSelectMode} property.
				 *
				 * @function
				 * @name iChangeMultiSelectMode
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @param {String} sMode The new value for the multiSelectMode property (Default|ClearAll)
				 * @returns {Promise} OPA waitFor
				 */
				iChangeMultiSelectMode: function(oControl, sMode) {
					return AppUnderTestActions.iChangeMultiSelectMode.call(this, oControl, sMode);
				},

				/**
				 * Changes the {@link sap.ui.mdc.Table#type} aggregation.
				 *
				 * @function
				 * @name iChangeType
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @param {String} sType The new type for the MDCTable (ResponsiveTable|Table)
				 * @returns {Promise} OPA waitFor
				 */
				iChangeType: function(oControl, sType) {
					return AppUnderTestActions.iChangeType.call(this, oControl, sType);
				},

				/**
				 * Changes the {@link sap.ui.table.plugins.MultiSelectionPlugin#limit} property
				 * that is bound to the MDCTable.
				 * Succeeds only if {@link sap.ui.mdc.Table#type} is set to <code>Table</code>.
				 *
				 * @function
				 * @name iChangeLimit
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @param {Number} iLimit The new value for the limit property
				 * @returns {Promise} OPA waitFor
				 */
				iChangeLimit: function(oControl, iLimit) {
					return AppUnderTestActions.iChangeLimit.call(this, oControl, iLimit);
				},

				/**
				 * Selects all visible rows available in the MDCTable.
				 *
				 * @function
				 * @name iSelectAllRows
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 */
				iSelectAllRows: function(oControl) {
					return TableActions.iSelectAllRows.call(this, oControl);
				},

				/**
				 * Removes all selections from the MDCTable.
				 *
				 * @function
				 * @name iClearSelection
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 */
				iClearSelection: function(oControl) {
					return TableActions.iClearSelection.call(this, oControl);
				},

				/**
				 * Selects one or multiple rows.
				 *
				 * @function
				 * @name iSelectSomeRows
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @param {Number} iStartIndex Index from which the selection starts
				 * @param {Number} iEndIndex Index up to the selection ends
				 * @returns {Promise} OPA waitFor
				 */
				iSelectSomeRows: function(oControl, iStartIndex, iEndIndex) {
					return TableActions.iSelectSomeRows.call(this, oControl, iStartIndex, iEndIndex);
				},

				/**
				 * Removes the selection for one or multiple rows.
				 *
				 * @function
				 * @name iDeselectSomeRows
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @param {Number} iStartIndex Index from which the selection starts
				 * @param {Number} iEndIndex Index up to the selection ends
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iDeselectSomeRows: function(oControl, iStartIndex, iEndIndex) {
					return TableActions.iDeselectSomeRows.call(this, oControl, iStartIndex, iEndIndex);
				},

				iPressOnColumnHeader: function(sName, bResponsiveTable){
					return AppUnderTestActions.iPressOnColumnHeader.apply(this, arguments);
				},

				iCloseTheColumnMenu: function() {
					return AppUnderTestActions.iCloseTheColumnMenu.apply(this, arguments);
				},

				iUseColumnMenuQuickSort: function(mConfig) {
					return AppUnderTestActions.iUseColumnMenuQuickSort.apply(this, arguments);
				},

				iUseColumnMenuQuickGroup: function(mConfig) {
					return AppUnderTestActions.iUseColumnMenuQuickGroup.apply(this, arguments);
				},

				iUseColumnMenuQuickTotal: function(mConfig) {
					return AppUnderTestActions.iUseColumnMenuQuickTotal.apply(this, arguments);
				},

				iPressOnColumnMenuItem: function(sLabel) {
					return AppUnderTestActions.iPressOnColumnMenuItem.apply(this, arguments);
				},

				iNavigateBackFromColumnMenuItemContent: function() {
					return AppUnderTestActions.iNavigateBackFromColumnMenuItemContent.apply(this, arguments);
				},

				iPressResetInColumnMenuItemContent: function() {
					return AppUnderTestActions.iPressResetInColumnMenuItemContent.apply(this, arguments);
				},

				iPressConfirmInColumnMenuItemContent: function() {
					return AppUnderTestActions.iPressConfirmInColumnMenuItemContent.apply(this, arguments);
				},

				iPressCancelInColumnMenuItemContent: function() {
					return AppUnderTestActions.iPressCancelInColumnMenuItemContent.apply(this, arguments);
				}
			},
			assertions: {
				/**
				 * Checks if a MDCTable is visible on the screen.
				 *
				 * @function
				 * @name iShouldSeeATable
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeATable: function(oControl) {
					return AppUnderTestAssertions.iShouldSeeATable.call(this, oControl);
				},

				/**
				 * Checks if the 'Select all' check box is visible on the MDCTable.
				 *
				 * @function
				 * @name iShouldSeeTheSelectAllCheckBox
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeTheSelectAllCheckBox: function(oControl) {
					return AppUnderTestAssertions.iShouldSeeTheSelectAllCheckBox.call(this, oControl);
				},

				/**
				 * Checks if the 'Deselect all' icon is visible on the MDCTable.
				 *
				 * @function
				 * @name iShouldSeeTheDeselectAllIcon
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeTheDeselectAllIcon: function(oControl) {
					return AppUnderTestAssertions.iShouldSeeTheDeselectAllIcon.call(this, oControl);
				},

				/**
				 * Checks if the table header with the give text is visible on the MDCTable.
				 *
				 * @function
				 * @name iShouldSeeTheHeaderText
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @param {String} sHeaderText The text that the MDCTable header should contains
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeTheHeaderText: function(oControl, sHeaderText) {
					return AppUnderTestAssertions.iShouldSeeTheHeaderText.call(this, oControl, sHeaderText);
				},

				/**
				 * Checks if the table count is visible on the MDCTable as part of the header text.
				 *
				 * @function
				 * @name iShouldSeeTheCount
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeTheCount: function(oControl) {
					return AppUnderTestAssertions.iShouldSeeTheCount.call(this, oControl);
				},

				/**
				 * Checks if the table variant management is visible on the screen
				 *
				 * @function
				 * @name iShouldSeeTheVariantManagement
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeTheVariantManagement: function(oControl) {
					return AppUnderTestAssertions.iShouldSeeTheVariantManagement.call(this, oControl);
				},

				/**
				 * Checks if the Show/Hide Details button is visible on the screen
				 *
				 * @function
				 * @name iShouldSeeTheShowHideDetailsButton
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeTheShowHideDetailsButton: function(oControl) {
					return AppUnderTestAssertions.iShouldSeeTheShowHideDetailsButton.call(this, oControl);
				},

				/**
				 * Checks if the Paste button is visible on the screen
				 *
				 * @function
				 * @name iShouldSeeThePasteButton
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeThePasteButton: function(oControl) {
					return AppUnderTestAssertions.iShouldSeeThePasteButton.call(this, oControl);
				},

				/**
				 * Checks if the P13n button is visible on the screen
				 *
				 * @function
				 * @name iShouldSeeTheP13nButton
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeTheP13nButton: function(oControl) {
					return AppUnderTestAssertions.iShouldSeeTheP13nButton.call(this, oControl);
				},

				/**
				 * Checks if the Export button is visible on the screen
				 *
				 * @function
				 * @name iShouldSeeTheExportMenuButton
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeTheExportMenuButton: function(oControl) {
					return AppUnderTestAssertions.iShouldSeeTheExportMenuButton.call(this, oControl);
				},

				/**
				 * Checks if there should be visible columns in the pop-in area or not
				 *
				 * @function
				 * @name iShouldSeePopins
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @param {boolean} bHasPopins Rather there should be visible columns in the pop-in area or not
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeePopins: function(oControl, bHasPopins) {
					return AppUnderTestAssertions.iShouldSeePopins.call(this, oControl, bHasPopins);
				},

				/**
				 * Checks if all visible items should be selected or deselected
				 *
				 * @function
				 * @name iShouldSeeAllVisibleRowsSelected
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @param {boolean} bSelectAll Flag to selected or deselected all
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeAllVisibleRowsSelected: function(oControl, bSelectAll) {
					return AppUnderTestAssertions.iShouldSeeAllVisibleRowsSelected.call(this, oControl, bSelectAll);
				},

				/**
				 * Checks if the given rows are selected.
				 *
				 * @function
				 * @name iShouldSeeSomeRowsSelected
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @param {Number} iStartIndex Index from which the selection starts
				 * @param {Number} iEndIndex Index up to the selection ends
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeSomeRowsSelected: function(oControl, iStartIndex, iEndIndex) {
					return AppUnderTestAssertions.iShouldSeeSomeRowsSelected.call(this, oControl, iStartIndex, iEndIndex);
				},

				/**
				 * Checks if the dialog, showing the actual process status of the export,
				 * is visible on the screen.
				 *
				 * @function
				 * @name iShouldSeeExportProcessDialog
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeExportProcessDialog: function() {
					return AppUnderTestAssertions.iShouldSeeExportProcessDialog.call(this);
				},

				/**
				 * Checks if the {@link sap.ui.unified.Menu} shows up after
				 * pressing on the arrow button performed in {@link #iPressExportMenuButton}.
				 *
				 * @function
				 * @name iShouldSeeExportMenu
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeExportMenu: function() {
					return AppUnderTestAssertions.iShouldSeeExportMenu.call(this);
				},

				/**
				 * Checks if the sap.m.Dialog 'exportSettingsDialog' is visible on the screen after
				 * pressing on the 'Export as...' button performed in {@link #iPressExportAsButtonInMenu}.
				 *
				 * @function
				 * @name iShouldSeeExportSettingsDialog
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeExportSettingsDialog: function() {
					return AppUnderTestAssertions.iShouldSeeExportSettingsDialog.call(this);
				},

				iShouldSeeOneColumnMenu: function() {
					return AppUnderTestAssertions.iShouldSeeOneColumnMenu.apply(this, arguments);
				},

				iShouldNotSeeTheColumnMenu: function() {
					return AppUnderTestAssertions.iShouldNotSeeTheColumnMenu.apply(this, arguments);
				},

				iShouldSeeNumberOfColumnMenuQuickActions: function(iCount) {
					return AppUnderTestAssertions.iShouldSeeNumberOfColumnMenuQuickActions.apply(this, arguments);
				},

				iShouldNotSeeColumnMenuQuickActions: function() {
					return AppUnderTestAssertions.iShouldNotSeeColumnMenuQuickActions.apply(this, arguments);
				},

				iShouldSeeColumnMenuQuickSort: function(mSortItemInfo) {
					return AppUnderTestAssertions.iShouldSeeColumnMenuQuickSort.apply(this, arguments);
				},

				iShouldSeeColumnMenuQuickGroup: function(mGroupItemInfo) {
					return AppUnderTestAssertions.iShouldSeeColumnMenuQuickGroup.apply(this, arguments);
				},

				iShouldSeeColumnMenuQuickTotal: function(mTotalItemInfo) {
					return AppUnderTestAssertions.iShouldSeeColumnMenuQuickTotal.apply(this, arguments);
				},

				iShouldSeeNumberOfColumnMenuItems: function(iCount) {
					return AppUnderTestAssertions.iShouldSeeNumberOfColumnMenuItems.apply(this, arguments);
				},

				iShouldNotSeeColumnMenuItems: function() {
					return AppUnderTestAssertions.iShouldNotSeeColumnMenuItems.apply(this, arguments);
				},

				iShouldSeeColumnMenuItems: function(aLabels) {
					return AppUnderTestAssertions.iShouldSeeColumnMenuItems.apply(this, arguments);
				},

				iShouldSeeColumnMenuItem: function(sLabel) {
					return AppUnderTestAssertions.iShouldSeeColumnMenuItem.apply(this, arguments);
				},

				iShouldSeeColumnMenuItemContent: function(sTitle) {
					return AppUnderTestAssertions.iShouldSeeColumnMenuItemContent.apply(this, arguments);
				}
			}
		}
	});
});