sap.ui.define([
	"sap/m/Button",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/View"
], function(Button, Controller, View) {
	"use strict";

	return View.extend("testdata.routing.TestView", {
		createContent: function () {
			return new Promise(function (res) {
				res([new Button()]);
			});
		},
		getController: function () {
			Controller.extend("testdata.routing.TestController", {});

			return Controller.create({
				name: "testdata.routing.TestController"
			});
		}
	});
});
