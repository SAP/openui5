sap.ui.define(["sap/ui/test/Opa5","./Common"], function (Opa5, Common) {
	"use strict";

	Opa5.createPageObjects({

		onPage2: {
			// inherit myApp.test.pageObjects.Common
			baseClass: Common,

			viewName: "Main",
			assertions: {
				iShouldSeeThePage2Text: function () {
					// call a utility function inherited from myApp.test.pageObjects.Common
					return this.iShouldSeeTheText("text2", "This is Page 2");
				}
			}
		}

	});

});
