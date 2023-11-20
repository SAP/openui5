/*global QUnit */
sap.ui.define(["sap/base/security/encodeJS"], function(encodeJS) {
	"use strict";

	QUnit.module("Encode JS");
	// JS context
	QUnit.test("encode JS", function(assert){
		assert.equal(encodeJS("\""), "\\x22", "Quote");
		assert.equal(encodeJS("\'"), "\\x27", "Apostrophe");
		assert.equal(encodeJS("\x00\x01\x02"), "\\x00\\x01\\x02", "0x00 0x01 0x02");
		assert.equal(encodeJS(">&<\"\'\\/"), "\\x3e\\x26\\x3c\\x22\\x27\\x5c\\x2f", ">&<\"\'\\/");
	});


	QUnit.test("should not encode", function(assert){
		assert.equal(encodeJS("nothingtoencode123,._"), "nothingtoencode123,._", "nothingtoencode123,._");
	});

	QUnit.test("characters above (>) 255 (0xff) should not be encoded, except for 0x2028 and 0x2029", function(assert){
		assert.equal(encodeJS(String.fromCharCode(256)),  "Ā", "Ā (0x100)");
		assert.equal(encodeJS(String.fromCharCode(257)),  "ā", "ā (0x101)");
		assert.equal(encodeJS(String.fromCharCode(0x2028)),  "\\u2028", "(0x2028)");
		assert.equal(encodeJS(String.fromCharCode(0x2029)),  "\\u2029", "(0x2029)");
	});

});
