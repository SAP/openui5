sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"./Common",
	"./shareOptions"
], function(
	Opa5,
	Press,
	EnterText,
	AggregationLengthEquals,
	AggregationFilled,
	PropertyStrictEquals,
	Common,
	shareOptions) {
	"use strict";

	var sViewName = "Worklist",
		sTableId = "table",
		sSearchFieldId = "searchField",
		sSomethingThatCannotBeFound = "*#-Q@@||";

	function allItemsInTheListContainTheSearchTerm (aControls) {
		var oTable = aControls[0],
			oSearchField = aControls[1],
			aItems = oTable.getItems();

		// table needs items
		if (aItems.length === 0) {
			return false;
		}

		return aItems.every(function (oItem) {
			return oItem.getCells()[0].getTitle().indexOf(oSearchField.getValue()) !== -1;
		});
	}

	function createWaitForItemAtPosition (oOptions) {
		var iPosition = oOptions.position;
		return {
			id : sTableId,
			viewName : sViewName,
			matchers : function (oTable) {
				return oTable.getItems()[iPosition];
			},
			actions : oOptions.actions,
			success : oOptions.success,
			errorMessage : "Table in view '" + sViewName + "' does not contain an Item at position '" + iPosition + "'"
		};
	}

	Opa5.createPageObjects({

		onTheWorklistPage : {
			baseClass : Common,
			actions : Object.assign({
				iPressATableItemAtPosition : function (iPosition) {
					return this.waitFor(createWaitForItemAtPosition({
						position : iPosition,
						actions : new Press()
					}));
				},

				iRememberTheItemAtPosition : function (iPosition){
					return this.waitFor(createWaitForItemAtPosition({
						position : iPosition,
						success : function (oTableItem) {
							var oBindingContext = oTableItem.getBindingContext();

							// Don't remember objects just strings since IE will not allow accessing objects of destroyed frames
							this.getContext().currentItem = {
								bindingPath: oBindingContext.getPath(),
								id: oBindingContext.getProperty("ProductID"),
								name: oBindingContext.getProperty("ProductName")
							};
						}
					}));
				},

				iPressOnMoreData : function (){
					return this.waitFor({
						id : sTableId,
						viewName : sViewName,
						matchers : function (oTable) {
							return !!oTable.$("trigger").length;
						},
						actions : new Press(),
						errorMessage : "The Table does not have a trigger"
					});
				},

				iSearchForTheFirstObject: function() {
					var sFirstObjectTitle;

					return this.waitFor({
						id: sTableId,
						viewName: sViewName,
						matchers: new AggregationFilled({
							name: "items"
						}),
						success: function(oTable) {
							sFirstObjectTitle = oTable.getItems()[0].getCells()[0].getTitle();

							this.iSearchForValue(sFirstObjectTitle);

							this.waitFor({
								id: [sTableId, sSearchFieldId],
								viewName: sViewName,
								check : allItemsInTheListContainTheSearchTerm,
								errorMessage: "Did not find any table entries or too many while trying to search for the first object."
							});
						},
						errorMessage: "Did not find table entries while trying to search for the first object."
					});
				},

				iSearchForValueWithActions : function (aActions) {
					return this.waitFor({
						id : sSearchFieldId,
						viewName : sViewName,
						actions: aActions,
						errorMessage : "Failed to find search field in Worklist view.'"
					});
				},

				iSearchForValue : function (sSearchString) {
					return this.iSearchForValueWithActions([new EnterText({text : sSearchString}), new Press()]);
				},

				iTypeSomethingInTheSearchThatCannotBeFoundAndTriggerRefresh : function () {
					var fnEnterTextAndFireRefreshButtonPressedOnSearchField = function (oSearchField) {
						// set the search field value directly as EnterText action triggers a search event
						oSearchField.setValue(sSomethingThatCannotBeFound);

						// fire the search to simulate a refresh button press
						oSearchField.fireSearch({refreshButtonPressed: true});
					};
					return this.iSearchForValueWithActions(fnEnterTextAndFireRefreshButtonPressedOnSearchField);
				},

				iClearTheSearch : function () {
					return this.iSearchForValueWithActions([new EnterText({text: ""}), new Press()]);
				},

				iSearchForSomethingWithNoResults : function () {
					return this.iSearchForValueWithActions([new EnterText({text: sSomethingThatCannotBeFound}), new Press()]);
				}

			}, shareOptions.createActions(sViewName)),

			assertions: Object.assign({

				iShouldSeeTheTable : function () {
					return this.waitFor({
						id : sTableId,
						viewName : sViewName,
						success : function (oTable) {
							Opa5.assert.ok(oTable, "Found the object Table");
						},
						errorMessage : "Can't see the master Table."
					});
				},

				theTableShowsOnlyObjectsWithTheSearchStringInTheirTitle : function () {
					this.waitFor({
						id : [sTableId, sSearchFieldId],
						viewName : sViewName,
						check:  allItemsInTheListContainTheSearchTerm,
						success : function () {
							Opa5.assert.ok(true, "Every item did contain the title");
						},
						errorMessage : "The table did not have items"
					});
				},

				theTableHasEntries : function () {
					return this.waitFor({
						viewName : sViewName,
						id : sTableId,
						matchers : new AggregationFilled({
							name : "items"
						}),
						success : function () {
							Opa5.assert.ok(true, "The table has entries");
						},
						errorMessage : "The table had no entries"
					});
				},

				theTableShouldHaveAllEntries : function () {
					var aAllEntities,
						iExpectedNumberOfItems;

					// retrieve all Objects to be able to check for the total amount
					this.waitFor(this.createAWaitForAnEntitySet({
						entitySet: "Products",
						success: function (aEntityData) {
							aAllEntities = aEntityData;
						}
					}));

					return this.waitFor({
						id : sTableId,
						viewName : sViewName,
						matchers : function (oTable) {
							// If there are less items in the list than the growingThreshold, only check for this number.
							iExpectedNumberOfItems = Math.min(oTable.getGrowingThreshold(), aAllEntities.length);
							return new AggregationLengthEquals({name : "items", length : iExpectedNumberOfItems}).isMatching(oTable);
						},
						success : function (oTable) {
							Opa5.assert.strictEqual(oTable.getItems().length, iExpectedNumberOfItems, "The growing Table has " + iExpectedNumberOfItems + " items");
						},
						errorMessage : "Table does not have all entries."
					});
				},

				theTitleShouldDisplayTheTotalAmountOfItems : function () {
					return this.waitFor({
						id : sTableId,
						viewName : sViewName,
						matchers : new AggregationFilled({name : "items"}),
						success : function (oTable) {
							var iObjectCount = oTable.getBinding("items").getLength();
							this.waitFor({
								id : "tableHeader",
								viewName : sViewName,
								matchers : function (oPage) {
									var sExpectedText = oPage.getModel("i18n").getResourceBundle().getText("worklistTableTitleCount", [iObjectCount]);
									return new PropertyStrictEquals({name : "text", value: sExpectedText}).isMatching(oPage);
								},
								success : function () {
									Opa5.assert.ok(true, "The Page has a title containing the number " + iObjectCount);
								},
								errorMessage : "The Page's header does not container the number of items " + iObjectCount
							});
						},
						errorMessage : "The table has no items."
					});
				},

				theTableShouldHaveTheDoubleAmountOfInitialEntries : function () {
					var iExpectedNumberOfItems;

					return this.waitFor({
						id : sTableId,
						viewName : sViewName,
						matchers : function (oTable) {
							iExpectedNumberOfItems = oTable.getGrowingThreshold() * 2;
							return new AggregationLengthEquals({name : "items", length : iExpectedNumberOfItems}).isMatching(oTable);
						},
						success : function () {
							Opa5.assert.ok(true, "The growing Table had the double amount: " + iExpectedNumberOfItems + " of entries");
						},
						errorMessage : "Table does not have the double amount of entries."
					});
				},

				theTableShouldContainOnlyFormattedUnitNumbers : function () {
					return this.theUnitNumbersShouldHaveTwoDecimals("sap.m.ObjectNumber",
						sViewName,
						"Object numbers are properly formatted",
						"Table has no entries which can be checked for their formatting");
				},

				iShouldSeeTheNoDataTextForNoSearchResults : function () {
					return this.waitFor({
						id : sTableId,
						viewName : sViewName,
						success : function (oTable) {
							Opa5.assert.strictEqual(
								oTable.getNoDataText(),
								oTable.getModel("i18n").getProperty("worklistNoDataWithSearchText"),
								"the table should show the no data text for search");
						},
						errorMessage : "table does not show the no data text for search"
					});
				}
			}, shareOptions.createAssertions(sViewName))

		}

	});

});