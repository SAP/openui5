/*global QUnit */
sap.ui.define([
	"sap/ui/model/xml/XMLModel",
	"sap/ui/model/BindingMode",
	"sap/ui/commons/TextField"
], function(XMLModel, BindingMode, CommonsTextField) {
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

	var oContentDIV = document.createElement("div");
	oContentDIV.id = "target1";
	document.body.appendChild(oContentDIV);

	QUnit.module("sap.ui.model.xml.XMLModel: BindingMode", {
		beforeEach: function() {
			this.oModel = new XMLModel();
			this.oModel.setXML(testData);
			sap.ui.getCore().setModel(this.oModel);
			this.aTextFields = null;
		},
		afterEach: function() {
			if ( Array.isArray(this.aTextFields) ) {
				// reset stuff
				this.aTextFields.forEach(function(entry) {
					entry.destroy();
				});
				this.aTextFields = null;
			}
			sap.ui.getCore().setModel(null);
			this.oModel.destroy();
		},
		createPropertyBindingsUI: function(sName, property, sMode) {
			// create bindings
			var aTextFields = this.aTextFields = [],
				i, oTextField;

			for (i = 0; i < 7; i++){
				oTextField = new CommonsTextField();
				oTextField.bindProperty(sName, "/clients/member/" + i + "/" + property, null, sMode);
				oTextField.placeAt("target1");
				aTextFields.push(oTextField);
			}

			return aTextFields;
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
		var aTextFields = this.createPropertyBindingsUI("value", "@firstName", "");

		assert.equal(aTextFields.length, 7, "check amount");

		var counter = 0;
		// try to modify value
		aTextFields.forEach(function(oTextField, i) {
			oTextField.setValue("ggg" + i);
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
		var aTextFields = this.createPropertyBindingsUI("value", "@firstName", "");

		assert.equal(aTextFields.length, 7, "check amount");

		var counter = 0;
		// try to modify value
		aTextFields.forEach(function(oTextField, i) {
			oTextField.setValue("ggg" + i);
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
		var aTextFields = this.createPropertyBindingsUI("value", "@firstName", BindingMode.TwoWay);

		var counter = 0;
		// try to modify value
		aTextFields.forEach(function(oTextField, i) {
			oTextField.setValue("ggg" + i);
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
		var aTextFields = this.createPropertyBindingsUI("value", "@firstName", BindingMode.OneWay);

		var counter = 0;
		// try to modify value
		aTextFields.forEach(function(oTextField, i) {
			oTextField.setValue("ggg" + i);
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
		var oModel2 = new sap.ui.model.json.JSONModel();
		oModel2.setData({
			test : [
				{enabled:true}
			]
		});
		sap.ui.getCore().setModel(oModel2, "model2");

		// create bindings
		var oTextField = new CommonsTextField();
		oTextField.bindProperty("value", "/clients/member/0/@lastName");
		oTextField.bindProperty("enabled", "model2>/test/0/enabled");
		oTextField.placeAt("target1");

		var oValue = this.oModel.getProperty("/clients/member/0/@lastName");
		assert.equal(oValue, "Duck", "old value check");
		var bEnabled = oModel2.getProperty("/test/0/enabled");
		assert.ok(bEnabled, "old value check");

		// modify
		oTextField.setValue("newValue");
		oTextField.setEnabled(false);

		//check
		oValue = this.oModel.getProperty("/clients/member/0/@lastName");
		assert.equal(oValue, "newValue", "new value check");
		bEnabled = oModel2.getProperty("/test/0/enabled");
		assert.ok(!bEnabled, "new value check");

		// cleanup
		oTextField.destroy();
	});

	QUnit.test("One Way with multimodels", function(assert) {

		// create 2nd model
		var oModel2 = new sap.ui.model.json.JSONModel();
		oModel2.setData({
			test : [
				{enabled:true}
			]
		});
		sap.ui.getCore().setModel(oModel2, "model2");
		oModel2.setDefaultBindingMode(BindingMode.OneWay);

		// create bindings
		var oTextField = new CommonsTextField();
		oTextField.bindProperty("value", "/clients/member/0/@lastName");
		oTextField.bindProperty("enabled", "model2>/test/0/enabled");
		oTextField.placeAt("target1");

		var oValue = this.oModel.getProperty("/clients/member/0/@lastName");
		assert.equal(oValue, "Duck", "old value check");
		var bEnabled = oModel2.getProperty("/test/0/enabled");
		assert.ok(bEnabled, "old value check");

		// modify
		oTextField.setValue("newValue");
		oTextField.setEnabled(false);

		// check
		oValue = this.oModel.getProperty("/clients/member/0/@lastName");
		assert.equal(oValue, "newValue", "new value check");
		bEnabled = oModel2.getProperty("/test/0/enabled");
		assert.ok(bEnabled, "new value check");

		// cleanup
		oTextField.destroy();
	});

	QUnit.test("One Time model test", function(assert) {
		// should be set first before any binding creation
		this.oModel.setDefaultBindingMode(BindingMode.OneTime);
		var aTextFields = this.createPropertyBindingsUI("value", "@firstName");

		assert.equal(aTextFields.length, 7, "check amount");


		var counter = 0;
		// try to modify value
		aTextFields.forEach(function(oTextField, i) {
			oTextField.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/member/" + i + "/@firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue != "ggg" + i, "check value should not have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, 7, "check amount");

		// modify value in model...nothing should change in UI
		aTextFields.forEach(function(oTextField, i) {
			this.oModel.setProperty("/clients/member/" + i + "/@firstName", "newmodelvalue" + i);
			var oValue = this.oModel.getProperty("/clients/member/" + i + "/@firstName");
			assert.equal(oValue, "newmodelvalue" + i, "new model value");
		}, this);

		aTextFields.forEach(function(oTextField, i) {
			var oValue = oTextField.getValue();
			// check model value
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue == "ggg" + i, "check value should not have changed in control " + oValue);
			counter++;
		});

	});

	QUnit.test("One Way model with One Time bindings", function(assert) {
		this.oModel.setDefaultBindingMode(BindingMode.OneWay);
		var aTextFields = this.createPropertyBindingsUI("value", "@firstName", BindingMode.OneTime);

		var counter = 0;
		// try to modify value
		aTextFields.forEach(function(oTextField, i) {
			oTextField.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/member/" + i + "/@firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue != "ggg" + i, "check value should not have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, 7, "check amount");

		// modify value in model...nothing should change in UI
		aTextFields.forEach(function(oTextField, i) {
			this.oModel.setProperty("/clients/member/" + i + "/@firstName", "newmodelvalue" + i);
			var oValue = this.oModel.getProperty("/clients/member/" + i + "/@firstName");
			assert.equal(oValue, "newmodelvalue" + i, "new model value");
		}, this);

		aTextFields.forEach(function(oTextField, i) {
			var oValue = oTextField.getValue();
			// check model value
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue == "ggg" + i, "check value should not have changed in control " + oValue);
			counter++;
		});

	});

	QUnit.test("Two Way model with One Time bindings", function(assert) {
		//this.oModel.setDefaultBindingMode(BindingMode.TwoWay);
		var aTextFields = this.createPropertyBindingsUI("value", "@firstName", BindingMode.OneTime);

		var counter = 0;
		// try to modify value
		aTextFields.forEach(function(oTextField, i) {
			oTextField.setValue("ggg" + i);
			// check model value
			var oValue = this.oModel.getProperty("/clients/member/" + i + "/@firstName");
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue != "ggg" + i, "check value should not have changed in model: " + oValue);
			counter++;
		}, this);
		assert.equal(counter, 7, "check amount");

		// modify value in model...nothing should change in UI
		aTextFields.forEach(function(oTextField, i) {
			this.oModel.setProperty("/clients/member/" + i + "/@firstName", "newmodelvalue" + i);
			var oValue = this.oModel.getProperty("/clients/member/" + i + "/@firstName");
			assert.equal(oValue, "newmodelvalue" + i, "new model value");
		}, this);

		aTextFields.forEach(function(oTextField, i) {
			var oValue = oTextField.getValue();
			// check model value
			assert.ok(oValue != null, "value null check");
			assert.ok(oValue == "ggg" + i, "check value should not have changed in control " + oValue);
			counter++;
		});
	});

});
