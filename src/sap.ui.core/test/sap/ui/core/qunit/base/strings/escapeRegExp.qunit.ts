import escapeRegExp from "sap/base/strings/escapeRegExp";
QUnit.module("EscapeRegExp");
QUnit.test("escapeRegExp", function (assert) {
    assert.equal(escapeRegExp("ab.c"), "ab\\.c", "Dot character gets escaped");
});