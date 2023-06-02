/* global QUnit */

sap.ui.define([
	"sap/ui/integration/util/Duration",
	"sap/base/Log",
	"sap/base/strings/formatMessage"
], function (
	Duration,
	Log,
	formatMessage
) {
	"use strict";

	QUnit.module("Duration - fromISO");

	QUnit.test("Valid ISO durations with time only", function (assert) {
		[
			["PT10H30M", "10:30"],
			["PT6H30M", "6:30"],
			["PT6H5M", "6:05"],
			["PT6H50M", "6:50"],
			["PT6H0M", "6:00"],
			["PT6H00M", "6:00"],
			["PT6H", "6:00"],
			["PT0H30M", "0:30"],
			["PT00H30M", "0:30"],
			["PT30M", "0:30"],
			["PT23H59M", "23:59"]
		].forEach(function (pair) {
			assert.strictEqual(Duration.fromISO(pair[0]), pair[1], "Value is properly converted");
		});
	});

	QUnit.test("Valid ISO durations with time out of range", function (assert) {
		var logStub = this.stub(Log, "error");

		[
			["PT25H", ""],
			["PT60M", ""],
			["PT25H60M", ""]
		].forEach(function (pair) {
			assert.strictEqual(Duration.fromISO(pair[0]), pair[1], "Value is properly converted");
			assert.ok(
				logStub.calledWith(formatMessage(Duration._MINUTES_OUT_OF_RANGE, pair[0])) || logStub.calledWith(formatMessage(Duration._HOURS_OUT_OF_RANGE, pair[0])),
				"Error is logged"
			);
			logStub.reset();
		});
	});

	QUnit.test("Valid but unsupported ISO durations with date only", function (assert) {
		var logStub = this.stub(Log, "error");

		[
			["P200Y", ""],
			["P3W", ""],
			["P0D", ""]
		].forEach(function (pair) {
			assert.strictEqual(Duration.fromISO(pair[0]), pair[1], "Value is properly converted");
			assert.ok(logStub.calledWith(formatMessage(Duration._UNSUPPORTED_DATE, pair[0])), "Error is logged");
			logStub.reset();
		});
	});

	QUnit.test("Valid but unsupported ISO durations with date and time", function (assert) {
		var logStub = this.stub(Log, "error");

		[
			["P200Y10M19DT10H30M", ""],
			["P3WT10H30M", ""]
		].forEach(function (pair) {
			assert.strictEqual(Duration.fromISO(pair[0]), pair[1], "Value is properly converted");
			assert.ok(logStub.calledWith(formatMessage(Duration._UNSUPPORTED_DATE, pair[0])), "Error is logged");
			logStub.reset();
		});
	});

	QUnit.test("Valid but unsupported ISO durations with seconds", function (assert) {
		var logStub = this.stub(Log, "error");

		[
			["PT50S", ""],
			["PT10H30M50S", ""]
		].forEach(function (pair) {
			assert.strictEqual(Duration.fromISO(pair[0]), pair[1], "Value is properly converted");
			assert.ok(logStub.calledWith(formatMessage(Duration._UNSUPPORTED_SECONDS, pair[0])), "Error is logged");
			logStub.reset();
		});
	});

	QUnit.test("Invalid ISO durations", function (assert) {
		var logStub = this.stub(Log, "error");

		[
			["P", ""],
			["PT", ""],
			["PT10H30", ""],
			["PTH", ""],
			["PTH30M", ""],
			["PTM", ""],
			["PTHM", ""],
			["P2YT", ""],
			["invalid duration", ""],
			["10H30M", ""],
			["T10H30M", ""],
			["P10H30M", ""]
		].forEach(function (pair) {
			assert.strictEqual(Duration.fromISO(pair[0]), pair[1], "Value is properly converted");
			assert.ok(logStub.calledWith(formatMessage(Duration._INVALID_DURATION, pair[0])), "Error is logged");
			logStub.reset();
		});
	});

	QUnit.module("Duration - toISO");

	QUnit.test("Duration given in HH:MM format to ISO format", function (assert) {
		assert.strictEqual(Duration.toISO("10:30"), "PT10H30M", "Value is properly converted");
		assert.strictEqual(Duration.toISO("0:30"), "PT30M", "Value is properly converted");
		assert.strictEqual(Duration.toISO("10:00"), "PT10H", "Value is properly converted");
		assert.strictEqual(Duration.toISO("0:00"), "PT0S", "Value is properly converted");
	});

});
