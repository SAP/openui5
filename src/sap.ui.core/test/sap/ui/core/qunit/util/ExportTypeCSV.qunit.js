/* global QUnit */

sap.ui.define([
	"sap/ui/core/util/ExportTypeCSV"
], function(ExportTypeCSV) {
	"use strict";

	QUnit.module("Properties");

	QUnit.test("separatorChar", function(assert) {
		var oCSV = new ExportTypeCSV({
			separatorChar: ';'
		});
		assert.equal(oCSV.getSeparatorChar(), ";", "separatorChar should be ';'");
	});

	QUnit.test("separatorChar default", function(assert) {
		var oCSV = new ExportTypeCSV();
		assert.equal(oCSV.getSeparatorChar(), ",", "separatorChar default should be ','");
	});

	QUnit.test("separatorChar invalid value", function(assert) {
		assert.throws(function() {
			new ExportTypeCSV({
				separatorChar: true
			});
		},
		/Value of property "separatorChar" needs to be exactly one character or empty. "true" is 4 characters long/,
		"Invalid separatorChar should throw an error.");
	});

	QUnit.module("Methods");

	QUnit.test("escapeContent (default separatorChar)", function(assert) {
		var oCSV = new ExportTypeCSV();

		assert.equal(oCSV.escapeContent(undefined), undefined, "Undefined");
		assert.equal(oCSV.escapeContent(null), null, "Null");
		assert.equal(oCSV.escapeContent(''), '', "Empty string");

		assert.equal(oCSV.escapeContent('abc'), 'abc', "Plain string");
		assert.equal(oCSV.escapeContent('a;b;c'), '"a;b;c"', "Contains common separator char (;)");
		assert.equal(oCSV.escapeContent('a\tb\tc'), '"a\tb\tc"', "Contains common separator char (tab)");
		assert.equal(oCSV.escapeContent('a,b,c'), '"a,b,c"', "Contains actual separator char");
		assert.equal(oCSV.escapeContent('a"b"c'), '"a""b""c"', "Contains double quote");

		assert.equal(oCSV.escapeContent('a\rb\rc'), '"a\rb\rc"', "Contains new line (CR)");
		assert.equal(oCSV.escapeContent('a\nb\nc'), '"a\nb\nc"', "Contains new line (LF)");
		assert.equal(oCSV.escapeContent('a\r\nb\r\nc'), '"a\r\nb\r\nc"', "Contains new line (CRLF)");

		assert.equal(oCSV.escapeContent('=123'), '=123', "No escaping: Number only formula (=)");
		assert.equal(oCSV.escapeContent('+123'), '+123', "No escaping: Number only formula (+)");
		assert.equal(oCSV.escapeContent('-123'), '-123', "No escaping: Number only formula (-)");
		assert.equal(oCSV.escapeContent('@123'), '@123', "No escaping: Number only formula (@)");

		assert.equal(oCSV.escapeContent('=123.456'), '=123.456', "No escaping: Number only formula (=)");
		assert.equal(oCSV.escapeContent('+123.456'), '+123.456', "No escaping: Number only formula (+)");
		assert.equal(oCSV.escapeContent('-123.456'), '-123.456', "No escaping: Number only formula (-)");
		assert.equal(oCSV.escapeContent('@123.456'), '@123.456', "No escaping: Number only formula (@)");

		assert.equal(oCSV.escapeContent('=123.456e7'), '=123.456e7', "No escaping: Number only formula with exponent (=)");
		assert.equal(oCSV.escapeContent('+123.456E7'), '+123.456E7', "No escaping: Number only formula with exponent (+)");
		assert.equal(oCSV.escapeContent('-123.456e+7'), '-123.456e+7', "No escaping: Number only formula with exponent (-)");
		assert.equal(oCSV.escapeContent('@123.456e-7'), '@123.456e-7', "No escaping: Number only formula with exponent (@)");

		assert.equal(oCSV.escapeContent('=FOO'), '\'=FOO', "Formula (=)");
		assert.equal(oCSV.escapeContent('+FOO'), '\'+FOO', "Formula (+)");
		assert.equal(oCSV.escapeContent('-FOO'), '\'-FOO', "Formula (-)");
		assert.equal(oCSV.escapeContent('@FOO'), '\'@FOO', "Formula (@)");

		assert.equal(oCSV.escapeContent('=123,456'), '"=123,456"', "Number only formula with comma (=)");
		assert.equal(oCSV.escapeContent('+123,456'), '"+123,456"', "Number only formula with comma (+)");
		assert.equal(oCSV.escapeContent('-123,456'), '"-123,456"', "Number only formula with comma (-)");
		assert.equal(oCSV.escapeContent('@123,456'), '"@123,456"', "Number only formula with comma (@)");

		assert.equal(oCSV.escapeContent('=FOO;BAR'), '"\'=FOO;BAR"', "Formula (=) with common separator char");
		assert.equal(oCSV.escapeContent('+FOO;BAR'), '"\'+FOO;BAR"', "Formula (+) with common separator char");
		assert.equal(oCSV.escapeContent('-FOO;BAR'), '"\'-FOO;BAR"', "Formula (-) with common separator char");
		assert.equal(oCSV.escapeContent('@FOO;BAR'), '"\'@FOO;BAR"', "Formula (@) with common separator char");

		assert.equal(oCSV.escapeContent('=FOO,BAR'), '"\'=FOO,BAR"', "Formula (=) with separator char");
		assert.equal(oCSV.escapeContent('+FOO,BAR'), '"\'+FOO,BAR"', "Formula (+) with separator char");
		assert.equal(oCSV.escapeContent('-FOO,BAR'), '"\'-FOO,BAR"', "Formula (-) with separator char");
		assert.equal(oCSV.escapeContent('@FOO,BAR'), '"\'@FOO,BAR"', "Formula (@) with separator char");

		assert.equal(oCSV.escapeContent('=FOO"BAR'), '"\'=FOO""BAR"', "Formula (=) with double quote");
		assert.equal(oCSV.escapeContent('+FOO"BAR'), '"\'+FOO""BAR"', "Formula (+) with double quote");
		assert.equal(oCSV.escapeContent('-FOO"BAR'), '"\'-FOO""BAR"', "Formula (-) with double quote");
		assert.equal(oCSV.escapeContent('@FOO"BAR'), '"\'@FOO""BAR"', "Formula (@) with double quote");

		assert.equal(oCSV.escapeContent('=FOO\rBAR'), '"\'=FOO\rBAR"', "Formula (=) with new line (CR)");
		assert.equal(oCSV.escapeContent('+FOO\rBAR'), '"\'+FOO\rBAR"', "Formula (+) with new line (CR)");
		assert.equal(oCSV.escapeContent('-FOO\rBAR'), '"\'-FOO\rBAR"', "Formula (-) with new line (CR)");
		assert.equal(oCSV.escapeContent('@FOO\rBAR'), '"\'@FOO\rBAR"', "Formula (@) with new line (CR)");

		assert.equal(oCSV.escapeContent('=FOO\nBAR'), '"\'=FOO\nBAR"', "Formula (=) with new line (LF)");
		assert.equal(oCSV.escapeContent('+FOO\nBAR'), '"\'+FOO\nBAR"', "Formula (+) with new line (LF)");
		assert.equal(oCSV.escapeContent('-FOO\nBAR'), '"\'-FOO\nBAR"', "Formula (-) with new line (LF)");
		assert.equal(oCSV.escapeContent('@FOO\nBAR'), '"\'@FOO\nBAR"', "Formula (@) with new line (LF)");

		assert.equal(oCSV.escapeContent('=FOO\r\nBAR'), '"\'=FOO\r\nBAR"', "Formula (=) with new line (CRLF)");
		assert.equal(oCSV.escapeContent('+FOO\r\nBAR'), '"\'+FOO\r\nBAR"', "Formula (+) with new line (CRLF)");
		assert.equal(oCSV.escapeContent('-FOO\r\nBAR'), '"\'-FOO\r\nBAR"', "Formula (-) with new line (CRLF)");
		assert.equal(oCSV.escapeContent('@FOO\r\nBAR'), '"\'@FOO\r\nBAR"', "Formula (@) with new line (CRLF)");

	});

	QUnit.test("escapeContent (custom separatorChar)", function(assert) {
		var oCSV = new ExportTypeCSV({
			separatorChar: ";"
		});

		assert.equal(oCSV.escapeContent(undefined), undefined, "Undefined");
		assert.equal(oCSV.escapeContent(null), null, "Null");
		assert.equal(oCSV.escapeContent(''), '', "Empty string");

		assert.equal(oCSV.escapeContent('abc'), 'abc', "Plain string");
		assert.equal(oCSV.escapeContent('a,b,c'), '"a,b,c"', "Contains common separator char (,)");
		assert.equal(oCSV.escapeContent('a\tb\tc'), '"a\tb\tc"', "Contains common separator char (tab)");
		assert.equal(oCSV.escapeContent('a;b;c'), '"a;b;c"', "Contains separator char");
		assert.equal(oCSV.escapeContent('a"b"c'), '"a""b""c"', "Contains double quote");

		assert.equal(oCSV.escapeContent('a\rb\rc'), '"a\rb\rc"', "Contains new line (CR)");
		assert.equal(oCSV.escapeContent('a\nb\nc'), '"a\nb\nc"', "Contains new line (LF)");
		assert.equal(oCSV.escapeContent('a\r\nb\r\nc'), '"a\r\nb\r\nc"', "Contains new line (CRLF)");

		assert.equal(oCSV.escapeContent('=123'), '=123', "No escaping: Number only formula (=)");
		assert.equal(oCSV.escapeContent('+123'), '+123', "No escaping: Number only formula (+)");
		assert.equal(oCSV.escapeContent('-123'), '-123', "No escaping: Number only formula (-)");
		assert.equal(oCSV.escapeContent('@123'), '@123', "No escaping: Number only formula (@)");

		assert.equal(oCSV.escapeContent('=123.456'), '=123.456', "No escaping: Number only formula (=)");
		assert.equal(oCSV.escapeContent('+123.456'), '+123.456', "No escaping: Number only formula (+)");
		assert.equal(oCSV.escapeContent('-123.456'), '-123.456', "No escaping: Number only formula (-)");
		assert.equal(oCSV.escapeContent('@123.456'), '@123.456', "No escaping: Number only formula (@)");

		assert.equal(oCSV.escapeContent('=123.456e7'), '=123.456e7', "No escaping: Number only formula with exponent (=)");
		assert.equal(oCSV.escapeContent('+123.456e7'), '+123.456e7', "No escaping: Number only formula with exponent (+)");
		assert.equal(oCSV.escapeContent('-123.456e+7'), '-123.456e+7', "No escaping: Number only formula with exponent (-)");
		assert.equal(oCSV.escapeContent('@123.456e-7'), '@123.456e-7', "No escaping: Number only formula with exponent (@)");

		assert.equal(oCSV.escapeContent('=FOO'), '\'=FOO', "Formula (=)");
		assert.equal(oCSV.escapeContent('+FOO'), '\'+FOO', "Formula (+)");
		assert.equal(oCSV.escapeContent('-FOO'), '\'-FOO', "Formula (-)");
		assert.equal(oCSV.escapeContent('@FOO'), '\'@FOO', "Formula (@)");

		assert.equal(oCSV.escapeContent('=123,456'), '"=123,456"', "Number only formula with comma (=)");
		assert.equal(oCSV.escapeContent('+123,456'), '"+123,456"', "Number only formula with comma (+)");
		assert.equal(oCSV.escapeContent('-123,456'), '"-123,456"', "Number only formula with comma (-)");
		assert.equal(oCSV.escapeContent('@123,456'), '"@123,456"', "Number only formula with comma (@)");

		assert.equal(oCSV.escapeContent('=FOO,BAR'), '"\'=FOO,BAR"', "Formula (=) with common separator char");
		assert.equal(oCSV.escapeContent('+FOO,BAR'), '"\'+FOO,BAR"', "Formula (+) with common separator char");
		assert.equal(oCSV.escapeContent('-FOO,BAR'), '"\'-FOO,BAR"', "Formula (-) with common separator char");
		assert.equal(oCSV.escapeContent('@FOO,BAR'), '"\'@FOO,BAR"', "Formula (@) with common separator char");

		assert.equal(oCSV.escapeContent('=FOO;BAR'), '"\'=FOO;BAR"', "Formula (=) with separator char");
		assert.equal(oCSV.escapeContent('+FOO;BAR'), '"\'+FOO;BAR"', "Formula (+) with separator char");
		assert.equal(oCSV.escapeContent('-FOO;BAR'), '"\'-FOO;BAR"', "Formula (-) with separator char");
		assert.equal(oCSV.escapeContent('@FOO;BAR'), '"\'@FOO;BAR"', "Formula (@) with separator char");

		assert.equal(oCSV.escapeContent('=FOO"BAR'), '"\'=FOO""BAR"', "Formula (=) with double quote");
		assert.equal(oCSV.escapeContent('+FOO"BAR'), '"\'+FOO""BAR"', "Formula (+) with double quote");
		assert.equal(oCSV.escapeContent('-FOO"BAR'), '"\'-FOO""BAR"', "Formula (-) with double quote");
		assert.equal(oCSV.escapeContent('@FOO"BAR'), '"\'@FOO""BAR"', "Formula (@) with double quote");

		assert.equal(oCSV.escapeContent('=FOO\rBAR'), '"\'=FOO\rBAR"', "Formula (=) with new line (CR)");
		assert.equal(oCSV.escapeContent('+FOO\rBAR'), '"\'+FOO\rBAR"', "Formula (+) with new line (CR)");
		assert.equal(oCSV.escapeContent('-FOO\rBAR'), '"\'-FOO\rBAR"', "Formula (-) with new line (CR)");
		assert.equal(oCSV.escapeContent('@FOO\rBAR'), '"\'@FOO\rBAR"', "Formula (@) with new line (CR)");

		assert.equal(oCSV.escapeContent('=FOO\nBAR'), '"\'=FOO\nBAR"', "Formula (=) with new line (LF)");
		assert.equal(oCSV.escapeContent('+FOO\nBAR'), '"\'+FOO\nBAR"', "Formula (+) with new line (LF)");
		assert.equal(oCSV.escapeContent('-FOO\nBAR'), '"\'-FOO\nBAR"', "Formula (-) with new line (LF)");
		assert.equal(oCSV.escapeContent('@FOO\nBAR'), '"\'@FOO\nBAR"', "Formula (@) with new line (LF)");

		assert.equal(oCSV.escapeContent('=FOO\r\nBAR'), '"\'=FOO\r\nBAR"', "Formula (=) with new line (CRLF)");
		assert.equal(oCSV.escapeContent('+FOO\r\nBAR'), '"\'+FOO\r\nBAR"', "Formula (+) with new line (CRLF)");
		assert.equal(oCSV.escapeContent('-FOO\r\nBAR'), '"\'-FOO\r\nBAR"', "Formula (-) with new line (CRLF)");
		assert.equal(oCSV.escapeContent('@FOO\r\nBAR'), '"\'@FOO\r\nBAR"', "Formula (@) with new line (CRLF)");
	});

});