/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/TextField",
	"sap/ui/core/library",
	"sap/ui/commons/library",
	"sap/ui/commons/Label",
	"sap/ui/core/Control"
], function(
	createAndAppendDiv,
	TextField,
	coreLibrary,
	commonsLibrary,
	Label,
	Control
) {
	"use strict";

	// shortcut for sap.ui.commons.LabelDesign
	var LabelDesign = commonsLibrary.LabelDesign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3"]);



	var oTextField = new TextField("t1");

	var sText = "Hello",
		sIcon = "test-resources/sap/ui/commons/images/open.png",
		sWidth = "111px",
		bVisible = true,
		oTextAlign = TextAlign.End,
		bWrapping = false,
		oTextDirection = TextDirection.RTL,
		oDesign = LabelDesign.Bold;

	var oLabel1 = new Label("l1");
	oLabel1.setText(sText);
	oLabel1.setIcon(sIcon);
	oLabel1.setWidth(sWidth);
	oLabel1.setVisible(bVisible);
	oLabel1.setTextAlign(oTextAlign);
	oLabel1.setWrapping(bWrapping);
	oLabel1.setTextDirection(oTextDirection);
	oLabel1.setDesign(oDesign);
	oLabel1.setLabelFor(oTextField);
	oLabel1.placeAt("uiArea1");

	var oLabel2 = new Label("l2", {
		text : sText,
		icon : sIcon,
		width : sWidth,
		visible : bVisible,
		textAlign : oTextAlign,
		wrapping : bWrapping,
		textDirection : oTextDirection,
		design : oDesign,
		labelFor : "t1"
	});
	oLabel2.placeAt("uiArea2");

	var l1, l2;

	QUnit.module("Basic", {
		beforeEach : function(assert) {
			l1 = sap.ui.getCore().getControl("l1");
			l2 = sap.ui.getCore().getControl("l2");

			l1.setDesign(oDesign);
			l1.setTextDirection(oTextDirection);

			l2.setWidth(sWidth);

			sap.ui.getCore().applyChanges();

			assert.ok(l1, "l1 should not be null");
			assert.ok(l2, "l2 should not be null");
		},
		afterEach : function() {
			l1 = null;
			l2 = null;
		}
	});

	// test property accessor methods

	QUnit.test("TextOk", function(assert) {
		assert.strictEqual(l1.getText(), sText, "l1.getText() returns wrong result");
		assert.strictEqual(l2.getText(), sText, "l2.getText() returns wrong result");
	});

	QUnit.test("IconOk", function(assert) {
		assert.strictEqual(l1.getIcon(), sIcon, "l1.getIcon() returns wrong result");
		assert.strictEqual(l2.getIcon(), sIcon, "l2.getIcon() returns wrong result");
	});

	QUnit.test("WidthOk", function(assert) {
		assert.strictEqual(l1.getWidth(), sWidth, "l1.getWidth() returns wrong result");
		assert.strictEqual(l2.getWidth(), sWidth, "l2.getWidth() returns wrong result");
	});

	QUnit.test("WrappingOk", function(assert) {
		assert.strictEqual(l1.getWrapping(), bWrapping, "l1.getWrapping() returns wrong result");
		assert.strictEqual(l2.getWrapping(), bWrapping, "l2.getWrapping() returns wrong result");
	});

	QUnit.test("VisibleOk", function(assert) {
		assert.strictEqual(l1.getVisible(), bVisible, "l1.getVisible() returns wrong result");
		assert.strictEqual(l2.getVisible(), bVisible, "l2.getVisible() returns wrong result");
	});

	QUnit.test("TextAlignOk", function(assert) {
		assert.strictEqual(l1.getTextAlign(), oTextAlign, "l1.getTextAlign() returns wrong result");
		assert.strictEqual(l2.getTextAlign(), oTextAlign, "l2.getTextAlign() returns wrong result");
	});

	QUnit.test("TextDirectionOk", function(assert) {
		assert.strictEqual(l1.getTextDirection(), oTextDirection, "l1.getTextDirection() returns wrong result");
		assert.strictEqual(l2.getTextDirection(), oTextDirection, "l2.getTextDirection() returns wrong result");
	});

	QUnit.test("DesignOk", function(assert) {
		assert.strictEqual(l1.getDesign(), oDesign, "l1.getDesign() returns wrong result");
		assert.strictEqual(l2.getDesign(), oDesign, "l2.getDesign() returns wrong result");
	});

	// test misc (control interaction, metadata, styles, etc.)

	QUnit.test("CssClassesOk", function(assert) {
		var sClasses = window.document.getElementById("l1").className;
		assert.notStrictEqual(sClasses, null, "sClasses is null");
		assert.ok(sClasses.indexOf("sapUiLbl") > -1, "l1 className is missing 'sapUiLbl'");
		assert.ok(sClasses.indexOf("sapUiLblEmph") > -1, "l1 className is missing 'sapUiLblEmph'");
	});

	QUnit.test("CssClassesAfterSetDesignStandardOk", function(assert) {
		l1.setDesign(LabelDesign.Standard);
		sap.ui.getCore().applyChanges();
		var sClasses = window.document.getElementById("l1").className;
		assert.ok(sClasses.indexOf("sapUiLblEmph") == -1, "l1 className still contains 'sapUiLblEmph'");
	});

	function isEmpty(oObject) {
		for (var i in oObject) { // eslint-disable-line no-unused-vars
			return false;
		}
		return true;
	}

	QUnit.test("MetadataOk", function(assert) {
		var oMetadata = l1.getMetadata();
		assert.ok(oMetadata !== null, "l1.getMetadata() should not be null");
		assert.ok(oMetadata.getParent() != null, "l1.getMetadata().getParent() should not be null");
		assert.ok(Control.getMetadata() === oMetadata.getParent());
		assert.strictEqual(oMetadata.getProperties()["text"]["type"], "string");
		assert.ok(isEmpty(oMetadata.getAggregations()));
		assert.ok(oMetadata.getAssociations() !== undefined);
		assert.ok(oMetadata.getAssociations()["labelFor"] !== undefined);
	});

	QUnit.test("DirectionStyleOk", function(assert) {
		var sDir = l1.$().css("direction");
		assert.strictEqual(sDir && sDir.toUpperCase(), oTextDirection, "l1 dir is not 'RTL'");

		sDir = l2.$().css("direction");
		assert.strictEqual(sDir && sDir.toUpperCase(), oTextDirection, "l2 dir is not 'RTL'");
	});

	QUnit.test("TextDirectionChangeOk", function(assert) {
		l1.setTextDirection(TextDirection.LTR);
		sap.ui.getCore().applyChanges();
		var sDir = l1.$().css("direction");
		assert.strictEqual(sDir && sDir.toUpperCase(), TextDirection.LTR, "l1 dir is not 'LTR'");
	});

	QUnit.test("OffsetWidthOk", function(assert) {
		//test the pixel perfect width of the control
		var oDomRef = window.document.getElementById("l1");
		assert.strictEqual(oDomRef.offsetWidth, parseInt(l1.getWidth()), "l1.offsetWidth should equal parseInt(l1.getWidth())");

		l2.setWidth("1000px");
		sap.ui.getCore().applyChanges();
		oDomRef = window.document.getElementById("l2");
		assert.strictEqual(oDomRef.offsetWidth, 1000, "l2.offsetWidth should equal 1000");
	});

	QUnit.test("RequiredIndicatorOk", function(assert) {
		assert.ok(!l1.$().hasClass("sapUiLblReq"), "l1 has no class 'sapUiLblReq'");
		oTextField.setRequired(true);
		sap.ui.getCore().applyChanges();
		assert.ok(l1.$().hasClass("sapUiLblReq"), "l1 has class 'sapUiLblReq'");
		l1.setRequired(true);
		sap.ui.getCore().applyChanges();
		assert.ok(l1.$().hasClass("sapUiLblReq"), "l1 has class 'sapUiLblReq'");
		oTextField.setRequired(false);
		sap.ui.getCore().applyChanges();
		assert.ok(l1.$().hasClass("sapUiLblReq"), "l1 has class 'sapUiLblReq'");
		assert.ok(l1.$().hasClass("sapUiLblReqEnd"), "l1 has class 'sapUiLblReqEnd'");
		assert.ok(!l1.$().hasClass("sapUiLblReqBeg"), "l1 has no class 'sapUiLblReqBeg'");
		l1.setRequired(false);
		sap.ui.getCore().applyChanges();
		assert.ok(!l1.$().hasClass("sapUiLblReq"), "l1 has no class 'sapUiLblReq'");
		assert.ok(!l1.$().hasClass("sapUiLblReqBeg"), "l1 has no class 'sapUiLblReqBeg'");
		assert.ok(!l1.$().hasClass("sapUiLblReqEnd"), "l1 has no class 'sapUiLblReqEnd'");
		l1.setRequired(true);
		l1.setRequiredAtBegin(true);
		sap.ui.getCore().applyChanges();
		assert.ok(l1.$().hasClass("sapUiLblReq"), "l1 has class 'sapUiLblReq'");
		assert.ok(l1.$().hasClass("sapUiLblReqBeg"), "l1 has class 'sapUiLblReqBeg'");
		assert.ok(!l1.$().hasClass("sapUiLblReqEnd"), "l1 has no class 'sapUiLblReqEnd'");
	});

	// test methods

	QUnit.module("Methods", {
		beforeEach: function (assert) {
			this.oLabel3 = new Label('label3', {text: 'Label 3'});
			assert.ok(this.oLabel3, "oLabel3 should not be null");
		},
		afterEach: function () {
			this.oLabel3 = null;
		}
	});

	QUnit.test("On exit call", function(assert) {
		var fnExitSpy = sinon.spy(this.oLabel3, "exit");
		this.oLabel3.destroy();

		assert.strictEqual(fnExitSpy.callCount, 1, "Should call exit() method");
	});

	QUnit.test("On onBeforeRendering call", function(assert) {
		var fnExitSpy = sinon.spy(this.oLabel3, "onBeforeRendering");
		this.oLabel3.placeAt("uiArea3");
		sap.ui.getCore().applyChanges();

		if (this.oLabel3.oForTooltip) {
			assert.strictEqual(this.oLabel3.oForTooltip, null, "oForTooltip should be cleared");
		}

		assert.strictEqual(fnExitSpy.callCount, 1, "Should call onBeforeRendering () method");
	});
});