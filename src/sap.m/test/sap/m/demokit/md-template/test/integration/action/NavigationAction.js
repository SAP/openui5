sap.ui.define(['sap/ui/test/Opa5', 'sap/ui/test/matchers/AggregationLengthEquals', 'sap/ui/test/matchers/PropertyStrictEquals'],
	function(Opa5, AggregationLengthEquals, PropertyStrictEquals) {
	"use strict";

	return Opa5.extend("sap.ui.demo.mdtemplate.test.integration.action.NavigationAction", {
		iWaitUntilTheAppBusyIndicatorIsGone: function () {
			return this.waitFor({
				id : "idAppControl",
				viewName : "App",
				// inline-matcher directly as function
				matchers : function(oRootView) {
					// we set the view busy, so we need to query the parent of the app
					return oRootView.getParent().getBusy() === false;
				},
				success : function (oRootView) {
					ok(true, "The app is not busy busy anymore");
				},
				errorMessage : "The app is still busy."
			});
		},

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

		iChangeTheHashToObjectN : function (iObjIndex) {
			return this.waitFor({
				success : function () {
					sap.ui.test.Opa5.getWindow().location.hash = "#/object/ObjectID_" + iObjIndex;
				}
			});
		},

		iChangeTheHashToSomethingInvalid : function () {
			return this.waitFor({
				success : function () {
					sap.ui.test.Opa5.getWindow().location.hash = "#/somethingInvalid";
				}
			});
		},

		iSearchForSomethingWithNoResults : function () {
			//TODO refactoring of page objects: reuse this from 'MasterAction'
			return this.waitFor({
				id : "searchField",
				viewName: "Master",
				success : function (oSearchField) {
					oSearchField.$("I").focus().val("abc").trigger("input");
					// there is no easy way to simulate a search, we fire the event directly
					oSearchField.fireSearch({query: "abc"});
				}
			});
		},

		iPressTheBackButtonOnDetailPage : function () {
			return this.waitFor({
				id : "detailPage",
				viewName : "Detail",
				success: function (oPage) {
					oPage.$("navButton").trigger("tap");
				},
				errorMessage : "Did not find the nav button on detail page"
			});
		},

		iGoBackInBrowserHistory : function () {
			return this.waitFor({
				success : function () {
					sap.ui.test.Opa5.getWindow().history.back();
				}
			});
		},


		iGoForwardInBrowserHistory : function () {
			return this.waitFor({
				success : function () {
					sap.ui.test.Opa5.getWindow().history.forward();
				}
			});
		},

		iLookAtTheScreen : function () {
			return this;
		},

		iWaitUntilTheMasterListIsLoaded : function () {
			return this.waitFor({
				id : "list",
				viewName : "Master",
				matchers : [ new AggregationLengthEquals({name : "items", length : 10}) ],
				errorMessage : "The master list has not been loaded"
			});
		},
		
		iWaitUntilISeePage : function (sViewName, sTitleName) {
			return this.waitFor({
				controlType : "sap.m.ObjectHeader",
				viewName : sViewName,
				matchers : [ new PropertyStrictEquals({name : "title", value : sTitleName}) ],
				success : function (aControls) {
					strictEqual(aControls.length, 1, "found only one Objectheader with the object name");
					ok(true, "was on the " + sTitleName + " " + sViewName + " page");
				},
				errorMessage : "We are not on " + sTitleName
			});
		}

	});
});
