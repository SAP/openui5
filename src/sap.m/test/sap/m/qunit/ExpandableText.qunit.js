/*global QUnit */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'sap/m/ExpandableText',
	"sap/ui/core/library",
	'sap/m/library',
	"sap/ui/core/Core"
], function(
	jQuery,
	ExpandableText,
	coreLibrary,
	library,
	Core) {
	'use strict';

	var oRb = Core.getLibraryResourceBundle("sap.m");

	var TEXT_SHOW_MORE = oRb.getText("EXPANDABLE_TEXT_SHOW_MORE");
	var TEXT_SHOW_LESS = oRb.getText("EXPANDABLE_TEXT_SHOW_LESS");

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	var MAX_CHARACTERS = 100;

	// shortcut for sap.m.ExpandableOverflowTextMode
	var ExpandableTextOverflowMode = library.ExpandableTextOverflowMode;

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
		assert.ok(this.oExpandableText.getDomRef(), 'Control is rendered');
		assert.strictEqual(this.oExpandableText.$("string").text(), this.oExpandableText.getText().substring(0, MAX_CHARACTERS), "text is correct");
		assert.strictEqual(this.oExpandableText.$().find(".sapMExTextEllipsis").text(), " ... " , "Ellipsis are rendered");
		assert.strictEqual(this.oExpandableText.$("showMoreLink").text(), TEXT_SHOW_MORE, "Show more is rendered");
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

		var oShowMoreLink = this.oExpandableText.$("showMoreLink").control()[0];
		oShowMoreLink.firePress();
		Core.applyChanges();

		assert.strictEqual(this.oExpandableText.$("string").text(), this.oExpandableText.getText(), "text is correct");
		assert.strictEqual(this.oExpandableText.$().find(".sapMExTextEllipsis").text(), "  ", "Space is rendered");
		assert.strictEqual(this.oExpandableText.$("showMoreLink").text(), TEXT_SHOW_LESS, "Show less is rendered");

		oShowMoreLink.firePress();
		Core.applyChanges();

		assert.strictEqual(this.oExpandableText.$("string").text(), this.oExpandableText.getText().substring(0, MAX_CHARACTERS), "text is correct");
		assert.strictEqual(this.oExpandableText.$().find(".sapMExTextEllipsis").text(), " ... " , "Ellipsis are rendered");
		assert.strictEqual(this.oExpandableText.$("showMoreLink").text(), TEXT_SHOW_MORE, "Show more is rendered");
	});

	QUnit.test("Open popover", function (assert) {
		this.oExpandableText.setOverflowMode(ExpandableTextOverflowMode.Popover);
		Core.applyChanges();

		var oShowMoreLink = this.oExpandableText.$("showMoreLink").control()[0];
		oShowMoreLink.firePress();
		Core.applyChanges();

		assert.strictEqual(this.oExpandableText.$("string").text(), this.oExpandableText.getText().substring(0, MAX_CHARACTERS), "text is correct");
		assert.strictEqual(this.oExpandableText.$().find(".sapMExTextEllipsis").text(), " ... " , "Ellipsis are rendered");
		assert.strictEqual(this.oExpandableText.$("showMoreLink").text(), TEXT_SHOW_MORE, "Show more is rendered");

		assert.strictEqual(jQuery(".sapMPopover").text(), this.oExpandableText.getText(), "popover is opened with the correct text");
	});
});