import uid from "sap/base/util/uid";
QUnit.module("sap.base.util.uid");
QUnit.test("basic test", function (assert) {
    var myid = uid();
    assert.ok(myid);
});