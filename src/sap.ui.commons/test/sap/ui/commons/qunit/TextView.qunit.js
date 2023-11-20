/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/TextView",
	"sap/ui/commons/library",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/library"
], function(
	createAndAppendDiv,
	TextView,
	commonsLibrary,
	jQuery,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.ui.core.AccessibleRole
	var AccessibleRole = coreLibrary.AccessibleRole;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.commons.TextViewColor
	var TextViewColor = commonsLibrary.TextViewColor;

	// shortcut for sap.ui.commons.TextViewDesign
	var TextViewDesign = commonsLibrary.TextViewDesign;


	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3"]);



	var oTV1 = new TextView("TV1");
	oTV1.setText("This is a simple Text for the QUnit Test.");

	oTV1.placeAt("uiArea1");

	var oTV2 = new TextView("TV2");
	oTV2.setText("This is a multiline Text to test wrapping in the QUnit test.\n This is the second line. \n This is the third line.");
	oTV2.setWidth("165px");

	oTV2.placeAt("uiArea2");

	var oTV3 = new TextView("TV3");
	oTV3.setText("This Text should NOT be visible.");
	oTV3.setVisible(false);

	oTV3.placeAt("uiArea3");

	// TEST functions

	QUnit.module("Properties");

	QUnit.test("Default Values", function(assert) {
		assert.equal(oTV1.getEnabled(), true, "Enabled");
		assert.equal(oTV1.getDesign(), TextViewDesign.Standard, "Design");
		assert.equal(oTV1.getSemanticColor(), TextViewColor.Default, "SemanticColor");
		assert.equal(oTV1.getWrapping(), true, "Wrapping");
		assert.equal(oTV1.getWidth(), "", "Width");
	});

	QUnit.module("Appearance");

	QUnit.test("Visibility", function(assert) {
		// Visible
		assert.ok(jQuery("#TV1").get(0), "Visible, expected defined");
		assert.equal(jQuery("#TV3").get(0), undefined, "Invisible");
	});

	QUnit.test("Text Output", function(assert) {
		// check if result is in HTML
		var oTVDom = document.getElementById('TV1');
		assert.equal(oTVDom.innerHTML,"This is a simple Text for the QUnit Test.", "Displayed Text");

		// is text escaped
		oTV1.setText("~!@#$%^&*()_+{}:\"|<>?\'\"><script>alert('xss')<\/script>");
		sap.ui.getCore().applyChanges();
		oTVDom = document.getElementById('TV1');
		assert.equal(jQuery(oTVDom).text(),"~!@#$%^&*()_+{}:\"|<>?\'\"><script>alert('xss')<\/script>", "Escaping HTML-Text");
	});

	QUnit.test("Wrapping", function(assert) {
		// wrapping on/off
		var	oTVDom = document.getElementById('TV1');
		var iLineHeight = oTVDom.clientHeight;
		oTVDom = document.getElementById('TV2');
		assert.equal(oTVDom.clientHeight,(iLineHeight * 4), "Wrapping TRUE, 4 Lines (line-height: 21)");

		oTV2.setWrapping(false);
		sap.ui.getCore().applyChanges();
		oTVDom = document.getElementById('TV2');
		assert.equal(oTVDom.clientHeight,(iLineHeight * 3), "Wrapping FALSE, 3 Lines (line-height: 21)");
	});

	QUnit.test("Width", function(assert) {
		// width -> cutting
		var oTVDom = document.getElementById('TV2');
		assert.equal(oTVDom.clientWidth,165, "Defined width");
		assert.ok(oTVDom.clientWidth < oTVDom.scrollWidth, "Text ist cut: defined true");
	});

	QUnit.test("Semantic colors", function(assert) {
		// colors
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvSucc"), "CSS class for positive NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvErr"), "CSS class for negative NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvWarn"), "CSS class for critical NOT set");

		oTV1.setSemanticColor(TextViewColor.Positive);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#TV1").hasClass("sapUiTvSucc"), "CSS class for positive set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvErr"), "CSS class for negative NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvWarn"), "CSS class for critical NOT set");

		oTV1.setSemanticColor(TextViewColor.Critical);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvSucc"), "CSS class for positive NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvErr"), "CSS class for negative NOT set");
		assert.ok(jQuery("#TV1").hasClass("sapUiTvWarn"), "CSS class for critical set");

		oTV1.setSemanticColor(TextViewColor.Negative);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvSucc"), "CSS class for positive NOT set");
		assert.ok(jQuery("#TV1").hasClass("sapUiTvErr"), "CSS class for negative set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvWarn"), "CSS class for critical NOT set");
	});

	QUnit.test("Design", function(assert) {
		// Design
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvEmph"), "CSS class for bold NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvItalic"), "CSS class for italic NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvULine"), "CSS class for underline NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvSmall"), "CSS class for small NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvMono"), "CSS class for monospace NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvH1"), "CSS class for H1 NOT set");

		oTV1.setDesign(TextViewDesign.Bold);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#TV1").hasClass("sapUiTvEmph"), "CSS class for bold set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvItalic"), "CSS class for italic NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvULine"), "CSS class for underline NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvSmall"), "CSS class for small NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvMono"), "CSS class for monospace NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvH1"), "CSS class for H1 NOT set");

		oTV1.setDesign(TextViewDesign.Italic);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvEmph"), "CSS class for bold NOT set");
		assert.ok(jQuery("#TV1").hasClass("sapUiTvItalic"), "CSS class for italic set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvULine"), "CSS class for underline NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvSmall"), "CSS class for small NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvMono"), "CSS class for monospace NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvH1"), "CSS class for H1 NOT set");

		oTV1.setDesign(TextViewDesign.Underline);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvEmph"), "CSS class for bold NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvItalic"), "CSS class for italic NOT set");
		assert.ok(jQuery("#TV1").hasClass("sapUiTvULine"), "CSS class for underline set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvSmall"), "CSS class for small NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvMono"), "CSS class for monospace NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvH1"), "CSS class for H1 NOT set");

		oTV1.setDesign(TextViewDesign.Small);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvEmph"), "CSS class for bold NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvItalic"), "CSS class for italic NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvULine"), "CSS class for underline NOT set");
		assert.ok(jQuery("#TV1").hasClass("sapUiTvSmall"), "CSS class for small set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvMono"), "CSS class for monospace NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvH1"), "CSS class for H1 NOT set");

		oTV1.setDesign(TextViewDesign.Monospace);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvEmph"), "CSS class for bold NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvItalic"), "CSS class for italic NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvULine"), "CSS class for underline NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvSmall"), "CSS class for small NOT set");
		assert.ok(jQuery("#TV1").hasClass("sapUiTvMono"), "CSS class for monospace set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvH1"), "CSS class for H1 NOT set");

		oTV1.setDesign(TextViewDesign.H1);
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvEmph"), "CSS class for bold NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvItalic"), "CSS class for italic NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvULine"), "CSS class for underline NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvSmall"), "CSS class for small NOT set");
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvMono"), "CSS class for monospace NOT set");
		assert.ok(jQuery("#TV1").hasClass("sapUiTvH1"), "CSS class for H1 set");

		oTV1.setDesign(TextViewDesign.H2);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#TV1").hasClass("sapUiTvH2"), "CSS class for H2 set");

		oTV1.setDesign(TextViewDesign.H3);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#TV1").hasClass("sapUiTvH3"), "CSS class for H3 set");

		oTV1.setDesign(TextViewDesign.H4);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#TV1").hasClass("sapUiTvH4"), "CSS class for H4 set");
	});

	QUnit.test("Disabled", function(assert) {
		// disabled - tabindex
		assert.ok(!jQuery("#TV1").hasClass("sapUiTvDsbl"), "CSS class for disabled NOT set");
		oTV1.setDesign(TextViewDesign.Standard);
		oTV1.setEnabled(false);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#TV1").hasClass("sapUiTvDsbl"), "CSS class for disabled set");
	});

	QUnit.test("Text Align", function(assert) {
		// text align
		oTV1.setDesign(TextViewDesign.Standard);
		oTV1.setEnabled(true);
		sap.ui.getCore().applyChanges();
		var oTVDom = document.getElementById('TV1');
		assert.equal(jQuery(oTVDom).css("text-align"),"left","Default (Begin) Text Align");

		oTV1.setTextAlign(TextAlign.Right);
		sap.ui.getCore().applyChanges();
		oTVDom = document.getElementById('TV1');
		assert.equal(jQuery(oTVDom).css("text-align"),"right","Text Align Right");

		oTV1.setTextAlign(TextAlign.End);
		sap.ui.getCore().applyChanges();
		oTVDom = document.getElementById('TV1');
		assert.equal(jQuery(oTVDom).css("text-align"),"right","Text Align End");

		oTV1.setTextDirection(TextDirection.RTL);
		sap.ui.getCore().applyChanges();
		oTVDom = document.getElementById('TV1');
		assert.equal(jQuery(oTVDom).css("text-align"),"left","Text Align End in RTL");

		oTV1.setTextAlign(TextAlign.Left);
		sap.ui.getCore().applyChanges();
		oTVDom = document.getElementById('TV1');
		assert.equal(jQuery(oTVDom).css("text-align"),"left","Text Align Left in RTL");

		oTV1.setTextDirection(TextDirection.Inherit);
		oTV1.setTextAlign(TextAlign.Begin);

		oTV1.setAccessibleRole(AccessibleRole.Document);
	});

	QUnit.test("Null Text", function(assert) {
		assert.expect(2);


		oTV1.setText(null);
		var oTVDom;
		try {
			sap.ui.getCore().applyChanges();
			oTVDom = document.getElementById('TV1');
			assert.equal(oTVDom.innerHTML,"", "Null Text");
		} catch (e) {
			// do nothing -> check is nit exectites in error case and "expect" brings error
		}

		oTV1.setText("Hello World!");
		sap.ui.getCore().applyChanges();
		oTVDom = document.getElementById('TV1');
		assert.equal(oTVDom.innerHTML,"Hello World!", "Text entered again");
	});

	QUnit.test("ARIA", function(assert) {
		var oTV1Dom = document.getElementById('TV1');
		var oTVDom = document.getElementById('TV2');
		assert.equal(jQuery(oTV1Dom).attr("role"),"document","ARIA role 'document'");
		assert.equal(jQuery(oTVDom).attr("role"),undefined,"ARIA role default");
		assert.equal(jQuery(oTVDom).attr("aria-disabled"),"false","ARIA-disabled: for enabled field");
		assert.equal(jQuery(oTVDom).attr("aria-invalid"),"false","ARIA-invalid: for normal field");

		oTVDom = document.getElementById('TV1');
		assert.equal(jQuery(oTVDom).attr("aria-invalid"),"true","ARIA-invalid: for negative field");

		oTV1.setSemanticColor(TextViewColor.Default);
		oTV1.setEnabled(false);
		sap.ui.getCore().applyChanges();
		oTVDom = document.getElementById('TV1');
		assert.equal(jQuery(oTVDom).attr("aria-disabled"),"true","ARIA-disabled: for disabled field");

	});
});