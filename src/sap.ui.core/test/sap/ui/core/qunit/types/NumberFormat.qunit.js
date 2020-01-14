/*global QUnit */
sap.ui.define(["sap/ui/core/format/NumberFormat", "sap/ui/core/Locale", "sap/base/Log"], function (NumberFormat, Locale, Log) {
	"use strict";

	/*eslint no-floating-decimal:0 */

	var oDefaultInteger = NumberFormat.getIntegerInstance(),
		oDefaultFloat = NumberFormat.getFloatInstance(),
		oCustomInteger = NumberFormat.getIntegerInstance({
			maxIntegerDigits: 4,
			minIntegerDigits: 2,
			groupingEnabled: true,
			groupingSeparator: "."
		}),
		oCustomFloat = NumberFormat.getFloatInstance({
			maxIntegerDigits: 4,
			minIntegerDigits: 2,
			maxFractionDigits: 4,
			minFractionDigits: 2,
			groupingEnabled: false,
			groupingSeparator: ".",
			decimalSeparator: ","
		});

	QUnit.module("NumberFormat");

	QUnit.test("Constructor call leads to error", function(assert) {
		assert.throws(function() {
			new NumberFormat();
		},
		new Error(),
		"NumberFormat constructor is forbidden");
	});

	QUnit.test("integer default format", function (assert) {
		assert.equal(oDefaultInteger.format(1), "1", "1");
		assert.equal(oDefaultInteger.format(123), "123", "123");
		// Integer instance has TOWARDS_ZERO set as default rounding mode
		assert.equal(oDefaultInteger.format(123.23), "123", "123.23");
		assert.equal(oDefaultInteger.format(123.78), "123", "123.78");
		assert.equal(oDefaultInteger.format(-123.23), "-123", "-123.23");
		assert.equal(oDefaultInteger.format(-123.78), "-123", "-123.78");
		assert.equal(oDefaultInteger.format(1234), "1234", "1234");
		assert.equal(oDefaultInteger.format(12345), "12345", "12345");
		assert.equal(oDefaultInteger.format(-123), "-123", "-123");
	});

	QUnit.test("integer format for a specific locale", function (assert) {
		var oLocale = new Locale("de-DE");
		var oIntegerFormat = NumberFormat.getIntegerInstance(oLocale);
		assert.equal(oIntegerFormat.format(1), "1", "1");
		assert.equal(oIntegerFormat.format(123), "123", "123");
		assert.equal(oIntegerFormat.format(123.23), "123", "123.23");
		assert.equal(oIntegerFormat.format(1234), "1234", "1234");
		assert.equal(oIntegerFormat.format(12345), "12345", "12345");
		assert.equal(oIntegerFormat.format(-123), "-123", "-123");
	});

	QUnit.test("integer custom format", function (assert) {
		assert.equal(oCustomInteger.format(1), "01", "1");
		assert.equal(oCustomInteger.format(123), "123", "123");
		assert.equal(oCustomInteger.format(123.23), "123", "123.23");
		assert.equal(oCustomInteger.format(1234), "1.234", "1234");
		assert.equal(oCustomInteger.format(12345), "?.???", "12345");
		assert.equal(oCustomInteger.format(-123), "-123", "-123");
	});

	QUnit.test("integer short style", function (assert) {
		var oLocale = new Locale("de-DE");
		var oFormat = NumberFormat.getIntegerInstance({ style: "short" }, oLocale);

		assert.equal(oFormat.format(1), "1", "1 formatted");
		assert.equal(oFormat.format(12), "12", "12 formatted");
		assert.equal(oFormat.format(123), "123", "123 formatted");
		assert.equal(oFormat.format(999), "999", "999 formatted");
		assert.equal(oFormat.format(1234), "1234", "1234 formatted");
		assert.equal(oFormat.format(9999), "9999", "9999 formatted");
		assert.equal(oFormat.format(12345), "12345", "12345 formatted");
		assert.equal(oFormat.format(99999), "99999", "99999 formatted");
		assert.equal(oFormat.format(123456), "123456", "123456 formatted");
		assert.equal(oFormat.format(999999), "1\xa0Mio.", "999999 formatted");
		assert.equal(oFormat.format(1234567), "1,2\xa0Mio.", "1234567 formatted");
		assert.equal(oFormat.format(9999999), "10\xa0Mio.", "9999999 formatted");
		assert.equal(oFormat.format(12345678), "12\xa0Mio.", "12345678 formatted");
		assert.equal(oFormat.format(99999999), "100\xa0Mio.", "99999999 formatted");
		assert.equal(oFormat.format(123456789), "123\xa0Mio.", "123456789 formatted");
		assert.equal(oFormat.format(999999999), "1\xa0Mrd.", "999999999 formatted");
		assert.equal(oFormat.format(1234567890), "1,2\xa0Mrd.", "1234567890 formatted");
		assert.equal(oFormat.format(9999999999), "10\xa0Mrd.", "9999999999 formatted");
		assert.equal(oFormat.format(12345678901), "12\xa0Mrd.", "12345678901 formatted");
		assert.equal(oFormat.format(99999999999), "100\xa0Mrd.", "99999999999 formatted");
		assert.equal(oFormat.format(123456789012), "123\xa0Mrd.", "123456789012 formatted");
		assert.equal(oFormat.format(999999999999), "1\xa0Bio.", "999999999999 formatted");
		assert.equal(oFormat.format(1234567890123), "1,2\xa0Bio.", "1234567890123 formatted");
		assert.equal(oFormat.format(-1), "-1", "-1 formatted");
		assert.equal(oFormat.format(-12), "-12", "-12 formatted");
		assert.equal(oFormat.format(-123), "-123", "-123 formatted");
		assert.equal(oFormat.format(-999), "-999", "-999 formatted");
		assert.equal(oFormat.format(-1234), "-1234", "-1234 formatted");
		assert.equal(oFormat.format(-9999), "-9999", "-9999 formatted");
		assert.equal(oFormat.format(-12345), "-12345", "-12345 formatted");
		assert.equal(oFormat.format(-99999), "-99999", "-99999 formatted");
		assert.equal(oFormat.format(-123456), "-123456", "-123456 formatted");
		assert.equal(oFormat.format(-999999), "-1\xa0Mio.", "-999999 formatted");
		assert.equal(oFormat.format(-1234567), "-1,2\xa0Mio.", "-1234567 formatted");
		assert.equal(oFormat.format(-9999999), "-10\xa0Mio.", "-9999999 formatted");
		assert.equal(oFormat.format(-12345678), "-12\xa0Mio.", "-12345678 formatted");
		assert.equal(oFormat.format(-99999999), "-100\xa0Mio.", "-99999999 formatted");
		assert.equal(oFormat.format(-123456789), "-123\xa0Mio.", "-123456789 formatted");
		assert.equal(oFormat.format(-999999999), "-1\xa0Mrd.", "-999999999 formatted");
		assert.equal(oFormat.format(-1234567890), "-1,2\xa0Mrd.", "-1234567890 formatted");
		assert.equal(oFormat.format(-9999999999), "-10\xa0Mrd.", "-9999999999 formatted");
		assert.equal(oFormat.format(-12345678901), "-12\xa0Mrd.", "-12345678901 formatted");
		assert.equal(oFormat.format(-99999999999), "-100\xa0Mrd.", "-99999999999 formatted");
		assert.equal(oFormat.format(-123456789012), "-123\xa0Mrd.", "-123456789012 formatted");
		assert.equal(oFormat.format(-999999999999), "-1\xa0Bio.", "-999999999999 formatted");
		assert.equal(oFormat.format(-1234567890123), "-1,2\xa0Bio.", "-1234567890123 formatted");

		assert.equal(oFormat.parse("1"), 1, "\"1\" parsed");
		assert.equal(oFormat.parse("12"), 12, "\"12\" parsed");
		assert.equal(oFormat.parse("123"), 123, "\"123\" parsed");
		assert.equal(oFormat.parse("1230"), 1230, "\"1230\" parsed");
		assert.equal(oFormat.parse("1 Mio."), 1000000, "\"1 Mio.\" parsed");
		assert.equal(oFormat.parse("10 Mio."), 10000000, "\"10 Mio.\" parsed");
		assert.equal(oFormat.parse("100 Mio."), 100000000, "\"100 Mio.\" parsed");
		assert.equal(oFormat.parse("1 Mrd."), 1000000000, "\"1 Mrd.\" parsed");
		assert.equal(oFormat.parse("10 Mrd."), 10000000000, "\"10 Mrd.\" parsed");
		assert.equal(oFormat.parse("100 Mrd."), 100000000000, "\"100 Mrd.\" parsed");
		assert.equal(oFormat.parse("1 Bio."), 1000000000000, "\"1 Bio.\" parsed");
		assert.equal(oFormat.parse("-1"), -1, "\"-1\" parsed");
		assert.equal(oFormat.parse("-12"), -12, "\"-12\" parsed");
		assert.equal(oFormat.parse("-123"), -123, "\"-123\" parsed");
		assert.equal(oFormat.parse("-1230"), -1230, "\"-1230\" parsed");
		assert.equal(oFormat.parse("-1 Mio."), -1000000, "\"-1 Mio.\" parsed");
		assert.equal(oFormat.parse("-10 Mio."), -10000000, "\"-10 Mio.\" parsed");
		assert.equal(oFormat.parse("-100 Mio."), -100000000, "\"-100 Mio.\" parsed");
		assert.equal(oFormat.parse("-1 Mrd."), -1000000000, "\"-1 Mrd.\" parsed");
		assert.equal(oFormat.parse("-10 Mrd."), -10000000000, "\"-10 Mrd.\" parsed");
		assert.equal(oFormat.parse("-100 Mrd."), -100000000000, "\"-100 Mrd.\" parsed");
		assert.equal(oFormat.parse("-1 Bio."), -1000000000000, "\"-1 Bio.\" parsed");

		oFormat = NumberFormat.getIntegerInstance({ style: "short", shortLimit: 10000, precision: 3 }, oLocale);

		assert.equal(oFormat.format(1), "1", "1 formatted");
		assert.equal(oFormat.format(12), "12", "12 formatted");
		assert.equal(oFormat.format(123), "123", "123 formatted");
		assert.equal(oFormat.format(999), "999", "999 formatted");
		assert.equal(oFormat.format(1234), "1234", "1234 formatted");
		assert.equal(oFormat.format(9999), "9999", "9999 formatted");
		assert.equal(oFormat.format(12345), "12345", "12345 formatted");
		assert.equal(oFormat.format(99900), "99900", "99900 formatted");
		assert.equal(oFormat.format(99990), "99990", "99990 formatted");
		assert.equal(oFormat.format(99999), "99999", "99999 formatted");
		assert.equal(oFormat.format(123456), "123456", "123456 formatted");
		assert.equal(oFormat.format(999000), "999000", "999000 formatted");
		assert.equal(oFormat.format(999900), "1\xa0Mio.", "999900 formatted");
		assert.equal(oFormat.format(999999), "1\xa0Mio.", "999999 formatted");
		assert.equal(oFormat.format(1234567), "1,23\xa0Mio.", "1234567 formatted");
		assert.equal(oFormat.format(9990000), "9,99\xa0Mio.", "9990000 formatted");
		assert.equal(oFormat.format(9999000), "10\xa0Mio.", "9999000 formatted");
		assert.equal(oFormat.format(9999999), "10\xa0Mio.", "9999999 formatted");
		assert.equal(oFormat.format(12345678), "12,3\xa0Mio.", "12345678 formatted");
		assert.equal(oFormat.format(99900000), "99,9\xa0Mio.", "99900000 formatted");
		assert.equal(oFormat.format(99990000), "100\xa0Mio.", "99990000 formatted");
		assert.equal(oFormat.format(99999999), "100\xa0Mio.", "99999999 formatted");
		assert.equal(oFormat.format(123456789), "123\xa0Mio.", "123456789 formatted");
		assert.equal(oFormat.format(999000000), "999\xa0Mio.", "999000000 formatted");
		assert.equal(oFormat.format(999900000), "1\xa0Mrd.", "999900000 formatted");
		assert.equal(oFormat.format(999999999), "1\xa0Mrd.", "999999999 formatted");
		assert.equal(oFormat.format(1234567890), "1,23\xa0Mrd.", "1234567890 formatted");
		assert.equal(oFormat.format(9990000000), "9,99\xa0Mrd.", "9990000000 formatted");
		assert.equal(oFormat.format(9999999999), "10\xa0Mrd.", "9999999999 formatted");
		assert.equal(oFormat.format(12345678901), "12,3\xa0Mrd.", "12345678901 formatted");
		assert.equal(oFormat.format(99900000000), "99,9\xa0Mrd.", "99900000000 formatted");
		assert.equal(oFormat.format(99999999999), "100\xa0Mrd.", "99999999999 formatted");
		assert.equal(oFormat.format(123456789012), "123\xa0Mrd.", "123456789012 formatted");
		assert.equal(oFormat.format(999000000000), "999\xa0Mrd.", "999000000000 formatted");
		assert.equal(oFormat.format(999999999999), "1\xa0Bio.", "999999999999 formatted");
		assert.equal(oFormat.format(1234567890123), "1,23\xa0Bio.", "1234567890123 formatted");
		assert.equal(oFormat.format(-1), "-1", "-1 formatted");
		assert.equal(oFormat.format(-12), "-12", "-12 formatted");
		assert.equal(oFormat.format(-123), "-123", "-123 formatted");
		assert.equal(oFormat.format(-999), "-999", "-999 formatted");
		assert.equal(oFormat.format(-1234), "-1234", "-1234 formatted");
		assert.equal(oFormat.format(-9999), "-9999", "-9999 formatted");
		assert.equal(oFormat.format(-12345), "-12345", "-12345 formatted");
		assert.equal(oFormat.format(-99900), "-99900", "-99900 formatted");
		assert.equal(oFormat.format(-99990), "-99990", "-99990 formatted");
		assert.equal(oFormat.format(-99999), "-99999", "-99999 formatted");
		assert.equal(oFormat.format(-123456), "-123456", "-123456 formatted");
		assert.equal(oFormat.format(-999000), "-999000", "-999000 formatted");
		assert.equal(oFormat.format(-999900), "-1\xa0Mio.", "-999900 formatted");
		assert.equal(oFormat.format(-999999), "-1\xa0Mio.", "-999999 formatted");
	});

	QUnit.test("integer short style under locale zh_CN", function (assert) {
		// The pattern for 1000-other in locale zh_CN is defined as "0" without any scale which means a number with 4 digits
		// shouldn't be formatted using the short style.
		// But when a formatted string without any scale is parsed under locale zh_CN, this pattern is always selected which
		// always results with a number multiplied by 1000. This is fixed by ignoring the pattern which doesn't have a scale
		// when parsing a formatted number.
		var oLocale = new Locale("zh_CN"),
			oFormat = NumberFormat.getIntegerInstance({
				style: "short"
			}, oLocale);

		assert.equal(oFormat.parse("1"), 1, "'1' is parsed as 1");
		assert.equal(oFormat.parse("9999"), 9999, "'9999' is parsed as 9999");
		assert.equal(oFormat.parse("1万"), 10000, "'1万' is parsed as 10000");
	});

	QUnit.test("short style with 'shortRefNumber' set", function (assert) {
		var oLocale = new Locale("de-DE");
		var oFormat = NumberFormat.getIntegerInstance({
			style: "short",
			shortRefNumber: 999999
		}, oLocale);

		assert.equal(oFormat.format(1), "0,000001\xa0Mio.", "1 formatted");
		assert.equal(oFormat.format(12), "0,000012\xa0Mio.", "12 formatted");
		assert.equal(oFormat.format(123), "0,00012\xa0Mio.", "123 formatted");
		assert.equal(oFormat.format(999), "0,001\xa0Mio.", "999 formatted");
		assert.equal(oFormat.format(1234), "0,0012\xa0Mio.", "1234 formatted");
		assert.equal(oFormat.format(9999), "0,01\xa0Mio.", "9999 formatted");
		assert.equal(oFormat.format(12345), "0,012\xa0Mio.", "12345 formatted");
		assert.equal(oFormat.format(99900), "0,1\xa0Mio.", "99900 formatted");
		assert.equal(oFormat.format(99990), "0,1\xa0Mio.", "99990 formatted");
		assert.equal(oFormat.format(99999), "0,1\xa0Mio.", "99999 formatted");
		assert.equal(oFormat.format(123456), "0,12\xa0Mio.", "123456 formatted");
		assert.equal(oFormat.format(999000), "1\xa0Mio.", "999000 formatted");
		assert.equal(oFormat.format(999900), "1\xa0Mio.", "999900 formatted");
		assert.equal(oFormat.format(999999), "1\xa0Mio.", "999999 formatted");
		assert.equal(oFormat.format(1234567), "1,2\xa0Mio.", "1234567 formatted");
		assert.equal(oFormat.format(9990000), "10\xa0Mio.", "9990000 formatted");
		assert.equal(oFormat.format(9999000), "10\xa0Mio.", "9999000 formatted");
		assert.equal(oFormat.format(9999999), "10\xa0Mio.", "9999999 formatted");
		assert.equal(oFormat.format(12345678), "12\xa0Mio.", "12345678 formatted");
		assert.equal(oFormat.format(99900000), "100\xa0Mio.", "99900000 formatted");
		assert.equal(oFormat.format(99990000), "100\xa0Mio.", "99990000 formatted");
		assert.equal(oFormat.format(99999999), "100\xa0Mio.", "99999999 formatted");
		assert.equal(oFormat.format(123456789), "123\xa0Mio.", "123456789 formatted");
		assert.equal(oFormat.format(999000000), "999\xa0Mio.", "999000000 formatted");
		assert.equal(oFormat.format(999900000), "1000\xa0Mio.", "999900000 formatted");
		assert.equal(oFormat.format(999999999), "1000\xa0Mio.", "999999999 formatted");
		assert.equal(oFormat.format(1234567890), "1235\xa0Mio.", "1234567890 formatted");
		assert.equal(oFormat.format(9990000000), "9990\xa0Mio.", "9990000000 formatted");
		assert.equal(oFormat.format(9999999999), "10000\xa0Mio.", "9999999999 formatted");
		assert.equal(oFormat.format(12345678901), "12346\xa0Mio.", "12345678901 formatted");
		assert.equal(oFormat.format(99900000000), "99900\xa0Mio.", "99900000000 formatted");
		assert.equal(oFormat.format(99999999999), "100000\xa0Mio.", "99999999999 formatted");
		assert.equal(oFormat.format(123456789012), "123457\xa0Mio.", "123456789012 formatted");
		assert.equal(oFormat.format(999000000000), "999000\xa0Mio.", "999000000000 formatted");
		assert.equal(oFormat.format(999999999999), "1000000\xa0Mio.", "999999999999 formatted");
		assert.equal(oFormat.format(1234567890123), "1234568\xa0Mio.", "1234567890123 formatted");
		assert.equal(oFormat.format(-1), "-0,000001\xa0Mio.", "-1 formatted");
		assert.equal(oFormat.format(-12), "-0,000012\xa0Mio.", "-12 formatted");
		assert.equal(oFormat.format(-123), "-0,00012\xa0Mio.", "-123 formatted");
		assert.equal(oFormat.format(-999), "-0,001\xa0Mio.", "-999 formatted");
		assert.equal(oFormat.format(-1234), "-0,0012\xa0Mio.", "-1234 formatted");
		assert.equal(oFormat.format(-9999), "-0,01\xa0Mio.", "-9999 formatted");
		assert.equal(oFormat.format(-12345), "-0,012\xa0Mio.", "-12345 formatted");
		assert.equal(oFormat.format(-99900), "-0,1\xa0Mio.", "-99900 formatted");
		assert.equal(oFormat.format(-99990), "-0,1\xa0Mio.", "-99990 formatted");
		assert.equal(oFormat.format(-99999), "-0,1\xa0Mio.", "-99999 formatted");
		assert.equal(oFormat.format(-123456), "-0,12\xa0Mio.", "-123456 formatted");
		assert.equal(oFormat.format(-999000), "-1\xa0Mio.", "-999000 formatted");
		assert.equal(oFormat.format(-999900), "-1\xa0Mio.", "-999900 formatted");
		assert.equal(oFormat.format(-999999), "-1\xa0Mio.", "-999999 formatted");

		oFormat = NumberFormat.getFloatInstance({
			style: "short",
			shortRefNumber: 1000000,
			maxFractionDigits: 2
		}, oLocale);

		assert.equal(oFormat.format(1), "0\xa0Mio.", "1 formatted");
		assert.equal(oFormat.format(12), "0\xa0Mio.", "12 formatted");
		assert.equal(oFormat.format(123), "0\xa0Mio.", "123 formatted");
		assert.equal(oFormat.format(999), "0\xa0Mio.", "999 formatted");
		assert.equal(oFormat.format(1234), "0\xa0Mio.", "1234 formatted");
		assert.equal(oFormat.format(9999), "0,01\xa0Mio.", "9999 formatted");
		assert.equal(oFormat.format(12345), "0,01\xa0Mio.", "12345 formatted");
		assert.equal(oFormat.format(99900), "0,1\xa0Mio.", "99900 formatted");
		assert.equal(oFormat.format(99990), "0,1\xa0Mio.", "99990 formatted");
		assert.equal(oFormat.format(99999), "0,1\xa0Mio.", "99999 formatted");
		assert.equal(oFormat.format(123456), "0,12\xa0Mio.", "123456 formatted");
		assert.equal(oFormat.format(999000), "1\xa0Mio.", "999000 formatted");
		assert.equal(oFormat.format(999900), "1\xa0Mio.", "999900 formatted");
		assert.equal(oFormat.format(999999), "1\xa0Mio.", "999999 formatted");
		assert.equal(oFormat.format(1234567), "1,23\xa0Mio.", "1234567 formatted");
		assert.equal(oFormat.format(9990000), "9,99\xa0Mio.", "9990000 formatted");
		assert.equal(oFormat.format(9999000), "10\xa0Mio.", "9999000 formatted");
		assert.equal(oFormat.format(9999999), "10\xa0Mio.", "9999999 formatted");
		assert.equal(oFormat.format(12345678), "12,35\xa0Mio.", "12345678 formatted");
		assert.equal(oFormat.format(99900000), "99,9\xa0Mio.", "99900000 formatted");
		assert.equal(oFormat.format(99990000), "99,99\xa0Mio.", "99990000 formatted");
		assert.equal(oFormat.format(99999999), "100\xa0Mio.", "99999999 formatted");
		assert.equal(oFormat.format(123456789), "123,46\xa0Mio.", "123456789 formatted");
		assert.equal(oFormat.format(999000000), "999\xa0Mio.", "999000000 formatted");
		assert.equal(oFormat.format(999900000), "999,9\xa0Mio.", "999900000 formatted");
		assert.equal(oFormat.format(999999999), "1.000\xa0Mio.", "999999999 formatted");
		assert.equal(oFormat.format(1234567890), "1.234,57\xa0Mio.", "1234567890 formatted");
		assert.equal(oFormat.format(9990000000), "9.990\xa0Mio.", "9990000000 formatted");
		assert.equal(oFormat.format(9999999999), "10.000\xa0Mio.", "9999999999 formatted");
		assert.equal(oFormat.format(12345678901), "12.345,68\xa0Mio.", "12345678901 formatted");
		assert.equal(oFormat.format(99900000000), "99.900\xa0Mio.", "99900000000 formatted");
		assert.equal(oFormat.format(99999999999), "100.000\xa0Mio.", "99999999999 formatted");
		assert.equal(oFormat.format(123456789012), "123.456,79\xa0Mio.", "123456789012 formatted");
		assert.equal(oFormat.format(999000000000), "999.000\xa0Mio.", "999000000000 formatted");
		assert.equal(oFormat.format(999999999999), "1.000.000\xa0Mio.", "999999999999 formatted");
		assert.equal(oFormat.format(1234567890123), "1.234.567,89\xa0Mio.", "1234567890123 formatted");
		assert.equal(oFormat.format(-1), "0\xa0Mio.", "-1 formatted");
		assert.equal(oFormat.format(-12), "0\xa0Mio.", "-12 formatted");
		assert.equal(oFormat.format(-123), "0\xa0Mio.", "-123 formatted");
		assert.equal(oFormat.format(-999), "0\xa0Mio.", "-999 formatted");
		assert.equal(oFormat.format(-1234), "0\xa0Mio.", "-1234 formatted");
		assert.equal(oFormat.format(-9999), "-0,01\xa0Mio.", "-9999 formatted");
		assert.equal(oFormat.format(-12345), "-0,01\xa0Mio.", "-12345 formatted");
		assert.equal(oFormat.format(-99900), "-0,1\xa0Mio.", "-99900 formatted");
		assert.equal(oFormat.format(-99990), "-0,1\xa0Mio.", "-99990 formatted");
		assert.equal(oFormat.format(-99999), "-0,1\xa0Mio.", "-99999 formatted");
		assert.equal(oFormat.format(-123456), "-0,12\xa0Mio.", "-123456 formatted");
		assert.equal(oFormat.format(-990000), "-0,99\xa0Mio.", "-999000 formatted");
		assert.equal(oFormat.format(-999900), "-1\xa0Mio.", "-999900 formatted");
		assert.equal(oFormat.format(-999999), "-1\xa0Mio.", "-999999 formatted");

		oFormat = NumberFormat.getFloatInstance({
			style: "short",
			shortRefNumber: 10000000,
			maxFractionDigits: 2
		}, new Locale("zh_CN"));

		assert.equal(oFormat.format(1), "0万", "1 formatted");
		assert.equal(oFormat.format(12), "0万", "12 formatted");
		assert.equal(oFormat.format(123), "0.01万", "123 formatted");
		assert.equal(oFormat.format(999), "0.1万", "999 formatted");
		assert.equal(oFormat.format(1234), "0.12万", "1234 formatted");
		assert.equal(oFormat.format(9999), "1万", "9999 formatted");
		assert.equal(oFormat.format(12345), "1.23万", "12345 formatted");
		assert.equal(oFormat.format(99900), "9.99万", "99900 formatted");
		assert.equal(oFormat.format(99990), "10万", "99990 formatted");
		assert.equal(oFormat.format(99999), "10万", "99999 formatted");
		assert.equal(oFormat.format(123456), "12.35万", "123456 formatted");
		assert.equal(oFormat.format(999000), "99.9万", "999000 formatted");
		assert.equal(oFormat.format(999900), "99.99万", "999900 formatted");
		assert.equal(oFormat.format(999999), "100万", "999999 formatted");
		assert.equal(oFormat.format(1234567), "123.46万", "1234567 formatted");
		assert.equal(oFormat.format(9990000), "999万", "9990000 formatted");
		assert.equal(oFormat.format(9999000), "999.9万", "9999000 formatted");
		assert.equal(oFormat.format(9999999), "1,000万", "9999999 formatted");
		assert.equal(oFormat.format(12345678), "1,234.57万", "12345678 formatted");
		assert.equal(oFormat.format(99900000), "9,990万", "99900000 formatted");
		assert.equal(oFormat.format(99990000), "9,999万", "99990000 formatted");
		assert.equal(oFormat.format(99999999), "10,000万", "99999999 formatted");
		assert.equal(oFormat.format(123456789), "12,345.68万", "123456789 formatted");
		assert.equal(oFormat.format(999000000), "99,900万", "999000000 formatted");
		assert.equal(oFormat.format(999900000), "99,990万", "999900000 formatted");
		assert.equal(oFormat.format(999999999), "100,000万", "999999999 formatted");
		assert.equal(oFormat.format(1234567890), "123,456.79万", "1234567890 formatted");
		assert.equal(oFormat.format(9990000000), "999,000万", "9990000000 formatted");
		assert.equal(oFormat.format(9999999999), "1,000,000万", "9999999999 formatted");
		assert.equal(oFormat.format(12345678901), "1,234,567.89万", "12345678901 formatted");
		assert.equal(oFormat.format(99900000000), "9,990,000万", "99900000000 formatted");
		assert.equal(oFormat.format(99999999999), "10,000,000万", "99999999999 formatted");
		assert.equal(oFormat.format(123456789012), "12,345,678.9万", "123456789012 formatted");
		assert.equal(oFormat.format(999000000000), "99,900,000万", "999000000000 formatted");
		assert.equal(oFormat.format(999999999999), "100,000,000万", "999999999999 formatted");
		assert.equal(oFormat.format(1234567890123), "123,456,789.01万", "1234567890123 formatted");
		assert.equal(oFormat.format(-1), "0万", "-1 formatted");
		assert.equal(oFormat.format(-12), "0万", "-12 formatted");
		assert.equal(oFormat.format(-123), "-0.01万", "-123 formatted");
		assert.equal(oFormat.format(-999), "-0.1万", "-999 formatted");
		assert.equal(oFormat.format(-1234), "-0.12万", "-1234 formatted");
		assert.equal(oFormat.format(-9999), "-1万", "-9999 formatted");
		assert.equal(oFormat.format(-12345), "-1.23万", "-12345 formatted");
		assert.equal(oFormat.format(-99900), "-9.99万", "-99900 formatted");
		assert.equal(oFormat.format(-99990), "-10万", "-99990 formatted");
		assert.equal(oFormat.format(-99999), "-10万", "-99999 formatted");
		assert.equal(oFormat.format(-123456), "-12.35万", "-123456 formatted");
		assert.equal(oFormat.format(-990000), "-99万", "-999000 formatted");
		assert.equal(oFormat.format(-999900), "-99.99万", "-999900 formatted");
		assert.equal(oFormat.format(-999999), "-100万", "-999999 formatted");
	});

	QUnit.test("integer long style", function (assert) {
		var oLocale = new Locale("de-DE");
		var oFormat = NumberFormat.getIntegerInstance({ style: "long" }, oLocale);

		assert.equal(oFormat.format(1), "1", "1 formatted");
		assert.equal(oFormat.format(12), "12", "12 formatted");
		assert.equal(oFormat.format(123), "123", "123 formatted");
		assert.equal(oFormat.format(999), "1 Tausend", "999 formatted");
		assert.equal(oFormat.format(1234), "1,2 Tausend", "1234 formatted");
		assert.equal(oFormat.format(9999), "10 Tausend", "9999 formatted");
		assert.equal(oFormat.format(12345), "12 Tausend", "12345 formatted");
		assert.equal(oFormat.format(99999), "100 Tausend", "99999 formatted");
		assert.equal(oFormat.format(123456), "123 Tausend", "123456 formatted");
		assert.equal(oFormat.format(999999), "1 Million", "999999 formatted");
		assert.equal(oFormat.format(1234567), "1,2 Millionen", "1234567 formatted");
		assert.equal(oFormat.format(9999999), "10 Millionen", "9999999 formatted");
		assert.equal(oFormat.format(12345678), "12 Millionen", "12345678 formatted");
		assert.equal(oFormat.format(99999999), "100 Millionen", "99999999 formatted");
		assert.equal(oFormat.format(123456789), "123 Millionen", "123456789 formatted");
		assert.equal(oFormat.format(999999999), "1 Milliarde", "999999999 formatted");
		assert.equal(oFormat.format(1234567890), "1,2 Milliarden", "1234567890 formatted");
		assert.equal(oFormat.format(9999999999), "10 Milliarden", "9999999999 formatted");
		assert.equal(oFormat.format(12345678901), "12 Milliarden", "12345678901 formatted");
		assert.equal(oFormat.format(99999999999), "100 Milliarden", "99999999999 formatted");
		assert.equal(oFormat.format(123456789012), "123 Milliarden", "123456789012 formatted");
		assert.equal(oFormat.format(999999999999), "1 Billion", "999999999999 formatted");
		assert.equal(oFormat.format(1234567890123), "1,2 Billionen", "1234567890123 formatted");

		oFormat = NumberFormat.getIntegerInstance({ style: "long", precision: 3, shortLimit: 100000 }, oLocale);

		assert.equal(oFormat.format(1), "1", "1 formatted");
		assert.equal(oFormat.format(12), "12", "12 formatted");
		assert.equal(oFormat.format(123), "123", "123 formatted");
		assert.equal(oFormat.format(999), "999", "999 formatted");
		assert.equal(oFormat.format(1234), "1234", "1234 formatted");
		assert.equal(oFormat.format(9999), "9999", "9999 formatted");
		assert.equal(oFormat.format(12345), "12345", "12345 formatted");
		assert.equal(oFormat.format(99999), "99999", "99999 formatted");
		assert.equal(oFormat.format(123456), "123 Tausend", "123456 formatted");
		assert.equal(oFormat.format(999999), "1 Million", "999999 formatted");
		assert.equal(oFormat.format(1234567), "1,23 Millionen", "1234567 formatted");
		assert.equal(oFormat.format(9999999), "10 Millionen", "9999999 formatted");
		assert.equal(oFormat.format(12345678), "12,3 Millionen", "12345678 formatted");
		assert.equal(oFormat.format(99999999), "100 Millionen", "99999999 formatted");
		assert.equal(oFormat.format(123456789), "123 Millionen", "123456789 formatted");
		assert.equal(oFormat.format(999999999), "1 Milliarde", "999999999 formatted");
		assert.equal(oFormat.format(1234567890), "1,23 Milliarden", "1234567890 formatted");
		assert.equal(oFormat.format(9999999999), "10 Milliarden", "9999999999 formatted");
		assert.equal(oFormat.format(12345678901), "12,3 Milliarden", "12345678901 formatted");
		assert.equal(oFormat.format(99999999999), "100 Milliarden", "99999999999 formatted");
		assert.equal(oFormat.format(123456789012), "123 Milliarden", "123456789012 formatted");
		assert.equal(oFormat.format(999999999999), "1 Billion", "999999999999 formatted");
		assert.equal(oFormat.format(1234567890123), "1,23 Billionen", "1234567890123 formatted");
		assert.equal(oFormat.format(-1), "-1", "-1 formatted");
		assert.equal(oFormat.format(-12), "-12", "-12 formatted");
		assert.equal(oFormat.format(-123), "-123", "-123 formatted");
		assert.equal(oFormat.format(-999), "-999", "-999 formatted");
		assert.equal(oFormat.format(-1234), "-1234", "-1234 formatted");
		assert.equal(oFormat.format(-9999), "-9999", "-9999 formatted");
		assert.equal(oFormat.format(-12345), "-12345", "-12345 formatted");
		assert.equal(oFormat.format(-99999), "-99999", "-99999 formatted");
		assert.equal(oFormat.format(-123456), "-123 Tausend", "-123456 formatted");
		assert.equal(oFormat.format(-999999), "-1 Million", "-999999 formatted");
		assert.equal(oFormat.format(-1234567), "-1,23 Millionen", "-1234567 formatted");

		oLocale = new Locale("ar-SA");
		oFormat = NumberFormat.getIntegerInstance({ style: "long", shortRefNumber: 1000000 }, oLocale);
		assert.equal(oFormat.format(0), "0 مليون", "0 formatted");
		assert.equal(oFormat.format(1000000), "1 مليون", "1000000 formatted");
		assert.equal(oFormat.format(2000000), "2 مليون", "2000000 formatted");
		assert.equal(oFormat.format(3000000), "3 ملايين", "3000000 formatted");
		assert.equal(oFormat.format(11000000), "11 مليون", "11000000 formatted");
		assert.equal(oFormat.format(50000000), "50 مليون", "50000000 formatted");

	});

	QUnit.test("getScale", function (assert) {
		var aLocales = ["de-DE", "zh_CN"];

		var aScales = [
			[undefined, undefined, undefined, undefined, undefined, undefined, "Mio.", "Mio.", "Mio.", "Mrd.", "Mrd.", "Mrd.", "Bio.", "Bio.", "Bio."],
			[undefined, undefined, undefined, undefined, "万", "万", "万", "万", "亿", "亿", "亿", "亿", "兆", "兆", "兆"]
		];

		aLocales.forEach(function (sLocale, index) {
			var aScaleInLocale = aScales[index];
			aScaleInLocale.forEach(function (sScale, index1) {
				var iNumber = Math.pow(10, index1),
					oFormat = NumberFormat.getFloatInstance({
						style: "short",
						shortRefNumber: iNumber
					}, new Locale(sLocale));

				assert.equal(oFormat.getScale(), sScale, "The scaling factor in Locale " + sLocale + " for " + iNumber + ": " + sScale);
			});
		});
	});

	QUnit.test("short style with 'showScale' set to false", function (assert) {
		var oLocale = new Locale("de-DE");

		var oFormat = NumberFormat.getFloatInstance({
			style: "short",
			shortRefNumber: 100000000,
			maxFractionDigits: 2,
			showScale: false
		}, oLocale);

		assert.equal(oFormat.getScale(), "Mio.", "Scale is 'Mio.'");

		assert.equal(oFormat.format(1), "0", "1 formatted");
		assert.equal(oFormat.format(12), "0", "12 formatted");
		assert.equal(oFormat.format(123), "0", "123 formatted");
		assert.equal(oFormat.format(999), "0", "999 formatted");
		assert.equal(oFormat.format(1234), "0", "1234 formatted");
		assert.equal(oFormat.format(9999), "0,01", "9999 formatted");
		assert.equal(oFormat.format(12345), "0,01", "12345 formatted");
		assert.equal(oFormat.format(99900), "0,1", "99900 formatted");
		assert.equal(oFormat.format(99990), "0,1", "99990 formatted");
		assert.equal(oFormat.format(99999), "0,1", "99999 formatted");
		assert.equal(oFormat.format(123456), "0,12", "123456 formatted");
		assert.equal(oFormat.format(999000), "1", "999000 formatted");
		assert.equal(oFormat.format(999900), "1", "999900 formatted");
		assert.equal(oFormat.format(999999), "1", "999999 formatted");
		assert.equal(oFormat.format(1234567), "1,23", "1234567 formatted");
		assert.equal(oFormat.format(9990000), "9,99", "9990000 formatted");
		assert.equal(oFormat.format(9999000), "10", "9999000 formatted");
		assert.equal(oFormat.format(9999999), "10", "9999999 formatted");
		assert.equal(oFormat.format(12345678), "12,35", "12345678 formatted");
		assert.equal(oFormat.format(99900000), "99,9", "99900000 formatted");
		assert.equal(oFormat.format(99990000), "99,99", "99990000 formatted");
		assert.equal(oFormat.format(99999999), "100", "99999999 formatted");
		assert.equal(oFormat.format(123456789), "123,46", "123456789 formatted");
		assert.equal(oFormat.format(999000000), "999", "999000000 formatted");
		assert.equal(oFormat.format(999900000), "999,9", "999900000 formatted");
		assert.equal(oFormat.format(999999999), "1.000", "999999999 formatted");
		assert.equal(oFormat.format(1234567890), "1.234,57", "1234567890 formatted");
		assert.equal(oFormat.format(9990000000), "9.990", "9990000000 formatted");
		assert.equal(oFormat.format(9999999999), "10.000", "9999999999 formatted");
		assert.equal(oFormat.format(12345678901), "12.345,68", "12345678901 formatted");
		assert.equal(oFormat.format(99900000000), "99.900", "99900000000 formatted");
		assert.equal(oFormat.format(99999999999), "100.000", "99999999999 formatted");
		assert.equal(oFormat.format(123456789012), "123.456,79", "123456789012 formatted");
		assert.equal(oFormat.format(999000000000), "999.000", "999000000000 formatted");
		assert.equal(oFormat.format(999999999999), "1.000.000", "999999999999 formatted");
		assert.equal(oFormat.format(1234567890123), "1.234.567,89", "1234567890123 formatted");
		assert.equal(oFormat.format(-1), "0", "-1 formatted");
		assert.equal(oFormat.format(-12), "0", "-12 formatted");
		assert.equal(oFormat.format(-123), "0", "-123 formatted");
		assert.equal(oFormat.format(-999), "0", "-999 formatted");
		assert.equal(oFormat.format(-1234), "0", "-1234 formatted");
		assert.equal(oFormat.format(-9999), "-0,01", "-9999 formatted");
		assert.equal(oFormat.format(-12345), "-0,01", "-12345 formatted");
		assert.equal(oFormat.format(-99900), "-0,1", "-99900 formatted");
		assert.equal(oFormat.format(-99990), "-0,1", "-99990 formatted");
		assert.equal(oFormat.format(-99999), "-0,1", "-99999 formatted");
		assert.equal(oFormat.format(-123456), "-0,12", "-123456 formatted");
		assert.equal(oFormat.format(-990000), "-0,99", "-999000 formatted");
		assert.equal(oFormat.format(-999900), "-1", "-999900 formatted");
		assert.equal(oFormat.format(-999999), "-1", "-999999 formatted");
	});

	QUnit.test("integer long style under locale zh_CN", function (assert) {
		// The pattern for 1000-other in locale zh_CN is defined as "0" without any scale which means a number with 4 digits
		// shouldn't be formatted using the short style.
		// But when a formatted string without any scale is parsed under locale zh_CN, this pattern is always selected which
		// always results with a number multiplied by 1000. This is fixed by ignoring the pattern which doesn't have a scale
		// when parsing a formatted number.
		var oLocale = new Locale("zh_CN"),
			oFormat = NumberFormat.getIntegerInstance({
				style: "long"
			}, oLocale);

		assert.equal(oFormat.parse("1"), 1, "'1' is parsed as 1");
		assert.equal(oFormat.parse("9999"), 9999, "'9999' is parsed as 9999");
		assert.equal(oFormat.parse("1万"), 10000, "'1万' is parsed as 10000");
	});

	QUnit.test("Priority of properties (normal style): maxFractionDigits, decimals, shortDecimals, precision", function (assert) {
		var fNum = 12345.678901;

		var oFormat = NumberFormat.getFloatInstance({
			minFractionDigits: 5,
			maxFractionDigits: 6
		});
		assert.equal(oFormat.format(fNum), "12,345.678901", fNum + " with minFractionDigits and maxFractionDigits");

		oFormat = NumberFormat.getFloatInstance({
			minFractionDigits: 5,
			maxFractionDigits: 6,
			decimals: 4
		});
		assert.equal(oFormat.format(fNum), "12,345.6789", fNum + " with minFractionDigits, maxFractionDigits and decimals");

		oFormat = NumberFormat.getFloatInstance({
			minFractionDigits: 5,
			maxFractionDigits: 6,
			decimals: 4,
			// shortDecimals shouldn't have effect on normal style formatter
			shortDecimals: 3
		});
		assert.equal(oFormat.format(fNum), "12,345.6789", fNum + " with minFractionDigits, maxFractionDigits, decimals and shortDecimals");

		oFormat = NumberFormat.getFloatInstance({
			minFractionDigits: 5,
			maxFractionDigits: 6,
			decimals: 4,
			// shortDecimals shouldn't have effect on normal style formatter
			shortDecimals: 3,
			precision: 7
		});
		assert.equal(oFormat.format(fNum), "12,345.68", fNum + " with minFractionDigits, maxFractionDigits, decimals, shortDecimals and precision");

		oFormat = NumberFormat.getFloatInstance({
			minFractionDigits: 5,
			maxFractionDigits: 6,
			decimals: 4,
			// shortDecimals shouldn't have effect on normal style formatter
			shortDecimals: 3,
			precision: 2
		});
		assert.equal(oFormat.format(fNum), "12,346", fNum + " with minFractionDigits, maxFractionDigits, decimals, shortDecimals and precision (precision set with a number less than the number of integer digits)");

		oFormat = NumberFormat.getFloatInstance({
			precision: 5,
			decimals: 3
		});

		assert.equal(oFormat.format(100), "100.00", "100 formatted with precision 5 and decimals 3");
	});

	QUnit.test("Priority of properties (short style): maxFractionDigits, decimals, shortDecimals, precision", function (assert) {
		var fNum = 3456.678901;

		var oFormat = NumberFormat.getFloatInstance({
			style: "short"
		});
		assert.equal(oFormat.format(fNum), "3.5K", fNum + " with no setting");


		oFormat = NumberFormat.getFloatInstance({
			style: "short",
			minFractionDigits: 5,
			maxFractionDigits: 6
		});
		assert.equal(oFormat.format(fNum), "3.456679K", fNum + " with minFractionDigits and maxFractionDigits");

		oFormat = NumberFormat.getFloatInstance({
			style: "short",
			minFractionDigits: 5,
			maxFractionDigits: 6,
			decimals: 4
		});
		assert.equal(oFormat.format(fNum), "3.4567K", fNum + " with minFractionDigits, maxFractionDigits and decimals");

		oFormat = NumberFormat.getFloatInstance({
			style: "short",
			minFractionDigits: 5,
			maxFractionDigits: 6,
			decimals: 4,
			shortDecimals: 3
		});
		assert.equal(oFormat.format(fNum), "3.457K", fNum + " with minFractionDigits, maxFractionDigits, decimals and shortDecimals");

		oFormat = NumberFormat.getFloatInstance({
			style: "short",
			minFractionDigits: 5,
			maxFractionDigits: 6,
			decimals: 4,
			shortDecimals: 3,
			precision: 1
		});
		assert.equal(oFormat.format(fNum), "3K", fNum + " with minFractionDigits, maxFractionDigits, decimals, shortDecimals and precision");

		oFormat = NumberFormat.getFloatInstance({
			style: "short",
			decimals: 0
		});
		assert.equal(oFormat.format(fNum), "3K", fNum + " with decimals: 0");

		oFormat = NumberFormat.getFloatInstance({
			style: "short",
			minFractionDigits: 5,
			maxFractionDigits: 6,
			decimals: 4,
			shortDecimals: 3,
			precision: 1
		});
		assert.equal(oFormat.format(123456.678901), "123K", fNum + " with minFractionDigits, maxFractionDigits, decimals, shortDecimals and precision (precision set with a number less than the number of integer digits)");
	});

	QUnit.test("float default format", function (assert) {
		assert.equal(oDefaultFloat.format(.1), "0.1", ".1");
		assert.equal(oDefaultFloat.format(0.123), "0.123", "0.123");
		assert.equal(oDefaultFloat.format(123), "123", "123");
		assert.equal(oDefaultFloat.format(123.23), "123.23", "123.23");
		assert.equal(oDefaultFloat.format(1234), "1,234", "1234");
		assert.equal(oDefaultFloat.format(12345), "12,345", "12345");
		assert.equal(oDefaultFloat.format(12345.123), "12,345.123", "12345.123");
		assert.equal(oDefaultFloat.format(12345.12345), "12,345.12345", "12345.12345");
		assert.equal(oDefaultFloat.format(1234567890), "1,234,567,890", "1234567890");
		assert.equal(oDefaultFloat.format(-123.23), "-123.23", "-123.23");
		assert.equal(oDefaultFloat.format("1.23e+9"), "1,230,000,000", "1.23e+9");
		assert.equal(oDefaultFloat.format("1.23e-9"), "0.00000000123", "1.23e-9");
		assert.equal(oDefaultFloat.format("-1.23e+9"), "-1,230,000,000", "-1.23e+9");
		assert.equal(oDefaultFloat.format("-1.23e-9"), "-0.00000000123", "-1.23e-9");
		assert.equal(oDefaultFloat.format("1.2345e+2"), "123.45", "1.2345e+2");
		assert.equal(oDefaultFloat.format("12345e-2"), "123.45", "12345e-2");
		assert.equal(oDefaultFloat.format("-1.2345e+2"), "-123.45", "-1.2345e+2");
		assert.equal(oDefaultFloat.format("-12345e-2"), "-123.45", "-12345e-2");
		assert.equal(oDefaultFloat.format("123.45e+2"), "12,345", "123.45e+2");
		assert.equal(oDefaultFloat.format("12.345e-2"), "0.12345", "12.345e-2");
		assert.equal(oDefaultFloat.format("-123.45e+2"), "-12,345", "-123.45e+2");
		assert.equal(oDefaultFloat.format("-12.345e-2"), "-0.12345", "-12.345e-2");
		assert.equal(oDefaultFloat.format("123456.789e+2"), "12,345,678.9", "123456.789e+2");
		assert.equal(oDefaultFloat.format("123.456789e-2"), "1.23456789", "123.456789e-2");
		assert.equal(oDefaultFloat.format("-123456.789e+2"), "-12,345,678.9", "-123456.789e+2");
		assert.equal(oDefaultFloat.format("-123.456789e-2"), "-1.23456789", "-123.456789e-2");
		assert.equal(oDefaultFloat.format("1000.00"), "1,000.00", "1000.00");
		assert.equal(oDefaultFloat.format("1000.0000"), "1,000.0000", "1000.0000");
		assert.equal(oDefaultFloat.format(123456789.123456789), "123,456,789.1234568", "123456789.123456789 (number)");
		assert.equal(oDefaultFloat.format("123456789.123456789"), "123,456,789.123456789", "123456789.123456789 (string)");

	});

	QUnit.test("float format for a specific locale", function (assert) {
		var oLocale = new Locale("de-DE");
		var oFloatFormat = NumberFormat.getFloatInstance(oLocale);
		assert.equal(oFloatFormat.format(.1), "0,1", ".1");
		assert.equal(oFloatFormat.format(0.123), "0,123", "0.123");
		assert.equal(oFloatFormat.format(123), "123", "123");
		assert.equal(oFloatFormat.format(123.23), "123,23", "123.23");
		assert.equal(oFloatFormat.format(1234), "1.234", "1234");
		assert.equal(oFloatFormat.format(12345), "12.345", "12345");
		assert.equal(oFloatFormat.format(12345.123), "12.345,123", "12345.123");
		assert.equal(oFloatFormat.format(12345.12345), "12.345,12345", "12345.12345");
		assert.equal(oFloatFormat.format(1234567890), "1.234.567.890", "1234567890");
		assert.equal(oFloatFormat.format(-123.23), "-123,23", "-123.23");
		assert.equal(oFloatFormat.format("1000.00"), "1.000,00", "1000.00");
		assert.equal(oFloatFormat.format("1000.0000"), "1.000,0000", "1000.0000");
	});

	QUnit.test("float format with decimals and indian grouping", function (assert) {
		var oLocale = new Locale("en-IN");
		var oFloatFormat = NumberFormat.getFloatInstance({
			decimals: 2
		}, oLocale);
		assert.equal(oFloatFormat.format(1), "1.00", "1");
		assert.equal(oFloatFormat.format(10), "10.00", "10");
		assert.equal(oFloatFormat.format(1000), "1,000.00", "1000");
		assert.equal(oFloatFormat.format(100000), "1,00,000.00", "100000");
		assert.equal(oFloatFormat.format(1000000), "10,00,000.00", "1000000");
		assert.equal(oFloatFormat.format(10000000), "1,00,00,000.00", "10000000");
	});

	QUnit.test("float format with decimals and myriad grouping", function (assert) {
		var oLocale = new Locale("ja_JP");
		var oFloatFormat = NumberFormat.getFloatInstance({
			decimals: 2,
			groupingSize: 4
		}, oLocale);
		assert.equal(oFloatFormat.format(1), "1.00", "1");
		assert.equal(oFloatFormat.format(10), "10.00", "10");
		assert.equal(oFloatFormat.format(1000), "1000.00", "1000");
		assert.equal(oFloatFormat.format(10000), "1,0000.00", "100000");
		assert.equal(oFloatFormat.format(10000000), "1000,0000.00", "1000000");
		assert.equal(oFloatFormat.format(100000000), "1,0000,0000.00", "10000000");
	});

	QUnit.test("float format with custom grouping", function (assert) {
		var oFloatFormat = NumberFormat.getFloatInstance({
			decimals: 2,
			groupingSize: 2
		});
		assert.equal(oFloatFormat.format(1), "1.00", "1");
		assert.equal(oFloatFormat.format(10), "10.00", "10");
		assert.equal(oFloatFormat.format(1000), "10,00.00", "1000");
		assert.equal(oFloatFormat.format(10000), "1,00,00.00", "10000");
		assert.equal(oFloatFormat.format(10000000), "10,00,00,00.00", "10000000");
		assert.equal(oFloatFormat.format(100000000), "1,00,00,00,00.00", "100000000");

		oFloatFormat = NumberFormat.getFloatInstance({
			decimals: 1,
			groupingSize: 3,
			groupingBaseSize: 2
		});
		assert.equal(oFloatFormat.format(1), "1.0", "1");
		assert.equal(oFloatFormat.format(10), "10.0", "10");
		assert.equal(oFloatFormat.format(1000), "10,00.0", "1000");
		assert.equal(oFloatFormat.format(10000), "100,00.0", "10000");
		assert.equal(oFloatFormat.format(10000000), "100,000,00.0", "10000000");
		assert.equal(oFloatFormat.format(100000000), "1,000,000,00.0", "100000000");

		oFloatFormat = NumberFormat.getFloatInstance({
			decimals: 1,
			groupingSize: 2,
			groupingBaseSize: 4
		});
		assert.equal(oFloatFormat.format(1), "1.0", "1");
		assert.equal(oFloatFormat.format(10), "10.0", "10");
		assert.equal(oFloatFormat.format(1000), "1000.0", "1000");
		assert.equal(oFloatFormat.format(10000), "1,0000.0", "10000");
		assert.equal(oFloatFormat.format(10000000), "10,00,0000.0", "10000000");
		assert.equal(oFloatFormat.format(100000000), "1,00,00,0000.0", "100000000");

		oFloatFormat = NumberFormat.getFloatInstance({
			decimals: 1,
			groupingSize: 5,
			groupingBaseSize: 3
		});
		assert.equal(oFloatFormat.format(1), "1.0", "1");
		assert.equal(oFloatFormat.format(10), "10.0", "10");
		assert.equal(oFloatFormat.format(1000), "1,000.0", "1000");
		assert.equal(oFloatFormat.format(10000), "10,000.0", "10000");
		assert.equal(oFloatFormat.format(10000000), "10000,000.0", "10000000");
		assert.equal(oFloatFormat.format(100000000), "1,00000,000.0", "100000000");

		oFloatFormat = NumberFormat.getFloatInstance({
			decimals: 1,
			groupingSize: 1,
			groupingBaseSize: 3
		});
		assert.equal(oFloatFormat.format(1), "1.0", "1");
		assert.equal(oFloatFormat.format(10), "10.0", "10");
		assert.equal(oFloatFormat.format(1000), "1,000.0", "1000");
		assert.equal(oFloatFormat.format(10000), "1,0,000.0", "10000");
		assert.equal(oFloatFormat.format(10000000), "1,0,0,0,0,000.0", "10000000");
		assert.equal(oFloatFormat.format(100000000), "1,0,0,0,0,0,000.0", "100000000");

		oFloatFormat = NumberFormat.getFloatInstance({
			decimals: 1,
			groupingSize: 4,
			groupingBaseSize: 1
		});
		assert.equal(oFloatFormat.format(1), "1.0", "1");
		assert.equal(oFloatFormat.format(10), "1,0.0", "10");
		assert.equal(oFloatFormat.format(1000), "100,0.0", "1000");
		assert.equal(oFloatFormat.format(10000), "1000,0.0", "10000");
		assert.equal(oFloatFormat.format(10000000), "100,0000,0.0", "10000000");
		assert.equal(oFloatFormat.format(100000000), "1000,0000,0.0", "100000000");
	});

	QUnit.test("float format with pattern defined grouping", function (assert) {
		var oFloatFormat = NumberFormat.getFloatInstance({
			pattern: "#,##0.00"
		});
		assert.equal(oFloatFormat.format(1), "1.00", "1");
		assert.equal(oFloatFormat.format(10), "10.00", "10");
		assert.equal(oFloatFormat.format(1000), "1,000.00", "1000");
		assert.equal(oFloatFormat.format(10000), "10,000.00", "10000");
		assert.equal(oFloatFormat.format(10000000), "10,000,000.00", "10000000");
		assert.equal(oFloatFormat.format(100000000), "100,000,000.00", "100000000");

		oFloatFormat = NumberFormat.getFloatInstance({
			pattern: "#,##,##0.00"
		});
		assert.equal(oFloatFormat.format(1), "1.00", "1");
		assert.equal(oFloatFormat.format(10), "10.00", "10");
		assert.equal(oFloatFormat.format(1000), "1,000.00", "1000");
		assert.equal(oFloatFormat.format(10000), "10,000.00", "10000");
		assert.equal(oFloatFormat.format(10000000), "1,00,00,000.00", "10000000");
		assert.equal(oFloatFormat.format(100000000), "10,00,00,000.00", "100000000");

		oFloatFormat = NumberFormat.getFloatInstance({
			pattern: "#,###0.00"
		});
		assert.equal(oFloatFormat.format(1), "1.00", "1");
		assert.equal(oFloatFormat.format(10), "10.00", "10");
		assert.equal(oFloatFormat.format(1000), "1000.00", "1000");
		assert.equal(oFloatFormat.format(10000), "1,0000.00", "10000");
		assert.equal(oFloatFormat.format(10000000), "1000,0000.00", "10000000");
		assert.equal(oFloatFormat.format(100000000), "1,0000,0000.00", "100000000");
	});

	QUnit.test("float custom format", function (assert) {
		assert.equal(oCustomFloat.format(.1), "00,10", ".1");
		assert.equal(oCustomFloat.format(0.123), "00,123", "0.123");
		assert.equal(oCustomFloat.format(123), "123,00", "123");
		assert.equal(oCustomFloat.format(123.23), "123,23", "123.23");
		assert.equal(oCustomFloat.format(1234), "1234,00", "1234");
		assert.equal(oCustomFloat.format(12345), "????,00", "12345");
		assert.equal(oCustomFloat.format(12345.123), "????,123", "12345.123");
		assert.equal(oCustomFloat.format(12345.12345), "????,1235", "12345.12345");
		assert.equal(oCustomFloat.format(-123.23), "-123,23", "-123.23");
		assert.equal(oCustomFloat.format("1000.00"), "1000,00", "1000.00");
		assert.equal(oCustomFloat.format("1000.0000"), "1000,0000", "1000.0000");

	});

	QUnit.test("float format with default rounding mode: HALF_AWAY_FROM_ZERO", function (assert) {
		var oFormat = NumberFormat.getFloatInstance({
			maxFractionDigits: 3
		});

		assert.equal(oFormat.format(.1230), "0.123", ".123");
		assert.equal(oFormat.format(.1234), "0.123", ".1234");
		assert.equal(oFormat.format(.1235), "0.124", ".1235");
		assert.equal(oFormat.format(.1239), "0.124", ".1239");
		assert.equal(oFormat.format(2.1999), "2.2", "2.1999");
		assert.equal(oFormat.format(2.11), "2.11", "2.11");
		assert.equal(oFormat.format(-.1234), "-0.123", "-.1234");
		assert.equal(oFormat.format(-.1236), "-0.124", "-.1236");
		assert.equal(oFormat.format(.0005), "0.001", ".0005");
		assert.equal(oFormat.format(.0004), "0", ".0004");
		assert.equal(oFormat.format(-.0005), "-0.001", "-.0005");
		assert.equal(oFormat.format(-.0004), "0", "-.0004");

		oFormat = NumberFormat.getFloatInstance({
			maxFractionDigits: 2
		});

		// These two are the famous test cases for problematic rounding in Javascript
		assert.equal(oFormat.format(35.855), "35.86", "35.855");
		assert.equal(oFormat.format(1.005), "1.01", "1.005");

		assert.equal(oFormat.format(-35.855), "-35.86", "-35.855");
		assert.equal(oFormat.format(-1.005), "-1.01", "-1.005");

		oFormat = NumberFormat.getFloatInstance({
			decimals: 2
		});
		assert.equal(oFormat.format(.005), "0.01", ".005");
		assert.equal(oFormat.format(.004), "0.00", ".004");
		assert.equal(oFormat.format(-.005), "-0.01", "-.005");
		assert.equal(oFormat.format(-.004), "0.00", "-.004");

	});

	QUnit.test("float format with rounding mode: CEILING", function (assert) {
		var oFormat = NumberFormat.getFloatInstance({
			maxFractionDigits: 3,
			roundingMode: NumberFormat.RoundingMode.CEILING
		});

		assert.equal(oFormat.format(.1230), "0.123", ".123");
		assert.equal(oFormat.format(.1234), "0.124", ".1234");
		assert.equal(oFormat.format(.1235), "0.124", ".1235");
		assert.equal(oFormat.format(.1239), "0.124", ".1239");
		assert.equal(oFormat.format(2.1999), "2.2", "2.1999");
		assert.equal(oFormat.format(2.11), "2.11", "2.11");
		assert.equal(oFormat.format(-.1234), "-0.123", "-.1234");
		assert.equal(oFormat.format(-.1236), "-0.123", "-.1236");
	});

	QUnit.test("float format with rounding mode: CEILING with decimals set to a string which contains a number", function (assert) {
		var oFormat = NumberFormat.getFloatInstance({
			decimals: "3",
			roundingMode: NumberFormat.RoundingMode.CEILING
		});

		assert.equal(oFormat.format(.1230), "0.123", ".123");
		assert.equal(oFormat.format(.1234), "0.124", ".1234");
		assert.equal(oFormat.format(.1235), "0.124", ".1235");
		assert.equal(oFormat.format(.1239), "0.124", ".1239");
		assert.equal(oFormat.format(2.1999), "2.200", "2.1999");
		assert.equal(oFormat.format(2.11), "2.110", "2.11");
		assert.equal(oFormat.format(-.1234), "-0.123", "-.1234");
		assert.equal(oFormat.format(-.1236), "-0.123", "-.1236");
	});

	QUnit.test("float format with rounding mode: FLOOR", function (assert) {
		var oFormat = NumberFormat.getFloatInstance({
			maxFractionDigits: 3,
			roundingMode: NumberFormat.RoundingMode.FLOOR
		});

		assert.equal(oFormat.format(.1230), "0.123", ".123");
		assert.equal(oFormat.format(.1234), "0.123", ".1234");
		assert.equal(oFormat.format(.1235), "0.123", ".1235");
		assert.equal(oFormat.format(.1239), "0.123", ".1239");
		assert.equal(oFormat.format(2.0001), "2", "2.0001");
		assert.equal(oFormat.format(2.11), "2.11", "2.11");
		assert.equal(oFormat.format(-.1234), "-0.124", "-.1234");
		assert.equal(oFormat.format(-.1236), "-0.124", "-.1236");
	});

	QUnit.test("float format with rounding mode: TOWARDS_ZERO", function (assert) {
		var oFormat = NumberFormat.getFloatInstance({
			maxFractionDigits: 3,
			roundingMode: NumberFormat.RoundingMode.TOWARDS_ZERO
		});

		assert.equal(oFormat.format(.1230), "0.123", ".123");
		assert.equal(oFormat.format(.1234), "0.123", ".1234");
		assert.equal(oFormat.format(.1235), "0.123", ".1235");
		assert.equal(oFormat.format(.1239), "0.123", ".1239");
		assert.equal(oFormat.format(2.0001), "2", "2.0001");
		assert.equal(oFormat.format(2.11), "2.11", "2.11");
		assert.equal(oFormat.format(-.1234), "-0.123", "-.1234");
		assert.equal(oFormat.format(-.1235), "-0.123", "-.1235");
		assert.equal(oFormat.format(-.1236), "-0.123", "-.1236");
	});

	QUnit.test("float format with rounding mode: AWAY_FROM_ZERO", function (assert) {
		var oFormat = NumberFormat.getFloatInstance({
			maxFractionDigits: 3,
			roundingMode: NumberFormat.RoundingMode.AWAY_FROM_ZERO
		});

		assert.equal(oFormat.format(.1230), "0.123", ".123");
		assert.equal(oFormat.format(.1234), "0.124", ".1234");
		assert.equal(oFormat.format(.1235), "0.124", ".1235");
		assert.equal(oFormat.format(.1239), "0.124", ".1239");
		assert.equal(oFormat.format(2.1999), "2.2", "2.0001");
		assert.equal(oFormat.format(2.11), "2.11", "2.11");
		assert.equal(oFormat.format(-.1234), "-0.124", "-.1234");
		assert.equal(oFormat.format(-.1235), "-0.124", "-.1235");
		assert.equal(oFormat.format(-.1236), "-0.124", "-.1236");
	});

	QUnit.test("float format with rounding mode: HALF_TOWARDS_ZERO", function (assert) {
		var oFormat = NumberFormat.getFloatInstance({
			maxFractionDigits: 3,
			roundingMode: NumberFormat.RoundingMode.HALF_TOWARDS_ZERO
		});

		assert.equal(oFormat.format(.1230), "0.123", ".123");
		assert.equal(oFormat.format(.1234), "0.123", ".1234");
		assert.equal(oFormat.format(.1235), "0.123", ".1235");
		assert.equal(oFormat.format(.1239), "0.124", ".1239");
		assert.equal(oFormat.format(2.1999), "2.2", "2.1999");
		assert.equal(oFormat.format(2.11), "2.11", "2.11");
		assert.equal(oFormat.format(-.1230), "-0.123", "-.1230");
		assert.equal(oFormat.format(-.1234), "-0.123", "-.1234");
		assert.equal(oFormat.format(-.1235), "-0.123", "-.1235");
		assert.equal(oFormat.format(-.1239), "-0.124", "-.1239");

		oFormat = NumberFormat.getFloatInstance({
			maxFractionDigits: 2,
			roundingMode: NumberFormat.RoundingMode.HALF_TOWARDS_ZERO
		});

		// These two are the famous test cases for problematic rounding in Javascript
		assert.equal(oFormat.format(35.855), "35.85", "35.855");
		assert.equal(oFormat.format(1.005), "1", "1.005");

		assert.equal(oFormat.format(-35.855), "-35.85", "-35.855");
		assert.equal(oFormat.format(-1.005), "-1", "-1.005");
	});

	QUnit.test("float format with rounding mode: HALF_CEILING", function (assert) {
		var oFormat = NumberFormat.getFloatInstance({
			maxFractionDigits: 3,
			roundingMode: NumberFormat.RoundingMode.HALF_CEILING
		});

		assert.equal(oFormat.format(.1230), "0.123", ".123");
		assert.equal(oFormat.format(.1234), "0.123", ".1234");
		assert.equal(oFormat.format(.1235), "0.124", ".1235");
		assert.equal(oFormat.format(.1239), "0.124", ".1239");
		assert.equal(oFormat.format(2.1999), "2.2", "2.1999");
		assert.equal(oFormat.format(2.11), "2.11", "2.11");
		assert.equal(oFormat.format(-.1230), "-0.123", "-.1230");
		assert.equal(oFormat.format(-.1234), "-0.123", "-.1234");
		assert.equal(oFormat.format(-.1235), "-0.123", "-.1235");
		assert.equal(oFormat.format(-.1239), "-0.124", "-.1239");

		oFormat = NumberFormat.getFloatInstance({
			maxFractionDigits: 2,
			roundingMode: NumberFormat.RoundingMode.HALF_CEILING
		});

		// These two are the famous test cases for problematic rounding in Javascript
		assert.equal(oFormat.format(35.855), "35.86", "35.855");
		assert.equal(oFormat.format(1.005), "1.01", "1.005");

		assert.equal(oFormat.format(-35.855), "-35.85", "-35.855");
		assert.equal(oFormat.format(-1.005), "-1", "-1.005");
	});

	QUnit.test("float format with rounding mode: HALF_FLOOR", function (assert) {
		var oFormat = NumberFormat.getFloatInstance({
			maxFractionDigits: 3,
			roundingMode: NumberFormat.RoundingMode.HALF_FLOOR
		});

		assert.equal(oFormat.format(.1230), "0.123", ".123");
		assert.equal(oFormat.format(.1234), "0.123", ".1234");
		assert.equal(oFormat.format(.1235), "0.123", ".1235");
		assert.equal(oFormat.format(.1239), "0.124", ".1239");
		assert.equal(oFormat.format(2.1999), "2.2", "2.1999");
		assert.equal(oFormat.format(2.11), "2.11", "2.11");
		assert.equal(oFormat.format(-.1230), "-0.123", "-.1230");
		assert.equal(oFormat.format(-.1234), "-0.123", "-.1234");
		assert.equal(oFormat.format(-.1235), "-0.124", "-.1235");
		assert.equal(oFormat.format(-.1239), "-0.124", "-.1239");

		oFormat = NumberFormat.getFloatInstance({
			maxFractionDigits: 2,
			roundingMode: NumberFormat.RoundingMode.HALF_FLOOR
		});

		// These two are the famous test cases for problematic rounding in Javascript
		assert.equal(oFormat.format(35.855), "35.85", "35.855");
		assert.equal(oFormat.format(1.005), "1", "1.005");

		assert.equal(oFormat.format(-35.855), "-35.86", "-35.855");
		assert.equal(oFormat.format(-1.005), "-1.01", "-1.005");
	});

	QUnit.test("float format with custom rounding function", function (assert) {
		var oSpy = this.spy(function (a, b) {
			return a;
		}), oFormat = NumberFormat.getFloatInstance({
			maxFractionDigits: 3,
			roundingMode: oSpy
		});

		oFormat.format(1.23456);
		assert.equal(oSpy.callCount, 1, "Custom rounding function is called");
		assert.ok(oSpy.calledWith(1.23456, 3), "Custom rounding function is called with correct parameters");
	});

	QUnit.test("Currency format with sMeasure", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance();
		assert.equal(oFormat.format(123456.789, "EUR"), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format([123456.789, "EUR"]), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format(-123456.789, "EUR"), "EUR" + "\ufeff" + "-123,456.79", "-123456.789 EUR");
		assert.equal(oFormat.format([-123456.789, "EUR"]), "EUR" + "\ufeff" + "-123,456.79", "-123456.789 EUR");
		assert.equal(oFormat.format(123456.789, "JPY"), "JPY" + "\xa0" + "123,457", "123456.789 JPY");
		assert.equal(oFormat.format([123456.789, "JPY"]), "JPY" + "\xa0" + "123,457", "123456.789 JPY");
		assert.equal(oFormat.format(-123456.789, "JPY"), "JPY" + "\ufeff" + "-123,457", "-123456.789 JPY");
		assert.equal(oFormat.format([-123456.789, "JPY"]), "JPY" + "\ufeff" + "-123,457", "-123456.789 JPY");
	});

	QUnit.test("Currency format for locale DE", function (assert) {
		var oLocale = new Locale("de-DE");
		// currency only supports "short" style. Therefore, result should be the same for both styles.
		["long", "short"].forEach(function(sStyle) {
			var oFormat = NumberFormat.getCurrencyInstance({ style: sStyle }, oLocale);
			// thousand format for locale "de" does not reformat the number (pattern: "100000-other": "0")
			assert.equal(oFormat.format(123456.789, "EUR"), "123.456,79" + "\xa0" + "EUR");
			assert.equal(oFormat.format(-123456.789, "JPY"), "-123.457" + "\xa0" + "JPY");

			// million format for locale "de" does reformat the number (pattern: "1000000-other": "0 Mio'.' ¤")
			assert.equal(oFormat.format(47123456.789, "EUR"), "47" + "\xa0" + "Mio." + "\xa0" + "EUR");
			assert.equal(oFormat.format(-47123456.789, "JPY"), "-47" + "\xa0" + "Mio." + "\xa0" + "JPY");
		});
	});

	QUnit.test("Currency format with different parameters undefined", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"FOB": {
					symbol: "F",
					decimals: 3
				}
			}
		});
		assert.equal(oFormat.format(undefined, undefined), "", "no values returns an empty string");
		assert.equal(oFormat.format(1234.56, undefined), "1,234.56", "only number formatted");
		assert.equal(oFormat.format(1234.5728, "FOB"), "F" + "\xa0" + "1,234.573", "formatted both");
	});

	QUnit.test("Currency format with sMeasure - unknown currency", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance();

		//invalid unit
		assert.equal(oFormat.format(123456.789, undefined), "123,456.79", "123456.79");
		assert.equal(oFormat.format([123456.789, undefined]), "123,456.79", "123456.79");
		assert.equal(oFormat.format(-123456.789, undefined), "-123,456.79", "-123456.79");
		assert.equal(oFormat.format([-123456.789, "ASDEF"]).toString(), "ASDEF\ufeff-123,456.79", "-123456.789 ASDEF");
		assert.equal(oFormat.format([-123456.789, false]).toString(), "-123,456.79", "-123456.789 false");
		assert.equal(oFormat.format([-123456.789, NaN]).toString(), "-123,456.79", "-123456.789 NaN");
		assert.equal(oFormat.format([-123456.789, undefined]).toString(), "-123,456.79", "-123456.789 undefined");
		assert.equal(oFormat.format([-123456.789, null]).toString(), "-123,456.79", "-123456.789 null");
	});

	QUnit.module("Unit Format");


	var aCombinations = generateUniqueChars(300);


	function generateUniqueChars(iNrOfCharacters) {
		var aRes = [];
		var sChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var maxChars = getNumberOfCharsRequired(iNrOfCharacters, sChars.length);
		for (var i = 0; i < iNrOfCharacters; i++) {
			aRes.push(getFullUniqueKey(i, sChars, maxChars));
		}
		return aRes;
	}

	function getNumberOfCharsRequired(iNrOfPermutations, iNrOfCharacters) {
		var maxChars = 1;
		var iCharsLength = iNrOfCharacters;
		var iIndexCurrent = iNrOfPermutations;
		while (iIndexCurrent / iCharsLength > 1) {
			maxChars++;
			iIndexCurrent = Math.ceil(iIndexCurrent / iCharsLength);
		}
		return maxChars;
	}

	function getFullUniqueKey(iNrOfPermutations, sChars, iMaxNumberChars) {

		var sResult = getUniqueKey(iNrOfPermutations, sChars);


		if (sResult.length < iMaxNumberChars) {
			return sResult.padStart(iMaxNumberChars, sChars[0]);
		}
		return sResult;

	}

	function getUniqueKey(iNrOfPermutations, sChars) {
		var iCharsLength = sChars.length;

		var numberOfPlaces = Math.ceil(iNrOfPermutations / (iCharsLength - 1));
		var cChar = sChars[iNrOfPermutations % (iCharsLength)];
		if (numberOfPlaces <= 1) {
			return cChar;
		}
		return getUniqueKey(numberOfPlaces, sChars) + cChar;
	}

	QUnit.test("NumberFormat.getDefaultUnitPattern() - Default unitPattern-count-other pattern", function(assert) {
		var sDefaultPattern = NumberFormat.getDefaultUnitPattern("MyOwnUnit");

		assert.equal(sDefaultPattern, "{0} MyOwnUnit", "Correct default pattern was created");

		// check usage
		var oFormat = NumberFormat.getUnitInstance({
			customUnits: {
				"MY": {
					"decimals": 2,
					"unitPattern-count-other": sDefaultPattern
				}
			}
		});

		var sFormatted = oFormat.format(1234, "MY");

		assert.equal(sFormatted.toString(), "1,234.00 MyOwnUnit", "Pattern can be used for formatting");
		assert.deepEqual(oFormat.parse(sFormatted.toString()), [1234, "MY"], "Pattern can be used for parsing");
	});

	QUnit.test("Unit format custom units performance", function (assert) {
		var oLocale = new Locale("en");
		var oCustomUnits = {

		};
		for (var i = 0; i < aCombinations.length; i++) {
			var sChar = aCombinations[i];
			oCustomUnits["unit" + i] = {
				"displayName": "unit " + i,
				"unitPattern-count-one": "{0} " + sChar,
				"unitPattern-count-other": "{0} " + sChar
			};
		}
		var oFormat = NumberFormat.getUnitInstance({
			customUnits: oCustomUnits
		}, oLocale);

		var oRegexInstantiationSpy = this.spy(window, "RegExp");
		assert.equal(oFormat.format(1123, "unit299").toString(), "1,123 MN", "invalid unit pattern");
		assert.equal(oFormat.format(1123, "unit150").toString(), "1,123 GU", "invalid unit pattern");
		assert.equal(oFormat.format(1123, "unit1").toString(), "1,123 AB", "invalid unit pattern");
		assert.equal(oFormat.format(1123, "unit7").toString(), "1,123 AH", "invalid unit pattern");

		assert.equal(oRegexInstantiationSpy.callCount, 0, "no regexp creation during formatting");
	});

	QUnit.test("Unit parse custom units regex creation cached after first execution", function (assert) {
		var oLocale = new Locale("en");
		var oCustomUnits = {
			"ASD": {
				"displayName": "unit ASD",
				"unitPattern-count-one": "{0} ASD",
				"unitPattern-count-other": "{0} ASD"
			}
		};
		var oFormat = NumberFormat.getUnitInstance({
			customUnits: oCustomUnits
		}, oLocale);

		var oRegexInstantiationSpy = this.spy(window, "RegExp");

		oFormat.parse("1,123 ASD");
		assert.equal(oRegexInstantiationSpy.callCount, 3, "create regexp instance for pattern");

		oRegexInstantiationSpy.reset();
		oFormat.parse("1,123 ASD");
		assert.equal(oRegexInstantiationSpy.callCount, 3, "skip regexp instantiation for cached pattern");

		oRegexInstantiationSpy.reset();
		oFormat.parse("1,123 ASD");
		assert.equal(oRegexInstantiationSpy.callCount, 3, "skip regexp instantiation for cached pattern");
	});

	QUnit.test("Unit parse all cldr units regex creation cached after first execution", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance(oLocale);

		var oRegexInstantiationSpy = this.spy(window, "RegExp");

		oFormat.parse("1,123 km");

		oRegexInstantiationSpy.reset();
		oFormat.parse("1,123 m");
		assert.equal(oRegexInstantiationSpy.callCount, 3, "skip regexp instantiation for cached pattern");

		oRegexInstantiationSpy.reset();
		oFormat.parse("1,123 ms");
		assert.equal(oRegexInstantiationSpy.callCount, 3, "skip regexp instantiation for cached pattern");

		oRegexInstantiationSpy.reset();
		oFormat.parse("1,123 cm");
		assert.equal(oRegexInstantiationSpy.callCount, 3, "skip regexp instantiation for cached pattern");
	});

	QUnit.test("Unit parse custom units performance", function (assert) {
		var oLocale = new Locale("en");
		var oCustomUnits = {

		};
		for (var i = 0; i < 300; i++) {
			var sChar = aCombinations[i];
			oCustomUnits["unit" + i] = {
				"displayName": "unit " + i,
				"unitPattern-count-one": "{0} " + sChar,
				"unitPattern-count-other": "{0} " + sChar
			};
		}
		var oFormat = NumberFormat.getUnitInstance({
			customUnits: oCustomUnits
		}, oLocale);

		var t0 = performance.now();
		var oRegexInstantiationSpy = this.spy(window, "RegExp");
		assert.deepEqual(oFormat.parse("1,123 MN"), [1123, "unit299"], "invalid unit pattern");
		assert.deepEqual(oFormat.parse("1,123 GU"), [1123, "unit150"], "invalid unit pattern");
		assert.deepEqual(oFormat.parse("1,123 AB"), [1123, "unit1"], "invalid unit pattern");
		assert.deepEqual(oFormat.parse("1,123 AH"), [1123, "unit7"], "invalid unit pattern");

		assert.equal(oRegexInstantiationSpy.callCount, 12, "regexp creation during formatting");

		assert.deepEqual(oFormat.parse("1,123 MM"), [1123, "unit298"], "invalid unit pattern");
		assert.deepEqual(oFormat.parse("1,123 CI"), [1123, "unit34"], "invalid unit pattern");
		assert.deepEqual(oFormat.parse("1,123 CC"), [1123, "unit28"], "invalid unit pattern");
		assert.deepEqual(oFormat.parse("1,123 EE"), [1123, "unit82"], "invalid unit pattern");
		assert.equal(oRegexInstantiationSpy.callCount, 24, "regexp creation during formatting");
		var t1 = performance.now();

		assert.ok(true, "Took " + (t1 - t0) + "ms for parsing");
	});

	QUnit.test("Unit format with invalid unit definition coordinate", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance({}, oLocale);

		assert.equal(oFormat.format(1123, "coordinateUnit"), "", "invalid unit pattern");
		assert.equal(oFormat.format(1123, "per"), "", "invalid unit pattern");
	});

	QUnit.test("Unit format with unknown locale", function (assert) {
		var oLocale = new Locale("unknown");
		var oFormat = NumberFormat.getUnitInstance(oLocale);

		//defaults to english locale as defined in M_DEFAULT_DATA in LocaleData.js
		assert.equal(oFormat.format(12, "duration-hour").toString(), "12 hr", "20 hours");
		assert.equal(oFormat.format(13, "volume-liter").toString(), "13 L", "13 liter");
	});

	QUnit.test("Unit format custom pattern", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance({
			customUnits: {
				"olf": {
					"displayName": "olf",
					"unitPattern-count-one": "{0} olf",
					"unitPattern-count-other": "{0} olfers"
				},
				"IND": {
					"displayName": "olf",
					"unitPattern-count-one": "{0} olf",
					"unitPattern-count-other": "{0} olfs"
				},
				"electric-inductance": {
					"displayName": "H",
					"unitPattern-count-one": "{0} H",
					"unitPattern-count-other": "{0} H"
				}
			}
		}, oLocale);

		// test exclusiveness
		assert.equal(oFormat.format(20, "area-hectare").toString(), "", "20 ha");

		// test "other" units
		assert.equal(oFormat.format(20, "olf").toString(), "20 olfers", "20 olfers");
		assert.equal(oFormat.format(20, "IND").toString(), "20 olfs", "20 olfs");
		assert.equal(oFormat.format(20, "electric-inductance").toString(), "20 H", "20 H");

		// test "one" unit
		assert.equal(oFormat.format(1, "olf").toString(), "1 olf", "1 olf");
		assert.equal(oFormat.format(1, "IND").toString(), "1 olf", "1 olf");
		assert.equal(oFormat.format(1, "electric-inductance").toString(), "1 H", "1 H");

	});

	QUnit.test("'decimals' set on FormatOptions and custom units", function (assert) {
		var oFormatOptions = {
			customUnits: {
				"cats": {
					"displayName": "Cats",
					"unitPattern-count-one": "{0} Cat",
					"unitPattern-count-other": "{0} Cats",
					"decimals": 5
				}
			},
			decimals: 1
		};

		// en
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance(oFormatOptions, oLocale);

		assert.equal(oFormat.format(1120.3, "cats"), "1,120.30000 Cats", "formatted with 5 decimals - en");

		// de
		oLocale = new Locale("de");
		oFormat = NumberFormat.getUnitInstance(oFormatOptions, oLocale);

		assert.equal(oFormat.format(1120.3, "cats"), "1.120,30000 Cats", "formatted with 5 decimals - de");
	});

	QUnit.test("Unit parse custom pattern", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance({
			customUnits: {
				"olf": {
					"displayName": "olf",
					"unitPattern-count-one": "{0} olf",
					"unitPattern-count-other": "{0} olfers"
				},
				"IND": {
					"displayName": "olf",
					"unitPattern-count-one": "{0} olf",
					"unitPattern-count-other": "{0} olfs"
				},
				"electric-inductance": {
					"displayName": "H",
					"unitPattern-count-one": "{0} H",
					"unitPattern-count-other": "{0} H"
				}
			}
		}, oLocale);

		// test exclusiveness
		assert.equal(oFormat.parse("20 ha"), null, "20 ha");

		// test "other" units
		assert.deepEqual(oFormat.parse("20 olfers"), [20, "olf"], "20 olfers");
		assert.deepEqual(oFormat.parse("20 olfs"), [20, "IND"], "20 olfs");
		assert.deepEqual(oFormat.parse("20 H"), [20, "electric-inductance"], "20 H");

		// test "one" unit - ambiguous for olf and IND
		assert.deepEqual(oFormat.parse("1 olf"), [1, undefined], "1 olf");
		assert.deepEqual(oFormat.parse("1 olf"), [1, undefined], "1 olf");
		assert.deepEqual(oFormat.parse("1 H"), [1, "electric-inductance"], "1 H");

	});

	QUnit.module("Unit Format using configuration", {
		beforeEach: function (assert) {

			//ensure custom unit mappings and custom units are reset
			this.oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();
			this.oFormatSettings.setUnitMappings();
			this.oFormatSettings.setCustomUnits();

			assert.equal(this.oFormatSettings.getCustomUnits(), undefined, "units must be undefined");
			assert.equal(this.oFormatSettings.getUnitMappings(), undefined, "unit mappings must be undefined");
		}, afterEach: function (assert) {
			//ensure custom unit mappings and custom units are reset
			this.oFormatSettings.setUnitMappings();
			this.oFormatSettings.setCustomUnits();

			assert.equal(this.oFormatSettings.getCustomUnits(), undefined, "units must be undefined");
			assert.equal(this.oFormatSettings.getUnitMappings(), undefined, "unit mappings must be undefined");
		}
	});


	QUnit.test("Unit format custom pattern in config", function (assert) {
		var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();
		var oConfigObject = {
			"electric-inductance": {
				"unitPattern-count-one": "{0} H",
				"unitPattern-count-other": "{0} H"
			},
			"length-millimeter": {
				"unitPattern-count-other": "{0} mymm"
			}
		};
		oFormatSettings.setCustomUnits(oConfigObject);

		var oFormat = NumberFormat.getUnitInstance({});

		// test custom unit in config
		assert.equal(oFormat.format(20, "area-hectare").toString(), "20 ha", "20 ha");
		assert.equal(oFormat.format(20, "electric-inductance").toString(), "20 H", "20 H");
		assert.equal(oFormat.format(1, "electric-inductance").toString(), "1 H", "1 H");


		//custom mappings should not affect parsing
		oFormatSettings.setUnitMappings({
			"henry": "electric-inductance",
			"IND": "electric-inductance",
			"MTR": "length-meter",
			"MET": "length-meter",
			"length-kilometer": "electric-inductance",
			"DET": "MET",
			"one": "two",
			"two": "one"
		});

		// test existing units
		assert.equal(oFormat.format(20, "area-hectare").toString(), "20 ha", "20 ha");

		//test overwritten units from custom units
		assert.equal(oFormat.format(20, "length-millimeter").toString(), "20 mymm", "20 mymm");

		// test defined custom units
		assert.equal(oFormat.format(20, "electric-inductance").toString(), "20 H", "20 H");
		assert.equal(oFormat.format(1, "electric-inductance").toString(), "1 H", "1 H");


		//test mappings
		assert.equal(oFormat.format(20, "length-kilometer").toString(), "20 H", "20 H");
		assert.equal(oFormat.format(20, "henry").toString(), "20 H", "20 H");
		assert.equal(oFormat.format(20, "IND").toString(), "20 H", "20 H");
		assert.equal(oFormat.format(20, "MTR").toString(), "20 m", "20 m");
		assert.equal(oFormat.format(20, "MET").toString(), "20 m", "20 m");
		assert.equal(oFormat.format(20, "DET").toString(), "", "mapping of mapping");
		assert.equal(oFormat.format(20, "one").toString(), "", "recursive mapping");
		assert.equal(oFormat.format(20, "two").toString(), "", "recursive mapping");

		oFormatSettings.setCustomUnits(undefined);
		oFormatSettings.setUnitMappings(undefined);
	});

	QUnit.test("Unit format with private FormatOptions parameter unitOptional active", function (assert) {
		var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();
		var oConfigObject = {
			"electric-inductance": {
				"displayName": "H",
				"unitPattern-count-one": "{0} H",
				"unitPattern-count-other": "{0} H"
			}
		};
		oFormatSettings.setCustomUnits(oConfigObject);
		var oFormat = NumberFormat.getUnitInstance({unitOptional:true});

		assert.deepEqual(oFormat.format(20), "20", "can format 20");
		assert.deepEqual(oFormat.format(20.000), "20", "can format 20.000");
		assert.deepEqual(oFormat.format(200000), "200,000", "can format 200000");

		oFormatSettings.setCustomUnits(undefined);
	});


	QUnit.test("Unit parse with private FormatOptions parameter unitOptional active", function (assert) {
		var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();
		var oConfigObject = {
			"electric-inductance": {
				"displayName": "H",
				"unitPattern-count-one": "{0} H",
				"unitPattern-count-other": "{0} H"
			}
		};
		oFormatSettings.setCustomUnits(oConfigObject);
		var oFormat = NumberFormat.getUnitInstance({unitOptional:true});

		assert.deepEqual(oFormat.parse("20"), [20, undefined], "can parse 20");
		assert.deepEqual(oFormat.parse("20.000"), [20, undefined], "can parse 20");
		assert.deepEqual(oFormat.parse("20,000"), [20000, undefined], "can parse 20");

		oFormatSettings.setCustomUnits(undefined);
	});

	QUnit.test("Unit parse custom pattern in config", function (assert) {
		var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();
		var oConfigObject = {
			"electric-inductance": {
				"displayName": "H",
				"unitPattern-count-one": "{0} H",
				"unitPattern-count-other": "{0} H"
			}
		};
		oFormatSettings.setCustomUnits(oConfigObject);
		var oFormat = NumberFormat.getUnitInstance({});

		assert.deepEqual(oFormat.parse("20 ha"), [20, "area-hectare"], "20 ha");
		assert.deepEqual(oFormat.parse("20 H"), [20, "electric-inductance"], "20 H");
		assert.deepEqual(oFormat.parse("1 H"), [1, "electric-inductance"], "1 H");

		oFormatSettings.setCustomUnits(undefined);
	});


	QUnit.test("Unit format edge cases CLDR", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance({}, oLocale);

		//valid numbers
		assert.equal(oFormat.format(20, "area-hectare").toString(), "20 ha", "20 ha");
		assert.equal(oFormat.format(0.2e2, "area-hectare").toString(), "20 ha", "20 ha");
		assert.equal(oFormat.format(0x14, "area-hectare").toString(), "20 ha", "20 ha");
		assert.equal(oFormat.format("20", "area-hectare").toString(), "20 ha", "string number '20'");
		assert.equal(oFormat.format(0, "area-hectare").toString(), "0 ha", "0 ha");
		assert.equal(oFormat.format(0x0, "area-hectare").toString(), "0 ha", "0 ha");
		assert.equal(oFormat.format(0e2, "area-hectare").toString(), "0 ha", "0 ha");
		assert.equal(oFormat.format("0", "area-hectare").toString(), "0 ha", "string number '0'");

		//exponential numbers as string
		assert.equal(oFormat.format("0.2e2", "area-hectare").toString(), "020 ha", "string number '0.2e2'");
		assert.equal(oFormat.format("0.02e2", "area-hectare").toString(), "002 ha", "string number '0.2e2'");
		assert.equal(oFormat.format("0.00e2", "area-hectare").toString(), "000 ha", "string number '0.2e2'");
		assert.equal(oFormat.format("0.000e2", "area-hectare").toString(), "000.0 ha", "string number '0.2e2'");

		//invalid number
		assert.equal(oFormat.format("2e2", "area-hectare").toString(), "200 ha", "string number '2e2'");
		assert.equal(oFormat.format("2e1", "area-hectare").toString(), "20 ha", "string number '2e1'");
		assert.equal(oFormat.format("0e2", "area-hectare").toString(), "000 ha", "string number '0e2'");
		assert.equal(oFormat.format("a", "area-hectare").toString(), "", "character a");
		assert.equal(oFormat.format("null", "area-hectare").toString(), "", "string 'null'");
		assert.equal(oFormat.format(undefined, "area-hectare").toString(), "", "undefined");
		assert.equal(oFormat.format(NaN, "area-hectare").toString(), "", "NaN");
		assert.equal(oFormat.format({}, "area-hectare").toString(), "", "empty object");
		assert.equal(oFormat.format(function () { }, "area-hectare").toString(), "", "function");
		assert.equal(oFormat.format().toString(), "", "no params");

		//invalid unit
		assert.equal(oFormat.format(12, 33).toString(), "", "");
		assert.equal(oFormat.format(12, "").toString(), "", "");
		assert.equal(oFormat.format(12, "a").toString(), "", "a");
		assert.equal(oFormat.format(12, true).toString(), "", "boolean true");
		assert.equal(oFormat.format(12, false).toString(), "", "boolean false");
		assert.equal(oFormat.format(12, null).toString(), "", "null");
		assert.equal(oFormat.format(12, undefined).toString(), "", "undefined");
		assert.equal(oFormat.format(12, {}).toString(), "", "empty object");
		assert.equal(oFormat.format(12, function () { }).toString(), "", "function");
		assert.equal(oFormat.format(12).toString(), "", "params");
		assert.equal(oFormat.format(12, NaN).toString(), "", "NaN empty string option is by default NaN");

		// empty string option
		oFormat = NumberFormat.getUnitInstance({ emptyString: 0 }, oLocale);
		assert.strictEqual(oFormat.format(0), "", "empty string is 0");

		oFormat = NumberFormat.getUnitInstance({ emptyString: null }, oLocale);
		assert.equal(oFormat.format(null), "", "empty string is 0");

		oFormat = NumberFormat.getUnitInstance({ emptyString: NaN }, oLocale);
		assert.equal(oFormat.format(NaN), "", "empty string is 0");
	});

	QUnit.test("Unit parse edge cases CLDR", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance({}, oLocale);

		assert.deepEqual(oFormat.parse("20 ha"), [20, "area-hectare"], "parsed correctly");
		assert.deepEqual(oFormat.parse("20 c"), [20, undefined], "number and ambigious unit duration-century and volume-cup");
		assert.equal(oFormat.parse("20"), null, "number only '20'");
		assert.equal(oFormat.parse("ha"), null, "unit only 'ha'");
		assert.equal(oFormat.parse("__ ha"), null, "no number area-hectare unit '__ ha'");
		assert.equal(oFormat.parse("__ __"), null, "no number no unit '__ __'");
		assert.equal(oFormat.parse("20 __"), null, "number no unit '20 __'");
		assert.equal(oFormat.parse("__"), null, "no number no unit '__'");
		assert.equal(oFormat.parse(null), null, "number no unit null");
		assert.equal(oFormat.parse(undefined), null, "number no unit undefined");
		assert.equal(oFormat.parse({}), null, "number no unit {}");
		assert.equal(oFormat.parse(true), null, "number no unit true");
		assert.equal(oFormat.parse(false), null, "number no unit false");
		assert.equal(oFormat.parse(NaN), null, "number no unit NaN");
		assert.equal(oFormat.parse(22), null, "number no unit 22");
		assert.equal(oFormat.parse(function () { }), null, "number no unit function");
		assert.equal(isNaN(oFormat.parse("")), true, "number no unit '' empty string option is by default NaN");

		oFormat = NumberFormat.getUnitInstance({ emptyString: 0 }, oLocale);
		assert.deepEqual(oFormat.parse(""), [0, undefined], "empty string is 0");

		oFormat = NumberFormat.getUnitInstance({ emptyString: null }, oLocale);
		assert.deepEqual(oFormat.parse(""), [null, undefined], "empty string is null");

		oFormat = NumberFormat.getUnitInstance({ emptyString: NaN }, oLocale);
		assert.deepEqual(oFormat.parse(""), [NaN, undefined], "empty string is NaN");

		// parseAsString
		oFormat = NumberFormat.getUnitInstance({ emptyString: 0, parseAsString: true }, oLocale);
		assert.deepEqual(oFormat.parse(""), ["0", undefined], "empty string is '0'");

		oFormat = NumberFormat.getUnitInstance({ emptyString: null, parseAsString: true }, oLocale);
		assert.deepEqual(oFormat.parse(""), [null, undefined], "empty string is null");

		oFormat = NumberFormat.getUnitInstance({ emptyString: NaN, parseAsString: true }, oLocale);
		assert.deepEqual(oFormat.parse(""), ["NaN", undefined], "empty string is 'NaN'");

	});

	QUnit.test("Unit parse edge cases CLDR - showMeasure = false", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance({ showMeasure: false }, oLocale);

		assert.deepEqual(oFormat.parse("20 ha"), [20, "area-hectare"], "parsed correctly");
		assert.deepEqual(oFormat.parse("20 c"), [20, undefined], "number and ambigious unit duration-century and volume-cup");
		assert.deepEqual(oFormat.parse("20"), [20, undefined], "number only '20'");
		assert.equal(oFormat.parse("ha"), null, "unit only 'ha'");
		assert.equal(oFormat.parse("__ ha"), null, "no number area-hectare unit '__ ha'");
		assert.equal(oFormat.parse("__ __"), null, "no number no unit '__ __'");
		assert.equal(oFormat.parse("20 __"), null, "number no unit '20 __'");
		assert.equal(oFormat.parse("__"), null, "no number no unit '__'");
		assert.equal(oFormat.parse(null), null, "number no unit null");
		assert.equal(oFormat.parse(undefined), null, "number no unit undefined");
		assert.equal(oFormat.parse({}), null, "number no unit {}");
		assert.equal(oFormat.parse(true), null, "number no unit true");
		assert.equal(oFormat.parse(false), null, "number no unit false");
		assert.equal(oFormat.parse(NaN), null, "number no unit NaN");
		assert.equal(oFormat.parse(22), null, "number no unit 22");
		assert.equal(oFormat.parse(function () { }), null, "number no unit function");
		assert.deepEqual(oFormat.parse(""), [NaN, undefined], "number no unit '' empty string option is by default NaN");

		oFormat = NumberFormat.getUnitInstance({ emptyString: 0 }, oLocale);
		assert.deepEqual(oFormat.parse(""), [0, undefined], "empty string is 0");

		oFormat = NumberFormat.getUnitInstance({ emptyString: null }, oLocale);
		assert.deepEqual(oFormat.parse(""),[null, undefined], "empty string is null");

		oFormat = NumberFormat.getUnitInstance({ emptyString: NaN }, oLocale);
		assert.deepEqual(oFormat.parse(""), [NaN, undefined], "empty string is NaN");

		// parseAsString
		oFormat = NumberFormat.getUnitInstance({ emptyString: 0, parseAsString: true }, oLocale);
		assert.deepEqual(oFormat.parse(""), ["0", undefined], "empty string is '0'");

		oFormat = NumberFormat.getUnitInstance({ emptyString: null, parseAsString: true }, oLocale);
		assert.deepEqual(oFormat.parse(""), [null, undefined], "empty string is null");

		oFormat = NumberFormat.getUnitInstance({ emptyString: NaN, parseAsString: true }, oLocale);
		assert.deepEqual(oFormat.parse(""), ["NaN", undefined], "empty string is 'NaN'");
	});

	QUnit.test("Unit format: restricted list of accepted unit types", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance({
			allowedUnits: ["area-hectare", "duration-hour", "volume-cup"]
		}, oLocale);

		// accepted units
		assert.equal(oFormat.format(20, "area-hectare").toString(), "20 ha", "area-hectare is accepted");
		assert.equal(oFormat.format(123, "duration-hour").toString(), "123 hr", "duration-hour is accepted");
		assert.equal(oFormat.format(2, "volume-cup").toString(), "2 c", "volume-cup is accepted");

		// rejected units
		assert.equal(oFormat.format(5.6, "area-acre").toString(), "", "area-acre is rejected");
		assert.equal(oFormat.format(1337, "duration-minute").toString(), "", "duration-minute is rejected");
	});

	QUnit.test("Unit parse: restricted list of accepted unit types", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance({
			allowedUnits: ["area-hectare", "duration-hour", "volume-cup"]
		}, oLocale);

		// accepted units
		assert.deepEqual(oFormat.parse("20 ha"), [20, "area-hectare"], "area-hectare is accepted");
		assert.deepEqual(oFormat.parse("123 hr"), [123, "duration-hour"], "duration-hour is accepted");

		// ambiguous unit problem is resolved, because it is contained in the allowed unit types list
		assert.deepEqual(oFormat.parse("2 c"), [2, "volume-cup"], "volume-cup is correctly recognized");

		// rejected units
		assert.equal(oFormat.parse("5.6 ac"), null, "area-acre is rejected");
		assert.equal(oFormat.parse("1337 min"), null, "duration-minute is rejected");

		// if ambiguous units are introduced by the application, we return undefined for the unit
		oLocale = new Locale("en");
		oFormat = NumberFormat.getUnitInstance({
			allowedUnits: ["duration-century", "volume-cup"]
		}, oLocale);

		assert.deepEqual(oFormat.parse("41.5 c"), [41.5, undefined], "volume-cup and duration-century are ambiguous");
	});

	QUnit.test("Unit format with sMeasure and showMeasure = false", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance({
			showMeasure: false
		}, oLocale);
		assert.equal(oFormat.format(1, "duration-hour"), "1", "1 hour");
		assert.equal(oFormat.format(0, "duration-hour"), "0", "0 hours");
		assert.equal(oFormat.format(123456.789, "duration-hour"), "123,456.789", "123,456.789 hours");
		assert.equal(oFormat.format([123456.789, "duration-hour"]), "123,456.789", "123,456.789 hours");

		assert.equal(oFormat.format(1, "electric-ohm"), "1", "1 ohm");
		assert.equal(oFormat.format(0, "electric-ohm"), "0", "0 ohms");
		assert.equal(oFormat.format([-123456.789, "electric-ohm"]), "-123,456.789", "-123,456.789 ohms");
		assert.equal(oFormat.format(-123456.789, "electric-ohm"), "-123,456.789", "-123,456.789 ohms");

		assert.equal(oFormat.format(1, "frequency-hertz"), "1", "1 hertz");
		assert.equal(oFormat.format(0, "frequency-hertz"), "0", "0 hertz");
		assert.equal(oFormat.format(123456.789, "frequency-hertz"), "123,456.789", "123,456.789 hertz");
		assert.equal(oFormat.format([123456.789, "frequency-hertz"]), "123,456.789", "123,456.789 hertz");

		assert.equal(oFormat.format(1, "area-hectare"), "1", "1 hectare");
		assert.equal(oFormat.format(0, "area-hectare"), "0", "0 hectare");
		assert.equal(oFormat.format(-123456.789, "area-hectare"), "-123,456.789", "-123,456.789 hectares");
		assert.equal(oFormat.format([-123456.789, "area-hectare"]), "-123,456.789", "-123,456.789 hectares");

	});

	QUnit.test("Unit format with sMeasure long style", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance({ "style": "long" }, oLocale);
		assert.equal(oFormat.format(1, "duration-hour"), "1 hr", "1 hour");
		assert.equal(oFormat.format(0, "duration-hour"), "0 hr", "0 hours");
		assert.equal(oFormat.format(123456.789, "duration-hour"), "123 thousand hr", "123,456.789 hours");
		assert.equal(oFormat.format([123456.789, "duration-hour"]), "123 thousand hr", "123,456.789 hours");

		assert.equal(oFormat.format(1, "electric-ohm"), "1 Ω", "1 ohm");
		assert.equal(oFormat.format(0, "electric-ohm"), "0 Ω", "0 ohms");
		assert.equal(oFormat.format([-123456.789, "electric-ohm"]), "-123 thousand Ω", "-123 ohms");
		assert.equal(oFormat.format(-123456.789, "electric-ohm"), "-123 thousand Ω", "-123 ohms");

		assert.equal(oFormat.format(1, "frequency-hertz"), "1 Hz", "1 hertz");
		assert.equal(oFormat.format(0, "frequency-hertz"), "0 Hz", "0 hertz");
		assert.equal(oFormat.format(123456.789, "frequency-hertz"), "123 thousand Hz", "123 hertz");
		assert.equal(oFormat.format([123456.789, "frequency-hertz"]), "123 thousand Hz", "123 hertz");

		assert.equal(oFormat.format(1, "area-hectare"), "1 ha", "1 hectare");
		assert.equal(oFormat.format(0, "area-hectare"), "0 ha", "0 hectare");
		assert.equal(oFormat.format(-123456.789, "area-hectare"), "-123 thousand ha", "-123 hectares");
		assert.equal(oFormat.format([-123456.789, "area-hectare"]), "-123 thousand ha", "-123 hectares");

	});

	QUnit.test("Unit format with sMeasure long style and showMeasure = false", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance({
			style: "long",
			showMeasure: false
		}, oLocale);
		assert.equal(oFormat.format(1, "duration-hour"), "1", "1 hour");
		assert.equal(oFormat.format(0, "duration-hour"), "0", "0 hours");
		assert.equal(oFormat.format(123456.789, "duration-hour"), "123 thousand", "123,456.789 hours");
		assert.equal(oFormat.format([123456.789, "duration-hour"]), "123 thousand", "123,456.789 hours");

		assert.equal(oFormat.format(1, "electric-ohm"), "1", "1 ohm");
		assert.equal(oFormat.format(0, "electric-ohm"), "0", "0 ohms");
		assert.equal(oFormat.format([-123456.789, "electric-ohm"]), "-123 thousand", "-123 ohms");
		assert.equal(oFormat.format(-123456.789, "electric-ohm"), "-123 thousand", "-123 ohms");

		assert.equal(oFormat.format(1, "frequency-hertz"), "1", "1 hertz");
		assert.equal(oFormat.format(0, "frequency-hertz"), "0", "0 hertz");
		assert.equal(oFormat.format(123456.789, "frequency-hertz"), "123 thousand", "123 hertz");
		assert.equal(oFormat.format([123456.789, "frequency-hertz"]), "123 thousand", "123 hertz");

		assert.equal(oFormat.format(1, "area-hectare"), "1", "1 hectare");
		assert.equal(oFormat.format(0, "area-hectare"), "0", "0 hectare");
		assert.equal(oFormat.format(-123456.789, "area-hectare"), "-123 thousand", "-123 hectares");
		assert.equal(oFormat.format([-123456.789, "area-hectare"]), "-123 thousand", "-123 hectares");

	});

	QUnit.test("Unit format with decimals", function (assert) {
		var oLocale = new Locale("cs");
		var oFormat = NumberFormat.getUnitInstance({
			customUnits: {
				"steven": {
					"displayName": "cgal",
					"unitPattern-count-one": "{0} cgal",
					"unitPattern-count-few": "{0} cgal",
					"unitPattern-count-many": "{0} cgal",
					"unitPattern-count-other": "{0} cgal",
					"decimals": 2
				}
			}
		}, oLocale);

		assert.equal(oFormat.format(1, "steven"), "1,00 cgal", "1,00 cgal");
		assert.equal(oFormat.format(1.1, "steven"), "1,10 cgal", "1,10 cgal");
		assert.equal(oFormat.format(1.12, "steven"), "1,12 cgal", "1,12 cgal");
		assert.equal(oFormat.format(1.123, "steven"), "1,12 cgal", "1,12 cgal");
		assert.equal(oFormat.format(1.125, "steven"), "1,13 cgal", "1,13 cgal");
	});

	QUnit.test("Unit format with precision", function (assert) {
		var oLocale = new Locale("cs");
		var oFormat = NumberFormat.getUnitInstance({
			customUnits: {
				"steven": {
					"displayName": "cgal",
					"unitPattern-count-one": "{0} cgal",
					"unitPattern-count-few": "{0} cgal",
					"unitPattern-count-many": "{0} cgal",
					"unitPattern-count-other": "{0} cgal",
					"precision": 4
				}
			}
		}, oLocale);

		assert.equal(oFormat.format(1, "steven"), "1 cgal", "1,00 cgal");
		assert.equal(oFormat.format(1.1, "steven"), "1,1 cgal", "1,10 cgal");
		assert.equal(oFormat.format(1.12, "steven"), "1,12 cgal", "1,12 cgal");
		assert.equal(oFormat.format(1.123, "steven"), "1,123 cgal", "1,12 cgal");
		assert.equal(oFormat.format(1.125, "steven"), "1,125 cgal", "1,125 cgal");
	});

	QUnit.test("Unit format with global configuration overwritten by format instance", function (assert) {
		var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();
		var oConfigObject = {
			"steven": {
				"unitPattern-count-one": "{0} tylr",
				"unitPattern-count-few": "{0} tylrs",
				"unitPattern-count-many": "{0} tylrs",
				"unitPattern-count-other": "{0} tylrs",
				"decimals": 8
			}
		};
		oFormatSettings.setCustomUnits(oConfigObject);

		var oFormat = NumberFormat.getUnitInstance({
			customUnits: {
				"steven": {
					"displayName": "cgal",
					"unitPattern-count-one": "{0} cgal",
					"unitPattern-count-few": "{0} cgals",
					"unitPattern-count-many": "{0} cgals",
					"unitPattern-count-other": "{0} cgals",
					"decimals": 4
				}
			}
		});

		var oFormat2 = NumberFormat.getUnitInstance({
			customUnits: {
				"steven": {
					"displayName": "cgal",
					"unitPattern-count-one": "{0} cgal",
					"unitPattern-count-few": "{0} cgals",
					"unitPattern-count-many": "{0} cgals",
					"unitPattern-count-other": "{0} cgals",
					"precision": 3
				}
			}
		});

		var oFormat3 = NumberFormat.getUnitInstance({
			customUnits: {
				"steven": {
					"displayName": "cgal",
					"unitPattern-count-one": "{0} cgal",
					"unitPattern-count-few": "{0} cgals",
					"unitPattern-count-many": "{0} cgals",
					"unitPattern-count-other": "{0} cgals",
					"decimals": 0
				}
			}
		});

		var oFormat4 = NumberFormat.getUnitInstance({
			customUnits: {
				"steven": {
					"displayName": "cgal",
					"unitPattern-count-one": "{0} cgal",
					"unitPattern-count-few": "{0} cgals",
					"unitPattern-count-many": "{0} cgals",
					"unitPattern-count-other": "{0} cgals",
					"precision": 0
				}
			}
		});

		var oFormatFallback = NumberFormat.getUnitInstance();

		// custom decimals
		assert.equal(oFormat.format(1, "steven"), "1.0000 cgals", "1.0000 cgals");
		assert.equal(oFormat.format(1.1, "steven"), "1.1000 cgals", "1.1000 cgals");
		assert.equal(oFormat.format(1.12, "steven"), "1.1200 cgals", "1.1200 cgals");
		assert.equal(oFormat.format(1.123, "steven"), "1.1230 cgals", "1.1230 cgals");
		assert.equal(oFormat.format(1.125, "steven"), "1.1250 cgals", "1.1250 cgals");

		// custom precision
		assert.equal(oFormat2.format(1, "steven"), "1 cgal", "1 cgal");
		assert.equal(oFormat2.format(1.1, "steven"), "1.1 cgals", "1.1 cgals");
		assert.equal(oFormat2.format(1.12, "steven"), "1.12 cgals", "1.12 cgals");
		assert.equal(oFormat2.format(1.123, "steven"), "1.12 cgals", "1.12 cgals");
		assert.equal(oFormat2.format(1.125, "steven"), "1.13 cgals", "1.13 cgals");

		// custom decimals
		assert.equal(oFormat3.format(1, "steven"), "1 cgal", "1 cgal");
		assert.equal(oFormat3.format(1.1, "steven"), "1 cgal", "1 cgal");
		assert.equal(oFormat3.format(1.12, "steven"), "1 cgal", "1 cgal");
		assert.equal(oFormat3.format(1.123, "steven"), "1 cgal", "1 cgal");
		assert.equal(oFormat3.format(1.525, "steven"), "2 cgals", "1 cgal");

		// custom precision
		assert.equal(oFormat4.format(1, "steven"), "1 cgal", "1 cgal");
		assert.equal(oFormat4.format(1.1, "steven"), "1 cgal", "1 cgal");
		assert.equal(oFormat4.format(1.12, "steven"), "1 cgal", "1 cgal");
		assert.equal(oFormat4.format(1.123, "steven"), "1 cgal", "1 cgal");
		assert.equal(oFormat4.format(1.525, "steven"), "2 cgals", "1 cgal");

		// fallback to Configuration
		assert.equal(oFormatFallback.format(1, "steven"), "1.00000000 tylrs", "1.00000000 tylrs");
		assert.equal(oFormatFallback.format(1.1, "steven"), "1.10000000 tylrs", "1.10000000 tylrs");
		assert.equal(oFormatFallback.format(1.12, "steven"), "1.12000000 tylrs", "1.12000000 tylrs");
		assert.equal(oFormatFallback.format(1.123, "steven"), "1.12300000 tylrs", "1.12300000 tylrs");
		assert.equal(oFormatFallback.format(1.125, "steven"), "1.12500000 tylrs", "1.12500000 tylrs");
	});

	QUnit.test("Unit parse with sMeasure", function (assert) {

		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance(oLocale);
		var aResult = oFormat.parse("1 hr");
		assert.deepEqual(aResult, [1, "duration-hour"], "Number and unit is parsed correctly");

		aResult = oFormat.parse("10e-1 hr");
		assert.deepEqual(aResult, [1, "duration-hour"], "Number and unit is parsed correctly");
	});

	QUnit.test("Unit parse with sMeasure - parseAsString", function (assert) {

		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance({
			parseAsString: true
		}, oLocale);
		var aResult = oFormat.parse("123 hr");
		assert.deepEqual(aResult, ["123", "duration-hour"], "Number and unit is parsed correctly");


		aResult = oFormat.parse("10e-1 hr");
		assert.deepEqual(aResult, ["1.0", "duration-hour"], "Number and unit is parsed correctly");
	});

	QUnit.test("Unit parse with sMeasure & special plural forms (e.g. AR locale)", function (assert) {
		var oLocale = new Locale("ar");
		var oFormat = NumberFormat.getUnitInstance(oLocale);
		var aResult = oFormat.parse("درجة");

		//matches -one pattern
		assert.deepEqual(aResult, [1, "angle-degree"], "Number and unit is parsed correctly");

		//matches -two pattern
		aResult = oFormat.parse("درجتان");
		assert.deepEqual(aResult, [2, "angle-degree"], "Number and unit is parsed correctly");
	});

	QUnit.test("Unit parse with missing units", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance(oLocale);
		var aResult = oFormat.parse("1234");

		assert.equal(aResult, null, "Unit is missing");
	});

	QUnit.test("Unit parse with ambiguous units (e.g. en locale)", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance(oLocale);
		var aResult = oFormat.parse("100 c");

		// number can be uniquely determined but unit is ambiguous
		assert.deepEqual(aResult, [100, undefined], "Number and unit is parsed correctly");
	});

	QUnit.test("Unit parse with sMeasure and unknown Unit", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance(oLocale);

		var aResult = oFormat.parse("123 TER");
		assert.equal(aResult, null, "unit cannot be found");

		aResult = oFormat.parse("TER 1234");
		assert.equal(aResult, null, "unit cannot be found");
	});

	QUnit.test("Unit parse with sMeasure and Wrong Number or Unit value", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance(oLocale);

		var aResult = oFormat.parse("1r2 deg");
		assert.equal(aResult, null, "Broken Number is recognized -> null result");

		aResult = oFormat.parse("null foo");
		assert.equal(aResult, null, "Broken Number and Unit is recognized -> null result");

		aResult = oFormat.parse("deg");
		assert.equal(aResult, null, "Broken Number and Unit is recognized -> null result");

		// parseAsString does not change anything
		oFormat = NumberFormat.getUnitInstance({
			parseAsString: true
		}, oLocale);
		aResult = oFormat.parse("1r2 deg");

		assert.equal(aResult, null, "broken Number is recognized -> null value");
	});

	QUnit.test("Unit parse with sMeasure english long", function (assert) {

		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getUnitInstance({ "style": "long" }, oLocale);
		var aResult = oFormat.parse("1 thousand hr");
		assert.ok(Array.isArray(aResult), "Unit parser should return an array");
		assert.equal(aResult[0], 1000, "Number is parsed correctly");
		assert.equal(aResult[1], "duration-hour", "hour expression from pattern \"{1} hr\"");


		aResult = oFormat.parse("17 million hr");
		assert.ok(Array.isArray(aResult), "Unit parser should return an array");
		assert.equal(aResult[0], 17000000, "Number is parsed correctly");
		assert.equal(aResult[1], "duration-hour", "hour expression from pattern \"{1} hr\"");

	});

	QUnit.test("Unit parse with sMeasure complex cldr polish", function (assert) {

		var oLocale = new Locale("pl_PL");
		var oFormat = NumberFormat.getUnitInstance(oLocale);
		var aResult = oFormat.parse("1 234 567 mi/h");
		assert.ok(Array.isArray(aResult), "Unit parser should return an array");
		assert.equal(aResult[0], 1234567, "Number is parsed correctly");
		assert.equal(aResult[1], "speed-mile-per-hour", "hour expression from pattern \"{0}  mi/h\"");

		aResult = oFormat.parse("0,5 mi/h");
		assert.ok(Array.isArray(aResult), "Unit parser should return an array");
		assert.equal(aResult[0], 0.5, "Number is parsed correctly");
		assert.equal(aResult[1], "speed-mile-per-hour", "hour expression from pattern \"{0}  mi/h	\"");

	});


	QUnit.test("Unit parse with sMeasure complex cldr polish long", function (assert) {

		var oLocale = new Locale("pl_PL");
		var oFormat = NumberFormat.getUnitInstance({ style: "long" }, oLocale);
		var aResult = oFormat.parse("123 tysiące mi/h");
		assert.ok(Array.isArray(aResult), "Unit parser should return an array");
		assert.equal(aResult[0], 123000, "Number is parsed correctly");
		assert.equal(aResult[1], "speed-mile-per-hour", "hour expression from pattern \"{0}  mi/h\"");

		aResult = oFormat.parse("500 mi/h");
		assert.ok(Array.isArray(aResult), "Unit parser should return an array");
		assert.equal(aResult[0], 500, "Number is parsed correctly");
		assert.equal(aResult[1], "speed-mile-per-hour", "hour expression from pattern \"{0}  mi/h	\"");

	});


	QUnit.module("Currency Format");

	QUnit.test("Currency Format with fraction as decimals", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance({minFractionDigits:6, maxFractionDigits: 6});
		assert.equal(oFormat.format(2, "EUR"), "EUR" + "\xa0" + "2.000000", "fractions should set the decimals if not specified");
	});

	QUnit.test("Currency format with sMeasure and showMeasure as symbol", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			currencyCode: false
		});
		assert.equal(oFormat.format(123456.789, "EUR"), "\u20ac" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format([123456.789, "EUR"]), "\u20ac" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format(-123456.789, "EUR"), "\u20ac\ufeff" + "-123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format([-123456.789, "EUR"]), "\u20ac\ufeff" + "-123,456.79", "123456.789 EUR");
	});


	QUnit.test("Currency format with custom number of decimals", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			currencyCode: false
		});
		assert.equal(oFormat.format(123456.789, "EUR"), "\u20ac" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format(123456.789, "JPY"), "\u00a5" + "123,457", "123456.789 YEN");
		assert.equal(oFormat.format(123456.789, "CZK"), "CZK\xa0" + "123,456.79", "123456.789 CZK");
		assert.equal(oFormat.format(123456.789, "BTC"), "BTC\xa0" + "123,456.79", "123456.79 BTC");

		// set custom currency digits
		sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies({
			"EUR": { "digits": 1 },
			"JPY": { "digits": 3 },
			"CZK": { "digits": 3 },
			"BTC": { "digits": 5 }
		});

		oFormat = NumberFormat.getCurrencyInstance({
			currencyCode: false
		});
		assert.equal(oFormat.format(123456.789, "EUR"), "\u20ac" + "123,456.8", "123456.789 EUR");
		assert.equal(oFormat.format(123456.789, "JPY"), "\u00a5" + "123,456.789", "123456.789 YEN");
		assert.equal(oFormat.format(123456.789, "CZK"), "CZK\xa0" + "123,456.789", "123456.789 CZK");
		assert.equal(oFormat.format(123456.789, "BTC"), "BTC\xa0" + "123,456.78900", "123456.789 BTC");

		// add custom currencies
		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies({
			"DEFAULT": { "digits": 6 }
		});
		oFormat = NumberFormat.getCurrencyInstance({
			currencyCode: false
		});
		assert.equal(oFormat.format(123456.789, "EUR"), "\u20ac" + "123,456.8", "123456.789 EUR");
		assert.equal(oFormat.format(123456.789, "MON"), "MON\xa0" + "123,456.789000", "123456.789 MON");

		// reset custom currencies
		sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();

		oFormat = NumberFormat.getCurrencyInstance({
			currencyCode: false
		});
		assert.equal(oFormat.format(123456.789, "EUR"), "\u20ac" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format(123456.789, "JPY"), "\u00a5" + "123,457", "123456.789 YEN");
		assert.equal(oFormat.format(123456.789, "CZK"), "CZK\xa0" + "123,456.79", "123456.789 CZK");
		assert.equal(oFormat.format(123456.789, "BTC"), "BTC\xa0" + "123,456.79", "123456.789 BTC");
	});

	QUnit.test("Currency format with sMeasure and showMeasure set to none", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			showMeasure: false
		});
		assert.equal(oFormat.format(123456.789, "EUR"), "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format([123456.789, "EUR"]), "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format(-123456.789, "EUR"), "-123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format([-123456.789, "EUR"]), "-123,456.79", "123456.789 EUR");
	});

	QUnit.module("Custom currencies - Unknown currencies", {
		afterEach: function() {
			// reset global configuration
			sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
		}
	});

	QUnit.test("Format using currency instance", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			customCurrencies: {
				"BTC": {
					"decimals": 3,
					"isoCode": "BTC"
				}
			}
		}), sFormatted = oFormat.format(123456.789, "EUR"); // Empty string "";

		assert.equal(sFormatted, "", "Empty string formatted.");
		assert.deepEqual(oFormat.parse(""), [NaN, undefined], "[NaN, undefined] is returned.");

		// emptyString: ""
		var oFormat3 = NumberFormat.getCurrencyInstance({
			emptyString: "",
			customCurrencies: {
				"BTC": {
					"decimals": 3,
					"isoCode": "BTC"
				}
			}
		}), sFormatted2 = oFormat.format(123456.789, "EUR"); // Empty string "";

		assert.equal(sFormatted2, "", "Empty string formatted.");
		assert.deepEqual(oFormat3.parse(""), ["", undefined], "['', undefined] is returned.");
	});

	QUnit.module("Custom currencies - simple formatting", {
		afterEach: function() {
			// reset global configuration
			sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
		}
	});

	QUnit.test("Parse symbol only", function(assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			customCurrencies: {
				"DOLLAR": {
					decimals: 3,
					symbol: "$"
				},
				"EURO": {
					decimals: 2,
					symbol: "€"
				},
				"Bitcoin": {
					decimals: 5,
					symbol: "Ƀ"
				}
			}
		});

		assert.deepEqual(oFormat.parse("$"), null, "Null is returned.");
		assert.deepEqual(oFormat.parse("€"), null, "Null is returned.");
		assert.deepEqual(oFormat.parse("Ƀ"), null, "Null is returned.");
	});

	QUnit.test("Missing decimals information in defined custom currencies", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ"
				}
			}
		});

		var sFormatted = oFormat.format(123456.789, "BTC");

		assert.equal(sFormatted, "BTC" + "\xa0" + "123,456.79", "Default decimals are 2");
	});

	QUnit.test("Custom Currencies defined via currency instance options", function (assert) {

		// Format $, to make sure there is no space between the symbol and the formatted number value
		var oFormat1 = NumberFormat.getCurrencyInstance({
			currencyCode: false
		}), sFormatted1 = oFormat1.format(123456.789, "USD");

		assert.equal(sFormatted1, "$123,456.79", "$123,456.79");

		// currencyCode: true
		var oFormat = NumberFormat.getCurrencyInstance({
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		}), sFormatted = oFormat.format(123456.789, "BTC");

		assert.equal(sFormatted, "BTC" + "\xa0" + "123,456.789", "BTC 123,456.789");
		assert.deepEqual(oFormat.parse(sFormatted), [123456.789, "BTC"], "Array [123456.789, 'BTC'] is returned.");

		// currencyCode: false
		var oFormat2 = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		}), sFormatted2 = oFormat2.format(123456.789, "BTC");

		assert.equal(sFormatted2, "Ƀ\xa0123,456.789", "Ƀ\xa0123,456.789");
		assert.deepEqual(oFormat.parse(sFormatted2), [123456.789, "BTC"], "Array [123456.789, 'BTC'] is returned.");

		var oFormat3 = NumberFormat.getCurrencyInstance({
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		}, new Locale("de-x-sapufmt")), sFormatted3 = oFormat3.format(123456.789, "BTC");

		assert.equal(sFormatted3, "123.456,789" + "\xa0" + "BTC", "123.456,789 BTC");
		assert.deepEqual(oFormat3.parse(sFormatted3), [123456.789, "BTC"], "Array [123456.789, 'BTC'] is returned.");

		var oFormat4 = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"BTC": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		}, new Locale("de-x-sapufmt")), sFormatted4 = oFormat4.format(123456.789, "BTC");

		assert.equal(sFormatted4, "123.456,789" + "\xa0" + "Ƀ", "123.456,789 Ƀ");
		assert.deepEqual(oFormat4.parse(sFormatted4), [123456.789, "BTC"], "Array [123456.789, 'BTC'] is returned.");
	});

	QUnit.test("'decimals' set on FormatOptions and custom currency", function (assert) {
		var oFormatEN = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"FOB": {
					symbol: "F€",
					decimals: 6
				}
			},
			decimals: 1
		});

		assert.equal(oFormatEN.format(1234.5728, "FOB"), "F€1,234.572800", "formatted with 6 decimals - en");

		var oFormatDE = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"HOD": {
					symbol: "H$",
					decimals: 4
				}
			},
			decimals: 1
		}, new Locale("de"));

		assert.equal(oFormatDE.format(1234.5728, "HOD"), "1.234,5728" + "\xa0" + "H$", "formatted with 4 decimals - de");
	});

	QUnit.test("'decimals' only set on format-options", function (assert) {
		// custom currency
		var oFormatEN = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"FOB": {
					symbol: "F€"
				}
			},
			decimals: 3
		});

		assert.equal(oFormatEN.format(1234.5728, "FOB"), "F€1,234.573", "formatted with default 2 decimals - en");

		// known currency
		var oFormatDE = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			decimals: 1
		}, new Locale("de"));

		assert.equal(oFormatDE.format(1234.5728, "HUF"), "1.234,6" + "\xa0" + "HUF", "formatted with default 2 decimals - de");
	});

	QUnit.test("no 'decimals' set at all", function (assert) {
		var oFormatEN = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"FOB": {
					symbol: "F€"
				}
			}
		});

		assert.equal(oFormatEN.format(1234.5728, "FOB"), "F€1,234.57", "formatted with default 2 decimals - en");

		var oFormatDE = NumberFormat.getCurrencyInstance({
			currencyCode: false
		}, new Locale("de"));

		assert.equal(oFormatDE.format(1234.5728, "HUF"), "1.235" + "\xa0" + "HUF", "formatted with default 2 decimals - de");
	});

	QUnit.module("Custom currencies - currencyCode: false", {
		afterEach: function() {
			// reset global configuration
			sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
		}
	});

	QUnit.test("Format with currency symbol w/o symbol mixed in", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"Bitcoin": {
					"symbol": "Ƀ",
					"decimals": 3
				}
			}
		}), sFormatted = oFormat.format(123456.789, "Bitcoin");

		assert.equal(sFormatted, "Ƀ" + "\xa0" + "123,456.789", "'Ƀ 123,456.789' is formatted");
		assert.deepEqual(oFormat.parse(sFormatted), [123456.789, 'Bitcoin'], "[123456.789, 'Bitcoin']");
	});

	QUnit.test("Format with currency symbol with isoCode lookup", function (assert) {
		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies({
			"BTC": {
				"symbol": "Ƀ",
				"decimals": 5
			}
		});

		var oFormat = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"Bitcoin": {
					"decimals": 3,
					"isoCode": "BTC"
				},
				"EURO": {
					"decimals": 2,
					"isoCode": "EUR"
				},
				"DOLLAR": {
					"decimals": 4
				}
			}
		});

		// symbol lookup in global configuration
		assert.equal(oFormat.format(123456.789, "Bitcoin"), "Ƀ" + "\xa0" + "123,456.789", "Ƀ 123,456.789 - symbol lookup in global configuration.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "Bitcoin")), [123456.789, "Bitcoin"], "[123456.789, 'Bitcoin']");

		// symbol lookup in CLDR
		assert.equal(oFormat.format(123456.789, "EURO"), "€123,456.79", "€123,456.79 - symbol lookup in CLDR");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "EURO")), [123456.79, "EURO"], "[123456.79, 'EURO']");

		// currency symbol is n/a in the options
		assert.equal(oFormat.format(123456.789, "DOLLAR"), "DOLLAR" + "\xa0" + "123,456.7890", "DOLLAR 123,456.7890.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "DOLLAR")), [123456.789, "DOLLAR"], "[123456.789, 'DOLLAR']");
	});

	QUnit.test("Format with currencies with symbol from global config", function (assert) {
		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies({
			"BTC": {
				symbol: "Ƀ"
			},
			"Bitcoin": {
				"digits": 3
			},
			"DOLLAR": {
				"digits": 4
			}
		});

		var oFormat = NumberFormat.getCurrencyInstance({
			currencyCode: false
		});

		assert.equal(oFormat.format(123456.789, "BTC"), "Ƀ" + "\xa0" + "123,456.79", "Ƀ 123,456.79 - symbol lookup in global configuration.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "BTC")), [123456.79, "BTC"], "[123456.79, 'BTC']");

		assert.equal(oFormat.format(123456.789, "Bitcoin"), "Bitcoin" + "\xa0" + "123,456.789", "Bitcoin 123,456.789 - No symbol found");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "Bitcoin")), [123456.789, "Bitcoin"], "[123456.789, 'Bitcoin']");

		// currency symbol is n/a in the options
		assert.equal(oFormat.format(123456.789, "DOLLAR"), "DOLLAR" + "\xa0" + "123,456.7890", "DOLLAR 123,456.7890.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "DOLLAR")), [123456.789, "DOLLAR"], "[123456.789, 'DOLLAR']");
	});

	QUnit.test("Format with currencies from global config", function (assert) {
		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies({
			"BTC": {
				symbol: "Ƀ"
			},
			"Bitcoin": {
				"digits": 3
			},
			"DOLLAR": {
				"digits": 4
			}
		});

		var oFormat = NumberFormat.getCurrencyInstance({
			currencyCode: true
		});

		assert.equal(oFormat.format(123456.789, "BTC"), "BTC" + "\xa0" + "123,456.79", "Ƀ 123,456.79 - symbol lookup in global configuration.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "BTC")), [123456.79, "BTC"], "[123456.79, 'BTC']");

		assert.equal(oFormat.format(123456.789, "Bitcoin"), "Bitcoin" + "\xa0" + "123,456.789", "Bitcoin 123,456.789 - No symbol found");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "Bitcoin")), [123456.789, "Bitcoin"], "[123456.789, 'Bitcoin']");

		// currency symbol is n/a in the options
		assert.equal(oFormat.format(123456.789, "DOLLAR"), "DOLLAR" + "\xa0" + "123,456.7890", "DOLLAR 123,456.7890.");
		assert.deepEqual(oFormat.parse(oFormat.format(123456.789, "DOLLAR")), [123456.789, "DOLLAR"], "[123456.789, 'DOLLAR']");
	});

	QUnit.module("Custom currencies - exclusive behaviour", {
		afterEach: function() {
			// reset global configuration
			sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
		}
	});

	QUnit.test("Custom Currencies instance overwrites global configuration", function (assert) {
		// global configuration
		sap.ui.getCore().getConfiguration().getFormatSettings().addCustomCurrencies({
			"DOLLAR": {
				"symbol": "$",
				"digits": 5
			}
		});

		var oCustomCurrencyOptions = {
			"DOLLAR": {
				"symbol": "$",
				"decimals": 3
			}
		};

		var oFormat1, oFormat2;
		oFormat1 = NumberFormat.getCurrencyInstance({
			customCurrencies: oCustomCurrencyOptions
		});

		oFormat2 = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: oCustomCurrencyOptions
		});

		assert.equal(oFormat1.format(12345.6789, "DOLLAR"), "DOLLAR" + "\xa0" + "12,345.679", "DOLLAR 12,345.679");
		assert.deepEqual(oFormat1.parse(oFormat1.format(12345.6789, "DOLLAR")), [12345.679, "DOLLAR"], "[12345.679, 'DOLLAR']");

		// Parse with symbol
		assert.deepEqual(oFormat1.parse("$12,345.679"), [12345.679, "DOLLAR"], "[12345.679, 'DOLLAR']");

		assert.equal(oFormat2.format(12345.6789, "DOLLAR"), "$12,345.679", "$12,345.679");
		assert.deepEqual(oFormat2.parse(oFormat2.format(12345.6789, "DOLLAR")), [12345.679, "DOLLAR"], "[12345.679, 'DOLLAR']");
	});

	QUnit.module("Custom currencies - complex cases", {
		afterEach: function() {
			// reset global configuration
			sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
		}
	});

	QUnit.test("Currencies with numbers in their names", function(assert) {
		// English
		var oFormatEN = NumberFormat.getCurrencyInstance({
			customCurrencies: {
				"DO": {
					"symbol": "US$",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"symbol": "$",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!",
					"decimals": 2
				}
			}
		});

		// these assertation also check if the longest match is found
		assert.equal(oFormatEN.format(1234.5678, "4DOL"), "4DOL" + "\xa0" + "1,234.57", "format in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("4DOL 1,234.57"), [1234.57, "4DOL"], "parse in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("4DOL1,234.57"), [1234.57, "4DOL"], "parse in English locale - number at the start - no delimiter");

		// smaller match should win
		assert.equal(oFormatEN.format(1234.5678, "DO"), "DO" + "\xa0" + "1,234.5678", "format in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("DO 1,234.5678"), [1234.5678, "DO"], "parse in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("DO1,234.56789"), [1234.56789, "DO"], "parse in English locale - number at the start - no delimiter");

		assert.equal(oFormatEN.format(1234.5678, "D4OL"), "D4OL" + "\xa0" + "1,234.6", "format in English locale - number in the middle");
		assert.deepEqual(oFormatEN.parse("D4OL 1,234.6"), [1234.6, "D4OL"], "parse in English locale - number in the middle");
		assert.deepEqual(oFormatEN.parse("D4OL1,234.6"), [1234.6, "D4OL"], "parse in English locale - number in the middle - no delimiter");

		assert.equal(oFormatEN.format(1234.5678, "DOL4"), "DOL4" + "\xa0" + "1,234.568", "format in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("DOL4 1,234.568"), [1234.568, "DOL4"], "parse in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("DOL41,234.568"), null, "parse in English locale - number at the end - no delimiter");

		// negative values
		assert.equal(oFormatEN.format(-1234.56789, "DO"), "DO" + "\ufeff" + "-1,234.5679", "format in English locale - short match");
		assert.deepEqual(oFormatEN.parse("DO -1,234.568"), [-1234.568, "DO"], "parse in English locale - short match");
		assert.deepEqual(oFormatEN.parse("DO-1,234.568"), [-1234.568, "DO"], "parse in English locale - short match - no delimiter");

		// reserved chars "." and ","
		assert.deepEqual(oFormatEN.parse("DOL4.568"), null, "parse in English locale - number at the end - not valid");
		assert.deepEqual(oFormatEN.parse("DOL4,234.568"), null, "parse in English locale - number at the end - not valid");

		// German
		var oFormatDE = NumberFormat.getCurrencyInstance({
			customCurrencies: {
				"DO": {
					"symbol": "US$",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"symbol": "$",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!",
					"decimals": 2
				}
			}
		}, new Locale("de"));

		// these assertation also check if the longest match is found
		assert.equal(oFormatDE.format(1234.5678, "4DOL"), "1.234,57" + "\xa0" + "4DOL", "format in German locale - number at the start");
		assert.deepEqual(oFormatDE.parse("1.234,57 4DOL"), [1234.57, "4DOL"], "parse in German locale - number at the start");
		assert.deepEqual(oFormatDE.parse("1.234,574DOL"), null, "parse in German locale - number at the start - no delimiter");

		// smaller match should win
		assert.equal(oFormatDE.format(1234.5678, "DO"), "1.234,5678" + "\xa0" + "DO", "format in German locale - short match");
		assert.deepEqual(oFormatDE.parse("1.234,5678 DO"), [1234.5678, "DO"], "parse in German locale - short match");
		assert.deepEqual(oFormatDE.parse("1.234,56789DO"), [1234.56789, "DO"], "parse in German locale - short match - no delimiter");

		assert.equal(oFormatDE.format(1234.5678, "D4OL"), "1.234,6" + "\xa0" + "D4OL", "format in German locale - number in the middle");
		assert.deepEqual(oFormatDE.parse("1.234,6 D4OL"), [1234.6, "D4OL"], "parse in German locale - number in the middle");
		assert.deepEqual(oFormatDE.parse("1.234,6D4OL"), [1234.6, "D4OL"], "parse in German locale - number in the middle - no delimiter");

		assert.equal(oFormatDE.format(1234.5678, "DOL4"), "1.234,568" + "\xa0" + "DOL4", "format in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("1.234,568 DOL4"), [1234.568, "DOL4"], "parse in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("1.234,568DOL4"), [1234.568, "DOL4"], "parse in German locale - number at the end - no delimiter");

		// negative values
		assert.equal(oFormatDE.format(-1234.56789, "DO"), "-1.234,5679" + "\xa0" + "DO", "format in German locale - short match");
		assert.deepEqual(oFormatDE.parse("-1.234,568 DO"), [-1234.568, "DO"], "parse in German locale - short match");
		assert.deepEqual(oFormatDE.parse("-1.234,568DO"), [-1234.568, "DO"], "parse in German locale - short match - no delimiter");

		// reserved chars "." and ","
		assert.deepEqual(oFormatDE.parse("568,4DOL"), null, "parse in German locale - number at the start - not valid");
		assert.deepEqual(oFormatDE.parse("568.4DOL"), null, "parse in German locale - number at the start - not valid");
	});

	QUnit.test("Currencies with numbers in their names - currencyCode: false", function(assert) {
		// English
		var oFormatEN = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"DO": {
					"symbol": "My#",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"isoCode": "USD",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!!",
					"decimals": 2
				}
			}
		});

		assert.equal(oFormatEN.format(1234.5678, "4DOL"), "!!\xa01,234.57", "format in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("!! 1,234.57"), [1234.57, "4DOL"], "parse in English locale - number at the start");
		assert.deepEqual(oFormatEN.parse("!!1,234.57"), [1234.57, "4DOL"], "parse in English locale - number at the start - no delimiter");

		assert.equal(oFormatEN.format(1234.5678, "D4OL"), "§\xa01,234.6", "format in English locale - number in the middle");
		assert.deepEqual(oFormatEN.parse("§ 1,234.6"), [1234.6, "D4OL"], "parse in English locale - number in the middle");
		assert.deepEqual(oFormatEN.parse("§1,234.6"), [1234.6, "D4OL"], "parse in English locale - number in the middle - no delimiter");

		assert.equal(oFormatEN.format(1234.5678, "DOL4"), "$1,234.568", "format in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("$ 1,234.568"), [1234.568, "DOL4"], "parse in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("$1,234.568"), [1234.568, "DOL4"], "parse in English locale - number at the end - no delimiter");

		assert.equal(oFormatEN.format(1234.56789, "DO"), "My#\xa01,234.5679", "format in English locale - short match");
		assert.deepEqual(oFormatEN.parse("My# 1,234.568"), [1234.568, "DO"], "parse in English locale - short match");
		assert.deepEqual(oFormatEN.parse("My#1,234.568"), [1234.568, "DO"], "parse in English locale - short match - no delimiter");

		assert.equal(oFormatEN.format(-1234.5678, "DOL4"), "$" + "\ufeff" + "-1,234.568", "format in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("$ -1,234.568"), [-1234.568, "DOL4"], "parse in English locale - number at the end");
		assert.deepEqual(oFormatEN.parse("$-1,234.568"), [-1234.568, "DOL4"], "parse in English locale - number at the end - no delimiter");

		assert.equal(oFormatEN.format(-1234.56789, "DO"), "My#" + "\ufeff" + "-1,234.5679", "format in English locale - short match");
		assert.deepEqual(oFormatEN.parse("My# -1,234.568"), [-1234.568, "DO"], "parse in English locale - short match");
		assert.deepEqual(oFormatEN.parse("My#-1,234.568"), [-1234.568, "DO"], "parse in English locale - short match - no delimiter");

		// German
		var oFormatDE = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"DO": {
					"symbol": "My#",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"isoCode": "USD",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!!",
					"decimals": 2
				}
			}
		}, new Locale("de"));

		assert.equal(oFormatDE.format(1234.5678, "4DOL"), "1.234,57" + "\xa0" + "!!", "format in German locale - number at the start");
		assert.deepEqual(oFormatDE.parse("1.234,57 !!"), [1234.57, "4DOL"], "parse in German locale - number at the start");
		assert.deepEqual(oFormatDE.parse("1.234,57!!"), [1234.57, "4DOL"], "parse in German locale - number at the start - no delimiter");

		assert.equal(oFormatDE.format(1234.5678, "D4OL"), "1.234,6" + "\xa0" + "§", "format in German locale - number in the middle");
		assert.deepEqual(oFormatDE.parse("1.234,6 §"), [1234.6, "D4OL"], "parse in German locale - number in the middle");
		assert.deepEqual(oFormatDE.parse("1.234,6§"), [1234.6, "D4OL"], "parse in German locale - number in the middle - no delimiter");

		assert.equal(oFormatDE.format(1234.5678, "DOL4"), "1.234,568" + "\xa0" + "$", "format in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("1.234,568 $"), [1234.568, "DOL4"], "parse in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("1.234,568$"), [1234.568, "DOL4"], "parse in German locale - number at the end - no delimiter");

		assert.equal(oFormatDE.format(1234.5678, "DO"), "1.234,5678" + "\xa0" + "My#", "format in German locale - short match");
		assert.deepEqual(oFormatDE.parse("1.234,568 My#"), [1234.568, "DO"], "parse in German locale - short match");
		assert.deepEqual(oFormatDE.parse("1.234,568My#"), [1234.568, "DO"], "parse in German locale - short match - no delimiter");

		assert.equal(oFormatDE.format(-1234.5678, "DOL4"), "-1.234,568" + "\xa0" + "$", "format in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("-1.234,568 $"), [-1234.568, "DOL4"], "parse in German locale - number at the end");
		assert.deepEqual(oFormatDE.parse("-1.234,568$"), [-1234.568, "DOL4"], "parse in German locale - number at the end - no delimiter");

		assert.equal(oFormatDE.format(-1234.5678, "DO"), "-1.234,5678" + "\xa0" + "My#", "format in German locale - short match");
		assert.deepEqual(oFormatDE.parse("-1.234,568 My#"), [-1234.568, "DO"], "parse in German locale - short match");
		assert.deepEqual(oFormatDE.parse("-1.234,568My#"), [-1234.568, "DO"], "parse in German locale - short match - no delimiter");
	});

	QUnit.test("Currencies with numbers in their names - currencyContext: 'accounting'", function(assert) {
		// English
		var oFormatEN = NumberFormat.getCurrencyInstance({
			currencyContext: "accounting",
			customCurrencies: {
				"DO": {
					"symbol": "US$",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"symbol": "$",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!",
					"decimals": 2
				}
			}
		});

		// these assertation also check if the longest match is found
		assert.equal(oFormatEN.format(-1234.5678, "4DOL"), "(4DOL\xa01,234.57)", "format in English locale - number at the start");
		assert.equal(oFormatEN.format(1234.5678, "4DOL"), "4DOL\xa01,234.57", "format in English locale - number at the start");

		// smaller match should win
		assert.equal(oFormatEN.format(-1234.5678, "DO"), "(DO\xa01,234.5678)", "format in English locale - number at the start");
		assert.equal(oFormatEN.format(1234.5678, "DO"), "DO\xa01,234.5678", "format in English locale - number at the start");

		assert.equal(oFormatEN.format(-1234.5678, "D4OL"), "(D4OL\xa01,234.6)", "format in English locale - number in the middle");
		assert.equal(oFormatEN.format(1234.5678, "D4OL"), "D4OL\xa01,234.6", "format in English locale - number in the middle");

		assert.equal(oFormatEN.format(-1234.5678, "DOL4"), "(DOL4\xa01,234.568)", "format in English locale - number at the end");
		assert.equal(oFormatEN.format(1234.5678, "DOL4"), "DOL4\xa01,234.568", "format in English locale - number at the end");

		// German
		var oFormatDE = NumberFormat.getCurrencyInstance({
			currencyContext: "accounting",
			customCurrencies: {
				"DO": {
					"symbol": "US$",
					"decimals": 4
				},
				"DOL": {
					"decimals": 1
				},
				"DOL4": {
					"symbol": "$",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				},
				"4DOL": {
					"symbol": "!",
					"decimals": 2
				}
			}
		}, new Locale("de"));

		// these assertation also check if the longest match is found
		assert.equal(oFormatDE.format(1234.5678, "4DOL"), "1.234,57\xa04DOL", "format in German locale - number at the start");
		assert.equal(oFormatDE.format(-1234.5678, "4DOL"), "-1.234,57\xa04DOL", "format in German locale - number at the start");

		// smaller match should win
		assert.equal(oFormatDE.format(1234.5678, "DO"), "1.234,5678\xa0DO", "format in German locale - short match");
		assert.equal(oFormatDE.format(-1234.5678, "DO"), "-1.234,5678\xa0DO", "format in German locale - short match");

		assert.equal(oFormatDE.format(1234.5678, "D4OL"), "1.234,6\xa0D4OL", "format in German locale - number in the middle");
		assert.equal(oFormatDE.format(-1234.5678, "D4OL"), "-1.234,6\xa0D4OL", "format in German locale - number in the middle");

		assert.equal(oFormatDE.format(1234.5678, "DOL4"), "1.234,568\xa0DOL4", "format in German locale - number at the end");
		assert.equal(oFormatDE.format(-1234.5678, "DOL4"), "-1.234,568\xa0DOL4", "format in German locale - number at the end");
	});

	QUnit.test("Currencies with numbers in their names - Log", function(assert) {
		var oLogSpy = this.spy(Log, "error");

		// English
		var oFormatEN = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"DOL": {
					"symbol": "$",
					"decimals": 1
				},
				"DOL4": {
					"symbol": "$",
					"decimals": 3
				},
				"D4OL": {
					"symbol": "§",
					"decimals": 1
				}
			}
		});

		assert.ok(oLogSpy.calledOnceWith("Symbol '$' is defined multiple times in custom currencies.", undefined, "NumberFormat"),
			"Correct error log is displayed.");
		assert.equal(oFormatEN.format(1234.5678, "DOL"), "$1,234.6", "format in English locale - number at the start");
		assert.equal(oFormatEN.format(1234.5678, "DOL4"), "$1,234.568", "format in English locale - number at the start");

		// restore spy
		oLogSpy.resetHistory();
	});

	QUnit.module("Custom currencies - Ambiguous currency information", {
		afterEach: function() {
			// reset global configuration
			sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
		}
	});

	QUnit.test("Multiple custom currencies with same currency symbol", function(assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			customCurrencies: {
				"IOTA": {
					decimals: 3,
					symbol: "y"
				},
				"MON": {
					decimals: 2,
					symbol: "µ"
				},
				"MONERO": {
					decimals: 5,
					symbol: "µ"
				}
			}
		});

		assert.equal(oFormat.format(12345.6789, "MON"), "MON" + "\xa0" + "12,345.68", "MON 12,345.68");
		assert.equal(oFormat.format(12345.6789, "MONERO"), "MONERO" + "\xa0" + "12,345.67890", "MONERO 12,345.6789");
		assert.deepEqual(oFormat.parse("µ12,345.679"), [12345.679, undefined], "[12345.679, undefined] returned.");

		var oFormat2 = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"EUR5": {
					"isoCode": "EUR",
					decimals: 5
				},
				"EU": {
					symbol: "€",
					decimals: 2
				}
			}
		});

		assert.equal(oFormat2.format(12345.6789, "EUR5"), "€12,345.67890", "€12,345.68");
		assert.equal(oFormat2.format(12345.6789, "EU"), "€12,345.68", "€12,345.6789");
		assert.deepEqual(oFormat2.parse("€12,345.679"), [12345.679, undefined], "[12345.679, undefined] returned.");
	});

	QUnit.test("Duplicated symbol defined via custom currency", function(assert) {
		sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies({
			"EURO": {
				"digits": 5,
				"isoCode": "EUR"
			}
		});

		var oFormat = NumberFormat.getCurrencyInstance({
			currencyCode: false
		});

		assert.deepEqual(oFormat.parse("€12,345.679"), [12345.679, undefined], "Duplicated symbol found");
	});

	QUnit.test("Currencies with undefined symbol", function(assert) {
		var oSpy = this.spy(Log, "error");

		var oFormat = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"BTC": {
					symbol: "Ƀ"
				},
				"Bitcoin": {
					isoCode: "foo",
					"decimals": 3
				},
				"DOLLAR": {
					isoCode: "foo",
					"decimals": 4
				}
			}
		});

		assert.equal(oFormat.format(123, "Bitcoin"), "Bitcoin 123.000");

		assert.equal(oSpy.callCount, 0, "Error log for duplicated currencies was was not called");

		oSpy.restore();
	});

	QUnit.test("decimals = 0", function (assert) {
		var oFormatEN = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"FOB": {
					symbol: "F€",
					decimals: 0
				}
			}
		});
		assert.equal(oFormatEN.format(undefined, undefined), "", "no values returns an empty string - en");
		assert.equal(oFormatEN.format(1234.56, undefined), "1,234.56", "only number formatted - en");
		assert.equal(oFormatEN.format(1234.5728, "FOB"), "F€1,235", "formatted both - en");

		var oFormatDE = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			customCurrencies: {
				"HOD": {
					symbol: "H$",
					decimals: 0
				}
			}
		}, new Locale("de"));
		assert.equal(oFormatDE.format(undefined, undefined), "", "no values returns an empty string - de");
		assert.equal(oFormatDE.format(1234.56, undefined), "1.234,56", "only number formatted - de");
		assert.equal(oFormatDE.format(1234.5728, "HOD"), "1.235" + "\xa0" + "H$", "formatted both - de");
	});

	QUnit.module("Custom currencies - parseAsString: true", {
		afterEach: function() {
			// reset global configuration
			sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
		}
	});

	QUnit.test("Parse simple number", function(assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			parseAsString: true,
			customCurrencies: {
				"DOLLAR": {
					decimals: 3,
					symbol: "$"
				},
				"IOTA": {
					decimals: 5,
					symbol: "y"
				}
			}
		});

		assert.deepEqual(oFormat.parse("DOLLAR" + "\xa0" + "123.457"), ["123.457", "DOLLAR"], "['123.457', 'DOLLAR']");

		// Ingnore decimal setting (5) for the IOTA currency
		assert.deepEqual(oFormat.parse("IOTA" + "\xa0" + "123.45788888"), ["123.45788888", "IOTA"], "['123.4578888', 'IOTA']");

		assert.deepEqual(oFormat.parse("DOLLAR" + "\xa0" + "123,456.789"), ["123456.789", "DOLLAR"], "['123456.789', 'DOLLAR']");

		// Max safe integer (2^53)-1  ->  9007199254740991
		assert.deepEqual(oFormat.parse("DOLLAR" + "\xa0" + "9,007,199,254,740,991.000"), ["9007199254740991.000", "DOLLAR"], "['9007199254740991.000', 'DOLLAR']");

		// Larger than max safe integer
		assert.deepEqual(oFormat.parse("DOLLAR" + "\xa0" + "9,007,199,254,740,991,678.000"), ["9007199254740991678.000", "DOLLAR"], "['9007199254740991678.000', 'DOLLAR']");
	});

	QUnit.test("Parse negative number (with and w/o invisible non-breaking space)", function(assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			parseAsString: true,
			customCurrencies: {
				"DOLLAR": {
					decimals: 3,
					symbol: "$"
				},
				"IOTA": {
					decimals: 5,
					symbol: "y"
				}
			}
		});
		assert.deepEqual(oFormat.parse("DOLLAR-123.457"), ["-123.457", "DOLLAR"], "['-123.457', 'DOLLAR']");
		assert.deepEqual(oFormat.parse("DOLLAR" + "\ufeff" + "-123.457"), ["-123.457", "DOLLAR"], "['-123.457', 'DOLLAR']");

		assert.deepEqual(oFormat.parse(oFormat.format(-123.457, "DOLLAR")), ["-123.457", "DOLLAR"], "['-123.457', 'DOLLAR']");
	});

	QUnit.test("Parse simple number with symbol", function(assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			parseAsString: true,
			customCurrencies: {
				"DOLLAR": {
					decimals: 4,
					symbol: "$"
				},
				"IOTA": {
					decimals: 5,
					symbol: "y"
				}
			}
		});

		assert.deepEqual(oFormat.parse("$123.457"), ["123.457", "DOLLAR"], "['123.457', 'DOLLAR']");
		assert.deepEqual(oFormat.parse("y123.457"), ["123.457", "IOTA"], "['123.457', 'IOTA']");

		// Don't show thousands separator in parsing result
		assert.deepEqual(oFormat.parse("$123,456.789"), ["123456.789", "DOLLAR"], "['123456.789', 'DOLLAR']");
		assert.deepEqual(oFormat.parse("y 123,456.789"), ["123456.789", "IOTA"], "['123456.789', 'IOTA']");
		assert.deepEqual(oFormat.parse("y123,456.789"), ["123456.789", "IOTA"], "['123456.789', 'IOTA']");
	});

	QUnit.test("Parse unknown currency", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			parseAsString: true,
			customCurrencies: {
				"BTC": {
					"decimals": 3,
					"isoCode": "BTC"
				}
			}
		});

		assert.deepEqual(oFormat.parse("EUR 123456,789"), null, "null is returned.");
	});

	QUnit.test("Parse symbol only", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			parseAsString: true,
			customCurrencies: {
				"Dollar": {
					"decimals": 5,
					"symbol": "$"
				}
			}
		});

		assert.deepEqual(oFormat.parse("$"), null, "Null is returned.");
	});

	QUnit.module("Standard Currency Formatting", {
		afterEach: function() {
			// reset global configuration
			sap.ui.getCore().getConfiguration().getFormatSettings().setCustomCurrencies();
		}
	});

	QUnit.test("Currency format with showMeasure true and currencyContext accounting", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			showMeasure: true,
			currencyContext: "accounting"
		});
		assert.equal(oFormat.format(123456.789, "EUR"), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format([123456.789, "EUR"]), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format(-123456.789, "EUR"), "(EUR" + "\xa0" + "123,456.79)", "123456.789 EUR");
		assert.equal(oFormat.format([-123456.789, "EUR"]), "(EUR" + "\xa0" + "123,456.79)", "123456.789 EUR");
	});

	QUnit.test("Currency format with showMeasure false and currencyContext accounting", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			showMeasure: false,
			currencyContext: "accounting"
		});
		assert.equal(oFormat.format(123456.789, "EUR"), "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format([123456.789, "EUR"]), "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format(-123456.789, "EUR"), "(123,456.79)", "123456.789 EUR");
		assert.equal(oFormat.format([-123456.789, "EUR"]), "(123,456.79)", "123456.789 EUR");
	});

	QUnit.test("Currency format with sMeasure specific locale ko", function (assert) {
		// The currency pattern is definde in "ko" as: ¤#,##0.00;(¤#,##0.00) where the pattern after ';'
		// should be used for negative numbers.
		var oLocale = new Locale("ko");
		var oFormat = NumberFormat.getCurrencyInstance({
			currencyContext: "accounting"
		}, oLocale);

		assert.equal(oFormat.format(123456.789, "EUR"), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format([123456.789, "EUR"]), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.equal(oFormat.format(-123456.789, "EUR"), "(EUR" + "\xa0" + "123,456.79)", "-123456.789 EUR");
		assert.equal(oFormat.format([-123456.789, "EUR"]), "(EUR" + "\xa0" + "123,456.79)", "-123456.789 EUR");
	});

	QUnit.test("Currency format with sMeaure and set decimal option to overwrite the default number of decimal", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			decimals: 1
		});

		assert.equal(oFormat.format(123456.789, "EUR"), "EUR" + "\xa0" + "123,456.8", "123456.789 EUR");
		assert.equal(oFormat.format([123456.789, "EUR"]), "EUR" + "\xa0" + "123,456.8", "123456.789 EUR");
		assert.equal(oFormat.format(-123456.789, "EUR"), "EUR" + "\ufeff" + "-123,456.8", "123456.789 EUR");
		assert.equal(oFormat.format([-123456.789, "EUR"]), "EUR" + "\ufeff" + "-123,456.8", "123456.789 EUR");
	});

	QUnit.test("Currency format with sMeaure and the precision option should be ignored", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			precision: 7
		});

		assert.equal(oFormat.format(123456, "EUR"), "EUR" + "\xa0" + "123,456.00", "123456 EUR");
		assert.equal(oFormat.format([123456.7, "EUR"]), "EUR" + "\xa0" + "123,456.70", "123456.7 EUR");
		assert.equal(oFormat.format(-123456.78, "EUR"), "EUR" + "\ufeff" + "-123,456.78", "-123456.78 EUR");
		assert.equal(oFormat.format([-123456.789, "EUR"]), "EUR" + "\ufeff" + "-123,456.79", "-123456.789 EUR");
	});

	QUnit.test("Currency format with sMeaure and style short. The default precision option shouldn't be ignored", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance({
			style: "short"
		});

		assert.equal(oFormat.format(123456, "EUR"), "EUR" + "\xa0" + "123K", "123456 EUR");
		assert.equal(oFormat.format([1234567.8, "EUR"]), "EUR" + "\xa0" + "1.2M", "123456.7 EUR");
		assert.equal(oFormat.format(12345678.9, "EUR"), "EUR" + "\xa0" + "12M", "-123456.78 EUR");
	});

	QUnit.test("check space between currency code and number in different scenarios", function (assert) {
		// in "en-US" locale there's no space in the currency pattern
		// space should be inserted when it's necessary
		var oCurrencyCodeFormatter = NumberFormat.getCurrencyInstance(),
			oCurrencySymbolFormatter = NumberFormat.getCurrencyInstance({
				currencyCode: false
			});

		assert.equal(oCurrencyCodeFormatter.format(123456.789, "EUR"), "EUR" + "\xa0" + "123,456.79", "123456.789 EUR");
		assert.equal(oCurrencyCodeFormatter.format(-123456.789, "EUR"), "EUR" + "\ufeff" + "-123,456.79", "-123456.789 EUR");
		assert.equal(oCurrencySymbolFormatter.format(123456.789, "EUR"), "\u20ac" + "123,456.79", "123456.789 EUR");
		assert.equal(oCurrencySymbolFormatter.format(-123456.789, "EUR"), "\u20ac\ufeff" + "-123,456.79", "-123456.789 EUR");
		assert.equal(oCurrencySymbolFormatter.format(123456.789, "HKD"), "HK$123,456.79", "123456.789 HKD");
		assert.equal(oCurrencySymbolFormatter.format(-123456.789, "HKD"), "HK$\ufeff-123,456.79", "-123456.789 HKD");

		// in "de-DE" locale there's already space in the currency pattern: #,##0.00 ¤
		// there shouldn't be more space inserted
		oCurrencyCodeFormatter = NumberFormat.getCurrencyInstance(new Locale("de-DE"));
		oCurrencySymbolFormatter = NumberFormat.getCurrencyInstance({
			currencyCode: false
		}, new Locale("de-DE"));

		assert.equal(oCurrencyCodeFormatter.format(123456.789, "EUR"), "123.456,79" + "\xa0" + "EUR", "123456.789 EUR");
		assert.equal(oCurrencyCodeFormatter.format(-123456.789, "EUR"), "-123.456,79" + "\xa0" + "EUR", "-123456.789 EUR");
		assert.equal(oCurrencySymbolFormatter.format(123456.789, "EUR"), "123.456,79" + "\xa0" + "\u20ac", "123456.789 EUR");
		assert.equal(oCurrencySymbolFormatter.format(-123456.789, "EUR"), "-123.456,79" + "\xa0" + "\u20ac", "-123456.789 EUR");
		assert.equal(oCurrencySymbolFormatter.format(123456.789, "HKD"), "123.456,79" + "\xa0" + "HK$", "123456.789 HKD");
		assert.equal(oCurrencySymbolFormatter.format(-123456.789, "HKD"), "-123.456,79" + "\xa0" + "HK$", "-123456.789 HKD");

		// in "uk" locale there's no space in the currency pattern and the symbol is at the end: #,##0.00¤
		// there shouldn't be more space inserted
		oCurrencyCodeFormatter = NumberFormat.getCurrencyInstance({
			currencyContext: "accounting"
		}, new Locale("uk"));
		oCurrencySymbolFormatter = NumberFormat.getCurrencyInstance({
			currencyCode: false,
			currencyContext: "accounting"
		}, new Locale("uk"));

		assert.equal(oCurrencyCodeFormatter.format(123456.789, "UAH"), "123" + "\xa0" + "456,79" + "\xa0" + "UAH", "123456.789 UAH");
		assert.equal(oCurrencyCodeFormatter.format(-123456.789, "UAH"), "-123" + "\xa0" + "456,79" + "\xa0" + "UAH", "-123456.789 UAH");
		assert.equal(oCurrencySymbolFormatter.format(123456.789, "UAH"), "123" + "\xa0" + "456,79" + "\xa0\u20b4", "123456.789 UAH");
		assert.equal(oCurrencySymbolFormatter.format(-123456.789, "UAH"), "-123" + "\xa0" + "456,79" + "\xa0\u20b4", "-123456.789 UAH");
		assert.equal(oCurrencySymbolFormatter.format(123456.789, "UAK"), "123" + "\xa0" + "456,79" + "\xa0\u043a\u0440\u0431\u002e", "123456.789 UAK");
		assert.equal(oCurrencySymbolFormatter.format(-123456.789, "UAK"), "-123" + "\xa0" + "456,79" + "\xa0\u043a\u0440\u0431\u002e", "-123456.789 UAK");
	});


	QUnit.test("Parse special characters (RTL) in currency string", function (assert) {
		var oLocale = new Locale("he");
		var oFormatter = NumberFormat.getCurrencyInstance({
			showMeasure: false,
			parseAsString: true

		}, oLocale);

		assert.deepEqual(oFormatter.parse("702.00"), ["702.00", undefined], "can be parsed properly");
		// from hebrew
		assert.deepEqual(oFormatter.parse("\u200f702.00\u200e"), ["702.00", undefined], "rtl character wrapped number can be parsed properly");
	});

	QUnit.test("Percent format with default rounding mode", function (assert) {
		var oFormat = NumberFormat.getPercentInstance({
			maxFractionDigits: 3
		});

		assert.equal(oFormat.format(12), "1,200%", "12");
		assert.equal(oFormat.format(12.34), "1,234%", "12.34");
		assert.equal(oFormat.format(.1234567), "12.346%", ".1234567");
		assert.equal(oFormat.format(-.1234567), "-12.346%", ".1234567");
		assert.equal(oFormat.format(.1234), "12.34%", ".1234");
		assert.equal(oFormat.parse("-12.345%"), -0.12345, "-12.345%");
		assert.ok(isNaN(oFormat.parse("%12.345%")), "NaN", "%12.345%");
	});

	QUnit.test("Percent format with string values", function(assert) {
		var oFormat = sap.ui.core.format.NumberFormat.getPercentInstance({
			maxFractionDigits: 3
		});

		assert.equal(oFormat.format("12"), "1,200%", "12");
		assert.equal(oFormat.format("12.34"), "1,234%", "12.34");
		assert.equal(oFormat.format(".1234567"), "12.345%", ".1234567");
		assert.equal(oFormat.format("-.1234567"), "-12.345%", ".1234567");
		assert.equal(oFormat.format(".1234"), "12.34%", ".1234");
	});

	QUnit.test("Percent format with specific locale tr-TR", function (assert) {
		var oLocale = new Locale("tr-TR");
		var oFormat = NumberFormat.getPercentInstance(oLocale);

		assert.equal(oFormat.format(.1234567), "%12,34567", ".1234567");
		assert.equal(oFormat.parse("%12,34567"), 0.1234567, "%12,34567");
		assert.ok(isNaN(oFormat.parse("12,34567%")), "12,34567%");
	});

	QUnit.test("parse default format", function (assert) {
		assert.equal(oDefaultInteger.parse("123"), 123, "123");
		assert.equal(oDefaultInteger.parse("123,123"), 123123, "123,123");
		assert.equal(oDefaultInteger.parse("123,123,1234"), 1231231234, "123,123,1234");
		assert.equal(isNaN(oDefaultInteger.parse("123.00")), true, "123.00");
		assert.equal(isNaN(oDefaultInteger.parse("5e+3")), true, "5e+3");
		assert.equal(isNaN(oDefaultInteger.parse("a1b2c3")), true, "a1b2c3");

		assert.equal(oDefaultFloat.parse("123.23"), 123.23, "123.23");
		assert.equal(oDefaultFloat.parse("123,123,123.23"), 123123123.23, "123,123,123.23");
		assert.equal(oDefaultFloat.parse(".23"), 0.23, ".23");
		assert.equal(oDefaultFloat.parse("-123.23"), -123.23, "-123.23");
		assert.equal(oDefaultFloat.parse("+6.5"), 6.5, "+6.5");
		assert.equal(oDefaultFloat.parse("5e+3"), 5000, "5e+3");
		assert.equal(oDefaultFloat.parse("1E+4"), 10000, "1E+4");
		assert.equal(oDefaultFloat.parse("5e-3"), 0.005, "5e-3");
		assert.equal(oDefaultFloat.parse(".5e-3"), 5e-4, ".5e-3");
		assert.equal(oDefaultFloat.parse("1."), 1, "1.");
		assert.equal(isNaN(oDefaultFloat.parse("123.x5")), true, "123.x5");

		var oFormat = NumberFormat.getFloatInstance({
			parseAsString: true
		});
		assert.equal(oFormat.parse("123.23"), "123.23", "Simple number is parsed as string");
		assert.equal(oFormat.parse("000123.23"), "123.23", "Number with leading zeros is parsed as string");
		assert.equal(oFormat.parse("12,345.67"), "12345.67", "Number with grouping is parsed as string");
		assert.equal(oFormat.parse("-12,345,678,901,123,456,345,678,901,123,456.78"), "-12345678901123456345678901123456.78",
			"Ridiculously long number is parsed as string");
	});

	QUnit.test("NumberFormat for 'he' locale with big number. Contains then RTL character u+200F", function (assert) {
		//setup
		var oLocale = new Locale("he");
		var oFormat = NumberFormat.getIntegerInstance({
			"style": "long"
		}, oLocale);

		// input and output
		var iExpectedNumber = 123000000;

		// execution
		var sFormatted = oFormat.format(iExpectedNumber);
		assert.equal(sFormatted, '‏123 מיליון', "can be formatted '" + sFormatted + "'");

		var sParsed = oFormat.parse(sFormatted);
		assert.equal(sParsed, iExpectedNumber, "should match input number " + iExpectedNumber);
	});

	QUnit.test("NumberFormat for 'de' locale with big number", function (assert) {
		var oLocale = new Locale("de");
		var oFormat = NumberFormat.getIntegerInstance({
			"style": "long"
		}, oLocale);
		var expectedNumber = 123000000;
		var sFormatted = oFormat.format(expectedNumber);
		assert.equal(sFormatted, "123 Millionen", "can be formatted '" + sFormatted + "'");

		var sParsed = oFormat.parse(sFormatted);
		assert.equal(sParsed, expectedNumber, "should match input number " + expectedNumber);
	});

	QUnit.test("parse default format with parameter 'parseAsString' set to true", function (assert) {
		var oIntegerFormat = NumberFormat.getIntegerInstance({
			parseAsString: true
		}), oFloatFormat = NumberFormat.getFloatInstance({
			parseAsString: true
		});

		assert.equal(oIntegerFormat.parse("123"), "123", "123");
		assert.equal(oIntegerFormat.parse("123,123"), "123123", "123,123");
		assert.equal(oIntegerFormat.parse("000123,123"), "123123", "000123,123");
		assert.equal(oIntegerFormat.parse("123,123,1234"), "1231231234", "123,123,1234");
		assert.equal(isNaN(oIntegerFormat.parse("123.00")), true, "123.00");
		assert.equal(isNaN(oIntegerFormat.parse("5e+3")), true, "5e+3");
		assert.equal(isNaN(oIntegerFormat.parse("a1b2c3")), true, "a1b2c3");

		assert.equal(oFloatFormat.parse("123.23"), "123.23", "123.23");
		assert.equal(oFloatFormat.parse("000123.23"), "123.23", "000123.23");
		assert.equal(oFloatFormat.parse("123,123,123.23"), "123123123.23", "123,123,123.23");
		assert.equal(oFloatFormat.parse("+.23"), "0.23", ".23");
		assert.equal(oFloatFormat.parse("-123.23"), "-123.23", "-123.23");
		assert.equal(oFloatFormat.parse("+6.5"), "6.5", "+6.5");
		assert.equal(oFloatFormat.parse("5e+3"), "5000", "5e+3");
		assert.equal(oFloatFormat.parse("1E+4"), "10000", "1E+4");
		assert.equal(oFloatFormat.parse("5e-3"), "0.005", "5e-3");
		assert.equal(oFloatFormat.parse(".5e-3"), "0.0005", ".5e-3");
		assert.equal(isNaN(oFloatFormat.parse("123.x5")), true, "123.x5");
	});

	QUnit.test("parse a number with custom plus and minus signs", function (assert) {
		var oIntegerFormat = NumberFormat.getIntegerInstance({
			plusSign: ".",
			minusSign: "["
		}), oFloatFormat = NumberFormat.getFloatInstance({
			plusSign: "]",
			minusSign: "|"
		});

		assert.equal(oIntegerFormat.parse(".1,234"), 1234, "1234 with custom plusSign '.'");
		assert.equal(oIntegerFormat.parse("[1,234,567"), -1234567, "-1234567 with custom minusSign '['");
		assert.equal(oFloatFormat.parse("]1,234.567"), 1234.567, "1234.567 with custom plusSign ']'");
		assert.equal(oFloatFormat.parse("|1,234.567"), -1234.567, "1234.567 with custom minusSign '|'");
	});

	QUnit.test("parse a number with custom grouping separator", function (assert) {
		var oIntegerFormat = NumberFormat.getIntegerInstance({
			groupingEnabled: true,
			groupingSeparator: "S"
		});

		assert.equal(oIntegerFormat.parse("1S234S567"), 1234567, "1S234S567 is parsed as 1234567 with grouping separator set to 's'");
		assert.ok(isNaN(oIntegerFormat.parse("1s234s567")), "1s234s567 is parsed as NaN");
	});

	QUnit.test("parse custom format", function (assert) {
		assert.equal(oCustomInteger.parse("123"), 123, "123");
		assert.equal(oCustomInteger.parse("123.123"), 123123, "123.123");
		assert.equal(oCustomInteger.parse("123.123.1234"), 1231231234, "123.123.1234");
		assert.equal(isNaN(oCustomInteger.parse("123,00")), true, "123,00");
		assert.equal(isNaN(oCustomInteger.parse("5e+3")), true, "5e+3");
		assert.equal(isNaN(oCustomInteger.parse("a1b2c3")), true, "a1b2c3");

		assert.equal(oCustomFloat.parse("0,23"), 0.23, "0.23");
		assert.equal(oCustomFloat.parse("1.234,23"), 1234.23, "1.234,23");
		assert.equal(oCustomFloat.parse("123.123.123,23"), 123123123.23, "123.123.123,23");
		assert.equal(oCustomFloat.parse(",23"), 0.23, ",23");
		assert.equal(oCustomFloat.parse("-123,23"), -123.23, "-123,23");
		assert.equal(oCustomFloat.parse("5e+3"), 5000, "5e+3");
		assert.equal(oCustomFloat.parse("1E+4"), 10000, "1E+4");
		assert.equal(oCustomFloat.parse("5e-3"), 0.005, "5e-3");
		assert.equal(oCustomFloat.parse(",5e-3"), 5e-4, ",5e-3");
		assert.equal(isNaN(oCustomFloat.parse("123,x5")), true, "123,x5");

		var oFormat = NumberFormat.getFloatInstance({
			parseAsString: true,
			groupingSeparator: ".",
			decimalSeparator: ","
		});
		assert.equal(oFormat.parse("123,23"), "123.23", "Simple number is parsed as string");
		assert.equal(oFormat.parse("000123,23"), "123.23", "Number with leading zeros is parsed as string");
		assert.equal(oFormat.parse("12.345,67"), "12345.67", "Number with grouping is parsed as string");
		assert.equal(oFormat.parse("-12.345.678.901.123.456.345.678.901.123.456,78"), "-12345678901123456345678901123456.78",
			"Ridiculously long number is parsed as string");

	});

	QUnit.test("parse currency format", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance();
		var aResult = oFormat.parse("EUR -12,345.67");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], -12345.67, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("-12,345.67 EURO");
		assert.strictEqual(aResult, null, "Currency parser should return null");

		aResult = oFormat.parse("-12,345.67 EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], -12345.67, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("USD23.4567");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 23.4567, "Number is parsed correctly");
		assert.equal(aResult[1], "USD", "Currency Code is parsed correctly: expected USD, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR-1234567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], -1234567.89, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR");
		assert.equal(aResult, null, "String with currency code only can't be parsed");

		aResult = oFormat.parse("1234567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 1234567.89, "Number is parsed correctly");
		assert.strictEqual(aResult[1], undefined, "Currency Code is parsed correctly: expected, parsed " + aResult[1]);

		aResult = oFormat.parse("\u20ac" + " 1,234,567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 1234567.89, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("$ 1234567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 1234567.89, "Number is parsed correctly");
		assert.strictEqual(aResult[1], "USD", "Currency Code is parsed correctly: expected USD, parsed " + aResult[1]);

		oFormat = NumberFormat.getCurrencyInstance({
			showMeasure: false
		});

		aResult = oFormat.parse("-12,345.67 EUR");
		assert.equal(aResult, null, "Currency with measure cannot be parsed");

		aResult = oFormat.parse("USD23.4567");
		assert.equal(aResult, null, "Currency with measure cannot be parsed");

		aResult = oFormat.parse("EUR-1234567.89");
		assert.equal(aResult, null, "Currency with measure cannot be parsed");

		aResult = oFormat.parse("EUR");
		assert.equal(aResult, null, "String with currency code only can't be parsed");

		aResult = oFormat.parse("1234567.89");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 1234567.89, "Number is parsed correctly");
		assert.strictEqual(aResult[1], undefined, "Currency Code is parsed correctly: expected, parsed " + aResult[1]);

		oFormat = NumberFormat.getCurrencyInstance({
			parseAsString: true
		});

		aResult = oFormat.parse("EUR-12,345.67");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], "-12345.67", "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("-12,345.67 EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], "-12345.67", "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR-00012,345.67");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], "-12345.67", "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR-12,345,678,901,123,456.78");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], "-12345678901123456.78", "Long number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR-12,345,678,901,123,456,345,678,901,123,456.78");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], "-12345678901123456345678901123456.78", "Ridiculously long number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		oFormat = NumberFormat.getCurrencyInstance({}, new Locale("de"));
		aResult = oFormat.parse("-12.345,67 EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], -12345.67, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("23,4567 USD");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 23.4567, "Number is parsed correctly");
		assert.equal(aResult[1], "USD", "Currency Code is parsed correctly: expected USD, parsed " + aResult[1]);

		aResult = oFormat.parse("23,4567 $");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 23.4567, "Number is parsed correctly");
		assert.equal(aResult[1], "USD", "Currency Code is parsed correctly: expected USD, parsed " + aResult[1]);

		aResult = oFormat.parse("-1234567,89EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], -1234567.89, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

	});

	QUnit.test("parse currency with a currency code having more than or less than 3 letters", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance();
		var aResult = oFormat.parse("EURO 1,234.00");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("EU 1,234.00");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("EUR1,234.00");
		assert.deepEqual(aResult, [1234, "EUR"], "[1234, 'EUR']");

		aResult = oFormat.parse("EURO1,234.00");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("EU1,234.00");
		assert.ok(aResult === null, "Currency parser should return null");

		// de locale
		oFormat = NumberFormat.getCurrencyInstance({}, new Locale("de"));
		aResult = oFormat.parse("1.234,00 EU");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("1.234,00 EURO");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("1.234,00EURO");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("1.234,00EU");
		assert.ok(aResult === null, "Currency parser should return null");

		aResult = oFormat.parse("1.234,00EUR");
		assert.deepEqual(aResult, [1234, "EUR"], "[1234, 'EUR']");


	});

	QUnit.test("parse currency short format", function (assert) {
		var oFormat = NumberFormat.getCurrencyInstance();
		var aResult = oFormat.parse("GBP 5");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 5, "Number is parsed correctly");
		assert.equal(aResult[1], "GBP", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("SEK 6");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 6, "Number is parsed correctly");
		assert.equal(aResult[1], "SEK", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("12 EUR K");
		assert.equal(aResult, null, "Currency between number and scale cannot be parsed");

		aResult = oFormat.parse("EUR-12K");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], -12000, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("-12K EUR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], -12000, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("USD23M");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 23000000, "Number is parsed correctly");
		assert.equal(aResult[1], "USD", "Currency Code is parsed correctly: expected USD, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR -12 million");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], -12000000, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR 0.00T");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 0, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR 0.2M");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 200000, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);
	});

	QUnit.test("currency for 'he' locale with big number. Contains the RTL character u+200F", function (assert) {
		//setup
		var oLocale = new Locale("he");
		var oFormat = NumberFormat.getCurrencyInstance({
			showMeasure: false
		}, oLocale);

		// input and output
		var iExpectedNumber = 50000;

		// execution
		var sFormatted = oFormat.format(iExpectedNumber);
		assert.equal(sFormatted.toString(), "‏50,000.00‎", "can be formatted '" + sFormatted + "' (contains RTL character)");

		var aParsed = oFormat.parse(sFormatted);
		assert.deepEqual(aParsed, [50000, undefined], "should match input number " + iExpectedNumber);
	});

	QUnit.test("currency format/parse for currencies with letter 'K' in the measure symbol", function(assert) {
		//setup
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getCurrencyInstance({
			showMeasure: true
		}, oLocale);


		["SEK", "DKK"].forEach(function(sCurrencyMeasure) {

			// input and output
			var iExpectedNumber = 12345;
			assert.ok(iExpectedNumber, "Input: " + iExpectedNumber + ", " + sCurrencyMeasure);

			// execution
			var sFormatted = oFormat.format(iExpectedNumber, sCurrencyMeasure);
			assert.ok(sFormatted, "Formatted: " + sFormatted);

			var aParsed = oFormat.parse(sFormatted);
			assert.deepEqual(aParsed, [iExpectedNumber, sCurrencyMeasure], "Parsed: " + aParsed.join(", "));
		});
	});

	QUnit.test("format/parse indian lakhs/crores", function (assert) {
		var oLocale = new Locale("en-IN");
		var oFormat = NumberFormat.getCurrencyInstance({}, oLocale);

		assert.equal(oFormat.format(100000, "INR"), "INR\xa01,00,000.00", "INR is formatted with correct grouping");
		assert.equal(oFormat.format(10000000, "INR"), "INR\xa01,00,00,000.00", "INR is formatted with correct grouping");
		assert.equal(oFormat.format(10000000000, "INR"), "INR\xa01,000,00,00,000.00", "INR is formatted with correct grouping");
		assert.equal(oFormat.format(1000000000000, "INR"), "INR\xa01,00,000,00,00,000.00", "INR is formatted with correct grouping");
		assert.equal(oFormat.format(100000000000000, "INR"), "INR\xa01,00,00,000,00,00,000.00", "INR is formatted with correct grouping");

		oFormat = NumberFormat.getCurrencyInstance({ style: "short" }, oLocale);

		assert.equal(oFormat.format(100000, "INR"), "INR\xa01 Lk", "INR is formatted as Lk/Cr");
		assert.equal(oFormat.format(10000000, "INR"), "INR\xa01 Cr", "INR is formatted as Lk/Cr");
		assert.equal(oFormat.format(10000000000, "INR"), "INR\xa01,000 Cr", "INR is formatted as Lk/Cr");
		assert.equal(oFormat.format(1000000000000, "INR"), "INR\xa01 Lk Cr", "INR is formatted as Lk/Cr");
		assert.equal(oFormat.format(100000000000000, "INR"), "INR\xa01 Cr Cr", "INR is formatted as Lk/Cr");

		assert.equal(oFormat.format(100000, "USD"), "USD\xa0100K", "USD is formatted as M/B/T");
		assert.equal(oFormat.format(1000000, "USD"), "USD\xa01M", "USD is formatted as M/B/T");
		assert.equal(oFormat.format(1000000000, "USD"), "USD\xa01B", "USD is formatted as M/B/T");

		var aResult = oFormat.parse("INR 12 Lk");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 1200000, "Number is parsed correctly");
		assert.equal(aResult[1], "INR", "Currency Code is parsed correctly: expected INR, parsed " + aResult[1]);

		aResult = oFormat.parse("12 Lk INR");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 1200000, "Number is parsed correctly");
		assert.equal(aResult[1], "INR", "Currency Code is parsed correctly: expected INR, parsed " + aResult[1]);

		aResult = oFormat.parse("INR 12 Cr");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 120000000, "Number is parsed correctly");
		assert.equal(aResult[1], "INR", "Currency Code is parsed correctly: expected INR, parsed " + aResult[1]);

		aResult = oFormat.parse("EUR 12M");
		assert.ok(Array.isArray(aResult), "Currency parser should return an array");
		assert.equal(aResult[0], 12000000, "Number is parsed correctly");
		assert.equal(aResult[1], "EUR", "Currency Code is parsed correctly: expected EUR, parsed " + aResult[1]);
	});

	QUnit.module("Float Format");

	QUnit.test("float precision", function (assert) {
		var oLocale = new Locale("de-DE");
		var oFormat = NumberFormat.getFloatInstance({ precision: 0 }, oLocale);

		assert.equal(oFormat.format(0.23), "0", "0.23 formatted");
		assert.equal(oFormat.format(1.345), "1", "1.3456 formatted");
		assert.equal(oFormat.format(23.456), "23", "23.456 formatted");

		oFormat = NumberFormat.getFloatInstance({ precision: 1 }, oLocale);
		assert.equal(oFormat.format(0.23), "0,2", "0.23 formatted");
		assert.equal(oFormat.format(1.345), "1", "1.3456 formatted");
		assert.equal(oFormat.format(23.456), "23", "23.456 formatted");
		assert.equal(oFormat.format(123.456), "123", "123.456 formatted");

		oFormat = NumberFormat.getFloatInstance({ precision: 2 }, oLocale);
		assert.equal(oFormat.format(0.23), "0,23", "0.23 formatted");
		assert.equal(oFormat.format(1.345), "1,3", "1.3456 formatted");
		assert.equal(oFormat.format(23.456), "23", "23.456 formatted");
		assert.equal(oFormat.format(123.456), "123", "123.456 formatted");

		oFormat = NumberFormat.getFloatInstance({ precision: 3 }, oLocale);
		assert.equal(oFormat.format(0.23), "0,23", "0.23 formatted");
		assert.equal(oFormat.format(1.345), "1,35", "1.3456 formatted");
		assert.equal(oFormat.format(23.456), "23,5", "23.456 formatted");
		assert.equal(oFormat.format(123.456), "123", "123.456 formatted");

		oFormat = NumberFormat.getFloatInstance({ precision: 4 }, oLocale);
		assert.equal(oFormat.format(0.23), "0,23", "0.23 formatted");
		assert.equal(oFormat.format(1.345), "1,345", "1.3456 formatted");
		assert.equal(oFormat.format(23.456), "23,46", "23.456 formatted");
		assert.equal(oFormat.format(123.456), "123,5", "123.456 formatted");

	});


	QUnit.test("float short style", function (assert) {
		var oLocale = new Locale("de-DE");
		var oFormat = NumberFormat.getFloatInstance({ style: "short", shortDecimals: 0 }, oLocale);

		assert.equal(oFormat.format(0.23), "0,23", "0.23 formatted");
		assert.equal(oFormat.format(1), "1", "1 formatted");
		assert.equal(oFormat.format(12), "12", "12 formatted");
		assert.equal(oFormat.format(123), "123", "123 formatted");
		assert.equal(oFormat.format(999), "999", "999 formatted");
		assert.equal(oFormat.format(1234), "1.234", "1234 formatted");
		assert.equal(oFormat.format(9999), "9.999", "9999 formatted");
		assert.equal(oFormat.format(12345), "12.345", "12345 formatted");
		assert.equal(oFormat.format(99999), "99.999", "99999 formatted");
		assert.equal(oFormat.format(123456), "123.456", "123456 formatted");
		assert.equal(oFormat.format(999999), "1\xa0Mio.", "999999 formatted");
		assert.equal(oFormat.format(1234567), "1\xa0Mio.", "1234567 formatted");
		assert.equal(oFormat.format(9999999), "10\xa0Mio.", "9999999 formatted");
		assert.equal(oFormat.format(12345678), "12\xa0Mio.", "12345678 formatted");
		assert.equal(oFormat.format(99999999), "100\xa0Mio.", "99999999 formatted");
		assert.equal(oFormat.format(123456789), "123\xa0Mio.", "123456789 formatted");
		assert.equal(oFormat.format(999999999), "1\xa0Mrd.", "999999999 formatted");
		assert.equal(oFormat.format(1234567890), "1\xa0Mrd.", "1234567890 formatted");
		assert.equal(oFormat.format(9999999999), "10\xa0Mrd.", "9999999999 formatted");
		assert.equal(oFormat.format(12345678901), "12\xa0Mrd.", "12345678901 formatted");
		assert.equal(oFormat.format(99999999999), "100\xa0Mrd.", "99999999999 formatted");
		assert.equal(oFormat.format(123456789012), "123\xa0Mrd.", "123456789012 formatted");
		assert.equal(oFormat.format(999999999999), "1\xa0Bio.", "999999999999 formatted");
		assert.equal(oFormat.format(1234567890123), "1\xa0Bio.", "1234567890123 formatted");
		assert.equal(oFormat.format(-0.23), "-0,23", "0.23 formatted");
		assert.equal(oFormat.format(-1), "-1", "-1 formatted");
		assert.equal(oFormat.format(-12), "-12", "-12 formatted");
		assert.equal(oFormat.format(-123), "-123", "-123 formatted");
		assert.equal(oFormat.format(-999), "-999", "-999 formatted");
		assert.equal(oFormat.format(-1234), "-1.234", "-1234 formatted");
		assert.equal(oFormat.format(-9999), "-9.999", "-9999 formatted");
		assert.equal(oFormat.format(-12345), "-12.345", "-12345 formatted");
		assert.equal(oFormat.format(-99999), "-99.999", "-99999 formatted");
		assert.equal(oFormat.format(-123456), "-123.456", "-123456 formatted");
		assert.equal(oFormat.format(-999999), "-1\xa0Mio.", "-999999 formatted");
		assert.equal(oFormat.format(-1234567), "-1\xa0Mio.", "-1234567 formatted");
		assert.equal(oFormat.format(-9999999), "-10\xa0Mio.", "-9999999 formatted");
		assert.equal(oFormat.format(-12345678), "-12\xa0Mio.", "-12345678 formatted");
		assert.equal(oFormat.format(-99999999), "-100\xa0Mio.", "-99999999 formatted");
		assert.equal(oFormat.format(-123456789), "-123\xa0Mio.", "-123456789 formatted");
		assert.equal(oFormat.format(-999999999), "-1\xa0Mrd.", "-999999999 formatted");
		assert.equal(oFormat.format(-1234567890), "-1\xa0Mrd.", "-1234567890 formatted");
		assert.equal(oFormat.format(-9999999999), "-10\xa0Mrd.", "-9999999999 formatted");
		assert.equal(oFormat.format(-12345678901), "-12\xa0Mrd.", "-12345678901 formatted");
		assert.equal(oFormat.format(-99999999999), "-100\xa0Mrd.", "-99999999999 formatted");
		assert.equal(oFormat.format(-123456789012), "-123\xa0Mrd.", "-123456789012 formatted");
		assert.equal(oFormat.format(-999999999999), "-1\xa0Bio.", "-999999999999 formatted");
		assert.equal(oFormat.format(-1234567890123), "-1\xa0Bio.", "-1234567890123 formatted");

		assert.equal(oFormat.parse("0,23"), 0.23, "\"0,23\" parsed");
		assert.equal(oFormat.parse("1"), 1, "\"1\" parsed");
		assert.equal(oFormat.parse("12"), 12, "\"12\" parsed");
		assert.equal(oFormat.parse("123"), 123, "\"123\" parsed");
		assert.equal(oFormat.parse("1230"), 1230, "\"1,23 Tsd\" parsed");
		assert.equal(oFormat.parse("1 Mio."), 1000000, "\"1 Mio.\" parsed");
		assert.equal(oFormat.parse("10 Mio."), 10000000, "\"10 Mio.\" parsed");
		assert.equal(oFormat.parse("100 Mio."), 100000000, "\"100 Mio.\" parsed");
		assert.equal(oFormat.parse("1 Mrd."), 1000000000, "\"1 Mrd.\" parsed");
		assert.equal(oFormat.parse("10 Mrd."), 10000000000, "\"10 Mrd.\" parsed");
		assert.equal(oFormat.parse("100 Mrd."), 100000000000, "\"100 Mrd.\" parsed");
		assert.equal(oFormat.parse("1 Bio."), 1000000000000, "\"1 Bio.\" parsed");
		assert.equal(oFormat.parse("-0,23"), -0.23, "\"-0,23\" parsed");
		assert.equal(oFormat.parse("-1"), -1, "\"-1\" parsed");
		assert.equal(oFormat.parse("-12"), -12, "\"-12\" parsed");
		assert.equal(oFormat.parse("-123"), -123, "\"-123\" parsed");
		assert.equal(oFormat.parse("-1230"), -1230, "\"-1230\" parsed");
		assert.equal(oFormat.parse("-1 Mio."), -1000000, "\"-1 Mio.\" parsed");
		assert.equal(oFormat.parse("-10 Mio."), -10000000, "\"-10 Mio.\" parsed");
		assert.equal(oFormat.parse("-100 Mio."), -100000000, "\"-100 Mio.\" parsed");
		assert.equal(oFormat.parse("-1 Mrd."), -1000000000, "\"-1 Mrd.\" parsed");
		assert.equal(oFormat.parse("-10 Mrd."), -10000000000, "\"-10 Mrd.\" parsed");
		assert.equal(oFormat.parse("-100 Mrd."), -100000000000, "\"-100 Mrd.\" parsed");
		assert.equal(oFormat.parse("-1 Bio."), -1000000000000, "\"-1 Bio.\" parsed");

		oFormat = NumberFormat.getFloatInstance({ style: "short", shortLimit: 10000, precision: 3 }, oLocale);

		assert.equal(oFormat.format(1), "1", "1 formatted");
		assert.equal(oFormat.format(12), "12", "12 formatted");
		assert.equal(oFormat.format(123), "123", "123 formatted");
		assert.equal(oFormat.format(999), "999", "999 formatted");
		assert.equal(oFormat.format(1234), "1.234", "1234 formatted");
		assert.equal(oFormat.format(9999), "9.999", "9999 formatted");
		assert.equal(oFormat.format(12345), "12.345", "12345 formatted");
		assert.equal(oFormat.format(99900), "99.900", "99900 formatted");
		assert.equal(oFormat.format(99990), "99.990", "99990 formatted");
		assert.equal(oFormat.format(99999), "99.999", "99999 formatted");
		assert.equal(oFormat.format(123456), "123.456", "123456 formatted");
		assert.equal(oFormat.format(999000), "999.000", "999000 formatted");
		assert.equal(oFormat.format(999900), "1\xa0Mio.", "999900 formatted");
		assert.equal(oFormat.format(999999), "1\xa0Mio.", "999999 formatted");
		assert.equal(oFormat.format(1234567), "1,23\xa0Mio.", "1234567 formatted");
		assert.equal(oFormat.format(9990000), "9,99\xa0Mio.", "9990000 formatted");
		assert.equal(oFormat.format(9999000), "10\xa0Mio.", "9999000 formatted");
		assert.equal(oFormat.format(9999999), "10\xa0Mio.", "9999999 formatted");
		assert.equal(oFormat.format(12345678), "12,3\xa0Mio.", "12345678 formatted");
		assert.equal(oFormat.format(99900000), "99,9\xa0Mio.", "99900000 formatted");
		assert.equal(oFormat.format(99990000), "100\xa0Mio.", "99990000 formatted");
		assert.equal(oFormat.format(99999999), "100\xa0Mio.", "99999999 formatted");
		assert.equal(oFormat.format(123456789), "123\xa0Mio.", "123456789 formatted");
		assert.equal(oFormat.format(999000000), "999\xa0Mio.", "999000000 formatted");
		assert.equal(oFormat.format(999900000), "1\xa0Mrd.", "999900000 formatted");
		assert.equal(oFormat.format(999999999), "1\xa0Mrd.", "999999999 formatted");
		assert.equal(oFormat.format(1234567890), "1,23\xa0Mrd.", "1234567890 formatted");
		assert.equal(oFormat.format(9990000000), "9,99\xa0Mrd.", "9990000000 formatted");
		assert.equal(oFormat.format(9999999999), "10\xa0Mrd.", "9999999999 formatted");
		assert.equal(oFormat.format(12345678901), "12,3\xa0Mrd.", "12345678901 formatted");
		assert.equal(oFormat.format(99900000000), "99,9\xa0Mrd.", "99900000000 formatted");
		assert.equal(oFormat.format(99999999999), "100\xa0Mrd.", "99999999999 formatted");
		assert.equal(oFormat.format(123456789012), "123\xa0Mrd.", "123456789012 formatted");
		assert.equal(oFormat.format(999000000000), "999\xa0Mrd.", "999000000000 formatted");
		assert.equal(oFormat.format(999999999999), "1\xa0Bio.", "999999999999 formatted");
		assert.equal(oFormat.format(1234567890123), "1,23\xa0Bio.", "1234567890123 formatted");

	});

	QUnit.test("float short style (non-prefix-free unit strings)", function (assert) {
		// this test checks number parsing when one unit is a prefix of another unit
		// (e.g Spanish 'mil' for thousands and 'mil M' for thousands of millions)
		var oLocaleSpanish = new Locale("es-ES");
		var oFormatSpanish = NumberFormat.getFloatInstance({
			style: "short", maxFractionDigits: 0
		}, oLocaleSpanish);

		assert.equal(oFormatSpanish.format(123000000000), "123\xa0mil\xa0M", "123000000000 formatted");
		assert.equal(oFormatSpanish.format(12000000000), "12\xa0mil\xa0M", "12000000000 formatted");
		assert.equal(oFormatSpanish.format(123000000), "123\xa0M", "123000000 formatted");
		assert.equal(oFormatSpanish.format(123000), "123\xa0mil", "123000 formatted");

		assert.equal(oFormatSpanish.parse("123 mil M"), 123000000000, "\"123 mil M\" parsed");
		assert.equal(oFormatSpanish.parse("12 mil M"), 12000000000, "\"12 mil M\" parsed");
		assert.equal(oFormatSpanish.parse("123 M"), 123000000, "\"123 M\" parsed");
		assert.equal(oFormatSpanish.parse("123 mil"), 123000, "\"123 mil\" parsed");
	});

	QUnit.test("float short style w/ decimals", function (assert) {
		var oFormat = NumberFormat.getFloatInstance({
			style: "short",
			decimals: 2,
			shortDecimals: 1
		});

		assert.equal(oFormat.format(234.567), "234.57", "234.567 is formatted with 2 decimals");
		assert.equal(oFormat.format(3456.78), "3.5K", "3456.78 is formatted with 1 decimal");
		assert.equal(oFormat.format(234.5), "234.50", "234.5 is formatted with 2 decimals");
		assert.equal(oFormat.format(3000), "3.0K", "3000 is formatted with 1 decimal");
	});

	QUnit.test("float long style", function (assert) {
		var oLocale = new Locale("de-DE");
		var oFormat = NumberFormat.getFloatInstance({
			style: "long", maxFractionDigits: 1
		}, oLocale);

		assert.equal(oFormat.format(1.2), "1,2", "1.2 formatted");
		assert.equal(oFormat.parse("1,2"), 1.2, "\"1,2\" parsed");
		assert.equal(oFormat.format(1234.5), "1,2 Tausend", "1234.5 formatted");
		assert.equal(oFormat.parse("1 Tausend"), 1000, "\"1 Tausend\" parsed");
		assert.equal(oFormat.parse("1,2 Tausend"), 1200, "\"1,2 Tausend\" parsed");


		oFormat = NumberFormat.getFloatInstance({
			style: "long", maxFractionDigits: 0
		}, oLocale);


		//german has "Million" and "Millionen". The first word is contained in the second.
		assert.equal(oFormat.format(1456789), "1 Million", "1 million formatted");
		assert.equal(oFormat.parse("1 Million"), 1000000, "1 million parsed");

		assert.equal(oFormat.format(123456789), "123 Millionen", "123 Millionen formatted");
		assert.equal(oFormat.parse("123 Millionen"), 123000000, "123 Millionen parsed");

		assert.equal(oFormat.format(123456789000), "123 Milliarden", "123 Milliarden formatted");
		assert.equal(oFormat.parse("123 Milliarden"), 123000000000, "123 Milliarden parsed");


		//Format should work '-10 mil millones' from number: -10000000000
		oFormat = NumberFormat.getFloatInstance({
			style: "long", maxFractionDigits: 0
		}, new Locale("es-ES"));

		//spanish has "mil milliones" and "milliones". The first word ends with the second.
		assert.equal(oFormat.format(10000000000), "10 mil millones", "10 mil millones formatted");
		assert.equal(oFormat.parse("10 mil millones"), 10000000000, "10 mil millones parsed");

		assert.equal(oFormat.format(10000000), "10 millones", "10 millones formatted");
		assert.equal(oFormat.parse("10 millones"), 10000000, "10 millones parsed");

		// other test similar to integer -> skip
	});

	QUnit.module("General");

	QUnit.test("origin info", function (assert) {
		sap.ui.getCore().getConfiguration().originInfo = true;
		var oOriginNumber = NumberFormat.getIntegerInstance(),
			sValue = oOriginNumber.format(123),
			oInfo = sValue.originInfo;
		assert.equal(oInfo.source, "Common Locale Data Repository", "Origin Info: source");
		assert.equal(oInfo.locale, "en-US", "Origin Info: locale");
	});

	QUnit.test("Private method NumberFormat._shiftDecimalPoint", function (assert) {
		var f = NumberFormat._shiftDecimalPoint;
		assert.equal(f("1234.567", 2), "123456.7", "1234.567 -> (2) = 123456.7");
		assert.equal(f("1234.567", 10), "12345670000000", "1234.567 -> (10) = 12345670000000");
		assert.equal(f("1234.567", -2), "12.34567", "1234.567 <- (2) = 12.34567");
		assert.equal(f("1234.567", -10), "0.0000001234567", "1234.567 <- (10) = 0.0000001234567");
		assert.equal(f("1234.567", 0), "1234.567", "1234.567 = 1234.567");
		assert.equal(f("1234.567", 3), "1234567", "1234.567 -> (3) = 1234567");
		assert.equal(f("1234.567", -4), "0.1234567", "1234.567 <- (4) = 0.1234567");
		assert.equal(f("1234.567", 5), "123456700", "1234.567 -> (5) = 123456700");
		assert.equal(f("0", 2), "0", "0 -> (2) = 0");
		assert.equal(f("1", 2), "100", "1 -> (2) = 100");
		assert.equal(f("0", -2), "0.00", "0 <- (2) = 0.00");
		assert.equal(f("1e79", -71), "100000000", "1e79 <- (71) = 100000000");
		assert.equal(f("1e-79", 71), "0.00000001", "1e-79 -> (71) = 0.00000001");
		assert.equal(f("-4e-1", 0), "-0.4", "-4e-1 -> = -0.4");
		assert.equal(f("-4e-2", 0), "-0.04", "-4e-2 -> = -0.04");
		assert.equal(f("-4e-3", 0), "-0.004", "-4e-3 -> = -0.004");
		assert.equal(f("-4e+1", 0), "-40", "-4e+1 -> = -40");
		assert.equal(f("-4e+2", 0), "-400", "-4e+2 -> = -400");
		assert.equal(f("-4e+3", 0), "-4000", "-4e+3 -> = -4000");
	});

	QUnit.test("Format option 'emptyString'", function (assert) {
		var aMethods = ["getIntegerInstance", "getFloatInstance", "getPercentInstance", "getCurrencyInstance"],
			aValues = [NaN, null, 0],
			aCompareValues = [["NaN", null, "0"], [NaN, null, 0]],
			aParseAsString = [true, false];

		aMethods.forEach(function (sMethod, index) {
			aValues.forEach(function (nValue, index1) {
				aParseAsString.forEach(function (bParseAsString, index2) {
					var oFormatOptions = {
						emptyString: nValue,
						parseAsString: bParseAsString
					},
						oFormat = NumberFormat[sMethod](oFormatOptions),
						nCompareValue = aCompareValues[index2][index1],
						nParsed,
						aParsed;

					// format
					assert.strictEqual(oFormat.format(nValue), "", nValue + " is formatted to empty string");

					// parse
					if (sMethod === "getCurrencyInstance") {
						aParsed = oFormat.parse("");
						nParsed = aParsed[0];
						assert.strictEqual(aParsed[1], undefined, "currency code is parse as undefined");
					} else {
						nParsed = oFormat.parse("");
					}

					if (nParsed !== nParsed) { // eslint-disable-line no-self-compare
						assert.ok(nCompareValue !== nCompareValue, "empty string is parsed as NaN"); // eslint-disable-line no-self-compare
					} else {
						assert.strictEqual(nParsed, nCompareValue, "empty string is parsed as " + aCompareValues[index2][index1]);
					}
				});
			});
		});
	});

	QUnit.test("Percent format with custom pattern", function (assert) {
		var oLocale = new Locale("tr-TR");

		// no custom pattern
		var oFormat = NumberFormat.getPercentInstance(oLocale);

		assert.equal(oFormat.format(.1234567), "%12,34567", ".1234567");
		assert.equal(oFormat.parse("%12,34567"), 0.1234567, "%12,34567");
		assert.deepEqual(oFormat.parse("12,34567%"), NaN, "12,34567%");

		// custom pattern
		oFormat = NumberFormat.getPercentInstance({
			pattern: "%#####.#####"
		}, oLocale);

		assert.equal(oFormat.format(.1234567), "%12,34567", ".1234567");
		assert.equal(oFormat.parse("%12,34567"), 0.1234567, "%12,34567");
		assert.deepEqual(oFormat.parse("12,34567%"), NaN, "12,34567%");

		//change pattern such that percent symbol is at the end
		oFormat = NumberFormat.getPercentInstance({
			pattern: "#,##0%"
		}, oLocale);

		assert.equal(oFormat.format(12), "1.200%", "12");
		assert.equal(oFormat.format(12.34), "1.234%", "12.34");
		assert.equal(oFormat.format(.1234567), "12%", ".1234567");
		assert.equal(oFormat.format(-.1234567), "-12%", "-.1234567");
		assert.equal(oFormat.format(.1234), "12%", ".1234");

		assert.equal(oFormat.parse("1.200%"), 12, "1.200%");
		assert.equal(oFormat.parse("1.234%"), 12.34, "1.234%");
		assert.deepEqual(oFormat.parse("%1.200"), NaN, "NaN because does not match pattern '#,##0%'");
		assert.deepEqual(oFormat.parse("%12.345%"), NaN, "NaN because does not match pattern '#,##0%'");
	});

	QUnit.test("Float with percentage symbol", function (assert) {
		var oLocale = new Locale("en");
		var oFormat = NumberFormat.getInstance(oLocale);

		assert.equal(oFormat.format(52.3, "%").toString(), "52.3", "52.3%");
		assert.deepEqual(oFormat.parse("52.3%"), 0.523, "treated as percent");

		assert.equal(oFormat.format(52.3, "xsd").toString(), "52.3", "xsd 52.30");
		assert.deepEqual(oFormat.parse("52.3xsd"), NaN, "'xsd' cannot be parsed as number");
	});

});
