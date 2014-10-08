jQuery.sap.declare("myApp.test.action.TestPage2");
jQuery.sap.require("myApp.test.action.Common");

myApp.test.action.TestPage2 = myApp.test.action.Common.extend("myApp.test.action.TestPage2", {

	iPressOnGoToPage2 : function () {
		return this.waitFor({
			id : "navToPage2",
			success : function (oButton) {
				oButton.$().trigger("tap");
			}
		});
	}

});