jQuery.sap.declare("sap.ui.demo.tdg.test.assertion.FilterAssertion");
jQuery.sap.require("sap.ui.demo.tdg.test.assertion.CommonAssertion");

sap.ui.demo.tdg.test.assertion.FilterAssertion = sap.ui.demo.tdg.test.assertion.CommonAssertion.extend("sap.ui.demo.tdg.test.assertion.FilterAssertion", {
	iShouldSeeAListWithBreadOnly : function () {
		return this.waitFor({
			id : "list",
			viewName : "Master",
			matchers : [ new Opa5.matchers.AggregationFilled({name : "items"}) ],
			check : function (oList) {
				return oList && oList.getItems().length === 1;
			},
			success : function (oList) {
				strictEqual(oList.getItems()[0].getTitle(), "Bread", "The list has bread as item");
			},
			error : function (oList) {
				if(!oList) {
					ok(false, "did not find the list");
				} else {
					strictEqual(oList.getItems().length, 1, "The list has 1 item");
				}
			}
		});
	}
});