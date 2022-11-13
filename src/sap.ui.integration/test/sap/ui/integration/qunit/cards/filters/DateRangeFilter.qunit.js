/* global QUnit */

sap.ui.define([
	"sap/m/DynamicDateUtil",
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/integration/cards/filters/DateRangeFilter",
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/QUnitUtils"
], function (
	DynamicDateUtil,
	Core,
	coreLibrary,
	KeyCodes,
	DateRangeFilter,
	Card,
	QUnitUtils
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("DateRangeFilter Generic", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Instantiation", function (assert) {
		// Arrange
		var oDRF = new DateRangeFilter();

		// Assert
		assert.ok(oDRF, "Should be able to instantiate DateRangeFilter filter");

		// Clean up
		oDRF.destroy();
	});

	QUnit.test("Card creating 'DateRange' filter", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			// Assert
			var oFilterBar = this.oCard.getAggregation("_filterBar");
			assert.strictEqual(oFilterBar._getFilters().length, 1, "The filter bar has 1 filter");

			var oFirstFilter = oFilterBar._getFilters()[0];
			assert.ok(oFirstFilter.isA(DateRangeFilter.getMetadata().getName()), "The filter type is correct");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.filters.dateRange",
				"type": "card"
			},
			"sap.card": {
				"configuration": {
					"filters": {
						"dateRangeFilter": {
							"type": "DateRange"
						}
					}
				},
				"type": "List",
				"content": {
					"data": {
						"json": [{
								"Name": "item1"
						}]
					},
					"item": {
						"title": "{Name}"
					}
				}
			}
		});
	});

	QUnit.module("DateRangeFilter Value", {
		beforeEach: function () {
			this.oDRF = new DateRangeFilter();
		},
		afterEach: function () {
			this.oDRF.destroy();
		}
	});

	QUnit.test("Value properties with default config", function (assert) {
		// Arrange
		this.oDRF.setConfig({});
		var oModelValue = this.oDRF.getValueForModel();

		// Assert
		assert.ok(oModelValue.hasOwnProperty("value"), "'value' property should be part of value");
		assert.strictEqual(oModelValue.value, undefined, "'value' should be undefined");
		assert.ok(oModelValue.hasOwnProperty("range"), "'range' property should be part of value");
		assert.strictEqual(oModelValue.range, undefined, "'range' should be undefined");
		assert.ok(oModelValue.hasOwnProperty("rangeOData"), "'rangeOData' property should be part of value");
		assert.strictEqual(oModelValue.rangeOData, undefined, "'rangeOData' should be undefined");
	});

	QUnit.test("Value properties when config is set", function (assert) {
		// Arrange
		this.oDRF.setConfig({
			value: {
				option: "date",
				values: ["1997-05-01T00:00:00.000Z"]
			}
		});
		var oModelValue = this.oDRF.getValueForModel();

		// Assert
		assert.ok(oModelValue.value.hasOwnProperty("option"), "'option' property should be part of value");
		assert.ok(oModelValue.value.hasOwnProperty("values"), "'values' property should be part of value");
		assert.ok(oModelValue.range.hasOwnProperty("start"), "'start' property should be part of range");
		assert.ok(oModelValue.range.hasOwnProperty("end"), "'end' property should be part of range");
		assert.ok(oModelValue.rangeOData.hasOwnProperty("start"), "'start' property should be part of rangeOData");
		assert.ok(oModelValue.rangeOData.hasOwnProperty("end"), "'end' property should be part of rangeOData");
	});

	QUnit.test("Dates in the value are in ISO format", function (assert) {
		// Arrange
		var oDate = new Date("1997-05-01T00:00:00.000Z");
		var aLocalDates = DynamicDateUtil.toDates({
			operator: "DATE",
			values: [oDate]
		});
		this.oDRF.setConfig({
			value: {
				option: "date",
				values: ["1997-05-01T00:00:00.000Z"]
			}
		});
		var oModelValue = this.oDRF.getValueForModel();

		// Assert
		assert.strictEqual(oModelValue.range.start, aLocalDates[0].getJSDate().toISOString(), "Range start should be in ISO format");
		assert.strictEqual(oModelValue.range.end, aLocalDates[1].getJSDate().toISOString(), "Range end should be in ISO format");
	});

	QUnit.test("Lower boundary of 'to' filter", function (assert) {
		// Arrange
		this.oDRF.setConfig({
			value: {
				option: "to",
				values: ["1997-05-01T00:00:00.000Z"]
			}
		});
		var oModelValue = this.oDRF.getValueForModel();

		// Assert
		assert.strictEqual(oModelValue.range.start, new Date(-8640000000000000).toISOString(), "Lower boundary should be correct");
		assert.strictEqual(oModelValue.rangeOData.start, new Date("1753-01-01").toISOString(), "Lower boundary of rangeOData should be correct");
	});

	QUnit.test("Upper boundary of 'from' filter", function (assert) {
		// Arrange
		this.oDRF.setConfig({
			value: {
				option: "from",
				values: ["1997-05-01T00:00:00.000Z"]
			}
		});
		var oModelValue = this.oDRF.getValueForModel();

		// Assert
		assert.strictEqual(oModelValue.range.end, new Date(8640000000000000).toISOString(), "Upper boundary should be correct");
		assert.strictEqual(oModelValue.rangeOData.end, new Date("9999-12-31").toISOString(), "Upper boundary of rangeOData should be correct");
	});

	QUnit.test("Value is updated when new value is entered", function (assert) {
		// Arrange
		this.oDRF.setConfig({});
		this.oDRF.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		var oOldValue = this.oDRF.getValue();

		// Act
		this.oDRF._getDdr().$("input-inner").val("Oct 7, 2021").trigger("input");
		QUnitUtils.triggerKeydown(this.oDRF._getDdr().getDomRef("input"), KeyCodes.ENTER);

		// Assert
		assert.notDeepEqual(this.oDRF.getValue(), oOldValue, "Value should be changed after new value is entered");
	});

	QUnit.test("Value state is updated when new value is entered", function (assert) {
		// Arrange
		this.oDRF.setConfig({});
		this.oDRF.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		this.oDRF._getDdr().$("input-inner").val("invalid value").trigger("input");
		QUnitUtils.triggerKeydown(this.oDRF._getDdr().getDomRef("input"), KeyCodes.ENTER);

		// Assert
		assert.strictEqual(this.oDRF._getDdr().getValueState(), coreLibrary.ValueState.Error, "Value  state should be updated");

		// Act
		this.oDRF._getDdr().$("input-inner").val("Oct 7, 2021").trigger("input");
		QUnitUtils.triggerKeydown(this.oDRF._getDdr().getDomRef("input"), KeyCodes.ENTER);

		// Assert
		assert.strictEqual(this.oDRF._getDdr().getValueState(), coreLibrary.ValueState.None, "Value  state should be updated");
	});

	QUnit.test("Value for model is in camel case", function (assert) {
		// Arrange
		this.oDRF.setConfig({
			value: {
				option: "lastDays",
				values: [2]
			}
		});
		var oModelValue = this.oDRF.getValueForModel();

		// Assert
		assert.strictEqual(oModelValue.value.option, "lastDays");
	});

	QUnit.module("DateRangeFilter Properties");

	QUnit.test("Label", function (assert) {
		// Arrange
		var oConfig = {
			label: "Some label"
		};
		var oDRF = new DateRangeFilter({
			config: oConfig
		});
		var oLabel = Core.byId(oDRF.getField().getAriaLabelledBy()[0]);

		// Assert
		assert.ok(oLabel.getDomRef(), "Hidden label is created and added");
		assert.strictEqual(oLabel.getText(), oConfig.label, "Hidden label is created and added");

		// Act up
		oDRF.destroy();

		assert.ok(oLabel.isDestroyed(), "Hidden label should be destroyed when the filter is destroyed");
	});

});
