/*global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/util/deepClone",
	"sap/m/Input",
	"sap/m/Label",
	"sap/ui/core/date/UI5Date",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/BindingMode",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Float",
	"sap/ui/model/type/Date"
], function (Localization, deepClone, Input, Label, UI5Date, ChangeReason, BindingMode, FormatException,
		ParseException, SimpleType, ValidateException, JSONModel, FloatType, DateType
) {
	"use strict";

	var sDefaultLanguage = Localization.getLanguage();

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
		rawdate: UI5Date.getInstance(2018, 3, 30),
		rawnumber: 3,
		internaldate: "2018-04-30",
		internalnumber: "3.000"
	};

	var AsyncFloat = SimpleType.extend("AsyncFloat", {
		constructor: function(oFormatOptions, oConstraints) {
			SimpleType.apply(this, arguments);
			this.oFloat = new FloatType(oFormatOptions, oConstraints);
		},
		formatValue: function(oValue, sInternalType) {
			var that = this;
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					try {
						resolve(that.oFloat.formatValue(oValue, sInternalType));
					} catch (oException) {
						reject(oException);
					}
				}, 0);
			});
		},
		parseValue: function(oValue, sInternalType) {
			var that = this;
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					try {
						resolve(that.oFloat.parseValue(oValue, sInternalType));
					} catch (oException) {
						reject(oException);
					}
				}, 0);
			});
		},
		validateValue: function(oValue) {
			var that = this;
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					try {
						that.oFloat.validateValue(oValue);
						resolve(oValue);
					} catch (oException) {
						reject(oException);
					}
				}, 0);
			});
		},
		getModelFormat: function() {
			return this.oFloat.getModelFormat();
		}
	});

	QUnit.module("sap.ui.model.json.JSONPropertyBinding: Basic functionality", {
		beforeEach: function() {
			// Note: some tests modify the model data, therefore we clone it
			this.currentTestData = deepClone(constTestData);
			this.oModel = new JSONModel();
			this.oModel.setData(this.currentTestData);
			Localization.setLanguage("en-US");
		},
		afterEach: function() {
			this.oModel.destroy();
			Localization.setLanguage(sDefaultLanguage);
		},
		createPropertyBindings: function(path, property, context) {
			// create bindings
			return this.currentTestData[path.substr(1)].map(function(entry, i) {
				return this.oModel.bindProperty(path + "/" + i + "/" + property, context);
				//this.oModel.bindProperty(".teamMembers.lastName", entry.lastName);
			}, this);
		}
	});

	QUnit.test("getValue", function(assert) {
		var bindings = this.createPropertyBindings("/teamMembers", "lastName");

		bindings.forEach(function(binding, i) {
			assert.equal(binding.getValue(), this.currentTestData.teamMembers[i].lastName, "Property binding value");
		}, this);
	});

	QUnit.test("getValue __name__", function(assert) {
		var context = this.oModel.createBindingContext("/teamMembers/0/lastName"),
			binding = this.oModel.bindProperty("__name__", context);

		assert.equal(binding.getValue(), "lastName", "Property binding __name__ returns key");

		binding = this.oModel.bindProperty("__name__");

		assert.equal(binding.getValue(), undefined, "Property binding __name__ returns undefined without context");
	});

	QUnit.test("refresh", function(assert) {
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

	QUnit.test("async update", function(assert) {
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

	QUnit.test("getExternalValue", function(assert) {
		var bindings = this.createPropertyBindings("/values", "value");

		bindings.forEach(function(binding, i) {
			assert.equal(binding.getExternalValue(), this.currentTestData.values[i].value, "Property binding value");
		}, this);

		bindings.forEach(function(binding, i) {
			binding.setType(new FloatType(), "string");
			assert.equal(binding.getExternalValue(), this.currentTestData.values[i].value.toString(), "Property binding value");
		}, this);

	});

	QUnit.test("setExternalValue", function(assert) {
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

	QUnit.test("getRawValue", function(assert) {
		var oDateBinding = this.oModel.bindProperty("/rawdate"),
			oFloatBinding = this.oModel.bindProperty("/rawnumber");
		oDateBinding.setType(new DateType({pattern:"yyyy-MM-dd"}), "string");
		oFloatBinding.setType(new FloatType({decimals: 3}), "string");
		assert.deepEqual(oDateBinding.getRawValue(), UI5Date.getInstance(2018, 3, 30),
			"getRawValues returns raw values");
		assert.strictEqual(oFloatBinding.getRawValue(), 3, "getRawValues returns raw values");
	});

	QUnit.test("setRawValue", function(assert) {
		var oDateBinding = this.oModel.bindProperty("/rawdate"),
			oFloatBinding = this.oModel.bindProperty("/rawnumber");
		oDateBinding.setType(new DateType({pattern:"yyyy-MM-dd"}), "string");
		oFloatBinding.setType(new FloatType({decimals: 3}), "string");
		oDateBinding.setRawValue(UI5Date.getInstance(2018, 7, 30));
		assert.equal(oDateBinding.getExternalValue(), "2018-08-30", "setRawValue changes binding value");
		oFloatBinding.setRawValue(5);
		assert.equal(oFloatBinding.getExternalValue(), "5.000", "setRawValue changes binding value");
	});

	QUnit.test("getInternalValue", function(assert) {
		var oDateBinding = this.oModel.bindProperty("/internaldate"),
			oFloatBinding = this.oModel.bindProperty("/internalnumber");
		oDateBinding.setType(new DateType({source:{pattern:"yyyy-MM-dd"}}), "string");
		oFloatBinding.setType(new FloatType({source:{decimals: 3}}), "string");
		assert.deepEqual(oDateBinding.getInternalValue(), UI5Date.getInstance(2018, 3, 30),
			"getInternvalValues returns internal values");
		assert.strictEqual(oFloatBinding.getInternalValue(), 3, "getInternvalValues returns internal values");
	});

	QUnit.test("setInternalValue", function(assert) {
		var oDateBinding = this.oModel.bindProperty("/internaldate"),
			oFloatBinding = this.oModel.bindProperty("/inernalnumber");
		oDateBinding.setType(new DateType({source:{pattern:"yyyy-MM-dd"}}), "string");
		oFloatBinding.setType(new FloatType({source:{decimals: 3}}), "string");
		oDateBinding.setInternalValue(UI5Date.getInstance(2018, 7, 30));
		assert.equal(oDateBinding.getRawValue(), "2018-08-30", "setInternalValue changes binding value");
		oFloatBinding.setInternalValue(5);
		assert.equal(oFloatBinding.getRawValue(), "5.000", "setInternalValue changes binding value");
	});

	QUnit.test("with internal type raw/internal", function(assert) {
		var oDateBinding = this.oModel.bindProperty("/internaldate"),
			oFloatBinding = this.oModel.bindProperty("/internalnumber");
		oDateBinding.setType(new DateType({source:{pattern:"yyyy-MM-dd"}}), "raw");
		oFloatBinding.setType(new FloatType({source:{decimals: 3}}), "raw");
		assert.deepEqual(oDateBinding.getExternalValue(), "2018-04-30", "getExternalValue returns raw values");
		assert.strictEqual(oFloatBinding.getExternalValue(), "3.000", "getExternalValue returns raw values");
		oDateBinding.setType(new DateType({source:{pattern:"yyyy-MM-dd"}}), "internal");
		oFloatBinding.setType(new FloatType({source:{decimals: 3}}), "internal");
		assert.deepEqual(oDateBinding.getExternalValue(), UI5Date.getInstance(2018, 3, 30),
			"getExternalValue returns internal values");
		assert.strictEqual(oFloatBinding.getExternalValue(), 3, "getExternalValue returns internal values");
	});

	QUnit.test("binding mode", function(assert) {
		var oLabel = new Label("myLabel");
		oLabel.setModel(this.oModel);
		oLabel.bindProperty("text", "/teamMembers/1/firstName");
		var oBinding = oLabel.getBinding("text");
		var oBindingInfo = oLabel.getBindingInfo("text");
		assert.ok(oBindingInfo.parts[0].mode === undefined, "Binding mode = default");
		assert.equal(oBinding.getBindingMode(), BindingMode.TwoWay, "Binding mode = TwoWay");

		var oOtherModel = new JSONModel();
		oOtherModel.setData(deepClone(constTestData));
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

	QUnit.module("sap.ui.model.json.JSONPropertyBinding: Async Type", {
		beforeEach: function() {
			// Note: some tests modify the model data, therefore we clone it
			this.currentTestData = deepClone(constTestData);
			this.oModel = new JSONModel();
			this.oModel.setData(this.currentTestData);
			Localization.setLanguage("en-US");
		},
		afterEach: function() {
			this.oModel.destroy();
			Localization.setLanguage(sDefaultLanguage);
		},
		createPropertyBindings: function(path, property, context) {
			// create bindings
			return this.currentTestData[path.substr(1)].map(function(entry, i) {
				return this.oModel.bindProperty(path + "/" + i + "/" + property, context);
				//this.oModel.bindProperty(".teamMembers.lastName", entry.lastName);
			}, this);
		}
	});

	QUnit.test("getExternalValue", function(assert) {
		var oFloatBinding = this.oModel.bindProperty("/rawnumber");
		oFloatBinding.setType(new AsyncFloat({decimals: 3}, {maximum: 10}), "string");
		return oFloatBinding.getExternalValue().then(function(fValue) {
			assert.strictEqual(fValue, "3.000", "getExternalValue returns formatted value asynchronously");
		});
	});

	QUnit.test("getExternalValue failed format", function(assert) {
		var oFloatBinding = this.oModel.bindProperty("/rawnumber");
		oFloatBinding.setType(new AsyncFloat({decimals: 3}, {maximum: 10}), "boolean");
		return oFloatBinding.getExternalValue().catch(function(oException) {
			assert.ok(oException instanceof FormatException, "Invalid target type rejects with FormatException");
		});
	});

	QUnit.test("setExternalValue", function(assert) {
		var oFloatBinding = this.oModel.bindProperty("/rawnumber");
		oFloatBinding.setType(new AsyncFloat({decimals: 3}, {maximum: 10}), "string");
		return oFloatBinding.setExternalValue("5.000").then(function() {
			assert.strictEqual(this.oModel.getProperty("/rawnumber"), 5, "setExternalValue updates model value async");
		}.bind(this));
	});

	QUnit.test("setExternalValue failed parse", function(assert) {
		var oFloatBinding = this.oModel.bindProperty("/rawnumber");
		oFloatBinding.setType(new AsyncFloat({decimals: 3}, {maximum: 10}), "string");
		return oFloatBinding.setExternalValue("xyz").catch(function(oException) {
			assert.ok(oException instanceof ParseException, "Unparsable value rejects with ParseException");
		});
	});

	QUnit.test("setExternalValue failed validation", function(assert) {
		var oFloatBinding = this.oModel.bindProperty("/rawnumber");
		oFloatBinding.setType(new AsyncFloat({decimals: 3}, {maximum: 10}), "string");
		return oFloatBinding.setExternalValue("11.000").catch(function(oException) {
			assert.ok(oException instanceof ValidateException, "Invalid value rejects with ValidateException");
		});
	});

	QUnit.test("getRawValue", function(assert) {
		var oFloatBinding = this.oModel.bindProperty("/rawnumber");
		oFloatBinding.setType(new AsyncFloat({decimals: 3}, {maximum: 10}), "string");
		assert.strictEqual(oFloatBinding.getRawValue(), 3, "getRawValues returns raw values synchronously");
	});

	QUnit.test("setRawValue", function(assert) {
		var oFloatBinding = this.oModel.bindProperty("/rawnumber");
		oFloatBinding.setType(new AsyncFloat({decimals: 3}, {maximum: 10}), "string");
		return oFloatBinding.setRawValue(5).then(function() {
			assert.strictEqual(this.oModel.getProperty("/rawnumber"), 5, "setRawValue updates model value async");
		}.bind(this));
	});

	QUnit.test("setRawValue failed validation", function(assert) {
		var oFloatBinding = this.oModel.bindProperty("/rawnumber");
		oFloatBinding.setType(new AsyncFloat({decimals: 3}, {maximum: 10}), "string");
		return oFloatBinding.setRawValue(11).catch(function(oException) {
			assert.ok(oException instanceof ValidateException, "Invalid value rejects with ValidateException");
		});
	});

	QUnit.test("getInternalValue", function(assert) {
		var oFloatBinding = this.oModel.bindProperty("/internalnumber");
		oFloatBinding.setType(new AsyncFloat({source:{decimals: 3}}, {maximum: 10}), "string");
		assert.strictEqual(oFloatBinding.getInternalValue(), 3, "getInternalValue returns internal values synchronously");
	});

	QUnit.test("setInternalValue", function(assert) {
		var oFloatBinding = this.oModel.bindProperty("/internalnumber");
		oFloatBinding.setType(new AsyncFloat({source:{decimals: 3}}, {maximum: 10}), "string");
		return oFloatBinding.setInternalValue(5).then(function() {
			assert.strictEqual(this.oModel.getProperty("/internalnumber"), "5.000", "setInternalValue updates model value async");
		}.bind(this));
	});

	QUnit.test("setInternalValue failed validation", function(assert) {
		var oFloatBinding = this.oModel.bindProperty("/internalnumber");
		oFloatBinding.setType(new AsyncFloat({source:{decimals: 3}}, {maximum: 10}), "string");
		return oFloatBinding.setInternalValue(11).catch(function(oException) {
			assert.ok(oException instanceof ValidateException, "Invalid value rejects with ValidateException");
		});
	});

	QUnit.module("sap.ui.model.json.JSONPropertyBinding: Suspend/Resume", {
		beforeEach: function() {
			// Note: some tests modify the model data, therefore we clone it
			this.currentTestData = deepClone(constTestData);
			this.oModel = new JSONModel();
			this.oModel.setData(this.currentTestData);
		},
		afterEach: function() {
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

	QUnit.test("suspend/resume with control value change", function(assert) {
		var done = assert.async();
		var oInput = new Input({
			value: "{/name}"
		});
		oInput.setModel(this.oModel);
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

	QUnit.test("suspend/resume with model value change", function(assert) {
		var done = assert.async();
		var oInput = new Input({
			value: "{/name}"
		});
		oInput.setModel(this.oModel);
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

	QUnit.test("suspend/resume with control and model value change", function(assert) {
		var done = assert.async();
		var oInput = new Input({
			value: "{/name}"
		});
		oInput.setModel(this.oModel);
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

	QUnit.test("suspend/resume with model and control value change", function(assert) {
		var done = assert.async();
		var oInput = new Input({
			value: "{/name}"
		});
		oInput.setModel(this.oModel);
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

	QUnit.module("sap.ui.model.json.JSONPropertyBinding: PropertyChange event", {
		beforeEach: function() {
			// Note: some tests modify the model data, therefore we clone it
			this.currentTestData = deepClone(constTestData);
			this.oModel = new JSONModel();
			this.oModel.setData(this.currentTestData);
		},
		afterEach: function() {
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

	QUnit.test("propertyChange event", function(assert) {
		var done = assert.async();
		var oInput = new Input({
			value: "{/name}"
		});
		oInput.setModel(this.oModel);
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
		oInput.setModel(this.oModel);
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
		oInput.setModel(this.oModel);
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