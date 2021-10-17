import Core from "sap/ui/core/Core";
window["initModuleLoaded"] = new Promise(function (res, rej) {
    window["initModuleResolve"] = res;
});
Core.boot();
QUnit.test("Check Main Module Functionality", function (assert) {
    var done = assert.async();
    window["initModuleLoaded"].then(function () {
        assert.ok(true, "Main module has been loaded and executed.");
        done();
    });
});