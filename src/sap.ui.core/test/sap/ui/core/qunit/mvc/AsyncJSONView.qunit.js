/*global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/ResourceBundle",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/JSONView",
	"./AnyViewAsync.qunit",
	"sap/base/Log"
], function(ResourceBundle, View, JSONView, asyncTestsuite, Log) {
	"use strict";

	// setup test config with generic factory
	var oConfig = {
		type : "JSON",
		factory : function(bAsync) {
			return sap.ui.view({
				type : "JSON",
				viewName : "testdata.mvc.Async",
				async : bAsync
			});
		},
		receiveSource : function(source) {
			return JSON.stringify(source);
		}
	};
	asyncTestsuite("Generic View Factory", oConfig);

	// switch factory function
	oConfig.factory = function(bAsync) {
		return sap.ui.jsonview({
			viewName : "testdata.mvc.Async",
			async : bAsync
		});
	};
	asyncTestsuite("JSONView Factory", oConfig);

	QUnit.test("Promise - loaded() for async view", function(assert) {
		assert.expect(3);
		var done = assert.async();
		var that = this;
		this.oLogMock = this.mock(Log);
		this.oLogMock.expects("warning").never();

		JSONView.create({
			viewName : "testdata.mvc.Async"
		})
		.then(function(oViewLoaded) {
			assert.equal(that.oAfterInitSpy.callCount, 1, "AfterInit event fired before resolving");
			assert.ok(oViewLoaded instanceof JSONView, "Views equal deeply");
			done();
		});
	});

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	QUnit.module("Apply settings", {
		beforeEach : function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach : function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
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
});