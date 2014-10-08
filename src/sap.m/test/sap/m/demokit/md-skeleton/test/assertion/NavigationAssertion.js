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
			matchers : [ new Opa5.matchers.PropertyStrictEquals({name : "title", value : "Bread"}) ],
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

	iShouldBeOnTheVintSodaDetailPage : function () {
		return this.iShouldBeOnTheDetailPage("Vint soda");
	},

	iShouldBeOnTheMilkDetailPage : function () {
		return this.iShouldBeOnTheDetailPage("Milk");
	}
});