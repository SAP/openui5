sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("mvc.testdata.ControllerExtensionTest.Test1.Controller", {
		"double": function (x) {
			return x * 2;
		}
	});
});
