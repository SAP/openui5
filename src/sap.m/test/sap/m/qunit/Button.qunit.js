/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/library",
	"sap/m/Button",
	"sap/m/ButtonRenderer",
	"sap/ui/core/IconPool",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/m/Label",
	"sap/m/Text",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/dnd/DragInfo",
	"sap/ui/events/KeyCodes",
	"sap/m/BadgeCustomData"
], function(
	qutils,
	createAndAppendDiv,
	mobileLibrary,
	Button,
	ButtonRenderer,
	IconPool,
	coreLibrary,
	Device,
	Label,
	Text,
	InvisibleText,
	DragInfo,
	KeyCodes,
	BadgeCustomData
) {
	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.ButtonAccessibilityType
	var ButtonAccessibilityType = mobileLibrary.ButtonAccessibilityType;

	var styleElement = document.createElement("style");
	styleElement.textContent =
		".ButtonSpace {" +
		"	margin-top: 10px;" +
		"}";
	document.head.appendChild(styleElement);

	createAndAppendDiv("contentBtnDefault").className = "ButtonSpace";
	createAndAppendDiv("contentBtnBack").className = "ButtonSpace";
	createAndAppendDiv("contentBtnAccept").className = "ButtonSpace";
	createAndAppendDiv("contentBtnReject").className = "ButtonSpace";
	createAndAppendDiv("contentBtnTransparent").className = "ButtonSpace";
	createAndAppendDiv("contentBtnWidth").className = "ButtonSpace";
	createAndAppendDiv("contentBtnDisabled").className = "ButtonSpace";
	createAndAppendDiv("contentBtnIcon").className = "ButtonSpace";
	createAndAppendDiv("contentBtnUp").className = "ButtonSpace";
	createAndAppendDiv("contentBtnUnstyled").className = "ButtonSpace";
	createAndAppendDiv("contentBtnInvisible").className = "ButtonSpace";
	createAndAppendDiv("contentBtnTextDirectionRTL").className = "ButtonSpace";
	createAndAppendDiv("contentBtnTextDirectionLTR").className = "ButtonSpace";
	createAndAppendDiv("contentBtnIconTap").className = "ButtonSpace";



	var b1, b2, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, msg;

	var sText = "Button Text",
		sButtonTypeDefault = ButtonType.Default,
		sButtonTypeBack = ButtonType.Back,
		sButtonTypeAccept = ButtonType.Accept,
		sButtonTypeReject = ButtonType.Reject,
		sButtonTypeTransparent = ButtonType.Transparent,
		sButtonTypeUp = ButtonType.Up,
		sButtonTypeUnstyled = ButtonType.Unstyled,
		sButtonTypeCritical = ButtonType.Critical,
		sButtonTypeNegative = ButtonType.Negative,
		sButtonTypeSuccess = ButtonType.Success,
		sWidth = "200px",
		bEnabled = true,
		bDisabled = false,
		sIcon = "../images/analytics_64.png",
		sPressMessage = "Button Tapped Event!";
		sTapMessage = "There is Tap Event on a Button!";

	function tabEventHandler1() {
		throw sPressMessage + " - Exception";
	}

	function tabEventHandler2() {
		msg = sPressMessage;
	}

	// Default Button
	var oBtnDefault = new Button("b1");
	oBtnDefault.setText(sText);
	oBtnDefault.setType(sButtonTypeDefault);
	oBtnDefault.setEnabled(bEnabled);
	oBtnDefault.attachPress(tabEventHandler1);
	oBtnDefault.placeAt("contentBtnDefault");

	// Back Button
	var oBtnBack = new Button("b2");
	oBtnBack.setText("Back Button");
	oBtnBack.setType(sButtonTypeBack);
	oBtnBack.setEnabled(bEnabled);
	oBtnBack.attachPress(tabEventHandler2);
	oBtnBack.placeAt("contentBtnBack");

	// Accept Button
	var oBtnAccept = new Button("b4");
	oBtnAccept.setText("Accept Button");
	oBtnAccept.setType(sButtonTypeAccept);
	oBtnAccept.setEnabled(bEnabled);
	oBtnAccept.attachPress(tabEventHandler2);
	oBtnAccept.placeAt("contentBtnAccept");

	// Reject Button
	var oBtnReject = new Button("b5");
	oBtnReject.setText("Reject Button");
	oBtnReject.setType(sButtonTypeReject);
	oBtnReject.setEnabled(bEnabled);
	oBtnReject.attachPress(tabEventHandler2);
	oBtnReject.placeAt("contentBtnReject");

	// Transparent Button
	var oBtnTransparent = new Button("b6");
	oBtnTransparent.setText("Transparent Button");
	oBtnTransparent.setType(sButtonTypeTransparent);
	oBtnTransparent.setEnabled(bEnabled);
	oBtnTransparent.attachPress(tabEventHandler2);
	oBtnTransparent.placeAt("contentBtnTransparent");

	// Button Width
	var oBtnWidth = new Button("b7");
	oBtnWidth.setText("Button with 200 pixel");
	oBtnWidth.setType(sButtonTypeDefault);
	oBtnWidth.setEnabled(bEnabled);
	oBtnWidth.setWidth(sWidth);
	oBtnWidth.attachPress(tabEventHandler2);
	oBtnWidth.placeAt("contentBtnWidth");

	// Disabled Button
	var oBtnDisabled = new Button("b8");
	oBtnDisabled.setText("Disabled Button");
	oBtnDisabled.setType(sButtonTypeDefault);
	oBtnDisabled.setEnabled(bDisabled);
	oBtnDisabled.setWidth(sWidth);
	oBtnDisabled.attachPress(tabEventHandler2);
	oBtnDisabled.placeAt("contentBtnDisabled");

	// Icon Button
	var oBtnIcon = new Button("b9");
	oBtnIcon.setText("Icon Button");
	oBtnIcon.setType(sButtonTypeDefault);
	oBtnIcon.setEnabled(bEnabled);
	oBtnIcon.setIcon(sIcon);
	oBtnIcon.attachPress(tabEventHandler2);
	oBtnIcon.placeAt("contentBtnIcon");

	// Up Button
	var oBtnUp = new Button("b10");
	oBtnUp.setText("Up Button");
	oBtnUp.setType(sButtonTypeUp);
	oBtnUp.setEnabled(bEnabled);
	oBtnUp.attachPress(tabEventHandler2);
	oBtnUp.placeAt("contentBtnUp");

	// Unstyled Button
	var oBtnUp = new Button("b11");
	oBtnUp.setText("Unstyled Button");
	oBtnUp.setType(sButtonTypeUnstyled);
	oBtnUp.setEnabled(bEnabled);
	oBtnUp.attachPress(tabEventHandler2);
	oBtnUp.placeAt("contentBtnUnstyled");

	// Invisible Button
	var oBtnUp = new Button("b12");
	oBtnUp.setText("Invisible Button");
	oBtnUp.setVisible(false);
	oBtnUp.placeAt("contentBtnInvisible");

	// RTL Button
	var oBtnRtl = new Button("b13");
	oBtnRtl.setText("Button TextDirection RTL");
	oBtnRtl.setIcon(IconPool.getIconURI("employee"));
	oBtnRtl.setTextDirection(TextDirection.RTL);
	oBtnRtl.placeAt("contentBtnTextDirectionRTL");

	// LTR Button
	var oBtnLtr = new Button("b14");
	oBtnLtr.setText("Button TextDirection LTR");
	oBtnLtr.setIcon(IconPool.getIconURI("employee"));
	oBtnLtr.setTextDirection(TextDirection.LTR);
	oBtnLtr.placeAt("contentBtnTextDirectionLTR");

	// Icon Button for tap test
	var oBtnIconTap = new Button("b15");
	oBtnIconTap.setText("Tap Button");
	oBtnIconTap.setType(sButtonTypeDefault);
	oBtnIconTap.setEnabled(bEnabled);
	oBtnIconTap.setIcon(IconPool.getIconURI("employee"));
	oBtnIconTap.placeAt("contentBtnIconTap");
	oBtnIconTap.attachPress(tabEventHandler2);


	QUnit.module("Basic", {
		beforeEach : function() {
			b1 = sap.ui.getCore().byId("b1");
			b2 = sap.ui.getCore().byId("b2");
			b4 = sap.ui.getCore().byId("b4");
			b5 = sap.ui.getCore().byId("b5");
			b6 = sap.ui.getCore().byId("b6");
			b7 = sap.ui.getCore().byId("b7");
			b8 = sap.ui.getCore().byId("b8");
			b9 = sap.ui.getCore().byId("b9");
			b10 = sap.ui.getCore().byId("b10");
			b11 = sap.ui.getCore().byId("b11");
			b12 = sap.ui.getCore().byId("b12");
			b13 = sap.ui.getCore().byId("b13");
			b14 = sap.ui.getCore().byId("b14");
		},
		afterEach : function() {
			b1 = null;
			b2 = null;
			b4 = null;
			b5 = null;
			b6 = null;
			b7 = null;
			b8 = null;
			b9 = null;
			b10 = null;
			b11 = null;
			b12 = null;
			b13 = null;
			b14 = null;
		}
	});


	// test property accessor methods
	QUnit.test("TextOk", function(assert) {
		assert.equal(b1.getText(), sText, "Text - button1 is correct using 'equals()'!");
	});

	QUnit.test("TypeOk", function(assert) {
		assert.equal(b1.getType(), sButtonTypeDefault, "Button Type: Default - button1 is correct using 'equals()'!");
		assert.equal(b2.getType(), sButtonTypeBack, "Button Type: Back - button2 is correct using 'equals()'!");
		assert.equal(b4.getType(), sButtonTypeAccept, "Button Type: Accept - button4 is correct using 'equals()'!");
		assert.equal(b5.getType(), sButtonTypeReject, "Button Type: Reject - button5 is correct using 'equals()'!");
		assert.equal(b6.getType(), sButtonTypeTransparent, "Button Type: Transparent - button6 is correct using 'equals()'!");
		assert.equal(b10.getType(), sButtonTypeUp, "Button Type: Up - button10 is correct using 'equals()'!");
		assert.equal(b11.getType(), sButtonTypeUnstyled, "Button Type: Uunstyle - button11 is correct using 'equals()'!");
	});

	QUnit.test("ButtonEnabledOk", function(assert) {
		assert.equal(b1.getEnabled(), bEnabled, "Button is enabled - button1 is correct using 'equals()'!");
		assert.equal(b2.getEnabled(), bEnabled, "Button is enabled - button2 is correct using 'equals()'!");
		assert.equal(b4.getEnabled(), bEnabled, "Button is enabled - button4 is correct using 'equals()'!");
		assert.equal(b5.getEnabled(), bEnabled, "Button is enabled - button5 is correct using 'equals()'!");
		assert.equal(b6.getEnabled(), bEnabled, "Button is enabled - button6 is correct using 'equals()'!");
		assert.equal(b7.getEnabled(), bEnabled, "Button is enabled - button7 is correct using 'equals()'!");
		assert.equal(b8.getEnabled(), bDisabled, "Button is disabled - button8 is correct using 'equals()'!");
		assert.equal(b9.getEnabled(), bEnabled, "Button is enabled - button9 is correct using 'equals()'!");
		assert.equal(b10.getEnabled(), bEnabled, "Button is enabled - button10 is correct using 'equals()'!");
	});

	QUnit.test("ButtonWidthOk", function(assert) {
		assert.equal(b7.getWidth(), sWidth, "Button width - button7 is correct using 'equals()'!");
	});

	QUnit.test("IconOk", function(assert) {
		assert.equal(b9.getIcon(), sIcon, "Icon for button9 is correct using 'equals()'!");
	});

	QUnit.test("TextDirectionRtlOk", function(assert) {
		var $btnText = b13.$().find('.sapMBtnContent');
		assert.equal($btnText.attr("dir"), "rtl", "Control text has 'dir' property set to right-to-left");
		var $btnBDITag = document.getElementById('b13-content').firstChild.nodeName.toLowerCase() === "bdi";
		assert.ok(!$btnBDITag, "Control doesn't have bidi tag set when it has explicitly set direction");
	});

	QUnit.test("TextDirectionLtrOk", function(assert) {
		var $btnText = b14.$().find('.sapMBtnContent');
		assert.equal($btnText.attr("dir"), "ltr", "Control text has 'dir' property set to left-to-right");
		var $btnBDITag = document.getElementById('b14-content').firstChild.nodeName.toLowerCase() === "bdi";
		assert.ok(!$btnBDITag, "Control doesn't have bidi tag set when it has explicitly set direction");
	});

	QUnit.test("BDI set when no textdirection is given explicitly", function(assert) {
		var bIE_Edge = Device.browser.internet_explorer || Device.browser.edge;
		var $btnBDITag = document.getElementById('b1-content').firstChild.nodeName;
		if (!bIE_Edge) {
			assert.equal($btnBDITag.toLowerCase(), "bdi", "Control has bdi tag set");
		} else {
			assert.ok(!($btnBDITag.toLowerCase() === "bdi"), "Control doesn't have bdi tag set when the browser is IE or Edge, since it's not supported");
		}
	});

	QUnit.test("BDI set after using the setter of the text property", function(assert) {
		var bIE_Edge = Device.browser.internet_explorer || Device.browser.edge;
		b1.setText("New Button Text");
		var $btnBDITag = document.getElementById('b1-content').firstChild.nodeName;
		if (!bIE_Edge) {
			assert.equal($btnBDITag.toLowerCase(), "bdi", "Control has bdi tag set after using the setter of the text property");
		} else {
			assert.ok(!($btnBDITag.toLowerCase() === "bdi"), "Control doesn't have bdi tag set when the browser is IE or Edge, since it's not supported");
		}
	});

	QUnit.test("PressOk", function(assert) {
		try {
			b1.firePress();
			assert.ok(false,"Exception should have been thrown!");
		} catch (e) {
			assert.ok(e == sPressMessage + " - Exception","Button1 - Exception was thrown correctly!");
			assert.equal(e,sPressMessage + " - Exception","Button1 - Exception was thrown correctly!");
		}
		b2.firePress();
		assert.ok(msg == sPressMessage, "Button2 - Event was fired correctly!");
		assert.equal(msg, sPressMessage, "Button2 - Event was fired correctly!!");
		b4.firePress();
		assert.ok(msg == sPressMessage, "Button4 - Event was fired correctly!");
		assert.equal(msg, sPressMessage, "Button4 - Event was fired correctly!!");
		b5.firePress();
		assert.ok(msg == sPressMessage, "Button5 - Event was fired correctly!");
		assert.equal(msg, sPressMessage, "Button5 - Event was fired correctly!!");
		b6.firePress();
		assert.ok(msg == sPressMessage, "Button6 - Event was fired correctly!");
		assert.equal(msg, sPressMessage, "Button6 - Event was fired correctly!!");
		b7.firePress();
		assert.ok(msg == sPressMessage, "Button7 - Event was fired correctly!");
		assert.equal(msg, sPressMessage, "Button7 - Event was fired correctly!!");
	});

	QUnit.test("Visibility", function(assert) {
		assert.ok(!b12.getDomRef(), "Button12 should not be rendered");
	});

	function hoverableTestCase (oTestDescription) {
		this.stub(Device, "system", { desktop : oTestDescription.desktop });

		// System under Test
		var oButton = new Button({
			enabled : oTestDescription.enabled
		});
		oButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		var bHoverable = oButton._isHoverable();

		// Assert
		assert.strictEqual(bHoverable, oTestDescription.shouldBeHoverable, "The button determines whether it should be hoverable");
		assert.strictEqual(oButton.$("inner").hasClass("sapMBtnHoverable"), oTestDescription.shouldHaveCssClass, "The button determines whether it should be hoverable");
	}

	QUnit.test("Should be hoverable if the button is enabled and in desktop", function(assert) {
		hoverableTestCase.call(this, {
			enabled : true,
			desktop : true,
			shouldBeHoverable : true,
			shouldHaveCssClass : true
		});
	});

	QUnit.test("Should not be hoverable if the button is disabled and in desktop", function(assert) {
		hoverableTestCase.call(this, {
			enabled : false,
			desktop : true,
			shouldBeHoverable : false,
			shouldHaveCssClass : false
		});
	});

	QUnit.test("Should not be hoverable if the button is enabled and not desktop", function(assert) {
		hoverableTestCase.call(this, {
			enabled : true,
			desktop : false,
			shouldBeHoverable : false,
			shouldHaveCssClass : false
		});
	});

	QUnit.test("Should not be hoverable if the button is disabled and not desktop", function(assert) {
		hoverableTestCase.call(this, {
			enabled : false,
			desktop : false,
			shouldBeHoverable : false,
			shouldHaveCssClass : false
		});
	});

	QUnit.test("Should not re-render the button if the text is changed", function(assert) {
		// Arrange
		var sTextToSet = "<script>alert(\"HAACKED\");<\/script>",
			oRenderSpy,
			oResult,
			oConstructor = { text : "No empty text"};

		// System under Test
		var oButton = new Button(oConstructor).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oRenderSpy = this.spy(oButton, "invalidate");

		// Act
		oResult = oButton.setText(sTextToSet);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oResult, oButton, "Should be able to chain");
		assert.ok(!/.*<script>.*/.test(oButton.$("content").html()), "Did not contain an unescaped script tag");
		assert.strictEqual(oButton.getText(), sTextToSet, "Did set the non-encoded string as value");

		// Cleanup
		oButton.destroy();
	});


	QUnit.test("Tap event should not be fired when the button is set to invisible", function(assert) {
		// Arrange
		var oRenderSpy,
			oConstructor = { visible : false };

		// System under Test
		var oButton = new Button(oConstructor).placeAt("qunit-fixture");

		oRenderSpy = this.spy(oButton, "fireTap");

		// Act
		oButton.ontap({ setMarked:  this.stub() });

		// Assert
		assert.strictEqual(oRenderSpy.callCount, 0, "Tap event not fired");

		// Cleanup
		oButton.destroy();
	});

	QUnit.test("For safari the button should gain explicitly focus on touch start", function(assert) {
		// Arrange
		// stub the browser to be only safari
		this.stub(Device, "browser", {
			safari: true
		});

		var oButton = new Button({text: "MyText", icon: "sap-icon://search"}).placeAt("qunit-fixture"),
			oFocusSpy = this.spy(oButton, "_setButtonFocus");

		// Act
		oButton.ontouchstart({ setMarked: this.stub() , preventDefault: this.stub(), targetTouches: { length: 1 }, originalEvent: { type: "mousedown" }, target: { id: 'fake-button-id' }});

		// Assert
		assert.strictEqual(oFocusSpy.callCount, 1, "The button is focused on touch start");

		// Cleanup
		oButton.destroy();
	});

	QUnit.test("For firefox the button should gain explicitly focus on touch start", function(assert) {
		// Arrange
		// stub the browser to be only firefox
		this.stub(Device, "browser", {
			firefox: true
		});

		var oButton = new Button({text: "MyText", icon: "sap-icon://search"}).placeAt("qunit-fixture"),
			oFocusSpy = this.spy(oButton, "_setButtonFocus");

		// Act
		oButton.ontouchstart({ setMarked: this.stub() , preventDefault: this.stub(), targetTouches: { length: 1 }, originalEvent: { type: "mousedown" }, target: { id: 'fake-button-id' }});

		// Assert
		assert.strictEqual(oFocusSpy.callCount, 1, "The button is focused on touch start");

		// Cleanup
		oButton.destroy();
	});

	QUnit.test("Tooltip is recognized", function(assert) {

		// Arrange
		var oButton = new Button({text: "MyText",
			icon: "sap-icon://search"});

		assert.strictEqual(oButton._getTooltip(), undefined, "Should not return tooltip");

		// Act
		oButton.setTooltip("MyTooltip");

		// Assert
		assert.strictEqual(oButton._getTooltip(), "MyTooltip", "Should return the tooltip");

		// Cleanup
		oButton.destroy();
	});


	QUnit.test("Tooltip is derived for icon-only buttons", function(assert) {

		// Arrange
		var oButton = new Button({tooltip: "MyTooltip",
			icon: "sap-icon://search"});

		assert.strictEqual(oButton._getTooltip(), "MyTooltip", "Should return the primary tooltip");

		// Act
		oButton.setTooltip(null);

		// Assert
		assert.strictEqual(oButton._getTooltip(), "Search", "Should return the derived tooltip");

		// Act
		oButton.setIcon("sap-icon://accidental-leave"); // Icon WITHOUT semantic text

		// Assert
		assert.strictEqual(oButton._getTooltip(), "accidental-leave", "Should return icon name if there's no icon text");

		// Cleanup
		oButton.destroy();
	});


	QUnit.test("getAccessibilityInfo", function(assert) {
		var oButton = new Button({tooltip: "Tooltip"});
		assert.ok(!!oButton.getAccessibilityInfo, "Button has a getAccessibilityInfo function");
		var oInfo = oButton.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, "button", "AriaRole");
		assert.strictEqual(oInfo.type, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_BUTTON"), "Type");
		assert.strictEqual(oInfo.description, "Tooltip", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.ok(oInfo.editable === undefined || oInfo.editable === null, "Editable");
		oButton.setText("Text");
		oButton.setEnabled(false);
		oInfo = oButton.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "Text", "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");
		oButton.setText(null);
		oButton.setTooltip(null);
		oButton.setIcon("sap-icon://search");
		oInfo = oButton.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "Search", "Description");
		oButton.destroy();
	});

	// BCP: 0020751294 0000677825 2019
	QUnit.test("Press event fires once", function(assert) {
		// arrange
		var pressSpy = this.spy(),
			oTouchEndEvent = { setMarked: function() { }, originalEvent: { buttons: 0, type: "mouseup" }, target: { id: "btn1-BDI-content" } },
			oTapEvent = { setMarked: function() { } },
			oButton = new Button("btn1", {
				press: pressSpy
			}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oButton._bRenderActive = true; //simulate pressed state

		// act
		oButton.ontouchend(oTouchEndEvent);
		oButton.ontap(oTapEvent);

		// assert
		assert.equal(pressSpy.callCount, 1, "Press event should be fired once");

		// clean
		oButton.destroy();
	});

	QUnit.test("_activeButton _inactiveButton", function(assert) {
		//sut
		var sIconURI = 'sap-icon://slim-arrow-down',
			sActiveIconURI = 'sap-icon://slim-arrow-up',
			oButton = new Button({
				icon: sIconURI,
				activeIcon: sActiveIconURI
			});

		oButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//act
		oButton._activeButton();

		//assert
		assert.ok(oButton.$("inner").hasClass("sapMBtnActive"), 'button is styled as active');
		assert.equal(oButton._image.getSrc(), sActiveIconURI);

		//act
		oButton._inactiveButton();

		//assert
		assert.ok(!oButton.$("inner").hasClass("sapMBtnActive"), 'button is styled as inactive');
		assert.equal(oButton._image.getSrc(), sIconURI);

		//clean
		oButton.destroy();
	});

	QUnit.test("tabindex", function(assert) {
		assert.equal(b1.$().attr("tabindex"), undefined, "By default the button(root) should have no tabindex");
		assert.equal(b1.$("inner").attr("tabindex"), undefined, "By default the button(inner) should have no tabindex");

		//Act
		b1._bExcludeFromTabChain = true;

		b1.invalidate();
		sap.ui.getCore().applyChanges();

		//Assert
		assert.equal(b1.$().attr("tabindex"), "-1", "Button(root) should have negative tabindex when requested via _bExcludeFromTabChain");
		assert.equal(b1.$("inner").attr("tabindex"), "-1", "Button(inner) should have negative tabindex when requested via _bExcludeFromTabChain");
	});

	QUnit.test("Enter event should fire press on keydown", function(assert) {
		// System under Test
		var pressSpy = this.spy();
			oButton = new Button({
				press: pressSpy
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// Action
		qutils.triggerKeydown(oButton.getDomRef(), KeyCodes.ENTER);

		// Assert
		assert.equal(pressSpy.callCount, 1, "Press event should be fired once");

		// Cleanup
		oButton.destroy();
	});

	QUnit.test("Enter event should not fire press on keyup", function(assert) {
		// System under Test
		var pressSpy = this.spy(),
			oButton = new Button({
				press: pressSpy
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// Action
		qutils.triggerKeyup(oButton.getDomRef(), KeyCodes.ENTER);

		// Assert
		assert.equal(pressSpy.callCount, 0, "Press event should not be fired");

		// Cleanup
		oButton.destroy();
	});

	QUnit.test("Space event should not fire press on keydown", function(assert) {
		// System under Test
		var pressSpy = this.spy(),
			oButton = new Button({
				press: pressSpy
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// Action
		qutils.triggerKeydown(oButton.getDomRef(), KeyCodes.SPACE);

		// Assert
		assert.equal(pressSpy.callCount, 0, "Press event should not be fired");

		// Cleanup
		oButton.destroy();
	});

	QUnit.test("Space event should fire press on keyup", function(assert) {
		// System under Test
		var pressSpy = this.spy(),
			oButton = new Button({
				press: pressSpy
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// Action
		qutils.triggerKeyup(oButton.getDomRef(), KeyCodes.SPACE);

		// Assert
		assert.equal(pressSpy.callCount, 1, "Press event should be fired once");

		// Cleanup
		oButton.destroy();
	});

	QUnit.test("Space event should not fire press if ESCAPE is pressed and released after the Space is released", function(assert) {
		// System under Test
		var pressSpy = this.spy(),
			oButton = new Button({
				press: pressSpy
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// Action
		// first keydown on SPACE, keydown on ESCAPE, release SPACE then release ESCAPE
		qutils.triggerKeydown(oButton.getDomRef(), KeyCodes.SPACE);
		qutils.triggerKeydown(oButton.getDomRef(), KeyCodes.ESCAPE);
		qutils.triggerKeyup(oButton.getDomRef(), KeyCodes.SPACE);
		qutils.triggerKeyup(oButton.getDomRef(), KeyCodes.ESCAPE);

		// Assert
		assert.equal(pressSpy.callCount, 0, "Press event should not be fired");

		// Cleanup
		oButton.destroy();
	});

	QUnit.test("Space event should not fire press if ESCAPE is pressed then Space is released and then Escape is released", function(assert) {
		// System under Test
		var pressSpy = this.spy(),
			oButton = new Button({
				press: pressSpy
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// Action
		// first keydown on SPACE, keydown on ESCAPE, release ESCAPE then release SPACE
		qutils.triggerKeydown(oButton.getDomRef(), KeyCodes.SPACE);
		qutils.triggerKeydown(oButton.getDomRef(), KeyCodes.ESCAPE);
		qutils.triggerKeyup(oButton.getDomRef(), KeyCodes.ESCAPE);
		qutils.triggerKeyup(oButton.getDomRef(), KeyCodes.SPACE);

		// Assert
		assert.equal(pressSpy.callCount, 0, "Press event should not be fired");

		// Cleanup
		oButton.destroy();
	});

	QUnit.test("_bPressedSpace is reset on Escape", function(assert) {
		// System under Test
		var oButton = new Button().placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// Action
		// first keydown on SPACE, keydown on ESCAPE, release ESCAPE then the flag should be set to false
		qutils.triggerKeydown(oButton.getDomRef(), KeyCodes.SPACE);
		qutils.triggerKeydown(oButton.getDomRef(), KeyCodes.ESCAPE);
		qutils.triggerKeyup(oButton.getDomRef(), KeyCodes.ESCAPE);

		// Assert
		assert.ok(!oButton._bPressedSpace, "_bPressedSpace is set to false once the escape is released");

		// Cleanup
		oButton.destroy();
  });

	QUnit.test("Space event should not fire press if SHIFT is pressed and released after the Space is released", function(assert) {
		// System under Test
		var pressSpy = this.spy(),
			oButton = new Button({
				press: pressSpy
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// Action
		// first keydown on SPACE, keydown on SHIFT, release SPACE then release SHIFT
		qutils.triggerKeydown(oButton.getDomRef(), KeyCodes.SPACE);
		qutils.triggerKeydown(oButton.getDomRef(), KeyCodes.SHIFT);
		qutils.triggerKeyup(oButton.getDomRef(), KeyCodes.SPACE);
		qutils.triggerKeyup(oButton.getDomRef(), KeyCodes.SHIFT);

		// Assert
		assert.equal(pressSpy.callCount, 0, "Press event should not be fired");

		// Cleanup
		oButton.destroy();
	});

	QUnit.test("Space event should not fire press if SHIFT is pressed then Space is released and then SHIFT is released", function(assert) {
		// System under Test
		var pressSpy = this.spy(),
			oButton = new Button({
				press: pressSpy
			}).placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// Action
		// first keydown on SPACE, keydown on SHIFT, release ESCAPE then release SHIFT
		qutils.triggerKeydown(oButton.getDomRef(), KeyCodes.SPACE);
		qutils.triggerKeydown(oButton.getDomRef(), KeyCodes.SHIFT);
		qutils.triggerKeyup(oButton.getDomRef(), KeyCodes.SHIFT);
		qutils.triggerKeyup(oButton.getDomRef(), KeyCodes.SPACE);

		// Assert
		assert.equal(pressSpy.callCount, 0, "Press event should not be fired");

		// Cleanup
		oButton.destroy();
	});

	QUnit.test("All keys should be ignored when Space is pressed", function(assert) {
		// System under Test
		var oEvent = {
				preventDefault: this.spy()
			},
			oButton = new Button().placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// Action
		// first keydown on SPACE, keydown on ESCAPE, release ESCAPE then release SPACE
		qutils.triggerKeydown(oButton.getDomRef(), KeyCodes.SPACE);
		oButton.onkeydown(oEvent);

		// Assert
		assert.equal(oEvent.preventDefault.callCount, 1, "PreventDefault is called");

		// Cleanup
		oButton.destroy();
	});

	//BCP: 1880541323
	QUnit.test("no exception is thrown when domRef is null", function(assert) {
		this.stub(Device, "browser", {"firefox": true});

		// System under Test
		var oButton = new Button({
			text: "Test",
			dragDropConfig: new DragInfo()
		});

		// stub the getDomRef function to return null
		var stubGetDomRef = this.stub(oButton, "getDomRef", function () { return null; });

		// Action
		oButton.onAfterRendering();

		// Assert
		assert.ok(true, "No exception is thrown");

		// Cleanup
		stubGetDomRef.restore();
		oButton.destroy();
	});

	//BCP: 1970026521
	QUnit.test("on mouse enter, button returns to active if the left mouse button is pressed", function(assert) {
		// System under Test
		var oButton = new Button();

		var spyActivate = this.spy(oButton, "_activeButton");

		// Action
		// enter when left mouse and wheel are depressed
		oButton._buttonPressed = true;
		oButton._onmouseenter({ originalEvent: { buttons: 5 } });

		// Assert
		assert.ok(spyActivate.calledOnce, "_activeButton was called");

		// Cleanup
		oButton.destroy();
	});

	//BCP: 1970231584
	QUnit.test("on mouse enter, button doesn't get active if it wasn't pressed before and the left mouse button is pressed", function(assert) {
		// System under Test
		var oButton = new Button();

		var spyActivate = this.spy(oButton, "_activeButton");

		// Action
		// enter when left mouse and wheel are depressed
		oButton._buttonPressed = false;
		oButton._onmouseenter({ originalEvent: { buttons: 5 } });

		// Assert
		assert.ok(!spyActivate.called, "_activeButton wasn't called");

		// Cleanup
		oButton.destroy();
	});

	QUnit.test("Types Negative, Critical, Success, Neutral implied icon is applied", function() {
		// arrange
		var oButton = new Button({
			text: "button"
		});
		oButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assert
		assert.notOk(oButton.getIcon(), "still no icon");

		// act
		oButton.setType(ButtonType.Negative);
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(
			oButton.$("img").attr("data-sap-ui-icon-content"),
			IconPool.getIconInfo("sap-icon://message-error").content,
			"icon is right"
		);

		// act
		oButton.setType(ButtonType.Critical);
		sap.ui.getCore().applyChanges();

		//assert
		assert.equal(
			oButton.$("img").attr("data-sap-ui-icon-content"),
			IconPool.getIconInfo("sap-icon://message-warning").content,
			"icon is right"
		);

		// act
		oButton.setType(ButtonType.Success);
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(
			oButton.$("img").attr("data-sap-ui-icon-content"),
			IconPool.getIconInfo("sap-icon://message-success").content,
			"icon is right"
		);

		// act
		oButton.setType(ButtonType.Neutral);
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(
			oButton.$("img").attr("data-sap-ui-icon-content"),
			IconPool.getIconInfo("sap-icon://message-information").content,
			"icon is right"
		);

		// clean
		oButton.destroy();
	});

	QUnit.test("Icon is preferred over the type's implied icon", function() {
		// arrange
		var oButton = new Button({
			text: "button",
			icon: "sap-icon://message-information"
		});
		oButton.placeAt("qunit-fixture");

		// act
		oButton.setType(ButtonType.Negative);
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(oButton.getIcon(), "sap-icon://message-information", "the icon property is not touched");
		assert.equal(
			oButton.$("img").attr("data-sap-ui-icon-content"),
			IconPool.getIconInfo("sap-icon://message-information").content,
			"icon is preferred over the type's implied icon"
		);

		// act
		oButton.setIcon(null);
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(
			oButton.$("img").attr("data-sap-ui-icon-content"),
			IconPool.getIconInfo("sap-icon://message-error").content,
			"when icon is removed, type's implied icon is applied"
		);

		// clean
		oButton.destroy();
	});

	QUnit.test("Rendering of icons for Back/Up type", function (assert) {
		var oButton = new sap.m.Button({
			type: ButtonType.Back
		});

		oButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(oButton.$("iconBtn").length, "Default Back/Up icon is rendered");
		assert.notOk(oButton.$("img").length, "Explicit icon isn't rendered");

		oButton.setIcon("sap-icon://add");
		sap.ui.getCore().applyChanges();

		assert.ok(oButton.$("iconBtn").length, "Default Back/Up icon is still rendered");
		assert.ok(oButton.$("img").length, "Explicit icon is now rendered too");

		oButton.destroy();
	});

	QUnit.module("Tap Event Checking", {
		beforeEach : function() {
			b15 = sap.ui.getCore().byId("b15");
		},
		afterEach : function() {
			b15 = null;
		}
	});

	if (!sap.ui.Device.browser.msie) { // this test is needed only on non-IE browsers

		QUnit.test("Trigger TAP event in some cases missed by the core (for non-IE browsers only)", function(assert) {
			var spy = this.spy(b15, "ontap");

			// events needed
			var oEventDown = new Event("mousedown", {bubbles: true, cancelable: true});
			var oEventUp = new Event("mouseup", {bubbles: true, cancelable: true});

			var oBdiContent = document.getElementById("b15-BDI-content");
			var oContent = document.getElementById("b15-content");
			var oInner = document.getElementById("b15-inner");
			var oImg = document.getElementById("b15-img");

			// cases where we don't get tap, check if artificial tap is working

			if (oBdiContent) {
				// do the following 4 test only if <BDI> tag exists (in Edge it is missing)
				oBdiContent.dispatchEvent(oEventDown);
				oContent.dispatchEvent(oEventUp);
				assert.equal(spy.callCount, 1, "TAP on a button works from b15-BDI-content to b15-content");
				spy.reset();

				oBdiContent.dispatchEvent(oEventDown);
				oInner.dispatchEvent(oEventUp);
				assert.equal(spy.callCount, 1, "TAP on a button works from b15-BDI-content to b15-inner");
				spy.reset();

				oBdiContent.dispatchEvent(oEventDown);
				oImg.dispatchEvent(oEventUp);
				assert.equal(spy.callCount, 1, "TAP on a button works from b15-BDI-content to b15-img");
				spy.reset();

				oImg.dispatchEvent(oEventDown);
				oBdiContent.dispatchEvent(oEventUp);
				assert.equal(spy.callCount, 1, "TAP on a button works from b15-img to b15-BDI-content");
				spy.reset();
			}

			oContent.dispatchEvent(oEventDown);
			oInner.dispatchEvent(oEventUp);
			assert.equal(spy.callCount, 1, "TAP on a button works from b15-content to b15-inner");
			spy.reset();

			oContent.dispatchEvent(oEventDown);
			oImg.dispatchEvent(oEventUp);
			assert.equal(spy.callCount, 1, "TAP on a button works from b15-content to b15-img");
			spy.reset();

			oImg.dispatchEvent(oEventDown);
			oContent.dispatchEvent(oEventUp);
			assert.equal(spy.callCount, 1, "TAP on a button works from b15-img to b15-content");
			spy.reset();

			oImg.dispatchEvent(oEventDown);
			oInner.dispatchEvent(oEventUp);
			assert.equal(spy.callCount, 1, "TAP on a button works from b15-img to b15-inner");

		});
	}

	QUnit.module("Determining ACC type", {
		beforeEach: function () {
			this.oLabel = new Label({
				text: "Label"
			});

			this.oDescription = new Text({
				text: "Descriptive text"
			});

			this.oButton = new Button({
				icon: "sap-icon://add",
				text: "I am a button"
			});

			this.oLabel.placeAt("qunit-fixture");
			this.oDescription.placeAt("qunit-fixture");
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oLabel.destroy();
			this.oDescription.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Default", function (assert) {
		assert.strictEqual(this.oButton._determineAccessibilityType(), ButtonAccessibilityType.Default);
	});

	QUnit.test("Described (via association)", function (assert) {
		this.oButton.addAriaDescribedBy(this.oDescription);

		assert.strictEqual(this.oButton._determineAccessibilityType(), ButtonAccessibilityType.Described);
	});

	QUnit.test("Described (via semantic type)", function (assert) {
		this.oButton.setType(ButtonType.Emphasized);

		assert.strictEqual(this.oButton._determineAccessibilityType(), ButtonAccessibilityType.Described);
	});

	QUnit.test("Labelled (via association)", function (assert) {
		this.oButton.addAriaLabelledBy(this.oLabel);

		assert.strictEqual(this.oButton._determineAccessibilityType(), ButtonAccessibilityType.Labelled);
	});

	QUnit.test("Labelled (via labelFor)", function (assert) {
		this.oLabel.setLabelFor(this.oButton);

		assert.strictEqual(this.oButton._determineAccessibilityType(), ButtonAccessibilityType.Labelled);
	});

	QUnit.test("Combined (via associations)", function (assert) {
		this.oButton.addAriaLabelledBy(this.oLabel);
		this.oButton.addAriaDescribedBy(this.oDescription);

		assert.strictEqual(this.oButton._determineAccessibilityType(), ButtonAccessibilityType.Combined);
	});

	QUnit.test("Combined (via labelFor and association)", function (assert) {
		this.oLabel.setLabelFor(this.oButton);
		this.oButton.addAriaDescribedBy(this.oDescription);

		assert.strictEqual(this.oButton._determineAccessibilityType(), ButtonAccessibilityType.Combined);
	});

	QUnit.test("Combined (via association and semantic type)", function (assert) {
		this.oButton.addAriaLabelledBy(this.oLabel);
		this.oButton.setType(ButtonType.Emphasized);

		assert.strictEqual(this.oButton._determineAccessibilityType(), ButtonAccessibilityType.Combined);
	});

	QUnit.test("Combined (via labelFor and semantic type)", function (assert) {
		this.oLabel.setLabelFor(this.oButton);
		this.oButton.setType(ButtonType.Emphasized);

		assert.strictEqual(this.oButton._determineAccessibilityType(), ButtonAccessibilityType.Combined);
	});

	QUnit.module("Icon-only button ARIA", {
		beforeEach: function () {
			this.oLabel = new Label("label", {
				text: "Label"
			});

			this.oDescription = new Text("description", {
				text: "Descriptive text"
			});

			this.oButton = new Button("btn", {
				icon: "sap-icon://add"
			});

			this.oLabel.placeAt("qunit-fixture");
			this.oDescription.placeAt("qunit-fixture");
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oButtonDomRef = this.oButton.getDomRef();
		},
		afterEach: function() {
			this.oLabel.destroy();
			this.oDescription.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Default", function (assert) {
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-label"), "Add", "Tooltip is added in aria-label");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Add", "Tooltip is set");
	});

	QUnit.test("Described (via association)", function (assert) {
		this.oButton.addAriaDescribedBy(this.oDescription);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-label"), "Add", "Tooltip is added in aria-label");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Add", "Tooltip is set");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "description", "Only description is added in aria-describedby");
	});

	QUnit.test("Described (via semantic type)", function (assert) {
		var sTypeId = InvisibleText.getStaticId("sap.m", "BUTTON_ARIA_TYPE_EMPHASIZED");

		this.oButton.setType(ButtonType.Emphasized);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-label"), "Add", "Tooltip is added in aria-label");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Add", "Tooltip is set");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), sTypeId, "Only type is added in aria-describedby");
	});

	QUnit.test("Labelled (via association)", function (assert) {
		this.oButton.addAriaLabelledBy(this.oLabel);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label", "Label is added");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Add", "Tooltip is set");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "btn-tooltip", "Tooltip is added in aria-describedby");
	});

	QUnit.test("Labelled (via labelFor)", function (assert) {
		this.oLabel.setLabelFor(this.oButton);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label", "Label is added");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Add", "Tooltip is set");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "btn-tooltip", "Tooltip is added in aria-describedby");
	});

	QUnit.test("Combined (via associations)", function (assert) {
		this.oButton.addAriaLabelledBy(this.oLabel);
		this.oButton.addAriaDescribedBy(this.oDescription);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label", "Label is added");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Add", "Tooltip is set");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "description btn-tooltip", "Both description and tooltip are added in aria-describedby");
	});

	QUnit.test("Combined (via labelFor and association)", function (assert) {
		this.oLabel.setLabelFor(this.oButton);
		this.oButton.addAriaDescribedBy(this.oDescription);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label", "Label is added");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Add", "Tooltip is set");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "description btn-tooltip", "Both description and tooltip are added in aria-describedby");
	});

	QUnit.test("Combined (via association and semantic type)", function (assert) {
		var sTypeId = InvisibleText.getStaticId("sap.m", "BUTTON_ARIA_TYPE_EMPHASIZED");

		this.oButton.addAriaLabelledBy(this.oLabel);
		this.oButton.setType(ButtonType.Emphasized);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label", "Label is added");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Add", "Tooltip is set");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "btn-tooltip " + sTypeId, "Both tooltip and type are added in aria-describedby");
	});

	QUnit.test("Combined (via labelFor and semantic type)", function (assert) {
		var sTypeId = InvisibleText.getStaticId("sap.m", "BUTTON_ARIA_TYPE_EMPHASIZED");

		this.oLabel.setLabelFor(this.oButton);
		this.oButton.setType(ButtonType.Emphasized);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label", "Label is added");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Add", "Tooltip is set");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "btn-tooltip " + sTypeId, "Both tooltip and type are added in aria-describedby");
	});

	QUnit.module("Text button w/ tooltip ARIA", {
		beforeEach: function () {
			this.oLabel = new Label("label", {
				text: "Label"
			});

			this.oDescription = new Text("description", {
				text: "Descriptive text"
			});

			this.oButton = new Button("btn", {
				text: "I am a button",
				tooltip: "Tooltip"
			});

			this.oLabel.placeAt("qunit-fixture");
			this.oDescription.placeAt("qunit-fixture");
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oButtonDomRef = this.oButton.getDomRef();
		},
		afterEach: function() {
			this.oLabel.destroy();
			this.oDescription.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Default", function (assert) {
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "btn-tooltip", "Tooltip is added in aria-describedby");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Tooltip", "Tooltip is set");
	});

	QUnit.test("Descriptive (via association)", function (assert) {
		this.oButton.addAriaDescribedBy(this.oDescription);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "description btn-tooltip", "Both description and tooltip are added in aria-describedby");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Tooltip", "Tooltip is set");
	});

	QUnit.test("Described (via semantic type)", function (assert) {
		var sTypeId = InvisibleText.getStaticId("sap.m", "BUTTON_ARIA_TYPE_EMPHASIZED");

		this.oButton.setType(ButtonType.Emphasized);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "btn-tooltip " + sTypeId, "Both tooltip and type are added in aria-describedby");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Tooltip", "Tooltip is set");
	});

	QUnit.test("Labelled (via association)", function (assert) {
		this.oButton.addAriaLabelledBy(this.oLabel);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label btn-content", "Self-reference is added in addition to the label");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Tooltip", "Tooltip is set");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "btn-tooltip", "Tooltip is added in aria-describedby");
	});

	QUnit.test("Labelled (via labelFor)", function (assert) {
		this.oLabel.setLabelFor(this.oButton);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label btn-content", "Self-reference is added in addition to the label");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Tooltip", "Tooltip is set");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "btn-tooltip", "Tooltip is added in aria-describedby");
	});

	QUnit.test("Combined (via associations)", function (assert) {
		this.oButton.addAriaLabelledBy(this.oLabel);
		this.oButton.addAriaDescribedBy(this.oDescription);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label btn-content", "Self-reference is added in addition to the label");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Tooltip", "Tooltip is set");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "description btn-tooltip", "Both description and tooltip are added in aria-describedby");
	});

	QUnit.test("Combined (via labelFor and association)", function (assert) {
		this.oLabel.setLabelFor(this.oButton);
		this.oButton.addAriaDescribedBy(this.oDescription);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label btn-content", "Self-reference is added in addition to the label");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Tooltip", "Tooltip is set");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "description btn-tooltip", "Both description and tooltip are added in aria-describedby");
	});

	QUnit.test("Combined (via association and semantic type)", function (assert) {
		var sTypeId = InvisibleText.getStaticId("sap.m", "BUTTON_ARIA_TYPE_EMPHASIZED");

		this.oButton.addAriaLabelledBy(this.oLabel);
		this.oButton.setType(ButtonType.Emphasized);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label btn-content", "Self-reference is added in addition to the label");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Tooltip", "Tooltip is set");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "btn-tooltip " + sTypeId, "Both tooltip and type are added in aria-describedby");
	});

	QUnit.test("Combined (via labelFor and semantic type)", function (assert) {
		var sTypeId = InvisibleText.getStaticId("sap.m", "BUTTON_ARIA_TYPE_EMPHASIZED");

		this.oLabel.setLabelFor(this.oButton);
		this.oButton.setType(ButtonType.Emphasized);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label btn-content", "Self-reference is added in addition to the label");
		assert.strictEqual(this.oButtonDomRef.getAttribute("title"), "Tooltip", "Tooltip is set");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "btn-tooltip " + sTypeId, "Both tooltip and type are added in aria-describedby");
	});

	QUnit.module("Text button w/o tooltip ARIA", {
		beforeEach: function () {
			this.oLabel = new Label("label", {
				text: "Label"
			});

			this.oDescription = new Text("description", {
				text: "Descriptive text"
			});

			this.oButton = new Button("btn", {
				text: "I am a button"
			});

			this.oLabel.placeAt("qunit-fixture");
			this.oDescription.placeAt("qunit-fixture");
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oButtonDomRef = this.oButton.getDomRef();
		},
		afterEach: function() {
			this.oLabel.destroy();
			this.oDescription.destroy();
			this.oButton.destroy();
		}
	});

	// Nothing to assert for the Default case...

	QUnit.test("Descriptive (via association)", function (assert) {
		this.oButton.addAriaDescribedBy(this.oDescription);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "description", "Description is added");
	});

	QUnit.test("Described (via semantic type)", function (assert) {
		var sTypeId = InvisibleText.getStaticId("sap.m", "BUTTON_ARIA_TYPE_EMPHASIZED");

		this.oButton.setType(ButtonType.Emphasized);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), sTypeId, "Type is added");
	});

	QUnit.test("Labelled (via association)", function (assert) {
		this.oButton.addAriaLabelledBy(this.oLabel);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label btn-content", "Self-reference is added in addition to the label");
	});

	QUnit.test("Labelled (via labelFor)", function (assert) {
		this.oLabel.setLabelFor(this.oButton);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label btn-content", "Self-reference is added in addition to the label");
	});

	QUnit.test("Combined (via associations)", function (assert) {
		this.oButton.addAriaLabelledBy(this.oLabel);
		this.oButton.addAriaDescribedBy(this.oDescription);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label btn-content", "Self-reference is added in addition to the label");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "description", "Description is added");
	});

	QUnit.test("Combined (via labelFor and association)", function (assert) {
		this.oLabel.setLabelFor(this.oButton);
		this.oButton.addAriaDescribedBy(this.oDescription);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label btn-content", "Self-reference is added in addition to the label");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), "description", "Description is added");
	});

	QUnit.test("Combined (via association and semantic type)", function (assert) {
		var sTypeId = InvisibleText.getStaticId("sap.m", "BUTTON_ARIA_TYPE_EMPHASIZED");

		this.oButton.addAriaLabelledBy(this.oLabel);
		this.oButton.setType(ButtonType.Emphasized);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label btn-content", "Self-reference is added in addition to the label");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), sTypeId, "Type is added");
	});

	QUnit.test("Combined (via labelFor and semantic type)", function (assert) {
		var sTypeId = InvisibleText.getStaticId("sap.m", "BUTTON_ARIA_TYPE_EMPHASIZED");

		this.oLabel.setLabelFor(this.oButton);
		this.oButton.setType(ButtonType.Emphasized);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-labelledby"), "label btn-content", "Self-reference is added in addition to the label");
		assert.strictEqual(this.oButtonDomRef.getAttribute("aria-describedby"), sTypeId, "Type is added");
	});

	QUnit.module("General ARIA");

	QUnit.test("Default tooltip for Back/Up type", function (assert) {
		var oButton = new Button({
				type: ButtonType.Back
			}),
			sTooltip = oButton._getTooltip();

		oButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(sTooltip, "Button knows that a default tooltip needs to be generated");
		assert.strictEqual(oButton.$().attr("title"), sTooltip, "That tooltip is added in the DOM");

		oButton.destroy();
	});

	QUnit.test("Appearance of the aria-haspopup attribute", function (assert) {
		var oButton = new Button("btn", {
				text: "I am a button"
			}),
			AriaHasPopup = coreLibrary.aria.HasPopup,
			oButtonDomRef;

		// setup
		oButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		oButtonDomRef = oButton.getDomRef();

		// check initial aria-haspopup state
		assert.notOk(oButtonDomRef.getAttribute("aria-haspopup"), "There is no aria-haspopup attribute initially.");

		// act
		oButton.setAriaHasPopup(AriaHasPopup.Menu);
		sap.ui.getCore().applyChanges();

		// check if aria-haspopup appears
		assert.equal(oButtonDomRef.getAttribute("aria-haspopup"), AriaHasPopup.Menu.toLowerCase(), "There is aria-haspopup attribute with proper value after the button property is being set to something different than None.");

		// act
		oButton.setAriaHasPopup(AriaHasPopup.None);
		sap.ui.getCore().applyChanges();

		// check if aria-haspopup disappears
		assert.notOk(oButtonDomRef.getAttribute("aria-haspopup"), "There is no aria-haspopup attribute after the button property is being set to None.");

		// cleanup
		oButton.destroy();
	});

	QUnit.module("Badge on Button", {
		beforeEach: function () {
			this.oButton = new Button("badgedButton", {
				icon: "sap-icon://home",
				text: "I have a badge!",
				customData: [
					new sap.m.BadgeCustomData({
						key: "badge",
						value: "3",
						visible: true
					})
				]
			});

			this.oButton.placeAt("qunit-fixture");
			this.oBadgeData = this.oButton.getBadgeCustomData();
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oButton.destroy();
		}
	});

	QUnit.test("Check badge visibility and value", function (assert) {
		var $oBadgeIndicator = this.oButton.$().find(".sapMBadgeIndicator").first();

		// check for badge visibility and value
		assert.equal($oBadgeIndicator.hasClass(	"sapMBadgeAnimationAdd"), true, "Badge Indicator DOM element exists and is visible");
		assert.equal($oBadgeIndicator.attr("data-badge"), this.oBadgeData.getValue(), "Badge value is correct");

		// change badge value
		this.oBadgeData.setValue("6");
		sap.ui.getCore().applyChanges();

		// check for new badge value
		assert.equal($oBadgeIndicator.attr("data-badge"), this.oBadgeData.getValue(), "Badge value is correct after the change");

		// hide badge
		this.oBadgeData.setVisible(false);

		// check for badge visibility
		assert.equal(this.oButton.$().find(".sapMBadgeIndicator").hasClass("sapMBadgeAnimationRemove"), true, "Badge Indicator DOM element exists and is hidden");
	});

	QUnit.test("Check badge aria-describedby and invisible text", function (assert) {
		var oBadgeInvisibleText = this.oButton._getBadgeInvisibleText();

		// check invisible text
		assert.ok(oBadgeInvisibleText, "Invisible text for badge exists");
		// check if aria-describedby contains invisible text id
		assert.ok(this.oButton.$().attr("aria-describedby").indexOf(oBadgeInvisibleText.getId()) !== -1,
				  "When the Badge is visible, aria-describedby attribute of the button contains invisible text id");

		// hide badge
		this.oBadgeData.setVisible(false);
		sap.ui.getCore().applyChanges();

		// check if aria-describedby contains invisible text id
		assert.equal(this.oButton._getBadgeInvisibleText().getText(), "",
				  "When the Badge is not visible, aria-describedby attribute of the button and invisible text are empty");
	});

	QUnit.test("Badge value range", function (assert) {
		//Arrange
		var $oBadgeIndicator = this.oButton.$().find(".sapMBadgeIndicator").first();

		//Act
		this.oBadgeData.setValue("10000");
		//Assert
		assert.equal($oBadgeIndicator.attr("data-badge"), "999+", "Badge value maximum range is correctly taken from the default value");


		//Act
		this.oBadgeData.setValue("0");
		//Assert
		assert.equal($oBadgeIndicator.hasClass("sapMBadgeAnimationRemove"), true, "Badge value minimum range is correctly taken from the default value");

		//Arrange
		this.oButton.setBadgeMinValue(3).setBadgeMaxValue(5);
		sap.ui.getCore().applyChanges();
		$oBadgeIndicator = this.oButton.$().find(".sapMBadgeIndicator");

		//Act
		this.oBadgeData.setValue("2");
		//Assert
		assert.equal($oBadgeIndicator.length, 0, "Badge is not drawn, because validation of the value fails");

		//Act
		this.oBadgeData.setValue("6");

		//Assert
		$oBadgeIndicator = this.oButton.$().find(".sapMBadgeIndicator").first();
		assert.equal($oBadgeIndicator.attr("data-badge"), "5+", "Badge value maximum range is correctly taken from updated value");
	});


});