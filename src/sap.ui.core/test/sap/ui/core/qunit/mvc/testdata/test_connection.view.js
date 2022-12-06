/*global QUnit */
sap.ui.define([
], function () {
	"use strict";

	sap.ui.jsview("example.mvc.test_connection", {

		getControllerName: function () {
			return "example.mvc.test_connection";
		},

		createContent: function (oController) {
			QUnit.assert.ok(this.getController(), "Controller is connected.");
			QUnit.assert.ok(oController.getView(), "View is connected.");
			return [];
		}
	});
});