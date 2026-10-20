/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/dom/includeStylesheet",
	"sap/ui/dom/units/Rem",
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
	"sap/ui/core/popover/Positioning",
	"sap/ui/core/popover/PopoverPhysicalSide",
	"sap/m/NavContainer",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/ui/core/theming/Parameters",
	"sap/ui/core/InvisibleText",
	"sap/m/Title",
	"sap/m/Text",
	"sap/m/Input",
	"sap/m/VBox",
	"sap/m/ValueStateHeader",
	"sap/ui/events/KeyCodes",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/dialogUtils/PreventKeyboardEvents",
	"sap/m/Dialog"
], function(
	qutils,
	createAndAppendDiv,
	includeStylesheet,
	Rem,
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
	Positioning,
	PopoverPhysicalSide,
	NavContainer,
	SegmentedButton,
	SegmentedButtonItem,
	Parameters,
	InvisibleText,
	Title,
	Text,
	Input,
	VBox,
	ValueStateHeader,
	KeyCodes,
	containsOrEquals,
	nextUIUpdate,
	PreventKeyboardEvents,
	Dialog
) {
	"use strict";

	const DOM_RENDER_LOCATION = "content";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.TitleAlignment
	var TitleAlignment = mobileLibrary.TitleAlignment;

	// Creates the shared "content" render target in the document body. Modules call this in
	// their "before" hook and removeRenderTarget() in "after", so no DOM leaks between modules.
	function createRenderTarget() {
		document.body.insertBefore(createAndAppendDiv("content"), document.body.firstChild);
	}

	function removeRenderTarget() {
		document.getElementById("content")?.remove();
	}

	var IMAGE_PATH = "test-resources/sap/m/images/";

	const fArrowOffset = Rem.toPx(Parameters.get({
		name: "_sap_m_Popover_ArrowOffset"
	}));

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

	/**
	 * Temporarily hides QUnit's report DOM so the documentElement vertical-scrollbar state is
	 * driven only by the test's own content, not by the ambient page height (which overflows the
	 * viewport once the report grows). Keeps the "no vertical scrollbar" precondition deterministic.
	 *
	 * @returns {function} A cleanup function that restores the QUnit report's display style.
	 */
	function suppressAmbientVerticalScrollbar() {
		const oReport = document.getElementById("qunit");
		const sDisplay = oReport ? oReport.style.display : "";
		if (oReport) {
			oReport.style.display = "none";
		}
		return function () {
			if (oReport) {
				oReport.style.display = sDisplay;
			}
		};
	}

	function nextAfterOpenEvent(oPopover) {
		return new Promise(function (resolve) {
			oPopover.attachEventOnce("afterOpen", resolve);
		});
	}

	function nextAfterCloseEvent(oPopover) {
		return new Promise(function (resolve) {
			oPopover.attachEventOnce("afterClose", resolve);
		});
	}

	QUnit.module("Initial Check");

	QUnit.test("Initialization", function (assert){
		var oPopover = new Popover("popover");

		assert.ok(!document.getElementById("popover"), "Popover is not rendered in the beginning.");

		oPopover.destroy();
	});

	QUnit.module("Open and Close", {
		before: function () {
			createRenderTarget();
		},
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();

			this.oApp = new App();
			this.oPage = new Page({ title: "Test", showNavButton: true });
			this.oApp.addPage(this.oPage).placeAt("content");

			this.oButton = new Button({
				text: "Open Popover",
				press: () => {
					this.oPopover.openBy(this.oButton);
				}
			});

			this.oPopover = new Popover({
				placement: PlacementType.Bottom,
				contentWidth: "400px",
				contentHeight: "300px",
				content: createPopoverContent()
			});

			this.oPage.addContent(this.oButton);
			await nextUIUpdate(this.clock);
		},
		afterEach: function () {
			this.oPopover.destroy();
			this.oButton.destroy();
			this.oApp.destroy();
			runAllFakeTimersAndRestore(this.clock);
		},
		after: function () {
			removeRenderTarget();
		}
	});

	QUnit.test("Open, render and then close", function (assert){
		this.oButton.addStyleClass("positioned");
		this.oButton.firePress();
		this.clock.tick(500);
		assert.ok(this.oPopover.isOpen(), "Popover is open");

		let oDomRef = this.oPopover.getDomRef();

		assert.ok(oDomRef, "Popover is rendered after it's opened.");
		assert.strictEqual(window.getComputedStyle(oDomRef).display, "flex", "Display style of the popover is 'flex'");

		this.oPopover.close();
		this.clock.tick(500);

		oDomRef = this.oPopover.getDomRef();
		assert.strictEqual(window.getComputedStyle(oDomRef).display, "none", "Display style of the popover is 'none'");
	});

	QUnit.test("Open with placement: Bottom, and then close", function (assert){
		this.oButton.addStyleClass("positioned");
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
		assert.ok(Math.ceil($popover.offset().top - fArrowOffset) >= Math.floor($Button.offset().top + $Button.outerHeight()), "Popover should be opened at the bottom of the button");
		if (!Device.support.touch) {
			assert.ok(containsOrEquals($popover[0], document.activeElement), "Popover should have the focus");
		}
		assert.equal(fnBeforeOpen.callCount, 1, "beforeOpen event is fired");
		assert.equal(fnAfterOpen.callCount, 1, "afterOpen event is fired");

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
		this.oButton.addStyleClass("positioned1");
		this.oPopover.setPlacement(PlacementType.Right);
		this.oButton.firePress();
		this.clock.tick(500);

		assert.ok(this.oPopover.isOpen(), "Popover is already open");
		var $popover = this.oPopover.$();
		var $Button = this.oButton.$();

		assert.ok($popover.length, "Popover is rendered after it's opened.");
		assert.ok($popover.closest("#sap-ui-static")[0], "Popover should be rendered inside the static uiArea.");
		assert.ok(Math.ceil($popover.offset().left - fArrowOffset) >= Math.floor($Button.offset().left + $Button.outerWidth()), "Popover should be opened at the right side of the button");
		this.oPopover.close();
		this.clock.tick(500);

		assert.equal($popover.css("visibility"), "hidden", "popover should be hidden after it's closed");
		assert.ok(!this.oPopover.isOpen(), "Popover is already closed");
	});

	QUnit.test("Open with placement: Left, and then close", function (assert){
		this.oButton.addStyleClass("positioned2");
		this.oPopover.setPlacement(PlacementType.Left);
		this.oButton.firePress();
		this.clock.tick(500);

		assert.ok(this.oPopover.isOpen(), "Popover is already open");
		var $popover = this.oPopover.$();
		var $Button = this.oButton.$();

		assert.ok($popover.length, "Popover is rendered after it's opened.");
		assert.ok($popover.closest("#sap-ui-static")[0], "Popover should be rendered inside the static uiArea.");
		assert.ok(Math.floor($popover.offset().left + $popover.outerWidth() + fArrowOffset) <= Math.ceil($Button.offset().left), "Popover should be opened at the left side of the button");

		this.oPopover.close();
		this.clock.tick(500);

		assert.equal($popover.css("visibility"), "hidden", "popover should be hidden after it's closed");
		assert.ok(!this.oPopover.isOpen(), "Popover is already closed");
	});

	QUnit.test("Open with placement: Top, and close", function (assert){
		this.oButton.addStyleClass("positioned3");
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
			assert.ok(Math.floor($popover.offset().top + $popover.outerHeight() + fArrowOffset) <= Math.ceil($Button.offset().top), "Popover should be opened at the top of the button");
		}

		this.oPopover.close();
		this.clock.tick(500);

		assert.equal($popover.css("visibility"), "hidden", "popover should be hidden after it's closed");
		assert.ok(!this.oPopover.isOpen(), "Popover is already closed");
	});

	QUnit.test("Popover should stay open after destroyContent", function(assert) {
		this.oButton.addStyleClass("positioned");
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
		this.oButton.addStyleClass("positioned");
		// act
		this.oPopover.setContentMinWidth("450px");  // note: contentWidth is set to "400px"

		// arrange
		this.oButton.firePress();
		this.clock.tick(1000);  // wait 1s after the open animation is completed

		// assert
		assert.strictEqual(this.oPopover.getDomRef("cont").offsetWidth, 450);
	});

	QUnit.test('it should set the width of the content to "150px"', function(assert) {
		this.oButton.addStyleClass("positioned");
		// act
		this.oPopover.setContentWidth("150px");

		// arrange
		this.oButton.firePress();
		this.clock.tick(1000);  // wait 1s after the open animation is completed

		// assert
		assert.strictEqual(this.oPopover.getDomRef().offsetWidth, 150);
	});

	QUnit.test('ESCAPE should not dismiss the Popover in certain situations', function (assert) {
		this.oButton.addStyleClass("positioned");
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
		this.oButton.addStyleClass("positioned");
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
		this.oButton.addStyleClass("positioned");
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
		this.oButton.addStyleClass("positioned");
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

	QUnit.test("Destroying a Popover restores documentElement scrolling", function (assert) {
		// Arrange: force the no-scrollbar precondition so _preventDocumentElementScrolling
		// saves the original overflow and overrides it, as it does during open.
		const oClientHeightDesc = Object.getOwnPropertyDescriptor(Element.prototype, "clientHeight");
		Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, get: function () { return 100000; } });
		const sOriginalOverflow = document.documentElement.style.overflow;

		this.oPopover._preventDocumentElementScrolling();
		assert.strictEqual(document.documentElement.style.overflow, "hidden", "documentElement overflow is overridden to 'hidden'");

		// Act: destroy without restoring first (simulates destroy while the override is active)
		this.oPopover.destroy();

		// Assert
		assert.strictEqual(document.documentElement.style.overflow, sOriginalOverflow, "documentElement overflow is restored on destroy");

		delete document.documentElement.clientHeight;
		if (oClientHeightDesc) {
			Object.defineProperty(Element.prototype, "clientHeight", oClientHeightDesc);
		}
	});

	QUnit.module("Position calculation", {
		before: function () {
			createRenderTarget();
		},
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			runAllFakeTimersAndRestore(this.clock);
		},
		after: function () {
			removeRenderTarget();
		}
	});

	QUnit.test("vertical calculation of Popover positioning should be correct", function (assert){
		var testCase = function (offset, outerHeight, height, placement, expectedPlace) {
			const stubOffset = sinon.stub(Element.prototype, "getBoundingClientRect").returns({top: offset, height: outerHeight, left: 0, width: 0});
			const oScrollDesc = Object.getOwnPropertyDescriptor(window, "scrollY");
			Object.defineProperty(window, "scrollY", { configurable: true, get: function () { return 0; } });
			const oInnerHeightDesc = Object.getOwnPropertyDescriptor(window, "innerHeight");
			Object.defineProperty(window, "innerHeight", { configurable: true, get: function () { return height; } });

			const oPopover = new Popover({
				placement: placement
			});

			// The popover is measured via getDomRef().getBoundingClientRect(); return a
			// fake element with its own BCR so it is independent of the globally stubbed
			// opener rect (matches the old $().outerWidth/Height stub of outerHeight).
			const stubDomRef = sinon.stub(oPopover, "getDomRef").returns({
				getBoundingClientRect: function () { return { top: 0, left: 0, width: outerHeight, height: outerHeight }; }
			});
			var stubOpenByRef = sinon.stub(oPopover, "_getOpenByDomRef").returns(document.createElement("div"));

			oPopover._calcPlacement();

			assert.strictEqual(oPopover._oCalcedPos, expectedPlace);

			stubOpenByRef.restore();
			stubOffset.restore();
			Object.defineProperty(window, "scrollY", oScrollDesc);
			Object.defineProperty(window, "innerHeight", oInnerHeightDesc);
			stubDomRef.restore();
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
			const stubOffset = sinon.stub(Element.prototype, "getBoundingClientRect").returns({top: offset, height: outerHeight, left: 0, width: 0});
			const oScrollDesc = Object.getOwnPropertyDescriptor(window, "scrollY");
			Object.defineProperty(window, "scrollY", { configurable: true, get: function () { return 0; } });
			const oInnerHeightDesc = Object.getOwnPropertyDescriptor(window, "innerHeight");
			Object.defineProperty(window, "innerHeight", { configurable: true, get: function () { return height; } });


			const oPopover = new Popover({
				placement: placement
			});

			const stubDomRef = sinon.stub(oPopover, "getDomRef").returns({
				getBoundingClientRect: function () { return { top: 0, left: 0, width: outerHeight, height: outerHeight }; }
			});
			var stubOpenByRef = sinon.stub(oPopover, "_getOpenByDomRef").returns(document.createElement("div"));

			oPopover._calcPlacement();

			assert.strictEqual(oPopover._oCalcedPos, expectedPlace);

			stubOpenByRef.restore();
			stubOffset.restore();
			Object.defineProperty(window, "scrollY", oScrollDesc);
			Object.defineProperty(window, "innerHeight", oInnerHeightDesc);
			stubDomRef.restore();
			oPopover.destroy();
		};

		testCase(150, 50, 500, PlacementType.PreferredTopOrFlip, PlacementType.Top); // You have enough space to the Top but Top space is smaller than the Bottom space
		testCase(40, 50, 500, PlacementType.PreferredTopOrFlip, PlacementType.Bottom); // You do not have enough space at the preferred position, so the position with more space is used
		testCase(350, 50, 500, PlacementType.PreferredBottomOrFlip, PlacementType.Bottom); // You have enough space to the Bottom but Bottom space is smaller than the Bottom space
		testCase(450, 50, 500, PlacementType.PreferredBottomOrFlip, PlacementType.Top); // You do not have enough space at the preferred position, so the position with more space is used
	});

	// Opens a Popover on a scrolled page and returns the calculated placement.
	async function runScrolledFlipCase(oConfig) {
		const oContainer = createAndAppendDiv();
		const oSpacerAbove = new HTML({ content: "<div style='height:" + (window.innerHeight + 1000) + "px'></div>" });
		const oOpener = new Button({ text: "Open Popover" });
		oSpacerAbove.placeAt(oContainer);
		oOpener.placeAt(oContainer);

		let oSpacerBelow;
		if (oConfig.spaceBelowOpener) {
			oSpacerBelow = new HTML({ content: "<div style='height:1000px'></div>" });
			oSpacerBelow.placeAt(oContainer);
		}

		const oPopover = new Popover({
			placement: oConfig.placement,
			contentHeight: "300px",
			content: [new HTML({ content: "<div style='height:300px'></div>" })]
		});

		if (oConfig.within) {
			Popup.setWithinArea(oContainer);
		}
		await nextUIUpdate();

		const oOpenerDom = oOpener.getDomRef();
		const iOpenerPageTop = oOpenerDom.getBoundingClientRect().top + window.scrollY;
		if (oConfig.openerAtViewportBottom) {
			window.scrollTo(0, iOpenerPageTop - (window.innerHeight - oOpenerDom.offsetHeight - 20));
		} else {
			window.scrollTo(0, iOpenerPageTop - 20);
		}

		const pOpened = new Promise((resolve) => { oPopover.attachAfterOpen(resolve); });
		oPopover.openBy(oOpener);
		await pOpened;

		const sPos = oPopover._oCalcedPos;

		Popup.setWithinArea(null);
		window.scrollTo(0, 0);
		oPopover.destroy();
		oOpener.destroy();
		oSpacerAbove.destroy();

		if (oSpacerBelow) {
			oSpacerBelow.destroy();
		}

		await nextUIUpdate();
		oContainer.remove();

		return sPos;
	}

	QUnit.test("VerticalPreferredBottom flips up when the opener is at the viewport bottom of a scrolled page", async function (assert) {
		this.clock.restore();
		const sPos = await runScrolledFlipCase({ placement: PlacementType.VerticalPreferredBottom, spaceBelowOpener: true, openerAtViewportBottom: true });
		assert.strictEqual(sPos, PlacementType.Top, "Popover flips up");
	});

	QUnit.test("VerticalPreferredBottom does not flip when there is room below the opener in the viewport", async function (assert) {
		this.clock.restore();
		const sPos = await runScrolledFlipCase({ placement: PlacementType.VerticalPreferredBottom, spaceBelowOpener: true });
		assert.strictEqual(sPos, PlacementType.Bottom, "Popover stays below");
	});

	QUnit.test("VerticalPreferredBottom does not flip when a within-area has room below the opener at the viewport bottom", async function (assert) {
		this.clock.restore();
		const sPos = await runScrolledFlipCase({ placement: PlacementType.VerticalPreferredBottom, spaceBelowOpener: true, openerAtViewportBottom: true, within: true });
		assert.strictEqual(sPos, PlacementType.Bottom, "Popover stays below");
	});

	QUnit.test("PreferredBottomOrFlip flips up when the opener is at the viewport bottom of a scrolled page", async function (assert) {
		this.clock.restore();
		const sPos = await runScrolledFlipCase({ placement: PlacementType.PreferredBottomOrFlip, spaceBelowOpener: true, openerAtViewportBottom: true });
		assert.strictEqual(sPos, PlacementType.Top, "Popover flips up");
	});

	QUnit.test("PreferredBottomOrFlip does not flip when there is room below the opener in the viewport", async function (assert) {
		this.clock.restore();
		const sPos = await runScrolledFlipCase({ placement: PlacementType.PreferredBottomOrFlip, spaceBelowOpener: true });
		assert.strictEqual(sPos, PlacementType.Bottom, "Popover stays below");
	});

	QUnit.test("PreferredBottomOrFlip does not flip when a within-area has room below the opener at the viewport bottom", async function (assert) {
		this.clock.restore();
		const sPos = await runScrolledFlipCase({ placement: PlacementType.PreferredBottomOrFlip, spaceBelowOpener: true, openerAtViewportBottom: true, within: true });
		assert.strictEqual(sPos, PlacementType.Bottom, "Popover stays below");
	});

	QUnit.test("Horizontal (right/left) calculation and flip functionality", function(assert){
		var testCase = function (offset, outerWidth, width, placement, expectedPlace) {
			const stubOffset = sinon.stub(Element.prototype, "getBoundingClientRect").returns({left: offset, width: outerWidth, top: 0, height: 0});
			// Positioning reads the viewport size from documentElement.clientWidth/Height;
			// define own getters and delete afterwards to restore inheritance.
			Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, get: function () { return width; } });
			Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, get: function () { return width; } });

			const oPopover = new Popover({
				placement: placement
			});

			const stubDomRef = sinon.stub(oPopover, "getDomRef").returns({
				getBoundingClientRect: function () { return { top: 0, left: 0, width: outerWidth, height: outerWidth }; }
			});
			var stubOpenByRef = sinon.stub(oPopover, "_getOpenByDomRef").returns(document.createElement("div"));
			oPopover._calcPlacement();

			assert.strictEqual(oPopover._oCalcedPos, expectedPlace);

			stubOpenByRef.restore();
			stubOffset.restore();
			stubDomRef.restore();
			delete document.documentElement.clientWidth;
			delete document.documentElement.clientHeight;
			oPopover.destroy();
		};

		testCase(40, 50, 500, PlacementType.PreferredLeftOrFlip, PlacementType.Right);
		testCase(400, 50, 500, PlacementType.PreferredLeftOrFlip, PlacementType.Left);

		testCase(350, 50, 500, PlacementType.PreferredRightOrFlip, PlacementType.Right);
		testCase(450, 50, 500, PlacementType.PreferredRightOrFlip, PlacementType.Left);
	});

	QUnit.test("horizontal calculation of Popover positioning should be correct", function (assert){
		var testCase = function (offset, outerWidth, width, placement, expectedPlace) {
			const stubOffset = sinon.stub(Element.prototype, "getBoundingClientRect").returns({left: offset, width: outerWidth, top: 0, height: 0});
			Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, get: function () { return width; } });
			Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, get: function () { return width; } });

			var oPopover = new Popover({
				placement: placement
			});

			const stubDomRef = sinon.stub(oPopover, "getDomRef").returns({
				getBoundingClientRect: function () { return { top: 0, left: 0, width: outerWidth, height: outerWidth }; }
			});
			var stubOpenByRef = sinon.stub(oPopover, "_getOpenByDomRef").returns(document.createElement("div"));
			oPopover._calcPlacement();

			assert.strictEqual(oPopover._oCalcedPos, expectedPlace);

			stubOpenByRef.restore();
			stubOffset.restore();
			stubDomRef.restore();
			delete document.documentElement.clientWidth;
			delete document.documentElement.clientHeight;
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
			const stubOffset = sinon.stub(Element.prototype, "getBoundingClientRect").returns({
				left: offsetLeft,
				top: offsetTop,
				width: outerWidth,
				height: outerHeight
			});
			// Opener top is BCR.top + window.scrollY; pin scroll to 0.
			const oScrollDesc = Object.getOwnPropertyDescriptor(window, "scrollY");
			Object.defineProperty(window, "scrollY", { configurable: true, get: function () { return 0; } });
			// Positioning derives the bottom bound from window.innerHeight + scrollY.
			const oInnerHeightDesc = Object.getOwnPropertyDescriptor(window, "innerHeight");
			Object.defineProperty(window, "innerHeight", { configurable: true, get: function () { return height; } });
			Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, get: function () { return width; } });
			Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, get: function () { return height; } });

			var oPopover = new Popover({
				placement: PlacementType.Auto
			});

			// The popover is measured via getDomRef().getBoundingClientRect(); return a
			// fake element with its own BCR (200x200) so it is independent of the
			// globally stubbed opener rect.
			const stubDomRef = sinon.stub(oPopover, "getDomRef").returns({
				getBoundingClientRect: function () { return { top: 0, left: 0, width: 200, height: 200 }; }
			});

			var stubOpenByRef = sinon.stub(oPopover, "_getOpenByDomRef").returns(document.createElement("div"));
			oPopover._calcPlacement();

			assert.strictEqual(oPopover._oCalcedPos, expectedPlace);

			stubOpenByRef.restore();
			stubOffset.restore();
			Object.defineProperty(window, "scrollY", oScrollDesc);
			Object.defineProperty(window, "innerHeight", oInnerHeightDesc);
			stubDomRef.restore();
			delete document.documentElement.clientWidth;
			delete document.documentElement.clientHeight;
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

	QUnit.test("Redundant scrollbar doesn't appear on the documentElement during position calculation", async function (assert) {
		// Arrange
		this.clock.restore();
		const done = assert.async();
		const oDomRenderLocation = document.getElementById(DOM_RENDER_LOCATION);
		const sCurrentRenderLocationHeight = oDomRenderLocation.style.height;
		const oPopover = new Popover({
			content: [
				new HTML({ content: "<div style='height: 10000px;'></div>" })
			]
		});
		const oOpener = new Button({ text: "Open Popover" });
		oOpener.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();
		// Ensure there is no vertical scrollbar
		oDomRenderLocation.style.height = "";
		const fnRestoreAmbientScrollbar = suppressAmbientVerticalScrollbar();

		// Assert
		assert.ok(document.documentElement.scrollHeight <= document.documentElement.clientHeight, "The documentElement should NOT have a scrollbar");

		const sCurrentOverflow = document.documentElement.style.overflow;

		oPopover._beforeAdjustPositionAndArrowHook = function () {
			// Assert
			assert.strictEqual(document.documentElement.style.overflow, "hidden", "The documentElement should have an overflow style");
		};

		oPopover.attachAfterOpen(() => {
			// Assert
			assert.strictEqual(document.documentElement.style.overflow, sCurrentOverflow, "The documentElement overflow style should be restored");
			assert.ok(document.documentElement.scrollHeight <= document.documentElement.clientHeight, "The documentElement should NOT have a scrollbar");

			// Clean up
			fnRestoreAmbientScrollbar();
			oPopover.destroy();
			oOpener.destroy();
			oDomRenderLocation.style.height = sCurrentRenderLocationHeight;
			done();
		});

		// Act
		oPopover.openBy(oOpener);
	});

	QUnit.test("If there is already a vertical scrollbar on the documentElement, it is preserved during position calculation", async function (assert) {
		// Arrange
		this.clock.restore();
		const done = assert.async();
		// Opener first (stays at viewport top), then a tall spacer to force a documentElement scrollbar.
		const oOpener = new Button({ text: "Open Popover" });
		oOpener.placeAt(DOM_RENDER_LOCATION);
		const oSpacer = new HTML({ content: "<div style='height: 10000px;'></div>" });
		oSpacer.placeAt(DOM_RENDER_LOCATION);
		const oPopover = new Popover({
			content: [
				new HTML({ content: "<div style='height: 10000px;'></div>" })
			]
		});
		await nextUIUpdate();

		// Assert
		assert.ok(document.documentElement.scrollHeight > document.documentElement.clientHeight, "The documentElement should have a vertical scrollbar");

		oPopover._beforeAdjustPositionAndArrowHook = function () {
			// Assert
			assert.strictEqual(document.documentElement.style.overflow, "", "The documentElement should NOT have an overflow style");
		};

		oPopover.attachAfterOpen(() => {
			// Assert
			assert.strictEqual(document.documentElement.style.overflow, "", "The documentElement overflow style should be restored");
			assert.ok(document.documentElement.scrollHeight > document.documentElement.clientHeight, "The documentElement should have a vertical scrollbar");

			// Clean up
			oPopover.destroy();
			oOpener.destroy();
			oSpacer.destroy();
			done();
		});

		// Act
		oPopover.openBy(oOpener);
	});

	QUnit.test("If there is no vertical, but there is horizontal scrollbar, overflow styles are correctly restores during position calculation", async function (assert) {
		// Arrange
		this.clock.restore();
		const done = assert.async();
		const oDomRenderLocation = document.getElementById(DOM_RENDER_LOCATION);
		const oPopover = new Popover({
			content: [
				new HTML({ content: "<div style='height: 1000px;'></div>" })
			]
		});
		const oOpener = new Button({ text: "Open Popover" });
		oOpener.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		const sCurrentRenderLocationHeight = oDomRenderLocation.style.height;
		const sCurrentRenderLocationWidth = oDomRenderLocation.style.width;

		// Ensure there is no vertical scrollbar
		oDomRenderLocation.style.height = "100px";
		// Ensure there is horizontal scrollbar
		oDomRenderLocation.style.width = "10000px";
		const fnRestoreAmbientScrollbar = suppressAmbientVerticalScrollbar();

		// Assert
		assert.ok(document.documentElement.scrollHeight <= document.documentElement.clientHeight, "The documentElement should NOT have a vertical scrollbar");
		assert.ok(document.documentElement.scrollWidth > document.documentElement.clientWidth, "The documentElement should have a horizontal scrollbar");

		oPopover._beforeAdjustPositionAndArrowHook = function () {
			// Assert
			assert.strictEqual(document.documentElement.style.overflow, "hidden", "The documentElement should have 'hidden' overflow style");
		};

		oPopover.attachAfterOpen(() => {
			// Assert
			assert.strictEqual(document.documentElement.style.overflow, "", "The documentElement overflow style should be restored");
			assert.ok(document.documentElement.scrollWidth > document.documentElement.clientWidth, "The documentElement should have a horizontal scrollbar");

			// Clean up
			fnRestoreAmbientScrollbar();
			oPopover.destroy();
			oOpener.destroy();
			oDomRenderLocation.style.height = sCurrentRenderLocationHeight;
			oDomRenderLocation.style.width = sCurrentRenderLocationWidth;
			done();
		});

		// Act
		oPopover.openBy(oOpener);
	});

	QUnit.module("Property Setter", {
		before: function () {
			createRenderTarget();
		},
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();

			this.oApp = new App();
			this.oPage = new Page({ title: "Test", showNavButton: true });
			this.oApp.addPage(this.oPage).placeAt("content");

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

			this.oPage.addContent(this.oButton);
			await nextUIUpdate(this.clock);
		},
		afterEach: function () {
			this.oBeginButton.destroy();
			this.oEndButton.destroy();
			this.oPopover.destroy();
			this.oButton.destroy();
			this.oApp.destroy();
			runAllFakeTimersAndRestore(this.clock);
		},
		after: function () {
			removeRenderTarget();
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

	QUnit.test("set maxHeight", function (assert){
		this.oPopover.setMaxHeight("250px");
		this.oButton.firePress();
		this.clock.tick(100);
		const $popover = this.oPopover.$();
		assert.strictEqual($popover.css("max-height"), "250px", "max-height style should be set to 250px on the popover root element");
	});

	QUnit.test("maxHeight - actual height respects maxHeight and content is scrollable", async function (assert){
		// Add tall content to test scrolling
		this.oPopover.removeAllContent();
		for (let i = 0; i < 30; i++) {
			this.oPopover.addContent(new Text({
				text: `Line ${i + 1}: Content line for testing maxHeight scrolling behavior.`
			}));
		}
		this.oPopover.setContentWidth("300px");
		this.oPopover.setMaxHeight("200px");

		this.oButton.firePress();
		this.clock.tick(500);
		await nextUIUpdate(this.clock);

		const $popover = this.oPopover.$();
		const $content = this.oPopover.$("cont");
		const actualHeight = $popover.outerHeight();

		// Verify actual height respects maxHeight
		assert.ok(actualHeight <= 200, `Popover actual height (${actualHeight}px) should not exceed maxHeight (200px)`);

		// Verify content area has scroll capability by checking if content container's scrollHeight exceeds its clientHeight
		// The content container should have overflow when maxHeight constrains the popover
		const contentScrollHeight = $content[0].scrollHeight;
		const contentClientHeight = $content[0].clientHeight;
		assert.ok(contentScrollHeight > contentClientHeight, `Content should be scrollable - content scrollHeight (${contentScrollHeight}px) should be greater than clientHeight (${contentClientHeight}px)`);
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

	QUnit.test("showArrow with value true should have a designated class", async function (assert) {
		this.oPopover.setShowArrow(true);
		await nextUIUpdate(this.clock);

		this.oButton.firePress();
		this.clock.tick(500);

		assert.ok(this.oPopover.getDomRef().classList.contains("sapMPopoverWithArrow"), "Popover should have arrow class");
	});

	QUnit.test("showArrow with value true should not have a designated class", async function (assert) {
		this.oPopover.setShowArrow(false);
		await nextUIUpdate(this.clock);

		this.oButton.firePress();
		this.clock.tick(500);

		assert.notOk(this.oPopover.getDomRef().classList.contains("sapMPopoverWithArrow"), "Popover should not have arrow class");
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
		before: function () {
			createRenderTarget();
		},
		beforeEach: async function () {
			this.oApp = new App();
			this.oPage = new Page({ title: "Test", showNavButton: true });
			this.oApp.addPage(this.oPage).placeAt("content");

			this.oButton = new Button({
				text: "Open Popover"
			});
			this.oButton.addStyleClass("positioned");
			this.oPopover = new Popover();

			this.oPage.addContent(this.oButton);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oPopover.destroy();
			this.oButton.destroy();
			this.oApp.destroy();
		},
		after: function () {
			removeRenderTarget();
		}
	});

	QUnit.test("_calcPlacement resolves every PlacementType to a physical side", function (assert) {
		const aSides = Object.values(PopoverPhysicalSide);
		Object.keys(PlacementType).forEach((sKey) => {
			const sType = PlacementType[sKey];
			const oPopover = new Popover({ placement: sType });
			const oStubDomRef = sinon.stub(oPopover, "getDomRef").returns({
				getBoundingClientRect: () => ({ top: 0, left: 0, width: 50, height: 50 })
			});
			const oStubOpener = sinon.stub(oPopover, "_getOpenByDomRef").returns(document.createElement("div"));
			oPopover._calcPlacement();
			assert.ok(aSides.includes(oPopover._getCalculatedPlacement()), sType + " → physical side");
			oStubOpener.restore();
			oStubDomRef.restore();
			oPopover.destroy();
		});
	});

	QUnit.test("_getAnimationDuration", function (assert) {
		const fExpectedDuration = parseFloat(Parameters.get({
			name: "_sap_m_Popover_OpacityTransitionDuration"
		})) * 1000;

		assert.strictEqual(this.oPopover._getAnimationDuration(), fExpectedDuration, "Default Duration should be correct");
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

	QUnit.test("Popover with 'within area' should stay open on resize when opener is outside the within area but inside the viewport", async function (assert){
		// The 'within area' constrains the Popover's position, not the opener's location. An opener that sits
		// outside the within area but is still visible in the viewport must not trigger the resize auto-close.
		const oWithinArea = new HTML({
			content: "<div style='position:absolute;top:50px;left:50px;width:200px;height:200px;'></div>"
		});
		// Opener placed to the right of the within area's right edge (250px) but well inside the viewport.
		Object.assign(this.oButton.getDomRef().style, { position: "absolute", top: "60px", left: "400px" });

		oWithinArea.placeAt(this.oPage);
		await nextUIUpdate();
		Popup.setWithinArea(oWithinArea.getDomRef());

		const pOpened = new Promise((resolve) => { this.oPopover.attachAfterOpen(resolve); });
		this.oPopover.openBy(this.oButton);
		await pOpened;

		assert.ok(this.oPopover.isOpen(), "Popover is open before resize");

		// Act: simulate a resize event that does not actually change the window size (as WebKit emits on open).
		let bClosed = false;
		this.oPopover.attachAfterClose(function () { bClosed = true; });
		this.oPopover._onOrientationChange();

		// Wait long enough for a potential (buggy) close animation to complete.
		await new Promise((resolve) => { setTimeout(resolve, 600); });

		// Assert
		assert.notOk(bClosed, "Popover did not fire afterClose on resize");
		assert.ok(this.oPopover.isOpen(), "Popover stays open after a resize while the opener is inside the viewport");

		// Cleanup
		Popup.setWithinArea(null);
		oWithinArea.destroy();
	});

	QUnit.test("_isOpenerCompletelyOutsideViewport returns false when the opener overlaps the viewport", function (assert) {
		// Arrange
		Object.assign(this.oButton.getDomRef().style, { position: "absolute", top: "60px", left: "60px" });

		// Act & Assert
		assert.notOk(this.oPopover._isOpenerCompletelyOutsideViewport(this.oButton.getDomRef()), "An opener inside the viewport is not reported as outside");
	});

	QUnit.test("_isOpenerCompletelyOutsideViewport returns true when the opener is completely outside the viewport", function (assert) {
		// Arrange - move the opener far below the viewport bottom edge
		Object.assign(this.oButton.getDomRef().style, { position: "absolute", top: (window.innerHeight + 200) + "px", left: "60px" });

		// Act & Assert
		assert.ok(this.oPopover._isOpenerCompletelyOutsideViewport(this.oButton.getDomRef()), "An opener fully below the viewport is reported as outside");
	});

	QUnit.test("_getPopoverPositionCss should return an object with correct top, bottom, right and left position when Popover do not exceed vertically or horizontally of the window", function (assert){
		var	oPosParams = {
				_fPopoverWidth: 416,
				_fPopoverHeight: 802,
				_fWithinAreaWidth: 1920,
				_fWithinAreaHeight: 1139
			};

		// withinAreaRef=window + no openerRef => margins pass through unchanged.
		const oStubFold = sinon.stub(this.oPopover, "_getMarginFoldParams").returns({
			margin: { top: 50, right: 10, bottom: 10, left: 265 },
			withinAreaRef: window,
			side: PlacementType.Bottom
		});
		const oStubDomRef = sinon.stub(this.oPopover, "getDomRef").returns({ getBoundingClientRect: () => ({ left: 265, top: 21, width: 416, height: 802 }) });

		// Positioning reads the viewport from documentElement.clientWidth/Height.
		Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, get: () => 1920 });
		Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, get: () => 1139 });

		var oCalculatedParams = this.oPopover._getPopoverPositionCss(PlacementType.Bottom, oPosParams);

		assert.equal(oCalculatedParams.top, 50, "top position should be equal to the _marginTop after calculations");
		assert.equal(oCalculatedParams.right, undefined, "right position should be equal to 'undefined' after calculations");
		assert.ok(isNaN(oCalculatedParams.bottom), "bottom position should be equal to 'NaN' after calculations");
		assert.equal(oCalculatedParams.left, undefined, "left position should be equal to 'undefined' after calculations");

		delete document.documentElement.clientWidth;
		delete document.documentElement.clientHeight;
		oStubDomRef.restore();
		oStubFold.restore();
	});

	QUnit.test("_getPopoverPositionCss should return an object with correct top, bottom, right and left position when Popover do not exceed vertically or horizontally of the window but exceeds the defined 10px border of the screen", function (assert){
		var oPosParams = {
			_fPopoverWidth: 416,
			_fPopoverHeight: 754,
			_fWithinAreaWidth: 1920,
			_fWithinAreaHeight: 1139
		};

		const oStubFold = sinon.stub(this.oPopover, "_getMarginFoldParams").returns({
			margin: { top: 50, right: 10, bottom: 162, left: 10 },
			withinAreaRef: window,
			side: PlacementType.Bottom
		});
		const oStubDomRef = sinon.stub(this.oPopover, "getDomRef").returns({ getBoundingClientRect: () => ({ left: 0, top: 223, width: 416, height: 754 }) });

		// Positioning reads the viewport from documentElement.clientWidth/Height.
		Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, get: () => 1920 });
		Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, get: () => 1139 });

		var oCalculatedParams = this.oPopover._getPopoverPositionCss(PlacementType.Bottom, oPosParams);

		assert.equal(oCalculatedParams.top, undefined, "top position should be equal to the 'undefined after calculations");
		assert.equal(oCalculatedParams.right, undefined, "right position should be equal to the 'undefined after calculations");
		assert.ok(isNaN(oCalculatedParams.bottom), "bottom position should be equal to 'NaN' after calculations");
		assert.equal(oCalculatedParams.left, 10, "left position should be equal to _fPopoverMarginLeft after calculations");

		delete document.documentElement.clientWidth;
		delete document.documentElement.clientHeight;
		oStubDomRef.restore();
		oStubFold.restore();
	});

	QUnit.test("_getMaxContentWidth should return calculated max content width", function (assert){
		// Positioning reads the reference width from documentElement.clientWidth.
		Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, get: () => 500 });

		const oStubFold = sinon.stub(this.oPopover, "_getMarginFoldParams").returns({
			margin: { top: 0, right: 10, bottom: 0, left: 10 },
			withinAreaRef: window,
			side: PlacementType.Bottom
		});

		var iMaxContentWidth = this.oPopover._getMaxContentWidth(PlacementType.Bottom, {
			_fPopoverBorderLeft: 10,
			_fPopoverBorderRight: 10
		});

		assert.equal(iMaxContentWidth, 460, "Popover maxContentWidth should be equal to the documentWidth minus left and right margins and borders");

		delete document.documentElement.clientWidth;
		oStubFold.restore();
	});

	QUnit.test("_getMaxContentHeight should return calculated max content width", function (assert){
		// Positioning reads the reference height from documentElement.clientHeight.
		Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, get: () => 500 });

		const oStubFold = sinon.stub(this.oPopover, "_getMarginFoldParams").returns({
			margin: { top: 10, right: 0, bottom: 10, left: 0 },
			withinAreaRef: window,
			side: PlacementType.Bottom
		});

		var iMaxContentHeight = this.oPopover._getMaxContentHeight(PlacementType.Bottom, {
			_fHeaderHeight: 10,
			_fSubHeaderHeight: 10,
			_fFooterHeight: 10,
			_fContentMarginTop: 10,
			_fContentMarginBottom: 10,
			_fPopoverBorderTop: 10,
			_fPopoverBorderBottom: 10
		});

		assert.equal(iMaxContentHeight, 410, "Popover maxContentHeight should be equal to the documentHeight minus header, subheader, footer height; top and bottom margins, borders and content margins");

		delete document.documentElement.clientHeight;
		oStubFold.restore();
	});

	QUnit.test("_getContentDimensionsCss should return max-width and max-height computed right", function (assert){
		var stubPopoverMaxContentWidth = sinon.stub(this.oPopover, "_getMaxContentWidth").returns(500),
			stubPopoverMaxContentHeight = sinon.stub(this.oPopover, "_getMaxContentHeight").returns(400),
			oElement = document.createElement("div"),
			stubjQueryHeight = sinon.stub(oElement, "getBoundingClientRect").returns({ height: 300 }),
			oExpectedDimensions = {
				"max-width": "500px",
				"max-height": "400px"
			};

		var oContentDimensions = this.oPopover._getContentDimensionsCss(PlacementType.Bottom, {
			_$content: jQuery(oElement)
		});

		assert.deepEqual(oContentDimensions, oExpectedDimensions, "Content dimensions should be right");

		stubPopoverMaxContentWidth.restore();
		stubPopoverMaxContentHeight.restore();
		stubjQueryHeight.restore();
	});

	QUnit.test("_getContentDimensionsCss should return max-width and max-height if the Popover can fit on the screen and have contentHeight property set", function (assert){
		this.oPopover.setContentHeight("500px");
		var stubPopoverMaxContentWidth = sinon.stub(this.oPopover, "_getMaxContentWidth").returns(400),
			stubPopoverMaxContentHeight = sinon.stub(this.oPopover, "_getMaxContentHeight").returns(400),
			oElement = document.createElement("div"),
			stubjQueryHeight = sinon.stub(oElement, "getBoundingClientRect").returns({ height: 300 }),
			oExpectedDimensions = {
				"max-width": "400px",
				"max-height": "400px"
			};

		var oContentDimensions = this.oPopover._getContentDimensionsCss(PlacementType.Bottom, {
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

	QUnit.test("_getArrowOffsetCss delegates to Positioning.computeArrowOffset and maps the result per side", function (assert){
		const oParentEl = document.createElement("div"),
			oPopoverEl = document.createElement("div"),
			oArrowEl = document.createElement("div"),
			oPosParams = {
				_$arrow: jQuery(oArrowEl)
			};

		const oStubDomRef = sinon.stub(this.oPopover, "getDomRef").returns(oPopoverEl);
		const oStubOpener = sinon.stub(this.oPopover, "_getOpenByDomRef").returns(oParentEl);
		const oStub = sinon.stub(Positioning, "computeArrowOffset");

		// Left / Right → { top: along }
		oStub.returns({along: 355, cross: 0, rtlRight: false});
		assert.deepEqual(this.oPopover._getArrowOffsetCss(PlacementType.Left, oPosParams), {top: 355}, "Left → top");
		assert.deepEqual(this.oPopover._getArrowOffsetCss(PlacementType.Right, oPosParams), {top: 355}, "Right → top");

		// Top / Bottom LTR → { left: along }
		oStub.returns({along: 120, cross: 0, rtlRight: false});
		assert.deepEqual(this.oPopover._getArrowOffsetCss(PlacementType.Top, oPosParams), {left: 120}, "Top LTR → left");
		assert.deepEqual(this.oPopover._getArrowOffsetCss(PlacementType.Bottom, oPosParams), {left: 120}, "Bottom LTR → left");

		// Top / Bottom RTL (rtlRight) → { right: along }
		oStub.returns({along: 80, cross: 0, rtlRight: true});
		assert.deepEqual(this.oPopover._getArrowOffsetCss(PlacementType.Top, oPosParams), {right: 80}, "Top RTL → right");
		assert.deepEqual(this.oPopover._getArrowOffsetCss(PlacementType.Bottom, oPosParams), {right: 80}, "Bottom RTL → right");

		// The DOM refs (not jQuery wrappers) are forwarded to Positioning.
		const oCall = oStub.getCall(0).args[0];
		assert.strictEqual(oCall.openerRef, oParentEl, "openerRef is the opener element");
		assert.strictEqual(oCall.popoverRef, oPopoverEl, "popoverRef is the popover element");
		assert.strictEqual(oCall.arrowRef, oArrowEl, "arrowRef is the arrow element");

		oStub.restore();
		oStubDomRef.restore();
		oStubOpener.restore();
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
		assert.equal(this.oPopover._arrowOffset, fArrowOffset, "_arrowOffset should have correct value");
		assert.deepEqual(this.oPopover._offsets, [`0 -${fArrowOffset}`, `${fArrowOffset} 0`, `0 ${fArrowOffset}`, `-${fArrowOffset} 0`], "offsets should be correct according the arrowOffset");
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

	QUnit.test("Popover should use arrow offset if _bSizeCompact is true", async function (assert){
		this.oPopover.addStyleClass("sapUiSizeCompact");
		this.oPopover.openBy(this.oButton);
		await nextUIUpdate();

		assert.equal(this.oPopover._arrowOffset, fArrowOffset, "_arrowoffset should have correct value");
		assert.deepEqual(this.oPopover._offsets, [`0 -${fArrowOffset}`, `${fArrowOffset} 0`, `0 ${fArrowOffset}`, `-${fArrowOffset} 0`], "offsets should be correct according the arrowOffset");
	});

	QUnit.test("Popover should use normal arrow offset if _bSizeCompact is false", async function (assert){
		this.oPopover.openBy(this.oButton);
		await nextUIUpdate();

		assert.equal(this.oPopover._arrowOffset, fArrowOffset, "_arrowoffset should have correct value");
		assert.deepEqual(this.oPopover._offsets, [`0 -${fArrowOffset}`, `${fArrowOffset} 0`, `0 ${fArrowOffset}`, `-${fArrowOffset} 0`], "offsets should be correct according the arrowOffset");
	});

	QUnit.test("Popover should be in compact mode if one of it's parents is compact", async function (assert){
		var oScrollContainer = new ScrollContainer().addStyleClass("sapUiSizeCompact"),
			oButton2 = new Button();

		oScrollContainer.addContent(oButton2);

		oScrollContainer.placeAt("content");
		await nextUIUpdate();
		this.oPopover.openBy(oButton2);

		assert.equal(this.oPopover._arrowOffset, fArrowOffset, "_arrowoffset should have correct value");
		assert.deepEqual(this.oPopover._offsets, [`0 -${fArrowOffset}`, `${fArrowOffset} 0`, `0 ${fArrowOffset}`, `-${fArrowOffset} 0`], "offsets should be correct according the arrowOffset");

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
		before: function () {
			createRenderTarget();
		},
		beforeEach: async function () {
			this.clock = sinon.useFakeTimers();

			this.oApp = new App();
			this.oPage = new Page({ title: "Test", showNavButton: true });
			this.oApp.addPage(this.oPage).placeAt("content");

			this.oButton = new Button({
				text: "Open Popover"
			});
			this.oPopover = new Popover();

			this.oPage.addContent(this.oButton);
			await nextUIUpdate(this.clock);
		},
		afterEach: function () {
			this.oPopover.destroy();
			this.oButton.destroy();
			this.oApp.destroy();
			runAllFakeTimersAndRestore(this.clock);
		},
		after: function () {
			removeRenderTarget();
		}
	});

	QUnit.test("ARIA role", async function (assert){
		this.oPopover.openBy(this.oButton);
		await nextUIUpdate(this.clock);

		assert.equal(this.oPopover.$().attr('role'), 'dialog', 'Popover has role dialog');
		assert.equal(this.oPopover.$("firstfe").attr('role'), 'presentation', "Popover' hidden focusable span has role presentation");
		assert.equal(this.oPopover.$("lastfe").attr('role'), 'presentation', "Popovers' hidden focusable span has role presentation");
	});

	QUnit.test("aria-owns links the Popover to its opener's modal Dialog", async function (assert) {
		// Arrange: a Button that opens the Popover lives inside a modal Dialog.
		// The Popover renders to the static area as a sibling of the Dialog, so without
		// aria-owns JAWS treats closing the Popover as re-entering the Dialog's modal region.
		var oOpenerButton = new Button({ text: "Open Popover" }),
			oDialog = new Dialog({ content: [oOpenerButton] });

		oDialog.open();
		this.clock.tick(500);

		// Act: open the Popover from the button inside the Dialog.
		this.oPopover.openBy(oOpenerButton);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);

		// Assert: the Dialog (the opener's aria-modal ancestor) owns the Popover.
		var aOwns = (oDialog.getDomRef().getAttribute("aria-owns") || "").split(/\s+/);
		assert.ok(aOwns.indexOf(this.oPopover.getId()) !== -1,
			"Dialog's aria-owns references the Popover while it is open");

		// Act: close the Popover.
		this.oPopover.close();
		this.clock.tick(500);

		// Assert: the reference is removed again so it does not linger on the Dialog.
		aOwns = (oDialog.getDomRef().getAttribute("aria-owns") || "").split(/\s+/);
		assert.strictEqual(aOwns.indexOf(this.oPopover.getId()), -1,
			"Dialog's aria-owns no longer references the Popover after it closes");

		// Clean up
		oDialog.destroy();
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

	QUnit.test("Popover with internal title and showHeader disabled", async function(assert) {
		this.oPopover.setTitle("Title text");
		this.oPopover.setShowHeader(false);

		this.oPopover.openBy(this.oButton);
		await nextUIUpdate(this.clock);

		assert.strictEqual(this.oPopover.getDomRef().getAttribute("aria-labelledby"), null,
			"aria-labelledby does not reference the internal title when the standard header is disabled");
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

	QUnit.test("Popover with custom header with Title", async function(assert) {
		//Arrange
		var sInvTextId = "invisibleText",
			sCustomHeaderId = "customHeaderId",
			sCustomHeaderTitleId = "customHeaderTitleId",
			oInvisibleText = new InvisibleText(sInvTextId, {text: "invisible text"});

		var oCustomHeader = new Bar(sCustomHeaderId, {
			contentLeft: [new Title(sCustomHeaderTitleId, {text: "Just Title"})]
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
		assert.equal(this.oPopover.getDomRef().getAttribute('aria-labelledby'), (sCustomHeaderTitleId + ' ' + sInvTextId), "should have an aria-labelledby attribute pointing to the header and the additional invisible label");

		//Cleanup
		oInvisibleText.destroy();
		oCustomHeader.destroy();
	});

	QUnit.test("Popover with custom header with Title and showHeader disabled", async function(assert) {
		const sCustomHeaderTitleId = "customHeaderTitleId";
		const oCustomHeader = new Bar({
			contentLeft: [new Title(sCustomHeaderTitleId, {text: "Just Title"})]
		});

		this.oPopover.setShowHeader(false);
		this.oPopover.setCustomHeader(oCustomHeader);
		this.oPopover.openBy(this.oButton);
		await nextUIUpdate(this.clock);

		assert.strictEqual(this.oPopover.getDomRef().getAttribute("aria-labelledby"), sCustomHeaderTitleId,
			"aria-labelledby points to the custom header title despite showHeader being disabled");
	});

	QUnit.test("Popover with custom header without Title", async function(assert) {
		//Arrange
		var sInvTextId = "invisibleText",
			sCustomHeaderId = "customHeaderId",
			oInvisibleText = new InvisibleText(sInvTextId, {text: "invisible text"});

		var oCustomHeader = new Bar(sCustomHeaderId, {
			contentLeft: [new Label({text: "Just Label"})]
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

	QUnit.test("Header element should not expose a banner landmark when ValueStateHeader has no visible content", async function (assert) {
		const oValueStateHeader = new ValueStateHeader();
		this.oPopover.setCustomHeader(oValueStateHeader);

		this.oPopover.openBy(this.oButton);
		await nextUIUpdate(this.clock);

		const oHeaderElement = this.oPopover.getDomRef().querySelector(".sapMPopoverHeader");
		assert.ok(oHeaderElement, "Header element is kept in the DOM to preserve a stable structure for the DOM patcher");
		assert.strictEqual(oHeaderElement.getAttribute("role"), "presentation", "Empty ValueStateHeader does not expose a banner landmark");

		oValueStateHeader.destroy();
	});

	QUnit.test("Header element should expose a banner landmark when ValueStateHeader has visible content", async function (assert) {
		const oValueStateHeader = new ValueStateHeader({
			valueState: "Error",
			text: "Error message"
		});
		this.oPopover.setCustomHeader(oValueStateHeader);

		this.oPopover.openBy(this.oButton);
		await nextUIUpdate(this.clock);

		const oHeaderElement = this.oPopover.getDomRef().querySelector(".sapMPopoverHeader");
		assert.ok(oHeaderElement, "Header element should be rendered when ValueStateHeader has visible content");
		assert.strictEqual(oHeaderElement.getAttribute("role"), null, "Header with visible content exposes its default banner landmark");

		oValueStateHeader.destroy();
	});


	QUnit.test("aria-labelledby should not reference empty ValueStateHeader", async function (assert) {
		// Empty ValueStateHeader should not be in aria-labelledby
		const oValueStateHeader = new ValueStateHeader();
		this.oPopover.setCustomHeader(oValueStateHeader);

		this.oPopover.openBy(this.oButton);
		await nextUIUpdate(this.clock);

		const sAriaLabelledBy = this.oPopover.getDomRef().getAttribute('aria-labelledby');
		assert.strictEqual(sAriaLabelledBy, null, "aria-labelledby should not be set when ValueStateHeader has no content");

		oValueStateHeader.destroy();
	});

	QUnit.module("Integration", {
		before: function () {
			createRenderTarget();
		},
		beforeEach: function () {
			this.oApp = new App();
			this.oPage = new Page({ title: "Test", showNavButton: true });
			this.oApp.addPage(this.oPage).placeAt("content");
		},
		afterEach: function () {
			this.oApp.destroy();
		},
		after: function () {
			removeRenderTarget();
		}
	});

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

		oPopover.destroy();
		oButton.destroy();
		runAllFakeTimersAndRestore(this.clock);
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

		oPopover.destroy();
		oButton.destroy();
		runAllFakeTimersAndRestore(this.clock);
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
		oPopover.destroy();
		runAllFakeTimersAndRestore(this.clock);
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
		oPopover.destroy();
		oOpenButton.destroy();
		oCloseButton.destroy();
		runAllFakeTimersAndRestore(this.clock);
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

	function hasVerticalOverflow(element) {
		return element.scrollHeight > element.clientHeight;
	}

	function hasHorizontalOverflow(element) {
		return element.scrollWidth > element.clientWidth;
	}

	QUnit.test("Popover is auto-closed if the opener is currently not visible", async function (assert) {
		// Arrange
		var oOpenButton = new Button({
			text: "Open Popover"
		});
		var oOtherButton = new Button({
			text: "Other Button"
		});

		this.oPage.addContent(oOpenButton);
		this.oPage.addContent(oOtherButton);

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
		await nextUIUpdate();
		oPopover.openBy(oOpenButton);
		await nextAfterOpenEvent(oPopover);
		await nextUIUpdate();

		oOpenButton.getDomRef().style.position = "absolute";
		oOpenButton.getDomRef().style.width = "80px";

		Popup.checkDocking.call(oPopover.oPopup);

		await nextAfterCloseEvent(oPopover);

		// Assert
		assert.notOk(oPopover.isOpen(), "Popover is auto closed");

		// Clean
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

		this.oPage.addContent(oOpenButton);
		this.oPage.addContent(oOtherButton);

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
		before: function () {
			createRenderTarget();
		},
		beforeEach: async function() {
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

			await nextUIUpdate();
		},
		afterEach: function() {
			this.oPopover.destroy();
			this.oButton.destroy();
		},
		after: function () {
			removeRenderTarget();
		}
	});

	QUnit.test("Item texts are not truncated when width is auto", async function(assert) {
		this.oPopover.openBy(this.oButton);

		await nextAfterOpenEvent(this.oPopover);
		await nextUIUpdate();

		var $longTextItem = this.oPopover.$().find("#longTextItem .sapMSLITitleOnly");

		// assert
		assert.strictEqual(isTextTruncated($longTextItem), false, "Long text is not truncated when width is auto");
		assert.ok(hasVerticalOverflow(this.oPopover.getDomRef("cont")), "Popover has vertical overflow");
		assert.notOk(hasHorizontalOverflow(this.oPopover.getDomRef("cont")), "Popover has no horizontal overflow");
	});

	QUnit.test("Text is truncated when width is too small", async function(assert) {
		this.oPopover.setContentWidth("20rem");

		this.oPopover.openBy(this.oButton);
		await nextAfterOpenEvent(this.oPopover);
		await nextUIUpdate();

		var $longTextItem = this.oPopover.$().find("#longTextItem .sapMSLITitleOnly");

		// assert
		assert.strictEqual(isTextTruncated($longTextItem), true, "Text is truncated when width is small");
		assert.ok(hasVerticalOverflow(this.oPopover.getDomRef("cont")), "Popover has vertical overflow");
		assert.notOk(hasHorizontalOverflow(this.oPopover.getDomRef("cont")), "Popover has no horizontal overflow");
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
		await nextAfterOpenEvent(oPopover);
		await nextUIUpdate();

		const iHeightAfterOpen = oPopover.getDomRef("cont").getBoundingClientRect().height;

		assert.ok(iHeightAfterOpen > 0, "Height is greater than 0");

		// act
		oPopover.invalidate();
		await nextUIUpdate();

		assert.ok(oPopover.getDomRef("cont").getBoundingClientRect().height >= iHeightAfterOpen, "Height is preserved after invalidation");

		// clean up
		oPopover.destroy();
	});

	QUnit.module("Responsive paddings", {
		before: function () {
			createRenderTarget();
		},
		beforeEach: function () {
			this.oApp = new App();
			this.oPage = new Page({ title: "Test", showNavButton: true });
			this.oApp.addPage(this.oPage).placeAt("content");
		},
		afterEach: function () {
			this.oApp.destroy();
		},
		after: function () {
			removeRenderTarget();
		}
	});

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

		this.oPage.addContent(oButton);

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

	QUnit.module("Invalidation", {
		before: function () {
			createRenderTarget();
		},
		beforeEach: function () {
			this.oApp = new App();
			this.oPage = new Page({ title: "Test", showNavButton: true });
			this.oApp.addPage(this.oPage).placeAt("content");
		},
		afterEach: function () {
			this.oApp.destroy();
		},
		after: function () {
			removeRenderTarget();
		}
	});

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

		this.oPage.addContent(oButton);
		await nextUIUpdate();

		oPopover.openBy(oButton);
	});

	QUnit.module("Initial Focus", {
		before: function () {
			createRenderTarget();
		},
		beforeEach: function () {
			this.oApp = new App();
			this.oPage = new Page({ title: "Test", showNavButton: true });
			this.oApp.addPage(this.oPage).placeAt("content");
		},
		afterEach: function () {
			this.oApp.destroy();
		},
		after: function () {
			removeRenderTarget();
		}
	});

	QUnit.test("Keyboard Focusable Scroll Container", async function (assert) {
		if (Device.browser.safari) {
			assert.ok(true, "Skipping test on Safari as focus is not set to the Keyboard Focusable Scroll Container.");
			return;
		}

		var oClock = sinon.useFakeTimers();

		var oButton = new Button({text: "Open"});
		var oPopover = new Popover("popover", {
			title: "Popover Title",
			contentWidth: "200px",
			contentHeight: "200px",
			content: [
				new Text({
					text: "This is the first line of text.This is the first line of text.This is the first line of text.This is the first line of text.This is the first line of text.This is the first line of text.This is the first line of text.This is the first line of text.This is the first line of text.This is the first line of text."
				}),
				new Text({
					text: "This is the second line of text. This is the second line of text. This is the second line of text. This is the second line of text.This is the second line of text. This is the second line of text. This is the second line of text. This is the second line of text."
				})
			]
		});

		this.oPage.addContent(oButton);

		await nextUIUpdate(oClock);

		oPopover.openBy(oButton);
		oClock.tick(300);
		await nextUIUpdate(oClock);

		assert.strictEqual(document.activeElement, oPopover.getDomRef("cont"), "Initial focus is set to the first keyboard scrollable container.");

		//cleanup
		runAllFakeTimersAndRestore(oClock);
		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Scroll Container with a button inside", async function (assert) {
		var oClock = sinon.useFakeTimers();

		var oPopoverButton = new Button({
			text: "Popover Button"
		});

		var oButton = new Button({text: "Open"});
		var oPopover = new Popover("popover", {
			title: "Popover Title",
			contentWidth: "200px",
			contentHeight: "200px",
			content: [
				new Text({
					text: "This is the first line of text.This is the first line of text.This is the first line of text.This is the first line of text.This is the first line of text.This is the first line of text.This is the first line of text.This is the first line of text.This is the first line of text.This is the first line of text."
				}),
				oPopoverButton,
				new Text({
					text: "This is the second line of text. This is the second line of text. This is the second line of text. This is the second line of text.This is the second line of text. This is the second line of text. This is the second line of text. This is the second line of text."
				})
			]
		});

		this.oPage.addContent(oButton);

		await nextUIUpdate(oClock);

		oPopover.openBy(oButton);
		oClock.tick(300);
		await nextUIUpdate(oClock);

		assert.strictEqual(document.activeElement, oPopoverButton.getFocusDomRef(), "Initial focus is set to the button.");

		//cleanup
		runAllFakeTimersAndRestore(oClock);
		oPopover.destroy();
		oButton.destroy();
		oPopoverButton.destroy();
	});

	QUnit.module("Focus Handling and Screen Reader Support", {
		before: function () {
			createRenderTarget();
		},
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function () {
			runAllFakeTimersAndRestore(this.clock);
		},
		after: function () {
			removeRenderTarget();
		}
	});

	QUnit.test("Focus moves directly to the correct target", async function (assert) {
		if (!Device.system.desktop) {
			assert.ok(true, "Test only relevant for desktop");
			return;
		}

		this.clock.restore();
		const done = assert.async();
		const oButton = new Button({
			text: "Open Popover"
		});
		const oPopover = new Popover({
			content: [
				new Button("btn1", {
					text: "Button 1"
				})
			]
		});

		const fnFocusInSpy = this.spy();
		const fnFocusInHandler = (e) => {
			fnFocusInSpy(e.target);
		};
		document.addEventListener("focusin", fnFocusInHandler);

		oButton.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		oPopover.openBy(oButton);
		oPopover.attachAfterOpen(() => {
			assert.strictEqual(document.activeElement?.id, "btn1", "Focus is on the correct button.");
			assert.ok(fnFocusInSpy.calledOnce, "Focus has been moved only once. This is required to not confuse the screen reader.");
			assert.ok(fnFocusInSpy.calledWith(document.activeElement), "Focus has been moved to the correct button.");

			oPopover.destroy();
			oButton.destroy();
			document.removeEventListener("focusin", fnFocusInHandler);
			done();
		});
	});

	QUnit.test("Keyup and keypress are prevented during opening", async function (assert) {
		const oButton = new Button({
			text: "Open Popover"
		});
		const oPopover = new Popover({
			content: [
				new Button({
					text: "Button 1"
				})
			]
		});

		const fnKeyboardPreventSpy = this.spy(PreventKeyboardEvents, "preventOnce");
		const fnKeyboardRestoreSpy = this.spy(PreventKeyboardEvents, "restore");

		oPopover.addEventDelegate({
			onAfterRendering: () => {
				assert.ok(fnKeyboardPreventSpy.calledOnce, "Keyboard events are prevented during opening.");
				assert.ok(fnKeyboardPreventSpy.calledWith(oPopover.getDomRef()), "preventOnce was called with correct parameter.");
				assert.ok(fnKeyboardRestoreSpy.notCalled, "Keyboard events are not restored during open.");
			}
		});

		oButton.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate(this.clock);

		oPopover.openBy(oButton);
		this.clock.tick(1000);

		assert.ok(fnKeyboardPreventSpy.calledOnce, "Keyboard events are not prevented further.");
		assert.ok(fnKeyboardRestoreSpy.called, "Keyboard events are restored after open.");
		assert.ok(fnKeyboardRestoreSpy.calledWith(oPopover.getDomRef()), "Keyboard events are restored after open.");

		oPopover.destroy();
		oButton.destroy();
		fnKeyboardPreventSpy.restore();
		fnKeyboardRestoreSpy.restore();
	});


	// include stylesheet and let test starter wait for it
	return includeStylesheet({
		url: sap.ui.require.toUrl("test-resources/sap/m/qunit/Popover.css")
	});

});
