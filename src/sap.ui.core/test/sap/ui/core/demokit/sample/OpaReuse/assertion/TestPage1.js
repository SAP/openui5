jQuery.sap.declare("myApp.test.assertion.TestPage1");
jQuery.sap.require("sap.ui.test.Opa5");

myApp.test.assertion.TestPage1 = sap.ui.test.Opa5.extend("myApp.test.assertion.TestPage1", {

	iShouldSeeThePage1Text : function () {
		return this.waitFor({
			id : "text1",
			success : function (oText) {
				strictEqual(oText.getText(), "This is Page 1");
			}
		});
	}

});