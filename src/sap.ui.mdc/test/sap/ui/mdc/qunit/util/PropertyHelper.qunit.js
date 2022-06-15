/*!
 * ${copyright}
 */

/* global QUnit, sinon */
/* eslint-disable no-new */

sap.ui.define([
	"sap/ui/mdc/util/PropertyHelper",
	"sap/ui/base/ManagedObject",
	"sap/ui/model/type/String",
	"sap/base/util/merge",
	"sap/base/Log"
], function(_PropertyHelper, ManagedObject, StringType, merge, Log) {
	"use strict";

	var PropertyHelper = _PropertyHelper.extend("sap.ui.mdc.util.test.PropertyHelper", {
		constructor: function(aProperties, oParent, mAdditionalAttributes) {
			_PropertyHelper.call(this, aProperties, oParent, Object.assign({
				filterable: true,
				sortable: true,
				propertyInfos: true,
				unit: {
					type: "PropertyReference"
				},
				exportSettings: {
					type: "object",
					"default": {
						value: {}
					},
					forComplexProperty: {allowed: true}
				}
			}, mAdditionalAttributes));
		}
	});

	QUnit.module("Validation of property infos", {
		beforeEach: function() {
			this.logWarning = sinon.spy(Log, "warning");
		},
		afterEach: function() {
			this.logWarning.restore();
		}
	});

	QUnit.test("Without property infos", function(assert) {
		assert.throws(function() {
			new PropertyHelper();
		}, new Error("Invalid property definition: Property infos must be an array."));
	});

	QUnit.test("Empty array as property infos", function(assert) {
		new PropertyHelper([]).destroy();
		assert.equal(this.logWarning.callCount, 0, "No warning logged");
	});

	QUnit.test("Contains non-plain objects", function(assert) {
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

	QUnit.test("Properties with the same name", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar"
			}, {
				name: "foo",
				label: "bar2"
			}]);
		}, new Error("Invalid property definition: Properties do not have unique names."));
	});

	QUnit.skip("Properties with an invalid name", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "0foo",
				label: "bar"
			}]);
		}, "Error thrown");
		assert.throws(function() {
			new PropertyHelper([{
				name: "foo#",
				label: "bar"
			}]);
		}, "Error thrown");
	});

	QUnit.test("Unknown attribute", function(assert) {
		new PropertyHelper([{
			name: "foo",
			label: "bar",
			foo: "bar"
		}]).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged if an attribute is unknown");

		this.logWarning.reset();
		new PropertyHelper([{
			name: "foo",
			label: "bar",
			typeConfig: {
				doesNotExist: true
			}
		}]).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged if a deeply nested attribute is unknown");
	});

	QUnit.test("Default attribute that was not allowed", function(assert) {
		new _PropertyHelper([{
			name: "foo",
			label: "bar",
			filterable: true
		}]).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged if a default attribute is set that is not allowed to be set");
	});

	QUnit.test("Missing mandatory attribute", function(assert) {
		new PropertyHelper([{
			label: "foo"
		}]).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged if 'name' is missing");

		this.logWarning.reset();
		new PropertyHelper([{
			name: "foo"
		}]).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged if 'label' is missing");

		this.logWarning.reset();
		new PropertyHelper([{
			name: "foo",
			label: "bar",
			additionalAttribute: {}
		}], null, {
			additionalAttribute: {
				type: {
					bar: {type: "string", mandatory: true}
				}
			}
		}).destroy();
		assert.equal(this.logWarning.callCount, 0, "No warning logged if a deeply nested attribute is missing");

		assert.throws(function() {
			new PropertyHelper([{
				name: undefined,
				label: "foo"
			}]);
		}, "Error thrown if mandatory attribute is set to 'undefined'");

		assert.throws(function() {
			new PropertyHelper([{
				name: null,
				label: "foo"
			}]);
		}, "Error thrown if mandatory attribute is set to 'null'");

		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar",
				additionalAttribute: null
			}], null, {
				additionalAttribute: {type: "object", mandatory: true, "default": {value: {}}}
			});
		}, "Error thrown if mandatory attribute of type 'object' is set to 'null'");

		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar",
				additionalAttribute: null
			}], null, {
				additionalAttribute: {
					type: {
						bar: {type: "object"}
					},
					mandatory: true
				}
			});
		}, "Error thrown if a mandatory complex attribute is set to 'null'");
	});

	QUnit.test("Invalid values", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: true,
				label: "label"
			}]);
		}, "Error thrown if the value has an incorrect type");

		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar",
				typeConfig: true
			}]);
		}, "Error thrown if the value of a complex object attribute has an incorrect type");

		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar",
				typeConfig: {
					className: true
				}
			}]);
		}, "Error thrown if the value of a deeply nested attribute has an incorrect type");

		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar",
				additionalAttribute: "bar"
			}], null, {
				additionalAttribute: {type: "string[]"}
			});
		}, "Error thrown if the value for an attribute of type 'string[]' is a string");
	});

	QUnit.test("Invalid values for mandatory attributes", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: undefined,
				label: "bar"
			}]);
		}, "Error thrown if the value for an attribute of type 'string' is 'undefined'");

		assert.throws(function() {
			new PropertyHelper([{
				name: null,
				label: "bar"
			}]);
		}, "Error thrown if the value for an attribute of type 'string' is 'null'");

		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar",
				additionalAttribute: undefined
			}], null, {
				additionalAttribute: {type: "object", mandatory: true}
			});
		}, "Error thrown if the value for an attribute of type 'object' is 'undefined'");

		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar",
				additionalAttribute: null
			}], null, {
				additionalAttribute: {type: "object", mandatory: true}
			});
		}, "Error thrown if the value for an attribute of type 'object' is 'null'");
	});

	QUnit.test("Valid values for optional attributes", function(assert) {
		new PropertyHelper([{
			name: "foo",
			label: "bar",
			path: undefined
		}]).destroy();
		assert.ok(true, "No error thrown if the value for an optional attribute is 'undefined'");

		new PropertyHelper([{
			name: "foo",
			label: "bar",
			path: null
		}]).destroy();
		assert.ok(true, "No error thrown if the value for an optional attribute is 'null'");

		new PropertyHelper([{
			name: "foo",
			label: "bar",
			typeConfig: {
				className: undefined
			}
		}]).destroy();
		assert.ok(true, "No error thrown if the value of a deeply nested attribute is 'undefined'");

		new PropertyHelper([{
			name: "foo",
			label: "bar",
			typeConfig: {
				className: null
			}
		}]).destroy();
		assert.ok(true, "No error thrown if the value of a deeply nested attribute is 'null'");
	});

	QUnit.test("Single property reference: Referencing a complex property", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "prop",
				label: "Property",
				unit: "complexProperty"
			}, {
				name: "complexProperty",
				label: "Complex property",
				propertyInfos: ["prop"]
			}]);
		}, "Error thrown");
	});

	QUnit.test("Single property reference: Referencing a property which does not exist", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "propA",
				label: "Property A",
				unit: "propB"
			}]);
		}, "Error thrown");
	});

	QUnit.test("Single property reference: Referencing itself", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "propA",
				label: "Property A",
				unit: "propA"
			}]);
		}, "Error thrown");
	});

	QUnit.test("Multiple property references: Referencing a complex property", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "prop",
				label: "Property"
			}, {
				name: "complexPropertyA",
				label: "Complex property A",
				propertyInfos: ["complexPropertyB"]
			}, {
				name: "complexPropertyB",
				label: "Complex property B",
				propertyInfos: ["prop"]
			}]);
		}, "Error thrown");
	});

	QUnit.test("Multiple property references: One referenced property does not exist", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "prop",
				label: "Property"
			}, {
				name: "complexProperty",
				label: "Complex property",
				propertyInfos: ["prop", "nonExistingProperty"]
			}]);
		}, "Error thrown");
	});

	QUnit.test("Multiple property references: All referenced properties do not exist", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "complexProperty",
				label: "Complex property",
				propertyInfos: ["nonExistingProperty"]
			}]);
		}, "Error thrown");
	});

	QUnit.test("Multiple property references: Duplicate keys", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "prop",
				label: "Property"
			}, {
				name: "complexProperty",
				label: "Complex property",
				propertyInfos: ["prop", "prop"]
			}]);
		}, "Error thrown");
	});

	QUnit.test("Multiple property references: Referencing itself", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "complexProperty",
				label: "Complex property",
				propertyInfos: ["complexProperty"]
			}]);
		}, "Error thrown");
	});

	QUnit.test("Property references in a nested attribute: Referencing a complex property", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "prop",
				label: "Property",
				additionalAttribute: {
					foo: "complexProperty"
				}
			}, {
				name: "complexProperty",
				label: "Complex property",
				propertyInfos: ["prop"]
			}], null, {
				additionalAttribute: {
					type: {
						foo: {type: "PropertyReference"}
					}
				}
			});
		}, "Error thrown");
	});

	QUnit.test("Property references in a nested attribute: One referenced property does not exist", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "propA",
				label: "Property A",
				additionalAttribute: {
					foo: ["propB", "nonExistingProperty"]
				}
			}, {
				name: "propB",
				label: "Property B"
			}], null, {
				additionalAttribute: {
					type: {
						foo: {type: "PropertyReference[]"}
					}
				}
			});
		}, "Error thrown");
	});

	QUnit.test("Property references in a nested attribute: All referenced properties do not exist", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "prop",
				label: "Property",
				additionalAttribute: {
					foo: ["nonExistingProperty"]
				}
			}], null, {
				additionalAttribute: {
					type: {
						foo: {type: "PropertyReference[]"}
					}
				}
			});
		}, "Error thrown");
	});

	QUnit.test("Property references in a nested attribute: Duplicate keys", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "propA",
				label: "Property A",
				additionalAttribute: {
					foo: ["propB", "propB"]
				}
			}, {
				name: "propB",
				label: "Property B"
			}], null, {
				additionalAttribute: {
					type: {
						foo: {type: "PropertyReference[]"}
					}
				}
			});
		}, "Error thrown");
	});

	QUnit.test("Property references in a nested attribute: Referencing itself", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "propA",
				label: "Property A",
				additionalAttribute: {
					foo: ["propA"]
				}
			}], null, {
				additionalAttribute: {
					type: {
						foo: {type: "PropertyReference[]"}
					}
				}
			});
		}, "Error thrown");
	});

	QUnit.test("Property references in a nested attribute: No references", function(assert) {
		new PropertyHelper([{
			name: "propA",
			label: "Property A",
			additionalAttribute: {
				foo: []
			}
		}], null, {
			additionalAttribute: {
				type: {
					foo: {type: "PropertyReference[]"}
				}
			}
		}).destroy();
		assert.ok(true, "No error thrown");
	});

	QUnit.test("Complex property with an attribute that is not allowed", function(assert) {
		new PropertyHelper([{
			name: "prop",
			label: "Property"
		}, {
			name: "complexProperty",
			label: "Complex property",
			path: "complexPath", // not allowed for complex properties
			propertyInfos: ["prop"]
		}]).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged");
	});

	QUnit.test("Complex property does not reference any properties", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "complexProperty",
				label: "Complex property",
				propertyInfos: []
			}]);
		}, "Error thrown if 'propertyInfos' is an empty array");

		assert.throws(function() {
			new PropertyHelper([{
				name: "complexProperty",
				label: "Complex property",
				propertyInfos: null
			}]);
		}, "Error thrown if 'propertyInfos' is 'null'");
	});

	QUnit.test("Complex property with nested attribute including attributes that are not allowed for complex properties", function(assert) {
		new PropertyHelper([{
			name: "propA",
			label: "prop A"
		}, {
			name: "propB",
			label: "prop B",
			propertyInfos: ["propA"],
			foo: {
				bar: {
					propB: 2
				}
			}
		}], null, null, {
			foo: {
				type: {
					bar: {
						type: {
							propA: {type: "string"},
							propB: {type: "int", forComplexProperty: {allowed: false}}
						},
						"default": {value: {}}
					}
				},
				forComplexProperty: {
					allowed: true
				},
				"default": {value: {}}
			}
		});
		assert.equal(this.logWarning.callCount, 1, "Warning logged");
	});

	QUnit.module("Validation of additional attributes", {
		beforeEach: function() {
			this.logWarning = sinon.spy(Log, "warning");
		},
		afterEach: function() {
			this.logWarning.restore();
		}
	});

	QUnit.test("No additional attributes", function(assert) {
		new _PropertyHelper([{
			name: "foo",
			label: "bar",
			filterable: true
		}]).destroy();
		assert.ok(true, "No error thrown");
	});

	QUnit.test("Add a reserved standard attribute", function(assert) {
		new _PropertyHelper([{
			name: "foo",
			label: "bar",
			filterable: true
		}], null, {
			name: true,
			filterable: true
		}).destroy();
		assert.ok(true, "No error thrown");
	});

	QUnit.test("Override a reserved standard attribute", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar"
			}], null, {
				name: {type: "string"}
			});
		}, new Error("The attribute 'name' is reserved and cannot be overridden by additional attributes."));
	});

	QUnit.test("Exclude a reserved standard attribute", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar"
			}], null, {
				name: false
			});
		}, new Error("The attribute 'name' is reserved and cannot be overridden by additional attributes."));

		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar"
			}], null, {
				name: undefined
			});
		}, new Error("The attribute 'name' is reserved and cannot be overridden by additional attributes."));
	});

	QUnit.test("Missing mandatory attribute", function(assert) {
		new PropertyHelper([{
			name: "foo",
			label: "bar"
		}], null, {
			additionalAttribute: {type: "string", mandatory: true}
		}).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged if an attribute is missing");
	});

	QUnit.test("Complex property with an attribute that is not allowed", function(assert) {
		new PropertyHelper([{
			name: "prop",
			label: "Property"
		}, {
			name: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"],
			additionalAttribute: "value"
		}], null, {
			additionalAttribute: {type: "string"}
		}).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged");
	});

	QUnit.module("Setting defaults and cloning of property infos", {
		deepEqualProperties: function(assert, oPropertyHelper, aExpected, sMessage) {
			var mSimpleDefaults = {
				visible: true,
				sortable: true,
				filterable: true,
				path: "",
				unit: "",
				group: "",
				groupLabel: "",
				tooltip: "",
				exportSettings: {},
				caseSensitive: true,
				maxConditions: -1,
				typeConfig: null
			};
			var mComplexDefaults = {
				propertyInfos: [],
				visible: true,
				sortable: false,
				filterable: false,
				path: null,
				group: "",
				groupLabel: "",
				tooltip: "",
				exportSettings: {},
				maxConditions: null,
				typeConfig: null
			};
			var aExpectedWithDefaults = aExpected.map(function(oProperty) {
				if ("propertyInfos" in oProperty) {
					return Object.assign({}, mComplexDefaults, oProperty);
				}

				return Object.assign({}, mSimpleDefaults, oProperty);
			});

			assert.deepEqual(oPropertyHelper.getProperties(), aExpectedWithDefaults, sMessage || "Properties");
		}
	});

	QUnit.test("Basic defaults", function(assert) {
		var aPropertyInfos = [{
			name: "prop",
			label: "prop"
		}, {
			name: "complexProperty",
			label: "Complex property",
			tooltip: "Complex custom tooltip",
			propertyInfos: ["prop"]
		}];
		var oPropertyHelper = new PropertyHelper(aPropertyInfos);

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "prop",
			label: "prop"
		}, {
			name: "complexProperty",
			label: "Complex property",
			tooltip: "Complex custom tooltip",
			propertyInfos: ["prop"]
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Extended defaults", function(assert) {
		var aPropertyInfos = [{
			name: "propA",
			label: "Property A",
			unit: "unit",
			additionalAttribute: "attr",
			additionalComplexAttribute: {
				subAttribute: "subAttr"
			}
		}, {
			name: "propB",
			label: "Property B",
			unit: "unit"
		}, {
			name: "complexPropA",
			label: "Complex property A",
			propertyInfos: ["propA"]
		}, {
			name: "complexPropB",
			label: "Complex property B",
			propertyInfos: ["propA"]
		}, {
			name: "unit",
			label: "Unit"
		}];
		var oPropertyHelper = new PropertyHelper(aPropertyInfos, null, {
			additionalAttribute: {
				type: "string",
				"default": {value: "AttributeDefault"},
				forComplexProperty: {
					valueIfNotAllowed: "DefaultForComplex"
				}
			},
			additionalComplexAttribute: {
				type: {
					subAttribute: {type: "string"}
				}
			},
			additionalDefaultWithDeepPath: {
				type: "string",
				"default": {value: "attribute:additionalComplexAttribute.subAttribute"}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "propA",
			label: "Property A",
			unit: "unit",
			additionalAttribute: "attr",
			additionalComplexAttribute: {
				subAttribute: "subAttr"
			},
			additionalDefaultWithDeepPath: "subAttr"
		}, {
			name: "propB",
			label: "Property B",
			unit: "unit",
			additionalAttribute: "AttributeDefault",
			additionalComplexAttribute: null,
			additionalDefaultWithDeepPath: ""
		}, {
			name: "complexPropA",
			label: "Complex property A",
			propertyInfos: ["propA"],
			additionalAttribute: "DefaultForComplex"
		}, {
			name: "complexPropB",
			label: "Complex property B",
			propertyInfos: ["propA"],
			additionalAttribute: "DefaultForComplex"
		}, {
			name: "unit",
			label: "Unit",
			additionalAttribute: "AttributeDefault",
			additionalComplexAttribute: null,
			additionalDefaultWithDeepPath: ""
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Complex settings object not set", function(assert) {
		var aPropertyInfos = [{
			name: "prop",
			label: "prop"
		}];
		var oPropertyHelper = new PropertyHelper(aPropertyInfos, null, {
			additionalAttribute: {
				type: {
					foo: {type: "string"}
				}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "prop",
			label: "prop",
			additionalAttribute: null
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Complex settings object set to 'undefined'", function(assert) {
		var aPropertyInfos = [{
			name: "prop",
			label: "prop",
			additionalAttribute: undefined
		}];
		var oPropertyHelper = new PropertyHelper(aPropertyInfos, null, {
			additionalAttribute: {
				type: {
					foo: {type: "string"}
				}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "prop",
			label: "prop",
			additionalAttribute: null
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Complex settings object set to 'null'", function(assert) {
		var aPropertyInfos = [{
			name: "prop",
			label: "prop",
			additionalAttribute: null
		}];
		var oPropertyHelper = new PropertyHelper(aPropertyInfos, null, {
			additionalAttribute: {
				type: {
					foo: {type: "string"}
				}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "prop",
			label: "prop",
			additionalAttribute: null
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Property reference in a nested attribute defaults to another attribute", function(assert) {
		var oPropertyHelper = new PropertyHelper([{
			name: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}, {
			name: "prop",
			label: "Property"
		}]);

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}, {
			name: "prop",
			label: "Property"
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Property reference in a nested attribute defaults to another nested attribute", function(assert) {
		var oPropertyHelper = new PropertyHelper([{
			name: "propA",
			label: "Property A",
			foo: {},
			bar: {
				props: ["propB"]
			}
		}, {
			name: "propB",
			label: "Property B"
		}], null, {
			foo: {
				type: {
					props: {type: "PropertyReference[]", "default": {value: "attribute:bar.props"}}
				}
			},
			bar: {
				type: {
					props: {type: "PropertyReference[]"}
				}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "propA",
			label: "Property A",
			foo: {props: ["propB"]},
			bar: {props: ["propB"]}
		}, {
			name: "propB",
			label: "Property B",
			foo: null,
			bar: null
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Circular property reference", function(assert) {
		var oPropertyHelper = new PropertyHelper([{
			name: "propA",
			label: "Property A",
			foo: "propB"
		}, {
			name: "propB",
			label: "Property B",
			foo: "propA"
		}], null, {
			foo: {type: "PropertyReference"}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "propA",
			label: "Property A",
			foo: "propB"
		}, {
			name: "propB",
			label: "Property B",
			foo: "propA"
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Property reference cache", function(assert) {
		var oPropertyHelper = new PropertyHelper([{
			name: "prop",
			label: "Property",
			baz: "prop2"
		}, {
			name: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"],
			foo: {
				baz: ["prop"]
			}
		}, {
			name: "prop2",
			label: "Property 2"
		}], null, {
			foo: {
				type: {
					bar: {type: "PropertyReference[]", "default": {value: "attribute:propertyInfos"}, forComplexProperty: {allowed: true}},
					baz: {type: "PropertyReference[]", forComplexProperty: {allowed: true}}
				},
				forComplexProperty: {allowed: true}
			},
			bar: {type: "PropertyReference", "default": {value: "attribute:baz"}},
			baz: {type: "PropertyReference"}
		});

		assert.ok(!oPropertyHelper.getProperty("prop").hasOwnProperty("propertyInfosProperties"),
			"Complex property reference cache in a simple property");
		assert.ok(!oPropertyHelper.getProperty("prop2").hasOwnProperty("singleRefProperty"),
			"Property reference cache if no reference defined");
		assert.strictEqual(oPropertyHelper.getProperty("complexProp").propertyInfosProperties[0], oPropertyHelper.getProperty("prop"),
			"Cached property reference of a complex property");
		assert.strictEqual(oPropertyHelper.getProperty("complexProp").foo.barProperties[0], oPropertyHelper.getProperty("prop"),
			"Cached property reference array of default value");
		assert.strictEqual(oPropertyHelper.getProperty("complexProp").foo.bazProperties[0], oPropertyHelper.getProperty("prop"),
			"Cached property reference array of specified value");
		assert.strictEqual(oPropertyHelper.getProperty("prop").barProperty, oPropertyHelper.getProperty("prop2"),
			"Cached property reference of default value");
		assert.strictEqual(oPropertyHelper.getProperty("prop").bazProperty, oPropertyHelper.getProperty("prop2"),
			"Cached property reference of specified value");
	});

	QUnit.test("Propagation of 'allowed for complex property' to child attributes", function(assert){
		var oPropertyHelper = new PropertyHelper([{
			name: "prop",
			label: "prop"
		}, {
			name: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}], null, {
			foo: {
				type: {
					bar: {
						type: {
							propA: {type: "string", "default": {value: "XYZ"}},
							propB: {type: "int", "default": {value: 2}, forComplexProperty: {allowed: false}}
						}
					}
				},
				"default": {value: {bar: {}}},
				forComplexProperty: {allowed: true}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "prop",
			label: "prop",
			foo: {
				bar: {
					propA: "XYZ",
					propB: 2
				}
			}
		}, {
			name: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"],
			foo: {
				bar: {
					propA: "XYZ"
				}
			}
		}]);
	});

	QUnit.test("Prevent propagation of 'allowed for complex property' to child attributes", function(assert){
		var oPropertyHelper = new PropertyHelper([{
			name: "prop",
			label: "prop"
		}, {
			name: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}], null, {
			foo: {
				type: {
					bar: {type: "string", "default": {value: "XYZ"}}
				},
				"default": {value: {}},
				forComplexProperty: {allowed: true, propagateAllowance: false}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "prop",
			label: "prop",
			foo: {
				bar: "XYZ"
			}
		}, {
			name: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"],
			foo: {}
		}]);
	});

	QUnit.test("Ignore default values if ignoreIfNull = true", function(assert){
		var aPropertyInfos = [{
			name: "propX",
			label: "prop X",
			foo: {
				bar: null,
				lot: undefined
			}
		}, {
			name: "propY",
			label: "prop Y",
			propertyInfos: ["propX"],
			foo: {
				bar: undefined,
				lot: "Test"
			}
		}, {
			name: "propK",
			label: "prop K",
			foo: {
				bar: {
					propA: null,
					propB: null
				},
				lot: null
			}
		}, {
			name: "propZ",
			label: "prop Z",
			foo: null
		}, {
			name: "propJ",
			label: "prop J",
			propertyInfos: ["propZ"],
			foo: undefined
		}];
		var oPropertyHelper = new PropertyHelper(aPropertyInfos, null, {
			foo: {
				type: {
					bar: {
						type: {
							propA: {type: "string", "default": {value: "XYZ"}},
							propB: {type: "int", "default": {value: 2, ignoreIfNull: true}}
						},
						"default": {value: {}, ignoreIfNull: true}
					},
					lot: {type: "string", "default": {ignoreIfNull: true}}
				},
				"default": {value: {}},
				forComplexProperty: {allowed: true}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "propX",
			label: "prop X",
			foo: {
				bar: null,
				lot: ""
			}
		}, {
			name: "propY",
			label: "prop Y",
			propertyInfos: ["propX"],
			foo: {
				bar: {
					propA: "XYZ",
					propB: 2
				},
				lot: "Test"
			}
		}, {
			name: "propK",
			label: "prop K",
			foo: {
				bar: {
					propA: "XYZ",
					propB: null
				},
				lot: ""
			}
		}, {
			name: "propZ",
			label: "prop Z",
			foo: {
				bar: {
					propA: "XYZ",
					propB: 2
				},
				lot: ""
			}
		}, {
			name: "propJ",
			label: "prop J",
			propertyInfos: ["propZ"],
			foo: {
				bar: {
					propA: "XYZ",
					propB: 2
				},
				lot: ""
			}
		}]);
	});

	QUnit.test("Not modifying original property infos", function(assert) {
		var aPropertyInfos = [{
			name: "prop",
			label: "prop"
		}, {
			name: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}];
		var oPropertyHelper = new PropertyHelper(aPropertyInfos);

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "prop",
			label: "prop"
		}, {
			name: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}]);

		assert.deepEqual(aPropertyInfos, [{
			name: "prop",
			label: "prop"
		}, {
			name: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}], "Original property infos were not modified");

		oPropertyHelper.destroy();
	});

	QUnit.test("Cloning original property infos", function(assert) {
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
			label: "Complex property",
			propertyInfos: ["prop"]
		}];
		var oPropertyHelper = new PropertyHelper(aPropertyInfos);
		var aClonedProperties = oPropertyHelper.getProperties();

		assert.notStrictEqual(aClonedProperties, aPropertyInfos, "Property info array was cloned");
		assert.notStrictEqual(aClonedProperties[0], aPropertyInfos[0], "Property object was cloned");
		assert.notStrictEqual(aClonedProperties[0].exportSettings, aPropertyInfos[0].exportSettings, "Setting of type 'object' was cloned");
		assert.notStrictEqual(aClonedProperties[0].typeConfig, aPropertyInfos[0].typeConfig, "Setting containing an instance was cloned");
		assert.notStrictEqual(aClonedProperties[1], aPropertyInfos[1], "Complex property was cloned");
		assert.notStrictEqual(aClonedProperties[1].propertyInfos, aPropertyInfos[1].propertyInfos,
			"Property infos array of complex property was cloned");

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
			label: "Complex property",
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

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "prop",
			label: "prop",
			exportSettings: {
				label: "exportLabel",
				width: 10
			}
		}, {
			name: "complexProperty",
			label: "Complex property",
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

		this.deepEqualProperties(assert, oPropertyHelper, [{
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

		oPropertyHelper = new PropertyHelper([], null, null);
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
			new PropertyHelper([], new (ManagedObject.getMetadata().getParent().getClass())());
		}, new Error("The type of the parent is invalid."), "Error thrown if the type of the parent is invalid");

		assert.throws(function() {
			new PropertyHelper([], {});
		}, new Error("The type of the parent is invalid."), "Error thrown if the parent is a plain object");
	});

	QUnit.module("Immutability of property infos", {
		before: function() {
			this.oPropertyHelper = new PropertyHelper([{
				name: "prop",
				label: "Property",
				additionalAttribute: {
					object: {
						object: {}
					},
					array: [{}],
					func: function() {}
				},
				singleRef: "otherProp",
				multiRef: ["otherProp"]
			}, {
				name: "complexProp",
				label: "Complex property",
				propertyInfos: ["prop", "otherProp"]
			}, {
				name: "otherProp",
				label: "My other property"
			}], null, {
				additionalAttribute: {type: "object"},
				singleRef: {type: "PropertyReference"},
				multiRef: {type: "PropertyReference[]"}
			});
		},
		after: function() {
			this.oPropertyHelper.destroy();
		}
	});

	QUnit.test("Property", function(assert) {
		var oProp = this.oPropertyHelper.getProperty("prop");
		var oComplexProp = this.oPropertyHelper.getProperty("complexProp");
		var oOtherProp = this.oPropertyHelper.getProperty("otherProp");

		assert.ok(Object.isFrozen(oProp, "Simple property is frozen"));
		assert.ok(Object.isFrozen(oComplexProp), "Complex property is frozen");
		assert.ok(Object.isFrozen(oOtherProp), "Simple property referenced by complex property is frozen");
		assert.ok(Object.isFrozen(oComplexProp.propertyInfos), "Attribute 'propertyInfos' is frozen");
		assert.ok(Object.isFrozen(oComplexProp.propertyInfosProperties), "Cached property reference of complex property is frozen");
		assert.ok(Object.isFrozen(oComplexProp.propertyInfosProperties[0]), "Properties in cached property reference of complex property are frozen");
		assert.ok(Object.isFrozen(oProp.singleRefProperty), "Single-reference cache is frozen");
		assert.ok(Object.isFrozen(oProp.multiRefProperties), "Multi-reference cache is frozen");
		assert.ok(Object.isFrozen(oProp.multiRefProperties[0]), "Properties in multi-reference cache are frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute), "Plain object attribute is frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute.object), "Plain object attribute: Nested object is frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute.object.object), "Plain object attribute: Deeply nested object is frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute.array), "Plain object attribute: Nested array is frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute.array[0]), "Plain object attribute: Object in nested array is frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute.func), "Function attribute is frozen");
	});

	QUnit.test("Property info array", function(assert) {
		var aProperties = this.oPropertyHelper.getProperties();

		assert.ok(Object.isFrozen(aProperties), "The property infos array is frozen");
		assert.ok(Object.isFrozen(aProperties[0]), "Simple property is frozen");
		assert.ok(Object.isFrozen(aProperties[1]), "Complex property is frozen");
		assert.ok(Object.isFrozen(aProperties[2]), "Simple property referenced by a complex property is frozen");
		assert.ok(Object.isFrozen(aProperties[1].getSimpleProperties()), "The return value of 'getSimpleProperties' is frozen");
		assert.ok(Object.isFrozen(aProperties[1].getSimpleProperties()[0]), "Properties returned by 'getSimpleProperties' are frozen");
		assert.ok(Object.isFrozen(aProperties[0].additionalAttribute), "Object attributes are frozen");
		assert.ok(Object.isFrozen(aProperties[0].additionalAttribute.object), "Objects nested in object attributes are frozen");
		assert.ok(Object.isFrozen(aProperties[0].additionalAttribute.object.object), "Objects deeply nested in object attributes are frozen");
		assert.ok(Object.isFrozen(aProperties[0].additionalAttribute.array), "Arrays nested in object attributes are frozen");
		assert.ok(Object.isFrozen(aProperties[0].additionalAttribute.array[0]), "Objects in arrays nested in object attributes are frozen");
	});

	QUnit.test("Property info map", function(assert) {
		var mPropertyMap = this.oPropertyHelper.getPropertyMap();

		assert.ok(Object.isFrozen(mPropertyMap), "The property map is frozen");
		assert.ok(Object.isFrozen(mPropertyMap.prop), "Simple property is frozen");
		assert.ok(Object.isFrozen(mPropertyMap.complexProp), "Complex property is frozen");
		assert.ok(Object.isFrozen(mPropertyMap.otherProp), "Simple property referenced by a complex property is frozen");
		assert.ok(Object.isFrozen(mPropertyMap.complexProp.getSimpleProperties()), "The return value of 'getSimpleProperties' is frozen");
		assert.ok(Object.isFrozen(mPropertyMap.complexProp.getSimpleProperties()[0]), "Properties returned by 'getSimpleProperties' are frozen");
		assert.ok(Object.isFrozen(mPropertyMap.prop.additionalAttribute), "Object attributes are frozen");
		assert.ok(Object.isFrozen(mPropertyMap.prop.additionalAttribute.object), "Objects nested in object attributes are frozen");
		assert.ok(Object.isFrozen(mPropertyMap.prop.additionalAttribute.object.object), "Objects deeply nested in object attributes are frozen");
		assert.ok(Object.isFrozen(mPropertyMap.prop.additionalAttribute.array), "Arrays nested in object attributes are frozen");
		assert.ok(Object.isFrozen(mPropertyMap.prop.additionalAttribute.array[0]), "Objects in arrays nested in object attributes are frozen");
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
				unit: "propB",
				groupLabel: "Property A group label",
				exportSettings: {
					width: 20,
					label: "Property A export label"
				},
				maxConditions: 2,
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
			assert.strictEqual(aProperties[iIndex].name, oOriginalProperty.name,
				"The property array references the correct property at index " + iIndex);
		});

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getProperties(), [], "After destruction");
	});

	QUnit.test("setProperties", function(assert) {
		var oValidatePropertiesSpy = sinon.spy();
		var oValidatePropertySpy = sinon.spy();

		var aReplacementProperties = [{
			name: "ReplacedPropA",
			label: "Replaced Property A",
			sortable: false,
			filterable: false,
			visible: false
		}, {
			name: "ReplacedPropB",
			label: "Replaced Property B",
			sortable: false,
			filterable: false,
			visible: false
		}];

		var MyPropertyHelper = PropertyHelper.extend("sap.ui.mdc.test.table.PropertyHelper", {
			validateProperties: function() {
				PropertyHelper.prototype.validateProperties.apply(this, arguments);
				oValidatePropertiesSpy.apply(this, merge([], arguments));
			},
			validateProperty: function() {
				PropertyHelper.prototype.validateProperty.apply(this, arguments);
				oValidatePropertySpy.apply(this, merge([], arguments));
			}
		});
		var oMyPropertyHelper = new MyPropertyHelper(this.aOriginalProperties);

		oValidatePropertiesSpy.resetHistory();
		oValidatePropertySpy.resetHistory();
		oMyPropertyHelper.setProperties(aReplacementProperties);
		var aProperties = oMyPropertyHelper.getProperties();

		assert.equal(aProperties.length, aReplacementProperties.length,
			"The property array contains as many entries as there are replaced properties");
		aReplacementProperties.forEach(function(oReplacementProperty, iIndex) {
			assert.strictEqual(aProperties[iIndex].name, oReplacementProperty.name,
				"The property array references the correct replaced property at index " + iIndex);
		});
		assert.ok(oValidatePropertiesSpy.calledOnceWithExactly(aReplacementProperties, this.aOriginalProperties),
			"#validateProperties called once with the correct arguments");
		assert.equal(oValidatePropertySpy.callCount, 2, "#validateProperty called twice");
		assert.ok(oValidatePropertySpy.getCall(0).calledWithExactly(aReplacementProperties[0], aReplacementProperties, this.aOriginalProperties),
			"Arguments of first call");
		assert.ok(oValidatePropertySpy.getCall(1).calledWithExactly(aReplacementProperties[1], aReplacementProperties, this.aOriginalProperties),
			"Arguments of first call");

		assert.throws(function() {
			oMyPropertyHelper.setProperties();
		}, new Error("Invalid property definition: Property infos must be an array."));

		oMyPropertyHelper.destroy();
	});

	QUnit.test("getPropertyMap", function(assert) {
		var mProperties = this.oPropertyHelper.getPropertyMap();

		assert.equal(Object.keys(mProperties).length, this.aOriginalProperties.length,
			"The property map contains as many entries as there are properties");

		this.aProperties.forEach(function(oProperty) {
			assert.strictEqual(mProperties[oProperty.name], oProperty,
				"The map references the correct property for the key '" + oProperty.name + "'");
		});

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getPropertyMap(), {}, "After destruction");
	});

	QUnit.test("getProperty", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getProperty(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getProperty({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.getProperty("propA"), this.aProperties[0], "Name of a simple property");
		assert.strictEqual(this.oPropertyHelper.getProperty(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getProperty("complexPropA"), this.aProperties[2], "Name of a complex property");
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

	QUnit.test("hasProperty", function(assert) {
		assert.strictEqual(this.oPropertyHelper.hasProperty(), false, "No arguments");
		assert.strictEqual(this.oPropertyHelper.hasProperty({}), false, "Empty object");
		assert.strictEqual(this.oPropertyHelper.hasProperty("propA"), true, "Name of a simple property");
		assert.strictEqual(this.oPropertyHelper.hasProperty(this.aProperties[0]), false, "Simple property");
		assert.strictEqual(this.oPropertyHelper.hasProperty("complexPropA"), true, "Name of a complex property");
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

	QUnit.test("isPropertyComplex", function(assert) {
		assert.strictEqual(_PropertyHelper.isPropertyComplex(), false, "No arguments");
		assert.strictEqual(_PropertyHelper.isPropertyComplex({}), false, "Empty object");
		assert.strictEqual(_PropertyHelper.isPropertyComplex("propA"), false, "Name of a simple property");
		assert.strictEqual(_PropertyHelper.isPropertyComplex(this.aProperties[0]), false, "Known simple property");
		assert.strictEqual(_PropertyHelper.isPropertyComplex("complexPropA"), false, "Name of a complex property");
		assert.strictEqual(_PropertyHelper.isPropertyComplex(this.aProperties[2]), true, "Known complex property");
		assert.strictEqual(_PropertyHelper.isPropertyComplex("unknownProp"), false, "Unknown property key");
		assert.strictEqual(_PropertyHelper.isPropertyComplex({
			name: "propA",
			label: "Property"
		}), false, "Unknown simple property");
		assert.strictEqual(_PropertyHelper.isPropertyComplex({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), true, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(_PropertyHelper.isPropertyComplex({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), true, "After destruction");
	});

	QUnit.test("getSortableProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getSortableProperties(), [
			this.aProperties[0]
		]);

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getSortableProperties(), [], "After destruction");
	});

	QUnit.test("getFilterableProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties(), [
			this.aProperties[0]
		]);

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties(), [], "After destruction");
	});

	QUnit.test("getVisibleProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(), [
			this.aProperties[0],
			this.aProperties[2],
			this.aProperties[4]
		]);

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(), [], "After destruction");
	});

	QUnit.module("Property", {
		beforeEach: function() {
			this.oPropertyHelper = new PropertyHelper([{
				name: "prop",
				label: "Property"
			}, {
				name: "prop2",
				label: "Property 2",
				sortable: false,
				filterable: false,
				visible: false
			}, {
				name: "complexProp",
				label: "Complex property",
				propertyInfos: ["prop"]
			}, {
				name: "complexProp2",
				label: "Complex property 2",
				propertyInfos: ["prop2"]
			}, {
				name: "complexProp3",
				label: "Complex property 3",
				propertyInfos: ["prop"],
				visible: false
			}, {
				name: "complexProp4",
				label: "Complex property 4",
				propertyInfos: ["prop2"],
				visible: false
			}]);
		},
		afterEach: function() {
			this.oPropertyHelper.destroy();
		},
		assertProperty: function(assert, oProperty) {
			var aExpectedMethods = [
				"isComplex", "getSimpleProperties", "getSortableProperties", "getFilterableProperties", "getVisibleProperties"
			];
			var aActualMethods = [];

			assert.ok(Object.getPrototypeOf(oProperty) === Object.prototype, "The property inherits directly from Object");

			Object.getOwnPropertyNames(oProperty).forEach(function(sProperty) {
				if (typeof oProperty[sProperty] === "function") {
					aActualMethods.push(sProperty);
				}
			});

			assert.deepEqual(aActualMethods.sort(), aExpectedMethods.sort(), "Methods");
		}
	});

	QUnit.test("Simple property", function(assert) {
		this.assertProperty(assert, this.oPropertyHelper.getProperties()[0]);
	});

	QUnit.test("Complex property", function(assert) {
		this.assertProperty(assert, this.oPropertyHelper.getProperties()[1]);
	});

	QUnit.test("Property referenced by complex property", function(assert) {
		this.assertProperty(assert, this.oPropertyHelper.getProperty("complexProp").getSimpleProperties()[0]);
	});

	QUnit.test("isComplex", function(assert) {
		var oComplexProperty = this.oPropertyHelper.getProperty("complexProp");

		assert.strictEqual(this.oPropertyHelper.getProperty("prop").isComplex(), false, "Simple property");
		assert.strictEqual(oComplexProperty.isComplex(), true, "Complex property");
		assert.ok(Object.isFrozen(oComplexProperty.isComplex), "The function is frozen");

		this.oPropertyHelper.destroy();
		assert.strictEqual(oComplexProperty.isComplex(), true, "After destruction");
	});

	QUnit.test("getSimpleProperties", function(assert) {
		var oSimpleProperty = this.oPropertyHelper.getProperty("prop");
		var oComplexProperty = this.oPropertyHelper.getProperty("complexProp");

		assert.deepEqual(oSimpleProperty.getSimpleProperties(), [oSimpleProperty], "Simple property");
		assert.deepEqual(oComplexProperty.getSimpleProperties(), [oSimpleProperty], "Complex property");
		assert.ok(Object.isFrozen(oComplexProperty.getSimpleProperties), "The function 'getSimpleProperties' is frozen");
		assert.ok(Object.isFrozen(oComplexProperty.getSimpleProperties()), "The array returned by 'getSimpleProperties' is frozen");
		assert.ok(Object.isFrozen(oComplexProperty.getSimpleProperties()[0]), "Properties returned by 'getSimpleProperties' are frozen");

		this.oPropertyHelper.destroy();
		assert.deepEqual(oSimpleProperty.getSimpleProperties(), [oSimpleProperty], "Simple property: After destruction");
		assert.deepEqual(oComplexProperty.getSimpleProperties(), [oSimpleProperty], "Complex property: After destruction");
	});

	QUnit.test("getSortableProperties", function(assert) {
		var oSimpleProperty = this.oPropertyHelper.getProperty("prop");
		var oComplexProperty = this.oPropertyHelper.getProperty("complexProp");

		oSimpleProperty.getSortableProperties().push("s"); // Returned array must not be influenced by changes to previously returned arrays.
		assert.deepEqual(oSimpleProperty.getSortableProperties(), [oSimpleProperty], "Sortable simple property");
		assert.deepEqual(oComplexProperty.getSortableProperties(), [oSimpleProperty], "Complex property referencing sortable properties");
		assert.deepEqual(this.oPropertyHelper.getProperty("prop2").getSortableProperties(), [], "Non-sortable simple property");
		assert.deepEqual(this.oPropertyHelper.getProperty("complexProp2").getSortableProperties(), [],
			"Complex property referencing non-sortable properties");
		assert.ok(Object.isFrozen(oSimpleProperty.getSortableProperties), "The function is frozen");
		assert.ok(Object.isFrozen(oSimpleProperty.getSortableProperties()[0]), "Returned properties are frozen");

		this.oPropertyHelper.destroy();
		assert.deepEqual(oComplexProperty.getSortableProperties(), [oSimpleProperty], "After destruction");
	});

	QUnit.test("getFilterableProperties", function(assert) {
		var oSimpleProperty = this.oPropertyHelper.getProperty("prop");
		var oComplexProperty = this.oPropertyHelper.getProperty("complexProp");

		oSimpleProperty.getFilterableProperties().push("s"); // Returned array must not be influenced by changes to previously returned arrays.
		assert.deepEqual(oSimpleProperty.getFilterableProperties(), [oSimpleProperty], "Filterable simple property");
		assert.deepEqual(oComplexProperty.getFilterableProperties(), [oSimpleProperty], "Complex property referencing filterable properties");
		assert.deepEqual(this.oPropertyHelper.getProperty("prop2").getFilterableProperties(), [], "Non-filterable simple property");
		assert.deepEqual(this.oPropertyHelper.getProperty("complexProp2").getFilterableProperties(), [],
			"Complex property referencing non-filterable properties");
		assert.ok(Object.isFrozen(oSimpleProperty.getFilterableProperties), "The function is frozen");
		assert.ok(Object.isFrozen(oSimpleProperty.getFilterableProperties()[0]), "Returned properties are frozen");

		this.oPropertyHelper.destroy();
		assert.deepEqual(oComplexProperty.getFilterableProperties(), [oSimpleProperty], "After destruction");
	});

	QUnit.test("getVisibleProperties", function(assert) {
		var oSimpleProperty = this.oPropertyHelper.getProperty("prop");
		var oComplexProperty = this.oPropertyHelper.getProperty("complexProp");

		oSimpleProperty.getVisibleProperties().push("s"); // Returned array must not be influenced by changes to previously returned arrays.
		assert.deepEqual(oSimpleProperty.getVisibleProperties(), [oSimpleProperty], "Visible simple property");
		assert.deepEqual(oComplexProperty.getVisibleProperties(), [oSimpleProperty], "Visible complex property referencing visible properties");
		assert.deepEqual(this.oPropertyHelper.getProperty("complexProp2").getVisibleProperties(), [],
			"Visible complex property referencing invisible properties");
		assert.deepEqual(this.oPropertyHelper.getProperty("prop2").getVisibleProperties(), [], "Invisible simple property");
		assert.deepEqual(this.oPropertyHelper.getProperty("complexProp3").getVisibleProperties(), [oSimpleProperty],
			"Invisible complex property referencing visible properties");
		assert.deepEqual(this.oPropertyHelper.getProperty("complexProp4").getVisibleProperties(), [],
			"Invisible complex property referencing invisible properties");
		assert.ok(Object.isFrozen(oSimpleProperty.getVisibleProperties), "The function is frozen");
		assert.ok(Object.isFrozen(oSimpleProperty.getVisibleProperties()[0]), "Returned properties are frozen");

		this.oPropertyHelper.destroy();
		assert.deepEqual(oComplexProperty.getVisibleProperties(), [oSimpleProperty], "After destruction");
	});

	QUnit.module("Inheritance");

	QUnit.test("Property validation", function(assert) {
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
				oValidatePropertiesSpy.apply(this, merge([], arguments));
			},
			validateProperty: function() {
				oValidatePropertySpy.apply(this, merge([], arguments));
				PropertyHelper.prototype.validateProperty.apply(this, arguments);
			}
		});
		var oMyPropertyHelper = new MyPropertyHelper(aProperties);

		assert.ok(oValidatePropertiesSpy.calledOnceWithExactly(aProperties, undefined), "#validateProperties called once with the correct arguments");
		assert.equal(oValidatePropertySpy.callCount, 2, "#validateProperty called twice");
		assert.ok(oValidatePropertySpy.firstCall.calledWithExactly(aProperties[0], aProperties, undefined), "Arguments of first #validateProperty call");
		assert.ok(oValidatePropertySpy.secondCall.calledWithExactly(aProperties[1], aProperties, undefined), "Arguments of second #validateProperty call");

		oMyPropertyHelper.destroy();
	});

	QUnit.test("Property preparation", function(assert) {
		var oPreparePropertySpy = sinon.spy();
		var aProperties = [{
			name: "prop",
			label: "Property"
		}, {
			name: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}];
		var oCustomPropertyAttribute = {prop: "value"};
		var MyPropertyHelper = PropertyHelper.extend("sap.ui.mdc.test.table.PropertyHelper", {
			prepareProperty: function(oProperty) {
				oPreparePropertySpy.apply(this, merge([], arguments));
				PropertyHelper.prototype.prepareProperty.apply(this, arguments);
				oProperty.myAttribute = oCustomPropertyAttribute;
				oProperty.myMethod = function() {return "MyMethod";};
				oProperty.label = "label modified";
				oProperty.isComplex = function() {return "isComplex modified";};
			}
		});
		var oMyPropertyHelper = new MyPropertyHelper(aProperties);
		var oProperty = oMyPropertyHelper.getProperties()[0];

		assert.equal(oPreparePropertySpy.callCount, 2, "#prepareProperty called twice");
		assert.ok(oPreparePropertySpy.firstCall.calledWithExactly(aProperties[0]), "Arguments of first #prepareProperty call");
		assert.ok(oPreparePropertySpy.secondCall.calledWithExactly(aProperties[1]), "Arguments of second #prepareProperty call");
		assert.deepEqual(oProperty.myAttribute, oCustomPropertyAttribute, "Attributes can be added");
		assert.ok(Object.isFrozen(oProperty.myAttribute), "Added attributes are frozen");
		assert.deepEqual(oProperty.myMethod(), "MyMethod", "Methods can be added");
		assert.ok(Object.isFrozen(oProperty.myMethod), "Added methods are frozen");
		assert.strictEqual(oProperty.label, "label modified", "Default attributes can be changed");
		assert.ok(Object.isFrozen(oProperty.label), "Changed default attributes are frozen");
		assert.strictEqual(oProperty.isComplex(), "isComplex modified", "Default methods can be changed");
		assert.ok(Object.isFrozen(oProperty.isComplex), "Changed default methods are frozen");

		oMyPropertyHelper.destroy();
	});
});