QUnit.test("no injected globals", function (assert) {
    assert.notOk("assert" in window, "there should be no global 'assert' property");
    assert.notOk("raises" in window, "there should be no global 'raises' property");
    assert.notOk("equals" in window, "there should be no global 'equals' property");
});