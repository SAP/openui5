import camelize from "sap/base/strings/camelize";
QUnit.module("Camelize");
QUnit.test("camelize", function (assert) {
    assert.expect(2);
    var sCamelCase = camelize("this-is-a-camel-case-string");
    assert.equal(sCamelCase, "thisIsACamelCaseString", "Camelize function returns the right value");
    sCamelCase = camelize("this-is-an-1amel-case-\u00FCtring");
    assert.equal(sCamelCase, "thisIsAn1amelCase\u00DCtring", "Camelize function returns the right value for numeric and umlauts chars");
});