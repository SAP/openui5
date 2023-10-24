/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/core/Icon",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Element",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Log, Localization, Icon, InvisibleText, Library, jQuery, Element, nextUIUpdate) {
	"use strict";

	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);

	QUnit.module("");

	QUnit.test("Hidden Text is really hidden", async function(assert) {
		var iWidth = jQuery("#content").width();
		var iHeight = jQuery("#content").height();

		var text = new InvisibleText({text: "Hello"});
		text.placeAt("content");
		await nextUIUpdate();

		assert.equal(iWidth, jQuery("#content").width(), "Width of container not influenced by hidden text.");
		assert.equal(iHeight, jQuery("#content").height(), "Height of container not influenced by hidden text.");
		assert.ok(text.$().parent().attr("id") == "content", "Invisible Text was rendered.");
	});

	QUnit.test("Render to static area", async function(assert) {
		var text = new InvisibleText({text: "Hello"});
		text.toStatic();
		await nextUIUpdate();
		assert.ok(text.$().parent().attr("id") == "sap-ui-static", "Invisible Text was rendered to static area");
	});

	QUnit.test("Rendering", async function(assert) {
		var text = new InvisibleText({text: "Hello"});
		text.toStatic();
		await nextUIUpdate();
		assert.equal(text.$().text(), "Hello", "Text rendered correctly");
		text.setText("Hello2");
		assert.equal(text.$().text(), "Hello2", "Text rendered correctly");
		assert.equal(text.$().attr("aria-hidden"), "true", "aria-hidden=true is set");
		assert.ok(text.$().hasClass("sapUiInvisibleText"), "Class sapUiInvisibleText is set");
	});

	QUnit.test("Destroy after Invisible Text is added to an aggregation", async function(assert) {
		var icon = new Icon({
			src: "sap-icon://accept"
		});
		icon.placeAt("content");
		await nextUIUpdate();

		var id = "destroyTesting";
		var text = new InvisibleText({
			text: "Hello", id
		});
		text.toStatic();
		icon.addDependent(text);

		text.destroy();

		assert.notOk(document.querySelector(`[id*="${id}"]`), "No DOM that contains the id exists");
		icon.destroy();
	});

	QUnit.test("Shared Instances", async function(assert) {
		// Note: configuration enforces initial language 'en'
		var sExpectedTextEN = Library.getResourceBundleFor("sap.ui.core").getText("VALUE_STATE_ERROR");

		var textId = InvisibleText.getStaticId("sap.ui.core", "VALUE_STATE_ERROR");
		assert.ok(textId && typeof textId === 'string', "getStaticId must return an ID");
		var oText = Element.getElementById(textId);
		assert.ok(oText instanceof InvisibleText, "ID must refer to an instance of InvisibleText");
		assert.equal(oText.$().text(), sExpectedTextEN, "Text rendered correctly");
		assert.equal(oText.$().attr("aria-hidden"), "true", "aria-hidden=true is set");

		var textId2 = InvisibleText.getStaticId("sap.ui.core", "VALUE_STATE_ERROR");
		assert.equal(textId2, textId, "retrieving text ID a second time must return the same ID");

		// switch language
		Localization.setLanguage("de");
		await nextUIUpdate();
		var sExpectedTextDE = Library.getResourceBundleFor("sap.ui.core").getText("VALUE_STATE_ERROR");
		assert.notEqual(sExpectedTextEN, sExpectedTextDE, "texts should differ between 'en' and 'de'");

		// check that text has been automatically updated by language switch
		assert.equal(oText.$().text(), sExpectedTextDE, "Text rendered correctly");

		// the following assertions don't describe the contract of getStaticId,
		// but rather reflect the behavior of the current implementation

		var textId3 = InvisibleText.getStaticId("not.a.library", "TEXT_FROM_A_NON_EXISTING_LIBRARY");
		assert.equal(Element.getElementById(textId3).$().text(), "TEXT_FROM_A_NON_EXISTING_LIBRARY", "retrieving a text from a non-existing library results in a text that equals the key");

		var textId4 = InvisibleText.getStaticId("sap.ui.core", "THIS_TEXT_DOES_NOT_EXIST");
		assert.equal(Element.getElementById(textId4).$().text(), "THIS_TEXT_DOES_NOT_EXIST", "retrieving a non-existing key results in a text that equals the key");
	});

	QUnit.test("Deactivated Control APIs", function(assert) {
		var oCtrl = new InvisibleText();
		this.spy(Log, 'warning');
		['tooltip', 'busy', 'busyIndicatorDelay', 'busyIndicatorSize', 'visible'].forEach(function(settingName) {
			Log.warning.resetHistory();
			var oProperty = oCtrl.getMetadata().getPropertyLikeSetting(settingName);
			oProperty.get(oCtrl);
			assert.equal(Log.warning.callCount, 0, "no warning should have been issued when calling the getter");
			assert.strictEqual(oProperty.set(oCtrl, null), oCtrl, "overridden setters should return this");
			assert.ok(Log.warning.calledWith(sinon.match(/not supported.*InvisibleText/)), "calling the setter should have issued a warning");
		}, this);
	});

	QUnit.test("getRendererMarkup is an equivalent of renderer output", async function(assert) {
		var oSUT = new InvisibleText({text: "Hello"});
		oSUT.placeAt("content");
		await nextUIUpdate();

		var oDomRef = oSUT.getDomRef();
		var oMarkupDomRef = jQuery(oSUT.getRendererMarkup())[0];

		assert.equal(oMarkupDomRef.tagName, oMarkupDomRef.tagName);
		assert.equal(oMarkupDomRef.innerHTML, oMarkupDomRef.innerHTML);
		oMarkupDomRef.getAttributeNames().forEach(function(sAttribute) {
			assert.equal(oMarkupDomRef.getAttribute(sAttribute), oDomRef.getAttribute(sAttribute));
		});

		oSUT.destroy();
	});


});
