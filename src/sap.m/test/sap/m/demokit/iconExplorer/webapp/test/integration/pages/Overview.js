sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/demo/iconexplorer/test/integration/pages/Common"
], function(Opa5, Press, EnterText, Ancestor, AggregationLengthEquals, AggregationFilled, Properties, PropertyStrictEquals, Common) {
	"use strict";

	var sViewName = "Overview",
		sResultsId = "results",
		sResultsContainerId = "resultContainer",
		sSearchFieldId = "searchField",
		sSomethingThatCannotBeFound = "*!-Q@@||";

	function allItemsInTheListContainTheSearchTerm (aControls) {
		var oResults = aControls[0],
			oSearchField = aControls[1],
			aItems = oResults.getItems();

		// table needs items
		if (aItems.length === 0) {
			return false;
		}

		return aItems.every(function (oItem) {
			return oItem.getCells()[1].getText().indexOf(oSearchField.getValue()) !== -1;
		});
	}

	function oneItemInTheListContainTheSearchTerm (sName, oResults) {
		var aItems = oResults.getItems();

		// table needs items
		if (aItems.length === 0) {
			return false;
		}

		return !!aItems.filter(function (oItem) {
			return oItem.getCells()[1].getText().indexOf(sName) !== -1;
		}).length;
	}

	function allItemsInTheListContainTheTag (sTag, sModel, oResults) {
		var aItems = oResults.getItems();

		// table needs items
		if (aItems.length === 0) {
			return false;
		}

		return aItems.every(function (oItem) {
			return oItem.getBindingContext(sModel).getProperty("tagString").search(sTag) >= 0;
		});
	}

	function createWaitForTableItemWithName (oOptions) {
		var sName = oOptions.name;
		return {
			id: sResultsId,
			viewName: sViewName,
			matchers: function (oResults) {
				return oResults.getItems().filter(function(oItem) {
					return oItem.getCells()[1].getText() === sName;
				});
			},
			actions: oOptions.actions,
			success: oOptions.success,
			errorMessage: "Table in view '" + sViewName + "' does not contain an Item with name '" + sName + "'"
		};
	}

	function createWaitForTableItemFavoriteWithName (oOptions) {
		var sName = oOptions.name;
		return {
			id: sResultsId,
			viewName: sViewName,
			matchers: function (oResults) {
				return oResults.getItems().filter(function(oItem) {
					return oItem.getCells()[1].getText() === sName;
				});
			},
			success: function (aItems) {
				var oItem = aItems[0];

				if (oItem) {
					return this.waitFor({
						controlType: "sap.m.ToggleButton",
						matchers: new Ancestor(oItem),
						actions: oOptions.actions,
						success: oOptions.success
					});
				}
			},
			errorMessage: "Table in view '" + sViewName + "' does not contain an Item with name '" + sName + "'"
		};
	}

	function createWaitForTableItemAtPosition (oOptions) {
		var iPosition = oOptions.position;
		return {
			id: sResultsId,
			viewName: sViewName,
			matchers: function (oResults) {
				return oResults.getItems()[iPosition];
			},
			actions: oOptions.actions,
			success: oOptions.success,
			errorMessage: "Table in view '" + sViewName + "' does not contain an Item at position '" + iPosition + "'"
		};
	}

	Opa5.createPageObjects({

		onTheOverviewPage: {
			baseClass: Common,
			actions: jQuery.extend({
				iPressATableItemWithName: function (sName) {
					return this.waitFor(createWaitForTableItemWithName({
						name: sName,
						actions: new Press()
					}));
				},

				iPressATableItemAtPosition: function (iPosition) {
					return this.waitFor(createWaitForTableItemAtPosition({
						position: iPosition,
						actions: new Press()
					}));
				},

				iRememberTheItemAtPosition: function (iPosition){
					return this.waitFor(createWaitForTableItemAtPosition({
						position: iPosition,
						success: function (oResultsItem) {
							var oBindingContext = oResultsItem.getBindingContext();

							// Don't remember objects just strings since IE will not allow accessing objects of destroyed frames
							this.getContext().currentItem = {
								name: oBindingContext.getProperty("name")
							};
						}
					}));
				},

				iMarkAnIconAsFavorite: function (sName) {
					return this.waitFor(createWaitForTableItemFavoriteWithName({
						name: sName,
						actions: new Press()
					}));
				},

				iPressOnMoreData: function (){
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						actions: new Press(),
						errorMessage: "The Table does not have a trigger"
					});
				},

				iWaitUntilTheTableIsLoaded: function () {
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						matchers: [ new AggregationFilled({name: "items"}) ],
						errorMessage: "The Table has not been loaded"
					});
				},

				iSearchForTheFirstObject: function(bWithEnter) {
					var sFirstObjectTitle;

					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						matchers: new AggregationFilled({
							name: "items"
						}),
						success: function(oResults) {
							sFirstObjectTitle = oResults.getItems()[0].getCells()[1].getText();

							if (bWithEnter) {
								this.iSearchForValueWithEnter(sFirstObjectTitle);
							} else {
								this.iSearchForValue(sFirstObjectTitle);
							}

							this.waitFor({
								id: [sResultsId, sSearchFieldId],
								viewName: sViewName,
								check: allItemsInTheListContainTheSearchTerm,
								errorMessage: "Did not find any table entries or too many while trying to search for the first object."
							});
						},
						errorMessage: "Did not find table entries while trying to search for the first object."
					});
				},

				iSearchForValueWithActions: function (aActions) {
					return this.waitFor({
						id: sSearchFieldId,
						viewName: sViewName,
						actions: aActions,
						errorMessage: "Failed to find search field in Overview view.'"
					});
				},

				iSearchForValue: function (sSearchString) {
					return this.iSearchForValueWithActions([new EnterText({text: sSearchString})]);
				},

				iSearchForValueWithEnter: function (sSearchString) {
					return this.iSearchForValueWithActions([new EnterText({text: sSearchString}), new Press()]);
				},

				iTypeSomethingInTheSearchThatCannotBeFoundAndTriggerRefresh: function () {
					var fireRefreshButtonPressedOnSearchField = function (oSearchField) {
						/*eslint-disable new-cap */
						var oEvent = jQuery.Event("touchend");
						/*eslint-enable new-cap */
						oEvent.originalEvent = {refreshButtonPressed: true, id: oSearchField.getId()};
						oEvent.target = oSearchField;
						oEvent.srcElement = oSearchField;
						jQuery.extend(oEvent, oEvent.originalEvent);

						oSearchField.fireSearch(oEvent);
					};
					return this.iSearchForValueWithActions([new EnterText({text: sSomethingThatCannotBeFound}), fireRefreshButtonPressedOnSearchField]);
				},

				iClearTheSearch: function () {
					return this.iSearchForValueWithActions([new EnterText({text: ""})]);
				},

				iSearchForSomethingWithNoResults: function () {
					return this.iSearchForValueWithActions([new EnterText({text: sSomethingThatCannotBeFound})]);
				},

				iPressOnTheTabWithTheKey: function (sKey) {
					return this.waitFor({
						controlType: "sap.m.IconTabFilter",
						viewName: sViewName,
						matchers: new Properties({
							key: sKey
						}),
						actions: new Press(),
						errorMessage: "Cannot find the icon tab filter"
					});
				},

				iPressTheSurpriseMeButton: function () {
					return this.waitFor({
						id: "surprise",
						viewName: sViewName,
						actions: new Press(),
						errorMessage: "Failed to find surprise me button field in overview view.'"
					});
				},

				iSelectTheTagWithName: function (sName) {
					return this.waitFor({
						id: "tagSelection",
						viewName: sViewName,
						matchers: new AggregationFilled({name: "content"}),
						success: function (oControl) {
							return this.waitFor({
								controlType: "sap.m.ToggleButton",
								viewName: sViewName,
								matchers: [
									new Ancestor(oControl),
									new Properties({text: sName})
								],
								actions: new Press(),
								errorMessage: "Cannot find a toggle button"
							});
						},
						actions: new Press(),
						errorMessage: "Failed to find the tag selection bar in overview view.'"
					});
				},

				iSelectTheCategoryWithName: function (sName) {
					return this.waitFor({
						id: "categorySelection",
						viewName: sViewName,
						actions: [
							// combo box does not fully support enter text action so we fire the event manually
							new EnterText({text: sName}),
							function (oControl) {
								oControl.onChange();
								oControl.fireSelectionChange({ selectedItem: oControl.getSelectableItems()[0]});
							}],
						errorMessage: "Failed to find the category selection in overview view.'"
					});

				}

			}),

			assertions: jQuery.extend({

				iShouldSeeTheTable: function () {
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						success: function (oResults) {
							Opa5.assert.ok(oResults, "Found the object Table");
						},
						errorMessage: "Can't see the master Table."
					});
				},

				theTableShowsOnlyObjectsWithTheSearchStringInTheirTitle: function () {
					return this.waitFor({
						id: [sResultsId, sSearchFieldId],
						viewName: sViewName,
						check:  allItemsInTheListContainTheSearchTerm,
						success: function () {
							Opa5.assert.ok(true, "Every item did contain the search term");
						},
						errorMessage: "The table did not have items"
					});
				},

				theTableShowsOnlyObjectsWithTheTag: function (sName, sModelName) {
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						check:  function () {
							return allItemsInTheListContainTheTag.apply(this, [sName, sModelName].concat(Array.prototype.slice.apply(arguments)));
						},
						success: function () {
							Opa5.assert.ok(true, "Every item did contain the tag");
						},
						errorMessage: "The table did not have items"
					});
				},

				theTableShowsTheCategory: function (sName) {
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						check:  function (oControl) {
							return oControl.getModel().getProperty(oControl.getBinding("items").getPath().replace("/icons", "")).text === sName;
						},
						success: function () {
							Opa5.assert.ok(true, "The category is bound to the table");
						},
						errorMessage: "The table did not have items"
					});
				},

				theTableContainsTheIcon: function (sName) {
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						check:  function () {
							return oneItemInTheListContainTheSearchTerm.apply(this, [sName].concat(Array.prototype.slice.apply(arguments)));
						},
						success: function () {
							Opa5.assert.ok(true, "The item is in the result set");
						},
						errorMessage: "The table did not have items"
					});
				},

				theTableDoesNotContainTheIcon: function (sName) {
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						check:  function () {
							return !oneItemInTheListContainTheSearchTerm.apply(this, [sName].concat(Array.prototype.slice.apply(arguments)));
						},
						success: function () {
							Opa5.assert.ok(true, "The item is not in the result set");
						},
						errorMessage: "The table did not have items"
					});
				},

				theIconIsMarkedAsFavorite: function (sName) {
					return this.waitFor(createWaitForTableItemFavoriteWithName({
						name: sName,
						success: function(aControls) {
							var oControl = aControls[0];

							Opa5.assert.ok(oControl.getPressed(), "The item is a favorite");
						}
					}));
				},

				theTableHasEntries: function () {
					return this.waitFor({
						viewName: sViewName,
						id: sResultsId,
						matchers: new AggregationFilled({
							name: "items"
						}),
						success: function () {
							Opa5.assert.ok(true, "The table has entries");
						},
						errorMessage: "The table had no entries"
					});
				},

				theTableShouldHaveAllEntries: function () {
					var iAllEntities = 626,
						iExpectedNumberOfItems;

					// retrieve all Objects
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						matchers: function (oResults) {
							// If there are less items in the list than the growingThreshold, only check for this number.
							iExpectedNumberOfItems = Math.min(oResults.getGrowingThreshold(), iAllEntities);
							return new AggregationLengthEquals({name: "items", length: iExpectedNumberOfItems}).isMatching(oResults);
						},
						success: function (oResults) {
							Opa5.assert.strictEqual(oResults.getItems().length, iExpectedNumberOfItems, "The growing Table has " + iExpectedNumberOfItems + " items");
						},
						errorMessage: "Table does not have all entries."
					});
				},

				theTitleShouldDisplayTheTotalAmountOfItems: function () {
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						matchers: new AggregationFilled({name: "items"}),
						success: function (oResults) {
							var iObjectCount = oResults.getBinding("items").getLength();

							return this.waitFor({
								controlType: "sap.m.IconTabFilter",
								viewName: sViewName,
								matchers: new Properties({
									key: "all"
								}),
								success: function (aTabFilters) {
									var oTabFilter = aTabFilters[0];
									Opa5.assert.strictEqual(parseInt(oTabFilter.getCount(), 10), iObjectCount, "The icon tab fillter \"all\" shows the total number of icons " + iObjectCount);
								},
								errorMessage: "The icon tab fillter \"all\" does not contain the number of items " + iObjectCount
							});
						},
						errorMessage: "The table has no items."
					});
				},

				theTableShouldHaveTheDoubleAmountOfInitialEntries: function () {
					var iExpectedNumberOfItems;

					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						matchers: function (oResults) {
							iExpectedNumberOfItems = oResults.getGrowingThreshold() * 2;
							return new AggregationLengthEquals({name: "items", length: iExpectedNumberOfItems}).isMatching(oResults);
						},
						success: function () {
							Opa5.assert.ok(true, "The growing Table had the double amount: " + iExpectedNumberOfItems + " of entries");
						},
						errorMessage: "Table does not have the double amount of entries."
					});
				},

				iShouldSeeTheResultsTableBusyIndicatorOrItemsLoaded: function () {
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						matchers: function (oResults) {
							return new AggregationFilled({name: "items"}).isMatching(oResults) || new PropertyStrictEquals({name: "busy", value: true}).isMatching(oResults);
						},
						success: function () {
							Opa5.assert.ok(true, "The results table is busy or the data is already loaded");
						},
						errorMessage: "The results table is not busy"
					});
				},

				iShouldSeeTheTabularNoDataTextForNoSearchResults: function () {
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						success: function (oResults) {
							Opa5.assert.strictEqual(oResults.getNoDataText(), oResults.getModel("i18n").getProperty("overviewNoDataWithSearchText"), "The no data should be shown in the tabular results section");
						},
						errorMessage: "The tabular results do not show the no data text for search"
					});
				},

				iShouldSeeTheVisualNoDataTextForNoSearchResults: function () {
					return this.waitFor({
						id: sResultsContainerId,
						viewName: sViewName,
						success: function (oResultContainer) {
							return this.waitFor({
								controlType: "sap.m.Label",
								viewName: sViewName,
								matchers: [
									new Ancestor(oResultContainer),
									new Properties({text: oResultContainer.getModel("i18n").getProperty("overviewNoDataWithSearchText")})
								],
								success: function () {
									Opa5.assert.ok(true, "The no data should be shown in the visual results section");
								},
								errorMessage: "The visual results do not show the no data text for search"
							});
						}
					});
				}

			})

		}

	});

});