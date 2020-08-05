/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/CheckBox",
	"sap/ui/core/Control"
], function(createAndAppendDiv, CheckBox, Control) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2"]);



	var sText = "Hello",
		sTooltip = "tooltip",
		sWidth = "111px",
		bEnabled = false,
		bVisible = true,
		bChecked = false,
		sMessage = "foo";

	function foo() {
		throw sMessage;
	}

	var oCheckBox1 = new CheckBox("c1");
	oCheckBox1.setText(sText);
	oCheckBox1.setWidth(sWidth);
	oCheckBox1.setEnabled(bEnabled);
	oCheckBox1.setVisible(bVisible);
	oCheckBox1.setTooltip(sTooltip);
	oCheckBox1.setChecked(bChecked);
	oCheckBox1.attachChange(foo);
	oCheckBox1.placeAt("uiArea1");

	var oCheckBox2 = new CheckBox("c2", {
		text : sText,
		width : sWidth,
		enabled : bEnabled,
		visible : bVisible,
		tooltip : sTooltip,
		checked : bChecked,
		change: foo
	});
	oCheckBox2.placeAt("uiArea2");

	var c1, c2;


	QUnit.module("Basic", {
		beforeEach : function(assert) {
			c1 = sap.ui.getCore().getControl("c1");
			c2 = sap.ui.getCore().getControl("c2");

			c1.setVisible(true);
			c1.setEnabled(bEnabled);

			c2.setVisible(true);
			c2.setEnabled(bEnabled);
			c2.setWidth(sWidth);

			sap.ui.getCore().applyChanges();

			assert.ok(c1, "c1 should not be null");
			assert.ok(c2, "c2 should not be null");
		},
		afterEach : function() {
			c1 = null;
			c2 = null;
		}
	});

	// test control properties

	QUnit.test("TextOk", function(assert) {
		assert.strictEqual(c1.getText(), sText, "c1.getText() returns wrong result");
		assert.strictEqual(c2.getText(), sText, "c2.getText() returns wrong result");
	});

	QUnit.test("WidthOk", function(assert) {
		assert.strictEqual(c1.getWidth(), sWidth, "c1.getWidth() returns wrong result");
		assert.strictEqual(c2.getWidth(), sWidth, "c2.getWidth() returns wrong result");
	});

	QUnit.test("EnabledOk", function(assert) {
		assert.strictEqual(c1.getEnabled(), bEnabled, "c1.getEnabled() returns wrong result");
		assert.strictEqual(c2.getEnabled(), bEnabled, "c2.getEnabled() returns wrong result");
	});

	QUnit.test("VisibleOk", function(assert) {
		assert.strictEqual(c1.getVisible(), bVisible, "c1.getVisible() returns wrong result");
		assert.strictEqual(c2.getVisible(), bVisible, "c2.getVisible() returns wrong result");
	});

	QUnit.test("TooltipOk", function(assert) {
		assert.strictEqual(c1.getTooltip(), sTooltip, "c1.getTooltip() returns wrong result");
		assert.strictEqual(c2.getTooltip(), sTooltip, "c2.getTooltip() returns wrong result");
	});

	QUnit.test("CheckedOk", function(assert) {
		assert.strictEqual(c1.getChecked(), bChecked, "c1.getChecked() returns wrong result");
		assert.strictEqual(c2.getChecked(), bChecked, "c2.getChecked() returns wrong result");
	});


	// test events

	// TODO: test event handler with event parameters

	QUnit.test("ChangeOk", function(assert) {
		try {
			c1.fireChange();
			assert.ok(false, "exception should have been thrown when c1.fireChange() was called!");
		} catch (e) {
			assert.strictEqual(e, sMessage, "c1.firePress()");
		}

		try {
			c2.fireChange();
			assert.ok(false, "exception should have been thrown when c2.fireChange() was called!");
		} catch (e) {
			assert.strictEqual(e, sMessage, "c2.firePress()");
		}
	});

	QUnit.test("DetachChangeOk", function(assert) {
		c1.detachChange(foo);
		try {
			c1.fireChange();
			assert.ok(true, "No event and thus no exception should be triggered!");
		} catch (e) {
			assert.ok(false, "should not occur");
		}
		// cleanup in order to be independent from order of execution of test-functions (e.g. in FF3 there was an issue)
		c1.attachChange(foo);
	});

	// test methods

	// test misc (control interaction, metadata, styles, etc.)
	function isEmpty(oObject) {
		for (var i in oObject) { //eslint-disable-line no-unused-vars
			return false;
		}
		return true;
	}

	QUnit.test("MetadataOk", function(assert) {
		var oMetadata = c1.getMetadata();
		assert.ok(oMetadata !== null, "c1.getMetadata() should not be null");
		assert.ok(oMetadata.getParent() !== null, "c1.getMetadata().getParent() should not be null");
		assert.ok(Control.getMetadata() === oMetadata.getParent());
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
		var oDomRef = window.document.getElementById("c1");
		assert.strictEqual(oDomRef.offsetWidth, parseInt(c1.getWidth()), "c1.offsetWidth should equal parseInt(c1.getWidth())");
		c2.setWidth("1000px");
		sap.ui.getCore().applyChanges();
		oDomRef = window.document.getElementById("c2");
		assert.strictEqual(oDomRef.offsetWidth, 1000, "c2.offsetWidth should equal 1000");
});

	// toggle back and forth
	QUnit.test("ToggleOk", function(assert) {
		assert.strictEqual(c1.getChecked(), bChecked, "c1.getChecked() returns wrong result");
		c1.toggle();
		assert.strictEqual(c1.getChecked(), !bChecked, "c1.getChecked() returns wrong result after toggling");
		c1.toggle();
		assert.strictEqual(c1.getChecked(), bChecked, "c1.getChecked() returns wrong result after toggling back");
	});

	QUnit.test("CssClassesOk", function(assert) {
		var sClasses = window.document.getElementById("c1").className;
		assert.notStrictEqual(sClasses, null, "sClasses is null");
		assert.ok(sClasses.indexOf("sapUiCb") > -1, "c1 className is missing 'sapUiCb'");
		assert.ok(sClasses.indexOf("sapUiCbStd") == -1, "c1 className is containing 'sapUiCbStd'");
		assert.ok(sClasses.indexOf("sapUiCbDis") > -1, "c1 className is missing 'sapUiCbDis'");
		assert.ok(sClasses.indexOf("sapUiCbRo") == -1, "c1 className is containing 'sapUiCbRo'");

		c1.setEnabled(true);
		sap.ui.getCore().applyChanges();
		sClasses = window.document.getElementById("c1").className; // after re-rendering it is a NEW HTML element!!

		assert.ok(sClasses.indexOf("sapUiCb") > -1, "c1 className is missing 'sapUiCb'");
		assert.ok(sClasses.indexOf("sapUiCbStd") > -1, "c1 className is missing 'sapUiCbStd'");
		assert.ok(sClasses.indexOf("sapUiCbDis") == -1, "c1 className is containing 'sapUiCbDis' after being enabled");
		assert.ok(sClasses.indexOf("sapUiCbRo") == -1, "c1 className is containing 'sapUiCbRo'");

		c1.setEditable(false);
		sap.ui.getCore().applyChanges();
		sClasses = window.document.getElementById("c1").className; // after re-rendering it is a NEW HTML element!!

		assert.ok(sClasses.indexOf("sapUiCb") > -1, "c1 className is missing 'sapUiCb'");
		assert.ok(sClasses.indexOf("sapUiCbStd") == -1, "c1 className is containing 'sapUiCbStd'");
		assert.ok(sClasses.indexOf("sapUiCbDis") == -1, "c1 className is containing 'sapUiCbDis' after being enabled");
		assert.ok(sClasses.indexOf("sapUiCbRo") > -1, "c1 className is missing 'sapUiCbRo'");
	});
});