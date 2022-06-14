/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/table/V4AnalyticsPropertyHelper"
], function(PropertyHelper) {
	"use strict";

	QUnit.module("API", {
		beforeEach: function() {
			this.oPropertyHelper = new PropertyHelper([{
				name: "propA",
				label: "Property A",
				unit: "unit"
			}, {
				name: "propB",
				label: "Property B"
			}, {
				name: "propC",
				label: "Property C"
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
				label: "Unit"
			}], {
				propA: {
					defaultAggregate: {
						contextDefiningProperties: ["propB"]
					}
				},
				propC: {
					defaultAggregate: {}
				}
			});
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

	QUnit.module("Property", {
		beforeEach: function() {
			this.oPropertyHelper = new PropertyHelper([{
				name: "prop",
				label: "Property"
			}, {
				name: "prop2",
				label: "Property 2"
			}, {
				name: "complexProp",
				label: "Complex property",
				propertyInfos: ["prop"]
			}, {
				name: "complexProp2",
				label: "Complex property 2",
				propertyInfos: ["prop2"]
			}], {
				prop: {
					defaultAggregate: {
						contextDefiningProperties: ["prop2"]
					}
				}
			});
		},
		afterEach: function() {
			this.oPropertyHelper.destroy();
		},
		assertProperty: function(assert, oProperty) {
			var aExpectedMethods = ["getAggregatableProperties"];

			for (var i = 0; i < aExpectedMethods.length; i++) {
				var sMethod = aExpectedMethods[i];
				assert.equal(typeof oProperty[sMethod], "function", "Has function '" + sMethod + "'");
			}
		}
	});

	QUnit.test("Simple property", function(assert) {
		this.assertProperty(assert, this.oPropertyHelper.getProperty("prop"));
	});

	QUnit.test("Complex property", function(assert) {
		this.assertProperty(assert, this.oPropertyHelper.getProperty("complexProp"));
	});

	QUnit.test("Property referenced by complex property", function(assert) {
		this.assertProperty(assert, this.oPropertyHelper.getProperty("complexProp").getSimpleProperties()[0]);
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

	QUnit.test("attribute: aggregatable", function(assert) {
		assert.strictEqual(this.oPropertyHelper.getProperty("prop").aggregatable, true,
			"Aggregatable simple property");
		assert.strictEqual(this.oPropertyHelper.getProperty("complexProp").aggregatable, false,
			"Complex property referencing aggregatable properties");
		assert.strictEqual(this.oPropertyHelper.getProperty("prop2").aggregatable, false,
			"Non-aggregatable simple property");
		assert.strictEqual(this.oPropertyHelper.getProperty("complexProp2").aggregatable, false,
			"Complex property referencing non-aggregatable properties");
	});
});