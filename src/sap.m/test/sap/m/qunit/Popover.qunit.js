/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/dom/includeStylesheet",
	"sap/m/Button",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/ui/model/json/JSONModel",
	"sap/m/ScrollContainer",
	"sap/m/Popover",
	"sap/m/library",
	"sap/ui/core/HTML",
	"sap/m/Bar",
	"sap/m/Image",
	"sap/m/Label",
	"sap/m/SearchField",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/core/Popup",
	"sap/m/NavContainer",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/ui/core/theming/Parameters",
	"sap/ui/core/InvisibleText",
	"sap/m/Title",
	"sap/m/Input",
	"sap/ui/events/KeyCodes",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	qutils,
	createAndAppendDiv,
	includeStylesheet,
	Button,
	App,
	Page,
	List,
	StandardListItem,
	JSONModel,
	ScrollContainer,
	Popover,
	mobileLibrary,
	HTML,
	Bar,
	Image,
	Label,
	SearchField,
	jQuery,
	Device,
	Popup,
	NavContainer,
	SegmentedButton,
	SegmentedButtonItem,
	Parameters,
	InvisibleText,
	Title,
	Input,
	KeyCodes,
	containsOrEquals,
	nextUIUpdate
) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.TitleAlignment
	var TitleAlignment = mobileLibrary.TitleAlignment;

	document.body.insertBefore(createAndAppendDiv("content"), document.body.firstChild);

	var IMAGE_PATH = "test-resources/sap/m/images/";

	// var iBarHeight = 48;
	var iArrowOffset = 9;

	var app = new App("myApp", {
		initialPage: "myFirstPage"
	});

	var page = new Page("myFirstPage", {
		title: "Test",
		showNavButton: true
	});

	app.addPage(page).placeAt("content");

	function bindListData (data, itemTemplate, list) {
		var oModel = new JSONModel();
		// set the data for the model
		oModel.setData(data);
		// set the model to the list
		list.setModel(oModel);

		// bind Aggregation
		list.bindAggregation("items", "/navigation", itemTemplate);
	}

	function createPopoverContent() {
		var oList2 = new List({
			inset: true
		});

		var data = {
			navigation: [{
				title: "Travel Expend",
				description: "Access the travel expend workflow",
				icon: IMAGE_PATH + "travel_expend.png",
				iconInset: false,
				type: "Navigation",
				press: 'detailPage'
			}, {
				title: "Travel and expense report",
				description: "Access travel and expense reports",
				icon: IMAGE_PATH + "travel_expense_report.png",
				iconInset: false,
				type: "Navigation",
				press: 'detailPage'
			}, {
				title: "Travel Request",
				description: "Access the travel request workflow",
				icon: IMAGE_PATH + "travel_request.png",
				iconInset: false,
				type: "Navigation",
				press: 'detailPage'
			}, {
				title: "Work Accidents",
				description: "Report your work accidents",
				icon: IMAGE_PATH + "wounds_doc.png",
				iconInset: false,
				type: "Navigation",
				press: 'detailPage'
			}, {
				title: "Travel Settings",
				description: "Change your travel worflow settings",
				icon: IMAGE_PATH + "settings.png",
				iconInset: false,
				type: "Navigation",
				press: 'detailPage'
			}]
		};

		var oItemTemplate1 = new StandardListItem({
			title: "{title}",
			description: "{description}",
			icon: "{icon}",
			iconInset: "{iconInset}",
			type: "{type}"
		});

		bindListData(data, oItemTemplate1, oList2);

		return new ScrollContainer({
			horizontal: false,
			vertical: true,
			content: oList2
		});
	}

	function runAllFakeTimersAndRestore(clock){
		clock.runToLast();
		clock.restore();
	}

	QUnit.module("Initial Check");

	QUnit.test("Initialization", function (assert){
		var oPopover = new Popover("popover");

		assert.ok(!document.getElementById("popover"), "Popover is not rendered in the beginning.");

		oPopover.destroy();
	});

	QUnit.module("Open and Close", {
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();

			this.oButton = new Button({
				text: "Open Popover",
				press: () => {
					this.oPopover.openBy(this.oButton);
				}
			}).addStyleClass("positioned");

			this.oPopover = new Popover({
				placement: PlacementType.Bottom,
				contentWidth: "400px",
				contentHeight: "300px",
				content: createPopoverContent()
			});

			page.addContent(this.oButton);
			await nextUIUpdate(this.clock);

		},
		afterEach: function () {
			this.oPopover.destroy();
			this.oButton.destroy();
			page.destroyContent();
			runAllFakeTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Open with placement: Bottom, and then close", function (assert){
		this.oPopover.setPlacement(PlacementType.Bottom);

		var fnBeforeOpen = this.spy(),
				fnAfterOpen = this.spy(),
				$Button = jQuery(this.oButton.getDomRef("inner"));

		this.oPopover.attachBeforeOpen(fnBeforeOpen);
		this.oPopover.attachAfterOpen(fnAfterOpen);

		this.oButton.firePress();
		this.clock.tick(500);
		assert.ok(this.oPopover.isOpen(), "Popover is already open");

		var $popover = this.oPopover.$();

		assert.ok($popover.length, "Popover is rendered after it's opened.");
		assert.ok($popover.closest("#sap-ui-static")[0], "Popover should be rendered inside the static uiArea.");
		assert.ok(Math.ceil($popover.offset().top - iArrowOffset) >= Math.floor($Button.offset().top + $Button.outerHeight()), "Popover should be opened at the bottom of the button");
		if (!Device.support.touch) {
			assert.ok(containsOrEquals($popover[0], document.activeElement), "Popover should have the focus");
		}
		assert.equal(fnBeforeOpen.callCount, 1, "beforeOpen event is fired");
		assert.equal(fnAfterOpen.callCount, 1, "afterOpen event is fired");

		// assert.ok(($popover.position().left + $popover.outerWidth()) <= (jQuery(window).width() - 10), "popover is not overlapping the right border");
		// assert.ok(($popover.position().top + $popover.outerHeight()) <= (jQuery(window).height() - 20), "popover is not overlapping bottom border");

		var fnBeforeClose = this.spy(),
				fnAfterClose = this.spy();
		this.oPopover.attachBeforeClose(fnBeforeClose);
		this.oPopover.attachAfterClose(fnAfterClose);
		this.oPopover.close();
		this.clock.tick(500);

		assert.equal(this.oPopover.$().css("visibility"), "hidden", "popover should be hidden after it's closed");
		assert.ok(!this.oPopover.isOpen(), "Popover is already closed");
		assert.ok(fnBeforeClose.calledOnce, "beforeClose event is fired");
		assert.ok(fnAfterClose.calledOnce, "afterClose event is fired");
	});

	QUnit.test("Open with placement: Right, and then close", function (assert){
		this.oButton.removeStyleClass("positioned").addStyleClass("positioned1");
		this.oPopover.setPlacement(PlacementType.Right);
		this.oButton.firePress();
		this.clock.tick(500);

		assert.ok(this.oPopover.isOpen(), "Popover is already open");
		var $popover = this.oPopover.$();
		var $Button = this.oButton.$();

		assert.ok($popover.length, "Popover is rendered after it's opened.");
		assert.ok($popover.closest("#sap-ui-static")[0], "Popover should be rendered inside the static uiArea.");
		assert.ok(Math.ceil($popover.offset().left - iArrowOffset) >= Math.floor($Button.offset().left + $Button.outerWidth()), "Popover should be opened at the right side of the button");
		//the window size of the test machine is too small, this test can't be executed successfully
		//		assert.ok($popover.position().top >= iBarHeight + 2, "popover is not overlapping the Page Header");
		//		assert.ok(($popover.position().left + $popover.outerWidth()) <= (jQuery(window).width() - 10), "popover is not overlapping the right border");
		//		assert.ok(($popover.position().top + $popover.outerHeight()) <= (jQuery(window).height() - 20), "popover is not overlapping bottom border");
		this.oPopover.close();
		this.clock.tick(500);

		assert.equal($popover.css("visibility"), "hidden", "popover should be hidden after it's closed");
		assert.ok(!this.oPopover.isOpen(), "Popover is already closed");
	});

	QUnit.test("Open with placement: Left, and then close", function (assert){
		this.oButton.removeStyleClass("positioned").addStyleClass("positioned2");
		this.oPopover.setPlacement(PlacementType.Left);
		this.oButton.firePress();
		this.clock.tick(500);

		assert.ok(this.oPopover.isOpen(), "Popover is already open");
		var $popover = this.oPopover.$();
		var $Button = this.oButton.$();

		assert.ok($popover.length, "Popover is rendered after it's opened.");
		assert.ok($popover.closest("#sap-ui-static")[0], "Popover should be rendered inside the static uiArea.");
		assert.ok(Math.floor($popover.offset().left + $popover.outerWidth() + iArrowOffset) <= Math.ceil($Button.offset().left), "Popover should be opened at the left side of the button");
		//the window size of the test machine is too small, this test can't be executed successfully
		//		assert.ok($popover.position().top >= iBarHeight + 2, "popover is not overlapping the Page Header");
		//		assert.ok(($popover.position().top + $popover.outerHeight()) <= (jQuery(window).height() - 20), "popover is not overlapping bottom border");

		this.oPopover.close();
		this.clock.tick(500);

		assert.equal($popover.css("visibility"), "hidden", "popover should be hidden after it's closed");
		assert.ok(!this.oPopover.isOpen(), "Popover is already closed");
	});

	QUnit.test("Open with placement: Top, and close", function (assert){
		this.oButton.removeStyleClass("positioned").addStyleClass("positioned3");
		this.oPopover.setPlacement(PlacementType.Top);
		this.oButton.firePress();
		this.clock.tick(500);

		assert.ok(this.oPopover.isOpen(), "Popover is already open");
		var $popover = this.oPopover.$(),
			$Button = jQuery(this.oButton.getDomRef("inner"));

		assert.ok($popover.length, "Popover is rendered after it's opened.");
		assert.ok($popover.closest("#sap-ui-static")[0], "Popover should be rendered inside the static uiArea.");
		if (jQuery(window).height() > 150) {
			// when the browser window is really short, this has to be disabled.
			assert.ok(Math.floor($popover.offset().top + $popover.outerHeight() + iArrowOffset) <= Math.ceil($Button.offset().top), "Popover should be opened at the top of the button");
		}
		//the window size of the test machine is too small, this test can't be executed successfully
		//		assert.ok($popover.position().top >= iBarHeight + 2, "popover is not overlapping the Page Header");
		//		assert.ok(($popover.position().left + $popover.outerWidth()) <= (jQuery(window).width() - 10), "popover is not overlapping the right border");
		//the window size of the test machine is too small, this test can't be executed successfully
		//		assert.ok($popover.position().left >= 10, "popover is not overlapping the left border");

		this.oPopover.close();
		this.clock.tick(500);

		assert.equal($popover.css("visibility"), "hidden", "popover should be hidden after it's closed");
		assert.ok(!this.oPopover.isOpen(), "Popover is already closed");
	});

	QUnit.test("Popover should stay open after destroyContent", function(assert) {
		this.oPopover.destroyContent();
		this.oPopover.addContent(new List({
			items: [new StandardListItem({ title: 'Test'})]
		}));

		this.oButton.firePress();
		this.clock.tick(1000);  // wait 1s after the open animation is completed

		this.oPopover.destroyContent();
		this.clock.tick(1000); // wait for focus restoration to happen

		assert.strictEqual(document.activeElement, this.oPopover.getFocusDomRef(), "Focus should be on the Popover");
	});

	QUnit.test('it should set the width of the content to "450px"', function(assert) {
		// act
		this.oPopover.setContentMinWidth("450px");  // note: contentWidth is set to "400px"

		// arrange
		this.oButton.firePress();
		this.clock.tick(1000);  // wait 1s after the open animation is completed

		// assert
		assert.strictEqual(this.oPopover.getDomRef("cont").offsetWidth, 450);
	});

	QUnit.test('it should set the width of the content to "150px"', function(assert) {
		// act
		this.oPopover.setContentWidth("150px");

		// arrange
		this.oButton.firePress();
		this.clock.tick(1000);  // wait 1s after the open animation is completed

		// assert
		assert.strictEqual(this.oPopover.getDomRef().offsetWidth, 150);
	});

	QUnit.test('ESCAPE should not dismiss the Popover in certain situations', function (assert) {
		var fnKeyDownModifiers = function (iCode) {
				qutils.triggerKeydown(this.oPopover.getDomRef(), iCode);
				qutils.triggerKeydown(this.oPopover.getDomRef(), KeyCodes.ESCAPE);
				this.clock.tick(1000);  // wait eventual animation
			}.bind(this),
			fnKeyUpModifiers = function (iCode) {
				qutils.triggerKeyup(this.oPopover.getDomRef(), KeyCodes.ESCAPE);
				qutils.triggerKeyup(this.oPopover.getDomRef(), iCode);
				this.clock.tick(1000);  // wait eventual animation
			}.bind(this);
		// arrange
		this.oButton.firePress();
		this.clock.tick(1000);  // wait 1s after the open animation is completed

		// Act
		fnKeyDownModifiers(KeyCodes.SPACE);
		// Assert
		assert.strictEqual(this.oPopover.isOpen(), true, "ESCAPE when Space is hold, should not close the Popover");
		// Cleanup
		fnKeyUpModifiers(KeyCodes.SPACE);
		// Assert
		assert.strictEqual(this.oPopover.isOpen(), true, "The Popover should still be in Open state");

		// Act
		qutils.triggerKeydown(this.oPopover.getDomRef(), KeyCodes.ESCAPE);
		qutils.triggerKeyup(this.oPopover.getDomRef(), KeyCodes.ESCAPE);
		this.clock.tick(500);

		// Assert
		assert.strictEqual(this.oPopover.isOpen(), false, "The Popover should be closed.");
	});

	QUnit.test("ESCAPE press while the popover hasn't applied initial focus yet", function (assert) {
		// Arrange
		const oCloseSpy = this.spy(this.oPopover, "close");
		const oRemoveEventListenersSpy = this.spy(this.oPopover, "_removeDocumentEventListeners");

		// Act
		this.oPopover.openBy(this.oButton);
		document.activeElement.dispatchEvent(new KeyboardEvent("keydown", {
			keyCode: KeyCodes.F4,
			bubbles: true
		}));

		// Assert
		assert.notOk(oCloseSpy.called, "'close' should not be called");

		// Act
		document.activeElement.dispatchEvent(new KeyboardEvent("keydown", {
			keyCode: KeyCodes.ESCAPE,
			bubbles: true
		}));

		// Assert
		assert.ok(oCloseSpy.called, "'close' should be called");
		assert.ok(oRemoveEventListenersSpy.called, "'_removeDocumentEventListeners' should be called");

		this.clock.tick(500);
		assert.strictEqual(this.oPopover.isOpen(), false, "The Popover should be closed.");
	});

	QUnit.test("Focus is correctly restored to the last control that opened the Popover", async function (assert){
		const oButton = new Button({
			text: "Click me!",
			press: () => {
				this.oPopover.openBy(oButton);
			}
		}).placeAt("content");

		await nextUIUpdate(this.clock);

		//Act
		this.oButton.focus();
		this.oButton.firePress();
		this.clock.tick(500);

		oButton.focus();
		oButton.firePress();
		this.clock.tick(500);

		this.oButton.focus();
		this.oButton.firePress();
		this.clock.tick(500);

		oButton.focus();
		oButton.firePress();
		this.clock.tick(500);

		qutils.triggerKeydown(this.oPopover.getDomRef(), KeyCodes.ESCAPE);
		this.clock.tick(500);

		// Assert
		assert.strictEqual(document.activeElement, oButton.getDomRef(), "Focus is correctly restored to the new opener");

		// Cleanup
		oButton.destroy();
	});

	QUnit.test("Open invisible popover", function (assert) {
		// Arrange
		this.oPopover.setVisible(false);

		// Act
		this.oPopover.openBy(this.oButton);
		this.clock.tick(500);

		// Assert
		assert.notOk(this.oPopover.isOpen(), "Invisible popover is not open");

		// Act
		this.oPopover.setVisible(true);
		this.oPopover.openBy(this.oButton);
		this.clock.tick(500);

		assert.ok(this.oPopover.isOpen(), "Popover is open");
	});

	QUnit.module("Position calculation", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			runAllFakeTimersAndRestore(this.clock);
		}
	});

	QUnit.test("vertical calculation of Popover positioning should be correct", function (assert){
		var testCase = function (offset, outerHeight, height, placement, expectedPlace) {
			var stubOffset = sinon.stub(Element.prototype, "getBoundingClientRect").returns({top: offset, height: outerHeight});
			var stubOffsetTop = sinon.stub(jQuery.fn, "offset").returns({top: offset});
			var stubOuterHeight = sinon.stub(jQuery.fn, "outerHeight").returns(outerHeight);

			const oPopover = new Popover({
				placement: placement
			});

			var stubWindowHeight = sinon.stub(oPopover, "_getDocHeight").returns(height);
			var stubOpenByRef = sinon.stub(oPopover, "_getOpenByDomRef").returns(document.createElement("div"));

			oPopover._calcPlacement();

			assert.strictEqual(oPopover._oCalcedPos, expectedPlace);

			stubOpenByRef.restore();
			stubOffset.restore();
			stubOffsetTop.restore();
			stubOuterHeight.restore();
			stubWindowHeight.restore();
			oPopover.destroy();
		};

		testCase(50, 50, 500, PlacementType.Vertical, PlacementType.Bottom);
		testCase(450, 50, 500, PlacementType.Vertical, PlacementType.Top);

		// Preferred Top
		testCase(400, 50, 500, PlacementType.VerticalPreferredTop, PlacementType.Top); // You have enough space to the Top and Top space is greater than the Bottom space
		testCase(150, 50, 500, PlacementType.VerticalPreferredTop, PlacementType.Top); // You have enough space to the Top but Top space is smaller than the Bottom space
		testCase(40, 50, 500, PlacementType.VerticalPreferredTop, PlacementType.Bottom); // You do not have enough space at the preferred position, so the position with more space is used

		// Preferred Bottom
		testCase(100, 50, 500, PlacementType.VerticalPreferredBottom, PlacementType.Bottom); // You have enough space to the Bottom and Bottom space is greater than the Top space
		testCase(350, 50, 500, PlacementType.VerticalPreferredBottom, PlacementType.Bottom); // You have enough space to the Bottom but Bottom space is smaller than the Bottom space
		testCase(450, 50, 500, PlacementType.VerticalPreferredBottom, PlacementType.Top); // You do not have enough space at the preferred position, so the position with more space is used
	});

	QUnit.test("Vertical calculation of Popover position when Popover's content is bigger than the screen height and preferredVertical is set", async function(assert){

		const oList = new List();
		const oPopover = new Popover({ placement: "VerticalPreferredBottom"});

		for (var i = 0; i < 1000; i++) {
			oList.addItem(new StandardListItem());
		}

		oPopover.addContent(oList);

		const oButton = new Button({
			text: "Click me!",
			press: function () {
				oPopover.openBy(this);
			}
		}).placeAt("content");
		oButton.addStyleClass("positioned");
		await nextUIUpdate(this.clock);

		oButton.firePress();
		this.clock.tick(500);

		assert.strictEqual(oPopover._oCalcedPos, PlacementType.Bottom);

		oList.destroy();
		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Vertical (top/bottom) calculation and flip functionality", function (assert){
		var testCase = function (offset, outerHeight, height, placement, expectedPlace) {
			var stubOffset = sinon.stub(Element.prototype, "getBoundingClientRect").returns({top: offset, height: outerHeight});
			var stubOffsetTop = sinon.stub(jQuery.fn, "offset").returns({top: offset});
			var stubOuterHeight = sinon.stub(jQuery.fn, "outerHeight").returns(outerHeight);


			const oPopover = new Popover({
				placement: placement
			});

			var stubWindowHeight = sinon.stub(oPopover, "_getDocHeight").returns(height);
			var stubOpenByRef = sinon.stub(oPopover, "_getOpenByDomRef").returns(document.createElement("div"));

			oPopover._calcPlacement();

			assert.strictEqual(oPopover._oCalcedPos, expectedPlace);

			stubOpenByRef.restore();
			stubOffset.restore();
			stubOffsetTop.restore();
			stubOuterHeight.restore();
			stubWindowHeight.restore();
			oPopover.destroy();
		};

		testCase(150, 50, 500, PlacementType.PreferredTopOrFlip, PlacementType.Top); // You have enough space to the Top but Top space is smaller than the Bottom space
		testCase(40, 50, 500, PlacementType.PreferredTopOrFlip, PlacementType.Bottom); // You do not have enough space at the preferred position, so the position with more space is used
		testCase(350, 50, 500, PlacementType.PreferredBottomOrFlip, PlacementType.Bottom); // You have enough space to the Bottom but Bottom space is smaller than the Bottom space
		testCase(450, 50, 500, PlacementType.PreferredBottomOrFlip, PlacementType.Top); // You do not have enough space at the preferred position, so the position with more space is used
	});

	QUnit.test("Horizontal (right/left) calculation and flip functionality", function(assert){
		var testCase = function (offset, outerWidth, width, placement, expectedPlace) {
			var stubOffset = sinon.stub(Element.prototype, "getBoundingClientRect").returns({left: offset, width: outerWidth});

			var stubOuterWidth = sinon.stub(jQuery.fn, "outerWidth").returns(outerWidth);
			var stubWindowWidth = sinon.stub(jQuery.fn, "width").returns(width);

			const oPopover = new Popover({
				placement: placement
			});

			var stubOpenByRef = sinon.stub(oPopover, "_getOpenByDomRef").returns(document.createElement("div"));
			oPopover._calcPlacement();

			assert.strictEqual(oPopover._oCalcedPos, expectedPlace);

			stubOpenByRef.restore();
			stubOffset.restore();
			stubOuterWidth.restore();
			stubWindowWidth.restore();
			oPopover.destroy();
		};

		testCase(40, 50, 500, PlacementType.PreferredLeftOrFlip, PlacementType.Right);
		testCase(400, 50, 500, PlacementType.PreferredLeftOrFlip, PlacementType.Left);

		testCase(350, 50, 500, PlacementType.PreferredRightOrFlip, PlacementType.Right);
		testCase(450, 50, 500, PlacementType.PreferredRightOrFlip, PlacementType.Left);
	});

	QUnit.test("horizontal calculation of Popover positioning should be correct", function (assert){
		var testCase = function (offset, outerWidth, width, placement, expectedPlace) {
			var stubOffset = sinon.stub(Element.prototype, "getBoundingClientRect").returns({left: offset, width: outerWidth});

			var stubOuterWidth = sinon.stub(jQuery.fn, "outerWidth").returns(outerWidth);
			var stubWindowWidth = sinon.stub(jQuery.fn, "width").returns(width);

			var oPopover = new Popover({
				placement: placement
			});

			var stubOpenByRef = sinon.stub(oPopover, "_getOpenByDomRef").returns(document.createElement("div"));
			oPopover._calcPlacement();

			assert.strictEqual(oPopover._oCalcedPos, expectedPlace);

			stubOpenByRef.restore();
			stubOffset.restore();
			stubOuterWidth.restore();
			stubWindowWidth.restore();
			oPopover.destroy();
		};

		// Preferred Left
		testCase(400, 50, 500, PlacementType.HorizontalPreferredLeft, PlacementType.Left); // You have enough space to the Left and Left space is greater than the Right space
		testCase(100, 50, 500, PlacementType.HorizontalPreferredLeft, PlacementType.Left); // You have enough space to the Left but Left space is smaller than the Right space
		testCase(40, 50, 500, PlacementType.HorizontalPreferredLeft, PlacementType.Right); // You do not have enough space at the preferred position, so the position with more space is used

		// Preferred Right
		testCase(100, 50, 500, PlacementType.HorizontalPreferredRight, PlacementType.Right); // You have enough space to the Right and Right space is greater than the Left space
		testCase(350, 50, 500, PlacementType.HorizontalPreferredRight, PlacementType.Right); // You have enough space to the Right but Right space is smaller than the Left space
		testCase(450, 50, 500, PlacementType.HorizontalPreferredRight, PlacementType.Left); // You do not have enough space at the preferred position, so the position with more space is used
	});

	QUnit.test("auto calculation of Popover positioning should be correct", function (assert){
		var testCase = function (offsetLeft, offsetTop, outerWidth, outerHeight, width, height, expectedPlace) {
			var stubOffset = sinon.stub(Element.prototype, "getBoundingClientRect").returns({
				left: offsetLeft,
				top: offsetTop,
				width: outerWidth,
				height: outerHeight
			});

			var stubOffsetTop = sinon.stub(jQuery.fn, "offset").returns({top: offsetTop});
			var stubOuterWidth = sinon.stub(jQuery.fn, "outerWidth").returns(outerWidth);
			var stubViewportWidth = sinon.stub(jQuery.fn, "width").returns(width);
			var stubViewportHeight = sinon.stub(jQuery.fn, "height").returns(height);
			var stubOuterHeight = sinon.stub(jQuery.fn, "outerHeight").returns(outerHeight);


			var stubPopover = sinon.stub(Popover.prototype, "$").returns(
					{
						outerWidth: sinon.stub().returns(200),
						outerHeight: sinon.stub().returns(200)
					});
			var oPopover = new Popover({
				placement: PlacementType.Auto
			});

			var stubWindowHeight = sinon.stub(oPopover, "_getDocHeight").returns(height);

			var stubOpenByRef = sinon.stub(oPopover, "_getOpenByDomRef").returns(document.createElement("div"));
			oPopover._calcPlacement();

			assert.strictEqual(oPopover._oCalcedPos, expectedPlace);

			stubOffsetTop.restore();
			stubOpenByRef.restore();
			stubOffset.restore();
			stubOuterWidth.restore();
			stubViewportHeight.restore();
			stubViewportWidth.restore();
			stubOuterHeight.restore();
			stubWindowHeight.restore();
			stubPopover.restore();
			oPopover.destroy();
		};

		//tests for preferred positioning if the popover fits in both placementTypes (vertical and horizontal)
		//landscape mode: vertical should be preferred
		testCase(50, 0, 50, 50, 500, 300, PlacementType.Right);
		testCase(450, 0, 50, 50, 500, 300, PlacementType.Left);
		//portrait mode: horizontal should be preferred
		testCase(0, 50, 50, 50, 300, 500, PlacementType.Bottom);
		testCase(0, 450, 50, 50, 300, 500, PlacementType.Top);

		//tests for positioning if the popover is too big for all positions
		//position with the best coverage of the popover should be chosen
		testCase(50, 100, 50, 50, 200, 200, PlacementType.Right);
		testCase(150, 100, 50, 50, 200, 200, PlacementType.Left);
		testCase(100, 50, 50, 50, 200, 200, PlacementType.Bottom);
		testCase(100, 150, 50, 50, 200, 200, PlacementType.Top);
	});

	QUnit.module("Property Setter", {
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();
			this.oBeginButton = new Button("beginButton", {
				text: "Left",
				type: ButtonType.Reject
			});

			this.oEndButton = new Button("endButton", {
				text: "Right",
				type: ButtonType.Accept
			});

			this.oButton = new Button({
				text: "Open Popover",
				press: () => {
					this.oPopover.openBy(this.oButton);
				}
			});

			this.sTitle = "Popover";
			this.oPopover = new Popover({
				title: this.sTitle,
				showHeader: true,
				content: [
					new HTML({
						content: "<div>test content</div>"
					})
				]
			});

			page.addContent(this.oButton);
			await nextUIUpdate(this.clock);
		},
		afterEach: function () {
			this.oBeginButton.destroy();
			this.oEndButton.destroy();
			this.oPopover.destroy();
			this.oButton.destroy();
			runAllFakeTimersAndRestore(this.clock);
		}
	});

	QUnit.test("Set modal to true or false", async function (assert){
		this.oButton.firePress();
		this.oPopover.setModal(true);
		await nextUIUpdate();
		assert.ok(document.getElementById("sap-ui-blocklayer-popup"), "Block layer is rendered");
		assert.equal(jQuery("#sap-ui-blocklayer-popup").css("visibility"), "visible", "block layer is visible");
		this.oPopover.setModal(false);
		await nextUIUpdate();
		assert.equal(jQuery("#sap-ui-blocklayer-popup").css("visibility"), "hidden", "block layer is invisible");
	});

	QUnit.test("Set title", async function (assert){
		const sNewTitle = "Title Changed";
		this.oButton.firePress();
		this.clock.tick(1000);

		assert.ok(this.oPopover.getDomRef("title"), "Title is rendered");
		assert.equal(this.oPopover.$("title").text(), this.sTitle, "Title should be with the right value");
		assert.ok(this.oPopover.$("title").closest("#" + this.oPopover.getId() + "-intHeader-BarMiddle")[0], "Title should be rendered in the middle part of the bar");
		this.oPopover.setTitle(sNewTitle);
		await nextUIUpdate(this.clock);
		this.clock.tick();
		assert.equal(this.oPopover.$("title").text(), sNewTitle, "Title should be changed to the new value");
	});

	QUnit.test("Set title to empty string", async function (assert){
		this.oPopover.setTitle("");
		await nextUIUpdate(this.clock);
		assert.equal(this.oPopover.$("title").text(), "", "Title should be able to be set to empty string");
	});

	QUnit.test("Add left button", async function (assert){
		this.oButton.firePress();
		await nextUIUpdate(this.clock);
		this.oPopover.setBeginButton(this.oBeginButton);
		await nextUIUpdate(this.clock);

		var oBeginButtonFocusDom = this.oBeginButton.getFocusDomRef();
		assert.ok(oBeginButtonFocusDom, "BeginButton should be rendered");
		if (!Device.support.touch) {
			assert.equal(oBeginButtonFocusDom, document.activeElement, "beginButton should have the focus");
		}
		assert.ok(this.oBeginButton.$().closest("#" + this.oPopover.getId() + "-intHeader-BarLeft")[0], "Left button is set in the left side of the bar in iOS");

		this.oBeginButton.setEnabled(false);
		await nextUIUpdate(this.clock);

		if (!Device.support.touch) {
			assert.ok(this.oPopover.getDomRef().contains(document.activeElement), "beginButton should not trap the focus");
		}
	});

	QUnit.test("Add right button", async function (assert){
		this.oButton.firePress();
		await nextUIUpdate(this.clock);

		var oInserAggregationSpy = this.spy(this.oPopover._internalHeader.insertAggregation);
		this.oPopover.setEndButton(this.oEndButton);
		await nextUIUpdate(this.clock);

		assert.ok(document.getElementById("endButton"), "EndButton should be rendered");
		assert.ok(this.oEndButton.$().closest("#" + this.oPopover.getId() + "-intHeader-BarRight")[0], "EndButton is set in the right side of the bar");

		assert.notOk(oInserAggregationSpy.called, "insert aggregation should not be called");
		if (!Device.support.touch) {
			assert.equal(this.oEndButton.getFocusDomRef(), document.activeElement, "endButton should be focused, when beginButton is disabled");
		}

		this.oEndButton.setEnabled(false);
		await nextUIUpdate(this.clock);

		if (!Device.support.touch) {
			assert.ok(this.oPopover.getDomRef().contains(document.activeElement), "endButton should not trap the focus");
		}

		this.oEndButton.setEnabled(true);
	});

	QUnit.test("Remove beginButton", function (assert){
		this.oPopover.setBeginButton(null);
		this.oPopover.setEndButton(this.oEndButton);
		this.oButton.firePress();
		this.clock.tick(1000);

		var oEndButtonFocusDom = this.oEndButton.getFocusDomRef();
		if (!Device.support.touch) {
			assert.equal(oEndButtonFocusDom, document.activeElement, "EndButton should have the focus");
		}
		if (Device.os.ios) {
			assert.ok(!jQuery("#" + this.oPopover.getId() + "-intHeader-BarLeft").children("#beginButton")[0], "BeginButton is removed from the bar");
		} else {
			assert.ok(!jQuery("#" + this.oPopover.getId() + "-intHeader-BarRight").children("#beginButton")[0], "BeginButton is removed from the bar");
		}
	});

	QUnit.test("Remove endButton", function (assert){
		this.oPopover.setEndButton(null);
		this.oButton.firePress();
		this.clock.tick(1000);
		assert.ok(!jQuery("#" + this.oPopover.getId() + "-intHeader-BarRight").children("#endButton")[0], "EndButton is removed from the bar");
	});

	QUnit.test("Set sub header", async function (assert){
		var oSubHeader = new Bar({
			contentMiddle: [
				new SearchField({
					placeholder: "Search ...",
					width: "100%"
				})
			]
		});

		this.oPopover.setSubHeader(oSubHeader);
		this.oButton.firePress();
		await nextUIUpdate();
		assert.equal(this.oPopover.getDomRef().getElementsByClassName("sapMPopoverSubHeader").length, 1, "Sub header is rendered");
		oSubHeader.destroy();
	});

	QUnit.test("set contentWidth/Height", function (assert){
		this.oPopover.setContentWidth("300px");
		this.oPopover.setContentHeight("400px");
		this.oButton.firePress();
		this.clock.tick(500);
		var $content = this.oPopover.$("cont");
		assert.ok($content.width() <= 300, "contentWidth " + $content.width() + " should be less or equal than the set width 300");
		assert.ok($content.height() <= 400, "contentHeight " + $content.height() + " should be less or equal than the set height 400");
	});

	QUnit.test("set contentWidth/Height to percentage", function (assert){
		this.oPopover.setContentWidth("50%");
		this.oPopover.setContentHeight("50%");
		this.oButton.firePress();
		this.clock.tick(500);
		var $content = this.oPopover.$("cont");
		assert.ok(this.oPopover.$().width() - 2 <= (jQuery(window).width() * 0.5), "Calculated width " + $content.width() + " should be less or equal than the part of window width " + jQuery(window).width() * 0.5);
		assert.ok($content.height() <= (jQuery(window).height() * 0.5), "Calculated height " + $content.height() + " should be less or equal than the part of window height " + jQuery(window).height() * 0.5);
	});

	QUnit.test("Set enable scrolling (mapped to vertical/horizontal scrolling)", function (assert){
		assert.strictEqual(this.oPopover.getVerticalScrolling(), true);
		assert.strictEqual(this.oPopover.getHorizontalScrolling(), true);
		this.oPopover.setVerticalScrolling(false);
		this.oPopover.setHorizontalScrolling(false);
		assert.strictEqual(this.oPopover.getVerticalScrolling(), false);
		assert.strictEqual(this.oPopover.getHorizontalScrolling(), false);
	});

	QUnit.test("Set vertical/horizontal scrolling", async function (assert){
		this.oPopover.setVerticalScrolling(false);
		this.oPopover.setHorizontalScrolling(false);
		this.oButton.firePress();
		await nextUIUpdate(this.clock);

		assert.equal(this.oPopover.getDomRef().className.indexOf("sapMPopoverVerScrollDisabled") != -1, true, "verticalScrolling should be disabled");
		assert.equal(this.oPopover.getDomRef().className.indexOf("sapMPopoverHorScrollDisabled") != -1, true, "horizontalScrolling should be disabled");
		assert.equal(this.oPopover.getVerticalScrolling(), false, "verticalScrolling should be disabled");
		assert.equal(this.oPopover.getVerticalScrolling(), false, "horizontalScrolling should be disabled");

		this.oPopover.setVerticalScrolling(true);
		this.oPopover.setHorizontalScrolling(true);
		await nextUIUpdate(this.clock);

		assert.equal(this.oPopover.getDomRef().className.indexOf("sapMPopoverHorScrollDisabled") == -1, true, "horizontalScrolling should be enabled");
		assert.equal(this.oPopover.getVerticalScrolling(), true, "verticalScrolling should be enabled");
		assert.equal(this.oPopover.getVerticalScrolling(), true, "horizontalScrolling should be enabled");
		assert.equal(this.oPopover.getDomRef().className.indexOf("sapMPopoverVerScrollDisabled") == -1, true, "verticalScrolling should be enabled");
	});

	QUnit.test("Set showHeader", async function (assert) {
		this.oButton.firePress();
		this.clock.tick(1000);

		assert.ok(this.oPopover.getDomRef("intHeader"), "Internal header is rendered");

		this.oPopover.setModal(true);
		this.oPopover.setShowHeader(false);
		await nextUIUpdate(this.clock);
		assert.ok(!this.oPopover.getDomRef("intHeader"), "Internal header is removed");

		this.oPopover.setShowHeader(true);
		await nextUIUpdate(this.clock);
		assert.ok(this.oPopover.$("intHeader").css("display") !== "none", "Internal header is re-rendered");
	});

	QUnit.test("Set custom header", async function (assert) {
		var oCustomHeader = new Bar("customHeader", {
			contentLeft: [new Image('myAppIcon', {src: IMAGE_PATH + "SAPUI5.png"}),
				new Label("IconHeader", {text: "Icon Header"})],
			contentMiddle: [],
			contentRight: []
		});

		this.oPopover.setCustomHeader(oCustomHeader);
		await nextUIUpdate(this.clock);
		this.oButton.firePress();
		this.clock.tick(1000);
		assert.ok(document.getElementById("customHeader"), "Custom Header is rendered");
		assert.ok(!this.oPopover.getDomRef("intHeader"), "Internal header is destroyed");
	});

	QUnit.test("Popover opened by a button, set focus to button shouldn't close the popover", async function(assert) {
		var oButtonInPopover = new Button();
		this.oPopover.addContent(oButtonInPopover);
		await nextUIUpdate(this.clock);

		this.oButton.firePress();
		this.clock.tick(500);

		assert.ok(this.oPopover.isOpen(), "Popover is open");
		assert.ok(containsOrEquals(oButtonInPopover.getDomRef(), document.activeElement), "focus is set to the button in popover");

		this.oButton.focus();
		this.clock.tick(500);

		assert.ok(this.oPopover.isOpen(), "Popover is still open");

		oButtonInPopover.destroy();
	});

	QUnit.test("Autoclose after invalidate", async function (assert){
		var oSystem = {
			desktop: true,
			phone: false,
			tablet: false
		};

		this.stub(Device, "system").value(oSystem);

		this.stub(Popup.prototype, "touchEnabled").value(false);

		const oButton = new Button();
		oButton.placeAt("content");
		await nextUIUpdate(this.clock);

		this.oButton.$().removeClass("positioned positioned1 positioned2");
		this.oButton.$().addClass("positioned3");
		oButton.$().css({
			position: "absolute",
			top: "100px",
			left: "100px"
		});

		this.oButton.firePress();
		assert.ok(this.oPopover.isOpen(), "Popover should be opened");
		this.clock.tick(500);

		this.oPopover.invalidate();
		await nextUIUpdate(this.clock);

		var oSpy = this.spy(console, "assert");
		var oBeforeCloseSpy = this.spy();

		this.oPopover.attachBeforeClose(oBeforeCloseSpy);

		oButton.focus();
		this.clock.tick(500);
		assert.ok(!this.oPopover.isOpen(), "Popover should be closed by autoclose");
		assert.ok(oSpy.neverCalledWith(sinon.match.falsy), "All asserts should be passed");
		assert.equal(oBeforeCloseSpy.callCount, 1, "beforeClose event is fired");

		oButton.destroy();
	});

	QUnit.test("Restore scroll position after content resize", async function (assert){
		var oSystem = {
			desktop: true,
			phone: false,
			tablet: false
		};

		this.stub(Device, "system").value(oSystem);

		var sId = "scrollPosPopover",
				iScrollTop = 123,
				iScrollLeft = 124,
				oPopover = new Popover(sId, {
					contentWidth: "300px",
					contentHeight: "300px",
					content: new HTML({
						content: "<div class='width500height600'></div>"
					}),
					placement: PlacementType.Top
				});

		this.oButton.$().addClass("positioned3");
		await nextUIUpdate(this.clock);

		oPopover.openBy(this.oButton);
		this.clock.tick(500);

		oPopover._oScroller.scrollTo(iScrollLeft, iScrollTop, 1);

		//trigger content resize listener
		oPopover._onOrientationChange();

		assert.equal(oPopover._oScroller.getScrollTop(), iScrollTop, "Popover should keep vertical scroll position");
		assert.equal(oPopover._oScroller.getScrollLeft(), iScrollLeft, "Popover should keep horizontal scroll position");
		oPopover.destroy();
	});

	QUnit.test("Keyboard Navigation", async function (assert){
		var oSystem = {
			desktop: true,
			phone: false,
			tablet: false
		};

		this.stub(Device, "system").value(oSystem);

		this.oPopover.setContentHeight("300px");
		this.oPopover.setContentWidth("300px");
		this.oPopover.setPlacement(PlacementType.Top);
		this.oPopover.destroyContent();
		this.oPopover.addContent(new HTML({
			content: "<div class='width500height600'></div>"
		}));

		await nextUIUpdate(this.clock);
		this.oButton.focus();
		this.oButton.$().addClass("positioned3");

		this.oButton.firePress();
		this.clock.tick(500);
		assert.ok(this.oPopover.isOpen(), "Popover should be opened");
		qutils.triggerKeydown(this.oPopover.getDomRef(), KeyCodes.ESCAPE);
		this.clock.tick(500);
		assert.ok(!this.oPopover.isOpen(), "Popover should be closed by ESCAPE key");
		assert.equal(document.activeElement, this.oButton.getFocusDomRef(), "Focus should be set back to the button");

		this.oButton.firePress();
		this.clock.tick(500);
		assert.ok(this.oPopover.isOpen(), "Popover should be opened");
		qutils.triggerKeydown(this.oPopover.getDomRef(), KeyCodes.F4, false, true);
		this.clock.tick(500);
		assert.ok(!this.oPopover.isOpen(), "Popover should be closed by Alt+F4 key");
		assert.equal(document.activeElement, this.oButton.getFocusDomRef(), "Focus should be set back to the button");
	});

	QUnit.test("content resize handler for placement: auto after orientation change", function (assert){
		this.oPopover.setContentHeight("300px");
		this.oPopover.setContentWidth("300px");
		this.oPopover.setPlacement(PlacementType.Auto);
		this.oPopover.destroyContent();
		this.oPopover.addContent(new HTML({
			content: "<div class='width500height600'></div>"
		}));

		this.oButton.$().removeClass("positioned positioned1 positioned2");
		this.oButton.$().addClass("positioned3");

		this.oButton.firePress();
		this.clock.tick(500);
		var fnContentResize = this.spy(this.oPopover, "_registerContentResizeHandler");
		this.oPopover._onOrientationChange();
		assert.equal(fnContentResize.callCount, 1, "registerContentResizeHandler should called once");
	});

	QUnit.test("content resize handler for placement: auto after orientation change", function (assert){
		var oSystem = {
			desktop: true,
			phone: false,
			tablet: false
		};

		this.stub(Device, "system").value(oSystem);

		this.oPopover.setContentHeight("300px");
		this.oPopover.setContentWidth("300px");
		this.oPopover.setPlacement(PlacementType.Auto);
		this.oPopover.destroyContent();
		this.oPopover.addContent(new HTML({
			content: "<div class='width500height600'></div>"
		}));

		this.oButton.firePress();
		this.clock.tick(500);

		assert.ok(this.oPopover.isOpen(), "Popover is opened");

		// change the position of button, popover should be closed
		this.oButton.$().css("bottom", parseInt(this.oButton.$().css("bottom")) + 33);
		this.clock.tick(600);

		assert.ok(!this.oPopover.isOpen(), "Popover is closed because open by control is moved");

		this.oButton.firePress();
		this.clock.tick(500);

		assert.ok(this.oPopover.isOpen(), "Popover is opened again");
		// turn of the followOf
		this.oPopover.setFollowOf(false);

		// change the position of button, popover should not be closed this time
		this.oButton.$().css("bottom", parseInt(this.oButton.$().css("bottom")) - 33);

		this.clock.tick(300);
		assert.ok(this.oPopover.isOpen(), "Popover is still open");
	});

	QUnit.test("Content scrolling is disabled when NavContainer is set as single content in Popover", function (assert){
		this.oPopover.setHorizontalScrolling(false);
		this.oPopover.destroyContent();
		this.oPopover.addContent(new NavContainer({
			pages: new Page()
		}));

		this.oButton.firePress();
		this.clock.tick(500);
		assert.ok(!this.oPopover.getScrollDelegate(), "Scrolling is disabled by default when there's NavContainer as single content in Popover");
	});

	QUnit.test("Popover should set the focus to itself only when needed", function (assert){
		//Arrange
		var oNavContainer = new NavContainer({
				initialPage: "firstPage"
			}),
			oNavButton = new Button({
				press: function () {
					oNavContainer.to("detailPage");
				}
			}),
			oPage1 = new Page("firstPage", {
				content: oNavButton
			}),
			oPage2 = new Page("detailPage", {
				showNavButton: true,
				showHeader: true,
				navButtonPress: function(){ oNavContainer.back(); }
			});

		oNavContainer.addPage(oPage1).addPage(oPage2);

		this.oPopover.destroyContent();
		this.oPopover.addContent(oNavContainer);

		//Act
		this.oButton.firePress();
		oNavButton.firePress();
		this.clock.tick(500);

		//Assert
		assert.equal(document.activeElement, oPage2._navBtn.getDomRef(), "The focus should be on the back button");

		//Act
		this.oPopover.close();
		this.clock.tick(300);
		this.oPopover.openBy(this.oButton);
		this.clock.tick(300);

		//Arrange
		var oCloseSpy = this.spy(this.oPopover, "close");

		//Act
		oPage2.fireNavButtonPress();
		this.clock.tick(500);

		//Assert
		assert.equal(document.activeElement, oNavButton.getDomRef(), "The focus should be on the navigation button");
		assert.equal(oCloseSpy.callCount, 0, "The popover should not close after a navigation");
		assert.ok(this.oPopover.isOpen(), "Popover should stay open");

		//Cleanup
		oNavContainer.destroy();
		oNavButton.destroy();
		oPage1.destroy();
		oPage2.destroy();
		oCloseSpy.restore();
	});

	QUnit.test("Scrolling is properly disabled", function (assert){
		this.oPopover.destroyContent();
		this.oPopover.addContent(new Button({text: 'text1'}));
		this.oPopover.addContent(new Button({text: 'text2'}));
		this.oPopover.addContent(new Button({text: 'text3'}));

		this.oPopover.setHorizontalScrolling(false);
		this.oPopover.setVerticalScrolling(false);

		this.oButton.firePress();
		this.clock.tick(500);

		assert.ok(!this.oPopover.getScrollDelegate(), "Scrolling is properly disabled");
	});

	QUnit.test("Enable content scrolling even with NavContainer as content in Popover", function (assert){
		this.oPopover.setVerticalScrolling(true);
		this.oPopover.destroyContent();
		this.oPopover.addContent(new NavContainer({
			pages: new Page()
		}));

		this.oButton.firePress();
		this.clock.tick(500);

		assert.ok(this.oPopover.getScrollDelegate(), "Scrolling is enabled when vertical scrolling is manually set to true");

		this.oPopover.setHorizontalScrolling(true);
		this.oPopover.destroyContent();
		this.oPopover.addContent(new NavContainer({
			pages: new Page()
		}));

		this.oButton.firePress();
		this.clock.tick(500);

		assert.ok(this.oPopover.getScrollDelegate(), "Scrolling is enabled when horizontal scrolling is manually set to true");
	});

	QUnit.test("Popover should keep open when openBy control rerenders", async function (assert){
		await nextUIUpdate(this.clock);

		this.oButton.firePress();
		this.clock.tick(500);
		assert.ok(this.oPopover.isOpen(), "Popover should be opened now");

		this.oButton.invalidate();
		this.clock.tick(300);
		assert.ok(this.oPopover.isOpen(), "Popover should keep the open state");
	});

	QUnit.test("Popover follow of with tolerance", async function (assert){
		var oSystem = {
			desktop: true,
			phone: false,
			tablet: false
		};
		var oStub = sinon.stub(Popup.prototype, "isTopmost").returns(false);

		this.stub(Device, "system").value(oSystem);

		this.oButton.$().css({
			position: "absolute",
			top: 0,
			left: 0
		});

		this.oPopover.destroy();
		this.oPopover = new Popover({
			contentWidth: "400px",
			contentHeight: "400px"
		});

		this.oButton.firePress();
		this.clock.tick(500);
		assert.ok(this.oPopover.isOpen(), "Popover should be opened now");

		this.oButton.$().css({
			top: "31px"
		});
		this.clock.tick(500);
		assert.ok(this.oPopover.isOpen(), "Popover should keep the open state");

		this.oButton.$().css({
			top: "64px"
		});
		this.clock.tick(500);
		assert.ok(!this.oPopover.isOpen(), "Popover should be closed");
		this.clock.tick(500);

		// Turn off followOf, Popover should also be closed when openBy control isn't in viewport anymore
		this.oPopover.setFollowOf(false);
		this.oButton.firePress();
		this.clock.tick(500);
		assert.ok(this.oPopover.isOpen(), "Popover should be opened again");

		this.oButton.$().css({
			top: "-200px"
		});
		this.oPopover._fnOrientationChange();
		this.clock.tick(500);
		assert.ok(!this.oPopover.isOpen(), "Popover should be closed");

		//Restore
		await nextUIUpdate(this.clock);
		oStub.restore();
	});

	QUnit.test("Button in SegmentedButton opens Popover", async function (assert){
		this.oPopover.destroy();
		this.oPopover = new Popover({
			contentWidth: "200px",
			contentHeight: "300px"
		});

		var that = this;
		var oSegBtn = new SegmentedButton({
			items: [
				new SegmentedButtonItem({
					text: "Button1"
				}),
				new SegmentedButtonItem({
					text: "Open Popover",
					press: function () {
						that.oPopover.openBy(this);
					}
				})
			]
		});

		oSegBtn.placeAt("content");
		await nextUIUpdate(this.clock);

		oSegBtn.getItems()[1].oButton.firePress(); // TODO avoid private property 'oButton'

		assert.ok(this.oPopover.isOpen(), "Popover should be opened");

		oSegBtn.destroy();
	});

	QUnit.test("Call Popover's open method several times while it's being closed", async function (assert){
		this.oPopover.destroy();
		this.oPopover = new Popover({
			contentWidth: "300px",
			contentHeight: "300px"
		});

		this.oPopover.openBy(this.oButton);
		this.clock.tick(500);
		this.oPopover.close();

		var oSpy = this.spy(this.oPopover.oPopup, "open");

		//call openby twice in a row
		this.oPopover.openBy(this.oButton);
		this.oPopover.openBy(this.oButton);

		this.clock.tick(500);
		assert.equal(oSpy.callCount, 1, "popup's open method should only be called once");

		//Restore
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Restore scroll position on mobile device", async function (assert){
		var oSystem = {
			desktop: false,
			tablet: true,
			phone: false
		};

		this.stub(Device, "system").value(oSystem);

		this.oPopover.destroy();
		this.oPopover = new Popover({
			contentWidth: "200px",
			contentHeight: "200px",
			content: new HTML({
				content: "<div class='width400height400'></div>"
			})
		});

		this.oButton.firePress();
		this.clock.tick(500);

		assert.ok(this.oPopover.isOpen(), "Popover is open");
		this.oPopover._oScroller.scrollTo(30, 20, 1);

		this.oPopover._onOrientationChange();
		assert.equal(this.oPopover._oScroller.getScrollLeft(), 30, "scrollLeft is restored");
		assert.equal(this.oPopover._oScroller.getScrollTop(), 20, "scrollTop is restored");

		//Restore
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Popover with NavContainer as Content", async function (assert){
		this.oPopover.destroy();
		this.oPopover = new Popover({
			content: new NavContainer({
				pages: new Page({
					content: new List({
						items: new StandardListItem({
							title: "abc"
						})
					})
				})
			}),
			contentWidth: "300px",
			contentHeight: "300px"
		});

		this.oButton.firePress();
		this.clock.tick(1000);

		assert.ok(this.oPopover.isOpen(), "Popover is still open");

		//Restore
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Container Padding Classes", async function (assert){
		// System under Test + Act
		var oContainer = new Popover(),
				sContentSelector = ".sapMPopoverCont > .sapMPopoverScroll",
				sResponsiveSize = (Device.resize.width <= 599 ? "0px" : (Device.resize.width <= 1023 ? "16px" : "16px 32px")), // eslint-disable-line no-nested-ternary
				aResponsiveSize = sResponsiveSize.split(" "),
				$containerContent;

		// Act
		oContainer.placeAt("content");
		await nextUIUpdate(this.clock);
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

	QUnit.test("Popover should stay when right border of openby control stays while size changes", async function (assert){
		this.oButton.addStyleClass("positioned2");
		this.oButton.setText("Right Border Stays");
		await nextUIUpdate(this.clock);

		this.oPopover.destroy();
		this.oPopover = new Popover({
			contentWidth: "200px",
			contentHeight: "200px"
		});
		this.oButton.firePress();
		this.clock.tick(400);
		assert.ok(this.oPopover.isOpen(), "Popover should be opened");
		this.oButton.setText("Short");
		await nextUIUpdate(this.clock);
		this.clock.tick(400);
		assert.ok(this.oPopover.isOpen(), "Popover should still be open");

		//Restore
		await nextUIUpdate(this.clock);
	});

	QUnit.test("openBy is set to dom reference and popover should be positioned correctly after the dom is created in dom tree again", async function (assert){
		this.oButton.addStyleClass("positioned2");
		await nextUIUpdate(this.clock);

		this.oPopover.destroy();
		this.oPopover = new Popover({
			contentWidth: "200px",
			contentHeight: "200px",
			placement: PlacementType.Vertical
		});
		this.oPopover.openBy(this.oButton.getDomRef());
		this.clock.tick(400);
		assert.ok(this.oPopover.isOpen(), "Popover should be opened");
		assert.ok(this.oPopover.$().offset().top > this.oButton.$().offset().top, "Popover should be placed below the button");

		this.oButton.invalidate();
		// simulate a content resize
		this.oPopover._onOrientationChange();
		this.oPopover.close();
		this.clock.tick(400);
		assert.ok(!this.oPopover.isOpen(), "Popover is closed");

		this.oPopover.openBy(this.oButton.getDomRef());
		this.clock.tick(400);
		assert.ok(this.oPopover.isOpen(), "Popover should be opened again");
		assert.ok(this.oPopover.$().offset().top > this.oButton.$().offset().top, "Popover should be placed below the button again");

		//Restore
		await nextUIUpdate(this.clock);
	});

	QUnit.test("showArrow with value false should not render the arrow", async function (assert){
		this.oPopover.setShowArrow(false);
		await nextUIUpdate(this.clock);

		var	oSpyGetArrowOffsetCss = sinon.spy(this.oPopover, "_getArrowOffsetCss"),
			oSpyGetArrowPositionCssClass = sinon.spy(this.oPopover, "_getArrowPositionCssClass"),
			oSpyGetArrowStyleCssClass = sinon.spy(this.oPopover, "_getArrowStyleCssClass");

		this.oButton.firePress();
		this.clock.tick(500);

		assert.equal(this.oPopover.$("arrow").length, 0, "Popover should not have arrow");
		assert.equal(oSpyGetArrowOffsetCss.callCount, 0, "_getArrowOffsetCss should not be called");
		assert.equal(oSpyGetArrowPositionCssClass.callCount, 0, "_getArrowPositionCssClass should not be called");
		assert.equal(oSpyGetArrowStyleCssClass.callCount, 0, "_getArrowStyleCssClass should not be called");

		oSpyGetArrowOffsetCss.restore();
		oSpyGetArrowPositionCssClass.restore();
		oSpyGetArrowStyleCssClass.restore();
	});

	QUnit.test("showArrow with value true should render the arrow", async function (assert){
		this.oPopover.setShowArrow(true);
		await nextUIUpdate(this.clock);

		var	oSpyGetArrowOffsetCss = sinon.spy(this.oPopover, "_getArrowOffsetCss"),
			oSpyGetArrowPositionCssClass = sinon.spy(this.oPopover, "_getArrowPositionCssClass"),
			oSpyGetArrowStyleCssClass = sinon.spy(this.oPopover, "_getArrowStyleCssClass");

		this.oButton.firePress();
		this.clock.tick(500);

		assert.equal(this.oPopover.$("arrow").length, 1, "Popover should have arrow");
		assert.equal(oSpyGetArrowOffsetCss.callCount, 1, "_getArrowOffsetCss should be called");
		assert.equal(oSpyGetArrowPositionCssClass.callCount, 1, "_getArrowPositionCssClass should be called");
		assert.equal(oSpyGetArrowStyleCssClass.callCount, 1, "_getArrowStyleCssClass should be called");

		oSpyGetArrowOffsetCss.restore();
		oSpyGetArrowPositionCssClass.restore();
		oSpyGetArrowStyleCssClass.restore();
	});

	QUnit.test("Popover should act according to value of resizing property", async function(assert){
		// Arrange
		this.oPopover.setResizable(true);

		// Act
		this.oButton.firePress();

		if (!Device.system.desktop) {
			// Assert when resizable
			var domQueryLength = this.oPopover.getDomRef().querySelectorAll('.sapMPopoverResizeHandle').length;
			assert.equal(domQueryLength,  0, "Arrow not found in popover because not desktop device");
		} else {
			// Assert when resizable
			var domQuery = this.oPopover.getDomRef().querySelectorAll('.sapMPopoverResizeHandleIcon');
			assert.equal(domQuery.length,  1, "Arrow found in popover");
			assert.equal(domQuery[0].getAttribute("aria-hidden"), "true", "Aria-hidden should be added to the icon.");

			this.oPopover.setResizable(false);
			this.oPopover.invalidate();
			this.clock.tick(0);

			// Assert when not resizable
			domQuery = this.oPopover.getDomRef().querySelectorAll('.sapMPopoverResizeHandle');
			assert.equal(domQuery.length,  0, "Arrow not found in popover");
		}

		//Restore
		await nextUIUpdate(this.clock);
	});

	QUnit.test("setModal arguments forwarding", function(assert){
		// setup
		var oSpy = sinon.spy(this.oPopover.oPopup, "setModal");
		this.oPopover.setModal(true, undefined);

		// assert
		assert.strictEqual(oSpy.getCall(0).args[1], "sapMPopoverBLayer", "The css styles are forwarded properly to the popup.");

		// restore
		oSpy.restore();
	});

	QUnit.module("Internal methods", {
		beforeEach: async function () {
			this.oButton = new Button({
				text: "Open Popover"
			});
			this.oButton.addStyleClass("positioned");
			this.oPopover = new Popover();

			page.addContent(this.oButton);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oPopover.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("_getAnimationDuration", function (assert) {
		assert.strictEqual(Popover.prototype._getAnimationDuration(), 300, "Default Duration should be 300");
	});

	QUnit.test("_applyPosition should be called with two parameters from check docking", function (assert){
		var oSpy = sinon.spy(this.oPopover.oPopup, "_applyPosition");

		// Act
		this.oPopover._fnFollowOf({
			lastOfRect: {
				top: 10,
				left: 10
			},
			currentOfRect: {
				top: 10,
				left: 10
			}
		});

		// Assert
		assert.equal(oSpy.callCount, 1, "_applyPosition is called once");
		assert.strictEqual(oSpy.getCall(0).args[1], true, "_applyPosition is called with the second parameter set to true");
	});

	QUnit.test("_getPopoverPositionCss should return an object with correct top, bottom, right and left position when Popover do not exceed vertically or horizontally of the window", function (assert){
		var	oPosParams = {
				_fPopoverWidth: 416,
				_fPopoverHeight: 802,
				_fWithinAreaWidth: 1920,
				_fWithinAreaHeight: 1139,
				_fPopoverMarginTop: 50,
				_fPopoverMarginRight: 10,
				_fPopoverMarginBottom: 10,
				_fPopoverMarginLeft: 265,
				_fPopoverOffset: {
					top: 21,
					left: 265
				}
			};

		var oCalculatedParams = this.oPopover._getPopoverPositionCss(oPosParams);

		assert.equal(oCalculatedParams.top, 50, "top position should be equal to the _marginTop after calculations");
		assert.equal(oCalculatedParams.right, undefined, "right position should be equal to 'undefined' after calculations");
		assert.ok(isNaN(oCalculatedParams.bottom), "bottom position should be equal to 'NaN' after calculations");
		assert.equal(oCalculatedParams.left, undefined, "left position should be equal to 'undefined' after calculations");
	});

	QUnit.test("_getPopoverPositionCss should return an object with correct top, bottom, right and left position when Popover do not exceed vertically or horizontally of the window but exceeds the defined 10px border of the screen", function (assert){
		var oPosParams = {
			_fPopoverWidth: 416,
			_fPopoverHeight: 754,
			_fWithinAreaWidth: 1920,
			_fWithinAreaHeight: 1139,
			_fPopoverMarginTop: 50,
			_fPopoverMarginRight: 10,
			_fPopoverMarginBottom: 162,
			_fPopoverMarginLeft: 10,
			_fPopoverOffset: {
				top: 223,
				left: 0
			}
		};

		var oCalculatedParams = this.oPopover._getPopoverPositionCss(oPosParams);

		assert.equal(oCalculatedParams.top, undefined, "top position should be equal to the 'undefined after calculations");
		assert.equal(oCalculatedParams.right, undefined, "right position should be equal to the 'undefined after calculations");
		assert.ok(isNaN(oCalculatedParams.bottom), "bottom position should be equal to 'NaN' after calculations");
		assert.equal(oCalculatedParams.left, 10, "left position should be equal to _fPopoverMarginLeft after calculations");
	});

	QUnit.test("_getMaxContentWidth should return calculated max content width", function (assert){
		var iMaxContentWidth = this.oPopover._getMaxContentWidth({
			_fDocumentWidth: 500,
			_fPopoverMarginLeft: 10,
			_fPopoverMarginRight: 10,
			_fPopoverBorderLeft: 10,
			_fPopoverBorderRight: 10
		});

		assert.equal(iMaxContentWidth, 460, "Popover maxContentWidth should be equal to the documentWidth minus left and right margins and borders");
	});

	QUnit.test("_getMaxContentHeight should return calculated max content width", function (assert){
		var iMaxContentHeight = this.oPopover._getMaxContentHeight({
			_fDocumentHeight: 500,
			_fPopoverMarginTop: 10,
			_fPopoverMarginBottom: 10,
			_fHeaderHeight: 10,
			_fSubHeaderHeight: 10,
			_fFooterHeight: 10,
			_fContentMarginTop: 10,
			_fContentMarginBottom: 10,
			_fPopoverBorderTop: 10,
			_fPopoverBorderBottom: 10
		});

		assert.equal(iMaxContentHeight, 410, "Popover maxContentHeight should be equal to the documentHeight minus header, subheader, footer height; top and bottom margins, borders and content margins");
	});

	QUnit.test("_getContentDimensionsCss should return max-width, max-height computed right and empty height if the Popover can fit on the screen", function (assert){
		var stubPopoverMaxContentWidth = sinon.stub(this.oPopover, "_getMaxContentWidth").returns(500),
			stubPopoverMaxContentHeight = sinon.stub(this.oPopover, "_getMaxContentHeight").returns(400),
			oElement = document.createElement("div"),
			stubjQueryHeight = sinon.stub(oElement, "getBoundingClientRect").returns({ height: 300 }),
			oExpectedDimensions = {
				"max-width": "500px",
				"max-height": "400px",
				"height": ""
			};

		var oContentDimensions = this.oPopover._getContentDimensionsCss({
			_$content: jQuery(oElement)
		});

		assert.deepEqual(oContentDimensions, oExpectedDimensions, "Content dimensions should be right");

		stubPopoverMaxContentWidth.restore();
		stubPopoverMaxContentHeight.restore();
		stubjQueryHeight.restore();
	});

	QUnit.test("_getContentDimensionsCss should return max-width and height if the Popover can fit on the screen and have contentHeight property set", function (assert){
		this.oPopover.setContentHeight("500px");
		var stubPopoverMaxContentWidth = sinon.stub(this.oPopover, "_getMaxContentWidth").returns(400),
			stubPopoverMaxContentHeight = sinon.stub(this.oPopover, "_getMaxContentHeight").returns(400),
			oElement = document.createElement("div"),
			stubjQueryHeight = sinon.stub(oElement, "getBoundingClientRect").returns({ height: 300 }),
			oExpectedDimensions = {
				"max-width": "400px",
				"height": "300px"
			};

		var oContentDimensions = this.oPopover._getContentDimensionsCss({
			_$content: jQuery(oElement)
		});

		assert.deepEqual(oContentDimensions, oExpectedDimensions, "Content dimensions should be right");

		stubPopoverMaxContentWidth.restore();
		stubPopoverMaxContentHeight.restore();
		stubjQueryHeight.restore();
	});

	QUnit.test("_isHorizontalScrollbarNeeded returns false if scrollbar is not needed", function (assert){
		var bNeededScrollbar,
				stubOuterWidth = sinon.stub(jQuery.fn, "outerWidth").returns(500),
				stubWidth = sinon.stub(jQuery.fn, "width").returns(400);

		bNeededScrollbar = this.oPopover._isHorizontalScrollbarNeeded({
			_$scrollArea: jQuery(),
			_$content: jQuery()
		});

		assert.ok(!bNeededScrollbar, "Scrollbar is not needed");

		stubOuterWidth.restore();
		stubWidth.restore();
	});

	QUnit.test("_isHorizontalScrollbarNeeded returns true if scrollbar is needed", function (assert){
		var bNeededScrollbar,
				stubOuterWidth = sinon.stub(jQuery.fn, "outerWidth").returns(400),
				stubWidth = sinon.stub(jQuery.fn, "width").returns(500);

		bNeededScrollbar = this.oPopover._isHorizontalScrollbarNeeded({
			_$scrollArea: jQuery(),
			_$content: jQuery()
		});

		assert.ok(bNeededScrollbar, "Scrollbar is needed");

		stubOuterWidth.restore();
		stubWidth.restore();
	});

	QUnit.test("_getArrowOffsetCss should return top position of the arrow when placement type is left or right", function (assert){
		var oPosParams = {
				_$popover: jQuery(),
				_$parent: jQuery(),
				_$arrow: jQuery(),
				_fPopoverBorderTop: 1,
				_fPopoverOffsetY: 0
			},
			oExpectedPos = {
				top: 355
			},
			stubPopoverOuterWidth = sinon.stub(oPosParams._$popover, "outerWidth").returns(416),
			stubPopoverOuterHeight = sinon.stub(oPosParams._$popover, "outerHeight").returns(802),
			stubPopoverOffset = sinon.stub(oPosParams._$popover, "offset").returns({top: 50, left: 265}),
			stubParentOuterHeight = sinon.stub(Popover, "outerHeight").returns(40),
			stubParentOffset = sinon.stub(oPosParams._$parent, "offset").returns({top: 402, left: 100}),
			stubArrowOuterHeight = sinon.stub(oPosParams._$arrow, "outerHeight").returns(32);

		var oCalculatedPos = this.oPopover._getArrowOffsetCss(PlacementType.Left, oPosParams);
		assert.deepEqual(oCalculatedPos, oExpectedPos, "top position should be 355px");

		var oCalculatedPos = this.oPopover._getArrowOffsetCss(PlacementType.Right, oPosParams);
		assert.deepEqual(oCalculatedPos, oExpectedPos, "top position should be 355px");

		stubPopoverOuterWidth.restore();
		stubPopoverOuterHeight.restore();
		stubPopoverOffset.restore();
		stubParentOuterHeight.restore();
		stubParentOffset.restore();
		stubArrowOuterHeight.restore();
	});

	QUnit.test("_getArrowPositionCssClass returns the right CSS class for different position options", function (assert){
		var sPlacementClass;

		sPlacementClass = this.oPopover._getArrowPositionCssClass(PlacementType.Top);
		assert.equal(sPlacementClass, "sapMPopoverArrDown", "The class should be sapMPopoverArrDown");

		sPlacementClass = this.oPopover._getArrowPositionCssClass(PlacementType.Bottom);
		assert.equal(sPlacementClass, "sapMPopoverArrUp", "The class should be sapMPopoverArrUp");

		sPlacementClass = this.oPopover._getArrowPositionCssClass(PlacementType.Left);
		assert.equal(sPlacementClass, "sapMPopoverArrRight", "The class should be sapMPopoverArrRight");

		sPlacementClass = this.oPopover._getArrowPositionCssClass(PlacementType.Right);
		assert.equal(sPlacementClass, "sapMPopoverArrLeft", "The class should be sapMPopoverArrLeft");
	});

	QUnit.test("_getArrowStyleCssClass should return sapMPopoverHeaderAlignArr class if Popover Arrow is aligned with the header", function (assert){
		var oPosParams = {
				_$arrow: jQuery(),
				_$footer: jQuery(),
				_fArrowHeight: 32,
				_fHeaderHeight: 48,
				_fSubHeaderHeight: 0
			},
		stubArrowPosition = sinon.stub(oPosParams._$arrow, "position").returns({top: 7, left: -33}),
		stubFooterPosition = sinon.stub(oPosParams._$footer, "position").returns({top: 187, left: 0});

		var sClassName = this.oPopover._getArrowStyleCssClass(oPosParams);

		assert.equal(sClassName, "sapMPopoverHeaderAlignArr", "Should return sapMPopoverHeaderAlignArr class");

		stubArrowPosition.restore();
		stubFooterPosition.restore();
	});

	QUnit.test("_getArrowStyleCssClass should return sapMPopoverCrossArr class if Popover Arrow crosses the header and content", function (assert){
		var oPosParams = {
			_$arrow: jQuery(),
			_$footer: jQuery(),
			_fArrowHeight: 32,
			_fHeaderHeight: 48,
			_fSubHeaderHeight: 0
		},
		stubArrowPosition = sinon.stub(oPosParams._$arrow, "position").returns({top: 30, left: -33}),
		stubFooterPosition = sinon.stub(oPosParams._$footer, "position").returns({top: 800, left: 0});

		oPosParams._$footer.length = 1;

		var sClassName = this.oPopover._getArrowStyleCssClass(oPosParams);

		assert.equal(sClassName, "sapMPopoverCrossArr", "Should return sapMPopoverCrossArr class");

		stubArrowPosition.restore();
		stubFooterPosition.restore();
	});

	QUnit.test("_getArrowStyleCssClass should return sapMPopoverFooterAlignArr class if Popover Arrow is aligned with the footer", function (assert){
		var oPosParams = {
			_$arrow: jQuery(),
			_$footer: jQuery("<div></div>"),
			_arrowHeight: 32,
			_headerHeight: 48,
			_subHeaderHeight: 0
		},
		stubArrowPosition = sinon.stub(oPosParams._$arrow, "position").returns({top: 153, left: -33}),
		stubFooterPosition = sinon.stub(oPosParams._$footer, "position").returns({top: 149, left: 0});

		var sClassName = this.oPopover._getArrowStyleCssClass(oPosParams);

		assert.equal(sClassName, "sapMPopoverFooterAlignArr", "Should return sapMPopoverFooterAlignArr class");

		stubArrowPosition.restore();
		stubFooterPosition.restore();
	});

	QUnit.test("_adaptPositionParams with showArrow true should have offsets set", function (assert){
		this.oPopover._adaptPositionParams();

		assert.equal(this.oPopover._marginTop, 48, "_marginTop should be 48");
		assert.equal(this.oPopover._marginRight, 10, "_marginTop should be 10");
		assert.equal(this.oPopover._marginBottom, 10, "_marginTop should be 10");
		assert.equal(this.oPopover._marginLeft, 10, "_marginTop should be 10");
		assert.equal(this.oPopover._arrowOffset, 18, "_arrowoffset should be 18");
		assert.deepEqual(this.oPopover._offsets, ["0 -18", "18 0", "0 18", "-18 0"], "offsets should be correct according the arrowOffset");
		assert.deepEqual(this.oPopover._myPositions, ["center bottom", "begin center", "center top", "end center"], "myPositions should be correct");
		assert.deepEqual(this.oPopover._atPositions, ["center top", "end center", "center bottom", "begin center"], "atPositions should be correct");
	});

	QUnit.test("_adaptPositionParams with showArrow false should not have offsets set", function (assert){
		this.oPopover.setShowArrow(false);
		this.oPopover._adaptPositionParams();

		assert.equal(this.oPopover._marginTop, 0, "_marginTop should be 0");
		assert.equal(this.oPopover._marginRight, 0, "_marginRight should be 0");
		assert.equal(this.oPopover._marginBottom, 0, "_marginBttom should be 0");
		assert.equal(this.oPopover._marginLeft, 0, "_marginLeft should be 0");
		assert.equal(this.oPopover._arrowOffset, 0, "_arrowoffset should be 0");
		assert.deepEqual(this.oPopover._offsets, ["0 0", "0 0", "0 0", "0 0"], "offsets should be correct according the arrowOffset");
		assert.deepEqual(this.oPopover._myPositions, ["begin bottom", "begin center", "begin top", "end center"], "myPositions should be correct");
		assert.deepEqual(this.oPopover._atPositions, ["begin top", "end center", "begin bottom", "begin center"], "atPositions should be correct");
	});

	QUnit.test("Popover should use compact arrow offset if a theme sets less variable _sap_m_Popover_ForceCompactArrowOffset to true", async function (assert){
		var stubGetParameters = sinon.stub(Parameters, "get");

		stubGetParameters.withArgs({name: "_sap_m_Popover_ForceCompactArrowOffset"}).returns("true");
		this.oPopover.openBy(this.oButton);
		await nextUIUpdate();

		assert.equal(this.oPopover._arrowOffset, 9, "_arrowoffset should be 9");
		assert.deepEqual(this.oPopover._offsets, ["0 -9", "9 0", "0 9", "-9 0"], "offsets should be correct according the arrowOffset");

		stubGetParameters.restore();
	});

	QUnit.test("Popover should use normal arrow offset if a theme sets less variable _sap_m_Popover_ForceCompactArrowOffset to be false", async function (assert){
		var stubGetParameters = sinon.stub(Parameters, "get").callsFake(function () { return "false";});

		this.oPopover.openBy(this.oButton);
		await nextUIUpdate();

		assert.equal(this.oPopover._arrowOffset, 18, "_arrowoffset should be 18");
		assert.deepEqual(this.oPopover._offsets, ["0 -18", "18 0", "0 18", "-18 0"], "offsets should be correct according the arrowOffset");

		stubGetParameters.restore();
	});

	QUnit.test("Popover should be in compact mode if one of it's parents is compact", async function (assert){
		var oScrollContainer = new ScrollContainer().addStyleClass("sapUiSizeCompact"),
			oButton2 = new Button();

		oScrollContainer.addContent(oButton2);

		oScrollContainer.placeAt("content");
		await nextUIUpdate();
		this.oPopover.openBy(oButton2);

		assert.equal(this.oPopover._arrowOffset, 9, "_arrowoffset should be 9");
		assert.deepEqual(this.oPopover._offsets, ["0 -9", "9 0", "0 9", "-9 0"], "offsets should be correct according the arrowOffset");

		oScrollContainer.destroy();
		oButton2.destroy();
	});

	QUnit.test("_afterAdjustPositionAndArrow is called once", async function (assert){
		this.oButton.removeStyleClass("positioned");

		var oSpy = this.spy(this.oPopover, "_afterAdjustPositionAndArrowHook");

		this.oPopover.openBy(this.oButton);
		await nextUIUpdate();

		assert.equal(oSpy.callCount, 1, "_afterAdjustPositionAndArrowHook is called once");

	});

	QUnit.module("Screen Reader", {
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();

			this.oButton = new Button({
				text: "Open Popover"
			});
			this.oPopover = new Popover();

			page.addContent(this.oButton);
			await nextUIUpdate(this.clock);
		},
		afterEach: function () {
			this.oPopover.destroy();
			this.oButton.destroy();
			runAllFakeTimersAndRestore(this.clock);
		}
	});

	QUnit.test("ARIA role", async function (assert){
		this.oPopover.openBy(this.oButton);
		await nextUIUpdate(this.clock);

		assert.equal(this.oPopover.$().attr('role'), 'dialog', 'Popover has role dialog');
		assert.equal(this.oPopover.$("firstfe").attr('role'), 'presentation', "Popover' hidden focusable span has role presentation");
		assert.equal(this.oPopover.$("lastfe").attr('role'), 'presentation', "Popovers' hidden focusable span has role presentation");
	});

	QUnit.test("ARIA labeledby attribute", async function (assert){
		this.oPopover.openBy(this.oButton);
		await nextUIUpdate(this.clock);

		assert.equal(this.oPopover.$().attr('aria-labelledby'), this.oPopover.getHeaderTitle().getId(), 'Popover aria labeledby attribute is equal to the header id');
	});

	QUnit.test("ARIA Semantic heading of the popover", async function (assert){
		this.oPopover.setTitle("Title text");
		this.oPopover.openBy(this.oButton);
		await nextUIUpdate(this.clock);

		assert.equal(this.oPopover._headerTitle.getDomRef().nodeName, "H1", "Popover heading should be set to H1 tag");
		assert.ok(this.oPopover._headerTitle instanceof Title, "Heading of the popover should be of type sap.m.Title");
	});

	QUnit.test("ARIA role of the content", async function (assert){
		this.oPopover.setTitle("Title text");
		this.oPopover._setAriaRoleApplication(true);
		this.oPopover.openBy(this.oButton);
		await nextUIUpdate(this.clock);
		assert.equal(this.oPopover.$("cont").attr("role"), "application", "Popover's content should have role application");

		this.oPopover._setAriaRoleApplication(false);
		this.clock.tick(0);
		assert.notOk(this.oPopover.getDomRef("cont").attributes["role"], "Popover's content should not have role application");
	});

	QUnit.test("Popover without header and title", async function(assert) {
		var sInvTextId = "invisibleText",
			oInvisibleText = new InvisibleText(sInvTextId, {text: "invisible text"});

		oInvisibleText.placeAt("content");
		await nextUIUpdate(this.clock);

		this.oPopover.setShowHeader(false);
		this.oPopover.addAriaLabelledBy(sInvTextId);

		this.oPopover.openBy(this.oButton);
		this.clock.tick(400);

		assert.equal(this.oPopover.getAriaLabelledBy(), sInvTextId, "should have an ariaLabelledBy association that contains a reference to the invisible text");
		assert.equal(this.oPopover.getDomRef().getAttribute('aria-labelledby'), sInvTextId, "should have an aria-labelledby attribute pointing to the additional invisible label");

		oInvisibleText.destroy();
	});

	QUnit.test("Popover with internal header and title", async function(assert) {
		var sInvTextId = "invisibleText",
			oInvisibleText = new InvisibleText(sInvTextId, {text: "invisible text"});

		oInvisibleText.placeAt("content");
		await nextUIUpdate(this.clock);

		this.oPopover.setTitle("Title text");
		this.oPopover.addAriaLabelledBy(sInvTextId);

		this.oPopover.openBy(this.oButton);
		this.clock.tick(400);

		assert.equal(this.oPopover.getAriaLabelledBy(), sInvTextId, "should have an ariaLabelledBy association that contains only a reference to the invisible text");
		assert.equal(this.oPopover.getDomRef().getAttribute('aria-labelledby'), (this.oPopover.getHeaderTitle().getId() + ' ' + sInvTextId), "should have an aria-labelledby attribute pointing to the internal header and the additional invisible label");

		oInvisibleText.destroy();
	});

	QUnit.test("Popover with custom header", async function(assert) {
		//Arrange
		var sInvTextId = "invisibleText",
			sCustomHeaderId = "customHeaderId",
			oInvisibleText = new InvisibleText(sInvTextId, {text: "invisible text"});

		var oCustomHeader = new Bar(sCustomHeaderId, {
			contentLeft: [new Title({text: "Just Title"})]
		});

		oInvisibleText.placeAt("content");
		await nextUIUpdate(this.clock);

		this.oPopover.addAriaLabelledBy(sInvTextId);
		this.oPopover.setTitle("Title text");

		this.oPopover.setShowHeader(true);
		this.oPopover.setCustomHeader(oCustomHeader);
		this.oPopover.openBy(this.oButton);
		this.clock.tick(400);

		//Assert
		assert.equal(this.oPopover.getAriaLabelledBy(), sInvTextId, "should have an ariaLabelledBy association that contains only a reference to the invisible text");
		assert.equal(this.oPopover.getDomRef().getAttribute('aria-labelledby'), (sCustomHeaderId + ' ' + sInvTextId), "should have an aria-labelledby attribute pointing to the header and the additional invisible label");

		//Cleanup
		oInvisibleText.destroy();
		oCustomHeader.destroy();
	});

	QUnit.test("Popover with non-visible custom header", async function(assert) {
		//Arrange
		var sInvTextId = "invisibleText",
			sCustomHeaderId = "customHeaderId",
			oInvisibleText = new InvisibleText(sInvTextId, {text: "invisible text"});

		var oCustomHeader = new Bar(sCustomHeaderId, {
			contentLeft: [new Title({text: "Just Title"})],
			visible: false
		});

		oInvisibleText.placeAt("content");
		await nextUIUpdate(this.clock);

		this.oPopover.addAriaLabelledBy(sInvTextId);

		this.oPopover.setCustomHeader(oCustomHeader);
		this.oPopover.getCustomHeader().setVisible(false);
		this.oPopover.openBy(this.oButton);
		this.clock.tick(400);

		//Assert
		assert.equal(this.oPopover.getAriaLabelledBy(), sInvTextId, "should have an ariaLabelledBy association that contains only a reference to the invisible text");
		assert.equal(this.oPopover.getDomRef().getAttribute('aria-labelledby'), sInvTextId, "aria-labelledby should still be with one reference, since the custom header is not in the dom");

		//Cleanup
		oInvisibleText.destroy();
		oCustomHeader.destroy();
	});

	QUnit.test("ARIA aria-modal attribute should be true", async function (assert){
		this.oPopover.openBy(this.oButton);
		await nextUIUpdate(this.clock);

		assert.strictEqual(this.oPopover.$().attr('aria-modal'), "true", 'Popover aria-modal attribute is set to true');
	});

	QUnit.module("Integration");

	QUnit.test("Focus should be taken out of Popover after closed on tablet", async function (assert) {
		this.clock = sinon.useFakeTimers();
		this.stub(Device, "system").value({
			desktop: false,
			phone: false,
			tablet: true,
			combi: false
		});

		var oInput = new Input();

		var oPopover = new Popover({
			title: "Title text",
			content: [oInput]
		});
		var oButton = new Button({
			text: "Open Popover"
		}).placeAt("content");

		await nextUIUpdate(this.clock);

		oPopover.openBy(oButton);
		this.clock.tick(500);
		assert.ok(containsOrEquals(oInput.getDomRef(), document.activeElement), "focus is set to input");

		oPopover.close();
		this.clock.tick(500);

		assert.ok(!containsOrEquals(oInput.getDomRef(), document.activeElement), "focus is not in input anymore");

		runAllFakeTimersAndRestore(this.clock);
		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Focus should be taken out of Popover after closed on mobile", async function (assert) {
		this.clock = sinon.useFakeTimers();
		this.stub(Device, "system").value({
			desktop: false,
			phone: true,
			tablet: false,
			combi: false
		});

		var oInput = new Input();

		var oPopover = new Popover({
			title: "Title text",
			content: [oInput]
		});
		var oButton = new Button({
			text: "Open Popover"
		}).placeAt("content");

		await nextUIUpdate(this.clock);

		oPopover.openBy(oButton);
		this.clock.tick(500);
		assert.ok(containsOrEquals(oInput.getDomRef(), document.activeElement), "focus is set to input");

		oPopover.close();
		this.clock.tick(500);

		assert.ok(!containsOrEquals(oInput.getDomRef(), document.activeElement), "focus is not in input anymore");

		runAllFakeTimersAndRestore(this.clock);
		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Do not fire close events when destroyed", function (assert) {
		this.clock = sinon.useFakeTimers();
		// Setup
		var oPopover = new Popover(),
			beforeCloseSpy = this.spy(),
			afterCloseSpy = this.spy();

		oPopover.attachBeforeClose(beforeCloseSpy);
		oPopover.attachAfterClose(afterCloseSpy);

		//Act
		setTimeout(function() {
			oPopover.destroy();
		}, 1000);
		this.clock.tick(1001);

		assert.strictEqual(beforeCloseSpy.called, false, "On destruction do not call beforeClose event");
		assert.strictEqual(afterCloseSpy.called, false, "On destruction do not call afterClose event");

		//Clean
		runAllFakeTimersAndRestore(this.clock);
		oPopover.destroy();
	});

	QUnit.test("beforeClose should be fired if the Popover is auto-closed and the focus is still inside but the DOM of the element that opened it no longer exists", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oCloseButton;
		var oOpenButton = new Button({
			text: "Open Popover"
		}).placeAt("content");
		var oPopover = new Popover({
			endButton: [
				oCloseButton = new Button({
					text: "Close Popover",
					press: function () {
						oOpenButton.setVisible(false);
						setTimeout(function() {
							oPopover.close();
						}, 300);
					}
				})
			]
		});
		var oBeforeCloseSpy = this.spy();

		// Act
		await nextUIUpdate(this.clock);
		oPopover.openBy(oOpenButton);
		this.clock.tick(300);

		oPopover.attachBeforeClose(oBeforeCloseSpy);
		oCloseButton.firePress();
		this.clock.tick(300);

		// Assert
		assert.strictEqual(oBeforeCloseSpy.called, true, "beforeClose event is fired");

		// Clean
		runAllFakeTimersAndRestore(this.clock);

		oPopover.destroy();
		oOpenButton.destroy();
		oCloseButton.destroy();
	});

	QUnit.test("Do not fire close events when already closed.", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Setup
		this.stub(Popup.prototype, "touchEnabled").value(true);

		var oPopover = new Popover(),
			oButton = new Button(),
			beforeCloseSpy = this.spy(),
			afterCloseSpy = this.spy();

		oButton.addDependent(oPopover);
		oButton.placeAt("content");
		await nextUIUpdate(this.clock);

		oPopover.attachBeforeClose(beforeCloseSpy);
		oPopover.attachAfterClose(afterCloseSpy);

		//Act
		oPopover.openBy(oButton);
		await nextUIUpdate(this.clock);
		this.clock.tick(1000);

		oPopover.oPopup.close();
		oPopover.oPopup.close();
		this.clock.tick(1000);

		// Assert
		assert.strictEqual(beforeCloseSpy.callCount, 1, "Should be called only once during the first call.");
		assert.strictEqual(afterCloseSpy.callCount, 1, "Should be called only once during the first call.");

		// Cleanup
		runAllFakeTimersAndRestore(this.clock);
		oButton.destroy();
		oPopover.destroy();
		oButton = null;
		oPopover = null;
	});

	QUnit.test("Do not attach orientationChange handler on destroyed popover", async function (assert){
		this.clock = sinon.useFakeTimers();
		// setup
		var oDeviceParams = {
			system: {
				desktop: true,
				phone: false,
				tablet: false
			},
			support: {
				touch: false
			}
		};

		this.stub(Device, "system").value(oDeviceParams.system);
		this.stub(Device, "support").value(oDeviceParams.support);

		var oResizeHandlerSpy = this.spy(Device.resize, "attachHandler");
		var oButton = new Button().placeAt("content");
		var oPopover = new Popover({
			contentWidth: "300px",
			contentHeight: "300px",
			content: new HTML({
				content: "<div class='width500height600'></div>"
			}),
			afterOpen: function(oEvent) {
				oPopover.destroy();
			}
		});

		await nextUIUpdate(this.clock);

		// act
		oPopover.openBy(oButton);
		this.clock.tick(500);

		// assert
		assert.equal(oResizeHandlerSpy.callCount, 0, "The resize handler is not attached to a destroyed popover");

		// clean up
		runAllFakeTimersAndRestore(this.clock);
		oButton.destroy();
		oPopover.destroy();
	});

	QUnit.test("Popover open after being destroyed", async function (assert){
		this.clock = sinon.useFakeTimers();
		// setup
		var oDeviceParams = {
			system: {
				desktop: true,
				phone: false,
				tablet: false
			},
			support: {
				touch: false
			}
		};

		this.stub(Device, "system").value(oDeviceParams.system);
		this.stub(Device, "support").value(oDeviceParams.support);

		var oPopover = new Popover({
			content: [new Label({text: "Hello World!"})]
		});
		var oOpenerSpy = this.spy(oPopover, "openBy");
		var oButton = new Button({
			text: "Click me!",
			press: function () {
				oPopover.openBy(this);
				oPopover.close();
				oPopover.openBy(this); // -> too fast! open will be deferred because popup is still "closing"
				oPopover.destroy();
			}
		}).placeAt("content");
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		//Act
		try {
			oButton.firePress();
			await nextUIUpdate();
		} catch (e) { e; }

		// Assert
		assert.ok(!oOpenerSpy.threw(), "Destroyed and closed silently without exception");

		// Cleanup
		runAllFakeTimersAndRestore(this.clock);
		oButton.destroy();
		oPopover.destroy();
	});

	function isTextTruncated($element) {
		var iTolerance = 0;

		return $element[0].scrollWidth > ($element.innerWidth() + iTolerance);
	}

	QUnit.test("Popover is auto-closed if the opener is currently not visible", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oOpenButton = new Button({
			text: "Open Popover"
		});
		var oOtherButton = new Button({
			text: "Other Button"
		});

		page.addContent(oOpenButton);
		page.addContent(oOtherButton);

		var oPopover = new Popover({
			title: "Popover Title",
			content: [
				new Button({
					text: "Popover Button"
				})
			]
		});

		oPopover._followOfTolerance = 100000000;

		// Act
		await nextUIUpdate(this.clock);
		oPopover.openBy(oOpenButton);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		oOpenButton.getDomRef().style.position = "absolute";
		oOpenButton.getDomRef().style.width = "80px";

		Popup.checkDocking.call(oPopover.oPopup);

		this.clock.tick(500);
		// Assert
		assert.notOk(oPopover.isOpen(), "Popover is auto closed");

		// Clean
		runAllFakeTimersAndRestore(this.clock);

		oPopover.destroy();
		oOpenButton.destroy();
		oOtherButton.destroy();
	});

	QUnit.test("Modal popover is not auto-closed if the opener is currently not visible", async function (assert) {
		this.clock = sinon.useFakeTimers();
		// Arrange
		var oOpenButton = new Button({
			text: "Open Popover"
		});
		var oOtherButton = new Button({
			text: "Other Button"
		});

		page.addContent(oOpenButton);
		page.addContent(oOtherButton);

		var oPopover = new Popover({
			modal: true,
			title: "Popover Title",
			content: [
				new Button({
					text: "Popover Button"
				})
			]
		});

		oPopover._followOfTolerance = 100000000;

		// Act
		await nextUIUpdate(this.clock);
		oPopover.openBy(oOpenButton);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		oOpenButton.getDomRef().style.position = "absolute";
		oOpenButton.getDomRef().style.width = "80px";

		Popup.checkDocking.call(oPopover.oPopup);

		this.clock.tick(500);

		// Assert
		assert.ok(oPopover.isOpen(), "Popover is not auto closed");

		// Clean
		runAllFakeTimersAndRestore(this.clock);

		oPopover.destroy();
		oOpenButton.destroy();
		oOtherButton.destroy();
	});

	QUnit.test("Popover openby Shadow DOM element", (assert) => {
		customElements.define(
			"my-web-component-1",
			class extends HTMLElement {
				constructor() {
					super();
					const shadowRoot = this.attachShadow({ mode: "open"});

					const oButton = document.createElement("button");
					oButton.setAttribute("id", "btn1");
					oButton.appendChild(document.createTextNode("open sap.m.Popover"));

					shadowRoot.appendChild(oButton);
				}
			}
		);

		const oDiv = createAndAppendDiv("my-web-component-parent");
		const oMyWebComponent = document.createElement("my-web-component-1");
		oDiv.appendChild(oMyWebComponent);

		const oPopupSpy = sinon.spy(Popup.prototype, "_applyPosition");
		// create popover and openBy Shadow DOM element
		const oPopover = new Popover();
		const oBtnInShadowDOM = oMyWebComponent.shadowRoot.getElementById("btn1");
		oPopover.openBy(oBtnInShadowDOM);

		assert.equal(oPopupSpy.callCount, 1, "Popup#_applyPosition called");
		assert.ok(oPopupSpy.calledWithMatch({ of: oBtnInShadowDOM }), "Popup#_applyPosition called with correct 'Position.of' info");
		oPopupSpy.restore();
		oDiv.remove();
	});

	QUnit.module("Popover scroll width",{
		beforeEach: async function() {
			this.clock = sinon.useFakeTimers();
			this.oButton = new Button().placeAt("content");
			this.oPopover = new Popover({
				title: 'Will have vertical scroll',
				horizontalScrolling: false,
				contentHeight: "10rem", // ensure that we have a vertical scroll
				content: [
					new List({
						items: [
							new StandardListItem({
								title: "Item 1"
							}),
							new StandardListItem({
								title: "Item 2"
							}),
							new StandardListItem({
								title: "Item 3"
							}),
							new StandardListItem({
								id: "longTextItem", // this item has to be visible without truncation by default
								title: "Item with some long text. Item with some long text."
							}),
							new StandardListItem({
								title: "Item 4"
							})
						]
					})
				]
			});

			await nextUIUpdate(this.clock);
		},
		afterEach: function() {
			runAllFakeTimersAndRestore(this.clock);
			this.oPopover.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Item texts are not truncated when width is auto", async function(assert) {
		this.oPopover.openBy(this.oButton);
		this.clock.tick(500);
		this.clock.tick(1); // also process nested setTimeout calls

		await nextUIUpdate(this.clock);

		var $longTextItem = this.oPopover.$().find("#longTextItem .sapMSLITitleOnly");

		// assert
		assert.strictEqual(isTextTruncated($longTextItem), false, "Long text is not truncated when width is auto");
	});

	QUnit.test("Text is truncated when width is too small", async function(assert) {
		this.oPopover.setContentWidth("20rem");
		await nextUIUpdate(this.clock);

		this.oPopover.openBy(this.oButton);
		this.clock.tick(500);

		var $longTextItem = this.oPopover.$().find("#longTextItem .sapMSLITitleOnly");

		// assert
		assert.strictEqual(isTextTruncated($longTextItem), true, "Text is truncated when width is small");
	});

	QUnit.test("Calling _includeScrollWidth with no dom ref", function(assert) {
		this.oPopover._includeScrollWidth();
		// assert
		assert.ok(true, "Should not throw an error when there is no dom ref");
	});

	QUnit.test("Height that includes scrollbars height is preserved after invalidation", async function(assert) {
		const oPopover = new Popover({
			contentHeight: "auto",
			content: [
				new HTML({
					content: "<div style='width: 10000px;'>hello world</div>"
				})
			]
		});

		oPopover.openBy(this.oButton);
		this.clock.tick(500);

		const iHeightAfterOpen = oPopover.getDomRef("cont").getBoundingClientRect().height;

		assert.ok(iHeightAfterOpen > 0, "Height is greater than 0");

		// act
		oPopover.invalidate();
		await nextUIUpdate(this.clock);

		assert.ok(oPopover.getDomRef("cont").getBoundingClientRect().height >= iHeightAfterOpen, "Height is preserved after invalidation");

		// clean up
		runAllFakeTimersAndRestore(this.clock);
		oPopover.destroy();
	});

	QUnit.module("Responsive paddings");

	QUnit.test("_initResponsivePaddingsEnablement is called on init", async function (assert) {
		// Arrange
		var oSpy = sinon.spy(Popover.prototype, "_initResponsivePaddingsEnablement");
		var oButton = new Button().placeAt("content");
		var oPopover = new Popover({});
		await nextUIUpdate();

		// Act
		oPopover.openBy(oButton);

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Method _initResponsivePaddingsEnablement is called on init of the control");

		// cleanup
		oSpy.restore();
		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Correct responsive paddings are applied", async function (assert) {
		var oClock = sinon.useFakeTimers();

		var oButton = new Button({text: "Test"});
		var oPopover = new Popover("responsivePaddingsPopover", {
			title: "Test title",
			subHeader: new Bar({
				contentMiddle: [
					new SearchField({
						placeholder: "Search ...",
						width: "100%"
					})
				]
			}),
			content: [
				new List({
					items: [
						new StandardListItem({
							title: "Item 1"
						}),
						new StandardListItem({
							title: "Item 2"
						})
					]
				})
			],
			footer: new Bar({
				contentLeft: [new Button({icon: "sap-icon://inspection", text: "short"})],
				contentRight: [new Button({icon: "sap-icon://home", text: "loooooong text"})]
			})
		});

		page.addContent(oButton);

		await nextUIUpdate(oClock);

		oPopover.addStyleClass("sapUiResponsivePadding--header");
		oPopover.addStyleClass("sapUiResponsivePadding--subHeader");
		oPopover.addStyleClass("sapUiResponsivePadding--content");
		oPopover.addStyleClass("sapUiResponsivePadding--footer");
		await nextUIUpdate(oClock);

		oPopover.openBy(oButton);
		oClock.tick(300);
		await nextUIUpdate(oClock);

		var fnIsResponsive = function (sParentSelector, sChildSelector) {
			return oPopover.$().find(sParentSelector).hasClass(sChildSelector);
		};

		// Assert
		assert.ok(fnIsResponsive("#responsivePaddingsPopover-intHeader", "sapUi-Std-PaddingS"), "The sapUi-Std-PaddingS class is applied to the header");
		assert.ok(fnIsResponsive(".sapMPopoverSubHeader .sapMIBar", "sapUi-Std-PaddingS"), "The sapUi-Std-PaddingS class is applied to the header");
		assert.ok(fnIsResponsive("#responsivePaddingsPopover-cont", "sapUi-Std-PaddingS"), "The sapUi-Std-PaddingS class is applied to the header");
		assert.ok(fnIsResponsive(".sapMPopoverFooter .sapMIBar", "sapUi-Std-PaddingS"), "The sapUi-Std-PaddingS class is applied to the header");

		// Act
		oPopover.setContentWidth("600px");
		oClock.tick(300);
		await nextUIUpdate(oClock);

		// Assert
		assert.ok(fnIsResponsive("#responsivePaddingsPopover-intHeader", "sapUi-Std-PaddingM"), "The sapUi-Std-PaddingM class is applied to the header");
		assert.ok(fnIsResponsive(".sapMPopoverSubHeader .sapMIBar", "sapUi-Std-PaddingM"), "The sapUi-Std-PaddingM class is applied to the header");
		assert.ok(fnIsResponsive("#responsivePaddingsPopover-cont", "sapUi-Std-PaddingM"), "The sapUi-Std-PaddingM class is applied to the header");
		assert.ok(fnIsResponsive(".sapMPopoverFooter .sapMIBar", "sapUi-Std-PaddingM"), "The sapUi-Std-PaddingM class is applied to the header");

		// Act
		oPopover.setContentWidth("300px");
		oClock.tick(300);
		await nextUIUpdate(oClock);

		// Assert
		assert.ok(fnIsResponsive("#responsivePaddingsPopover-intHeader", "sapUi-Std-PaddingS"), "The sapUi-Std-PaddingS class is applied to the header");
		assert.ok(fnIsResponsive(".sapMPopoverSubHeader .sapMIBar", "sapUi-Std-PaddingS"), "The sapUi-Std-PaddingS class is applied to the header");
		assert.ok(fnIsResponsive("#responsivePaddingsPopover-cont", "sapUi-Std-PaddingS"), "The sapUi-Std-PaddingS class is applied to the header");
		assert.ok(fnIsResponsive(".sapMPopoverFooter .sapMIBar", "sapUi-Std-PaddingS"), "The sapUi-Std-PaddingS class is applied to the header");

		//cleanup
		runAllFakeTimersAndRestore(oClock);
		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Should not throw exception if no DOM reference is found in _clearCSSStyles()", async function (assert) {
		var oPopover = new Popover({}),
			oStub = sinon.stub(oPopover, "getDomRef").callsFake(function() { return null; });

		await nextUIUpdate();
		oPopover._clearCSSStyles();

		assert.ok(true, "No exception is thrown");

		oPopover.destroy();
		oStub.restore();
	});

	QUnit.module("Title Alignment");

	QUnit.test("setTitleAlignment test", async function (assert) {

		var oPopover = new Popover({
				title: "Header"
			}),
			oButton = new Button({text: "Test"}),
			sAlignmentClass = "sapMBarTitleAlign",
			setTitleAlignmentSpy = this.spy(oPopover, "setTitleAlignment"),
			sInitialAlignment,
			sAlignment;

		oButton.placeAt("qunit-fixture");
		await nextUIUpdate();
		oPopover.openBy(oButton);
		await nextUIUpdate();
		sInitialAlignment = oPopover.getTitleAlignment();

		// initial titleAlignment test depending on theme
		assert.ok(oPopover._getAnyHeader().hasStyleClass(sAlignmentClass + sInitialAlignment),
					"The default titleAlignment is '" + sInitialAlignment + "', there is class '" + sAlignmentClass + sInitialAlignment + "' applied to the Header");

		// check if all types of alignment lead to apply the proper CSS class
		for (sAlignment in TitleAlignment) {
			oPopover.setTitleAlignment(sAlignment);
			await nextUIUpdate();
			assert.ok(oPopover._getAnyHeader().hasStyleClass(sAlignmentClass + sAlignment),
						"titleAlignment is set to '" + sAlignment + "', there is class '" + sAlignmentClass + sAlignment + "' applied to the Header");
		}

		// check how many times setTitleAlignment method is called
		assert.strictEqual(setTitleAlignmentSpy.callCount, Object.keys(TitleAlignment).length,
			"'setTitleAlignment' method is called total " + setTitleAlignmentSpy.callCount + " times");

		// cleanup
		oPopover.destroy();
	});

	QUnit.module("Invalidation");

	QUnit.test("Invalidate while closing", async function (assert) {
		var done = assert.async();
		var oButton;

		var oPopover = new Popover({
			title: "Header",
			content: new Button({
				text: "click me"
			}),
			afterOpen: async function () {
				oPopover.invalidate();
				oPopover.oPopup.bOpen = false;
				oPopover.oPopup._closed();
				oPopover.removeDelegate(oPopover.oPopup);

				await nextUIUpdate();

				assert.strictEqual(window.getComputedStyle(oPopover.getDomRef()).visibility, "hidden", "Popover is hidden");

				// cleanup
				oButton.destroy();
				oPopover.destroy();

				done();
			}
		});

		oButton = new Button({
			text: "Open Popover"
		});

		page.addContent(oButton);
		await nextUIUpdate();

		oPopover.openBy(oButton);
	});

	// include stylesheet and let test starter wait for it
	return includeStylesheet({
		url: sap.ui.require.toUrl("test-resources/sap/m/qunit/Popover.css")
	});

});
