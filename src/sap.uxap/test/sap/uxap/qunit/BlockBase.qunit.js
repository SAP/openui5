/*global QUnit */

sap.ui.define([
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Control",
	"sap/m/Shell",
	"sap/ui/core/Element",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/uxap/BlockBase",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/uxap/library"
],
function(ComponentContainer, Control, Shell, Element, nextUIUpdate, BlockBase, ObjectPageLayout, ObjectPageSection, ObjectPageSubSection, View, XMLView, Controller, JSONModel, library) {
	"use strict";

	// shortcut for sap.uxap.BlockBaseFormAdjustment
	var BlockBaseFormAdjustment = library.BlockBaseFormAdjustment;

	QUnit.module("BlockBase");

	QUnit.test("Owner component propagated to views", async function(assert) {
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

		async function fnOnComponentCreated() {
			await nextUIUpdate();

			oComponentContainer = Element.getElementById("myComponentContainer");
			oComponent = oComponentContainer.getComponentInstance();

			assert.ok(oComponent && oComponent.isA("blockbasetest.Component"), "The component was successfully created");

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
		}

		new Shell("Shell", {
			app: new ComponentContainer("myComponentContainer", {
				name: 'blockbasetest',
				manifest: true,
				height: "100%",
				componentCreated: function() {
					setTimeout(fnOnComponentCreated, 1000);
				}
			})
		}).placeAt('qunit-fixture');

		await nextUIUpdate();

	});

	QUnit.test("blocks are target of lazy loading feature", async function (assert) {

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

		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();

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

	QUnit.test("setVisible prevents redundant layout adjustment", function (assert) {

		 var oBlock = new BlockBase(),
			 bVisible = oBlock.getVisible(),
			 oMockObjectPage = {
				 _requestAdjustLayoutAndUxRules: function() {}
			 },
			 oSpy = this.spy(oMockObjectPage, "_requestAdjustLayoutAndUxRules");

		this.stub(oBlock, "_getObjectPageLayout").returns(oMockObjectPage);

		// Act: call the setter with the existing value
		oBlock.setVisible(bVisible);
		assert.equal(oSpy.callCount, 0, "no layout adjustment requested");

		oBlock.destroy();
	});

	QUnit.module("BlockBase Height", {

		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-InfoBlocks",
				viewName: "view.UxAP-InfoBlocks"
			}).then(async function(oView) {
				this.oObjectPageInfoView = oView;
				this.oObjectPageInfoView.placeAt('qunit-fixture');
				await nextUIUpdate();
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
			nextUIUpdate.runSync(); // TODO when using async rendering, the below expectations are no longer met?

			// Check if the scrollTop [of the lazy-loaded section] matches the expected one
			iActualScrollTop = Math.ceil(oOPL._$opWrapper.scrollTop());
			assert.ok(iTargetScrollTop === iActualScrollTop || iTargetScrollTop === iActualScrollTop + 1, "scrollTop of lazy-loaded section not did not change upon lazy-loading");
			done();
		});
	});

	QUnit.module("'visible' property data binding", {
		beforeEach: function() {
			this.fnCreatePageWithSingleBlock = function (oOptions) {

				var oJSONModelData = oOptions.JSONModelData,
					sPageProperties = objectToString(oOptions.pageProperties),
					sBlockProperties = objectToString(oOptions.blockProperties);

				return XMLView.create({
					definition: `<mvc:View
						xmlns:mvc="sap.ui.core.mvc"
						xmlns="sap.uxap"
						xmlns:opblock="sap.uxap.testblocks.objectpageblock"
						height="100%">
						<ObjectPageLayout ${sPageProperties}>
							<sections>
								<ObjectPageSection title="Section1">
									<ObjectPageSubSection title="Section1SubSection1">
										<opblock:InfoButton ${sBlockProperties} />
									</ObjectPageSubSection>
								</ObjectPageSection>
							</sections>
						</ObjectPageLayout>
					</mvc:View>`
				}).then(function(oView) {
					this.oView = oView;
					this.oView.setModel(new JSONModel(oJSONModelData), "viewModel");
					return oView;
				}.bind(this));
			};
		},
		afterEach: function() {
			this.oView.destroy();
		}
	});

	QUnit.test("resolves databinding when lazyLoading disabled", function (assert) {
		var done = assert.async();

		assert.expect(1);

		this.fnCreatePageWithSingleBlock({
			blockProperties: { id: "block1", visible:"{viewModel>/blockVisible}" },
			JSONModelData: { blockVisible: false },
			pageProperties: { enableLazyLoading: false }
		}).then(function(oView) {
			assert.strictEqual(oView.byId("block1").getVisible(), false, "Block visibility is false");
			done();
		});
	});

	QUnit.test("resolves databinding when lazyLoading enabled", function (assert) {
		var done = assert.async();

		assert.expect(2);

		this.fnCreatePageWithSingleBlock({
			blockProperties: { id: "block1", visible:"{viewModel>/blockVisible}" },
			JSONModelData: { blockVisible: false },
			pageProperties: { enableLazyLoading: true }
		}).then(function(oView) {

			// before connecting to models
			var oBlock = oView.byId("block1");
			assert.strictEqual(oBlock.getVisible(), true, "Block visibility still has the default value of true");

			// after connecting to models
			oBlock.connectToModels();
			assert.strictEqual(oBlock.getVisible(), false, "Block visibility is false as binding is now resolved");
			done();
		});
	});

	QUnit.module("View selection", {

		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-InfoBlocks",
				viewName: "view.UxAP-InfoBlocks"
			}).then(async function(oView) {
				this.oObjectPageInfoView = oView;
				this.oObjectPageInfoView.placeAt('qunit-fixture');
				await nextUIUpdate();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oObjectPageInfoView.destroy();
		}
	});

	QUnit.test("bindings are updated when we begin connecting to models with enabled lazyloading, if we are not already connected", function (assert) {

		// Arrange
		var oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout"),
			oTargetSubSection = oOPL.getSections()[0].getSubSections()[0],
			oBlock = oTargetSubSection.getBlocks()[0],
			fnUpdateBindingSpy = this.spy(oBlock, "updateBindings"),
			fnDone = assert.async();

		assert.expect(2);

		// Act: explicitly connect the section models (lazy loading)
		// _bConnect private boolean flag is mocked to "false" in order to target our test scenario
		oBlock._bConnected = false;
		oOPL._connectModelsForSections([oTargetSubSection]);

		// Assert
		setTimeout(function () {
			assert.ok(fnUpdateBindingSpy.calledOnce, "updateBindings is called once only");
			assert.ok(fnUpdateBindingSpy.calledWithExactly(true, null), "updateBindings is called with the correct arguments");
			fnDone();
		}, 0);
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
			createSpy = this.spy(View, "create"),
			done = assert.async();

		oExpandViewMetadata.id = oBlock.getId() + "-Expanded"; // setup

		assert.expect(1);

		oOPL.attachEventOnce("onAfterRenderingDOMReady", function () {

			// Wait for views of other blocks to be created --> as connectToModels is now called async
			setTimeout(function () {
				// Setup
				createSpy.resetHistory();

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
	});

	QUnit.test("notification for view selection only once", function (assert) {

		var oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout"),
			oTargetSubSection = oOPL.getSections()[0].getSubSections()[0],
			oBlock = oTargetSubSection.getBlocks()[0],
			notifySpy = this.spy(oBlock, "_notifyForLoadingInMode"),
			done = assert.async();

		assert.expect(1);

		oOPL.attachEventOnce("onAfterRenderingDOMReady", function () {

			// Setup
			notifySpy.resetHistory();

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

	QUnit.test("clean up after destroy view", function (assert) {

		var oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout"),
			oTargetSubSection = oOPL.getSections()[0].getSubSections()[0],
			oBlock = oTargetSubSection.getBlocks()[0],
			done = assert.async();

		assert.expect(2);

		oOPL.attachEventOnce("onAfterRenderingDOMReady", function () {

			// verify init state
			var sCollapsedViewId = oBlock.getSelectedView();
			assert.ok(oBlock._oPromisedViews[sCollapsedViewId], "the view promise is created");

			oBlock._selectView("Expanded");
			oBlock.attachEvent("viewInit", function(oEvent) {

				// Act
				Element.getElementById(sCollapsedViewId).destroy();

				// Check
				assert.strictEqual(oBlock._oPromisedViews[sCollapsedViewId], undefined, "the view promise is cleaned up");
				done();
			});
		});

	});

	QUnit.test("BlockBase has overflow-y hidden", function (assert) {
		var oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout"),
			oSubSection = oOPL.getSections()[0].getSubSections()[0],
			oBlock = oSubSection.getBlocks()[0],
			done = assert.async();

		assert.expect(1);

		oSubSection.addStyleClass("sapUxAPObjectPageSubSectionFitContainer");

		oOPL.attachEventOnce("onAfterRenderingDOMReady", function () {
			// Check
			assert.strictEqual(oBlock.$().css("overflow-y"), "hidden", "Blockbase in .sapUxAPObjectPageSubSectionFitContainer SubSection has overflow-y hidden");
			done();
		});

	});

	QUnit.module("LazyLoading with BlockBase", {

		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageLazyLoadingWithBlocks",
				viewName: "view.UxAP-ObjectPageLazyLoadingWithBlocks"
			}).then(function(oView) {
				this.oObjectPageInfoView = oView;
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oObjectPageInfoView.destroy();
		}
	});

	QUnit.test("Check updateBindings for visible and not visible blocks", function (assert) {
		// Arrange
		var oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout"),
			oLastSubSection = this.oObjectPageInfoView.byId("last"),
			oBlock = oLastSubSection.getBlocks()[0],
			oSpy = this.spy(Control.prototype, "updateBindings"),
			done = assert.async();

		this.oObjectPageInfoView.placeAt('qunit-fixture');
		nextUIUpdate.runSync();

		function checkSpyCalledWithValue() {
			return oSpy.getCalls().some(function (oCall) {
				return oCall.thisValue === oBlock;
			});
		}

		oOPL.attachEventOnce("onAfterRenderingDOMReady", function () {
			// Giving time for all async connectToModels calls
			setTimeout(function () {
				// Assert
				assert.notOk(checkSpyCalledWithValue(), "update bindings is NOT called for BlockBase in last SubSection, as it is still not visible");

				// Act - scroll to last SubSection
				oOPL.scrollToSection(oLastSubSection.getId());

				setTimeout(function () {
					// Assert
					assert.ok(checkSpyCalledWithValue, "update bindings is  called for BlockBase in last SubSection, as it is visible now");

					done();
				}, 300);
			});
		});
	});

	QUnit.test("Update bindings when 'moreBlocks' are shown", function (assert) {
		// Arrange
		var oOPL = this.oObjectPageInfoView.byId("ObjectPageLayout"),
			oFirstSubSection = this.oObjectPageInfoView.byId("firstSubSection"),
			oBlock = oFirstSubSection.getMoreBlocks()[0],
			oUpdateBindingsSpy = this.spy(oBlock, "updateBindings"),
			oSelectViewSpy = this.spy(oBlock, "_selectView"),
			done = assert.async();

		this.oObjectPageInfoView.placeAt('qunit-fixture');
		nextUIUpdate.runSync();

		oOPL.attachEventOnce("onAfterRenderingDOMReady", function () {
			// Act - press ShowMore Button
			oFirstSubSection._getSeeMoreButton().firePress();

			// Assert
			assert.ok(oUpdateBindingsSpy.calledOnce, "updateBindings is called for BlockBase in 'moreBlocks' aggregation of first SubSection");
			assert.ok(oSelectViewSpy.calledOnce, "_selectView is called for BlockBase in 'moreBlocks' aggregation of first SubSection");

			done();
		});

	});

	QUnit.test("Form adjustment destroys the obsolete form layout", function (assert) {
		var done = assert.async(),
			viewContent = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:form="sap.ui.layout.form">' +
				'<form:Form>' +
					'<form:layout>' +
						'<form:ResponsiveGridLayout id="idResponsiveGridLayout" />' +
					'</form:layout>' +
					'</form:Form>' +
				'</mvc:View>',
			MyBlock = BlockBase.extend("my.custom.Block", {
				metadata: {
					views: {
						// Define the view for the block
						Collapsed: {
							type: "XML",
							async: true,
							definition:viewContent
						},
						Expanded: {
							type: "XML",
							async: true,
							definition:viewContent
						}
					}
				},
				renderer: {}
			}),
			myBlock = new MyBlock({
				id: "myBlock",
				formAdjustment: BlockBaseFormAdjustment.BlockColumns
			}),
			oSubSection = new ObjectPageSubSection({
				id: "mySubSection",
				blocks: [myBlock]
			});

		oSubSection._oLayoutConfig = {M: 2, L: 3, XL: 4};

		myBlock.attachEventOnce("viewInit", function (oEvent) {
			var oView = oEvent.getParameter("view");
			var oFormLayout = oView.byId("idResponsiveGridLayout");

			// Assert: check if the obsolete form layout is destroyed
			assert.ok(oFormLayout, "The form layout is created");

			setTimeout(function () {
				// Act: trigger the adjustment of the form layout
				myBlock._applyFormAdjustment();

				// Act: destroy the block parent
				oSubSection.destroy();
				// Assert: check if the obsolete form layout is destroyed
				assert.ok(oFormLayout.bIsDestroyed, "The obsolete form layout is destroyed");
				done();
			}, 0);
		});

		myBlock._selectView("Expanded");
	});

	// utils:
	function objectToString(obj) {
		return Object.entries(obj)
			.map(([key, value]) => `${key}="${String(value)}"`)
			.join(' ');
	}

});
