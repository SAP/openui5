/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageDynamicHeaderTitle",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/Panel",
	"sap/ui/core/HTML",
	"sap/ui/Device",
	"sap/ui/core/mvc/XMLView"],
function(jQuery, Core, ObjectPageSubSection, ObjectPageSection, ObjectPageLayout, ObjectPageDynamicHeaderTitle, Text, Title, Panel, HTML, Device, XMLView) {

	"use strict";

	var oFactory = {
		getSection: function (iNumber, sTitleLevel, aSubSections) {
			return new ObjectPageSection({
				title: "Section" + iNumber,
				titleLevel: sTitleLevel,
				subSections: aSubSections || []
			});
		},
		getSubSection: function (iNumber, aBlocks, sTitleLevel) {
			return new ObjectPageSubSection({
				title: "SubSection " + iNumber,
				titleLevel: sTitleLevel,
				blocks: aBlocks || []
			});
		},
		getBlocks: function (sText) {
			return [
				new Text({text: sText || "some text"})
			];
		},
		getObjectPage: function () {
			return new ObjectPageLayout();
		},
		getDynamicPageTitle: function () {
			return new ObjectPageDynamicHeaderTitle({
				heading:  this.getTitle()
			});
		},
		getTitle: function () {
			return new Title({
				text: "Anna Maria Luisa"
			});
		}
	},

	helpers = {
		generateObjectPageWithContent: function (oFactory, iNumberOfSection) {
			var oObjectPage = oFactory.getObjectPage(),
				oSection,
				oSubSection;

			for (var i = 0; i < iNumberOfSection; i++) {
				oSection = oFactory.getSection(i);
				oSubSection = oFactory.getSubSection(i, oFactory.getBlocks());
				oSection.addSubSection(oSubSection);
				oObjectPage.addSection(oSection);
			}

			return oObjectPage;
		},
		generateObjectPageWithDynamicBigHeaderContent: function() {
			var oBigHeaderContent = new Panel({ height: "900px"}),
				oObjectPage = this.generateObjectPageWithContent(oFactory, 2);

			oObjectPage.setHeaderTitle(oFactory.getDynamicPageTitle());
			oObjectPage.addHeaderContent(oBigHeaderContent);
			return oObjectPage;
		},
		renderObject: function (oSapUiObject) {
			oSapUiObject.placeAt("qunit-fixture");
			Core.applyChanges();
			return oSapUiObject;
		}
	};

	QUnit.module("ObjectPage Content scroll visibility", {
		beforeEach: function (assert) {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 10);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("sectionChange event is fired upon scrolling", function (assert) {
		var oObjectPage = this.oObjectPage,
			oSection = oObjectPage.getSections()[9],
			fnDone = assert.async();

		oObjectPage.attachSectionChange(function(oEvent) {
			assert.equal(oEvent.getParameter("section").getId(), oSection.getId(), "sectionChange event is fired upon scrolling to a specified section");
			fnDone();
		});

		// act
		helpers.renderObject(oObjectPage);
		oObjectPage.setSelectedSection(oSection);
	});

	QUnit.test("ObjectPage Content CustomScrollBar visibility", function (assert) {
		var oObjectPage = this.oObjectPage,
			fnDone = assert.async();

		assert.expect(2);
		// assert default
		assert.strictEqual(oObjectPage._hasVerticalScrollBar(), false,
		"CustomScrollBar visibility is false initialy");

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				assert.strictEqual(oObjectPage._hasVerticalScrollBar(), true,
				"CustomScrollBar visibility is true after rendering");

				fnDone();
		});

		// act
		helpers.renderObject(oObjectPage);
	});

	QUnit.module("scroll position within subSection", {
		beforeEach: function (assert) {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 10);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("_restoreScrollPosition restores position within subSection", function (assert) {
		// Mock data values
		var oSelectedSection = this.oObjectPage.getSections()[1],
			oStoredSubSection = oSelectedSection.getSubSections()[0],
			storedSubSectionPositionTop = 200,
			iOffsetWithinStoredSubSection = 20,
			oScrollSpy = sinon.spy(this.oObjectPage, "_scrollTo");


		// Setup: Select section
		this.oObjectPage.setSelectedSection(oSelectedSection);
		// Setup: Mock the effect of _storeScrollLocation with oStoredSubSection
		this.oObjectPage._oStoredScrolledSubSectionInfo.sSubSectionId = oStoredSubSection.getId();
		this.oObjectPage._oStoredScrolledSubSectionInfo.iOffset = iOffsetWithinStoredSubSection;
		// Setup: Mock the position of the stored subSection
		sinon.stub(this.oObjectPage, "_computeScrollPosition", function(oSection) {
			return storedSubSectionPositionTop; // mock a specific scroll position of a section
		});
		// Setup: Mock the validity of the stored subSection
		sinon.stub(this.oObjectPage, "_sectionCanBeRenderedByUXRules", function() {
			return true;
		});

		// act
		this.oObjectPage._restoreScrollPosition();

		// check
		assert.ok(oScrollSpy.calledWithMatch(storedSubSectionPositionTop + iOffsetWithinStoredSubSection),
			"correct scroll position is restored");
	});

	QUnit.module("ObjectPage Content scrolling", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-objectPageContentScrolling",
				viewName: "view.UxAP-ObjectPageContentScrolling"
			}).then(function (oView) {
				this.oObjectPageContentScrollingView = oView;
				this.oObjectPageContentScrollingView.placeAt('qunit-fixture');
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oObjectPageContentScrollingView.destroy();
		}
	});

	QUnit.test("Should validate each section's position after scrolling to it, considering UI rules", function (assert) {
		var clock = sinon.useFakeTimers();

		clock.tick(500);

		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");

		for (var section in oObjectPage._oSectionInfo) {
			if (!oObjectPage._oSectionInfo.hasOwnProperty(section)) {
				continue;
			}

			//Scroll to section
			oObjectPage.scrollToSection(section,0,0);
			clock.tick(500);

			//Handle UI Rules special cases
			var iExpectedPosition;
			switch (section) {
				case "UxAP-objectPageContentScrolling--firstSection":
					iExpectedPosition =  0;
					break;
				case "UxAP-objectPageContentScrolling--subsection1-1":
					iExpectedPosition =  0;
					break;
				case "UxAP-objectPageContentScrolling--secondSection":
					iExpectedPosition =  oObjectPage._oSectionInfo["UxAP-objectPageContentScrolling--subsection2-1"].positionTop;
					break;
				case "UxAP-objectPageContentScrolling--thirdSection":
					iExpectedPosition = oObjectPage._oSectionInfo["UxAP-objectPageContentScrolling--subsection3-1"].positionTop;
					break;
				case "UxAP-objectPageContentScrolling--subsection3-1":
					iExpectedPosition = oObjectPage._oSectionInfo["UxAP-objectPageContentScrolling--subsection3-1"].positionTop;
					break;
				default:
					iExpectedPosition = oObjectPage._oSectionInfo[section].positionTop;
			}

			//Assert
			assert.ok(isPositionsMatch(oObjectPage._$opWrapper[0].scrollTop, iExpectedPosition), "Assert section: \"" + section + "\" position: " + iExpectedPosition);
		}
		clock.restore();
	});

	QUnit.test("Slow CPU case", function (assert) {

		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			sTargetSectionId = "UxAP-objectPageContentScrolling--secondSection",
			iTargetPosition,
			done = assert.async();

		assert.expect(2);

		// intercept
		oObjectPage._moveAnchorBarToTitleArea = function () {
			sap.uxap.ObjectPageLayout.prototype._moveAnchorBarToTitleArea.apply(oObjectPage, arguments);
			assert.ok(oObjectPage._$opWrapper.scrollTop() < iTargetPosition, "header is snapped before reaching the target position");
		};

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			oObjectPage._requestAdjustLayout(true);
			iTargetPosition =  oObjectPage._oSectionInfo["UxAP-objectPageContentScrolling--subsection2-1"].positionTop;

			oObjectPage.scrollToSection(sTargetSectionId);

			oObjectPage._$opWrapper.scrollTop(iTargetPosition);
			oObjectPage._onScroll({target: {scrollTop: iTargetPosition}});

			assert.ok(oObjectPage._bStickyAnchorBar, "header is snapped");

			done();
		});

	});

	QUnit.test("Rerendering the page preserves the scroll position", function (assert) {
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			oSecondSection = this.oObjectPageContentScrollingView.byId("secondSection"),
			oStoreSpy = sinon.spy(oObjectPage, "_storeScrollLocation"),
			oRestoreSpy = sinon.spy(oObjectPage, "_restoreScrollPosition"),
			oScrollSpy = sinon.spy(oObjectPage, "_scrollTo"),
			iScrollPositionBeforeRerender,
			done = assert.async();

		oObjectPage.setSelectedSection(oSecondSection.getId());

		assert.expect(3);

		setTimeout(function() {
			iScrollPositionBeforeRerender = oObjectPage._$opWrapper[0].scrollTop;

			oObjectPage.addEventDelegate({ onBeforeRendering: function() {
					assert.ok(oStoreSpy.called, "_storeScrollLocation is called on beforeRenderingf");
				}});

			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				assert.ok(oRestoreSpy.called, "_restoreScrollPosition is called on afterRendering");
				assert.ok(oScrollSpy.calledWithMatch(iScrollPositionBeforeRerender), "scroll position is preserved");
				done();
			});
			oObjectPage.rerender();
		}, 1000); //dom calc delay
	});

	QUnit.test("Scroll position is preserved upon insertion of another section", function (assert) {

		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			oFirstSection = oObjectPage.getSections()[0],
			oSecondSection = oObjectPage.getSections()[1],
			oScrollSpy = sinon.spy(oObjectPage, "_scrollTo"),
			iExpectedScrollTopAfterRendering,
			done = assert.async();

		// setup: hide the first visible section so that the next visible is selected
		oFirstSection.setVisible(false);

		setTimeout(function() {

			oFirstSection.setVisible(true);
			oScrollSpy.reset();
			setTimeout( function() {
				iExpectedScrollTopAfterRendering = oObjectPage._computeScrollPosition(oSecondSection);
				assert.ok(oScrollSpy.calledWithMatch(iExpectedScrollTopAfterRendering),
					"scroll position of the selectedSection is preserved");
				done();
			}, 1000);
		}, 1000);
	});

	QUnit.test("ScrollToSection in 0 time scrolls to correct the scroll position", function (assert) {
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			iScrollPosition,
			iExpectedPosition,
			done = assert.async();

		setTimeout(function() {
			oObjectPage.scrollToSection("UxAP-objectPageContentScrolling--secondSection", 0);
			setTimeout(function() {
				iScrollPosition = oObjectPage._$opWrapper[0].scrollTop;
				iExpectedPosition =  oObjectPage._oSectionInfo["UxAP-objectPageContentScrolling--subsection2-1"].positionTop;
				assert.ok(isPositionsMatch(iScrollPosition, iExpectedPosition), "scrollPosition is correct");
				done();
			}, 1000); // throttling delay
		}, 1000); //dom calc delay
	});

	QUnit.test("Deleting the above section preserves the selected section position", function (assert) {
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			oFirstSection = this.oObjectPageContentScrollingView.byId("firstSection"),
			oThirdSection = this.oObjectPageContentScrollingView.byId("thirdSection"),
			iScrollPositionAfterRemove,
			iExpectedPositionAfterRemove,
			done = assert.async();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			setTimeout(function () {
				oObjectPage.setSelectedSection(oThirdSection.getId());
			}, 500);
		});

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			setTimeout(function () {
				oObjectPage.removeSection(oFirstSection);
				setTimeout(function () {
					iScrollPositionAfterRemove = Math.ceil(oObjectPage._$opWrapper[0].scrollTop);
					iExpectedPositionAfterRemove = Math.ceil(jQuery("#" + oThirdSection.getId() + " .sapUxAPObjectPageSectionContainer").position().top); // top of third section content
					assert.ok(isPositionsMatch(iScrollPositionAfterRemove, iExpectedPositionAfterRemove), "scrollPosition is correct");
					oFirstSection.destroy();
					done();
				}, 500); // throttling delay
			}, 500); //dom calc delay
		});
	});

	QUnit.test("Deleting the bellow section preserves the scroll position", function (assert) {
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			oSecondSection = this.oObjectPageContentScrollingView.byId("secondSection"),
			oThirdSection = this.oObjectPageContentScrollingView.byId("thirdSection"),
			iScrollPositionBeforeRemove,
			iScrollPositionAfterRemove,
			done = assert.async();

		oObjectPage.setSelectedSection(oSecondSection.getId());

		setTimeout(function() {
			oObjectPage.removeSection(oThirdSection);
			iScrollPositionBeforeRemove = oObjectPage._$opWrapper[0].scrollTop;
			setTimeout(function() {
				iScrollPositionAfterRemove = oObjectPage._$opWrapper[0].scrollTop;
				assert.ok(isPositionsMatch(iScrollPositionAfterRemove, iScrollPositionBeforeRemove), "scrollPosition is preserved");
				oThirdSection.destroy();
				done();
			}, 1000); // throttling delay
		}, 1000); //dom calc delay
	});

	QUnit.test("Should keep ObjectPageHeader in \"Expanded\" mode on initial load", function (assert) {
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			done = assert.async();

		setTimeout(function() {
			assert.ok(!isObjectPageHeaderStickied(oObjectPage), "ObjectHeader is in \"Expanded\" mode");
			done();
		}, 1000); //dom calc delay

	});

	QUnit.test("Should change ObjectPageHeader in \"Stickied\" mode after scrolling to a lower section", function (assert) {
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			done = assert.async();

		setTimeout(function(){
			//Act
			oObjectPage.scrollToSection("UxAP-objectPageContentScrolling--subsection3-1",0,0);
			setTimeout(function() {
				assert.ok(isObjectPageHeaderStickied(oObjectPage), "ObjectHeader is in stickied mode");
				done();
			}, 1000); //scroll delay
		}, 1000); //dom calc delay

	});

	QUnit.test("Should keep ObjectPageHeader in \"Stickied\" mode when scrolling", function (assert) {
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			done = assert.async();

		setTimeout(function(){
			//Act
			oObjectPage.scrollToSection("UxAP-objectPageContentScrolling--subsection3-1",0,0);
			setTimeout(function() {
				assert.ok(isObjectPageHeaderStickied(oObjectPage), "ObjectHeader is in stickied mode");
				oObjectPage.scrollToSection("UxAP-objectPageContentScrolling--firstSection",0,0);
				setTimeout(function() {
					assert.ok(isObjectPageHeaderStickied(oObjectPage), "ObjectHeader is in stickied mode");
					done();
				}, 1000);
			}, 1000); //scroll delay
		}, 1000); //dom calc delay

	});

	QUnit.test("_isClosestScrolledSection should return the first section if all sections are hidden", function (assert) {
		var clock = sinon.useFakeTimers(),
			oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			aSections = oObjectPage.getSections(),
			sFirstSectionId = "UxAP-objectPageContentScrolling--firstSection";

		clock.tick(500);

		for (var section in aSections) {
			aSections[section].setVisible(false);
		}

		assert.strictEqual(oObjectPage._isClosestScrolledSection(sFirstSectionId), true, "Fisrt section is the closest scrolled section");

		clock.restore();
	});

	QUnit.test("ScrollEnablement private API", function (assert) {
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");

		oObjectPage._initializeScroller();

		assert.ok(oObjectPage._oScroller._$Container, "ScrollEnablement private API is OK.");
	});

	QUnit.module("ObjectPage scrolling without view");

	QUnit.test("auto-scroll on resize of last section", function (assert) {
		var oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 2 /* two sections */),
			oLastSection = oObjectPageLayout.getSections()[1],
			oLastSubSection = oLastSection.getSubSections()[0],
			oResizableControl = new HTML({ content: "<div style='height: 100px'></div>"}),
			iScrollTopBeforeResize,
			iScrollTopAfterResize,
			done = assert.async();

		oLastSubSection.addBlock(oResizableControl);
		oObjectPageLayout.setSelectedSection(oLastSection);


		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			setTimeout(function() {
				iScrollTopBeforeResize = oObjectPageLayout._$opWrapper.scrollTop();
				// make the height of the last section smaller
				oResizableControl.getDomRef().style.height = "10px";

				setTimeout(function() {
					iScrollTopAfterResize = oObjectPageLayout._$opWrapper.scrollTop();
					assert.strictEqual(oObjectPageLayout.getSelectedSection(), oLastSection.getId(), "Selection is preserved");
					assert.strictEqual(iScrollTopBeforeResize, iScrollTopAfterResize, "scrollTop is preserved");
					oObjectPageLayout.destroy();
					done();
				}, 500); // allow the page to scroll to the position of the selected section
			}, 500);
		});

		// arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		Core.applyChanges();
	});

	QUnit.test("auto-scroll on resize after layout calculation", function (assert) {
		var oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 2 /* two sections */),
			oLastSection = oObjectPageLayout.getSections()[1],
			oLastSubSection = oLastSection.getSubSections()[0],
			oResizableControl = new HTML({ content: "<div style='height: 100px'></div>"}),
			iScrollTopBeforeResize,
			oSpy = sinon.spy(oObjectPageLayout, "_scrollTo"),
			done = assert.async();

		oLastSubSection.addBlock(oResizableControl);
		oObjectPageLayout.setSelectedSection(oLastSection);


		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			setTimeout(function() {
				// make the height of the last section bigger
				oResizableControl.getDomRef().style.height = "1000px";
				oObjectPageLayout._requestAdjustLayout(true);


				iScrollTopBeforeResize = oObjectPageLayout._$opWrapper.scrollTop();
				// make the height of the last section smaller
				oResizableControl.getDomRef().style.height = "10px";

				oSpy.reset();
				oObjectPageLayout._onScroll({ target: { scrollTop: 0 }}); // call synchronously to avoid another timeout
				assert.strictEqual(oObjectPageLayout.getSelectedSection(), oLastSection.getId(), "Selection is preserved");
				assert.ok(oSpy.calledWith(iScrollTopBeforeResize), "scrollTop is preserved");
				oObjectPageLayout.destroy();
				done();
			}, 500);
		});

		// arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		Core.applyChanges();
	});

	QUnit.test("content size correctly calculated", function (assert) {
		var oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 2 /* two sections */),
			oFirstSection = oObjectPageLayout.getSections()[0],
			oLastSection = oObjectPageLayout.getSections()[1],
			iFirstSectionSpacerHeight,
			iLastSectionSpacerHeight,
			oBigHeightControl = new HTML({ content: "<div style='height: 500px'></div>"}),
			oSmallHeightControl = new HTML({ content: "<div style='height: 100px'></div>"}),
			done = assert.async();

		oObjectPageLayout.setUseIconTabBar(true);
		oFirstSection.getSubSections()[0].addBlock(oBigHeightControl);
		oLastSection.getSubSections()[0].addBlock(oSmallHeightControl);

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			setTimeout(function() {
				iFirstSectionSpacerHeight = oObjectPageLayout._$spacer.get(0).offsetHeight;

				// show the bigger section
				oObjectPageLayout.setSelectedSection(oLastSection.getId());

				setTimeout(function () {

					// assert context
					iLastSectionSpacerHeight = oObjectPageLayout._$spacer.get(0).offsetHeight;
					assert.notEqual(iLastSectionSpacerHeight, iFirstSectionSpacerHeight, "spacer for smaller section is different");

					//Act: return to initial section
					oObjectPageLayout.setSelectedSection(oFirstSection.getId());

					setTimeout(function () {

						// Check: spacer is correctly restored
						assert.ok(oObjectPageLayout._$spacer.get(0).offsetHeight === iFirstSectionSpacerHeight, "spacer height is correct");
						oObjectPageLayout.destroy();
						done();
					}, 10);
				}, 10);
			}, 500);
		});

		// arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		Core.applyChanges();
	});

	// ensure that appending the anchorBar does not change the scrollTop,
	// as it may happen in certain cases (if another part of content freshly rerendered (BCP: 1870365138)
	QUnit.test("_moveAnchorBarToContentArea preserves the page scrollTop", function (assert) {
		var oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 2 /* two sections */),
			oFirstSection = oObjectPageLayout.getSections()[0],
			oLastSection = oObjectPageLayout.getSections()[1],
			done = assert.async();

		oObjectPageLayout.setSelectedSection(oLastSection);

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {

			var iScrollTopBefore = oObjectPageLayout.getDomRef().scrollTop;

			// act
			oFirstSection.rerender();
			oObjectPageLayout._moveAnchorBarToContentArea();

			assert.strictEqual(oObjectPageLayout.getDomRef().scrollTop, iScrollTopBefore, "scrollTop is preserved");
			oObjectPageLayout.destroy();
			done();
		});

		// arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		Core.applyChanges();
	});

	QUnit.test("no scrollbar on unsnap if not needed", function (assert) {
		var oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 1 /* single section */),
			oRequestAdjustLayoutSpy = sinon.spy(oObjectPageLayout, "_requestAdjustLayout"),
			done = assert.async();

		oObjectPageLayout.setHeaderTitle(oFactory.getDynamicPageTitle());
		oObjectPageLayout.addHeaderContent(new sap.m.Panel({height: "100px"}));

		function hasScrollbar() {
			var oScrollContainer = oObjectPageLayout._$opWrapper.get(0);
			return oScrollContainer.scrollHeight > oScrollContainer.offsetHeight;
		}

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {

			// Setup: snap the header to cause scrollbar to appear
			// (as ObjectPage snaps by scrolling the header out of view)
			oObjectPageLayout._snapHeader(true);
			assert.strictEqual(hasScrollbar(), true, "has scrollbar");
			oRequestAdjustLayoutSpy.reset();

			// Act: unsnap the snapped header
			oObjectPageLayout._expandHeader(false);

			// Check
			assert.strictEqual(oRequestAdjustLayoutSpy.called, true, "layout recalculation called");
			// call explicitly *with no delay* to save timeout in this test
			oObjectPageLayout._requestAdjustLayout(true);
			assert.strictEqual(hasScrollbar(), false, "no more scrollbar");

			oObjectPageLayout.destroy();
			done();
		});

		// arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		Core.applyChanges();
	});

	QUnit.module("ObjectPage On Title Press when Header height bigger than page height", {
		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithDynamicBigHeaderContent();
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("ObjectPage On Title Press", function (assert) {
		var oObjectPage = this.oObjectPage,
			oTitle = oObjectPage.getHeaderTitle(),
			oScrollSpy = sinon.spy(oObjectPage, "_scrollTo"),
			done = assert.async();


		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			// check setup:
			assert.equal(oObjectPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true, "header is bigger than allowed to be expanded in title");

			// setup: scroll to a position where the header is snapped
			oObjectPage._scrollTo(950);
			setTimeout(function() {
				oScrollSpy.reset();

				//act
				oTitle.fireEvent("_titlePress");
				assert.equal(oObjectPage._bHeaderInTitleArea, false, "Header is not added to the title");
				assert.ok(oScrollSpy.calledWith(0, 0), "scroll position is correct");
				done();
			}, 500); //allow the page to scroll to the required position
		});

		helpers.renderObject(oObjectPage);
		oObjectPage.$().outerHeight("800px"); // set page height smaller than header height
	});

	QUnit.test("expand shows the visual indicator", function (assert) {
		var oObjectPage = this.oObjectPage,
			oExpandButton = oObjectPage.getHeaderTitle()._getExpandButton(),
			oScrollSpy = sinon.spy(oObjectPage, "_scrollBelowCollapseVisualIndicator"),
			done = assert.async();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			// check setup:
			assert.equal(oObjectPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true, "header is bigger than allowed to be expanded in title");

			// setup: scroll to a position where the header is snapped
			oObjectPage._scrollTo(950);
			setTimeout(function() {
				oScrollSpy.reset();

				//act: expand via the 'expand' visual indicator
				oExpandButton.firePress();

				// check scroll adjustment called
				assert.strictEqual(oScrollSpy.callCount, 1, "executed scroll to show the visual indicator");
				done();
			}, 500); //allow the page to scroll to the required position
		});

		helpers.renderObject(oObjectPage);
		oObjectPage.$().outerHeight("800px"); // set page height smaller than header height
	});

	QUnit.test("_getClosestScrolledSectionId anchorBar mode", function (assert) {
		var done = assert.async();
		XMLView.create({
			id: "UxAP-objectPageContentScrolling",
			viewName: "view.UxAP-ObjectPageContentScrolling"
		}).then(function (oView) {
			this.oObjectPageContentScrollingView = oView;
			this.oObjectPageContentScrollingView.placeAt('qunit-fixture');
			Core.applyChanges();

			var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
				oFirstSubSection = oObjectPage.getSections()[0].getSubSections()[0],
				oSecondSubSection = oObjectPage.getSections()[0].getSubSections()[0],
				iFirstSubSectionScrollTop,
				iSecondSubSectionScrollTop,
				iPageHeight;

			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				iPageHeight = oObjectPage.getDomRef().offsetHeight;
				iFirstSubSectionScrollTop = oObjectPage._computeScrollPosition(oFirstSubSection);
				iSecondSubSectionScrollTop = oObjectPage._computeScrollPosition(oSecondSubSection);

				assert.strictEqual(oObjectPage._getClosestScrolledSectionId(iFirstSubSectionScrollTop + 10, iPageHeight, true /* subsections only */), oFirstSubSection.getId(), "first subsection is closest");
				assert.strictEqual(oObjectPage._getClosestScrolledSectionId(iSecondSubSectionScrollTop + 10, iPageHeight, true /* subsections only */), oSecondSubSection.getId(), "second subsection is closest");
				this.oObjectPageContentScrollingView.destroy();
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("_getClosestScrolledSectionId tabs mode", function (assert) {
		var done = assert.async();
		XMLView.create({
			id: "UxAP-objectPageContentScrolling",
			viewName: "view.UxAP-ObjectPageContentScrolling"
		}).then(function (oView) {
			this.oObjectPageContentScrollingView = oView;
			this.oObjectPageContentScrollingView.placeAt('qunit-fixture');
			Core.applyChanges();

			var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
				oSecondSection = oObjectPage.getSections()[1],
				oSecondSectionFirstSubSection = oSecondSection.getSubSections()[0],
				oSecondSectionSecondSubSection = oSecondSection.getSubSections()[0],
				iFirstSubSectionScrollTop,
				iSecondSubSectionScrollTop,
				iPageHeight;

			// select the second visible tab
			oObjectPage.setSelectedSection();

			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				iPageHeight = oObjectPage.getDomRef().offsetHeight;
				iFirstSubSectionScrollTop = oObjectPage._computeScrollPosition(oSecondSectionFirstSubSection);
				iSecondSubSectionScrollTop = oObjectPage._computeScrollPosition(oSecondSectionSecondSubSection);

				assert.strictEqual(oObjectPage._getClosestScrolledSectionId(iFirstSubSectionScrollTop + 10, iPageHeight, false /* sections only */), oSecondSection.getId(), "second section is closest");
				assert.strictEqual(oObjectPage._getClosestScrolledSectionId(iFirstSubSectionScrollTop + 10, iPageHeight, true /* subsections only */), oSecondSectionFirstSubSection.getId(), "first subsection is closest");
				assert.strictEqual(oObjectPage._getClosestScrolledSectionId(iSecondSubSectionScrollTop + 10, iPageHeight, true /* subsections only */), oSecondSectionSecondSubSection.getId(), "second subsection is closest");
				this.oObjectPageContentScrollingView.destroy();
				done();
			}.bind(this));
		}.bind(this));
	});

	function isObjectPageHeaderStickied(oObjectPage) {
		var oHeaderTitle = document.getElementById(oObjectPage.getId() + "-headerTitle");
		var oHeaderContent = document.getElementById(oObjectPage.getId() + "-headerContent");
		return oHeaderTitle.classList.contains("sapUxAPObjectPageHeaderStickied") &&
				oHeaderContent.classList.contains("sapUxAPObjectPageHeaderDetailsHidden") &&
				oHeaderContent.style["overflow"] == "hidden";
	}

	function isPositionsMatch(iPos, iPos2) {
		var iAcceptableOffset = Device.browser.edge ? 1 : 0;
		return Math.abs(iPos - iPos2) <= iAcceptableOffset;
	}

});
