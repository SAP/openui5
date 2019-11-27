/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/RadioButton",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/events/jquery/EventExtension",
	"sap/ui/util/Mobile",
	"sap/m/Label",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/message/Message"
], function(
	qutils,
	createAndAppendDiv,
	RadioButton,
	coreLibrary,
	KeyCodes,
	EventExtension,
	Mobile,
	Label,
	JSONModel,
	Message
) {
	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.message.MessageType
	var MessageType = coreLibrary.MessageType;


	createAndAppendDiv("content");



	Mobile.init();

	QUnit.module("Rendering");


	/* ------------------------------ */
	/* 		tests initial Check       */
	/* ------------------------------ */


	QUnit.test("Initial Check", function(assert) {

		// arrange
		var oRadioButton1 = new RadioButton();
		oRadioButton1.placeAt("qunit-fixture");
		var oRadioButton2 = new RadioButton({
			visible:false
		});
		oRadioButton2.placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		// assertions
		assert.ok(oRadioButton1.$().hasClass('sapMRb'), true);
		assert.equal(oRadioButton2.$().hasClass('sapMRb'), false, 'The button should not have class sapMRb');

		// cleanup
		oRadioButton1.destroy();
		oRadioButton2.destroy();
	});

	/* ------------------------------ */
	/* 		Group Check     		  */
	/* ------------------------------ */

	QUnit.test("Button Group", function(assert) {

		// arrange
		var oRadioButton1 = new RadioButton({
			groupName:"Gruppe1"
		});
		oRadioButton1.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.equal(oRadioButton1.$("RB").attr("name"), 'Gruppe1', "Group name should be Gruppe1");

		// cleanup
		oRadioButton1.destroy();

	});

	QUnit.test("Radio Button style", function(assert) {

		// arrange
		var oDisabledRadioButton  = new RadioButton({
			enabled:false
		});
		oDisabledRadioButton.placeAt("qunit-fixture");
		var oEnabledRadioButton = new RadioButton({
			enabled:true
		});
		oEnabledRadioButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.equal(oDisabledRadioButton.$().hasClass('sapMRbDis'), true, 'The button should have class sapMRbDis');
		assert.equal(oEnabledRadioButton.$().hasClass('sapMRbDis'), false, 'The button should not have class sapMRbDis');

		// cleanup
		oDisabledRadioButton.destroy();
		oEnabledRadioButton.destroy();

	});

	QUnit.test("Radio Button with empty string value", function(assert) {

		// arrange
		var oRadioButton = new RadioButton({
			text: "Text"
		});
		oRadioButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oRadioButton.setText("");

		// assertions
		assert.equal(oRadioButton.$().hasClass('sapMRbHasLabel'), false, 'The button should not have class sapMRbDis');

		// cleanup
		oRadioButton.destroy();
	});

	QUnit.test("Rendering in Form: getFormDoNotAdjustWidth", function(assert) {
		var oRBWithoutLabel = new RadioButton(),
			oRBWithLabel = new RadioButton({text: "Label value"});

		assert.equal(oRBWithoutLabel.getFormDoNotAdjustWidth(), true, 'The radiobutton width will not be overwritten in form, when it does not have a label');
		assert.equal(oRBWithLabel.getFormDoNotAdjustWidth(), false, 'The radiobutton width will be set to 100% by forms, when it does have a label');

		oRBWithoutLabel.destroy();
		oRBWithLabel.destroy();
	});


	QUnit.module("Private properties");

	QUnit.test("editableParent should add aria attributes", function (assert) {
		// arrange and act
		var oRadioButton = new RadioButton();
		oRadioButton._setEditableParent(false);

		oRadioButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(!oRadioButton.getDomRef().getAttribute("aria-readonly"), "Readonly should not be present");
		assert.ok(oRadioButton.getDomRef().getAttribute("aria-disabled"), "Disabled should be set to true");

		// cleanup
		oRadioButton.destroy();
	});

	/* =========================================================== */
	/* API module                                                  */
	/* =========================================================== */

	QUnit.module("API");

	/* ------------------------------ */
	/* tests for default values       */
	/* ------------------------------ */

	QUnit.test("default values", function(assert) {

		// arrange
		var oRadioButton = new RadioButton();

		// assertions
		assert.strictEqual(oRadioButton.getGroupName(), "sapMRbDefaultGroup", 'Default name is sapMRbDefaultGroup');
		assert.strictEqual(oRadioButton.getVisible(), true, "By default the RadioButton control is visible");
		assert.strictEqual(oRadioButton.getEnabled(), true, "By default the RadioButton control is enabled");
		assert.strictEqual(oRadioButton.getEditable(), true, "By default the RadioButton control is editable");
		assert.strictEqual(oRadioButton.getWidth(), "", 'By default the "width" of the RadioButton control is ""');
		assert.strictEqual(oRadioButton.getSelected(), false, 'By default the RadioButton control is not selected');
		assert.strictEqual(oRadioButton.getText(), "", 'By default the RadioButton control text is ""');
		assert.strictEqual(oRadioButton.getTextDirection(), "Inherit", 'By default the RadioButton control text direction is Inherit');

		// cleanup
		oRadioButton.destroy();
	});


	/* ------------------------------ */
	/* 	   tests for setSelected()    */
	/* ------------------------------ */

	QUnit.test("setSelected()", function(assert) {

		// arrange
		var oRadioButton1 = new RadioButton({
			selected: false
		});
		oRadioButton1.placeAt("qunit-fixture");
		var oRadioButton2 = new RadioButton({
			selected: true
		});
		oRadioButton2.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.equal(oRadioButton1.getSelected(),false, "The Radio Button should not be selected");
		assert.equal(oRadioButton2.getSelected(),true, "The Radio Button should be selected");
		assert.equal(oRadioButton2.$('RB').attr('checked'), 'checked', "The Radio Button should be selected");
		assert.equal(oRadioButton1.$("RB").attr('checked'), null, "The Radio Button should not be selected");
		assert.ok(!(oRadioButton1.$().hasClass("sapMRbSel")), "Radio Button should not have class 'sapMRbSel'");
		assert.ok(oRadioButton2.$().hasClass("sapMRbSel"), "Radio Button should have class 'sapMRbSel'");

		// cleanup
		oRadioButton1.destroy();
		oRadioButton2.destroy();
	});

	QUnit.test("setSelected after rendering with null value passed", function(assert) {
		var oRadioButton = new RadioButton();

		oRadioButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oRadioButton.setSelected(null);

		assert.strictEqual(oRadioButton.getSelected(), false, "RadioButton should not be selected");
		assert.strictEqual(oRadioButton.$().hasClass("sapMRbSel"), false, "RadioButton should not have Selected class");

		oRadioButton.destroy();
	});

	QUnit.test("Triggering tap should check RadioButton and uncheck all other RadioButtons from the same group", function (assert) {
		assert.expect(5);

		// arrange
		var oRadioButton1 = new RadioButton({ selected: true }),
			oRadioButton2 = new RadioButton(),
			oRadioButton3 = new RadioButton(),
			oRadioButton4 = new RadioButton({ selected: true, groupName: "Other" }),
			oRadioButton5 = new RadioButton({ groupName: "Other" });

		oRadioButton1.placeAt("content");
		oRadioButton2.placeAt("content");
		oRadioButton3.placeAt("content");
		oRadioButton4.placeAt("content");
		oRadioButton5.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerEvent("tap", oRadioButton2.getId());

		// assertions
		assert.ok(!oRadioButton1.getSelected(), "RadioButton1 from default group name should not be selected after tap on second button from the group");
		assert.ok(!oRadioButton3.getSelected(), "RadioButton1 from default group name should not be selected after tap on second button from the group");
		assert.ok(oRadioButton2.getSelected(), "RadioButton1 from default group name should not be selected after tap on second button from the group");
		assert.ok(oRadioButton4.getSelected(), "RadioButton4 should not be changed because it is in another group");
		assert.ok(!oRadioButton5.getSelected(), "RadioButton1 from default group name should not be selected after tap on second button from the group");

		// cleanup
		oRadioButton1.destroy();
		oRadioButton2.destroy();
		oRadioButton3.destroy();
		oRadioButton4.destroy();
		oRadioButton5.destroy();
	});

	QUnit.test("setSelected should check RadioButton and uncheck all other RadioButtons from the same group", function (assert) {

		// arrange
		var oRadioButton1 = new RadioButton(),
			oRadioButton2 = new RadioButton();

		oRadioButton1.placeAt("qunit-fixture");
		oRadioButton2.placeAt("qunit-fixture");

		// act
		oRadioButton1.setSelected(true);
		oRadioButton2.setSelected(true);

		// assert
		assert.ok(!oRadioButton1.getSelected(), "RadioButton should not be selected");
		assert.ok(oRadioButton2.getSelected(), "RadioButton should be selected");

		// cleanup
		oRadioButton1.destroy();
		oRadioButton2.destroy();
	});

	/* ------------------------------ */
	/* 		tests for setText()       */
	/* ------------------------------ */

	QUnit.test("setText()", function(assert) {

		// arrange
		var oRadioButton1 = new RadioButton({
			text: 'Foo'
		});
		oRadioButton1.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oRadioButton1.getText(), 'Foo', "The Radion Button should have text 'Foo' ");
		assert.strictEqual(oRadioButton1.$('label').text(), 'Foo', "The Radio Button should have text 'Foo'");

		// cleanup
		oRadioButton1.destroy();
	});

	QUnit.test("setText() change text of the RadioButton after it's initialization", function (assert) {
		assert.expect(2);

		// arrange
		var oRadioButton1 = new RadioButton({
			text: 'Foo'
		});
		oRadioButton1.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oRadioButton1.setText("Bar");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oRadioButton1.getText(), 'Bar', "The Radion Button should have text 'Bar'");
		assert.strictEqual(oRadioButton1.$('label').text(), 'Bar', "The Radio Button Label should have text 'Bar'");

		// cleanup
		oRadioButton1.destroy();
	});

	/* ------------------------------ */
	/* 		tests for setWidth()       */
	/* ------------------------------ */

	QUnit.test("setWidth()", function(assert) {

		// arrange
		var oRadioButton1 = new RadioButton({
			width:'10px'
		});
		oRadioButton1.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oRadioButton1.getWidth(), '10px', 'The width of the Radio Button should be 10px');

		// cleanup
		oRadioButton1.destroy();
	});

	QUnit.test("setWidth() && setEntireWidth()", function(assert) {

		// arrange
		var oRadioButton1 = new RadioButton({
			width:'50px',
			useEntireWidth: true
		});
		oRadioButton1.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oRadioButton1.$().width(), 50, "Width of both RadioButton and Lable should be 50");

		// cleanup
		oRadioButton1.destroy();
	});

	/* ------------------------------ */
	/*  tests for setTextDirection()  */
	/* ------------------------------ */

	QUnit.test("setTextDirection()", function(assert) {

		// arrange
		var oRadioButton1 = new RadioButton({
			textDirection: "LTR"
		});
		oRadioButton1.placeAt("qunit-fixture");
		var oRadioButton2 = new RadioButton({
			textDirection: "RTL"
		});
		oRadioButton2.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oRadioButton1.$('label').css('direction'),'ltr','The text is with left ro right direction');
		assert.strictEqual(oRadioButton2.getTextDirection(), 'RTL', 'The Text Direction should be right to left');
		assert.equal(oRadioButton2.$('label').css('direction'), 'rtl', 'The Text Direction should be rtl');

		// cleanup
		oRadioButton1.destroy();
		oRadioButton2.destroy();
	});

	QUnit.test("setTabIndex()", function (assert) {
		assert.expect(1);

		// arrange
		var iTabIndex = 1,
			oRadioButton1 = new RadioButton();
		oRadioButton1.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oRadioButton1.setTabIndex(iTabIndex);

		// assertions
		assert.equal(parseInt(oRadioButton1.getFocusDomRef().getAttribute("tabindex")), iTabIndex, "RadioButton's tabindex should be set to 1");

		// cleanup
		oRadioButton1.destroy();
	});

	QUnit.test("setTooltip()", function (assert) {
		assert.expect(2);

		// arrange
		var sTooltip = "Tooltip Text",
			oRadioButton1 = new RadioButton({
				tooltip: sTooltip
			});
			oRadioButton1.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oRadioButton1.$().attr("title"), sTooltip, "Tooltip title attribute is set");
		assert.strictEqual(oRadioButton1.getTooltip(), sTooltip, "Tooltip text is set");

		// cleanup
		oRadioButton1.destroy();
	});

	QUnit.test("setTextAlign()", function (assert) {

		// arrange
		var oRadioButton1 = new RadioButton({
			textAlign: TextAlign.Right
		});

		oRadioButton1.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.ok(oRadioButton1.$('label'), 'Label should be created');
		assert.strictEqual(oRadioButton1.$('label').css('text-align'), "right", "The align of the RadioButton's label should be right");

		// cleanup
		oRadioButton1.destroy();
	});

	QUnit.test("textAlign and RTL", function (assert) {

		// arrange
		var oRadioButton1 = new RadioButton({
			textAlign: TextAlign.End,
			textDirection: TextDirection.RTL
		});

		oRadioButton1.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oRadioButton1.$("label").css("text-align"), "left", "Text Align should be left");

		// cleanup
		oRadioButton1.destroy();
	});

	QUnit.test("setGroupName", function (assert) {

		// arrange
		var oRadioButton1 = new RadioButton();
		var oRadioButton2 = new RadioButton();
		var oRadioButton3 = new RadioButton();

		oRadioButton1.placeAt("qunit-fixture");
		oRadioButton2.placeAt("qunit-fixture");
		oRadioButton3.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oRadioButton1.setGroupName("test");

		// act
		sap.ui.test.qunit.triggerKeydown(oRadioButton1.getDomRef(), KeyCodes.ENTER);
		sap.ui.test.qunit.triggerKeydown(oRadioButton2.getDomRef(), KeyCodes.ENTER);
		sap.ui.test.qunit.triggerKeydown(oRadioButton3.getDomRef(), KeyCodes.ENTER);

		// assert
		assert.strictEqual(oRadioButton1.getSelected(), true, "RadioButton1 should be selected");
		assert.strictEqual(oRadioButton2.getSelected(), false, "RadioButton2 should not be selected");
		assert.strictEqual(oRadioButton3.getSelected(), true, "RadioButton3 should be selected");

		// cleanup
		oRadioButton1.destroy();
		oRadioButton2.destroy();
		oRadioButton3.destroy();
	});

	/* ------------------------------ */
	/*          tests label           */
	/* ------------------------------ */

	QUnit.test("Label", function(assert) {

		// arrange
		var _sLabelText = 'foobar';
		var oRadioButton1 = new RadioButton({text: _sLabelText, width: '20px' });
		oRadioButton1.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.equal(oRadioButton1.$('label').css('width'), '20px', "Label width should be 20px");
		assert.equal(oRadioButton1.$('label').hasClass('sapMRbBLabel'), true, 'The class sapMRbBLabel should be set to the label');
		assert.strictEqual(oRadioButton1.$('label').text(), _sLabelText, "Label text should be " + _sLabelText);

		// cleanup
		oRadioButton1.destroy();
	});

	QUnit.test("Destroying a RadioButton should not leak", function (assert) {
		var oRadioButton1 = new RadioButton({
			groupName: "group1"
		});

		oRadioButton1.destroy();
		this.clock.tick(1);

		assert.strictEqual(oRadioButton1._groupNames["group1"].length, 0, "RB instance should be removed from the group");
	});

	QUnit.module("Focus Handling");

	QUnit.test("Should get the correct focus domref", function(assert) {

		// arrange
		var oRadioButton = new RadioButton();
		oRadioButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		var oFocusDomRef = oRadioButton.getFocusDomRef();

		// assertions
		assert.strictEqual(oFocusDomRef, oRadioButton.getDomRef(), "The focus domref was the control wrapper");

		// cleanup
		oRadioButton.destroy();
	});

	QUnit.test("Should apply the focus Info", function(assert) {

		// arrange
		var oRadioButton = new RadioButton();
		oRadioButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oRadioButton.applyFocusInfo();

		// assertions
		assert.ok(oRadioButton.$().is(":focus"), "The focus was set on the button wrapper");

		// cleanup
		oRadioButton.destroy();
	});

	QUnit.test("Should handle a tap event", function(assert) {

		// arrange
		var oSelectSpy = this.spy();
		var oRadioButton = new RadioButton();
		oRadioButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oRadioButton.attachSelect(oSelectSpy);
		oRadioButton.ontap(new jQuery.Event());

		// assertions
		assert.strictEqual(oSelectSpy.callCount, 0, "The select event was not fired yet");
		assert.ok(oRadioButton.$().is(":focus"), "The focus was set on the button wrapper");
		assert.ok(oRadioButton.getSelected(), "The radio button was selected");

		//trigger timeout
		this.clock.tick(1);

		// assert
		assert.strictEqual(oSelectSpy.callCount, 1, "The select event was not fired after 0 ms");

		// cleanup
		oRadioButton.destroy();
	});

	QUnit.test("Not editable radio button does not select/deselect on tap", function(assert) {

		// system under test
		var oRadioButton = new RadioButton({editable : false});
		var oSpy = this.spy();
		oRadioButton.attachSelect(oSpy);

		// arrange
		oRadioButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oRadioButton.$().attr("tabindex"), "0" , "'getTabindex' should return 0");
		qutils.triggerEvent("tap", oRadioButton.getId());
		assert.ok(oSpy.notCalled, "Event 'select' should not have been fired");
		assert.equal(oRadioButton.getSelected(), false, "Radio button should not be selected");

		// cleanup
		oRadioButton.destroy();
	});

	QUnit.test("Should keep the focus when rerendering in tap event", function(assert) {

		// arrange
		var oRadioButton = new RadioButton();
		oRadioButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		oRadioButton.attachSelect(function () {
			oRadioButton.rerender();
			sap.ui.getCore().applyChanges();

			// assertions
			assert.ok(oRadioButton.$().is(":focus"), "The focus was set on the button wrapper");

			// cleanup
			oRadioButton.destroy();
		});

		// act
		oRadioButton.ontap(new jQuery.Event());

		// trigger timeout
		this.clock.tick(1);
	});

	QUnit.test("Should have class sapMRbBTouched when touchstart event is fired", function (assert) {
		assert.expect(1);

		// arrange
		var oRadioButton1 = new RadioButton();
		oRadioButton1.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oRadioButton1.getDomRef());

		// assertions
		assert.ok(oRadioButton1.$().hasClass("sapMRbBTouched"), "RadioButton should have class sapMRbBTouched");

		// cleanup
		oRadioButton1.destroy();
	});

	QUnit.test("Should remove class sapMRbBTouched when touchend event is fired", function (assert) {
		assert.expect(2);

		// arrange
		var oRadioButton1 = new RadioButton();
		oRadioButton1.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		sap.ui.test.qunit.triggerTouchEvent("touchstart", oRadioButton1.getDomRef());

		// assertions
		assert.ok(oRadioButton1.$().hasClass("sapMRbBTouched"), "RadioButton should have class sapMRbBTouched");

		// act
		sap.ui.test.qunit.triggerTouchEvent("touchend", oRadioButton1.getDomRef());

		// assertions
		assert.ok(!oRadioButton1.$().hasClass("sapMRbBTouched"), "RadioButton should not have class sapMRbBTouched");

		// cleanup
		oRadioButton1.destroy();
	});

	QUnit.module("Keyboard handling");

	function checkKeyboardEventhandling(sTestName, oOptions) {
		QUnit.test(sTestName, function(assert) {
			// arrange
			var oRadioButton1 = new RadioButton();

			oRadioButton1.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// act
			var fnFireSelectSpy = this.spy(oRadioButton1, "fireSelect");
			sap.ui.test.qunit.triggerKeydown(oRadioButton1.getDomRef(), oOptions.keyCode);
			this.clock.tick(1);

			// assertions
			assert.strictEqual(fnFireSelectSpy.callCount, 1, "Event should be fired once");

			// act
			sap.ui.test.qunit.triggerKeydown(oRadioButton1.getDomRef(), oOptions.keyCode);
			this.clock.tick(1);

			// assertions
			assert.strictEqual(fnFireSelectSpy.callCount, 1, "Event should be fired once");


			// cleanup
			oRadioButton1.destroy();

		});
	}

	checkKeyboardEventhandling("Firing ENTER event", {
		keyCode : KeyCodes.ENTER
	});

	checkKeyboardEventhandling("Firing SPACE event", {
		keyCode : KeyCodes.SPACE
	});

	QUnit.module("Event testing", {
		testArrowNavigation: function (oRadioButtonSettings, iKeyCode, oAssert) {
			var oRadioButton1 = new RadioButton(oRadioButtonSettings),
				oRadioButton2 = new RadioButton(oRadioButtonSettings),
				oFireSelectSpy = this.spy(oRadioButton2, "fireSelect");

			oRadioButton1.placeAt("qunit-fixture");
			oRadioButton2.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			oRadioButton1.applyFocusInfo();
			sap.ui.test.qunit.triggerKeydown(oRadioButton1.getDomRef(), iKeyCode);
			this.clock.tick(100);

			oAssert.strictEqual(oFireSelectSpy.callCount, 0, "Button 2 should not be selected");

			oRadioButton1.destroy();
			oRadioButton2.destroy();
		}
	});

	QUnit.test("Event should not be fired when buttons are not editable", function(assert) {
		this.testArrowNavigation({ editable: false }, KeyCodes.ARROW_RIGHT, assert);
	});

	QUnit.test("Event should not be fired when buttons are not enabled", function(assert) {
		this.testArrowNavigation({ editable: false }, KeyCodes.ARROW_RIGHT, assert);
	});

	QUnit.test("Radio Button Select Event", function(assert) {

		// arrange
		var oRadioButton1 = new RadioButton({selected:false, groupName:"Group1"});
		var oRadioButton2 = new RadioButton({selected:true, groupName:"Group2"});

		oRadioButton1.placeAt("qunit-fixture");
		oRadioButton2.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// act
		var fnFireSelectSpy1 = this.spy(oRadioButton1, "fireSelect");
		var fnFireSelectSpy2 = this.spy(oRadioButton2, "fireSelect");
		sap.ui.test.qunit.triggerKeydown(oRadioButton1.getDomRef(), KeyCodes.ENTER);
		sap.ui.test.qunit.triggerKeydown(oRadioButton2.getDomRef(), KeyCodes.ENTER);
		this.clock.tick(1);

		// assertions
		assert.strictEqual(fnFireSelectSpy1.callCount, 1, "Event should be fired once");
		assert.strictEqual(fnFireSelectSpy2.callCount, 0, "Event should not be fired, button is already checked");

		// cleanup
		oRadioButton1.destroy();
		oRadioButton2.destroy();
	});

	QUnit.test("Keybaord navigation with forward arrows", function (assert) {
		var oRadioButton1 = new RadioButton({selected: true}),
			oRadioButton2 = new RadioButton({groupName: "testGroup"}),
			oRadioButton3 = new RadioButton(),
			oFireSelectSpy1 = this.spy(oRadioButton1, "fireSelect"),
			oFireSelectSpy2 = this.spy(oRadioButton3, "fireSelect");

		oRadioButton1.placeAt("qunit-fixture");
		oRadioButton2.placeAt("qunit-fixture");
		oRadioButton3.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oRadioButton1.applyFocusInfo();
		sap.ui.test.qunit.triggerKeydown(oRadioButton1.getDomRef(), KeyCodes.ARROW_RIGHT);
		this.clock.tick(100);

		assert.strictEqual(oRadioButton3.$().is(":focus"), true, "3rd RadioButton should be focussed");

		assert.ok(oFireSelectSpy1.calledBefore(oFireSelectSpy2), "Unselect is called before select");
		assert.strictEqual(oFireSelectSpy2.callCount, 1, "Button 3 fires selected=true event");
		assert.strictEqual(oFireSelectSpy1.callCount, 1, "Button 1 fires selected=false (unselect) event");


		oRadioButton1.destroy();
		oRadioButton2.destroy();
		oRadioButton3.destroy();
	});

	QUnit.test("Keybaord navigation with backward Arrows", function(assert) {
		var oRadioButton1 = new RadioButton(),
		 oRadioButton2 = new RadioButton({groupName: "testGroup"}),
		 oRadioButton3 = new RadioButton();

		oRadioButton1.placeAt("qunit-fixture");
		oRadioButton2.placeAt("qunit-fixture");
		oRadioButton3.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();


		oRadioButton3.applyFocusInfo();
		sap.ui.test.qunit.triggerKeydown(oRadioButton3.getDomRef(), KeyCodes.ARROW_LEFT);

		assert.strictEqual(oRadioButton1.$().is(":focus"), true, "3rd RadioButton should be focussed");

		oRadioButton1.destroy();
		oRadioButton2.destroy();
		oRadioButton3.destroy();
	});

	QUnit.module("Aria");

	QUnit.test("AriaLabelledBy and AriaDescribedBy", function(assert) {
		var oLabel = new Label("label", { text: "label text" }),
			oRadioButton = new RadioButton({ text: "test" }),
			aAriaLabelledBy;

		oRadioButton.addAriaLabelledBy(oLabel.getId());
		oRadioButton.addAriaDescribedBy(oLabel.getId());
		oRadioButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		aAriaLabelledBy = oRadioButton.$().attr("aria-labelledby").split(" ");

		assert.strictEqual(aAriaLabelledBy.length, 2, "should append to the existing label's ID");
		assert.strictEqual(oRadioButton.$().attr("aria-describedby").split(" ").length, 1, "should have 1 id describedby");
		assert.strictEqual(aAriaLabelledBy[1], oRadioButton.getId() + "-" + oLabel.getId(), "should be set as attributes");

		oLabel.destroy();
		oRadioButton.destroy();
	});

	QUnit.test("Aria-checked must be set explicitely", function(assert) {

		// arrange
		var oRadioButton1 = new RadioButton({selected: true}),
			oRadioButton2 = new RadioButton({}),
			oRadioButton3 = new RadioButton({groupName:"Group1", selected: true}),
			oRadioButton4 = new RadioButton({groupName:"Group1"}),
			$oRadio1, $oRadio2, $oRadio3, $oRadio4;

		oRadioButton1.placeAt("qunit-fixture");
		oRadioButton2.placeAt("qunit-fixture");
		oRadioButton3.placeAt("qunit-fixture");
		oRadioButton4.placeAt("qunit-fixture");

		// act
		oRadioButton3.setSelected(false);
		oRadioButton4.setSelected(true);
		sap.ui.getCore().applyChanges();

		$oRadio1 = oRadioButton1.$();
		$oRadio2 = oRadioButton2.$();
		$oRadio3 = oRadioButton3.$();
		$oRadio4 = oRadioButton4.$();

		// assertions
		assert.strictEqual($oRadio1.attr("aria-checked"), "true", "The aria-checked attribure should be true");
		assert.strictEqual($oRadio2.attr("aria-checked"), "false", "The aria-checked attribure should be false");
		assert.strictEqual($oRadio3.attr("aria-checked"), "false", "The aria-checked attribure should be false");
		assert.strictEqual($oRadio4.attr("aria-checked"), "true", "The aria-checked attribure should be true");


		// cleanup
		oRadioButton1.destroy();
		oRadioButton2.destroy();
		oRadioButton3.destroy();
		oRadioButton4.destroy();
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
				oRadioButton = new RadioButton({ text: "testLabel", selected: true }),
				sExpectedType = oBundle.getText("ACC_CTR_TYPE_RADIO"),
				sExpectedRole = 'radio',
				sExpectedDescription = oRadioButton.getText() + " " + oBundle.getText("ACC_CTR_STATE_CHECKED"),
				oAccInfo = oRadioButton.getAccessibilityInfo();

		oRadioButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oAccInfo.type, sExpectedType, "input type set correctly");
		assert.strictEqual(oAccInfo.role, sExpectedRole, "role set correctly");
		assert.strictEqual(oAccInfo.description, sExpectedDescription, "description set correctly");

		oRadioButton.destroy();
	});

	QUnit.test("SVG aria", function(assert) {
		var oRadioButton = new RadioButton({ text: "test" });

		oRadioButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		oSvg = oRadioButton.getDomRef().getElementsByClassName('sapMRbSvg')[0];

		assert.strictEqual(oSvg.getAttribute('role'), "presentation", "The SVG icon should have a role=presentation");

		oRadioButton.destroy();
	});

	QUnit.module("Message support", {
		beforeEach: function () {
			this.oRadioButton = new RadioButton({
				selected:"{/selected}"
			});
			this.oRadioButton.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
			sinon.config.useFakeTimers = false;
		},
		afterEach: function () {
			this.oRadioButton.destroy();
			sinon.config.useFakeTimers = true;
		}
	});

	QUnit.test("'valueState' property change when there is a Message", function (assert) {
		// arrange
		var done = assert.async(),
			oModel = new JSONModel({
				selected:true
			}),
			oMessageManager = sap.ui.getCore().getMessageManager(),
			oMessage = new Message({
				type: MessageType.Error,
				target: "/selected",
				processor: oModel
			}),
			sExpectedTooltipText = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core").getText("VALUE_STATE_ERROR");

		// act
		this.oRadioButton.setModel(oModel);
		oMessageManager.registerObject(this.oRadioButton, true);
		oMessageManager.addMessages([oMessage]);

		setTimeout(function() {
			// assert
			assert.strictEqual(this.oRadioButton.getValueState(), "Error");
			assert.strictEqual(this.oRadioButton.$("Descr").text(), sExpectedTooltipText, "Default error message should be shown in the tooltip.");
			done();
		}.bind(this), 100);
	});

	QUnit.test("Description value when there is a Message containing error text", function (assert) {
		// arrange
		var done = assert.async(),
			oModel = new JSONModel({
				selected:true
			}),
			oMessageManager = sap.ui.getCore().getMessageManager(),
			sMessage = "This error message should be shown in the tooltip instead of the default message from the Resource Bundle",
			oMessage = new Message({
				type: MessageType.Error,
				target: "/selected",
				processor: oModel,
				message: sMessage
			});

		// act
		this.oRadioButton.setModel(oModel);
		oMessageManager.registerObject(this.oRadioButton, true);
		oMessageManager.addMessages([oMessage]);

		setTimeout(function() {
			// assert
			assert.strictEqual(this.oRadioButton.$("Descr").text(), sMessage, "The error message should be shown in the tooltip");
			done();
		}.bind(this), 100);
	});
});