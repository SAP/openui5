QUnit.module("module a", function () {
    QUnit.test("a basic test example", function (assert) {
        assert.ok(true);
    });
});
QUnit.module("module b", function () {
    QUnit.test("a basic test example 2", function (assert) {
        assert.ok(true);
    });
    QUnit.module("nested module b.1", function () {
        QUnit.test("a basic test example 3", function (assert) {
            assert.ok(true);
        });
    });
});