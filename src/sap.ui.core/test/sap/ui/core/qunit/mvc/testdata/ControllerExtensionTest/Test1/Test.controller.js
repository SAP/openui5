sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("mvc.testdata.ControllerExtensionTest.Test1.Controller", {
		"double": function (x) {
			var inp = this.getView().byId("inp");
			inp.setValue(inp.getValue() * 2);
			return x * 2;
		},
		"triple": function() {
			// empty hook for extension
		}
	});
});
