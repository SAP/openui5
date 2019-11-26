/*global QUnit sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	'sap/base/Log',
	'sap/tnt/InfoLabel',
	'sap/tnt/library'
], function(
	log,
	InfoLabel,
	tntLibrary) {
	'use strict';

	QUnit.module("Properties", {
		beforeEach: function () {
			this.InfoLabel = new InfoLabel("iLabel1").placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.InfoLabel.destroy();
			this.InfoLabel = null;
		}
	});

	QUnit.test("Default Values", function (assert) {
		assert.strictEqual(this.InfoLabel.getText(), "", "text should be \" \" ");
		assert.strictEqual(this.InfoLabel.getRenderMode(), "Loose", "renderMode should be \"Loose\"");
		assert.strictEqual(this.InfoLabel.getColorScheme(), 7, "colorScheme should be 7");
		assert.strictEqual(this.InfoLabel.getWidth(), "", "width should be null");
		assert.strictEqual(this.InfoLabel.getDisplayOnly(), false, "displayOnly should be false");
		assert.strictEqual(this.InfoLabel.getTextDirection(), "Inherit", "textDirection should be Inherit");
		assert.strictEqual(this.InfoLabel.getIcon(), "", "icon should not be set");
	});

	QUnit.module("Renderer", {
		beforeEach: function () {
			this.InfoLabel = new InfoLabel("iLabel1").placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.InfoLabel.destroy();
			this.InfoLabel = null;
		}
	});

	QUnit.test("checking Narrow renderMode", function (assert) {
		assert.notOk(this.InfoLabel.$().hasClass("sapTntInfoLabelRenderModeNarrow"), "should not have style class \"sapTntInfoLabelRenderModeNarrow\" ");

		this.InfoLabel.setRenderMode(tntLibrary.RenderMode.Narrow);
		sap.ui.getCore().applyChanges();
		assert.ok(this.InfoLabel.$().hasClass("sapTntInfoLabelRenderModeNarrow"), "should have style class \"sapTntInfoLabelRenderModeNarrow\" ");

	});

	QUnit.test("checking display only mode", function (assert) {
		assert.notOk(this.InfoLabel.$().hasClass("sapTntInfoLabelDisplayOnly"), "should not have style class \"sapTntInfoLabelDisplayOnly\" ");

		this.InfoLabel.setDisplayOnly(true);
		sap.ui.getCore().applyChanges();
		assert.ok(this.InfoLabel.$().hasClass("sapTntInfoLabelDisplayOnly"), "should have style class \"sapTntInfoLabelDisplayOnly\" ");
	});

	QUnit.test("Setting empty text", function (assert) {
		assert.ok(this.InfoLabel.$().hasClass("sapTntInfoLabelNoText"), "should have style class \"sapTntInfoLabelNoText\" ");

		this.InfoLabel.setText("Test text");
		sap.ui.getCore().applyChanges();
		assert.notOk(this.InfoLabel.$().hasClass("sapTntInfoLabelNoText"), "should not have style class \"sapTntInfoLabelNoText\" ");

		this.InfoLabel.setText("");
		sap.ui.getCore().applyChanges();
		assert.ok(this.InfoLabel.$().hasClass("sapTntInfoLabelNoText"), "should have style class \"sapTntInfoLabelNoText\" ");
	});

	QUnit.test("testing textDirection", function (assert) {
		assert.strictEqual(this.InfoLabel.getTextDirection(), "Inherit", "InfoLabel text initially should have text direction \"Inherit\"");

		this.InfoLabel.setTextDirection(sap.ui.core.TextDirection.RTL);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.InfoLabel.getTextDirection(), "RTL", "InfoLabel should have textDirection \"RTL\"");
		assert.strictEqual(jQuery(this.InfoLabel.getDomRef().getElementsByClassName("sapTntInfoLabelInner")[0]).attr("dir"), "rtl", "InfoLabel \"dir\" attribute should be \"rtl\"");
	});

	QUnit.test("testing icon", function (assert) {
		this.InfoLabel.setIcon("sap-icon://show");
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery(this.InfoLabel.getDomRef().getElementsByClassName("sapTntInfoLabelWithIcon")[0]), "There is a span with an icon rendered");
	});

	QUnit.module("Appearance", {
		beforeEach: function () {
			this.InfoLabel = new InfoLabel("iLabel1").placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.InfoLabel.destroy();
			this.InfoLabel = null;
		}
	});

	QUnit.test("changing renderMode property", function (assert) {
		assert.strictEqual(this.InfoLabel.getRenderMode(), tntLibrary.RenderMode.Loose, "Initially renderMode is set to sap.tnt.RenderMode.Loose (\"Loose\") ");

		this.InfoLabel.setRenderMode(tntLibrary.RenderMode.Narrow);
		this.InfoLabel.setText("3,14");
		assert.strictEqual(this.InfoLabel.getRenderMode(), tntLibrary.RenderMode.Narrow, "renderMode is set to sap.tnt.RenderMode.Narrow (\"Narrow\") ");
	});

	QUnit.test("changing colorScheme property", function (assert) {
		var warningFunctionSpy = sinon.spy(log, "warning");

		assert.strictEqual(this.InfoLabel.getColorScheme(), 7, "Initially colorScheme is set to 7");

		this.InfoLabel.setColorScheme(1);
		assert.strictEqual(this.InfoLabel.getColorScheme(), 1, "colorScheme is set to 1");

		this.InfoLabel.setColorScheme(67544);
		assert.strictEqual(this.InfoLabel.getColorScheme(), 1, "If we try to set invalid number as value colorScheme is set to 1");
		assert.strictEqual(warningFunctionSpy.callCount, 1, "A warning should be raised when we try to set invalid number as value of colorScheme");

		this.InfoLabel.setColorScheme(undefined);
		assert.strictEqual(this.InfoLabel.getColorScheme(), 7, "If we try to set undefined as value colorScheme is set to default (7)");

		this.InfoLabel.setColorScheme(null);
		assert.strictEqual(this.InfoLabel.getColorScheme(), 7, "If we try to set null as value colorScheme is set to default (7)");

		this.InfoLabel.setColorScheme(1);
		assert.strictEqual(this.InfoLabel.getColorScheme(), 1, "If we try to set same number as value colorScheme is set to 1");

		log.warning.restore();
	});

	QUnit.test("checking return value when call setColorScheme", function (assert) {
		assert.strictEqual(this.InfoLabel.setColorScheme().toString(), "Element sap.tnt.InfoLabel#iLabel1", "Return value is this InfoLabel");
	});

	QUnit.test("check if setting colorScheme triggers rerendering", function (assert) {
		var fnOnBeforeRenderingSpy = sinon.spy(this.InfoLabel, "onBeforeRendering");
		this.InfoLabel.setColorScheme(1);
		assert.strictEqual(fnOnBeforeRenderingSpy.callCount, 0, "the InfoLabel should not be rerendered");
		this.InfoLabel.onBeforeRendering.restore();
	});

	QUnit.test("check if setting colorScheme trigers setProperty", function (assert) {
		var fnSetPropertySpy = sinon.spy(this.InfoLabel, "setProperty");
		this.InfoLabel.setColorScheme(1);
		assert.strictEqual(fnSetPropertySpy.callCount, 1, "the InfoLabel should call setProperty once");
		this.InfoLabel.setProperty.restore();
	});

	QUnit.test("check setting colorScheme classes ", function (assert) {
		assert.ok(this.InfoLabel.$().hasClass("backgroundColor7"), "should have style class \"backgroundColor7\" ");

		this.InfoLabel.setColorScheme(1);
		assert.notOk(this.InfoLabel.$().hasClass("backgroundColor7"), "should not have style class \"backgroundColor7\" ");
		assert.ok(this.InfoLabel.$().hasClass("backgroundColor1"), "should have style class \"backgroundColor1\" ");
	});

	QUnit.test("changing width property", function (assert) {
		this.InfoLabel.setWidth("120px");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.InfoLabel.getWidth(), "120px", "width is set to 120px");
	});

	QUnit.test("changing displayOnly property", function (assert) {
		this.InfoLabel.setDisplayOnly(true);
		assert.strictEqual(this.InfoLabel.getDisplayOnly(), true, "displayOnly is set to true");
	});

	QUnit.test("checking if there is no text", function (assert) {
		this.InfoLabel.setText("available");
		this.InfoLabel.setText("");
		assert.strictEqual(this.InfoLabel.getText(), "", "There is no text");
	});

	QUnit.module("API", {
		beforeEach: function () {
			this.InfoLabel = new InfoLabel("iLabel1").placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.InfoLabel.destroy();
			this.InfoLabel = null;
		}
	});

	QUnit.test("setting text property", function (assert) {
		assert.strictEqual(this.InfoLabel.getText(), "", "Text is initially set to \"\" ");

		this.InfoLabel.setText("Now available");
		assert.strictEqual(this.InfoLabel.getText(), "Now available", "Text from the getter should be set to \"Now available\" ");
		assert.strictEqual(this.InfoLabel.getDomRef().getElementsByClassName("sapTntInfoLabelInner")[0].textContent, "Now available", "Text from the DOM element should be set to \"Now available\"");

		this.InfoLabel.setText(456567);
		assert.strictEqual(this.InfoLabel.getText(), "456567", "Text from the getter should be set to \"456567\" ");
		assert.strictEqual(this.InfoLabel.getDomRef().getElementsByClassName("sapTntInfoLabelInner")[0].textContent, "456567", "Text from the DOM element should be set to \"456567\" ");

		this.InfoLabel.setText(undefined);
		assert.strictEqual(this.InfoLabel.getText(), "", "When try to set undefined text should be with default value \"\" ");
		assert.strictEqual(this.InfoLabel.getDomRef().getElementsByClassName("sapTntInfoLabelInner")[0].textContent, "", "Text from the DOM element should be with default value \"\"");

		this.InfoLabel.setText(null);
		assert.strictEqual(this.InfoLabel.getText(), "", "When try to set null text should be with default value \"\" ");
		assert.strictEqual(this.InfoLabel.getDomRef().getElementsByClassName("sapTntInfoLabelInner")[0].textContent, "", "Text from the DOM element should be with default value \"\"");


		this.InfoLabel.setText(456567);
		assert.strictEqual(this.InfoLabel.getText(), "456567", "Text from the getter should be set to \"456567\" ");
		assert.strictEqual(this.InfoLabel.getDomRef().getElementsByClassName("sapTntInfoLabelInner")[0].textContent, "456567", "Text from the DOM element should be set to \"456567\"");

		this.InfoLabel.setText(true);
		assert.strictEqual(this.InfoLabel.getText(), "true", "Text from the getter should be set to \"true\" ");
		assert.strictEqual(this.InfoLabel.getDomRef().getElementsByClassName("sapTntInfoLabelInner")[0].textContent, "true", "Text from the DOM element should be set to \"true\"");

		this.InfoLabel.setText(false);
		assert.strictEqual(this.InfoLabel.getText(), "false", "Text from the getter should be set to \"false\" ");
		assert.strictEqual(this.InfoLabel.getDomRef().getElementsByClassName("sapTntInfoLabelInner")[0].textContent, "false", "Text from the DOM element should be set to \"false\"");

		this.InfoLabel.setText("alert('here')");
		assert.strictEqual(this.InfoLabel.getText(), "alert('here')", "Text from the getter should be set to \"alert('here')\" ");
		assert.strictEqual(this.InfoLabel.getDomRef().getElementsByClassName("sapTntInfoLabelInner")[0].textContent, "alert('here')", "Text from the DOM element should be set to \"alert('here')\"");
	});

	QUnit.test("checking return value when call setText", function (assert) {
		assert.strictEqual(this.InfoLabel.setText().toString(), "Element sap.tnt.InfoLabel#iLabel1", "Return value is this InfoLabel");
	});

	QUnit.test("check if setting text trigers rerendering", function (assert) {
		var fnOnBeforeRenderingSpy = sinon.spy(this.InfoLabel, "onBeforeRendering");
		this.InfoLabel.setText("Now available");
		assert.strictEqual(fnOnBeforeRenderingSpy.callCount, 0, "the InfoLabel should not be rerendered");
		this.InfoLabel.onBeforeRendering.restore();
	});

	QUnit.test("check if setting text trigers setProperty", function (assert) {
		var fnSetPropertySpy = sinon.spy(this.InfoLabel, "setProperty");
		this.InfoLabel.setText("Now available");
		assert.strictEqual(fnSetPropertySpy.callCount, 1, "the InfoLabel should call setProperty once");
		this.InfoLabel.setProperty.restore();
	});

	QUnit.test("testing if the Form is stopped to adjust the width of InfoLabel", function (assert) {
		assert.strictEqual(this.InfoLabel.getFormDoNotAdjustWidth(), true, "FormDoNotAdjustWidt returns true");
	});

	QUnit.module("Accessibility", {
		beforeEach: function () {
			this.InfoLabel = new InfoLabel("iLabel1").placeAt("qunit-fixture");
			this.InfoLabelNotEmpty = new InfoLabel({text: "Available"}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.InfoLabel.destroy();
			this.InfoLabel = null;
			this.InfoLabelNotEmpty.destroy();
			this.InfoLabelNotEmpty = null;
		}
	});

	QUnit.test("testing if the invisible text is added", function (assert) {
		assert.strictEqual(this.InfoLabel.getDomRef().childElementCount, 2, "InfoLabel should have 2 spans inside - one for the visible text and one for the invisible");
	});

	QUnit.test("testing if the invisible text is added", function (assert) {
		assert.strictEqual(this.InfoLabel.getDomRef().getElementsByClassName("sapUiPseudoInvisibleText")[0].textContent, "Empty info label", "InfoLabel initially should have invisible text \"Empty info labell\"");

		this.InfoLabel.setText("available");
		assert.strictEqual(this.InfoLabel.getDomRef().getElementsByClassName("sapUiPseudoInvisibleText")[0].textContent, "Info label", "InfoLabel should have invisible text \"Info label\"");

		this.InfoLabel.setText("");
		assert.strictEqual(this.InfoLabel.getDomRef().getElementsByClassName("sapUiPseudoInvisibleText")[0].textContent, "Empty info label", "InfoLabel should have invisible text \"Empty info label\"");
	});

	QUnit.test("testing if the invisible text class is added", function (assert) {
		this.InfoLabel.setText("available");
		assert.ok(this.InfoLabel.getDomRef().getElementsByClassName("sapUiPseudoInvisibleText"), "InfoLabel should have span with invisible text with class \"sapUiPseudoInvisibleText\"");
	});

	QUnit.test("testing initially not empty InfoLabel", function (assert) {
		assert.strictEqual(this.InfoLabelNotEmpty.getDomRef().getElementsByClassName("sapUiPseudoInvisibleText")[0].textContent, "Info label", "InfoLabel initially should have invisible text \"Info label\"");
	});
});