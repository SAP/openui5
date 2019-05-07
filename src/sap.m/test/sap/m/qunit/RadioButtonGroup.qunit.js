/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/thirdparty/jquery-mobile-custom",
	"jquery.sap.global",
	"sap/ui/core/library",
	"sap/m/RadioButtonGroup",
	"sap/m/RadioButton"
], function(
	qutils,
	jqueryMobileCustom,
	jQuery,
	coreLibrary,
	RadioButtonGroup,
	RadioButton
) {
	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	jQuery.sap.initMobile();

	QUnit.module("Rendering");


	/* --------------------------------------- */
	/* Test: Default Values                    */
	/* --------------------------------------- */

	QUnit.test("Default Values", function(assert){

		var bEnabled = true;
		var bEditable = true;
		var bVisible = true;
		var bSelected = false;
		var nColumns = 1;
		var sName = "";
		var sText = "";
		var sTextDirection = TextDirection.Inherit;
		var sWidth = "";
		var oValueState = ValueState.None;
		var nSelectedIndex = 0;

		// system under test
		var oRBGroup = new RadioButtonGroup();
		var oRadioButton = new RadioButton("option1");
		oRadioButton.setText("Option 1");
		oRadioButton.setTooltip("Tooltip 1");
		oRBGroup.addButton(oRadioButton);

		oRadioButton = new RadioButton("option2");
		oRadioButton.setText("Option 2");
		oRadioButton.setTooltip("Tooltip 2");
		oRBGroup.addButton(oRadioButton);

		// arrange
		oRBGroup.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oRBGroup.getColumns(), nColumns, "Property 'columns': Default value should be '" + nColumns + "'");
		assert.strictEqual(oRBGroup.getVisible(), bVisible, "Property 'visible': Default value should be '" + bVisible + "'");
		assert.strictEqual(oRBGroup.getEditable(), bEditable, "Property 'editable': Default value should be '" + bEditable + "'");
		assert.strictEqual(oRBGroup.getValueState(), oValueState, "Property 'valueState': Default value should be '" + oValueState + "'");
		assert.strictEqual(oRBGroup.getSelectedIndex(), nSelectedIndex, "Property 'selectedIndex': Default value should be '" + nSelectedIndex + "'");
		assert.strictEqual(oRBGroup.getEnabled(), bEnabled, "Property 'enabled': Default value should be '" + bEnabled + "'");

		// cleanup
		oRBGroup.destroyButtons();
		oRBGroup.destroy();
	});

	/* ----------------------------------------------- */
	/* Test: 'visible=false'                           */
	/* ----------------------------------------------- */

	QUnit.test("'visible=false'", function(assert){

		// system under test
		var oRBGroup = new RadioButtonGroup({visible: false});
		var oRadioButton = new RadioButton("option1");
		oRadioButton.setText("Option 1");
		oRadioButton.setTooltip("Tooltip 1");
		oRBGroup.addButton(oRadioButton);

		oRadioButton = new RadioButton("option2");
		oRadioButton.setText("Option 2");
		oRadioButton.setTooltip("Tooltip 2");
		oRBGroup.addButton(oRadioButton);

		// arrange
		oRBGroup.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.ok(!oRBGroup.getDomRef(), "visible=true: RadioButtonGroup should not have been rendered");

		// cleanup
		oRBGroup.destroyButtons();
		oRBGroup.destroy();
	});

	/* ----------------------------------------------- */
	/* Test: 'enabled=false'                            */
	/* ----------------------------------------------- */

	QUnit.test("'enabled=false'", function(assert){

		// system under test
		var bEnabled = false;
		var oRBGroup = new RadioButtonGroup({enabled: bEnabled});
		var oRadioButton = new RadioButton("option1");
		oRadioButton.setText("Option 1");
		oRadioButton.setTooltip("Tooltip 1");
		oRBGroup.addButton(oRadioButton);

		oRadioButton = new RadioButton("option2");
		oRadioButton.setText("Option 2");
		oRadioButton.setTooltip("Tooltip 2");
		oRBGroup.addButton(oRadioButton);

		var aRadioButtons = oRBGroup.getButtons();

		// arrange
		oRBGroup.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assertions
		for (var i = 0; i < aRadioButtons.length; i++) {
			bEnabled = bEnabled || aRadioButtons[i].getEnabled();
		}
		assert.ok(!oRBGroup.getEnabled(), "enabled=" + bEnabled + ": RadioButtonGroup should be disabled");
		assert.strictEqual(oRBGroup.$().find(".sapMRbDis").length, oRBGroup.getButtons().length, "Disabled radios count should equal all items count");

		// cleanup
		oRBGroup.destroyButtons();
		oRBGroup.destroy();
	});

	/* -------------------------------- */
	/* 	   tests for setSelectedIndex() */
	/* -------------------------------- */

	QUnit.test("setSelectedIndex()", function(assert) {

		var oRBGroup = new RadioButtonGroup("RBG");
		var iSelectedIndex = 1;

		// arrange
		var oRadioButton1 = new RadioButton("option1");
		oRadioButton1.setText("Option 1");
		oRadioButton1.setTooltip("Tooltip 1");
		oRBGroup.addButton(oRadioButton1);

		var oRadioButton2 = new RadioButton("option2");
		oRadioButton2.setText("Option 2");
		oRadioButton2.setTooltip("Tooltip 2");
		oRBGroup.addButton(oRadioButton2);

		sap.ui.getCore().applyChanges();


		oRBGroup.placeAt("qunit-fixture");
		oRBGroup.setSelectedIndex(iSelectedIndex);

		// assertions
		assert.equal(oRBGroup.getSelectedIndex(), iSelectedIndex, "The selectedIndex should be " + iSelectedIndex);
		assert.equal(oRBGroup.getSelectedButton(), oRadioButton2, "The second Radio Button should be selected");

		// cleanup
		oRBGroup.destroyButtons();
		oRBGroup.destroy();
	});

	/*	--------------------------------------- 	*/
	/*			tests for keyboard handling			*/
	/*	--------------------------------------- 	*/
	QUnit.test("'keyboard handling'", function(assert) {
		//setup RadioButtonGroups
		var iRadiosCount = 4;
		var columnsCount = 2;
		var oRBGroup = new RadioButtonGroup("RBG1", {
			columns : columnsCount
		});

		for (var i = 0; i < iRadiosCount; i++) {
			oRadioButton = new RadioButton("option1-" + i);
			oRadioButton.setText("Option " + i);
			oRadioButton.setTooltip("Tooltip " + i);
			oRBGroup.addButton(oRadioButton);
		}

		sap.ui.getCore().applyChanges();

		// Focus first radio
		oRBGroup.placeAt("qunit-fixture");
		qutils.triggerMouseEvent("RBG1-0", "click");
		sap.ui.getCore().applyChanges();

		assert.equal(oRBGroup.getSelectedIndex(), 0, "Selected index should be 0");

		// Test arrow pressing
		qutils.triggerKeyboardEvent("RBG1", "ARROW_RIGHT");
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup.getSelectedIndex(), 1, "Selected index should be 1");

		qutils.triggerKeyboardEvent("RBG1", "ARROW_DOWN");
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup.getSelectedIndex(), 3, "Selected index should be 3");

		qutils.triggerKeyboardEvent("RBG1", "ARROW_LEFT");
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup.getSelectedIndex(), 2, "Selected index should be 2");

		qutils.triggerKeyboardEvent("RBG1", "ARROW_UP");
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup.getSelectedIndex(), 0, "Selected index should be 0");

		qutils.triggerKeyboardEvent("RBG1", "END");
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup.getSelectedIndex(), 3, "Selected index should be 3");

		qutils.triggerKeyboardEvent("RBG1", "HOME");
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup.getSelectedIndex(), 0, "Selected index should be 0");

		qutils.triggerKeyboardEvent("RBG1", "ARROW_LEFT");
		sap.ui.getCore().applyChanges();
		assert.equal(oRBGroup.getSelectedIndex(), 3, "Selected index should be 3");

		// cleanup
		oRBGroup.destroyButtons();
		oRBGroup.destroy();
	});

	/*	--------------------------------------- 	*/
	/*	        tests textDirection	            	*/
	/*	--------------------------------------- 	*/

	QUnit.test("textDirection set to RTL", function(assert) {
		// arrange
		var oRBGroup = new RadioButtonGroup({
			textDirection: TextDirection.RTL,
			columns: 2,
			buttons: [
				new RadioButton({text: "Option 1, First Column"}),
				new RadioButton({text: "Option 2, Second Column"})
			]
		});

		oRBGroup.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.equal(jQuery(oRBGroup.getDomRef()).attr("dir"), "rtl", "Control has 'dir' property set to right to left");

		// cleanup
		oRBGroup.destroy();
	});

	QUnit.test("textDirection set to LTR", function(assert) {
		// arrange
		var oRBGroup = new RadioButtonGroup({
			textDirection: TextDirection.LTR,
			columns: 2,
			buttons: [
				new RadioButton({text: "Option 1, First Column"}),
				new RadioButton({text: "Option 2, Second Column"})
			]
		});

		oRBGroup.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.equal(jQuery(oRBGroup.getDomRef()).attr("dir"), "ltr", "Control has 'dir' property set to left to right");

		// cleanup
		oRBGroup.destroy();
	});

	QUnit.module("Setters", {
		beforeEach : function() {
			this.rbg = new RadioButtonGroup({
				buttons: [
					new RadioButton({enabled: false, text: "Option 1"}),
					new RadioButton({editable: false, text: "Option 2"}),
					new RadioButton({text: "Option 3"})
				]
			});

			this.rbg.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.rbg.destroy();
		}
	});

	QUnit.test("setEnabled doesn't modify RadioButton state", function(assert) {
		var aButtons = this.rbg.getButtons();

		// act
		this.rbg.setEnabled(false);
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(aButtons[0].getEnabled(), false, "First RadioButton is disabled");
		assert.equal(aButtons[1].getEnabled(), false, "Second RadioButton is enabled due to EnabledPropagator");
		assert.equal(aButtons[1].getProperty("enabled"), true, "Second RadioButton keeps enabled=true in mProperties");
		assert.equal(aButtons[2].getEnabled(), false, "Third RadioButton is enabled due to EnabledPropagator");
		assert.equal(aButtons[1].getProperty("enabled"), true, "Third RadioButton keeps enabled=true in mProperties");

		// act
		this.rbg.setEnabled(true);

		// assert
		assert.equal(aButtons[0].getEnabled(), false, "First RadioButton is disabled");
		assert.equal(aButtons[1].getEnabled(), true, "Second RadioButton is enabled");
		assert.equal(aButtons[2].getEnabled(), true, "Third RadioButton is enabled");
	});

	QUnit.test("setEditable doesn't modify RadioButton state", function(assert) {
		var aButtons = this.rbg.getButtons();
		var oPropagateStateStub = this.stub(RadioButton.prototype, "_setEditableParent");

		// act
		this.rbg.setEditable(false);
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oPropagateStateStub.called, "Propagation should be called");
		assert.ok(oPropagateStateStub.alwaysCalledWith(false), "Editable should be propagated to all buttons");
		assert.strictEqual(oPropagateStateStub.callCount, 3, "Propagation should be called 3 times");
		assert.equal(aButtons[0].getEditable(), true, "First RadioButton is editable");
		assert.equal(aButtons[1].getEditable(), false, "Second RadioButton is read only");
		assert.equal(aButtons[2].getEditable(), true, "Third RadioButton is editable");

		// act
		this.rbg.setEditable(true);

		// assert
		assert.equal(aButtons[0].getEditable(), true, "First RadioButton is editable");
		assert.equal(aButtons[1].getEditable(), false, "Second RadioButton is read only");
		assert.equal(aButtons[2].getEditable(), true, "Third RadioButton is editable");
	});

	QUnit.test("setSelectedButton", function (assert) {
		var oFirstButton = this.rbg.getButtons()[1];

		// act
		this.rbg.setSelectedButton(null);

		// assert
		assert.strictEqual(this.rbg.getSelectedIndex(), -1, "Selected index should be -1 when no button is provided");

		// act
		this.rbg.setSelectedButton(oFirstButton);

		// assert
		assert.strictEqual(this.rbg.getSelectedIndex(), 1, "Selected index should be properly set");
	});

	QUnit.test("setValueState", function (assert) {
		var aButtons = this.rbg.getButtons();

		// act
		this.rbg.setValueState(ValueState.Error);
		sap.ui.getCore().applyChanges();

		// assert
		for (var i = 0; i < aButtons.length; i++) {
			assert.ok(aButtons[i].$().hasClass("sapMRbErr"), "Setting state to the group should also set state to all the buttons.");
		}
	});

	QUnit.module("Methods", {
		beforeEach: function() {
			this.rbg = new RadioButtonGroup({
				buttons: [
					new RadioButton("firstRadioButton", {enabled: false, text: "Option 1"})
				]
			});

			this.rbg.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.rbg.destroy();
		}
	});

	QUnit.test("InsertRadioButton", function(assert) {

		// insert a button at out of bounds indexes

		var oNewButton = new RadioButton({text: 'radio200'});
		this.rbg.insertButton(oNewButton, 200);

		oNewButton = new RadioButton({text: 'radio-200'});
		this.rbg.insertButton(oNewButton, -200);

		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(this.rbg.$().find('.sapMRb').length, 3, "Buttons are rendered correctly");
	});

	QUnit.test("RemoveAllButtons", function(assert) {
		var aButtons = this.rbg.removeAllButtons();
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(this.rbg.$().find('.sapMRb').length, 0, "All buttons are removed");

		// clean up
		aButtons.forEach(function (oButton) {
			oButton.destroy();
		});
	});

	QUnit.test("Remove single button", function(assert) {
		var oFirstButton = this.rbg.getButtons()[0],
			oRadioButton = new RadioButton(),
			iLength = this.rbg.getButtons().length,
			oRemovedButton;

		// act
		this.rbg.removeButton(oRadioButton);

		// assert
		assert.strictEqual(this.rbg.getButtons().length, iLength, "Should NOT change buttons when non-member button is given.");

		// act
		oRemovedButton = this.rbg.removeButton("firstRadioButton");

		// assert
		assert.strictEqual(this.rbg.indexOfButton(oFirstButton), -1, "Should be able to remove button by given ID.");

		// clean up
		oRemovedButton.destroy();

	});

	QUnit.module("Events", {
		beforeEach: function() {
			this.rbg = new RadioButtonGroup({
				buttons: [
					new RadioButton("firstRadioButton"),
					new RadioButton(),
					new RadioButton()
				]
			});

			this.rbg.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.rbg.destroy();
		}
	});

	QUnit.test("Button selection", function (assert) {
		var fnSpy = sinon.spy(),
			oFirstButton = this.rbg.getButtons()[1];

		this.rbg.attachSelect(fnSpy);

		// act
		qutils.triggerEvent("tap", oFirstButton.getId());
		this.clock.tick(300);

		// assert
		assert.strictEqual(fnSpy.callCount, 1, "Click on a radio button should fire 'select'.");
	});
});