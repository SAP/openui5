/* global QUnit */
sap.ui.define(["sap/ui/Device", "sap/base/util/deepClone"], function (Device, deepClone) {
    "use strict";

    QUnit.module("Test Touch Support for MS Edge");

    QUnit.test("Should detect the touch capibilities correctly on touch devices", function (assert) {
        // Preparation
        var done = assert.async();

        // MS Edge fires no 'touchend' event
        delete document.ontouchend;

        // Stub browser to MS Edge, deepClone is necessary because Core.boot needs all browser values registered correctly
        var oBrowser = deepClone(Device.browser);
        oBrowser.edge = true;
        this.stub(Device, "browser").value(oBrowser);

        // Stub touch support
        this.stub(Device, "support").value({ touch: true });

        // load and boot the core
        sap.ui.require(["sap/ui/core/Core"], function (core) {
            sap.ui.getCore().attachInit(function () {
                assert.ok(true, "Core should initalize after loading and booting it");

                // its a touch device (tablet, hybrid)
                assert.ok(Device.support.touch, "Device is recognized correctly as touch screen");

                // jQuery.mobile.support.touch should not be overriden by Device.support.touch
                assert.notOk(jQuery.mobile.support.touch, "The 'ontouchend' event is not available on MS Edge");

                done();
            });
            core.boot();
        }, function (oErr) {
            assert.strictEqual(oErr, {}, "Requiring the Core must not fail");
        });
    });
});