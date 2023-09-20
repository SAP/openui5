sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Actions",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Assertions",
	"test-resources/sap/ui/mdc/testutils/opa/table/Actions",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action"
], function(
	/** @type sap.ui.test.Opa5 */ Opa5,
	/** @type sap.ui.test.Opa5 */ AppUnderTestActions,
	/** @type sap.ui.test.Opa5 */ AppUnderTestAssertions,
	/** @type sap.ui.test.Opa5 */ TableActions,
	/** @type sap.ui.test.Opa5 */ P13nAction) {
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
				 * Emulates a click action on the expand all rows button.
				 *
				 * @function
				 * @name iClickOnExpandAllRowsButton
				 * @param {String|sap.ui.mdc.Table} vControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iClickOnExpandAllRowsButton: function(vControl) {
					return AppUnderTestActions.iClickOnExpandAllRowsButton.call(this, vControl);
				},

				/**
				 * Emulates a click action on the collapse all rows button.
				 *
				 * @function
				 * @name iClickOnCollapseAllRowsButton
				 * @param {String|sap.ui.mdc.Table} vControl Id or control instance of the MDCTable
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iClickOnCollapseAllRowsButton: function(vControl) {
					return AppUnderTestActions.iClickOnCollapseAllRowsButton.call(this, vControl);
				},

				/**
				 * Emulates a drag action on a column to move it.
				 *
				 * @function
				 * @name iDragColumn
				 * @param {String|sap.ui.mdc.Table} vControl Id or control instance of the MDCTable
				 * @param {Number} iColumnIndex Index of Column to drag
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iDragColumn: function(vControl, iColumnIndex) {
					return AppUnderTestActions.iDragColumn.call(this, vControl, iColumnIndex);
				},

				/**
				 *  Emulates a drop action on a column to drop it after a defined column.
				 *
				 * @function
				 * @name iDropColumnAfter
				 * @param {String|sap.ui.mdc.Table} vControl Id or control instance of the MDCTable
				 * @param {Number} iColumnIndex Index of Column on which Drop should be executed
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iDropColumnAfter: function(vControl, iColumnIndex) {
					return AppUnderTestActions.iDropColumnAfter.call(this, vControl, iColumnIndex);
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
				 * Emulates a press action on a column header to open the column menu.
				 *
				 * @function
				 * @name iPressOnColumnHeader
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @param {String|sap.ui.mdc.table.Column} vColumn Header name or control instance of the column
				 * @returns {Promise} OPA waitFor
				 */
				iPressOnColumnHeader: function(oControl, vColumn) {
					return AppUnderTestActions.iPressOnColumnHeader.call(this, oControl, vColumn);
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
				 * @name iSelectRows
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @param {Number} iStartIndex Index from which the selection starts
				 * @param {Number} iEndIndex Index up to the selection ends
				 * @returns {Promise} OPA waitFor
				 */
				iSelectRows: function(oControl, iStartIndex, iEndIndex) {
					return TableActions.iSelectRows.call(this, oControl, iStartIndex, iEndIndex);
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

				/**
				 * Chooses the specified column in the combobox of the sort menu item inside the column menu.
				 *
				 * @function
				 * @name iSortByColumnInColumnMenuItemContent
				 * @param {String} sColumn Header of the column
				 * @param {Boolean} bDescending Sorting direction is descending
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iSortByColumnInColumnMenuItemContent: function(sColumn) {
					return AppUnderTestActions.iSortByColumnInColumnMenuItemContent.apply(this, arguments);
				},

				iPressConfirmInColumnMenuItemContent: function() {
					return AppUnderTestActions.iPressConfirmInColumnMenuItemContent.apply(this, arguments);
				},

				iPressCancelInColumnMenuItemContent: function() {
					return AppUnderTestActions.iPressCancelInColumnMenuItemContent.apply(this, arguments);
				},

				/**
				 * Presses the filter info bar on the table.
				 *
				 * @param {string|sap.ui.core.Control} vControl control ID or control instance
				 * @returns {Promise} OPA waitFor
				 */
				iPressFilterInfoBar: function(vControl) {
					return AppUnderTestActions.iPressFilterInfoBar.apply(this, arguments);
				},

				/**
				 * Removes all filters by pressing the "Remove All Filters" button on the filter info bar.
				 *
				 * @returns {Promise} OPA waitFor
				 */
				iRemoveAllFiltersViaInfoFilterBar: function() {
					return AppUnderTestActions.iRemoveAllFiltersViaInfoFilterBar.apply(this, arguments);
				},

				iConfirmColumnMenuItemContent: function() {
					return AppUnderTestActions.iConfirmColumnMenuItemContent.apply(this, arguments);
				},

				iOpenP13nDialog: function() {
					return AppUnderTestActions.iOpenP13nDialog.apply(this, arguments);
				},

				iSelectVariant: function(sVariantName) {
					const Action = new P13nAction();
					return Action.iSelectVariant(sVariantName);
				},

				/** Selects the column in Selection panel from p13n or column menu
				 *
				 * @param {Array} aColumnName list of column lanel that needs to be selected.
				 * @param {Boolean} [bModal] Indicates whether column menu or p13n dialog is used.
				 * @returns {Promise} OPA waitFor
				 */
				iSelectColumns: function(aColumnName, bModal) {
					const Action = new P13nAction();
					return aColumnName.forEach(function(sColumnName) {
						Action.iSelectColumn(sColumnName, null, undefined, bModal);
					});
				},

				/** Closes the p13n dialog
				 *
				 * @returns {Promise} OPA waitFor
				 */
				iPressDialogOk: function() {
					const Action = new P13nAction();
					return Action.iPressDialogOk();
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
				 * @param {Boolean} sKey The selected key
		 		 * @param {Boolean} bValue Button visibility
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeTheShowHideDetailsButton: function(oControl, sKey, bValue) {
					return AppUnderTestAssertions.iShouldSeeTheShowHideDetailsButton.call(this, oControl, sKey, bValue);
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
				 * Checks if the P13n button is visible/not visible on the MDCTable.
				 *
				 * @function
				 * @name iShouldSeeTheP13nButton
				 * @param {String|sap.ui.mdc.Table} oControl Id or control instance of the MDCTable
				 * @param {Boolean} bShowP13n Flag if P13n button should be visible
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeTheP13nButton: function(oControl, bShowP13n) {
					return AppUnderTestAssertions.iShouldSeeTheP13nButton.call(this, oControl, bShowP13n);
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
				 * Checks if row count is correct.
				 *
				 * @function
				 * @name iCheckBindingLength
				 * @param {String|sap.ui.mdc.Table} vControl Id or control instance of the MDCTable
				 * @param {Number} iRowNumber Number of expected visible rows
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iCheckBindingLength: function(vControl, iRowNumber) {
					return AppUnderTestAssertions.iCheckBindingLength.call(this, vControl, iRowNumber);
				},

				/**
				 * Checks if column is in correct position.
				 *
				 * @function
				 * @name iCheckColumnPosition
				 * @param {String|sap.ui.mdc.Table} vControl Id or control instance of the MDCTable
				 * @param {String} sColumnId Column Id String
				 * @param {Number} iColumnNumber Number of expected column position
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iCheckColumnPosition: function(vControl, sColumnId, iColumnNumber) {
					return AppUnderTestAssertions.iCheckColumnPosition.call(this, vControl, sColumnId, iColumnNumber);
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

				/**
				 * Checks if the ColumnMenu is visible.
				 *
				 * @function
				 * @name iShouldSeeTheColumnMenu
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeTheColumnMenu: function() {
					return AppUnderTestAssertions.iShouldSeeTheColumnMenu.call(this);
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

				/**
				 * Checks if there are no QuickActions available in the column menu.
				 *
				 * @function
				 * @name iShouldNotSeeColumnMenuItems
				 * @returns {Promise} OPA waitFor
				 */
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
				},

				/**
				 * Checks if sorting configuration of the column matches the specified sorting settings.
				 *
				 * @function
				 * @name iShouldSeeColumnSorted
				 * @param {sap.ui.mdc.Table} oControl Instance of the MDCTable
				 * @param {String|sap.ui.mdc.table.Column} vColumn Header name or control instance of the column
				 * @param {Boolean} bDescending Sorting direction is descending
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeColumnSorted: function(oControl, vColumn, bDescending) {
					return AppUnderTestAssertions.iShouldSeeColumnSorted.apply(this, arguments);
				},

				/**
				 * Checks if the selected column of the sorting combobox matches the specified column in the parameter.
				 *
				 * @function
				 * @name iShouldSeeSortedByColumnInColumnMenuItem
				 * @param {String} sColumn Header of the column
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeSortedByColumnInColumnMenuItem: function(sColumn) {
					return AppUnderTestAssertions.iShouldSeeSortedByColumnInColumnMenuItem.apply(this, arguments);
				},

				/**
				 * Checks if sorting direction inside the column menu matches the specified sorting direction in the parameter.
				 *
				 * @function
				 * @name iShouldSeeSortDirectionInColumnMenuItem
				 * @param {Boolean} bDescending Sorting direction is descending
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeSortDirectionInColumnMenuItem: function(bDescending) {
					return AppUnderTestAssertions.iShouldSeeSortDirectionInColumnMenuItem.apply(this, arguments);
				},

				/**
				 * Checks if the P13n dialog is visible.
				 *
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeP13nDialog: function() {
					return AppUnderTestAssertions.iShouldSeeP13nDialog.apply(this, arguments);
				},

				/**
				 * Checks if the specified values in the filter dialog can be seen for the column.
				 * @param {string} sColumn column name
				 * @param {string} sValue filter value
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeValuesInFilterDialog: function(sColumn, sValue) {
					return AppUnderTestAssertions.iShouldSeeValuesInFilterDialog.apply(this, arguments);
				},

				/**
				 * Checks if the filter info bar contains all the filtered columns.
				 *
				 * @param {sap.ui.core.Control|string} vControl control instance or control ID
				 * @param {string[]} aFilteredColumns array of column names that should be visible
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeInfoFilterBarWithFilters: function(aFilteredColumns) {
					return AppUnderTestAssertions.iShouldSeeInfoFilterBarWithFilters.apply(this, arguments);
				},

				/**
				 * Checks if the filter info bar is not visible.
				 *
				 * @param {sap.ui.core.Control|string} vControl control instance or control ID
				 * @returns {Promise} OPA waitFor
				 */
				iShouldNotSeeInfoFilterBar: function(vControl) {
					return AppUnderTestAssertions.iShouldNotSeeInfoFilterBar.apply(this, arguments);
				},

				/**
				 * Checks if the focus is on a given control.
				 *
				 * @param {string|sap.ui.core.Control} vControl control instance or a control ID
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeFocusOnControl: function(vControl) {
					return AppUnderTestAssertions.iShouldSeeFocusOnControl.apply(this, arguments);
				},

				/**
				 * Checks if the variant is selected
				 *
				 * @param {String} sVariantName Selected variant name
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeSelectedVariant: function(sVariantName) {
					return AppUnderTestAssertions.iShouldSeeSelectedVariant.apply(this, arguments);
				}
			}
		}
	});
});