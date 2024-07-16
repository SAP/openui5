/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/Carousel",
	"sap/m/CarouselLayout",
	"sap/m/library",
	"sap/m/Image",
	"sap/m/Page",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/Dialog",
	"sap/m/Input",
	"sap/ui/events/KeyCodes",
	"sap/ui/Device",
	"sap/m/ResponsivePopover",
	"sap/ui/model/json/JSONModel",
	"sap/ui/events/F6Navigation"
], function(
	Library,
	nextUIUpdate,
	jQuery,
	qutils,
	Carousel,
	CarouselLayout,
	mobileLibrary,
	Image,
	Page,
	Button,
	Text,
	Dialog,
	Input,
	KeyCodes,
	Device,
	ResponsivePopover,
	JSONModel,
	F6Navigation
) {
	'use strict';

	// shortcut for sap.m.CarouselArrowsPlacement
	var CarouselArrowsPlacement = mobileLibrary.CarouselArrowsPlacement;

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = mobileLibrary.BackgroundDesign;

	// shortcut for sap.m.BorderDesign
	var BorderDesign = mobileLibrary.BorderDesign;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.CarouselPageIndicatorPlacementType
	var CarouselPageIndicatorPlacementType = mobileLibrary.CarouselPageIndicatorPlacementType;

	var DOM_RENDER_LOCATION = "qunit-fixture";
	var sinonClockTickValue = 1000;

	function checkSizeWithTolerance(iActualSize, iExpectedSize) {
		return iActualSize === iExpectedSize
			|| iActualSize === iExpectedSize - 1
			|| iActualSize === iExpectedSize + 1;
	}

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

	function pressArrowPrev(oCarousel) {
		var $arrowPrev = oCarousel.$().find(".sapMCrslPrev");

		oCarousel.ontouchstart({
			target: $arrowPrev[0],
			preventDefault: function () {},
			isMarked: function () {}
		});

		$arrowPrev.trigger("click");

		oCarousel.ontouchend({
			target: $arrowPrev[0],
			preventDefault: function () {},
			isMarked: function () {}
		});
	}

	function pressArrowNext(oCarousel) {
		var $arrowNext = oCarousel.$().find(".sapMCrslNext");

		oCarousel.ontouchstart({
			target: $arrowNext[0],
			preventDefault: function () {},
			isMarked: function () {}
		});

		$arrowNext.trigger("click");

		oCarousel.ontouchend({
			target: $arrowNext[0],
			preventDefault: function () {},
			isMarked: function () {}
		});
	}

	//================================================================================
	// Carousel Properties
	//================================================================================
	QUnit.module("Properties", {
		beforeEach: function () {
			this.oCarousel = new Carousel();
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
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
		assert.strictEqual(this.oCarousel.getDomRef().getElementsByClassName("sapMIllustratedMessage").length, 1, "When there are no pages set initially there is sap.m.IllustratedMessage rendered");
		assert.strictEqual(this.oCarousel.getDomRef().getElementsByClassName("sapMCrslInnerNoPages").length, 1, "When there are no pages set initially there is 'sapMCrslInnerNoPages' class applied");
		assert.strictEqual(this.oCarousel.getShowPageIndicator(), true, "Default 'showPageIndicator' value is true");
		assert.strictEqual(this.oCarousel.getPageIndicatorPlacement(), PlacementType.Bottom, "Default 'pageIndicatorPlacement' value is Bottom");
		assert.strictEqual(this.oCarousel.getPageIndicatorPlacement(), CarouselPageIndicatorPlacementType.Bottom, "Default 'pageIndicatorPlacement' value is Bottom");
		assert.strictEqual(this.oCarousel.getArrowsPlacement(), CarouselArrowsPlacement.Content, "Default 'arrowsPlacement' value is 'Content'");
		assert.strictEqual(this.oCarousel.$("a").attr("href"), undefined, "Arrow's attribute href is not a link.");
		assert.strictEqual(this.oCarousel.getBackgroundDesign(), BackgroundDesign.Translucent, "Default value for Background Design is 'Translucent'");
	});

	QUnit.module("Rendering", {
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
				]
			});
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oCarousel.destroy();
		}
	});

	QUnit.test("Navigation numbers", function (assert) {
		assert.strictEqual(document.getElementById("myCrsl-slide-number").getAttribute("dir"), "auto", "navigation text direction is auto");
	});

	//================================================================================
	// Carousel Methods
	//================================================================================
	QUnit.module("Methods", {
		beforeEach: function () {
			this.oCarousel = createCarouselWithContent("");
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
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

		// Act
		var oSecondPage = this.oCarousel.getPages()[1];
		this.oCarousel.setActivePage(oSecondPage);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_2", "The active page should be 'keyTestPage_2'");
	});

	QUnit.test("#next()", function (assert) {
		// Act
		this.oCarousel.next();
		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_2", "The active page should be 'keyTestPage_2'");
	});

	QUnit.test("#previous()", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage_6");

		// Act
		this.oCarousel.previous();

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_5", "The active page should be 'keyTestPage_5'");
	});

	QUnit.test("#setLoop(true) should move from last to first page with #next", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage_6");
		this.oCarousel.setLoop(true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		this.oCarousel.next();

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_1", "The active page should be 'keyTestPage_1'");
	});

	QUnit.test("#setLoop(true) should move from first to last page with #previous", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage_1");
		this.oCarousel.setLoop(true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		// Act
		this.oCarousel.previous();
		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_6", "The active page should be 'keyTestPage_6'");
	});

	QUnit.test("#setLoop(true) should move from last to first page when 'Next Page' arrow is pressed", function (assert) {
		// Arrange
		this.oCarousel.getFocusDomRef().focus();
		this.oCarousel.setActivePage("keyTestPage_6");
		this.oCarousel.setLoop(true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		pressArrowNext(this.oCarousel);
		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_1", "The active page should be 'keyTestPage_1'");
		assert.strictEqual(document.activeElement, this.oCarousel.getFocusDomRef(), "The focused page should be 'keyTestPage_1'");
	});

	QUnit.test("#setLoop(true) should move from first to last page when 'Previous Page' arrow is pressed", function (assert) {
		// Arrange
		this.oCarousel.getFocusDomRef().focus();
		this.oCarousel.setActivePage("keyTestPage_1");
		this.oCarousel.setLoop(true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		// Act
		pressArrowPrev(this.oCarousel);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_6", "The active page should be 'keyTestPage_6'");
		assert.strictEqual(document.activeElement, this.oCarousel.getFocusDomRef(), "The focused page should be 'keyTestPage_6'");
	});

	QUnit.test("#setShowPageIndicator(false) should make Page Indicator invisible", function (assert) {
		// Act
		this.oCarousel.setShowPageIndicator(false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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

	QUnit.test("#setPageIndicatorPlacement() to 'top' position - old 'PlacementType' enum", function (assert) {
		// Act
		this.oCarousel.setPageIndicatorPlacement(PlacementType.Top);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(this.oCarousel.$().children().eq(1).hasClass('sapMCrslControlsTop'), "Page Indicator should be on top");
	});

	QUnit.test("#setPageIndicatorPlacement() to 'top' position", function (assert) {
		// Act
		this.oCarousel.setPageIndicatorPlacement(CarouselPageIndicatorPlacementType.Top);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(this.oCarousel.$().children().eq(1).hasClass('sapMCrslControlsTop'), "Page Indicator should be on top");
	});

	QUnit.test("#setPageIndicatorPlacement() to 'bottom' position - old 'PlacementType' enum", function (assert) {
		// Act
		this.oCarousel.setPageIndicatorPlacement(PlacementType.Bottom);

		// Assert
		assert.ok(this.oCarousel.$().children().eq(-2).hasClass('sapMCrslControlsBottom'), "Page Indicator should be at bottom");
	});

	QUnit.test("#setPageIndicatorPlacement() to 'bottom' position", function (assert) {
		// Act
		this.oCarousel.setPageIndicatorPlacement(CarouselPageIndicatorPlacementType.Bottom);

		// Assert
		assert.ok(this.oCarousel.$().children().eq(-2).hasClass('sapMCrslControlsBottom'), "Page Indicator should be at bottom");
	});

	QUnit.test("#setPageIndicatorPlacement() to 'OverContentBottom' position", function (assert) {
		// Act
		this.oCarousel.setPageIndicatorPlacement(CarouselPageIndicatorPlacementType.OverContentBottom);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(this.oCarousel.$().children().eq(-2).hasClass('sapMCrslControlsOverContentBottom'), "Page Indicator should be at bottom, over the content");
	});

	QUnit.test("#setPageIndicatorPlacement() to 'OverContentTop' position", function (assert) {
		// Act
		this.oCarousel.setPageIndicatorPlacement(CarouselPageIndicatorPlacementType.OverContentTop);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(this.oCarousel.$().children().eq(1).hasClass('sapMCrslControlsOverContentTop'), "Page Indicator should be at top, over the content");
	});

	QUnit.test("#setArrowsPlacement() to 'Content' position", function (assert) {
		// Act
		this.oCarousel.setArrowsPlacement(CarouselArrowsPlacement.Content);

		// Assert
		assert.strictEqual(this.oCarousel.$().find('.sapMCrslHud').length, 1, "Arrows should be rendered next to the image");
		assert.ok(this.oCarousel.$().find('.sapMCrslPrev').attr('title'), "Prev Arrow has a tooltip");
		assert.ok(this.oCarousel.$().find('.sapMCrslNext').attr('title'), "Next Arrow has a tooltip");
	});

	QUnit.test("#setArrowsPlacement() to 'PageIndicator' position", function (assert) {
		// Act
		this.oCarousel.setArrowsPlacement(CarouselArrowsPlacement.PageIndicator);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(this.oCarousel.$().find('.sapMCrslHud').length, 0, "Arrows hud should not be rendered");
		assert.strictEqual(this.oCarousel.$().find('.sapMCrslControls ').length, 1, "Arrows should be rendered in the 'controls' area");
	});

	QUnit.test("#setBackgroundDesign() to 'Solid'", function (assert) {
		// Act
		this.oCarousel.setBackgroundDesign(BackgroundDesign.Solid);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(this.oCarousel.$().hasClass("sapMCrslBackground-Solid"), "Correct class for Solid Background should be set");
	});

	QUnit.test("#setBackgroundDesign() to 'Transparent'", function (assert) {
		// Act
		this.oCarousel.setBackgroundDesign(BackgroundDesign.Transparent);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(this.oCarousel.$().hasClass("sapMCrslBackground-Transparent"), "Correct class for Transparent Background should be set");
	});

	QUnit.test("#setPageIndicatorBackgroundDesign() to 'Translucent'", function (assert) {
		// Act
		this.oCarousel.setPageIndicatorBackgroundDesign(BackgroundDesign.Translucent);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(this.oCarousel.$().find(".sapMCrslControlsNoArrows").hasClass("sapMCrslControlsBackground-Translucent"), "Correct class for Translucent Background should be set");
	});

	QUnit.test("#setPageIndicatorBackgroundDesign() to 'Transparent'", function (assert) {
		// Act
		this.oCarousel.setPageIndicatorBackgroundDesign(BackgroundDesign.Transparent);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(this.oCarousel.$().find(".sapMCrslControlsNoArrows").hasClass("sapMCrslControlsBackground-Transparent"), "Correct class for Transparent Background should be set");
	});

	QUnit.test("#setPageIndicatorBorderDesign() to 'None'", function (assert) {
		// Act
		this.oCarousel.setPageIndicatorBorderDesign(BorderDesign.None);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(this.oCarousel.$().find(".sapMCrslControlsNoArrows").hasClass("sapMCrslControlsBorder-None"), "Correct class for Border should be set");
	});

	QUnit.test("#_createScrollContainer() adds 'sapMCrsPage' class to each Page", function (assert) {
		// Assert
		this.oCarousel.getPages().forEach(function (oPage) {
			assert.ok(oPage.$().hasClass("sapMCrsPage"), oPage.getId() + " page has 'sapMCrsPage' class");
		});
	});

	QUnit.test("#_calculatePagesWidth(4)", function (assert) {
		// Set up
		var iActualResult;
		this.oCarousel.$().width("460px");

		// Act
		iActualResult = this.oCarousel._calculatePagesWidth(4);

		// Assert
		assert.strictEqual(Math.round(iActualResult), 22,
			"Width of each page should be 22% when number of items to show are 4 and Carousel's width is 460px");
	});

	QUnit.test("#_calculatePagesWidth(1)", function (assert) {
		// Act
		var iActualResult = this.oCarousel._calculatePagesWidth(1);

		// Assert
		assert.strictEqual(iActualResult, 100, "Width of the page should be 100% when number of items to show is 1");
	});

	QUnit.test("#_setWidthOfPages(6)", function (assert) {
		// Set up
		this.oCarousel.setWidth("700px");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		this.oCarousel._setWidthOfPages(6);
		var oPagesDomRefs = Array.prototype.slice.call(this.oCarousel.getDomRef().getElementsByClassName("sapMCrslItem"));

		// Assert
		oPagesDomRefs.forEach(function (oPage) {
			assert.ok(checkSizeWithTolerance(jQuery(oPage).width(), 100),
				"Width of each page should be 100px when number of items to show are 6 and Carousel's width is 700px");
		});
	});

	QUnit.test("#_getNumberOfItemsToShow() with no customLayout aggregation", function (assert) {
		// Act
		var iActualResult = this.oCarousel._getNumberOfItemsToShow();

		// Assert
		assert.strictEqual(iActualResult, 1, "Carousel should show only 1 page when no customLayout aggregation is set");
	});

	QUnit.test("#_getNumberOfItemsToShow() with customLayout aggregation", function (assert) {
		// Set up
		var iPagesToShow = 4;

		// Act
		this.oCarousel.setCustomLayout(new CarouselLayout({
			visiblePagesCount: iPagesToShow
		}));
		var iActualResult = this.oCarousel._getNumberOfItemsToShow();

		// Assert
		assert.strictEqual(iActualResult, iPagesToShow,
			"Carousel should show 4 pages when customLayout aggregation with visiblePagesCount = 4 is set and it has more pages");
	});

	QUnit.test("#_getNumberOfItemsToShow() with customLayout aggregation with visiblePagesCount higher than all pages count", function (assert) {
		// Set up
		var iPagesToShow = 6;

		this.oCarousel.setCustomLayout(new CarouselLayout({
			visiblePagesCount: iPagesToShow
		}));

		// Act
		var iActualResult = this.oCarousel._getNumberOfItemsToShow();

		// Assert
		assert.strictEqual(iActualResult, this.oCarousel.getPages().length,
			"The maximum number of pages that Carousel can show it its actual number of pages");
	});

	QUnit.test("#setCustomLayout() with no DomRef available", function (assert) {
		// Set up
		var iPagesToShow = 4,
			oMoveToPageSpy = this.spy(this.oCarousel, "_moveToPage"),
			oInvalidateSpy = this.spy(this.oCarousel, "invalidate");


		this.stub(this.oCarousel, "getDomRef").returns(null);

		assert.ok(oInvalidateSpy.notCalled, "Invalidate is not called before custom layout is set");

		// Act
		this.oCarousel.setCustomLayout(new CarouselLayout({
			visiblePagesCount: iPagesToShow
		}));

		// Assert
		assert.ok(oMoveToPageSpy.notCalled, "moveToPage is not called");

		assert.ok(oInvalidateSpy.calledOnce, "Invalidate is called once");
	});

	QUnit.test("#onAfterRendering() _setWidthOfPages is not called when no customLayout aggregation is set", function (assert) {
		// Set up
		var oSetWidthOfPagesSpy = this.spy(this.oCarousel, "_setWidthOfPages");

		// Act
		this.oCarousel.onAfterRendering();

		// Assert
		assert.ok(oSetWidthOfPagesSpy.notCalled, "_setWidthOfPages is not called");
	});

	QUnit.test("#onAfterRendering() _setWidthOfPages is called with correct number of items to be shown", function (assert) {
		// Set up
		var iPagesToShow = 4,
			oSetWidthOfPagesSpy = this.spy(this.oCarousel, "_setWidthOfPages");

		this.oCarousel.setCustomLayout(new CarouselLayout({
			visiblePagesCount: iPagesToShow
		}));

		// Act
		this.oCarousel.onAfterRendering();

		// Assert
		assert.ok(oSetWidthOfPagesSpy.calledWith, iPagesToShow, "_setWidthOfPages is called with 4");
	});

	QUnit.test("#_getPageIndicatorText(2) correct number of pages is shown when customLayout aggregation is set", function (assert) {
		// Set up
		var iPagesToShow = 4,
			sActualResult;

		this.oCarousel.setCustomLayout(new CarouselLayout({
			visiblePagesCount: iPagesToShow
		}));

		// Act
		sActualResult = this.oCarousel._getPageIndicatorText(2);

		// Assert
		assert.strictEqual(sActualResult, "2 of 3",
			"'2 of 3' should be shown when  _getPageIndicatorText is called with 3, total pages are 6 and number of pages to show is 4");
	});

	QUnit.test("#_adjustArrowsVisibility() with maximum number of pages to be shown", function (assert) {
		// Set up
		var iPagesToShow = 6;

		this.oCarousel.setCustomLayout(new CarouselLayout({
			visiblePagesCount: iPagesToShow
		}));
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		this.oCarousel._adjustArrowsVisibility();

		// Assert
		assert.strictEqual(this.oCarousel.$('hud').length, 0, "Hud arrows are not rendered");
	});

	QUnit.test("#_updateActivePages('keyTestPage_4') active pages are correct, depending on numberOfPagesToShow and the new active page",
		function (assert) {
			// Set up
			var iPagesToShow = 2;

			this.oCarousel._aAllActivePages = ["keyTestPage_2", "keyTestPage_3"];
			this.oCarousel._aAllActivePagesIndexes = [1, 2];

			this.oCarousel.setCustomLayout(new CarouselLayout({
				visiblePagesCount: iPagesToShow
			}));

			// Act
			this.oCarousel._updateActivePages("keyTestPage_4");

			// Assert
			assert.strictEqual(this.oCarousel._aAllActivePages.length, iPagesToShow, "Active pages count is equal to numberOfPagesToShow");
			assert.ok(this.oCarousel._aAllActivePages[0] === "keyTestPage_4" && this.oCarousel._aAllActivePages[1] === "keyTestPage_5",
				"'keyTestPage_4' and 'keyTestPage_5' are the active pages' ids after page change");
			assert.ok(this.oCarousel._aAllActivePagesIndexes[0] === 3 && this.oCarousel._aAllActivePagesIndexes[1] === 4,
				"3 and 4 are the active pages' indexes after page change");

			// Act
			this.oCarousel._updateActivePages("keyTestPage_6");

			// Assert
			assert.ok(true, "Error is not thrown when the index of the set active page exceeds total pages count minus pages to be shown");
	});

	QUnit.test("#setActivePage() called before Carousel is rendered - allActive pages are updated correctly after rendering",
		function (assert) {
			// Set up
			var oCarousel = createCarouselWithContent("new");
			oCarousel.setCustomLayout(new CarouselLayout({
				visiblePagesCount: 2
			}));

			// Act
			oCarousel.setActivePage(oCarousel.getPages()[3]);
			oCarousel.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Assert
			assert.ok(oCarousel._aAllActivePages[0] === "keyTestPage_4new" && oCarousel._aAllActivePages[1] === "keyTestPage_5new",
				"'keyTestPage_4' and 'keyTestPage_5' are the active pages' ids after Carousel is rendered");
			assert.ok(oCarousel._aAllActivePagesIndexes[0] === 3 && oCarousel._aAllActivePagesIndexes[1] === 4,
				"3 and 4 are the active pages' indexes after Carousel is rendered");

			// Clean up
			oCarousel.destroy();
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

	QUnit.test("Set busy indicator size", function (assert) {
		// Act
		this.oCarousel.setBusyIndicatorSize("Unknown size");

		// Assert
		assert.strictEqual(this.oCarousel.getBusyIndicatorSize(), "Medium", "Default busy indicator size should be 'Medium'");
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
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oCarousel.destroy();
		}
	});

	QUnit.test("Listen to 'pageChanged' event", function (assert) {
		// Arrange
		var bPageNewOK = false,
			bPageOldOK = false,
			bPagesNewIndexdOK = false;

		assert.expect(3);

		this.oCarousel.attachPageChanged(function (oControlEvent) {
			bPageNewOK = oControlEvent.getParameters().oldActivePageId === "keyTestPage_2";
			bPageOldOK = oControlEvent.getParameters().newActivePageId === "keyTestPage_3";
			bPagesNewIndexdOK = oControlEvent.getParameters().activePages[0] === 2;
		});

		// Act
		this.oCarousel.next();

		// Assert
		assert.ok(bPageNewOK, "Old active page should be 'keyTestPage_2'");
		assert.ok(bPageOldOK, "New active page should be 'keyTestPage_3'");
		assert.ok(bPagesNewIndexdOK, "New page index should be 2");
	});

	QUnit.test("'pageChanged' event parameters when active page is set through API", function (assert) {
		// Arrange
		var bPageNewOK = false,
			bPageOldOK = false,
			bPagesNewIndexdOK = false;

		assert.expect(3);

		this.oCarousel.attachPageChanged(function (oControlEvent) {
			bPageNewOK = oControlEvent.getParameters().oldActivePageId === "keyTestPage_2";
			bPageOldOK = oControlEvent.getParameters().newActivePageId === "keyTestPage_4";
			bPagesNewIndexdOK = oControlEvent.getParameters().activePages[0] === 3;
		});

		// Act
		this.oCarousel.setActivePage("keyTestPage_4");

		// Assert
		assert.ok(bPageNewOK, "Old active page should be 'keyTestPage_2'");
		assert.ok(bPageOldOK, "New active page should be 'keyTestPage_4'");
		assert.ok(bPagesNewIndexdOK, "New page index should be 3");
	});

	QUnit.test("'pageChanged' event when invalidate", function (assert) {
		var oPageChangedSpy = this.spy(this.oCarousel, "firePageChanged");

		this.oCarousel.invalidate();

		assert.ok(oPageChangedSpy.notCalled, "pageChanged event is not fired");
	});

	QUnit.test("Listen to 'beforePageChanged' event", function (assert) {
		// Arrange
		var bPagesNewIndexdOK = false;

		assert.expect(1);

		this.oCarousel.attachBeforePageChanged(function (oControlEvent) {
			bPagesNewIndexdOK = oControlEvent.getParameters().activePages[0] === 2;
		});

		// Act
		this.oCarousel.next();

		// Assert
		assert.ok(bPagesNewIndexdOK, "New page index should be 2");
	});

	QUnit.test("Should fire 'pageChanged' only once when using #setActivePage() (CSN 0120061532 0001323934 2014)", function (assert) {
		// Arrange
		var spy = this.spy,
			oChangePageSpy,
			oUpdateActivePagesSpy;

		assert.expect(2);
		// Arrange
		oChangePageSpy = spy(this.oCarousel, "_changeActivePage");
		oUpdateActivePagesSpy = spy(this.oCarousel, "_updateActivePages");

		// Act
		this.oCarousel.setActivePage('keyTestPage_3');

		assert.ok(oChangePageSpy.calledOnce, "PageChanged fired once");
		assert.ok(oUpdateActivePagesSpy.calledWith("keyTestPage_3"), "_updateActivePages is called with the correct new active page Id");
	});

	QUnit.test("Active page should be set when specified in constructor'", function (assert) {
		//Assert
		assert.strictEqual(this.oCarousel.getActivePage(), 'keyTestPage_2', "Active page should be 'keyTestPage_2'");
	});

	QUnit.test("When 'pageChanged' event is fired the numeric value of the page indicator should change", function (assert) {
		// Arrange
		var sTextBetweenNumbers = Library.getResourceBundleFor("sap.m").getText("CAROUSEL_PAGE_INDICATOR_TEXT", [2, 9]);

		// Assert
		assert.strictEqual(document.getElementById("myCrsl-slide-number").innerHTML, sTextBetweenNumbers, "Page indicator should show '2 " + sTextBetweenNumbers + " 9'");

		// Act
		this.oCarousel.next();

		// Assert
		sTextBetweenNumbers = Library.getResourceBundleFor("sap.m").getText("CAROUSEL_PAGE_INDICATOR_TEXT", [3, 9]);
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
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oCarousel.destroy();
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
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oCarousel.destroy();
		}
	});

	QUnit.test("Destroy rendered Carousels", function (assert) {
		this.oCarousel.destroy();
		assert.strictEqual(this.oCarousel.$().length, 0, "Picture Carousel removed from DOM");
	});

	QUnit.test("Destroy not rendered Carousels", function (assert) {
		var oNotRenderedCarousel = new Carousel();
		oNotRenderedCarousel.destroy();
		assert.ok(true, "Not rendered carousel does not throw error");
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
			this.oButton = new Button("btn",{
				text: "Text"
			});
			this.oButton.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			this.oCarousel.getFocusDomRef().focus();
		},
		afterEach: function () {
			this.oCarousel.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Arrow Right", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage2");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage2-slide"), KeyCodes.ARROW_RIGHT);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage3", "active page is keyTestPage3");
	});

	QUnit.test("Arrow Right on the last page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage12");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage12-slide"), KeyCodes.ARROW_RIGHT);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage3");
	});

	QUnit.test("Arrow Up", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage2");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage2-slide"), KeyCodes.ARROW_UP);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage3", "active page is keyTestPage1");
	});

	QUnit.test("Arrow Down first page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage1");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage1-slide"), KeyCodes.ARROW_DOWN);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page stays keyTestPage1");
	});

	QUnit.test("Arrow Left", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage2");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage2-slide"), KeyCodes.ARROW_LEFT);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
	});

	QUnit.test("Arrow Left on first page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage1");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage1-slide"), KeyCodes.ARROW_LEFT);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page stays keyTestPage1");
	});

	QUnit.test("Arrow Down", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage2");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage2-slide"), KeyCodes.ARROW_DOWN);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage3");
	});

	QUnit.test("Arrow Up on first page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage1");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage1-slide"), KeyCodes.ARROW_UP);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage2", "active page stays keyTestPage1");
	});

	QUnit.test("HOME", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage2");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage2-slide"), KeyCodes.HOME);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
	});

	QUnit.test("HOME when loop is activated", function (assert) {
		// Arrange
		this.oCarousel.setLoop(true).setActivePage("keyTestPage2");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage2-slide"), KeyCodes.HOME);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
	});

	QUnit.test("END", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage2");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage12-slide"), KeyCodes.END);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
	});

	QUnit.test("END when loop is activated", function (assert) {
		// Arrange
		this.oCarousel.setLoop(true).setActivePage("keyTestPage2");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage12-slide"), KeyCodes.END);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
	});

	QUnit.test("CTRL + ARROW_RIGHT", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage1");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage1-slide"), KeyCodes.ARROW_RIGHT, false, false, true);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage11", "active page is keyTestPage11");
	});

	QUnit.test("CTRL + ARROW_RIGHT less than 10 go to last page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage5");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage5-slide"), KeyCodes.ARROW_RIGHT, false, false, true);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
	});

	QUnit.test("CTRL + ARROW_UP", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage1");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage1-slide"), KeyCodes.ARROW_UP, false, false, true);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage11", "active page is keyTestPage11");
	});

	QUnit.test("CTRL + ARROW_UP less than 10 go to last page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage5");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage5-slide"), KeyCodes.ARROW_UP, false, false, true);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
	});

	QUnit.test("PAGE_UP", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage1");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage1-slide"), KeyCodes.PAGE_UP);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage11", "active page is keyTestPage11");
	});

	QUnit.test("PAGE_UP on less than 10 go to last page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage5");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage5-slide"), KeyCodes.PAGE_UP);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
	});

	QUnit.test("CTRL + ARROW_LEFT", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage12");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage12-slide"), KeyCodes.ARROW_LEFT, false, false, true);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage2", "active page is keyTestPage2");
	});

	QUnit.test("CTRL + ARROW_LEFT less than 10 goes to first page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage5");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage5-slide"), KeyCodes.ARROW_LEFT, false, false, true);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
	});

	QUnit.test("CTRL + ARROW_DOWN", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage2");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage2-slide"), KeyCodes.ARROW_DOWN, false, false, true);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
	});

	QUnit.test("CTRL + ARROW_DOWN less than 10 goes to first page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage5");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage5-slide"), KeyCodes.ARROW_DOWN, false, false, true);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
	});

	QUnit.test("PAGE_DOWN", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage12");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage12-slide"), KeyCodes.PAGE_DOWN);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage2", "active page is keyTestPage2");
	});

	QUnit.test("PAGE_DOWN less than 10 goes to first page", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage5");

		// Act
		qutils.triggerKeydown(this.oCarousel.$("keyTestPage5-slide"), KeyCodes.PAGE_DOWN);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
		this.oCarousel.destroy();
	});

	QUnit.test("TAB", function (assert) {
		// Arrange
		var oImage = this.oCarousel.getPages()[5],
			spy = this.spy(this.oCarousel, "_forwardTab");

		this.oCarousel.setActivePage(oImage);

		// Act
		qutils.triggerKeydown(this.oCarousel.getFocusDomRef(), KeyCodes.TAB);

		// Assert
		assert.ok(spy.calledOnceWithExactly(true), "Focus should be forwarded after the carousel");
	});

	QUnit.test("TAB on page with interactive content", function (assert) {
		// Arrange
		var spy = this.spy(this.oCarousel, "_forwardTab");

		this.oCarousel.setActivePage("keyTestPage2");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.TAB);

		// Assert
		assert.ok(spy.notCalled, "Focus should NOT be forwarded after the carousel");
	});

	QUnit.test("TAB on non-active page with interactive content", function (assert) {
		// Arrange
		this.oCarousel.setCustomLayout(new CarouselLayout({
			visiblePagesCount: 3
		}));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		var spy = this.spy(this.oCarousel, "_forwardTab");

		this.oCarousel.setActivePage("keyTestPage1");

		// focus second page
		this.oCarousel.onsapright({
			target: this.oCarousel.getDomRef(this.oCarousel.getActivePage() + "-slide"),
			preventDefault: function () {}
		});

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.TAB);

		// Assert
		assert.ok(spy.notCalled, "Focus should NOT be forwarded after the carousel");
	});

	QUnit.test("TAB on last interactive element within page", function (assert) {
		// Arrange
		var spy = this.spy(this.oCarousel, "_forwardTab");
		this.oCarousel.setActivePage("keyTestPage2");

		var oLastInteractiveElement = this.oCarousel.getPages()[1].getContent()[2].getDomRef();
		oLastInteractiveElement.focus();

		// Act
		qutils.triggerKeydown(oLastInteractiveElement, KeyCodes.TAB);

		// Assert
		assert.ok(spy.calledOnceWithExactly(true), "Focus should be forwarded after the carousel");
	});

	QUnit.test("Shift + TAB on the active page", function (assert) {
		// Arrange
		var spy = this.spy(this.oCarousel, "_forwardTab");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.TAB, /* shift */ true);

		// Assert
		assert.ok(spy.calledOnceWithExactly(false), "Focus should be forwarded before the carousel");
	});

	QUnit.test("Shift + TAB on the element after the carousel", function (assert) {
		// Arrange
		var spy = this.spy(this.oCarousel, "_focusPrevious");
		var focusSpy = this.spy(this.oCarousel.getFocusDomRef(), "focus");

		var oBtn = document.createElement("button");
		this.oCarousel.getDomRef().insertAdjacentElement("afterend", oBtn);
		oBtn.focus();

		// Act
		qutils.triggerKeydown(oBtn, KeyCodes.TAB, /* shift */ true);
		this.oCarousel.onfocusin(new jQuery.Event("focusin", {
			target: this.oCarousel.getDomRef("after"),
			relatedTarget: oBtn
		}));

		// Assert
		assert.ok(spy.called, "Should try to focus the last interactive element");
		assert.ok(focusSpy.called, "Last interactive element in the carousel should be focused");

		// Clean up
		oBtn.remove();
	});

	QUnit.test("F6", function (assert) {
		var oSpy = this.spy(F6Navigation, "handleF6GroupNavigation");
		// Act
		qutils.triggerKeydown(this.oCarousel.$(this.oCarousel.getActivePage() + "-slide"), KeyCodes.F6);

		// Assert
		assert.ok(oSpy.callCount >= 1, "Last active page index should be preserved.");
	});

	QUnit.test("F6 focusing on next focusable group", function (assert) {
		var oActivePageDomRef = this.oCarousel.getDomRef(this.oCarousel.getActivePage() + "-slide");

		// Assert
		assert.ok(oActivePageDomRef === document.activeElement, "Current focus is on the Carousel");

		// Act
		qutils.triggerKeydown(oActivePageDomRef, KeyCodes.F6);

		// Assert
		assert.ok(oActivePageDomRef !== document.activeElement, "F6 is focusing on the next group");
	});

	QUnit.test("Shift + F6 focusing on previous focusable group", function (assert) {
		var oActivePageDomRef = this.oCarousel.getDomRef(this.oCarousel.getActivePage() + "-slide");

		// Assert
		assert.ok(oActivePageDomRef === document.activeElement, "Current focus is on the Carousel");

		// Act
		qutils.triggerKeydown(oActivePageDomRef, KeyCodes.F6, /* shift */ true);

		// Assert
		assert.ok(oActivePageDomRef !== document.activeElement, "Shift + F6 is focusing on the previous group");
	});

	QUnit.test("F7", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage2");
		this.oCarousel.getFocusDomRef().focus();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var oInteractiveElementInsidePage = this.oCarousel.getPages()[1].getContent()[2].getDomRef();
		qutils.triggerKeydown(document.activeElement, KeyCodes.TAB);
		qutils.triggerEvent("focusin", oInteractiveElementInsidePage);

		// Act
		qutils.triggerKeydown(oInteractiveElementInsidePage, KeyCodes.F7);

		// Assert
		assert.strictEqual(document.activeElement, this.oCarousel.getFocusDomRef(), "After F7 focus is on the page");

		// Act
		qutils.triggerKeydown(document.activeElement, KeyCodes.F7);

		// Assert
		assert.strictEqual(document.activeElement, oInteractiveElementInsidePage, "After F7 focus is back to the last focused element inside the page");
	});

	QUnit.test("Numpad Minus", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage2");

		// Act
		qutils.triggerKeydown(this.oCarousel.getFocusDomRef(), KeyCodes.NUMPAD_MINUS);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage3");
	});

	QUnit.test("Numpad Plus", function (assert) {
		// Arrange
		this.oCarousel.setActivePage("keyTestPage1");

		// Act
		qutils.triggerKeydown(this.oCarousel.getFocusDomRef(), KeyCodes.NUMPAD_PLUS);

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage2", "active page is keyTestPage3");
	});


	QUnit.test("Arrow right should set the focus on the second element", function (assert) {
		// arrange
		const oFirstPage = this.oCarousel.getPages()[0];
		this.oCarousel.setActivePage(oFirstPage);
		this.oCarousel.onsapright({
			target: this.oCarousel.getDomRef(this.oCarousel.getActivePage() + "-slide"),
			preventDefault: function () {}
		});
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.strictEqual(document.activeElement, this.oCarousel.getFocusDomRef(), "Focus is on the second element");
	});

	QUnit.test("Home button should focus the first element", function (assert) {
		// arrange
		const oSecondPage = this.oCarousel.getPages()[2];
		this.oCarousel.setActivePage(oSecondPage);
		this.oCarousel.onsaphome({
			target: this.oCarousel.getDomRef(this.oCarousel.getActivePage() + "-slide"),
			preventDefault: function () {}
		});
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.strictEqual(document.activeElement, this.oCarousel.getFocusDomRef(), "Focus is on the first element");
	});

	QUnit.test("End button should focus the last element", function (assert) {
		// arrange
		const oSecondPage = this.oCarousel.getPages()[2];
		this.oCarousel.setActivePage(oSecondPage);
		this.oCarousel.onsapend({
			target: this.oCarousel.getDomRef(this.oCarousel.getActivePage() + "-slide"),
			preventDefault: function () {}
		});
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.ok(document.activeElement.contains(this.oCarousel.getFocusDomRef()), "Focus is on the last element");
	});


	QUnit.test("setActivePage should not change the focus of the application", function (assert) {
		// arrange
		var aPages = this.oCarousel.getPages();
		this.oButton.focus();

		// act
		this.oCarousel.setActivePage(aPages[0]);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.strictEqual(document.activeElement, this.oButton.getFocusDomRef(), "Focus should stay on the button");


	});

	//================================================================================
	// End of Carousel Keyboard handling
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
		nextUIUpdate.runSync()/*fake timer is used in module*/;
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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var	oSystem = {
			desktop: true,
			phone: false,
			tablet: false,
			touch: false
		};

		this.stub(Device, "system").value(oSystem);
		oCarousel.setActivePage("image2");

		// Act
		oPopup.openBy(oButton);
		assert.strictEqual(oCarousel.getActivePage(), "image2", "active page is with id 'image2'");
		oCarousel.$().find('.sapMCrslNext').trigger("focus");
		oCarousel._changeActivePage(2);
		// Assert
		assert.strictEqual(oCarousel.getActivePage(), "image3", "active page is with id 'image3'");

		// Cleanup
		oCarousel.destroy();
		oPopup.destroy();
		oButton.destroy();
	});

	QUnit.module("Error page", {
		before: function() {
			sinon.config.useFakeTimers = false;
		},
		beforeEach: function () {
			this.data = {
				texts : [ {
					text : "Travel Expend"
				}, {
					text : "Travel and expense report"
				}, {
					text : "Expense report"
				}]
			};

			this.oCarousel = new Carousel();
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oCarousel.destroy();
		},
		after: function() {
			sinon.config.useFakeTimers = true;
		}
	});

	QUnit.test("Wrong Binding", function (assert) {
		var oModel = new JSONModel();
		this.oCarousel.setModel(oModel);
		oModel.setData(this.data);

		this.oCarousel.bindAggregation("pages",{path:"/wrongPath", template:new Text({text: "{text}"})});

		assert.strictEqual(this.oCarousel.getPages().length, 0, "There are no pages in the carousel when the binding is wrong (or other similar issue)");
		assert.strictEqual(this.oCarousel.getDomRef().getElementsByClassName("sapMIllustratedMessage").length, 1, "When there is wrong binding path there is sap.m.IllustratedMessage rendered");
		assert.strictEqual(this.oCarousel.getDomRef().getElementsByClassName("sapMCrslInnerNoPages").length, 1, "When there is wrong binding path there is 'sapMCrslInnerNoPages' class applied");
	});


	QUnit.test("Late Binding", function (assert) {
		var done = assert.async();

		var oModel = new JSONModel();
		this.oCarousel.setModel(oModel);

		this.oCarousel.bindAggregation("pages", {path:"/texts", template: new Text({text: "{text}"})});

		setTimeout(function () {
			oModel.setData(this.data);
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			assert.strictEqual(this.oCarousel.getPages().length, 3, "There are 3 pages in the carousel");
			assert.strictEqual(this.oCarousel.getDomRef().getElementsByClassName("sapMIllustratedMessage").length, 0, "When there is late binding there is no sap.m.IllustratedMessage rendered");
			assert.strictEqual(this.oCarousel.getDomRef().getElementsByClassName("sapMCrslInnerNoPages").length, 0, "When there is late binding there is no 'sapMCrslInnerNoPages' class applied");
			done();
		}.bind(this), 1000);
	});

	QUnit.module("Change images", {
		beforeEach: function() {
			sinon.config.useFakeTimers = false;
			this.oCarousel = createCarouselWithContent("");
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oCarousel.destroy();
			sinon.config.useFakeTimers = true;
		}
	});

	QUnit.test("Simulate click on image within slide should prevent it's drag event resulting in normal swiping behaviour", function (assert) {
		// Arrange
		var oImageElement = document.createElement("img"),
			oFakeEvent = {
				target: oImageElement,
				isMarked: function() {}
			};

		// Act
		this.oCarousel.ontouchstart(oFakeEvent);

		// Assert
		assert.strictEqual(oImageElement.draggable, false, "Image shouldn't be draggable");
	});

	QUnit.module("Text selection inside carousel", {
		beforeEach: function() {
			sinon.config.useFakeTimers = false;
			const oInput = new Input({
				value: "sample text"
			});

			const oPage = new Page({
				content: [oInput]
			});

			this.oCarousel = new Carousel("crslWithInput", {
				pages: [oPage]
			});

			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oCarousel.destroy();
			sinon.config.useFakeTimers = true;
		}
	});


	QUnit.test("Testing if drag event is triggered on text/input selection", function(assert) {
		// Arrange
		const oInput = this.oCarousel.getPages()[0].getContent()[0],
			oInputDomRef = oInput.getFocusDomRef();

		//Act
		this.oCarousel.ontouchstart( {
			target: oInputDomRef,
			isMarked: function() {},
			setMarked: function() {}
		});

		// Assert
		assert.notOk(this.oCarousel._bDragging, "Dragging is not started.");
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
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oCarousel.destroy();
		}
	});

	QUnit.test("Simulate right arrow twice", function (assert) {
		// arrange
		var aPageChangedParameters = [];

		this.oCarousel.attachPageChanged(function (oEvent) {
			aPageChangedParameters.push(oEvent.mParameters);
		});

		// act
		this.oCarousel.onsapright({
			target: this.oCarousel.getDomRef(this.oCarousel.getActivePage() + "-slide"),
			preventDefault: function () {}
		});

		this.oCarousel.onsapright({
			target: this.oCarousel.getDomRef(this.oCarousel.getActivePage() + "-slide"),
			preventDefault: function () {}
		});

		// assert
		assert.strictEqual(aPageChangedParameters[0].oldActivePageId, "keyTestPage_4", "Should have event fired with transition from page #4...");
		assert.strictEqual(aPageChangedParameters[0].newActivePageId, "keyTestPage_5", "... to page #5");

		assert.strictEqual(aPageChangedParameters[1].oldActivePageId, "keyTestPage_5", "Should have event fired with transition from page #5...");
		assert.strictEqual(aPageChangedParameters[1].newActivePageId, "keyTestPage_6", "... to page #6");

		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_6", "Finally the active page should be #6");
	});

	QUnit.test("Simulate left arrow twice", function (assert) {
		// arrange
		var aPageChangedParameters = [];

		this.oCarousel.attachPageChanged(function (oEvent) {
			aPageChangedParameters.push(oEvent.mParameters);
		});

		// act
		this.oCarousel.onsapleft({
			target: this.oCarousel.getDomRef(this.oCarousel.getActivePage() + "-slide"),
			preventDefault: function () {}
		});
		this.oCarousel.onsapleft({
			target: this.oCarousel.getDomRef(this.oCarousel.getActivePage() + "-slide"),
			preventDefault: function () {}
		});

		// assert
		assert.strictEqual(aPageChangedParameters[0].oldActivePageId, "keyTestPage_4", "Should have event fired with transition from page #4...");
		assert.strictEqual(aPageChangedParameters[0].newActivePageId, "keyTestPage_3", "... to page #3");

		assert.strictEqual(aPageChangedParameters[1].oldActivePageId, "keyTestPage_3", "Should have event fired with transition from page #3...");
		assert.strictEqual(aPageChangedParameters[1].newActivePageId, "keyTestPage_2", "... to page #2");

		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_2", "Finally the active page should be #2");
	});

	QUnit.test("Looping right with keys when visiblePagesCount is different than 1", function (assert) {
		// arrange
		this.oCarousel.setLoop(true);
		this.oCarousel.setCustomLayout(new CarouselLayout({
			visiblePagesCount: 2
		}));

		var oFakeEvent = {
			target: this.oCarousel.getDomRef(this.oCarousel.getActivePage() + "-slide"),
			preventDefault: function () {}
		};
		var oExpectedActivePage = this.oCarousel.getPages()[this.oCarousel.getPages().length - 2];

		// act - press right arrow 5 times
		for (var i = 0; i < 5; i++) {
			this.oCarousel.onsapright(oFakeEvent);
		}

		// assert
		assert.strictEqual(this.oCarousel.getActivePage(), oExpectedActivePage.getId(), "Active page should be keyTestPage_8 and a loop should NOT have happened.");
	});

	QUnit.test("Looping left with keys when visiblePagesCount is different than 1", function (assert) {
		// arrange
		this.oCarousel.setLoop(true);
		this.oCarousel.setCustomLayout(new CarouselLayout({
			visiblePagesCount: 2
		}));

		var oFakeEvent = {
			target: this.oCarousel.getDomRef(this.oCarousel.getActivePage() + "-slide"),
			preventDefault: function () {}
		};
		var oFirstPage = this.oCarousel.getPages()[0];

		// act - press left arrow 10 times
		for (var i = 0; i < 10; i++) {
			this.oCarousel.onsapleft(oFakeEvent);
		}

		// assert
		assert.strictEqual(this.oCarousel.getActivePage(), oFirstPage.getId(), "Active page should still be keyTestPage_1 and loop should NOT have happened.");
	});

	QUnit.test("Looping right with mouse when visiblePagesCount is different than 1", function (assert) {
		// arrange
		this.oCarousel.setLoop(true);
		this.oCarousel.setCustomLayout(new CarouselLayout({
			visiblePagesCount: 2
		}));
		var oExpectedActivePage = this.oCarousel.getPages()[this.oCarousel.getPages().length - 2];
		this.oCarousel.setActivePage(oExpectedActivePage);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act - press right arrow
		pressArrowNext(this.oCarousel);

		// assert
		assert.strictEqual(this.oCarousel.getActivePage(), oExpectedActivePage.getId(), "Active page should still be keyTestPage_8 and loop should NOT have happened.");
	});

	QUnit.test("Looping left with mouse when visiblePagesCount is different than 1", function (assert) {
		// arrange
		this.oCarousel.setLoop(true);
		this.oCarousel.setCustomLayout(new CarouselLayout({
			visiblePagesCount: 2
		}));
		var oFirstPage = this.oCarousel.getPages()[0];
		this.oCarousel.setActivePage(oFirstPage);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act - press left arrow
		pressArrowPrev(this.oCarousel);

		// assert
		assert.strictEqual(this.oCarousel.getActivePage(), oFirstPage.getId(), "Active page should be keyTestPage_1 and a loop should NOT have happened.");
	});

	QUnit.test("Scroll through view", function (assert) {
		// arrange
		this.oCarousel.setLoop(true);
		this.oCarousel.setCustomLayout(new CarouselLayout({
			visiblePagesCount: 2,
			scrollMode: "VisiblePages"
		}));
		const oFirstPage = this.oCarousel.getPages()[0];
		const oThirdPage = this.oCarousel.getPages()[2];
		this.oCarousel.setActivePage(oFirstPage);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act - press left arrow
		pressArrowNext(this.oCarousel);

		// assert
		assert.strictEqual(this.oCarousel.getActivePage(), oThirdPage.getId(), "Active page should be keyTestPage_3, scrolled trough one view of 2 pages.");
	});

	QUnit.test("Simulate right arrow fast click twice", function (assert) {
		// act
		pressArrowNext(this.oCarousel);
		pressArrowNext(this.oCarousel);

		// assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_6", "Should have the active page set to page #4...");
	});

	QUnit.test("Simulate left arrow fast click twice", function (assert) {
		// act
		pressArrowPrev(this.oCarousel);
		pressArrowPrev(this.oCarousel);

		// assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_2", "Should have the active page set to page #2...");
	});

	QUnit.test("Focusing page child with mouse should store the page as focused page", function (assert) {
		// arrange
		var oButton = new Button();
		this.oCarousel.insertPage(oButton, 2);
		var aPages = this.oCarousel.getPages();
		this.oCarousel.setCustomLayout(new CarouselLayout({
			visiblePagesCount: 3
		}));
		this.oCarousel.setActivePage(aPages[0]);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act
		oButton.$().trigger("focusin");

		// assert
		assert.strictEqual(this.oCarousel._iFocusedPageIndex, 2, "Focused page index should be stored");
	});

	QUnit.module("No pages", {
		beforeEach: function () {
			this.oCarousel = new Carousel({
			});
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oCarousel.destroy();
		}
	});

	QUnit.test("carousel.invalidate() doesn't throw error", function (assert) {
		this.oCarousel.invalidate();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		this.clock.tick(100);

		assert.ok(true, 'error is not thrown');
	});

	QUnit.test("resize handler doesn't throw error", function (assert) {
		this.oCarousel._resize();

		assert.ok(true, 'error is not thrown');
	});

	QUnit.module("Active pages in nested carousels", {
		beforeEach: function () {
			this.oOuterCarousel = new Carousel();
			this.oInnerCarousel = new Carousel({
				id: "innerCarousel",
				height: '25%',
				width: '50%'
			});

			var text1 = new Text({
				id: "text1",
				text: 'text1'
			});
			var text2 = new Text({
				id: "text2",
				text: 'text2'
			});
			var text3 = new Text({
				id: "text3",
				text: 'text3'
			});

			this.oOuterCarousel.insertPage(text1);
			this.oOuterCarousel.insertPage(this.oInnerCarousel);
			this.oInnerCarousel.insertPage(text3);
			this.oInnerCarousel.insertPage(text2);
			this.oOuterCarousel.setActivePage(this.oOuterCarousel.getPages()[0]);
			this.oOuterCarousel.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oOuterCarousel.destroy();
			this.oInnerCarousel.destroy();
		}
	});

	QUnit.test("The inner carousel active page is still visible on outer carousel page change", function (assert) {
		// arrange
		var sContentSelector = ".sapMCrslInner > .sapMCrslActive";
		assert.strictEqual(this.oInnerCarousel.$().find(sContentSelector).length > 0, true, "Inner carousel has visible active page");

		// act
		pressArrowNext(this.oOuterCarousel);
		pressArrowPrev(this.oOuterCarousel);

		// assert
		assert.strictEqual(this.oInnerCarousel.$().find(sContentSelector).length > 0, true, "Inner carousel has visible active page after outer carousel page change");
	});

	QUnit.module("Accessibility", {
		beforeEach: function () {
			this.oCarousel = new Carousel({
				id: "crsl",
				height: '25%',
				width: '50%',
				pages: [
					new Text({
						id: "text1",
						text: 'text1'
					}),
					new Text({
						id: "text2",
						text: 'text2'
					}),
					new Text({
						id: "text3",
						text: 'text3'
					})
				]
			});

			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oCarousel.destroy();
		}
	});

	QUnit.test("aria-selected should be set correctly", function (assert) {
		// Assert
		assert.strictEqual(document.getElementById("crsl-text1-slide").getAttribute("aria-selected"), "true", "Active page should have aria-selected = true");
		assert.strictEqual(document.getElementById("crsl-text1-slide").getAttribute("role"), "option", "Role of a carousel item should be option");
		assert.strictEqual(document.getElementById("crsl-text1-slide").getAttribute("aria-posinset"), "1", "Posinset should be 1");
		assert.strictEqual(document.getElementById("crsl-text1-slide").getAttribute("aria-setsize"), "3", "Setsize should be 3");
		assert.strictEqual(document.getElementById("crsl-text1-slide").getAttribute("aria-hidden"), "false", "Displayed page should have aria-hidden = false");


		// Act
		this.oCarousel.next();

		// Assert
		assert.strictEqual(document.getElementById("crsl-text1-slide").getAttribute("aria-selected"), "false", "Non active page should have aria-selected = false");
		assert.strictEqual(document.getElementById("crsl-text1-slide").getAttribute("aria-hidden"), "true", "Not displayed page should have aria-hidden = true");
		assert.strictEqual(document.getElementById("crsl-text2-slide").getAttribute("aria-selected"), "true", "Active page should have aria-selected = true");
		assert.strictEqual(document.getElementById("crsl-text2-slide").getAttribute("aria-posinset"), "2", "Posinset should be 2");
		assert.strictEqual(document.getElementById("crsl-text2-slide").getAttribute("aria-hidden"), "false", "Displayed page should have aria-hidden = false");
	});

	QUnit.test("Dummy area", function (assert) {
		// arrange
		assert.strictEqual(this.oCarousel.$().find(".sapMCrslDummyArea").attr("role"), "none", "Dummy area has role=none");
	});

	QUnit.test("When there are no pages, 'No Data' element is rendered with correct aria attributes", function (assert) {
		// arrange
		this.oCarousel.destroyPages();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		var oNoData = this.oCarousel.getDomRef("noData");
		var oAccInfo = this.oCarousel._getEmptyPage().getAccessibilityInfo();
		var sExpectedLabel = oAccInfo.type + " " + oAccInfo.description;

		// assert
		assert.strictEqual(oNoData.getAttribute("tabIndex"), "0", "'No Data' element should be focusable");
		assert.strictEqual(oNoData.getAttribute("aria-label"), sExpectedLabel, "'aria-label' should be correct");
	});

	QUnit.module("Multiple pages", {
		beforeEach: function () {
			this.oCarousel = new Carousel("myCrsl", {
				customLayout: new CarouselLayout({
					visiblePagesCount: 3
				}),
				pages: [
					new Page("page1"),
					new Page("page2"),
					new Page("page3"),
					new Page("page4"),
					new Page("page5"),
					new Page("page6"),
					new Page("page7"),
					new Page("page8"),
					new Page("page9")
				]
			});
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oCarousel.destroy();
		}
	});

	QUnit.test("Page indicator text updates after keyboard navigation when multiple pages are displayed", function (assert) {
		// arrange
		var $pageIndicator = this.oCarousel.$("pageIndicator");
		var rb = Library.getResourceBundleFor("sap.m");

		// assert
		assert.strictEqual($pageIndicator.text(), rb.getText("CAROUSEL_PAGE_INDICATOR_TEXT", [1, 7]), "Page indicator text should be correct");

		// act
		qutils.triggerKeydown(this.oCarousel.getFocusDomRef(), KeyCodes.ARROW_RIGHT); // go to page2

		// assert
		assert.strictEqual($pageIndicator.text(), rb.getText("CAROUSEL_PAGE_INDICATOR_TEXT", [1, 7]), "Page indicator text should be correct");

		// act
		qutils.triggerKeydown(this.oCarousel.getFocusDomRef(), KeyCodes.ARROW_RIGHT); // go to page3
		qutils.triggerKeydown(this.oCarousel.getFocusDomRef(), KeyCodes.ARROW_RIGHT); // go to page4

		// assert
		assert.strictEqual($pageIndicator.text(), rb.getText("CAROUSEL_PAGE_INDICATOR_TEXT", [2, 7]), "Page indicator text should be correct");

		// act
		qutils.triggerKeydown(this.oCarousel.getFocusDomRef(), KeyCodes.END); // go to the last page 9

		// assert
		assert.strictEqual($pageIndicator.text(), rb.getText("CAROUSEL_PAGE_INDICATOR_TEXT", [7, 7]), "Page indicator text should be correct");

		// act - go backwards
		qutils.triggerKeydown(this.oCarousel.getFocusDomRef(), KeyCodes.ARROW_LEFT); // go to page8

		// assert
		assert.strictEqual($pageIndicator.text(), rb.getText("CAROUSEL_PAGE_INDICATOR_TEXT", [7, 7]), "Page indicator text should be correct");

		// act
		qutils.triggerKeydown(this.oCarousel.getFocusDomRef(), KeyCodes.ARROW_LEFT); // go to page7
		qutils.triggerKeydown(this.oCarousel.getFocusDomRef(), KeyCodes.ARROW_LEFT); // go to page6
		qutils.triggerKeydown(this.oCarousel.getFocusDomRef(), KeyCodes.ARROW_LEFT); // go to page5
		qutils.triggerKeydown(this.oCarousel.getFocusDomRef(), KeyCodes.ARROW_LEFT); // go to page4
		qutils.triggerKeydown(this.oCarousel.getFocusDomRef(), KeyCodes.ARROW_LEFT); // go to page3
		qutils.triggerKeydown(this.oCarousel.getFocusDomRef(), KeyCodes.ARROW_LEFT); // go to page2

		// assert
		assert.strictEqual($pageIndicator.text(), rb.getText("CAROUSEL_PAGE_INDICATOR_TEXT", [2, 7]), "Page indicator text should be correct");

		// act - go backwards
		qutils.triggerKeydown(this.oCarousel.getFocusDomRef(), KeyCodes.ARROW_LEFT); // go to page1

		// assert
		assert.strictEqual($pageIndicator.text(), rb.getText("CAROUSEL_PAGE_INDICATOR_TEXT", [1, 7]), "Page indicator text should be correct");
	});

	QUnit.test("HUD arrows visibility when multiple pages are displayed", function (assert) {
		// assert
		assert.ok(this.oCarousel.$("hud").hasClass(Carousel._LEFTMOST_CLASS), "Left arrow should be hidden");
		assert.notOk(this.oCarousel.$("hud").hasClass(Carousel._RIGHTMOST_CLASS), "Right arrow should be visible");

		// act
		this.oCarousel.setActivePage("page4");

		// assert
		assert.notOk(this.oCarousel.$("hud").hasClass(Carousel._LEFTMOST_CLASS), "Left arrow should be visible");
		assert.notOk(this.oCarousel.$("hud").hasClass(Carousel._RIGHTMOST_CLASS), "Right arrow should be visible");

		// act
		this.oCarousel.setActivePage("page9");

		// assert
		assert.notOk(this.oCarousel.$("hud").hasClass(Carousel._LEFTMOST_CLASS), "Left arrow should be visible");
		assert.ok(this.oCarousel.$("hud").hasClass(Carousel._RIGHTMOST_CLASS), "Right arrow should be hidden");
	});

	QUnit.test("Arrows in the Page Indicator area visibility when multiple pages are displayed", function (assert) {
		this.oCarousel.setArrowsPlacement("PageIndicator");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.ok(this.oCarousel.$("arrow-previous").hasClass(Carousel._LEFTMOST_CLASS), "Left arrow should be hidden");
		assert.notOk(this.oCarousel.$("arrow-next").hasClass(Carousel._RIGHTMOST_CLASS), "Right arrow should be visible");

		// act
		this.oCarousel.setActivePage("page4");

		// assert
		assert.notOk(this.oCarousel.$("arrow-previous").hasClass(Carousel._LEFTMOST_CLASS), "Left arrow should be visible");
		assert.notOk(this.oCarousel.$("arrow-next").hasClass(Carousel._RIGHTMOST_CLASS), "Right arrow should be visible");

		// act
		this.oCarousel.setActivePage("page9");

		// assert
		assert.notOk(this.oCarousel.$("arrow-previous").hasClass(Carousel._LEFTMOST_CLASS), "Left arrow should be visible");
		assert.ok(this.oCarousel.$("arrow-next").hasClass(Carousel._RIGHTMOST_CLASS), "Right arrow should be hidden");
	});

	QUnit.test("setActivePage() leads to 'pageChanged' event when multiple pages are displayed", function (assert) {
		// arrange
		assert.expect(3);

		this.oCarousel.attachPageChanged(function (oEvent) {
			assert.strictEqual(oEvent.getParameter("oldActivePageId"), "page1");
			assert.strictEqual(oEvent.getParameter("newActivePageId"), "page2");
			assert.deepEqual(oEvent.getParameter("activePages"), [1, 2, 3]);
		});

		// act
		this.oCarousel.setActivePage("page2");
	});

	QUnit.test("After setActivePage() the active page indexes are updated - BCP: 2280200416", function (assert) {
		// assert
		assert.deepEqual(this.oCarousel._aAllActivePagesIndexes, [0, 1, 2], "Active pages indexes are initially correct");

		// act
		this.oCarousel.setActivePage("page2");

		// assert
		assert.deepEqual(this.oCarousel._aAllActivePagesIndexes, [1, 2, 3], "Active pages indexes are updated");
	});

	QUnit.test("Attributes of active page are correctly set on initial rendering,s when multiple pages are displayed", function (assert) {
		// arrange
		var oPage2 = new Page();
		var oCarousel = new Carousel({
			customLayout: new CarouselLayout({
				visiblePagesCount: 2
			}),
			pages: [
				new Page(),
				oPage2,
				new Page(),
				new Page(),
				new Page()
			],
			activePage: oPage2
		});
		oCarousel.placeAt(DOM_RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var oPage2DomRef = oCarousel.getDomRef(oPage2.getId() + "-slide");

		// assert
		assert.strictEqual(oPage2DomRef.tabIndex, 0, "tabIndex is correctly set");

		// clean up
		oCarousel.destroy();
	});

	QUnit.module("Carousel in a Dialog", {
		beforeEach: function () {
			this.oDialog = new Dialog({
				content: new Carousel({
					activePage: "page3",
					pages: [
						new Page("page1", {
							content: new Button({text: "Button"})
						}),
						new Page("page2", {
							content: new Button({text: "Button"})
						}),
						new Page("page3"),
						new Page("page4"),
						new Page("page5"),
						new Page("page6"),
						new Page("page7"),
						new Page("page8"),
						new Page("page9")
					]
				})
			});
		},
		afterEach: function () {
			this.oDialog.destroy();
		}
	});

	QUnit.test("'pageChanged' event", function (assert) {
		 var done = assert.async(),
			 oCarousel = this.oDialog.getContent()[0],
			 fnPageChangedSpy = sinon.spy(oCarousel, 'firePageChanged');

		this.oDialog.attachAfterOpen(function () {
			this.oDialog._setInitialFocus();
			assert.ok(fnPageChangedSpy.notCalled, "pageChanged event is not fired");
			fnPageChangedSpy.restore();
			done();

		}.bind(this));

		this.oDialog.open();
		this.clock.tick(3000);
	});

	QUnit.module("Focus on element", {
		beforeEach: function () {
			this.oCarousel = new Carousel("myCrsl", {
				pages: [
					new Page("page1"),
					new Page("page2"),
					new Page("page3")
				]
			});
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oCarousel.destroy();
		}
	});

	QUnit.test("Focus on multiInput element", function (assert) {
		this.oCarousel.setCustomLayout(new CarouselLayout({
			visiblePagesCount: 3
		}));

		assert.strictEqual(this.oCarousel._getPageIndex(), 0, "Page indexing does not return undefined");
	});

	QUnit.test("Focused element when focus enters the carousel via page indicator arrow press", function (assert) {
		assert.notStrictEqual(document.activeElement, this.oCarousel, "Focus is not in the carousel");

		// act
		pressArrowNext(this.oCarousel);
		assert.strictEqual(document.activeElement, this.oCarousel.getFocusDomRef(), "Focused element should be correct");
	});

	QUnit.test("Focus carousel that is not rendered", function (assert) {
		const carousel = new Carousel({
			pages: [
				new Page()
			]
		});

		try {
			carousel.focus();
			assert.ok(true, "Exception is not thrown");
		} catch (e) {
			assert.ok(false, "Exception is not thrown");
		}

		carousel.destroy();
	});

	QUnit.test("Focus carousel that has no pages initially", function (assert) {
		const carousel = new Carousel({
			pages: []
		});
		carousel.placeAt(DOM_RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// act
		carousel.focus();
		assert.strictEqual(document.activeElement, carousel.getDomRef("noData"), "'No data' element should be focused");

		carousel.addPage(new Page());
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		try {
			carousel.focus();
			assert.ok(true, "Exception is not thrown");
		} catch (e) {
			assert.ok(false, "Exception is not thrown");
		}

		carousel.destroy();
	});
});
