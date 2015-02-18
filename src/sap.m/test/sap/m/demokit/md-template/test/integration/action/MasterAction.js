sap.ui.define(['sap/ui/test/Opa5'],
	function(Opa5) {
	"use strict";

	return Opa5.extend("sap.ui.demo.mdtemplate.test.integration.action.MasterAction", {
		
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
				viewName : "Master",
				success : function (oButton) {
					oButton.$().trigger("tap");
				},
				errorMessage : "Did not find the 'filter' button."
			})
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
			})
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
			})
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
			})
		},
		
		iPressItemInSelectInFooter : function (sSelect, sItem) {
			return this.waitFor({
				id : sSelect,
				viewName : "Master",
				success : function (oSelect) {
					oSelect.open();
					this.waitFor({
						id : sItem,
						viewName : "Master",
						success : function(oElem){
							oElem.$().trigger("tap");
						},
						errorMessage : "Did not find the " + sItem + " element in select"
					})
				},
				errorMessage : "Did not find the " + sSelect + " select"
			})
		},
		
		iPressAnObjectListItem : function (sObjectTitle) {
			var oObjectListItem = null;

			return this.waitFor({
				id : 'list',
				viewName : 'Master',
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
				},
				errorMessage : "List '" + sListId + "' in view '" + sViewName + "' does not contain an ObjectListItem with title '" + sObjectTitle + "'"
			});
		},
		
		iSearchForValue : function (oSearchParams) {
			return this.waitFor({
				id : 'searchField',
				viewName : 'Master',
				success : function (oSearchField) {
					if( oSearchParams.sSearchValue != null ) {
						oSearchField.setValue(oSearchParams.sSearchValue);
					}
					
					if( oSearchParams.bTriggerSearch ) {
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
			return this.iSearchForValue({sSearchValue: 'Object 2', bTriggerSearch: true});
		},
		
		iClearTheSearch : function () {
			return this.iSearchForValue({sSearchValue: '', bTriggerSearch: true});
		},
		
		iSearchForObject3 : function () {
			return this.iSearchForValue({sSearchValue: 'Object 3', bTriggerSearch: true});
		},
		
		iEnterObject3InTheSearchField : function () {
			return this.iSearchForValue({sSearchValue: 'Object 2'});
		},
		
		iTriggerRefresh : function (sSearchValue) {
			return this.iSearchForValue({bTriggerSearch: true, bRefreshButtonPressed: true});
		},
		
		iLookAtTheScreen : function () {
			return this;
		}
	
		
	});
});
		