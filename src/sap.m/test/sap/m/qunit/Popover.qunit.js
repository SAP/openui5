/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
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
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/ui/core/Popup",
	"sap/m/NavContainer",
	"sap/m/SegmentedButton",
	"sap/ui/core/theming/Parameters",
	"sap/ui/core/InvisibleText",
	"sap/m/Title",
	"sap/m/Input",
	"jquery.sap.keycodes",
	"jquery.sap.mobile"
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
	Parameters,
	InvisibleText,
	Title,
	Input
) {
	// shortcut for jQuery.device
	var device = jQuery.device;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	document.body.insertBefore(createAndAppendDiv("content"), document.body.firstChild);

	var IMAGE_PATH = "test-resources/sap/m/images/";

	var iBarHeight = 48, iArrowOffset = 9;

	var oButton = new Button({
		text: "Popover",
		press: function () {
			oPopover.openBy(this);
		}
	});
	oButton.addStyleClass("positioned");

	var oButton2 = new Button({
		text: "Popover2",
		press: function () {
			oPopover2.openBy(this);
		}
	});
	oButton2.addStyleClass("positioned");

	var app = new App("myApp", {
		initialPage: "myFirstPage"
	});

	var page = new Page("myFirstPage", {
		title: "Test",
		showNavButton: true,
		enableScrolling: true,
		content: [
			oButton,
			oButton2
		]
	});

	app.addPage(page).placeAt("content");

	//create the list
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

	function bindListData (data, itemTemplate, list) {
		var oModel = new JSONModel();
		// set the data for the model
		oModel.setData(data);
		// set the model to the list
		list.setModel(oModel);

		// bind Aggregation
		list.bindAggregation("items", "/navigation", itemTemplate);
	}

	bindListData(data, oItemTemplate1, oList2);
	//end of the list creation

	//create the scrollContainer
	var oScrollContainer = new ScrollContainer({
		horizontal: false,
		vertical: true,
		content: oList2
	});
	var sOldTitleValue = "Popover", sNewTitleValue = "Title Changed";

	var oPopover = new Popover("popover", {
		placement: PlacementType.Bottom,
		title: sOldTitleValue,
		showHeader: true,
		content: [
			oScrollContainer
		]
	});

	var oPopover2 = new Popover("popover2", {
		placement: PlacementType.Bottom,
		title: "non-focusable content",
		showHeader: true,
		content: [
			new HTML({content: "<div>test content</div>"})
		]
	});

	var oCustomHeader = new Bar("customHeader", {
		contentLeft: [new Image('myAppIcon', {src: IMAGE_PATH + "SAPUI5.png"}),
			new Label("IconHeader", {text: "Icon Header"})],
		contentMiddle: [],
		contentRight: []
	});

	var oSubHeader = new Bar({
		contentMiddle: [
			new SearchField({
				placeholder: "Search ...",
				width: "100%"
			})
		]
	});

	var oBeginButton = new Button("beginButton", {
		text: "Left",
		type: ButtonType.Reject
	});

	var oEndButton = new Button("endButton", {
		text: "Right",
		type: ButtonType.Accept
	});

	QUnit.module("Initial Check");

	QUnit.test("Initialization", function (assert){
		assert.ok(!jQuery.sap.domById("popover"), "Popover is not rendered in the beginning.");
	});

	QUnit.module("Open and Close", {
		beforeEach: function () {
			this.oButton = new Button().addStyleClass("positioned");
			this.oPopover = new Popover({
				contentWidth: "400px",
				contentHeight: "300px"
			});
			page.addContent(this.oButton);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oPopover.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Open with placement: Bottom, and then close", function (assert){
		this.oPopover.setPlacement(PlacementType.Bottom);

		var fnBeforeOpen = this.spy(),
				fnAfterOpen = this.spy(),
				fnSetArrowPosition = this.spy(this.oPopover, "_fnAdjustPositionAndArrow"),
				$Button = jQuery(this.oButton.getDomRef("inner"));

		this.oPopover.attachBeforeOpen(fnBeforeOpen);
		this.oPopover.attachAfterOpen(fnAfterOpen);

		this.oPopover.openBy(this.oButton);

		assert.ok(this.oPopover.isOpen(), "Popover is already open");

		this.clock.tick(500);

		var $popover = this.oPopover.$();
		assert.ok($popover.length, "Popover is rendered after it's opened.");
		assert.ok($popover.closest("#sap-ui-static")[0], "Popover should be rendered inside the static uiArea.");
		assert.ok(Math.ceil($popover.offset().top - iArrowOffset) >= Math.floor($Button.offset().top + $Button.outerHeight()), "Popover should be opened at the bottom of the button");
		if (!jQuery.support.touch && !jQuery.sap.simulateMobileOnDesktop) {
			assert.ok(jQuery.sap.containsOrEquals($popover[0], document.activeElement), "Popover should have the focus");
		}
		assert.equal(fnBeforeOpen.callCount, 1, "beforeOpen event is fired");
		assert.equal(fnAfterOpen.callCount, 1, "afterOpen event is fired");
		assert.equal(fnSetArrowPosition.callCount, 1, "Popover is only positioned once");

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

	QUnit.test("Open with placement: Right", function (assert){
		oButton.removeStyleClass("positioned").addStyleClass("positioned1");
		oPopover.setPlacement(PlacementType.Right);
		oButton.firePress();
		assert.ok(oPopover.isOpen(), "Popover is already open");
		this.clock.tick(500);
		var $popover = jQuery.sap.byId("popover");
		assert.ok(jQuery.sap.domById("popover"), "Popover is rendered after it's opened.");
		assert.ok($popover.closest("#sap-ui-static")[0], "Popover should be rendered inside the static uiArea.");
		assert.ok(Math.ceil($popover.offset().left - iArrowOffset) >= Math.floor(oButton.$().offset().left + oButton.$().outerWidth()), "Popover should be opened at the right side of the button");
		//the window size of the test machine is too small, this test can't be executed successfully
// 				assert.ok($popover.position().top >= iBarHeight + 2, "popover is not overlapping the Page Header");
// 				assert.ok(($popover.position().left + $popover.outerWidth()) <= (jQuery(window).width() - 10), "popover is not overlapping the right border");
// 				assert.ok(($popover.position().top + $popover.outerHeight()) <= (jQuery(window).height() - 20), "popover is not overlapping bottom border");
	});

	QUnit.test("Close", function (assert){
		oPopover.close();
		this.clock.tick(500);
		assert.equal(jQuery.sap.byId("popover").css("visibility"), "hidden", "popover should be hidden after it's closed");
		assert.ok(!oPopover.isOpen(), "Popover is already closed");
	});

	QUnit.test("Open with placement: Left", function (assert){
		oButton.removeStyleClass("positioned1").addStyleClass("positioned2");
		oPopover.setPlacement(PlacementType.Left);
		oButton.firePress();
		assert.ok(oPopover.isOpen(), "Popover is already open");
		this.clock.tick(500);
		var $popover = jQuery.sap.byId("popover"),
				$Button = jQuery(oButton.getFocusDomRef());
		assert.ok(jQuery.sap.domById("popover"), "Popover is rendered after it's opened.");
		assert.ok($popover.closest("#sap-ui-static")[0], "Popover should be rendered inside the static uiArea.");
		assert.ok(Math.floor($popover.offset().left + $popover.outerWidth() + iArrowOffset) <= Math.ceil($Button.offset().left), "Popover should be opened at the left side of the button");
		//the window size of the test machine is too small, this test can't be executed successfully
// 				assert.ok($popover.position().top >= iBarHeight + 2, "popover is not overlapping the Page Header");
// 				assert.ok(($popover.position().top + $popover.outerHeight()) <= (jQuery(window).height() - 20), "popover is not overlapping bottom border");
	});

	QUnit.test("Close", function (assert){
		oPopover.close();
		this.clock.tick(500);
		assert.equal(jQuery.sap.byId("popover").css("visibility"), "hidden", "popover should be hidden after it's closed");
		assert.ok(!oPopover.isOpen(), "Popover is already closed");
	});

	QUnit.test("Open with placement: Top", function (assert){
		oButton.removeStyleClass("positioned2").addStyleClass("positioned3");
		oPopover.setPlacement(PlacementType.Top);
		oButton.firePress();
		assert.ok(oPopover.isOpen(), "Popover is already open");
		this.clock.tick(500);
		var $popover = jQuery.sap.byId("popover"),
				$Button = jQuery(oButton.getDomRef("inner"));
		assert.ok(jQuery.sap.domById("popover"), "Popover is rendered after it's opened.");
		assert.ok($popover.closest("#sap-ui-static")[0], "Popover should be rendered inside the static uiArea.");
		if (jQuery(window).height() > 150) {
			// when the browser window is really short, this has to be disabled.
			assert.ok(Math.floor($popover.offset().top + $popover.outerHeight() + iArrowOffset) <= Math.ceil($Button.offset().top), "Popover should be opened at the top of the button");
		}
		//the window size of the test machine is too small, this test can't be executed successfully
// 				assert.ok($popover.position().top >= iBarHeight + 2, "popover is not overlapping the Page Header");
// 				assert.ok(($popover.position().left + $popover.outerWidth()) <= (jQuery(window).width() - 10), "popover is not overlapping the right border");
		//the window size of the test machine is too small, this test can't be executed successfully
// 				assert.ok($popover.position().left >= 10, "popover is not overlapping the left border");
	});

	QUnit.test("Close", function (assert){
		oPopover.close();
		this.clock.tick(500);
		assert.equal(jQuery.sap.byId("popover").css("visibility"), "hidden", "popover should be hidden after it's closed");
		assert.ok(!oPopover.isOpen(), "Popover is already closed");
	});

	QUnit.test("Popover should stay open after destroyContent", function(assert) {
		this.oPopover.addContent(new List({
			items: [new StandardListItem({ title: 'Test'})]
		}));

		this.oPopover.openBy(this.oButton);
		this.clock.tick(1000);  // wait 1s after the open animation is completed

		this.oPopover.destroyContent();

		assert.strictEqual(document.activeElement, this.oPopover.getFocusDomRef(), "Focus should be on the Popover");
	});

	QUnit.test('it should set the width of the content to "450px"', function(assert) {

		// act
		this.oPopover.setContentMinWidth("450px");  // note: contentWidth is set to "400px"

		// arrange
		this.oPopover.openBy(this.oButton);
		this.clock.tick(1000);  // wait 1s after the open animation is completed

		// assert
		assert.strictEqual(this.oPopover.getDomRef("cont").offsetWidth, 450);
	});

	QUnit.test('it should set the width of the content to "50px"', function(assert) {

		// act
		this.oPopover.setContentWidth("50px");

		// arrange
		this.oPopover.openBy(this.oButton);
		this.clock.tick(1000);  // wait 1s after the open animation is completed

		// assert
		assert.strictEqual(this.oPopover.getDomRef("cont").offsetWidth, 50);
	});

	QUnit.test('ESCAPE should not dismiss the Popover in certain situations', function (assert) {
		var fnKeyDownModifiers = function (iCode) {
				sap.ui.test.qunit.triggerKeydown(this.oPopover.getDomRef(), iCode);
				sap.ui.test.qunit.triggerKeydown(this.oPopover.getDomRef(), jQuery.sap.KeyCodes.ESCAPE);
				this.clock.tick(1000);  // wait eventual animation
			}.bind(this),
			fnKeyUpModifiers = function (iCode) {
				sap.ui.test.qunit.triggerKeyup(this.oPopover.getDomRef(), jQuery.sap.KeyCodes.ESCAPE);
				sap.ui.test.qunit.triggerKeyup(this.oPopover.getDomRef(), iCode);
				this.clock.tick(1000);  // wait eventual animation
			}.bind(this);
		// arrange
		this.oPopover.openBy(this.oButton);
		this.clock.tick(1000);  // wait 1s after the open animation is completed

		// Act
		fnKeyDownModifiers(jQuery.sap.KeyCodes.SPACE);
		// Assert
		assert.strictEqual(this.oPopover.isOpen(), true, "ESCAPE when Space is hold, should not close the Popover");
		// Cleanup
		fnKeyUpModifiers(jQuery.sap.KeyCodes.SPACE);
		// Assert
		assert.strictEqual(this.oPopover.isOpen(), true, "The Popover should still be in Open state");

		// Act
		sap.ui.test.qunit.triggerKeydown(this.oPopover.getDomRef(), jQuery.sap.KeyCodes.ESCAPE);
		sap.ui.test.qunit.triggerKeyup(this.oPopover.getDomRef(), jQuery.sap.KeyCodes.ESCAPE);
		this.clock.tick(500);

		// Assert
		assert.strictEqual(this.oPopover.isOpen(), false, "The Popover should be closed.");
	});

	QUnit.module("Position calculation");

	QUnit.test("vertical calculation of Popover positioning should be correct", function (assert){
		var testCase = function (offset, outerHeight, height, placement, expectedPlace) {
			var stubOffset = sinon.stub(Element.prototype, "getBoundingClientRect").returns({top: offset, height: outerHeight});
			var stubOffsetTop = sinon.stub(jQuery.fn, "offset").returns({top: offset});
			var stubOuterHeight = sinon.stub(jQuery.fn, "outerHeight").returns(outerHeight);

			var oPopover3 = new Popover({
				placement: placement
			});

			var stubWindowHeight = sinon.stub(oPopover3, "_getDocHeight").returns(height);
			var stubOpenByRef = sinon.stub(oPopover3, "_getOpenByDomRef").returns(document.createElement("div"));

			oPopover3._calcPlacement();

			assert.strictEqual(oPopover3._oCalcedPos, expectedPlace);

			stubOpenByRef.restore();
			stubOffset.restore();
			stubOffsetTop.restore();
			stubOuterHeight.restore();
			stubWindowHeight.restore();
		};

		testCase(50, 50, 500, PlacementType.Vertical, PlacementType.Bottom);
		testCase(450, 50, 500, PlacementType.Vertical, PlacementType.Top);

		// Preferred Top
		testCase(400, 50, 500, PlacementType.VerticalPreferedTop, PlacementType.Top); // You have enough space to the Top and Top space is greater than the Bottom space
		testCase(400, 50, 500, PlacementType.VerticalPreferredTop, PlacementType.Top); // You have enough space to the Top and Top space is greater than the Bottom space
		testCase(150, 50, 500, PlacementType.VerticalPreferedTop, PlacementType.Top); // You have enough space to the Top but Top space is smaller than the Bottom space
		testCase(150, 50, 500, PlacementType.VerticalPreferredTop, PlacementType.Top); // You have enough space to the Top but Top space is smaller than the Bottom space
		testCase(40, 50, 500, PlacementType.VerticalPreferedTop, PlacementType.Bottom); // You do not have enough space at the preferred position, so the position with more space is used
		testCase(40, 50, 500, PlacementType.VerticalPreferredTop, PlacementType.Bottom); // You do not have enough space at the preferred position, so the position with more space is used

		// Preferred Bottom
		testCase(100, 50, 500, PlacementType.VerticalPreferedBottom, PlacementType.Bottom); // You have enough space to the Bottom and Bottom space is greater than the Top space
		testCase(100, 50, 500, PlacementType.VerticalPreferredBottom, PlacementType.Bottom); // You have enough space to the Bottom and Bottom space is greater than the Top space
		testCase(350, 50, 500, PlacementType.VerticalPreferedBottom, PlacementType.Bottom); // You have enough space to the Bottom but Bottom space is smaller than the Bottom space
		testCase(350, 50, 500, PlacementType.VerticalPreferredBottom, PlacementType.Bottom); // You have enough space to the Bottom but Bottom space is smaller than the Bottom space
		testCase(450, 50, 500, PlacementType.VerticalPreferedBottom, PlacementType.Top); // You do not have enough space at the preferred position, so the position with more space is used
		testCase(450, 50, 500, PlacementType.VerticalPreferredBottom, PlacementType.Top); // You do not have enough space at the preferred position, so the position with more space is used
	});

	QUnit.test("Vertical calculation of Popover position when Popover's content is bigger than the screen height and preferredVertical is set", function(assert){

		var oList = new List();
		var oPopover = new Popover({ placement: "VerticalPreferedBottom"});

		for (var i = 0; i < 1000; i++) {
			oList.addItem(new StandardListItem());
		}

		oPopover.addContent(oList);

		oPopover.openBy(oButton2);

		assert.strictEqual(oPopover._oCalcedPos, PlacementType.Bottom);

		oList.destroy();
		oPopover.destroy();
	});

	QUnit.test("Vertical (top/bottom) calculation and flip functionality", function (assert){
		var testCase = function (offset, outerHeight, height, placement, expectedPlace) {
			var stubOffset = sinon.stub(Element.prototype, "getBoundingClientRect").returns({top: offset, height: outerHeight});
			var stubOffsetTop = sinon.stub(jQuery.fn, "offset").returns({top: offset});
			var stubOuterHeight = sinon.stub(jQuery.fn, "outerHeight").returns(outerHeight);


			var oPopover3 = new Popover({
				placement: placement
			});

			var stubWindowHeight = sinon.stub(oPopover3, "_getDocHeight").returns(height);
			var stubOpenByRef = sinon.stub(oPopover3, "_getOpenByDomRef").returns(document.createElement("div"));

			oPopover3._calcPlacement();

			assert.strictEqual(oPopover3._oCalcedPos, expectedPlace);

			stubOpenByRef.restore();
			stubOffset.restore();
			stubOffsetTop.restore();
			stubOuterHeight.restore();
			stubWindowHeight.restore();
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

			var oPopover3 = new Popover({
				placement: placement
			});

			var stubOpenByRef = sinon.stub(oPopover3, "_getOpenByDomRef").returns(document.createElement("div"));
			oPopover3._calcPlacement();

			assert.strictEqual(oPopover3._oCalcedPos, expectedPlace);

			stubOpenByRef.restore();
			stubOffset.restore();
			stubOuterWidth.restore();
			stubWindowWidth.restore();
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

			var oPopover3 = new Popover({
				placement: placement
			});

			var stubOpenByRef = sinon.stub(oPopover3, "_getOpenByDomRef").returns(document.createElement("div"));
			oPopover3._calcPlacement();

			assert.strictEqual(oPopover3._oCalcedPos, expectedPlace);

			stubOpenByRef.restore();
			stubOffset.restore();
			stubOuterWidth.restore();
			stubWindowWidth.restore();
		};

		testCase(400, 50, 500, PlacementType.HorizontalPreferedLeft, PlacementType.Left);

		// Preferred Left
		testCase(400, 50, 500, PlacementType.HorizontalPreferedLeft, PlacementType.Left); // You have enough space to the Left and Left space is greater than the Right space
		testCase(400, 50, 500, PlacementType.HorizontalPreferredLeft, PlacementType.Left); // You have enough space to the Left and Left space is greater than the Right space
		testCase(100, 50, 500, PlacementType.HorizontalPreferedLeft, PlacementType.Left); // You have enough space to the Left but Left space is smaller than the Right space
		testCase(100, 50, 500, PlacementType.HorizontalPreferredLeft, PlacementType.Left); // You have enough space to the Left but Left space is smaller than the Right space
		testCase(40, 50, 500, PlacementType.HorizontalPreferedLeft, PlacementType.Right); // You do not have enough space at the preferred position, so the position with more space is used
		testCase(40, 50, 500, PlacementType.HorizontalPreferredLeft, PlacementType.Right); // You do not have enough space at the preferred position, so the position with more space is used

		// Preferred Right
		testCase(100, 50, 500, PlacementType.HorizontalPreferedRight, PlacementType.Right); // You have enough space to the Right and Right space is greater than the Left space
		testCase(100, 50, 500, PlacementType.HorizontalPreferredRight, PlacementType.Right); // You have enough space to the Right and Right space is greater than the Left space
		testCase(350, 50, 500, PlacementType.HorizontalPreferedRight, PlacementType.Right); // You have enough space to the Right but Right space is smaller than the Left space
		testCase(350, 50, 500, PlacementType.HorizontalPreferredRight, PlacementType.Right); // You have enough space to the Right but Right space is smaller than the Left space
		testCase(450, 50, 500, PlacementType.HorizontalPreferedRight, PlacementType.Left); // You do not have enough space at the preferred position, so the position with more space is used
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
			var oPopover3 = new Popover({
				placement: PlacementType.Auto
			});

			var stubWindowHeight = sinon.stub(oPopover3, "_getDocHeight").returns(height);

			var stubOpenByRef = sinon.stub(oPopover3, "_getOpenByDomRef").returns(document.createElement("div"));
			oPopover3._calcPlacement();

			assert.strictEqual(oPopover3._oCalcedPos, expectedPlace);

			stubOffsetTop.restore();
			stubOpenByRef.restore();
			stubOffset.restore();
			stubOuterWidth.restore();
			stubViewportHeight.restore();
			stubViewportWidth.restore();
			stubOuterHeight.restore();
			stubWindowHeight.restore();
			stubPopover.restore();
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

	QUnit.module("Property Setter");

	QUnit.test("Set modal to true or false", function (assert){
		oButton.firePress();
		this.clock.tick(500);
		oPopover.setModal(true);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery.sap.domById("sap-ui-blocklayer-popup"), "Block layer is rendered");
		assert.equal(jQuery.sap.byId("sap-ui-blocklayer-popup").css("visibility"), "visible", "block layer is visible");
		oPopover.setModal(false);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery.sap.byId("sap-ui-blocklayer-popup").css("visibility"), "hidden", "block layer is invisible");
	});

	QUnit.test("Set title", function (assert){
		assert.ok(jQuery.sap.domById(oPopover.getId() + "-title"), "Title is rendered");
		assert.equal(jQuery.sap.byId(oPopover.getId() + "-title").text(), sOldTitleValue, "Title should be with the right value");
		assert.ok(jQuery.sap.byId(oPopover.getId() + "-title").closest("#" + oPopover.getId() + "-intHeader-BarMiddle")[0], "Title should be rendered in the middle part of the bar");
		oPopover.setTitle(sNewTitleValue);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery.sap.byId(oPopover.getId() + "-title").text(), sNewTitleValue, "Title should be changed to the new value");
	});

	QUnit.test("Set title to empty string", function (assert){
		oPopover.setTitle("");
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery.sap.byId(oPopover.getId() + "-title").text(), "", "Title should be able to be set to empty string");
	});

	QUnit.test("Add left button", function (assert){
		oPopover.setBeginButton(oBeginButton);
		sap.ui.getCore().applyChanges();
		var oBeginButtonFocusDom = oBeginButton.getFocusDomRef();
		assert.ok(oBeginButtonFocusDom, "BeginButton should be rendered");
		if (!jQuery.support.touch && !jQuery.sap.simulateMobileOnDesktop) {
			assert.equal(oBeginButtonFocusDom, document.activeElement, "beginButton should have the focus");
		}
		assert.ok(oBeginButton.$().closest("#" + oPopover.getId() + "-intHeader-BarLeft")[0], "Left button is set in the left side of the bar in iOS");
	});

	QUnit.test("Add right button", function (assert){
		oPopover.setEndButton(oEndButton);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery.sap.domById("endButton"), "EndButton should be rendered");
		assert.ok(oEndButton.$().closest("#" + oPopover.getId() + "-intHeader-BarRight")[0], "EndButton is set in the right side of the bar");
	});

	QUnit.test("Remove beginButton", function (assert){
		oPopover.setBeginButton(null);
		sap.ui.getCore().applyChanges();
		var oEndButtonFocusDom = oEndButton.getFocusDomRef();
		if (!jQuery.support.touch && !jQuery.sap.simulateMobileOnDesktop) {
			assert.equal(oEndButtonFocusDom, document.activeElement, "EndButton should have the focus");
		}
		if (Device.os.ios) {
			assert.ok(!jQuery("#" + oPopover.getId() + "-intHeader-BarLeft").children("#beginButton")[0], "BeginButton is removed from the bar");
		} else {
			assert.ok(!jQuery("#" + oPopover.getId() + "-intHeader-BarRight").children("#beginButton")[0], "BeginButton is removed from the bar");
		}
	});

	QUnit.test("Remove right button", function (assert){
		oPopover.setEndButton(null);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#" + oPopover.getId() + "-intHeader-BarRight").children("#endButton")[0], "EndButton is removed from the bar");
	});

	QUnit.test("Set sub header", function (assert){
		oPopover.setSubHeader(oSubHeader);
		sap.ui.getCore().applyChanges();
		assert.ok(oPopover.$().children(".sapMPopoverSubHeader")[0], "Sub header is rendered");
	});

	QUnit.test("set contentWidth/Height", function (assert){
		oPopover.setContentWidth("300px");
		oPopover.setContentHeight("400px");
		this.clock.tick(50);
		var $content = jQuery.sap.byId(oPopover.getId() + "-cont");
		assert.ok($content.width() <= 300, "contentWidth " + $content.width() + " should be less or equal than the set width 300");
		assert.ok($content.height() <= 400, "contentHeight " + $content.height() + " should be less or equal than the set height 400");
	});

	QUnit.test("set contentWidth/Height to percentage", function (assert){
		oPopover.setContentWidth("50%");
		oPopover.setContentHeight("50%");
		this.clock.tick(50);
		var $content = jQuery.sap.byId(oPopover.getId() + "-cont");
		assert.ok($content.width() <= (jQuery(window).width() * 0.5), "Calculated width " + $content.width() + " should be less or equal than the part of window width " + jQuery(window).width() * 0.5);
		assert.ok($content.height() <= (jQuery(window).height() * 0.5), "Calculated height " + $content.height() + " should be less or equal than the part of window height " + jQuery(window).height() * 0.5);
	});

	QUnit.test("Set enable scrolling (mapped to vertical/horizontal scrolling)", function (assert){
		var oPopover4 = new Popover({
			enableScrolling: true
		});

		assert.strictEqual(oPopover4.getVerticalScrolling(), true);
		assert.strictEqual(oPopover4.getHorizontalScrolling(), true);
		oPopover4.setEnableScrolling(false);
		assert.strictEqual(oPopover4.getVerticalScrolling(), false);
		assert.strictEqual(oPopover4.getHorizontalScrolling(), false);
	});

	QUnit.test("Set vertical/horizontal scrolling", function (assert){
		oPopover.setVerticalScrolling(false);
		oPopover.setHorizontalScrolling(false);
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery.sap.domById(oPopover.getId()).className.indexOf("sapMPopoverVerScrollDisabled") != -1, true, "verticalScrolling should be disabled");
		assert.equal(jQuery.sap.domById(oPopover.getId()).className.indexOf("sapMPopoverHorScrollDisabled") != -1, true, "horizontalScrolling should be disabled");
		assert.equal(oPopover.getVerticalScrolling(), false, "verticalScrolling should be disabled");
		assert.equal(oPopover.getVerticalScrolling(), false, "horizontalScrolling should be disabled");

		oPopover.setVerticalScrolling(true);
		oPopover.setHorizontalScrolling(true);
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery.sap.domById(oPopover.getId()).className.indexOf("sapMPopoverVerScrollDisabled") == -1, true, "verticalScrolling should be enabled");
		assert.equal(jQuery.sap.domById(oPopover.getId()).className.indexOf("sapMPopoverHorScrollDisabled") == -1, true, "horizontalScrolling should be enabled");
		assert.equal(oPopover.getVerticalScrolling(), true, "verticalScrolling should be enabled");
		assert.equal(oPopover.getVerticalScrolling(), true, "horizontalScrolling should be enabled");
	});

	QUnit.test("Set showHeader", function (assert){
		assert.ok(jQuery.sap.domById(oPopover.getId() + "-intHeader"), "Internal header is rendered");
		oPopover.setModal(true);
		oPopover.setShowHeader(false);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery.sap.domById(oPopover.getId() + "-intHeader"), "Internal header is removed");
		oPopover.setShowHeader(true);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery.sap.byId(oPopover.getId() + "-intHeader").css("display") !== "none", "Internal header is re-rendered");
	});

	QUnit.test("Set custom header", function (assert){
		oPopover.setCustomHeader(oCustomHeader);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery.sap.domById("customHeader"), "Custom Header is rendered");
		assert.ok(!jQuery.sap.domById(oPopover.getId() + "-intHeader"), "Internal header is destroyed");
		oPopover.destroy();
	});

	QUnit.test("Popover opened by a button, set focus to button shouldn't close the popover", function(assert){
		var oButtonInPopover = new Button();
		var oButton = new Button();
		var oPopover = new Popover({
			content: oButtonInPopover
		});

		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		oPopover.openBy(oButton);
		this.clock.tick(500);

		assert.ok(oPopover.isOpen(), "Popover is open");
		assert.ok(jQuery.sap.containsOrEquals(oButtonInPopover.getDomRef(), document.activeElement), "focus is set to the button in popover");

		oButton.focus();
		this.clock.tick(500);

		assert.ok(oPopover.isOpen(), "Popover is still open");

		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Autoclose after invalidate", function (assert){
		var oSystem = {
			desktop: true,
			phone: false,
			tablet: false
		};

		this.stub(Device, "system", oSystem);

		this.stub(device, "is", oSystem);

		this.stub(Popup.prototype, "touchEnabled", false);

		var oPopover = new Popover({
			contentWidth: "300px",
			contentHeight: "300px",
			placement: PlacementType.Top
		});

		var oButton = new Button(),
				oButton2 = new Button();

		oButton.placeAt("content");
		oButton2.placeAt("content");
		sap.ui.getCore().applyChanges();

		oButton.$().removeClass("positioned positioned1 positioned2");
		oButton.$().addClass("positioned3");
		oButton2.$().css({
			position: "absolute",
			top: "100px",
			left: "100px"
		});

		oPopover.openBy(oButton);
		assert.ok(oPopover.isOpen(), "Popover should be opened");
		this.clock.tick(500);

		oPopover.invalidate();
		sap.ui.getCore().applyChanges();

		var oSpy = this.spy(jQuery.sap, "assert");
		var oBeforeCloseSpy = this.spy();

		oPopover.attachBeforeClose(oBeforeCloseSpy);

		oButton2.focus();
		this.clock.tick(500);
		assert.ok(!oPopover.isOpen(), "Popover should be closed by autoclose");
		assert.ok(!oSpy.calledWith(false), "All asserts should be passed");
		assert.equal(oBeforeCloseSpy.callCount, 1, "beforeClose event is fired");
		oPopover.destroy();
		oButton.destroy();
		oButton2.destroy();
	});

	QUnit.test("Restore scroll position after content resize", function (assert){
		var oSystem = {
			desktop: true,
			phone: false,
			tablet: false
		};

		this.stub(Device, "system", oSystem);


		var sId = "scrollPosPopover",
				iScrollTop = 123,
				iScrollLeft = 124,
				oPopover = new Popover(sId, {
					contentWidth: "300px",
					contentHeight: "300px",
					content: new HTML({
						content: "<div style='width: 500px; height: 600px'></div>"
					}),
					placement: PlacementType.Top
				});

		oButton.$().removeClass("positioned positioned1 positioned2");
		oButton.$().addClass("positioned3");

		oPopover.openBy(oButton);
		this.clock.tick(500);

		var $Content = jQuery.sap.byId(sId + "-cont");
		oPopover._oScroller.scrollTo(iScrollLeft, iScrollTop, 1);

		//trigger content resize listener
		oPopover._onOrientationChange();

		assert.equal(oPopover._oScroller.getScrollTop(), iScrollTop, "Popover should keep vertical scroll position");
		assert.equal(oPopover._oScroller.getScrollLeft(), iScrollLeft, "Popover should keep horizontal scroll position");
		oPopover.destroy();
	});

	QUnit.test("Keyboard Navigation", function (assert){
		var oSystem = {
			desktop: true,
			phone: false,
			tablet: false
		};

		this.stub(Device, "system", oSystem);

		var oButton = new Button();
		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();
		oButton.focus();

		var oPopover = new Popover({
			contentWidth: "300px",
			contentHeight: "300px",
			content: new HTML({
				content: "<div style='width: 500px; height: 600px'></div>"
			}),
			placement: PlacementType.Top
		});

		oButton.$().removeClass("positioned positioned1 positioned2");
		oButton.$().addClass("positioned3");

		oPopover.openBy(oButton);
		this.clock.tick(500);
		assert.ok(oPopover.isOpen(), "Popover should be opened");
		sap.ui.test.qunit.triggerKeyup(oPopover.getDomRef(), jQuery.sap.KeyCodes.ESCAPE);
		this.clock.tick(500);
		assert.ok(!oPopover.isOpen(), "Popover should be closed by ESCAPE key");
		assert.equal(document.activeElement, oButton.getFocusDomRef(), "Focus should be set back to the button");

		oPopover.openBy(oButton);
		this.clock.tick(500);
		assert.ok(oPopover.isOpen(), "Popover should be opened");
		sap.ui.test.qunit.triggerKeyup(oPopover.getDomRef(), jQuery.sap.KeyCodes.F4, false, true);
		this.clock.tick(500);
		assert.ok(!oPopover.isOpen(), "Popover should be closed by Alt+F4 key");
		assert.equal(document.activeElement, oButton.getFocusDomRef(), "Focus should be set back to the button");

		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("content resize handler for placement: auto after orientation change", function (assert){
		var oPopover = new Popover({
			contentWidth: "300px",
			contentHeight: "300px",
			content: new HTML({
				content: "<div style='width: 500px; height: 600px'></div>"
			}),
			placement: PlacementType.Auto
		});

		oButton.$().removeClass("positioned positioned1 positioned2");
		oButton.$().addClass("positioned3");

		oPopover.openBy(oButton);
		this.clock.tick(500);
		var fnContentResize = this.spy(oPopover, "_registerContentResizeHandler");
		oPopover._onOrientationChange();
		assert.equal(fnContentResize.callCount, 1, "registerContentResizeHandler should called once");
		oPopover.destroy();
	});

	QUnit.test("content resize handler for placement: auto after orientation change", function (assert){
		var oSystem = {
			desktop: true,
			phone: false,
			tablet: false
		};

		this.stub(Device, "system", oSystem);

		this.stub(device, "is", oSystem);

		var oPopover = new Popover({
			contentWidth: "300px",
			contentHeight: "300px",
			content: new HTML({
				content: "<div style='width: 500px; height: 600px'></div>"
			}),
			placement: PlacementType.Auto
		});

		oPopover.openBy(oButton);
		this.clock.tick(500);

		assert.ok(oPopover.isOpen(), "Popover is opened");

		// change the position of button, popover should be closed
		oButton.$().css("bottom", parseInt(oButton.$().css("bottom")) + 33);
		this.clock.tick(600);

		assert.ok(!oPopover.isOpen(), "Popover is closed because open by control is moved");

		oPopover.openBy(oButton);
		this.clock.tick(500);

		assert.ok(oPopover.isOpen(), "Popover is opened again");
		// turn of the followOf
		oPopover.setFollowOf(false);

		// change the position of button, popover should not be closed this time
		oButton.$().css("bottom", parseInt(oButton.$().css("bottom")) - 33);

		this.clock.tick(300);
		assert.ok(oPopover.isOpen(), "Popover is still open");

		oPopover.destroy();
	});

	QUnit.test("Content scrolling is disabled when NavContainer is set as single content in Popover", function (assert){
		var oPopover = new Popover({
			horizontalScrolling: false,
			content: new NavContainer({
				pages: new Page()
			})
		});

		oPopover.openBy(oButton);
		assert.ok(!oPopover.getScrollDelegate(), "Scrolling is disabled by default when there's NavContainer as single content in Popover");

		oPopover.destroy();
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

		var oPopover = new Popover({
			content: oNavContainer
		});

		//Act
		oPopover.openBy(oButton);
		oNavButton.firePress();
		this.clock.tick(500);

		//Assert
		assert.equal(document.activeElement, oPage2._navBtn.getDomRef(), "The focus should be on the back button");

		//Act
		oPopover.close();
		this.clock.tick(300);
		oPopover.openBy(oButton);
		this.clock.tick(300);

		//Arrange
		var oCloseSpy = this.spy(oPopover, "close");

		//Act
		oPage2.fireNavButtonPress();
		this.clock.tick(500);

		//Assert
		assert.equal(document.activeElement, oNavButton.getDomRef(), "The focus should be on the navigation button");
		assert.equal(oCloseSpy.callCount, 0, "The popover should not close after a navigation");
		assert.ok(oPopover.isOpen(), "Popover should stay open");

		//Cleanup
		oPopover.destroy();
		oCloseSpy.restore();
	});

	QUnit.test("Scrolling is properly disabled", function (assert){
		var oPopover = new Popover({
			content: [
				new Button({text: 'text1'}),
				new Button({text: 'text2'}),
				new Button({text: 'text2'})
			],
			verticalScrolling: false,
			horizontalScrolling: false,
			enableScrolling: false
		});

		oPopover.openBy(oButton);
		assert.ok(!oPopover.getScrollDelegate(), "Scrolling is properly disabled");

		oPopover.destroy();
	});

	QUnit.test("Enable content scrolling even with NavContainer as content in Popover", function (assert){
		var oPopover = new Popover({
			content: new NavContainer({
				pages: new Page()
			}),
			verticalScrolling: true
		});

		oPopover.openBy(oButton);
		assert.ok(oPopover.getScrollDelegate(), "Scrolling is enabled when vertical scrolling is manually set to true");
		oPopover.destroy();

		oPopover = new Popover({
			content: new NavContainer({
				pages: new Page()
			}),
			horizontalScrolling: true
		});

		oPopover.openBy(oButton);
		assert.ok(oPopover.getScrollDelegate(), "Scrolling is enabled when vertical scrolling is manually set to true");
		oPopover.destroy();
	});

	QUnit.test("Popover should keep open when openBy control rerenders", function (assert){
		var oButton = new Button({
			text: "abced"
		});

		page.addContent(oButton);
		sap.ui.getCore().applyChanges();

		var oPopover = new Popover({
			contentWidth: "400px",
			contentHeight: "400px"
		});

		oPopover.openBy(oButton);
		this.clock.tick(500);
		assert.ok(oPopover.isOpen(), "Popover should be opened now");

		oButton.invalidate();
		this.clock.tick(300);
		assert.ok(oPopover.isOpen(), "Popover should keep the open state");
		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Popover follow of with tolerance", function (assert){
		var oSystem = {
			desktop: true,
			phone: false,
			tablet: false
		};

		this.stub(Device, "system", oSystem);

		var oButton = new Button({
			text: "Follow Me"
		});

		page.addContent(oButton);
		sap.ui.getCore().applyChanges();

		oButton.$().css({
			position: "absolute",
			top: 0,
			left: 0
		});

		var oPopover = new Popover({
			contentWidth: "400px",
			contentHeight: "400px"
		});

		oPopover.openBy(oButton);
		this.clock.tick(500);
		assert.ok(oPopover.isOpen(), "Popover should be opened now");

		oButton.$().css({
			top: "31px"
		});
		this.clock.tick(500);
		assert.ok(oPopover.isOpen(), "Popover should keep the open state");

		oButton.$().css({
			top: "64px"
		});
		this.clock.tick(500);
		assert.ok(!oPopover.isOpen(), "Popover should be closed");
		this.clock.tick(500);

		// Turn off followOf, Popover should also be closed when openBy control isn't in viewport anymore
		oPopover.setFollowOf(false);
		oPopover.openBy(oButton);
		this.clock.tick(500);
		assert.ok(oPopover.isOpen(), "Popover should be opened again");

		oButton.$().css({
			top: "-200px"
		});
		oPopover._fnOrientationChange();
		this.clock.tick(500);
		assert.ok(!oPopover.isOpen(), "Popover should be closed");

		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Button in SegmentedButton opens Popover", function (assert){
		var oPopover = new Popover({
			contentWidth: "200px",
			contentHeight: "300px"
		});

		var oButton = new Button({
			text: "Open Popover",
			press: function () {
				oPopover.openBy(this);
			}
		});

		var oSegBtn = new SegmentedButton({
			buttons: [
				new Button({
					text: "Button1"
				}),
				oButton
			]
		});

		oSegBtn.placeAt("content");
		sap.ui.getCore().applyChanges();

		oButton.firePress();
		assert.ok(oPopover.isOpen(), "Popover should be opened");

		oPopover.destroy();
		oSegBtn.destroy();
	});

	QUnit.test("Call Popover's open method several times while it's being closed", function (assert){
		var oPopover = new Popover({
			contentWidth: "300px",
			contentHeight: "300px"
		});

		var oButton = new Button({
			text: "Open"
		});

		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		oPopover.openBy(oButton);
		this.clock.tick(500);
		oPopover.close();

		var oSpy = this.spy(oPopover.oPopup, "open");

		//call openby twice in a row
		oPopover.openBy(oButton);
		oPopover.openBy(oButton);

		this.clock.tick(500);
		assert.equal(oSpy.callCount, 1, "popup's open method should only be called once");

		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Restore scroll position on mobile device", function (assert){
		var oSystem = {
			desktop: false,
			tablet: true,
			phone: false
		};

		this.stub(Device, "system", oSystem);

		var oButton = new Button({
			text: "Open"
		});

		var oPopover = new Popover({
			contentWidth: "200px",
			contentHeight: "200px",
			content: new HTML({
				content: "<div style='width: 400px;height: 400px'></div>"
			})
		});

		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();
		oPopover.openBy(oButton);

		this.clock.tick(500);
		assert.ok(oPopover.isOpen(), "Popover is open");
		oPopover._oScroller.scrollTo(30, 20, 1);

		oPopover._onOrientationChange();
		assert.equal(oPopover._oScroller.getScrollTop(), 20, "scrollTop is restored");
		assert.equal(oPopover._oScroller.getScrollLeft(), 30, "scrollLeft is restored");

		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Popover with NavContainer as Content", function (assert){
		var oPopover = new Popover({
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

		var oButton = new Button({
			text: "Focus Problem with Popover"
		});
		page.addContent(oButton);
		sap.ui.getCore().applyChanges();

		oPopover.openBy(oButton);
		this.clock.tick(1000);
		assert.ok(oPopover.isOpen(), "Popover is still open");
		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Container Padding Classes", function (assert){
		// System under Test + Act
		var oContainer = new Popover(),
				sContentSelector = ".sapMPopoverCont > .sapMPopoverScroll",
				sResponsiveSize = (Device.resize.width <= 599 ? "0px" : (Device.resize.width <= 1023 ? "16px" : "16px 32px")), // eslint-disable-line no-nested-ternary
				aResponsiveSize = sResponsiveSize.split(" "),
				$container,
				$containerContent;

		// Act
		oContainer.placeAt("content");
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

	QUnit.test("Popover should stay when right border of openby control stays while size changes", function (assert){
		var oButton = new Button({
			text: "Right Border Stays"
		}).addStyleClass("positioned2");
		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = new Popover({
			contentWidth: "200px",
			contentHeight: "200px"
		});
		oPopover.openBy(oButton);
		this.clock.tick(400);
		assert.ok(oPopover.isOpen(), "Popover should be opened");
		oButton.setText("Short");
		sap.ui.getCore().applyChanges();
		this.clock.tick(400);
		assert.ok(oPopover.isOpen(), "Popover should still be open");

		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("openBy is set to dom reference and popover should be positioned correctly after the dom is created in dom tree again", function (assert){
		var oButton = new Button({
			text: "Open Popover"
		}).addStyleClass("positioned2");
		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = new Popover({
			contentWidth: "200px",
			contentHeight: "200px",
			placement: PlacementType.Vertical
		});
		oPopover.openBy(oButton.getDomRef());
		this.clock.tick(400);
		assert.ok(oPopover.isOpen(), "Popover should be opened");
		assert.ok(oPopover.$().offset().top > oButton.$().offset().top, "Popover should be placed below the button");

		oButton.rerender();
		// simulate a content resize
		oPopover._onOrientationChange();
		oPopover.close();
		this.clock.tick(400);
		assert.ok(!oPopover.isOpen(), "Popover is closed");

		oPopover.openBy(oButton.getDomRef());
		this.clock.tick(400);
		assert.ok(oPopover.isOpen(), "Popover should be opened again");
		assert.ok(oPopover.$().offset().top > oButton.$().offset().top, "Popover should be placed below the button again");

		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("showArrow with value false should not render the arrow", function (assert){
		var oButton = new Button({
			text: "Open Popover"
		});
		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = new Popover({showArrow: false}),
				oSpyGetArrowOffsetCss = sinon.spy(oPopover, "_getArrowOffsetCss"),
				oSpyGetArrowPositionCssClass = sinon.spy(oPopover, "_getArrowPositionCssClass"),
				oSpyGetArrowStyleCssClass = sinon.spy(oPopover, "_getArrowStyleCssClass");

		oPopover.openBy(oButton);

		assert.equal(oPopover.$("arrow").length, 0, "Popover should not have arrow");
		assert.equal(oSpyGetArrowOffsetCss.callCount, 0, "_getArrowOffsetCss should not be called");
		assert.equal(oSpyGetArrowPositionCssClass.callCount, 0, "_getArrowPositionCssClass should not be called");
		assert.equal(oSpyGetArrowStyleCssClass.callCount, 0, "_getArrowStyleCssClass should not be called");

		oSpyGetArrowOffsetCss.restore();
		oSpyGetArrowPositionCssClass.restore();
		oSpyGetArrowStyleCssClass.restore();
		oPopover.destroy();
	});

	QUnit.test("showArrow with value true should render the arrow", function (assert){
		var oButton = new Button({
			text: "Open Popover"
		});
		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = new Popover({showArrow: true}),
				oSpyGetArrowOffsetCss = sinon.spy(oPopover, "_getArrowOffsetCss"),
				oSpyGetArrowPositionCssClass = sinon.spy(oPopover, "_getArrowPositionCssClass"),
				oSpyGetArrowStyleCssClass = sinon.spy(oPopover, "_getArrowStyleCssClass");

		oPopover.openBy(oButton);

		assert.equal(oPopover.$("arrow").length, 1, "Popover should have arrow");
		assert.equal(oSpyGetArrowOffsetCss.callCount, 1, "_getArrowOffsetCss should be called");
		assert.equal(oSpyGetArrowPositionCssClass.callCount, 1, "_getArrowPositionCssClass should be called");
		assert.equal(oSpyGetArrowStyleCssClass.callCount, 1, "_getArrowStyleCssClass should be called");

		oSpyGetArrowOffsetCss.restore();
		oSpyGetArrowPositionCssClass.restore();
		oSpyGetArrowStyleCssClass.restore();
		oPopover.destroy();
	});

	QUnit.test("Popover should act according to value of resizing property", function(assert){
		var oButton = new Button({
			text: "Open Popover"
		});
		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Arrange
		this.oPopover = new Popover();
		this.oPopover.setResizable(true);

		// Act
		this.oPopover.openBy(oButton);

		if (!Device.system.desktop) {
			// Assert when resizable
			var domQueryLength = this.oPopover.getDomRef().querySelectorAll('.sapMPopoverResizeHandle').length;
			assert.equal(domQueryLength,  0, "Arrow not found in popover because not desktop device");
		} else {
			// Assert when resizable
			var domQueryLength = this.oPopover.getDomRef().querySelectorAll('.sapMPopoverResizeHandle').length;
			assert.equal(domQueryLength,  1, "Arrow found in popover");

			this.oPopover.setResizable(false);
			this.oPopover.rerender();

			// Assert when not resizable
			var domQueryLength = this.oPopover.getDomRef().querySelectorAll('.sapMPopoverResizeHandle').length;
			assert.equal(domQueryLength,  0, "Arrow not found in popover");
		}
	});

	QUnit.test("setModal arguments forwarding", function(assert){
		// setup
		this.oPopover = new Popover();

		var oSpy = sinon.spy(this.oPopover.oPopup, "setModal");
		this.oPopover.setModal(true, undefined);

		// assert
		assert.strictEqual(oSpy.getCall(0).args[1], "sapMPopoverBLayer", "The css styles are forwarded properly to the popup.");

		// restore
		this.oPopover.destroy();
		oSpy.restore();
	});


	QUnit.module("Internal methods");

	QUnit.test("_getAnimationDuration", function (assert) {
		assert.strictEqual(Popover.prototype._getAnimationDuration(), 300, "Default Duration should be 300");
	});

	QUnit.test("_applyPosition should be called with two parameters from check docking", function (assert){
		var oPopover = new Popover(),
				oSpy = sinon.spy(oPopover.oPopup, "_applyPosition");

		// Act
		oPopover._fnFollowOf({
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

		oPopover.destroy();
	});

	QUnit.test("_getPopoverPositionCss should return an object with correct top, bottom, right and left position when Popover do not exceed vertically or horizontally of the window", function (assert){
		var oPopover = new Popover(),
				oPosParams = {
					_fWidth: 416,
					_fHeight: 802,
					_fDocumentWidth: 1920,
					_fDocumentHeight: 1139,
					_fMarginTop: 50,
					_fMarginRight: 10,
					_fMarginBottom: 10,
					_fMarginLeft: 265,
					_fOffset: {
						top: 21,
						left: 265
					}
				};

		var oCalculatedParams = oPopover._getPopoverPositionCss(oPosParams);

		assert.equal(oCalculatedParams.top, 50, "top position should be equal to the _marginTop after calculations");
		assert.equal(oCalculatedParams.right, undefined, "right position should be equal to 'undefined' after calculations");
		assert.ok(isNaN(oCalculatedParams.bottom), "bottom position should be equal to 'NaN' after calculations");
		assert.equal(oCalculatedParams.left, undefined, "left position should be equal to 'undefined' after calculations");

		oPopover.destroy();
	});

	QUnit.test("_getPopoverPositionCss should return an object with correct top, bottom, right and left position when Popover do not exceed vertically or horizontally of the window but exceeds the defined 10px border of the screen", function (assert){
		var oPopover = new Popover(),
				oPosParams = {
					_fWidth: 416,
					_fHeight: 754,
					_fDocumentWidth: 1920,
					_fDocumentHeight: 1139,
					_fMarginTop: 50,
					_fMarginRight: 10,
					_fMarginBottom: 162,
					_fMarginLeft: 10,
					_fOffset: {
						top: 223,
						left: 0
					}
				};

		var oCalculatedParams = oPopover._getPopoverPositionCss(oPosParams);

		assert.equal(oCalculatedParams.top, undefined, "top position should be equal to the 'undefined after calculations");
		assert.equal(oCalculatedParams.right, undefined, "right position should be equal to the 'undefined after calculations");
		assert.ok(isNaN(oCalculatedParams.bottom), "bottom position should be equal to 'NaN' after calculations");
		assert.equal(oCalculatedParams.left, 10, "left position should be equal to _fMarginLeft after calculations");

		oPopover.destroy();
	});

	QUnit.test("_getMaxContentWidth should return calculated max content width", function (assert){
		var oPopover = new Popover();

		var iMaxContentWidth = oPopover._getMaxContentWidth({
			_fDocumentWidth: 500,
			_fMarginLeft: 10,
			_fMarginRight: 10,
			_fPopoverBorderLeft: 10,
			_fPopoverBorderRight: 10
		});

		assert.equal(iMaxContentWidth, 460, "Popover maxContentWidth should be equal to the documentWidth minus left and right margins and borders");

		oPopover.destroy();
	});

	QUnit.test("_getMaxContentHeight should return calculated max content width", function (assert){
		var oPopover = new Popover();

		var iMaxContentHeight = oPopover._getMaxContentHeight({
			_fDocumentHeight: 500,
			_fMarginTop: 10,
			_fMarginBottom: 10,
			_fHeaderHeight: 10,
			_fSubHeaderHeight: 10,
			_fFooterHeight: 10,
			_fContentMarginTop: 10,
			_fContentMarginBottom: 10,
			_fPopoverBorderTop: 10,
			_fPopoverBorderBottom: 10
		});

		assert.equal(iMaxContentHeight, 410, "Popover maxContentHeight should be equal to the documentHeight minus header, subheader, footer height; top and bottom margins, borders and content margins");

		oPopover.destroy();
	});

	QUnit.test("_getContentDimensionsCss should return max-width, max-height computed right and empty height if the Popover can fit on the screen", function (assert){
		var oPopover = new Popover(),
				stubPopoverMaxContentWidth = sinon.stub(oPopover, "_getMaxContentWidth").returns(500),
				stubPopoverMaxContentHeight = sinon.stub(oPopover, "_getMaxContentHeight").returns(400),
				stubjQueryHeight = sinon.stub(jQuery.fn, "height").returns(300),
				oExpectedDimensions = {
					"max-width": "500px",
					"max-height": "400px",
					"height": ""
				};

		var oContentDimensions = oPopover._getContentDimensionsCss({
			_$content: jQuery()
		});

		assert.deepEqual(oContentDimensions, oExpectedDimensions, "Content dimensions should be right");

		stubPopoverMaxContentWidth.restore();
		stubPopoverMaxContentHeight.restore();
		stubjQueryHeight.restore();
		oPopover.destroy();
	});

	QUnit.test("_getContentDimensionsCss should return max-width and height if the Popover can fit on the screen and have contentHeight property set", function (assert){
		var oPopover = new Popover({
					contentHeight: "500px"
				}),
				stubPopoverMaxContentWidth = sinon.stub(oPopover, "_getMaxContentWidth").returns(400),
				stubPopoverMaxContentHeight = sinon.stub(oPopover, "_getMaxContentHeight").returns(400),
				stubjQueryHeight = sinon.stub(jQuery.fn, "height").returns(300),
				oExpectedDimensions = {
					"max-width": "400px",
					"height": "300px"
				};

		var oContentDimensions = oPopover._getContentDimensionsCss({
			_$content: jQuery()
		});

		assert.deepEqual(oContentDimensions, oExpectedDimensions, "Content dimensions should be right");

		stubPopoverMaxContentWidth.restore();
		stubPopoverMaxContentHeight.restore();
		stubjQueryHeight.restore();
		oPopover.destroy();
	});

	QUnit.test("_isHorizontalScrollbarNeeded returns false if scrollbar is not needed", function (assert){
		var bNeededScrollbar,
				oPopover = new Popover(),
				stubOuterWidth = sinon.stub(jQuery.fn, "outerWidth").returns(500),
				stubWidth = sinon.stub(jQuery.fn, "width").returns(400);

		bNeededScrollbar = oPopover._isHorizontalScrollbarNeeded({
			_$scrollArea: jQuery(),
			_$content: jQuery()
		});

		assert.ok(!bNeededScrollbar, "Scrollbar is not needed");

		stubOuterWidth.restore();
		stubWidth.restore();
		oPopover.destroy();
	});

	QUnit.test("_isHorizontalScrollbarNeeded returns true if scrollbar is needed", function (assert){
		var bNeededScrollbar,
				oPopover = new Popover(),
				stubOuterWidth = sinon.stub(jQuery.fn, "outerWidth").returns(400),
				stubWidth = sinon.stub(jQuery.fn, "width").returns(500);

		bNeededScrollbar = oPopover._isHorizontalScrollbarNeeded({
			_$scrollArea: jQuery(),
			_$content: jQuery()
		});

		assert.ok(bNeededScrollbar, "Scrollbar is needed");

		stubOuterWidth.restore();
		stubWidth.restore();
		oPopover.destroy();
	});

	QUnit.test("_getArrowOffsetCss should return top position of the arrow when placement type is left or right", function (assert){
		var oPopover = new Popover(),
				oPosParams = {
					_$popover: jQuery(),
					_$parent: jQuery(),
					_$arrow: jQuery(),
					_fPopoverBorderTop: 1,
					_fOffsetY: 0
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

		var oCalculatedPos = oPopover._getArrowOffsetCss(PlacementType.Left, oPosParams);
		assert.deepEqual(oCalculatedPos, oExpectedPos, "top position should be 355px");

		var oCalculatedPos = oPopover._getArrowOffsetCss(PlacementType.Right, oPosParams);
		assert.deepEqual(oCalculatedPos, oExpectedPos, "top position should be 355px");

		stubPopoverOuterWidth.restore();
		stubPopoverOuterHeight.restore();
		stubPopoverOffset.restore();
		stubParentOuterHeight.restore();
		stubParentOffset.restore();
		stubArrowOuterHeight.restore();
		oPopover.destroy();
	});

	QUnit.test("_getArrowPositionCssClass returns the right CSS class for different position options", function (assert){
		var sPlacementClass,
				oPopover = new Popover();

		sPlacementClass = oPopover._getArrowPositionCssClass(PlacementType.Top);
		assert.equal(sPlacementClass, "sapMPopoverArrDown", "The class should be sapMPopoverArrDown");

		sPlacementClass = oPopover._getArrowPositionCssClass(PlacementType.Bottom);
		assert.equal(sPlacementClass, "sapMPopoverArrUp", "The class should be sapMPopoverArrUp");

		sPlacementClass = oPopover._getArrowPositionCssClass(PlacementType.Left);
		assert.equal(sPlacementClass, "sapMPopoverArrRight", "The class should be sapMPopoverArrRight");

		sPlacementClass = oPopover._getArrowPositionCssClass(PlacementType.Right);
		assert.equal(sPlacementClass, "sapMPopoverArrLeft", "The class should be sapMPopoverArrLeft");

		oPopover.destroy();
	});

	QUnit.test("_getArrowStyleCssClass should return sapMPopoverHeaderAlignArr class if Popover Arrow is aligned with the header", function (assert){
		var oPopover = new Popover(),
				oPosParams = {
					_$arrow: jQuery(),
					_$footer: jQuery(),
					_fArrowHeight: 32,
					_fHeaderHeight: 48,
					_fSubHeaderHeight: 0
				},
				stubArrowPosition = sinon.stub(oPosParams._$arrow, "position").returns({top: 7, left: -33}),
				stubFooterPosition = sinon.stub(oPosParams._$footer, "position").returns({top: 187, left: 0});

		var sClassName = oPopover._getArrowStyleCssClass(oPosParams);

		assert.equal(sClassName, "sapMPopoverHeaderAlignArr", "Should return sapMPopoverHeaderAlignArr class");

		stubArrowPosition.restore();
		stubFooterPosition.restore();
		oPopover.destroy();
	});

	QUnit.test("_getArrowStyleCssClass should return sapMPopoverCrossArr class if Popover Arrow crosses the header and content", function (assert){
		var oPopover = new Popover(),
				oPosParams = {
					_$arrow: jQuery(),
					_$footer: jQuery(),
					_fArrowHeight: 32,
					_fHeaderHeight: 48,
					_fSubHeaderHeight: 0
				},
				stubArrowPosition = sinon.stub(oPosParams._$arrow, "position").returns({top: 30, left: -33}),
				stubFooterPosition = sinon.stub(oPosParams._$footer, "position").returns({top: 800, left: 0});

		oPosParams._$footer.length = 1;

		var sClassName = oPopover._getArrowStyleCssClass(oPosParams);

		assert.equal(sClassName, "sapMPopoverCrossArr", "Should return sapMPopoverCrossArr class");

		stubArrowPosition.restore();
		stubFooterPosition.restore();
		oPopover.destroy();
	});

	QUnit.test("_getArrowStyleCssClass should return sapMPopoverFooterAlignArr class if Popover Arrow is aligned with the footer", function (assert){
		var oPopover = new Popover(),
				oPosParams = {
					_$arrow: jQuery(),
					_$footer: jQuery("<div />"),
					_arrowHeight: 32,
					_headerHeight: 48,
					_subHeaderHeight: 0
				},
				stubArrowPosition = sinon.stub(oPosParams._$arrow, "position").returns({top: 153, left: -33}),
				stubFooterPosition = sinon.stub(oPosParams._$footer, "position").returns({top: 149, left: 0});

		var sClassName = oPopover._getArrowStyleCssClass(oPosParams);

		assert.equal(sClassName, "sapMPopoverFooterAlignArr", "Should return sapMPopoverFooterAlignArr class");

		stubArrowPosition.restore();
		stubFooterPosition.restore();
		oPopover.destroy();
	});

	QUnit.test("_adaptPositionParams with showArrow true should have offsets set", function (assert){
		var oPopover = new Popover();

		oPopover._adaptPositionParams();

		assert.equal(oPopover._marginTop, 48, "_marginTop should be 48");
		assert.equal(oPopover._marginRight, 10, "_marginTop should be 10");
		assert.equal(oPopover._marginBottom, 10, "_marginTop should be 10");
		assert.equal(oPopover._marginLeft, 10, "_marginTop should be 10");
		assert.equal(oPopover._arrowOffset, 18, "_arrowoffset should be 18");
		assert.deepEqual(oPopover._offsets, ["0 -18", "18 0", "0 18", "-18 0"], "offsets should be correct according the arrowOffset");
		assert.deepEqual(oPopover._myPositions, ["center bottom", "begin center", "center top", "end center"], "myPositions should be correct");
		assert.deepEqual(oPopover._atPositions, ["center top", "end center", "center bottom", "begin center"], "atPositions should be correct");

		oPopover.destroy();
	});

	QUnit.test("_adaptPositionParams with showArrow false should not have offsets set", function (assert){
		var oPopover = new Popover({showArrow: false});

		oPopover._adaptPositionParams();

		assert.equal(oPopover._marginTop, 0, "_marginTop should be 0");
		assert.equal(oPopover._marginRight, 0, "_marginTop should be 0");
		assert.equal(oPopover._marginBottom, 0, "_marginTop should be 0");
		assert.equal(oPopover._marginLeft, 0, "_marginTop should be 0");
		assert.equal(oPopover._arrowOffset, 0, "_arrowoffset should be 0");
		assert.deepEqual(oPopover._offsets, ["0 0", "0 0", "0 0", "0 0"], "offsets should be correct according the arrowOffset");
		assert.deepEqual(oPopover._myPositions, ["begin bottom", "begin center", "begin top", "end center"], "myPositions should be correct");
		assert.deepEqual(oPopover._atPositions, ["begin top", "end center", "begin bottom", "begin center"], "atPositions should be correct");

		oPopover.destroy();
	});

	QUnit.test("Popover should use compact arrow offset if a theme sets less variable _sap_m_Popover_ForceCompactArrowOffset to true", function (assert){
		var stubGetParameters = sinon.stub(Parameters, "get"),
			oPopover = new Popover();

		stubGetParameters.withArgs("_sap_m_Popover_ForceCompactArrowOffset").returns("true");
		oPopover.openBy(oButton2);

		assert.equal(oPopover._arrowOffset, 9, "_arrowoffset should be 9");
		assert.deepEqual(oPopover._offsets, ["0 -9", "9 0", "0 9", "-9 0"], "offsets should be correct according the arrowOffset");

		stubGetParameters.restore();
		oPopover.destroy();
	});

	QUnit.test("Popover should use normal arrow offset if a theme sets less variable _sap_m_Popover_ForceCompactArrowOffset to be false", function (assert){
		var stubGetParameters = sinon.stub(Parameters, "get"),
			oPopover = new Popover();

		stubGetParameters.withArgs("_sap_m_Popover_ForceCompactArrowOffset").returns("false");
		oPopover.openBy(oButton2);

		assert.equal(oPopover._arrowOffset, 18, "_arrowoffset should be 18");
		assert.deepEqual(oPopover._offsets, ["0 -18", "18 0", "0 18", "-18 0"], "offsets should be correct according the arrowOffset");

		stubGetParameters.restore();
		oPopover.destroy();
	});

	QUnit.test("Popover should be in compact mode if one of it's parents is compact", function (assert){
		var oScrollContainer = new ScrollContainer().addStyleClass("sapUiSizeCompact"),
			oButton = new Button(),
			oPopover = new Popover();

		oScrollContainer.addContent(oButton);

		oScrollContainer.placeAt("content");
		sap.ui.getCore().applyChanges();
		oPopover.openBy(oButton);

		assert.equal(oPopover._arrowOffset, 9, "_arrowoffset should be 9");
		assert.deepEqual(oPopover._offsets, ["0 -9", "9 0", "0 9", "-9 0"], "offsets should be correct according the arrowOffset");

		oScrollContainer.destroy();
		oPopover.destroy();
	});

	QUnit.test("_afterAdjustPositionAndArrow is called once", function (assert){
		var oButton = new Button({
			text: "Open Popover"
		});
		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = new Popover();
		var oSpy = this.spy(oPopover, "_afterAdjustPositionAndArrowHook");

		oPopover.openBy(oButton);

		assert.equal(oSpy.callCount, 1, "_afterAdjustPositionAndArrowHook is called once");

		oPopover.destroy();
	});

	QUnit.module("Screen Reader");

	QUnit.test("ARIA role", function (assert){
		var oButton = new Button({
			text: "Open Popover"
		});
		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = new Popover();
		oPopover.openBy(oButton);
		this.clock.tick(400);

		assert.equal(oPopover.$().attr('role'), 'dialog', 'Popover has role dialog');

		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("ARIA labeledby attribute", function (assert){
		var oButton = new Button({
			text: "Open Popover"
		});
		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = new Popover();
		oPopover.openBy(oButton);
		this.clock.tick(400);

		assert.equal(oPopover.$().attr('aria-labelledby'), oPopover._getAnyHeader().getId(), 'Popover aria labeledby attribute is equal to the header id');

		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("ARIA Semantic heading of the popover", function (assert){
		var oButton = new Button({
			text: "Open Popover"
		});

		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = new Popover({
			title: "Title text"
		});
		oPopover.openBy(oButton);
		this.clock.tick(400);

		assert.equal(oPopover._headerTitle.getDomRef().nodeName, "H2", "Popover heading should be set to H2 tag");
		assert.ok(oPopover._headerTitle instanceof Title, "Heading of the popover should be of type sap.m.Title");

		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("ARIA role of the content", function (assert){
		var oButton = new Button({
			text: "Open Popover"
		});

		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = new Popover({
			title: "Title text"
		});
		oPopover.openBy(oButton);
		this.clock.tick(400);
		assert.equal(jQuery.sap.byId(oPopover.getId() + "-cont").attr("role"), "application", "Popover's content should have role application");

		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Popover without header and title", function(assert) {
		var sInvTextId = "invisibleText",
				oInvisibleText = new InvisibleText(sInvTextId, {text: "invisible text"}),
				oButton = new Button({
					text: "Open Popover"
				});

		oInvisibleText.placeAt("content");
		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = new Popover({
			showHeader: false,
			ariaLabelledBy: sInvTextId
		});
		oPopover.openBy(oButton);
		this.clock.tick(400);

		assert.equal(oPopover.getAriaLabelledBy(), sInvTextId, "should have an ariaLabelledBy association that contains a reference to the invisible text");
		assert.equal(oPopover.getDomRef().getAttribute('aria-labelledby'), sInvTextId, "should have an aria-labelledby attribute pointing to the additional invisible label");

		oInvisibleText.destroy();
		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Popover with internal header and title", function(assert) {
		var sInvTextId = "invisibleText",
				oInvisibleText = new InvisibleText(sInvTextId, {text: "invisible text"}),
				oButton = new Button({
					text: "Open Popover"
				});

		oInvisibleText.placeAt("content");
		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = new Popover({
			title: "Title text",
			ariaLabelledBy: sInvTextId
		});
		oPopover.openBy(oButton);
		this.clock.tick(400);

		assert.equal(oPopover.getAriaLabelledBy(), sInvTextId, "should have an ariaLabelledBy association that contains only a reference to the invisible text");
		assert.equal(oPopover.getDomRef().getAttribute('aria-labelledby'), (oPopover._getAnyHeader().getId() + ' ' + sInvTextId), "should have an aria-labelledby attribute pointing to the internal header and the additional invisible label");

		oInvisibleText.destroy();
		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Popover with custom header", function(assert) {
		//Arrange
		var sInvTextId = "invisibleText",
				sCustomHeaderId = "customHeaderId",
				oInvisibleText = new InvisibleText(sInvTextId, {text: "invisible text"}),
			oButton = new Button({
				text: "Open Popover"
			});

		var oCustomHeader = new Bar(sCustomHeaderId, {
			contentLeft: [new Title({text: "Just Title"})]
		});

		oInvisibleText.placeAt("content");
		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = new Popover({
			title: "Title text",
			showHeader: false,
			ariaLabelledBy: sInvTextId
		});

		oPopover.setShowHeader(true);
		oPopover.setCustomHeader(oCustomHeader);
		oPopover.openBy(oButton);
		this.clock.tick(400);

		//Assert
		assert.equal(oPopover.getAriaLabelledBy(), sInvTextId, "should have an ariaLabelledBy association that contains only a reference to the invisible text");
		assert.equal(oPopover.getDomRef().getAttribute('aria-labelledby'), (sCustomHeaderId + ' ' + sInvTextId), "should have an aria-labelledby attribute pointing to the header and the additional invisible label");

		//Cleanup
		oPopover.destroy();
		oInvisibleText.destroy();
		oButton.destroy();
	});

	QUnit.test("Popover with non-visible custom header", function(assert) {
		//Arrange
		var sInvTextId = "invisibleText",
			sCustomHeaderId = "customHeaderId",
			oInvisibleText = new InvisibleText(sInvTextId, {text: "invisible text"}),
			oButton = new Button({
				text: "Open Popover"
			});

		var oCustomHeader = new Bar(sCustomHeaderId, {
			contentLeft: [new Title({text: "Just Title"})],
			visible: false
		});

		oInvisibleText.placeAt("content");
		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = new Popover({
			ariaLabelledBy: sInvTextId
		});

		oPopover.setCustomHeader(oCustomHeader);
		oPopover.getCustomHeader().setVisible(false);
		oPopover.openBy(oButton);
		this.clock.tick(400);

		//Assert
		assert.equal(oPopover.getAriaLabelledBy(), sInvTextId, "should have an ariaLabelledBy association that contains only a reference to the invisible text");
		assert.equal(oPopover.getDomRef().getAttribute('aria-labelledby'), sInvTextId, "aria-labelledby should still be with one reference, since the custom header is not in the dom");

		//Cleanup
		oPopover.destroy();
		oInvisibleText.destroy();
		oButton.destroy();
	});

	QUnit.test("ARIA aria-modal attribute should be true", function (assert){
		var oButton = new Button({
			text: "Open Popover"
		});
		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = new Popover();
		oPopover.openBy(oButton);
		this.clock.tick(400);

		assert.strictEqual(oPopover.$().attr('aria-modal'), "true", 'Popover aria-modal attribute is set to true');

		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.module("Integration");

	QUnit.test("Focus should be taken out of Popover after closed on tablet", function (assert) {
		this.stub(Device, "system", {
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

		sap.ui.getCore().applyChanges();

		oPopover.openBy(oButton);
		this.clock.tick(500);
		assert.ok(jQuery.sap.containsOrEquals(oInput.getDomRef(), document.activeElement), "focus is set to input");

		oPopover.close();
		this.clock.tick(500);

		assert.ok(!jQuery.sap.containsOrEquals(oInput.getDomRef(), document.activeElement), "focus is not in input anymore");

		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Focus should be taken out of Popover after closed on mobile", function (assert) {
		this.stub(Device, "system", {
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

		sap.ui.getCore().applyChanges();

		oPopover.openBy(oButton);
		this.clock.tick(500);
		assert.ok(jQuery.sap.containsOrEquals(oInput.getDomRef(), document.activeElement), "focus is set to input");

		oPopover.close();
		this.clock.tick(500);

		assert.ok(!jQuery.sap.containsOrEquals(oInput.getDomRef(), document.activeElement), "focus is not in input anymore");

		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Do not fire close events when destroyed", function (assert) {
		// Setup
		var oPopover = new Popover(),
			beforeCloseSpy = this.spy(),
			afterCloseSpy = this.spy();

		oPopover.attachBeforeClose(beforeCloseSpy);
		oPopover.attachAfterClose(afterCloseSpy);

		//Act
		jQuery.sap.delayedCall(1000, oPopover, "destroy");
		this.clock.tick(1001);

		assert.strictEqual(beforeCloseSpy.called, false, "On destruction do not call beforeClose event");
		assert.strictEqual(afterCloseSpy.called, false, "On destruction do not call afterClose event");

		//Clean
		oPopover.destroy();
	});

	QUnit.test("Do not fire close events when already closed.", function (assert) {
		// Setup
		var oPopover = new Popover(),
			oButton = new Button(),
			beforeCloseSpy = this.spy(),
			afterCloseSpy = this.spy();

		oPopover.oPopup.touchEnabled = true;
		oButton.addDependent(oPopover);
		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();

		oPopover.attachBeforeClose(beforeCloseSpy);
		oPopover.attachAfterClose(afterCloseSpy);

		//Act
		oPopover.openBy(oButton);
		sap.ui.getCore().applyChanges();
		this.clock.tick(1000);

		oPopover.oPopup.close();
		oPopover.oPopup.close();
		this.clock.tick(1000);

		// Assert
		assert.strictEqual(beforeCloseSpy.callCount, 1, "Should be called only once during the first call.");
		assert.strictEqual(afterCloseSpy.callCount, 1, "Should be called only once during the first call.");

		// Cleanup
		oButton.destroy();
		oButton = null;
		oPopover = null;
	});

	QUnit.test("Do not attach orientationChange handler on destroyed popover", function (assert){
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

		this.stub(Device, "system", oDeviceParams.system);
		this.stub(Device, "support", oDeviceParams.support);

		var oResizeHandlerSpy = this.spy(Device.resize, "attachHandler");
		oButton = new Button().placeAt("content");
		oPopover = new Popover({
			contentWidth: "300px",
			contentHeight: "300px",
			content: new HTML({
				content: "<div style='width: 500px; height: 600px'></div>"
			}),
			afterOpen: function(oEvent) {
				oPopover.destroy();
			}
		});

		// act
		oPopover.openBy(oButton);
		this.clock.tick(500);

		// assert
		assert.equal(oResizeHandlerSpy.callCount, 0, "The resize handler is not attached to a destroyed popover");

		// clean up
		oButton.destroy();
	});

	QUnit.test("Popover open after being destroyed", function (assert){
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

		this.stub(Device, "system", oDeviceParams.system);
		this.stub(Device, "support", oDeviceParams.support);

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
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		//Act
		try {
			oButton.firePress();
			sap.ui.getCore().applyChanges();
		} catch (e) { e; }

		// Assert
		assert.ok(!oOpenerSpy.threw(), "Destroyed and closed silently without exception");

		// Cleanup
		oButton.destroy();
	});

	function isTextTruncated($element) {
		var iTolerance = 0;

		return $element[0].scrollWidth > ($element.innerWidth() + iTolerance);
	}

	QUnit.module("Popover scroll width",{
		beforeEach: function() {
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

			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oPopover.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Item texts are not truncated when width is auto", function(assert) {
		this.oPopover.openBy(this.oButton);
		this.clock.tick(500);

		sap.ui.getCore().applyChanges();

		var $longTextItem = this.oPopover.$().find("#longTextItem .sapMSLITitleOnly");

		// assert
		assert.strictEqual(isTextTruncated($longTextItem), false, "Long text is not truncated when width is auto");
	});

	QUnit.test("Text is truncated when width is too small", function(assert) {
		this.oPopover.setContentWidth("20rem");
		sap.ui.getCore().applyChanges();

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

	QUnit.module("Responsive paddings");

	QUnit.test("_initResponsivePaddingsEnablement is called on init", function (assert) {
		// Arrange
		var oSpy = sinon.spy(Popover.prototype, "_initResponsivePaddingsEnablement");
		var oButton = new Button().placeAt("content");
		var oPopover = new Popover({});
		sap.ui.getCore().applyChanges();

		// Act
		oPopover.openBy(oButton);

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Method _initResponsivePaddingsEnablement is called on init of the control");

		// cleanup
		oSpy.restore();
		oPopover.destroy();
		oButton.destroy();
	});

	QUnit.test("Correct responsive paddings are applied", function (assert) {
		var clock = sinon.useFakeTimers();

		var oButton = new Button({text: "Test"}).placeAt("content");
		var oPopover = new Popover("responsivePaddingsPopover", {
			title: "Test title",
			subHeader: new sap.m.Bar({
				contentMiddle: [
					new sap.m.SearchField({
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
			footer: new sap.m.Bar({
				contentLeft: [new sap.m.Button({icon: "sap-icon://inspection", text: "short"})],
				contentRight: [new sap.m.Button({icon: "sap-icon://home", text: "loooooong text"})]
			})
		});

		var oStub = sinon.stub(window, "requestAnimationFrame", window.setTimeout);
		sap.ui.getCore().applyChanges();

		oPopover.addStyleClass("sapUiResponsivePadding--header");
		oPopover.addStyleClass("sapUiResponsivePadding--subHeader");
		oPopover.addStyleClass("sapUiResponsivePadding--content");
		oPopover.addStyleClass("sapUiResponsivePadding--footer");
		sap.ui.getCore().applyChanges();

		oPopover.openBy(oButton);
		clock.tick(300);
		sap.ui.getCore().applyChanges();

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
		clock.tick(300);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(fnIsResponsive("#responsivePaddingsPopover-intHeader", "sapUi-Std-PaddingM"), "The sapUi-Std-PaddingM class is applied to the header");
		assert.ok(fnIsResponsive(".sapMPopoverSubHeader .sapMIBar", "sapUi-Std-PaddingM"), "The sapUi-Std-PaddingM class is applied to the header");
		assert.ok(fnIsResponsive("#responsivePaddingsPopover-cont", "sapUi-Std-PaddingM"), "The sapUi-Std-PaddingM class is applied to the header");
		assert.ok(fnIsResponsive(".sapMPopoverFooter .sapMIBar", "sapUi-Std-PaddingM"), "The sapUi-Std-PaddingM class is applied to the header");

		// Act
		oPopover.setContentWidth("300px");
		clock.tick(300);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(fnIsResponsive("#responsivePaddingsPopover-intHeader", "sapUi-Std-PaddingS"), "The sapUi-Std-PaddingS class is applied to the header");
		assert.ok(fnIsResponsive(".sapMPopoverSubHeader .sapMIBar", "sapUi-Std-PaddingS"), "The sapUi-Std-PaddingS class is applied to the header");
		assert.ok(fnIsResponsive("#responsivePaddingsPopover-cont", "sapUi-Std-PaddingS"), "The sapUi-Std-PaddingS class is applied to the header");
		assert.ok(fnIsResponsive(".sapMPopoverFooter .sapMIBar", "sapUi-Std-PaddingS"), "The sapUi-Std-PaddingS class is applied to the header");

		//cleanup
		oPopover.destroy();
		oButton.destroy();
		oStub.restore();
	});

	// include stylesheet and let test starter wait for it
	return includeStylesheet({
		url: sap.ui.require.toUrl("test-resources/sap/m/qunit/Popover.css")
	});

});