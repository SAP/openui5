jQuery.sap.declare("myApp.test.assertion.TestPage2");
jQuery.sap.require("sap.ui.test.Opa5");

myApp.test.assertion.TestPage2 = sap.ui.test.Opa5.extend("myApp.test.assertion.TestPage2", {

	iShouldSeeThePage2Text : function () {
		return this.waitFor({
			id : "text2",
			success : function (oText) {
				strictEqual(oText.getText(), "This is Page 2");
			}
		});
	}

});