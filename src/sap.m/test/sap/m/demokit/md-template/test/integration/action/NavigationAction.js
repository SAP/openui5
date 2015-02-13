sap.ui.define(['sap/ui/test/Opa5'],
	function(Opa5) {
	"use strict";

	return Opa5.extend("sap.ui.demo.mdtemplate.test.integration.action.NavigationAction", {
		iPressAnObjectListItem : function (sViewName, sListId, sObjectTitle) {
			var oObjectListItem = null;

			return this.waitFor({
				id : sListId,
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
					ok(oList, "Pressed ObjectListItem '" + sObjectTitle + "' in list '" + sListId + "' in view '" + sViewName + "'.");
				},
				errorMessage : "List '" + sListId + "' in view '" + sViewName + "' does not contain an ObjectListItem with title '" + sObjectTitle + "'"
			});
		},

		iPressAColumnListItem : function (sViewName, sListId, sColumnItemTitle) {
			var oColumnListItem = null;

			return this.waitFor({
				id : sListId,
				viewName : sViewName,
				check : function (oList) {
					return oList.getItems().some(function (oItem) {
						if (oItem.getCells()[0].getTitle() === sColumnItemTitle) {
							oColumnListItem = oItem;
							return true;
						}
						return false;
					});
				},
				success : function (oList) {
					oColumnListItem.$().trigger("tap");
					ok(oList, "Pressed ColumnListItem '" + sColumnItemTitle + "' in list '" + sListId + "' in view '" + sViewName + "'.");
				},
				errorMessage : "List '" + sListId + "' in view '" + sViewName + "' does not contain an ColumnListItem with title '" + sColumnItemTitle + "'"
			});
		},

		iPressOnTheObject1InMasterList : function (){
			return this.iPressAnObjectListItem("Master", "list", "Object 1" );
		},

		iPressOnTheItem1InLineItemList : function (){
			return this.iPressAColumnListItem("Detail", "lineItemsList", "Line Item 1" );
		},

		iPressTheNavigationButton : function ( sName, sIcon) {
			return this.waitFor({
				controlType : "sap.m.Button",
				viewName : "LineItem",
				matchers : [ new Opa5.matchers.PropertyStrictEquals({name : "icon", value : sIcon}) ],
				success : function (aButtons) {
					aButtons[0].$().trigger("tap");
				},
				errorMessage : "'" + sName + "' button not found."
			});
		},

		iPressTheNextButton : function () {
			return this.iPressTheNavigationButton("Next", "sap-icon://down");
		},

		iPressThePreviousButton : function () {
			return this.iPressTheNavigationButton("Previous", "sap-icon://up");
		},

		iChangeTheHashToObject3 : function () {
			return this.waitFor({
				success : function () {
					sap.ui.test.Opa5.getWindow().location.hash = "#/Objects/ObjectID_3";
				}
			});
		},

		iPressTheBackButton : function () {
			return this.waitFor({
				id : "detailPage",
				viewName : "Detail",
				success: function (oPage) {
					oPage.$("navButton").trigger("tap");
				},
				errorMessage : "Did not find the nav button on detail page"
			});
		},
		
		iPressTheBackButtonOnLineItemPage : function () {
			return this.waitFor({
				id : "lineItemPage",
				viewName : "LineItem",
				success: function (oPage) {
					oPage.$("navButton").trigger("tap");
				},
				errorMessage : "Did not find the nav button on line item page"
			});
		},
		
		iGoBackInBrowserHistory : function () {
			return this.waitFor({
				success : function () {
					sap.ui.test.Opa5.getWindow().history.back();
				},
				errorMessage : "Failed to go back in browser history"
			});
		},
		
//TODO remove comments once 'sap.ui.test.Opa5.getWindow().history.forward' is fixed		
//		iGoForwardInBrowserHistory : function () {
//			return this.waitFor({
//				success : function () {
//					sap.ui.test.Opa5.getWindow().history.forward();
//				},
//				errorMessage : "Failed to go forward in browser history"
//			});
//		},

		iLookAtTheScreen : function () {
			return this;
		}
	});
});