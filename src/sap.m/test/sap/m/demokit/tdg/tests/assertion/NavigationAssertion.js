jQuery.sap.declare("sap.ui.demo.tdg.test.assertion.NavigationAssertion");
jQuery.sap.require("sap.ui.demo.tdg.test.assertion.CommonAssertion");

sap.ui.demo.tdg.test.assertion.NavigationAssertion = sap.ui.demo.tdg.test.assertion.CommonAssertion.extend("sap.ui.demo.tdg.test.assertion.NavigationAssertion", {
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