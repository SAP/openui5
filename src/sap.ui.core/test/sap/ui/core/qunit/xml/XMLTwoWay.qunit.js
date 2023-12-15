/*global QUnit */
sap.ui.define([
	"sap/m/Input",
	"sap/ui/model/BindingMode",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/xml/XMLModel"
], function(Input, BindingMode, JSONModel, XMLModel) {
	"use strict";

	var testData =
		"<?xml version=\"1.0\" encoding=\"UTF-8\" ?>" +
		"<root><clients>" +
			"<member firstName=\"Donald\" lastName=\"Duck\"> </member>" +
			"<member firstName=\"Lucky\" lastName=\"Luke\"> </member>" +
			"<member firstName=\"Micky\" lastName=\"Mouse\"> </member>" +
			"<member firstName=\"Black\" lastName=\"Spider\"> </member>" +
			"<member firstName=\"Judge\" lastName=\"Dredd\"> </member>" +
			"<member firstName=\"Captain\" lastName=\"Comic\"> </member>" +
			"<member firstName=\"Flash\" lastName=\"Gordon\"> </member>" +
		"</clients> </root>";

	QUnit.module("sap.ui.model.xml.XMLModel: BindingMode", {
		beforeEach: function() {
			this.oModel = new XMLModel();
			this.oModel.setXML(testData);
			this.aInputs = null;
		},
		afterEach: function() {
			if ( Array.isArray(this.aInputs) ) {
				// reset stuff
				this.aInputs.forEach(function(entry) {
					entry.destroy();
				});
				this.aInputs = null;
			}
			this.oModel.destroy();
		},
		createPropertyBindingsUI: function(sName, property, sMode) {
			// create bindings
			var aInputs = this.aInputs = [],
				i, oInput;

			for (i = 0; i < 7; i++){
				oInput = new Input();
				oInput.setModel(this.oModel);
				oInput.bindProperty(sName, "/clients/member/" + i + "/" + property, null, sMode);
				aInputs.push(oInput);
			}

			return aInputs;
		}
	});

	QUnit.test("supported BindingModes", function(assert) {
		assert.ok(this.oModel.isBindingModeSupported(BindingMode.OneWay), "One Way supported");
		assert.ok(this.oModel.isBindingModeSupported(BindingMode.TwoWay), "Two Way supported");
		assert.ok(this.oModel.isBindingModeSupported(BindingMode.OneTime), "One Time supported");
		assert.ok(!this.oModel.isBindingModeSupported(BindingMode.Default), "Default not supported");
	});

	QUnit.test("getDefaultBindingMode", function(assert) {
		var sMode = this.oModel.getDefaultBindingMode();
		assert.equal(sMode, BindingMode.TwoWay, "default binding mode");
	});

	QUnit.test("setDefaultBindingMode", function(assert) {
		this.oModel.setDefaultBindingMode(BindingMode.OneWay);
		var sMode = this.oModel.getDefaultBindingMode();
		assert.equal(sMode, BindingMode.OneWay, "new default binding mode");
		this.oModel.setDefaultBindingMode(BindingMode.TwoWay);
		sMode = this.oModel.getDefaultBindingMode();
		assert.equal(sMode, BindingMode.TwoWay, "new default binding mode");
		this.oModel.setDefaultBindingMode(BindingMode.OneTime);
		sMode = this.oModel.getDefaultBindingMode();
		assert.equal(sMode, BindingMode.OneTime, "new default binding mode");
		assert.throws(
			function(){
				this.oModel.setDefaultBindingMode(BindingMode.Default);
			}, "test set not supported binding mode");
	});

	QUnit.test("One Way model test", function(assert) {
		// should be set first before any binding creation
		this.oModel.setDefaultBindingMode(BindingMode.OneWay);
		var aInputs = this.createPropertyBindingsUI("value", "@firstName", "");

		assert.equal(aInputs.length, 7, "check amount");

		var counter = 0;
		// try to modify value
		aInputs.forEach(function(oInput, i) {
			oInput.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/member/" + i + "/@firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue != "ggg" + i, "check value should not have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, 7, "check amount");

	});

	QUnit.test("Two Way model test", function(assert) {
		this.oModel.setDefaultBindingMode(BindingMode.TwoWay);
		var aInputs = this.createPropertyBindingsUI("value", "@firstName", "");

		assert.equal(aInputs.length, 7, "check amount");

		var counter = 0;
		// try to modify value
		aInputs.forEach(function(oInput, i) {
			oInput.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/member/" + i + "/@firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue == "ggg" + i, "check value should have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, 7, "check amount");

	});

	QUnit.test("One Way model with Two Way bindings", function(assert) {
		this.oModel.setDefaultBindingMode(BindingMode.OneWay);
		var aInputs = this.createPropertyBindingsUI("value", "@firstName", BindingMode.TwoWay);

		var counter = 0;
		// try to modify value
		aInputs.forEach(function(oInput, i) {
			oInput.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/member/" + i + "/@firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue == "ggg" + i, "check value should have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, 7, "check amount");


	});

	QUnit.test("Two Way model with One Way bindings", function(assert) {
		//this.oModel.setDefaultBindingMode(BindingMode.TwoWay);
		var aInputs = this.createPropertyBindingsUI("value", "@firstName", BindingMode.OneWay);

		var counter = 0;
		// try to modify value
		aInputs.forEach(function(oInput, i) {
			oInput.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/member/" + i + "/@firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue != "ggg" + i, "check value should not have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, 7, "check amount");
	});

	QUnit.test("Two Way with multimodels", function(assert) {

		// create 2nd model
		var oModel2 = new JSONModel();
		oModel2.setData({
			test : [
				{enabled:true}
			]
		});

		// create bindings
		var oInput = new Input();
		oInput.setModel(this.oModel);
		oInput.setModel(oModel2, "model2");
		oInput.bindProperty("value", "/clients/member/0/@lastName");
		oInput.bindProperty("enabled", "model2>/test/0/enabled");

		var oValue = this.oModel.getProperty("/clients/member/0/@lastName");
		assert.equal(oValue, "Duck", "old value check");
		var bEnabled = oModel2.getProperty("/test/0/enabled");
		assert.ok(bEnabled, "old value check");

		// modify
		oInput.setValue("newValue");
		oInput.setEnabled(false);

		//check
		oValue = this.oModel.getProperty("/clients/member/0/@lastName");
		assert.equal(oValue, "newValue", "new value check");
		bEnabled = oModel2.getProperty("/test/0/enabled");
		assert.ok(!bEnabled, "new value check");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("One Way with multimodels", function(assert) {

		// create 2nd model
		var oModel2 = new JSONModel();
		oModel2.setData({
			test : [
				{enabled:true}
			]
		});
		oModel2.setDefaultBindingMode(BindingMode.OneWay);

		// create bindings
		var oInput = new Input();
		oInput.setModel(this.oModel);
		oInput.setModel(oModel2, "model2");
		oInput.bindProperty("value", "/clients/member/0/@lastName");
		oInput.bindProperty("enabled", "model2>/test/0/enabled");

		var oValue = this.oModel.getProperty("/clients/member/0/@lastName");
		assert.equal(oValue, "Duck", "old value check");
		var bEnabled = oModel2.getProperty("/test/0/enabled");
		assert.ok(bEnabled, "old value check");

		// modify
		oInput.setValue("newValue");
		oInput.setEnabled(false);

		// check
		oValue = this.oModel.getProperty("/clients/member/0/@lastName");
		assert.equal(oValue, "newValue", "new value check");
		bEnabled = oModel2.getProperty("/test/0/enabled");
		assert.ok(bEnabled, "new value check");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("One Time model test", function(assert) {
		// should be set first before any binding creation
		this.oModel.setDefaultBindingMode(BindingMode.OneTime);
		var aInputs = this.createPropertyBindingsUI("value", "@firstName");

		assert.equal(aInputs.length, 7, "check amount");


		var counter = 0;
		// try to modify value
		aInputs.forEach(function(oInput, i) {
			oInput.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/member/" + i + "/@firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue != "ggg" + i, "check value should not have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, 7, "check amount");

		// modify value in model...nothing should change in UI
		aInputs.forEach(function(oInput, i) {
			this.oModel.setProperty("/clients/member/" + i + "/@firstName", "newmodelvalue" + i);
			var oValue = this.oModel.getProperty("/clients/member/" + i + "/@firstName");
			assert.equal(oValue, "newmodelvalue" + i, "new model value");
		}, this);

		aInputs.forEach(function(oInput, i) {
			var oValue = oInput.getValue();
			// check model value
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue == "ggg" + i, "check value should not have changed in control " + oValue);
			counter++;
		});

	});

	QUnit.test("One Way model with One Time bindings", function(assert) {
		this.oModel.setDefaultBindingMode(BindingMode.OneWay);
		var aInputs = this.createPropertyBindingsUI("value", "@firstName", BindingMode.OneTime);

		var counter = 0;
		// try to modify value
		aInputs.forEach(function(oInput, i) {
			oInput.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/member/" + i + "/@firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue != "ggg" + i, "check value should not have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, 7, "check amount");

		// modify value in model...nothing should change in UI
		aInputs.forEach(function(oInput, i) {
			this.oModel.setProperty("/clients/member/" + i + "/@firstName", "newmodelvalue" + i);
			var oValue = this.oModel.getProperty("/clients/member/" + i + "/@firstName");
			assert.equal(oValue, "newmodelvalue" + i, "new model value");
		}, this);

		aInputs.forEach(function(oInput, i) {
			var oValue = oInput.getValue();
			// check model value
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue == "ggg" + i, "check value should not have changed in control " + oValue);
			counter++;
		});

	});

	QUnit.test("Two Way model with One Time bindings", function(assert) {
		//this.oModel.setDefaultBindingMode(BindingMode.TwoWay);
		var aInputs = this.createPropertyBindingsUI("value", "@firstName", BindingMode.OneTime);

		var counter = 0;
		// try to modify value
		aInputs.forEach(function(oInput, i) {
			oInput.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/member/" + i + "/@firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue != "ggg" + i, "check value should not have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, 7, "check amount");

		// modify value in model...nothing should change in UI
		aInputs.forEach(function(oInput, i) {
			this.oModel.setProperty("/clients/member/" + i + "/@firstName", "newmodelvalue" + i);
			var oValue = this.oModel.getProperty("/clients/member/" + i + "/@firstName");
			assert.equal(oValue, "newmodelvalue" + i, "new model value");
		}, this);

		aInputs.forEach(function(oInput, i) {
			var oValue = oInput.getValue();
			// check model value
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue == "ggg" + i, "check value should not have changed in control " + oValue);
			counter++;
		});
	});

});
