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

	const PropertyHelper = _PropertyHelper.extend("sap.ui.mdc.util.test.PropertyHelper", {
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
					inComplexProperty: {allowed: true}
				}
			}, mAdditionalAttributes));
		}
	});

	QUnit.module("Validation of property infos");

	QUnit.test("Without property infos", function(assert) {
		assert.throws(function() {
			new PropertyHelper();
		}, new Error("Invalid property definition: Property infos must be an array."));
	});

	QUnit.test("Empty array as property infos", function(assert) {
		new PropertyHelper([]).destroy();
		assert.ok(true, "No error thrown");
	});

	QUnit.test("Contains non-plain objects", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String"
			}, "string"
			]);
		}, new Error("Invalid property definition: Property info must be a plain object."), "string");

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String"
			}, new ManagedObject()
			]);
		}, new Error("Invalid property definition: Property info must be a plain object."), "object");

		assert.throws(function() {
			new PropertyHelper([Object.create({
				key: "prop",
				label: "prop",
				dataType: "String"
			})]);
		}, new Error("Invalid property definition: Property info must be a plain object."), "complex object");
	});

	QUnit.test("Properties with the same name", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String"
			}, {
				key: "foo",
				label: "bar2",
				dataType: "String"
			}]);
		}, new Error("Invalid property definition: Properties do not have unique keys."));
	});

	QUnit.test("Unknown attribute", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				foo: "bar"
			}]);
		}, new Error("Invalid property definition: Property contains invalid attribute 'foo'."
					 + '\n{"key":"foo","label":"bar","dataType":"String","foo":"bar"}'));

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				additionalAttribute: {
					doesNotExist: true
				}
			}], null, {
				additionalAttribute: {
					type: {
						exists: {type: "string"}
					}
				}
			});
		},
			new Error("Invalid property definition: Property contains invalid attribute 'additionalAttribute.doesNotExist'."
					 + '\n{"key":"foo","label":"bar","dataType":"String","additionalAttribute":{"doesNotExist":true}}'),
			"Deeply nested attribute"
		);
	});

	QUnit.test("Default attribute that was not allowed", function(assert) {
		assert.throws(function() {
			new _PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				filterable: true
			}]);
		}, new Error("Invalid property definition: Property contains invalid attribute 'filterable'."
					 + '\n{"key":"foo","label":"bar","dataType":"String","filterable":true}'));
	});

	QUnit.test("Missing mandatory attribute", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				label: "foo",
				dataType: "String"
			}]);
		},
			new Error("Invalid property definition: Property does not contain mandatory attribute 'key'."
					 + '\n{"label":"foo","dataType":"String"}'),
			"key"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				dataType: "String"
			}]);
		}, new Error("Invalid property definition: Property does not contain mandatory attribute 'label'."
					 + '\n{"key":"foo","dataType":"String"}'),
			"label"
		);

		new PropertyHelper([{
			key: "foo",
			label: "bar",
			dataType: "String",
			additionalAttribute: {}
		}], null, {
			additionalAttribute: {
				type: {
					bar: {type: "string", mandatory: true}
				}
			}
		}).destroy();
		assert.ok(true, "No error thrown if a deeply nested attribute is missing");

		assert.throws(function() {
			new PropertyHelper([{
				name: undefined,
				label: "foo",
				dataType: "String"
			}]);
		},
			new Error("Invalid property definition: Property does not contain mandatory attribute 'key'."
					 + '\n{"name":null,"label":"foo","dataType":"String"}'),
			"Mandatory attribute is set to 'undefined'"
		);

		assert.throws(function() {
			new PropertyHelper([{
				name: null,
				label: "foo",
				dataType: "String"
			}]);
		},
			new Error("Invalid property definition: Property does not contain mandatory attribute 'key'."
					 + '\n{"name":null,"label":"foo","dataType":"String"}'),
			"Mandatory attribute is set to 'null'"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				additionalAttribute: null
			}], null, {
				additionalAttribute: {type: "object", mandatory: true, "default": {value: {}}}
			});
		},
			new Error("Invalid property definition: Property does not contain mandatory attribute 'additionalAttribute'."
					 + '\n{"key":"foo","label":"bar","dataType":"String","additionalAttribute":null}'),
			"Mandatory attribute of type 'object' is set to 'null'"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				additionalAttribute: null
			}], null, {
				additionalAttribute: {
					type: {
						bar: {type: "object"}
					},
					mandatory: true
				}
			});
		},
			new Error("Invalid property definition: Property does not contain mandatory attribute 'additionalAttribute'."
					  + '\n{"key":"foo","label":"bar","dataType":"String","additionalAttribute":null}'),
			"Mandatory complex attribute is set to 'null'"
		);
	});

	QUnit.test("Invalid values", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: true,
				dataType: "String",
				label: "label"
			}]);
		}, new Error("Invalid property definition: The value of 'name' is invalid."
					 + '\n{"name":true,"dataType":"String","label":"label"}'));

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				propertyInfos: "invalid"
			}]);
		},
			new Error("Invalid property definition: The value of 'propertyInfos' is invalid."
					  + '\n{"key":"foo","label":"bar","propertyInfos":"invalid"}'),
			"'propertyInfos' attribute"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				exportSettings: true
			}]);
		},
			new Error("Invalid property definition: The value of 'exportSettings' is invalid."
					  + '\n{"key":"foo","label":"bar","dataType":"String","exportSettings":true}'),
			"Complex object attribute"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				additionalAttribute: {
					bar: true
				}
			}], null, {
				additionalAttribute: {
					type: {
						bar: {type: "string"}
					}
				}
			});
		},
			new Error("Invalid property definition: The value of 'additionalAttribute.bar' is invalid."
					  + '\n{"key":"foo","label":"bar","dataType":"String","additionalAttribute":{"bar":true}}'),
			"Deeply nested attribute"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				additionalAttribute: "bar"
			}], null, {
				additionalAttribute: {type: "string[]"}
			});
		},
			new Error("Invalid property definition: The value of 'additionalAttribute' is invalid."
					  + '\n{"key":"foo","label":"bar","dataType":"String","additionalAttribute":"bar"}'),
			"Value for an attribute of type 'string[]' is a string"
		);
	});

	QUnit.test("Invalid values for mandatory attributes", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: undefined,
				label: "bar",
				dataType: "String"
			}]);
		},
			new Error("Invalid property definition: Property does not contain mandatory attribute 'key'."
					 + '\n{"name":null,"label":"bar","dataType":"String"}'),
			"Attribute of type 'string' is 'undefined'"
		);

		assert.throws(function() {
			new PropertyHelper([{
				name: null,
				label: "bar",
				dataType: "String"
			}]);
		},
			new Error("Invalid property definition: Property does not contain mandatory attribute 'key'."
					 + '\n{"name":null,"label":"bar","dataType":"String"}'),
			"Attribute of type 'string' is 'null'"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				additionalAttribute: undefined
			}], null, {
				additionalAttribute: {type: "object", mandatory: true}
			});
		},
			new Error("Invalid property definition: Property does not contain mandatory attribute 'additionalAttribute'."
					 + '\n{"key":"foo","label":"bar","dataType":"String","additionalAttribute":null}'),
			"Attribute of type 'object' is 'undefined'"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				additionalAttribute: null
			}], null, {
				additionalAttribute: {type: "object", mandatory: true}
			});
		},
			new Error("Invalid property definition: Property does not contain mandatory attribute 'additionalAttribute'."
					 + '\n{"key":"foo","label":"bar","dataType":"String","additionalAttribute":null}'),
			"Attribute of type 'object' is 'null'"
		);
	});

	QUnit.test("Valid values for optional attributes", function(assert) {
		new PropertyHelper([{
			key: "foo",
			label: "bar",
			dataType: "String",
			path: undefined
		}]).destroy();
		assert.ok(true, "No error thrown if the value for an optional attribute is 'undefined'");

		new PropertyHelper([{
			key: "foo",
			label: "bar",
			dataType: "String",
			path: null
		}]).destroy();
		assert.ok(true, "No error thrown if the value for an optional attribute is 'null'");

		new PropertyHelper([{
			key: "foo",
			label: "bar",
			dataType: "String",
			additionalAttribute: {
				bar: undefined
			}
		}], null, {
			additionalAttribute: {
				type: {
					bar: {type: "string"}
				}
			}
		}).destroy();
		assert.ok(true, "No error thrown if the value of a deeply nested attribute is 'undefined'");

		new PropertyHelper([{
			key: "foo",
			label: "bar",
			dataType: "String",
			additionalAttribute: {
				bar: null
			}
		}], null, {
			additionalAttribute: {
				type: {
					bar: {type: "string"}
				}
			}
		}).destroy();
		assert.ok(true, "No error thrown if the value of a deeply nested attribute is 'null'");
	});

	QUnit.test("Single property reference: Referencing a complex property", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
				unit: "complexProperty"
			}, {
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: ["prop"]
			}]);
		}, new Error("Invalid property definition: Property references complex properties in the 'unit' attribute."
					 + '\n{"key":"prop","label":"Property","dataType":"String","unit":"complexProperty"}'));
	});

	QUnit.test("Single property reference: Referencing a property which does not exist", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				label: "Property A",
				dataType: "String",
				unit: "propB"
			}]);
		}, new Error("Invalid property definition: Property references non-existing properties in the 'unit' attribute."
					 + '\n{"key":"propA","label":"Property A","dataType":"String","unit":"propB"}'));
	});

	QUnit.test("Single property reference: Referencing itself", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				label: "Property A",
				dataType: "String",
				unit: "propA"
			}]);
		}, new Error("Invalid property definition: Property references itself in the 'unit' attribute."
					 + '\n{"key":"propA","label":"Property A","dataType":"String","unit":"propA"}'));
	});

	QUnit.test("Multiple property references: Referencing a complex property", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "complexPropertyA",
				label: "Complex property A",
				propertyInfos: ["complexPropertyB"]
			}, {
				key: "complexPropertyB",
				label: "Complex property B",
				propertyInfos: ["prop"]
			}]);
		}, new Error("Invalid property definition: Property references complex properties in the 'propertyInfos' attribute."
					 + '\n{"key":"complexPropertyA","label":"Complex property A","propertyInfos":["complexPropertyB"]}'));
	});

	QUnit.test("Multiple property references: One referenced property does not exist", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: ["prop", "nonExistingProperty"]
			}]);
		}, new Error("Invalid property definition: Property references non-existing properties in the 'propertyInfos' attribute."
					 + '\n{"key":"complexProperty","label":"Complex property","propertyInfos":["prop","nonExistingProperty"]}'));
	});

	QUnit.test("Multiple property references: All referenced properties do not exist", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: ["nonExistingProperty"]
			}]);
		}, new Error("Invalid property definition: Property references non-existing properties in the 'propertyInfos' attribute."
					 + '\n{"key":"complexProperty","label":"Complex property","propertyInfos":["nonExistingProperty"]}'));
	});

	QUnit.test("Multiple property references: Duplicate keys", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: ["prop", "prop"]
			}]);
		}, new Error("Invalid property definition: Property contains duplicate names in the 'propertyInfos' attribute."
					 + '\n{"key":"complexProperty","label":"Complex property","propertyInfos":["prop","prop"]}'));
	});

	QUnit.test("Multiple property references: Referencing itself", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: ["complexProperty"]
			}]);
		}, new Error("Invalid property definition: Property references itself in the 'propertyInfos' attribute."
					 + '\n{"key":"complexProperty","label":"Complex property","propertyInfos":["complexProperty"]}'));
	});

	QUnit.test("Property references in a nested attribute: Referencing a complex property", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
				additionalAttribute: {
					foo: "complexProperty"
				}
			}, {
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: ["prop"]
			}], null, {
				additionalAttribute: {
					type: {
						foo: {type: "PropertyReference"}
					}
				}
			});
		}, new Error("Invalid property definition: Property references complex properties in the 'additionalAttribute.foo' attribute."
					 + '\n{"key":"prop","label":"Property","dataType":"String","additionalAttribute":{"foo":"complexProperty"}}'));
	});

	QUnit.test("Property references in a nested attribute: One referenced property does not exist", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				label: "Property A",
				dataType: "String",
				additionalAttribute: {
					foo: ["propB", "nonExistingProperty"]
				}
			}, {
				key: "propB",
				label: "Property B",
				dataType: "String"
			}], null, {
				additionalAttribute: {
					type: {
						foo: {type: "PropertyReference[]"}
					}
				}
			});
		}, new Error("Invalid property definition: Property references non-existing properties in the 'additionalAttribute.foo' attribute."
					 + '\n{"key":"propA","label":"Property A","dataType":"String","additionalAttribute":{"foo":["propB","nonExistingProperty"]}}'));
	});

	QUnit.test("Property references in a nested attribute: All referenced properties do not exist", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
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
		}, new Error("Invalid property definition: Property references non-existing properties in the 'additionalAttribute.foo' attribute."
					 + '\n{"key":"prop","label":"Property","dataType":"String","additionalAttribute":{"foo":["nonExistingProperty"]}}'));
	});

	QUnit.test("Property references in a nested attribute: Duplicate keys", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				label: "Property A",
				dataType: "String",
				additionalAttribute: {
					foo: ["propB", "propB"]
				}
			}, {
				key: "propB",
				label: "Property B",
				dataType: "String"
			}], null, {
				additionalAttribute: {
					type: {
						foo: {type: "PropertyReference[]"}
					}
				}
			});
		}, new Error("Invalid property definition: Property contains duplicate names in the 'additionalAttribute.foo' attribute."
					 + '\n{"key":"propA","label":"Property A","dataType":"String","additionalAttribute":{"foo":["propB","propB"]}}'));
	});

	QUnit.test("Property references in a nested attribute: Referencing itself", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				label: "Property A",
				dataType: "String",
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
		}, new Error("Invalid property definition: Property references itself in the 'additionalAttribute.foo' attribute."
					 + '\n{"key":"propA","label":"Property A","dataType":"String","additionalAttribute":{"foo":["propA"]}}'));
	});

	QUnit.test("Property references in a nested attribute: No references", function(assert) {
		new PropertyHelper([{
			key: "propA",
			label: "Property A",
			dataType: "String",
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
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "complexProperty",
				label: "Complex property",
				path: "complexPath", // not allowed in complex properties
				propertyInfos: ["prop"]
			}]);
		}, new Error("Invalid property definition: Complex property contains invalid attribute 'path'."
					 + '\n{"key":"complexProperty","label":"Complex property","path":"complexPath","propertyInfos":["prop"]}'));
	});

	QUnit.test("Complex property does not reference any properties", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: []
			}]);
		},
			new Error("Invalid property definition: Complex property does not reference existing properties."
					 + '\n{"key":"complexProperty","label":"Complex property","propertyInfos":[]}'),
			"'propertyInfos' is an empty array"
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: null
			}]);
		},
			new Error("Invalid property definition: Complex property does not reference existing properties."
					 + '\n{"key":"complexProperty","label":"Complex property","propertyInfos":null}'),
			"'propertyInfos' is 'null'"
		);
	});

	QUnit.test("Complex property with nested attribute including attributes that are not allowed in complex properties", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				label: "prop A",
				dataType: "String"
			}, {
				key: "propB",
				label: "prop B",
				propertyInfos: ["propA"],
				foo: {
					bar: {
						propB: 2
					}
				}
			}], null, {
				foo: {
					type: {
						bar: {
							type: {
								propA: {type: "string"},
								propB: {type: "int", inComplexProperty: {allowed: false}}
							},
							"default": {value: {}}
						}
					},
					inComplexProperty: {
						allowed: true
					},
					"default": {value: {}}
				}
			});
		}, new Error("Invalid property definition: Complex property contains invalid attribute 'foo.bar.propB'."
				  + '\n{"key":"propB","label":"prop B","propertyInfos":["propA"],"foo":{"bar":{"propB":2}}}'));
	});

	QUnit.test("legacyAlias for key attribute", function (assert) {
		let oPropertyHelper = new PropertyHelper([{
			key: "propA",
			label: "prop A",
			dataType: "String"
		}]);
		assert.ok(oPropertyHelper.getProperties()[0].name === "propA", "PropertyHelper interpolates legacy-attribute.");
		oPropertyHelper.destroy();

		oPropertyHelper = new PropertyHelper([{
			name: "propA",
			label: "prop A",
			dataType: "String"
		}]);
		assert.ok(oPropertyHelper.getProperties()[0].key === "propA", "PropertyHelper interpolates legacy-attribute replacement.");
		oPropertyHelper.destroy();

		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				name: "propB",
				label: "prop A",
				dataType: "String"
			}]);
		}, new Error("Invalid property definition: The values of legacy-attribute 'name' and it's replacement 'key' must be identical." + '\n{"key":"propA","name":"propB","label":"prop A","dataType":"String"}'));
	});

	QUnit.test("Property info consistency: Property missing", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "foo",
			label: "bar",
			dataType: "String"
		}]);
		assert.throws(function() {
			oPropertyHelper.setProperties([]);
		}, new Error("Invalid property definition: Detected property info modifications after update:"
					 + '\n[{"foo":"PROPERTY_MISSING"}]'));

		oPropertyHelper.destroy();
	});

	QUnit.test("Property info consistency: Attribute value mismatch - Previous attribute value ->  New attribute value", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "foo",
			label: "foo",
			dataType: "String"
		}]);
		assert.throws(function() {
			oPropertyHelper.setProperties([{
				key: "foo",
				label: "bar",
				dataType: "Integer"
			}]);
		}, new Error("Invalid property definition: Detected property info modifications after update:"
					 + '\n[{"foo":[{"label":["foo","bar"]},{"dataType":["String","Integer"]}]}]'));
		oPropertyHelper.destroy();
	});

	QUnit.test("Property info consistency: Attribute value mismatch - Default value -> New attribute value", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "foo",
			label: "foo",
			dataType: "String"
		}]);
		assert.throws(function() {
			oPropertyHelper.setProperties([{
				key: "foo",
				label: "foo",
				dataType: "String",
				tooltip: "bar"
			}]);
		}, new Error("Invalid property definition: Detected property info modifications after update:"
					 + '\n[{"foo":[{"tooltip":["","bar"]}]}]'));
		oPropertyHelper.destroy();
	});

	QUnit.test("Property info consistency: Attribute value mismatch - Previous attribute value -> Default value", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "foo",
			label: "foo",
			dataType: "String",
			tooltip: "bar"
		}]);
		assert.throws(function() {
			oPropertyHelper.setProperties([{
				key: "foo",
				label: "foo",
				dataType: "String"
			}]);
		}, new Error("Invalid property definition: Detected property info modifications after update:"
					 + '\n[{"foo":[{"tooltip":["bar",""]}]}]'));
		oPropertyHelper.destroy();
	});

	QUnit.test("Property info consistency: Complex attribute value mismatch - Default value -> New attribute value", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "foo",
			label: "foo",
			dataType: "String"
		}], null, {
			foo: {
				type: {
					bar: {type: "string", "default": {value: "ABC"}}
				},
				"default": {value: {}}
			}
		});

		assert.throws(function() {
			oPropertyHelper.setProperties([{
				key: "foo",
				label: "foo",
				dataType: "String",
				foo: {
					bar: "XYZ"
				}
			}]);
		}, new Error("Invalid property definition: Detected property info modifications after update:"
					 + '\n[{"foo":[{"foo":[{"bar":"ABC"},{"bar":"XYZ"}]}]}]'));

		oPropertyHelper.destroy();
	});

	QUnit.module("Validation of additional attributes");

	QUnit.test("Provide a reserved standard attribute that is not added", function(assert) {
		assert.throws(function() {
			new _PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String",
				filterable: true
			}]);
		}, new Error("Invalid property definition: Property contains invalid attribute 'filterable'."
					 + '\n{"key":"foo","label":"bar","dataType":"String","filterable":true}'));
	});

	QUnit.test("Add a reserved standard attribute", function(assert) {
		new _PropertyHelper([{
			key: "foo",
			label: "bar",
			dataType: "String",
			filterable: true
		}], null, {
			key: true,
			filterable: true
		}).destroy();
		assert.ok(true, "No error thrown");
	});

	QUnit.test("Override a reserved standard attribute", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String"
			}], null, {
				key: {type: "string"}
			});
		}, new Error("The attribute 'key' is reserved and cannot be overridden by additional attributes."));
	});

	QUnit.test("Exclude a reserved standard attribute", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String"
			}], null, {
				key: false
			});
		}, new Error("The attribute 'key' is reserved and cannot be overridden by additional attributes."));

		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String"
			}], null, {
				key: undefined
			});
		}, new Error("The attribute 'key' is reserved and cannot be overridden by additional attributes."));
	});

	QUnit.test("Missing mandatory attribute", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "foo",
				label: "bar",
				dataType: "String"
			}], null, {
				additionalAttribute: {type: "string", mandatory: true}
			});
		}, new Error("Invalid property definition: Property does not contain mandatory attribute 'additionalAttribute'."
					 + '\n{"key":"foo","label":"bar","dataType":"String"}'));
	});

	QUnit.test("Complex property with an attribute that is not allowed", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "complexProperty",
				label: "Complex property",
				propertyInfos: ["prop"],
				additionalAttribute: "value"
			}], null, {
				additionalAttribute: {type: "string"}
			});
		}, new Error("Invalid property definition: Complex property contains invalid attribute 'additionalAttribute'."
					 + '\n{"key":"complexProperty","label":"Complex property","propertyInfos":["prop"],"additionalAttribute":"value"}'));
	});

	QUnit.module("Setting defaults and cloning of property infos", {
		deepEqualProperties: function(assert, oPropertyHelper, aExpected, sMessage) {
			const mSimpleDefaults = {
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
				formatOptions: null,
				constraints: null
			};
			const mComplexDefaults = {
				propertyInfos: [],
				visible: true,
				sortable: false,
				filterable: false,
				group: "",
				groupLabel: "",
				tooltip: "",
				exportSettings: {}
			};
			const aExpectedWithDefaults = aExpected.map(function(oProperty) {
				// Consider legacyAlias for key
				const oPropertyWithLegacyKey = {...oProperty, name: oProperty.name || oProperty.key};

				if ("propertyInfos" in oProperty) {
					return Object.assign({}, mComplexDefaults, oPropertyWithLegacyKey);
				}

				return Object.assign({}, mSimpleDefaults, oPropertyWithLegacyKey);
			});

			assert.deepEqual(oPropertyHelper.getProperties(), aExpectedWithDefaults, sMessage || "Properties");
		}
	});

	QUnit.test("Basic defaults", function(assert) {
		const aPropertyInfos = [{
			key: "prop",
			label: "prop",
			dataType: "String"
		}, {
			key: "complexProperty",
			label: "Complex property",
			tooltip: "Complex custom tooltip",
			propertyInfos: ["prop"]
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos);

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String"
		}, {
			key: "complexProperty",
			label: "Complex property",
			tooltip: "Complex custom tooltip",
			propertyInfos: ["prop"]
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Extended defaults", function(assert) {
		const aPropertyInfos = [{
			key: "propA",
			label: "Property A",
			dataType: "String",
			unit: "unit",
			additionalAttribute: "attr",
			additionalComplexAttribute: {
				subAttribute: "subAttr"
			}
		}, {
			key: "propB",
			label: "Property B",
			dataType: "String",
			unit: "unit"
		}, {
			key: "complexPropA",
			label: "Complex property A",
			propertyInfos: ["propA"]
		}, {
			key: "complexPropB",
			label: "Complex property B",
			propertyInfos: ["propA"]
		}, {
			key: "unit",
			label: "Unit",
			dataType: "String"
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos, null, {
			additionalAttribute: {
				type: "string",
				"default": {value: "AttributeDefault"},
				inComplexProperty: {
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
			key: "propA",
			label: "Property A",
			dataType: "String",
			unit: "unit",
			additionalAttribute: "attr",
			additionalComplexAttribute: {
				subAttribute: "subAttr"
			},
			additionalDefaultWithDeepPath: "subAttr"
		}, {
			key: "propB",
			label: "Property B",
			dataType: "String",
			unit: "unit",
			additionalAttribute: "AttributeDefault",
			additionalComplexAttribute: null,
			additionalDefaultWithDeepPath: ""
		}, {
			key: "complexPropA",
			label: "Complex property A",
			propertyInfos: ["propA"],
			additionalAttribute: "DefaultForComplex"
		}, {
			key: "complexPropB",
			label: "Complex property B",
			propertyInfos: ["propA"],
			additionalAttribute: "DefaultForComplex"
		}, {
			key: "unit",
			label: "Unit",
			dataType: "String",
			additionalAttribute: "AttributeDefault",
			additionalComplexAttribute: null,
			additionalDefaultWithDeepPath: ""
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Complex settings object not set", function(assert) {
		const aPropertyInfos = [{
			key: "prop",
			label: "prop",
			dataType: "String"
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos, null, {
			additionalAttribute: {
				type: {
					foo: {type: "string"}
				}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String",
			additionalAttribute: null
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Complex settings object set to 'undefined'", function(assert) {
		const aPropertyInfos = [{
			key: "prop",
			label: "prop",
			dataType: "String",
			additionalAttribute: undefined
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos, null, {
			additionalAttribute: {
				type: {
					foo: {type: "string"}
				}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String",
			additionalAttribute: null
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Complex settings object set to 'null'", function(assert) {
		const aPropertyInfos = [{
			key: "prop",
			label: "prop",
			dataType: "String",
			additionalAttribute: null
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos, null, {
			additionalAttribute: {
				type: {
					foo: {type: "string"}
				}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String",
			additionalAttribute: null
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Property reference in a nested attribute defaults to another attribute", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}, {
			key: "prop",
			label: "Property",
			dataType: "String"
		}]);

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}, {
			key: "prop",
			label: "Property",
			dataType: "String"
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Property reference in a nested attribute defaults to another nested attribute", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "propA",
			label: "Property A",
			dataType: "String",
			foo: {},
			bar: {
				props: ["propB"]
			}
		}, {
			key: "propB",
			label: "Property B",
			dataType: "String"
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
			key: "propA",
			label: "Property A",
			dataType: "String",
			foo: {props: ["propB"]},
			bar: {props: ["propB"]}
		}, {
			key: "propB",
			label: "Property B",
			dataType: "String",
			foo: null,
			bar: null
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Circular property reference", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "propA",
			label: "Property A",
			dataType: "String",
			foo: "propB"
		}, {
			key: "propB",
			label: "Property B",
			dataType: "String",
			foo: "propA"
		}], null, {
			foo: {type: "PropertyReference"}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "propA",
			label: "Property A",
			dataType: "String",
			foo: "propB"
		}, {
			key: "propB",
			label: "Property B",
			dataType: "String",
			foo: "propA"
		}]);

		oPropertyHelper.destroy();
	});

	QUnit.test("Property reference cache", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "prop",
			label: "Property",
			dataType: "String",
			baz: "prop2"
		}, {
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"],
			foo: {
				baz: ["prop"]
			}
		}, {
			key: "prop2",
			label: "Property 2",
			dataType: "String"
		}], null, {
			foo: {
				type: {
					bar: {type: "PropertyReference[]", "default": {value: "attribute:propertyInfos"}, inComplexProperty: {allowed: true}},
					baz: {type: "PropertyReference[]", inComplexProperty: {allowed: true}}
				},
				inComplexProperty: {allowed: true}
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

	QUnit.test("Propagation of 'allowed in complex property' to child attributes", function(assert){
		const oPropertyHelper = new PropertyHelper([{
			key: "prop",
			label: "prop",
			dataType: "String"
		}, {
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}], null, {
			foo: {
				type: {
					bar: {
						type: {
							propA: {type: "string", "default": {value: "XYZ"}},
							propB: {type: "int", "default": {value: 2}, inComplexProperty: {allowed: false}}
						}
					}
				},
				"default": {value: {bar: {}}},
				inComplexProperty: {allowed: true}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String",
			foo: {
				bar: {
					propA: "XYZ",
					propB: 2
				}
			}
		}, {
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"],
			foo: {
				bar: {
					propA: "XYZ"
				}
			}
		}]);
	});

	QUnit.test("Prevent propagation of 'allowed in complex property' to child attributes", function(assert){
		const oPropertyHelper = new PropertyHelper([{
			key: "prop",
			label: "prop",
			dataType: "String"
		}, {
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}], null, {
			foo: {
				type: {
					bar: {type: "string", "default": {value: "XYZ"}}
				},
				"default": {value: {}},
				inComplexProperty: {allowed: true, propagateAllowance: false}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String",
			foo: {
				bar: "XYZ"
			}
		}, {
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"],
			foo: {}
		}]);
	});

	QUnit.test("Ignore default values if ignoreIfNull = true", function(assert){
		const aPropertyInfos = [{
			key: "propX",
			label: "prop X",
			dataType: "String",
			foo: {
				bar: null,
				lot: undefined
			}
		}, {
			key: "propY",
			label: "prop Y",
			propertyInfos: ["propX"],
			foo: {
				bar: undefined,
				lot: "Test"
			}
		}, {
			key: "propK",
			label: "prop K",
			dataType: "String",
			foo: {
				bar: {
					propA: null,
					propB: null
				},
				lot: null
			}
		}, {
			key: "propZ",
			label: "prop Z",
			dataType: "String",
			foo: null
		}, {
			key: "propJ",
			label: "prop J",
			propertyInfos: ["propZ"],
			foo: undefined
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos, null, {
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
				inComplexProperty: {allowed: true}
			}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "propX",
			label: "prop X",
			dataType: "String",
			foo: {
				bar: null,
				lot: ""
			}
		}, {
			key: "propY",
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
			key: "propK",
			label: "prop K",
			dataType: "String",
			foo: {
				bar: {
					propA: "XYZ",
					propB: null
				},
				lot: null
			}
		}, {
			key: "propZ",
			label: "prop Z",
			dataType: "String",
			foo: {
				bar: {
					propA: "XYZ",
					propB: 2
				},
				lot: ""
			}
		}, {
			key: "propJ",
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

	QUnit.test("Don't modify original property infos", function(assert) {
		const aPropertyInfos = [{
			key: "prop",
			label: "prop",
			dataType: "String"
		}, {
			key: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos);

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String"
		}, {
			key: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}]);

		assert.deepEqual(aPropertyInfos, [{
			key: "prop",
			label: "prop",
			dataType: "String"
		}, {
			key: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}], "Original property infos were not modified");

		oPropertyHelper.destroy();
	});

	QUnit.test("Cloning original property infos", function(assert) {
		const oStringType = new StringType();
		const aPropertyInfos = [{
			key: "prop",
			label: "prop",
			dataType: "String",
			exportSettings: {
				label: "exportLabel",
				width: 10
			}
		}, {
			key: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos);
		const aClonedProperties = oPropertyHelper.getProperties();

		assert.notStrictEqual(aClonedProperties, aPropertyInfos, "Property info array was cloned");
		assert.notStrictEqual(aClonedProperties[0], aPropertyInfos[0], "Property object was cloned");
		assert.notStrictEqual(aClonedProperties[0].exportSettings, aPropertyInfos[0].exportSettings, "Setting of type 'object' was cloned");
		assert.notStrictEqual(aClonedProperties[1], aPropertyInfos[1], "Complex property was cloned");
		assert.notStrictEqual(aClonedProperties[1].propertyInfos, aPropertyInfos[1].propertyInfos,
			"Property infos array of complex property was cloned");

		oStringType.destroy();
		oPropertyHelper.destroy();
	});

	QUnit.test("Changing original property infos", function(assert) {
		const aPropertyInfos = [{
			key: "prop",
			label: "prop",
			dataType: "String",
			exportSettings: {
				label: "exportLabel",
				width: 10
			}
		}, {
			key: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}];
		const oPropertyHelper = new PropertyHelper(aPropertyInfos);

		aPropertyInfos.push({
			key: "newProperty",
			label: "Newly added property"
		});
		aPropertyInfos[0].key = "newName";
		aPropertyInfos[0].exportSettings.width = 0;
		aPropertyInfos[1].propertyInfos.push("something");

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String",
			exportSettings: {
				label: "exportLabel",
				width: 10
			}
		}, {
			key: "complexProperty",
			label: "Complex property",
			propertyInfos: ["prop"]
		}], "Cloned property infos did not change");

		oPropertyHelper.destroy();
	});

	QUnit.test("Modifying default values in #prepareProperty", function(assert) {
		const MyPropertyHelper = PropertyHelper.extend("sap.ui.mdc.test.table.PropertyHelper", {
			prepareProperty: function(oProperty) {
				PropertyHelper.prototype.prepareProperty.apply(this, arguments);

				if (oProperty.key === "propA") {
					oProperty.myObject.myDefault = false;
					oProperty.myObject.newEntry = true;
					oProperty.myObjectArray[0].myDefault = false;
					oProperty.myObjectArray.push({newEntry: true});
					oProperty.myPropertyReferenceArray.push("propB");
				}
			}
		});
		const oPropertyHelper = new MyPropertyHelper([{
			key: "propA",
			label: "prop A",
			dataType: "String"
		}, {
			key: "propB",
			label: "prop B",
			dataType: "String"
		}], null, {
			myObject: {type: "object", "default": {value: {myDefault: true}}},
			myObjectArray: {type: "object[]", "default": {value: [{myDefault: true}]}},
			myPropertyReferenceArray: {type: "PropertyReference[]"}
		});

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "propA",
			label: "prop A",
			dataType: "String",
			myObject: {myDefault: false, newEntry: true},
			myObjectArray: [{myDefault: false}, {newEntry: true}],
			myPropertyReferenceArray: ["propB"]
		}, {
			key: "propB",
			label: "prop B",
			dataType: "String",
			myObject: {myDefault: true},
			myObjectArray: [{myDefault: true}],
			myPropertyReferenceArray: []
		}], "Modifying the default value in does not affect other properties with default values");

		oPropertyHelper.destroy();
	});

	QUnit.test("Cloning of non-enumerable attributes", function(assert) {
		const aPropertyInfos = [{
			key: "prop",
			label: "prop",
			dataType: "String"
		}];
		Object.defineProperty(aPropertyInfos[0], "foo", {
			value: "bar"
		});
		const oPropertyHelper = new PropertyHelper(aPropertyInfos);

		this.deepEqualProperties(assert, oPropertyHelper, [{
			key: "prop",
			label: "prop",
			dataType: "String"
		}], "Cloned property infos");
		assert.notOk(oPropertyHelper.getProperties()[0].hasOwnProperty("foo"), "The non-enumerable attribute was not cloned");

		oPropertyHelper.destroy();
	});

	QUnit.module("Reference to a parent");

	QUnit.test("Without a parent", function(assert) {
		let oPropertyHelper = new PropertyHelper([]);
		assert.strictEqual(oPropertyHelper.getParent(), null, "The property helper has no parent");
		oPropertyHelper.destroy();

		oPropertyHelper = new PropertyHelper([], null, null);
		assert.strictEqual(oPropertyHelper.getParent(), null, "The property helper has no parent");
		oPropertyHelper.destroy();
	});

	QUnit.test("With a valid parent", function(assert) {
		const oParent = new ManagedObject();
		const oPropertyHelper = new PropertyHelper([], oParent);

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
				key: "prop",
				label: "Property",
				dataType: "String",
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
				key: "complexProp",
				label: "Complex property",
				propertyInfos: ["prop", "otherProp"]
			}, {
				key: "otherProp",
				label: "My other property",
				dataType: "String"
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
		const oProp = this.oPropertyHelper.getProperty("prop");
		const oComplexProp = this.oPropertyHelper.getProperty("complexProp");
		const oOtherProp = this.oPropertyHelper.getProperty("otherProp");

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
		const aProperties = this.oPropertyHelper.getProperties();

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
		const mPropertyMap = this.oPropertyHelper.getPropertyMap();

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
		beforeEach: function() {
			this.aOriginalProperties = [{
				key: "propA",
				label: "Property A",
				dataType: "String",
				path: "propAPath",
				unit: "propB",
				groupLabel: "Property A group label",
				exportSettings: {
					width: 20,
					label: "Property A export label"
				},
				maxConditions: 2
			}, {
				key: "propB",
				label: "Property B",
				dataType: "String",
				sortable: false,
				filterable: false,
				visible: false
			}, {
				key: "complexPropA",
				label: "Complex Property A",
				propertyInfos: ["propA", "propB"],
				groupLabel: "Complex Property A group label",
				exportSettings: {
					width: 30,
					label: "Complex Property A export label"
				}
			}, {
				key: "complexPropB",
				label: "Complex Property B",
				propertyInfos: ["propB"],
				visible: false
			}, {
				key: "complexPropC",
				label: "Complex Property C",
				propertyInfos: ["propB"]
			}, {
				key: "complexPropD",
				label: "Complex Property C",
				propertyInfos: ["propA"],
				visible: false
			}];
			this.oPropertyHelper = new PropertyHelper(this.aOriginalProperties);
			this.aProperties = this.oPropertyHelper.getProperties();
		},
		afterEach: function() {
			this.oPropertyHelper.destroy();
		}
	});

	QUnit.test("getProperties", function(assert) {
		const aProperties = this.oPropertyHelper.getProperties();

		assert.equal(aProperties.length, this.aOriginalProperties.length,
			"The property array contains as many entries as there are properties");

		this.aOriginalProperties.forEach(function(oOriginalProperty, iIndex) {
			assert.strictEqual(aProperties[iIndex].key, oOriginalProperty.key,
				"The property array references the correct property at index " + iIndex);
		});

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getProperties(), [], "After destruction");
	});

	QUnit.test("setProperties", function(assert) {
		const oValidatePropertiesSpy = sinon.spy();
		const oValidatePropertySpy = sinon.spy();

		const aUpdatedProperties = [...this.aOriginalProperties, {
			key: "ReplacedPropA",
			label: "Replaced Property A",
			dataType: "String",
			sortable: false,
			filterable: false,
			visible: false
		}, {
			key: "ReplacedPropB",
			label: "Replaced Property B",
			dataType: "String",
			sortable: false,
			filterable: false,
			visible: false
		}];

		const MyPropertyHelper = PropertyHelper.extend("sap.ui.mdc.test.table.PropertyHelper", {
			validateProperties: function() {
				PropertyHelper.prototype.validateProperties.apply(this, arguments);
				oValidatePropertiesSpy.apply(this, merge([], arguments));
			},
			validateProperty: function() {
				PropertyHelper.prototype.validateProperty.apply(this, arguments);
				oValidatePropertySpy.apply(this, merge([], arguments));
			}
		});
		const oMyPropertyHelper = new MyPropertyHelper(this.aOriginalProperties);

		oValidatePropertiesSpy.resetHistory();
		oValidatePropertySpy.resetHistory();
		oMyPropertyHelper.setProperties(aUpdatedProperties);
		const aProperties = oMyPropertyHelper.getProperties();

		assert.equal(aProperties.length, aUpdatedProperties.length,
			"The property array contains as many entries as there are replaced properties");
			aUpdatedProperties.forEach(function(oReplacementProperty, iIndex) {
			assert.strictEqual(aProperties[iIndex].key, oReplacementProperty.key,
				"The property array references the correct replaced property at index " + iIndex);
		});
		assert.ok(oValidatePropertiesSpy.calledOnceWithExactly(aUpdatedProperties, this.aOriginalProperties),
			"#validateProperties called once with the correct arguments");
		assert.equal(oValidatePropertySpy.callCount, aUpdatedProperties.length, "#validateProperty called for every incoming property");
		assert.ok(oValidatePropertySpy.getCall(0).calledWithExactly(aUpdatedProperties[0], aUpdatedProperties, this.aOriginalProperties),
			"Arguments of first call");
		assert.ok(oValidatePropertySpy.getCall(1).calledWithExactly(aUpdatedProperties[1], aUpdatedProperties, this.aOriginalProperties),
			"Arguments of first call");

		assert.throws(function() {
			oMyPropertyHelper.setProperties();
		}, new Error("Invalid property definition: Property infos must be an array."));

		oMyPropertyHelper.destroy();
	});

	QUnit.test("getPropertyMap", function(assert) {
		const mProperties = this.oPropertyHelper.getPropertyMap();

		assert.equal(Object.keys(mProperties).length, this.aOriginalProperties.length,
			"The property map contains as many entries as there are properties");

		this.aProperties.forEach(function(oProperty) {
			assert.strictEqual(mProperties[oProperty.key], oProperty,
				"The map references the correct property for the key '" + oProperty.key + "'");
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
			key: "propA",
			label: "Property"
		}), null, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.getProperty({
			key: "complexPropA",
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
			key: "propA",
			label: "Property"
		}), false, "Unknown simple property");
		assert.strictEqual(this.oPropertyHelper.hasProperty({
			key: "complexPropA",
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
			key: "propA",
			label: "Property"
		}), false, "Unknown simple property");
		assert.strictEqual(_PropertyHelper.isPropertyComplex({
			key: "complexPropA",
			label: "Complex Property",
			propertyInfos: ["propA", "propB"]
		}), true, "Unknown complex property");

		this.oPropertyHelper.destroy();
		assert.strictEqual(_PropertyHelper.isPropertyComplex({
			key: "complexPropA",
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

	QUnit.test("_getAttributeMetadata", function(assert) {
		const mOriginalMetadata = merge({}, this.oPropertyHelper._getAttributeMetadata());

		this.oPropertyHelper._getAttributeMetadata().key.type = "YAY!";
		assert.deepEqual(mOriginalMetadata, this.oPropertyHelper._getAttributeMetadata(),
			"Manipulations of the returned metadata information do not affect the property helper");
	});

	QUnit.module("Property", {
		beforeEach: function() {
			this.oPropertyHelper = new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "prop2",
				label: "Property 2",
				dataType: "String",
				sortable: false,
				filterable: false,
				visible: false
			}, {
				key: "complexProp",
				label: "Complex property",
				propertyInfos: ["prop"]
			}, {
				key: "complexProp2",
				label: "Complex property 2",
				propertyInfos: ["prop2"]
			}, {
				key: "complexProp3",
				label: "Complex property 3",
				propertyInfos: ["prop"],
				visible: false
			}, {
				key: "complexProp4",
				label: "Complex property 4",
				propertyInfos: ["prop2"],
				visible: false
			}]);
		},
		afterEach: function() {
			this.oPropertyHelper.destroy();
		},
		assertProperty: function(assert, oProperty) {
			const aExpectedMethods = [
				"isComplex", "getSimpleProperties", "getSortableProperties", "getFilterableProperties", "getVisibleProperties"
			];
			const aActualMethods = [];

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
		const oComplexProperty = this.oPropertyHelper.getProperty("complexProp");

		assert.strictEqual(this.oPropertyHelper.getProperty("prop").isComplex(), false, "Simple property");
		assert.strictEqual(oComplexProperty.isComplex(), true, "Complex property");
		assert.ok(Object.isFrozen(oComplexProperty.isComplex), "The function is frozen");

		this.oPropertyHelper.destroy();
		assert.strictEqual(oComplexProperty.isComplex(), true, "After destruction");
	});

	QUnit.test("getSimpleProperties", function(assert) {
		const oSimpleProperty = this.oPropertyHelper.getProperty("prop");
		const oComplexProperty = this.oPropertyHelper.getProperty("complexProp");

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
		const oSimpleProperty = this.oPropertyHelper.getProperty("prop");
		const oComplexProperty = this.oPropertyHelper.getProperty("complexProp");

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
		const oSimpleProperty = this.oPropertyHelper.getProperty("prop");
		const oComplexProperty = this.oPropertyHelper.getProperty("complexProp");

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
		const oSimpleProperty = this.oPropertyHelper.getProperty("prop");
		const oComplexProperty = this.oPropertyHelper.getProperty("complexProp");

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
		const oValidatePropertiesSpy = sinon.spy();
		const oValidatePropertySpy = sinon.spy();
		const aProperties = [{
			key: "prop",
			label: "Property",
			dataType: "String"
		}, {
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}];
		const MyPropertyHelper = PropertyHelper.extend("sap.ui.mdc.test.table.PropertyHelper", {
			validateProperties: function() {
				PropertyHelper.prototype.validateProperties.apply(this, arguments);
				oValidatePropertiesSpy.apply(this, merge([], arguments));
			},
			validateProperty: function() {
				oValidatePropertySpy.apply(this, merge([], arguments));
				PropertyHelper.prototype.validateProperty.apply(this, arguments);
			}
		});
		const oMyPropertyHelper = new MyPropertyHelper(aProperties);

		assert.ok(oValidatePropertiesSpy.calledOnceWithExactly(aProperties, undefined), "#validateProperties called once with the correct arguments");
		assert.equal(oValidatePropertySpy.callCount, 2, "#validateProperty called twice");
		assert.ok(oValidatePropertySpy.firstCall.calledWithExactly(aProperties[0], aProperties, undefined), "Arguments of first #validateProperty call");
		assert.ok(oValidatePropertySpy.secondCall.calledWithExactly(aProperties[1], aProperties, undefined), "Arguments of second #validateProperty call");

		oMyPropertyHelper.destroy();
	});

	QUnit.test("Property preparation", function(assert) {
		const oPreparePropertySpy = sinon.spy();
		const aProperties = [{
			key: "prop",
			name: "prop",
			label: "Property",
			dataType: "String"
		}, {
			key: "complexProp",
			name: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}];

		const oCustomPropertyAttribute = {prop: "value"};
		const MyPropertyHelper = PropertyHelper.extend("sap.ui.mdc.test.table.PropertyHelper", {
			prepareProperty: function(oProperty) {
				oPreparePropertySpy.apply(this, merge([], arguments));
				PropertyHelper.prototype.prepareProperty.apply(this, arguments);
				oProperty.myAttribute = oCustomPropertyAttribute;
				oProperty.myMethod = function() {return "MyMethod";};
				oProperty.label = "label modified";
				oProperty.isComplex = function() {return "isComplex modified";};
			}
		});
		const oMyPropertyHelper = new MyPropertyHelper(aProperties);
		const oProperty = oMyPropertyHelper.getProperties()[0];

		assert.equal(oPreparePropertySpy.callCount, 2, "#prepareProperty called twice");
		assert.ok(oPreparePropertySpy.firstCall.calledWithExactly({...aProperties[0], name: aProperties[0].key}, {prop: aProperties[0], complexProp: aProperties[1]}), "Arguments of first #prepareProperty call");
		assert.ok(oPreparePropertySpy.secondCall.calledWithExactly({...aProperties[1], name: aProperties[1].key}, {prop: oProperty, complexProp: aProperties[1]}), "Arguments of second #prepareProperty call");
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