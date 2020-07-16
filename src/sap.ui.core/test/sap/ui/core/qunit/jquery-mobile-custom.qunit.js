/* global QUnit */
sap.ui.define(["sap/ui/Device"], function (Device) {
    "use strict";

    // this test module should only be executed for browsers other than MS Edge and MS Internet Explorer
    if (!(Device.browser.msie || Device.browser.edge)) {
        QUnit.module("Test Touch Support for modern Browsers");

        QUnit.test("Should detect the touch capibilities correctly on touch devices", function (assert) {
            // Preparation
            var done = assert.async();

            // Stub touch support
            this.stub(Device, "support").value({ touch: true });

            // load and boot the core
            sap.ui.require(["sap/ui/core/Core"], function (core) {
                sap.ui.getCore().attachInit(function () {
                    assert.ok(true, "Core should initalize after loading and booting it");

                    // its a touch device (tablet, hybrid)
                    assert.ok(Device.support.touch, "Device is recognized correctly as touch screen");

                    // jQuery.mobile.support.touch should be overriden by Device.support.touch
                    assert.ok(jQuery.mobile.support.touch, "The 'ontouchend' event is available on the browser");

                    done();
                });
                core.boot();
            }, function (oErr) {
                assert.strictEqual(oErr, {}, "Requiring the Core must not fail");
            });

        });
    }
});