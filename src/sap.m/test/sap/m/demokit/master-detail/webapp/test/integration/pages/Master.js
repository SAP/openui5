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

				iSortTheListOnName : function () {
					return this.iChooseASorter("sortButton", "Sort By <Name>");
				},
				iSortTheListOnUnitNumber : function () {
					return this.iChooseASorter("sortButton", "Sort By <UnitNumber>");
				},

				iFilterTheListOnUnitNumber : function () {
					return this.iMakeASelection("filterButton", "<UnitNumber>", "<100 <UnitOfMeasure>");
				},

				iGroupTheList : function () {
					return this.iChooseASorter("groupButton", "<UnitNumber> Group");
				},

				iRemoveListGrouping : function () {
					return this.iChooseASorter("groupButton", "None");
				},
				iOpenViewSettingsDialog : function () {
					return this.waitFor({
						id : "filterButton",
						viewName : sViewName,
						actions : new Press(),
						errorMessage : "Did not find the 'filter' button."
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

				iPressResetInViewSelectionDialog : function () {
					return this.waitFor({
						searchOpenDialogs : true,
						controlType : "sap.m.Button",
						matchers : new Opa5.matchers.PropertyStrictEquals({name : "icon", value : "sap-icon://clear-filter"}),
						actions : new Press(),
						errorMessage : "Did not find the ViewSettingDialog's 'Reset' button."
					});
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
						entitySet : "Objects",
						success : function (aEntityData) {
							this.waitFor({
								id : "list",
								viewName : sViewName,
								matchers : new AggregationFilled({name: "items"}),
								success : function (oList) {
									var sCurrentId,
										aItemsNotInTheList = aEntityData.filter(function (oObject) {
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
										ObjectID : sCurrentId
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
				iSearchForTheFirstObject : function (){
					var sFirstObjectTitle;
					return this.waitFor({
						id : "list",
						viewName : sViewName,
						matchers: new AggregationFilled({name : "items"}),
						success : function (oList) {
							sFirstObjectTitle = oList.getItems()[0].getTitle();
							return this.iSearchForValue(new EnterText({text: sFirstObjectTitle}), new Press());
						},
						errorMessage : "Did not find list items while trying to search for the first item."
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
						id: oBindingContext.getProperty("ObjectID"),
						title: oBindingContext.getProperty("Name")
					};
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

				theListShouldContainOnlyFormattedUnitNumbers : function () {
					var rTwoDecimalPlaces =  /^-?\d+\.\d{2}$/;
					return this.waitFor({
						controlType : "sap.m.ObjectListItem",
						viewName : sViewName,
						success : function (aNumberControls) {
							Opa5.assert.ok(aNumberControls.every(function(oNumberControl){
									return rTwoDecimalPlaces.test(oNumberControl.getNumber());
								}),
								"Numbers in ObjectListItems numbers are properly formatted");
						},
						errorMessage : "List has no entries which can be checked for their formatting"
					});
				},

				theListHeaderDisplaysZeroHits : function () {
					return this.waitFor({
						viewName : sViewName,
						id: "masterPageTitle",
						autoWait: false,
						matchers: new PropertyStrictEquals({name : "text", value : "<Objects> (0)"}),
						success: function () {
							Opa5.assert.ok(true, "The list header displays zero hits");
						},
						errorMessage: "The list header still has items"
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
							Opa5.assert.ok(true, "Master list does not contain a group header although grouping has been removed.");
						},
						errorMessage : "Master list still contains a group header although grouping has been removed."
					});
				},

				theListShouldBeFilteredOnUnitNumber : function () {
					return this.theListShouldBeFilteredOnFieldUsingComparator("UnitNumber", 100);
				},


				theListShouldBeSortedAscendingOnUnitNumber : function () {
					return this.theListShouldBeSortedAscendingOnField("UnitNumber");
				},

				theListShouldBeSortedAscendingOnName : function () {
					return this.theListShouldBeSortedAscendingOnField("Name");
				},

				theListShouldBeFilteredOnFieldUsingComparator : function (sField, iComparator) {
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
						viewName : sViewName,
						id : "list",
						matchers : fnCheckFilter,
						success : function() {
							Opa5.assert.ok(true, "Master list has been filtered correctly for field '" + sField + "'.");
						},
						errorMessage : "Master list has not been filtered correctly for field '" + sField + "'."
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

				theListShowsOnlyObjectsWithTheSearchStringInTheirTitle : function () {
					this.waitFor({
						id : "list",
						viewName : sViewName,
						matchers : new AggregationFilled({name : "items"}),
						check : function(oList) {
							var sTitle = oList.getItems()[0].getTitle(),
								bEveryItemContainsTheTitle = oList.getItems().every(function (oItem) {
									return oItem.getTitle().indexOf(sTitle) !== -1;
								});
							return bEveryItemContainsTheTitle;
						},
						success : function (oList) {
							Opa5.assert.ok(true, "Every item did contain the title");
						},
						errorMessage : "The list did not have items"
					});
				},
				theListShouldHaveAllEntries : function () {
					var aAllEntities,
						iExpectedNumberOfItems;
					// retrieve all Objects to be able to check for the total amount
					this.waitFor(this.createAWaitForAnEntitySet({
						entitySet : "Objects",
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
								id : "masterPageTitle",
								viewName : sViewName,
								matchers : new PropertyStrictEquals({name : "text", value : "<Objects> (" + iExpectedLength + ")"}),
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
							Opa5.assert.strictEqual(oSelectedItem.getTitle(), this.getContext().currentItem.title, "The list selection is incorrect");
						},
						errorMessage : "The list has no selection"
					});
				},
				theListShouldBeSortedAscendingOnField : function (sField) {
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
						viewName : sViewName,
						id : "list",
						matchers : fnCheckSort,
						success : function() {
							Opa5.assert.ok(true, "Master list has been sorted correctly for field '" + sField + "'.");
						},
						errorMessage : "Master list has not been sorted correctly for field '" + sField + "'."
					});
				}
			}
		}
	});
});