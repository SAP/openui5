import URLListValidator from "sap/base/security/URLListValidator";
QUnit.module("sap/base/security/URLListValidator.validate", {
    afterEach: URLListValidator.clear
});
QUnit.test("valid url empty allowlist", function (assert) {
    var sUrl = "http://www.example.com";
    assert.ok(URLListValidator.validate(sUrl), sUrl + " is valid");
    sUrl = "www.example.com";
    assert.ok(URLListValidator.validate(sUrl), sUrl + " is valid");
});
QUnit.test("Immutable entries test", function (assert) {
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
    }
    catch (e) {
        assert.ok(e);
    }
    try {
        aEntries[0].host = "myhost";
        assert.ok(false, "field is immutable");
    }
    catch (e) {
        assert.ok(e);
    }
    try {
        aEntries[0].port = 1338;
        assert.ok(false, "field is immutable");
    }
    catch (e) {
        assert.ok(e);
    }
    try {
        aEntries[0].path = "mypath";
        assert.ok(false, "field is immutable");
    }
    catch (e) {
        assert.ok(e);
    }
    aEntries = URLListValidator.entries();
    assert.equal(aEntries.length, 1, "1 entry is present unmodified");
    assert.equal(aEntries[0].protocol, "HTTPS", "protocol match");
    assert.equal(aEntries[0].host, "EXAMPLE.COM", "host match");
    assert.equal(aEntries[0].port, 1337, "port match");
    assert.equal(aEntries[0].path, "path", "path match");
});
QUnit.test("edge case parameters as url", function (assert) {
    assert.ok(URLListValidator.validate(1231), "number is a valid URL");
    assert.ok(URLListValidator.validate(null), "null is a valid URL");
    assert.ok(URLListValidator.validate(undefined), "undefined is a valid URL");
    assert.ok(URLListValidator.validate(""), "empty string is a valid URL");
    assert.ok(URLListValidator.validate(false), "false is a valid URL");
    assert.ok(URLListValidator.validate(), "no param is a valid URL");
    assert.ok(URLListValidator.validate(":::"), "three colons is a valid URL");
    assert.ok(URLListValidator.validate(/asd/), "regex is a valid URL");
});
QUnit.test("object as url", function (assert) {
    assert.notOk(URLListValidator.validate({}), "object is not a valid URL");
});
QUnit.test("unknown protocol", function (assert) {
    var sUrl = "httpg://www.example.com";
    assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");
});
QUnit.test("ipv6 address", function (assert) {
    var sUrl = "1:2:3:4:5:6:7:8";
    assert.notOk(URLListValidator.validate(sUrl), sUrl + " is not valid");
    sUrl = "2001:db8:1234:0000:0000:0000:0000:0000";
    assert.notOk(URLListValidator.validate(sUrl), sUrl + " is not valid");
    sUrl = "http://2001:db8:1234:0000:0000:0000:0000:0000";
    assert.ok(URLListValidator.validate(sUrl), sUrl + " is valid");
});
QUnit.test("ipv4 address", function (assert) {
    var sUrl = "192.168.0.1";
    assert.ok(URLListValidator.validate(undefined), sUrl + " is valid");
    sUrl = "http://192.168.1.1";
    assert.ok(URLListValidator.validate(sUrl), sUrl + " is valid");
});
QUnit.test("mailto links", function (assert) {
    var sUrl = "mailto:a@b.de,x@y.de";
    assert.notOk(URLListValidator.validate(sUrl), sUrl + " is not valid");
    sUrl = "mailto://a@b.de";
    assert.notOk(URLListValidator.validate(sUrl), sUrl + " is not valid");
    sUrl = "MAILTO:max@mustermann.de?subject=test";
    assert.notOk(URLListValidator.validate(sUrl), sUrl + " is not valid");
});
QUnit.test("invalid characters in path", function (assert) {
    var sUrl = "http://www.example.com/test/test/te^%&st.html";
    assert.notOk(URLListValidator.validate(sUrl), sUrl + " is not valid");
});
QUnit.test("protocol match with allowlist", function (assert) {
    var sUrl = "httpg://www.example.com";
    assert.ok(URLListValidator.validate(sUrl), sUrl + " valid");
    URLListValidator.add("httpm");
    sUrl = "httpg://www.example.com";
    assert.notOk(URLListValidator.validate(sUrl), sUrl + " is not valid");
    var sUrl2 = "httpm://www.example.com";
    assert.ok(URLListValidator.validate(sUrl2), sUrl2 + " valid");
});
QUnit.test("check the allowlist", function (assert) {
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
QUnit.test("check allowlist clearing entries", function (assert) {
    assert.equal(0, URLListValidator.entries().length, "empty");
    URLListValidator.add("httpm");
    assert.equal(1, URLListValidator.entries().length, "1 entry");
    URLListValidator.clear();
    assert.equal(0, URLListValidator.entries().length, "empty after clearing");
});
QUnit.module("sap/base/security/URLListValidator.entries", {
    afterEach: URLListValidator.clear
});
QUnit.test("check allowlist entries copy", function (assert) {
    assert.equal(0, URLListValidator.entries().length, "empty");
    var aEntries = URLListValidator.entries();
    aEntries.push({});
    assert.equal(0, URLListValidator.entries().length, "empty");
    assert.equal(1, aEntries.length, "empty");
});