/*global QUnit */
sap.ui.define(["sap/base/security/URLWhitelist"], function(URLWhitelist) {
	"use strict";

	QUnit.module("sap/base/security/URLWhitelist.validate", {
		afterEach: URLWhitelist.clear
	});

	QUnit.test("valid url empty whitelist", function(assert) {
		var sUrl = "http://www.sap.com";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " is valid");
		sUrl = "www.sap.com";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " is valid");
	});

	QUnit.test("Immutable entries test", function(assert) {
		URLWhitelist.add("https", "example.com", 1337, "path");

		var aEntries = URLWhitelist.entries();
		assert.equal(aEntries.length, 1, "1 entry is present");
		assert.equal(aEntries[0].protocol, "HTTPS", "protocol match");
		assert.equal(aEntries[0].host, "EXAMPLE.COM", "host match");
		assert.equal(aEntries[0].port, 1337, "port match");
		assert.equal(aEntries[0].path, "path", "path match");

		aEntries[0].protocol = "http";
		aEntries[0].host = "myhost";
		aEntries[0].port = 1338;
		aEntries[0].path = "mypath";

		aEntries = URLWhitelist.entries();
		assert.equal(aEntries.length, 1, "1 entry is present modified");
		assert.equal(aEntries[0].protocol, "http", "protocol match");
		assert.equal(aEntries[0].host, "myhost", "host match");
		assert.equal(aEntries[0].port, 1338, "port match");
		assert.equal(aEntries[0].path, "mypath", "path match");
	});

	QUnit.test("edge case parameters as url", function(assert) {
		assert.ok(URLWhitelist.validate(1231), "number is a valid URL");
		assert.ok(URLWhitelist.validate(null), "null is a valid URL");
		assert.ok(URLWhitelist.validate(undefined), "undefined is a valid URL");
		assert.ok(URLWhitelist.validate(""), "empty string is a valid URL");
		assert.ok(URLWhitelist.validate(false), "false is a valid URL");
		assert.ok(URLWhitelist.validate(), "no param is a valid URL");
		assert.ok(URLWhitelist.validate(":::"), "three colons is a valid URL");
		assert.ok(URLWhitelist.validate(/asd/), "regex is a valid URL");
	});

	QUnit.test("object as url", function(assert) {
		assert.notOk(URLWhitelist.validate({}), "object is not a valid URL");
	});

	QUnit.test("unknown protocol", function(assert) {
		var sUrl = "httpg://www.sap.com";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");
	});

	QUnit.test("ipv6 address", function(assert) {
		// IPv6 addresses without protocol seem not to be valid
		var sUrl = "1:2:3:4:5:6:7:8";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");
		sUrl = "2001:db8:1234:0000:0000:0000:0000:0000";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");

		sUrl = "http://2001:db8:1234:0000:0000:0000:0000:0000";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " is valid");
	});

	QUnit.test("ipv4 address", function(assert) {
		// IPv6 addresses without protocol seem to be valid
		var sUrl = "192.168.0.1";
		assert.ok(URLWhitelist.validate(undefined), sUrl + " is valid");
		sUrl = "http://192.168.1.1";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " is valid");
	});

	QUnit.test("mailto links", function(assert) {
		//Mailtolinks seem not to be valid
		var sUrl = "mailto:a@b.de,x@y.de";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");

		sUrl = "mailto://a@b.de";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");

		sUrl = "MAILTO:max@mustermann.de?subject=test";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");
	});

	QUnit.test("invalid characters in path", function(assert) {
		var sUrl = "http://www.sap.com/test/test/te^%&st.html";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");
	});

	QUnit.test("protocol match with whitelist", function(assert) {
		//is ok with empty whitelist
		var sUrl = "httpg://www.sap.com";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		URLWhitelist.add("httpm");
		sUrl = "httpg://www.sap.com";
		assert.notOk(URLWhitelist.validate(sUrl), sUrl + " is not valid");

		var sUrl2 = "httpm://www.sap.com";
		assert.ok(URLWhitelist.validate(sUrl2), sUrl2 + " valid");
	});

	QUnit.test("check the whitelist", function(assert) {

		URLWhitelist.add("http", "www.sap.com");
		URLWhitelist.add("http", "www.sap.de");
		URLWhitelist.add("http", "sap.com");
		URLWhitelist.add("http", "sap.de");
		URLWhitelist.add("", "www.ard.de");
		URLWhitelist.add("http", "www.zdf.de", "8080");
		URLWhitelist.add("https", "www.rtl.de", "", "/tv-program");
		URLWhitelist.add("https", "www.rtl.de", "", "/info*");
		URLWhitelist.add("", "*vox.de");

		var sUrl = "http://www.sap.com";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://de.sap.com";
		assert.ok(!URLWhitelist.validate(sUrl), sUrl + " not valid");

		sUrl = "ftp://www.sap.de";
		assert.ok(!URLWhitelist.validate(sUrl), sUrl + " not valid");

		sUrl = "http://www.sap.de/index.html";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.sap.de:1080/index.html";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.sap.com/global/images/SAPLogo.gif";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.test.de";
		assert.ok(!URLWhitelist.validate(sUrl), sUrl + " not valid");

		sUrl = "https://www.ard.de";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "ftp://www.ard.de";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.ard.de/index.html";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.zdf.de";
		assert.ok(!URLWhitelist.validate(sUrl), sUrl + " not valid");

		sUrl = "http://www.zdf.de:8080";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.rtl.de/tv-program";
		assert.ok(!URLWhitelist.validate(sUrl), sUrl + " not valid");

		sUrl = "https://www.rtl.de/tv-program";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "https://www.rtl.de/tv-program?parameter=value";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "https://www.rtl.de";
		assert.ok(!URLWhitelist.validate(sUrl), sUrl + " not valid");

		sUrl = "https://www.rtl.de/tv-program/today";
		assert.ok(!URLWhitelist.validate(sUrl), sUrl + " not valid");

		sUrl = "https://www.rtl.de/info";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "https://www.rtl.de/info/today";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://vox.de";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");

		sUrl = "http://info.vox.de";
		assert.ok(URLWhitelist.validate(sUrl), sUrl + " valid");
	});

	QUnit.module("sap/base/security/URLWhitelist.add", {
		afterEach: URLWhitelist.clear
	});
	QUnit.test("check whitelist add and delete entries", function(assert) {
		URLWhitelist.add("httpm");

		assert.equal(1, URLWhitelist.entries().length, "valid");

		URLWhitelist.delete(URLWhitelist.entries()[0]);

		assert.equal(0, URLWhitelist.entries().length, "valid");
	});

	QUnit.module("sap/base/security/URLWhitelist.delete", {
		afterEach: URLWhitelist.clear
	});
	QUnit.test("check whitelist delete entries", function(assert) {

		assert.equal(0, URLWhitelist.entries().length, "empty");
		URLWhitelist.delete(URLWhitelist.entries()[0]);
		URLWhitelist.delete(null);
		URLWhitelist.delete(false);
		URLWhitelist.delete({});
		assert.equal(0, URLWhitelist.entries().length, "empty");
	});

	QUnit.module("sap/base/security/URLWhitelist.clear", {
		afterEach: URLWhitelist.clear
	});
	QUnit.test("check whitelist clearing entries", function(assert) {

		// start with an empty whitelist -> length 0
		assert.equal(0, URLWhitelist.entries().length, "empty");

		// add an entry -> length 1
		URLWhitelist.add("httpm");

		assert.equal(1, URLWhitelist.entries().length, "1 entry");

		// clear all entries -> length 0
		URLWhitelist.clear();

		assert.equal(0, URLWhitelist.entries().length, "empty after clearing");
	});

	QUnit.module("sap/base/security/URLWhitelist.entries", {
		afterEach: URLWhitelist.clear
	});
	QUnit.test("check whitelist entries copy", function(assert) {

		assert.equal(0, URLWhitelist.entries().length, "empty");
		var aEntries = URLWhitelist.entries();
		aEntries.push({});
		assert.equal(0, URLWhitelist.entries().length, "empty");
		assert.equal(1, aEntries.length, "empty");
	});

});
