/*global QUnit,sinon */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/Carousel",
	"sap/m/library",
	"sap/m/Image",
	"sap/m/Page",
	"sap/m/Button",
	"sap/ui/events/KeyCodes",
	"sap/ui/Device",
	"sap/m/ResponsivePopover"
], function(
	qutils,
	Carousel,
	mobileLibrary,
	Image,
	Page,
	Button,
	KeyCodes,
	Device,
	ResponsivePopover
) {
	'use strict';

	// shortcut for sap.m.CarouselArrowsPlacement
	var CarouselArrowsPlacement = mobileLibrary.CarouselArrowsPlacement;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	var styleElement = document.createElement("style");
	styleElement.textContent =
		"#mSAPUI5SupportMessage {" +
		"	display: none !important;" +
		"}";
	document.head.appendChild(styleElement);

	var DOM_RENDER_LOCATION = "qunit-fixture";
	var sinonClockTickValue = 1000;

	function createCarouselWithContent(sIdModification) {
		return new Carousel({
			height: "100%",
			width: "100%",
			pages: [
				new Page("keyTestPage_1" + sIdModification),
				new Page("keyTestPage_2" + sIdModification),
				new Page("keyTestPage_3" + sIdModification),
				new Page("keyTestPage_4" + sIdModification),
				new Page("keyTestPage_5" + sIdModification),
				new Page("keyTestPage_6" + sIdModification)
			]
		});
	}

	// Waiting for CSS transitions to complete is time consuming and not working when tests are run in background tab
	function forceTransitionComplete (oCarousel) {
		oCarousel._oMobifyCarousel.onTransitionComplete();
	}

	//================================================================================
	// Carousel Properties
	//================================================================================
	QUnit.module("Properties", {
		beforeEach: function () {
			this.oCarousel = new Carousel();
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oCarousel.destroy();
		}
	});

	QUnit.test("Default Values", function (assert) {
		assert.strictEqual(this.oCarousel.getLoop(), false, "Default 'loop' value is false");
		assert.strictEqual(this.oCarousel.getWidth(), '100%', "Default 'width' value is 100%");
		assert.strictEqual(this.oCarousel.getHeight(), '100%', "Default 'height' value is 100%");
		assert.strictEqual(this.oCarousel.getVisible(), true, "Default 'visible' value is true");
		assert.strictEqual(this.oCarousel.getActivePage(), null, "Default 'activePage' value is null");
		assert.strictEqual(this.oCarousel.getShowPageIndicator(), true, "Default 'showPageIndicator' value is true");
		assert.strictEqual(this.oCarousel.getPageIndicatorPlacement(), PlacementType.Bottom, "Default 'pageIndicatorPlacement' value is Bottom");
		assert.strictEqual(this.oCarousel.getArrowsPlacement(), CarouselArrowsPlacement.Content, "Default 'arrowsPlacement' value is 'Content'");
	});

	//================================================================================
	// Carousel Methods
	//================================================================================
	QUnit.module("Methods", {
		beforeEach: function () {
			this.oCarousel = createCarouselWithContent("");
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oCarousel.destroy();
		}
	});

	QUnit.test("#setActivePage()", function (assert) {
		// Act
		this.oCarousel.setActivePage("keyTestPage_6");

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_6", "The active page should be 'keyTestPage_6'");
	});

	QUnit.test("#next()", function (assert) {
		// Act
		this.oCarousel.next();
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_2", "The active page should be 'keyTestPage_2'");
	});

	QUnit.test("#previous()", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage_6");
		forceTransitionComplete(this.oCarousel);

		// Act
		this.oCarousel.previous();
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_5", "The active page should be 'keyTestPage_5'");
	});

	QUnit.test("#setLoop(true) should move from last to first page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage_6");
		this.oCarousel.setLoop(true);
		forceTransitionComplete(this.oCarousel);

		// Act
		this.oCarousel.next();
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_1", "The active page should be 'keyTestPage_1'");
	});

	QUnit.test("#setLoop(true) should move from first to last page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage_1");
		this.oCarousel.setLoop(true);
		forceTransitionComplete(this.oCarousel);

		// Act
		this.oCarousel.previous();
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_6", "The active page should be 'keyTestPage_6'");
	});

	QUnit.test("#setShowPageIndicator(false) should make Page Indicator invisible", function (assert) {
		// Act
		this.oCarousel.setShowPageIndicator(false);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oCarousel.$().find(".sapMCrslBulleted").length, 0, "Page Indicator should be invisible");
	});

	QUnit.test("#setShowPageIndicator(true) should make Page Indicator visible", function (assert) {
		// Arrange
		this.oCarousel.setShowPageIndicator(false);

		// Act
		this.oCarousel.setShowPageIndicator(true);

		// Assert
		assert.strictEqual(this.oCarousel.$().find(".sapMCrslBulleted").css('opacity'), '1', "Page Indicator should be visible");
	});

	QUnit.test("#setPageIndicatorPlacement() to 'top' position", function (assert) {
		// Act
		this.oCarousel.setPageIndicatorPlacement(PlacementType.Top);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(this.oCarousel.$().children().first().hasClass('sapMCrslControlsTop'), "Page Indicator should be on top");
	});

	QUnit.test("#setPageIndicatorPlacement() to 'bottom' position", function (assert) {
		// Act
		this.oCarousel.setPageIndicatorPlacement(PlacementType.Bottom);

		// Assert
		assert.ok(this.oCarousel.$().children().last().hasClass('sapMCrslControlsBottom'), "Page Indicator should be at bottom");
	});

	QUnit.test("#setArrowsPlacement() to 'Content' position", function (assert) {
		// Act
		this.oCarousel.setArrowsPlacement(CarouselArrowsPlacement.Content);

		// Assert
		assert.strictEqual(this.oCarousel.$().find('.sapMCrslHud').length, 1, "Arrows should be rendered next to the image");
	});

	QUnit.test("#setArrowsPlacement() to 'PageIndicator' position", function (assert) {
		// Act
		this.oCarousel.setArrowsPlacement(CarouselArrowsPlacement.PageIndicator);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oCarousel.$().find('.sapMCrslHud').length, 0, "Arrows hud should not be rendered");
		assert.strictEqual(this.oCarousel.$().find('.sapMCrslControls ').length, 1, "Arrows should be rendered in the 'controls' area");
	});

	QUnit.test("#setVisible(false) should delete Carousel from DOM", function (assert) {
		// Act
		this.oCarousel.setVisible(false);
		this.clock.tick(sinonClockTickValue);

		// Assert
		assert.strictEqual(this.oCarousel.$().length, 0, "Carousel should be deleted from DOM");
	});

	QUnit.test("#setVisible(true) should add Carousel to DOM", function (assert) {
		// Arrange
		this.oCarousel.setVisible(false);
		this.clock.tick(sinonClockTickValue);

		// Act
		this.oCarousel.setVisible(true);
		this.clock.tick(sinonClockTickValue);

		// Assert
		assert.strictEqual(this.oCarousel.$().length, 1, "Carousel should be added to DOM");
	});

	//================================================================================
	// Carousel Events
	//================================================================================
	QUnit.module("Events", {
		beforeEach: function () {
			//carousel with 9 pages. Page Indicator will be numeric.
			this.oCarousel = new Carousel("myCrsl", {
				pages: [
					new Page("keyTestPage_1"),
					new Page("keyTestPage_2"),
					new Page("keyTestPage_3"),
					new Page("keyTestPage_4"),
					new Page("keyTestPage_5"),
					new Page("keyTestPage_6"),
					new Page("keyTestPage_7"),
					new Page("keyTestPage_8"),
					new Page("keyTestPage_9")
				],
				activePage: "keyTestPage_2"
			});
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oCarousel.destroy();
		}
	});

	QUnit.test("Listen to 'pageChanged' event", function (assert) {
		// Arrange
		var bPageNewOK = false,
			bPageOldOK = false;

		assert.expect(2);
		forceTransitionComplete(this.oCarousel);

		this.oCarousel.attachPageChanged(function (oControlEvent) {
			bPageNewOK = oControlEvent.getParameters().oldActivePageId == "keyTestPage_2";
			bPageOldOK = oControlEvent.getParameters().newActivePageId == "keyTestPage_3";
		});

		// Act
		this.oCarousel.next();
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.ok(bPageNewOK, "Old active page should be 'keyTestPage_2'");
		assert.ok(bPageOldOK, "New active page should be 'keyTestPage_3'");
	});

	QUnit.test("'pageChanged' event parameters when active page is set through API", function (assert) {
		// Arrange
		var bPageNewOK = false,
			bPageOldOK = false;

		assert.expect(2);
		forceTransitionComplete(this.oCarousel);

		this.oCarousel.attachPageChanged(function (oControlEvent) {
			bPageNewOK = oControlEvent.getParameters().oldActivePageId === "keyTestPage_2";
			bPageOldOK = oControlEvent.getParameters().newActivePageId === "keyTestPage_4";
		});

		// Act
		this.oCarousel.setActivePage("keyTestPage_4");
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.ok(bPageNewOK, "Old active page should be 'keyTestPage_2'");
		assert.ok(bPageOldOK, "New active page should be 'keyTestPage_4'");
	});

	QUnit.test("Should fire 'pageChanged' only once when using #setActivePage() (CSN 0120061532 0001323934 2014)", function (assert) {
		// Arrange
		var spy = this.spy,
			oChangePageSpy;

		assert.expect(1);
		forceTransitionComplete(this.oCarousel);

		// Arrange
		oChangePageSpy = spy(this.oCarousel, "_changePage");

		// Act
		this.oCarousel.setActivePage('keyTestPage_3');
		forceTransitionComplete(this.oCarousel);

		assert.ok(oChangePageSpy.calledOnce, "PageChanged fired once");

		// Reset sinon spy
		oChangePageSpy.restore();
	});

	QUnit.test("Active page should be set when specified in constructor'", function (assert) {
		//Assert
		assert.strictEqual(this.oCarousel.getActivePage(), 'keyTestPage_2', "Active page should be 'keyTestPage_2'");
	});

	QUnit.test("When 'pageChanged' event is fired the numeric value of the page indicator should change", function (assert) {
		// Arrange
		var sTextBetweenNumbers = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("CAROUSEL_PAGE_INDICATOR_TEXT", [2, 9]);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(document.getElementById("myCrsl-slide-number").innerHTML, sTextBetweenNumbers, "Page indicator should show '2 " + sTextBetweenNumbers + " 9'");

		// Act
		this.oCarousel.next();
		forceTransitionComplete(this.oCarousel);

		// Assert
		sTextBetweenNumbers = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("CAROUSEL_PAGE_INDICATOR_TEXT", [3, 9]);
		assert.strictEqual(document.getElementById("myCrsl-slide-number").innerHTML, sTextBetweenNumbers, "Page indicator should show '3 " + sTextBetweenNumbers + " 9'");
	});

	//================================================================================
	// Nested Carousel
	//================================================================================
	QUnit.module("Nested Carousel", {
		beforeEach: function () {

			this.oNestedCarousel = new Carousel({
				pages: [new Page()]
			});

			this.oCarousel = new Carousel({
				pages: [
					new Page({
						content: this.oNestedCarousel
					}),
					new Page()
				]
			});
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oCarousel.destroy();
		}
	});

	QUnit.test("Should fire pageChanged only once even if it is invalidated meanwhile", function (assert) {
		// Arrange
		var callCount = 0,
			that = this,
			done = assert.async();

		// Act
		this.oCarousel.attachPageChanged(shouldOnlyBeCalledOnce);
		this.oCarousel.next();

		function shouldOnlyBeCalledOnce() {
			callCount++;

			if (callCount === 1) {
				//Act part 2;
				that.oNestedCarousel.invalidate();
				//The bug that is tested here triggered a recursion at this point.
				sap.ui.getCore().applyChanges();
			}

			// Assert
			assert.strictEqual(callCount, 1, "Did only call it once");

			//Cleanup
			that.oCarousel.destroy();

			done();
		}
	});

	//================================================================================
	// Carousel clean up
	//================================================================================
	QUnit.module("Clean up", {
		beforeEach: function () {
			this.oCarousel = new Carousel({
				pages: [
					new Page("keyTestPage_1"),
					new Page("keyTestPage_2"),
					new Page("keyTestPage_3"),
					new Page("keyTestPage_4")
				],
				activePage: "keyTestPage_1"
			});
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oCarousel.destroy();
		}
	});

	QUnit.test("Destroy rendered Carousels", function (assert) {
		this.oCarousel.destroy();
		assert.strictEqual(this.oCarousel.$().length, 0, "Picture Carousel removed from DOM");
		assert.strictEqual(this.oCarousel._mScrollContainerMap, undefined, "Picture Carousel's container map has been cleaned up");
	});

	QUnit.test("Destroy not rendered Carousels", function (assert) {
		var oNotRenderedCarousel = new Carousel();
		oNotRenderedCarousel.destroy();
		assert.strictEqual(oNotRenderedCarousel._mScrollContainerMap, undefined, "Empty Carousel's container map has been cleaned up");
	});

	QUnit.test("Destroy carousel scrollbars' content", function (assert) {
		// Arrange
		var oScrollContainer = this.oCarousel._aScrollContainers[0],
			oHtml = oScrollContainer.getContent()[0],
			spy = sinon.spy(oHtml, "destroy");

		// Act
		this.oCarousel.destroy();

		// Assert
		assert.ok(spy.calledOnce, "'.destroy()' should be called for ScrollContainer's content when Carousel is destroyed");
	});

	//================================================================================
	// Carousel Keyboard handling
	//================================================================================
	QUnit.module("Keyboard", {
		beforeEach: function () {
			this.oCarousel = new Carousel({
				pages: [
					new Page("keyTestPage1"),
					new Page("keyTestPage2", {
						content: [
							new Button(),
							new Button(),
							new Button()
						]
					}),
					new Page("keyTestPage3"),
					new Page("keyTestPage4"),
					new Page("keyTestPage5"),
					new Page("keyTestPage6"),
					new Page("keyTestPage7"),
					new Page("keyTestPage8"),
					new Page("keyTestPage9"),
					new Page("keyTestPage10"),
					new Page("keyTestPage11"),
					new Page("keyTestPage12")
				]
			});

			this.oCarousel.placeAt(DOM_RENDER_LOCATION);

			sap.ui.getCore().applyChanges();

			this.oCarousel.$().focus();
		},
		afterEach: function () {
			this.oCarousel.destroy();
		}
	});

	QUnit.test("Arrow Right", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage2");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_RIGHT);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage3", "active page is keyTestPage3");
	});

	QUnit.test("Arrow Right on the last page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage12");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_RIGHT);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage3");
	});

	QUnit.test("Arrow Up", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage2");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_UP);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
	});

	QUnit.test("Arrow Down last page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage12");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_DOWN);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page stays keyTestPage12");
	});

	QUnit.test("Arrow Left", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage2");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_LEFT);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
	});

	QUnit.test("Arrow Left on first page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage1");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_LEFT);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page stays keyTestPage1");
	});

	QUnit.test("Arrow Down", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage2");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_DOWN);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage3", "active page is keyTestPage3");
	});

	QUnit.test("Arrow Up on first page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage1");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_UP);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page stays keyTestPage1");
	});

	QUnit.test("HOME", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage2");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.HOME);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
	});

	QUnit.test("END", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage2");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.END);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
	});

	QUnit.test("CTRL + ARROW_RIGHT", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage1");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_RIGHT, false, false, true);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage11", "active page is keyTestPage11");
	});

	QUnit.test("CTRL + ARROW_RIGHT less than 10 go to last page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage5");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_RIGHT, false, false, true);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
	});

	QUnit.test("CTRL + ARROW_UP", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage1");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_UP, false, false, true);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage11", "active page is keyTestPage11");
	});

	QUnit.test("CTRL + ARROW_UP less than 10 go to last page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage5");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_UP, false, false, true);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
	});

	QUnit.test("PAGE_UP", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage1");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.PAGE_UP);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage11", "active page is keyTestPage11");
	});

	QUnit.test("PAGE_UP on less than 10 go to last page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage5");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.PAGE_UP);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
	});

	QUnit.test("CTRL + ARROW_LEFT", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage12");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_LEFT, false, false, true);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage2", "active page is keyTestPage2");
	});

	QUnit.test("CTRL + ARROW_LEFT less than 10 goes to first page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage5");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_LEFT, false, false, true);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
	});

	QUnit.test("CTRL + ARROW_DOWN", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage2");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_DOWN, false, false, true);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
	});

	QUnit.test("CTRL + ARROW_DOWN less than 10 goes to first page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage5");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_DOWN, false, false, true);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
	});

	QUnit.test("PAGE_DOWN", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage12");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.PAGE_DOWN);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage2", "active page is keyTestPage2");
	});

	QUnit.test("PAGE_DOWN less than 10 goes to first page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage5");
		forceTransitionComplete(this.oCarousel);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.PAGE_DOWN);
		forceTransitionComplete(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
		this.oCarousel.destroy();
	});

	//================================================================================
	// Carousel Keyboard handling
	//================================================================================
	QUnit.test("Container Padding Classes", function (assert) {
		// System under Test + Act
		var oContainer = new Carousel({
				pages: [
					new Page("keyTestPage20")
				]
			}),
			sContentSelector = ".sapMCrslInner > .sapMCrslItem > .sapMScrollCont > .sapMScrollContScroll",
			sResponsiveLargeSize = (Device.resize.width <= 1023 ? "16px" : "16px 32px"),
			sResponsiveSize = (Device.resize.width <= 599 ? "0px" : sResponsiveLargeSize),
			aResponsiveSize = sResponsiveSize.split(" "),
			$containerContent;

		// Act
		oContainer.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		oContainer.addStyleClass("sapUiNoContentPadding");
		$containerContent = oContainer.$().find(sContentSelector);

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), "0px", "The container has no left content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-right"), "0px", "The container has no right content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-top"), "0px", "The container has no top content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-bottom"), "0px", "The container has no bottom content padding when class \"sapUiNoContentPadding\" is set");

		// Act
		oContainer.removeStyleClass("sapUiNoContentPadding");
		oContainer.addStyleClass("sapUiContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), "16px", "The container has 1rem left content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-right"), "16px", "The container has 1rem right content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-top"), "16px", "The container has 1rem top content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-bottom"), "16px", "The container has 1rem bottom content padding when class \"sapUiContentPadding\" is set");

		// Act
		oContainer.removeStyleClass("sapUiContentPadding");
		oContainer.addStyleClass("sapUiResponsiveContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]), "The container has " + sResponsiveSize + " left content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-right"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]), "The container has " + sResponsiveSize + " right content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-top"), aResponsiveSize[0], "The container has " + sResponsiveSize + " top content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-bottom"), aResponsiveSize[0], "The container has " + sResponsiveSize + " bottom content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");

		// Cleanup
		oContainer.destroy();
	});

	QUnit.test("Non touch devices in Popup: Navigating clicking on arrows", function (assert) {
		// Arrange
		var oCarousel = new Carousel({
			pages:[
				new Image("image1", {src:"https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg"}),
				new Image("image2", {src:"https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg"}),
				new Image("image3", {src:"https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg"})
			]
		});
		 var oPopup = new ResponsivePopover({
			contentWidth:"400px",
			contentHeight:"300px",
			showHeader:false,
			content:[ oCarousel ]
		});
		var oButton = new Button({
			text: "Open Carousel"
		});
		oButton.placeAt('qunit-fixture');
		sap.ui.getCore().applyChanges();

		var	oSystem = {
			desktop: true,
			phone: false,
			tablet: false,
			touch: false
		};

		this.stub(Device, "system", oSystem);
		oCarousel.setActivePage("image2");
		forceTransitionComplete(this.oCarousel);

		// Act
		oPopup.openBy(oButton);
		assert.strictEqual(oCarousel.getActivePage(), "image2", "active page is with id 'image2'");
		oCarousel.$().find('a.sapMCrslNext').focus();
		oCarousel._changePage(undefined, 3);
		// Assert
		assert.strictEqual(oCarousel.getActivePage(), "image3", "active page is with id 'image3'");

		// Cleanup
		oCarousel.destroy();
		oPopup.destroy();
		oButton.destroy();
	});

	QUnit.module("Change pages", {
		beforeEach: function () {
			this.oCarousel = new Carousel("myCrsl", {
				pages: [
					new Page("keyTestPage_1"),
					new Page("keyTestPage_2"),
					new Page("keyTestPage_3"),
					new Page("keyTestPage_4"),
					new Page("keyTestPage_5"),
					new Page("keyTestPage_6"),
					new Page("keyTestPage_7"),
					new Page("keyTestPage_8"),
					new Page("keyTestPage_9")
				],
				activePage: "keyTestPage_4"
			});
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oCarousel.destroy();
		}
	});

	QUnit.test("Simulate right arrow fast click twice", function (assert) {
		// arrange
		var oFakeEvent = {
			target: this.oCarousel.getDomRef(),
			preventDefault: function () {}
		};

		forceTransitionComplete(this.oCarousel);

		// act
		this.oCarousel.$().find("a.sapMCrslNext").click();
		this.oCarousel.ontouchend(oFakeEvent);
		this.oCarousel.$().find("a.sapMCrslNext").click();
		this.oCarousel.ontouchend(oFakeEvent);
		forceTransitionComplete(this.oCarousel);

		// assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_6", "Should have the active page set to page #4...");
	});

	QUnit.test("Simulate left arrow fast click twice", function (assert) {
		// arrange
		var oFakeEvent = {
			target: this.oCarousel.getDomRef(),
			preventDefault: function () {}
		};

		forceTransitionComplete(this.oCarousel);

		// act
		this.oCarousel.$().find("a.sapMCrslPrev").click();
		this.oCarousel.ontouchend(oFakeEvent);
		this.oCarousel.$().find("a.sapMCrslPrev").click();
		this.oCarousel.ontouchend(oFakeEvent);
		forceTransitionComplete(this.oCarousel);

		// assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_2", "Should have the active page set to page #2...");
	});

});
