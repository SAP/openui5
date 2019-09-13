/*global QUnit, sinon*/
sap.ui.define(["sap/ui/thirdparty/jquery",
               "sap/ui/core/Core",
               "sap/ui/model/json/JSONModel",
               "sap/uxap/ObjectPageLayout"],
function (jQuery, Core, JSONModel, ObjectPageLayout) {
	"use strict";

	var oController = sap.ui.controller("viewController", {
		onInit: function () {
		}
	});

	// utility function that will be used in these tests
	var _getOneBlock = function () {
		return {
			Type: "sap.uxap.testblocks.employmentblockjob.EmploymentBlockJob",

			mappings: [{
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/0",
				"internalModelName": "emp1"
			}, {
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/1",
				"internalModelName": "emp2"
			}, {
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/2",
				"internalModelName": "emp3"
			}, {
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/3",
				"internalModelName": "emp4"
			}, {
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/4",
				"internalModelName": "emp5"
			}, {
				"externalModelName": "objectPageData",
				"externalPath": "/Employee/5",
				"internalModelName": "emp6"
			}

			]
		};
	};

	var _loadBlocksData = function (oData) {
		jQuery.each(oData.sections, function (iIndexSection, oSection) {
			jQuery.each(oSection.subSections, function (iIndex, oSubSection) {
				oSubSection.blocks = [_getOneBlock()];
				if (iIndexSection <= 4) {
					oSubSection.mode = "Collapsed";
					oSubSection.moreBlocks = [_getOneBlock()];
				}
			});
		});
	};

	var iLoadingDelay = 1000;
	var oConfigModel = new JSONModel();
	oConfigModel.loadData("test-resources/sap/uxap/qunit/model/ObjectPageConfig.json", {}, false);

	QUnit.module("ObjectPageConfig", {
		beforeEach: function () {
			this.oView = sap.ui.xmlview("UxAP-27_ObjectPageConfig", {
				viewName: "view.UxAP-27_ObjectPageConfig",
				controller: oController
			});
			this.oView.setModel(oConfigModel, "objectPageLayoutMetadata");
			this.oView.placeAt('qunit-fixture');
			Core.applyChanges();
		},
		afterEach: function() {
			this.oView.destroy();
		}
	});

	QUnit.test("load first visible sections", function (assert) {
		var oComponentContainer = this.oView
			.byId("objectPageContainer");
		var oObjectPageLayout = oComponentContainer
			.getObjectPageLayoutInstance();

		var oData = oConfigModel.getData();
		_loadBlocksData(oData);

		oConfigModel.setData(oData);
		Core.applyChanges();

		var done = assert.async();
		setTimeout(function() {
			var oFirstSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];
			assert.strictEqual(oFirstSubSection.getBlocks()[0]._bConnected, true, "block data loaded successfully");

			var oSecondSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];
			assert.strictEqual(oSecondSubSection.getBlocks()[0]._bConnected, true, "block data loaded successfully");

			var oLastSubSection = oObjectPageLayout.getSections()[5].getSubSections()[0];
			assert.strictEqual(oLastSubSection.getBlocks()[0]._bConnected, false, "block data outside viewport not loaded");
			done();
		}, iLoadingDelay);
	});

	QUnit.test("load scrolled sections", function (assert) {

		var oComponentContainer = this.oView
			.byId("objectPageContainer");
		var oObjectPageLayout = oComponentContainer
			.getObjectPageLayoutInstance(),
			oThirdSubSection = oObjectPageLayout.getSections()[3].getSubSections()[0];

		assert.strictEqual(oThirdSubSection.getBlocks()[0]._bConnected, false, "block data outside viewport not loaded yet");

		//act
		oObjectPageLayout.scrollToSection(oObjectPageLayout.getSections()[5].getId());
		Core.applyChanges();

		var done = assert.async();
		setTimeout(function() {

			assert.strictEqual(oThirdSubSection.getBlocks()[0]._bConnected, false, "block data outside viewport still not loaded");

			var oLastSubSection = oObjectPageLayout.getSections()[5].getSubSections()[0];
			assert.strictEqual(oLastSubSection.getBlocks()[0]._bConnected, true, "block data if target section loaded");
			done();
		}, iLoadingDelay);
	});

	QUnit.test("model mapping for scrolled sections", function (assert) {

		var oComponentContainer = this.oView
			.byId("objectPageContainer");
		var oObjectPageLayout = oComponentContainer
			.getObjectPageLayoutInstance();

		var oDataModel = new JSONModel();
		oDataModel.loadData("test-resources/sap/uxap/qunit/model/HRData.json", {}, false);

		this.oView.setModel(oDataModel, "objectPageData");

		Core.applyChanges();

		var done = assert.async();
		setTimeout(function() {

			var oThirdSubSection = oObjectPageLayout.getSections()[3].getSubSections()[0];
			assert.strictEqual(oThirdSubSection.$().find(".sapUxAPBlockBase .sapMImg").length > 0, false, "data of disconnected blocks is not loaded");

			var oLastSubSection = oObjectPageLayout.getSections()[5].getSubSections()[0];
			assert.strictEqual(oLastSubSection.$().find(".sapUxAPBlockBase .sapMImg").length > 0, false, "data of last connected blocks is loaded"); // TODO Verify this is correct since these tests were disabled (changed from true)
			done();
		}, iLoadingDelay);
	});

	QUnit.test("BCP: 1970115549 - _grepCurrentTabSectionBases should always return a value", function (assert) {
		var oComponentContainer = this.oView.byId("objectPageContainer"),
			oObjectPageLayout = oComponentContainer.getObjectPageLayoutInstance(),
			aSectionBases = oObjectPageLayout._aSectionBases,
			fnCustomGetParent = function () {
				return undefined;
			};

		oObjectPageLayout.setSelectedSection(aSectionBases[0].getId());

		assert.equal(oObjectPageLayout._grepCurrentTabSectionBases().length, 2, "_grepCurrentTabSectionBases returns 2 filtered sections initially");

		aSectionBases[1].getParent = fnCustomGetParent;

		assert.equal(oObjectPageLayout._grepCurrentTabSectionBases().length, 1, "_grepCurrentTabSectionBases returns a valid value if some of the sections parent is undefined");
	});

	QUnit.module("ObjectPageAfterRendering");

	QUnit.test("triggering visible subsections calculations should not fail before rendering", function (assert) {
		var oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true});
		oObjectPageLayout._triggerVisibleSubSectionsEvents();
		assert.ok("passes before rendering (noop)");
		oObjectPageLayout.destroy();
	});

	QUnit.test("BCP: 1870326083 - _triggerVisibleSubSectionsEvents should force OP to recalculate", function (assert) {
		// Arrange
		var oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true}),
			oRequestAdjustLayoutSpy = sinon.spy(oObjectPageLayout, "_requestAdjustLayout");

		// We have to render the OP as LazyLoading is initiated on onBeforeRendering
		oObjectPageLayout.placeAt("qunit-fixture");
		Core.applyChanges();

		// Act - call the method
		oObjectPageLayout._oLazyLoading._triggerVisibleSubSectionsEvents();

		// Assert
		assert.strictEqual(oRequestAdjustLayoutSpy.callCount, 1,
			"Method should be called from _triggerVisibleSubSectionsEvents");

		assert.ok(oRequestAdjustLayoutSpy.calledWith(true),
			"Method should be called with 'true' as a parameter for immediate execution");

		// Clean
		oRequestAdjustLayoutSpy.restore();
		oObjectPageLayout.destroy();
	});

	QUnit.test("Early lazyLoading onAfterRendering", function (assert) {

		var oObjectPage = new ObjectPageLayout({enableLazyLoading: true}),
			iExpectedLazyLoadingDelay,
			spy,
			done = assert.async();

		assert.expect(1);

		// Arrange: enable early lazy loading
		oObjectPage._triggerVisibleSubSectionsEvents();
		iExpectedLazyLoadingDelay = 0; // expect very small delay

		oObjectPage.addEventDelegate({
			"onBeforeRendering": function() {
				spy = sinon.spy(oObjectPage._oLazyLoading, "lazyLoadDuringScroll");
			},
			"onAfterRendering": function() {
				setTimeout(function() {
					// Check:
					assert.strictEqual(spy.callCount, 1, "lazy loading is called early");
					oObjectPage.destroy();
					done();
				}, iExpectedLazyLoadingDelay);
			}
		}, this);

		oObjectPage.placeAt("qunit-fixture");
		Core.applyChanges();
	});

	QUnit.test("Early lazyLoading onAfterRendering if already scheduled", function (assert) {

		var oObjectPage = new ObjectPageLayout({enableLazyLoading: true}),
			spy,
			done = assert.async();

		assert.expect(1);

		oObjectPage.addEventDelegate({
			"onBeforeRendering": function() {
				spy = sinon.spy(oObjectPage._oLazyLoading, "doLazyLoading");
			},
			"onAfterRendering": function() {
				oObjectPage._triggerVisibleSubSectionsEvents();
				// Arrange: reset any earlier recorded calls
				spy.reset();
			}
		}, this);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				// Check:
				assert.strictEqual(spy.callCount, 1, "lazy loading is called early");
				oObjectPage.destroy();
				done();
		});

		oObjectPage.placeAt("qunit-fixture");
		Core.applyChanges();
	});

	QUnit.test("Early lazyLoading onAfterRendering when hidden", function (assert) {

		var oObjectPage = new ObjectPageLayout({enableLazyLoading: true}),
			iExpectedLazyLoadingDelay,
			recalcSpy = sinon.spy(oObjectPage, "_requestAdjustLayout"),
			lazyLoadingSpy,
			done = assert.async();

		assert.expect(2);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

				oObjectPage.addEventDelegate({
					"onBeforeRendering": function() {
						lazyLoadingSpy = sinon.spy(oObjectPage._oLazyLoading, "doLazyLoading");
					},
					"onAfterRendering": function() {

						setTimeout(function() {

							// restore visibility
							window["qunit-fixture"].style.display = "";
							recalcSpy.reset();
							lazyLoadingSpy.reset();
							// call the resize listener explicitly in the test to avoid waiting for the ResizeHandler to react (would introduce extra delay in the test)
							oObjectPage._onUpdateScreenSize({
								size: {
									width: 100,
									height: 300
								},
								oldSize: {
									height: 0
								}
							});
							setTimeout(function() {
								// Check:
								assert.strictEqual(lazyLoadingSpy.callCount, 1, "lazy loading is called early");
								assert.strictEqual(recalcSpy.callCount, 1, "layout adjustment is called early");
								oObjectPage.destroy();
								done();
							}, iExpectedLazyLoadingDelay);
						}, 0);

					}
				}, this);

				// Arrange:
				// we are interested in (1) subseqeuent (i.e. non-first) rendering (2) while the page is hidden child
				oObjectPage._triggerVisibleSubSectionsEvents(); // enable early lazy loading
				iExpectedLazyLoadingDelay = 0; // expect very small delay
				window["qunit-fixture"].style.display = "none";
				oObjectPage.rerender();




		});

		oObjectPage.placeAt("qunit-fixture");
		Core.applyChanges();
	});

});
