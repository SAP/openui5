sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("mvc.testdata.ControllerExtensionTest.SyncWrongExtension.Controller", {
		"tripple": function (x) {
			return x * 3;
		}
	});
});
