/*!
 * ${copyright}
 */

/* global QUnit, sinon */

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

	QUnit.test("isAggregatable", function(assert) {
		assert.strictEqual(this.oPropertyHelper.isAggregatable(), null, "No arguments");
		assert.strictEqual(this.oPropertyHelper.isAggregatable({}), null, "Empty object");
		assert.strictEqual(this.oPropertyHelper.isAggregatable("propA"), true, "Name of an aggregatable simple property");
		assert.strictEqual(this.oPropertyHelper.isAggregatable("complexPropA"), false,
			"Name of a complex property referencing aggregatable properties");
		assert.strictEqual(this.oPropertyHelper.isAggregatable("propB"), false, "Name of a non-aggregatable simple property");
		assert.strictEqual(this.oPropertyHelper.isAggregatable("complexPropB"), false,
			"Name of a complex property referencing non-aggregatable properties");
		assert.strictEqual(this.oPropertyHelper.isAggregatable("unknownProp"), null, "Unknown property key");

		this.oPropertyHelper.destroy();
		assert.strictEqual(this.oPropertyHelper.isAggregatable("propA"), null, "After destruction");
	});

	QUnit.test("getAggregatableProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getAggregatableProperties(), [], "No arguments");
		assert.deepEqual(this.oPropertyHelper.getAggregatableProperties({}), [], "Empty object");
		assert.deepEqual(this.oPropertyHelper.getAggregatableProperties("propA"), [this.aProperties[0]],
			"Name of an aggregatable simple property");
		assert.deepEqual(this.oPropertyHelper.getAggregatableProperties("complexPropA"), [
			this.aProperties[0]
		], "Name of a complex property referencing one aggregatable property");
		assert.deepEqual(this.oPropertyHelper.getAggregatableProperties("complexPropC"), [
			this.aProperties[0], this.aProperties[2]
		], "Name of a complex property referencing multiple aggregatable properties");
		assert.deepEqual(this.oPropertyHelper.getAggregatableProperties("propB"), [], "Name of a non-aggregatable simple property");
		assert.deepEqual(this.oPropertyHelper.getAggregatableProperties("complexPropB"), [],
			"Name of a complex property referencing non-aggregatable properties");
		assert.deepEqual(this.oPropertyHelper.getAggregatableProperties("unknownProp"), [], "Unknown property key");

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getAggregatableProperties("propA"), [], "After destruction");
	});

	QUnit.test("getAllAggregatableProperties", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getAllAggregatableProperties(), [
			this.aProperties[0], this.aProperties[2]
		]);

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getAllAggregatableProperties(), [], "After destruction");
	});

	QUnit.test("getDefaultAggregate", function(assert) {
		assert.deepEqual(this.oPropertyHelper.getDefaultAggregate(), null, "No arguments");
		assert.deepEqual(this.oPropertyHelper.getDefaultAggregate({}), null, "Empty object");
		assert.deepEqual(this.oPropertyHelper.getDefaultAggregate("propA"), {
			contextDefiningProperties: [this.aProperties[1]],
			unit: this.aProperties[6]
		}, "Name of a simple property with a default aggregate with unit and context defining properties");
		assert.deepEqual(this.oPropertyHelper.getDefaultAggregate("propC"), {
			contextDefiningProperties: [],
			unit: null
		}, "Name of a simple property with a default aggregate without unit and context defining properties");
		assert.deepEqual(this.oPropertyHelper.getDefaultAggregate("propB"), null, "Name of a simple property without a default aggregate");
		assert.deepEqual(this.oPropertyHelper.getDefaultAggregate("complexProp"), null,
			"Name of a complex property referencing a property with a default aggregate");
		assert.deepEqual(this.oPropertyHelper.getDefaultAggregate("unknownProp"), null, "Unknown property key");

		this.oPropertyHelper.destroy();
		assert.deepEqual(this.oPropertyHelper.getDefaultAggregate("propA"), null, "After destruction");
	});

	QUnit.module("Property", {
		before: function() {
			this.aExpectedMethods = [
				"isAggregatable", "getAggregatableProperties", "getDefaultAggregate"
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
});