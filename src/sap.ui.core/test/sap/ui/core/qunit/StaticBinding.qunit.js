/*global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Control",
	"sap/ui/model/CompositeBinding",
	"sap/ui/model/StaticBinding",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Float"
], function(Localization, ManagedObject, Control, CompositeBinding, StaticBinding, JSONModel, TypeFloat) {
	"use strict";

	var sDefaultLanguage = Localization.getLanguage(),
		MyObject = ManagedObject.extend("MyObject", {
			metadata: {
				properties: {
					value: {type: "string"},
					objectValue: {type: "object"},
					anyValue: {type: "any"}
				},
				aggregations: {
					altString: {type: "sap.ui.core.Control", altTypes: ["string"], multiple: false}
				}
			}
		});

	QUnit.module("sap.ui.model.StaticBinding", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			Localization.setLanguage("en-US");
			this.static = new StaticBinding("test");
			this.staticWithFormatter = new StaticBinding("test");
			this.staticWithFormatter.setFormatter(function(sValue) {
				return "_" + sValue + "_";
			});
			this.staticWithType = new StaticBinding(123);
			this.staticWithType.setType(new TypeFloat({decimals: 2}), "string");
		},
		afterEach: function() {
			this.static = null;
			this.staticWithFormatter = null;
			this.staticWithType = null;
			// reset the language
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("getters", function(assert) {
		assert.equal(this.static.getModel(), null, "No model");
		assert.equal(this.static.getPath(), null, "No path");
		assert.equal(this.static.getValue(), "test", "Static value");
		this.static.setValue("other");
		assert.equal(this.static.getValue(), "other", "Static value changed");
	});

	QUnit.test("getValue", function(assert) {
		assert.equal(this.static.getValue(), "test", "getValue returns static raw value");
		assert.equal(this.staticWithFormatter.getValue(), "test", "getValue returns static raw value");
		assert.equal(this.staticWithType.getValue(), 123, "getValue returns static raw value");
	});

	QUnit.test("getExternalValue", function(assert) {
		assert.equal(this.static.getExternalValue(), "test", "getExternalValue returns static value");
		assert.equal(this.staticWithFormatter.getExternalValue(), "_test_", "getExternalValue returns formatted static value");
		assert.equal(this.staticWithType.getExternalValue(), "123.00", "getExternalValue returns formatted static value");
	});

	QUnit.test("setExternalValue", function(assert) {
		this.static.setExternalValue("other");
		assert.equal(this.static.getValue(), "other", "changed static value");
		this.staticWithFormatter.setExternalValue("other");
		assert.equal(this.staticWithFormatter.getValue(), "test", "formatter prevents changing of value");
		this.staticWithType.setExternalValue("456.00");
		assert.equal(this.staticWithType.getValue(), 456, "typed value is parsed correctly");
	});

	QUnit.test("In CompositeBinding: Getter", function(assert) {
		var oBinding = new CompositeBinding([new StaticBinding("test"), new StaticBinding(123)]);

		assert.deepEqual(oBinding.getValue(), ["test", 123],
			"composite returns array of static values");
		assert.equal(oBinding.getExternalValue(), "test 123", "external value is space seperated");
	});

	QUnit.test("Binding info as JS object, string property", function(assert) {
		var object = new MyObject({
			value: {
				value: "test"
			}
		});
		assert.ok(object.getBindingInfo("value"), "binding info is created");
		assert.equal(object.getValue(), "test", "object getter returns static value");
	});

	QUnit.test("Binding info as JS object, object property", function(assert) {
		var object = new MyObject({
			objectValue: {
				value: "test"
			}
		});
		assert.notOk(object.getBindingInfo("value"), "binding info is not created");
		assert.deepEqual(object.getObjectValue(), { value: "test" }, "object getter returns object for object properties");
	});

	QUnit.test("Binding info as JS object, any property", function(assert) {
		var object = new MyObject({
			anyValue: {
				value: "test"
			}
		});
		assert.notOk(object.getBindingInfo("value"), "binding info is not created");
		assert.deepEqual(object.getAnyValue(), { value: "test" }, "object getter returns object for object properties");
	});

	QUnit.test("Binding info as JS object, aggregation with altType string", function(assert) {
		var object = new MyObject({
			altString: {
				value: "test"
			}
		});
		assert.ok(object.getBindingInfo("altString"), "binding info is created");
		assert.equal(object.getAltString(), "test", "object getter returns static value");
	});

	QUnit.test("Binding info as string", function(assert) {
		var object = new MyObject({
			value: "{value:123}"
		});
		assert.equal(object.getValue(), 123, "object getter returns static value");
	});

	QUnit.test("Binding info composite binding", function(assert) {
		var object = new MyObject({
			models: new JSONModel({
				string: "foo"
			}),
			value: {
				parts:[
					{path: "/string"},
					{value: "bar"}
				]
			}
		});
		assert.equal(object.getValue(), "foo bar", "object getter returns static value");
	});

	QUnit.test("Value change", function(assert) {
		var object = new MyObject({
			value: {
				value: "test"
			}
		});
		object.setValue("control");
		assert.equal(object.getBinding("value").getValue(), "control", "Control property updates binding value");
		object.getBinding("value").setValue("binding");
		assert.equal(object.getValue(), "binding", "Binding updates control property value");
	});

	QUnit.test("Model independence", function(assert) {
		var iFormatterCount = 0,
			oBinding,
			object = new MyObject({
				value: {
					value: "test",
					formatter: function(value) {
						iFormatterCount++;
						return value;
					}
				}
			});

		oBinding = object.getBinding("value");
		assert.equal(iFormatterCount, 1, "Formatter called once after creating the static binding");

		object.setModel(new JSONModel({}));
		assert.ok(object.getBinding("value") === oBinding, "Binding instance is still the same");
		assert.equal(iFormatterCount, 1, "Formatter not called again after setting a model");
	});

	//*********************************************************************************************
	QUnit.test("getResolvedPath", function (assert) {
		// code under test
		assert.strictEqual(new StaticBinding("~staticValue").getResolvedPath(), undefined);
	});

/** @deprecated since 1.120, reason ManagedObject does not support aggregations with altType "object" in 2.0 */
(function() {
	var MyTestObject = ManagedObject.extend("MyTestObject", {
			metadata: {
				aggregations: {
					altObject: {type: "sap.ui.core.Control", altTypes: ["object"], multiple: false},
					altMulti: {type: "sap.ui.core.Control", altTypes: ["string", "object"], multiple: false}
				}
			}
		});

	QUnit.test("Binding info as JS object, aggregation with altType object", function(assert) {
		var object = new MyTestObject({
				altObject: {
					value: "test"
				}
			});
		assert.notOk(object.getBindingInfo("altObject"), "binding info is not created");
		assert.equal(typeof object.getAltObject(), "object",
			"object getter returns object for aggregation with altType object");
	});

	QUnit.test("Binding info as JS object, aggregation with altType string,object", function(assert) {
		var object = new MyTestObject({
				altMulti: {
					value: "test"
				}
			});
		assert.notOk(object.getBindingInfo("altMulti"), "binding info is not created");
		assert.equal(typeof object.getAltMulti(), "object",
			"object getter returns object for aggregation with altType string,object");
	});
}());
});