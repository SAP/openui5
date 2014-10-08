jQuery.sap.declare("myApp.test.action.TestPage1");
jQuery.sap.require("myApp.test.action.Common");

myApp.test.action.TestPage1 = myApp.test.action.Common.extend("myApp.test.action.TestPage1", {

	iPressOnGoToPage1 : function () {
		return this.waitFor({
			id : "navToPage1",
			success : function (oButton) {
				oButton.$().trigger("tap");
			}
		});
	}

});