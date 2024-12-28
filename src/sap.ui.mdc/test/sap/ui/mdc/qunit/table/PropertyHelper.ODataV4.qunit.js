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
		}, new Error("Invalid property definition: A property cannot be groupable when not technically groupable."
			+ '\n{"key":"prop","label":"Property","dataType":"String","groupable":true,"extension":{"technicallyGroupable":false}}'
		));
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
		}, new Error("Invalid property definition: A property cannot be aggregatable when not technically aggregatable."
			+ '\n{"key":"prop","label":"Property","dataType":"String","aggregatable":true,"extension":{"technicallyAggregatable":false}}'
		));
	});

	QUnit.test("isKey=true and technicallyGroupable=false", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
				isKey: true
			}]);
		}, new Error("Invalid property definition: A key property must be technically groupable."
			+ '\n{"key":"prop","label":"Property","dataType":"String","isKey":true}'
		));
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
		}, new Error("Invalid property definition: A key property must not be technically aggregatable."
			+ '\n{"key":"prop","label":"Property","dataType":"String","isKey":true,"groupable":true,"aggregatable":false,'
			+ '"extension":{"technicallyAggregatable":true}}'
		));
	});

	QUnit.test("additionalProperties is not empty and technicallyGroupable=false & technicallyAggregatable=false", function(assert) {
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
		}, new Error("Invalid property definition: 'additionalProperties' must not contain property keys if the property is neither technically"
			+ " groupable nor technically aggregatable."
			+ '\n{"key":"textProperty","label":"Text Property","dataType":"String","extension":{"additionalProperties":["prop"]}}'
		));
	});

	QUnit.test("additionalProperties contains more than one property and technicallyGroupable=true & technicallyAggregatable=false", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "idPropertyA",
				label: "ID Property A",
				dataType: "String",
				text: "textProperty"
			}, {
				key: "idPropertyB",
				label: "ID Property B",
				dataType: "String",
				text: "textProperty"
			}, {
				key: "textProperty",
				label: "Text Property",
				dataType: "String",
				extension: {
					additionalProperties: ["idPropertyA", "idPropertyB"],
					technicallyGroupable: true
				}
			}]);
		}, new Error("Invalid property definition: 'additionalProperties' contains more than one property."
			+ '\n{"key":"textProperty","label":"Text Property","dataType":"String",'
			+ '"extension":{"additionalProperties":["idPropertyA","idPropertyB"],"technicallyGroupable":true}}'
		));
	});

	QUnit.test("additionalProperties do not have id<->text relation and technicallyGroupable=true & technicallyAggregatable=false", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "idProperty",
				label: "ID Property",
				dataType: "String"
			}, {
				key: "textProperty",
				label: "Text Property",
				dataType: "String",
				extension: {
					additionalProperties: ["idProperty"],
					technicallyGroupable: true
				}
			}]);
		}, new Error("Invalid property definition: The property in 'additionalProperties' does not reference this property in 'text'."
			+ '\n{"key":"textProperty","label":"Text Property","dataType":"String",'
			+ '"extension":{"additionalProperties":["idProperty"],"technicallyGroupable":true}}'
		));
	});

	QUnit.test("additionalProperties contains the text", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "idProperty",
				label: "ID Property",
				dataType: "String",
				groupable: true,
				text: "textProperty",
				extension: {
					additionalProperties: ["textProperty"]
				}
			}, {
				key: "textProperty",
				label: "Text Property",
				dataType: "String",
				text: "idProperty", // Required to support the test case at the time of writing
				extension: {
					additionalProperties: ["idProperty"]
				}
			}]);
		}, new Error("Invalid property definition: 'additionalProperties' must not contain the text."
			+ '\n{"key":"idProperty","label":"ID Property","dataType":"String","groupable":true,"text":"textProperty",'
			+ '"extension":{"additionalProperties":["textProperty"]}}'
		));
	});

	QUnit.test("additionalProperties contains the unit", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "idProperty",
				label: "ID Property",
				dataType: "String",
				aggregatable: true,
				unit: "unitProperty",
				extension: {
					additionalProperties: ["unitProperty"]
				}
			}, {
				key: "unitProperty",
				label: "Unit Property",
				dataType: "String"
			}]);
		}, new Error("Invalid property definition: 'additionalProperties' must not contain the unit."
			+ '\n{"key":"idProperty","label":"ID Property","dataType":"String","aggregatable":true,"unit":"unitProperty",'
			+ '"extension":{"additionalProperties":["unitProperty"]}}'
		));
	});

	QUnit.test("additionalProperties nesting", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				key: "prop",
				label: "Property",
				dataType: "String",
				aggregatable: true,
				extension: {
					additionalProperties: ["additionalPropA", "additionalPropB"] // Is missing additionalPropC
				}
			}, {
				key: "additionalPropA",
				label: "Additional Property A",
				dataType: "String",
				aggregatable: true,
				extension: {
					additionalProperties: ["additionalPropB"]
				}
			}, {
				key: "additionalPropB",
				label: "Additional Property B",
				dataType: "String",
				aggregatable: true,
				extension: {
					additionalProperties: ["additionalPropC"]
				}
			}, {
				key: "additionalPropC",
				label: "Additional Property C",
				dataType: "String"
			}]);
		}, new Error("Invalid property definition: All nested additional properties must be listed at root level."
			+ '\n{"key":"prop","label":"Property","dataType":"String","aggregatable":true,'
			+ '"extension":{"additionalProperties":["additionalPropA","additionalPropB"]}}'
		));
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
		}, new Error("Invalid property definition: Complex property contains invalid attribute 'aggregatable'."
			+ '\n{"key":"complexProp","label":"ComplexProperty","propertyInfos":["prop"],"aggregatable":true}'
		)
		);
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
		}, new Error("Invalid property definition: Complex property contains invalid attribute 'extension.technicallyGroupable'."
			+ '\n{"key":"complexProp","label":"ComplexProperty","propertyInfos":["prop"],"extension":{"technicallyGroupable":false}}'
		)
		);
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
		}, new Error("Invalid property definition: Complex property contains invalid attribute 'extension.technicallyAggregatable'."
			+ '\n{"key":"complexProp","label":"ComplexProperty","propertyInfos":["prop"],"extension":{"technicallyAggregatable":false}}'
		)
		);
	});

	QUnit.test("Complex property with attribute 'extension.customAggregate'", function(assert) {
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
					customAggregate: {}
				}
			}]).destroy();
		}, new Error("Invalid property definition: Complex property contains invalid attribute 'extension.customAggregate'."
			+ '\n{"key":"complexProp","label":"ComplexProperty","propertyInfos":["prop"],"extension":{"customAggregate":{}}}')
		);
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
					customAggregate: null,
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
			aggregatable: true,
			extension: {
				customAggregate: {
					contextDefiningProperties: ["prop2"]
				}
			}
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

	QUnit.test("groupable with additionalProperties", function(assert) {
		const oPropertyHelper = new PropertyHelper([{
			key: "idProperty",
			label: "ID Property",
			dataType: "String",
			text: "textProperty"
		}, {
			key: "textProperty",
			label: "Text Property",
			dataType: "String",
			extension: {
				additionalProperties: ["idProperty"]
			},
			groupable: true
			}]);

		const oProperty = oPropertyHelper.getProperty("textProperty");

		assert.strictEqual(oProperty.groupable, false, "groupable");
		assert.strictEqual(oProperty.extension.technicallyGroupable, true, "technicallyGroupable");
	});
});