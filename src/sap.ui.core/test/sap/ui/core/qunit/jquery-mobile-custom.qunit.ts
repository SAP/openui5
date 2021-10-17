import Device from "sap/ui/Device";
QUnit.module("Test Touch Support");
QUnit.test("Should detect the touch capibilities correctly on touch devices", function (assert) {
    var done = assert.async();
    this.stub(Device, "support").value({ touch: true });
    sap.ui.require(["sap/ui/core/Core"], function (core) {
        sap.ui.getCore().attachInit(function () {
            assert.ok(true, "Core should initialize after loading and booting it");
            assert.ok(Device.support.touch, "Device is recognized correctly as touch screen");
            assert.ok(jQuery.mobile.support.touch, "The 'ontouchend' event is available on the browser");
            done();
        });
        core.boot();
    }, function (oErr) {
        assert.strictEqual(oErr, {}, "Requiring the Core must not fail");
    });
});