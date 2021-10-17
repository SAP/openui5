import toHex from "sap/base/strings/toHex";
QUnit.module("Transform to hex");
QUnit.test("transform to hex", function (assert) {
    assert.equal(toHex("\u00A7$%&/(SDFGH2134"), "\u00A7$%&/(SDFGH2134", "not escaped characters");
    assert.equal(toHex(34, 2), "22", "number without padding");
    assert.equal(toHex(16, 2), "10", "number without padding");
    assert.equal(toHex(1, 2), "01", "padded zeros");
    assert.equal(toHex(10, 2), "0a", "padded zeros");
});