/*global QUnit */
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/BindingMode",
	"sap/ui/model/type/Float",
	"sap/ui/model/type/Date",
	"sap/m/Label",
	"sap/m/Input"
], function(
	JSONModel,
	ChangeReason,
	BindingMode,
	FloatType,
	DateType,
	Label,
	Input
) {
	"use strict";

	//add divs for control tests
	var oTarget1 = document.createElement("div");
	oTarget1.id = "target1";
	document.body.appendChild(oTarget1);

	var constTestData = {
		name: "Peter",
		teamMembers: [
			{firstName:"Andreas", lastName:"Klark", gender:"male"},
			{firstName:"Peter", lastName:"Miller", gender:"male"},
			{firstName:"Gina", lastName:"Rush", gender:"female"},
			{firstName:"Steave", lastName:"Ander", gender:"male"},
			{firstName:"Michael", lastName:"Spring", gender:"male"},
			{firstName:"Marc", lastName:"Green", gender:"male"},
			{firstName:"Frank", lastName:"Wallace", gender:"male"}
		],
		values: [
			{value : 3.55},
			{value : 5.322},
			{value : 222.322}
		],
		rawdate: new Date(2018,3,30),
		rawnumber: 3,
		internaldate: "2018-04-30",
		internalnumber: "3.000"
	};

	function clone(data) {
		return JSON.parse(JSON.stringify(constTestData));
	}

	QUnit.module("PropertyBinding", {
		beforeEach: function() {
			// Note: some tests modify the model data, therefore we clone it
			this.currentTestData = clone(constTestData);
			this.currentTestData.rawdate = new Date(2018,3,30); //JSON cloning breaks Date objects
			this.oModel = new JSONModel();
			this.oModel.setData(this.currentTestData);
			sap.ui.getCore().setModel(this.oModel);
		},
		afterEach: function() {
			sap.ui.getCore().setModel(null);
			this.oModel.destroy();
		},
		createPropertyBindings: function(path, property, context) {
			// create bindings
			return this.currentTestData[path.substr(1)].map(function(entry, i) {
				return this.oModel.bindProperty(path + "/" + i + "/" + property, context);
				//this.oModel.bindProperty(".teamMembers.lastName", entry.lastName);
			}, this);
		}
	});

	QUnit.test("PropertyBinding getValue", function(assert) {
		var bindings = this.createPropertyBindings("/teamMembers", "lastName");

		bindings.forEach(function(binding, i) {
			assert.equal(binding.getValue(), this.currentTestData.teamMembers[i].lastName, "Property binding value");
		}, this);
	});

	QUnit.test("PropertyBinding refresh", function(assert) {
		assert.expect(3);
		var oBinding = this.oModel.bindProperty("/name");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		oBinding.attachChange(function() {
			assert.ok("Property Binding fires change event when changed");
		});
		this.currentTestData.name = "Jonas";
		oBinding.refresh();
		assert.equal(oBinding.getValue(), "Jonas", "Property Binding returns changed value");
	});

	QUnit.test("PropertyBinding async update", function(assert) {
		assert.expect(4);
		var oBinding1 = this.oModel.bindProperty("/name"),
			oBinding2 = this.oModel.bindProperty("/name");
		oBinding1.attachChange(function(){});
		oBinding2.attachChange(function(){});
		oBinding1.initialize();
		oBinding2.initialize();
		assert.equal(oBinding1.getValue(), "Peter", "Property Binding 1 returns value");
		oBinding1.setValue("Jonas");
		assert.equal(oBinding1.getValue(), "Jonas", "Property Binding 1 returns updated value");
		assert.equal(oBinding2.getValue(), "Peter", "Property Binding 2 returns old value");
		this.oModel.refresh();
		assert.equal(oBinding2.getValue(), "Jonas", "Property Binding 2 returns updated value after refresh");
	});

	QUnit.test("PropertyBinding getExternalValue", function(assert) {
		var bindings = this.createPropertyBindings("/values", "value");

		bindings.forEach(function(binding, i) {
			assert.equal(binding.getExternalValue(), this.currentTestData.values[i].value, "Property binding value");
		}, this);

		bindings.forEach(function(binding, i) {
			binding.setType(new FloatType(), "string");
			assert.equal(binding.getExternalValue(), this.currentTestData.values[i].value.toString(), "Property binding value");
		}, this);

	});

	QUnit.test("PropertyBinding setExternalValue", function(assert) {
		var bindings = this.createPropertyBindings("/values", "value");

		this.attach = false;
		this.detach = true;

		function callBackOnChange() {
			this.attach = true;
			this.detach = false;
		}

		bindings.forEach(function(binding, i) {
			binding.attachChange(callBackOnChange);
			binding.setType(new FloatType(), "string");
			binding.setExternalValue((binding.getValue() + i).toString());
			assert.equal(binding.getValue(), this.currentTestData.values[i].value, "Property binding value " + this.currentTestData.values[i].value);
			assert.equal(binding.getExternalValue(), this.currentTestData.values[i].value.toString(), "Property binding value " + this.currentTestData.values[i].value);

			binding.setValue((binding.getValue() + i));
			assert.equal(binding.getValue(), this.currentTestData.values[i].value, "Property binding value " + this.currentTestData.values[i].value);
			assert.equal(binding.getExternalValue(), this.currentTestData.values[i].value.toString(), "Property binding value " + this.currentTestData.values[i].value);

			binding.detachChange(callBackOnChange);
		}, this);

	});

	QUnit.test("PropertyBinding getRawValue", function(assert) {
		var oDateBinding = this.oModel.bindProperty("/rawdate"),
			oFloatBinding = this.oModel.bindProperty("/rawnumber");
		oDateBinding.setType(new DateType({pattern:"yyyy-MM-dd"}), "string");
		oFloatBinding.setType(new FloatType({decimals: 3}), "string");
		assert.deepEqual(oDateBinding.getRawValue(), new Date(2018,3,30), "getRawValues returns raw values");
		assert.strictEqual(oFloatBinding.getRawValue(), 3, "getRawValues returns raw values");
	});

	QUnit.test("PropertyBinding setRawValue", function(assert) {
		var oDateBinding = this.oModel.bindProperty("/rawdate"),
			oFloatBinding = this.oModel.bindProperty("/rawnumber");
		oDateBinding.setType(new DateType({pattern:"yyyy-MM-dd"}), "string");
		oFloatBinding.setType(new FloatType({decimals: 3}), "string");
		oDateBinding.setRawValue(new Date(2018,7,30));
		assert.equal(oDateBinding.getExternalValue(), "2018-08-30", "setRawValue changes binding value");
		oFloatBinding.setRawValue(5);
		assert.equal(oFloatBinding.getExternalValue(), "5.000", "setRawValue changes binding value");
		});

	QUnit.test("PropertyBinding getInternalValue", function(assert) {
		var oDateBinding = this.oModel.bindProperty("/internaldate"),
			oFloatBinding = this.oModel.bindProperty("/internalnumber");
		oDateBinding.setType(new DateType({source:{pattern:"yyyy-MM-dd"}}), "string");
		oFloatBinding.setType(new FloatType({source:{decimals: 3}}), "string");
		assert.deepEqual(oDateBinding.getInternalValue(), new Date(2018,3,30), "getInternvalValues returns internal values");
		assert.strictEqual(oFloatBinding.getInternalValue(), 3, "getInternvalValues returns internval values");
	});

	QUnit.test("PropertyBinding setInternalValue", function(assert) {
		var oDateBinding = this.oModel.bindProperty("/internaldate"),
			oFloatBinding = this.oModel.bindProperty("/inernalnumber");
		oDateBinding.setType(new DateType({source:{pattern:"yyyy-MM-dd"}}), "string");
		oFloatBinding.setType(new FloatType({source:{decimals: 3}}), "string");
		oDateBinding.setInternalValue(new Date(2018,7,30));
		assert.equal(oDateBinding.getRawValue(), "2018-08-30", "setInternalValue changes binding value");
		oFloatBinding.setInternalValue(5);
		assert.equal(oFloatBinding.getRawValue(), "5.000", "setInternalValue changes binding value");
	});

	QUnit.test("PropertyBinding binding mode", function(assert) {
		var oLabel = new Label("myLabel");
		oLabel.setModel(this.oModel);
		oLabel.bindProperty("text", "/teamMembers/1/firstName");
		var oBinding = oLabel.getBinding("text");
		var oBindingInfo = oLabel.getBindingInfo("text");
		assert.ok(oBindingInfo.parts[0].mode === undefined, "Binding mode = default");
		assert.equal(oBinding.getBindingMode(), BindingMode.TwoWay, "Binding mode = TwoWay");

		var oOtherModel = new JSONModel();
		oOtherModel.setData(clone(constTestData));
		oOtherModel.setDefaultBindingMode(BindingMode.OneWay);
		oLabel.setModel(oOtherModel);
		oBinding = oLabel.getBinding("text");
		assert.equal(oBinding.getBindingMode(), BindingMode.OneWay, "Binding mode = OneWay");
		oLabel.bindProperty("text", {path:"/teamMembers/1/firstName",mode:"OneTime"});
		oBindingInfo = oLabel.getBindingInfo("text");
		oBinding = oLabel.getBinding("text");
		assert.ok(oBindingInfo.parts[0].mode === "OneTime", "Binding mode = OneTime");
		assert.equal(oBinding.getBindingMode(), BindingMode.OneTime, "Binding mode = OneTime");
		oOtherModel.destroy();
		oLabel.destroy();
	});

	QUnit.test("PropertyBinding suspend/resume with control value change", function(assert) {
		var done = assert.async();
		var oInput = new Input({
			value: "{/name}"
		});
		oInput.placeAt("target1");
		oInput.attachChange(function() {
			assert.ok(false, "should not land here!");
		});
		var oBinding = oInput.getBinding("value");
		oBinding.attachChange(function() {
			assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
			assert.equal(oBinding.oValue, "Peter", "Property Binding internal value");
			assert.equal(this.oModel.getProperty("/name"), "Peter", "model value");
			assert.equal(oInput.getValue(), "Peter", "Input field returns value");
			oInput.destroy();
			done();
		});
		assert.ok(oBinding !== undefined, "binding check");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		oBinding.suspend();
		oInput.setValue("Petre");
		assert.equal(oInput.getValue(), "Petre", "Input field returns value");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oBinding.oValue, "Peter", "Property Binding internal value");
		assert.equal(this.oModel.getProperty("/name"), "Peter", "model value");

		oBinding.resume();
	});

	QUnit.test("PropertyBinding suspend/resume with model value change", function(assert) {
		var done = assert.async();
		var oInput = new Input({
			value: "{/name}"
		});
		oInput.placeAt("target1");
		oInput.attachChange(this, function() {
			assert.ok(false, "should not land here!");
		});
		var oBinding = oInput.getBinding("value");
		oBinding.attachChange(function() {
			assert.equal(oBinding.getValue(), "Petre", "Property Binding returns value");
			assert.equal(oBinding.oValue, "Petre", "Property Binding internal value");
			assert.equal(this.oModel.getProperty("/name"), "Petre", "model value");
			assert.equal(oInput.getValue(), "Petre", "Input field returns value");
			oInput.destroy();
			done();
		});
		assert.ok(oBinding !== undefined, "binding check");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oInput.getValue(), "Peter", "Input field returns value");
		oBinding.suspend();
		this.oModel.setProperty("/name", "Petre");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oBinding.oValue, "Peter", "Property Binding internal value");
		assert.equal(this.oModel.getProperty("/name"), "Petre", "model value");
		assert.equal(oInput.getValue(), "Peter", "Input field returns value");

		oBinding.resume();
	});

	QUnit.test("PropertyBinding suspend/resume with control and model value change", function(assert) {
		var done = assert.async();
		var oInput = new Input({
			value: "{/name}"
		});
		oInput.placeAt("target1");
		oInput.attachChange(this, function() {
			assert.ok(false, "should not land here!");
		});
		var oBinding = oInput.getBinding("value");
		oBinding.attachChange(function() {
			assert.equal(oBinding.getValue(), "Petre", "Property Binding returns value");
			assert.equal(oBinding.oValue, "Petre", "Property Binding internal value");
			assert.equal(this.oModel.getProperty("/name"), "Petre", "model value");
			assert.equal(oInput.getValue(), "Petre", "Input field returns value");
			oInput.destroy();
			done();
		});
		assert.ok(oBinding !== undefined, "binding check");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oInput.getValue(), "Peter", "Input field returns value");
		oBinding.suspend();
		oInput.setValue("Petrus");
		assert.equal(oInput.getValue(), "Petrus", "Input field returns value");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oBinding.oValue, "Peter", "Property Binding internal value");
		oBinding.setValue("xxx");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oBinding.oValue, "Peter", "Property Binding internal value");
		assert.equal(this.oModel.getProperty("/name"), "Peter", "model value");
		this.oModel.setProperty("/name", "Petre");
		assert.equal(oInput.getValue(), "Petrus", "Input field returns value");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oBinding.oValue, "Peter", "Property Binding internal value");
		assert.equal(this.oModel.getProperty("/name"), "Petre", "model value");

		oBinding.resume();
	});

	QUnit.test("PropertyBinding suspend/resume with model and control value change", function(assert) {
		var done = assert.async();
		var oInput = new Input({
			value: "{/name}"
		});
		oInput.placeAt("target1");
		oInput.attachChange(this, function() {
			assert.ok(false, "should not land here!");
		});
		var oBinding = oInput.getBinding("value");
		oBinding.attachChange(function() {
			assert.equal(oBinding.getValue(), "Petre", "Property Binding returns value");
			assert.equal(oBinding.oValue, "Petre", "Property Binding internal value");
			assert.equal(this.oModel.getProperty("/name"), "Petre", "model value");
			assert.equal(oInput.getValue(), "Petre", "Input field returns value");
			oInput.destroy();
			done();
		});
		assert.ok(oBinding !== undefined, "binding check");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oInput.getValue(), "Peter", "Input field returns value");
		oBinding.suspend();
		this.oModel.setProperty("/name", "Petre");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oBinding.oValue, "Peter", "Property Binding internal value");
		assert.equal(oInput.getValue(), "Peter", "Input field returns value");
		assert.equal(this.oModel.getProperty("/name"), "Petre", "model value");
		oInput.setValue("Petrus");
		assert.equal(oInput.getValue(), "Petrus", "Input field returns value");
		assert.equal(oBinding.getValue(), "Peter", "Property Binding returns value");
		assert.equal(oBinding.oValue, "Peter", "Property Binding internal value");
		assert.equal(this.oModel.getProperty("/name"), "Petre", "model value");
		oBinding.resume();
	});

	QUnit.test("propertyChange event", function(assert) {
		var done = assert.async();
		var oInput = new Input({
			value: "{/name}"
		});
		oInput.placeAt("target1");
		this.oModel.attachPropertyChange(this, function(oEvent) {
			var sPath = oEvent.getParameter('path');
			var oContext = oEvent.getParameter('context');
			var oValue = oEvent.getParameter('value');
			var sReason = oEvent.getParameter('reason');
			assert.equal(sPath, "/name", "path check!");
			assert.equal(oContext, undefined, "context check!");
			assert.equal(oValue, "blubb", "property value check!");
			assert.equal(sReason, ChangeReason.Binding, "property reason check!");
			oInput.destroy();
			done();
		});
		var oBinding = oInput.getBinding("value");
		assert.ok(oBinding !== undefined, "binding check");
		// should not trigger event
		this.oModel.setProperty(oBinding.getPath(), "blubb2", oBinding.getContext());
		// should trigger event
		oInput.setValue("blubb");
	});

	QUnit.test("propertyChange event relative", function(assert) {
		var done = assert.async();
		var oInput = new Input({
			value: "{firstName}"
		});
		oInput.placeAt("target1");
		this.oModel.attachPropertyChange(this, function(oEvent) {
			var sPath = oEvent.getParameter('path');
			var oContext = oEvent.getParameter('context');
			var oValue = oEvent.getParameter('value');
			var sReason = oEvent.getParameter('reason');
			assert.equal(sPath, "firstName", "path check!");
			assert.equal(oContext.getPath(), "/teamMembers/1", "context check!");
			assert.equal(oValue, "blubb", "property value check!");
			assert.equal(sReason, ChangeReason.Binding, "property reason check!");
			oInput.destroy();
			done();
		});
		oInput.bindObject("/teamMembers/1");
		var oBinding = oInput.getBinding("value");
		assert.ok(oBinding !== undefined, "binding check");
		// should not trigger event
		this.oModel.setProperty(oBinding.getPath(), "blubb2", oBinding.getContext());
		// should trigger event
		oInput.setValue("blubb");
	});

	QUnit.test("propertyChange event reset", function(assert) {
		var done = assert.async();
		var oInput = new Input({
			value: "{firstName}"
		});
		var iCount = 0;
		oInput.placeAt("target1");
		this.oModel.attachPropertyChange(this, function(oEvent) {
			iCount++;
			var sPath = oEvent.getParameter('path');
			var oContext = oEvent.getParameter('context');
			var oValue = oEvent.getParameter('value');
			var sReason = oEvent.getParameter('reason');
			if (iCount === 1) {
				assert.equal(sPath, "firstName", "path check!");
				assert.equal(oContext.getPath(), "/teamMembers/1", "context check!");
				assert.equal(oValue, "blubb", "property value check!");
				assert.equal(sReason, ChangeReason.Binding, "property reason check!");
				oInput.setValue("Andreas");

			} else if (iCount === 2) {
				assert.equal(sPath, "firstName", "path check!");
				assert.equal(oContext.getPath(), "/teamMembers/1", "context check!");
				assert.equal(oValue, "Andreas", "property value check!");
				assert.equal(sReason, ChangeReason.Binding, "property reason check!");
			}
		});
		oInput.bindObject("/teamMembers/1");
		var oBinding = oInput.getBinding("value");
		assert.ok(oBinding !== undefined, "binding check");
		// should trigger event
		oInput.setValue("blubb");
		oInput.destroy();
		done();
	});
});