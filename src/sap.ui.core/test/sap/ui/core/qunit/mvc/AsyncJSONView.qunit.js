/*global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/ResourceBundle",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/JSONView",
	"sap/ui/base/ManagedObject",
	"sap/base/Log",
	"sap/ui/core/Configuration"
], function (ResourceBundle, View, JSONView, ManagedObject, Log, Configuration) {
	"use strict";

	QUnit.module("JSONView.create Factory", {
		beforeEach: function () {
			this.oAfterInitSpy = sinon.spy(View.prototype, "fireAfterInit");
		},
		afterEach: function () {
			this.oAfterInitSpy.restore();
		}
	});

	QUnit.test("asynchronous resource loading", function(assert) {
		var that = this;

		return JSONView.create({
			viewName : "testdata.mvc.Async"
		})
		.then(function(oViewLoaded) {
			assert.equal(that.oAfterInitSpy.callCount, 1, "AfterInit event fired before resolving");
			assert.ok(oViewLoaded instanceof JSONView, "Views equal deeply");
		});
	});

	var sDefaultLanguage = Configuration.getLanguage();

	QUnit.module("Apply settings", {
		beforeEach : function () {
			Configuration.setLanguage("en-US");
		},
		afterEach : function () {
			Configuration.setLanguage(sDefaultLanguage);
		}
	});


	QUnit.test("Promise - loaded() for async view with resource bundle", function(assert) {
		assert.expect(3);

		var oResourceBundleCreateSpy = sinon.spy(ResourceBundle, "create");
		return JSONView.create({
			viewName : "testdata.mvc.AsyncWithResourceBundle"
		})
		.then(function(oViewLoaded) {
			assert.ok(oViewLoaded instanceof JSONView, "Views equal deeply");

			var oCreateCall = oResourceBundleCreateSpy.getCall(0);
			assert.ok(oCreateCall, "async call");
			assert.ok(oCreateCall.args[0].async, "async call");
			oResourceBundleCreateSpy.restore();
		});
	});

	QUnit.test("Async JSONView: Aggregation Binding with value property", function(assert) {
		var done = assert.async();

		sap.ui.require(["sap/ui/table/Table"], function() {
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
			}).then(function(oJsonView) {
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
});