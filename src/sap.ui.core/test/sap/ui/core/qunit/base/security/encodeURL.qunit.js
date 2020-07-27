/*global QUnit */
sap.ui.define(["sap/base/security/encodeURL"], function(encodeURL) {
	"use strict";

	QUnit.module("Encode URL");
	// URL context
	QUnit.test("encode URL", function(assert){
		assert.equal(encodeURL("-_."), "-_.", "not escaped characters");
		assert.equal(encodeURL("*"), "%2a", "Asterisk");
		assert.equal(encodeURL("+"), "%2b", "Plus");
		assert.equal(encodeURL("$"), "%24", "Dollar");
		assert.equal(encodeURL(" "), "%20", "Space");
		assert.equal(encodeURL("^"), "%5e", "Space");
		assert.equal(encodeURL("!#=|{};,:/"), "%21%23%3d%7c%7b%7d%3b%2c%3a%2f", "Special Characters #1");
		assert.equal(encodeURL("@[]()%~&'%"), "%40%5b%5d%28%29%25%7e%26%27%25", "Special Characters #2");
		assert.equal(encodeURL("ä"), "%c3%a4", "Umlaut");
		assert.equal(encodeURL("\x00\x01\x02"), "%00%01%02", "0x00 0x01 0x02");
		assert.equal(encodeURL(">&<\"\'\\/"), "%3e%26%3c%22%27%5c%2f", ">&<\"\'\\/");
		assert.equal(encodeURL(String.fromCharCode(1337 * 2)), "%e0%a9%b2", "unicode character above 2048");
		assert.equal(encodeURL(String.fromCodePoint(151851)), "%f0%a5%84%ab", "Unicode code point above 0xffff");
	});

	QUnit.test("should not encode", function(assert){
		assert.equal(encodeURL("nothingtoencode123-._"), "nothingtoencode123-._", "nothingtoencode123-._");
	});

	QUnit.test("characters above (>) 255 (0xff) should be encoded always", function(assert){
		assert.equal(encodeURL(String.fromCharCode(256)),  "%c4%80", "Ā (0x100)");
		assert.equal(encodeURL(String.fromCharCode(257)),  "%c4%81", "ā (0x101)");
	});

});
