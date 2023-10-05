/* global QUnit */

sap.ui.define([
	"sap/m/DynamicDateRange",
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/integration/cards/filters/DateRangeFilter",
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/Element"
], function(
	DynamicDateRange,
	Core,
	coreLibrary,
	KeyCodes,
	DateRangeFilter,
	Card,
	QUnitUtils,
	UI5Date,
	Element
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
		var oDate = UI5Date.getInstance("1997-05-01T00:00:00.000Z");
		var aLocalDates = DynamicDateRange.toDates({
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
		assert.strictEqual(oModelValue.range.start, aLocalDates[0].toISOString(), "Range start should be in ISO format");
		assert.strictEqual(oModelValue.range.end, aLocalDates[1].toISOString(), "Range end should be in ISO format");

		assert.strictEqual(oModelValue.range.startLocalDate, "1997-05-01", "Range start local date should be correct and in short ISO 8601 date format");
		assert.strictEqual(oModelValue.range.endLocalDate, "1997-05-01", "Range end local date should be correct and in short ISO date format");
	});

	QUnit.test("Dates in the value are in ISO format", function (assert) {
		// Arrange
		var oDateStart = UI5Date.getInstance("1997-05-01T00:00:00.000Z"),
			oDateEnd = UI5Date.getInstance("2000-01-01T00:00:00.000Z"),
			aLocalDates = DynamicDateRange.toDates({
				operator: "DATERANGE",
				values: [oDateStart, oDateEnd]
			});
		this.oDRF.setConfig({
			value: {
				option: "dateRange",
				values: ["1997-05-01T00:00:00.000Z", "2000-01-01T00:00:00.000Z"]
			}
		});
		var oModelValue = this.oDRF.getValueForModel();

		// Assert
		assert.strictEqual(oModelValue.range.start, aLocalDates[0].toISOString(), "Range start should be in ISO format");
		assert.strictEqual(oModelValue.range.end, aLocalDates[1].toISOString(), "Range end should be in ISO format");

		assert.strictEqual(oModelValue.range.startLocalDate, "1997-05-01", "Range start local date should be correct and in short ISO 8601 date format");
		assert.strictEqual(oModelValue.range.endLocalDate, "2000-01-01", "Range end local date should be correct and in short ISO date format");
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
		assert.strictEqual(oModelValue.range.start, UI5Date.getInstance(-8640000000000000).toISOString(), "Lower boundary should be correct");
		assert.strictEqual(oModelValue.rangeOData.start, UI5Date.getInstance("1753-01-01").toISOString(), "Lower boundary of rangeOData should be correct");

		assert.strictEqual(oModelValue.range.startLocalDate, "-271821-04-20", "Lower boundary in short ISO 8601 date format should be correct");
		assert.strictEqual(oModelValue.rangeOData.startLocalDate, "1753-01-01", "Lower boundary of rangeOData in short ISO 8601 date format should be correct");
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
		assert.strictEqual(oModelValue.range.end, UI5Date.getInstance(8640000000000000).toISOString(), "Upper boundary should be correct");
		assert.strictEqual(oModelValue.rangeOData.end, UI5Date.getInstance("9999-12-31").toISOString(), "Upper boundary of rangeOData should be correct");

		assert.strictEqual(oModelValue.range.endLocalDate, "275760-09-13", "Upper boundary in short ISO 8601 date format should be correct");
		assert.strictEqual(oModelValue.rangeOData.endLocalDate, "9999-12-31", "Upper boundary of rangeOData in short ISO 8601 date format should be correct");
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

	QUnit.module("DateRangeFilter DateTime Options", {
		beforeEach: function () {
			this.oDRF = new DateRangeFilter();
		},
		afterEach: function () {
			this.oDRF.destroy();
		}
	});

	QUnit.test("DateTimeRange in the value is in ISO format", function (assert) {
		// Arrange
		var oDateStart = UI5Date.getInstance("2023-02-07T10:15:44.001Z");
		var oDateEnd = UI5Date.getInstance("2023-02-08T12:06:07.002Z");

		var aLocalDates = DynamicDateRange.toDates({
			operator: "DATETIMERANGE",
			values: [oDateStart,oDateEnd]
		});
		this.oDRF.setConfig({
			value: {
				option: "dateTimeRange",
				values: ["2023-02-07T10:15:44.001Z","2023-02-08T12:06:07.002Z"]
			},
			options: [
				"dateTimeRange"
			]
		});
		var oModelValue = this.oDRF.getValueForModel();

		// Assert
		assert.strictEqual(oModelValue.range.start, aLocalDates[0].toISOString(), "Range start should be in ISO format");
		assert.strictEqual(oModelValue.range.end, aLocalDates[1].toISOString(), "Range end should be in ISO format");
	});

	QUnit.test("fromDateTime in the value is in ISO format", function (assert) {
		// Arrange
		var oDateFrom = UI5Date.getInstance("2023-02-07T10:15:44.001Z");

		var aLocalDatesFrom = DynamicDateRange.toDates({
			operator: "FROMDATETIME",
			values: [oDateFrom]
		});
		this.oDRF.setConfig({
			value: {
				option: "fromDateTime",
				values: ["2023-02-07T10:15:44.001Z"]
			},
			options: [
				"fromDateTime"
			]
		});
		var oModelValue = this.oDRF.getValueForModel();

		// Assert
		assert.strictEqual(oModelValue.range.start, aLocalDatesFrom[0].toISOString(), "Range start should be in ISO format");
		assert.strictEqual(oModelValue.rangeOData.start, aLocalDatesFrom[0].toISOString(), "rangeOData start should be in ISO format");
	});

	QUnit.test("toDateTime in the value is in ISO format", function (assert) {
		// Arrange
		var oDateTo = UI5Date.getInstance("2023-02-08T12:06:07.002Z");

		var aLocalDatesTo = DynamicDateRange.toDates({
			operator: "TODATETIME",
			values: [oDateTo]
		});
		this.oDRF.setConfig({
			value: {
				option: "toDateTime",
				values: ["2023-02-08T12:06:07.002Z"]
			},
			options: [
				"toDateTime"
			]
		});
		var oModelValue = this.oDRF.getValueForModel();

		// Assert
		assert.strictEqual(oModelValue.range.end, aLocalDatesTo[0].toISOString(), "Range end should be in ISO format");
		assert.strictEqual(oModelValue.rangeOData.end, aLocalDatesTo[0].toISOString(), "rangeOData end should be in ISO format");
	});

	QUnit.test("Lower boundary of 'toDateTime' filter", function (assert) {
		// Arrange
		this.oDRF.setConfig({
			value: {
				option: "toDateTime",
				values: ["2023-02-08T14:20:09.002Z"]
			},
			options: [
				"toDateTime"
			]
		});
		var oModelValue = this.oDRF.getValueForModel();

		// Assert
		assert.strictEqual(oModelValue.range.start, UI5Date.getInstance(-8640000000000000).toISOString(), "Lower boundary should be correct");
		assert.strictEqual(oModelValue.rangeOData.start, UI5Date.getInstance("1753-01-01").toISOString(), "Lower boundary of rangeOData should be correct");
	});

	QUnit.test("Upper boundary of 'fromDateTime' filter", function (assert) {
		// Arrange
		this.oDRF.setConfig({
			value: {
				option: "fromDateTime",
				values: ["2023-02-07T10:35:14.021Z"]
			},
			options: [
				"fromDateTime"
			]
		});
		var oModelValue = this.oDRF.getValueForModel();

		// Assert
		assert.strictEqual(oModelValue.range.end, UI5Date.getInstance(8640000000000000).toISOString(), "Upper boundary should be correct");
		assert.strictEqual(oModelValue.rangeOData.end, UI5Date.getInstance("9999-12-31").toISOString(), "Upper boundary of rangeOData should be correct");
	});

	QUnit.test("DateTime value properties when config is set", function (assert) {
		// Arrange
		this.oDRF.setConfig({
			value: {
				option: "dateTime",
				values: ["2023-02-07T10:15:05.000Z"]
			},
			options: [
				"dateTime"
			]
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

	QUnit.test("Value is updated when new DateTime value is entered", function (assert) {
		// Arrange
		this.oDRF.setConfig({
			value: {
				option: "dateTime",
				values: ["2023-02-07T10:15:06.900Z"]
			},
			options: [
				"dateTime"
			]
		});
		this.oDRF.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
		var oOldValue = this.oDRF.getValue();

		// Act
		this.oDRF._getDdr().$("input-inner").val("Feb 8, 2023, 11:04:20 PM").trigger("input");
		QUnitUtils.triggerKeydown(this.oDRF._getDdr().getDomRef("input"), KeyCodes.ENTER);

		// Assert
		assert.notEqual(this.oDRF.getValue(), oOldValue, "Value should be changed after new value is entered");
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
		var oLabel = Element.registry.get(oDRF.getField().getAriaLabelledBy()[0]);

		// Assert
		assert.ok(oLabel.getDomRef(), "Hidden label is created and added");
		assert.strictEqual(oLabel.getText(), oConfig.label, "Hidden label is created and added");

		// Act up
		oDRF.destroy();

		assert.ok(oLabel.isDestroyed(), "Hidden label should be destroyed when the filter is destroyed");
	});

});
