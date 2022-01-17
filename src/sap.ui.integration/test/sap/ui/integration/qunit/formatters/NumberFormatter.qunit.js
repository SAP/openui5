/* global QUnit */
sap.ui.define([
	"sap/ui/integration/formatters/NumberFormatter"
],
function (
	NumberFormatter
) {
	"use strict";

	QUnit.module("NumberFormatter");

	QUnit.test("Currency formatter with options and locale", function (assert) {
		var oCurrencyResult = NumberFormatter.currency(50, "EUR", { "decimals":2 }, "en-US");
		assert.strictEqual(oCurrencyResult, "50.00 EUR", "currency is formatted correctly");
	});

	QUnit.test("Currency formatter with options only", function (assert) {
		var oCurrencyResult = NumberFormatter.currency(50, "EUR", { "decimals":2 });
		assert.strictEqual(oCurrencyResult, "50.00 EUR", "currency is formatted correctly");
	});

	QUnit.test("Currency formatter with locale only", function (assert) {
		var oCurrencyResult = NumberFormatter.currency(50, "EUR", 'en-US');
		assert.strictEqual(oCurrencyResult, "50.00 EUR", "currency is formatted correctly");
	});

	QUnit.test("Currency formatter no options no locale", function (assert) {
		var oCurrencyResult = NumberFormatter.currency(50, "EUR");
		assert.strictEqual(oCurrencyResult, "50.00 EUR", "currency is formatted correctly");
	});

	QUnit.test("Float formatter", function (assert) {
		var oCurrencyResult = NumberFormatter.float(1234.5678, { "decimals":2 });
		assert.strictEqual(oCurrencyResult, "1,234.57", "float is formatted correctly");
	});

	QUnit.test("Integer formatter", function (assert) {
		var oCurrencyResult = NumberFormatter.integer(1234.5678);
		assert.strictEqual(oCurrencyResult, "1234", "integer is formatted correctly");
	});

	QUnit.test("Percent formatter", function (assert) {
		var oCurrencyResult = NumberFormatter.percent(0.5);
		assert.strictEqual(oCurrencyResult, "50%", "percent is formatted correctly");
	});

	QUnit.test("Unit formatter", function (assert) {
		var oCurrencyResult = NumberFormatter.unit(12, "length-kilometer");
		assert.strictEqual(oCurrencyResult, "12 km", "unit is formatted correctly");
	});

});
