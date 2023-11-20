/*global QUnit */
sap.ui.define([
	"sap/m/ToolbarSpacer",
	"sap/m/ToolbarLayoutData",
	"sap/ui/core/LayoutData",
	"sap/ui/core/Core"
], function(ToolbarSpacer, ToolbarLayoutData, LayoutData, Core) {
	"use strict";

	QUnit.module("Test behavior in overflow toolbar");

	QUnit.test("Toolbar spacer ignore sap.m.ToolbarLayoutData", function (assert) {
		var oToolbarSpacer = new ToolbarSpacer(),
			oToolbarLayoutData = new ToolbarLayoutData(),
			oLayoutData = new LayoutData();

		// Arrange
		oToolbarSpacer.setLayoutData(oToolbarLayoutData);
		Core.applyChanges();

		// Assert
		assert.equal(oToolbarSpacer.getLayoutData(), null,"sap.m.ToolbarLayoutData was ignorned");

		// Arrange
		oToolbarSpacer.setLayoutData(oLayoutData);
		Core.applyChanges();

		// Assert
		assert.notEqual(oToolbarSpacer.getLayoutData(), null,"LayoutData aggregation was changed");

		oToolbarSpacer.destroy();
		oToolbarLayoutData.destroy();
		oLayoutData.destroy();
	});
});
