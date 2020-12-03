/* global QUnit */
sap.ui.define([
	"sap/ui/integration/formatters/DateTimeFormatter"
],
function (
	DateTimeFormatter
) {
	"use strict";

	QUnit.module("DateTimeFormatter");

	QUnit.test("Format date should be dd MMM yy", function (assert) {
		var oDateResult = DateTimeFormatter.dateTime(new Date(1993, 11, 11), {format: "yMMMd"});
		assert.strictEqual(oDateResult, "Dec 11, 1993", "Date is formatted correctly");
	});

	QUnit.test("DateTime Formatter should be able to format JSON date format without minutes offset", function (assert) {
		var oDateResult = DateTimeFormatter.dateTime('/Date(0)/', {format: "yMMMd"});
		assert.strictEqual(oDateResult, "Jan 1, 1970", "Date is formatted correctly");
	});

	QUnit.test("DateTime Formatter should be able to format JSON date format with negative minutes offset", function (assert) {
		var oDateResult = DateTimeFormatter.dateTime('/Date(0-1440)/', {format: "yMMMd"});
		assert.strictEqual(oDateResult, "Jan 2, 1970", "Date is formatted correctly");
	});

	QUnit.test("DateTime Formatter should be able to format JSON date format with positive minutes offset", function (assert) {
		var oDateResult = DateTimeFormatter.dateTime('/Date(0+1440)/', {format: "yMMMd"});
		assert.strictEqual(oDateResult, "Dec 31, 1969", "Date is formatted correctly");
	});

});
