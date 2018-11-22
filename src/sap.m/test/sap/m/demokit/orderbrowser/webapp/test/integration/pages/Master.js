sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"./Common",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function(Opa5, Press, Common, EnterText, AggregationLengthEquals, AggregationFilled, PropertyStrictEquals) {
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

				iTypeSomethingInTheSearchThatCannotBeFoundAndTriggerRefresh : function () {
					return this.iSearchForValue(function (oSearchField) {
						oSearchField.setValue(sSomethingThatCannotBeFound);
						oSearchField.fireSearch({refreshButtonPressed : true});
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
				},

				iFilterTheListOn : function (sField) {
					return this.iMakeASelection("filterButton", "Orders", sField);
				},

				iMakeASelection : function (sSelect, sItem, sOption) {
					return this.waitFor({
						id : sSelect,
						viewName : sViewName,
						actions : new Press(),
						success : function () {
							this.waitFor({
								controlType: "sap.m.StandardListItem",
								matchers: new PropertyStrictEquals({name: "title", value: sItem}),
								searchOpenDialogs: true,
								actions: new Press(),
								success: function () {
									this.waitFor({
										controlType: "sap.m.StandardListItem",
										matchers : new PropertyStrictEquals({name: "title", value: sOption}),
										searchOpenDialogs: true,
										actions : new Press(),
										success: function () {
											this.waitFor({
												controlType: "sap.m.Button",
												matchers: new PropertyStrictEquals({name: "text", value: "OK"}),
												searchOpenDialogs: true,
												actions: new Press(),
												errorMessage: "The ok button in the dialog was not found and could not be pressed"
											});
										},
										errorMessage : "Did not find the" +  sOption + "in" + sItem
									});
								},
								errorMessage : "Did not find the " + sItem + " element in select"
							});
						},
						errorMessage : "Did not find the " + sSelect + " select"
					});
				},

				iOpenViewSettingsDialog : function () {
					return this.waitFor({
						id : "filterButton",
						viewName : sViewName,
						actions : new Press(),
						errorMessage : "Did not find the 'filter' button."
					});
				},

				iPressResetInViewSelectionDialog : function () {
					return this.waitFor({
						searchOpenDialogs : true,
						controlType : "sap.m.Button",
						matchers : new Opa5.matchers.PropertyStrictEquals({name : "icon", value : "sap-icon://clear-filter"}),
						actions : new Press(),
						errorMessage : "Did not find the ViewSettingDialog's 'Reset' button."
					});
				},

				iPressOKInViewSelectionDialog : function () {
					return this.waitFor({
						searchOpenDialogs : true,
						controlType : "sap.m.Button",
						matchers :  new Opa5.matchers.PropertyStrictEquals({name : "text", value : "OK"}),
						actions : new Press(),
						errorMessage : "Did not find the ViewSettingDialog's 'OK' button."
					});
				},

				iGroupTheList : function () {
					return this.iChooseASorter("groupButton", "Group by Customer");
				},

				iRemoveListGrouping : function () {
					return this.iChooseASorter("groupButton", "None");
				},

				iChooseASorter: function (sSelect, sSort) {
					return this.waitFor({
						id : sSelect,
						viewName : sViewName,
						actions : new Press(),
						success : function () {
							this.waitFor({
								controlType: "sap.m.StandardListItem",
								matchers : new PropertyStrictEquals({name: "title", value: sSort}),
								searchOpenDialogs: true,
								actions : new Press(),
								success : function () {
									this.waitFor({
										controlType: "sap.m.Button",
										matchers: new PropertyStrictEquals({name: "text", value: "OK"}),
										searchOpenDialogs: true,
										actions: new Press(),
										errorMessage: "The ok button in the dialog was not found and could not be pressed"
									});
								},
								errorMessage : "Did not find the" +  sSort + " element in select"
							});
						},
						errorMessage : "Did not find the " + sSelect + " select"
					});
				}
			},

			assertions : {

				iShouldSeeTheBusyIndicator : function () {
					return this.waitFor({
						id: "list",
						viewName: sViewName,
						matchers: new PropertyStrictEquals({
							name: "busy",
							value: true
						}),
						autoWait: false,
						success : function () {
							Opa5.assert.ok(true, "The master list is busy");
						},
						errorMessage : "The master list is not busy."
					});
				},

				theListHeaderDisplaysZeroHits : function () {
					return this.waitFor({
						viewName : sViewName,
						id : "masterHeaderTitle",
						matchers : new PropertyStrictEquals({name : "text", value : "Orders (0)"}),
						success : function () {
							Opa5.assert.ok(true, "The list header displays zero hits");
						},
						errorMessage : "The list header still has items"
					});
				},

				theListHasEntries : function () {
					return this.waitFor({
						viewName : sViewName,
						id : "list",
						matchers : new AggregationFilled({
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
								id : "masterHeaderTitle",
								viewName : sViewName,
								matchers : new PropertyStrictEquals({name : "text", value : "Orders (" + iExpectedLength + ")"}),
								success : function () {
									Opa5.assert.ok(true, "The master page header displays " + iExpectedLength + " items");
								},
								errorMessage : "The  master page header does not display " + iExpectedLength + " items."
							});
						},
						errorMessage : "Header does not display the number of items in the list"
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
				},

				theListShouldBeFilteredOnShippedOrders : function () {
					function fnCheckFilter (oList){
						var fnIsFiltered = function (oElement) {
							if (!oElement.getBindingContext()) {
								return false;
							} else {
								var sDate = oElement.getBindingContext().getProperty("ShippedDate");
								if (!sDate) {
									return false;
								} else {
									return true;
								}
							}
						};

						return oList.getItems().every(fnIsFiltered);
					}

					return this.waitFor({
						viewName : sViewName,
						id : "list",
						matchers : fnCheckFilter,
						success : function() {
							Opa5.assert.ok(true, "Master list has been filtered correctly");
						},
						errorMessage : "Master list has not been filtered correctly"
					});
				},

				theListShouldContainAGroupHeader : function () {
					return this.waitFor({
						controlType : "sap.m.GroupHeaderListItem",
						viewName : sViewName,
						success : function () {
							Opa5.assert.ok(true, "Master list is grouped");
						},
						errorMessage : "Master list is not grouped"
					});
				},

				theListShouldNotContainGroupHeaders : function () {
					function fnIsGroupHeader (oElement) {
						return oElement.getMetadata().getName() === "sap.m.GroupHeaderListItem";
					}

					return this.waitFor({
						viewName : sViewName,
						id : "list",
						matchers : function (oList) {
							return !oList.getItems().some(fnIsGroupHeader);
						},
						success : function() {
							Opa5.assert.ok(true, "Master list does not contain a group header");
						},
						errorMessage : "Master list still contains a group header although grouping has been removed."
					});
				}
			}

		}

	});

});
