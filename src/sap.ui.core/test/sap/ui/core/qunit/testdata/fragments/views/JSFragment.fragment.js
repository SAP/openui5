sap.ui.define(["sap/m/Button"], function(Button) {
	"use strict";

	return {
		createContent: function(oController) {
			var oJSFragBtn = new Button("jsfragbtn", {
				text: "This is a JS Fragment",
				press: oController.doSomething
			});
			return oJSFragBtn;
		}
	};
});