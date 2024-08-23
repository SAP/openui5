/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageDynamicHeaderTitle",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/Panel",
	"sap/m/VBox",
	"sap/uxap/testblocks/GenericDiv",
	"sap/ui/Device",
	"sap/ui/core/mvc/XMLView",
	"sap/uxap/library"
],
function(nextUIUpdate, ObjectPageSubSection, ObjectPageSection, ObjectPageLayout, ObjectPageDynamicHeaderTitle, Button, Text, Title, Panel, VBox, GenericDiv, Device, XMLView, lib) {

	"use strict";

	//eslint-disable-next-line no-void
	const makeVoid = (fn) => (...args) => void fn(...args);

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
		generateObjectPageWithDynamicHeaderTitle: function() {
			var oHeaderContent = new Panel({ height: "99.3px"}),
				oObjectPage = this.generateObjectPageWithContent(oFactory, 5);

			oObjectPage.setHeaderTitle(oFactory.getDynamicPageTitle());
			oObjectPage.addHeaderContent(oHeaderContent);
			return oObjectPage;
		},
		renderObject: async function (oSapUiObject) {
			oSapUiObject.placeAt("qunit-fixture");
			await nextUIUpdate();
			return oSapUiObject;
		},
		getSectionAnchor: function(oSection) {
			var oObjectPage = oSection.getParent(),
				aResult = oObjectPage._oABHelper._getAnchorBar().getItems().filter(function(oItem) {
				return oItem.getKey() === oSection.getId();
			});
			return aResult.length && aResult[0];
		}
	};

	/**
	 * In some tests that are using fake timers, it might happen that a rendering task is queued by
	 * creating a fake timer. Without an appropriate clock.tick call, this timer might not execute
	 * and a later nextUIUpdate with real timers would wait endlessly.
	 * To prevent this, after each such test a sync rendering is executed which will clear any pending
	 * fake timer. The rendering itself should not be needed by the tests, if they are properly
	 * isolated.
	 *
	 * This function is used as an indicator for such cases. It's just a wrapper around nextUIUpdate.
	 */
	function clearPendingUIUpdates(clock) {
		return nextUIUpdate(clock);
	}

	QUnit.module("ObjectPage Content scroll visibility", {
		beforeEach: function (assert) {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 10);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("sectionChange event is fired upon scrolling", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oSection = oObjectPage.getSections()[9],
			fnDone = assert.async();

		oObjectPage.attachEventOnce("sectionChange", function(oEvent) {
			assert.equal(oEvent.getParameter("section").getId(), oSection.getId(), "sectionChange event is fired upon scrolling to a specified section");
			fnDone();
		});

		// act
		await helpers.renderObject(oObjectPage);
		oObjectPage.setSelectedSection(oSection);
	});

	QUnit.test("sectionChange event is fired with correct parameters", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oSection = oObjectPage.getSections()[9],
			fnDone = assert.async();

		this.stub(this.oObjectPage, "_getClosestScrolledSectionBaseId").callsFake(function(oSection) {
			return oObjectPage.getSections()[9].getSubSections()[0].getId(); // return a subSection of the scrolled section
		});

		oObjectPage.attachSectionChange(function(oEvent) {
			assert.equal(oEvent.getParameter("section").getId(), oSection.getId(), "correct section parameter");
			fnDone();
		});

		// act
		await helpers.renderObject(oObjectPage);
		oObjectPage.setSelectedSection(oSection);
	});

	QUnit.module("scroll position", {
		beforeEach: function () {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 10);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("correct scroll position of section with hidden title", async function(assert) {
		var oObjectPage = this.oObjectPage,
			oFirstSection = oObjectPage.getSections()[0],
			done = assert.async();

		oObjectPage.addEventDelegate({
			onBeforeRendering:function(){
				oObjectPage._bStickyAnchorBar = true;//force init rendering with snapped header
				oObjectPage._bHeaderExpanded = false;
			}
		});

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function(){
			//act
			var iPosTop = oObjectPage._computeScrollPosition(oFirstSection),
			iOffsetTop = oFirstSection.getDomRef().offsetTop;

			assert.strictEqual(iPosTop ,iOffsetTop ,"corrected scroll position");
			done();
		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("_restoreScrollPosition restores position within subSection", function (assert) {
		// Mock data values
		var oSelectedSection = this.oObjectPage.getSections()[1],
			oStoredSubSection = oSelectedSection.getSubSections()[0],
			storedSubSectionPositionTop = 200,
			iOffsetWithinStoredSubSection = 20,
			oScrollSpy = this.spy(this.oObjectPage, "_scrollTo");


		// Setup: Select section
		this.oObjectPage.setSelectedSection(oSelectedSection);
		// Setup: Mock the effect of _storeScrollLocation with oStoredSubSection
		this.oObjectPage._oStoredScrolledSubSectionInfo.sSubSectionId = oStoredSubSection.getId();
		this.oObjectPage._oStoredScrolledSubSectionInfo.iOffset = iOffsetWithinStoredSubSection;
		// Setup: Mock the position of the stored subSection
		this.stub(this.oObjectPage, "_computeScrollPosition").callsFake(function(oSection) {
			return storedSubSectionPositionTop; // mock a specific scroll position of a section
		});
		// Setup: Mock the validity of the stored subSection
		this.stub(this.oObjectPage, "_sectionCanBeRenderedByUXRules").returns(true);

		// act
		this.oObjectPage._restoreScrollPosition();

		// check
		assert.ok(oScrollSpy.calledWithMatch(storedSubSectionPositionTop + iOffsetWithinStoredSubSection),
			"correct scroll position is restored");
	});

	QUnit.test("_isClosestScrolledSection indentifies subSections ",function(assert) {
		var oObjectPage = this.oObjectPage,
			oFirstSection = oObjectPage.getSections()[0],
			oFirstSubSection = oFirstSection.getSubSections()[0];

		this.stub(oObjectPage, "_getClosestScrolledSectionBaseId").returns(oFirstSubSection.getId());

		assert.ok(oObjectPage._isClosestScrolledSection(oFirstSection.getId()), "itentified current section");
	});

	QUnit.test("selectedSection value correct after resize content in scroll overflow", async function(assert) {
		var oObjectPage = this.oObjectPage,
			oFirstSection = oObjectPage.getSections()[0],
			oFirstSubSection = oFirstSection.getSubSections()[0],
			sSelectedSectionId = oObjectPage.getSections()[3].getId(),
			item1 = new Button({text: "content", visible: false}),
			item2 = new Button({text: "content", visible: false}),
			item3 = new Button({text: "content", visible: false}),
			iScrollTopBeforeChange,
			iExpectedScrollTopAfterChange,
			done = assert.async();

			oFirstSubSection.addBlock(new VBox({
				items: [item1, item2, item3]
			}));

		// Setup: select a section lower than the first
		oObjectPage.setSelectedSection(sSelectedSectionId);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", makeVoid(async function(){
			iScrollTopBeforeChange = oObjectPage._$opWrapper.scrollTop();

			//Act: change the height of the content inside the scroll overflow
			//(i.e. the content above above the current scroll position)
			item1.setVisible(true);
			item2.setVisible(true);
			item3.setVisible(true);
			await nextUIUpdate();

			// Simulate the expected scroll event from the browser, due to overflow anchoring
			// (expected from all supported browsers except Safari which does not support overflow anchoring => does not fire scroll event)
			if (!Device.browser.safari) {
				iExpectedScrollTopAfterChange = iScrollTopBeforeChange + (3 * item1.getDomRef().offsetHeight);
				// synchronously call the result of the expected scroll event
				// the browser fires that scroll event because the position of the selected section changed
				oObjectPage._updateSelectionOnScroll(iExpectedScrollTopAfterChange);
				// the page internally sets a wrong selected section
				// because we do not yet update the cached positions of the sections
				assert.notEqual(oObjectPage.getSelectedSection() , sSelectedSectionId, "selected section has changed");

				// act: request the page to update the positions of the sections and check its current selected section
				oObjectPage.triggerPendingLayoutUpdates();
			}

			assert.strictEqual(oObjectPage.getSelectedSection() , sSelectedSectionId, "selected section is correct");
			done();
		}));

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("triggerPendingLayoutUpdates is called on before rendering", async function(assert) {
		var oObjectPage = this.oObjectPage,
			sSelectedSectionId = oObjectPage.getSections()[1].getId(),
			iScrollTop,
			oSpy = this.spy(oObjectPage, "triggerPendingLayoutUpdates"),
			done = assert.async();

		// Setup: select a section lower than the first
		oObjectPage.setSelectedSection(sSelectedSectionId);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function(){
			iScrollTop = oObjectPage._$opWrapper.scrollTop();
			oSpy.reset();

			// synchronously call the result of a scroll event that
			// the browser fires when the position of the selected section changed
			oObjectPage._updateSelectionOnScroll(iScrollTop + 100);
			// the page internally sets a wrong selected section
			// because on scroll we do not yet update the cached positions of the sections
			assert.notEqual(oObjectPage.getSelectedSection() , sSelectedSectionId, "selected section has changed");

			// act: trigger rerendering while an incorrect selected section is set
			oObjectPage.onBeforeRendering();
			assert.strictEqual(oSpy.callCount, 1, "selected section is updated");
			done();
		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.module("Scroll to snap", {
		beforeEach: function (assert) {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 2);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("spacer sufficient to snap with scroll", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oWrapperDom,
			iMaxScrollHeight,
			done = assert.async();

		oObjectPage.setHeight("999.1px");
		oObjectPage.setUseIconTabBar(true);
		oObjectPage.addHeaderContent(new Panel({height: "50.2px"}));

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			// act
			oObjectPage._snapHeader(true /*keep header in content area */);
				oWrapperDom = oObjectPage._$opWrapper.get(0);
				iMaxScrollHeight = oWrapperDom.scrollHeight - oWrapperDom.clientHeight;

			assert.ok(iMaxScrollHeight >= oObjectPage._getSnapPosition(), "enough space to allow scroll");
			done();
		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.test("no cut-off snap/pin buttons", async function (assert) {
		var oObjectPage = this.oObjectPage,
			iSnapPosition,
			iScrollTop,
			iButtonOffsetTop,
			oHeader,
			done = assert.async();

		oObjectPage.setHeaderTitle(oFactory.getDynamicPageTitle());

		oObjectPage.addHeaderContent(new Panel({height: "50.2px"}));

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			iSnapPosition = oObjectPage._getSnapPosition().toString();
			oHeader = oObjectPage._getHeaderContent();

			// assert initial setup (in the context of which the final check is valid)
			assert.notEqual(getComputedStyle( oHeader.getDomRef()).position, "static", "the header is css-positioned");
			assert.notEqual(getComputedStyle( oObjectPage._$opWrapper.get(0)).position, "static", "the scroll-container is css-positioned");

			// Act:
			// scroll just before snap
			// so that only the bottom-most area of the headerContent is visible
			oObjectPage._scrollTo(iSnapPosition - 5);

			// Check:
			// obtain the amount of top pixels that are in the overflow (i.e. pixels that are scrolled out of view)
			iScrollTop = oObjectPage._$opWrapper.scrollTop();
			// obtain the distance of the expand button from the top of the scrollable content
			iButtonOffsetTop = oHeader._getCollapseButton().getDomRef().offsetTop + oHeader.getDomRef().offsetTop;
			assert.ok(iButtonOffsetTop >= iScrollTop, "snap button is not in the overflow");
			done();
		});

		await helpers.renderObject(oObjectPage);
	});

	QUnit.module("Expand header");

	QUnit.test("Header expand works, when scrolled header has height with fraction value", async function(assert) {
		// Arrange
		var oObjectPage = helpers.generateObjectPageWithDynamicHeaderTitle(),
			aSections = oObjectPage.getSections(),
			oLastSection = aSections[aSections.length - 1],
			oExpandButton,
			done = assert.async();

		assert.expect(2);

		oObjectPage.placeAt('qunit-fixture');
		await nextUIUpdate();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			oObjectPage.scrollToSection(oLastSection.getId(), 0);

			setTimeout(function () {
				// Assert
				assert.strictEqual(oObjectPage._bHeaderExpanded, false, "Header is snapped after scroll");

				// Act
				oExpandButton = oObjectPage.getHeaderTitle()._getExpandButton();
				oExpandButton.firePress();

				// Check
				setTimeout(function () {
					assert.strictEqual(oObjectPage._bHeaderExpanded, true, "Header is expanded after pressing expand button");
					done();
				}, 1000);
			}, 500);

		});
	});

	QUnit.test("Header expanded in title-area remains expanded upon switching tabs", async function(assert) {
		// Arrange
		var oObjectPage = helpers.generateObjectPageWithDynamicHeaderTitle(),
			aSections = oObjectPage.getSections(),
			oFirstSection = aSections[0],
			oSecondSection = aSections[1],
			oExpandButton,
			done = assert.async();

		oSecondSection.addSubSection(oFactory.getSubSection(1, oFactory.getBlocks()));
		oObjectPage.setUseIconTabBar(true);

		assert.expect(3);

		oObjectPage.placeAt('qunit-fixture');
		await nextUIUpdate();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			// step 1 of setup: Scroll to a non-first section to snap the header
			oObjectPage.scrollToSection(oSecondSection.getSubSections()[1].getId(), 0);
			// call the scroll handler synchronously to save a timeout
			oObjectPage._onScroll({target: {scrollTop: oObjectPage._computeScrollPosition(oSecondSection.getSubSections()[1])}});
			// Assert precondition
			assert.strictEqual(oObjectPage._bHeaderExpanded, false, "Header is snapped after scroll");

			// step 2 of setup: Expand the header by pressing the expand button
			oExpandButton = oObjectPage.getHeaderTitle()._getExpandButton();
			oExpandButton.firePress();
			// Assert precondition
			assert.strictEqual(oObjectPage._bHeaderExpanded, true, "Header is expanded after pressing expand button");

			// step 3 of setup: Select a new tab
			oObjectPage.scrollToSection(oFirstSection.getId(), 0);
			// call the scroll handler synchronously to save a timeout
			oObjectPage._onScroll({target: {scrollTop: oObjectPage._computeScrollPosition(oFirstSection)}});

			// Check
			assert.strictEqual(oObjectPage._bHeaderExpanded, true, "Header remains expanded");
			done();
		});
	});

	QUnit.test("Scrolls to correct Section when header is expanded", async function(assert) {
		// Arrange
		var oObjectPage = helpers.generateObjectPageWithDynamicHeaderTitle(),
			aSections = oObjectPage.getSections(),
			oLastSection = aSections[aSections.length - 1],
			oExpandButton,
			done = assert.async();

		assert.expect(1);

		oObjectPage.setSelectedSection(aSections[3]);
		oObjectPage.placeAt('qunit-fixture');
		await nextUIUpdate();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			// Act - expand header and scroll to last Section
			oExpandButton = oObjectPage.getHeaderTitle()._getExpandButton();
			oExpandButton.firePress();
			oObjectPage.scrollToSection(oLastSection.getId(), 0);

			setTimeout(function () {
				// Assert - check the delta between current scroll position and the top position of the scrolled to Section, due to rounding diffs (1px diff is OK)
				assert.ok(Math.abs(oObjectPage._$opWrapper.scrollTop() - oObjectPage._oSectionInfo[oLastSection.getId()].positionTop) < 2,
					"Scroll position is correct");
				done();
			}, 1000);

		});
	});

	QUnit.module("ObjectPage Content scrolling", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-objectPageContentScrolling",
				viewName: "view.UxAP-ObjectPageContentScrolling"
			}).then(async function(oView) {
				this.oObjectPageContentScrollingView = oView;
				this.oObjectPageContentScrollingView.placeAt('qunit-fixture');
				await nextUIUpdate();
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
			assert.strictEqual(oObjectPage._$opWrapper[0].scrollTop, iExpectedPosition, "Assert section: \"" + section + "\" position: " + iExpectedPosition);
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
			ObjectPageLayout.prototype._moveAnchorBarToTitleArea.apply(oObjectPage, arguments);
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

	QUnit.test("Failure to scroll resumes lazy loading", function (assert) {

		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			oTargetSection = oObjectPage.getSections()[2],
			sTargetSectionId = oTargetSection.getId(),
			oSuppressSpy,
			done = assert.async();

		//Setup
		oObjectPage.setEnableLazyLoading(true);
		this.stub(oObjectPage, "_resumeLazyLoading").callsFake(function () {
			// Assert
			assert.ok(true, "lazy loading is resumed");
			done();
		});

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", makeVoid(async function() {
			oSuppressSpy = this.spy(oObjectPage._oLazyLoading, "suppress");

			// initiate scroll that involves supression of lazy loading
			oObjectPage.scrollToSection(sTargetSectionId);
			assert.equal(oSuppressSpy.callCount, 1, "lazy loading is suppressed");

			// Act: change the DOM structure in a way
			// that prevents the animation to end normally
			oTargetSection.destroy();
			await nextUIUpdate();
		}.bind(this)));

	});

	QUnit.test("Rerendering the page preserves the scroll position", function (assert) {
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			oSecondSection = this.oObjectPageContentScrollingView.byId("secondSection"),
			oStoreSpy = this.spy(oObjectPage, "_storeScrollLocation"),
			oRestoreSpy = this.spy(oObjectPage, "_restoreScrollPosition"),
			oScrollSpy = this.spy(oObjectPage, "_scrollTo"),
			iScrollPositionBeforeRerender,
			iExpectedScrollPositionAfterRerender,
			done = assert.async();

		oObjectPage.setSelectedSection(oSecondSection.getId());

		assert.expect(3);

		setTimeout(async function() {
			iScrollPositionBeforeRerender = oObjectPage._$opWrapper[0].scrollTop;
			iExpectedScrollPositionAfterRerender = Math.ceil(iScrollPositionBeforeRerender); //the page ceils the obtained DOM positions

			oObjectPage.addEventDelegate({ onBeforeRendering: function() {
					assert.ok(oStoreSpy.called, "_storeScrollLocation is called on beforeRenderingf");
				}});

			oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
				assert.ok(oRestoreSpy.called, "_restoreScrollPosition is called on afterRendering");
				assert.ok(oScrollSpy.calledWithMatch(iExpectedScrollPositionAfterRerender), "scroll position is preserved");
				done();
			});
			oObjectPage.invalidate();
			await nextUIUpdate();
		}, 1000); //dom calc delay
	});

	QUnit.test("Scroll position is preserved upon insertion of another section", function (assert) {

		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			oFirstSection = oObjectPage.getSections()[0],
			oSecondSection = oObjectPage.getSections()[1],
			oScrollSpy = this.spy(oObjectPage, "_scrollTo"),
			iExpectedScrollTopAfterRendering,
			done = assert.async();

		// setup: hide the first visible section so that the next visible is selected
		oFirstSection.setVisible(false);

		setTimeout(function() {

			oFirstSection.setVisible(true);
			oScrollSpy.resetHistory();
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
			sTargetSectionId = "UxAP-objectPageContentScrolling--secondSection",
			done = assert.async();

		setTimeout(function() {
			oObjectPage.scrollToSection(sTargetSectionId, 0);
			setTimeout(function() {
				iScrollPosition = Math.ceil(oObjectPage._$opWrapper[0].scrollTop);
				iExpectedPosition =  oObjectPage._oSectionInfo[sTargetSectionId].positionTop;
				assert.strictEqual(iScrollPosition, iExpectedPosition, "scrollPosition is correct");
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
			oObjectPage.setSelectedSection(oThirdSection.getId());
			setTimeout(function () {
				oObjectPage.removeSection(oFirstSection);
				setTimeout(function () {
					iScrollPositionAfterRemove = Math.ceil(oObjectPage._$opWrapper[0].scrollTop);
					iExpectedPositionAfterRemove = oObjectPage._oSectionInfo[oThirdSection.getId()].positionTop; // top of third section
					assert.strictEqual(iScrollPositionAfterRemove, iExpectedPositionAfterRemove, "scrollPosition is correct");
					oFirstSection.destroy();
					done();
				}, 1000); // throttling delay
			}, 1000); //dom calc delay
		});
	});

	QUnit.test("Deleting the below section preserves the scroll position", function (assert) {
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
				assert.strictEqual(iScrollPositionAfterRemove, iScrollPositionBeforeRemove, "scrollPosition is preserved");
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

	QUnit.test("Should keep the AnchorBar scrolled to the selected Section when title is snapped", async function(assert) {
		// Arrange
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			oObjectPageSection = new ObjectPageSection({
				subSections: [
				new ObjectPageSubSection({
					blocks: [new GenericDiv({height: "1500px"})]
				}),
				new ObjectPageSubSection({
					blocks: [new GenericDiv({height: "200px"})]
				})
			]
			}),
			sSectionId = oObjectPageSection.getId(),
			oAnchorBar = oObjectPage._oABHelper._getAnchorBar(),
			done = assert.async();

		assert.expect(2);

		oObjectPage.setUseIconTabBar(true);
		oObjectPage.addSection(oObjectPageSection);
		await nextUIUpdate();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function () {
			//Act
			oObjectPage.setSelectedSection(sSectionId);

			setTimeout(function() {
				//Act
				oObjectPage._scrollTo(oObjectPage._getSnapPosition() + 100);

				setTimeout(function() {
					// Assert
					assert.ok(isObjectPageHeaderStickied(oObjectPage), "ObjectHeader is in stickied mode");
					assert.strictEqual(oAnchorBar.getSelectedKey(), sSectionId, "the section is selected in the anchorBar");
					done();
				}, 1000); //scroll delay

			}, 1000); //scroll delay

		});
	});

	QUnit.test("_isClosestScrolledSection should return the first section if all sections are hidden", async function (assert) {
		var clock = sinon.useFakeTimers(),
			oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			aSections = oObjectPage.getSections(),
			sFirstSectionId = "UxAP-objectPageContentScrolling--firstSection";

		clock.tick(500);

		for (var section in aSections) {
			aSections[section].setVisible(false);
		}

		assert.strictEqual(oObjectPage._isClosestScrolledSection(sFirstSectionId), true, "Fisrt section is the closest scrolled section");

		await clearPendingUIUpdates(clock);
		clock.restore();
	});

	QUnit.test("_getClosestScrolledSectionBaseId identifies target subSection", function (assert) {
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			oTargetSection = this.oObjectPageContentScrollingView.byId("secondSection"),
			oTargetSubSection = oTargetSection.getSubSections()[1],
			iTargetSubSectionScrollPosition,
			iPageHeight,
			sClosestSectionId,
			done = assert.async();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			iPageHeight = oObjectPage.getDomRef().offsetHeight;
			iTargetSubSectionScrollPosition = oObjectPage._computeScrollPosition(oTargetSubSection);
			sClosestSectionId = oObjectPage._getClosestScrolledSectionBaseId(iTargetSubSectionScrollPosition, iPageHeight, true);
			assert.equal(sClosestSectionId, oTargetSubSection.getId(), "target subSection is recognized");
			done();
		});
	});


	QUnit.test("_getClosestScrolledSectionBaseId identifies target subSection with rounding pixels tolerance", function (assert) {
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			oTargetSection = this.oObjectPageContentScrollingView.byId("secondSection"),
			oTargetSubSection = oTargetSection.getSubSections()[1],
			iTargetSubSectionScrollPosition,
			iPageHeight,
			sClosestSectionId,
			done = assert.async();

		oObjectPage.scrollToSection(oTargetSubSection.getId());

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			iPageHeight = oObjectPage.getDomRef().offsetHeight;
			// Simulating rounding down issue of the current scroll position
			iTargetSubSectionScrollPosition = oObjectPage._computeScrollPosition(oTargetSubSection) - 1;
			sClosestSectionId = oObjectPage._getClosestScrolledSectionBaseId(iTargetSubSectionScrollPosition, iPageHeight, true);
			assert.equal(sClosestSectionId, oTargetSubSection.getId(), "target subSection is recognized");
			done();
		});
	});

	QUnit.test("_getClosestScrolledSectionBaseId returns null if current section is destroyed", function (assert) {
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			oTargetSection = this.oObjectPageContentScrollingView.byId("secondSection"),
			oTargetSubSection = oTargetSection.getSubSections()[1],
			iTargetSubSectionScrollPosition,
			iPageHeight,
			sClosestSectionId,
			done = assert.async();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			oObjectPage.scrollToSection(oTargetSubSection.getId(), 0);
			iPageHeight = oObjectPage.getDomRef().offsetHeight;
			iTargetSubSectionScrollPosition = oObjectPage._computeScrollPosition(oTargetSubSection);

			//Act
			oTargetSection.destroy();

			sClosestSectionId = oObjectPage._getClosestScrolledSectionBaseId(iTargetSubSectionScrollPosition, iPageHeight, true);
			assert.equal(sClosestSectionId, null, "target subSection is recognized");
			done();
		});
	});

	QUnit.test("Upon scrolling 'subSectionEnteredViewPortEvent' is fired after '_connectModelsForSections' is called", async function(assert) {
		// Arrange
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			done = assert.async(),
			oStub = this.stub(oObjectPage, "_connectModelsForSections").callsFake(function () {
				// Assert
				assert.ok(oSpy.notCalled, "subSectionEnteredViewPortEvent is not fired before _connectModelsForSections");

				oStub.restore();
				return Promise.all([]);
			}),
			oSpy;

		oObjectPage.setEnableLazyLoading(true);
		await nextUIUpdate();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			oSpy = this.spy(oObjectPage, "_fireSubSectionEnteredViewPortEvent");

			//Act
			oObjectPage.scrollToSection("UxAP-objectPageContentScrolling--subsection3-1",0,0);

			setTimeout(function() {
				//Assert
				assert.ok(oSpy.called, "subSectionEnteredViewPortEvent is fired after _connectModelsForSections");

				// Clean up
				done();
			}, 1000); //scroll delay
		}.bind(this));
	});

	QUnit.test("ScrollEnablement private API", function (assert) {
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout");

		oObjectPage._initializeScroller();

		assert.ok(oObjectPage._oScroller._$Container, "ScrollEnablement private API is OK.");
	});

	QUnit.test("Section position top", function (assert) {
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			oSection = oObjectPage.getSections()[1],
			$mobileAnchor,
			iPositionTopBefore,
			iPositionTopAfter,
			fnCheckPosition = function() {
				$mobileAnchor = oSection.$("header");
				iPositionTopBefore = lib.Utilities.getChildPosition($mobileAnchor, oObjectPage._$contentContainer).top;

				// Act
				oObjectPage.getDomRef().style.position = "relative";
				iPositionTopAfter = lib.Utilities.getChildPosition($mobileAnchor, oObjectPage._$contentContainer).top;

				// Check
				assert.strictEqual(iPositionTopBefore, iPositionTopAfter, "position within contentContainer is still correct");
				done();
			},
			done = assert.async();
		if (oObjectPage.isActive()) {
			fnCheckPosition();
		} else {
			oObjectPage.addEventDelegate({
				onAfterRendering: fnCheckPosition
			});
		}
	});

	QUnit.test("ScrollToElement", function (assert) {
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			oSection2 = oObjectPage.getSections()[1],
			done = assert.async();
		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			var $Section2TTitle = oSection2.$().find('.sapUxAPObjectPageSectionTitle');

			assert.ok($Section2TTitle.length, "element exists");

			// Act
			oObjectPage.getScrollDelegate().scrollToElement($Section2TTitle.get(0));
			oObjectPage._onScroll({ target: { scrollTop: oObjectPage._$opWrapper.scrollTop()}});

			// Check
			assert.ok(oSection2.getDomRef().offsetTop + $Section2TTitle.get(0).offsetTop >= Math.round(oObjectPage._$opWrapper.scrollTop()),
				"element is visible");
			done();
		});

	});

	QUnit.test("Modify structure during scroll", function (assert) {
		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			oSection2 = oObjectPage.getSections()[1],
			oSection3 = oObjectPage.getSections()[2],
			oScrollToSectionSpy = this.spy(oObjectPage, "scrollToSection"),
			oSection2Anchor,
			done = assert.async();

		assert.expect(2);

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			oSection2Anchor = helpers.getSectionAnchor(oSection2);

			// simulate user press on the anchorBar button
			oObjectPage.getAggregation("_anchorBar").fireSelect({
				key: oSection2Anchor.getKey()
			});

			// simulate change in structure during scroll
			oSection3.setVisible(false);

			// ensure we test the scrolling from this point on
			oScrollToSectionSpy.resetHistory();
			this.stub(oObjectPage._oScroller._$Container, "is").callsFake(function(sState) {
				if (sState === ":animated") {
					return true;
				}
			});

			// subscribe for end of adjustment
			oObjectPage._requestAdjustLayoutAndUxRules().then(function() {
				// Check
				assert.ok(oScrollToSectionSpy.called, "scrolling is adjusted");
				assert.ok(oScrollToSectionSpy.alwaysCalledWithMatch(oSection2.getId()), "scrolling is adjusted to the correct section");

				done();
			});
		}, this);

	});

	QUnit.test("subSection without title", function (assert) {

		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			oSection = oObjectPage.getSections()[1],
			oSectionSubSection = oSection.getSubSections()[1],
			done = assert.async(),
			oSpy = this.spy(oObjectPage, "_requestAdjustLayout");

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", makeVoid(async function() {

			const iSectionPositionTopBefore = oObjectPage._computeScrollPosition(oSection);
			const iSubSectionPositionTopBefore = oObjectPage._computeScrollPosition(oSectionSubSection);
			// verify init state
			assert.ok(iSubSectionPositionTopBefore > iSectionPositionTopBefore, "subSection position is below its parent section");

			// Act
			oSpy.resetHistory();
			oSectionSubSection.setShowTitle(false);
			await nextUIUpdate();

			// Check
			assert.ok(oSpy.called, "layout adjustment is requested");
			oObjectPage._requestAdjustLayout(true); // call synchronously to save a timeout
			const iSectionPositionTopAfter = oObjectPage._computeScrollPosition(oSection);
			const iSubSectionPositionTopAfter = oObjectPage._computeScrollPosition(oSectionSubSection);
			assert.ok(iSubSectionPositionTopAfter > iSectionPositionTopAfter, "subSection position is below its parent section");

			done();
		}));

	});

	QUnit.test("Scrolling to Section, when selectedSection is not visible", function (assert) {
		// Arrange
		var oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 10),
			oFirstSection = oObjectPageLayout.getSections()[0],
			oFirstSectionSubSection = oFirstSection.getSubSections()[0],
			oScrollToSection = oObjectPageLayout.getSections()[6],
			oScrollToSectionInfo,
			iTargetPosition,
			done = assert.async();

		assert.expect(1);

		oFirstSectionSubSection.setVisible(false);
		oObjectPageLayout.setSelectedSection(oFirstSection);
		oObjectPageLayout.placeAt('qunit-fixture');

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			// Act
			oScrollToSectionInfo = oObjectPageLayout._oSectionInfo[oScrollToSection.getId()];
			iTargetPosition = oScrollToSectionInfo.positionTop;
			oObjectPageLayout._$opWrapper.scrollTop(iTargetPosition);
			oObjectPageLayout._onScroll({target: {scrollTop: iTargetPosition}});

			// Assert
			assert.strictEqual(oObjectPageLayout._oABHelper._getAnchorBar().getSelectedKey(), oScrollToSection.getId(),
				"Scrolled to Section is selected correctly in the AnchorBar");

			// Clean up
			done();
		});
	});

	QUnit.test("Does not throw an error when selectedSection does not exists", function (assert) {
		// Arrange
		var oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 3),
			done = assert.async();

		assert.expect(1);

		// Act
		oObjectPageLayout.setSelectedSection("not-existing-section");
		oObjectPageLayout.placeAt('qunit-fixture');

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {

			// Assert
			assert.ok(true, "Error is not thrown");

			// Clean up
			done();
		});
	});

	QUnit.test("requestAdjustLayoutAndUxRules during animated scroll to subSection", function (assert) {

		var oObjectPage = this.oObjectPageContentScrollingView.byId("ObjectPageLayout"),
			oTargetSection = oObjectPage.getSections()[2],
			sTargetSectionId = oTargetSection.getId(),
			sTargetSubSectionId = oTargetSection.getSubSections()[0].getId(),
			oScrollSpy = this.spy(oObjectPage, "scrollToSection"),
			done = assert.async();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			oObjectPage.setSelectedSection(sTargetSectionId);

			// scroll to a subSection of the selectedSection
			oObjectPage.scrollToSection(sTargetSubSectionId);

			this.stub(oObjectPage, "_isClosestScrolledSection").callsFake(function (sSectionId) {
				return sSectionId === sTargetSectionId;
			});
			this.stub(oObjectPage._oScroller._$Container, "is").callsFake(function (sCondition) {
				return sCondition === ":animated";
			});
			oScrollSpy.reset();
			oObjectPage._adjustLayoutAndUxRules();
			assert.ok(oScrollSpy.calledOnceWith(sTargetSubSectionId), "correct scrolled section");
			done();
		}.bind(this));
	});

	QUnit.module("ObjectPage scrolling without view");

	QUnit.test("auto-scroll on resize of last section", async function(assert) {
		var oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 10) /* enough sections to allow scrolling even on big screens */,
			oLastSection = oObjectPageLayout.getSections()[1],
			oLastSubSection = oLastSection.getSubSections()[0],
			oResizableControl = new GenericDiv({height: "100px"}),
			iScrollTopBeforeResize,
			iScrollTopAfterResize,
			done = assert.async();

		oLastSubSection.addBlock(oResizableControl);
		oObjectPageLayout.setSelectedSection(oLastSection);


		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
				iScrollTopBeforeResize = oObjectPageLayout._$opWrapper.scrollTop();
				// make the height of the last section smaller
				oResizableControl.getDomRef().style.height = "10px";
				iScrollTopAfterResize = oObjectPageLayout._$opWrapper.scrollTop();
				// call the listener for the scroll event synchronously to speed up the test
				oObjectPageLayout._onScroll({target: {scrollTop: iScrollTopAfterResize}});

				assert.strictEqual(oObjectPageLayout.getSelectedSection(), oLastSection.getId(), "Selection is preserved");
				assert.strictEqual(oObjectPageLayout._$opWrapper.scrollTop(), iScrollTopBeforeResize, "scrollTop is restored");
				oObjectPageLayout.destroy();
				done();
		});

		// arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
	});

	QUnit.test("auto-scroll on resize of last section rounding", async function(assert) {
		var oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 2 /* two sections */),
			oLastSection = oObjectPageLayout.getSections()[1],
			oLastSubSection = oLastSection.getSubSections()[0],
			iResizableControlHeight = 100,
			iHeightChange = 90,
			oResizableControl = new GenericDiv({height: +iResizableControlHeight + "px"}),
			iScrollTopBeforeResize,
			iScrollLengthBeforeResize,
			iRoundingOffset = 0.005,
			done = assert.async();

		oLastSubSection.addBlock(oResizableControl);
		oObjectPageLayout.setSelectedSection(oLastSection);


		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			iScrollTopBeforeResize = oObjectPageLayout._$opWrapper.scrollTop();
			iScrollLengthBeforeResize = oObjectPageLayout._$opWrapper.get(0).scrollHeight;


			// Act: make the height of the last section 90px smaller
			oResizableControl.getDomRef().style.height = (iResizableControlHeight - iHeightChange) + "px";
			this.stub(oObjectPageLayout, "_getScrollableContentLength").callsFake(function() {
				// the <code>iRoundingOffset</code> adds a tiny extra ammount of 0.005 that should not affect the outcome
				return iScrollLengthBeforeResize - iHeightChange + iRoundingOffset;
			});

			oObjectPageLayout._onScroll({target: {scrollTop: iScrollTopBeforeResize - iHeightChange}});

			// Check: test that the extra <code>iRoundingOffset</code> of 0.005px do not affect the outcome:
			assert.strictEqual(oObjectPageLayout._isContentScrolledToBottom(), true, "content is scrolled to bottom");
			oObjectPageLayout.destroy();
			done();
		}.bind(this));

		// arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
	});

	QUnit.test("auto-scroll on resize after layout calculation", async function(assert) {
		var oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 2 /* two sections */),
			oLastSection = oObjectPageLayout.getSections()[1],
			oLastSubSection = oLastSection.getSubSections()[0],
			oResizableControl = new GenericDiv({height: "100px"}),
			iScrollTopBeforeResize,
			iExpectedScrollTopAfterResize,
			oSpy = this.spy(oObjectPageLayout, "_scrollTo"),
			done = assert.async();

		oLastSubSection.addBlock(oResizableControl);
		oObjectPageLayout.setSelectedSection(oLastSection);


		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {
			setTimeout(function() {
				// make the height of the last section bigger
				oResizableControl.getDomRef().style.height = "1000px";
				oObjectPageLayout._requestAdjustLayout(true);


				iScrollTopBeforeResize = oObjectPageLayout._$opWrapper.scrollTop();
				iExpectedScrollTopAfterResize = Math.ceil(iScrollTopBeforeResize); //the page ceils the obtained DOM positions
				// make the height of the last section smaller
				oResizableControl.getDomRef().style.height = "10px";

				oSpy.resetHistory();
				oObjectPageLayout._onScroll({ target: { scrollTop: 0 }}); // call synchronously to avoid another timeout
				assert.strictEqual(oObjectPageLayout.getSelectedSection(), oLastSection.getId(), "Selection is preserved");
				assert.ok(oSpy.calledWith(iExpectedScrollTopAfterResize), "scrollTop is preserved");
				oObjectPageLayout.destroy();
				done();
			}, 500);
		});

		// arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
	});

	QUnit.test("content size correctly calculated", async function(assert) {
		var oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 2 /* two sections */),
			oFirstSection = oObjectPageLayout.getSections()[0],
			oLastSection = oObjectPageLayout.getSections()[1],
			iFirstSectionSpacerHeight,
			iLastSectionSpacerHeight,
			oBigHeightControl = new GenericDiv({height: "500px"}),
			oSmallHeightControl = new GenericDiv({height: "100px"}),
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
					assert.equal(iLastSectionSpacerHeight, 0,
						"spacer is 0");
					assert.equal(iLastSectionSpacerHeight, iFirstSectionSpacerHeight,
						"spacer for smaller section is the same when there is only one visible SubSection");

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
		await nextUIUpdate();
	});

	// ensure that appending the anchorBar does not change the scrollTop,
	// as it may happen in certain cases (if another part of content freshly rerendered (BCP: 1870365138)
	QUnit.test("_moveAnchorBarToContentArea preserves the page scrollTop", async function(assert) {
		var oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 2 /* two sections */),
			oFirstSection = oObjectPageLayout.getSections()[0],
			oLastSection = oObjectPageLayout.getSections()[1],
			done = assert.async();

		oObjectPageLayout.setSelectedSection(oLastSection);

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", makeVoid(async function() {

			var iScrollTopBefore = oObjectPageLayout.getDomRef().scrollTop;

			// act
			oFirstSection.invalidate();
			await nextUIUpdate();
			oObjectPageLayout._moveAnchorBarToContentArea();

			assert.strictEqual(oObjectPageLayout.getDomRef().scrollTop, iScrollTopBefore, "scrollTop is preserved");
			oObjectPageLayout.destroy();
			done();
		}));

		// arrange
		oObjectPageLayout.placeAt('qunit-fixture');
		await nextUIUpdate();
	});

	QUnit.test("no scrollbar on unsnap if not needed", async function(assert) {
		var oObjectPageLayout = helpers.generateObjectPageWithContent(oFactory, 1 /* single section */),
			oRequestAdjustLayoutSpy = this.spy(oObjectPageLayout, "_requestAdjustLayout"),
			done = assert.async();

		oObjectPageLayout.setHeaderTitle(oFactory.getDynamicPageTitle());
		oObjectPageLayout.addHeaderContent(new Panel({height: "100px"}));

		function hasScrollbar() {
			var oScrollContainer = oObjectPageLayout._$opWrapper.get(0);
			return oScrollContainer.scrollHeight > oScrollContainer.offsetHeight;
		}

		oObjectPageLayout.attachEventOnce("onAfterRenderingDOMReady", function() {

			oObjectPageLayout._snapHeader(true);
			oRequestAdjustLayoutSpy.resetHistory();

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
		await nextUIUpdate();
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

	QUnit.test("ObjectPage On Title Press", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oTitle = oObjectPage.getHeaderTitle(),
			oScrollSpy = this.spy(oObjectPage, "_scrollTo"),
			done = assert.async();


		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			// check setup:
			assert.equal(oObjectPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true, "header is bigger than allowed to be expanded in title");

			// setup: scroll to a position where the header is snapped
			oObjectPage._scrollTo(950);
			setTimeout(function() {
				oScrollSpy.resetHistory();

				//act
				oTitle.fireEvent("_titlePress");
				assert.equal(oObjectPage._bHeaderInTitleArea, false, "Header is not added to the title");
				assert.ok(oScrollSpy.calledWith(0, 0), "scroll position is correct");
				done();
			}, 500); //allow the page to scroll to the required position
		});

		await helpers.renderObject(oObjectPage);
		oObjectPage.$().outerHeight("800px"); // set page height smaller than header height
	});

	QUnit.test("expand shows the visual indicator", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oExpandButton = oObjectPage.getHeaderTitle()._getExpandButton(),
			oScrollSpy = this.spy(oObjectPage, "_scrollBelowCollapseVisualIndicator"),
			done = assert.async();

		oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {

			// check setup:
			assert.equal(oObjectPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true, "header is bigger than allowed to be expanded in title");

			// setup: scroll to a position where the header is snapped
			oObjectPage._scrollTo(950);
			setTimeout(function() {
				oScrollSpy.resetHistory();

				//act: expand via the 'expand' visual indicator
				oExpandButton.firePress();

				// check scroll adjustment called
				assert.strictEqual(oScrollSpy.callCount, 1, "executed scroll to show the visual indicator");
				done();
			}, 500); //allow the page to scroll to the required position
		});

		await helpers.renderObject(oObjectPage);
		oObjectPage.$().outerHeight("800px"); // set page height smaller than header height
	});

	QUnit.test("_getClosestScrolledSectionBaseId anchorBar mode", function (assert) {
		var done = assert.async();
		XMLView.create({
			id: "UxAP-objectPageContentScrolling",
			viewName: "view.UxAP-ObjectPageContentScrolling"
		}).then(async function(oView) {
			this.oObjectPageContentScrollingView = oView;
			this.oObjectPageContentScrollingView.placeAt('qunit-fixture');
			await nextUIUpdate();

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

				assert.strictEqual(oObjectPage._getClosestScrolledSectionBaseId(iFirstSubSectionScrollTop + 10, iPageHeight, true /* subsections only */), oFirstSubSection.getId(), "first subsection is closest");
				assert.strictEqual(oObjectPage._getClosestScrolledSectionBaseId(iSecondSubSectionScrollTop + 10, iPageHeight, true /* subsections only */), oSecondSubSection.getId(), "second subsection is closest");
				this.oObjectPageContentScrollingView.destroy();
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("_getClosestScrolledSectionBaseId tabs mode", function (assert) {
		var done = assert.async();
		XMLView.create({
			id: "UxAP-objectPageContentScrolling",
			viewName: "view.UxAP-ObjectPageContentScrolling"
		}).then(async function(oView) {
			this.oObjectPageContentScrollingView = oView;
			this.oObjectPageContentScrollingView.placeAt('qunit-fixture');
			await nextUIUpdate();

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

				assert.strictEqual(oObjectPage._getClosestScrolledSectionBaseId(iFirstSubSectionScrollTop + 10, iPageHeight, false /* sections only */), oSecondSection.getId(), "second section is closest");
				assert.strictEqual(oObjectPage._getClosestScrolledSectionBaseId(iFirstSubSectionScrollTop + 10, iPageHeight, true /* subsections only */), oSecondSectionFirstSubSection.getId(), "first subsection is closest");
				assert.strictEqual(oObjectPage._getClosestScrolledSectionBaseId(iSecondSubSectionScrollTop + 10, iPageHeight, true /* subsections only */), oSecondSectionSecondSubSection.getId(), "second subsection is closest");
				this.oObjectPageContentScrollingView.destroy();
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.module("No visible section", {
		beforeEach: function (assert) {
			this.oObjectPage = helpers.generateObjectPageWithContent(oFactory, 1);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("_shouldAllowScrolling checks if visible sections exist", async function (assert) {
		var oObjectPage = this.oObjectPage,
			oSpy = this.spy(oObjectPage, "_shouldAllowScrolling"),
			done = assert.async();
		this.oObjectPage.attachEventOnce("onAfterRenderingDOMReady", function() {
			// Setup
			oSpy.resetHistory();
			oObjectPage._bAllContentFitsContainer = true;

			// Act:
			oObjectPage.getSections()[0].destroy();
			// call synchronously to speed up the test
			oObjectPage._requestAdjustLayout(true);
			assert.ok(oSpy.calledOnce, "check for scrolling is requested");
			assert.ok(oSpy.returned(true), "result is correct");
			done();
		});
		await helpers.renderObject(this.oObjectPage);
	});

	function isObjectPageHeaderStickied(oObjectPage) {
		var oHeaderTitle = oObjectPage.getDomRef("headerTitle");
		var oHeaderContent = oObjectPage.getDomRef("headerContent");
		return oHeaderTitle.classList.contains("sapUxAPObjectPageHeaderStickied") &&
				oHeaderContent.classList.contains("sapUxAPObjectPageHeaderDetailsHidden") &&
				oHeaderContent.style["overflow"] == "hidden";
	}

});