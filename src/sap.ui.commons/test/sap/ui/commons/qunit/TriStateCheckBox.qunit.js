/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/TriStateCheckBox",
	"sap/ui/thirdparty/jquery"
], function(createAndAppendDiv, TriStateCheckBox, jQuery) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["target1", "target2"]);


	var sText = "Hello world!",
		sTooltip = "sample tooltip",
		sWidth = "300px",
		bEnabled = true,
		bVisible = true,
		sSelectionState = "Checked";

	var oTriStateCb = new TriStateCheckBox("tcb1");
	oTriStateCb.setText(sText);
	oTriStateCb.setWidth(sWidth);
	oTriStateCb.setTooltip(sTooltip);
	oTriStateCb.setEnabled(bEnabled);
	oTriStateCb.setVisible(bVisible);
	oTriStateCb.setSelectionState(sSelectionState);
	oTriStateCb.placeAt("target1");

	oTriStateCb = new TriStateCheckBox("tcb2", {
		text: sText,
		width: sWidth,
		tooltip: sTooltip,
		enabled: bEnabled,
		visible: bVisible,
		selectionState: sSelectionState
	});
	oTriStateCb.placeAt("target2");

	var tcb1 = sap.ui.getCore().getControl("tcb1");
	var tcb2 = sap.ui.getCore().getControl("tcb2");

	QUnit.module("Basic");

	QUnit.test("TextOk", function(assert) {
		assert.strictEqual(tcb1.getText(), sText, "tcb1.getText() returns wrong result");
		assert.strictEqual(tcb2.getText(), sText, "tcb2.getText() returns wrong result");
	});

	QUnit.test("WidthOk", function(assert) {
		assert.strictEqual(tcb1.getWidth(), sWidth, "tcb1.getWidth() returns wrong result");
		assert.strictEqual(tcb2.getWidth(), sWidth, "tcb2.getWidth() returns wrong result");
	});

	QUnit.test("EnabledOk", function(assert) {
	assert.strictEqual(tcb1.getEnabled(), bEnabled, "tcb1.getEnabled() returns wrong result");
	assert.strictEqual(tcb2.getEnabled(), bEnabled, "tcb2.getEnabled() returns wrong result");
});

	QUnit.test("VisibleOk", function(assert) {
		assert.strictEqual(tcb1.getVisible(), bVisible, "tcb1.getVisible() returns wrong result");
		assert.strictEqual(tcb2.getVisible(), bVisible, "tcb2.getVisible() returns wrong result");
	});

	QUnit.test("TooltipOk", function(assert) {
		assert.strictEqual(tcb1.getTooltip(), sTooltip, "tcb1.getTooltip() returns wrong result");
		assert.strictEqual(tcb2.getTooltip(), sTooltip, "tcb2.getTooltip() returns wrong result");
	});

	QUnit.test("CheckedOk", function(assert) {
		assert.strictEqual(tcb1.getSelectionState(), sSelectionState, "tcb1.getSelectionState() returns wrong result");
		assert.strictEqual(tcb2.getSelectionState(), sSelectionState, "tcb2.getSelectionState() returns wrong result");
	});

	QUnit.test("Visibility", function(assert) {
		assert.ok(document.getElementById("tcb1"), "TriStateCheckBox 1 should exist in page");
		tcb1.setVisible(false);
		sap.ui.getCore().applyChanges();
		assert.equal(document.getElementById("tcb1"), null, "TriStateCheckBox 1 should not be rendered when set to invisible");
		tcb1.setVisible(true);
		sap.ui.getCore().applyChanges();
		assert.ok(document.getElementById("tcb1"), "TriStateCheckBox 1 should exist in page");
	});

	QUnit.test("Width", function(assert) {
		assert.strictEqual(document.getElementById("tcb1").offsetWidth, 300, "actual width is wrong");
		tcb1.setWidth("401px");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(document.getElementById("tcb1").offsetWidth, 401, "actual width is wrong after change");
		tcb1.setWidth("300px");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(document.getElementById("tcb1").offsetWidth, 300, "actual width is wrong after change");
	});

	QUnit.test("ToggleOK", function(assert){
		assert.strictEqual(tcb1.getSelectionState(), sSelectionState, "tcb1.getSelectionState() returns wrong state");
		tcb1.toggle("Mixed");
		assert.strictEqual(tcb1.getSelectionState(), "Mixed", "tcb1.getSelectionState() returns wrong state after toggle to mixed");
		tcb1.toggle("Unchecked");
		assert.strictEqual(tcb1.getSelectionState(), "Unchecked", "tcb1.getSelectionState() returns wrong state after toggle to checked");
	});

	QUnit.test("CssClassesOk", function(assert) {
		var sSpan = document.getElementById("tcb1");
		var sClasses = sSpan.className;
		assert.notStrictEqual(sClasses, null, "sClasses is null");
		assert.ok(sClasses.indexOf("sapUiTriCb") > -1, "c1 className is missing 'sapUiTriCb'");
		sSpan = sSpan.firstChild;
		sClasses = sSpan.className;
		assert.ok(sClasses.indexOf("sapUiTriCbInner") > -1, "className of child is not containing 'sapUiTriCbInner'");
		assert.ok(sClasses.indexOf("sapUiTriCbDis") == -1, "className of child is containing 'sapUiTriCbDis'");
		assert.ok(sClasses.indexOf("sapUiTriCbRo") == -1, "className of child is containing 'sapUiTriCbRo'");

		tcb1.setEnabled(false);
		tcb1.setEditable(false);

		sap.ui.getCore().applyChanges();
		sSpan = document.getElementById("tcb1").firstChild;
		sClasses = sSpan.className;
		assert.ok(sClasses.indexOf("sapUiTriCbDis") > -1, "className of child is missing 'sapUiTriCbDis'");
		assert.ok(sClasses.indexOf("sapUiTriCbRo") > -1, "className of child is missing 'sapUiTriCbRo'");

		tcb1.toggle("Mixed");
		sap.ui.getCore().applyChanges();
		sSpan = document.getElementById("tcb1").firstChild;
		sClasses = sSpan.className;
		assert.ok(sClasses.indexOf("sapUiTriCbMix") > -1, "className of child is missing 'sapUiTriCbMix'");
		assert.ok(sClasses.indexOf("sapUiTriCbRo") > -1, "className of child is missing 'sapUiTriCbRo after toggle'");

		tcb1.setEditable(true);
		tcb1.setEnabled(true);
		sap.ui.getCore().applyChanges();
		sSpan = document.getElementById("tcb1").firstChild;
		sClasses = sSpan.className;
		assert.ok(sClasses.indexOf("sapUiTriCbDis") == -1, "tcb1 className is containing 'sapUiCbDis' after being reenabled");
		assert.ok(sClasses.indexOf("sapUiTriCbRo") == -1, "tcb1 className is containing 'sapUiCbRo' after switching back to editable");
	});

	QUnit.test("AriaOK", function(assert) {
		assert.equal(jQuery("#tcb1").attr("role"), "checkbox", "Role of the TriStateCheckBox");
		assert.equal(jQuery("#tcb1").attr("aria-checked"), "mixed", "ARIA-Checked of 1. Checkbox");
		assert.equal(jQuery("#tcb1").children(".sapUiTriCbInner").attr("aria-labelledby"), "sapUiAriaLabeltcb1", "ARIA-LabelledBy of 1. Checkbox");
		assert.ok(jQuery("#tcb1").find("#sapUiAriaLabeltcb1").length > 0, "Aria-Labelling span for checkbox");
	});
});