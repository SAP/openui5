sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";
	return Controller.extend("mvc.testdata.ControllerCreateTest", {
		"double": function (x) {
			return x * 2;
		}
	});
});