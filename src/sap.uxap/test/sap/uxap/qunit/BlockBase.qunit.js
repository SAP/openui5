/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/core/ComponentContainer",
	"sap/m/Shell",
	"sap/ui/core/Core",
	"sap/uxap/BlockBase",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/core/mvc/XMLView"],
function (ComponentContainer, Shell, Core, BlockBase, ObjectPageLayout, ObjectPageSection, ObjectPageSubSection, XMLView) {
	"use strict";

	QUnit.module("BlockBase");

	QUnit.test("Owner component propagated to views", function (assert) {
		var oComponentContainer,
			oComponent,
			oMainView,
			oMainController,
			oObjectPage,
			oBlock,
			oBlockView,
			oBlockViewController,
			done = assert.async();

		assert.expect(5);

		new Shell("Shell", {
			app: new ComponentContainer("myComponentContainer", {
				name: 'blockbasetest',
				height: "100%"
			})
		}).placeAt('qunit-fixture');

		Core.applyChanges();

		setTimeout(function () {
			oComponentContainer = Core.byId("myComponentContainer");
			oComponent = oComponentContainer.getComponentInstance();

			assert.ok(oComponent && oComponent.getMetadata().getName() === "blockbasetest.Component", "The component was successfully created");

			oMainView = oComponent.getRootControl();
			oMainController = oMainView.getController();

			assert.ok(oMainView && oMainController, "The main view and controller were successfully created");

			oObjectPage = oMainView.byId("ObjectPageLayout");
			oBlock = oObjectPage.getSections()[0].getSubSections()[0].getBlocks()[0];

			assert.ok(oBlock, "The block was successfully created");
			oBlockView = oBlock.getAggregation("_views")[0];
			oBlockViewController = oBlockView.getController();

			assert.ok(oBlockView && oBlockViewController, "The block view and its controller were successfully created");

			assert.strictEqual(oBlockViewController.getOwnerComponent(), oMainController.getOwnerComponent(), "The block view is owned by the component");

			done();
		}, 1000);
	});

	QUnit.test("blocks are target of lazy loading feature", function (assert) {

		var fnGetBlock = function() {
			return new BlockBase();
		},
		aBlocksOutsideSubSection = [fnGetBlock(), fnGetBlock(), fnGetBlock()],
		aBlocksInsideSubSection = [fnGetBlock(), fnGetBlock(), fnGetBlock()],
		oObjectPageLayout = new ObjectPageLayout({
			enableLazyLoading: true,
			headerContent: aBlocksOutsideSubSection,
			sections:[
					new ObjectPageSection({

						subSections: [
							new ObjectPageSubSection({
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

	QUnit.module("BlockBase Height", {

		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-InfoBlocks",
				viewName: "view.UxAP-InfoBlocks"
			}).then(function (oView) {
				this.oObjectPageInfoView = oView;
				this.oObjectPageInfoView.placeAt('qunit-fixture');
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oObjectPageInfoView.destroy();
		}
	});

	QUnit.test("ObjectPage blocks height", function (assert) {

		var oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout"),
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
			Core.applyChanges();

			// Check if the scrollTop [of the lazy-loaded section] matches the expected one
			iActualScrollTop = Math.ceil(oOPL._$opWrapper.scrollTop());
			assert.ok(iTargetScrollTop === iActualScrollTop || iTargetScrollTop === iActualScrollTop + 1, "scrollTop of lazy-loaded section not did not change upon lazy-loading");
			done();
		});
	});

	QUnit.module("View selection", {

		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-InfoBlocks",
				viewName: "view.UxAP-InfoBlocks"
			}).then(function (oView) {
				this.oObjectPageInfoView = oView;
				this.oObjectPageInfoView.placeAt('qunit-fixture');
				Core.applyChanges();
				done();
			}.bind(this));
			this.sandbox = sinon.sandbox.create();
		},
		afterEach: function () {
			this.oObjectPageInfoView.destroy();
			this.sandbox.restore();
		}
	});

	QUnit.test("initView event is fired", function (assert) {

		var oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout"),
			oTargetSubSection = oOPL.getSections()[0].getSubSections()[0],
			oBlock = oTargetSubSection.getBlocks()[0],
			done = assert.async();

		assert.expect(2);

		oOPL.attachEventOnce("onAfterRenderingDOMReady", function () {
			oBlock._selectView("Expanded");
			oBlock.attachEvent("viewInit", function(oEvent) {
				var oView = oEvent.getParameter("view");
				assert.ok(oView, "event is fired");
				assert.strictEqual(oView.getViewName(), "sap.uxap.testblocks.objectpageblock.InfoButtonExpanded");
				done();
			});
		});

	});

	QUnit.test("view is created only once", function (assert) {

		var oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout"),
			oTargetSubSection = oOPL.getSections()[0].getSubSections()[0],
			oBlock = oTargetSubSection.getBlocks()[0],
			oExpandViewMetadata = oBlock.getMetadata().getView("Expanded"),
			createSpy = this.sandbox.spy(sap.ui.core.mvc.View, "create"),
			done = assert.async();

		oExpandViewMetadata.id = oBlock.getId() + "-Expanded"; // setup

		assert.expect(1);

		oOPL.attachEventOnce("onAfterRenderingDOMReady", function () {

			// Setup
			createSpy.reset();

			// Act: request create the same view more than once
			oBlock.createView(oExpandViewMetadata);
			oBlock.createView(oExpandViewMetadata); // request the same view twice

			// Check
			oBlock.attachEventOnce("viewInit", function () {
				assert.ok(createSpy.calledOnce, "creation is called once only");
				done();
			});
		});
	});

	QUnit.test("notification for view selection only once", function (assert) {

		var oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout"),
			oTargetSubSection = oOPL.getSections()[0].getSubSections()[0],
			oBlock = oTargetSubSection.getBlocks()[0],
			notifySpy = this.sandbox.spy(oBlock, "_notifyForLoadingInMode"),
			done = assert.async();

		assert.expect(1);

		oOPL.attachEventOnce("onAfterRenderingDOMReady", function () {

			// Setup
			notifySpy.reset();

			// Act: request select the same view more than once
			oBlock._selectView("Expanded");
			oBlock._selectView("Expanded"); // request the same view twice

			// Check
			oBlock.attachEventOnce("viewInit", function () {
				setTimeout(function() {
					assert.ok(notifySpy.calledOnce, "notification is called once only");
					done();
				}, 0);
			});
		});
	});

});
