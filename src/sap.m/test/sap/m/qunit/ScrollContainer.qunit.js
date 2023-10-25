/*global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/ScrollContainer",
	"sap/m/Image",
	"sap/ui/core/Core",
	"sap/ui/core/HTML",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/Device",
	"sap/m/Button",
	"sap/ui/dom/includeStylesheet",
	"require"
], function(
	Localization,
	Element,
	qutils,
	createAndAppendDiv,
	ScrollContainer,
	Image,
	Core,
	HTML,
	App,
	Page,
	Device,
	Button,
	includeStylesheet,
	require
) {
	"use strict";

	createAndAppendDiv("content");
	var pStyleLoaded = includeStylesheet({
		url: require.toUrl("./ScrollContainer.qunit.css")
	});

	var IMAGE_PATH = "test-resources/sap/m/images/";

	function intEqual(actual, expected, message) {
		QUnit.assert.equal(Math.round(actual), expected, message);
	}

	function _getMaxScrollLeft(container) {
		var oDomRef = container.getDomRef();
		if (!oDomRef) {
			return -1;
		}

		return oDomRef.scrollWidth - oDomRef.clientWidth;
	}

	function _getMaxScrollTop(container) {
		var oDomRef = container.getDomRef();
		if (!oDomRef) {
			return -1;
		}

		return oDomRef.scrollHeight - oDomRef.clientHeight;
	}

	var oSC = new ScrollContainer("sc1", {

	});

	var oSC2 = new ScrollContainer("sc2",{
		content:[
				 new Image({src: IMAGE_PATH + "SAPLogo.jpg"}),
				 new Image({src: IMAGE_PATH + "SAPUI5.png", densityAware: false}),
				 new Image({src: IMAGE_PATH + "SAPLogo.jpg"}),
				 new Image({src: IMAGE_PATH + "SAPUI5.png", densityAware: false}),
				 new Image({src: IMAGE_PATH + "SAPLogo.jpg"}),
				 new Image({src: IMAGE_PATH + "SAPUI5.png", densityAware: false}),
				 new Image({src: IMAGE_PATH + "SAPLogo.jpg"}),
				 new Image({src: IMAGE_PATH + "SAPUI5.png", densityAware: false})
				 ],
				 height: "128px",
				 width: "350px"
	});

	var oSC3 = new ScrollContainer("sc3", {
		visible: false
	});

	var bigContent = new HTML({content:"<div id='cont1'>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br></div>"});
	var bigContent2 = new HTML({content:"<div id='cont1'>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br></div>"});
	//var bigContent = new sap.ui.core.HTML({content:"<div class=\"bigContent\">abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz<br>123<br>456<br>789<br>1<br>2<br>3<br>4<br></div>"});
	var oSC4 = new ScrollContainer({
		vertical: true,
		content:[bigContent],
		height: "100px",
		width: "200px"
	});

	var oSC5 = new ScrollContainer({
		vertical: false,
		horizontal: true,
		content:[bigContent2],
		height: "100px",
		width: "200px"
	});

	// Approximation coefficient used to mimic page down and page up behaviour when [CTRL] + [RIGHT] and [CTRL] + [LEFT] is used
	var SCROLL_COEF = 0.9;

	var app = new App("app", {
		initialPage: "page1",
		pages: [
				new Page("page1", {
					title: "Page 1",
					content: [oSC, oSC2, oSC3, oSC4, oSC5]
				})
				]
	});
	app.placeAt("content");

	// helper function
	function fnWaitToRender (oControl) {
		return new Promise(function(resolve) {
			oControl.addEventDelegate({
				onAfterRendering: function() {
					window.requestAnimationFrame(function() {
						resolve();
					});
				}
			});
		});
	}


	QUnit.test("ScrollContainer rendered", function(assert) {
		assert.ok(document.getElementById("sc1"), "ScrollContainer 1 should be rendered");
		assert.ok(document.getElementById("sc2"), "ScrollContainer 2 should be rendered");
		assert.ok(!document.getElementById("sc3"), "ScrollContainer 3 should not be rendered");
		assert.ok(document.getElementById("sc1").classList.contains("sapUiScrollDelegate"), "ScrollContainer 1 is marked with sapUiScrollDelegate class");
		assert.ok(document.getElementById("sc2").classList.contains("sapUiScrollDelegate"), "ScrollContainer 2 is marked with sapUiScrollDelegate class");
	});

	// Gets the scroll position of ScrolLContainer with id: sScrollContainerId in sDirection(left/top)
	function getScrollPos(sScrollContainerId, sDirection) {
		var s,
			scrollEnablement = Element.getElementById(sScrollContainerId).getScrollDelegate(),
			aScrollPosition = null;

		if (scrollEnablement._scroller) { // iScroll
			if (Device.browser.mozilla) {
				aScrollPosition = Element.getElementById(sScrollContainerId).$().css("-moz-transform").split(" ");
				// "matrix(1, 0, 0, -99.9999, 0px, 0px)" => "99.9999,"
				s = sDirection == "left" ?  aScrollPosition[4] : aScrollPosition[5];
			} else if (Device.browser.safari || Device.browser.chrome) {
				aScrollPosition = Element.getElementById(sScrollContainerId).$().css("-webkit-transform").split(" ");
				s = sDirection == "left" ?  aScrollPosition[4] : aScrollPosition[5];
			}

			return Math.round(parseFloat(s));

		} else { // NativeMouseScroller
			sDirection == "left" ? s = Math.round(Element.getElementById(sScrollContainerId).getDomRef().scrollLeft) : s = Math.round(Element.getElementById(sScrollContainerId).getDomRef().scrollTop);
			return -s;
		}
	}

	QUnit.test("Scrolling - immediate", function(assert) {
		assert.expect(4);

		assert.equal(getScrollPos(oSC2.getId(), "left"), 0, "ScrollContainer 2 should be scrolled to position 0");
		oSC2.scrollTo(100,0,0);

		assert.equal(getScrollPos(oSC2.getId(), "left"), -100, "ScrollContainer 2 should be scrolled to position 100");
		intEqual(oSC2._oScroller._scrollX, 100, "Internally stored x scrolling position should be 100");
		intEqual(oSC2._oScroller._scrollY, 0, "Internally stored y scrolling position should be 0");
	});


	/*
	QUnit.test("Scrolling - delayed", function(assert) {
		var done = assert.async();
		assert.expect(3);

		oSC2.scrollTo(50, 0, 300);

		window.setTimeout(function(){
		 intEqual(getScrollPos(), -50, "ScrollContainer 2 should be scrolled to position 50");
		 intEqual(oSC2._oScroller._scrollX, 50, "Internally stored x scrolling position should be 50"); // TODO: this only checks iScroll's internal state; the ScrollContainer may have a different value, but this does not hurt
		 intEqual(oSC2._oScroller._scrollY, 0, "Internally stored y scrolling position should be 0");
			done();
		}, 350);
	});
	*/


	QUnit.test("Scrolling - wrong direction", function(assert) {
		assert.expect(3);

		oSC2.scrollTo(110,50,0);

		assert.equal(getScrollPos(oSC2.getId(), "left"), -110, "ScrollContainer 2 should be scrolled to position 110");

		intEqual(oSC2._oScroller._scrollX, 110, "Internally stored x scrolling position should be 110");
		intEqual(oSC2._oScroller._scrollY, 0, "Internally stored y scrolling position should be 0"); // no y scrolling possible, so 0 should be the position
	});

	QUnit.test("Rerendering after scrolling", function(assert) {
		assert.expect(3);

		oSC2.invalidate();
		Core.applyChanges();

		assert.equal(getScrollPos(oSC2.getId(), "left"), -110, "ScrollContainer 2 should be scrolled to position 110");
		intEqual(oSC2._oScroller._scrollX, 110, "Internally stored x scrolling position should be 110");
		intEqual(oSC2._oScroller._scrollY, 0, "Internally stored y scrolling position should be 0");

	});


	QUnit.test("Scroll to end", function(assert) {
		var done = assert.async();
		assert.expect(3);

		oSC2.scrollTo(9999,0,0); // try to scroll way beyond the end of the content

		window.setTimeout(function(){
			assert.equal(getScrollPos(oSC2.getId(), "left"), -650, "ScrollContainer 2 should be scrolled to position 650");
			intEqual(oSC2._oScroller._scrollX, 650, "Internally stored x scrolling position should be 650");
			intEqual(oSC2._oScroller._scrollY, 0, "Internally stored y scrolling position should be 0");

			done();
		}, 510); // need to wait because iscroll has a snap-back animation to go to the real end of the content
	});

	QUnit.test("Scrolling after resize", function(assert) {
		var done = assert.async();
		assert.expect(3);

		oSC2.$("scroll").width("1100px"); // resize the content

		window.setTimeout(function(){ // allow some time for the ResizeHandler to notice and for iscroll to be notified and to adapt
			oSC2.scrollTo(9999,0,0);  // again try to scroll way beyond the end of the content - but this time the content is a bit larger, iscroll should have noticed

			window.setTimeout(function(){
				assert.equal(getScrollPos(oSC2.getId(), "left"), -750, "ScrollContainer 2 should be scrolled to position 750");

				intEqual(oSC2._oScroller._scrollX, 750, "Internally stored x scrolling position should be 750");
				intEqual(oSC2._oScroller._scrollY, 0, "Internally stored y scrolling position should be 0");

				done();
			}, 510); // need to wait because iscroll has a snap-back animation to go to the real end of the content
		}, 300);
	});


	QUnit.test("Vertical Scroll to element", function(assert) {

		var oScrollContainer = new ScrollContainer("oSC", {
			height: "200px",
			width: "400px",
			vertical: true,
			content: [
				new HTML({
					content : "<div class=\"height800\">800px height div" +
					"<div class=\"absoluteLeft0Top200\">" +
					"<div class=\"absoluteLeft0Top200\" id=\"nestedPositioned\">XYZ</div>" +
					"</div>" +
					"</div>"
				}),
				this.oTestButton = new Button(),
				new HTML({
					content : "<div class=\"height200\">200px height div</div>"
				})
			]
		});

		oScrollContainer.placeAt("qunit-fixture");
		Core.applyChanges();

		oScrollContainer.scrollToElement(this.oTestButton);

		assert.equal(getScrollPos(oScrollContainer.getId(), "top"), -800, "ScrollContainer should be scrolled to position 800 from the top");

		oScrollContainer.scrollToElement(document.getElementById('nestedPositioned'));

		assert.equal(getScrollPos(oScrollContainer.getId(), "top"), -400, "ScrollContainer should be scrolled to position 400 from the top");

		oScrollContainer.destroy();

	});

	QUnit.test("Horisontal Scroll to element", function(assert) {

		var oScrollContainer = new ScrollContainer("oSC-2", {
			height: "200px",
			content: [
				new HTML({
					content: "<span class=\"width800inline\">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</span>"
				}),
				this.oTestButton = new Button(),
				new HTML({
					content: "<span class=\"width800inline\">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</span>"
				})
			]
		});

		oScrollContainer.placeAt("qunit-fixture");
		Core.applyChanges();

		oScrollContainer.scrollToElement(this.oTestButton.getDomRef());
		assert.equal(getScrollPos(oScrollContainer.getId(), "left"), -800, "ScrollContainer should be scrolled to position 800 from the left");

		oScrollContainer.destroy();

	});

	QUnit.test("Scrolling - bSkipElementsInScrollport API", function(assert) {

		var oScrollContainer = new ScrollContainer("oSC", {
			height: "200px",
			width: "400px",
			vertical: true,
			content: [
				new HTML({
					content : "<div class=\"height100\">100px height div" +
					"<div class=\"absoluteLeft0Top200\">" +
					"<div class=\"absoluteLeft0Top200\" id=\"nestedPositioned\">XYZ</div>" +
					"</div>" +
					"</div>"
				}),
				this.oTestButton = new Button()
			]
		}),
		bSkipElementsInScrollport = true;

		// Act
		oScrollContainer.placeAt("qunit-fixture");
		Core.applyChanges();

		oScrollContainer.scrollToElement(this.oTestButton, bSkipElementsInScrollport);

		// Assert
		assert.equal(getScrollPos(oScrollContainer.getId(), "top"), 0,
		"ScrollContainer shouldn`t be scrolled when bSkipElementsInScrollport = true and the element is already visible in the scrollcontainer view port");

		// Act
		oScrollContainer.scrollToElement(this.oTestButton, bSkipElementsInScrollport);
		// Assert
		assert.equal(getScrollPos(oScrollContainer.getId(), "top"), -100, "ScrollContainer should be scrolled as expected without the aditional parameter.");

		oScrollContainer.destroy();

	});


	QUnit.module("Overflow/Underflow", {
		beforeEach: function () {
			this.oScrollContainer = new ScrollContainer();
			this.fnOverflowChangeSpy = sinon.spy();
			this.clock = sinon.useFakeTimers();

			this.oScrollContainer.getScrollDelegate().onOverflowChange(this.fnOverflowChangeSpy);
		},
		afterEach: function () {
			this.clock.restore();
			this.oScrollContainer.destroy();
			this.fnOverflowChangeSpy = null;
		}
	});

	QUnit.test("Initial rendering with overflow", function(assert) {
		var sContainerHeight = "200px",
			bExpectedOverflowFlag = true,
			done = assert.async();

		// Setup
		this.oScrollContainer.setHeight(sContainerHeight);
		this.oScrollContainer.addContent(new HTML({
			content: '<div class="height300"></div>' // content overflows container
		}));

		fnWaitToRender(this.oScrollContainer).then(function() {
			assert.strictEqual(this.fnOverflowChangeSpy.callCount, 1, "overflowChange fired");
			assert.ok(this.fnOverflowChangeSpy.calledWith(bExpectedOverflowFlag), "overflow detected");
			done();
		}.bind(this));

		this.oScrollContainer.placeAt("qunit-fixture");
		Core.applyChanges();
	});

	QUnit.test("Initial rendering without overflow", function(assert) {
		var sContainerHeight = "200px",
			done = assert.async();

		// Setup
		this.oScrollContainer.setHeight(sContainerHeight);
		this.oScrollContainer.addContent(new HTML({
			content: '<div class="height100"></div>' // does not overflow the container
		}));

		fnWaitToRender(this.oScrollContainer).then(function() {
			assert.strictEqual(this.fnOverflowChangeSpy.callCount, 0, "overflowChange not fired");
			done();
		}.bind(this));

		this.oScrollContainer.placeAt("qunit-fixture");
		Core.applyChanges();
	});

	QUnit.test("Resize to overflow", function(assert) {
		var sContainerHeight = "200px",
			sContentHeightAfterResize = "300px", // overflows the container
			bExpectedOverflowAfterResize = true,
			done = assert.async();

		// Setup
		this.oScrollContainer.setHeight(sContainerHeight);
		this.oScrollContainer.addContent(new HTML({
			content: '<div id="innerdiv" class="height100"></div>' // does not overflow the container
		}));

		fnWaitToRender(this.oScrollContainer).then(function() {
			document.getElementById("innerdiv").style.height = sContentHeightAfterResize;
			this.clock.tick(200);
			assert.strictEqual(this.fnOverflowChangeSpy.callCount, 1, "overflowChange fired");
			assert.ok(this.fnOverflowChangeSpy.calledWith(bExpectedOverflowAfterResize), "overflow detected");
			done();
		}.bind(this));

		this.oScrollContainer.placeAt("qunit-fixture");
		Core.applyChanges();
	});

	QUnit.test("Resize to underflow", function(assert) {
		var sContainerHeight = "200px",
			sContentHeightAfterResize = "100px", // does not overflow the container
			bExpectedOverflowAfterResize = false,
			done = assert.async();

		// Setup
		this.oScrollContainer.setHeight(sContainerHeight);
		this.oScrollContainer.addContent(new HTML({
			content: '<div id="innerdiv" class="height300"></div>' // overflows the container
		}));

		fnWaitToRender(this.oScrollContainer).then(function() {
			this.fnOverflowChangeSpy.reset();
			document.getElementById("innerdiv").style.height = sContentHeightAfterResize;
			this.clock.tick(200);
			assert.strictEqual(this.fnOverflowChangeSpy.callCount, 1, "overflowChange fired");
			assert.ok(this.fnOverflowChangeSpy.calledWith(bExpectedOverflowAfterResize), "underflow detected");
			done();
		}.bind(this));

		this.oScrollContainer.placeAt("qunit-fixture");
		Core.applyChanges();
	});

	QUnit.module("scrollTo with scrollEndCallback", {
		beforeEach: function () {
			this.oScrollContainer = new ScrollContainer();
			this.fnScrollEndSpy = sinon.spy();
		},
		afterEach: function () {
			this.oScrollContainer.destroy();
			this.fnScrollEndSpy = null;
		}
	});

	QUnit.test("animated scroll", function(assert) {
		var sContainerHeight = "200px",
			oDelegate = this.oScrollContainer.getScrollDelegate(),
			oStub,
			done = assert.async();

		// Setup
		this.oScrollContainer.setHeight(sContainerHeight);
		this.oScrollContainer.addContent(new HTML({
			content: '<div class="height2000"></div>' // content overflows container
		}));

		fnWaitToRender(this.oScrollContainer).then(function() {
			oStub = sinon.stub(oDelegate._$Container, "animate", function(oProperties, oOptions) {
				oOptions.always();
			});
			oDelegate.scrollTo(10, 0, 60, this.fnScrollEndSpy);
			assert.strictEqual(this.fnScrollEndSpy.callCount, 1, "scrollEnd callback fired");
			done();
			oStub.restore();
		}.bind(this));

		this.oScrollContainer.placeAt("qunit-fixture");
		Core.applyChanges();
	});

	QUnit.test("non-animated scroll", function(assert) {
		var sContainerHeight = "200px",
			oDelegate = this.oScrollContainer.getScrollDelegate(),
			done = assert.async();

		// Setup
		this.oScrollContainer.setHeight(sContainerHeight);
		this.oScrollContainer.addContent(new HTML({
			content: '<div class="height2000"></div>' // content overflows container
		}));

		fnWaitToRender(this.oScrollContainer).then(function() {
			oDelegate.scrollTo(10, 0, 0, this.fnScrollEndSpy);
			assert.strictEqual(this.fnScrollEndSpy.callCount, 1, "scrollEnd callback fired");
			done();
		}.bind(this));

		this.oScrollContainer.placeAt("qunit-fixture");
		Core.applyChanges();
	});

	QUnit.module("Keyboard Handling");

	QUnit.test("Press [CTRL] + [DOWN]", function(assert) {
		intEqual(oSC4.$().scrollTop(), 0, "ScrollContainer 4 should be scrolled to position 0");

		qutils.triggerKeydown(oSC4.getDomRef(), "ARROW_DOWN", false, false, true);

		intEqual(oSC4.$().scrollTop(), parseInt(oSC4.getDomRef().clientHeight * SCROLL_COEF), "ScrollContainer 4 should be scrolled vertically to position " + parseInt(oSC4.getDomRef().clientHeight * SCROLL_COEF));

	});

	QUnit.test("Press [CTRL] + [UP]", function(assert) {
		intEqual(oSC4.$().scrollTop(), parseInt(oSC4.getDomRef().clientHeight * SCROLL_COEF), "ScrollContainer 4 should be scrolled vertically to position " + parseInt(oSC4.getDomRef().clientHeight * SCROLL_COEF));

		qutils.triggerKeydown(oSC4.getDomRef(), "ARROW_UP", false, false, true);

		intEqual(oSC4.$().scrollTop(), 0, "ScrollContainer 4 should be scrolled vertically to position 0");
	});

	QUnit.test("Press [CTRL] + [RIGHT]", function(assert) {
		intEqual(oSC4.$().scrollLeft(), 0, "ScrollContainer 4 should be scrolled to horizontal position 0");

		qutils.triggerKeydown(oSC4.getDomRef(), "ARROW_RIGHT", false, false, true);

		intEqual(oSC4.$().scrollLeft(), parseInt(oSC4.getDomRef().clientWidth), "ScrollContainer 4 should be scrolled horizontally to position " + parseInt(oSC4.getDomRef().clientWidth));
	});

	QUnit.test("Press [CTRL] + [LEFT]", function(assert) {
		intEqual(oSC4.$().scrollLeft(), parseInt(oSC4.getDomRef().clientWidth), "ScrollContainer 4 should be scrolled horizontally to position " + parseInt(oSC4.getDomRef().clientWidth));

		qutils.triggerKeydown(oSC4.getDomRef(), "ARROW_LEFT", false, false, true);

		intEqual(oSC4.$().scrollLeft(), 0, "ScrollContainer 4 should be scrolled horizontally to position 0");
	});

	QUnit.test("Press [CTRL] + [END]", function(assert) {
		intEqual(oSC4.$().scrollLeft(), 0, "ScrollContainer 4 should be scrolled horizontally to position 0");
		intEqual(oSC4.$().scrollTop(), 0, "ScrollContainer 4 should be scrolled vertically to position 0");

		qutils.triggerKeydown(oSC4.getDomRef(), "END", false, false, true);

		//in this case Math.ceil is using instead of Math.round because of issue in Chrome with oDomRef.scrollHeight
		assert.equal(Math.ceil(oSC4.$().scrollLeft()), _getMaxScrollLeft(oSC4), "ScrollContainer 4 should be scrolled horizontally to position " + _getMaxScrollLeft(oSC4));
		assert.equal(Math.ceil(oSC4.$().scrollTop()), _getMaxScrollTop(oSC4), "ScrollContainer 4 should be scrolled vertically to position " + _getMaxScrollTop(oSC4));
	});

	QUnit.test("Press [CTRL] + [HOME]", function(assert) {
		qutils.triggerKeydown(oSC4.getDomRef(), "HOME", false, false, true);

		intEqual(oSC4.$().scrollLeft(), 0, "ScrollContainer 4 should be scrolled horizontally to position 0");
		intEqual(oSC4.$().scrollTop(), 0, "ScrollContainer 4 should be scrolled vertically to position 0");
	});

	QUnit.test("Press [ALT] + [PAGE DOWN]", function(assert) {
		intEqual(oSC4.$().scrollLeft(), 0, "ScrollContainer 4 should be scrolled to position 0");

		qutils.triggerKeydown(oSC4.getDomRef(), "PAGE_DOWN", false, true, false);

		intEqual(oSC4.$().scrollLeft(), parseInt(oSC4.getDomRef().clientWidth), "ScrollContainer 4 should be scrolled horizontally to position " + parseInt(oSC4.getDomRef().clientWidth));
	});

	QUnit.test("Press [ALT] + [PAGE UP]", function(assert) {
		intEqual(oSC4.$().scrollLeft(), parseInt(oSC4.getDomRef().clientWidth), "ScrollContainer 4 should be scrolled horizontally to position " + parseInt(oSC4.getDomRef().clientWidth));

		qutils.triggerKeydown(oSC4.getDomRef(), "PAGE_UP", false, true, false);

		intEqual(oSC4.$().scrollLeft(), 0, "ScrollContainer 4 should be scrolled to position 0");
	});

	QUnit.test("Press [CTRL] + [END] in RTL", function(assert) {
		var oStub = this.stub(Localization, "getRTL", function() { return true; }),
			oSpy = this.spy(oSC5._oScroller, "_scrollTo");

		qutils.triggerKeydown(oSC5.getDomRef(), "END", false, false, true);

		assert.ok(oSpy.firstCall.args[0] < 0, "In RTL scenario scrolling to beginning with CTRL + [END] scrolls to negative position");

		oStub.restore();
		oSpy.restore();
	});

	QUnit.module("Styling");

	QUnit.test("Container Padding Classes", function (assert) {
		// System under Test + Act
		var oContainer = new ScrollContainer(),
			sContentSelector = ".sapMScrollContScroll",
			sResponsiveSize = (Device.resize.width <= 599 ? "0px" : (Device.resize.width <= 1023 ? "16px" : "16px 32px")), // eslint-disable-line no-nested-ternary
			aResponsiveSize = sResponsiveSize.split(" "),
			sResponsiveSizeLeftRight = aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0],
			sResponsiveSizeTopBottom = aResponsiveSize[0],
			$containerContent;

		// Act
		oContainer.placeAt("content");
		Core.applyChanges();
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
		assert.strictEqual($containerContent.css("padding-left"), sResponsiveSizeLeftRight, "The container should have " + sResponsiveSizeLeftRight + " left content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size), but has " + $containerContent.css("padding-left"));
		assert.strictEqual($containerContent.css("padding-right"), sResponsiveSizeLeftRight, "The container should have " + sResponsiveSizeLeftRight + " right content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size), but has " + $containerContent.css("padding-right"));
		assert.strictEqual($containerContent.css("padding-top"), sResponsiveSizeTopBottom, "The container should have " + sResponsiveSizeTopBottom + " top content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size), but has " + $containerContent.css("padding-top"));
		assert.strictEqual($containerContent.css("padding-bottom"), sResponsiveSizeTopBottom, "The container should have " + sResponsiveSizeTopBottom + " bottom content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size), but has " + $containerContent.css("padding-bottom"));

		// Cleanup
		oContainer.destroy();
	});

	return pStyleLoaded;
});