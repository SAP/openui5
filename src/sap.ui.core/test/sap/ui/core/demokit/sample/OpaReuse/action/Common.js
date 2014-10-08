jQuery.sap.declare("myApp.test.action.Common");
jQuery.sap.require("sap.ui.test.Opa5");

myApp.test.action.Common = sap.ui.test.Opa5.extend("myApp.test.action.Common", {

	iPressOnGoToOverview : function () {
		return this.waitFor({
			id : "navToOverview",
			success : function (oNavToOverviewButton) {
				oNavToOverviewButton.$().trigger("tap");
			}
		});
	}
});