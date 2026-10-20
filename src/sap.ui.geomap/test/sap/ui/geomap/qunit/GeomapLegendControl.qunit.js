/*global QUnit */
sap.ui.define([
	"sap/ui/geomap/GeomapLegendControl"
], function (
	GeomapLegendControl
) {
	"use strict";

	QUnit.module("Basic Control Checks");

	QUnit.test("Test default properties", function (assert) {
		const oControl = new GeomapLegendControl();
		assert.ok(oControl, "GeomapLegendControl instance created");
		assert.equal(oControl.getHeaderTitle(), "Legend", "Default headerTitle is 'Legend'");
		assert.equal(oControl.getExpanded(), false, "Default expanded is false");
		assert.equal(oControl.getHidden(), false, "Default hidden is false");
		assert.equal(oControl.getDraggable(), false, "Default draggable is false");
		assert.deepEqual(oControl.getItems(), [], "Default items is empty array");
		oControl.destroy();
	});
});
