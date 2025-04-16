/*global QUnit*/
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/model/resource/ResourceModel"
], function(Log, Localization, ResourceModel) {
	"use strict";

	var sDefaultLanguage = Localization.getLanguage();

	//*********************************************************************************************
	QUnit.module("sap.ui.model.resource.ResourcePropertyBinding", {
		before : function () {
			this.__ignoreIsolatedCoverage__ = true;
			Localization.setLanguage("en-US");
		},
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},
		after : function () {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("Binding getPath", function(assert) {
		const oModel = new ResourceModel({async : true, bundleName : "testdata.messages"});
		const oBinding = oModel.bindProperty("TEST_TEXT");

		// model stores the binding first when attach change was called
		assert.ok(oBinding, "binding instantiated");
		assert.equal(oBinding.getPath(), "TEST_TEXT", "Binding Path set properly");
	});

	QUnit.test("Binding getModel", function(assert) {
		const oModel = new ResourceModel({async : true, bundleName : "testdata.messages"});
		const oBinding = oModel.bindProperty("TEST_TEXT");

		// check model of each binding...should be the same
		assert.equal(oBinding.getModel(), oModel, "Binding model");
	});

	QUnit.test("Binding changeEvent", function(assert) {
		const oModel = new ResourceModel({async : true, bundleName : "testdata.messages"});
		const oBinding = oModel.bindProperty("TEST_TEXT");
		var attach = false,
			detach = true,
			done = assert.async();

		function callBackOnChange(){
			attach = true;
			detach = false;
		}

		// check model of each binding...should be the same
		oBinding.attachChange(callBackOnChange);

		// model stores the binding first when attach change was called
		assert.equal(oModel.getBindings().length, 1, "model bindings");

		// fire change event
		oBinding._fireChange();
		assert.ok(attach, "call back method was attached");
		assert.ok(!detach, "call back method was not detached");

		oBinding.detachChange(callBackOnChange);
		attach = false;
		detach = true;
		//refire change event
		oBinding._fireChange();
		assert.ok(!attach, "call back method was not attached");
		assert.ok(detach, "call back method was detached");
		attach = false;
		detach = true;

		setTimeout(function() {
			assert.equal(oModel.getBindings().length, 0, "model bindings");
			done();
		}, 0);
	});

	QUnit.test("PropertyBinding getValue", function(assert) {
		this.oLogMock.expects("warning")
			.withExactArgs("Usage of synchronous loading is deprecated. For performance reasons, asynchronous loading"
				+ " is strongly recommended.", undefined, "sap.ui.model.resource.ResourceModel");
		const oModel = new ResourceModel({bundleName : "testdata.messages"});
		const oBinding = oModel.bindProperty("TEST_TEXT");

		assert.equal(oBinding.getValue(), "A text en", "Property binding value");
	});
});