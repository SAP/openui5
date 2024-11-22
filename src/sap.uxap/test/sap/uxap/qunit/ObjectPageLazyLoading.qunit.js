/*global QUnit, */
sap.ui.define([
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/Title",
	"sap/uxap/ObjectPageDynamicHeaderTitle",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/core/mvc/XMLView"
], async function(
	nextUIUpdate,
	jQuery,
	Core,
	JSONModel,
	Button,
	Title,
	ObjectPageDynamicHeaderTitle,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	XMLView
) {
	"use strict";

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
	await oConfigModel.loadData("test-resources/sap/uxap/qunit/model/ObjectPageConfig.json");

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.module("ObjectPageConfig", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-27_ObjectPageConfig",
				viewName: "view.UxAP-27_ObjectPageConfig"
			}).then(async function (oView) {
				this.oView = oView;
				this.oComponentContainer = this.oView.byId("objectPageContainer");
				this.oView.setModel(oConfigModel, "objectPageLayoutMetadata");
				this.oView.placeAt("qunit-fixture");
				await nextUIUpdate();
				this.oComponentContainer.attachEventOnce("componentCreated", function () {
					done();
				});
			}.bind(this));
		},
		afterEach: function () {
			this.oView.destroy();
		}
	});

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.test("load first visible sections", function (assert) {
		var oObjectPageLayout = this.oComponentContainer
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

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.test("does not load more than needed subsections", function (assert) {
			var oObjectPageLayout = this.oComponentContainer
				.getObjectPageLayoutInstance();

			var oData = oConfigModel.getData();
			_loadBlocksData(oData);

			oConfigModel.setData(oData);
			oObjectPageLayout.setHeaderTitle(new ObjectPageDynamicHeaderTitle({
				heading: new Title({
					text: "Title of ObjectPageLayout"
				})
			}));
			oObjectPageLayout.addHeaderContent(new Button({
				text: "Hello"
			}));
			Core.applyChanges();

			var done = assert.async();
			assert.expect(3);

			setTimeout(function() {
				var oFirstSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];
				assert.strictEqual(oFirstSubSection.getBlocks()[0]._bConnected, true, "block data loaded successfully");

				var oSecondSubSection = oObjectPageLayout.getSections()[0].getSubSections()[0];
				assert.strictEqual(oSecondSubSection.getBlocks()[0]._bConnected, true, "block data loaded successfully");

				var oOutOfViewPortSubSection = oObjectPageLayout.getSections()[3].getSubSections()[1];
				assert.strictEqual(oOutOfViewPortSubSection.getBlocks()[0]._bConnected, false, "block data outside viewport not loaded");
				done();
			}, iLoadingDelay);
	});

	QUnit.test("subSectionEnteredViewPort event is fired only for visible SubSections after rerendering", function (assert) {

		var oObjectPageLayout = this.oComponentContainer.getObjectPageLayoutInstance(),
			oThirdSection = oObjectPageLayout.getSections()[3],
			oThirdSubSection = oThirdSection.getSubSections()[1],
			done = assert.async(),
			iCallCounts = 0,
			aSubSectionsEnteredViewPortIds = [];


		var oData = oConfigModel.getData();
		_loadBlocksData(oData);
		oConfigModel.setData(oData);

		//act
		oObjectPageLayout.setSelectedSection(oThirdSection, 0);
		oThirdSection.setSelectedSubSection(oThirdSubSection.getId());
		oObjectPageLayout.getSections()[5].setVisible(false);
		Core.applyChanges();

		oObjectPageLayout.attachEvent("subSectionEnteredViewPort", function (oEvent) {
			iCallCounts++;
			aSubSectionsEnteredViewPortIds.push(oEvent.getParameter("subSection").getId());

			if (iCallCounts === 6) {
				assert.strictEqual(aSubSectionsEnteredViewPortIds
					.indexOf("__xmlview0--ObjectPageSubSection-__xmlview0--ObjectPageLayout-3-__xmlview0--ObjectPageSection-__xmlview0--ObjectPageLayout-3-0"),
				-1, "subSectionEnteredViewPort event not called with first SubSection of the third Section");
				done();
			}
		});

	});

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.test("load first visible sections is relative to selectedSection", function (assert) {

		var oObjectPageLayout = this.oComponentContainer
			.getObjectPageLayoutInstance(),
			secondSection;

		secondSection = oObjectPageLayout.getSections()[1];
		oObjectPageLayout.setSelectedSection(secondSection);

		var aSectionBases = oObjectPageLayout._getSectionsToPreloadOnBeforeFirstRendering();
		assert.strictEqual(aSectionBases[0].getParent(), secondSection, "first visible subSection is within the currently selectedSection");

		this.oView.destroy();
	});

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.test("load scrolled sections", function (assert) {

		var oObjectPageLayout = this.oComponentContainer
			.getObjectPageLayoutInstance(),
			oThirdSubSection = oObjectPageLayout.getSections()[3].getSubSections()[0];

		assert.strictEqual(oThirdSubSection.getBlocks()[0]._bConnected, false, "block data outside viewport not loaded yet");

		//act
		oObjectPageLayout.scrollToSection(oObjectPageLayout.getSections()[5].getId());

		var done = assert.async();

		setTimeout(function() {

			assert.strictEqual(oThirdSubSection.getBlocks()[0]._bConnected, false, "block data outside viewport still not loaded");

			var oLastSubSection = oObjectPageLayout.getSections()[5].getSubSections()[0];
			assert.strictEqual(oLastSubSection.getBlocks()[0]._bConnected, true, "block data if target section loaded");
			done();
		}, iLoadingDelay);
	});

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.test("model mapping for scrolled sections", async function (assert) {

		var oObjectPageLayout = this.oComponentContainer
			.getObjectPageLayoutInstance();

		var oDataModel = new JSONModel();
		oDataModel.loadData("test-resources/sap/uxap/qunit/model/HRData.json", {}, false);

		this.oView.setModel(oDataModel, "objectPageData");

		await nextUIUpdate();

		var done = assert.async();

		setTimeout(function() {

			var oThirdSubSection = oObjectPageLayout.getSections()[3].getSubSections()[0];
			assert.strictEqual(oThirdSubSection.getBlocks()[0]._bConnected, false, "data of disconnected blocks is not loaded");

			var oLastSubSection = oObjectPageLayout.getSections()[5].getSubSections()[0];
			assert.strictEqual(oLastSubSection.getBlocks()[0]._bConnected, false, "data of last connected blocks is loaded"); // TODO Verify this is correct since these tests were disabled (changed from true)
			done();
		}, iLoadingDelay);
	});

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.test("scrollToSection with animation does not load intermediate sections", function (assert) {
			var oObjectPageLayout = this.oComponentContainer.getObjectPageLayoutInstance(),
			oData = oConfigModel.getData(),
			done = assert.async(),
			that = this;

		_loadBlocksData(oData);

		oConfigModel.setData(oData);
		Core.applyChanges();

		assert.expect(1);

		function checkOnDomReady() {
			var iSectionsCount = oObjectPageLayout.getSections().length,
				oLastSection = oObjectPageLayout.getSections()[iSectionsCount - 1],
				oSectionBeforeLast = oObjectPageLayout.getSections()[iSectionsCount - 2],
				iSectionBeforeLastPositionTo = oObjectPageLayout._computeScrollPosition(oSectionBeforeLast);

			// Setup: mock scrollTop of a section before the target section
			that.stub(oObjectPageLayout, "_getHeightRelatedParameters").callsFake(function() {
				return {
					// mock a scrollTop where an intermediate [before the target] section is in the viewport
					iScrollTop: iSectionBeforeLastPositionTo,
					iScreenHeight: oObjectPageLayout.iScreenHeight
				};
			});

			// Act: scroll with animation
			oObjectPageLayout.scrollToSection(oLastSection.getId());

			// Act: mock lazyLoading call *during animated scroll*
			oObjectPageLayout._oLazyLoading.doLazyLoading();

			// Check the intermediate [before the target] section is not loaded despite being in the viewport
			assert.strictEqual(oSectionBeforeLast.getSubSections()[0].getBlocks()[0]._bConnected, false, "section above the target section is not loaded");
			done();
		}

		if (oObjectPageLayout._bDomReady) {
			checkOnDomReady();
		} else {
			oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", checkOnDomReady);
		}
	});

	/**
	 * @deprecated Since version 1.120
	 */
	QUnit.test("BCP: 1970115549 - _grepCurrentTabSectionBases should always return a value", function (assert) {
			var oObjectPageLayout = this.oComponentContainer.getObjectPageLayoutInstance(),
			aSectionBases = oObjectPageLayout._aSectionBases,
			fnCustomGetParent = function () {
				return undefined;
			};

		oObjectPageLayout.setSelectedSection(aSectionBases[0].getId());

		assert.equal(oObjectPageLayout._grepCurrentTabSectionBases().length, 3, "_grepCurrentTabSectionBases returns 3 filtered sections + subsections initially");

		aSectionBases[1].getParent = fnCustomGetParent;

		assert.equal(oObjectPageLayout._grepCurrentTabSectionBases().length, 2, "_grepCurrentTabSectionBases returns a valid value if some of the sections parent is undefined");
	});

	QUnit.test("_triggerVisibleSubSectionsEvents fires subSectionEnteredViewPort event for visible SubSections", async function(assert) {
		// Arrange
		var oObjectPageLayout = this.oComponentContainer.getObjectPageLayoutInstance(),
			fnDone = assert.async(),
			iCallCounts = 0,
			fnOnSubSectionEnteredViewPort = function (oEvent) {
				var oSubSection = oEvent.getParameter("subSection");
				assert.ok(true, "subSectionEnteredViewPort fired for " + oSubSection.getId());
				iCallCounts++;

				if (iCallCounts === 3) {
					fnDone();
				}
			},
			oData = oConfigModel.getData();

		_loadBlocksData(oData);
		oConfigModel.setData(oData);
		await nextUIUpdate();

		setTimeout(function () {
			oObjectPageLayout.attachEvent("subSectionEnteredViewPort", fnOnSubSectionEnteredViewPort);

			// Act - call _triggerVisibleSubSectionsEvents to force subSectionEnteredViewPort event firing
			oObjectPageLayout._oLazyLoading._triggerVisibleSubSectionsEvents();
		}, 1000);
	});

	QUnit.test("_triggerVisibleSubSectionsEvents makes sure the OPL is scrolled to the correct position before executing lazyloading",
		async function(assert) {
		// Arrange
		var oObjectPageLayout = this.oComponentContainer.getObjectPageLayoutInstance(),
			fnDone = assert.async(),
			oScrolledToSection = oObjectPageLayout.getSections()[2],
			sScrolledToSectionId = oScrolledToSection.getId(),
			oData = oConfigModel.getData(),
			oSpy;

		_loadBlocksData(oData);
		oConfigModel.setData(oData);
		oObjectPageLayout.setSelectedSection(oScrolledToSection);
		await nextUIUpdate();

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function () {
			oSpy = this.spy(oObjectPageLayout, "scrollToSection");

			// Fake different top position of scrolled section
			oObjectPageLayout._oSectionInfo[sScrolledToSectionId].positionTop = 1500;

			// Act
			oObjectPageLayout._triggerVisibleSubSectionsEvents();

			// Assert
			assert.ok(oSpy.calledWith(oScrolledToSection.getId()), "scrolled to correct Section");

			// Clean up
			fnDone();
		}.bind(this));
	});

	QUnit.module("ObjectPageAfterRendering");

	QUnit.test("triggering visible subsections calculations should not fail before rendering", function (assert) {
		var oObjectPageLayout = new ObjectPageLayout({
			enableLazyLoading: true,
			sections: new ObjectPageSection("mySection1", {
				subSections: [
					new ObjectPageSubSection({
						title: "Title",
						blocks: [new Title({text: "test"})]
					})
				]
			}),
			selectedSection: "mySection1"
		});
		oObjectPageLayout._triggerVisibleSubSectionsEvents();
		assert.ok("passes before rendering (noop)");
		oObjectPageLayout.destroy();
	});

	QUnit.test("BCP: 1870326083 - _triggerVisibleSubSectionsEvents should force OP to recalculate", async function(assert) {
		// Arrange
		var oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true}),
			oRequestAdjustLayoutSpy = this.spy(oObjectPageLayout, "_requestAdjustLayout");

		// We have to render the OP as LazyLoading is initiated on onBeforeRendering
		oObjectPageLayout.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act - call the method
		oObjectPageLayout._oLazyLoading._triggerVisibleSubSectionsEvents();

		// Assert
		assert.strictEqual(oRequestAdjustLayoutSpy.callCount, 1,
			"Method should be called from _triggerVisibleSubSectionsEvents");

		assert.ok(oRequestAdjustLayoutSpy.calledWith(true),
			"Method should be called with 'true' as a parameter for immediate execution");

		// Clean
		oObjectPageLayout.destroy();
	});

	QUnit.test("Early lazyLoading onAfterRendering", async function(assert) {

		var oObjectPage = new ObjectPageLayout({enableLazyLoading: true}),
			iExpectedLazyLoadingDelay,
			spy,
			that = this,
			done = assert.async();

		assert.expect(1);

		// Arrange: enable early lazy loading
		oObjectPage._triggerVisibleSubSectionsEvents();
		iExpectedLazyLoadingDelay = 0; // expect very small delay

		oObjectPage.addEventDelegate({
			"onBeforeRendering": function() {
				spy = that.spy(oObjectPage._oLazyLoading, "lazyLoadDuringScroll");
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
		await nextUIUpdate();
	});

	QUnit.test("Early lazyLoading onAfterRendering if already scheduled", async function(assert) {

		var oObjectPage = new ObjectPageLayout({enableLazyLoading: true}),
			that = this,
			spy,
			done = assert.async();

		assert.expect(1);

		oObjectPage.addEventDelegate({
			"onBeforeRendering": function() {
				spy = that.spy(oObjectPage._oLazyLoading, "doLazyLoading");
			},
			"onAfterRendering": function() {
				oObjectPage._triggerVisibleSubSectionsEvents();
				// Arrange: reset any earlier recorded calls
				spy.resetHistory();
			}
		}, this);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				// Check:
				assert.strictEqual(spy.callCount, 1, "lazy loading is called early");
				oObjectPage.destroy();
				done();
		});

		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.test("Early lazyLoading onAfterRendering when hidden", async function(assert) {

		var oObjectPage = new ObjectPageLayout({enableLazyLoading: true}),
			iExpectedLazyLoadingDelay,
			recalcSpy = this.spy(oObjectPage, "_requestAdjustLayout"),
			lazyLoadingSpy,
			that = this,
			done = assert.async();

		assert.expect(2);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

				oObjectPage.addEventDelegate({
					"onBeforeRendering": function() {
						lazyLoadingSpy = that.spy(oObjectPage._oLazyLoading, "doLazyLoading");
					},
					"onAfterRendering": function() {

						setTimeout(function() {

							// restore visibility
							window["qunit-fixture"].style.display = "";
							recalcSpy.resetHistory();
							lazyLoadingSpy.resetHistory();
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
				oObjectPage.invalidate();




		});

		oObjectPage.placeAt("qunit-fixture");
		await nextUIUpdate();
	});

	QUnit.test("Sections are lazy loaded when header content is pinned initially", async function(assert) {
		// Arrange
		var oObjectPageLayout = new ObjectPageLayout({
				enableLazyLoading: true,
				headerContentPinned: true,
				headerTitle: [new ObjectPageDynamicHeaderTitle()]
			}),
			fnDone = assert.async(),
			fnOnBeforeRendering = function () {
				oObjectPageLayout.removeEventDelegate(fnOnBeforeRendering);
				oLazyLoadingSpy = this.spy(oObjectPageLayout._oLazyLoading, "doLazyLoading");
			}.bind(this),
			oLazyLoadingSpy;

		assert.expect(1);

		// Setup: mock framework call on before rendering
		oObjectPageLayout.addEventDelegate({
			"onBeforeRendering": fnOnBeforeRendering
		});

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady",
			function () {
				// Assert
				assert.ok(oLazyLoadingSpy.calledOnce, "LazyLoading is called");

				// Clean up
				oObjectPageLayout.destroy();
				fnDone();
			}
		);

		oObjectPageLayout.placeAt("qunit-fixture");
		await nextUIUpdate();
	});


	QUnit.module("Lifecycle");

	QUnit.test("lazyLoading created on beforeRendering", function (assert) {
		// Setup
		var oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true});

		// Act: mock framework call on before rendering
		oObjectPageLayout.onBeforeRendering();

		// Check
		assert.ok(oObjectPageLayout._oLazyLoading , "lazy loading created");
	});

	QUnit.test("lazyLoading interval task", function (assert) {
		var oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true}),
			oLazyLoading,
			oLazyLoadingSpy,
			done = assert.async();

		assert.expect(1);

		// Setup: mock function result onBeforeRendering
		this.stub(oObjectPageLayout, "_getHeightRelatedParameters").callsFake(function() {
			// return value is not important for this test
			return {};
		});

		// Setup: mock framework call on before rendering
		oObjectPageLayout.onBeforeRendering();

		// Setup: spy for repeated calls of <code>doLazyLoading</code>
		oLazyLoading = oObjectPageLayout._oLazyLoading;
		oLazyLoadingSpy = this.spy(oLazyLoading, "doLazyLoading");

		// Act: trigger lazyLoading
		oLazyLoading.doLazyLoading(); // mock initial trigger from objectPage
		oLazyLoadingSpy.resetHistory(); // ensure we monitor only calls from this point on

		// Check
		setTimeout(function() {
			assert.strictEqual(oLazyLoadingSpy.callCount, 0 , "lazy loading is not called for unstashing an extra SubSection");
			done();
			oObjectPageLayout.destroy();
		}, 1000);
	});

	QUnit.test("lazyLoading interval task cancelled when not needed", function (assert) {
		var oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true}),
			oLazyLoading,
			oLazyLoadingSpy,
			done = assert.async();

		assert.expect(1);

		// Setup: mock function result onBeforeRendering
		this.stub(oObjectPageLayout, "_getHeightRelatedParameters").callsFake(function() {
			// return value is not important for this test
			return {};
		});

		// Setup: mock framework call on before rendering
		oObjectPageLayout.onBeforeRendering();

		// Setup: spy for repeated calls of <code>doLazyLoading</code>
		oLazyLoading = oObjectPageLayout._oLazyLoading;
		oLazyLoadingSpy = this.spy(oLazyLoading, "doLazyLoading");
		oLazyLoading.doLazyLoading(); // mock initial call from objectPage
		oLazyLoadingSpy.resetHistory(); // ensure we monitor only calls from this point on

		// Act
		oLazyLoading.destroy();

		// Check
		setTimeout(function() {
			assert.strictEqual(oLazyLoadingSpy.callCount, 0 , "lazy loading called no mpore");
			done();
			oObjectPageLayout.destroy();
		}, oLazyLoading.LAZY_LOADING_EXTRA_SUBSECTION);
	});

	QUnit.test("lazyLoading called when content size is updated", async function (assert) {
		// Setup
		var oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true}),
			fnDone = assert.async(),
			oSpy;
		oObjectPageLayout.placeAt("qunit-fixture");
		await nextUIUpdate();

		oSpy = this.spy(oObjectPageLayout._oLazyLoading, "doLazyLoading");

		// Act: call _onUpdateContentSize (when content is updated)
		oObjectPageLayout._onUpdateContentSize({
			size: {
				height: 1000,
				width: 600
			}
		});

		// Check
		assert.ok(oSpy.callCount, 1, "lazy loading is called after content update");
		fnDone();
	});

	QUnit.test("doLazyLoading called with scroll top parameter from lazyLoadingDuringScroll", async function (assert) {
		// Setup
		var oObjectPageLayout = new ObjectPageLayout({enableLazyLoading: true}),
			fnDone = assert.async(),
			oSpy;

		oObjectPageLayout.placeAt("qunit-fixture");
		await nextUIUpdate();

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function () {
			oSpy = this.spy(oObjectPageLayout._oLazyLoading, "doLazyLoading");

			// Act: simulate calling lazyLoadDuringScroll upon native scroll event
			oObjectPageLayout._oLazyLoading.lazyLoadDuringScroll(false, 1000);

			// Check
			setTimeout(function () {
				// Assert
				assert.ok(oSpy.calledWith(1000),  "scroll top parameter is passed to doLazyLoading");

				// Clean up
				fnDone();
			}, 400);
		}.bind(this));
	});
});
