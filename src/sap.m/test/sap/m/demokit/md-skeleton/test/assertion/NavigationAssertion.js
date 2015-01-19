jQuery.sap.declare("sap.ui.demo.mdskeleton.test.assertion.NavigationAssertion");
jQuery.sap.require("sap.ui.test.Opa5");
var Opa5 = sap.ui.test.Opa5;

sap.ui.demo.mdskeleton.test.assertion.NavigationAssertion = Opa5.extend("sap.ui.demo.mdskeleton.test.assertion.NavigationAssertion", {
	iShouldSeeTheObjectList : function () {
		return this.waitFor({
			id : "list",
			viewName : "Master",
			success : function (oList) {
				ok(oList, "Found the object List");
			}
		});
	},

	theDetailPageShowsTheFirstObject : function () {
		return this.waitFor({
			controlType : "sap.m.ObjectHeader",
			viewName : "Detail",
			matchers : [ new Opa5.matchers.PropertyStrictEquals({name : "title", value : "Object 1"}) ],
			success : function () {
				ok(true, "was on the first detail page");
			}
		});
	},

	theObjectListShouldHave9Entries : function () {
		return this.waitFor({
			id : "list",
			viewName : "Master",
			matchers : [ new Opa5.matchers.AggregationFilled({name : "items"}) ],
			check : function (oList) {
				return oList && oList.getItems().length === 9;
			},
			success : function (oList) {
				strictEqual(oList.getItems().length, 9, "The list has 9 items");
			},
			error : function (oList) {
				if(!oList) {
					ok(false, "did not find the list");
				} else {
					strictEqual(oList.getItems().length, 9, "The list has 9 items");
				}
			}
		});
	},

	iShouldBeOnTheDetailPage : function (sTitleName) {
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
		return this.iShouldBeOnTheDetailPage("Object 3");
	},

	iShouldBeOnTheObject1Page : function () {
		return this.iShouldBeOnTheDetailPage("Object 1");
	},
	
	iShouldSeeTheObjectLineItemsList : function () {
		return this.waitFor({
			id : "lineItemsList",
			viewName : "Detail",
			success : function (oList) {
				ok(oList, "Found the line items list");
			}
		});
	},
	
	//TODO use matchers instead or ask Tobias to implement aggregation count 
	//if we are in a good mood we will do this
	//afterwards, let's also apply the new matcher to function 'theProductListShouldHave9Entries'
	theLineItemsListShouldHave4Entries : function () {
		return this.waitFor({
			id : "lineItemsList",
			viewName : "Detail",
			matchers : [ new Opa5.matchers.AggregationFilled({name : "items"}) ],
			check : function (oList) {
				return oList.getItems().length === 4;
			},
			success : function (oList) {
				ok(true, "The list has 4 items");
			},
			errorMessage : "The list does not have 4 items"
		});
	},
	
	theFirstLineItemHasIDLineItemID_1 : function () {
		return this.waitFor({
			id : "lineItemsList",
			viewName : "Detail",
			matchers : [ new Opa5.matchers.AggregationFilled({name : "items"}) ],
			check : function (oList) {
				return oList && oList.getItems().length === 4;
			},
			success : function (oList) {
				var oFirstItem = oList.getItems()[0];
				strictEqual(oFirstItem.getBindingContext().getProperty('LineItemID'), "LineItemID_1", "The first line item has Id 'LineItemID_1'");
			},
			errorMessage : "The first line item does not have Id 'LineItemID_1'"
		});
	},
	
	theObject3ShouldBeSelectedInTheMasterList : function() {
		return this.waitFor({
			id : "list",
			viewName : "Master",
			matchers : [ new Opa5.matchers.AggregationFilled({name : "items"}) ],
			check : function (oList) {
				return oList && oList.getItems().length === 9 && oList.getSelectedItem().getTitle() == "Object 3";
			},
			success : function (oList) {
				strictEqual(oList.getSelectedItem().getTitle(), "Object 3", "Object 3 is selected");
			},
			error : function (oList) {
				if(!oList) {
					ok(false, "did not find the list");
				} else {
					strictEqual(oList.getItems().length, 9, "The list has 9 items");
				}
			}
		});
	}
	
	
});