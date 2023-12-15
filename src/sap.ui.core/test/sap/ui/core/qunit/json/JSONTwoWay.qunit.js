/*global QUnit */
sap.ui.define([
	"sap/m/Input",
	"sap/ui/model/BindingMode",
	"sap/ui/model/json/JSONModel"
], function(
	Input,
	BindingMode,
	JSONModel
) {
	"use strict";

	var constTestData = {
		clients:[
			{firstName:"Donald", lastName:"Duck", id: "1", rating : 5},
			{firstName:"Lucky", lastName:"Luke", id: "2", rating : 2},
			{firstName:"Micky", lastName:"Mouse", id: "3", rating : 1},
			{firstName:"Black", lastName:"Spider", id: "4", rating : 3},
			{firstName:"Judge", lastName:"Dredd", id: "5", rating : 4},
			{firstName:"Captain", lastName:"Comic", id: "6", rating : 5},
			{firstName:"Flash", lastName:"Gordon", id: "7" , rating : 0}
		]
	};

	function clone(data) {
		return JSON.parse(JSON.stringify(constTestData));
	}

	QUnit.module("sap.ui.model.json.JSONModel: Binding Modes", {
		beforeEach: function() {
			this.aTextFields = null;
			// Note: some tests modify the model data, therefore we clone it
			this.currentTestData = clone(constTestData);
			this.oModel = new JSONModel();
			this.oModel.setData(this.currentTestData);
		},
		afterEach: function() {
			if ( Array.isArray(this.aTextFields) ) {
				// reset stuff
				this.aTextFields.forEach(function(entry) {
					entry.destroy();
				});
				this.aTextFields = null;
			}
			this.oModel.destroy();
		},
		createPropertyBindingsUI: function(sName, sProperty, sMode) {
			// create bindings
			this.aTextFields = constTestData.clients.map((entry, i) => {
				var oTextField = new Input();
				oTextField.setModel(this.oModel);
				oTextField.bindProperty(sName, "/clients/" + i + "/" + sProperty, null, sMode);
				return oTextField;
			});

			return this.aTextFields;
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
			function() {
				this.oModel.setDefaultBindingMode(BindingMode.Default);
			}, "test set not supported binding mode");
	});

	QUnit.test("One Way model test", function(assert) {
		// should be set first before any binding creation
		this.oModel.setDefaultBindingMode(BindingMode.OneWay);
		var aTextFields = this.createPropertyBindingsUI("value", "firstName", "");

		assert.equal(aTextFields.length, constTestData.clients.length, "check amount");

		var counter = 0;
		// try to modify value
		aTextFields.forEach(function(oTextField, i) {
			oTextField.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/" + i + "/firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue != "ggg" + i, "check value should not have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, constTestData.clients.length, "check amount");

	});

	QUnit.test("Two Way model test", function(assert) {
		this.oModel.setDefaultBindingMode(BindingMode.TwoWay);
		var aTextFields = this.createPropertyBindingsUI("value", "firstName", "");

		assert.equal(aTextFields.length, constTestData.clients.length, "check amount");


		var counter = 0;
		// try to modify value
		aTextFields.forEach(function(oTextField, i) {
			oTextField.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/" + i + "/firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue == "ggg" + i, "check value should have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, constTestData.clients.length, "check amount");

	});

	QUnit.test("One Way model with Two Way bindings", function(assert) {
		this.oModel.setDefaultBindingMode(BindingMode.OneWay);
		var aTextFields = this.createPropertyBindingsUI("value", "firstName", BindingMode.TwoWay);

		var counter = 0;
		// try to modify value
		aTextFields.forEach(function(oTextField, i) {
			oTextField.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/" + i + "/firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue == "ggg" + i, "check value should have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, constTestData.clients.length, "check amount");


	});

	QUnit.test("Two Way model with One Way bindings", function(assert) {
		//this.oModel.setDefaultBindingMode(BindingMode.TwoWay);
		var aTextFields = this.createPropertyBindingsUI("value", "firstName", BindingMode.OneWay);

		var counter = 0;
		// try to modify value
		aTextFields.forEach(function(oTextField, i) {
			oTextField.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/" + i + "/firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue != "ggg" + i, "check value should not have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, constTestData.clients.length, "check amount");
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
		var oTextField = new Input();
		oTextField.setModel(this.oModel);
		oTextField.setModel(oModel2, "model2");
		oTextField.bindProperty("value", "/clients/0/lastName");
		oTextField.bindProperty("enabled", "model2>/test/0/enabled");

		var oValue = this.oModel.getProperty("/clients/0/lastName");
		assert.equal(oValue, "Duck", "old value check");
		var bEnabled = oModel2.getProperty("/test/0/enabled");
		assert.ok(bEnabled, "old value check");

		// modify
		oTextField.setValue("newValue");
		oTextField.setEnabled(false);

		//check
		oValue = this.oModel.getProperty("/clients/0/lastName");
		assert.equal(oValue, "newValue", "new value check");
		bEnabled = oModel2.getProperty("/test/0/enabled");
		assert.ok(!bEnabled, "new value check");

		oTextField.destroy();
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
		var oTextField = new Input();
		oTextField.setModel(this.oModel);
		oTextField.setModel(oModel2, "model2");
		oTextField.bindProperty("value", "/clients/0/lastName");
		oTextField.bindProperty("enabled", "model2>/test/0/enabled");

		var oValue = this.oModel.getProperty("/clients/0/lastName");
		assert.equal(oValue, "Duck", "old value check");
		var bEnabled = oModel2.getProperty("/test/0/enabled");
		assert.ok(bEnabled, "old value check");

		// modify
		oTextField.setValue("newValue");
		oTextField.setEnabled(false);

		//check
		oValue = this.oModel.getProperty("/clients/0/lastName");
		assert.equal(oValue, "newValue", "new value check");
		bEnabled = oModel2.getProperty("/test/0/enabled");
		assert.ok(bEnabled, "new value check");

		oTextField.destroy();
	});

	QUnit.test("One Time model test", function(assert) {
		// should be set first before any binding creation
		this.oModel.setDefaultBindingMode(BindingMode.OneTime);
		var aTextFields = this.createPropertyBindingsUI("value", "firstName");

		assert.equal(aTextFields.length, constTestData.clients.length, "check amount");


		var counter = 0;
		// try to modify value
		aTextFields.forEach(function(oTextField, i) {
			oTextField.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/" + i + "/firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue != "ggg" + i, "check value should not have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, constTestData.clients.length, "check amount");

		// modify value in model...nothing should change in UI
		aTextFields.forEach(function(oTextField, i) {
			this.oModel.setProperty("/clients/" + i + "/firstName", "newmodelvalue" + i);
			var oValue = this.oModel.getProperty("/clients/" + i + "/firstName");
			assert.equal(oValue, "newmodelvalue" + i, "new model value");
		}, this);

		aTextFields.forEach(function(oTextField, i) {
			var oValue = oTextField.getValue();
			// check model value
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue == "ggg" + i, "check value should not have changed in control " + oValue);
			counter++;
		}, this);

	});

	QUnit.test("One Way model with One Time bindings", function(assert) {
		this.oModel.setDefaultBindingMode(BindingMode.OneWay);
		var aTextFields = this.createPropertyBindingsUI("value", "firstName", BindingMode.OneTime);

		var counter = 0;
		// try to modify value
		aTextFields.forEach(function(oTextField, i) {
			oTextField.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/" + i + "/firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue != "ggg" + i, "check value should not have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, constTestData.clients.length, "check amount");

		// modify value in model...nothing should change in UI
		aTextFields.forEach(function(oTextField, i) {
			this.oModel.setProperty("/clients/" + i + "/firstName", "newmodelvalue" + i);
			var oValue = this.oModel.getProperty("/clients/" + i + "/firstName");
			assert.equal(oValue, "newmodelvalue" + i, "new model value");
		}, this);

		aTextFields.forEach(function(oTextField, i) {
			var oValue = oTextField.getValue();
			// check model value
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue == "ggg" + i, "check value should not have changed in control " + oValue);
			counter++;
		}, this);

	});

	QUnit.test("Two Way model with One Time bindings", function(assert) {
		//this.oModel.setDefaultBindingMode(BindingMode.TwoWay);
		var aTextFields = this.createPropertyBindingsUI("value", "firstName", BindingMode.OneTime);

		var counter = 0;
		// try to modify value
		aTextFields.forEach(function(oTextField, i) {
			oTextField.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/" + i + "/firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue != "ggg" + i, "check value should not have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, constTestData.clients.length, "check amount");

		// modify value in model...nothing should change in UI
		aTextFields.forEach(function(oTextField, i) {
			this.oModel.setProperty("/clients/" + i + "/firstName", "newmodelvalue" + i);
			var oValue = this.oModel.getProperty("/clients/" + i + "/firstName");
			assert.equal(oValue, "newmodelvalue" + i, "new model value");
		}, this);

		aTextFields.forEach(function(oTextField, i) {
			var oValue = oTextField.getValue();
			// check model value
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue == "ggg" + i, "check value should not have changed in control " + oValue);
			counter++;
		}, this);
	});
});