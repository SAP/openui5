/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onTheBooksListReportPage: {
			viewName: "sap.ui.v4demo.view.Books",
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
		},
		onTheOrdersListReportPage: {
			viewName: "sap.ui.v4demo.view.Orders",
			actions: {},
			assertions: {
				iShouldSeeTheTableHeader: function(sName) {
					return this.mdcTestLibrary.iShouldSeeTheTableHeader(sName);
				}
			}
		}
	});

	var ListReport = {
		books: {
			"The Yellow Wallpaper": [
			  "The Yellow Wallpaper",
			  "Mentally ill women  Fiction, Feminist fiction, Psychological fiction, Married women  Psychology  Fiction, Sex role  Fiction",
			  "Gilman, Charlotte Perkins",
			  [
				"15.54",
				"MXN"
			  ],
			  815
			],
			"Herland": [
				"Herland",
				"Women  Fiction, Black humor, Utopian fiction, Utopias  Fiction",
				"Gilman, Charlotte Perkins",
				[
					"35.14",
					"CUP"
				],
				5589
			],
			"...So They Baked a Cake": [
				"...So They Baked a Cake",
				null,
				"Marks, Winston K.",
				[
					"54.87",
					"JEP"
				],
				3698
			],
			"Alice's Adventures in Wonderland": [
				"Alice's Adventures in Wonderland",
				"Fantasy",
				"Carroll, Lewis",
				[
					"82.4",
					"SLL"
				],
				525
			],
			"Pride and Prejudice": [
				"Pride and Prejudice",
				"Sisters  Fiction, Courtship  Fiction, Social classes  Fiction, England  Fiction, Domestic fiction, Young women  Fiction, Love stories",
				"Austen, Jane",
				[
					"79.84",
					"IMP"
				],
				4458
			],
			"The Complete Project Gutenberg Works of Jane Austen: A Linked Index of all PG Editions of Jane Austen": [
				"The Complete Project Gutenberg Works of Jane Austen: A Linked Index of all PG Editions of Jane Austen",
				"England  Social life and customs  Fiction, Love stories, English",
				"Austen, Jane",
				[
					"99.28",
					"KES"
				],
				1838
			],
			"The Coral Island: A Tale of the Pacific Ocean": [
				"The Coral Island: A Tale of the Pacific Ocean",
				"Outdoor life  Juvenile fiction, Oceania  Juvenile fiction, Shipwrecks  Juvenile fiction, Robinsonades,Conduct of life  Juvenile fiction, Islands  Juvenile fiction, Pirates  Juvenile fiction, Survival skills  Juvenile fiction, Natural history  Juvenile fiction, Camping  Juvenile fiction, Shipwreck survival  Juvenile fiction",
				"Ballantyne, R. M. (Robert Michael)",
				[
					"0.04",
					"ANG"
				],
				3340
			],
			"The History Of The Decline And Fall Of The Roman Empire: Table of Contents with links in the HTML file to the two, Project Gutenberg editions (12 volumes)": [
				"The History Of The Decline And Fall Of The Roman Empire: Table of Contents with links in the HTML file to the two, Project Gutenberg editions (12 volumes)",
				"Rome History Empire, 30 B.C.-476 A.D., Byzantine Empire History To 527, Indexes",
				"Gibbon, Edward",
				[
					"46113.00",
					"XCD"
				],
				9996
			],
			"The Voyage Out": [
				"The Voyage Out",
				"Ocean travel Fiction, Women travelers Fiction, Bildungsromans,Love stories, Young women Fiction, British South America Fiction",
				"Woolf, Virginia",
				[
					"47209.00",
					"TJS"
				],
				2090
			],
			"Utopia": [
				"Utopia",
				"Utopias  Early works to 1800",
				"More, Thomas, Saint",
				[
					"86.19",
					"GEL"
				],
				19
			],
			"Youth": [
				"Youth",
				"Human-alien encounters  Fiction, Science fiction",
				"Asimov, Isaac",
				[
					"15373",
					"AWG"
				],
				2712
			]
		}
	};

	return ListReport;
});
