/*global QUnit */
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/mvc/JSView',
	'sap/ui/core/mvc/View',
	'sap/ui/core/mvc/ViewType',
	'sap/m/Button',
	'sap/m/Panel',
	'./AnyView.qunit'
], function(Controller, JSView, View, ViewType, Button, Panel, testsuite) {
	"use strict";

	var oConfig = {
		viewClassName : "sap.ui.core.mvc.JSView",
		idsToBeChecked : ["myPanel", "Button1"]
	};

	testsuite(oConfig, "JSView creation loading from file", function() {
		return JSView.create({
			viewName: "example.mvc.test"
		});
	});

	testsuite(oConfig, "JSView creation with local view + controller definition", function() {
		return JSView.create({
			viewName: "example.mvc.testLocal"
		});
	});


	testsuite(oConfig, "JSView creation via generic view factory", function() {
		return View.create({
			viewName: "example.mvc.test",
			type: ViewType.JS,
			viewData:{
				test: "testdata"
			}
		});
	}, true);

	QUnit.test("Check for Controller and View Connection in createContent() before onInit() is called", function (assert) {
		return JSView.create({
			viewName: "example.mvc.test_connection"
		});
	});
});