/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onThePage: {
			viewName: "sap.ui.mdc.sample.FilterFieldTypes.View",
			actions: {

				// table
				iClickOnTheSortButton: function() {
					return this.mdcTestLibrary.iClickOnTheSortButton();
				},

				iClickOnColumnHeader: function(sColumn) {
					return this.mdcTestLibrary.iClickOnColumnHeader(sColumn);
				},

				iClickOnColumnHeaderMenuSortButton: function(sColumn) {
					return this.mdcTestLibrary.iClickOnAColumnHeaderMenuButtonWithIcon(sColumn, "sap-icon://sort");
				},

				iClickOnColumnHeaderMenuCloseButton: function(sColumn) {
					return this.mdcTestLibrary.iClickOnAColumnHeaderMenuButtonWithIcon(sColumn, "sap-icon://decline");
				},

				iClickOnTheColumnSettingsButton: function() {
					return this.mdcTestLibrary.iClickOnTheColumnSettingsButton();
				},

				iAddAColumn: function(sColumn) {
					return this.mdcTestLibrary.iChangeColumnSelectedState(sColumn, true);
				},

				iRemoveAColumn: function(sColumn) {
					return this.mdcTestLibrary.iChangeColumnSelectedState(sColumn, false);
				},

				iSelectAColumnToBeSorted: function(sColumn) {
					return this.mdcTestLibrary.iChangeColumnSortedState(sColumn, true);
				},

				iChangeASelectedColumnSortDirection: function(sColumn, bDescending) {
					return this.mdcTestLibrary.iChangeASelectedColumnSortDirection(sColumn, bDescending);
				},

				iClickOnTheSortReorderButton: function() {
					return this.mdcTestLibrary.iClickOnTheSortReorderButton();
				},

				iMoveSortOrderOfColumnToTheTop: function(sColumn) {
					return this.mdcTestLibrary.iMoveSortOrderOfColumnToTheTop(sColumn);
				},

				iMoveAColumnToTheTop: function(sColumn) {
					return this.mdcTestLibrary.iMoveAColumnToTheTop(sColumn);
				},
				iClickOnTheColumnReorderButton: function() {
					return this.mdcTestLibrary.iClickOnTheColumnReorderButton();
				},

				// filter bar
				iPressOnTheAdaptFiltersButton: function() {
					return this.mdcTestLibrary.iPressOnTheAdaptFiltersButton();
				},

				// filter field
				iEnterTextOnTheFilterField: function(sFieldLabelName, sValue) {
					return this.mdcTestLibrary.iEnterTextOnTheFilterField(sFieldLabelName, sValue);
				},

				// field
				iEnterTextOnTheField: function(sId, sValue) {
					return this.mdcTestLibrary.iEnterTextOnTheField(sId, sValue);
				},

				iPressOnTheFieldValueHelpButton: function(sId) {
					return this.mdcTestLibrary.iPressOnTheFieldValueHelpButton(sId);
				},

				// p13n
				iPressOnTheAdaptFiltersP13nItem: function(sText) {
					return this.mdcTestLibrary.iPressOnTheAdaptFiltersP13nItem(sText);
				},

				iChangeAdaptFiltersView: function(sView) {
					return this.mdcTestLibrary.iChangeAdaptFiltersView(sView);
				},

				// p13n
				iToggleFilterPanel: function(sGroupName) {
					return this.mdcTestLibrary.iToggleFilterPanel(sGroupName, true);
				},

				iSelectTheAdaptFiltersP13nItem: function(sText) {
					return this.mdcTestLibrary.iSelectTheAdaptFiltersP13nItem(sText);
				},

				iDeselectTheAdaptFiltersP13nItem: function(sText) {
					return this.mdcTestLibrary.iDeselectTheAdaptFiltersP13nItem(sText);
				},

				iPressOnTheAdaptFiltersP13nReorderButton: function() {
					return this.mdcTestLibrary.iPressOnTheAdaptFiltersP13nReorderButton();
				},

				iPressOnTheAdaptFiltersMoveToTopButton: function() {
					return this.mdcTestLibrary.iPressOnTheAdaptFiltersMoveToTopButton();
				},

				iPressOnTheAdaptFiltersMoveToBottomButton: function() {
					return this.mdcTestLibrary.iPressOnTheAdaptFiltersMoveToBottomButton();
				},

				iPressOnTheAdaptFiltersMoveUpButton: function() {
					return this.mdcTestLibrary.iPressOnTheAdaptFiltersMoveUpButton();
				},

				iPressOnTheAdaptFiltersMoveDownButton: function() {
					return this.mdcTestLibrary.iPressOnTheAdaptFiltersMoveDownButton();
				},

				iCloseAllPopovers: function() {
					return this.mdcTestLibrary.iCloseAllPopovers();
				},

				iPressSortDialogOk: function(){
					return this.mdcTestLibrary.iPressDialogOk("Sort");
				},

				iPressAdaptFiltersOk: function(){
					return this.mdcTestLibrary.iPressDialogOk();
				},

				// variant
				iPressOnTheVariantManagerButton: function(sText) {
					return this.mdcTestLibrary.iPressOnTheVariantManagerButton(sText);
				},

				iPressOnTheVariantManagerSaveAsButton: function() {
					return this.mdcTestLibrary.iPressOnTheVariantManagerSaveAsButton();
				},

				iSaveVariantAs: function(sVariantCurrentName, sVariantNewName) {
					return this.mdcTestLibrary.iSaveVariantAs(sVariantCurrentName, sVariantNewName);
				},

				iSelectVariant: function(sVariantName) {
					return this.mdcTestLibrary.iSelectVariant(sVariantName);
				},

				// value help
				iPressOnTheFilterFieldValueHelpButton: function(sFieldLabelName) {
					return this.mdcTestLibrary.iPressOnTheFilterFieldValueHelpButton(sFieldLabelName);
				},

				iSelectTheValueHelpCondition: function(aValues) {
					return this.mdcTestLibrary.iSelectTheValueHelpCondition(aValues);
				},

				iPressOnTheValueHelpOKButton: function() {
					return this.mdcTestLibrary.iPressOnTheValueHelpOKButton();
				}
			},
			assertions: {

				// table
				iShouldSeeTheTableHeader: function(sName) {
					return this.mdcTestLibrary.iShouldSeeTheTableHeader(sName);
				},

				iShouldSeeASortButtonForTheTable: function() {
					return this.mdcTestLibrary.iShouldSeeASortButtonForTheTable();
				},

				iShouldSeeAP13nButtonForTheTable: function() {
					return this.mdcTestLibrary.iShouldSeeAP13nButtonForTheTable();
				},

				iShouldSeeAButtonWithTextForTheTable: function(sText) {
					return this.mdcTestLibrary.iShouldSeeAButtonWithTextForTheTable(sText);
				},

				iShouldSeeGivenColumnsWithHeader: function(sColumnHeaders) {
					return this.mdcTestLibrary.iShouldSeeGivenColumnsWithHeader(sColumnHeaders);
				},

				iShouldSeeRowsWithData: function(iAmountOfRows) {
					return this.mdcTestLibrary.iShouldSeeRowsWithData(iAmountOfRows);
				},

				iShouldSeeARowWithData: function(iIndexOfRow, aExpectedData) {
					return this.mdcTestLibrary.iShouldSeeARowWithData(iIndexOfRow, aExpectedData);
				},

				iShouldSeeTheSortDialog: function() {
					return this.mdcTestLibrary.iShouldSeeTheSortDialog();
				},

				iShouldSeeTheColumnSettingsDialog: function() {
					return this.mdcTestLibrary.iShouldSeeTheColumnSettingsDialog();
				},

				iShouldSeeAColumnHeaderMenu: function(sColumn) {
					return this.mdcTestLibrary.iShouldSeeAColumnHeaderMenu(sColumn);
				},

				iShouldSeeAAscendingSortedColumn: function(sColumn) {
					return this.mdcTestLibrary.iShouldSeeASortedColumn(sColumn, "ascending");
				},

				iShouldSeeADescendingSortedColumn: function(sColumn) {
					return this.mdcTestLibrary.iShouldSeeASortedColumn(sColumn, "descending");
				},

				iShouldSeeTheSortReoderDialog: function() {
					return this.mdcTestLibrary.iShouldSeeTheSortReoderDialog();
				},

				// filter bar
				iShouldSeeTheFilterBar: function() {
					return this.mdcTestLibrary.iShouldSeeTheFilterBar();
				},

				iShouldSeeTheFilterFieldsWithLabels: function(aLabelNames) {
					return this.mdcTestLibrary.iShouldSeeTheFilterFieldsWithLabels(aLabelNames);
				},

				iShouldSeeTheAdaptFiltersButton: function() {
					return this.mdcTestLibrary.iShouldSeeTheAdaptFiltersButton();
				},

				// filter field
				iShouldSeeTheFilterFieldWithValues: function(sFieldLabelName, oValues) {
					return this.mdcTestLibrary.iShouldSeeTheFilterFieldWithValues(sFieldLabelName, oValues);
				},

				// field
				iShouldSeeTheFieldWithValues: function(sId, sValue) {
					return this.mdcTestLibrary.iShouldSeeTheFieldWithValues(sId, sValue);
				},

				// p13n
				iShouldSeeTheAdaptFiltersP13nDialog: function() {
					return this.mdcTestLibrary.iShouldSeeTheAdaptFiltersP13nDialog();
				},

				// variant
				iShouldSeeTheVariantManagerButton: function(sText) {
					return this.mdcTestLibrary.iShouldSeeTheVariantManagerButton(sText);
				},

				iShouldSeeTheVariantManagerPopover: function() {
					return this.mdcTestLibrary.iShouldSeeTheVariantManagerPopover();
				},

				iShouldSeeTheSaveVariantDialog: function() {
					return this.mdcTestLibrary.iShouldSeeTheSaveVariantDialog();
				},

				// value help
				iShouldSeeTheValueHelpDialog: function(sTitle) {
					return this.mdcTestLibrary.iShouldSeeTheValueHelpDialog(sTitle);
				}

			}
		}
	});

});
