jQuery.sap.declare("sap.ui.demo.mdskeleton.test.assertion.NavigationAssertion");
jQuery.sap.require("sap.ui.test.Opa5");
var Opa5 = sap.ui.test.Opa5;

sap.ui.demo.mdskeleton.test.assertion.NavigationAssertion = Opa5.extend("sap.ui.demo.mdskeleton.test.assertion.NavigationAssertion", {
	iShouldSeeTheProductsList : function () {
		return this.waitFor({
			id : "list",
			viewName : "Master",
			success : function (oList) {
				ok(oList, "Found the product List");
			}
		});
	},

	theDetailPageShowsTheFirstProduct : function () {
		return this.waitFor({
			controlType : "sap.m.ObjectHeader",
			viewName : "Detail",
			matchers : [ new Opa5.matchers.PropertyStrictEquals({name : "title", value : "Chai"}) ],
			success : function () {
				ok(true, "was on the first detail page");
			}
		});
	},

	theProductListShouldHave9Entries : function () {
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
				strictEqual(aControls.length, 1, "found only one Objectheader with the Product name");
				ok(true, "was on the "+ sTitleName +" detail page");
			}
		});
	},

	iShouldBeOnTheAniseedSyrupDetailPage : function () {
		return this.iShouldBeOnTheDetailPage("Aniseed Syrup");
	},

	iShouldBeOnTheChaiDetailPage : function () {
		return this.iShouldBeOnTheDetailPage("Chai");
	},
	
	iShouldSeeTheOrderDetailsList : function () {
		return this.waitFor({
			id : "orderDetailsList",
			viewName : "Detail",
			success : function (oList) {
				ok(oList, "Found the order details list");
			}
		});
	},
	
	//TODO use matchers instead or ask Tobias to implement aggregation count 
	//if we are in a good mood we will do this
	//afterwards, let's also apply the new matcher to function 'theProductListShouldHave9Entries'
	theOrderDetailsListShouldHave3Entries : function () {
		return this.waitFor({
			id : "orderDetailsList",
			viewName : "Detail",
			matchers : [ new Opa5.matchers.AggregationFilled({name : "items"}) ],
			check : function (oList) {
				return oList.getItems().length === 3;
			},
			success : function (oList) {
				ok(true, "The list has 3 items");
			},
			errorMessage : "The list does not have 3 entries"
		});
	},
	
	theFirstOrderDetailHasId10285 : function () {
		return this.waitFor({
			id : "orderDetailsList",
			viewName : "Detail",
			matchers : [ new Opa5.matchers.AggregationFilled({name : "items"}) ],
			check : function (oList) {
				return oList && oList.getItems().length === 3;
			},
			success : function (oList) {
				var oFirstItem = oList.getItems()[0];
				strictEqual(oFirstItem.getBindingContext().getProperty('OrderID'), 10285, "The first OrderDetail has Id 10285");
			},
			errorMessage : "The first OrderDetail does not have Id 10285"
		});
	}
	
	
});