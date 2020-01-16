/*global QUnit,sinon,qutils*/

(function () {
	'use strict';

	var DOM_RENDER_LOCATION = "qunit-fixture";

	<!-- use the sinon faketimers for this test -->
	sinon.config.useFakeTimers = true;
	var sinonClockTickValue = 600;

	//================================================================================
	// Carousel Properties
	//================================================================================
	QUnit.module("Properties", {
		beforeEach: function () {
			this.oCarousel = new sap.m.Carousel();
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
		assert.strictEqual(this.oCarousel.getPageIndicatorPlacement(), sap.m.PlacementType.Bottom, "Default 'pageIndicatorPlacement' value is Bottom");
		assert.strictEqual(this.oCarousel.getArrowsPlacement(), sap.m.CarouselArrowsPlacement.Content, "Default 'arrowsPlacement' value is 'Content'");
	});

	//================================================================================
	// Carousel Methods
	//================================================================================
	QUnit.module("Methods", {
		beforeEach: function () {
			sinon.config.useFakeTimers = false;
			this.oCarousel = new sap.m.Carousel({
				height: "100%",
				width: "100%",
				pages: [
					new sap.m.Image("keyTestPage_1", {
						src: "../images/demo/nature/desert.jpg"
					}),
					new sap.m.Image("keyTestPage_2", {
						src: "../images/demo/nature/elephant.jpg"
					}),
					new sap.m.Image("keyTestPage_3", {
						src: "../images/demo/nature/fish.jpg"
					}),
					new sap.m.Image("keyTestPage_4", {
						src: "../images/demo/nature/forest.jpg"
					}),
					new sap.m.Image("keyTestPage_5", {
						src: "../images/demo/nature/huntingLeopard.jpg"
					}),
					new sap.m.Image("keyTestPage_6", {
						src: "../images/demo/nature/prairie.jpg"
					})
				]
			});
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
	});

	QUnit.test("#next()", function (assert) {
		// Act
		this.oCarousel.next();

		// Assert
		assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_2", "The active page should be 'keyTestPage_2'");
	});

	QUnit.test("#previous()", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage_6");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			this.oCarousel.previous();

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_5", "The active page should be 'keyTestPage_5'");
			done();

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

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_1", "The active page should be 'keyTestPage_1'");
			done();

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

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_6", "The active page should be 'keyTestPage_6'");
			done();

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
		this.oCarousel.setPageIndicatorPlacement(sap.m.PlacementType.Top);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(this.oCarousel.$().children().first().hasClass('sapMCrslControlsTop'), "Page Indicator should be on top");
	});

	QUnit.test("#setPageIndicatorPlacement() to 'bottom' position", function (assert) {
		// Act
		this.oCarousel.setPageIndicatorPlacement(sap.m.PlacementType.Bottom);

		// Assert
		assert.ok(this.oCarousel.$().children().last().hasClass('sapMCrslControlsBottom'), "Page Indicator should be at bottom");
	});

	QUnit.test("#setArrowsPlacement() to 'Content' position", function (assert) {
		// Act
		this.oCarousel.setArrowsPlacement(sap.m.CarouselArrowsPlacement.Content);

		// Assert
		assert.strictEqual(this.oCarousel.$().find('.sapMCrslHud').length, 1, "Arrows should be rendered next to the image");
	});

	QUnit.test("#setArrowsPlacement() to 'PageIndicator' position", function (assert) {
		// Act
		this.oCarousel.setArrowsPlacement(sap.m.CarouselArrowsPlacement.PageIndicator);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oCarousel.$().find('.sapMCrslHud').length, 0, "Arrows hud should not be rendered");
		assert.strictEqual(this.oCarousel.$().find('.sapMCrslControls ').length, 1, "Arrows should be rendered in the 'controls' area");
	});

	QUnit.module("Methods", {
		beforeEach: function () {
			this.oCarousel = new sap.m.Carousel({
				height: "100%",
				width: "100%",
				pages: [
					new sap.m.Image("keyTestPage_1", {
						src: "../images/demo/nature/desert.jpg"
					}),
					new sap.m.Image("keyTestPage_2", {
						src: "../images/demo/nature/elephant.jpg"
					}),
					new sap.m.Image("keyTestPage_3", {
						src: "../images/demo/nature/fish.jpg"
					}),
					new sap.m.Image("keyTestPage_4", {
						src: "../images/demo/nature/forest.jpg"
					}),
					new sap.m.Image("keyTestPage_5", {
						src: "../images/demo/nature/huntingLeopard.jpg"
					}),
					new sap.m.Image("keyTestPage_6", {
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

	//================================================================================
	// Carousel Events
	//================================================================================
	QUnit.module("Events", {
		beforeEach: function () {
			sinon.config.useFakeTimers = false;
			//carousel with 9 pages. Page Indicator will be numeric.
			this.oCarousel = new sap.m.Carousel("myCrsl", {
				pages: [
					new sap.m.Page("keyTestPage_1"),
					new sap.m.Page("keyTestPage_2"),
					new sap.m.Page("keyTestPage_3"),
					new sap.m.Page("keyTestPage_4"),
					new sap.m.Page("keyTestPage_5"),
					new sap.m.Page("keyTestPage_6"),
					new sap.m.Page("keyTestPage_7"),
					new sap.m.Page("keyTestPage_8"),
					new sap.m.Page("keyTestPage_9")
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
			done = assert.async();

		this.oCarousel.attachPageChanged(function (oControlEvent) {
			bPageNewOK = oControlEvent.getParameters().oldActivePageId == "keyTestPage_2";
			bPageOldOK = oControlEvent.getParameters().newActivePageId == "keyTestPage_3";
		});

		// Wait for CSS animation caused by activePage in constructor to complete
		setTimeout(function () {
			// Act
			this.oCarousel.next();
			// Assert
			assert.ok(bPageNewOK, "Old active page should be 'keyTestPage_2'");
			assert.ok(bPageOldOK, "New active page should be 'keyTestPage_3'");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Should fire 'pageChanged' only once when using #setActivePage() (CSN 0120061532 0001323934 2014)", function (assert) {
		// Arrange
		var done = assert.async();
		var spy = this.spy;

		// Wait for CSS animation caused by activePage in constructor to complete
		setTimeout(function () {
			// Arrange
			var oChangePageSpy = spy(this.oCarousel, "_changePage");

			// Act
			this.oCarousel.setActivePage('keyTestPage_3');

			// Assert
			assert.ok(oChangePageSpy.calledOnce, "PageChanged fired once");

			// Reset sinon spy
			this.oCarousel._changePage.restore();
			done();

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

			sTextBetweenNumbers = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("CAROUSEL_PAGE_INDICATOR_TEXT", [3, 9]);

			// Assert
			assert.strictEqual(document.getElementById("myCrsl-slide-number").innerHTML, sTextBetweenNumbers, "Page indicator should show '3 " + sTextBetweenNumbers + " 9'");
			done();

		}.bind(this), sinonClockTickValue);
	});

	//================================================================================
	// Nested Carousel
	//================================================================================
	QUnit.module("Nested Carousel", {
		beforeEach: function () {

			this.oNestedCarousel = new sap.m.Carousel({
				pages: [new sap.m.Page()]
			});

			this.oCarousel = new sap.m.Carousel({
				pages: [
					new sap.m.Page({
						content: this.oNestedCarousel
					}),
					new sap.m.Page()
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
			that = this;

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
		}
	});

	//================================================================================
	// Carousel clean up
	//================================================================================
	QUnit.module("Clean up", {
		beforeEach: function () {
			this.oCarousel = new sap.m.Carousel({
				pages: [
					new sap.m.Page("keyTestPage_1"),
					new sap.m.Page("keyTestPage_2"),
					new sap.m.Page("keyTestPage_3"),
					new sap.m.Page("keyTestPage_4")
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
		var oNotRenderedCarousel = new sap.m.Carousel();
		oNotRenderedCarousel.destroy();
		assert.strictEqual(oNotRenderedCarousel._mScrollContainerMap, undefined, "Empty Carousel's container map has been cleaned up");
	});

	//================================================================================
	// Carousel Keyboard handling
	//================================================================================
	QUnit.module("Keyboard", {
		beforeEach: function () {
			sinon.config.useFakeTimers = false;
			this.oCarousel = new sap.m.Carousel({
				pages: [
					new sap.m.Page("keyTestPage1"),
					new sap.m.Page("keyTestPage2", {
						content: [
							new sap.m.Button(),
							new sap.m.Button(),
							new sap.m.Button()
						]
					}),
					new sap.m.Page("keyTestPage3"),
					new sap.m.Page("keyTestPage4"),
					new sap.m.Page("keyTestPage5"),
					new sap.m.Page("keyTestPage6"),
					new sap.m.Page("keyTestPage7"),
					new sap.m.Page("keyTestPage8"),
					new sap.m.Page("keyTestPage9"),
					new sap.m.Page("keyTestPage10"),
					new sap.m.Page("keyTestPage11"),
					new sap.m.Page("keyTestPage12")
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
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.ARROW_RIGHT);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage3", "active page is keyTestPage3");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Arrow Right on the last page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage12");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.ARROW_RIGHT);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage3");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Arrow Up", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage2");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.ARROW_UP);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Arrow Down last page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage12");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.ARROW_DOWN);

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
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.ARROW_LEFT);
			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Arrow Left on first page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage1");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.ARROW_LEFT);

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
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.ARROW_DOWN);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage3", "active page is keyTestPage3");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Arrow Up on first page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage1");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.ARROW_UP);

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
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.HOME);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("END", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage2");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.END);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("CTRL + ARROW_RIGHT", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage1");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.ARROW_RIGHT, false, false, true);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage11", "active page is keyTestPage11");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("CTRL + ARROW_RIGHT less than 10 go to last page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage5");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.ARROW_RIGHT, false, false, true);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("CTRL + ARROW_UP", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage1");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.ARROW_UP, false, false, true);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage11", "active page is keyTestPage11");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("CTRL + ARROW_UP less than 10 go to last page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage5");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.ARROW_UP, false, false, true);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("PAGE_UP", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage1");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.PAGE_UP);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage11", "active page is keyTestPage11");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("PAGE_UP on less than 10 go to last page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage5");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.PAGE_UP);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage12", "active page is keyTestPage12");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("CTRL + ARROW_LEFT", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage12");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.ARROW_LEFT, false, false, true);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage2", "active page is keyTestPage2");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("CTRL + ARROW_LEFT less than 10 goes to first page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage5");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.ARROW_LEFT, false, false, true);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("CTRL + ARROW_DOWN", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage2");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.ARROW_DOWN, false, false, true);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("CTRL + ARROW_DOWN less than 10 goes to first page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage5");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.ARROW_DOWN, false, false, true);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
			done();
		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("PAGE_DOWN", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage12");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.PAGE_DOWN);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage2", "active page is keyTestPage2");
			done();

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("PAGE_DOWN less than 10 goes to first page", function (assert) {
		// Arrange
		var done = assert.async();
		this.oCarousel.setActivePage("keyTestPage5");

		// Wait for CSS animation caused by setActivePage to complete
		setTimeout(function () {
			// Act
			qutils.triggerKeydown(this.oCarousel.$(), jQuery.sap.KeyCodes.PAGE_DOWN);

			// Assert
			assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage1", "active page is keyTestPage1");
			this.oCarousel.destroy();
			done();

		}.bind(this), sinonClockTickValue);
	});

	//================================================================================
	// Carousel Keyboard handling
	//================================================================================
	QUnit.test("Container Padding Classes", function (assert) {
		// System under Test + Act
		var oContainer = new sap.m.Carousel({
				pages: [
					new sap.m.Page("keyTestPage20")
				]
			}),
			sContentSelector = ".sapMCrslInner > .sapMCrslItem > .sapMScrollCont > .sapMScrollContScroll",
			sResponsiveLargeSize = (sap.ui.Device.resize.width <= 1023 ? "16px" : "16px 32px"),
			sResponsiveSize = (sap.ui.Device.resize.width <= 599 ? "0px" : sResponsiveLargeSize),
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

	QUnit.module("Change pages", {
		beforeEach: function () {
			sinon.config.useFakeTimers = false;

			this.oCarousel = new sap.m.Carousel("myCrsl", {
				pages: [
					new sap.m.Page("keyTestPage_1"),
					new sap.m.Page("keyTestPage_2"),
					new sap.m.Page("keyTestPage_3"),
					new sap.m.Page("keyTestPage_4"),
					new sap.m.Page("keyTestPage_5"),
					new sap.m.Page("keyTestPage_6"),
					new sap.m.Page("keyTestPage_7"),
					new sap.m.Page("keyTestPage_8"),
					new sap.m.Page("keyTestPage_9")
				],
				activePage: "keyTestPage_4"
			});
			this.oCarousel.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oCarousel.destroy();
			sinon.config.useFakeTimers = true;
		}
	});

	QUnit.test("Simulate right arrow fast click twice", function (assert) {
		// arrange
		var oFakeEvent = {
			target: this.oCarousel.getDomRef(),
			preventDefault: function () {}
		},
		done = assert.async();

		// await the initial animation
		setTimeout(function () {
			// act
			this.oCarousel.$().find("a.sapMCrslNext").click();
			this.oCarousel.ontouchend(oFakeEvent);
			this.oCarousel.$().find("a.sapMCrslNext").click();
			this.oCarousel.ontouchend(oFakeEvent);

			setTimeout(function () {
				// assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_6", "Should have the active page set to page #4...");

				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

	QUnit.test("Simulate left arrow fast click twice", function (assert) {
		// arrange
		var oFakeEvent = {
			target: this.oCarousel.getDomRef(),
			preventDefault: function () {}
		},
		done = assert.async();

		// await the initial animation
		setTimeout(function () {
			// act
			this.oCarousel.$().find("a.sapMCrslPrev").click();
			this.oCarousel.ontouchend(oFakeEvent);
			this.oCarousel.$().find("a.sapMCrslPrev").click();
			this.oCarousel.ontouchend(oFakeEvent);

			setTimeout(function () {
				// assert
				assert.strictEqual(this.oCarousel.getActivePage(), "keyTestPage_2", "Should have the active page set to page #2...");

				done();
			}.bind(this), sinonClockTickValue);

		}.bind(this), sinonClockTickValue);
	});

})();
