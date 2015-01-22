sap.ui.define(['sap/ui/test/Opa5', 'sap/ui/test/matchers/AggregationLengthEquals'],
	function(Opa5, AggregationLengthEquals) {
	"use strict";

	return Opa5.extend("sap.ui.demo.mdskeleton.test.opa.assertion.NavigationAssertion", {
		iShouldSeeTheObjectList : function () {
			return this.waitFor({
				id : "list",
				viewName : "Master",
				success : function (oList) {
					ok(oList, "Found the object List");
				}
			});
		},

		theObjectPageShowsTheFirstObject : function () {
			return this.waitFor({
				controlType : "sap.m.ObjectHeader",
				viewName : "Detail",
				matchers : [ new Opa5.matchers.PropertyStrictEquals({name : "title", value : "Object 1"}) ],
				success : function () {
					ok(true, "was on the first object page");
				}
			});
		},

		theObjectListShouldHave9Entries : function () {
			return this.waitFor({
				id : "list",
				viewName : "Master",
				matchers : [ new AggregationLengthEquals({name : "items", length : 9}) ],
				success : function (oList) {
					strictEqual(oList.getItems().length, 9, "The list has 9 items");
				},
				errorMessage : "List does not have 9 entries."
			});
		},

		iShouldBeOnTheObjectPage : function (sTitleName) {
			return this.waitFor({
				controlType : "sap.m.ObjectHeader",
				viewName : "Detail",
				matchers : [ new Opa5.matchers.PropertyStrictEquals({name : "title", value : sTitleName}) ],
				success : function (aControls) {
					strictEqual(aControls.length, 1, "found only one Objectheader with the object name");
					ok(true, "was on the "+ sTitleName +" detail page");
				}
			});
		},

		iShouldBeOnTheObject3Page : function () {
			return this.iShouldBeOnTheObjectPage("Object 3");
		},

		iShouldBeOnTheObject1Page : function () {
			return this.iShouldBeOnTheObjectPage("Object 1");
		},
		
		iShouldSeeTheObjectLineItemsList : function () {
			return this.waitFor({
				id : "lineItemsList",
				viewName : "Detail",
				success : function (oList) {
					ok(oList, "Found the line items list.");
				}
			});
		},
		
		theLineItemsListShouldHave4Entries : function () {
			return this.waitFor({
				id : "lineItemsList",
				viewName : "Detail",
				matchers : [ new AggregationLengthEquals({name : "items", length : 4}) ],
				success : function (oList) {
					ok(true, "The list has 4 items");
				},
				errorMessage : "The list does not have 4 items."
			});
		},
		
		theFirstLineItemHasIDLineItemID_1 : function () {
			return this.waitFor({
				id : "lineItemsList",
				viewName : "Detail",
				matchers : [ new AggregationLengthEquals({name : "items", length : 4}) ],
				success : function (oList) {
					var oFirstItem = oList.getItems()[0];
					strictEqual(oFirstItem.getBindingContext().getProperty('LineItemID'), "LineItemID_1", "The first line item has Id 'LineItemID_1'");
				},
				errorMessage : "The first line item does not have Id 'LineItemID_1'."
			});
		},
		
		theObject3ShouldBeSelectedInTheMasterList : function() {
			return this.waitFor({
				id : "list",
				viewName : "Master",
				matchers : [ new AggregationLengthEquals({name : "items", length : 9}) ],
				success : function (oList) {
					strictEqual(oList.getSelectedItem().getTitle(), "Object 3", "Object 3 is selected");
				},
				errorMessage : "Object 3 is not selected."
			});
		}
	});
}, /* bExport= */ true);