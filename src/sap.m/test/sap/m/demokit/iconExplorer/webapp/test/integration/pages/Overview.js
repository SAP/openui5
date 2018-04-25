sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function(Opa5,
			Press,
			EnterText,
			Ancestor,
			AggregationLengthEquals,
			AggregationFilled,
			Properties,
			PropertyStrictEquals
			) {
	"use strict";

	var sViewName = "Overview",
		sResultsId = "results",
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

	function oneItemInTheListContainsTheSearchTerm (sName, oResults) {
		var aItems = oResults.getItems();

		// table needs items
		if (aItems.length === 0) {
			return false;
		}

		return !!aItems.some(function (oItem) {
			var sText;
			if (oItem.getCells) {
				sText = oItem.getCells()[1].getText();
			}else {
				sText = oItem.getContent()[0].getContent()[1].getText();
			}
			return sText.indexOf(sName) !== -1;
		});
	}

	function onlyOneItemInTheListContainsTheSearchTerm (sName, oResults) {
		var aItems = oResults.getItems();

		// only one item is present in the result table
		if (aItems.length !== 1) {
			return false;
		}

		return aItems[0].getCells()[1].getText().indexOf(sName) !== -1;
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
			errorMessage: "Table in view \"" + sViewName + "\" does not contain an Item with name \"" + sName + "\""
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
						controlType: "sap.m.RatingIndicator",
						matchers: new Ancestor(oItem),
						actions: oOptions.actions,
						success: oOptions.success
					});
				}
			},
			errorMessage: "Table in view \"" + sViewName + "\" does not contain an Item with name \"" + sName + "\""
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
			errorMessage: "Table in view \"" + sViewName + "\" does not contain an Item at position \"" + iPosition + "\""
		};
	}

	Opa5.createPageObjects({

		onTheOverviewPage: {
			actions: {
				iPressTheNavigationBackButton: function(){
					return this.waitFor({
						id: "buttonNavigateBack",
						viewName: sViewName,
						actions: new Press(),
						errorMessage: "The Button is not there"
					});
				},

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
						actions: new Press({idSuffix: "selector"})
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
								errorMessage: "Did not find any table entries or too many while trying to search for the first object"
							});
						},
						errorMessage: "Did not find table entries while trying to search for the first object"
					});
				},

				iSearchForValueWithActions: function (aActions) {
					return this.waitFor({
						id: sSearchFieldId,
						viewName: sViewName,
						actions: aActions,
						errorMessage: "Failed to find search field in Overview view"
					});
				},

				iSearchForValue: function (sSearchString) {
					return this.iSearchForValueWithActions([new EnterText({text: sSearchString})]);
				},

				iSearchForValueWithEnter: function (sSearchString) {
					return this.iSearchForValueWithActions([new EnterText({text: sSearchString}), new Press()]);
				},

				iTypeSomethingInTheSearchThatCannotBeFound: function () {
					return this.iSearchForValueWithActions([new EnterText({text: sSomethingThatCannotBeFound})]);
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
						errorMessage: "Failed to find surprise me button field in overview view"
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
						errorMessage: "Failed to find the tag selection bar in overview view"
					});
				},

				iSelectTheCategoryWithName: function (sName) {
					return this.waitFor({
						id: "categorySelection",
						viewName: sViewName,
						actions: [
							// press on the combo box to open the list of options
							new Press()
						],
						success: function(oComboBox) {
							// press on the item with the key specified by the parameter
							return this.waitFor({
								controlType: "sap.ui.core.Item",
								matchers: new Ancestor(oComboBox),
								success: function(aItems) {
									aItems.some(function (oItem) {
										if (oItem.getText() === sName) {
											new Press().executeOn(oItem);
											return true;
										}
									});
								}
							});
						},
						errorMessage: "Failed to find the category selection in overview view"
					});
				},
				iClickonTheFontSelectionButton: function(){
					return this.waitFor({
						id: "fontSelector",
						viewName: sViewName,
						actions: new Press(),
						errorMessage: "The font selection button is not there"
					});
				},
				iSelectTheIconFont:  function(sFontName) {
					return this.waitFor({
						id: "selectFont",
						viewName: sViewName,
						actions: function(oList) {
							var oItems = oList.getContent()[0].getItems();
							for (var i = 0; i < oItems.length; i++) {
								var sItemFontName = oItems[i].getCustomData()[0].getValue();

								if (sItemFontName === sFontName) {
									new Press().executeOn(oItems[i]);
								}
							}
						},
						errorMessage: "Can't select the icon font \"" + sFontName + "\""
					});
				}
			},

			assertions: {
				iShouldSeeTheTNTFontPage: function () {
					return this.waitFor({
						id: "fontSelector",
						viewName: sViewName,
						matchers : new PropertyStrictEquals({
							name : "text",
							value : "SAP Fiori Tools"
						}),
						success: function () {
							Opa5.assert.ok(true, "Showing the TNT font page");
						},
						errorMessage: "Can't find the TNT font page"
					});
				},

				iShouldSeeTheTable: function () {
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						success: function (oResults) {
							Opa5.assert.ok(oResults, "Found the result table");
						},
						errorMessage: "Can't find the result table"
					});
				},

				theTableShouldShowOnlyObjectsWithTheSearchStringInTheirTitle: function () {
					return this.waitFor({
						id: [sResultsId, sSearchFieldId],
						viewName: sViewName,
						check:  allItemsInTheListContainTheSearchTerm,
						success: function () {
							Opa5.assert.ok(true, "Every item did contain the search term");
						},
						errorMessage: "The table did not have items matching the search term"
					});
				},

				theTableShouldShowOnlyObjectsWithTheTag: function (sName, sModelName) {
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						check:  function () {
							return allItemsInTheListContainTheTag.apply(this, [sName, sModelName].concat(Array.prototype.slice.apply(arguments)));
						},
						success: function () {
							Opa5.assert.ok(true, "Every item did contain the tag");
						},
						errorMessage: "The table does not show items with the tag \"" + sName + "\""
					});
				},

				theTableShouldShowTheCategory: function (sName) {
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						check:  function (oControl) {
							var sAbsolutePath = oControl.getBinding("items").getPath();

							if (sAbsolutePath.startsWith("/")) {
								return oControl.getModel().getProperty(sAbsolutePath.replace("/icons", "")).text === sName;
							} else {
								return false;
							}
						},
						success: function () {
							Opa5.assert.ok(true, "The category is bound to the table");
						},
						errorMessage: "The table does not show items with the category \"" + sName + "\""
					});
				},

				theTableShouldContainTheIcon: function (sName) {
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						check:  function () {
							return oneItemInTheListContainsTheSearchTerm.apply(this, [sName].concat(Array.prototype.slice.apply(arguments)));
						},
						success: function () {
							Opa5.assert.ok(true, "The item is in the result set");
						},
						errorMessage: "The table did not have items"
					});
				},

				theTableShouldContainOnlyTheIcon: function (sName) {
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						check:  function (oTable) {
							return onlyOneItemInTheListContainsTheSearchTerm(sName, oTable);
						},
						success: function () {
							Opa5.assert.ok(true, "Only one single item with the substring \"" + sName + "\" in the title is in the result set");
						},
						errorMessage: "The table does not show only one single item with the substring \""  + sName + "\" in its title"
					});
				},

				theTableShouldNotContainTheIcon: function (sName) {
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						check:  function () {
							return !oneItemInTheListContainsTheSearchTerm.apply(this, [sName].concat(Array.prototype.slice.apply(arguments)));
						},
						success: function () {
							Opa5.assert.ok(true, "The item is not in the result set");
						},
						errorMessage: "The table did not have items"
					});
				},

				theIconShouldBeMarkedAsFavorite: function (sName) {
					return this.waitFor(createWaitForTableItemFavoriteWithName({
						name: sName,
						success: function(aControls) {
							var oControl = aControls[0];

							Opa5.assert.ok(oControl.getValue(), "The item is a favorite");
						}
					}));
				},

				theTableShouldHaveNoEntries: function () {
					return this.waitFor({
						viewName: sViewName,
						id: sResultsId,
						matchers : new AggregationLengthEquals({name : "items", length: 0}),
						success : function () {
							Opa5.assert.ok(true, "The list has no entries");
						},
						errorMessage : "The list does contain entries"
					});
				},

				theTableShouldHaveAllEntries: function () {
					var iAllEntities = 23,
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
						errorMessage: "Table does not have all entries"
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
						errorMessage: "The table has no items"
					});
				},

				theTableShouldHaveTheDoubleAmountOfInitialEntries: function () {
					var iAllEntities = 23,
						iExpectedNumberOfItems;

					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						matchers: function (oResults) {
							iExpectedNumberOfItems = Math.min(oResults.getGrowingThreshold() * 2, iAllEntities);
							return new AggregationLengthEquals({name: "items", length: iExpectedNumberOfItems}).isMatching(oResults);
						},
						success: function () {
							Opa5.assert.ok(true, "The growing Table had the double amount: " + iExpectedNumberOfItems + " of entries");
						},
						errorMessage: "Table does not have the double amount of entries"
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

				iShouldSeeTheNoDataTextForNoSearchResults: function () {
					return this.waitFor({
						id: sResultsId,
						viewName: sViewName,
						success: function (oResults) {
							Opa5.assert.strictEqual(oResults.getNoDataText(), oResults.getModel("i18n").getProperty("overviewNoDataWithSearchText"), "The no data should be shown in the tabular results section");
						},
						errorMessage: "The tabular results do not show the no data text for search"
					});
				}
			}
		}
	});
});