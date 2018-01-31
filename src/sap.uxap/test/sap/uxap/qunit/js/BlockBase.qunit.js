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

	QUnit.test("blocks are target of lazy loading feature", function (assert) {

		var fnGetBlock = function() {
			return new sap.uxap.BlockBase();
		},
		aBlocksOutsideSubSection = [fnGetBlock(), fnGetBlock(), fnGetBlock()],
		aBlocksInsideSubSection = [fnGetBlock(), fnGetBlock(), fnGetBlock()],
		oObjectPageLayout = new sap.uxap.ObjectPageLayout({
			enableLazyLoading: true,
			headerContent: aBlocksOutsideSubSection,
			sections:[
					new sap.uxap.ObjectPageSection({

						subSections: [
							new sap.uxap.ObjectPageSubSection({
								blocks: aBlocksInsideSubSection
							})
						]
				})
			]
		}),
		fnAssertShouldBeLoadedLazily = function(assert, oBlock, bExpected) {
			var bShouldLazyLoad = oBlock._shouldLazyLoad();
			assert.strictEqual(bShouldLazyLoad, bExpected, " The block " + oBlock.getId() + " is target of lazy loading " + bShouldLazyLoad);
		};

		// Assert: the blocks ObejctPageSubSection are target of lazy laoding
		aBlocksInsideSubSection.forEach(function(oBlock) {
			fnAssertShouldBeLoadedLazily(assert, oBlock, true);
		});

		// Assert: the blocks outside the ObejctPageSubSection are not target of lazy laoding
		aBlocksOutsideSubSection.forEach(function(oBlock) {
			fnAssertShouldBeLoadedLazily(assert, oBlock, false);
		});


		oObjectPageLayout.destroy();
	});

});
