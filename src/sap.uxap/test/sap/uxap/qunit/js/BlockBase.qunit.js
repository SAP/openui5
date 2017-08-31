/*global QUnit*/

sap.ui.require(["jquery.sap.global", "sap/ui/core/ComponentContainer", "sap/m/Shell"], function (jQuery, ComponentContainer, Shell) {
	"use strict";

	jQuery.sap.registerModulePath("blockbasetest", "./blockbasetest");
	jQuery.sap.registerModulePath("sap.uxap.testblocks", "./blocks");

	QUnit.module("BlockBase");

	QUnit.test("Owner component propagated to views", function (assert) {

		new Shell("Shell", {
			app: new ComponentContainer("myComponentContainer", {
				name: 'blockbasetest',
				height: "100%"
			})
		}).placeAt('qunit-fixture');

		sap.ui.getCore().applyChanges();

		var oComponentContainer = sap.ui.getCore().byId("myComponentContainer");
		var oComponent = oComponentContainer.getComponentInstance();

		assert.ok(oComponent && oComponent.getMetadata().getName() === "blockbasetest.Component", "The component was successfully created");

		var oMainView = oComponent.getRootControl();
		var oMainController = oMainView.getController();

		assert.ok(oMainView && oMainController, "The main view and controller were successfully created");

		var oObjectPage = oMainView.byId("ObjectPageLayout");
		var oBlock = oObjectPage.getSections()[0].getSubSections()[0].getBlocks()[0];

		assert.ok(oBlock, "The block was successfully created");

		var oBlockView = oBlock.getAggregation("_views")[0];
		var oBlockViewController = oBlockView.getController();

		assert.ok(oBlockView && oBlockViewController, "The block view and its controller were successfully created");

		assert.strictEqual(oBlockViewController.getOwnerComponent(), oMainController.getOwnerComponent(), "The block view is owned by the component");

	});

});
