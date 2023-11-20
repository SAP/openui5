/*global QUnit */
sap.ui.define(["sap/base/security/URLListValidator"], function(URLListValidator) {
	"use strict";

	QUnit.module("sap/base/security/URLListValidator.validate", {
		afterEach: URLListValidator.clear
	});

	QUnit.test("valid url empty allowlist", function(assert) {
		var sUrl = "http://www.example.com";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " is valid");
		sUrl = "www.example.com";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " is valid");
	});

	QUnit.test("Immutable entries test", function(assert) {
		URLListValidator.add("https", "example.com", 1337, "path");

		var aEntries = URLListValidator.entries();
		assert.equal(aEntries.length, 1, "1 entry is present initial");
		assert.equal(aEntries[0].protocol, "HTTPS", "protocol match");
		assert.equal(aEntries[0].host, "EXAMPLE.COM", "host match");
		assert.equal(aEntries[0].port, 1337, "port match");
		assert.equal(aEntries[0].path, "path", "path match");
		try {
			aEntries[0].protocol = "http";
			assert.ok(false, "field is immutable");
		} catch (e) {
			assert.ok(e);
		}

		try {
			aEntries[0].host = "myhost";
			assert.ok(false, "field is immutable");
		} catch (e) {
			assert.ok(e);
		}
		try {
			aEntries[0].port = 1338;
			assert.ok(false, "field is immutable");
		} catch (e) {
			assert.ok(e);
		}

		try {
			aEntries[0].path = "mypath";
			assert.ok(false, "field is immutable");
		} catch (e) {
			assert.ok(e);
		}

		aEntries = URLListValidator.entries();
		assert.equal(aEntries.length, 1, "1 entry is present unmodified");
		assert.equal(aEntries[0].protocol, "HTTPS", "protocol match");
		assert.equal(aEntries[0].host, "EXAMPLE.COM", "host match");
		assert.equal(aEntries[0].port, 1337, "port match");
		assert.equal(aEntries[0].path, "path", "path match");
	});

	QUnit.test("edge case parameters as url", function(assert) {
		assert.ok(URLListValidator.validate(1231), "number is a valid URL");
		assert.ok(URLListValidator.validate(null), "null is a valid URL");
		assert.ok(URLListValidator.validate(undefined), "undefined is a valid URL");
		assert.ok(URLListValidator.validate(""), "empty string is a valid URL");
		assert.ok(URLListValidator.validate(false), "false is a valid URL");
		assert.ok(URLListValidator.validate(), "no param is a valid URL");
		assert.ok(URLListValidator.validate(":::"), "three colons is a valid URL");
		assert.ok(URLListValidator.validate(/asd/), "regex is a valid URL");
	});

	QUnit.test("Unusual number of slashes in front of host", function(assert) {
		URLListValidator.add("http", "sap.com");
		assert.notOk(URLListValidator.validate("http:evil.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http:/evil.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http:\\evil.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http:/\\evil.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http:/\\/evil.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http:/\\//evil.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http:///evil.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http:\\\\evil.com"), "URL is not valid");
	});

	QUnit.test("Whitespaces in URL with allow-list", function(assert) {
		URLListValidator.add("http", "sap.com");

		// URL not in allow-list
		assert.notOk(URLListValidator.validate("\rhttp://example.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("\nhttp://example.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("\thttp://example.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("\r\nhttp://example.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("\r\n\thttp://example.com"), "URL is not valid");

		assert.notOk(URLListValidator.validate("ht\rtp://example.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("ht\ntp://example.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("ht\ttp://example.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("ht\r\ntp://example.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("ht\r\n\ttp://example.com"), "URL is not valid");

		assert.notOk(URLListValidator.validate("http://exa\rmple.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http://exa\nmple.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http://exa\tmple.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http://exa\r\nmple.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http://exa\r\n\tmple.com"), "URL is not valid");

		assert.notOk(URLListValidator.validate("http://example.com?some=ab\ncd"), "URL is not valid.");
		assert.notOk(URLListValidator.validate("http://example.com?some=ab" + encodeURIComponent("\n") + "cd"), "URL is not valid.");

		// URL is in allow-list
		assert.notOk(URLListValidator.validate("ht\rtp://sap.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("ht\ntp://sap.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("ht\ttp://sap.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("ht\r\ntp://sap.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("ht\r\n\ttp://sap.com"), "URL is not valid");

		assert.notOk(URLListValidator.validate("http://sa\rp.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http://sa\np.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http://sa\tp.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http://sa\r\np.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http://sa\r\n\tp.com"), "URL is not valid");

		assert.notOk(URLListValidator.validate("http://sap.com?some=ab\ncd"), "URL is not valid.");
		assert.ok(URLListValidator.validate("http://sap.com?some=ab" + encodeURIComponent("\n") + "cd"), "URL is valid because it is on the allow-list.");
	});

	QUnit.test("Whitespaces in URL without allow-list", function(assert) {
		assert.notOk(URLListValidator.validate("ht\rtp://example.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("ht\ntp://example.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("ht\ttp://example.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("ht\r\ntp://example.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("ht\r\n\ttp://example.com"), "URL is not valid");

		assert.notOk(URLListValidator.validate("http://exa\rmple.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http://exa\nmple.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http://exa\tmple.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http://exa\r\nmple.com"), "URL is not valid");
		assert.notOk(URLListValidator.validate("http://exa\r\n\tmple.com"), "URL is not valid");
	});

	QUnit.test("object as url", function(assert) {
		assert.notOk(URLListValidator.validate({}), "object is not a valid URL");
	});

	QUnit.test("unknown protocol", function(assert) {
		var sUrl = "httpg://www.example.com";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");
	});

	QUnit.test("ipv6 address", function(assert) {
		// IPv6 addresses without protocol seem not to be valid
		var sUrl = "1:2:3:4:5:6:7:8";
		assert.notOk(URLListValidator.validate(sUrl), sUrl + " is not valid");
		sUrl = "2001:db8:1234:0000:0000:0000:0000:0000";
		assert.notOk(URLListValidator.validate(sUrl), sUrl + " is not valid");

		sUrl = "http://2001:db8:1234:0000:0000:0000:0000:0000";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " is valid");
	});

	QUnit.test("ipv4 address", function(assert) {
		// IPv6 addresses without protocol seem to be valid
		var sUrl = "192.168.0.1";
		assert.ok(URLListValidator.validate(undefined), sUrl + " is valid");
		sUrl = "http://192.168.1.1";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " is valid");
	});

	QUnit.test("mailto links", function(assert) {
		//Mailtolinks seem not to be valid
		var sUrl = "mailto:a@b.de,x@y.de";
		assert.notOk(URLListValidator.validate(sUrl), sUrl + " is not valid");

		sUrl = "mailto://a@b.de";
		assert.notOk(URLListValidator.validate(sUrl), sUrl + " is not valid");

		sUrl = "MAILTO:max@mustermann.de?subject=test";
		assert.notOk(URLListValidator.validate(sUrl), sUrl + " is not valid");
	});

	QUnit.test("invalid characters in path", function(assert) {
		var sUrl = "http://www.example.com/test/test/te^%&st.html";
		assert.notOk(URLListValidator.validate(sUrl), sUrl + " is not valid");
	});

	QUnit.test("protocol match with allowlist", function(assert) {
		//is ok with empty allowlist
		var sUrl = "httpg://www.example.com";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");

		URLListValidator.add("httpm");
		sUrl = "httpg://www.example.com";
		assert.notOk(URLListValidator.validate(sUrl), sUrl + " is not valid");

		var sUrl2 = "httpm://www.example.com";
		assert.ok(URLListValidator.validate(sUrl2), sUrl2 + " valid");
	});

	QUnit.test("check the allowlist", function(assert) {

		URLListValidator.add("http", "www.example.com");
		URLListValidator.add("http", "www.example.net");
		URLListValidator.add("http", "example.com");
		URLListValidator.add("http", "example.net");
		URLListValidator.add("", "www.example.org");
		URLListValidator.add("http", "www.my.test", "8080");
		URLListValidator.add("https", "www.other.test", "", "/my-news");
		URLListValidator.add("https", "www.other.test", "", "/info*");
		URLListValidator.add("", "*my.example");

		var sUrl = "http://www.example.com";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");

		sUrl = "http://de.example.com";
		assert.ok(!URLListValidator.validate(sUrl), sUrl + " not valid");

		sUrl = "ftp://www.example.net";
		assert.ok(!URLListValidator.validate(sUrl), sUrl + " not valid");

		sUrl = "http://www.example.net/index.html";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.example.net:1080/index.html";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.example.com/global/images/SAPLogo.gif";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.test.localhost";
		assert.ok(!URLListValidator.validate(sUrl), sUrl + " not valid");

		sUrl = "https://www.example.org";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");

		sUrl = "ftp://www.example.org";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.example.org/index.html";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.my.test";
		assert.ok(!URLListValidator.validate(sUrl), sUrl + " not valid");

		sUrl = "http://www.my.test:8080";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");

		sUrl = "http://www.other.test/my-news";
		assert.ok(!URLListValidator.validate(sUrl), sUrl + " not valid");

		sUrl = "https://www.other.test/my-news";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");

		sUrl = "https://www.other.test/my-news?parameter=value";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");

		sUrl = "https://www.other.test";
		assert.ok(!URLListValidator.validate(sUrl), sUrl + " not valid");

		sUrl = "https://www.other.test/my-news/today";
		assert.ok(!URLListValidator.validate(sUrl), sUrl + " not valid");

		sUrl = "https://www.other.test/info";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");

		sUrl = "https://www.other.test/info/today";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");

		sUrl = "http://my.example";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");

		sUrl = "http://info.my.example";
		assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");
	});

	QUnit.module("sap/base/security/URLListValidator.add", {
		afterEach: URLListValidator.clear
	});


	QUnit.module("sap/base/security/URLListValidator.clear", {
		afterEach: URLListValidator.clear
	});
	QUnit.test("check allowlist clearing entries", function(assert) {

		// start with an empty allowlist -> length 0
		assert.equal(0, URLListValidator.entries().length, "empty");

		// add an entry -> length 1
		URLListValidator.add("httpm");

		assert.equal(1, URLListValidator.entries().length, "1 entry");

		// clear all entries -> length 0
		URLListValidator.clear();

		assert.equal(0, URLListValidator.entries().length, "empty after clearing");
	});

	QUnit.module("sap/base/security/URLListValidator.entries", {
		afterEach: URLListValidator.clear
	});
	QUnit.test("check allowlist entries copy", function(assert) {

		assert.equal(0, URLListValidator.entries().length, "empty");
		var aEntries = URLListValidator.entries();
		aEntries.push({});
		assert.equal(0, URLListValidator.entries().length, "empty");
		assert.equal(1, aEntries.length, "empty");
	});

});
