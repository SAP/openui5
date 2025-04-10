/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/table/V4AnalyticsPropertyHelper"
], function(
	PropertyHelper
) {
	"use strict";

	QUnit.module("Validation");

	QUnit.test("groupable=true and technicallyGroupable=false", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
				groupable: true,
				extension: {
					technicallyGroupable: false
				}
			}]);
		}, new Error("Invalid property definition for property with key 'prop': A property cannot be groupable when not technically groupable.")
		);
	});

	QUnit.test("aggregatable=true and technicallyAggregatable=false", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
				aggregatable: true,
				extension: {
					technicallyAggregatable: false
				}
			}]);
		}, new Error("Invalid property definition for property with key 'prop': A property cannot be aggregatable when not technically aggregatable.")
		);
	});

	QUnit.test("isKey=true and technicallyGroupable=false", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
				isKey: true
			}]);
		}, new Error("Invalid property definition for property with key 'prop': A key property must be technically groupable.")
		);
	});

	QUnit.test("isKey=true and technicallyAggregatable=true", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
				isKey: true,
				groupable: true,
				aggregatable: false,
				extension: {
					technicallyAggregatable: true
				}
			}]);
		}, new Error("Invalid property definition for property with key 'prop': A key property must not be technically aggregatable.")
		);
	});

	QUnit.test("additionalProperties and technicallyGroupable=false & technicallyAggregatable=false", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "textProperty",
				label: "Text Property",
				dataType: "String",
				extension: {
					additionalProperties: ["prop"]
				}
			}]);
		}, new Error("Invalid property definition for property with key 'textProperty': 'additionalProperties' must be empty if the property is neither technically groupable nor"
			+ " technically aggregatable.")
		);
	});

	QUnit.test("additionalProperties and technicallyGroupable=true & technicallyAggregatable=true", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "textProperty",
				label: "Text Property",
				dataType: "String",
				extension: {
					technicallyGroupable: true,
					technicallyAggregatable: true,
					additionalProperties: ["prop"]
				}
			}]);
		}, new Error("Invalid property definition for property with key 'textProperty': 'additionalProperties' must be empty if the property is both technically groupable and technically"
			+ " aggregatable.")
		);
	});

	QUnit.test("additionalProperties and groupable=true", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "contextDefiningProperty",
				label: "Context-defining Property",
				dataType: "String"
			}, {
				key: "prop",
				label: "Property",
				dataType: "String",
				groupable: true,
				extension: {
					additionalProperties: ["contextDefiningProperty"]
				}
			}]);
		}, new Error("Invalid property definition for property with key 'prop': 'additionalProperties' must be empty if the property is groupable.")
		);
	});

	QUnit.test("additionalProperties contains the text", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "idProperty",
				label: "ID Property",
				dataType: "String",
				text: "textProperty",
				extension: {
					technicallyGroupable: true,
					additionalProperties: ["textProperty"]
				}
			}, {
				key: "textProperty",
				label: "Text Property",
				dataType: "String"
			}]);
		}, new Error("Invalid property definition for property with key 'idProperty': 'additionalProperties' must not contain the text.")
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "idProperty",
				label: "ID Property",
				dataType: "String",
				text: "textProperty",
				extension: {
					technicallyAggregatable: true,
					additionalProperties: ["textProperty"]
				}
			}, {
				key: "textProperty",
				label: "Text Property",
				dataType: "String"
			}]);
		}, new Error("Invalid property definition for property with key 'idProperty': 'additionalProperties' must not contain the text.")
		);
	});

	QUnit.test("additionalProperties contains the unit", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "idProperty",
				label: "ID Property",
				dataType: "String",
				unit: "unitProperty",
				extension: {
					technicallyAggregatable: true,
					additionalProperties: ["unitProperty"]
				}
			}, {
				key: "unitProperty",
				label: "Unit Property",
				dataType: "String"
			}]);
		}, new Error("Invalid property definition for property with key 'idProperty': 'additionalProperties' must not contain the unit.")
		);
	});

	QUnit.test("additionalProperties of a text property", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
				extension: {
					technicallyGroupable: true
				}
			}, {
				key: "idProperty",
				label: "ID Property",
				dataType: "String",
				text: "textProperty",
				extension: {
					technicallyGroupable: true
				}
			}, {
				key: "textProperty",
				label: "Text Property",
				dataType: "String",
				extension: {
					technicallyGroupable: true,
					additionalProperties: ["idProperty", "prop"]
				}
			}]);
		}, new Error("Invalid property definition for property with key 'textProperty': This property is the text of another property, and therefore 'additionalProperties' must not"
			+ " contain other properties than the related ID.")
		);

		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
				extension: {
					technicallyGroupable: true
				}
			}, {
				key: "idProperty",
				label: "ID Property",
				dataType: "String",
				text: "textProperty"
			}, {
				key: "textProperty",
				label: "Text Property",
				dataType: "String",
				extension: {
					technicallyGroupable: true,
					additionalProperties: ["prop"]
				}
			}]);
		}, new Error("Invalid property definition for property with key 'textProperty': This property is the text of another property, and therefore 'additionalProperties' must not"
			+ " contain other properties than the related ID.")
		);
	});

	QUnit.test("additionalProperties of a unit property", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
				extension: {
					technicallyGroupable: true
				}
			}, {
				key: "amountProperty",
				label: "Amount Property",
				dataType: "String",
				unit: "unitProperty"
			}, {
				key: "unitProperty",
				label: "Unit Property",
				dataType: "String",
				extension: {
					technicallyGroupable: true,
					additionalProperties: ["prop"]
				}
			}]);
		}, new Error("Invalid property definition for property with key 'unitProperty': This property is the unit of another property, and therefore 'additionalProperties' must be empty."));

		assert.throws(function() {
			new PropertyHelper([{
				key: "amountProperty",
				label: "Amount Property",
				dataType: "String",
				unit: "unitProperty",
				extension: {
					technicallyGroupable: true
				}
			}, {
				key: "unitProperty",
				label: "Unit Property",
				dataType: "String",
				extension: {
					technicallyGroupable: true,
					additionalProperties: ["amountProperty"]
				}
			}]);
		}, new Error("Invalid property definition for property with key 'unitProperty': This property is the unit of another property, and therefore 'additionalProperties' must be empty."));
	});

	QUnit.test("additionalProperties of a property that is both a unit and a text", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "idProperty",
				label: "ID Property",
				dataType: "String",
				text: "unitAndTextProperty"
			}, {
				key: "amountProperty",
				label: "Amount Property",
				dataType: "String",
				unit: "unitAndTextProperty",
				extension: {
					technicallyGroupable: true
				}
			}, {
				key: "unitAndTextProperty",
				label: "Unit and Text Property",
				dataType: "String",
				extension: {
					technicallyGroupable: true,
					additionalProperties: ["amountProperty"]
				}
			}]);
		}, new Error("Invalid property definition for property with key 'unitAndTextProperty': This property is the text of another property, and therefore 'additionalProperties' must not"
			+ " contain other properties than the related ID."));

		assert.throws(function() {
			new PropertyHelper([{
				key: "idProperty",
				label: "ID Property",
				dataType: "String",
				text: "unitAndTextProperty",
				extension: {
					technicallyGroupable: true
				}
			}, {
				key: "amountProperty",
				label: "Amount Property",
				dataType: "String",
				unit: "unitAndTextProperty"
			}, {
				key: "unitAndTextProperty",
				label: "Unit and Text Property",
				dataType: "String",
				extension: {
					technicallyGroupable: true,
					additionalProperties: ["idProperty"]
				}
			}]);
		}, new Error("Invalid property definition for property with key 'unitAndTextProperty': This property is the unit of another property, and therefore 'additionalProperties' must be empty."));
	});

	QUnit.test("additionalProperties with bi-directional references", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				label: "Property A",
				dataType: "String",
				extension: {
					technicallyGroupable: true
				}
			}, {
				key: "propB",
				label: "Property B",
				dataType: "String",
				extension: {
					technicallyGroupable: true,
					additionalProperties: ["propA", "propC"]
				}
			}, {
				key: "propC",
				label: "Property C",
				dataType: "String",
				extension: {
					technicallyGroupable: true,
					additionalProperties: ["propB"]
				}
			}]);
		}, new Error("Invalid property definition for property with key 'propB': An additional property must not reference this property in 'additionalProperties'."));
	});

	QUnit.test("additionalProperties that are technicallyGroupable=false", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				label: "Property A",
				dataType: "String",
				extension: {
					technicallyGroupable: true,
					additionalProperties: ["propB"]
				}
			}, {
				key: "propB",
				label: "Property B",
				dataType: "String"
			}]);
		}, new Error("Invalid property definition for property with key 'propA': An additional property must be technically groupable."));
	});

	QUnit.test("additionalProperties that are technicallyAggregatable=true", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "propA",
				label: "Property A",
				dataType: "String",
				extension: {
					technicallyGroupable: true,
					additionalProperties: ["propB"]
				}
			}, {
				key: "propB",
				label: "Property B",
				dataType: "String",
				extension: {
					technicallyGroupable: true,
					technicallyAggregatable: true
				}
			}]);
		}, new Error("Invalid property definition for property with key 'propA': An additional property must not be technically aggregatable."));
	});

	QUnit.test("additionalProperties nesting", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
				extension: {
					technicallyGroupable: true,
					additionalProperties: ["additionalPropA", "additionalPropB"] // Is missing additionalPropC
				}
			}, {
				key: "additionalPropA",
				label: "Additional Property A",
				dataType: "String",
				extension: {
					technicallyGroupable: true,
					additionalProperties: ["additionalPropB"]
				}
			}, {
				key: "additionalPropB",
				label: "Additional Property B",
				dataType: "String",
				extension: {
					technicallyGroupable: true,
					additionalProperties: ["additionalPropC"]
				}
			}, {
				key: "additionalPropC",
				label: "Additional Property C",
				dataType: "String",
				extension: {
					technicallyGroupable: true
				}
			}]);
		}, new Error("Invalid property definition for property with key 'prop': All nested additional properties must be listed at root level."));
	});

	QUnit.test("Complex property with attribute 'aggregatable'", function(assert) {
		assert.throws(function () {
            new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "complexProp",
				label: "ComplexProperty",
				propertyInfos: ["prop"],
				aggregatable: true
			}]).destroy();
		}, new Error("Invalid property definition for property with key 'complexProp': Complex property contains invalid attribute 'aggregatable'."));
	});

	QUnit.test("Complex property with attribute 'extension.technicallyGroupable'", function(assert) {
		assert.throws(function () {
            new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "complexProp",
				label: "ComplexProperty",
				propertyInfos: ["prop"],
				extension: {
					technicallyGroupable: false
				}
			}]).destroy();
		}, new Error("Invalid property definition for property with key 'complexProp': Complex property contains invalid attribute 'extension.technicallyGroupable'."));
	});

	QUnit.test("Complex property with attribute 'extension.technicallyAggregatable'", function(assert) {
		assert.throws(function () {
            new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "complexProp",
				label: "ComplexProperty",
				propertyInfos: ["prop"],
				extension: {
					technicallyAggregatable: false
				}
			}]).destroy();
		}, new Error("Invalid property definition for property with key 'complexProp': Complex property contains invalid attribute 'extension.technicallyAggregatable'."));
	});

	QUnit.test("Complex property with attribute 'extension.additionalProperties'", function(assert) {
		assert.throws(function () {
            new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String"
			}, {
				key: "complexProp",
				label: "ComplexProperty",
				propertyInfos: ["prop"],
				extension: {
					additionalProperties: ["prop"]
				}
			}]).destroy();
		}, new Error("Invalid property definition for property with key 'complexProp': Complex property contains invalid attribute 'extension.additionalProperties'."));
	});

	QUnit.module("Defaults", {
		beforeEach: function() {
			this.oSimplePropertyDefaults = {
				key: "prop",
				name: "prop",
				label: "Property",
				dataType: "String",
				tooltip: "",
				caseSensitive: true,
				exportSettings: {},
				clipboardSettings: {
					template: ""
				},
				filterable: true,
				group: "",
				groupLabel: "",
				groupable: false,
				aggregatable: false,
				isKey: false,
				maxConditions: -1,
				path: "",
				sortable: true,
				text: "",
				formatOptions: null,
				constraints: null,
				unit: "",
				visible: true,
				visualSettings: {
					widthCalculation: {
						defaultWidth: 8,
						excludeProperties: [],
						gap: 0,
						includeLabel: true,
						maxWidth: 19,
						minWidth: 2,
						truncateLabel: true,
						verticalArrangement: false
					}
				},
				extension: {
					technicallyGroupable: false,
					technicallyAggregatable: false,
					additionalProperties: []
				}
			};

			this.oComplexPropertyDefaults = {
				key: "complexProp",
				name: "complexProp",
				label: "Complex Property",
				tooltip: "",
				exportSettings: {},
				clipboardSettings: {
					template: ""
				},
				filterable: false,
				group: "",
				groupLabel: "",
				groupable: false,
				aggregatable: false,
				isKey: false,
				propertyInfos: ["prop"],
				sortable: false,
				visible: true,
				visualSettings: {
					widthCalculation: {
						defaultWidth: 8,
						excludeProperties: [],
						gap: 0,
						includeLabel: true,
						maxWidth: 19,
						minWidth: 2,
						truncateLabel: true,
						verticalArrangement: false
					}
				},
				extension: {
					technicallyGroupable: false,
					technicallyAggregatable: false
				}
			};
		},
		afterEach: function() {
			delete this.oSimplePropertyDefaults;
			delete this.oComplexPropertyDefaults;
		}
	});

	QUnit.test("Simple property", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "prop",
			label: "Property",
			dataType: "String"
		}]);

		assert.deepEqual(oPropertyHelper.getProperties(), [this.oSimplePropertyDefaults]);
		oPropertyHelper.destroy();
	});

	QUnit.test("Simple property with groupable=true and aggregatable=true", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "prop",
			label: "Property",
			dataType: "String",
			groupable: true,
			aggregatable: true
		}]);

		assert.deepEqual(oPropertyHelper.getProperties(), [Object.assign(this.oSimplePropertyDefaults, {
			groupable: true,
			aggregatable: true,
			extension: Object.assign(this.oSimplePropertyDefaults.extension, {
				technicallyGroupable: true,
				technicallyAggregatable: true
			})
		})]);
		oPropertyHelper.destroy();
	});

	QUnit.test("Complex property", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "prop",
			label: "Property",
			dataType: "String"
		}, {
			key: "complexProp",
			label: "Complex Property",
			propertyInfos: ["prop"]
		}]);

		assert.deepEqual(oPropertyHelper.getProperty("complexProp"), this.oComplexPropertyDefaults);
		oPropertyHelper.destroy();
	});

	QUnit.module("Property");

	QUnit.test("getAggregatableProperties", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "prop",
			label: "Property",
			dataType: "String",
			aggregatable: true
		}, {
			key: "prop2",
			label: "Property 2",
			dataType: "String"
		}, {
			key: "complexProp",
			label: "Complex property",
			propertyInfos: ["prop"]
		}, {
			key: "complexProp2",
			label: "Complex property 2",
			propertyInfos: ["prop2"]
		}]);

		assert.deepEqual(oPropertyHelper.getProperty("prop").getAggregatableProperties(), [
			oPropertyHelper.getProperty("prop")
		], "Aggregatable simple property");
		assert.deepEqual(oPropertyHelper.getProperty("complexProp").getAggregatableProperties(), [
			oPropertyHelper.getProperty("prop")
		], "Complex property referencing aggregatable properties");
		assert.deepEqual(oPropertyHelper.getProperty("prop2").getAggregatableProperties(), [],
			"Non-aggregatable simple property");
		assert.deepEqual(oPropertyHelper.getProperty("complexProp2").getAggregatableProperties(), [],
			"Complex property referencing non-aggregatable properties");

		const oComplexProperty = oPropertyHelper.getProperty("complexProp");
		oPropertyHelper.destroy();
		assert.deepEqual(oComplexProperty.getAggregatableProperties(), [], "After destruction");

		oPropertyHelper.destroy();
	});
});