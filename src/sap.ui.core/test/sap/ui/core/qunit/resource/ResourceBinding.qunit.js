/*global QUnit*/
sap.ui.define([
	"sap/ui/model/resource/ResourceModel"
], function(
	ResourceModel
) {
	"use strict";
	var oModel;
	var oBinding;

	function setup(){
		// reset bindings
		oModel = new ResourceModel({bundleName:"testdata.messages"});
		sap.ui.getCore().setModel(oModel);
	}

	QUnit.test("Binding getPath", function(assert) {
		assert.expect(2);
		setup();
		oBinding = oModel.bindProperty("TEST_TEXT");
		// model stores the binding first when attach change was called
		assert.ok(oBinding, "binding instantiated");
		assert.equal(oBinding.getPath(),"TEST_TEXT","Binding Path set properly");
	});

	QUnit.test("Binding getModel", function(assert) {
		assert.expect(1);
		setup();
		oBinding = oModel.bindProperty("TEST_TEXT");
		// check model of each binding...should be the same
		assert.equal(oBinding.getModel(), oModel, "Binding model");
	});

	QUnit.test("Binding changeEvent", function(assert) {
		var done = assert.async();
		setup();
		oBinding = oModel.bindProperty("TEST_TEXT");

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

	var attach = false;
	var detach = true;

	function callBackOnChange(){
		attach = true;
		detach = false;
	}

	QUnit.test("PropertyBinding getValue", function(assert) {
		setup();
		oBinding = oModel.bindProperty("TEST_TEXT");

		assert.equal(oBinding.getValue(), "A text en", "Property binding value");
	});
});