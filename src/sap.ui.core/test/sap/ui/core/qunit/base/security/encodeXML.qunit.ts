import encodeXML from "sap/base/security/encodeXML";
QUnit.module("Encode XML");
QUnit.test("encode XML", function (assert) {
    assert.equal(encodeXML("+"), "&#x2b;", "Plus");
    assert.equal(encodeXML("<>&\""), "&lt;&gt;&amp;&quot;", "<>&\"");
    assert.equal(encodeXML("\0\u0001\u0002"), "&#xfffd;&#xfffd;&#xfffd;", "0x00 0x01 0x02");
    assert.equal(encodeXML(">&<\"'\\/"), "&gt;&amp;&lt;&quot;&#x27;&#x5c;&#x2f;", ">&<\"'\\/");
    assert.equal(encodeXML("!\u00A7$%;:/()=?|^*#"), "&#x21;&#xa7;&#x24;&#x25;&#x3b;&#x3a;&#x2f;&#x28;&#x29;&#x3d;&#x3f;&#x7c;&#x5e;&#x2a;&#x23;", "!\u00A7$%;:/()=?|^*#");
});
QUnit.test("should not encode", function (assert) {
    assert.equal(encodeXML("nothingtoencode123,.-_"), "nothingtoencode123,.-_", "nothingtoencode123,.-_");
});
QUnit.test("should replaced with 0xfffd", function (assert) {
    assert.equal(encodeXML(String.fromCharCode(8)), "&#xfffd;", "Backspace");
    assert.equal(encodeXML(String.fromCharCode(9)), "&#x9;", "Tab");
    assert.equal(encodeXML(String.fromCharCode(10)), "&#xa;", "Line feed");
    assert.equal(encodeXML(String.fromCharCode(11)), "&#xfffd;", "Vertical tab");
    assert.equal(encodeXML(String.fromCharCode(12)), "&#xfffd;", "Form feed");
    assert.equal(encodeXML(String.fromCharCode(13)), "&#xd;", "Carriage return");
    assert.equal(encodeXML(String.fromCharCode(14)), "&#xfffd;", "Shift out");
    assert.equal(encodeXML(String.fromCharCode(15)), "&#xfffd;", "Shift in");
    assert.equal(encodeXML(String.fromCharCode(16)), "&#xfffd;", "Data link escape");
});
QUnit.test("characters above (>) 255 (0xff) should not be encoded, except for 0x2028 and 0x2029", function (assert) {
    assert.equal(encodeXML(String.fromCharCode(256)), "\u0100", "\u0100 (0x100)");
    assert.equal(encodeXML(String.fromCharCode(257)), "\u0101", "\u0101 (0x101)");
    assert.equal(encodeXML(String.fromCharCode(8232)), "&#x2028;", "(0x2028)");
    assert.equal(encodeXML(String.fromCharCode(8233)), "&#x2029;", "(0x2029)");
});