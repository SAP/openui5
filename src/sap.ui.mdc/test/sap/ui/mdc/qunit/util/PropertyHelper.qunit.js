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

		assert.deepEqual(oPropertyHelper.getProperties(), [{
			name: "prop",
			label: "prop",
			groupLabel: "",
			visible: true,
			filterable: true,
			sortable: true,
			fieldHelp: "",
			maxConditions: null,
			exportSettings: null,
			typeConfig: null,
			path: "prop"
		}, {
			name: "complexProperty",
			label: "My complex property",
			groupLabel: "",
			visible: true,
			exportSettings: null,
			propertyInfos: ["prop"]
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Comparison of cloned and original property infos", function(assert) {
		var oString = new StringType();
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
				typeInstance: oString
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

		assert.deepEqual(aClonedProperties, [{
			name: "prop",
			label: "prop",
			groupLabel: "",
			visible: true,
			filterable: true,
			sortable: true,
			fieldHelp: "",
			maxConditions: null,
			path: "prop",
			exportSettings: {
				label: "exportLabel",
				width: 10
			},
			typeConfig: {
				baseType: "String",
				className: "sap.ui.model.type.String",
				typeInstance: oString
			}
		}, {
			name: "complexProperty",
			label: "My complex property",
			groupLabel: "",
			visible: true,
			exportSettings: null,
			propertyInfos: ["prop"]
		}], "Cloned property infos are equal to the original property infos");

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

		assert.deepEqual(oPropertyHelper.getProperties(), [{
			name: "prop",
			label: "prop",
			groupLabel: "",
			visible: true,
			filterable: true,
			sortable: true,
			fieldHelp: "",
			maxConditions: null,
			path: "prop",
			exportSettings: {
				label: "exportLabel",
				width: 10
			},
			typeConfig: null
		}, {
			name: "complexProperty",
			label: "My complex property",
			groupLabel: "",
			visible: true,
			exportSettings: null,
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

		assert.deepEqual(oPropertyHelper.getProperties(), [{
			name: "prop",
			label: "prop",
			groupLabel: "",
			visible: true,
			filterable: true,
			sortable: true,
			fieldHelp: "",
			maxConditions: null,
			path: "prop",
			exportSettings: null,
			typeConfig: null
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

	QUnit.module("Destruction");

	QUnit.test("Should clean up all references", function(assert) {
		var oParent = new ManagedObject();
		var oPropertyHelper = new PropertyHelper([{
			name: "prop",
			label: "prop"
		}], oParent);

		oPropertyHelper.destroy();
		assert.strictEqual(oPropertyHelper.getProperties(), null, "#getProperties no longer returns the properties");
		assert.strictEqual(oPropertyHelper.getPropertyMap(), null, "#getPropertyMap no longer returns the property map");
		assert.strictEqual(oPropertyHelper.getParent(), null, "#getParent no longer returns the parent");

		oParent.destroy();
	});

	QUnit.module("Immutability of property infos", {
		beforeEach: function() {
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
		afterEach: function() {
			this.oPropertyHelper.destroy();
		}
	});

	QUnit.test("Property info array", function(assert) {
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()), "The property infos array is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[0]), "The first item of the property infos array is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[1]), "The second item of the property infos array is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[1]), "The third item of the property infos array is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[1].propertyInfos), "The 'propertyInfos' attribute is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[1]._relatedProperties), "The '_relatedProperties' helper attribute is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[0].exportSettings), "Object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[0].exportSettings.nestedSetting),
			"Objects nested in object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[0].exportSettings.nestedSetting.deepNestedSetting),
			"Objects deeply nested in object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[0].exportSettings.nestedArray),
			"Arrays nested in object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getProperties()[0].exportSettings.nestedArray[0]),
			"Objects in arrays nested in object attributes are frozen");
	});

	QUnit.test("Property info map", function(assert) {
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap()), "The property map is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().prop), "The first item of the property map is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().complexProp), "The second item of the property map is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().otherProp), "The third item of the property map is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().prop.propertyInfos), "The 'propertyInfos' attribute is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().prop._relatedProperties),
			"The '_relatedProperties' helper attribute is frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().prop.exportSettings), "Object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().prop.exportSettings.nestedSetting),
			"Objects nested in object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().prop.exportSettings.nestedSetting.deepNestedSetting),
			"Objects deeply nested in object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().prop.exportSettings.nestedArray),
			"Arrays nested in object attributes are frozen");
		assert.ok(Object.isFrozen(this.oPropertyHelper.getPropertyMap().prop.exportSettings.nestedArray[0]),
			"Objects in arrays nested in object attributes are frozen");
	});

	QUnit.module("API", {
		beforeEach: function() {
			this.logWarning = sinon.spy(Log, "warning");
			this.oPropertyHelper = new PropertyHelper([{
				name: "propA",
				label: "Property A",
				path: "propAPath",
				groupLabel: "Property A group label",
				exportSettings: {
					width: 20,
					label: "Property A export label"
				}
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
			}]);
			this.aProperties = this.oPropertyHelper.getProperties();
		},
		afterEach: function() {
			this.logWarning.restore();
			this.oPropertyHelper.destroy();
			this.aProperties = null;
		}
	});

	QUnit.test("getPropertyMap", function(assert) {
		var mProperties = this.oPropertyHelper.getPropertyMap();

		assert.equal(Object.keys(mProperties).length, this.aProperties.length,
			"The property map contains as many entries as there are properties");

		this.aProperties.forEach(function(oProperty) {
			assert.strictEqual(mProperties[oProperty.name], oProperty,
				"The map references the correct property for the key '" + oProperty.name + "'");
		});
	});

	QUnit.test("getProperty", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getProperty(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getProperty({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.getProperty("propA"), this.aProperties[0], "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.getProperty(this.aProperties[0]), this.aProperties[0], "Simple property");
		assert.strictEqual(this.oPropertyHelper.getProperty("complexPropA"), this.aProperties[2], "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.getProperty(this.aProperties[2]), this.aProperties[2], "Complex property");
		assert.strictEqual(this.oPropertyHelper.getProperty("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getProperty({
			name: "propA",
			label: "Property"
		}), null, "Unknown property");
		assert.strictEqual(this.oPropertyHelper.getProperty({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");
	});

	QUnit.test("isComplex", function(assert) {
		assert.strictEqual(this.oPropertyHelper.isComplex(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.isComplex({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.isComplex("propA"), false, "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.isComplex(this.aProperties[0]), false, "Simple property");
		assert.strictEqual(this.oPropertyHelper.isComplex("complexPropA"), true, "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.isComplex(this.aProperties[2]), true, "Complex property");
		assert.strictEqual(this.oPropertyHelper.isComplex("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.isComplex({
			name: "propA",
			label: "Property"
		}), null, "Unknown property");
		assert.strictEqual(this.oPropertyHelper.isComplex({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");
	});

	QUnit.test("getKeysFromComplexProperty", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getKeysFromComplexProperty(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getKeysFromComplexProperty({}), null, "Empty object");
		assert.deepEqual(this.oPropertyHelper.getKeysFromComplexProperty("propA"), [], "Key of a simple property");
		assert.deepEqual(this.oPropertyHelper.getKeysFromComplexProperty(this.aProperties[0]), [], "Simple property");
		assert.deepEqual(this.oPropertyHelper.getKeysFromComplexProperty("complexPropA"), ["propA", "propB"], "Key of a complex property");
		assert.deepEqual(this.oPropertyHelper.getKeysFromComplexProperty(this.aProperties[2]), ["propA", "propB"], "Complex property");
		assert.strictEqual(this.oPropertyHelper.getKeysFromComplexProperty("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getKeysFromComplexProperty({
			name: "propA",
			label: "Property"
		}), null, "Unknown property");
		assert.deepEqual(this.oPropertyHelper.getKeysFromComplexProperty({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");
	});

	QUnit.test("getPropertiesFromComplexProperty", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getPropertiesFromComplexProperty(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getPropertiesFromComplexProperty({}), null, "Empty object");
		assert.deepEqual(this.oPropertyHelper.getPropertiesFromComplexProperty("propA"), [], "Key of a simple property");
		assert.deepEqual(this.oPropertyHelper.getPropertiesFromComplexProperty(this.aProperties[0]), [], "Simple property");
		assert.deepEqual(this.oPropertyHelper.getPropertiesFromComplexProperty("complexPropA"), [
			this.aProperties[0], this.aProperties[1]
		], "Key of a complex property");
		assert.deepEqual(this.oPropertyHelper.getPropertiesFromComplexProperty(this.aProperties[2]), [
			this.aProperties[0], this.aProperties[1]
		], "Complex property");
		assert.strictEqual(this.oPropertyHelper.getPropertiesFromComplexProperty("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getKeysFromComplexProperty({
			name: "propA",
			label: "Property"
		}), null, "Unknown property");
		assert.strictEqual(this.oPropertyHelper.getPropertiesFromComplexProperty({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");
	});

	QUnit.test("isSortable", function(assert) {
		assert.strictEqual(this.oPropertyHelper.isSortable(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.isSortable({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.isSortable("propA"), true, "Key of a sortable simple property");
		assert.strictEqual(this.oPropertyHelper.isSortable(this.aProperties[0]), true, "Sortable simple property");
		assert.strictEqual(this.oPropertyHelper.isSortable("complexPropA"), false,
			"Key of a complex property referencing sortable properties");
		assert.strictEqual(this.oPropertyHelper.isSortable(this.aProperties[2]), false, "Complex property referencing sortable properties");
		assert.strictEqual(this.oPropertyHelper.isSortable("propB"), false, "Key of a non-sortable simple property");
		assert.strictEqual(this.oPropertyHelper.isSortable(this.aProperties[1]), false, "Non-sortable simple property");
		assert.strictEqual(this.oPropertyHelper.isSortable("complexPropB"), false,
			"Key of a complex property referencing non-sortable properties");
		assert.strictEqual(this.oPropertyHelper.isSortable(this.aProperties[3]), false, "Complex property referencing non-sortable properties");
		assert.strictEqual(this.oPropertyHelper.isSortable("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.isSortable({
			name: "propA",
			label: "Property"
		}), null, "Unknown property");
		assert.strictEqual(this.oPropertyHelper.isSortable({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");
	});

	QUnit.test("getSortableProperties", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getSortableProperties(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getSortableProperties({}), null, "Empty object");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties("propA"), [
			this.aProperties[0]
		], "Key of a sortable simple property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties(this.aProperties[0]), [
			this.aProperties[0]
		], "Sortable simple property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties("complexPropA"), [
			this.aProperties[0]
		], "Key of a sortable complex property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties(this.aProperties[2]), [
			this.aProperties[0]
		], "Sortable complex property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties("propB"), [], "Key of a non-sortable simple property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties(this.aProperties[1]), [], "Non-sortable simple property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties("complexPropB"), [], "Key of a non-sortable complex property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties(this.aProperties[3]), [], "Non-sortable complex property");
		assert.strictEqual(this.oPropertyHelper.getSortableProperties("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getSortableProperties({
			name: "propA",
			label: "Property"
		}), null, "Unknown property");
		assert.strictEqual(this.oPropertyHelper.getSortableProperties({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");
	});

	QUnit.test("getAllSortableProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getAllSortableProperties(), [
			this.aProperties[0]
		]);
	});

	QUnit.test("isFilterable", function(assert) {
		assert.strictEqual(this.oPropertyHelper.isFilterable(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.isFilterable({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.isFilterable("propA"), true, "Key of a filterable simple property");
		assert.strictEqual(this.oPropertyHelper.isFilterable(this.aProperties[0]), true, "Filterable simple property");
		assert.strictEqual(this.oPropertyHelper.isFilterable("complexPropA"), false,
			"Key of a complex property referencing filterable properties");
		assert.strictEqual(this.oPropertyHelper.isFilterable(this.aProperties[2]), false, "Complex property referencing sortable properties");
		assert.strictEqual(this.oPropertyHelper.isFilterable("propB"), false, "Key of a non-filterable simple property");
		assert.strictEqual(this.oPropertyHelper.isFilterable(this.aProperties[1]), false, "Non-filterable simple property");
		assert.strictEqual(this.oPropertyHelper.isFilterable("complexPropB"), false,
			"Key of a complex property referencing non-filterable properties");
		assert.strictEqual(this.oPropertyHelper.isFilterable(this.aProperties[3]), false, "Complex property referencing non-filterable properties");
		assert.strictEqual(this.oPropertyHelper.isFilterable("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.isFilterable({
			name: "propA",
			label: "Property"
		}), null, "Unknown property");
		assert.strictEqual(this.oPropertyHelper.isFilterable({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");
	});

	QUnit.test("getFilterableProperties", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getFilterableProperties(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getFilterableProperties({}), null, "Empty object");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties("propA"), [
			this.aProperties[0]
		], "Key of a filterable simple property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties(this.aProperties[0]), [
			this.aProperties[0]
		], "Filterable simple property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties("complexPropA"), [
			this.aProperties[0]
		], "Key of a filterable complex property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties(this.aProperties[2]), [
			this.aProperties[0]
		], "Filterable complex property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties("propB"), [], "Key of a non-filterable simple property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties(this.aProperties[1]), [], "Non-filterable simple property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties("complexPropB"), [], "Key of a non-filterable complex property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties(this.aProperties[3]), [], "Non-filterable complex property");
		assert.strictEqual(this.oPropertyHelper.getFilterableProperties("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getFilterableProperties({
			name: "propA",
			label: "Property"
		}), null, "Unknown property");
		assert.strictEqual(this.oPropertyHelper.getFilterableProperties({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");
	});

	QUnit.test("getAllFilterableProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getAllFilterableProperties(), [
			this.aProperties[0]
		]);
	});

	QUnit.test("getLabel", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getLabel(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getLabel({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.getLabel("propA"), "Property A", "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.getLabel(this.aProperties[0]), "Property A", "Simple property");
		assert.strictEqual(this.oPropertyHelper.getLabel("complexPropA"), "Complex Property A", "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.getLabel(this.aProperties[2]), "Complex Property A", "Complex property");
		assert.strictEqual(this.oPropertyHelper.getLabel("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getLabel({
			name: "propA",
			label: "Property"
		}), null, "Unknown property");
		assert.strictEqual(this.oPropertyHelper.getLabel({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");
	});

	QUnit.test("getGroupLabel", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getGroupLabel(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel("propA"), "Property A group label", "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel(this.aProperties[0]), "Property A group label", "Simple property");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel("complexPropA"), "Complex Property A group label", "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel(this.aProperties[2]), "Complex Property A group label", "Complex property");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel("propB"), "", "Key of a simple property without a group label");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel(this.aProperties[1]), "", "Simple property without a group label");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel("complexPropB"), "", "Key of a complex property without a group label");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel(this.aProperties[3]), "", "Complex property without a group label");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel({
			name: "propA",
			label: "Property",
			groupLabel: "something"
		}), null, "Unknown property");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"],
			groupLabel: "something"
		}), null, "Unknown complex property");
	});

	QUnit.test("getPath", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getPath(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getPath({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.getPath("propA"), "propAPath", "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.getPath(this.aProperties[0]), "propAPath", "Simple property");
		assert.strictEqual(this.oPropertyHelper.getPath("complexPropA"), null, "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.getPath(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.getPath("propB"), "propB", "Key of a simple property without a path");
		assert.strictEqual(this.oPropertyHelper.getPath(this.aProperties[1]), "propB", "Simple property without a path");
		assert.strictEqual(this.oPropertyHelper.getProperty("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getPath({
			name: "propA",
			label: "Property",
			path: "propPath"
		}), null, "Unknown property");
		assert.strictEqual(this.oPropertyHelper.getPath({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");
	});

	QUnit.test("isVisible", function(assert) {
		assert.strictEqual(this.oPropertyHelper.isVisible(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.isVisible({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.isVisible("propA"), true, "Key of a visible simple property");
		assert.strictEqual(this.oPropertyHelper.isVisible(this.aProperties[0]), true, "Visible simple property");
		assert.strictEqual(this.oPropertyHelper.isVisible("complexPropA"), true, "Key of a visible complex property");
		assert.strictEqual(this.oPropertyHelper.isVisible(this.aProperties[2]), true, "Visible complex property");
		assert.strictEqual(this.oPropertyHelper.isVisible("propB"), false, "Key of an invisible simple property");
		assert.strictEqual(this.oPropertyHelper.isVisible(this.aProperties[1]), false, "Invisible simple property");
		assert.strictEqual(this.oPropertyHelper.isVisible("complexPropB"), false, "Key of an invisible complex property");
		assert.strictEqual(this.oPropertyHelper.isVisible(this.aProperties[3]), false, "Invisible complex property");
		assert.strictEqual(this.oPropertyHelper.isVisible("complexPropC"), true, "Key of a visible complex property referencing invisible properties");
		assert.strictEqual(this.oPropertyHelper.isVisible(this.aProperties[4]), true, "Visible complex property referencing invisible properties");
		assert.strictEqual(this.oPropertyHelper.isVisible("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.isVisible({
			name: "propA",
			label: "Property"
		}), null, "Unknown property");
		assert.strictEqual(this.oPropertyHelper.isVisible({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");
	});

	QUnit.test("getVisibleProperties", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getVisibleProperties(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getVisibleProperties({}), null, "Empty object");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("propA"), [
			this.aProperties[0]
		], "Key of a visible simple property");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[0]), [
			this.aProperties[0]
		], "Visible simple property");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("complexPropA"), [
			this.aProperties[0]
		], "Key of a visible complex property referencing visible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[2]), [
			this.aProperties[0]
		], "Visible complex property referencing visible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("complexPropC"), [],
			"Key of a visible complex property referencing invisible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[4]), [],
			"Visible complex property referencing invisible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("propB"), [], "Key of an invisible simple property");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[1]), [], "Invisible simple property");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("complexPropD"), [
			this.aProperties[0]
		], "Key of an invisible complex property referencing visible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[5]), [
			this.aProperties[0]
		], "Invisible complex property referencing visible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("complexPropB"), [],
			"Key of an invisible complex property referencing invisible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[3]), [],
			"Invisible complex property referencing invisible properties");
		assert.strictEqual(this.oPropertyHelper.getVisibleProperties("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getVisibleProperties({
			name: "propA",
			label: "Property"
		}), null, "Unknown property");
		assert.strictEqual(this.oPropertyHelper.getVisibleProperties({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");
	});

	QUnit.test("getAllVisibleProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getAllVisibleProperties(), [
			this.aProperties[0],
			this.aProperties[2],
			this.aProperties[4]
		]);
	});

	QUnit.test("getName", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getName(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getName({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.getName("propA"), "propA", "Key of a simple property");
		assert.strictEqual(this.oPropertyHelper.getName(this.aProperties[0]), "propA", "Simple property");
		assert.strictEqual(this.oPropertyHelper.getName("complexPropA"), "complexPropA", "Key of a complex property");
		assert.strictEqual(this.oPropertyHelper.getName(this.aProperties[2]), "complexPropA", "Complex property");
		assert.strictEqual(this.oPropertyHelper.getProperty("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.getName({
			name: "propA",
			label: "Property"
		}), null, "Unknown property");
		assert.strictEqual(this.oPropertyHelper.getName({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");
	});

	QUnit.test("getExportSettings", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getExportSettings(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getExportSettings({}), null, "Empty object");
		assert.deepEqual(this.oPropertyHelper.getExportSettings("propA"), {
			width: 20,
			label: "Property A export label"
		}, "Key of a simple property");
		assert.deepEqual(this.oPropertyHelper.getExportSettings(this.aProperties[0]), {
			width: 20,
			label: "Property A export label"
		}, "Simple property");
		assert.deepEqual(this.oPropertyHelper.getExportSettings("complexPropA"), {
			width: 30,
			label: "Complex Property A export label"
		}, "Key of a complex property");
		assert.deepEqual(this.oPropertyHelper.getExportSettings(this.aProperties[2]), {
			width: 30,
			label: "Complex Property A export label"
		}, "Complex property");
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
		}), null, "Unknown property");
		assert.strictEqual(this.oPropertyHelper.getExportSettings({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"],
			exportSettings: {
				width: 11,
				label: "Export label"
			}
		}), null, "Unknown complex property");
	});
});