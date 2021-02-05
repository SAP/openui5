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
		constructor: function(aProperties, mExtensions, oParent, aAllowedAttributes, mExtensionAttributeMetadata) {
			if (aAllowedAttributes && !Array.isArray(aAllowedAttributes)) {
				this._mExperimentalAdditionalAttributes = aAllowedAttributes;
			}
			aAllowedAttributes = ["filterable", "sortable", "groupable", "key", "propertyInfos", "unit", "exportSettings", "required"];
			_PropertyHelper.call(this, aProperties, mExtensions, oParent, aAllowedAttributes, mExtensionAttributeMetadata);
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
			extension: {}
		}]).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged if property contains the 'extension' attribute");

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
		}], null, null, {
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
			}], null, null, {
				additionalAttribute: {type: "object", mandatory: true, defaultValue: {}}
			});
		}, "Error thrown if mandatory attribute of type 'object' is set to 'null'");

		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar",
				additionalAttribute: null
			}], null, null, {
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
			}], null, null, {
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
			}], null, null, {
				additionalAttribute: {type: "object", mandatory: true}
			});
		}, "Error thrown if the value for an attribute of type 'object' is 'undefined'");

		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar",
				additionalAttribute: null
			}], null, null, {
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
			}], null, null, {
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
			}], null, null, {
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
			}], null, null, {
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
			}], null, null, {
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
			}], null, null, {
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
		}], null, null, {
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

	QUnit.module("Validation of extension attributes", {
		beforeEach: function() {
			this.logWarning = sinon.spy(Log, "warning");
		},
		afterEach: function() {
			this.logWarning.restore();
		}
	});

	QUnit.test("Extensions without attribute metadata", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar"
			}], {
				foo: {
					extensionAttribute: "baz"
				}
			});
		}, new Error("Property extensions are not supported."));
	});

	QUnit.test("Invalid extensions object", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar"
			}], "notAnObject", null, null, {
				extensionAttribute: {type: "string"}
			});
		}, new Error("Property extensions must be a plain object."));
	});

	QUnit.test("Extensions without property infos", function(assert) {
		assert.throws(function() {
			new PropertyHelper([], {
				foo: {
					extensionAttribute: "baz"
				}
			}, null, null, {
				extensionAttribute: {type: "string"}
			});
		}, new Error("At least one property extension does not point to an existing property."));

		assert.throws(function() {
			new PropertyHelper(null, {
				foo: {
					extensionAttribute: "baz"
				}
			}, null, null, {
				extensionAttribute: {type: "string"}
			});
		}, new Error("Invalid property definition: Property infos must be an array."));
	});

	QUnit.test("Property infos contain 'extension' attribute", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar",
				extension: {}
			}], {
				foo: {
					extensionAttribute: "baz"
				}
			}, null, null, {
				extensionAttribute: {type: "string"}
			});
		}, "Error thrown");
	});

	QUnit.test("Extensions for non-existing properties", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar"
			}], {
				doesNotExist: {
					extensionAttribute: "baz"
				}
			}, null, null, {
				extensionAttribute: {type: "string"}
			});
		}, new Error("At least one property extension does not point to an existing property."));
	});

	QUnit.test("Unknown attribute", function(assert) {
		new PropertyHelper([{
			name: "foo",
			label: "bar"
		}], {
			foo: {
				doesNotExist: "baz"
			}
		}, null, null, {
			extensionAttribute: {type: "string"}
		}).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged if an attribute is unknown");

		this.logWarning.reset();
		new PropertyHelper([{
			name: "foo",
			label: "bar",
			extensionAttribute: "test"
		}], null, null, null, {
			extensionAttribute: {type: "string"}
		}).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged if an attribute is provided in the standard info");
	});

	QUnit.test("Missing mandatory attribute", function(assert) {
		new PropertyHelper([{
			name: "foo",
			label: "bar"
		}], null, null, null, {
			extensionAttribute: {type: "string", mandatory: true}
		}).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged if an attribute is missing");

		this.logWarning.reset();
		new PropertyHelper([{
			name: "foo",
			label: "bar"
		}], {
			foo: {
				extensionAttribute: {}
			}
		}, null, null, {
			extensionAttribute: {
				type: {
					bar: {type: "string", mandatory: true}
				}
			}
		}).destroy();
		assert.equal(this.logWarning.callCount, 0, "No warning logged if a deeply nested attribute is missing");
	});

	QUnit.test("Complex property with an attribute that is not allowed", function(assert) {
		new PropertyHelper([{
			name: "prop",
			label: "Property"
		}, {
			name: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}], {
			complexProperty: {
				foo: {bar: "baz"}
			}
		}, null, null, {
			foo: {
				type: {
					bar: {type: "string"}
				},
				allowedForComplexProperty: true
			}
		}).destroy();
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

	QUnit.test("Adding reserved standard attribute", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar"
			}], null, null, {
				name: {type: "string"}
			});
		}, new Error("The attribute 'name' is reserved and cannot be overridden by additional attributes."));
	});

	QUnit.test("Adding reserved 'extension' attribute", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "foo",
				label: "bar"
			}], null, null, {
				extension: {type: "string"}
			});
		}, new Error("The attribute 'extension' is reserved and cannot be overridden by additional attributes."));
	});

	QUnit.test("Missing mandatory attribute", function(assert) {
		this.logWarning.reset();
		new PropertyHelper([{
			name: "foo",
			label: "bar"
		}], null, null, null, {
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
			additionalAttribute: true
		}], null, null, {
			additionalAttribute: {type: "string"}
		}).destroy();
		assert.equal(this.logWarning.callCount, 1, "Warning logged");
	});

	QUnit.module("Setting defaults and cloning of property infos", {
		deepEqualProperties: function(assert, oPropertyHelper, aExpected, sMessage) {
			var mSimpleDefaults = {
				key: false,
				visible: true,
				sortable: true,
				filterable: true,
				groupable: false,
				path: "",
				unit: "",
				group: "",
				groupLabel: "",
				exportSettings: null,
				maxConditions: -1,
				typeConfig: null,
				required: false
			};
			var mComplexDefaults = {
				propertyInfos: [],
				key: false,
				visible: true,
				sortable: false,
				filterable: false,
				groupable: false,
				path: null,
				group: "",
				groupLabel: "",
				exportSettings: null,
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
		var mExtensions = {
			propB: {
				complexAttr: {
					intAttr: 2,
					objectAttr: {foo: "bar"}
				}
			},
			complexPropB: {
				complexAttr: {}
			}
		};
		var oPropertyHelper = new PropertyHelper(aPropertyInfos, mExtensions, null, {
			additionalAttribute: {type: "string", defaultValue: "AttributeDefault", valueForComplexProperty: "DefaultForComplex"},
			additionalComplexAttribute: {
				type: {
					subAttribute: {type: "string"}
				}
			},
			additionalDefaultWithDeepPath: {type: "string", defaultValue: "attribute:additionalComplexAttribute.subAttribute"}
		}, {
			complexAttr: {
				type: {
					intAttr: {type: "int", defaultValue: 2, allowedForComplexProperty: true},
					refAttr: {type: "PropertyReference", defaultValue: "attribute:unit"},
					objectAttr: {type: "object", defaultValue: {}},
					arrayAttr: {type: "string[]"}
				},
				defaultValue: {
					intAttr: 1
				},
				allowedForComplexProperty: true
			},
			stringAttr: {type: "string", defaultValue: "test"},
			defaultWithDeepPath: {type: "int", defaultValue: "attribute:extension.complexAttr.intAttr"}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "propA",
			label: "Property A",
			unit: "unit",
			additionalAttribute: "attr",
			additionalComplexAttribute: {
				subAttribute: "subAttr"
			},
			additionalDefaultWithDeepPath: "subAttr",
			extension: {
				complexAttr: {
					intAttr: 1,
					refAttr: "unit",
					objectAttr: {},
					arrayAttr: []
				},
				stringAttr: "test",
				defaultWithDeepPath: 1
			}
		}, {
			name: "propB",
			label: "Property B",
			unit: "unit",
			additionalAttribute: "AttributeDefault",
			additionalComplexAttribute: null,
			additionalDefaultWithDeepPath: "",
			extension: {
				complexAttr: {
					intAttr: 2,
					refAttr: "unit",
					objectAttr: {foo: "bar"},
					arrayAttr: []
				},
				stringAttr: "test",
				defaultWithDeepPath: 2
			}
		}, {
			name: "complexPropA",
			label: "Complex property A",
			propertyInfos: ["propA"],
			additionalAttribute: "DefaultForComplex",
			extension: {
				complexAttr: {
					intAttr: 1
				}
			}
		}, {
			name: "complexPropB",
			label: "Complex property B",
			propertyInfos: ["propA"],
			additionalAttribute: "DefaultForComplex",
			extension: {
				complexAttr: {
					intAttr: 2
				}
			}
		}, {
			name: "unit",
			label: "Unit",
			additionalAttribute: "AttributeDefault",
			additionalComplexAttribute: null,
			additionalDefaultWithDeepPath: "",
			extension: {
				complexAttr: {
					intAttr: 1,
					refAttr: "",
					objectAttr: {},
					arrayAttr: []
				},
				stringAttr: "test",
				defaultWithDeepPath: 1
			}
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Complex settings object not set", function(assert) {
		var aPropertyInfos = [{
			name: "prop",
			label: "prop"
		}];
		var oPropertyHelper = new PropertyHelper(aPropertyInfos, null, null, {
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
		var oPropertyHelper = new PropertyHelper(aPropertyInfos, null, null, {
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
		var oPropertyHelper = new PropertyHelper(aPropertyInfos, null, null, {
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
		}], {
			complexProp: {foo: {}}
		}, null, null, {
			foo: {
				type: {
					bar: {type: "PropertyReference[]", defaultValue: "attribute:propertyInfos", allowedForComplexProperty: true}
				},
				allowedForComplexProperty: true
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"],
			extension: {
				foo: {bar: ["prop"]}
			}
		}, {
			name: "prop",
			label: "Property",
			extension: {
				foo: null
			}
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Property reference in a nested attribute defaults to another nested attribute", function(assert) {
		var oPropertyHelper = new PropertyHelper([{
			name: "propA",
			label: "Property A",
			foo: {}
		}, {
			name: "propB",
			label: "Property B"
		}], {
			propA: {
				bar: {
					props: ["propB"]
				}
			}
		}, null, {
			foo: {
				type: {
					props: {type: "PropertyReference[]", defaultValue: "attribute:extension.bar.props"}
				}
			}
		}, {
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
			extension: {
				bar: {props: ["propB"]}
			}
		}, {
			name: "propB",
			label: "Property B",
			foo: null,
			extension: {
				bar: null
			}
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Property reference cache", function(assert) {
		var oPropertyHelper = new PropertyHelper([{
			name: "prop",
			label: "Property"
		}, {
			name: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"],
			foo: {
				baz: ["prop"]
			}
		}], null, null, {
			foo: {
				type: {
					bar: {type: "PropertyReference[]", defaultValue: "attribute:propertyInfos", allowedForComplexProperty: true},
					baz: {type: "PropertyReference[]", allowedForComplexProperty: true}
				},
				allowedForComplexProperty: true
			}
		});

		assert.ok(!oPropertyHelper.getProperty("prop").hasOwnProperty("_propertyInfos"),
			"Complex property reference cache in a simple property");
		assert.strictEqual(oPropertyHelper.getProperty("complexProp")._propertyInfos[0], oPropertyHelper.getProperty("prop"),
			"Cached property reference of a complex property");
		assert.strictEqual(oPropertyHelper.getProperty("complexProp").foo._bar[0], oPropertyHelper.getProperty("prop"),
			"Cached property reference of default value");
		assert.strictEqual(oPropertyHelper.getProperty("complexProp").foo._baz[0], oPropertyHelper.getProperty("prop"),
			"Cached property reference of specified value");
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
		var mExtensions = {
			prop: {
				foo: "bar"
			}
		};
		var oPropertyHelper = new PropertyHelper(aPropertyInfos, mExtensions, null, null, {
			foo: {type: "string"}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "prop",
			label: "prop",
			extension: {
				foo: "bar"
			}
		}, {
			name: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"],
			extension: {}
		}]);

		assert.deepEqual(aPropertyInfos, [{
			name: "prop",
			label: "prop"
		}, {
			name: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}], "Original property infos were not modified");

		assert.deepEqual(mExtensions, {
			prop: {
				foo: "bar"
			}
		}, "Original property extensions were not modified");

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
		var mExtensions = {
			prop: {
				foo: {
					bar: {myAttr: 2},
					baz: ["something"]
				}
			}
		};
		var oPropertyHelper = new PropertyHelper(aPropertyInfos, mExtensions, null, null, {
			foo: {
				type: {
					bar: {type: "object"},
					baz: {type: "string[]"}
				}
			}
		});
		var aClonedProperties = oPropertyHelper.getProperties();

		assert.notStrictEqual(aClonedProperties, aPropertyInfos, "Property info array was cloned");
		assert.notStrictEqual(aClonedProperties[0].extension, mExtensions.prop, "Property extension was cloned");
		assert.notStrictEqual(aClonedProperties[0], aPropertyInfos[0], "Property object was cloned");
		assert.notStrictEqual(aClonedProperties[0].extension.foo, mExtensions.prop.foo, "Complex settings object was cloned");
		assert.notStrictEqual(aClonedProperties[0].extension.foo.bar, mExtensions.prop.foo.bar,
			"Object nested in complex settings object was cloned");
		assert.notStrictEqual(aClonedProperties[0].extension.foo.baz, mExtensions.prop.foo.baz,
			"Array nested in complex settings object was cloned"
		);
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
		var mExtensions = {
			prop: {
				foo: {
					bar: {myAttr: 2},
					baz: ["something"]
				}
			}
		};
		var oPropertyHelper = new PropertyHelper(aPropertyInfos, mExtensions, null, null, {
			foo: {
				type: {
					bar: {type: "object"},
					baz: {type: "string[]"}
				}
			}
		});

		aPropertyInfos.push({
			name: "newProperty",
			label: "Newly added property"
		});
		aPropertyInfos[0].name = "newName";
		aPropertyInfos[0].exportSettings.width = 0;
		aPropertyInfos[0].typeConfig = {};
		aPropertyInfos[1].propertyInfos.push("something");
		mExtensions.prop.foo.bar.myOtherAttr = true;
		mExtensions.prop.foo.baz.push("something else");

		this.deepEqualProperties(assert, oPropertyHelper, [{
			name: "prop",
			label: "prop",
			exportSettings: {
				label: "exportLabel",
				width: 10
			},
			extension: {
				foo: {
					bar: {myAttr: 2},
					baz: ["something"]
				}
			}
		}, {
			name: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"],
			extension: {}
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
		var oPropertyHelper = new PropertyHelper([], null, oParent);

		assert.strictEqual(oPropertyHelper.getParent(), oParent, "#getParent returns the reference to the parent");

		oPropertyHelper.destroy();
		assert.strictEqual(oPropertyHelper.getParent(), null, "#getParent no longer returns the parent after destroying the property helper");

		oParent.destroy();
	});

	QUnit.test("With an invalid parent", function(assert) {
		assert.throws(function() {
			new PropertyHelper([], null, new (ManagedObject.getMetadata().getParent().getClass())());
		}, new Error("The type of the parent is invalid."), "Error thrown if the type of the parent is invalid");

		assert.throws(function() {
			new PropertyHelper([], null, {});
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
					array: [{}]
				}
			}, {
				name: "complexProp",
				label: "Complex property",
				propertyInfos: ["prop", "otherProp"]
			}, {
				name: "otherProp",
				label: "My other property"
			}], {
				prop: {
					foo: {
						bar: {myAttr: 2},
						baz: ["something"],
						propertyRef: ["otherProp"]
					}
				}
			}, null, {
				additionalAttribute: {type: "object"}
			}, {
				foo: {
					type: {
						bar: {type: "object"},
						baz: {type: "string[]"},
						propertyRef: {type: "PropertyReference[]"}
					}
				}
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
		assert.ok(Object.isFrozen(oComplexProp._propertyInfos), "Cached property reference of complex property is frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute), "Plain object attribute is frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute.object), "Plain object attribute: Nested object is frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute.object.object), "Plain object attribute: Deeply nested object is frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute.array), "Plain object attribute: Nested array is frozen");
		assert.ok(Object.isFrozen(oProp.additionalAttribute.array[0]), "Plain object attribute: Object in nested array is frozen");
		assert.ok(Object.isFrozen(oProp.extension.foo), "Complex object attribute is frozen");
		assert.ok(Object.isFrozen(oProp.extension.foo.bar), "Complex object attribute: Nested object is frozen");
		assert.ok(Object.isFrozen(oProp.extension.foo.baz), "Complex object attribute: Nested array is frozen");
		assert.ok(Object.isFrozen(oProp.extension.foo._propertyRef), "Complex object attribute: Cached property reference is frozen");
	});

	QUnit.test("Property info array", function(assert) {
		var aProperties = this.oPropertyHelper.getProperties();

		assert.ok(Object.isFrozen(aProperties), "The property infos array is frozen");
		assert.ok(Object.isFrozen(aProperties[0]), "Simple property is frozen");
		assert.ok(Object.isFrozen(aProperties[1]), "Complex property is frozen");
		assert.ok(Object.isFrozen(aProperties[2]), "Simple property referenced by a complex property is frozen");
		assert.ok(Object.isFrozen(aProperties[1].getReferencedProperties()), "The return value of 'getReferencedProperties' is frozen");
		assert.ok(Object.isFrozen(aProperties[1].getReferencedProperties()[0]), "Properties returned by 'getReferencedProperties' are frozen");
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
		assert.ok(Object.isFrozen(mPropertyMap.complexProp.getReferencedProperties()), "The return value of 'getReferencedProperties' is frozen");
		assert.ok(Object.isFrozen(mPropertyMap.complexProp.getReferencedProperties()[0]), "Properties returned by 'getReferencedProperties' are frozen");
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
				key: true,
				unit: "propB",
				groupable: true,
				aggregatable: true,
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

	QUnit.test("isComplex", function(assert) {
		assert.strictEqual(this.oPropertyHelper.isComplex(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.isComplex({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.isComplex("propA"), false, "Name of a simple property");
		assert.strictEqual(this.oPropertyHelper.isComplex(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.isComplex("complexPropA"), true, "Name of a complex property");
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
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex("propA"), false, "Name of a simple property");
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex(this.aProperties[0]), false, "Known simple property");
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex("complexPropA"), false, "Name of a complex property");
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex(this.aProperties[2]), true, "Known complex property");
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex("unknownProp"), false, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex({
			name: "propA",
			label: "Property"
		}), false, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), true, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.isPropertyComplex({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), true, "After destruction");
	});

	QUnit.test("getReferencedProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getReferencedProperties(), [], "No arguments");
		assert.deepEqual(this.oPropertyHelper.getReferencedProperties({}), [], "Empty object");
		assert.deepEqual(this.oPropertyHelper.getReferencedProperties("propA"), [], "Name of a simple property");
		assert.deepEqual(this.oPropertyHelper.getReferencedProperties(this.aProperties[0]), [], "Simple property");
		assert.deepEqual(this.oPropertyHelper.getReferencedProperties("complexPropA"), [
			this.aProperties[0], this.aProperties[1]
		], "Name of a complex property");
		assert.deepEqual(this.oPropertyHelper.getReferencedProperties(this.aProperties[2]), [], "Complex property");
		assert.deepEqual(this.oPropertyHelper.getReferencedProperties("unknownProp"), [], "Unknown property key");
		assert.deepEqual(this.oPropertyHelper.getReferencedProperties({
			name: "propA",
			label: "Property"
		}), [], "Unknown simple property");
		assert.deepEqual(this.oPropertyHelper.getReferencedProperties({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), [], "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getReferencedProperties("complexPropA"), [], "After destruction");
	});

	QUnit.test("getUnitProperty", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getUnitProperty(), null, "No arguments");
		assert.deepEqual(this.oPropertyHelper.getUnitProperty({}), null, "Empty object");
		assert.deepEqual(this.oPropertyHelper.getUnitProperty("propA"), this.aProperties[1], "Name of a simple property");
		assert.deepEqual(this.oPropertyHelper.getUnitProperty(this.aProperties[0]), null, "Simple property");
		assert.deepEqual(this.oPropertyHelper.getUnitProperty("complexPropA"), null, "Name of a complex property");
		assert.deepEqual(this.oPropertyHelper.getUnitProperty(this.aProperties[2]), null, "Complex property");
		assert.deepEqual(this.oPropertyHelper.getUnitProperty("unknownProp"), null, "Unknown property key");
		assert.deepEqual(this.oPropertyHelper.getUnitProperty({
			name: "propA",
			label: "Property",
			unit: "propB"
		}), null, "Unknown simple property");
		assert.deepEqual(this.oPropertyHelper.getUnitProperty({
			name: "complexPropA",
			label: "Complex Property",
			unit: "propB",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getUnitProperty("propA"), null, "After destruction");
	});

	QUnit.test("isSortable", function(assert) {
		assert.strictEqual(this.oPropertyHelper.isSortable(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.isSortable({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.isSortable("propA"), true, "Name of a sortable simple property");
		assert.strictEqual(this.oPropertyHelper.isSortable(this.aProperties[0]), null, "Sortable simple property");
		assert.strictEqual(this.oPropertyHelper.isSortable("complexPropA"), false,
			"Name of a complex property referencing sortable properties");
		assert.strictEqual(this.oPropertyHelper.isSortable(this.aProperties[2]), null, "Complex property referencing sortable properties");
		assert.strictEqual(this.oPropertyHelper.isSortable("propB"), false, "Name of a non-sortable simple property");
		assert.strictEqual(this.oPropertyHelper.isSortable(this.aProperties[1]), null, "Non-sortable simple property");
		assert.strictEqual(this.oPropertyHelper.isSortable("complexPropB"), false,
			"Name of a complex property referencing non-sortable properties");
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
		assert.deepEqual(this.oPropertyHelper.getSortableProperties("propA"), [this.aProperties[0]], "Name of a sortable simple property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties(this.aProperties[0]), [], "Sortable simple property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties("complexPropA"), [
			this.aProperties[0]
		], "Name of a complex property referencing sortable properties");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties(this.aProperties[2]), [], "Complex property referencing sortable properties");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties("propB"), [], "Name of a non-sortable simple property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties(this.aProperties[1]), [], "Non-sortable simple property");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties("complexPropB"), [],
			"Name of a complex property referencing non-sortable properties");
		assert.deepEqual(this.oPropertyHelper.getSortableProperties(this.aProperties[3]), [], "Complex property referencing non-sortable properties");
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
		assert.strictEqual(this.oPropertyHelper.isFilterable("propA"), true, "Name of a filterable simple property");
		assert.strictEqual(this.oPropertyHelper.isFilterable(this.aProperties[0]), null, "Filterable simple property");
		assert.strictEqual(this.oPropertyHelper.isFilterable("complexPropA"), false,
			"Name of a complex property referencing filterable properties");
		assert.strictEqual(this.oPropertyHelper.isFilterable(this.aProperties[2]), null, "Complex property referencing sortable properties");
		assert.strictEqual(this.oPropertyHelper.isFilterable("propB"), false, "Name of a non-filterable simple property");
		assert.strictEqual(this.oPropertyHelper.isFilterable(this.aProperties[1]), null, "Non-filterable simple property");
		assert.strictEqual(this.oPropertyHelper.isFilterable("complexPropB"), false,
			"Name of a complex property referencing non-filterable properties");
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
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties("propA"), [this.aProperties[0]], "Name of a filterable simple property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties(this.aProperties[0]), [], "Filterable simple property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties("complexPropA"), [
			this.aProperties[0]
		], "Name of a complex property referencing filterable properties");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties(this.aProperties[2]), [], "Complex property referencing filterable properties");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties("propB"), [], "Name of a non-filterable simple property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties(this.aProperties[1]), [], "Non-filterable simple property");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties("complexPropB"), [],
			"Name of a complex property referencing non-filterable properties");
		assert.deepEqual(this.oPropertyHelper.getFilterableProperties(this.aProperties[3]), [],
			"Complex property referencing non-filterable properties");
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
		assert.strictEqual(this.oPropertyHelper.getLabel("propA"), "Property A", "Name of a simple property");
		assert.strictEqual(this.oPropertyHelper.getLabel(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getLabel("complexPropA"), "Complex Property A", "Name of a complex property");
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
		assert.strictEqual(this.oPropertyHelper.getGroupLabel("propA"), "Property A group label", "Name of a simple property");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel("complexPropA"), "Complex Property A group label", "Name of a complex property");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel("propB"), "", "Name of a simple property without a group label");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel(this.aProperties[1]), null, "Simple property without a group label");
		assert.strictEqual(this.oPropertyHelper.getGroupLabel("complexPropB"), "", "Name of a complex property without a group label");
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
		assert.strictEqual(this.oPropertyHelper.getPath("propA"), "propAPath", "Name of a simple property");
		assert.strictEqual(this.oPropertyHelper.getPath(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getPath("complexPropA"), null, "Name of a complex property");
		assert.strictEqual(this.oPropertyHelper.getPath(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.getPath("propB"), "", "Name of a simple property without a path");
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

	QUnit.test("isKey", function(assert) {
		assert.strictEqual(this.oPropertyHelper.isKey(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.isKey({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.isKey("propA"), true, "Name of a simple property being a key");
		assert.strictEqual(this.oPropertyHelper.isKey(this.aProperties[0]), null, "Simple property being a key");
		assert.strictEqual(this.oPropertyHelper.isKey("complexPropA"), false, "Name of a complex property");
		assert.strictEqual(this.oPropertyHelper.isKey(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.isKey("propB"), false, "Name of a simple property not being a key");
		assert.strictEqual(this.oPropertyHelper.isKey(this.aProperties[1]), null, "Simple property not being a key");
		assert.strictEqual(this.oPropertyHelper.isKey("complexPropB"), false, "Name of a complex property");
		assert.strictEqual(this.oPropertyHelper.isKey(this.aProperties[3]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.isKey("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.isKey({
			name: "propA",
			label: "Property"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.isKey({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.isKey("propA"), null, "After destruction");
	});

	QUnit.test("getAllKeyProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getAllKeyProperties(), [
			this.aProperties[0]
		]);

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getAllKeyProperties(), [], "After destruction");
	});

	QUnit.test("isVisible", function(assert) {
		assert.strictEqual(this.oPropertyHelper.isVisible(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.isVisible({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.isVisible("propA"), true, "Name of a visible simple property");
		assert.strictEqual(this.oPropertyHelper.isVisible(this.aProperties[0]), null, "Visible simple property");
		assert.strictEqual(this.oPropertyHelper.isVisible("complexPropA"), true, "Name of a visible complex property");
		assert.strictEqual(this.oPropertyHelper.isVisible(this.aProperties[2]), null, "Visible complex property");
		assert.strictEqual(this.oPropertyHelper.isVisible("propB"), false, "Name of an invisible simple property");
		assert.strictEqual(this.oPropertyHelper.isVisible(this.aProperties[1]), null, "Invisible simple property");
		assert.strictEqual(this.oPropertyHelper.isVisible("complexPropB"), false, "Name of an invisible complex property");
		assert.strictEqual(this.oPropertyHelper.isVisible(this.aProperties[3]), null, "Invisible complex property");
		assert.strictEqual(this.oPropertyHelper.isVisible("complexPropC"), true, "Name of a visible complex property referencing invisible properties");
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
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("propA"), [this.aProperties[0]], "Name of a visible simple property");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[0]), [], "Visible simple property");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("complexPropA"), [
			this.aProperties[0]
		], "Name of a visible complex property referencing visible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[2]), [],
			"Visible complex property referencing visible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("complexPropC"), [],
			"Name of a visible complex property referencing invisible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[4]), [],
			"Visible complex property referencing invisible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("propB"), [], "Name of an invisible simple property");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[1]), [], "Invisible simple property");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("complexPropD"), [
			this.aProperties[0]
		], "Name of an invisible complex property referencing visible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties(this.aProperties[5]), [],
			"Invisible complex property referencing visible properties");
		assert.deepEqual(this.oPropertyHelper.getVisibleProperties("complexPropB"), [],
			"Name of an invisible complex property referencing invisible properties");
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

	QUnit.test("isGroupable", function(assert) {
		assert.strictEqual(this.oPropertyHelper.isGroupable(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.isGroupable({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.isGroupable("propA"), true, "Name of a groupable simple property");
		assert.strictEqual(this.oPropertyHelper.isGroupable(this.aProperties[0]), null, "Groupable simple property");
		assert.strictEqual(this.oPropertyHelper.isGroupable("complexPropA"), false,
			"Name of a complex property referencing groupable properties");
		assert.strictEqual(this.oPropertyHelper.isGroupable(this.aProperties[2]), null, "Complex property referencing groupable properties");
		assert.strictEqual(this.oPropertyHelper.isGroupable("propB"), false, "Name of a non-groupable simple property");
		assert.strictEqual(this.oPropertyHelper.isGroupable(this.aProperties[1]), null, "Non-groupable simple property");
		assert.strictEqual(this.oPropertyHelper.isGroupable("complexPropB"), false,
			"Name of a complex property referencing non-groupable properties");
		assert.strictEqual(this.oPropertyHelper.isGroupable(this.aProperties[3]), null, "Complex property referencing non-groupable properties");
		assert.strictEqual(this.oPropertyHelper.isGroupable("unknownProp"), null, "Unknown property key");
		assert.strictEqual(this.oPropertyHelper.isGroupable({
			name: "propA",
			label: "Property"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.isGroupable({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), null, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.isGroupable("propA"), null, "After destruction");
	});

	QUnit.test("getGroupableProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getGroupableProperties(), [], "No arguments");
		assert.deepEqual(this.oPropertyHelper.getGroupableProperties({}), [], "Empty object");
		assert.deepEqual(this.oPropertyHelper.getGroupableProperties("propA"), [this.aProperties[0]], "Name of a groupable simple property");
		assert.deepEqual(this.oPropertyHelper.getGroupableProperties(this.aProperties[0]), [], "Groupable simple property");
		assert.deepEqual(this.oPropertyHelper.getGroupableProperties("complexPropA"), [
			this.aProperties[0]
		], "Name of a complex property referencing groupable properties");
		assert.deepEqual(this.oPropertyHelper.getGroupableProperties(this.aProperties[2]), [], "Complex property referencing groupable properties");
		assert.deepEqual(this.oPropertyHelper.getGroupableProperties("propB"), [], "Name of a non-groupable simple property");
		assert.deepEqual(this.oPropertyHelper.getGroupableProperties(this.aProperties[1]), [], "Non-groupable simple property");
		assert.deepEqual(this.oPropertyHelper.getGroupableProperties("complexPropB"), [],
			"Name of a complex property referencing non-groupable properties");
		assert.deepEqual(this.oPropertyHelper.getGroupableProperties(this.aProperties[3]), [],
			"Complex property referencing non-groupable properties");
		assert.deepEqual(this.oPropertyHelper.getGroupableProperties("unknownProp"), [], "Unknown property key");
		assert.deepEqual(this.oPropertyHelper.getGroupableProperties({
			name: "propA",
			label: "Property"
		}), [], "Unknown simple property");
		assert.deepEqual(this.oPropertyHelper.getGroupableProperties({
			name: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), [], "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getGroupableProperties("propA"), [], "After destruction");
	});

	QUnit.test("getAllGroupableProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getAllGroupableProperties(), [
			this.aProperties[0]
		]);

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getAllGroupableProperties(), [], "After destruction");
	});

	QUnit.test("getName", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getName(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.getName({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.getName("propA"), "propA", "Name of a simple property");
		assert.strictEqual(this.oPropertyHelper.getName(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getName("complexPropA"), "complexPropA", "Name of a complex property");
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
		}, "Name of a simple property");
		assert.deepEqual(this.oPropertyHelper.getExportSettings(this.aProperties[0]), null, "Simple property");
		assert.deepEqual(this.oPropertyHelper.getExportSettings("complexPropA"), {
			width: 30,
			label: "Complex Property A export label"
		}, "Name of a complex property");
		assert.deepEqual(this.oPropertyHelper.getExportSettings(this.aProperties[2]), null, "Complex property");
		assert.strictEqual(this.oPropertyHelper.getExportSettings("propB"), null, "Name of a simple property without export settings");
		assert.strictEqual(this.oPropertyHelper.getExportSettings(this.aProperties[1]), null, "Simple property without export settings");
		assert.strictEqual(this.oPropertyHelper.getExportSettings("complexPropB"), null, "Name of a complex property without export settings");
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
		assert.strictEqual(this.oPropertyHelper.getMaxConditions("propA"), 2, "Name of a simple property");
		assert.strictEqual(this.oPropertyHelper.getMaxConditions(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getMaxConditions("complexPropA"), null, "Name of a complex property");
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
		assert.deepEqual(this.oPropertyHelper.getTypeConfig("propA"), this.oTypeConfig, "Name of a simple property");
		assert.strictEqual(this.oPropertyHelper.getTypeConfig(this.aProperties[0]), null, "Simple property");
		assert.strictEqual(this.oPropertyHelper.getTypeConfig("complexPropA"), null, "Name of a complex property");
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

	QUnit.module("Property", {
		before: function() {
			this.aExpectedMethods = [
				"isComplex", "getReferencedProperties", "isSortable", "getSortableProperties", "isFilterable", "isKey", "getLabel", "getName",
				"getFilterableProperties","getGroupLabel", "getPath", "isVisible", "getVisibleProperties", "getExportSettings", "getMaxConditions",
				"getTypeConfig", "isGroupable", "getGroupableProperties", "getUnitProperty"
			];
			this.oPropertyHelper = new PropertyHelper([{
				name: "prop",
				label: "Property"
			}, {
				name: "complexProp",
				label: "Complex property",
				propertyInfos: ["prop"]
			}]);
		},
		after: function() {
			this.oPropertyHelper.destroy();
		},
		assertProperty: function(assert, oProperty) {
			assert.ok(Object.getPrototypeOf(oProperty) === Object.prototype, "The property inherits directly from Object");

			for (var i = 0; i < this.aExpectedMethods.length; i++) {
				var sMethod = this.aExpectedMethods[i];
				assert.equal(typeof oProperty[sMethod], "function", "Has function '" + sMethod + "'");
			}
		},
		assertCalls: function(assert, oProperty, sPropertyName) {
			for (var i = 0; i < this.aExpectedMethods.length; i++) {
				var sMethod = this.aExpectedMethods[i];
				var oSpy = sinon.spy(this.oPropertyHelper, sMethod);

				oProperty[sMethod]();
				assert.ok(oSpy.calledOnceWithExactly(sPropertyName), "'" + sMethod + "' called once with the correct arguments");

				oSpy.restore();
			}
		}
	});

	QUnit.test("Simple property", function(assert) {
		var oProperty = this.oPropertyHelper.getProperties()[0];
		this.assertProperty(assert, oProperty);
		this.assertCalls(assert, oProperty, "prop");
	});

	QUnit.test("Complex property", function(assert) {
		var oProperty = this.oPropertyHelper.getProperties()[1];
		this.assertProperty(assert, oProperty);
		this.assertCalls(assert, oProperty, "complexProp");
	});

	QUnit.test("Property referenced by complex property", function(assert) {
		var oProperty = this.oPropertyHelper.getProperties()[1].getReferencedProperties()[0];
		this.assertProperty(assert, oProperty);
		this.assertCalls(assert, oProperty, "prop");
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

		assert.ok(oValidatePropertiesSpy.calledOnceWithExactly(aProperties), "#validateProperties called once with the correct arguments");
		assert.equal(oValidatePropertySpy.callCount, 2, "#validateProperty called twice");
		assert.ok(oValidatePropertySpy.firstCall.calledWithExactly(aProperties[0], aProperties), "Arguments of first #validateProperty call");
		assert.ok(oValidatePropertySpy.secondCall.calledWithExactly(aProperties[1], aProperties), "Arguments of second #validateProperty call");

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
		var oCustomPropertyField = {prop: "value"};
		var MyPropertyHelper = PropertyHelper.extend("sap.ui.mdc.test.table.PropertyHelper", {
			prepareProperty: function() {
				var oProperty = arguments[0];

				oPreparePropertySpy.apply(this, merge([], arguments));
				PropertyHelper.prototype.prepareProperty.apply(this, arguments);

				try {
					oProperty.getName = function() {
						return "getName modified";
					};
				} catch (e) {} //eslint-disable-line no-empty

				oProperty.myName = oProperty.getName();
				oProperty.myField = oCustomPropertyField;
			}
		});
		var oMyPropertyHelper = new MyPropertyHelper(aProperties);
		var oProperty = oMyPropertyHelper.getProperties()[0];

		assert.equal(oPreparePropertySpy.callCount, 2, "#prepareProperty called twice");
		assert.ok(oPreparePropertySpy.firstCall.calledWithExactly(aProperties[0]), "Arguments of first #prepareProperty call");
		assert.ok(oPreparePropertySpy.secondCall.calledWithExactly(aProperties[1]), "Arguments of second #prepareProperty call");
		assert.deepEqual(oProperty.myField, oCustomPropertyField, "Property is extensible");
		assert.ok(Object.isFrozen(oProperty.myField), "Property extensions are frozen");
		assert.strictEqual(oProperty.myName, "prop", "Default methods cannot be changed");

		oMyPropertyHelper.destroy();
	});
});