/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/InvisibleText"
], function(Log, InvisibleText) {
	"use strict";

	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);

	QUnit.module("");

	QUnit.test("Hidden Text is really hidden", function(assert) {
		var iWidth = jQuery.sap.byId("content").width();
		var iHeight = jQuery.sap.byId("content").height();

		var text = new InvisibleText({text: "Hello"});
		text.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.equal(iWidth, jQuery.sap.byId("content").width(), "Width of container not influenced by hidden text.");
		assert.equal(iHeight, jQuery.sap.byId("content").height(), "Height of container not influenced by hidden text.");
		assert.ok(text.$().parent().attr("id") == "content", "Invisible Text was rendered.");
	});

	QUnit.test("Render to static area", function(assert) {
		var text = new InvisibleText({text: "Hello"});
		text.toStatic();
		sap.ui.getCore().applyChanges();
		assert.ok(text.$().parent().attr("id") == "sap-ui-static", "Invisible Text was rendered to static area");
	});

	QUnit.test("Rendering", function(assert) {
		var text = new InvisibleText({text: "Hello"});
		text.toStatic();
		sap.ui.getCore().applyChanges();
		assert.equal(text.$().text(), "Hello", "Text rendered correctly");
		text.setText("Hello2");
		assert.equal(text.$().text(), "Hello2", "Text rendered correctly");
		assert.equal(text.$().attr("aria-hidden"), "true", "aria-hidden=true is set");
		assert.ok(text.$().hasClass("sapUiInvisibleText"), "Class sapUiInvisibleText is set");
	});

	QUnit.test("Shared Instances", function(assert) {
		// Note: configuration enforces initial language 'en'
		var sExpectedTextEN = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core").getText("VALUE_STATE_ERROR");

		var textId = InvisibleText.getStaticId("sap.ui.core", "VALUE_STATE_ERROR");
		assert.ok(textId && typeof textId === 'string', "getStaticId must return an ID");
		var oText = sap.ui.getCore().byId(textId);
		assert.ok(oText instanceof InvisibleText, "ID must refer to an instance of InvisibleText");
		assert.equal(oText.$().text(), sExpectedTextEN, "Text rendered correctly");
		assert.equal(oText.$().attr("aria-hidden"), "true", "aria-hidden=true is set");

		var textId2 = InvisibleText.getStaticId("sap.ui.core", "VALUE_STATE_ERROR");
		assert.equal(textId2, textId, "retrieving text ID a second time must return the same ID");

		// switch language
		sap.ui.getCore().getConfiguration().setLanguage("de");
		sap.ui.getCore().applyChanges();
		var sExpectedTextDE = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core").getText("VALUE_STATE_ERROR");
		assert.notEqual(sExpectedTextEN, sExpectedTextDE, "texts should differ between 'en' and 'de'");

		// check that text has been automatically updated by language switch
		assert.equal(oText.$().text(), sExpectedTextDE, "Text rendered correctly");

		// the following assertions don't describe the contract of getStaticId,
		// but rather reflect the behavior of the current implementation

		var textId3 = InvisibleText.getStaticId("not.a.library", "TEXT_FROM_A_NON_EXISTING_LIBRARY");
		assert.equal(sap.ui.getCore().byId(textId3).$().text(), "TEXT_FROM_A_NON_EXISTING_LIBRARY", "retrieving a text from a non-existing library results in a text that equals the key");

		var textId4 = InvisibleText.getStaticId("sap.ui.core", "THIS_TEXT_DOES_NOT_EXIST");
		assert.equal(sap.ui.getCore().byId(textId4).$().text(), "THIS_TEXT_DOES_NOT_EXIST", "retrieving a non-existing key results in a text that equals the key");
	});

	QUnit.test("Deactivated Control APIs", function(assert) {
		var oCtrl = new InvisibleText();
		this.spy(Log, 'warning');
		['tooltip', 'busy', 'busyIndicatorDelay', 'busyIndicatorSize', 'visible'].forEach(function(settingName) {
			Log.warning.reset();
			var oProperty = oCtrl.getMetadata().getPropertyLikeSetting(settingName);
			oProperty.get(oCtrl);
			assert.equal(Log.warning.callCount, 0, "no warning should have been issued when calling the getter");
			assert.strictEqual(oProperty.set(oCtrl, null), oCtrl, "overridden setters should return this");
			assert.ok(Log.warning.calledWith(sinon.match(/not supported.*InvisibleText/)), "calling the setter should have issued a warning");
		}, this);
	});

	QUnit.test("getRendererMarkup is an equivalent of renderer output", function(assert) {
		var oSUT = new InvisibleText({text: "Hello"});
		oSUT.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(oSUT.getDomRef().isEqualNode(jQuery(oSUT.getRendererMarkup())[0]));
		oSUT.destroy();
	});

});
