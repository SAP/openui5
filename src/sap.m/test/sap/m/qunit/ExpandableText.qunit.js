/*global QUnit */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/ExpandableText",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function (
	jQuery,
	ExpandableText,
	coreLibrary,
	library,
	Core,
	createAndAppendDiv
) {
	"use strict";

	var oRb = Core.getLibraryResourceBundle("sap.m");

	var TEXT_SHOW_MORE = oRb.getText("EXPANDABLE_TEXT_SHOW_MORE");
	var TEXT_SHOW_LESS = oRb.getText("EXPANDABLE_TEXT_SHOW_LESS");

	var TEXT_SHOW_MORE_POPOVER_ARIA_LABEL = oRb.getText("EXPANDABLE_TEXT_SHOW_MORE_POPOVER_ARIA_LABEL");
	var TEXT_SHOW_LESS_POPOVER_ARIA_LABEL = oRb.getText("EXPANDABLE_TEXT_SHOW_LESS_POPOVER_ARIA_LABEL");

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.ExpandableOverflowTextMode
	var ExpandableTextOverflowMode = library.ExpandableTextOverflowMode;

	// shortcut for sap.ui.core.TextDirection
	var EmptyIndicatorMode = library.EmptyIndicatorMode;

	function createExpandableText() {
		return new ExpandableText({
			text: "Lorem ipsum dolor sit amet, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr"
		});
	}

	QUnit.module("Rendering", {
		beforeEach: function () {
			this.oExpandableText = createExpandableText();
			this.oExpandableText.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oExpandableText.destroy();
			this.oExpandableText = null;
		}
	});

	QUnit.test("initial rendering", function (assert) {
		var iMaxCharacters = this.oExpandableText.getMaxCharacters();

		assert.ok(this.oExpandableText.getDomRef(), 'Control is rendered');
		assert.strictEqual(this.oExpandableText.$("string").text(), this.oExpandableText.getText().substring(0, iMaxCharacters), "text is correct");
		assert.strictEqual(this.oExpandableText.$().find(".sapMExTextEllipsis").text(), "... ", "Ellipsis are rendered");
		assert.strictEqual(this.oExpandableText.$("showMoreLink").text(), TEXT_SHOW_MORE, "Show more is rendered");
		assert.notOk(this.oExpandableText.$().find(".sapUiInvisibleText").text(), "aria-labelledby control text is empty");
	});

	QUnit.module("API", {
		beforeEach: function () {
			this.oExpandableText = createExpandableText();
			this.oExpandableText.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oExpandableText.destroy();
			this.oExpandableText = null;
		}
	});

	QUnit.test("properties", function (assert) {

		this.oExpandableText.setTextDirection(TextDirection.RTL);
		Core.applyChanges();

		assert.strictEqual(this.oExpandableText.getDomRef().getAttribute('dir'), 'rtl', 'dir attribute is correct');
		assert.strictEqual(this.oExpandableText.getDomRef().style.textAlign, 'right', 'text-align style is correct');

		this.oExpandableText.setTextAlign(TextAlign.Left);
		Core.applyChanges();

		assert.strictEqual(this.oExpandableText.getDomRef().style.textAlign, 'left', 'text-align style is correct');

		this.oExpandableText.setRenderWhitespace(true);
		Core.applyChanges();

		assert.ok(this.oExpandableText.$().hasClass("sapMExTextRenderWhitespaceWrap"), 'sapMExTextRenderWhitespaceWrap class is added');

		this.oExpandableText.setText("Short text");
		Core.applyChanges();

		assert.notOk(this.oExpandableText.$().find(".sapMExTextEllipsis").length, "Ellipsis are not rendered");
		assert.notOk(this.oExpandableText.$("showMoreLink").length, "Show more is not rendered");
	});

	QUnit.module("Interaction", {
		beforeEach: function () {
			this.oExpandableText = createExpandableText();
			this.oExpandableText.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oExpandableText.destroy();
			this.oExpandableText = null;
		}
	});

	QUnit.test("Show more/show less", function (assert) {

		assert.notOk(this.oExpandableText.$("showMoreLink").attr("aria-haspopup"), "aria-haspopup attribute is not set");

		var oShowMoreLink = this.oExpandableText._getShowMoreLink(),
			iMaxCharacters = this.oExpandableText.getMaxCharacters();

		oShowMoreLink.firePress();
		Core.applyChanges();

		assert.strictEqual(this.oExpandableText.$("string").text(), this.oExpandableText.getText(), "text is correct");
		assert.strictEqual(this.oExpandableText.$().find(".sapMExTextEllipsis").text(), " ", "Space is rendered");
		assert.strictEqual(this.oExpandableText.$("showMoreLink").text(), TEXT_SHOW_LESS, "Show less is rendered");
		assert.notOk(this.oExpandableText.$().find(".sapUiInvisibleText").text(), "aria-labelledby control text is empty");

		oShowMoreLink.firePress();
		Core.applyChanges();

		assert.strictEqual(this.oExpandableText.$("string").text(), this.oExpandableText.getText().substring(0, iMaxCharacters), "text is correct");
		assert.strictEqual(this.oExpandableText.$().find(".sapMExTextEllipsis").text(), "... ", "Ellipsis are rendered");
		assert.strictEqual(this.oExpandableText.$("showMoreLink").text(), TEXT_SHOW_MORE, "Show more is rendered");
		assert.notOk(this.oExpandableText.$().find(".sapUiInvisibleText").text(), "aria-labelledby control text is empty");
	});

	QUnit.test("Open popover", function (assert) {
		this.oExpandableText.setOverflowMode(ExpandableTextOverflowMode.Popover);
		Core.applyChanges();

		assert.strictEqual(this.oExpandableText.$("showMoreLink").attr("aria-haspopup"), "dialog", "aria-haspopup attribute is set to 'dialog'");

		var oShowMoreLink = this.oExpandableText._getShowMoreLink(),
			iMaxCharacters = this.oExpandableText.getMaxCharacters();

		oShowMoreLink.firePress();
		Core.applyChanges();

		assert.strictEqual(this.oExpandableText.$("string").text(), this.oExpandableText.getText().substring(0, iMaxCharacters), "text is correct");
		assert.strictEqual(this.oExpandableText.$().find(".sapMExTextEllipsis").text(), "... ", "Ellipsis are rendered");
		assert.strictEqual(this.oExpandableText.$("showMoreLink").text(), TEXT_SHOW_LESS, "'Show less' text is rendered");
		assert.strictEqual(this.oExpandableText.$().find(".sapUiInvisibleText").text(), TEXT_SHOW_LESS_POPOVER_ARIA_LABEL, "aria-labelledby control is rendered");
		assert.strictEqual(jQuery(".sapMPopover").text(), this.oExpandableText.getText(), "popover is opened with the correct text");

		oShowMoreLink.firePress();
		Core.applyChanges();
		this.clock.tick(500);

		assert.strictEqual(this.oExpandableText.$("showMoreLink").text(), TEXT_SHOW_MORE, "'Show more' text is rendered");
		assert.strictEqual(this.oExpandableText.$().find(".sapUiInvisibleText").text(), TEXT_SHOW_MORE_POPOVER_ARIA_LABEL, "aria-labelledby control is rendered");
		assert.notOk(this.oExpandableText._oPopover.isOpen(), "popover is closed");
	});

	QUnit.module("Empty Indicator", {
		beforeEach: function () {
			this.oExpandableText = new ExpandableText();
			this.oExpandableText.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oExpandableText.destroy();
		}
	});

	QUnit.test("Default value - emptyIndicatorMode=Off without text", function (assert) {
		//Assert
		assert.strictEqual(this.oExpandableText.getDomRef("string").textContent, "", "Empty indicator shouldn't be rendered");
	});

	QUnit.test("Default value - emptyIndicatorMode=Off with text", function (assert) {
		// Arrange
		this.oExpandableText.setText("test");

		//Assert
		assert.strictEqual(this.oExpandableText.getDomRef("string").textContent, "", "Empty indicator shouldn't be rendered");
	});

	QUnit.test("emptyIndicatorMode=On with empty text", function (assert) {
		// Arrange
		this.oExpandableText.setEmptyIndicatorMode(EmptyIndicatorMode.On);
		Core.applyChanges();
		var oEmptyIndicator = this.oExpandableText.getDomRef("string").firstElementChild;

		// Assert
		assert.strictEqual(oEmptyIndicator.firstElementChild.textContent, oRb.getText("EMPTY_INDICATOR"), "Empty indicator is rendered");
		assert.strictEqual(oEmptyIndicator.firstElementChild.getAttribute("aria-hidden"), "true", "Accessibility attribute is set");
		assert.strictEqual(oEmptyIndicator.lastElementChild.textContent, oRb.getText("EMPTY_INDICATOR_TEXT"), "Accessibility text is added");
	});

	QUnit.test("emptyIndicatorMode=On with text", function (assert) {
		//Arrange
		this.oExpandableText.setText("test");
		this.oExpandableText.setEmptyIndicatorMode(EmptyIndicatorMode.On);
		Core.applyChanges();

		//Assert
		assert.strictEqual(this.oExpandableText.getDomRef("string").textContent, "test", "Empty indicator shouldn't be rendered");
	});

	QUnit.test("emptyIndicatorMode=Auto with text", function (assert) {
		//Arrange
		this.oExpandableText.setText("test");
		this.oExpandableText.setEmptyIndicatorMode(EmptyIndicatorMode.Auto);
		Core.applyChanges();

		//Assert
		assert.strictEqual(this.oExpandableText.getDomRef("string").textContent, "test", "Empty indicator shouldn't be rendered");
	});

	QUnit.test("Class 'sapMShowEmpty-CTX' with emptyIndicatorMode=Auto", function (assert) {
		// Arrange
		this.oExpandableText.setEmptyIndicatorMode(EmptyIndicatorMode.Auto);
		var oContainer = createAndAppendDiv();
		this.oExpandableText.placeAt(oContainer);
		Core.applyChanges();

		// Arrange
		var oEmptyIndicator = this.oExpandableText.getDomRef("string").firstElementChild;

		//Assert
		assert.strictEqual(window.getComputedStyle(oEmptyIndicator)["display"], "none", "Empty indicator shouldn't be rendered");

		//Arrange
		oContainer.classList.add("sapMShowEmpty-CTX");

		//Assert
		assert.strictEqual(window.getComputedStyle(oEmptyIndicator)["display"], "inline-block", "Empty indicator should be displayed");

		// Clean up
		oContainer.remove();
	});
});