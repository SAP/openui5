import ListItem from "sap/ui/core/ListItem";
QUnit.test("Changed Settings", function (assert) {
    assert.expect(1);
    assert.equal(sap.ui.getCore().getConfiguration().getNoDuplicateIds(), false, "default setting should be: allow no duplicate IDs");
});
QUnit.test("First creation", function (assert) {
    assert.expect(0);
    new ListItem("L1");
});
QUnit.test("Second, duplicate creation (with changed settings)", function (assert) {
    assert.expect(0);
    new ListItem("L1");
    new ListItem("L1");
    new ListItem("L1");
});