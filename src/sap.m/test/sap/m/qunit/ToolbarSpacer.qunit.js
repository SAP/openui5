/*global QUnit */
sap.ui.define([
	"sap/m/ToolbarSpacer",
	"sap/m/ToolbarLayoutData",
	"sap/ui/core/LayoutData",
	"sap/ui/test/utils/nextUIUpdate"
], function(ToolbarSpacer, ToolbarLayoutData, LayoutData, nextUIUpdate) {
	"use strict";

	QUnit.module("Test behavior in overflow toolbar");

	QUnit.test("Toolbar spacer ignore sap.m.ToolbarLayoutData", async function(assert) {
		var oToolbarSpacer = new ToolbarSpacer(),
			oToolbarLayoutData = new ToolbarLayoutData(),
			oLayoutData = new LayoutData();

		// Arrange
		oToolbarSpacer.setLayoutData(oToolbarLayoutData);
		await nextUIUpdate();

		// Assert
		assert.equal(oToolbarSpacer.getLayoutData(), null,"sap.m.ToolbarLayoutData was ignorned");

		// Arrange
		oToolbarSpacer.setLayoutData(oLayoutData);
		await nextUIUpdate();

		// Assert
		assert.notEqual(oToolbarSpacer.getLayoutData(), null,"LayoutData aggregation was changed");

		oToolbarSpacer.destroy();
		oToolbarLayoutData.destroy();
		oLayoutData.destroy();
	});
});
