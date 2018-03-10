sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/demo/orderbrowser/test/integration/pages/Common",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/AggregationEmpty",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function(Opa5, Press, EnterText, Common, AggregationLengthEquals, AggregationFilled, AggregationEmpty, PropertyStrictEquals) {
	"use strict";

	var sViewName = "Master",
		sSomethingThatCannotBeFound = "*#-Q@@||";

	Opa5.createPageObjects({
		onTheMasterPage : {
			baseClass : Common,

			actions : {

				iWaitUntilTheListIsLoaded : function () {
					return this.waitFor({
						id : "list",
						viewName : sViewName,
						matchers : new AggregationFilled({name : "items"}),
						errorMessage : "The master list has not been loaded"
					});
				},

				iWaitUntilTheFirstItemIsSelected : function () {
					return this.waitFor({
						id : "list",
						viewName : sViewName,
						matchers : function(oList) {
							// wait until the list has a selected item
							var oSelectedItem = oList.getSelectedItem();
							return oSelectedItem && oList.getItems().indexOf(oSelectedItem) === 0;
						},
						errorMessage : "The first item of the master list is not selected"
					});
				},

				iRememberTheSelectedItem : function () {
					return this.waitFor({
						id : "list",
						viewName : sViewName,
						matchers : function (oList) {
							return oList.getSelectedItem();
						},
						success : function (oListItem) {
							this.iRememberTheListItem(oListItem);
						},
						errorMessage : "The list does not have a selected item so nothing can be remembered"
					});
				},

				iRememberTheIdOfListItemAtPosition : function (iPosition) {
					return this.waitFor({
						id : "list",
						viewName : sViewName,
						matchers : function (oList) {
							return oList.getItems()[iPosition];
						},
						success : function (oListItem) {
							this.iRememberTheListItem(oListItem);
						},
						errorMessage : "The list does not have an item at the index " + iPosition
					});
				},

				iRememberAnIdOfAnObjectThatsNotInTheList : function () {
					return this.waitFor(this.createAWaitForAnEntitySet({
						entitySet : "Orders",
						success : function (aEntityData) {
							this.waitFor({
								id : "list",
								viewName : sViewName,
								matchers : new AggregationFilled({name: "items"}),
								success : function (oList) {
									var sCurrentId,
										aItemsNotInTheList = aEntityData.filter(function (oObject) {
											return !oList.getItems().some(function (oListItem) {
												return oListItem.getBindingContext().getProperty("OrderID") === oObject.OrderID;
											});
										});

									if (!aItemsNotInTheList.length) {
										// Not enough items all of them are displayed so we take the last one
										sCurrentId = aEntityData[aEntityData.length - 1].OrderID;
									} else {
										sCurrentId = aItemsNotInTheList[0].OrderID;
									}

									var oCurrentItem = this.getContext().currentItem;
									// Construct a binding path since the list item is not created yet and we only have the id.
									oCurrentItem.bindingPath = "/" + oList.getModel().createKey("Orders", {
										OrderID : sCurrentId
									});
									oCurrentItem.id = sCurrentId;
								},
								errorMessage : "the model does not have a item that is not in the list"
							});
						}
					}));
				},

				iPressOnTheObjectAtPosition : function (iPositon) {
					return this.waitFor({
						id : "list",
						viewName : sViewName,
						matchers : function (oList) {
							return oList.getItems()[iPositon];
						},
						actions : new Press(),
						errorMessage : "List 'list' in view '" + sViewName + "' does not contain an ObjectListItem at position '" + iPositon + "'"
					});
				},

				iSearchFor : function (sSearch){
					return this.waitFor({
						id : "list",
						viewName : sViewName,
						matchers: new AggregationFilled({name : "items"}),
						success : function () {
							return this.iSearchForValue(new EnterText({text: sSearch}), new Press());
						},
						errorMessage : "Did not find list items while trying to search for " + sSearch
					});
				},

				iSearchForValue : function (aActions) {
					return this.waitFor({
						id : "searchField",
						viewName : sViewName,
						actions: aActions,
						errorMessage : "Failed to find search field in Master view.'"
					});
				},

				iClearTheSearch : function () {
					//can not use 'EnterText' action to enter empty strings (yet)
					var fnClearSearchField = function(oSearchField) {
						oSearchField.clear();
					};
					return this.iSearchForValue([fnClearSearchField]);
				},

				iSearchForSomethingWithNoResults : function () {
					return this.iSearchForValue([new EnterText({text: sSomethingThatCannotBeFound}), new Press()]);
				},

				iRememberTheListItem : function (oListItem) {
					var oBindingContext = oListItem.getBindingContext();
					this.getContext().currentItem = {
						bindingPath: oBindingContext.getPath(),
						id: oBindingContext.getProperty("OrderID"),
						title: oBindingContext.getProperty("OrderID")
					};
				}
			},

			assertions : {

				iShouldSeeTheBusyIndicator : function () {
					return this.waitFor({
						id : "list",
						viewName : sViewName,
						success : function (oList) {
							// we set the list busy, so we need to query the parent of the app
							Opa5.assert.ok(oList.getBusy(), "The master list is busy");
						},
						errorMessage : "The master list is not busy."
					});
				},

				theListHeaderDisplaysZeroHits : function () {
					return this.waitFor({
						viewName : sViewName,
						id : "page",
						matchers : new PropertyStrictEquals({name : "title", value : "Orders (0)"}),
						success : function () {
							Opa5.assert.ok(true, "The list header displays zero hits");
						},
						errorMessage : "The list header still has items"
					});
				},

				theListHasNoEntries : function () {
					return this.waitFor({
						viewName : sViewName,
						id : "list",
						matchers : new AggregationEmpty({
							name : "items"
						}),
						success : function () {
							Opa5.assert.ok(true, "The list has items");
						},
						errorMessage : "The list had no items"
					});
				},

				iShouldSeeTheList : function () {
					return this.waitFor({
						id : "list",
						viewName : sViewName,
						success : function (oList) {
							Opa5.assert.ok(oList, "Found the object List");
						},
						errorMessage : "Can't see the master list."
					});
				},

				theListShowsOnlyObjectsWithTheSearchString : function (sSearch) {
					this.waitFor({
						id : "list",
						viewName : sViewName,
						matchers : new AggregationFilled({name : "items"}),
						check : function(oList) {
							var bEveryItemContainsTheTitle = oList.getItems().every(function (oItem) {
									return oItem.getAttributes()[0].getText().indexOf(sSearch) !== -1;
								});
							return bEveryItemContainsTheTitle;
						},
						success : function () {
							Opa5.assert.ok(true, "Every item did contain the title");
						},
						errorMessage : "The list did not have items"
					});
				},

				theListShouldHaveAllEntries : function () {
					var aAllEntities,
						iExpectedNumberOfItems;
					// retrieve all Orders to be able to check for the total amount
					this.waitFor(this.createAWaitForAnEntitySet({
						entitySet : "Orders",
						success : function (aEntityData) {
							aAllEntities = aEntityData;
						}
					}));

					return this.waitFor({
						id : "list",
						viewName : sViewName,
						matchers : function (oList) {
							// If there are less items in the list than the growingThreshold, only check for this number.
							iExpectedNumberOfItems = Math.min(oList.getGrowingThreshold(), aAllEntities.length);
							return new AggregationLengthEquals({name : "items", length : iExpectedNumberOfItems}).isMatching(oList);
						},
						success : function (oList) {
							Opa5.assert.strictEqual(oList.getItems().length, iExpectedNumberOfItems, "The growing list displays all items");
						},
						errorMessage : "List does not display all entries."
					});
				},

				iShouldSeeTheNoDataTextForNoSearchResults : function () {
					return this.waitFor({
						id : "list",
						viewName : sViewName,
						success : function (oList) {
							Opa5.assert.strictEqual(oList.getNoDataText(), oList.getModel("i18n").getProperty("masterListNoDataWithFilterOrSearchText"), "the list should show the no data text for search and filter");
						},
						errorMessage : "list does not show the no data text for search and filter"
					});
				},

				theHeaderShouldDisplayAllEntries : function () {
					return this.waitFor({
						id : "list",
						viewName : sViewName,
						success : function (oList) {
							var iExpectedLength = oList.getBinding("items").getLength();
							this.waitFor({
								id : "page",
								viewName : sViewName,
								matchers : new PropertyStrictEquals({name : "title", value : "Orders (" + iExpectedLength + ")"}),
								success : function () {
									Opa5.assert.ok(true, "The master page header displays " + iExpectedLength + " items");
								},
								errorMessage : "The  master page header does not display " + iExpectedLength + " items."
							});
						},
						errorMessage : "Header does not display the number of items in the list"
					});
				},

				theFirstItemShouldBeSelected : function () {
					return this.waitFor({
						id : "list",
						viewName : sViewName,
						matchers : new AggregationFilled({name : "items"}),
						success : function (oList) {
							Opa5.assert.strictEqual(oList.getItems()[0], oList.getSelectedItem(), "The first object is selected");
						},
						errorMessage : "The first object is not selected."
					});
				},

				theListShouldHaveNoSelection : function () {
					return this.waitFor({
						id : "list",
						viewName : sViewName,
						matchers : function(oList) {
							return !oList.getSelectedItem();
						},
						success : function (oList) {
							Opa5.assert.strictEqual(oList.getSelectedItems().length, 0, "The list selection is removed");
						},
						errorMessage : "List selection was not removed"
					});
				},

				theRememberedListItemShouldBeSelected : function () {
					this.waitFor({
						id : "list",
						viewName : sViewName,
						matchers : function (oList) {
							return oList.getSelectedItem();
						},
						success : function (oSelectedItem) {
							Opa5.assert.strictEqual(oSelectedItem.getTitle(), "Order " + this.getContext().currentItem.title, "The list selection is incorrect");
						},
						errorMessage : "The list has no selection"
					});
				}

			}

		}

	});

});