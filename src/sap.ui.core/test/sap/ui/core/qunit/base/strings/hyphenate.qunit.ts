import hyphenate from "sap/base/strings/hyphenate";
QUnit.module("hyphenate");
QUnit.test("hyphenate", function (assert) {
    assert.expect(2);
    var sHyphen = hyphenate("thisIsAnCamelCaseString");
    assert.equal(sHyphen, "this-is-an-camel-case-string", "hyphen function returns the right value");
    sHyphen = hyphenate("thisIsAn1amelCase\u00DCtring");
    assert.equal(sHyphen, "this-is-an1amel-case\u00DCtring", "hyphen function returns the right value for numeric and umlauts chars");
});