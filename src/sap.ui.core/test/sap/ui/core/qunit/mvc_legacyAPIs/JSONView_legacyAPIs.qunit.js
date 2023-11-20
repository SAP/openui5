/*global sinon QUnit */
sap.ui.define([
	'sap/ui/core/library',
	'./AnyView_legacyAPIs.qunit',
	'sap/ui/base/ManagedObject'
], function(coreLibrary, testsuite, ManagedObject) {
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	var oConfig = {
		viewClassName : "sap.ui.core.mvc.JSONView",
		idsToBeChecked : ["myPanel", "Button1"]
	};

	testsuite(oConfig, "JSONView creation loading from file", function() {
		return sap.ui.jsonview("example.mvc_legacyAPIs.test");
	});

	testsuite(oConfig, "JSONView creation via JSON string", function() {
		var json = JSON.stringify({
			"Type": "sap.ui.core.JSONView",
			"controllerName": "example.mvc_legacyAPIs.test",
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
							"viewName": "example.mvc_legacyAPIs.test2",
							"id": "MyJSONView"
						},
						{
							"Type": "sap.ui.core.mvc.JSView",
							"viewName": "example.mvc_legacyAPIs.test2",
							"id": "MyJSView"
						},
						{
							"Type": "sap.ui.core.mvc.XMLView",
							"viewName": "example.mvc_legacyAPIs.test2",
							"id": "MyXMLView"
						},
						{
							"Type": "sap.ui.core.mvc.HTMLView",
							"viewName": "example.mvc_legacyAPIs.test2",
							"controllerName": "example.mvc_legacyAPIs.test",
							"id": "MyHTMLView"
						}
					]
				}
			]
		});
		return sap.ui.jsonview({viewContent:json});
	});

	testsuite(oConfig, "JSONView creation via generic view factory", function() {
		return sap.ui.view({type:ViewType.JSON,viewName:"example.mvc_legacyAPIs.test", viewData:{test:"testdata"}});
	}, true);

	QUnit.test("JSONView should be able to resolve controller methods", function(assert) {
		var oView = sap.ui.jsonview("example.mvc_legacyAPIs.test");
		var oButtonWithBinding = oView.byId("ButtonWithBinding");
		assert.ok(oButtonWithBinding, "button could be found");
		var oBindingInfo = oButtonWithBinding.getBindingInfo("text");
		assert.ok(oBindingInfo, "there should be a binding info for property 'text'");
		assert.ok(typeof oBindingInfo.formatter === 'function', "formatter should have been resolved");
		assert.ok(oBindingInfo.formatter(42) === 'formatted-42', "formatter should be the one form the controller"); // TODO test should involve instance
		oView.destroy();
	});

	QUnit.test("JSONView: Aggregation Binding with value property", function(assert) {
		var done = assert.async();
		sap.ui.require(["sap/ui/table/Table"], function(Table) {
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

			sap.ui.jsonview({ viewContent: json });
			var aExtractBindingInfoCalls = oExtractBindingInfoSpy.getCalls();

			for (var i = 0; i < aExtractBindingInfoCalls.length; i++) {
				var oCall = aExtractBindingInfoCalls[i];
				if (typeof oCall.args[0] === 'object' && oCall.args[0].Type) {
					assert.equal(oCall.returnValue, undefined, "ManagedObject#extractBindingInfo should return undefined");
				}
			}
			done();
		});
	});

});