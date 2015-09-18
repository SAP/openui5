sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"myCompany/myApp/test/integration/pages/Common",
	"myCompany/myApp/test/integration/pages/shareOptions"
], function(Opa5, AggregationLengthEquals, AggregationFilled, PropertyStrictEquals, Common, shareOptions) {
	"use strict";

	var sViewName = "Worklist",
		sTableId = "table",
		sSearchFieldId = "searchField",
		sSomethingThatCannotBeFound = "*#-Q@@||";

	function allItemsInTheListContainTheSearchTerm(aControls) {
		var oTable = aControls[0],
			oSearchField = aControls[1],
			aItems = oTable.getItems();

		// table need items
		if (aItems.length === 0) {
			return false;
		}

		return aItems.every(function(oItem) {
			return oItem.getCells()[0].getTitle().indexOf(oSearchField.getValue()) !== -1;
		});
	}

	function createWaitForItemAtPosition(oOptions) {
		var iPosition = oOptions.position;
		return {
			id: sTableId,
			viewName: sViewName,
			matchers: function(oTable) {
				return oTable.getItems()[iPosition];
			},
			success: oOptions.success,
			errorMessage: "Table in view '" + sViewName + "' does not contain an Item at position '" + iPosition + "'"
		};
	}

	function enterSomethingInASearchField(oSearchField, oSearchParams) {
		oSearchParams = oSearchParams || {};

		if (oSearchParams.searchValue) {
			oSearchField.setValue(oSearchParams.searchValue);
		}

		if (oSearchParams.skipEvent) {
			return;
		}

		var oEvent = jQuery.Event("touchend");
		oEvent.originalEvent = {
			query: oSearchParams.searchValue,
			refreshButtonPressed: oSearchParams.refreshButtonPressed,
			id: oSearchField.getId()
		};
		oEvent.target = oSearchField;
		oEvent.srcElement = oSearchField;
		jQuery.extend(oEvent, oEvent.originalEvent);

		oSearchField.fireSearch(oEvent);
	}

	Opa5.createPageObjects({

		onTheWorklistPage: {
			baseClass: Common,
			actions: jQuery.extend({
				iPressATableItemAtPosition: function(iPosition) {
					return this.waitFor(createWaitForItemAtPosition({
						position: iPosition,
						success: function(oTableItem) {
							oTableItem.$().trigger("tap");
						}
					}));
				},

				iRememberTheItemAtPosition: function(iPosition) {
					return this.waitFor(createWaitForItemAtPosition({
						position: iPosition,
						success: function(oTableItem) {
							this.getContext().currentItem = oTableItem;
						}
					}));
				},

				iPressOnMoreData: function() {
					return this.waitFor({
						id: sTableId,
						viewName: sViewName,
						matchers: function(oTable) {
							return !!oTable.$("trigger").length;
						},
						success: function(oTable) {
							oTable.$("trigger").trigger("tap");
						},
						errorMessage: "The Table does not have a trigger"
					});
				},

				iWaitUntilTheTableIsLoaded: function() {
					return this.waitFor({
						id: sTableId,
						viewName: sViewName,
						matchers: [new AggregationFilled({
							name: "items"
						})],
						errorMessage: "The Table has not been loaded"
					});
				},

				iWaitUntilTheListIsNotVisible: function() {
					return this.waitFor({
						id: sTableId,
						viewName: sViewName,
						visible: false,
						matchers: function(oTable) {
							// visible false also returns visible controls so we need an extra check here
							return !oTable.$().is(":visible");
						},
						errorMessage: "The Table is still visible"
					});
				},

				iSearchForTheFirstObject: function() {
					var sFirstObjectTitle;

					this.waitFor({
						id: sTableId,
						viewName: sViewName,
						matchers: new AggregationFilled({
							name: "items"
						}),
						success: function(oTable) {
							sFirstObjectTitle = oTable.getItems()[0].getCells()[0].getTitle();
						},
						errorMessage: "Did not find table entries while trying to search for the first object."
					});

					this.waitFor({
						id: sSearchFieldId,
						viewName: sViewName,
						success: function(oSearchField) {
							enterSomethingInASearchField(oSearchField, {
								searchValue: sFirstObjectTitle
							});
						},
						errorMessage: "Failed to find search field in Worklist view.'"
					});

					return this.waitFor({
						id: [sTableId, sSearchFieldId],
						viewName: sViewName,
						check: allItemsInTheListContainTheSearchTerm,
						errorMessage: "Did not find any table entries or too many while trying to search for the first object."
					});
				},

				iTypeSomethingInTheSearchThatCannotBeFound: function() {
					return this.iSearchForValue({
						searchValue: sSomethingThatCannotBeFound,
						skipEvent: true
					});
				},

				iSearchForValue: function(oSearchParams) {
					return this.waitFor({
						id: sSearchFieldId,
						viewName: sViewName,
						success: function(oSearchField) {
							enterSomethingInASearchField(oSearchField, oSearchParams);
						},
						errorMessage: "Failed to find search field in Worklist view.'"
					});
				},

				iClearTheSearch: function() {
					return this.iSearchForValue({
						searchValue: ""
					});
				},

				iSearchForSomethingWithNoResults: function() {
					return this.iSearchForValue({
						searchValue: sSomethingThatCannotBeFound
					});
				},

				iTriggerRefresh: function() {
					return this.iSearchForValue({
						refreshButtonPressed: true
					});
				}

			}, shareOptions.createActions(sViewName)),

			assertions: jQuery.extend({

				iShouldSeeTheTable: function() {
					return this.waitFor({
						id: sTableId,
						viewName: sViewName,
						success: function(oTable) {
							Opa5.assert.ok(oTable, "Found the object Table");
						},
						errorMessage: "Can't see the master Table."
					});
				},

				theTableShowsOnlyObjectsWithTheSearchStringInTheirTitle: function() {
					this.waitFor({
						id: [sTableId, sSearchFieldId],
						viewName: sViewName,
						check: allItemsInTheListContainTheSearchTerm,
						success: function() {
							Opa5.assert.ok(true, "Every item did contain the title");
						},
						errorMessage: "The table did not have items"
					});
				},

				theTableHasEntries: function() {
					return this.waitFor({
						viewName: sViewName,
						id: sTableId,
						matchers: new AggregationFilled({
							name: "items"
						}),
						success: function() {
							Opa5.assert.ok(true, "The table has entries");
						},
						errorMessage: "The table had no entries"
					});
				},

				theTableShouldHaveAllEntries: function() {
					return this.waitFor({
						id: sTableId,
						viewName: sViewName,
						matchers: function(oTable) {
							var iThreshold = oTable.getGrowingThreshold();
							return new AggregationLengthEquals({
								name: "items",
								length: iThreshold
							}).isMatching(oTable);
						},
						success: function(oTable) {
							var iGrowingThreshold = oTable.getGrowingThreshold();
							Opa5.assert.strictEqual(oTable.getItems().length, iGrowingThreshold, "The growing Table has " + iGrowingThreshold + " items");
						},
						errorMessage: "Table does not have all entries."
					});
				},

				theTitleShouldDisplayTheTotalAmountOfItems: function() {
					return this.waitFor({
						id: sTableId,
						viewName: sViewName,
						matchers: new AggregationFilled({
							name: "items"
						}),
						success: function(oTable) {
							var iObjectCount = oTable.getBinding("items").getLength();
							this.waitFor({
								id: "tableHeader",
								viewName: sViewName,
								matchers: function(oPage) {
									var sExpectedText = oPage.getModel("i18n").getResourceBundle().getText("worklistTableTitleCount", [iObjectCount]);
									return new PropertyStrictEquals({
										name: "text",
										value: sExpectedText
									}).isMatching(oPage);
								},
								success: function() {
									Opa5.assert.ok(true, "The Page has a title containing the number " + iObjectCount);
								},
								errorMessage: "The Page's header does not container the number of items " + iObjectCount
							});
						},
						errorMessage: "The table has no items."
					});
				},

				theTableShouldHaveTheDoubleAmountOfInitialEntries: function() {
					var iExpectedNumberOfItems;

					return this.waitFor({
						id: sTableId,
						viewName: sViewName,
						matchers: function(oTable) {
							iExpectedNumberOfItems = oTable.getGrowingThreshold() * 2;
							return new AggregationLengthEquals({
								name: "items",
								length: iExpectedNumberOfItems
							}).isMatching(oTable);
						},
						success: function() {
							Opa5.assert.ok(true, "The growing Table had the double amount: " + iExpectedNumberOfItems + " of entries");
						},
						errorMessage: "Table does not have the double amount of entries."
					});
				},

				theTableShouldContainOnlyFormattedUnitNumbers: function() {
					return this.theUnitNumbersShouldHaveTwoDecimals("sap.m.ObjectNumber",
						sViewName,
						"Object numbers are properly formatted",
						"Table has no entries which can be checked for their formatting");
				},

				iShouldSeeTheWorklistViewsBusyIndicator: function() {
					return this.waitFor({
						id: "page",
						viewName: sViewName,
						success: function(oPage) {
							Opa5.assert.ok(oPage.getParent().getBusy(), "The worklist view is busy");
						},
						errorMessage: "The worklist view is not busy"
					});
				},

				iShouldSeeTheWorklistTableBusyIndicator: function() {
					return this.waitFor({
						id: "table",
						viewName: sViewName,
						matchers: function(oTable) {
							return new PropertyStrictEquals({
								name: "busy",
								value: true
							}).isMatching(oTable);
						},
						success: function() {
							Opa5.assert.ok(true, "The worklist table is busy");
						},
						errorMessage: "The worklist table is not busy"
					});
				},

				iShouldSeeTheNoDataTextForNoSearchResults: function() {
					return this.waitFor({
						id: sTableId,
						viewName: sViewName,
						success: function(oTable) {
							Opa5.assert.strictEqual(oTable.getNoDataText(), oTable.getModel("i18n").getProperty("worklistNoDataWithSearchText"),
								"the table should show the no data text for search");
						},
						errorMessage: "table does not show the no data text for search"
					});
				}

			}, shareOptions.createAssertions(sViewName))

		}

	});

});