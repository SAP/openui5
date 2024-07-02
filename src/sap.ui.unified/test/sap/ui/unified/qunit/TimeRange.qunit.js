/*global QUnit*/
sap.ui.define([
	"sap/ui/unified/TimeRange"
], function(
	TimeRange
) {
	"use strict";

	QUnit.test("valueFormat support pattern 'B'", function (assert) {
		// Prepare
		const oTimeRange = new TimeRange({start: "01:16 at night", valueFormat: "hh:mm B"});
		const startHour = 1;
		const startMin = 16;

		// Assert
		assert.strictEqual(oTimeRange.getStartDate().getHours(), startHour, "The startTime hours is correct");
		assert.strictEqual(oTimeRange.getStartDate().getMinutes(), startMin, "The startTIme min is correct");
	});

	QUnit.test("valueFormat support AM/PM pattern", function(assert) {
		// Prepare
		const oTimeRange = new TimeRange({start: "10:01 PM", valueFormat: "HH:mm"});
		const startHour = 22;
		const startMin = 1;

		// Assert
		assert.strictEqual(oTimeRange.getStartDate().getHours(), startHour, "The startTime hours is correct");
		assert.strictEqual(oTimeRange.getStartDate().getMinutes(), startMin, "The startTIme min is correct");
	});
});
