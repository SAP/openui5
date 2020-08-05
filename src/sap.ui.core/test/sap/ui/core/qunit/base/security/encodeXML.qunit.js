/*global QUnit */
sap.ui.define(["sap/base/security/encodeXML"], function(encodeXML) {
	"use strict";

	QUnit.module("Encode XML");


	QUnit.test("encode XML", function(assert){
		assert.equal(encodeXML("+"), "&#x2b;", "Plus");
		assert.equal(encodeXML("<>&\""), "&lt;&gt;&amp;&quot;", "<>&\"");
		assert.equal(encodeXML("\x00\x01\x02"), "&#xfffd;&#xfffd;&#xfffd;", "0x00 0x01 0x02");
		assert.equal(encodeXML(">&<\"\'\\/"), "&gt;&amp;&lt;&quot;&#x27;&#x5c;&#x2f;", ">&<\"\'\\/");
		assert.equal(encodeXML("!§$%;:/()=?|^*#"), "&#x21;&#xa7;&#x24;&#x25;&#x3b;&#x3a;&#x2f;&#x28;&#x29;&#x3d;&#x3f;&#x7c;&#x5e;&#x2a;&#x23;", "!§$%;:/()=?|^*#");
	});

	QUnit.test("should not encode", function(assert){
		assert.equal(encodeXML("nothingtoencode123,.-_"), "nothingtoencode123,.-_", "nothingtoencode123,.-_");
	});

	// http://unicode.org/review/pr-121.html
	QUnit.test("should replaced with 0xfffd", function(assert){
		assert.equal(encodeXML(String.fromCharCode(8)),  "&#xfffd;", "Backspace");
		assert.equal(encodeXML(String.fromCharCode(9)), "&#x9;", "Tab");
		assert.equal(encodeXML(String.fromCharCode(10)), "&#xa;", "Line feed");
		assert.equal(encodeXML(String.fromCharCode(11)), "&#xfffd;", "Vertical tab");
		assert.equal(encodeXML(String.fromCharCode(12)), "&#xfffd;", "Form feed");
		assert.equal(encodeXML(String.fromCharCode(13)), "&#xd;", "Carriage return");
		assert.equal(encodeXML(String.fromCharCode(14)), "&#xfffd;", "Shift out");
		assert.equal(encodeXML(String.fromCharCode(15)), "&#xfffd;", "Shift in");
		assert.equal(encodeXML(String.fromCharCode(16)), "&#xfffd;", "Data link escape");

	});

	QUnit.test("characters above (>) 255 (0xff) should not be encoded, except for 0x2028 and 0x2029", function(assert){
		assert.equal(encodeXML(String.fromCharCode(256)),  "Ā", "Ā (0x100)");
		assert.equal(encodeXML(String.fromCharCode(257)),  "ā", "ā (0x101)");
		assert.equal(encodeXML(String.fromCharCode(0x2028)),  "&#x2028;", "(0x2028)");
		assert.equal(encodeXML(String.fromCharCode(0x2029)),  "&#x2029;", "(0x2029)");
	});

});
