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
	"test-resources/sap/ui/mdc/testutils/opa/filterfield/Assertions"
], function(Opa5,
	TableActions,
	TableAssertions,
	FilterBarActions,
	FilterBarAssertions,
	FilterFieldActions,
	FilterFieldAssertions) {
	"use strict";

	Opa5.createPageObjects({
		onPage: {
			viewName: "sap.ui.v4demo.view.Books",
			actions: {

				// table
				iClickOnTheSortButton: function() {
					return TableActions.iClickOnTheSortButton.call(this);
				},

				iClickOnColumnHeader: function(sColumn) {
					return TableActions.iClickOnColumnHeader.call(this, sColumn);
				},

				iClickOnColumnHeaderMenuSortAscendingButton: function(sColumn) {
					return TableActions.iClickOnAColumnHeaderMenuButtonWithIcon.call(this, sColumn, "sap-icon://sort-ascending");
				},

				iClickOnColumnHeaderMenuSortDescendingButton: function(sColumn) {
					return TableActions.iClickOnAColumnHeaderMenuButtonWithIcon.call(this, sColumn, "sap-icon://sort-descending");
				},

				iClickOnColumnHeaderMenuCloseButton: function(sColumn) {
					return TableActions.iClickOnAColumnHeaderMenuButtonWithIcon.call(this, sColumn, "sap-icon://decline");
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
					return this.onTheMDCFilterField.iEnterTextOnTheFilterField(sFieldLabelName, sValue);
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
				iShouldSeeTheTableHeader: function(sName) {
					return TableAssertions.iShouldSeeTheTableHeader.call(this, sName);
				},

				iShouldSeeASortButtonForTheTable: function() {
					return TableAssertions.iShouldSeeASortButtonForTheTable.call(this);
				},

				iShouldSeeAP13nButtonForTheTable: function() {
					return TableAssertions.iShouldSeeAP13nButtonForTheTable.call(this);
				},

				iShouldSeeAButtonWithTextForTheTable: function(sText) {
					return TableAssertions.iShouldSeeAButtonWithTextForTheTable.call(this, sText);
				},

				iShouldSeeGivenColumnsWithHeader: function(sColumnHeaders) {
					return TableAssertions.iShouldSeeGivenColumnsWithHeader.call(this, sColumnHeaders);
				},

				iShouldSeeRowsWithData: function(iAmountOfRows) {
					return TableAssertions.iShouldSeeRowsWithData.call(this, iAmountOfRows);
				},

				iShouldSeeARowWithData: function(iIndexOfRow, aExpectedData) {
					return TableAssertions.iShouldSeeARowWithData.call(this, iIndexOfRow, aExpectedData);
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

				iShouldSeeTheFilterFieldsWithLabels: function(aLabelNames) {
					return FilterBarAssertions.iShouldSeeTheFilterFieldsWithLabels.call(this, aLabelNames);
				},

				iShouldSeeTheAdaptFiltersButton: function() {
					return FilterBarAssertions.iShouldSeeTheAdaptFiltersButton.call(this);
				},

				// filter field
				iShouldSeeTheFilterFieldWithValues: function(sFieldLabelName, oValues) {
					return this.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(sFieldLabelName, oValues);
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

				//TODO ????? ValueHelp actions and assertions are missing
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
				606,
				[
				  "0.02",
				  "EUR"
				],
				3698,
				"erotic_literature",
				null
			],
			"Alice's Adventures in Wonderland": [
				"Alice's Adventures in Wonderland",
				"Fantasy",
				103,
				[
				  "87.95",
				  "EUR"
				],
				525,
				"law",
				"natural"
			],
			"Pride and Prejudice": [
				"Pride and Prejudice",
				"Sisters  Fiction, Courtship  Fiction, Social classes  Fiction, England  Fiction, Domestic fiction, Young women  Fiction, Love stories",
				101,
				[
				  "18.57",
				  "USD"
				],
				4458,
				"history",
				"narrative_history"
			],
			"The Complete Project Gutenberg Works of Jane Austen: A Linked Index of all PG Editions of Jane Austen": [
				"The Complete Project Gutenberg Works of Jane Austen: A Linked Index of all PG Editions of Jane Austen",
				"England  Social life and customs  Fiction, Love stories, English",
				101,
				[
				  "55.55",
				  "EUR"
				],
				1838,
				"religious_text",
				"theology"
			],
			"The Coral Island: A Tale of the Pacific Ocean": [
				"The Coral Island: A Tale of the Pacific Ocean",
				"Outdoor life  Juvenile fiction, Oceania  Juvenile fiction, Shipwrecks  Juvenile fiction, Robinsonades,Conduct of life  Juvenile fiction, Islands  Juvenile fiction, Pirates  Juvenile fiction, Survival skills  Juvenile fiction, Natural history  Juvenile fiction, Camping  Juvenile fiction, Shipwreck survival  Juvenile fiction",
				1032,
				[
				  "2.69",
				  "USD"
				],
				3340,
				"speculative_fiction",
				"science_fiction"
			],
			"The History Of The Decline And Fall Of The Roman Empire: Table of Contents with links in the HTML file to the two,  Project Gutenberg editions (12 volumes)": [
				"The History Of The Decline And Fall Of The Roman Empire: Table of Contents with links in the HTML file to the two,  Project Gutenberg editions (12 volumes)",
				"Rome  History  Empire, 30 B.C.-476 A.D., Byzantine Empire  History  To 527, Indexes",
				"Gibbon, Edward",
				[
					"46113",
					"XCD"
				],
				9996
			],
			"The Voyage Out": [
				"The Voyage Out",
				"Ocean travel  Fiction, Women travelers  Fiction, Bildungsromans,Love stories, Young women  Fiction, British  South America  Fiction",
				"Woolf, Virginia",
				[
					"47209",
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
				361,
				[
				  "68.5",
				  "AUD"
				],
				2712,
				"manuscript",
				null
			],
			"The Picture of Dorian Gray": [
				"The Picture of Dorian Gray",
				"London (England)  History  1800-1950  Fiction, Conduct of life  Fiction, Paranormal fiction, Portraits  Fiction, Appearance (Philosophy)  Fiction, Supernatural  Fiction, Great Britain  History  Victoria, 1837-1901  Fiction, Didactic fiction",
				107,
				[
				  "99.63",
				  "CAD"
				],
				5993,
				"religious_text",
				"theology"
			],
			"The Adventures of Tom Sawyer": [
				"The Adventures of Tom Sawyer",
				"Male friendship  Fiction, Humorous stories, Missouri  Fiction, Child witnesses  Fiction, Bildungsromans, Mississippi River Valley  Fiction, Adventure stories, Runaway children  Fiction, Boys  Fiction, Sawyer, Tom (Fictitious character)  Fiction",
				106,
				[
					"68.8",
					"CAD"
				],
				2234,
				"metafiction",
				null
			],
			"The Ten Books on Architecture": [
				"The Ten Books on Architecture",
				"Architecture  Early works to 1800",
				273,
				[
					"36.46",
					"USD"
				],
				4827,
				"children_s_literature",
				"young_adult_fiction"
			]
		}
	};

	return ListReport;
});
