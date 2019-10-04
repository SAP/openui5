/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/m/Text",
	"jquery.sap.global"
], function(
	createAndAppendDiv,
	coreLibrary,
	mobileLibrary,
	JSONModel,
	Text,
	jQuery
) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	// shortcut for sap.ui.core.TextDirection
	var WrappingType = mobileLibrary.WrappingType;

	createAndAppendDiv("content1");
	createAndAppendDiv("content2");
	createAndAppendDiv("content3");
	createAndAppendDiv("content4");
	createAndAppendDiv("content5");
	createAndAppendDiv("content6");
	createAndAppendDiv("content64");
	createAndAppendDiv("content65");
	createAndAppendDiv("content66");
	createAndAppendDiv("content67");
	createAndAppendDiv("content68");
	createAndAppendDiv("content69");
	createAndAppendDiv("content8");
	createAndAppendDiv("content91");
	createAndAppendDiv("content92");
	var sView1 =
		"<mvc:View xmlns=\"sap.m\" xmlns:mvc=\"sap.ui.core.mvc\" controllerName=\"myController\">" +
		"    <Text id=\"xmltext1\" text=\"Should visualize tab&#009;and new line&#xA;and escaped \n and \t\" renderWhitespace=\"true\" width=\"100%\"></Text>" +
		"    <Text id=\"xmltext2\" text=\"{/text}\" renderWhitespace=\"true\" width=\"100%\"></Text>" +
		"</mvc:View>";


	sap.ui.controller("myController", {
		doSomething: function() {
			//something
		}
	});

	var oData2 = {text: "Should visualize tab\tand new line\nand escaped \\n and \\t from binding"};
	var myView = sap.ui.xmlview({viewContent:sView1, type:ViewType.XML});
	var oModel2 = new JSONModel();

	oModel2.setData(oData2);
	myView.setModel(oModel2);

	myView.placeAt('content64');


	function countLines(oControl) {
		return Math.round(oControl.$().height() / oControl.getLineHeight());
	}

	// add text instances
	// ==================

	var t1 = new Text("Text1");
	t1.setText("This is a simple Text.");
	sap.ui.setRoot("content1", t1);

	var t2 = new Text("Text2");
	t2.setText("This is a multiline long Text to test wrapping.\n This is the second line. \n This is the third line.");
	t2.setWidth("155px");
	sap.ui.setRoot("content2", t2);

	var t3 = new Text("Text3");
	t3.setText("This Text should NOT be visible.");
	t3.setVisible(false);
	sap.ui.setRoot("content3", t3);

	var t4 = new Text("Text4");
	t4.setText("This text is not wrapping.\n Line breaks cannot make it wrap");
	t4.setWrapping(false);
	sap.ui.setRoot("content4", t4);

	var t5 = new Text("Text5");
	t5.setText(new Array(100).join("This is a very long Text "));
	t5.setMaxLines(3);
	t5.setWidth("400px");
	sap.ui.setRoot("content5", t5);

	var t6 = new Text("Text6", {text:""});
	sap.ui.setRoot("content6", t6);

	var t8 = new Text("Text8", {text: "pneumonoultramicroscopicsilicovolcanoconiosis"}); // longest word in English
		t8.setWidth("400px");
		t8.setWrapping(true);
		t8.setWrappingType("Hyphenated");
		sap.ui.setRoot("content8", t8);

	// run tests
	// =========

	QUnit.module("Properties");
	var oCore = sap.ui.getCore();
	var oDom;

	QUnit.test("Default Values", function(assert) {
		assert.equal(t1.getTextDirection(), "Inherit", "text direction");
		assert.equal(t1.getVisible(), true, "visible");
		assert.equal(t1.getWrapping(), true, "wrapping");
		assert.equal(t1.getTextAlign(), TextAlign.Begin, "text align");
		assert.equal(t1.getWidth(), "", "width");
	});

	QUnit.module("Appearance");

	QUnit.test("Visibility", function(assert) {
		// test if visible
		assert.ok(jQuery("#Text1").get(0), "Text 1 Visible");
		// test if invisible
		assert.equal(jQuery("#Text3").get(0), undefined, "Text 3 Invisible");
	});

	QUnit.test("Text Output", function(assert) {
		// test if result is in HTML
		oDom = jQuery.sap.domById('Text1');
		assert.equal(oDom.innerHTML,"This is a simple Text.", "Displayed Text");
		// test if text is escaped
		t1.setText("~!@#$%^&*()_+{}:\"|<>?\'\"><script>alert('xss')<\/script>");
		oCore.applyChanges();
		oDom = jQuery.sap.domById('Text1');
		assert.equal(jQuery(oDom).text(),"~!@#$%^&*()_+{}:\"|<>?\'\"><script>alert('xss')<\/script>", "Escaping HTML-Text");
	});

	/*test("Wrapping", function() {
		// test line height with wrapping on
		oDom = jQuery.sap.domById('Text1');
		var iLineHeight1 = oDom.clientHeight;
		oDom = jQuery.sap.domById('Text2');
		var iLineHeight2 = oDom.clientHeight;
		assert.equal(iLineHeight2, iLineHeight1 * 5, "Wrapping on => 5 Lines (lineheight: " + iLineHeight1 +")");
		// test line height with wrapping off
		t2.setWrapping(false);
		oCore.applyChanges();
		oDom = jQuery.sap.domById('Text2');
		iLineHeight2 = oDom.clientHeight;
		assert.equal(iLineHeight2, iLineHeight1 * 3, "Wrapping off => 3 Lines (lineheight: " + iLineHeight1 +")");
	});*/

	QUnit.test("Width", function(assert) {
		oDom = jQuery.sap.domById('Text2');
		assert.equal(oDom.style.width, "155px", "Defined width");
	});

	QUnit.test("Text Align & RTL", function(assert) {
		// default
		oCore.applyChanges();
		oDom = jQuery.sap.domById('Text1');
		assert.equal(jQuery(oDom).css("text-align"),"left","Default (Begin) Text Align");
		// right
		t1.setTextAlign(TextAlign.Right);
		oCore.applyChanges();
		oDom = jQuery.sap.domById('Text1');
		assert.equal(jQuery(oDom).css("text-align"),"right","Text Align Right");
		// end
		t1.setTextAlign(TextAlign.End);
		oCore.applyChanges();
		oDom = jQuery.sap.domById('Text1');
		assert.equal(jQuery(oDom).css("text-align"),"right","Text Align End");
		// RTL end
		t1.setTextDirection(TextDirection.RTL);
		oCore.applyChanges();
		oDom = jQuery.sap.domById('Text1');
		assert.equal(jQuery(oDom).css("text-align"),"left","Text Align End in RTL");
		assert.equal(jQuery(oDom).attr("dir"),"rtl","Attribute 'dir' for Text Direction is set to RTL");

		// RTL left
		t1.setTextAlign(TextAlign.Left);
		oCore.applyChanges();
		oDom = jQuery.sap.domById('Text1');
		assert.equal(jQuery(oDom).css("text-align"),"left","Text Align Left in RTL");
		// reset
		t1.setTextDirection(TextDirection.Inherit);
		t1.setTextAlign(TextAlign.Begin);
	});

	QUnit.test("Null Text", function(assert) {
		assert.expect(2);
		t1.setText(null);
		try {
			oCore.applyChanges();
			oDom = jQuery.sap.domById('Text1');
			assert.equal(oDom.innerHTML,"", "Null Text");
		} catch (e) {
			// do nothing but let "expect" raise an error
		}
		t1.setText("Hello World!");
		oCore.applyChanges();
		oDom = jQuery.sap.domById('Text1');
		assert.equal(oDom.innerHTML,"Hello World!", "Text entered again");
	});

	QUnit.test("New line characters in XML view", function(assert) {
		var myText64a = sap.ui.getCore().byId("__xmlview0--xmltext1");
		assert.equal(countLines(myText64a), 2, "Text from XML view should be in 2 lines");

		var myText64b = sap.ui.getCore().byId("__xmlview0--xmltext2");
		assert.equal(countLines(myText64b), 2, "Text from XML view with binding should be in 2 lines");
	});

	QUnit.test("New line characters with binding", function(assert) {
		var oModel = new JSONModel();
		var oData = {text: "Should visualize tab\tand new line\nand escaped \\n and \\t from binding"};
		oModel.setData(oData);

		var t65 = new Text("Text65", {text: "{/text}", renderWhitespace: true}).setModel(oModel);
		sap.ui.setRoot("content65", t65);
		oCore.applyChanges();
		assert.equal(countLines(t65), 2, "Text should be in 2 lines");
	});

	QUnit.test("New line characters", function(assert) {
		//test normalization \r\n \r \n\r
		var txt66 = "test\r\ntest\rtest\n\rtest";
		var t66 = new Text("Text66", {text: txt66});
		sap.ui.setRoot("content66", t66);
		oCore.applyChanges();
		assert.equal(countLines(t66), 4, "Text should be in 4 lines");

		//test \n
		var txt67 = "C:\Temp\next.exe";
		var t67 = new Text("Text67", {text: txt67});
		sap.ui.setRoot("content67", t67);
		oCore.applyChanges();
		assert.equal(countLines(t67), 2, "Text should be in 2 lines");

		//test \\n
		var txt68 = "C:\\Temp\\next.exe";
		var t68 = new Text("Text68", {text: txt68});
		sap.ui.setRoot("content68", t68);
		oCore.applyChanges();
		assert.equal(countLines(t68), 1, "Text should be in 1 line");

		//test \n\n\n
		var txt69 = "test\n\n\ntest";
		var t69 = new Text("Text69", {text: txt69});
		sap.ui.setRoot("content69", t69);
		oCore.applyChanges();
		assert.equal(countLines(t69), 4, "Text should be in 4 lines");
	});

	QUnit.test("wrapping & no-wrapping", function(assert) {
		assert.strictEqual(t1.$().css("white-space"), "pre-line", "Text has correct white-space style for wrapping");
		assert.strictEqual(t4.$().hasClass("sapMTextNoWrap"), true, "Text has correct class for non-wrapping");
		assert.strictEqual(t4.$().css("white-space"), "nowrap", "Text has correct white-space style for non-wrapping");
		assert.strictEqual(t4.$().css("word-wrap"), "normal", "Text has correct word-wrap style for non-wrapping");
	});

	QUnit.test("hyphenation", function(assert) {
		oDom = jQuery.sap.domById("Text8");
		assert.notEqual(oDom.innerHTML, "", "When property wrappingType is 'Hyphenated' some text is rendered"); // this is the only possible check. Provided hypens (dashes) will be additionally checked by Visual test
	});

	if (t5.canUseNativeLineClamp()) {
		QUnit.test("native max lines", function(assert) {
			assert.strictEqual(t5.$("inner").hasClass("sapMTextLineClamp"), true, "Text has correct class for native MaxLine");
			equals(t5.$("inner").css("-webkit-line-clamp"), t5.getMaxLines(), "Text has correct line clamp value in CSS");
			assert.strictEqual(t5.hasOwnProperty("_sResizeListenerId"), false, "Text does not have resize handler");
		});
	}

	QUnit.test("non-native max lines", function(assert) {
		var done = assert.async();
		t5.canUseNativeLineClamp = function() {
			return false;
		};
		t5.addEventDelegate({
			onAfterRendering : function() {
				t5.clampText();
			}
		}, t5);

		t5.rerender();
		oCore.applyChanges();

		assert.strictEqual(t5.$("inner").hasClass("sapMTextMaxLine"), true, "Text has correct class for synthetic MaxLine");

		setTimeout(function() {
			// need to wait ellipsis is correctly calculated
			assert.ok(t5.$("inner").css("max-height") && t5.$("inner").css("max-height") != "none", "Text has max-height");
			assert.ok(t5.getDomRef("inner").textContent.indexOf(t5.ellipsis) > -1, "Text includes ellipsis(" + t5.ellipsis + ")");

			t5.setWidth(Math.pow(10, 5) + "px");
			oCore.applyChanges();
			assert.strictEqual(t5.getDomRef("inner").textContent.indexOf(t5.ellipsis), -1, "Text does not include ellipsis.");

			t5.$("inner").width("400px");	// change dom width

			setTimeout(function() {
				t5.clampText();
				assert.ok(t5.getDomRef("inner").textContent.indexOf(t5.ellipsis) > -1, "Text includes ellipsis (" + t5.ellipsis + ") after dom changed");

				t5.setMaxLines(1);	// should use native textoverflow ellipsis
				oCore.applyChanges();

				assert.strictEqual(t5.$().hasClass("sapMTextMaxLine"), false, "For 1 MaxLine we do not have sapMTextMaxLine class");
				assert.strictEqual(t5.$().hasClass("sapMTextNoWrap"), true, "For 1 MaxLine we have sapMTextNoWrap class");
				assert.strictEqual(t5.$().css("white-space"), "nowrap", "Text has correct style for 1 MaxLine");

				assert.strictEqual(t5.hasOwnProperty("_sResizeListenerId"), false, "Everything must be clean we do not have resize handler anymore");
				done();
			}, 400);

		}, 200);
	});
	QUnit.test("When width is not set max-width should apply to control", function(assert) {
		var sut = new Text({text : "text"}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		assert.ok(sut.$().hasClass("sapMTextMaxWidth"), "Text has max width restriction for the trunctation.");

		sut.setWidth("10rem");
		sap.ui.getCore().applyChanges();
		assert.ok(!sut.$().hasClass("sapMTextMaxWidth"), "Text has width and does not have max width restriction.");
		sut.destroy();
	});

	QUnit.test("getTextDomRef should respect maxlines", function(assert) {
		var sut = new Text({text : "line1\nline2\nline3", maxLines: 2}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		assert.ok(sut.getDomRef("inner") === sut.getTextDomRef(), "TextDomRef is the inner wrapper.");

		sut.setMaxLines(1);
		sap.ui.getCore().applyChanges();
		assert.ok(sut.getDomRef() === sut.getTextDomRef(), "TextDomRef is the controls dom ref.");
		sut.destroy();
	});

	QUnit.test("text should be shrinkable", function(assert) {
		var oText = new Text();
		assert.ok(oText.getMetadata().isInstanceOf("sap.ui.core.IShrinkable"), "Text control implements IShrinkable interface");
		oText.destroy();
	});

	QUnit.test("wrapping and break word with initially empty text", function(assert) {
		assert.strictEqual(t6.$().hasClass("sapMTextBreakWord"), false, "Text does not have a class for break word");

		t6.setText("LongTextWithNoSpaces");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(t6.$().hasClass("sapMTextBreakWord"), true, "Text has a class for break word");

		t6.setText("LongTextWith Spaces");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(t6.$().hasClass("sapMTextBreakWord"), false, "Text does not have a class for break word");
	});

	QUnit.test("setting renderWhitespace property", function(assert) {
		var oText = new Text("Text7", {text:"This text is not wrapping.\t\t Line   breaks cannot make it wrap"}).placeAt("qunit-fixture");
		assert.strictEqual(oText.$().hasClass("sapMTextRenderWhitespace"), false, "Text does not have a class for render whitespace characters");
		assert.strictEqual(oText.$().hasClass("sapMTextRenderWhitespaceWrap"), false, "Text does not have a class for render whitespace characters with wrapping");
		oText.setRenderWhitespace(true);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oText.$().hasClass("sapMTextRenderWhitespaceWrap"), true, "Text should have sapMTextRenderWhitespaceWrap when wrapping is true ");

		oText.setWrapping(false);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oText.$().hasClass("sapMTextRenderWhitespace"), true, "Text should have sapMTextRenderWhitespace when wrapping is false ");

		oText.setRenderWhitespace(false);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oText.$().hasClass("sapMTextRenderWhitespace"), false, "Text should not have a class sapMTextRenderWhitespace");
		assert.strictEqual(oText.$().hasClass("sapMTextRenderWhitespaceWrap"), false, "Text should not have a class sapMTextRenderWhitespaceWrap");
		oText.destroy();
	});

	QUnit.test("Break words when wrapping type is 'Hyphenated'", function (assert) {
		var oText = new Text({
			text: "singlewordwithoutspacesbutwithhyphenationenabled",
			wrapping: true,
			width: "100px",
			wrappingType: WrappingType.Hyphenated
		});

		oText.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.notOk(oText.$().hasClass("sapMTextBreakWord"));
	});

	QUnit.module("Accessibility");

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oControl = new Text({text: "Text"});
		assert.ok(!!oControl.getAccessibilityInfo, "Text has a getAccessibilityInfo function");
		var oInfo = oControl.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, undefined, "AriaRole");
		assert.strictEqual(oInfo.type, undefined, "Type");
		assert.strictEqual(oInfo.description, "Text", "Description");
		assert.strictEqual(oInfo.focusable, undefined, "Focusable");
		assert.strictEqual(oInfo.enabled, undefined, "Enabled");
		assert.strictEqual(oInfo.editable, undefined, "Editable");
		oControl.destroy();
	});

	QUnit.test("max lines with isThemeApplied true in RTL", function (assert){

		var stubIsThemeApplied = sinon.stub(sap.ui.getCore(), "isThemeApplied", function () {
			return true;
		});

		var lorem = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";
		var textWithMaxLines = new sap.m.Text("textML-RTL", {
			width: "300px",
			text: lorem,
			textDirection: "RTL",
			maxLines: 2
		});
		var stubCanUseNativeLineClamp = sinon.stub(textWithMaxLines,"canUseNativeLineClamp",function () {
			return false;
		});
		sinon.spy(textWithMaxLines, "clampHeight");
		textWithMaxLines.placeAt("content91");
		sap.ui.getCore().applyChanges();

		assert.ok(textWithMaxLines.clampHeight.calledOnce, "clampHeight was called ones");
		textWithMaxLines.clampHeight.restore();
		stubIsThemeApplied.restore();
		stubCanUseNativeLineClamp.restore();

	});

	QUnit.test("max lines with isThemeApplied false", function(assert) {
		function themeChanged() {
			return new Promise(function(resolve) {
				function onChanged() {
					sap.ui.getCore().detachThemeChanged(onChanged);
					resolve();
				}
				sap.ui.getCore().attachThemeChanged(onChanged);
			});
		}

		var done = assert.async();
		var sCurrentTheme = sap.ui.getCore().getConfiguration().getTheme();
		var lorem = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";
		var stubIsThemeApplied = sinon.stub(sap.ui.getCore(), "isThemeApplied", function () {
			return false;
		});

		var textWithMaxLines = new sap.m.Text("textML", {
			width: "300px",
			text: lorem,
			maxLines: 2
		});
		var stubCanUseNativeLineClamp = sinon.stub(textWithMaxLines,"canUseNativeLineClamp",function () {
			return false;
		});

		sinon.spy(textWithMaxLines, "_handleThemeLoad");
		textWithMaxLines.placeAt("content92");

		themeChanged().then(function () {
			assert.ok(textWithMaxLines._handleThemeLoad.calledOnce, "_handleThemeLoad was called ones");
			textWithMaxLines._handleThemeLoad.restore();
			stubIsThemeApplied.restore();
			stubCanUseNativeLineClamp.restore();
			sap.ui.getCore().applyTheme(sCurrentTheme);
			done();
		});
		sap.ui.getCore().applyChanges();
		sap.ui.getCore().applyTheme(sCurrentTheme == "sap_belize" ? "sap_fiori_3" : "sap_belize");
	});
});