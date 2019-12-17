/*global QUnit*/
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/resource/ResourceModel"
], function(
	Log, ResourceModel
) {
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	//*********************************************************************************************
	QUnit.module("sap.ui.model.resource.ResourcePropertyBinding", {
		before : function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			// create ResourceModel
			this.oModel = new ResourceModel({bundleName : "testdata.messages"});

			sap.ui.getCore().setModel(this.oModel);
		},
		afterEach : function () {
			sap.ui.getCore().setModel(null);
		},
		after : function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("Binding getPath", function(assert) {
		var oBinding = this.oModel.bindProperty("TEST_TEXT");
		// model stores the binding first when attach change was called
		assert.ok(oBinding, "binding instantiated");
		assert.equal(oBinding.getPath(), "TEST_TEXT", "Binding Path set properly");
	});

	QUnit.test("Binding getModel", function(assert) {
		var oBinding = this.oModel.bindProperty("TEST_TEXT");
		// check model of each binding...should be the same
		assert.equal(oBinding.getModel(), this.oModel, "Binding model");
	});

	QUnit.test("Binding changeEvent", function(assert) {
		var attach = false,
			oBinding = this.oModel.bindProperty("TEST_TEXT"),
			detach = true,
			done = assert.async(),
			that = this;

		function callBackOnChange(){
			attach = true;
			detach = false;
		}

		// check model of each binding...should be the same
		oBinding.attachChange(callBackOnChange);

		// model stores the binding first when attach change was called
		assert.equal(this.oModel.getBindings().length, 1, "model bindings");

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
			assert.equal(that.oModel.getBindings().length, 0, "model bindings");
			done();
		}, 0);
	});

	QUnit.test("PropertyBinding getValue", function(assert) {
		var oBinding = this.oModel.bindProperty("TEST_TEXT");

		assert.equal(oBinding.getValue(), "A text en", "Property binding value");
	});
});