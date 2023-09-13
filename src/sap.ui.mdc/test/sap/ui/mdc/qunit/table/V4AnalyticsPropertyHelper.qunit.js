/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/table/V4AnalyticsPropertyHelper",
	"sap/base/Log"
], function(PropertyHelper, Log) {
	"use strict";

	QUnit.module("Validation");

	QUnit.test("groupable=true and technicallyGroupable=false", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "prop",
				label: "Property",
				dataType: "String",
				groupable: true,
				extension: {
					technicallyGroupable: false
				}
			}]);
		}, "Error thrown");
	});

	QUnit.test("aggregatable=true and technicallyAggregatable=false", function(assert) {
		assert.throws(function() {
			new PropertyHelper([{
				name: "prop",
				label: "Property",
				dataType: "String",
				aggregatable: true,
				extension: {
					technicallyAggregatable: false
				}
			}]);
		}, "Error thrown");
	});

	QUnit.test("Complex property with attribute 'aggregatable'", function(assert) {
		assert.throws(function () {
            new PropertyHelper([{
				name: "prop",
				label: "Property",
				dataType: "String"
			}, {
				name: "complexProp",
				label: "ComplexProperty",
				propertyInfos: ["prop"],
				aggregatable: true
			}]).destroy();
        }, function(oError) {
            return oError instanceof Error;
        },  "Error thrown");
	});

	QUnit.test("Complex property with attribute 'extension.technicallyGroupable'", function(assert) {
		assert.throws(function () {
            new PropertyHelper([{
				name: "prop",
				label: "Property",
				dataType: "String"
			}, {
				name: "complexProp",
				label: "ComplexProperty",
				propertyInfos: ["prop"],
				extension: {
					technicallyGroupable: false
				}
			}]).destroy();
        }, function(oError) {
            return oError instanceof Error;
        },  "Error thrown");
	});

	QUnit.test("Complex property with attribute 'extension.technicallyAggregatable'", function(assert) {
		assert.throws(function () {
            new PropertyHelper([{
				name: "prop",
				label: "Property",
				dataType: "String"
			}, {
				name: "complexProp",
				label: "ComplexProperty",
				propertyInfos: ["prop"],
				extension: {
					technicallyAggregatable: false
				}
			}]).destroy();
        }, function(oError) {
            return oError instanceof Error;
        },  "Error thrown");
	});

	QUnit.test("Complex property with attribute 'extension.customAggregate'", function(assert) {
		assert.throws(function () {
            new PropertyHelper([{
				name: "prop",
				label: "Property",
				dataType: "String"
			}, {
				name: "complexProp",
				label: "ComplexProperty",
				propertyInfos: ["prop"],
				extension: {
					customAggregate: {}
				}
			}]).destroy();
        }, function(oError) {
            return oError instanceof Error;
        },  "Error thrown");
	});

	QUnit.module("Defaults", {
		beforeEach: function() {
			this.oSimplePropertyDefaults = {
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
				key: false,
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
					customAggregate: null
				}
			};

			this.oComplexPropertyDefaults = {
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
				key: false,
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
		var oPropertyHelper = new PropertyHelper([{
			name: "prop",
			label: "Property",
			dataType: "String"
		}]);

		assert.deepEqual(oPropertyHelper.getProperties(), [this.oSimplePropertyDefaults]);
		oPropertyHelper.destroy();
	});

	QUnit.test("Simple property with groupable=true and aggregatable=true", function(assert) {
		var oPropertyHelper = new PropertyHelper([{
			name: "prop",
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
		var oPropertyHelper = new PropertyHelper([{
			name: "prop",
			label: "Property",
			dataType: "String"
		}, {
			name: "complexProp",
			label: "Complex Property",
			propertyInfos: ["prop"]
		}]);

		assert.deepEqual(oPropertyHelper.getProperty("complexProp"), this.oComplexPropertyDefaults);
		oPropertyHelper.destroy();
	});

	QUnit.module("API", {
		beforeEach: function() {
			this.oPropertyHelper = new PropertyHelper([{
				name: "propA",
				path: "propAPath",
				label: "Property A",
				dataType: "String",
				unit: "unit",
				groupable: true,
				aggregatable: true,
				key: true,
				text: "propB",
				extension: {
					customAggregate: {
						contextDefiningProperties: ["propB"]
					}
				}
			}, {
				name: "propB",
				label: "Property B",
				dataType: "String",
				extension: {
					technicallyAggregatable: true
				}
			}, {
				name: "propC",
				label: "Property C",
				dataType: "String",
				aggregatable: true,
				extension: {
					technicallyGroupable: true,
					customAggregate: {}
				}
			}, {
				name: "complexPropA",
				label: "Complex property A",
				propertyInfos: ["propA"]
			}, {
				name: "complexPropB",
				label: "Complex property B",
				propertyInfos: ["propB"]
			}, {
				name: "complexPropC",
				label: "Complex property C",
				propertyInfos: ["propA", "propB", "propC"]
			}, {
				name: "unit",
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
			name: "propA",
			aggregatable: true,
			aggregationDetails: {
				customAggregate: {
					contextDefiningProperties: ["propB"]
				}
			},
			groupable: true,
			key: true,
			path: "propAPath",
			text: "propB",
			unit: "unit"
		}, {
			name: "propB",
			aggregatable: true,
			groupable: false,
			key: false,
			path: "",
			text: "",
			unit: ""
		}, {
			name: "propC",
			aggregatable: true,
			aggregationDetails: {
				customAggregate: {
					contextDefiningProperties: []
				}
			},
			groupable: true,
			key: false,
			path: "",
			text: "",
			unit: ""
		}, {
			name: "unit",
			aggregatable: false,
			groupable: false,
			key: false,
			path: "",
			text: "",
			unit: ""
		}]);
	});

	QUnit.module("Property", {
		beforeEach: function() {
			this.oPropertyHelper = new PropertyHelper([{
				name: "prop",
				label: "Property",
				dataType: "String",
				aggregatable: true,
				extension: {
					customAggregate: {
						contextDefiningProperties: ["prop2"]
					}
				}
			}, {
				name: "prop2",
				label: "Property 2",
				dataType: "String"
			}, {
				name: "complexProp",
				label: "Complex property",
				propertyInfos: ["prop"]
			}, {
				name: "complexProp2",
				label: "Complex property 2",
				propertyInfos: ["prop2"]
			}]);
		},
		afterEach: function() {
			this.oPropertyHelper.destroy();
		}
	});

	QUnit.test("getAggregatableProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getProperty("prop").getAggregatableProperties(), [
			this.oPropertyHelper.getProperty("prop")
		], "Aggregatable simple property");
		assert.deepEqual(this.oPropertyHelper.getProperty("complexProp").getAggregatableProperties(), [
			this.oPropertyHelper.getProperty("prop")
		], "Complex property referencing aggregatable properties");
		assert.deepEqual(this.oPropertyHelper.getProperty("prop2").getAggregatableProperties(), [],
			"Non-aggregatable simple property");
		assert.deepEqual(this.oPropertyHelper.getProperty("complexProp2").getAggregatableProperties(), [],
			"Complex property referencing non-aggregatable properties");

		var oSimpleProperty = this.oPropertyHelper.getProperty("prop");
		var oComplexProperty = this.oPropertyHelper.getProperty("complexProp");
		this.oPropertyHelper.destroy();
		assert.deepEqual(oComplexProperty.getAggregatableProperties(), [oSimpleProperty], "After destruction");
	});
});