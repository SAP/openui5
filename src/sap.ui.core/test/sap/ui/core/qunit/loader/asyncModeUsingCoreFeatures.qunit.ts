QUnit.module("Mixed Async/Sync Calls");
QUnit.test("Library Scenario", function (assert) {
    return sap.ui.getCore().loadLibraries([
        "fixture/async-sync-conflict/library-using-AMD",
        "fixture/async-sync-conflict/library-using-require-declare"
    ]).then(function () {
        assert.ok(true, "loading the libs succeeded");
    }, function (e) {
        assert.strictEqual(e, null, "loading the libs failed");
    });
});