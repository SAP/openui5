sap.ui.require([
		"sap/ui/test/Opa5",
		"sap/ui/demo/masterdetail/test/integration/pages/Common",
		"sap/ui/test/matchers/AggregationLengthEquals",
		"sap/ui/test/matchers/PropertyStrictEquals"
	],
	function(Opa5, Common, AggregationLengthEquals, PropertyStrictEquals) {
		"use strict";

		var sViewName = "Master";

		Opa5.createPageObjects({
			onTheMasterPage: {
				baseClass: Common,
				actions: {
					iWaitUntilTheListIsLoaded : function () {
						return this.waitFor({
							id : "list",
							viewName : sViewName,
							matchers : [ new AggregationLengthEquals({name : "items", length : 10}) ],
							errorMessage : "The master list has not been loaded"
						});
					},

					iSortTheListOnName : function () {
						return this.iPressItemInSelectInFooter("sortSelect", "masterSort1");
					},

					iSortTheListOnUnitNumber : function () {
						return this.iPressItemInSelectInFooter("sortSelect", "masterSort2");
					},

					iRemoveFilterFromTheList : function () {
						return this.iPressItemInSelectInFooter("filterSelect", "masterFilterNone");
					},

					iFilterTheListLessThan100UoM : function () {
						return this.iPressItemInSelectInFooter("filterSelect", "masterFilter1");
					},

					iFilterTheListMoreThan100UoM : function () {
						return this.iPressItemInSelectInFooter("filterSelect", "masterFilter2");
					},

					iGroupTheList : function () {
						return this.iPressItemInSelectInFooter("groupSelect", "masterGroup1");
					},

					iRemoveListGrouping : function () {
						return this.iPressItemInSelectInFooter("groupSelect", "masterGroupNone");
					},

					iOpenViewSettingsDialog : function () {
						return this.waitFor({
							id : "filter",
							viewName : sViewName,
							success : function (oButton) {
								oButton.$().trigger("tap");
							},
							errorMessage : "Did not find the 'filter' button."
						});
					},

					iSelectListItemInViewSettingsDialog : function (sListItemTitle) {
						return this.waitFor({
							searchOpenDialogs : true,
							controlType : "sap.m.StandardListItem",
							matchers :  [ new Opa5.matchers.PropertyStrictEquals({name : "title", value : sListItemTitle}) ],

							success : function (aListItems) {
								aListItems[0].$().trigger("tap");
							},
							errorMessage : "Did not find list item with title " + sListItemTitle + " in View Settings Dialog."
						});
					},

					iPressOKInViewSelectionDialog : function () {
						return this.waitFor({
							searchOpenDialogs : true,
							controlType : "sap.m.Button",
							matchers :  [ new Opa5.matchers.PropertyStrictEquals({name : "text", value : "OK"}) ],

							success : function (aButtons) {
								aButtons[0].$().trigger("tap");
							},
							errorMessage : "Did not find the ViewSettingDialog's 'OK' button."
						});
					},

					iPressResetInViewSelectionDialog : function () {
						return this.waitFor({
							searchOpenDialogs : true,
							controlType : "sap.m.Button",
							matchers : [ new Opa5.matchers.PropertyStrictEquals({name : "icon", value : "sap-icon://refresh"}) ],

							success : function (aButtons) {
								aButtons[0].$().trigger("tap");
							},
							errorMessage : "Did not find the ViewSettingDialog's 'Reset' button."
						});
					},

					iPressItemInSelectInFooter : function (sSelect, sItem) {
						return this.waitFor({
							id : sSelect,
							viewName : sViewName,
							success : function (oSelect) {
								oSelect.open();
								this.waitFor({
									id : sItem,
									viewName : sViewName,
									success : function(oElem){
										oElem.$().trigger("tap");
									},
									errorMessage : "Did not find the " + sItem + " element in select"
								});
							}.bind(this),
							errorMessage : "Did not find the " + sSelect + " select"
						});
					},

					iPressAnObjectListItem : function (sObjectTitle) {
						var oObjectListItem = null;

						return this.waitFor({
							id : "list",
							viewName : sViewName,
							check : function (oList) {
								return oList.getItems().some(function (oItem) {
									if (oItem.getTitle() === sObjectTitle) {
										oObjectListItem = oItem;

										return true;
									}
									return false;
								});
							},
							success : function (oList) {
								oObjectListItem.$().trigger("tap");
								QUnit.ok(oList, "Pressed ObjectListItem '" + sObjectTitle + "' in list 'list' in view '" + sViewName + "'.");
							},
							errorMessage : "List 'list' in view '" + sViewName + "' does not contain an ObjectListItem with title '" + sObjectTitle + "'"
						});
					},

					iPressOnTheObject1InList : function (){
						return this.iPressAnObjectListItem("Object 1" );
					},

					iSearchForValue : function (oSearchParams) {
						return this.waitFor({
							id : "searchField",
							viewName : sViewName,
							success : function (oSearchField) {
								if ( oSearchParams.sSearchValue != null ) {
									oSearchField.setValue(oSearchParams.sSearchValue);
								}

								if ( oSearchParams.bTriggerSearch ) {
									var oEvent = jQuery.Event("touchend");
									oEvent.originalEvent = {query: oSearchParams.sSearchValue, refreshButtonPressed: oSearchParams.bRefreshButtonPressed, id: oSearchField.getId()};
									oEvent.target = oSearchField;
									oEvent.srcElement = oSearchField;
									jQuery.extend(oEvent, oEvent.originalEvent);

									oSearchField.fireSearch(oEvent);
								}
							},
							errorMessage : "Failed to find search field in Master view.'"
						});
					},

					iSearchForObject2 : function () {
						return this.iSearchForValue({sSearchValue: "Object 2", bTriggerSearch: true});
					},

					iClearTheSearch : function () {
						return this.iSearchForValue({sSearchValue: "", bTriggerSearch: true});
					},

					iSearchForObject3 : function () {
						return this.iSearchForValue({sSearchValue: "Object 3", bTriggerSearch: true});
					},

					iEnterObject3InTheSearchField : function () {
						return this.iSearchForValue({sSearchValue: "Object 2"});
					},

					iSearchForSomethingWithNoResults : function () {
						return this.iSearchForValue({ sSearchValue: "abc", bTriggerSearch: true });
					},

					iTriggerRefresh : function () {
						return this.iSearchForValue({bTriggerSearch: true, bRefreshButtonPressed: true});
					}
				},
				assertions: {
					iShouldSeeTheBusyIndicator: function () {
						return this.waitFor({
							id : "page",
							viewName : sViewName,
							success : function (oPage) {
								// we set the view busy, so we need to query the parent of the app
								QUnit.ok(oPage.getParent().getBusy(), "The master view is busy");
							},
							errorMessage : "The master view is not busy."
						});
					},

					theListShouldContainGroup20OrLess : function () {
						return this.theListShouldBeGroupedBy("Unit Number 20 or less");
					},

					theListShouldContainGroup20OrMore : function () {
						return this.theListShouldBeGroupedBy("Unit Number higher than 20");
					},

					theListGroupShouldBeFilteredOnUnitNumberValue20OrLess : function () {
						return this.theListShouldBeFilteredOnUnitNumberValue(20, false, {iLow: 1, iHigh: 2});
					},

/*					theMasterListGroupShouldBeFilteredOnUnitNumberValue20OrMore : function () {
						return this.theMasterListShouldBeFilteredOnUnitNumberValue(20, true, {iLow: 3, iHigh: 11});
					},*/

					theListShouldBeGroupedBy : function (sGroupName) {
						return this.waitFor({
							controlType : "sap.m.GroupHeaderListItem",
							viewName : sViewName,
							matchers : [ new PropertyStrictEquals({name : "title", value : sGroupName}) ],
							success : function () {
								QUnit.ok(true, "Master list is grouped by " + sGroupName + "'");
							},
							errorMessage: "Master list is not grouped by " + sGroupName + "'"
						});
					},

					theListShouldNotContainGroupHeaders : function () {
						function fnContainsGroupHeader (oList){
							var fnIsGroupHeader = function (oElement) {
								return oElement.getMetadata().getName() === "sap.m.GroupHeaderListItem";
							};
							return !oList.getItems().some(fnIsGroupHeader);
						}

						return this.waitFor({
							viewName : sViewName,
							id : "list",
							matchers : [fnContainsGroupHeader],
							success : function() {
								QUnit.ok(true, "Master list does not contain a group header although grouping has been removed.");
							},
							errorMessage : "Master list still contains a group header although grouping has been removed."
						});
					},

					theListShouldBeSortedAscendingOnUnitNumber : function () {
						return this.theListShouldBeSortedAscendingOnField("UnitNumber");
					},

					theListShouldBeSortedAscendingOnName : function () {
						return this.theListShouldBeSortedAscendingOnField("Name");
					},

					theListShouldBeSortedAscendingOnField : function (sField) {
						function fnCheckSort (oList){
							var oLastValue = null,
								fnIsOrdered = function (oElement) {
									var oCurrentValue = oElement.getBindingContext().getProperty(sField);
									if (!oLastValue || oCurrentValue >= oLastValue){
										oLastValue = oCurrentValue;
									} else {
										return false;
									}
									return true;
								};

							return oList.getItems().every(fnIsOrdered);
						}

						return this.waitFor({
							viewName : sViewName,
							id : "list",
							matchers : [fnCheckSort],
							success : function() {
								QUnit.ok(true, "Master list has been sorted correctly for field '" + sField + "'.");
							},
							errorMessage : "Master list has not been sorted correctly for field '" + sField + "'."
						});
					},

					theListShouldBeFilteredOnUnitNumberValue : function(iThreshhold, bGreaterThan, oRange) {

						function fnCheckFilter (oList){
							var fnIsGreaterThanMaxValue = function (oElement) {
								if (bGreaterThan) {
									return oElement.getBindingContext().getProperty("UnitNumber") < iThreshhold;
								}
								return oElement.getBindingContext().getProperty("UnitNumber") > iThreshhold;
							};
							var aItems = oList.getItems();
							if (oRange) {
								aItems = aItems.slice(oRange.iLow, oRange.iHigh);
							}

							return !aItems.some(fnIsGreaterThanMaxValue);
						}

						return this.waitFor({
							id : "list",
							viewName : sViewName,
							matchers : [fnCheckFilter],
							success : function(){
								QUnit.ok(true, "Master list has been filtered correctly with filter value '" + iThreshhold + "'.");
							},
							errorMessage : "Master list has not been filtered correctly with filter value '" + iThreshhold + "'."
						});
					},

					theMasterListShouldBeFilteredOnUnitNumberValueMoreThan100 : function(){
						return this.theListShouldBeFilteredOnUnitNumberValue(100, true);
					},

					theMasterListShouldBeFilteredOnUnitNumberValueLessThan100 : function(){
						return this.theListShouldBeFilteredOnUnitNumberValue(100);
					},

					iShouldSeeTheList : function () {
						return this.waitFor({
							id : "list",
							viewName : sViewName,
							success : function (oList) {
								QUnit.ok(oList, "Found the object List");
							},
							errorMessage : "Can't see the master list."
						});
					},

					theListShowsObject2 : function () {
						return this.waitFor({
							controlType : "sap.m.ObjectListItem",
							viewName : sViewName,
							matchers : [ new PropertyStrictEquals({name : "title", value : "Object 2"}) ],
							success : function () {
								QUnit.ok(true, "Object 2 is showing");
							},
							errorMessage : "Can't see Object 2 in master list."
						});
					},

					theListShouldHaveNEntries : function (iObjIndex) {
						return this.waitFor({
							id : "list",
							viewName : sViewName,
							matchers : [ new AggregationLengthEquals({name : "items", length : iObjIndex}) ],
							success : function (oList) {
								QUnit.strictEqual(oList.getItems().length, iObjIndex, "The list has x items");
							},
							errorMessage : "List does not have " + iObjIndex + " entries."
						});
					},

					theListShouldHaveAllEntries : function () {
						return this.waitFor({
							id : "list",
							viewName : sViewName,
							matchers : function (oList) {
								var iThreshold = oList.getGrowingThreshold();
								return new AggregationLengthEquals({name : "items", length : iThreshold}).isMatching(oList);
							},
							success : function (oList) {
								QUnit.strictEqual(oList.getItems().length, oList.getGrowingThreshold(), "The growing list has 10 items");
							},
							errorMessage : "List does not have all entries."
						});
					},

					iShouldSeeTheNoDataTextForNoSearchResults : function () {
						return this.waitFor({
							id : "list",
							viewName : sViewName,
							success: function (oList) {
								QUnit.strictEqual(oList.getNoDataText(), oList.getModel("i18n").getProperty("masterListNoDataWithFilterOrSearchText"), "the list should show the no data text for search and filter");
							},
							errorMessage: "list does not show the no data text for search and filter"
						});
					},

					theHeaderShouldDisplay20Entries : function () {
						return this.waitFor({
							id : "page",
							viewName : sViewName,
							matchers : [ new PropertyStrictEquals({name : "title", value : "Objects (20)"}) ],
							success : function () {
								QUnit.ok(true, "The master page header displays 20 items");
							},
							errorMessage : "The  master page header does not display 20 items."
						});
					},

					theObjectNShouldBeSelectedInTheList : function(iObjIndex) {
						return this.waitFor({
							id : "list",
							viewName : sViewName,
							matchers : [ new AggregationLengthEquals({name : "items", length : 10}) ],
							success : function (oList) {
								QUnit.strictEqual(oList.getSelectedItem().getTitle(), "Object " + iObjIndex, "Object " + iObjIndex + " is selected");
							},
							errorMessage : "Object " + iObjIndex + " is not selected."
						});
					},

					theListShouldHaveNoSelection : function () {
						return this.waitFor({
							id : "list",
							viewName : sViewName,
							success: function (oList) {
								QUnit.strictEqual(oList.getSelectedItems().length, 0, "the list selection is removed");
							},
							errorMessage: "list selection was not removed"
						});
					}
				}
			}
		});
	});
