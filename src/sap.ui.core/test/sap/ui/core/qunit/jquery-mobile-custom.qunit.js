/* global QUnit */
sap.ui.define(["sap/ui/Device"], function (Device) {
	"use strict";

	QUnit.module("Test Touch Support");

	QUnit.test("Should detect the touch capabilities correctly on touch devices", function (assert) {
		// Preparation
		var done = assert.async();

		// load and boot the core
		sap.ui.require(["sap/ui/core/Core", "sap/ui/thirdparty/jquery"], function (Core, jQuery) {
			Core.ready().then(function () {
				assert.ok(true, "Core should initialize after loading and booting it");

				// its a touch device (tablet, hybrid)
				assert.ok(Device.support.touch, "Device is recognized correctly as touch screen");

				// jQuery.mobile.support.touch should be overridden by Device.support.touch
				assert.ok(jQuery.mobile.support.touch, "The 'ontouchend' event is available on the browser");

				done();
			});
			/**
			 * @deprecated
			 */
			Core.boot();
		}, function (oErr) {
			assert.strictEqual(oErr, {}, "Requiring the Core must not fail");
		});

	});
});