/*!
 * ${copyright}
 */

/* global QUnit, sinon */
/* eslint-disable no-new */

sap.ui.define([
	"sap/ui/mdc/util/PropertyHelper",
	"sap/ui/base/ManagedObject",
	"sap/ui/model/type/String",
	"sap/base/Log"
], function(PropertyHelper, ManagedObject, StringType, Log) {
	"use strict";

	function deepEqualProperties(assert, oPropertyHelper, aExpected, sMessage) {
		var mSimpleDefaults = {
			visible: true,
			sortable: true,
			filterable: true,
			path: null,
			groupLabel: "",
			propertyInfos: [],
			exportSettings: null,
			fieldHelp: "",
			maxConditions: null,
			typeConfig: null
		};
		var mComplexDefaults = Object.assign({}, mSimpleDefaults, {
			filterable: false,
			sortable: false,
			fieldHelp: null
		});
		var aExpectedWithDefaults = aExpected.map(function(oProperty) {
			if ("propertyInfos" in oProperty) {
				return Object.assign({}, mComplexDefaults, oProperty);
			}

			var oSimpleProperty = Object.assign({}, mSimpleDefaults, oProperty);

			if (oSimpleProperty.path === null) {
				oSimpleProperty.path = oSimpleProperty.name;
			}

			return oSimpleProperty;
		});

		assert.deepEqual(oPropertyHelper.getProperties().map(function(oProperty) {
			return {
				name: oProperty.getName(),
				label: oProperty.getLabel(),
				visible: oProperty.isVisible(),
				sortable: oProperty.isSortable(),
				filterable: oProperty.isFilterable(),
				path: oProperty.getPath(),
				groupLabel: oProperty.getGroupLabel(),
				propertyInfos: oProperty.getKeysFromComplexProperty(),
				exportSettings: oProperty.getExportSettings(),
				fieldHelp: oProperty.getFieldHelp(),
				maxConditions: oProperty.getMaxConditions(),
				typeConfig: oProperty.getTypeConfig()
			};
		}), aExpectedWithDefaults, sMessage || "Properties");
	}

	QUnit.module("Validation of property infos", {
		beforeEach: function() {
			this.logWarning = sinon.spy(Log, "warning");
		},
		afterEach: function() {
			this.logWarning.restore();
		}
	});

	QUnit.test("Without PropertyInfo", function(assert) {
		assert.throws(function() {
			new PropertyHelper();
		}, "Error thrown");
	});

	QUnit.test("Empty array as PropertyInfo", function(assert) {
		var oPropertyHelper = new PropertyHelper([]);
		assert.equal(this.logWarning.callCount, 0, "No warning logged");
		oPropertyHelper.destroy();
	});

	QUnit.test("PropertyInfo containing non-plain objects", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar"
			}, "string"
			]);
		}, "Error thrown if an item is a string");
		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar"
			}, new ManagedObject()
			]);
		}, "Error thrown if an item is an instance");
		assert.throws(function() {
			new PropertyHelper([Object.create({
				name: "prop",
				label: "prop"
			})]);
		}, "Error thrown if an item is a complex object");
	});

	QUnit.test("PropertyInfo containing properties with the same key", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar"
			}, {
				name: "foo",
				label: "bar2"
			}]);
		}, "Error thrown");
	});

	QUnit.test("Property with an unknown attribute", function(assert) {
		var oPropertyHelper = new PropertyHelper([{
			name: "foo",
			label: "bar",
			foo: "bar"
		}]);
		assert.equal(this.logWarning.callCount, 1, "Warning logged");
		oPropertyHelper.destroy();
	});

	QUnit.test("Property missing mandatory attributes", function(assert) {
		var oPropertyHelper = new PropertyHelper([{}]);
		assert.equal(this.logWarning.callCount, 2, "Warning logged 2 time, since name and label attributes are missing");
		oPropertyHelper.destroy();
	});

	QUnit.test("Property with an invalid attribute value", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: true,
				label: "label"
			}]);
		}, "Error thrown if the value has an incorrect type");

		assert.throws(function() {
			new PropertyHelper([{
				name: undefined,
				label: "bar"
			}]);
		}, "Error thrown if the value for a mandatory attribute is undefined");

		assert.throws(function() {
			new PropertyHelper([{
				name: null,
				label: "bar"
			}]);
		}, "Error thrown if the value for a mandatory attribute is null");

		new PropertyHelper([{
			name: "foo",
			label: "bar",
			path: undefined
		}]).destroy();
		assert.ok(true, "No error thrown if the value for an optional attribute is undefined");

		new PropertyHelper([{
			name: "foo",
			label: "bar",
			groupLabel: null
		}]).destroy();
		assert.ok(true, "No error thrown if the value for an optional attribute is null");
	});

	QUnit.test("Complex property with an attribute that is not allowed", function(assert) {
		var oPropertyHelper = new PropertyHelper([{
			name: "prop",
			label: "prop"
		}, {
			name: "complexProperty",
			label: "My complex property",
			path: "complexPath", // not allowed for complex properties
			propertyInfos: ["prop"]
		}]);

		assert.equal(this.logWarning.callCount, 1, "Warning logged");
		oPropertyHelper.destroy();
	});

	QUnit.test("Complex property with duplicate keys in the 'propertyInfos' attribute", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "prop",
				label: "prop"
			}, {
				name: "complexProperty",
				label: "My complex property",
				propertyInfos: ["prop", "prop"]
			}]);
		}, "Error thrown");
	});

	QUnit.test("Complex property referencing a complex property", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "prop",
				label: "prop"
			}, {
				name: "complexPropertyB",
				label: "Complex property B",
				propertyInfos: ["property"]
			}, {
				name: "complexPropertyA",
				label: "Complex property A",
				propertyInfos: ["complexPropertyB"]
			}]);
		}, "Error thrown");
	});

	QUnit.test("Complex property referencing a property which does not exist", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "prop",
				label: "prop"
			}, {
				name: "complexPropertyA",
				label: "Complex property A",
				propertyInfos: ["prop", "nonExistingProperty"]
			}]);
		}, "Error thrown");
	});

	QUnit.test("Complex property does not reference any existing properties", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "prop",
				label: "prop"
			}, {
				name: "complexPropertyA",
				label: "Complex property A",
				propertyInfos: ["nonExistingProperty"]
			}]);
		}, "Error thrown");
	});

	QUnit.test("Complex property does not reference any properties", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "complexPropertyA",
				label: "Complex property A",
				propertyInfos: []
			}]);
		}, "Error thrown if 'propertyInfos' is an empty array");

		assert.throws(function() {
			new PropertyHelper([{
				name: "complexPropertyA",
				label: "Complex property A",
				propertyInfos: null
			}]);
		}, "Error thrown if 'propertyInfos' is null");
	});

	QUnit.module("Cloning of property infos and setting defaults");

	QUnit.test("Defaults", function(assert) {
		var aPropertyInfos = [{
			name: "prop",
			label: "prop"
		}, {
			name: "complexProperty",
			label: "My complex property",
			propertyInfos: ["prop"]
		}];
		var oPropertyHelper = new PropertyHelper(aPropertyInfos);

		deepEqualProperties(assert, oPropertyHelper, [{
			name: "prop",
			label: "prop"
		}, {
			name: "complexProperty",
			label: "My complex property",
			propertyInfos: ["prop"]
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Comparison of cloned and original property infos", function(assert) {
		var oStringType = new StringType();
		var aPropertyInfos = [{
			name: "prop",
			label: "prop",
			exportSettings: {
				label: "exportLabel",
				width: 10
			},
			typeConfig: {
				baseType: "String",
				className: "sap.ui.model.type.String",
				typeInstance: oStringType
			}
		}, {
			name: "complexProperty",
			label: "My complex property",
			propertyInfos: ["prop"]
		}];
		var oPropertyHelper = new PropertyHelper(aPropertyInfos);
		var aClonedProperties = oPropertyHelper.getProperties();

		// Check references to arrays and objects.
		assert.ok(aClonedProperties !== aPropertyInfos, "Property info array was cloned");
		assert.ok(aClonedProperties[0] !== aPropertyInfos[0], "Property object was cloned");
		assert.ok(aClonedProperties[0].exportSettings !== aPropertyInfos[0].exportSettings, "Export settings object was cloned");
		assert.ok(aClonedProperties[0].typeConfig !== aPropertyInfos[0].typeConfig, "Type config object was cloned");
		assert.ok(aClonedProperties[1] !== aPropertyInfos[1], "ComplexProperty object was cloned");
		assert.ok(aClonedProperties[1].propertyInfos !== aPropertyInfos[1].propertyInfos, "Property infos array of ComplexProperty was cloned");

		deepEqualProperties(assert, oPropertyHelper, [{
			name: "prop",
			label: "prop",
			exportSettings: {
				label: "exportLabel",
				width: 10
			},
			typeConfig: {
				baseType: "String",
				className: "sap.ui.model.type.String",
				typeInstance: oStringType
			}
		}, {
			name: "complexProperty",
			label: "My complex property",
			propertyInfos: ["prop"]
		}], "Cloned property infos are equal to the original property infos");

		oStringType.destroy();
		oPropertyHelper.destroy();
	});

	QUnit.test("Changing original property infos", function(assert) {
		var aPropertyInfos = [{
			name: "prop",
			label: "prop",
			exportSettings: {
				label: "exportLabel",
				width: 10
			}
		}, {
			name: "complexProperty",
			label: "My complex property",
			propertyInfos: ["prop"]
		}];
		var oPropertyHelper = new PropertyHelper(aPropertyInfos);

		aPropertyInfos.push({
			name: "newProperty",
			label: "Newly added property"
		});
		aPropertyInfos[0].name = "newName";
		aPropertyInfos[0].exportSettings.width = 0;
		aPropertyInfos[0].typeConfig = {};
		aPropertyInfos[1].propertyInfos.push("something");

		deepEqualProperties(assert, oPropertyHelper, [{
			name: "prop",
			label: "prop",
			exportSettings: {
				label: "exportLabel",
				width: 10
			}
		}, {
			name: "complexProperty",
			label: "My complex property",
			propertyInfos: ["prop"]
		}], "Cloned property infos did not change");

		oPropertyHelper.destroy();
	});

	QUnit.test("Cloning of non-enumerable attributes", function(assert) {
		var aPropertyInfos = [{
			name: "prop",
			label: "prop"
		}];
		Object.defineProperty(aPropertyInfos[0], "foo", {
			value: "bar"
		});
		var oPropertyHelper = new PropertyHelper(aPropertyInfos);

		deepEqualProperties(assert, oPropertyHelper, [{
			name: "prop",
			label: "prop"
		}], "Cloned property infos");
		assert.notOk(oPropertyHelper.getProperties()[0].hasOwnProperty("foo"), "The non-enumerable attribute was not cloned");

		oPropertyHelper.destroy();
	});

	QUnit.module("Reference to a parent");

	QUnit.test("Without a parent", function(assert) {
		var oPropertyHelper = new PropertyHelper([]);
		assert.strictEqual(oPropertyHelper.getParent(), null, "The property helper has no parent");
		oPropertyHelper.destroy();

		oPropertyHelper = new PropertyHelper([], null);
		assert.strictEqual(oPropertyHelper.getParent(), null, "The property helper has no parent");
		oPropertyHelper.destroy();
	});

	QUnit.test("With a valid parent", function(assert) {
		var oParent = new ManagedObject();
		var oPropertyHelper = new PropertyHelper([], oParent);

		assert.strictEqual(oPropertyHelper.getParent(), oParent, "#getParent returns the reference to the parent");

		oPropertyHelper.destroy();
		assert.strictEqual(oPropertyHelper.getParent(), null, "#getParent no longer returns the parent after destroying the property helper");

		oParent.destroy();
	});

	QUnit.test("With an invalid parent", function(assert) {
		assert.throws(function() {
			new PropertyHelper([], {});
		}, "Error thrown if parent is a plain object");

		assert.throws(function() {
			new PropertyHelper([], {});
		}, "Error thrown if parent is 'null'");
	});

	QUnit.module("Immutability of property infos", {
		before: function() {
			this.oPropertyHelper = new PropertyHelper([{
				name: "prop",
				label: "My property",
				exportSettings: {
					nestedSetting: {
						deepNestedSetting: {}
					},
					nestedArray: [{}]
				}
			}, {
				name: "complexProp",
				label: "My complex property",
				propertyInfos: ["prop", "otherProp"]
			}, {
				name: "otherProp",
				label: "My other property"
			}]);
		},
		after: function() {
			this.oPropertyHelper.destroy();
		}
	});

	QUnit.test("Raw property", function(assert) {
		assert.ok(Object.isFrozen(this.oPropertyHelper.getRawProperty("prop")), "Simple property is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getRawProperty("complexProp")), "Complex property is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getRawProperty("otherProp")),
			"Simple property referenced by complex property is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getRawProperty("complexProp").propertyInfos), "Attribute 'propertyInfos' is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getRawProperty("prop").exportSettings),
			"Object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getRawProperty("prop").exportSettings.nestedSetting),
			"Objects nested in object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getRawProperty("prop").exportSettings.nestedSetting.deepNestedSetting),
			"Objects deeply nested in object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getRawProperty("prop").exportSettings.nestedArray),
			"Arrays nested in object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getRawProperty("prop").exportSettings.nestedArray[0]),
			"Objects in arrays nested in object attributes are frozen");
	});

	QUnit.test("Property", function(assert) {
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperty("prop")), "Simple property is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperty("complexProp")), "Complex property is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperty("otherProp")), "Simple property referenced by complex property is frozen");
	});

	QUnit.test("Property info array", function(assert) {
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()),
			"The property infos array is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[0]),
			"The first item of the property infos array is frozen (simple property)");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[1]),
			"The second item of the property infos array is frozen (complex property)");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[2]),
			"The third item of the property infos array is frozen (simple property referenced by a complex property)");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[1].getKeysFromComplexProperty()),
			"The return value of 'getKeysFromComplexProperty' is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[1].getPropertiesFromComplexProperty()),
			"The return value of 'getPropertiesFromComplexProperty' is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[1].getPropertiesFromComplexProperty()[0]),
			"Properties returned by 'getPropertiesFromComplexProperty' are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[0].getExportSettings()),
			"Object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[0].getExportSettings().nestedSetting),
			"Objects nested in object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[0].getExportSettings().nestedSetting.deepNestedSetting),
			"Objects deeply nested in object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[0].getExportSettings().nestedArray),
			"Arrays nested in object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[0].getExportSettings().nestedArray[0]),
			"Objects in arrays nested in object attributes are frozen");
	});

	QUnit.test("Property info map", function(assert) {
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap()),
			"The property map is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().prop),
			"The first item of the property map is frozen (simple property)");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().complexProp),
			"The second item of the property map is frozen (complex property)");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().otherProp),
			"The third item of the property map is frozen (simple property referenced by a complex property)");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().complexProp.getKeysFromComplexProperty()),
			"The return value of 'getKeysFromComplexProperty' is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().complexProp.getPropertiesFromComplexProperty()),
			"The return value of 'getPropertiesFromComplexProperty' is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().complexProp.getPropertiesFromComplexProperty()[0]),
			"Properties returned by 'getPropertiesFromComplexProperty' are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().prop.getExportSettings()),
			"Object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().prop.getExportSettings().nestedSetting),
			"Objects nested in object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().prop.getExportSettings().nestedSetting.deepNestedSetting),
			"Objects deeply nested in object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().prop.getExportSettings().nestedArray),
			"Arrays nested in object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().prop.getExportSettings().nestedArray[0]),
			"Objects in arrays nested in object attributes are frozen");
	});

	QUnit.module("API", {
		before: function() {
			this.oTypeConfig = {
				baseType: "String",
				className: "sap.ui.model.type.String",
				typeInstance: new StringType()
			};
		},
		beforeEach: function() {
			this.aOriginalProperties = [{
				name: "propA",
				label: "Property A",
				path: "propAPath",
				groupLabel: "Property A group label",
				exportSettings: {
					width: 20,
					label: "Property A export label"
				},
				maxConditions: 2,
				fieldHelp: "MyFieldHelp",
				typeConfig: this.oTypeConfig
			}, {
				name: "propB",
				label: "Property B",
				sortable: false,
				filterable: false,
				visible: false
			}, {
				name: "complexPropA",
				label: "Complex Property A",
				propertyInfos: ["propA", "propB"],
				groupLabel: "Complex Property A group label",
				exportSettings: {
					width: 30,
					label: "Complex Property A export label"
				}
			}, {
				name: "complexPropB",
				label: "Complex Property B",
				propertyInfos: ["propB"],
				visible: false
			}, {
				name: "complexPropC",
				label: "Complex Property C",
				propertyInfos: ["propB"]
			}, {
				name: "complexPropD",
				label: "Complex Property C",
				propertyInfos: ["propA"],
				visible: false
			}];
			this.oPropertyHelper = new PropertyHelper(this.aOriginalProperties);
			this.aProperties = this.oPropertyHelper.getProperties();
		},
		afterEach: function() {
			this.oPropertyHelper.destroy();
		},
		after: function() {
			this.oTypeConfig.typeInstance.destroy();
		}
	});

	QUnit.test("getProperties", function(assert) {
		var aProperties = this.oPropertyHelper.getProperties();

		assert.equal(aProperties.length, this.aOriginalProperties.length,
			"The property array contains as many entries as there are properties");

		this.aOriginalProperties.forEach(function(oOriginalProperty, iIndex) {
			assert.strictEqual(aProperties[iIndex].getName(), oOriginalProperty.name,
				"The property array references the correct property at index " + iIndex);
		});

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getProperties(), [], "After destruction");
	});

	QUnit.test("getPropertyMap", function(assert) {
		var mProperties = this.oPropertyHelper.getPropertyMap();

		assert.equal(Object.keys(mProperties).length, this.aOriginalProperties.length,
			"The property map contains as many entries as there are properties");

		this.aProperties.forEach(function(oProperty) {
			assert.strictEqual(mProperties[oProperty.getName()], oProperty,
				"The map references the correct property for the key '" + oProperty.getName() + "'");
		});

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getPropertyMap(), {}, "After destruction");
	});

	QUnit.test("getProperty", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getProperty(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getProperty({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.getProperty("propA"), this.aProperties[0], "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.getProperty(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getProperty("complexPropA"), this.aProperties[2], "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.getProperty(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.getProperty("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getProperty({
			name: "propA",
			label: "Property"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.getProperty({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.getProperty("propA"), null, "After destruction");
	});

	QUnit.test("getRawProperty", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getRawProperty(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getRawProperty({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.getRawProperty("propA").name, "propA", "Key of a simple property");
		assert.notStrictEqual(this.oPropertyHelper.getRawProperty("propA"), this.oPropertyHelper.getProperty("propA"),
			"Key of a simple property - Returns the raw property object, not the facade");
		assert.strictEqual(this.oPropertyHelper.getRawProperty(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getRawProperty("complexPropA").name, "complexPropA", "Key of a complex property");
		assert.notStrictEqual(this.oPropertyHelper.getRawProperty("complexPropA"), this.oPropertyHelper.getProperty("complexPropA"),
			"Key of a complex property - Returns the raw property object, not the facade");
		assert.strictEqual(this.oPropertyHelper.getRawProperty(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.getRawProperty("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getRawProperty({
			name: "propA",
			label: "Property"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.getRawProperty({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.getRawProperty("propA"), null, "After destruction");
	});

	QUnit.test("hasProperty", function(assert) {
		assert.strictEqual(this.oPropertyHelper.hasProperty(), false, "No arguments");
		assert.strictEqual(this.oPropertyHelper.hasProperty({}), false, "Empty object");
		assert.strictEqual(this.oPropertyHelper.hasProperty("propA"), true, "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.hasProperty(this.aProperties[0]), false, "Simple property");
		assert.strictEqual(this.oPropertyHelper.hasProperty("complexPropA"), true, "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.hasProperty(this.aProperties[2]), false, "Complex property");
		assert.strictEqual(this.oPropertyHelper.hasProperty("unknownProp"), false, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.hasProperty({
			name: "propA",
			label: "Property"
		}), false, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.hasProperty({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), false, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.hasProperty("propA"), false, "After destruction");
	});

	QUnit.test("isComplex", function(assert) {
		assert.strictEqual(this.oPropertyHelper.isComplex(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.isComplex({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.isComplex("propA"), false, "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.isComplex(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.isComplex("complexPropA"), true, "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.isComplex(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.isComplex("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.isComplex({
			name: "propA",
			label: "Property"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.isComplex({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.isComplex("complexPropA"), null, "After destruction");
	});

	QUnit.test("isPropertyComplex", function(assert) {
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex(), false, "No arguments");
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex({}), false, "Empty object");
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex("propA"), false, "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex(this.aProperties[0]), false, "Facade of a simple property");
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex("complexPropA"), false, "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex(this.aProperties[2]), false, "Facade of a complex property");
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex("unknownProp"), false, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex({
			name: "propA",
			label: "Property"
		}), false, "Simple property");
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), true, "Complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), true, "After destruction");
	});

	QUnit.test("getKeysFromComplexProperty", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getKeysFromComplexProperty(), [], "No arguments");
		assert.deepEqual(this.oPropertyHelper.getKeysFromComplexProperty({}), [], "Empty object");
		assert.deepEqual(this.oPropertyHelper.getKeysFromComplexProperty("propA"), [], "Key of a simple property");
		assert.deepEqual(this.oPropertyHelper.getKeysFromComplexProperty(this.aProperties[0]), [], "Simple property");
		assert.deepEqual(this.oPropertyHelper.getKeysFromComplexProperty("complexPropA"), ["propA", "propB"], "Key of a complex property");
		assert.deepEqual(this.oPropertyHelper.getKeysFromComplexProperty(this.aProperties[2]), [], "Complex property");
		assert.deepEqual(this.oPropertyHelper.getKeysFromComplexProperty("unknownProp"), [], "Unknown property key");
		assert.deepEqual(this.oPropertyHelper.getKeysFromComplexProperty({
			name: "propA",
			label: "Property"
		}), [], "Unknown simple property");
		assert.deepEqual(this.oPropertyHelper.getKeysFromComplexProperty({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), [], "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getKeysFromComplexProperty("complexPropA"), [], "After destruction");
	});

	QUnit.test("getPropertiesFromComplexProperty", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getPropertiesFromComplexProperty(), [], "No arguments");
		assert.deepEqual(this.oPropertyHelper.getPropertiesFromComplexProperty({}), [], "Empty object");
		assert.deepEqual(this.oPropertyHelper.getPropertiesFromComplexProperty("propA"), [], "Key of a simple property");
		assert.deepEqual(this.oPropertyHelper.getPropertiesFromComplexProperty(this.aProperties[0]), [], "Simple property");
		assert.deepEqual(this.oPropertyHelper.getPropertiesFromComplexProperty("complexPropA"), [
			this.aProperties[0], this.aProperties[1]
		], "Key of a complex property");
		assert.deepEqual(this.oPropertyHelper.getPropertiesFromComplexProperty(this.aProperties[2]), [], "Complex property");
		assert.deepEqual(this.oPropertyHelper.getPropertiesFromComplexProperty("unknownProp"), [], "Unknown property key");
		assert.deepEqual(this.oPropertyHelper.getKeysFromComplexProperty({
			name: "propA",
			label: "Property"
		}), [], "Unknown simple property");
		assert.deepEqual(this.oPropertyHelper.getPropertiesFromComplexProperty({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), [], "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getPropertiesFromComplexProperty("complexPropA"), [], "After destruction");
	});

	QUnit.test("isSortable", function(assert) {
		assert.strictEqual(this.oPropertyHelper.isSortable(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.isSortable({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.isSortable("propA"), true, "Key of a sortable simple property");
		assert.strictEqual(this.oPropertyHelper.isSortable(this.aProperties[0]), null, "Sortable simple property");
		assert.strictEqual(this.oPropertyHelper.isSortable("complexPropA"), false,
			"Key of a complex property referencing sortable properties");
		assert.strictEqual(this.oPropertyHelper.isSortable(this.aProperties[2]), null, "Complex property referencing sortable properties");
		assert.strictEqual(this.oPropertyHelper.isSortable("propB"), false, "Key of a non-sortable simple property");
		assert.strictEqual(this.oPropertyHelper.isSortable(this.aProperties[1]), null, "Non-sortable simple property");
		assert.strictEqual(this.oPropertyHelper.isSortable("complexPropB"), false,
			"Key of a complex property referencing non-sortable properties");
		assert.strictEqual(this.oPropertyHelper.isSortable(this.aProperties[3]), null, "Complex property referencing non-sortable properties");
		assert.strictEqual(this.oPropertyHelper.isSortable("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.isSortable({
			name: "propA",
			label: "Property"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.isSortable({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.isSortable("propA"), null, "After destruction");
	});

	QUnit.test("getSortableProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getSortableProperties(), [], "No arguments");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties({}), [], "Empty object");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties("propA"), [
			this.aProperties[0]
		], "Key of a sortable simple property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties(this.aProperties[0]), [], "Sortable simple property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties("complexPropA"), [
			this.aProperties[0]
		], "Key of a sortable complex property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties(this.aProperties[2]), [], "Sortable complex property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties("propB"), [], "Key of a non-sortable simple property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties(this.aProperties[1]), [], "Non-sortable simple property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties("complexPropB"), [], "Key of a non-sortable complex property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties(this.aProperties[3]), [], "Non-sortable complex property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties("unknownProp"), [], "Unknown property key");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties({
			name: "propA",
			label: "Property"
		}), [], "Unknown simple property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), [], "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getSortableProperties("propA"), [], "After destruction");
	});

	QUnit.test("getAllSortableProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getAllSortableProperties(), [
			this.aProperties[0]
		]);

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getAllSortableProperties(), [], "After destruction");
	});

	QUnit.test("isFilterable", function(assert) {
		assert.strictEqual(this.oPropertyHelper.isFilterable(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.isFilterable({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.isFilterable("propA"), true, "Key of a filterable simple property");
		assert.strictEqual(this.oPropertyHelper.isFilterable(this.aProperties[0]), null, "Filterable simple property");
		assert.strictEqual(this.oPropertyHelper.isFilterable("complexPropA"), false,
			"Key of a complex property referencing filterable properties");
		assert.strictEqual(this.oPropertyHelper.isFilterable(this.aProperties[2]), null, "Complex property referencing sortable properties");
		assert.strictEqual(this.oPropertyHelper.isFilterable("propB"), false, "Key of a non-filterable simple property");
		assert.strictEqual(this.oPropertyHelper.isFilterable(this.aProperties[1]), null, "Non-filterable simple property");
		assert.strictEqual(this.oPropertyHelper.isFilterable("complexPropB"), false,
			"Key of a complex property referencing non-filterable properties");
		assert.strictEqual(this.oPropertyHelper.isFilterable(this.aProperties[3]), null, "Complex property referencing non-filterable properties");
		assert.strictEqual(this.oPropertyHelper.isFilterable("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.isFilterable({
			name: "propA",
			label: "Property"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.isFilterable({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.isFilterable("propA"), null, "After destruction");
	});

	QUnit.test("getFilterableProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties(), [], "No arguments");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties({}), [], "Empty object");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties("propA"), [
			this.aProperties[0]
		], "Key of a filterable simple property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties(this.aProperties[0]), [], "Filterable simple property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties("complexPropA"), [
			this.aProperties[0]
		], "Key of a filterable complex property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties(this.aProperties[2]), [], "Filterable complex property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties("propB"), [], "Key of a non-filterable simple property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties(this.aProperties[1]), [], "Non-filterable simple property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties("complexPropB"), [], "Key of a non-filterable complex property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties(this.aProperties[3]), [], "Non-filterable complex property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties("unknownProp"), [], "Unknown property key");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties({
			name: "propA",
			label: "Property"
		}), [], "Unknown simple property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), [], "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties("propA"), [], "After destruction");
	});

	QUnit.test("getAllFilterableProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getAllFilterableProperties(), [
			this.aProperties[0]
		]);

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getAllFilterableProperties(), [], "After destruction");
	});

	QUnit.test("getLabel", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getLabel(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getLabel({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.getLabel("propA"), "Property A", "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.getLabel(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getLabel("complexPropA"), "Complex Property A", "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.getLabel(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.getLabel("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getLabel({
			name: "propA",
			label: "Property"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.getLabel({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.getLabel("propA"), null, "After destruction");
	});

	QUnit.test("getGroupLabel", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getGroupLabel(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel("propA"), "Property A group label", "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel("complexPropA"), "Complex Property A group label", "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel("propB"), "", "Key of a simple property without a group label");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel(this.aProperties[1]), null, "Simple property without a group label");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel("complexPropB"), "", "Key of a complex property without a group label");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel(this.aProperties[3]), null, "Complex property without a group label");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel({
			name: "propA",
			label: "Property",
			groupLabel: "something"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"],
			groupLabel: "something"
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.getGroupLabel("propA"), null, "After destruction");
	});

	QUnit.test("getPath", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getPath(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getPath({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.getPath("propA"), "propAPath", "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.getPath(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getPath("complexPropA"), null, "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.getPath(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.getPath("propB"), "propB", "Key of a simple property without a path");
		assert.strictEqual(this.oPropertyHelper.getPath(this.aProperties[1]), null, "Simple property without a path");
		assert.strictEqual(this.oPropertyHelper.getPath("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getPath({
			name: "propA",
			label: "Property",
			path: "propPath"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.getPath({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.getPath("propA"), null, "After destruction");
	});

	QUnit.test("isVisible", function(assert) {
		assert.strictEqual(this.oPropertyHelper.isVisible(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.isVisible({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.isVisible("propA"), true, "Key of a visible simple property");
		assert.strictEqual(this.oPropertyHelper.isVisible(this.aProperties[0]), null, "Visible simple property");
		assert.strictEqual(this.oPropertyHelper.isVisible("complexPropA"), true, "Key of a visible complex property");
		assert.strictEqual(this.oPropertyHelper.isVisible(this.aProperties[2]), null, "Visible complex property");
		assert.strictEqual(this.oPropertyHelper.isVisible("propB"), false, "Key of an invisible simple property");
		assert.strictEqual(this.oPropertyHelper.isVisible(this.aProperties[1]), null, "Invisible simple property");
		assert.strictEqual(this.oPropertyHelper.isVisible("complexPropB"), false, "Key of an invisible complex property");
		assert.strictEqual(this.oPropertyHelper.isVisible(this.aProperties[3]), null, "Invisible complex property");
		assert.strictEqual(this.oPropertyHelper.isVisible("complexPropC"), true, "Key of a visible complex property referencing invisible properties");
		assert.strictEqual(this.oPropertyHelper.isVisible(this.aProperties[4]), null, "Visible complex property referencing invisible properties");
		assert.strictEqual(this.oPropertyHelper.isVisible("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.isVisible({
			name: "propA",
			label: "Property"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.isVisible({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.isVisible("propA"), null, "After destruction");
	});

	QUnit.test("getVisibleProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(), [], "No arguments");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties({}), [], "Empty object");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("propA"), [
			this.aProperties[0]
		], "Key of a visible simple property");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[0]), [], "Visible simple property");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("complexPropA"), [
			this.aProperties[0]
		], "Key of a visible complex property referencing visible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[2]), [],
			"Visible complex property referencing visible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("complexPropC"), [],
			"Key of a visible complex property referencing invisible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[4]), [],
			"Visible complex property referencing invisible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("propB"), [], "Key of an invisible simple property");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[1]), [], "Invisible simple property");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("complexPropD"), [
			this.aProperties[0]
		], "Key of an invisible complex property referencing visible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[5]), [],
			"Invisible complex property referencing visible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("complexPropB"), [],
			"Key of an invisible complex property referencing invisible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[3]), [],
			"Invisible complex property referencing invisible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("unknownProp"), [], "Unknown property key");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties({
			name: "propA",
			label: "Property"
		}), [], "Unknown simple property");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), [], "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("propA"), [], "After destruction");
	});

	QUnit.test("getAllVisibleProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getAllVisibleProperties(), [
			this.aProperties[0],
			this.aProperties[2],
			this.aProperties[4]
		]);

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getAllVisibleProperties(), [], "After destruction");
	});

	QUnit.test("getName", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getName(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getName({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.getName("propA"), "propA", "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.getName(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getName("complexPropA"), "complexPropA", "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.getName(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.getName("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getName({
			name: "propA",
			label: "Property"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.getName({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.getName("propA"), null, "After destruction");
	});

	QUnit.test("getExportSettings", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getExportSettings(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getExportSettings({}), null, "Empty object");
		assert.deepEqual(this.oPropertyHelper.getExportSettings("propA"), {
			width: 20,
			label: "Property A export label"
		}, "Key of a simple property");
		assert.deepEqual(this.oPropertyHelper.getExportSettings(this.aProperties[0]), null, "Simple property");
		assert.deepEqual(this.oPropertyHelper.getExportSettings("complexPropA"), {
			width: 30,
			label: "Complex Property A export label"
		}, "Key of a complex property");
		assert.deepEqual(this.oPropertyHelper.getExportSettings(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.getExportSettings("propB"), null, "Key of a simple property without export settings");
		assert.strictEqual(this.oPropertyHelper.getExportSettings(this.aProperties[1]), null, "Simple property without export settings");
		assert.strictEqual(this.oPropertyHelper.getExportSettings("complexPropB"), null, "Key of a complex property without export settings");
		assert.strictEqual(this.oPropertyHelper.getExportSettings(this.aProperties[3]), null, "Complex property without export settings");
		assert.strictEqual(this.oPropertyHelper.getExportSettings("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getExportSettings({
			name: "propA",
			label: "Property",
			exportSettings: {
				width: 11,
				label: "Export label"
			}
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.getExportSettings({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"],
			exportSettings: {
				width: 11,
				label: "Export label"
			}
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.getExportSettings("propA"), null, "After destruction");
	});

	QUnit.test("getMaxConditions", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getMaxConditions(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getMaxConditions({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.getMaxConditions("propA"), 2, "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.getMaxConditions(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getMaxConditions("complexPropA"), null, "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.getMaxConditions(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.getMaxConditions("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getMaxConditions({
			name: "propA",
			label: "Property"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.getMaxConditions({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.getMaxConditions("propA"), null, "After destruction");
	});

	QUnit.test("getTypeConfig", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getTypeConfig(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getTypeConfig({}), null, "Empty object");
		assert.deepEqual(this.oPropertyHelper.getTypeConfig("propA"), this.oTypeConfig, "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.getTypeConfig(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getTypeConfig("complexPropA"), null, "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.getTypeConfig(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.getTypeConfig("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getTypeConfig({
			name: "propA",
			label: "Property"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.getTypeConfig({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.getTypeConfig("propA"), null, "After destruction");
	});

	QUnit.test("getFieldHelp", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getFieldHelp(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getFieldHelp({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.getFieldHelp("propA"), "MyFieldHelp", "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.getFieldHelp(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getFieldHelp("complexPropA"), null, "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.getFieldHelp(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.getFieldHelp("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getFieldHelp({
			name: "propA",
			label: "Property"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.getFieldHelp({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.getFieldHelp("propA"), null, "After destruction");
	});

	QUnit.module("Property facade", {
		before: function() {
			this.aExpectedMethods = [
				"isComplex", "getKeysFromComplexProperty", "getPropertiesFromComplexProperty", "isSortable", "getSortableProperties", "isFilterable",
				"getFilterableProperties", "getLabel", "getGroupLabel", "getPath", "isVisible", "getVisibleProperties", "getExportSettings",
				"getName", "getMaxConditions", "getTypeConfig", "getFieldHelp"
			];
			this.oPropertyHelper = new PropertyHelper([{
				name: "prop",
				label: "My property"
			}, {
				name: "complexProp",
				label: "My complex property",
				propertyInfos: ["prop"]
			}]);
		},
		after: function() {
			this.oPropertyHelper.destroy();
		},
		assertFacade: function(assert, oPropertyFacade) {
			assert.equal(Object.getOwnPropertyNames(oPropertyFacade).length, this.aExpectedMethods.length,
				"The facade has as many properties as there should be methods");
			assert.ok(Object.getPrototypeOf(oPropertyFacade) === Object.prototype, "The facade inherits directly from Object");

			for (var i = 0; i < this.aExpectedMethods.length; i++) {
				var sMethod = this.aExpectedMethods[i];
				assert.equal(typeof oPropertyFacade[sMethod], "function", "Has function '" + sMethod + "'");
			}
		},
		assertCalls: function(assert, oPropertyFacade, sPropertyName) {
			for (var i = 0; i < this.aExpectedMethods.length; i++) {
				var sMethod = this.aExpectedMethods[i];
				var oSpy = sinon.spy(this.oPropertyHelper, sMethod);

				oPropertyFacade[sMethod]();
				assert.ok(oSpy.calledOnceWithExactly(sPropertyName), "'" + sMethod + "' called once with the correct arguments");

				oSpy.restore();
			}
		}
	});

	QUnit.test("Simple property", function(assert) {
		var oProperty = this.oPropertyHelper.getProperties()[0];
		this.assertFacade(assert, oProperty);
		this.assertCalls(assert, oProperty, "prop");
	});

	QUnit.test("Complex property", function(assert) {
		var oProperty = this.oPropertyHelper.getProperties()[1];
		this.assertFacade(assert, oProperty);
		this.assertCalls(assert, oProperty, "complexProp");
	});

	QUnit.test("Property referenced by complex property", function(assert) {
		var oProperty = this.oPropertyHelper.getProperties()[1].getPropertiesFromComplexProperty()[0];
		this.assertFacade(assert, oProperty);
		this.assertCalls(assert, oProperty, "prop");
	});

	QUnit.module("Inheritance");

	QUnit.test("Custom validation support", function(assert) {
		var oValidatePropertiesSpy = sinon.spy();
		var oValidatePropertySpy = sinon.spy();
		var aProperties = [{
			name: "prop",
			label: "Property"
		}, {
			name: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}];
		var MyPropertyHelper = PropertyHelper.extend("sap.ui.mdc.test.table.PropertyHelper", {
			validateProperties: function() {
				PropertyHelper.prototype.validateProperties.apply(this, arguments);
				oValidatePropertiesSpy.apply(this, arguments);
			},
			validateProperty: function() {
				PropertyHelper.prototype.validateProperty.apply(this, arguments);
				oValidatePropertySpy.apply(this, arguments);
			}
		});
		var oMyPropertyHelper = new MyPropertyHelper(aProperties);

		assert.ok(oValidatePropertiesSpy.calledOnceWithExactly(aProperties), "#validateProperties called once with the correct arguments");
		assert.equal(oValidatePropertySpy.callCount, 2, "#validateProperty called twice");
		assert.ok(oValidatePropertySpy.firstCall.calledWithExactly(aProperties[0], aProperties), "Arguments of first #validateProperty call");
		assert.ok(oValidatePropertySpy.secondCall.calledWithExactly(aProperties[1], aProperties), "Arguments of second #validateProperty call");

		oMyPropertyHelper.destroy();
	});

	QUnit.test("onCreatePropertyFacade hook", function(assert) {
		var oOnCreatePropertyFacadeSpy = sinon.spy();
		var oProvidedFacade;
		var MyPropertyHelper = PropertyHelper.extend("sap.ui.mdc.test.table.PropertyHelper", {
			onCreatePropertyFacade: function(oFacade) {
				var oProperty = this.getRawProperty(oFacade.getName());
				try {
					oFacade.getName = function() {
						return "getName modified";
					};
				} catch (e) {} //eslint-disable-line no-empty
				oFacade.myName = oFacade.getName();
				oFacade.myProperty = oProperty;
				oProvidedFacade = oFacade;
				oOnCreatePropertyFacadeSpy.apply(this, arguments);
			}
		});
		var oMyPropertyHelper = new MyPropertyHelper([{
			name: "prop",
			label: "prop"
		}]);

		assert.ok(oOnCreatePropertyFacadeSpy.calledOnceWithExactly(oProvidedFacade), "The hook was called once with the correct arguments");
		assert.strictEqual(oMyPropertyHelper.getProperty("prop").myName, "prop", "Property facade is provided and extensible");
		assert.strictEqual(oMyPropertyHelper.getProperty("prop").myProperty, oMyPropertyHelper.getRawProperty("prop"),
			"Raw property object is available");

		oMyPropertyHelper.destroy();
	});
});