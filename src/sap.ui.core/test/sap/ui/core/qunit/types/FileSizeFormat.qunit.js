/*global QUnit */
sap.ui.define(["sap/ui/core/format/FileSizeFormat", "sap/ui/core/Locale"], function (FileSizeFormat, Locale) {
	"use strict";

	var oFormatBinary = FileSizeFormat.getInstance({ binaryFilesize: true, maxFractionDigits: 2 }, new Locale("en"));
	var oFormatDecimal = FileSizeFormat.getInstance({ binaryFilesize: false, maxFractionDigits: 2 }, new Locale("en"));
	var oFormatDefault = FileSizeFormat.getInstance({}, new Locale("en"));

	var aBinaryUnitNames = ["Kibibyte", "Mebibyte", "Gibibyte", "Tebibyte", "Pebibyte", "Exbibyte", "Zebibyte", "Yobibyte"];
	var aDecimalUnitNames = ["Kilobyte", "Megabyte", "Gigabyte", "Terabyte", "Petabyte", "Exabyte", "Zettabyte", "Yottabyte"];
	var aBinaryUnits;
	var aDecimalUnits;

	function extractUnits(names) {
		return names.map(function (name) {
			var sPattern = oFormatDefault.oBundle.getText("FileSize." + name);
			// trim the string
			var sName = sPattern.split("{0}")[1].trim();
			return sName;
		});
	}

	aBinaryUnits = extractUnits(aBinaryUnitNames);
	aDecimalUnits = extractUnits(aDecimalUnitNames);


	function checkFormat(format, value, expected) {
		var oFormat, sPrefix;

		switch (format) {
			case "binary":
				oFormat = oFormatBinary;
				sPrefix = "Binary";
				break;
			case "decimal":
				oFormat = oFormatDecimal;
				sPrefix = "Decimal";
				break;
			default:
				oFormat = oFormatDefault;
				sPrefix = "Default";
		}

		QUnit.config.current.assert.equal(oFormat.format(value), expected, sPrefix + " format of '" + value + "': " + expected);
	}

	function checkParse(format, value, expected) {
		var oFormat, sPrefix;

		switch (format) {
			case "binary":
				oFormat = oFormatBinary;
				sPrefix = "Binary";
				break;
			case "decimal":
				oFormat = oFormatDecimal;
				sPrefix = "Decimal";
				break;
			default:
				oFormat = oFormatDefault;
				sPrefix = "Default";
		}

		QUnit.config.current.assert.equal(oFormat.parse(value), expected, "Parse (" + sPrefix + " Formatter) of '" + value + "': " + expected);
	}

	function getHex(i, binary) {
		switch (i) {
			case 1:
				return binary ? "0x800" : "0x7d0";
			case 2:
				return binary ? "0x200000" : "0x1e8480";
			case 3:
				return binary ? "0x80000000" : "0x77359400";
			case 4:
				return binary ? "0x20000000000" : "0x1d1a94a2000";
			case 5:
				return binary ? "0x8000000000000" : "0x71afd498d0000";
			case 6:
				return binary ? "0x2000000000000000" : "0x1bc16d674ec80000";
			case 7:
				return binary ? "0x800000000000000000" : "0x6c6b935b8bbd400000";
			case 8:
				return binary ? "0x200000000000000000000" : "0x1a784379d99db40000000";
			default:
				return "0x0";
		}
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.core.format.FileSizeFormat", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		}
	});

	QUnit.test("format binary", function (assert) {
		for (var i = 1; i < 9; i++) {
			checkFormat("binary", 2 * Math.pow(1024, i), "2 " + aBinaryUnits[i - 1]);
			checkFormat("binary", 2 * Math.pow(1024, i) + "", "2 " + aBinaryUnits[i - 1]);
			checkFormat("binary", getHex(i, true), "2 " + aBinaryUnits[i - 1]);
		}

		checkFormat("binary", 888, "888 Bytes");
		checkFormat("binary", "888", "888 Bytes");
		checkFormat("binary", "0x378", "888 Bytes");
		checkFormat("binary", 1, "1 Byte");
		checkFormat("binary", "1", "1 Byte");
		checkFormat("binary", "0x1", "1 Byte");
		checkFormat("binary", 1048575, "1 MiB");
	});

	QUnit.test("format decimal", function (assert) {
		for (var i = 1; i < 9; i++) {
			checkFormat("decimal", 2 * Math.pow(1000, i), "2 " + aDecimalUnits[i - 1]);
			checkFormat("decimal", 2 * Math.pow(1000, i) + "", "2 " + aDecimalUnits[i - 1]);
			checkFormat("decimal", getHex(i), "2 " + aDecimalUnits[i - 1]);
		}

		checkFormat("decimal", 888, "888 Bytes");
		checkFormat("decimal", "888", "888 Bytes");
		checkFormat("decimal", "0x378", "888 Bytes");
		checkFormat("decimal", 1, "1 Byte");
		checkFormat("decimal", "1", "1 Byte");
		checkFormat("decimal", "0x1", "1 Byte");
		checkFormat("decimal", 999999, "1 MB");
	});

	QUnit.test("format default", function (assert) {
		for (var i = 1; i < 9; i++) {
			checkFormat("default", 2 * Math.pow(1000, i), "2 " + aDecimalUnits[i - 1]);
			checkFormat("default", 2 * Math.pow(1000, i) + "", "2 " + aDecimalUnits[i - 1]);
			checkFormat("default", getHex(i), "2 " + aDecimalUnits[i - 1]);
		}

		checkFormat("default", 888, "888 Bytes");
		checkFormat("default", "888", "888 Bytes");
		checkFormat("default", "0x378", "888 Bytes");
		checkFormat("default", 1, "1 Byte");
		checkFormat("default", "1", "1 Byte");
		checkFormat("default", "0x1", "1 Byte");
	});

	QUnit.test("parse binary", function (assert) {
		for (var i = 1; i < 9; i++) {
			checkParse("binary", "2 " + aBinaryUnits[i - 1], 2 * Math.pow(1024, i));
			checkParse("binary", "2 " + aDecimalUnits[i - 1], 2 * Math.pow(1000, i));
		}

		checkParse("binary", "888 Bytes", 888);
		checkParse("binary", "1 Byte", 1);
		checkParse("binary", "888", 888);
	});

	QUnit.test("parse decimal", function (assert) {
		for (var i = 1; i < 9; i++) {
			checkParse("decimal", "2 " + aBinaryUnits[i - 1], 2 * Math.pow(1024, i));
			checkParse("decimal", "2 " + aDecimalUnits[i - 1], 2 * Math.pow(1000, i));
		}

		checkParse("decimal", "888 Bytes", 888);
		checkParse("decimal", "1 Byte", 1);
		checkParse("decimal", "888", 888);
	});

	QUnit.test("parse default", function (assert) {
		for (var i = 1; i < 9; i++) {
			checkParse("default", "2 " + aBinaryUnits[i - 1], 2 * Math.pow(1024, i));
			checkParse("default", "2 " + aDecimalUnits[i - 1], 2 * Math.pow(1000, i));
		}

		checkParse("default", "888 Bytes", 888);
		checkParse("default", "1 Byte", 1);
		checkParse("default", "888", 888);
	});

	QUnit.test("create format instance without giving any option", function (assert) {
		var oFormat = FileSizeFormat.getInstance();
		assert.equal(oFormat.format(100000), "100 KB", "BinarySize is set to false by default");
	});
});

