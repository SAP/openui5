/* global QUnit */
sap.ui.define([
	"sap/ui/core/date/UniversalDateUtils",
	"sap/ui/integration/cards/bindingFeatures/DateRange",
	"sap/base/Log"
],
function (
	UniversalDateUtils,
	DateRange,
	Log
) {
	"use strict";

	QUnit.module("Date Range");

	QUnit.test("Should log error if range is unknown", function (assert) {
		var fnLogStub = this.stub(Log, "error");

		DateRange.start("unknown");
		assert.ok(fnLogStub.calledOnce, "Error is logged for dateRange.start()");

		fnLogStub.reset();

		DateRange.end("unknown");
		assert.ok(fnLogStub.calledOnce, "Error is logged for dateRange.end()");
	});

	QUnit.test("Should get start date for last 5 years", function (assert) {
		var oStartDate = DateRange.start("lastYears", 5),
			oExpectedStartDate = UniversalDateUtils.ranges.lastYears(5)[0];

		assert.strictEqual(oStartDate.toString(), oExpectedStartDate.toString(), "Correct start date if range expects value");
	});

	QUnit.test("Should get start date for yesterday", function (assert) {
		var oStartDate = DateRange.start("yesterday"),
			oExpectedStartDate = UniversalDateUtils.ranges.yesterday()[0];

		assert.strictEqual(oStartDate.toString(), oExpectedStartDate.toString(), "Correct start date for yesterday");
	});

	QUnit.test("Should get end date for last 5 years", function (assert) {
		var oEndDate = DateRange.end("lastYears", 5),
			oExpectedEndDate = UniversalDateUtils.ranges.lastYears(5)[1];

		assert.strictEqual(oEndDate.toString(), oExpectedEndDate.toString(), "Correct end date if range expects value");
	});

	QUnit.test("Should get end date for yesterday", function (assert) {
		var oEndDate = DateRange.end("yesterday"),
			oExpectedEndDate = UniversalDateUtils.ranges.yesterday()[1];

		assert.strictEqual(oEndDate.toString(), oExpectedEndDate.toString(), "Correct end date for yesterday");
	});
});
