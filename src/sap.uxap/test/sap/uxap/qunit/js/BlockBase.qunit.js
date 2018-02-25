/*global QUnit*/

sap.ui.require(["jquery.sap.global", "sap/ui/core/ComponentContainer", "sap/m/Shell"], function (jQuery, ComponentContainer, Shell) {
	"use strict";

	jQuery.sap.registerModulePath("blockbasetest", "./blockbasetest");
	jQuery.sap.registerModulePath("sap.uxap.testblocks", "./blocks");
	jQuery.sap.registerModulePath("view", "./view");

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

	QUnit.test("ObjectPage blocks height", function (assert) {

		var oObjectPageInfoView = sap.ui.xmlview("UxAP-InfoBlocks", {viewName: "view.UxAP-InfoBlocks" }),
			oOPL = oObjectPageInfoView.byId("ObjectPageLayout"),
			oTargetSubSection = oOPL.getSections()[0].getSubSections()[4],
			iTargetScrollTop,
			iActualScrollTop,
			done = assert.async();

		assert.expect(1);

		oOPL.attachEventOnce("onAfterRenderingDOMReady", function () {

			// Act: scroll to target section, that will result in:
			// (1) will change the scrollTop [to the one that brings the target section to the top of sections container]
			// (2) will trigger lazy loading of the target section
			oOPL.scrollToSection(oTargetSubSection.getId());

			// Act: as the above call is asynchronous (but returns no promise),
			// make the test synchronous by *explicitly* calling the actions for (1) and (2) above
			// (1) explicitly change the scrollTop to target position [to the one that brings the target section to the top of sections container]
			iTargetScrollTop = oOPL._computeScrollPosition(oTargetSubSection);
			oOPL._$opWrapper.scrollTop(iTargetScrollTop);
			// (2) explicitly connect the section models (lazy loading)
			oOPL._connectModelsForSections([oTargetSubSection]);
			sap.ui.getCore().applyChanges();

			// Check if the scrollTop [of the lazy-loaded section] matches the expected one
			iActualScrollTop = Math.ceil(oOPL._$opWrapper.scrollTop());
			assert.strictEqual(iTargetScrollTop, iActualScrollTop, "scrollTop of lazy-loaded section not did not change upon lazy-loading");
			done();
			oObjectPageInfoView.destroy();
		});
		oObjectPageInfoView.placeAt('content');
		sap.ui.getCore().applyChanges();
	});

});
