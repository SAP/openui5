/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/RadioButton",
	"sap/ui/core/Control"
], function(createAndAppendDiv, RadioButton, Control) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2"]);



	var sText = "Hello",
		sTooltip = "tooltip",
		sWidth = "111px",
		bEnabled = false,
		bVisible = true,
		bSelected = false,
		sGroupName = "myRBGroupName",
		sMessage = "foo";

	function foo() {
		throw sMessage;
	}

	var oRadioButton1 = new RadioButton("rb1");
	oRadioButton1.setText(sText);
	oRadioButton1.setWidth(sWidth);
	oRadioButton1.setEnabled(bEnabled);
	oRadioButton1.setVisible(bVisible);
	oRadioButton1.setTooltip(sTooltip);
	oRadioButton1.setSelected(bSelected);
	oRadioButton1.setGroupName(sGroupName);
	oRadioButton1.attachSelect(foo);
	oRadioButton1.placeAt("uiArea1");

	var oRadioButton2 = new RadioButton("rb2", {
		text : sText,
		width : sWidth,
		enabled : bEnabled,
		visible : bVisible,
		tooltip : sTooltip,
		selected : bSelected,
		groupName : sGroupName,
		select: foo
	});
	oRadioButton2.placeAt("uiArea2");

	var rb1, rb2;

	QUnit.module('API', {
		beforeEach: function() {
			// arrange
			this.oRadioButton1 = new RadioButton();
			this.oRadioButton2 = new RadioButton();
			this.oRadioButton3 = new RadioButton();

			this.oRadioButton1.placeAt("qunit-fixture");
			this.oRadioButton2.placeAt("qunit-fixture");
			this.oRadioButton3.placeAt("qunit-fixture");
		},
		afterEach: function() {
			// cleanup
			this.oRadioButton1.destroy();
			this.oRadioButton2.destroy();
			this.oRadioButton3.destroy();
		}
	});

	QUnit.test("setSelected should check RadioButton and uncheck all other RadioButtons from the same group", function (assert) {
		// act
		this.oRadioButton1.setSelected(true);
		this.oRadioButton2.setSelected(true);
		this.oRadioButton3.setSelected(true);

		// assert
		assert.ok(!this.oRadioButton1.getSelected(), "RadioButton should not be selected");
		assert.ok(!this.oRadioButton2.getSelected(), "RadioButton should not be selected");
		assert.ok(this.oRadioButton3.getSelected(), "RadioButton should be selected");
	});

	QUnit.test("setGroupName", function (assert) {
		sap.ui.getCore().applyChanges();

		this.oRadioButton1.setGroupName("test");

		// act
		this.oRadioButton1.setSelected(true);
		this.oRadioButton2.setSelected(true);
		this.oRadioButton3.setSelected(true);

		// assert
		assert.strictEqual(this.oRadioButton1.getSelected(), true, "RadioButton1 should be selected");
		assert.strictEqual(this.oRadioButton2.getSelected(), false, "RadioButton2 should not be selected");
		assert.strictEqual(this.oRadioButton3.getSelected(), true, "RadioButton3 should be selected");
	});


	QUnit.module("Basic", {
		beforeEach : function(assert) {
			rb1 = sap.ui.getCore().getControl("rb1");
			rb2 = sap.ui.getCore().getControl("rb2");

			rb1.setVisible(true);
			rb1.setEnabled(bEnabled);
			rb1.setSelected(bSelected);

			rb2.setVisible(true);
			rb2.setEnabled(bEnabled);
			rb2.setWidth(sWidth);
			rb2.setSelected(bSelected);

			sap.ui.getCore().applyChanges();

			assert.ok(rb1, "rb1 should not be null");
			assert.ok(rb2, "rb2 should not be null");
		},
		afterEach : function() {
			rb1 = null;
			rb2 = null;
		}
	});

	// test control properties

	QUnit.test("TextOk", function(assert) {
		assert.strictEqual(rb1.getText(), sText, "rb1.getText() returns wrong result");
		assert.strictEqual(rb2.getText(), sText, "rb2.getText() returns wrong result");
	});

	QUnit.test("WidthOk", function(assert) {
		assert.strictEqual(rb1.getWidth(), sWidth, "rb1.getWidth() returns wrong result");
		assert.strictEqual(rb2.getWidth(), sWidth, "rb2.getWidth() returns wrong result");
	});

	QUnit.test("EnabledOk", function(assert) {
		assert.strictEqual(rb1.getEnabled(), bEnabled, "rb1.getEnabled() returns wrong result");
		assert.strictEqual(rb2.getEnabled(), bEnabled, "rb2.getEnabled() returns wrong result");
	});

	QUnit.test("VisibleOk", function(assert) {
		assert.strictEqual(rb1.getVisible(), bVisible, "rb1.getVisible() returns wrong result");
		assert.strictEqual(rb2.getVisible(), bVisible, "rb2.getVisible() returns wrong result");
	});

	QUnit.test("TooltipOk", function(assert) {
		assert.strictEqual(rb1.getTooltip(), sTooltip, "rb1.getTooltip() returns wrong result");
		assert.strictEqual(rb2.getTooltip(), sTooltip, "rb2.getTooltip() returns wrong result");
	});

	QUnit.test("SelectedOk", function(assert) {
		assert.strictEqual(rb1.getSelected(), bSelected, "rb1.getSelected() returns wrong result");
		assert.strictEqual(rb2.getSelected(), bSelected, "rb2.getSelected() returns wrong result");
	});


	// test events

	// TODO: test event handler with event parameters

	QUnit.test("SelectOk", function(assert) {
		try {
			rb1.fireSelect();
			assert.ok(false, "exception should have been thrown when rb1.fireSelect() was called!");
		} catch (e) {
			assert.strictEqual(e, sMessage, "rb1.firePress()");
		}

		try {
			rb2.fireSelect();
			assert.ok(false, "exception should have been thrown when rb2.fireSelect() was called!");
		} catch (e) {
			assert.strictEqual(e, sMessage, "rb2.firePress()");
		}
	});

	QUnit.test("DetachSelectOk", function(assert) {
		rb1.detachSelect(foo);
		try {
			rb1.fireSelect();
			assert.ok(true, "No event and thus no exception should be triggered!");
		} catch (e) {
			assert.ok(false, "should not occur");
		}
		// cleanup in order to be independent from order of execution of test-functions (e.g. in FF3 there was an issue)
		rb1.attachSelect(foo);
	});


	// test misc (control interaction, metadata, styles, etc.)

	function isEmpty(oObject) {
		for (var i in oObject) { // eslint-disable-line 
			return false;
		}
		return true;
	}

	QUnit.test("MetadataOk", function(assert) {
		var oMetadata = rb1.getMetadata();
		assert.ok(oMetadata, "rb1.getMetadata() should not be null");
		assert.ok(oMetadata.getParent(), "rb1.getMetadata().getParent() should not be null");
		assert.ok(oMetadata.getParent() === Control.getMetadata());
		assert.strictEqual(oMetadata.getProperties()["text"]["type"], "string");
		assert.ok(isEmpty(oMetadata.getAggregations()));
		var oAssociations = oMetadata.getAssociations();
		assert.strictEqual(oAssociations["ariaDescribedBy"]["type"], "sap.ui.core.Control", "ariaDescribedBy type");
		assert.ok(oAssociations["ariaDescribedBy"]["multiple"], "ariaDescribedBy multiple");
		assert.strictEqual(oAssociations["ariaLabelledBy"]["type"], "sap.ui.core.Control", "ariaLabelledBy type");
		assert.ok(oAssociations["ariaLabelledBy"]["multiple"], "ariaLabelledBy multiple");
	});

	QUnit.test("OffsetWidthOk", function(assert) {
		//test the pixel perfect width of the control
		var oDomRef = window.document.getElementById("rb1");
		assert.strictEqual(oDomRef.offsetWidth, parseInt(rb1.getWidth()), "rb1.offsetWidth should equal parseInt(rb1.getWidth())");
		rb2.setWidth("1000px");
		sap.ui.getCore().applyChanges();
		oDomRef = window.document.getElementById("rb2");
		assert.strictEqual(oDomRef.offsetWidth, 1000, "rb2.offsetWidth should equal 1000");
	});

	// toggle back and forth
	QUnit.test("SelectOk", function(assert) {
		assert.strictEqual(rb1.getSelected(), bSelected, "rb1.getSelected() returns wrong result");

		// select the first button - it should be selected
		rb1.setSelected(true);
		assert.strictEqual(rb1.getSelected(), true, "rb1.getSelected() returns wrong result after selecting");
		assert.strictEqual(rb2.getSelected(), false, "rb2.getSelected() returns wrong result after rb1 has been selected");

		// select the second button - it should be selected and the first one de-selected
		rb2.setSelected(true);
		assert.strictEqual(rb1.getSelected(), false, "rb1.getSelected() returns wrong result after rb2 has been selected");
		assert.strictEqual(rb2.getSelected(), true, "rb2.getSelected() returns wrong result after selecting");
	});

	QUnit.test("CssClassesOk", function(assert) {
		var sClasses = window.document.getElementById("rb1").className;
		assert.notStrictEqual(sClasses, null, "sClasses is null");
		assert.ok(sClasses.indexOf("sapUiRb") > -1, "rb1 className is missing 'sapUiRb'");
		assert.ok(sClasses.indexOf("sapUiRbStd") == -1, "rb1 className is containing 'sapUiRbStd'");
		assert.ok(sClasses.indexOf("sapUiRbDis") > -1, "rb1 className is missing 'sapUiRbDis'");
		assert.ok(sClasses.indexOf("sapUiRbRo") == -1, "rb1 className is containing 'sapUiRbRo'");

		rb1.setEnabled(true);
		sap.ui.getCore().applyChanges();
		sClasses = window.document.getElementById("rb1").className; // after re-rendering it is a NEW HTML element!!

		assert.ok(sClasses.indexOf("sapUiRb") > -1, "rb1 className is missing 'sapUiRb'");
		assert.ok(sClasses.indexOf("sapUiRbStd") > -1, "rb1 className is missing 'sapUiRbStd'");
		assert.ok(sClasses.indexOf("sapUiRbDis") == -1, "rb1 className is containing 'sapUiRbDis' after being enabled");
		assert.ok(sClasses.indexOf("sapUiRbRo") == -1, "rb1 className is containing 'sapUiRbRo'");

		rb1.setEditable(false);
		sap.ui.getCore().applyChanges();
		sClasses = window.document.getElementById("rb1").className; // after re-rendering it is a NEW HTML element!!

		assert.ok(sClasses.indexOf("sapUiRb") > -1, "rb1 className is missing 'sapUiRb'");
		assert.ok(sClasses.indexOf("sapUiRbStd") == -1, "rb1 className is containing 'sapUiRbStd'");
		assert.ok(sClasses.indexOf("sapUiRbDis") == -1, "rb1 className is containing 'sapUiRbDis' after being enabled");
		assert.ok(sClasses.indexOf("sapUiRbRo") > -1, "rb1 className is missing 'sapUiRbRo'");
	});

	QUnit.module("GroupName");

	QUnit.test("_groupNames clean-up", function(assert) {
		this.oRadioButton = new RadioButton();

		this.oRadioButton.placeAt("qunit-fixture");

		sap.ui.getCore().applyChanges();

		this.oRadioButton.destroy();

		assert.strictEqual(this.oRadioButton._groupNames['sapUiRbDefaultGroup'].length, 0, "RadioButton was removed from _groupNames");
	});
});