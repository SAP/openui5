sap.ui.define(["sap/ui/test/Opa5","./Common"], function (Opa5, Common) {
	"use strict";

	Opa5.createPageObjects({
		onPage1: {
			// inherit myApp.test.pageObjects.Common
			baseClass: Common,

			viewName: "Main",
			assertions: {
				iShouldSeeThePage1Text: function () {
					// call a utility function inherited from myApp.test.pageObjects.Common
					return this.iShouldSeeTheText("text1", "This is Page 1");
				}
			}
		}
	});

});
