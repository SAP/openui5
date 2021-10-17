import capitalize from "sap/base/strings/capitalize";
QUnit.module("Capitalize");
QUnit.test("capitalize", function (assert) {
    assert.strictEqual(capitalize("gggT"), "GggT");
    assert.strictEqual(capitalize("gs4T"), "Gs4T");
    assert.strictEqual(capitalize("GggT"), "GggT");
    assert.strictEqual(capitalize(""), "");
    assert.strictEqual(capitalize("g"), "G");
    assert.strictEqual(capitalize("G"), "G");
});