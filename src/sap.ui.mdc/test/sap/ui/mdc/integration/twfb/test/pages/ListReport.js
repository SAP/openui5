/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/testutils/opa/table/Actions",
	"test-resources/sap/ui/mdc/testutils/opa/table/Assertions",
	"test-resources/sap/ui/mdc/testutils/opa/filterbar/Actions",
	"test-resources/sap/ui/mdc/testutils/opa/filterbar/Assertions",
	"test-resources/sap/ui/mdc/testutils/opa/filterfield/Actions",
	"test-resources/sap/ui/mdc/testutils/opa/filterfield/Assertions",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util"
], function(Opa5,
	TableActions,
	TableAssertions,
	FilterBarActions,
	FilterBarAssertions,
	FilterFieldActions,
	FilterFieldAssertions,
	TestUtil) {
	"use strict";

	Opa5.createPageObjects({
		onPage: {
			viewName: "sap.ui.v4demo.view.Books",
			actions: {

				// table
				iClickOnColumnHeader: function(sColumn) {
					return TableActions.iClickOnColumnHeader.call(this, sColumn);
				},

				iClickOnColumnHeaderMenuSortAscendingButton: function(sColumn) {
					return TableActions.iClickOnAColumnHeaderMenuButtonWithText.call(this, sColumn, TestUtil.getTextFromResourceBundle("sap.m", "table.COLUMNMENU_SORT_ASCENDING"));
				},

				iClickOnColumnHeaderMenuSortDescendingButton: function(sColumn) {
					return TableActions.iClickOnAColumnHeaderMenuButtonWithText.call(this, sColumn, TestUtil.getTextFromResourceBundle("sap.m", "table.COLUMNMENU_SORT_DESCENDING"));
				},

				iClickOnTheColumnSettingsButton: function() {
					return TableActions.iClickOnTheColumnSettingsButton.call(this);
				},

				iAddAColumn: function(sColumn) {
					return TableActions.iChangeColumnSelectedState.call(this, sColumn, true);
				},

				iRemoveAColumn: function(sColumn) {
					return TableActions.iChangeColumnSelectedState.call(this, sColumn, false);
				},

				iSelectAColumnToBeSorted: function(sColumn) {
					return TableActions.iChangeColumnSortedState.call(this, sColumn, true);
				},

				iChangeASelectedColumnSortDirection: function(sColumn, bDescending) {
					return TableActions.iChangeASelectedColumnSortDirection.call(this, sColumn, bDescending);
				},

				iClickOnTheSortReorderButton: function() {
					return TableActions.iClickOnTheSortReorderButton.call(this);
				},

				iMoveSortOrderOfColumnToTheTop: function(sColumn) {
					return TableActions.iMoveSortOrderOfColumnToTheTop.call(this, sColumn);
				},

				iMoveAColumnToTheTop: function(sColumn) {
					return TableActions.iMoveAColumnToTheTop.call(this, sColumn);
				},
				iClickOnTheColumnReorderButton: function() {
					return TableActions.iClickOnTheColumnReorderButton.call(this);
				},

				// filter bar
				iPressOnTheAdaptFiltersButton: function() {
					return FilterBarActions.iPressOnTheAdaptFiltersButton.call(this);
				},

				// filter field
				iEnterTextOnTheFilterField: function(sFieldLabelName, sValue) {
					return this.onTheMDCFilterField.iEnterTextOnTheFilterField({ label: sFieldLabelName }, sValue);
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
				iOpenTheValueHelpForFilterField: function(sFieldLabelName) {
					return this.mdcTestLibrary.iOpenTheValueHelpForFilterField({ label: sFieldLabelName });
				}

				// //TODO missing
				// iSelectTheValueHelpCondition: function(aValues) {
				// 	//return this.mdcTestLibrary.iSelectTheValueHelpCondition(aValues);
				// },


				// //TODO missing
				// iPressOnTheValueHelpOKButton: function() {
				// 	return this.mdcTestLibrary.iPressOnTheValueHelpOKButton();
				// }
			},
			assertions: {

				// table
				iShouldSeeAP13nButtonForTheTable: function() {
					return TableAssertions.iShouldSeeAP13nButtonForTheTable.call(this);
				},

				iShouldSeeAButtonWithTextForTheTable: function(sText) {
					return TableAssertions.iShouldSeeAButtonWithTextForTheTable.call(this, sText);
				},

				iShouldSeeGivenColumnsWithHeader: function(sColumnHeaders) {
					return TableAssertions.iShouldSeeGivenColumnsWithHeader.call(this, null, sColumnHeaders);
				},

				iShouldSeeTheSortDialog: function() {
					return TableAssertions.iShouldSeeTheSortDialog.call(this);
				},

				iShouldSeeTheColumnSettingsDialog: function() {
					return TableAssertions.iShouldSeeTheColumnSettingsDialog.call(this);
				},

				iShouldSeeAColumnHeaderMenu: function(sColumn) {
					return TableAssertions.iShouldSeeAColumnHeaderMenu.call(this, sColumn);
				},

				iShouldSeeAAscendingSortedColumn: function(sColumn) {
					return TableAssertions.iShouldSeeASortedColumn.call(this, sColumn, "ascending");
				},

				iShouldSeeADescendingSortedColumn: function(sColumn) {
					return TableAssertions.iShouldSeeASortedColumn.call(this, sColumn, "descending");
				},

				iShouldSeeTheSortReoderDialog: function() {
					return TableAssertions.iShouldSeeTheSortReoderDialog.call(this);
				},

				// filter bar
				iShouldSeeTheFilterBar: function() {
					return FilterBarAssertions.iShouldSeeTheFilterBar.call(this);
				},

				iShouldSeeTheFilterFieldsWithLabels: function(aLabelNames, oPropertiesMatcher) {
					return FilterBarAssertions.iShouldSeeTheFilterFieldsWithLabels.call(this, aLabelNames, oPropertiesMatcher);
				},

				iShouldSeeTheAdaptFiltersButton: function() {
					return FilterBarAssertions.iShouldSeeTheAdaptFiltersButton.call(this);
				},

				// filter field
				iShouldSeeTheFilterFieldWithValues: function(sFieldLabelName, oValues) {
					return this.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues({ label: sFieldLabelName }, oValues);
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
			assertions: {}
		}
	});

	const ListReport = {
		books: {
			"The Yellow Wallpaper": [
			  "The Yellow Wallpaper",
			  "Mentally ill women  Fiction, Feminist fiction, Psychological fiction, Married women  Psychology  Fiction, Sex role  Fiction",
			  "Gilman, Charlotte Perkins",
			  [
				"15.54",
				"MXN",
				null
			  ],
			  815
			],
			"Herland": [
				"Herland",
				"Women  Fiction, Black humor, Utopian fiction, Utopias  Fiction",
				"Gilman, Charlotte Perkins",
				[
					"35.14",
					"CUP",
					null
				],
				5589
			],
			"...So They Baked a Cake": [
				"...So They Baked a Cake",
				null,
				606,
				[
					"54.87",
					"JEP",
					null
				],
				3698,
				"religious_text",
				"song"
			],
			"Alice's Adventures in Wonderland": [
				"Alice's Adventures in Wonderland",
				"Fantasy",
				103,
				[
					"82.4",
					"SLL",
					null
				],
				525,
				"religious_text",
				"scripture"
			],
			"Pride and Prejudice": [
				"Pride and Prejudice",
				"Sisters  Fiction, Courtship  Fiction, Social classes  Fiction, England  Fiction, Domestic fiction, Young women  Fiction, Love stories",
				101,
				[
					"79.84",
					"IMP",
					null
				],
				4458,
				"religious_text",
				"creed"
			],
			"The Complete Project Gutenberg Works of Jane Austen: A Linked Index of all PG Editions of Jane Austen": [
				"The Complete Project Gutenberg Works of Jane Austen: A Linked Index of all PG Editions of Jane Austen",
				"England  Social life and customs  Fiction, Love stories, English",
				101,
				[
					"99.28",
					"KES",
					null
				],
				1838,
				"religious_text",
				"lectionary"
			],
			"The Coral Island: A Tale of the Pacific Ocean": [
				"The Coral Island: A Tale of the Pacific Ocean",
				"Outdoor life  Juvenile fiction, Oceania  Juvenile fiction, Shipwrecks  Juvenile fiction, Robinsonades,Conduct of life  Juvenile fiction, Islands  Juvenile fiction, Pirates  Juvenile fiction, Survival skills  Juvenile fiction, Natural history  Juvenile fiction, Camping  Juvenile fiction, Shipwreck survival  Juvenile fiction",
				1032,
				[
					"0.04",
					"ANG",
					null
				],
				3340,
				"adventure_novel",
				"apocalyptic"
			],
			"The History Of The Decline And Fall Of The Roman Empire: Table of Contents with links in the HTML file to the two,  Project Gutenberg editions (12 volumes)": [
				"The History Of The Decline And Fall Of The Roman Empire: Table of Contents with links in the HTML file to the two,  Project Gutenberg editions (12 volumes)",
				"Rome  History  Empire, 30 B.C.-476 A.D., Byzantine Empire  History  To 527, Indexes",
				246,
				[
					"46113",
					"XCD",
					null
				],
				9996,
				"children_s_literature",
				"young_adult_fiction"
			],
			"The Voyage Out": [
				"The Voyage Out",
				"Ocean travel  Fiction, Women travelers  Fiction, Bildungsromans,Love stories, Young women  Fiction, British  South America  Fiction",
				935,
				[
					"47209",
					"TJS",
					null
				],
				2090,
				"biography",
				"memoir"
			],
			"Utopia": [
				"Utopia",
				"Utopias  Early works to 1800",
				"More, Thomas, Saint",
				[
					"86.19",
					"GEL",
					null
				],
				19
			],
			"Youth": [
				"Youth",
				"Human-alien encounters  Fiction, Science fiction",
				361,
				[
					"15373",
					"AWG",
					null
				],
				2712,
				"religious_text",
				"scripture"
			],
			"The Germany and the Agricola of Tacitus": [
				"The Germany and the Agricola of Tacitus",
				"Agricola, Gnaeus Julius, 40-93, Germanic peoples  Early works to 1800, Statesmen  Rome  Biography  Early works to 1800",
				902,
				[
				  "24.81",
				  "CNY",
				  null
				],
				101,
				"religious_fiction",
				"christian_fiction"
			]
		}
	};

	return ListReport;
});
