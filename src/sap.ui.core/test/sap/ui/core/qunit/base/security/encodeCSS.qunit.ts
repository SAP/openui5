import encodeCSS from "sap/base/security/encodeCSS";
QUnit.module("Encode CSS");
QUnit.test("encode CSS", function (assert) {
    assert.equal(encodeCSS("+"), "\\2b", "Plus");
    assert.equal(encodeCSS("~7"), "\\7e 7", "~7");
    assert.equal(encodeCSS("+apple"), "\\2b apple", "+apple");
    assert.equal(encodeCSS("/BUG"), "\\2f BUG", "/BUG");
    assert.equal(encodeCSS("~test"), "\\7etest", "~test");
    assert.equal(encodeCSS("\0\u0001\u0002"), "\\0\\1\\2", "0x00 0x01 0x02");
    assert.equal(encodeCSS(">&<\"'\\/"), "\\3e\\26\\3c\\22\\27\\5c\\2f", ">&<\"'\\/");
});
QUnit.test("should not encode", function (assert) {
    assert.equal(encodeCSS("nothingtoencode123"), "nothingtoencode123", "nothingtoencode123");
});
QUnit.test("characters above (>) 255 (0xff) should not be encoded, except for 0x2028 and 0x2029", function (assert) {
    assert.equal(encodeCSS(String.fromCharCode(256)), "\u0100", "\u0100 (0x100)");
    assert.equal(encodeCSS(String.fromCharCode(257)), "\u0101", "\u0101 (0x101)");
    assert.equal(encodeCSS(String.fromCharCode(8232)), "\\2028", "(0x2028)");
    assert.equal(encodeCSS(String.fromCharCode(8233)), "\\2029", "(0x2029)");
});