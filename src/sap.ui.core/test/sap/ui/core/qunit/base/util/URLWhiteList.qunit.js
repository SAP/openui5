/*global QUnit */
sap.ui.define(["sap/base/util/URLWhiteList"], function(URLWhiteList) {
	"use strict";

	QUnit.module("sap/base/util/URLWhiteList.validate", {
		afterEach: URLWhiteList.clear
	});

	QUnit.test("valid url empty whitelist", function(assert) {
		var sUrl = "http://www.sap.com";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " is valid");
		sUrl = "www.sap.com";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " is valid");
	});

	QUnit.test("edge case parameters as url", function(assert) {
		assert.ok(URLWhiteList.validate(1231), "number is a valid URL");
		assert.ok(URLWhiteList.validate(null), "null is a valid URL");
		assert.ok(URLWhiteList.validate(undefined), "undefined is a valid URL");
		assert.ok(URLWhiteList.validate(""), "empty string is a valid URL");
		assert.ok(URLWhiteList.validate(false), "false is a valid URL");
		assert.ok(URLWhiteList.validate(), "no param is a valid URL");
		assert.ok(URLWhiteList.validate(":::"), "three colons is a valid URL");
		assert.ok(URLWhiteList.validate(/asd/), "regex is a valid URL");
	});

	QUnit.test("object as url", function(assert) {
		assert.notOk(URLWhiteList.validate({}), "object is not a valid URL");
	});

	QUnit.test("unknown protocol", function(assert) {
		var sUrl = "httpg://www.sap.com";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " valid");
	});

	QUnit.test("ipv6 address", function(assert) {
		// IPv6 addresses without protocol seem not to be valid
		var sUrl = "1:2:3:4:5:6:7:8";
		assert.notOk(URLWhiteList.validate(sUrl), sUrl + " is not valid");
		sUrl = "2001:db8:1234:0000:0000:0000:0000:0000";
		assert.notOk(URLWhiteList.validate(sUrl), sUrl + " is not valid");

		sUrl = "http://2001:db8:1234:0000:0000:0000:0000:0000";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " is valid");
	});

	QUnit.test("ipv4 address", function(assert) {
		// IPv6 addresses without protocol seem to be valid
		var sUrl = "192.168.0.1";
		assert.ok(URLWhiteList.validate(undefined), sUrl + " is valid");
		sUrl = "http://192.168.1.1";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " is valid");
	});

	QUnit.test("mailto links", function(assert) {
		//Mailtolinks seem not to be valid
		var sUrl = "mailto:a@b.de,x@y.de";
		assert.notOk(URLWhiteList.validate(sUrl), sUrl + " is not valid");

		sUrl = "mailto://a@b.de";
		assert.notOk(URLWhiteList.validate(sUrl), sUrl + " is not valid");

		sUrl = "MAILTO:max@mustermann.de?subject=test";
		assert.notOk(URLWhiteList.validate(sUrl), sUrl + " is not valid");
	});

	QUnit.test("invalid characters in path", function(assert) {
		var sUrl = "http://www.sap.com/test/test/te^%&st.html";
		assert.notOk(URLWhiteList.validate(sUrl), sUrl + " is not valid");
	});

	QUnit.test("protocol match with whitelist", function(assert) {
		//is ok with empty whitelist
		var sUrl = "httpg://www.sap.com";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " valid");

		URLWhiteList.add("httpm");
		sUrl = "httpg://www.sap.com";
		assert.notOk(URLWhiteList.validate(sUrl), sUrl + " is not valid");

		var sUrl2 = "httpm://www.sap.com";
		assert.ok(URLWhiteList.validate(sUrl2), sUrl2 + " valid");
	});

	QUnit.test("check the whitelist", function(assert) {

		URLWhiteList.add("http", "www.sap.com");
		URLWhiteList.add("http", "www.sap.de");
		URLWhiteList.add("http", "sap.com");
		URLWhiteList.add("http", "sap.de");
		URLWhiteList.add("", "www.ard.de");
		URLWhiteList.add("http", "www.zdf.de", "8080");
		URLWhiteList.add("https", "www.rtl.de", "", "/tv-program");
		URLWhiteList.add("https", "www.rtl.de", "", "/info*");
		URLWhiteList.add("", "*vox.de");

		var sUrl = "http://www.sap.com";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " valid");

		sUrl = "http://de.sap.com";
		assert.ok(!URLWhiteList.validate(sUrl), sUrl + " not valid");

		sUrl = "ftp://www.sap.de";
		assert.ok(!URLWhiteList.validate(sUrl), sUrl + " not valid");

		sUrl = "http://www.sap.de/index.html";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.sap.de:1080/index.html";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.sap.com/global/images/SAPLogo.gif";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.test.de";
		assert.ok(!URLWhiteList.validate(sUrl), sUrl + " not valid");

		sUrl = "https://www.ard.de";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " valid");

		sUrl = "ftp://www.ard.de";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.ard.de/index.html";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.zdf.de";
		assert.ok(!URLWhiteList.validate(sUrl), sUrl + " not valid");

		sUrl = "http://www.zdf.de:8080";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.rtl.de/tv-program";
		assert.ok(!URLWhiteList.validate(sUrl), sUrl + " not valid");

		sUrl = "https://www.rtl.de/tv-program";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " valid");

		sUrl = "https://www.rtl.de/tv-program?parameter=value";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " valid");

		sUrl = "https://www.rtl.de";
		assert.ok(!URLWhiteList.validate(sUrl), sUrl + " not valid");

		sUrl = "https://www.rtl.de/tv-program/today";
		assert.ok(!URLWhiteList.validate(sUrl), sUrl + " not valid");

		sUrl = "https://www.rtl.de/info";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " valid");

		sUrl = "https://www.rtl.de/info/today";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " valid");

		sUrl = "http://vox.de";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " valid");

		sUrl = "http://info.vox.de";
		assert.ok(URLWhiteList.validate(sUrl), sUrl + " valid");
	});

	QUnit.module("sap/base/util/URLWhiteList.add", {
		afterEach: URLWhiteList.clear
	});
	QUnit.test("check whitelist add and delete entries", function(assert) {
		URLWhiteList.add("httpm");

		assert.equal(1, URLWhiteList.entries().length, "valid");

		URLWhiteList.delete(URLWhiteList.entries()[0]);

		assert.equal(0, URLWhiteList.entries().length, "valid");
	});

	QUnit.module("sap/base/util/URLWhiteList.delete", {
		afterEach: URLWhiteList.clear
	});
	QUnit.test("check whitelist delete entries", function(assert) {

		assert.equal(0, URLWhiteList.entries().length, "empty");
		URLWhiteList.delete(URLWhiteList.entries()[0]);
		URLWhiteList.delete(null);
		URLWhiteList.delete(false);
		URLWhiteList.delete({});
		assert.equal(0, URLWhiteList.entries().length, "empty");
	});

	QUnit.module("sap/base/util/URLWhiteList.clear", {
		afterEach: URLWhiteList.clear
	});
	QUnit.test("check whitelist clearing entries", function(assert) {

		// start with an empty whitelist -> length 0
		assert.equal(0, URLWhiteList.entries().length, "empty");

		// add an entry -> length 1
		URLWhiteList.add("httpm");

		assert.equal(1, URLWhiteList.entries().length, "1 entry");

		// clear all entries -> length 0
		URLWhiteList.clear();

		assert.equal(0, URLWhiteList.entries().length, "empty after clearing");
	});

	QUnit.module("sap/base/util/URLWhiteList.entries", {
		afterEach: URLWhiteList.clear
	});
	QUnit.test("check whitelist entries copy", function(assert) {

		assert.equal(0, URLWhiteList.entries().length, "empty");
		var aEntries = URLWhiteList.entries();
		aEntries.push({});
		assert.equal(0, URLWhiteList.entries().length, "empty");
		assert.equal(1, aEntries.length, "empty");
	});

});
