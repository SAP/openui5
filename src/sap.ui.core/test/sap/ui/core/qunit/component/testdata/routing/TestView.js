sap.ui.define([
	"sap/m/Button",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/View"
], function(Button, Controller, View) {
	"use strict";

	return View.extend("sap.ui.test.routing.TestView", {
		createContent: function () {
			return new Promise(function (res) {
				res([new Button()]);
			});
		},
		getController: function () {
			Controller.extend("sap.ui.test.routing.TestController", {});

			return Controller.create({
				name: "sap.ui.test.routing.TestController"
			});
		}
	});
});
