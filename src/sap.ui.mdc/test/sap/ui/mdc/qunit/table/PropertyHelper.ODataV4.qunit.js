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
		}, new Error("Invalid property definition: A property cannot be groupable when not technically groupable."));
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
		}, new Error("Invalid property definition: A property cannot be aggregatable when not technically aggregatable."));
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
		}, new Error("Invalid property definition: 'additionalProperties' may not contain property keys if the property is neither technically"
			+ " groupable nor technically aggregatable."));
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
		}, new Error("Invalid property definition: 'additionalProperties' contains more than one property."));
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
		}, new Error("Invalid property definition: The property in 'additionalProperties' does not reference this property in 'text'."));
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
		}, new Error("Invalid property definition: 'additionalProperties' may not contain the text."));
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
		}, new Error("Invalid property definition: 'additionalProperties' may not contain the unit."));
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
        },  "Error thrown");
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
        },  "Error thrown");
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
        },  "Error thrown");
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
        },  "Error thrown");
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

	QUnit.module("API", {
		beforeEach: function() {
			this.oPropertyHelper = new PropertyHelper([{
				key: "propA",
				path: "propAPath",
				label: "Property A",
				dataType: "String",
				unit: "unit",
				groupable: true,
				aggregatable: true,
				isKey: true,
				text: "propB",
				extension: {
					customAggregate: {
						contextDefiningProperties: ["propB"]
					}
				}
			}, {
				key: "propB",
				label: "Property B",
				dataType: "String",
				groupable: true,
				extension: {
					technicallyAggregatable: true,
					additionalProperties: ["propA"]
				}
			}, {
				key: "propC",
				label: "Property C",
				dataType: "String",
				aggregatable: true,
				extension: {
					technicallyGroupable: true,
					customAggregate: {}
				}
			}, {
				key: "complexPropA",
				label: "Complex property A",
				propertyInfos: ["propA"]
			}, {
				key: "complexPropB",
				label: "Complex property B",
				propertyInfos: ["propB"]
			}, {
				key: "complexPropC",
				label: "Complex property C",
				propertyInfos: ["propA", "propB", "propC"]
			}, {
				key: "unit",
				label: "Unit",
				dataType: "String"
			}]);
			this.aProperties = this.oPropertyHelper.getProperties();
		},
		afterEach: function() {
			this.oPropertyHelper.destroy();
		}
	});

	QUnit.test("getAggregatableProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getAggregatableProperties(), [
			this.aProperties[0], this.aProperties[2]
		]);

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getAggregatableProperties(), [], "After destruction");
	});

	QUnit.test("getPropertiesForPlugin", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getPropertiesForPlugin(), [{
			key: "propA",
			aggregatable: true,
			aggregationDetails: {
				customAggregate: {
					contextDefiningProperties: ["propB"]
				}
			},
			groupable: true,
			isKey: true,
			path: "propAPath",
			text: "propB",
			unit: "unit",
			additionalProperties: []
		}, {
			key: "propB",
			aggregatable: true,
			groupable: true,
			isKey: false,
			path: "",
			text: "",
			unit: "",
			additionalProperties: ["propA"]
		}, {
			key: "propC",
			aggregatable: true,
			aggregationDetails: {
				customAggregate: {
					contextDefiningProperties: []
				}
			},
			groupable: true,
			isKey: false,
			path: "",
			text: "",
			unit: "",
			additionalProperties: []
		}, {
			key: "unit",
			aggregatable: false,
			groupable: false,
			isKey: false,
			path: "",
			text: "",
			unit: "",
			additionalProperties: []
		}]);
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

		const oSimpleProperty = oPropertyHelper.getProperty("prop");
		const oComplexProperty = oPropertyHelper.getProperty("complexProp");
		oPropertyHelper.destroy();
		assert.deepEqual(oComplexProperty.getAggregatableProperties(), [oSimpleProperty], "After destruction");

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