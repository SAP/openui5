sap.ui.define(["sap/ui/test/Opa5"], function (Opa5) {
	"use strict";

	return Opa5.extend("myApp.test.pageObjects.Common", {

		// Other page objects that inherit myApp.test.pageObjects.Common can reuse its functionality.
		// See TestPage1 and TestPage2 which are derived from myApp.test.pageObjects.Common.
		// Inheritance in this case should be used mainly for commonly used utilities.
		iShouldSeeTheText: function (sId, sText) {
			return this.waitFor({
				id: sId,
				success: function (oText) {
					Opa5.assert.strictEqual(oText.getText(), sText);
				}
			});
		}

	});

});
