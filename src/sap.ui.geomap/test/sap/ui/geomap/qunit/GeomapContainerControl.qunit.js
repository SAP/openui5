/*global QUnit */
sap.ui.define([
	"sap/ui/geomap/GeomapContainerControl"
], function (
	GeomapContainerControl
) {
	"use strict";

	QUnit.module("Basic Control Checks");

	QUnit.test("Test instantiation", function (assert) {
		const oControl = new GeomapContainerControl();
		assert.ok(oControl, "GeomapContainerControl instance created");
		oControl.destroy();
	});
});
