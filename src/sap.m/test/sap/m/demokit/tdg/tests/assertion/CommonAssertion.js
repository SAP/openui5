jQuery.sap.declare("sap.ui.demo.tdg.test.assertion.CommonAssertion");
jQuery.sap.require("sap.ui.test.Opa5");
var Opa5 = sap.ui.test.Opa5;

sap.ui.demo.tdg.test.assertion.CommonAssertion = Opa5.extend("sap.ui.demo.tdg.test.assertion.CommonAssertion", {
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
			errorMessage : "The list did not have 9 items"
		});
	}
});