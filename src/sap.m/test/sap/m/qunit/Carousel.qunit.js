/*global QUnit,sinon */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/Carousel",
	"sap/m/CarouselLayout",
	"sap/m/library",
	"sap/m/Image",
	"sap/m/Page",
	"sap/m/Button",
	"sap/ui/events/KeyCodes",
	"sap/ui/Device",
	"sap/m/ResponsivePopover",
	"sap/ui/qunit/utils/waitForThemeApplied",
	"sap/ui/events/F6Navigation",
	"jquery.sap.global"
], function(
	qutils,
	Carousel,
	CarouselLayout,
	mobileLibrary,
	Image,
	Page,
	Button,
	KeyCodes,
	Device,
	ResponsivePopover,
	waitForThemeApplied,
	F6Navigation
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

	// use the sinon faketimers for this test

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
				new Image("keyTestPage_1" + sIdModification, {
					src: "../images/demo/nature/desert.jpg"
				}),
				new Image("keyTestPage_2" + sIdModification, {
					src: "../images/demo/nature/elephant.jpg"
				}),
				new Image("keyTestPage_3" + sIdModification, {
					src: "../images/demo/nature/fish.jpg"
				}),
				new Image("keyTestPage_4" + sIdModification, {
					src: "../images/demo/nature/forest.jpg"
				}),
				new Image("keyTestPage_5" + sIdModification, {
					src: "../images/demo/nature/huntingLeopard.jpg"
				}),
				new Image("keyTestPage_6" + sIdModification, {
					src: "../images/demo/nature/prairie.jpg"
				})
			]
		});
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
			sinon.config.useFakeTimers = false;
			this.oCarousel = createCarouselWithContent("");
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oCarousel.destroy();
			sinon.config.useFakeTimers = true;
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
		var done = assert.async();
		// Act
		this.oCarousel.next();

		// Wait for CSS animation to complete
		setTimeout(function () {
			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_2", "The active page should be 'keyTestPage_2'");
			done();
		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("offsetLeft and clientWidth of _oMobifyCarousel are calculated correctly after all animations", function (assert) {
		// Arrange
		var done = assert.async(),
			iOffset;

		assert.expect(2);

		// Act
		this.oCarousel.next();
		iOffset = this.oCarousel._oMobifyCarousel._offset;

		setTimeout(function () {
			//Assert
			assert.notEqual(iOffset, this.oCarousel._oMobifyCarousel._offset,
				"After next(), _offset of _oMobifyCarousel is changed in _update function in the next JS tick");

			// Act
			this.oCarousel.setWidth("400px");
			iOffset = this.oCarousel._oMobifyCarousel._offset;

			setTimeout(function () {
				// Assert
				assert.notEqual(iOffset, this.oCarousel._oMobifyCarousel._offset,
					"After resize, _offset of _oMobifyCarousel is changed in _update function in the next JS tick");

				done();
			}.bind(this), sinonClockTickValue);
		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("#previous()", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage_6");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			this.oCarousel.previous();

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_5", "The active page should be 'keyTestPage_5'");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("#setLoop(true) should move from last to first page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage_6");
		this.oCarousel.setLoop(true);

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			this.oCarousel.next();

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_1", "The active page should be 'keyTestPage_1'");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("#setLoop(true) should move from first to last page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage_1");
		this.oCarousel.setLoop(true);

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			this.oCarousel.previous();

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_6", "The active page should be 'keyTestPage_6'");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
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
		assert.ok(this.oCarousel.$().find('.sapMCrslPrev').attr('title'), "Prev Arrow has a tooltip");
		assert.ok(this.oCarousel.$().find('.sapMCrslNext').attr('title'), "Next Arrow has a tooltip");
	});

	QUnit.test("#setArrowsPlacement() to 'PageIndicator' position", function (assert) {
		// Act
		this.oCarousel.setArrowsPlacement(CarouselArrowsPlacement.PageIndicator);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oCarousel.$().find('.sapMCrslHud').length, 0, "Arrows hud should not be rendered");
		assert.strictEqual(this.oCarousel.$().find('.sapMCrslControls ').length, 1, "Arrows should be rendered in the 'controls' area");
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
			"The maxmimum number of pages that Carousel can show it its actual number of pages");
	});

	QUnit.test("#setCustomLayout() with no DomRef available", function (assert) {
		// Set up
		var iPagesToShow = 4,
			oDomRefStub = this.stub(this.oCarousel, "getDomRef", null),
			oMoveToPageSpy = this.spy(this.oCarousel, "_moveToPage"),
			oRerenderSpy = this.spy(this.oCarousel, "rerender");

		// Act
		this.oCarousel.setCustomLayout(new CarouselLayout({
			visiblePagesCount: iPagesToShow
		}));

		// Assert
		assert.ok(oMoveToPageSpy.notCalled, "moveToPage is not called");
		assert.ok(oRerenderSpy.notCalled, "Rerender is not called");

		// Cleanup
		oDomRefStub.restore();
		oMoveToPageSpy.restore();
		oRerenderSpy.restore();
	});

	QUnit.test("#onAfterRendering() _setWidthOfPages is not called when no customLayout aggregation is set", function (assert) {
		// Set up
		var oSetWidthOfPagesSpy = this.spy(this.oCarousel, "_setWidthOfPages");

		// Act
		this.oCarousel.onAfterRendering();

		// Assert
		assert.ok(oSetWidthOfPagesSpy.notCalled, "_setWidthOfPages is not called");

		// Cleanup
		oSetWidthOfPagesSpy.restore();
	});

	QUnit.test("#onAfterRendering() _setWidthOfPages is called with corect number of items to be shown", function (assert) {
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

		// Cleanup
		oSetWidthOfPagesSpy.restore();
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

	QUnit.test("#_adjustHUDVisibility(1) with maximum number of pages to be shown", function (assert) {
		// Set up
		var iPagesToShow = 6;

		this.oCarousel.setCustomLayout(new CarouselLayout({
			visiblePagesCount: iPagesToShow
		}));
		sap.ui.getCore().applyChanges();

		// Act
		this.oCarousel._adjustHUDVisibility(1);

		// Assert
		assert.strictEqual(this.oCarousel.$('hud').length, 0, "Hud arrows are not rendered");
	});

	QUnit.test("#_updateFocusedPagesOrder('keyTestPage_2') _aOrderOfFocusedElements collection is updated correctly when " +
		"the currently active page has already been focused before", function (assert) {
			// Set up
			this.oCarousel._aOrderOfFocusedElements = ["keyTestPage_3", "keyTestPage_4", "keyTestPage_2"];

			// Act
			this.oCarousel._updateFocusedPagesOrder("keyTestPage_2");

			// Assert
			assert.strictEqual(this.oCarousel._aOrderOfFocusedElements[0], "keyTestPage_2",
				"'keyTestPage_2' is on the first place of _aOrderOfFocusedElements collection");
			assert.strictEqual(this.oCarousel._aOrderOfFocusedElements[2], "keyTestPage_4",
			"'keyTestPage_2' is on the last place of _aOrderOfFocusedElements collection");
	});

	QUnit.test("#_updateFocusedPagesOrder('keyTestPage_2') _aOrderOfFocusedElements collection is updated correctly when " +
		"the currently active page has never been focused before", function (assert) {
			// Set up
			this.oCarousel._aOrderOfFocusedElements = ["keyTestPage_3", "keyTestPage_4"];

			// Act
			this.oCarousel._updateFocusedPagesOrder("keyTestPage_2");

			// Assert
			assert.strictEqual(this.oCarousel._aOrderOfFocusedElements[0], "keyTestPage_2",
				"'keyTestPage_2' is on the first place of _aOrderOfFocusedElements collection");
			assert.strictEqual(this.oCarousel._aOrderOfFocusedElements[2], "keyTestPage_4",
				"'keyTestPage_2' is on the last place of _aOrderOfFocusedElements collection");
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
			sap.ui.getCore().applyChanges();

			// Assert
			assert.ok(oCarousel._aAllActivePages[0] === "keyTestPage_4new" && oCarousel._aAllActivePages[1] === "keyTestPage_5new",
				"'keyTestPage_4' and 'keyTestPage_5' are the active pages' ids after Carousel is rendered");
			assert.ok(oCarousel._aAllActivePagesIndexes[0] === 3 && oCarousel._aAllActivePagesIndexes[1] === 4,
				"3 and 4 are the active pages' indexes after Carousel is rendered");

			// Clean up
			oCarousel.destroy();
	});

	QUnit.test("#_getLastFocusedActivePage() when the last focused page is still active ", function (assert) {
		// Set up
		var sResult;

		this.oCarousel._aOrderOfFocusedElements = ["keyTestPage_3", "keyTestPage_4"];
		this.oCarousel._aAllActivePages = ["keyTestPage_2", "keyTestPage_3"];

		// Act
		sResult = this.oCarousel._getLastFocusedActivePage();

		// Assert
		assert.strictEqual(sResult, "keyTestPage_3", "'keyTestPage_3' is the last focused page which is still active");
	});

	QUnit.test("#_getLastFocusedActivePage() when all focused pages are currently not active ", function (assert) {
		// Set up
		var sResult;

		this.oCarousel._aOrderOfFocusedElements = ["keyTestPage_3", "keyTestPage_4"];
		this.oCarousel._aAllActivePages = ["keyTestPage_1", "keyTestPage_2"];

		// Act
		sResult = this.oCarousel._getLastFocusedActivePage();

		// Assert
		assert.strictEqual(sResult, "keyTestPage_1", "'keyTestPage_1' is the first currently active page");
	});

	QUnit.test("#_getActivePageLastFocusedElement()", function (assert) {
		// Set up
		var sResult,
			sFocusedPage = "keyTestPage_3",
			oGetLastFocusedActivePageStub = this.stub(this.oCarousel, "_getLastFocusedActivePage", function() { return sFocusedPage; }),
			oFocusedElement = {};

			this.oCarousel._lastFocusablePageElement = {};
			this.oCarousel._lastFocusablePageElement[sFocusedPage] = oFocusedElement;

		// Act
		sResult = this.oCarousel._getActivePageLastFocusedElement();

		// Assert
		assert.strictEqual(sResult, oFocusedElement, "The correct last focused HTML element is returned for the last focused still active page");

		// Clean up
		oGetLastFocusedActivePageStub.restore();
	});

	QUnit.module("Methods", {
		beforeEach: function () {
			this.oCarousel = new Carousel({
				height: "100%",
				width: "100%",
				pages: [
					new Image("keyTestPage_1", {
						src: "../images/demo/nature/desert.jpg"
					}),
					new Image("keyTestPage_2", {
						src: "../images/demo/nature/elephant.jpg"
					}),
					new Image("keyTestPage_3", {
						src: "../images/demo/nature/fish.jpg"
					}),
					new Image("keyTestPage_4", {
						src: "../images/demo/nature/forest.jpg"
					}),
					new Image("keyTestPage_5", {
						src: "../images/demo/nature/huntingLeopard.jpg"
					}),
					new Image("keyTestPage_6", {
						src: "../images/demo/nature/prairie.jpg"
					})
				]
			});
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oCarousel.destroy();
		}
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

	QUnit.test("Destroying _oMobifyCarousel will set its _needsUpdate property to false;", function (assert) {
		// Arrange
		var oMobifyCarousel = this.oCarousel._oMobifyCarousel;

		// Assert
		assert.strictEqual(oMobifyCarousel._needsUpdate, true, "_needsUpdate property is initially true");

		// Act
		this.oCarousel.destroy();

		// Assert
		assert.strictEqual(oMobifyCarousel._needsUpdate, false, "_needsUpdate property is false after destroy");
	});

	//================================================================================
	// Carousel Events
	//================================================================================
	QUnit.module("Events", {
		beforeEach: function () {
			sinon.config.useFakeTimers = false;
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
			sinon.config.useFakeTimers = true;
		}
	});

	QUnit.test("Listen to 'pageChanged' event", function (assert) {
		// Arrange
		var bPageNewOK = false,
			bPageOldOK = false,
			bPagesNewIndexdOK = false,
			done = assert.async();

		assert.expect(3);

		this.oCarousel.attachPageChanged(function (oControlEvent) {
			bPageNewOK = oControlEvent.getParameters().oldActivePageId === "keyTestPage_2";
			bPageOldOK = oControlEvent.getParameters().newActivePageId === "keyTestPage_3";
			bPagesNewIndexdOK = oControlEvent.getParameters().activePages[0] === 2;
		});

		// Wait for CSS animation caused by activePage in constructor to complete
		setTimeout(function () {
			// Act
			this.oCarousel.next();

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.ok(bPageNewOK, "Old active page should be 'keyTestPage_2'");
				assert.ok(bPageOldOK, "New active page should be 'keyTestPage_3'");
				assert.ok(bPagesNewIndexdOK, "New page index should be 2");
				done();
			}, sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("'pageChanged' event parameters when active page is set through API", function (assert) {
		// Arrange
		var bPageNewOK = false,
			bPageOldOK = false,
			bPagesNewIndexdOK = false,
			done = assert.async();

		assert.expect(3);

		this.oCarousel.attachPageChanged(function (oControlEvent) {
			bPageNewOK = oControlEvent.getParameters().oldActivePageId === "keyTestPage_2";
			bPageOldOK = oControlEvent.getParameters().newActivePageId === "keyTestPage_4";
			bPagesNewIndexdOK = oControlEvent.getParameters().activePages[0] === 3;
		});

		// Wait for CSS animation caused by activePage in constructor to complete
		setTimeout(function () {
			// Act
			this.oCarousel.setActivePage("keyTestPage_4");

			setTimeout(function () {
				// Assert
				assert.ok(bPageNewOK, "Old active page should be 'keyTestPage_2'");
				assert.ok(bPageOldOK, "New active page should be 'keyTestPage_4'");
				assert.ok(bPagesNewIndexdOK, "New page index should be 3");
				done();
			}, sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Listen to 'beforePageChanged' event", function (assert) {
		// Arrange
		var bPagesNewIndexdOK = false,
			done = assert.async();

		assert.expect(1);

		this.oCarousel.attachBeforePageChanged(function (oControlEvent) {
			bPagesNewIndexdOK = oControlEvent.getParameters().activePages[0] === 2;
		});

		// Wait for CSS animation caused by activePage in constructor to complete
		setTimeout(function () {
			// Act
			this.oCarousel.next();

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.ok(bPagesNewIndexdOK, "New page index should be 2");
				done();
			}, sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Should fire 'pageChanged' only once when using #setActivePage() (CSN 0120061532 0001323934 2014)", function (assert) {
		// Arrange
		var done = assert.async(),
			spy = this.spy,
			oChangePageSpy,
			oUpdateActivePagesSpy;

		assert.expect(2);

		// Wait for CSS animation caused by activePage in constructor to complete
		setTimeout(function () {
			// Arrange
			oChangePageSpy = spy(this.oCarousel, "_changePage");
			oUpdateActivePagesSpy = spy(this.oCarousel, "_updateActivePages");

			// Act
			this.oCarousel.setActivePage('keyTestPage_3');

			// Wait for CSS animation to complete
			setTimeout(function () {
				assert.ok(oChangePageSpy.calledOnce, "PageChanged fired once");
				assert.ok(oUpdateActivePagesSpy.calledWith("keyTestPage_3"), "_updateActivePages is called with the correct new active page Id");

				// Reset sinon spy
				oChangePageSpy.restore();
				oUpdateActivePagesSpy.restore();
				done();
			}, sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Active page should be set when specified in constructor'", function (assert) {
		//Assert
		assert.strictEqual(this.oCarousel.getActivePage(), 'keyTestPage_2', "Active page should be 'keyTestPage_2'");
	});

	QUnit.test("When 'pageChanged' event is fired the numeric value of the page indicator should change", function (assert) {
		// Arrange
		var done = assert.async();
		var sTextBetweenNumbers = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("CAROUSEL_PAGE_INDICATOR_TEXT", [2, 9]);

		// Assert
		assert.strictEqual(document.getElementById("myCrsl-slide-number").innerHTML, sTextBetweenNumbers, "Page indicator should show '2 " + sTextBetweenNumbers + " 9'");

		// Wait for CSS animation caused by activePage in constructor to complete
		setTimeout(function () {
			// Act
			this.oCarousel.next();

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				sTextBetweenNumbers = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("CAROUSEL_PAGE_INDICATOR_TEXT", [3, 9]);
				assert.strictEqual(document.getElementById("myCrsl-slide-number").innerHTML, sTextBetweenNumbers, "Page indicator should show '3 " + sTextBetweenNumbers + " 9'");
				done();
			}, sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
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
			sinon.config.useFakeTimers = false;
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
			sinon.config.useFakeTimers = true;
		}
	});

	QUnit.test("Arrow Right", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage2");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_RIGHT);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage3", "active page is keyTestPage3");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Arrow Right on the last page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage12");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_RIGHT);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage3");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Arrow Up", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage2");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_UP);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Arrow Down last page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage12");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_DOWN);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page stays keyTestPage12");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Arrow Left", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage2");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_LEFT);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Arrow Left on first page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage1");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_LEFT);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page stays keyTestPage1");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Arrow Down", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage2");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_DOWN);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage3", "active page is keyTestPage3");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Arrow Up on first page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage1");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_UP);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page stays keyTestPage1");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("HOME", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage2");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.HOME);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("END", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage2");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.END);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("CTRL + ARROW_RIGHT", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage1");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_RIGHT, false, false, true);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage11", "active page is keyTestPage11");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("CTRL + ARROW_RIGHT less than 10 go to last page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage5");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_RIGHT, false, false, true);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("CTRL + ARROW_UP", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage1");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_UP, false, false, true);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage11", "active page is keyTestPage11");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("CTRL + ARROW_UP less than 10 go to last page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage5");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_UP, false, false, true);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("PAGE_UP", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage1");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.PAGE_UP);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage11", "active page is keyTestPage11");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("PAGE_UP on less than 10 go to last page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage5");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.PAGE_UP);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("CTRL + ARROW_LEFT", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage12");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_LEFT, false, false, true);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage2", "active page is keyTestPage2");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("CTRL + ARROW_LEFT less than 10 goes to first page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage5");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_LEFT, false, false, true);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("CTRL + ARROW_DOWN", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage2");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_DOWN, false, false, true);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("CTRL + ARROW_DOWN less than 10 goes to first page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage5");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.ARROW_DOWN, false, false, true);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("PAGE_DOWN", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage12");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.PAGE_DOWN);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage2", "active page is keyTestPage2");
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("PAGE_DOWN less than 10 goes to first page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage5");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.PAGE_DOWN);

			// Wait for CSS animation to complete
			setTimeout(function () {
				// Assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
				this.oCarousel.destroy();
				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("TAB", function (assert) {
		// Arrange
		var oImage = this.oCarousel.getPages()[5],
			iActivePage = 5;

		this.oCarousel.setActivePage(oImage);

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.TAB);

		// Assert
		assert.strictEqual(this.oCarousel._lastActivePageNumber, iActivePage, "Last active page index should be preserved.");
	});

	QUnit.test("F6", function (assert) {
		var oSpy = sinon.spy(F6Navigation, "handleF6GroupNavigation");
		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.F6);

		// Assert
		assert.ok(oSpy.callCount >= 1, "Last active page index should be preserved.");

		// Clean up
		oSpy.restore();
	});

	QUnit.test("F6 focusing on next focusable group", function (assert) {
		var done = assert.async();

		// Act
		qutils.triggerKeydown(this.oCarousel.$(), KeyCodes.F6);

		setTimeout(function () {
			// Assert
			assert.ok(this.oCarousel.getDomRef() !== document.activeElement, "F6 is focusing on the next group");

			done();
		}.bind(this), sinonClockTickValue);
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
		// Arrange
		var done = assert.async(),
			oSystem = {
			desktop: true,
			phone: false,
			tablet: false,
			touch: false
		};

		this.stub(Device, "system", oSystem);
		oCarousel.setActivePage("image2");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
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
			done();
		}, sinonClockTickValue);
	});

	return waitForThemeApplied();
});
