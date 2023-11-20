sap.ui.define([
	"sap/m/Button",
	"sap/ui/core/mvc/View"
], function (Button, View) {
	"use strict";

	return View.extend("error.test.JSView", {
		createContent: function (oController) {
			return new Button({
				text: "click me"
			});
		}
	});
});