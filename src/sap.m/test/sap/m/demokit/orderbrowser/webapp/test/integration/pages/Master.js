sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"./Common",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/Properties"
], function(Opa5, Press, Common, EnterText, AggregationLengthEquals, AggregationFilled, Properties) {
	"use strict";

	Opa5.createPageObjects({
		onTheMasterPage: {
			baseClass: Common,
			viewName: "Master",

			actions: {

				iWaitUntilTheListIsLoaded: function () {
					return this.waitFor({
						id: "list",
						matchers: new AggregationFilled({
							name: "items"
						}),
						errorMessage: "The master list has not been loaded"
					});
				},

				iRememberTheSelectedItem: function () {
					return this.waitFor({
						id: "list",
						matchers: function (oList) {
							return oList.getSelectedItem();
						},
						success: function (oListItem) {
							this.iRememberTheListItem(oListItem);
						},
						errorMessage: "The list does not have a selected item so nothing can be remembered"
					});
				},

				iRememberTheIdOfListItemAtPosition: function (iPosition) {
					return this.waitFor({
						id: "list",
						matchers: function (oList) {
							return oList.getItems()[iPosition];
						},
						success: function (oListItem) {
							this.iRememberTheListItem(oListItem);
						},
						errorMessage: "The list does not have an item at the index " + iPosition
					});
				},

				iRememberAnIdOfAnObjectThatsNotInTheList: function () {
					var aEntityData = this.getEntitySet("Orders");
					return this.waitFor({
						id: "list",
						matchers: new AggregationFilled({
							name: "items"
						}),
						success: function (oList) {
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
								OrderID: sCurrentId
							});
							oCurrentItem.id = sCurrentId;
						},
						errorMessage: "the model does not have a item that is not in the list"
					});
				},

				iPressOnTheObjectAtPosition: function (iPositon) {
					return this.waitFor({
						id: "list",
						matchers: function (oList) {
							return oList.getItems()[iPositon];
						},
						actions: new Press(),
						errorMessage: "List 'list' in view 'Master' does not contain an ObjectListItem at position '" + iPositon + "'"
					});
				},

				iSearchFor: function (sSearch){
					return this.waitFor({
						id: "searchField",
						actions: [
							new EnterText({
								text: sSearch
							}),
							new Press()
						],
						errorMessage: "Can't search for " + sSearch
					});
				},

				iSearchForNotFound: function () {
					return this.iSearchFor("*#-Q@@||");
				},

				iClearTheSearch: function () {
					return this.waitFor({
						id: "searchField",
						actions: new Press({
							idSuffix: "reset"
						}),
						errorMessage: "Failed to clear the search in master list"
					});
				},

				iRememberTheListItem: function (oListItem) {
					var oBindingContext = oListItem.getBindingContext();
					this.getContext().currentItem = {
						bindingPath: oBindingContext.getPath(),
						id: oBindingContext.getProperty("OrderID"),
						title: oBindingContext.getProperty("OrderID")
					};
				},

				iFilterTheListOn: function (sOption) {
					return this.waitFor({
						id: "filterButton",
						actions: new Press(),
						success: function () {
							this.waitFor({
								searchOpenDialogs: true,
								controlType: "sap.m.StandardListItem",
								matchers: new Properties({
									title: "Orders"
								}),
								actions: new Press(),
								success: function () {
									this.waitFor({
										searchOpenDialogs: true,
										controlType: "sap.m.StandardListItem",
										matchers: new Properties({
											title: sOption
										}),
										actions: new Press(),
										success: function () {
											this.waitFor({
												searchOpenDialogs: true,
												controlType: "sap.m.Button",
												matchers: new Properties({
													text: "OK"
												}),
												actions: new Press(),
												errorMessage: "The OK button in the filter dialog could not be pressed"
											});
										},
										errorMessage: "Did not find the " +  sOption + " option in Orders"
									});
								},
								errorMessage: "Did not find the Orders in filter dialog"
							});
						},
						errorMessage: "Did not find the filter button"
					});
				},

				iResetFilters: function () {
					return this.waitFor({
						id: "filterButton",
						actions: new Press(),
						success: function () {
							return this.waitFor({
								searchOpenDialogs: true,
								controlType: "sap.m.Button",
								matchers: new Properties({
									text: "Reset"
								}),
								actions: new Press(),
								success: function () {
									return this.waitFor({
										searchOpenDialogs: true,
										controlType: "sap.m.Button",
										matchers:  new Properties({
											text: "OK"
										}),
										actions: new Press(),
										errorMessage: "Did not find the ViewSettingDialog's 'OK' button."
									});
								},
								errorMessage: "Did not find the ViewSettingDialog's 'Reset' button."
							});
						},
						errorMessage: "Did not find the 'filter' button."
					});
				},

				iGroupTheList: function () {
					return this.iChooseGrouping("Group by Customer");
				},

				iResetGrouping: function () {
					return this.iChooseGrouping("None");
				},

				iChooseGrouping: function (sGroupBy) {
					return this.waitFor({
						id: "groupButton",
						actions: new Press(),
						success: function () {
							this.waitFor({
								controlType: "sap.m.StandardListItem",
								matchers: new Properties({
									title: sGroupBy
								}),
								searchOpenDialogs: true,
								actions: new Press(),
								success: function () {
									this.waitFor({
										controlType: "sap.m.Button",
										matchers: new Properties({
											text: "OK"
										}),
										searchOpenDialogs: true,
										actions: new Press(),
										errorMessage: "The ok button in the grouping dialog could not be pressed"
									});
								},
								errorMessage: "Did not find the" +  sGroupBy + " element in grouping dialog"
							});
						},
						errorMessage: "Did not find the group button"
					});
				}
			},

			assertions: {

				theListHeaderDisplaysZeroHits: function () {
					return this.theHeaderShouldDisplayOrders(0);
				},

				theListHasEntries: function () {
					return this.waitFor({
						id: "list",
						matchers: new AggregationFilled({
							name: "items"
						}),
						success: function () {
							Opa5.assert.ok(true, "The master list has items");
						},
						errorMessage: "The maste list has no items"
					});
				},

				iShouldSeeTheList: function () {
					return this.waitFor({
						id: "list",
						success: function (oList) {
							Opa5.assert.ok(oList, "Found the master List");
						},
						errorMessage: "Can't find the master list."
					});
				},

				theListShowsOnlyObjectsContaining: function (sSearch) {
					this.waitFor({
						id: "list",
						matchers: new AggregationFilled({
							name: "items"
						}),
						check: function(oList) {
							var bEveryItemContainsTheTitle = oList.getItems().every(function (oItem) {
									return oItem.getAttributes()[0].getText().indexOf(sSearch) !== -1;
								});
							return bEveryItemContainsTheTitle;
						},
						success: function () {
							Opa5.assert.ok(true, "Every item in the master list contains the text " + sSearch);
						},
						errorMessage: "Not all items in the master list contain the text " + sSearch
					});
				},

				theListShouldHaveAllEntries: function () {
					var	iExpectedNumberOfItems;
					return this.waitFor({
						id: "list",
						success: function (oList) {
							var aAllEntities = this.getEntitySet("Orders");
							iExpectedNumberOfItems = Math.min(oList.getGrowingThreshold(), aAllEntities.length);
							return this.waitFor({
								id: "list",
								matchers: new AggregationLengthEquals({
									name: "items",
									length: iExpectedNumberOfItems
								}),
								success: function () {
									Opa5.assert.ok(true, "The master list displays all items up to the growing threshold");
								},
								errorMessage: "The master list does not display all items up to the growing threshold"
							});
						}.bind(this)
					});
				},

				iShouldSeeTheNoDataText: function () {
					return this.waitFor({
						id: "list",
						success: function (oList) {
							Opa5.assert.strictEqual(oList.getNoDataText(), oList.getModel("i18n").getProperty("masterListNoDataWithFilterOrSearchText"), "the list should show the no data text for search and filter");
						},
						errorMessage: "list does not show the no data text for search and filter"
					});
				},

				theHeaderShouldDisplayAllEntries: function () {
					return this.waitFor({
						id: "list",
						success: function (oList) {
							var iExpectedLength = oList.getBinding("items").getLength();
							return this.theHeaderShouldDisplayOrders(iExpectedLength);
						},
						errorMessage: "Can't find the master list"
					});
				},

				theHeaderShouldDisplayOrders: function (iOrders) {
					return this.waitFor({
						id: "masterHeaderTitle",
						matchers: new Properties({
							text: "Orders (" + iOrders + ")"
						}),
						success: function () {
							Opa5.assert.ok(true, "The master page header displays " + iOrders + " orders");
						},
						errorMessage: "The  master page header does not display " + iOrders + " orders."
					});
				},

				theListShouldHaveNoSelection: function () {
					return this.waitFor({
						id: "list",
						matchers: function(oList) {
							return !oList.getSelectedItem();
						},
						success: function (oList) {
							Opa5.assert.strictEqual(oList.getSelectedItems().length, 0, "The list selection is removed");
						},
						errorMessage: "List selection was not removed"
					});
				},

				theRememberedListItemShouldBeSelected: function () {
					this.waitFor({
						id: "list",
						matchers: function (oList) {
							return oList.getSelectedItem();
						},
						success: function (oSelectedItem) {
							Opa5.assert.strictEqual(oSelectedItem.getTitle(), "Order " + this.getContext().currentItem.title, "The list selection is incorrect");
						},
						errorMessage: "The list has no selection"
					});
				},

				theListShouldBeFilteredOnShippedOrders: function () {
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
						id: "list",
						matchers: fnCheckFilter,
						success: function() {
							Opa5.assert.ok(true, "Master list has been filtered correctly");
						},
						errorMessage: "Master list has not been filtered correctly"
					});
				},

				theListShouldContainAGroupHeader: function () {
					return this.waitFor({
						controlType: "sap.m.GroupHeaderListItem",
						success: function () {
							Opa5.assert.ok(true, "Master list is grouped");
						},
						errorMessage: "Master list is not grouped"
					});
				},

				theListShouldNotContainGroupHeaders: function () {
					function fnIsGroupHeader (oElement) {
						return oElement.getMetadata().getName() === "sap.m.GroupHeaderListItem";
					}

					return this.waitFor({
						id: "list",
						matchers: function (oList) {
							return !oList.getItems().some(fnIsGroupHeader);
						},
						success: function() {
							Opa5.assert.ok(true, "Master list does not contain a group header");
						},
						errorMessage: "Master list still contains a group header although grouping has been removed."
					});
				}
			}

		}

	});

});
