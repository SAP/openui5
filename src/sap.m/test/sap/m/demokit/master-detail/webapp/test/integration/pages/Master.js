sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"./Common",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/Properties"
], function (Opa5, Press, Common, EnterText, AggregationLengthEquals, AggregationFilled, Properties) {
	"use strict";

	Opa5.createPageObjects({
		onTheMasterPage: {
			baseClass: Common,
			viewName: "Master",

			actions: {

				iSortTheListOnName: function () {
					return this.iChooseASorter("sortButton", "Sort By <Name>");
				},
				iSortTheListOnUnitNumber: function () {
					return this.iChooseASorter("sortButton", "Sort By <UnitNumber>");
				},

				iFilterTheListOnUnitNumber: function () {
					return this.iMakeASelection("filterButton", "<UnitNumber>", "<100 <UnitOfMeasure>");
				},

				iGroupTheList: function () {
					return this.iChooseASorter("groupButton", "<UnitNumber> Group");
				},

				iRemoveListGrouping: function () {
					return this.iChooseASorter("groupButton", "None");
				},
				iOpenViewSettingsDialog: function () {
					return this.waitFor({
						id: "filterButton",
						actions: new Press(),
						errorMessage: "Did not find the 'filter' button."
					});
				},
				iPressOKInViewSelectionDialog: function () {
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

				iPressResetInViewSelectionDialog: function () {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.Button",
						matchers: new Properties({
							text: "Reset"
						}),
						actions: new Press(),
						errorMessage: "Did not find the ViewSettingDialog's 'Reset' button."
					});
				},

				iMakeASelection: function (sSelect, sItem, sOption) {
					return this.waitFor({
						id: sSelect,
						actions: new Press(),
						success: function () {
							this.waitFor({
								controlType: "sap.m.StandardListItem",
								matchers: new Properties({
									title: sItem
								}),
								searchOpenDialogs: true,
								actions: new Press(),
								success: function () {
									this.waitFor({
										controlType: "sap.m.StandardListItem",
										matchers: new Properties({
											title: sOption
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
												errorMessage: "The ok button in the dialog was not found and could not be pressed"
											});
										},
										errorMessage: "Did not find the" +  sOption + "in" + sItem
									});
								},
								errorMessage: "Did not find the " + sItem + " element in select"
							});
						},
						errorMessage: "Did not find the " + sSelect + " select"
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

				iChooseASorter: function (sSelect, sSort) {
					return this.waitFor({
						id: sSelect,
						actions: new Press(),
						success: function () {
							this.waitFor({
								controlType: "sap.m.StandardListItem",
								matchers: new Properties({
									title: sSort
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
										errorMessage: "The ok button in the dialog was not found and could not be pressed"
									});
								},
								errorMessage: "Did not find the" +  sSort + " element in select"
							});
						},
						errorMessage: "Did not find the " + sSelect + " select"
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
					return this.waitFor({
						id: "list",
						matchers: new AggregationFilled({
							name: "items"
						}),
						success: function (oList) {
							var aEntityData = this.getEntitySet("Objects");
							var sCurrentId;
							var	aItemsNotInTheList = aEntityData.filter(function (oObject) {
								return !oList.getItems().some(function (oListItem) {
									return oListItem.getBindingContext().getProperty("ObjectID") === oObject.ObjectID;
								});
							});

							if (!aItemsNotInTheList.length) {
								// Not enough items all of them are displayed so we take the last one
								sCurrentId = aEntityData[aEntityData.length - 1].ObjectID;
							} else {
								sCurrentId = aItemsNotInTheList[0].ObjectID;
							}

							var oCurrentItem = this.getContext().currentItem;
							// Construct a binding path since the list item is not created yet and we only have the id.
							oCurrentItem.bindingPath = "/" + oList.getModel().createKey("Objects", {
								ObjectID: sCurrentId
							});
							oCurrentItem.id = sCurrentId;
						}.bind(this),
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
						errorMessage: "List 'list' in Master view does not contain an ObjectListItem at position '" + iPositon + "'"
					});
				},
				iSearchFor: function (sSearch) {
					return this.waitFor({
						id: "searchField",
						actions: [
							new EnterText({
								text: sSearch
							}),
							new Press()
						],
						errorMessage: "Could not search for value " + sSearch
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
						id: oBindingContext.getProperty("ObjectID"),
						title: oBindingContext.getProperty("Name")
					};
				}
			},

			assertions: {

				theListShouldContainAGroupHeader: function () {
					return this.waitFor({
						controlType: "sap.m.GroupHeaderListItem",
						success: function () {
							Opa5.assert.ok(true, "Master list is grouped");
						},
						errorMessage: "Master list is not grouped"
					});
				},

				theListShouldContainOnlyFormattedUnitNumbers: function () {
					var rTwoDecimalPlaces =  /^-?\d+\.\d{2}$/;
					return this.waitFor({
						controlType: "sap.m.ObjectListItem",
						success: function (aNumberControls) {
							Opa5.assert.ok(aNumberControls.every(function(oNumberControl){
									return rTwoDecimalPlaces.test(oNumberControl.getNumber());
								}),
								"Numbers in ObjectListItems numbers are properly formatted");
						},
						errorMessage: "List has no entries which can be checked for their formatting"
					});
				},

				theListHeaderDisplaysZeroHits: function () {
					return this.waitFor({
						id: "masterPageTitle",
						autoWait: false,
						matchers: new Properties({
							text: "<Objects> (0)"
						}),
						success: function () {
							Opa5.assert.ok(true, "The list header displays zero hits");
						},
						errorMessage: "The list header still has items"
					});
				},

				theListHasEntries: function () {
					return this.waitFor({
						id: "list",
						matchers: new AggregationFilled({
							name: "items"
						}),
						success: function () {
							Opa5.assert.ok(true, "The list has items");
						},
						errorMessage: "The list had no items"
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
							Opa5.assert.ok(true, "Master list does not contain a group header although grouping has been removed.");
						},
						errorMessage: "Master list still contains a group header although grouping has been removed."
					});
				},

				theListShouldBeFilteredOnUnitNumber: function () {
					return this.theListShouldBeFilteredOnFieldUsingComparator("UnitNumber", 100);
				},


				theListShouldBeSortedAscendingOnUnitNumber: function () {
					return this.theListShouldBeSortedAscendingOnField("UnitNumber");
				},

				theListShouldBeSortedAscendingOnName: function () {
					return this.theListShouldBeSortedAscendingOnField("Name");
				},

				theListShouldBeFilteredOnFieldUsingComparator: function (sField, iComparator) {
					function fnCheckFilter(oList){
						var fnIsFiltered = function (oElement) {
							if (!oElement.getBindingContext()) {
								return false;
							} else {
								var iValue = oElement.getBindingContext().getProperty(sField);
								if (iValue > iComparator) {
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
							Opa5.assert.ok(true, "Master list has been filtered correctly for field '" + sField + "'.");
						},
						errorMessage: "Master list has not been filtered correctly for field '" + sField + "'."
					});
				},
				iShouldSeeTheList: function () {
					return this.waitFor({
						id: "list",
						success: function (oList) {
							Opa5.assert.ok(oList, "Found the object List");
						},
						errorMessage: "Can't see the master list."
					});
				},

				theListShowsOnlyObjectsContaining: function (sTitle) {
					this.waitFor({
						id: "list",
						matchers: new AggregationFilled({
							name: "items"
						}),
						check: function(oList) {
							var bEveryItemContainsTheTitle = oList.getItems().every(function (oItem) {
									return oItem.getTitle().indexOf(sTitle) !== -1;
								});
							return bEveryItemContainsTheTitle;
						},
						success: function () {
							Opa5.assert.ok(true, "Every item did contain the title " + sTitle);
						},
						errorMessage: "The list had items with title different than " + sTitle
					});
				},
				theListShouldHaveAllEntries: function () {
					var iExpectedNumberOfItems;
					return this.waitFor({
						id: "list",
						matchers: function (oList) {
							var aAllEntities = this.getEntitySet("Objects");
							// If there are less items in the list than the growingThreshold, only check for this number.
							iExpectedNumberOfItems = Math.min(oList.getGrowingThreshold(), aAllEntities.length);
							return new AggregationLengthEquals({name: "items", length: iExpectedNumberOfItems}).isMatching(oList);
						}.bind(this),
						success: function (oList) {
							Opa5.assert.strictEqual(oList.getItems().length, iExpectedNumberOfItems, "The growing list displays all items");
						},
						errorMessage: "List does not display all entries."
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
							this.waitFor({
								id: "masterPageTitle",
								matchers: new Properties({
									text: "<Objects> (" + iExpectedLength + ")"
								}),
								success: function () {
									Opa5.assert.ok(true, "The master page header displays " + iExpectedLength + " items");
								},
								errorMessage: "The  master page header does not display " + iExpectedLength + " items."
							});
						},
						errorMessage: "Header does not display the number of items in the list"
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
							Opa5.assert.strictEqual(oSelectedItem.getTitle(), this.getContext().currentItem.title, "The list selection is incorrect.\nHint: If the master list shows integer numbers, use toString function to convert the second parameter to string");
						},
						errorMessage: "The list has no selection"
					});
				},
				theListShouldBeSortedAscendingOnField: function (sField) {
					function fnCheckSort (oList){
						var oLastValue = null,
							fnSortByField = function (oElement) {
								if (!oElement.getBindingContext()) {
									return false;
								}

								var oCurrentValue = oElement.getBindingContext().getProperty(sField);

								if (oCurrentValue === undefined) {
									return false;
								}

								if (!oLastValue || oCurrentValue >= oLastValue){
									oLastValue = oCurrentValue;
								} else {
									return false;
								}
								return true;
							};

						return oList.getItems().every(fnSortByField);
					}

					return this.waitFor({
						id: "list",
						matchers: fnCheckSort,
						success: function() {
							Opa5.assert.ok(true, "Master list has been sorted correctly for field '" + sField + "'.");
						},
						errorMessage: "Master list has not been sorted correctly for field '" + sField + "'."
					});
				}
			}
		}
	});
});
