/* global QUnit */

sap.ui.define(["jquery.sap.encoder"], function (jQuery) {
	"use strict";
	// Output encodings should follow the guide
	// <SAPWIKI>/wiki/download/attachments/867713114/XSS_Char_Table.pdf

	QUnit.module("HTML context");
	QUnit.test("encode HTML", function (assert) {
		assert.equal(jQuery.sap.encodeHTML("+"), "&#x2b;", "Plus");
		assert.equal(jQuery.sap.encodeHTML("<>&\""), "&lt;&gt;&amp;&quot;", "<>&\"");
		assert.equal(jQuery.sap.encodeHTML("\x00\x01\x02"), "&#xfffd;&#xfffd;&#xfffd;", "0x00 0x01 0x02");
		assert.equal(jQuery.sap.encodeHTML(">&<\"\'\\/"), "&gt;&amp;&lt;&quot;&#x27;&#x5c;&#x2f;", ">&<\"\'\\/");
	});

	QUnit.test("should not encode", function (assert) {
		assert.equal(jQuery.sap.encodeHTML("nothingtoencode123,.-_"), "nothingtoencode123,.-_", "nothingtoencode123,.-_");
	});

	// http://unicode.org/review/pr-121.html
	QUnit.test("should replaced with 0xfffd", function (assert) {
		assert.equal(jQuery.sap.encodeHTML(String.fromCharCode(8)), "&#xfffd;", "Backspace");
		assert.equal(jQuery.sap.encodeHTML(String.fromCharCode(9)), "&#x9;", "Tab");
		assert.equal(jQuery.sap.encodeHTML(String.fromCharCode(10)), "&#xa;", "Line feed");
		assert.equal(jQuery.sap.encodeHTML(String.fromCharCode(11)), "&#xfffd;", "Vertical tab");
		assert.equal(jQuery.sap.encodeHTML(String.fromCharCode(12)), "&#xfffd;", "Form feed");
		assert.equal(jQuery.sap.encodeHTML(String.fromCharCode(13)), "&#xd;", "Carriage return");
		assert.equal(jQuery.sap.encodeHTML(String.fromCharCode(14)), "&#xfffd;", "Shift out");
		assert.equal(jQuery.sap.encodeHTML(String.fromCharCode(15)), "&#xfffd;", "Shift in");
		assert.equal(jQuery.sap.encodeHTML(String.fromCharCode(16)), "&#xfffd;", "Data link escape");

	});

	QUnit.test("characters above (>) 255 (0xff) should not be encoded, except for 0x2028 and 0x2029", function (assert) {
		assert.equal(jQuery.sap.encodeHTML(String.fromCharCode(256)), "Ā", "Ā (0x100)");
		assert.equal(jQuery.sap.encodeHTML(String.fromCharCode(257)), "ā", "ā (0x101)");
		assert.equal(jQuery.sap.encodeHTML(String.fromCharCode(0x2028)), "&#x2028;", "(0x2028)");
		assert.equal(jQuery.sap.encodeHTML(String.fromCharCode(0x2029)), "&#x2029;", "(0x2029)");
	});

	QUnit.module("JS context");
	QUnit.test("encode JS", function (assert) {
		assert.equal(jQuery.sap.encodeJS("\""), "\\x22", "Quote");
		assert.equal(jQuery.sap.encodeJS("\'"), "\\x27", "Apostrophe");
		assert.equal(jQuery.sap.encodeJS("\x00\x01\x02"), "\\x00\\x01\\x02", "0x00 0x01 0x02");
		assert.equal(jQuery.sap.encodeJS(">&<\"\'\\/"), "\\x3e\\x26\\x3c\\x22\\x27\\x5c\\x2f", ">&<\"\'\\/");
	});


	QUnit.test("should not encode", function (assert) {
		assert.equal(jQuery.sap.encodeJS("nothingtoencode123,._"), "nothingtoencode123,._", "nothingtoencode123,._");
	});

	QUnit.test("characters above (>) 255 (0xff) should not be encoded, except for 0x2028 and 0x2029", function (assert) {
		assert.equal(jQuery.sap.encodeJS(String.fromCharCode(256)), "Ā", "Ā (0x100)");
		assert.equal(jQuery.sap.encodeJS(String.fromCharCode(257)), "ā", "ā (0x101)");
		assert.equal(jQuery.sap.encodeJS(String.fromCharCode(0x2028)), "\\u2028", "(0x2028)");
		assert.equal(jQuery.sap.encodeJS(String.fromCharCode(0x2029)), "\\u2029", "(0x2029)");
	});

	QUnit.module("URL context");
	QUnit.test("encode URL", function (assert) {
		assert.equal(jQuery.sap.encodeURL("*"), "%2a", "Asterisk");
		assert.equal(jQuery.sap.encodeURL("+"), "%2b", "Plus");
		assert.equal(jQuery.sap.encodeURL("ä"), "%c3%a4", "Umlaut");
		assert.equal(jQuery.sap.encodeURL("\x00\x01\x02"), "%00%01%02", "0x00 0x01 0x02");
		assert.equal(jQuery.sap.encodeURL(">&<\"\'\\/"), "%3e%26%3c%22%27%5c%2f", ">&<\"\'\\/");
	});
	QUnit.test("encode URL parameters", function (assert) {
		assert.equal(jQuery.sap.encodeURLParameters({
			"?": "=",
			"&": "?",
			">&<\"\'\\/": String.fromCharCode(256)
		}), "%3f=%3d&%26=%3f&%3e%26%3c%22%27%5c%2f=%c4%80", "parameter map");
		assert.equal(jQuery.sap.encodeURLParameters({}), "", "empty parameter map");
		assert.equal(jQuery.sap.encodeURLParameters(), "", "no parameter map");
	});
	QUnit.test("should not encode", function (assert) {
		assert.equal(jQuery.sap.encodeURL("nothingtoencode123-._"), "nothingtoencode123-._", "nothingtoencode123-._");
	});

	QUnit.test("characters above (>) 255 (0xff) should be encoded always", function (assert) {
		assert.equal(jQuery.sap.encodeURL(String.fromCharCode(256)), "%c4%80", "Ā (0x100)");
		assert.equal(jQuery.sap.encodeURL(String.fromCharCode(257)), "%c4%81", "ā (0x101)");
	});

	QUnit.module("CSS context");
	QUnit.test("encode CSS", function (assert) {
		assert.equal(jQuery.sap.encodeCSS("+"), "\\2b", "Plus");
		assert.equal(jQuery.sap.encodeCSS("~7"), "\\7e 7", "~7");
		assert.equal(jQuery.sap.encodeCSS("+apple"), "\\2b apple", "+apple");
		assert.equal(jQuery.sap.encodeCSS("/BUG"), "\\2f BUG", "/BUG");
		assert.equal(jQuery.sap.encodeCSS("~test"), "\\7etest", "~test");
		assert.equal(jQuery.sap.encodeCSS("\x00\x01\x02"), "\\0\\1\\2", "0x00 0x01 0x02");
		assert.equal(jQuery.sap.encodeCSS(">&<\"\'\\/"), "\\3e\\26\\3c\\22\\27\\5c\\2f", ">&<\"\'\\/");
	});

	QUnit.test("should not encode", function (assert) {
		assert.equal(jQuery.sap.encodeCSS("nothingtoencode123"), "nothingtoencode123", "nothingtoencode123");

	});

	QUnit.test("characters above (>) 255 (0xff) should not be encoded, except for 0x2028 and 0x2029", function (assert) {
		assert.equal(jQuery.sap.encodeCSS(String.fromCharCode(256)), "Ā", "Ā (0x100)");
		assert.equal(jQuery.sap.encodeCSS(String.fromCharCode(257)), "ā", "ā (0x101)");
		assert.equal(jQuery.sap.encodeCSS(String.fromCharCode(0x2028)), "\\2028", "(0x2028)");
		assert.equal(jQuery.sap.encodeCSS(String.fromCharCode(0x2029)), "\\2029", "(0x2029)");
	});

	QUnit.module("URL validation");
	QUnit.test("HTTP urls", function (assert) {
		assert.equal(jQuery.sap.validateUrl("http://host"), true, "http://host");
		assert.equal(jQuery.sap.validateUrl("http://host/path"), true, "http://host/path");
		assert.equal(jQuery.sap.validateUrl("http://www.host.com"), true, "http://www.host.com");
		assert.equal(jQuery.sap.validateUrl("http://www.host.com?name=value"), true, "http://www.host.com?name=value");
		assert.equal(jQuery.sap.validateUrl("http://www.host.com#somehash"), true, "http://www.host.com#somehash");
		assert.equal(jQuery.sap.validateUrl("http://www.host.com?name=value#somehash"), true, "http://www.host.com?name=value#somehash");
		assert.equal(jQuery.sap.validateUrl("http://www.host.com/path%7e+13?_name@=!value+#somehash?/"), true, "http://www.host.com/path%7e+13?_name@=!value+#somehash?/");

		assert.equal(jQuery.sap.validateUrl("http://www.host.com/invalid\\path"), false, "Invalid character in path");
		assert.equal(jQuery.sap.validateUrl("http://www.host.com/path?name=invalid>value"), false, "Invalid character in query");
		assert.equal(jQuery.sap.validateUrl("http://www.host.com/path?invalid>value"), false, "Invalid character in query without equal sign");
		assert.equal(jQuery.sap.validateUrl("http://www.host.com/path#invalid#hash"), false, "Invalid character in hash");
		assert.equal(jQuery.sap.validateUrl("http://www.host.com/invalid%path"), false, "Invalid percent encoding");

	});

	QUnit.test("mailto urls", function (assert) {
		jQuery.sap.addUrlWhitelist("mailto");
		assert.equal(jQuery.sap.validateUrl("mailto:name@domain.com"), true, "mailto:name@domain.com");
		assert.equal(jQuery.sap.validateUrl("mailto:NAME@domain.com"), true, "mailto:NAME@domain.com");
		assert.equal(jQuery.sap.validateUrl("mailto:name@some-domain.com"), true, "mailto:name@some-domain.com");
		assert.equal(jQuery.sap.validateUrl("mailto:someone@example.com?subject=This%20is%20the%20subject&cc=someone_else@example.com&body=This%20is%20the%20body"), true, "should accept mailto URL with parameters");
		assert.equal(jQuery.sap.validateUrl("mailto:someone@example.com,someoneelse@example.com"), true, "should accept mailto URL with multiple addresses");
		assert.equal(jQuery.sap.validateUrl("mailto:?to=&subject=mailto"), true, "should accept mailto URL without addresses");
		assert.equal(jQuery.sap.validateUrl("mailto:name-with$lot_of!strange%23characters@domain.com"), true, "mailto:name-with$lot_of!strange#characters@domain.com");
		jQuery.sap.clearUrlWhitelist();
	});

	QUnit.test("Syntax check", function (assert) {

		var sUrl = "http://www.sap.com";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http:\\www.sap.com";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "https://www.sap.com";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "ftp://sap.com";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "images/pic.gif";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "../images/pic.gif";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "//test.html";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "<script>alert('Hello');<" + "/script>";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "<%53cript>alert('Hello');<" + "/script>";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "<SCRIPT>alert('Hello');<" + "/script>";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = '<script language="javascript">alert("Hello");<' + '/script>';
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "Hello\nWorld";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "http://www.sap.com/index.html?sap-par1=true&sap-par2=false";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http://www.sap.com/index.html?sap-par1=1%2";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "http://www.sap.com/index.html?sap-par1=1<script>alert('Test')<" + "/script>";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "http://www.sap.com/index.html#home";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http://www.sap.com/index.html?#1<script>alert('Test')<" + "/script>";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "http://www.sap.com/index.html?sap-par1=true&sap-par2=false#home";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http://www.sap.com/index.html#hash/with/slashes?and/question/marks";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http://<invalid hostname>/index.html";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "http://some.0.more-complicated.name/index.html";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http://some.invalid-.name/index.html";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "http://192.168.1.1/index.html";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http://192.168.0.256/index.html";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "http://[3ffe:2a00:100:7031::1]/index.html";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http://[1:::3]/index.html";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

	});

	QUnit.test("Deprecated jQuery.sap.validateUrl", function (assert) {
		jQuery.sap.addUrlWhitelist("http", "www.sap.com");
		jQuery.sap.addUrlWhitelist("http", "www.sap.de");
		jQuery.sap.addUrlWhitelist("http", "sap.com");
		jQuery.sap.addUrlWhitelist("http", "sap.de");
		jQuery.sap.addUrlWhitelist("", "www.ard.de");
		jQuery.sap.addUrlWhitelist("http", "www.zdf.de", "8080");
		jQuery.sap.addUrlWhitelist("https", "www.rtl.de", "", "/tv-program");
		jQuery.sap.addUrlWhitelist("https", "www.rtl.de", "", "/info*");
		jQuery.sap.addUrlWhitelist("", "*vox.de");

		var sUrl = "http://www.sap.com";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http://de.sap.com";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "ftp://www.sap.de";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "http://www.sap.de/index.html";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http://www.sap.de:1080/index.html";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http://www.sap.com/global/images/SAPLogo.gif";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http://www.test.de";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "https://www.ard.de";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "ftp://www.ard.de";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http://www.ard.de/index.html";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http://www.zdf.de";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "http://www.zdf.de:8080";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http://www.rtl.de/tv-program";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "https://www.rtl.de/tv-program";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "https://www.rtl.de/tv-program?parameter=value";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "https://www.rtl.de";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "https://www.rtl.de/tv-program/today";
		assert.ok(!jQuery.sap.validateUrl(sUrl), sUrl + " not valid");

		sUrl = "https://www.rtl.de/info";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "https://www.rtl.de/info/today";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http://vox.de";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		sUrl = "http://info.vox.de";
		assert.ok(jQuery.sap.validateUrl(sUrl), sUrl + " valid");

		jQuery.sap.clearUrlWhitelist();
	});

	QUnit.module("Sanitize check");

	QUnit.test("valid HTML5", function (assert) {

		var sHTML = "<div><article></article><progress></progress></div>";
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = "<table><tr><td></td></tr></table>";
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = "<div><input><audio></audio></div>";
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = '<div><img draggable="true"><video></video></div>';
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sHTML, sHTML + " valid");

	});

	QUnit.test("obsolete HTML4 (not valid)", function (assert) {

		var sHTML = "<div><font></font><center></center></div>";
		var sresultHTML = "<div></div>";
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sresultHTML, sHTML + " not valid");

		sHTML = "<table><tr><td><frame></frame></td></tr></table>";
		sresultHTML = "<table><tr><td></td></tr></table>";
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sresultHTML, sHTML + " not valid");

		sHTML = "<div><dir></dir></div>";
		sresultHTML = "<div></div>";
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sresultHTML, sHTML + " not valid");

		sHTML = "<div><img><nobr>Some Text</nobr></div>";
		sresultHTML = "<div><img>Some Text</div>";
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sresultHTML, sHTML + " not valid");

	});

	QUnit.test("dangerous code (not valid)", function (assert) {

		var sHTML = "<table><tr><td><script>alert('XSS attack');</" + "script></td></tr></table>";
		var sresultHTML = "<table><tr><td></td></tr></table>";
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sresultHTML, sHTML + " not valid");

		sHTML = "<div><object></object><audio></audio></div>";
		sresultHTML = "<div><audio></audio></div>";
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sresultHTML, sHTML + " not valid");

		sHTML = "<div><title></title><audio></audio></div>";
		sresultHTML = "<div><audio></audio></div>";
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sresultHTML, sHTML + " not valid");

		sHTML = "<html><head></head><body><div></div></body></html>";
		sresultHTML = "<div></div>";
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sresultHTML, sHTML + " not valid");

	});

	QUnit.test("valid URLs", function (assert) {

		var sHTML = '<div><a href="http://anonymous.org">Some Link</a></div>';
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = '<table><tr><td><a href="http://www.sap.com">SAP</a></td></tr></table>';
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = '<div><a href="https://sdn.sap.com">SDN</a><audio></audio></div>';
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = '<div><img draggable="true"><a href="http://www.sap.com/index.epx">SAP with path</a><video></video></div>';
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sHTML, sHTML + " valid");

	});

	QUnit.test("invalid URLs (not valid)", function (assert) {

		var sHTML = '<div><a href="xxxxx%%%%%%-----------;;;;;;">Some Link</a></div>';
		var sresultHTML = '<div><a>Some Link</a></div>';
		assert.equal(jQuery.sap._sanitizeHTML(sHTML), sresultHTML, sHTML + " not valid");

	});
});
