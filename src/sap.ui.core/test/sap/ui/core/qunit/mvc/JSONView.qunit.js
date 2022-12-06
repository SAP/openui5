/*global sinon QUnit */
sap.ui.define([
	'sap/ui/base/ManagedObject',
	'sap/ui/core/library',
	'sap/ui/core/mvc/JSONView',
	'sap/ui/core/mvc/View',
	'./AnyView.qunit'
], function (ManagedObject, coreLibrary, JSONView, View, testsuite) {
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	var oConfig = {
		viewClassName: "sap.ui.core.mvc.JSONView",
		idsToBeChecked: ["myPanel", "Button1"]
	};

	testsuite(oConfig, "JSONView creation loading from file", function () {
		return JSONView.create({
			viewName: "example.mvc.test"
		});
	});

	testsuite(oConfig, "JSONView creation via JSON string", function () {
		var json = JSON.stringify({
			"Type": "sap.ui.core.JSONView",
			"controllerName": "example.mvc.test",
			"content": [
				{
					"Type": "sap.m.Panel",
					"id": "myPanel",
					"content": [
						{
							"Type": "sap.m.Button",
							"id": "Button1",
							"text": "Hello World!",
							"press": "doIt"
						},
						{
							"Type": "sap.m.Button",
							"id": "Button2",
							"text": "Hello"
						},
						{
							"Type": "sap.m.Button",
							"id": "ButtonX",
							"text": "Another Hello",
							"press": ".sap.doIt"
						},
						{
							"Type": "sap.ui.core.mvc.JSONView",
							"viewName": "example.mvc.test2",
							"id": "MyJSONView"
						},
						{
							"Type": "sap.ui.core.mvc.JSView",
							"viewName": "example.mvc.test2",
							"id": "MyJSView"
						},
						{
							"Type": "sap.ui.core.mvc.XMLView",
							"viewName": "example.mvc.test2",
							"id": "MyXMLView"
						},
						{
							"Type": "sap.ui.core.mvc.HTMLView",
							"viewName": "example.mvc.test2",
							"controllerName": "example.mvc.test",
							"id": "MyHTMLView"
						}
					]
				}
			]
		});
		return JSONView.create({ definition: json });
	});

	testsuite(oConfig, "JSONView creation via generic view factory", function () {
		return View.create({ type: ViewType.JSON, viewName: "example.mvc.test", viewData: { test: "testdata" } });
	}, true);

	QUnit.module("JSONView.create factory", {});

	QUnit.test("JSONView should be able to resolve controller methods", function (assert) {
		return JSONView.create({
			viewName: "example.mvc.test"
		}).then(function (oView) {
			assert.ok(oView, "View with viewName 'example.mvc.test' should be created successfully.");

			var oButtonWithBinding = oView.byId("ButtonWithBinding");
			assert.ok(oButtonWithBinding, "Content check - Button with id 'ButtonWithBinding' should be available.");
			var oBindingInfo = oButtonWithBinding.getBindingInfo("text");
			assert.ok(oBindingInfo, "there should be a binding info for property 'text'");
			assert.ok(typeof oBindingInfo.formatter === 'function', "formatter should have been resolved");
			assert.ok(oBindingInfo.formatter(42) === 'formatted-42', "formatter should be the one form the controller");

			return oView;
		}).then(function (oView) {
			// cleanup
			oView.destroy();
		});
	});

	QUnit.test("JSONView: Aggregation Binding with value property", function (assert) {
		var done = assert.async();
		sap.ui.require(["sap/ui/table/Table"], function (Table) {
			var oExtractBindingInfoSpy = sinon.spy(ManagedObject.prototype, "extractBindingInfo");

			var json = JSON.stringify({
				"Type": "sap.ui.core.mvc.JSONView",
				"content": [
					{
						"Type": "sap.ui.table.Table",
						"columns": [
							{
								"Type": "sap.ui.table.Column",
								"template": {
									"Type": "sap.m.DatePicker",
									"value": {
										"path": "Date",
										"type": "sap.ui.model.type.String"
									}
								}
							}
						]
					}
				]
			});

			JSONView.create({
				definition: json
			}).then(function (oView) {
				assert.ok(oView, "View should be created successfully.");

				var aExtractBindingInfoCalls = oExtractBindingInfoSpy.getCalls();
				for (var i = 0; i < aExtractBindingInfoCalls.length; i++) {
					var oCall = aExtractBindingInfoCalls[i];
					if (typeof oCall.args[0] === 'object' && oCall.args[0].Type) {
						assert.equal(oCall.returnValue, undefined, "ManagedObject#extractBindingInfo should return undefined");
					}
				}

				return oView;
			}).then(function (oView) {
				// cleanup
				oView.destroy();
				done();
			});
		});
	});

	QUnit.module("View.create factory", {});

	QUnit.test("JSONView creation via generic View.create factory", function(assert) {
		return View.create({
			type: ViewType.JSON,
			viewName: "example.mvc.test",
			viewData: {
				test: "testdata"
			}
		}).then(function (oView) {
			assert.ok(oView, "View with viewName 'example.mvc.test' should be created successfully.");
			assert.ok(oView.byId("myPanel"), "Content check - Panel with id 'myPanel' should be available.");

			return oView;
		}).then(function (oView) {
			// cleanup
			oView.destroy();
		});
	});
});