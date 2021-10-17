import encodeJS from "sap/base/security/encodeJS";
QUnit.module("Encode JS");
QUnit.test("encode JS", function (assert) {
    assert.equal(encodeJS("\""), "\\x22", "Quote");
    assert.equal(encodeJS("'"), "\\x27", "Apostrophe");
    assert.equal(encodeJS("\0\u0001\u0002"), "\\x00\\x01\\x02", "0x00 0x01 0x02");
    assert.equal(encodeJS(">&<\"'\\/"), "\\x3e\\x26\\x3c\\x22\\x27\\x5c\\x2f", ">&<\"'\\/");
});
QUnit.test("should not encode", function (assert) {
    assert.equal(encodeJS("nothingtoencode123,._"), "nothingtoencode123,._", "nothingtoencode123,._");
});
QUnit.test("characters above (>) 255 (0xff) should not be encoded, except for 0x2028 and 0x2029", function (assert) {
    assert.equal(encodeJS(String.fromCharCode(256)), "\u0100", "\u0100 (0x100)");
    assert.equal(encodeJS(String.fromCharCode(257)), "\u0101", "\u0101 (0x101)");
    assert.equal(encodeJS(String.fromCharCode(8232)), "\\u2028", "(0x2028)");
    assert.equal(encodeJS(String.fromCharCode(8233)), "\\u2029", "(0x2029)");
});