/*global QUnit */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/FeedInput",
	"sap/ui/core/TooltipBase",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/Button",
	"sap/m/MenuButton"
], function(Library, qutils, FeedInput, TooltipBase, KeyCodes, nextUIUpdate, Button, MenuButton) {
	"use strict";

	var oRb = Library.getResourceBundleFor("sap.m");

	QUnit.module("Properties", {
		beforeEach: async function () {
			this.oFeedInput = new FeedInput("input");
			this.oFeedInput.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oFeedInput.destroy();
		}
	});

	QUnit.test("Defaults", function (assert) {
		assert.strictEqual(this.oFeedInput.getButtonTooltip(), Library.getResourceBundleFor("sap.m").getText("FEEDINPUT_SUBMIT"), "buttonTooltip is correct");
		assert.strictEqual(this.oFeedInput.getEnabled(), true, "enabled is 'true'");
		assert.strictEqual(this.oFeedInput.getIcon(), "", "icon is ''");
		assert.strictEqual(this.oFeedInput.getMaxLength(), 0, "maxLength is '0'");
		assert.strictEqual(this.oFeedInput.getPlaceholder(), Library.getResourceBundleFor("sap.m").getText("FEEDINPUT_PLACEHOLDER"), "placeholder is correct");
		assert.strictEqual(this.oFeedInput.getShowIcon(), true, "showIcon is 'true'");
		assert.strictEqual(this.oFeedInput.getValue(), "", "value is ''");
		assert.strictEqual(this.oFeedInput.getVisible(), true, "visible is 'true'");
		assert.strictEqual(this.oFeedInput.getRows(), 2, "rows is '2'");
		assert.strictEqual(this.oFeedInput.getGrowing(), false, "growing is 'false'");
		assert.strictEqual(this.oFeedInput.getGrowingMaxLines(), 0, "growingMaxLines is '0'");
		assert.strictEqual(this.oFeedInput.getShowExceededText(), false, "showExceededText is 'false'");
		assert.strictEqual(this.oFeedInput.$().attr("role"), "group", "role is 'group'");
		assert.strictEqual(this.oFeedInput.$().attr("aria-label"), oRb.getText("FEED_INPUT_ARIA_LABEL"), "aria-label is 'Your Input'");
	});

	/**
	 * @deprecated Since version 1.88.
	 */
	QUnit.test("Default value of ariaLabelForPicture property", function (assert) {
		assert.strictEqual(this.oFeedInput.getAriaLabelForPicture(), "", "ariaLabelForPicture is ''");
	});

	QUnit.test("ButtonTooltip", function (assert) {
		this.oFeedInput.setButtonTooltip("My Submit");
		assert.strictEqual(this.oFeedInput.getButtonTooltip(), "My Submit", "Getter should return correct non-default value");
		assert.strictEqual(this.oFeedInput._getPostButton().getTooltip(), this.oFeedInput.getButtonTooltip(), "Property should be passed to button control");
		this.oFeedInput.setButtonTooltip(new TooltipBase({
			text: "Otto Hahn"
		}));
		assert.strictEqual(this.oFeedInput.getButtonTooltip().getText(), "Otto Hahn");
		assert.strictEqual(this.oFeedInput._getPostButton().getTooltip(), this.oFeedInput.getButtonTooltip());
		assert.strictEqual(this.oFeedInput._getPostButton().getTooltip().getText(), "Otto Hahn");
		assert.throws(function () {
			this.oFeedInput.setButtonTooltip(4711);
		}.bind(this), "Setting a different type is not possible.");
	});

	QUnit.test("Enabled", async function (assert) {
		this.oFeedInput.setEnabled(false);
		assert.strictEqual(this.oFeedInput.getEnabled(), false, "Getter should return correct non-default value");
		assert.strictEqual(this.oFeedInput._getTextArea().getEnabled(), false, "enabled=false: TextArea should be disabled");
		assert.strictEqual(this.oFeedInput._getPostButton().getEnabled(), false, "enabled=false: Button should be disabled");

		assert.strictEqual(this.oFeedInput.$("outerContainer").hasClass("sapMFeedInDisabled"), true, "enabled=false: sapMFeedInDisabled should be disabled");

		this.oFeedInput.setEnabled(true);

		await nextUIUpdate();
		assert.strictEqual(this.oFeedInput._getTextArea().getEnabled(), true, "enabled=true: TextArea should be enabled");
		assert.strictEqual(this.oFeedInput._getPostButton().getEnabled(), false, "enabled=true, Value = '': Button should be disabled");
		assert.strictEqual(this.oFeedInput.$("outerContainer").hasClass("sapMFeedInDisabled"), false, "enabled=true: sapMFeedInDisabled should be enabled");

		this.oFeedInput.setValue(" ");
		await nextUIUpdate();
		assert.strictEqual(this.oFeedInput._getPostButton().getEnabled(), false, "enabled=true, Value = ' ': Button should be disabled when TextArea contains only whitespace chars");

		this.oFeedInput.setValue("some string");
		await nextUIUpdate();
		assert.strictEqual(this.oFeedInput._getPostButton().getEnabled(), true, "enabled=true, Value = 'some string': Button should be enabled when TextArea contains any non-whitespace chars");
	});

	QUnit.test("Icon", async function (assert) {
		this.oFeedInput.setIcon("myIcon");
		assert.strictEqual(this.oFeedInput.getIcon(), "myIcon", "Getter should return correct non-default value");
		assert.strictEqual(this.oFeedInput._getAvatar().sId, this.oFeedInput.getId() + '-icon', "Id should be same");
		assert.strictEqual(this.oFeedInput._getAvatar().getSrc(), this.oFeedInput.getIcon(), "Property should be passed to avatar control");
		assert.strictEqual(this.oFeedInput._getAvatar().getDisplayShape(), "Circle", "Should have 'Square' shape");
		assert.strictEqual(this.oFeedInput._getAvatar().getDisplaySize(), "M", "Should have 'M' size");

		this.oFeedInput.setIcon("");
		this.oFeedInput.setIconInitials("TT");
		await nextUIUpdate();
		assert.strictEqual(this.oFeedInput._getAvatar().getInitials(), "TT", "Should have initials set");
		assert.strictEqual(this.oFeedInput._getAvatar()._getActualDisplayType(),
		"Initials", "Should have initials set");

		this.oFeedInput.setIcon("");
		this.oFeedInput.setIconInitials("");
		await nextUIUpdate();
		assert.strictEqual(this.oFeedInput._getAvatar()._getActualDisplayType(),
		"Icon", "Should have default placeholder icon");
	});
	QUnit.test("Post Button Icon", async function (assert) {
		//Feed input button true
		this.oFeedInput.setEnabled(true);
		await nextUIUpdate();
		var padding = getComputedStyle(this.oFeedInput.getDomRef().querySelector(".sapMBtnIcon")).padding;
		assert.strictEqual(this.oFeedInput._getPostButton().getIcon(), "sap-icon://paper-plane", "Button icon is paper plane");
		assert.equal(padding,"0px","Padding is correct");
		//Feed input button false
		this.oFeedInput.setEnabled(false);
		await nextUIUpdate();
		var padding = getComputedStyle(this.oFeedInput.getDomRef().querySelector(".sapMBtnIcon")).padding;
		assert.strictEqual(this.oFeedInput._getPostButton().getIcon(), "sap-icon://paper-plane", "Button icon is paper plane");
		assert.equal(padding,"0px","Padding is correct");
		//compact theme
		this.oFeedInput.addStyleClass("sapUiSizeCompact");
		await nextUIUpdate();
		var padding = getComputedStyle(this.oFeedInput.getDomRef().querySelector(".sapMBtnIcon")).padding;
		assert.strictEqual(this.oFeedInput._getPostButton().getIcon(), "sap-icon://paper-plane", "Button icon is paper plane in compact theme");
		assert.equal(padding,"4px 10px","Padding is correct");
		//condensed theme
		this.oFeedInput.addStyleClass("sapUiSizeCondensed");
		await nextUIUpdate();
		var padding = getComputedStyle(this.oFeedInput.getDomRef().querySelector(".sapMBtnIcon")).padding;
		assert.strictEqual(this.oFeedInput._getPostButton().getIcon(), "sap-icon://paper-plane", "Button icon is paper plane in condensed theme");
		assert.equal(padding,"4px 10px","Padding is correct");
	});
	QUnit.test("MaxLength", function (assert) {
		this.oFeedInput.setMaxLength(1001);
		assert.strictEqual(this.oFeedInput.getMaxLength(), 1001, "Getter should return correct non-default value");
		assert.strictEqual(this.oFeedInput._getTextArea().getMaxLength(), this.oFeedInput.getMaxLength(), "Property should be passed to TextArea control");
	});

	QUnit.test("Rows", function (assert) {
		this.oFeedInput.setRows(5);
		assert.strictEqual(this.oFeedInput.getRows(), 5, "Getter should return correct non-default value");
		assert.strictEqual(this.oFeedInput._getTextArea().getRows(), this.oFeedInput.getRows(), "Property should be passed to TextArea control");
		this.oFeedInput.setRows(1);
		assert.strictEqual(this.oFeedInput.getRows(), 2, "Getter should return minimum value");
		assert.strictEqual(this.oFeedInput._getTextArea().getRows(), this.oFeedInput.getRows(), "Property with minimum value should be passed to TextArea control");
		this.oFeedInput.setRows(25);
		assert.strictEqual(this.oFeedInput.getRows(), 15, "Getter should return maximum value");
		assert.strictEqual(this.oFeedInput._getTextArea().getRows(), this.oFeedInput.getRows(), "Property with maximum value should be passed to TextArea control");
	});

	QUnit.test("Growing", function (assert) {
		this.oFeedInput.setGrowing(true);
		assert.strictEqual(this.oFeedInput.getGrowing(), true, "Getter should return correct non-default value");
		assert.strictEqual(this.oFeedInput._getTextArea().getGrowing(), this.oFeedInput.getGrowing(), "Property should be passed to TextArea control");
	});

	QUnit.test("GrowingMaxLines", function (assert) {
		this.oFeedInput.setGrowingMaxLines(7);
		assert.strictEqual(this.oFeedInput.getGrowingMaxLines(), 7, "Getter should return correct non-default value");
		assert.strictEqual(this.oFeedInput._getTextArea().getGrowingMaxLines(), this.oFeedInput.getGrowingMaxLines(), "Property should be passed to TextArea control");
		this.oFeedInput.setGrowingMaxLines(25);
		assert.strictEqual(this.oFeedInput.getGrowingMaxLines(), 15, "Getter should return maximum value");
		assert.strictEqual(this.oFeedInput._getTextArea().getGrowingMaxLines(), this.oFeedInput.getGrowingMaxLines(), "Property with maximum value should be passed to TextArea control");
		this.oFeedInput.setGrowingMaxLines(0);
		assert.strictEqual(this.oFeedInput.getGrowingMaxLines(), 0, "Getter should return unlimited value");
		assert.strictEqual(this.oFeedInput._getTextArea().getGrowingMaxLines(), this.oFeedInput.getGrowingMaxLines(), "Property with maximum value should be passed to TextArea control");
		this.oFeedInput.setGrowingMaxLines(1);
		assert.strictEqual(this.oFeedInput.getGrowingMaxLines(), 2, "Rows=default value: getter should return minimum value of rows");
		assert.strictEqual(this.oFeedInput._getTextArea().getGrowingMaxLines(), this.oFeedInput.getGrowingMaxLines(), "Property with minimum value of rows should be passed to TextArea control");
		this.oFeedInput.setRows(5);
		this.oFeedInput.setGrowingMaxLines(4);
		assert.strictEqual(this.oFeedInput.getGrowingMaxLines(), 5, "Getter should return value equal to rows");
		assert.strictEqual(this.oFeedInput._getTextArea().getGrowingMaxLines(), this.oFeedInput.getGrowingMaxLines(), "Property with equal value of rows should be passed to TextArea control");
		this.oFeedInput.setRows(10);
		assert.strictEqual(this.oFeedInput.getGrowingMaxLines(), 10, "Getter should change its value when property Rows exceed the getter");
		assert.strictEqual(this.oFeedInput._getTextArea().getGrowingMaxLines(), this.oFeedInput.getGrowingMaxLines(), "Property changed when property Rows exceed should be passed to TextArea control");
	});

	QUnit.test("ShowExceededText", function (assert) {
		this.oFeedInput.setShowExceededText(true);
		assert.strictEqual(this.oFeedInput.getShowExceededText(), true, "Getter should return correct non-default value");
		assert.strictEqual(this.oFeedInput._getTextArea().getShowExceededText(), this.oFeedInput.getShowExceededText(), "Property should be passed to TextArea control");
	});

	QUnit.test("Placeholder", function (assert) {
		this.oFeedInput.setPlaceholder("asdf");
		assert.strictEqual(this.oFeedInput.getPlaceholder(), "asdf", "Getter should return correct non-default value");
		assert.strictEqual(this.oFeedInput._getTextArea().getPlaceholder(), this.oFeedInput.getPlaceholder(), "Property should be passed to TextArea");
	});

	QUnit.test("ShowIcon", async function (assert) {
		this.oFeedInput.setShowIcon(false);
		await nextUIUpdate();
		assert.strictEqual(this.oFeedInput.getShowIcon(), false, "Getter should return correct non-default value");
		assert.ok(this.oFeedInput.$().find("#input-outerContainer").hasClass("sapMFeedInNoIcon"), "ShowIcon=false: div input should have class 'sapMFeedInNoIcon'");

		this.oFeedInput.setShowIcon(true);
		await nextUIUpdate();
		assert.ok(!this.oFeedInput.$().find("#input-outerContainer").hasClass("sapMFeedInNoIcon"), "ShowIcon=true: div input should not have class 'sapMFeedInNoIcon'");
		assert.ok(this.oFeedInput.$().find("#input-figure").hasClass("sapMFeedInFigure"), "ShowIcon=true: div figure should have class 'sapMFeedInFigure'");
	});

	QUnit.test("Value", function (assert) {
		this.oFeedInput.setValue("asdf");
		assert.strictEqual(this.oFeedInput.getValue(), "asdf", "Getter should return correct non-default value");
		assert.strictEqual(this.oFeedInput._getTextArea().getValue(), this.oFeedInput.getValue(), "Property should be passed to TextArea");
	});

	QUnit.test("Visible", function (assert) {
		this.oFeedInput.setVisible(true);
		assert.ok(document.getElementById("input"), "visible=true: FeedInput control should be rendered");
		this.oFeedInput.setVisible(false);
		assert.ok(document.getElementById("input"), "visible=false: FeedInput control should not be rendered");
	});

	QUnit.test("HTML Sanitization", function (assert) {
		this.oFeedInput.setValue("<a href='javascript:alert(1);'>Back</a>");
		function onPostScript(oEvt) {
			assert.strictEqual(oEvt.getParameter("value"), "<a href=\"#\" class=\"sapMLnk\">Back</a>", "scripts inside html is sanitize");
		}
		this.oFeedInput.attachPost(onPostScript);
		qutils.triggerEvent("tap", "input-button");
		this.oFeedInput.detachPost(onPostScript);

		this.oFeedInput.setValue("<a href=\"//www.sap.com\">link to sap.com</a>");
		function onPostUrl(oEvt) {
			assert.ok(oEvt.getParameter("value").includes("sapMLnk"), "Url is converted to sap.m.Link");
			assert.strictEqual(oEvt.getParameter("value"), "<a href=\"//www.sap.com\" target=\"_blank\" class=\"sapMLnk\">link to sap.com</a>", "Url inside html is not removed");
		}
		this.oFeedInput.attachPost(onPostUrl);
		qutils.triggerEvent("tap", "input-button");
	});


	QUnit.module("CSS", {
		beforeEach: async function () {
			this.oFeedInput = new FeedInput("input");
			this.oFeedInput.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oFeedInput.destroy();
		}
	});

	QUnit.test("General Stuff", function (assert) {
		assert.ok(this.oFeedInput.$().hasClass("sapMFeedInBase"), "FeedInput control should have class 'sapMFeedInBase'");
		assert.ok(this.oFeedInput.$().find("#input-outerContainer").hasClass("sapMFeedIn"), "Outer container should have class 'sapMFeedIn'");
		assert.ok(this.oFeedInput.$().find("#input-counterContainer").hasClass("sapMFeedInCounter"), "Counter container should have class 'sapMFeedInCounter'");
		assert.ok(this.oFeedInput.$().find("#input-container").hasClass("sapMFeedInContainer"), "Input container should have class 'sapMFeedInContainer'");
		assert.ok(this.oFeedInput.$().has(this.oFeedInput.$().find("#input-counterContainer")).length, "FeedInput control contain Counter container");
		assert.ok(!this.oFeedInput.$().find("#input-counterContainer").has(this.oFeedInput.$().find("#input-textArea-counter")).length, "Counter container does not contain Text Area counter");
	});

	QUnit.test("Character Counter", async function (assert) {
		assert.ok(!this.oFeedInput.$().find("#input-counterContainer").has(this.oFeedInput.$().find("#input-textArea-counter")).length, "Counter container does not contain Text Area counter");
		assert.ok(!this.oFeedInput.$().find("#input-TextArea").has(this.oFeedInput.$().find("#input-textArea-counter")).length, "Text Area does not contain visible Text Area counter");
		assert.ok(this.oFeedInput._getTextArea().getAggregation("_counter").isA("sap.m.Text"), "Counter aggregation is of type sap.m.Text");
		assert.ok(this.oFeedInput.$().find("#input-counterContainer").is(":empty"), "Counter container is empty");
		assert.ok(this.oFeedInput.$().find("#input-counterContainer").children().length === 0, "Counter container is empty");
		assert.ok(this.oFeedInput.$().find("#input-textArea").children().length === 2, "Text Area has correct children");
		this.oFeedInput.setMaxLength(20);
		this.oFeedInput.setShowExceededText(true);
		await nextUIUpdate();
		assert.ok(this.oFeedInput.$().find("#input-counterContainer").has(this.oFeedInput.$().find("#input-textArea-counter")).length, "Counter container contain Text Area counter");
		assert.ok(!this.oFeedInput.$().find("#input-TextArea").has(this.oFeedInput.$().find("#input-textArea-counter")).length, "Text Area does not contain Text Area counter");
		assert.ok(this.oFeedInput.$().find("#input-counterContainer").hasClass("sapMFeedInCounter"), "Counter container should have class 'sapMFeedInCounter'");
		assert.ok(this.oFeedInput.$().find("#input-textArea-counter").hasClass("sapMTextAreaCounter"), "Text Area Counter should have class 'sapMTextAreaCounter'");
		assert.ok(this.oFeedInput._getTextArea().getAggregation("_counter").isA("sap.m.Text"), "Counter aggregation is of type sap.m.Text");
		assert.ok(!this.oFeedInput.$().find("#input-counterContainer").is(":empty"), "Counter container is not empty");
		assert.ok(this.oFeedInput.$().find("#input-counterContainer").children().length === 1, "Counter container contains 1 child element");
		assert.ok(this.oFeedInput.$().find("#input-textArea").children().length === 1, "Text Area has correct children");
		this.oFeedInput.setMaxLength(0);
		this.oFeedInput.setShowExceededText(false);
		await nextUIUpdate();
		assert.ok(!this.oFeedInput.$().find("#input-counterContainer").has(this.oFeedInput.$().find("#input-textArea-counter")).length, "Counter container does not contain Text Area counter");
		assert.ok(!this.oFeedInput.$().find("#input-TextArea").has(this.oFeedInput.$().find("#input-textArea-counter")).length, "Text Area does not contain visible Text Area counter");
		assert.ok(this.oFeedInput._getTextArea().getAggregation("_counter").isA("sap.m.Text"), "Counter aggregation is of type sap.m.Text");
		assert.ok(this.oFeedInput.$().find("#input-counterContainer").is(":empty"), "Counter container is empty");
		assert.ok(this.oFeedInput.$().find("#input-counterContainer").children().length === 0, "Counter container is empty");
		assert.ok(this.oFeedInput.$().find("#input-textArea").children().length === 2, "Text Area has correct children");
		this.oFeedInput.setMaxLength(20);
		this.oFeedInput.setShowExceededText(true);
		await nextUIUpdate();
		assert.ok(this.oFeedInput.$().find("#input-counterContainer").has(this.oFeedInput.$().find("#input-textArea-counter")).length, "Counter container contain Text Area counter");
		assert.ok(!this.oFeedInput.$().find("#input-TextArea").has(this.oFeedInput.$().find("#input-textArea-counter")).length, "Text Area does not contain Text Area counter");
		assert.ok(this.oFeedInput.$().find("#input-counterContainer").hasClass("sapMFeedInCounter"), "Counter container should have class 'sapMFeedInCounter'");
		assert.ok(this.oFeedInput.$().find("#input-textArea-counter").hasClass("sapMTextAreaCounter"), "Text Area Counter should have class 'sapMTextAreaCounter'");
		assert.ok(this.oFeedInput._getTextArea().getAggregation("_counter").isA("sap.m.Text"), "Counter aggregation is of type sap.m.Text");
		assert.ok(!this.oFeedInput.$().find("#input-counterContainer").is(":empty"), "Counter container is not empty");
		assert.ok(this.oFeedInput.$().find("#input-counterContainer").children().length === 1, "Counter container contains 1 child element");
		assert.ok(this.oFeedInput.$().find("#input-textArea").children().length === 1, "Text Area has correct children");
	});


	QUnit.module("Events", {
		beforeEach: async function () {
			this.oFeedInput = new FeedInput("input");
			this.oFeedInput.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oFeedInput.destroy();
		}
	});

	QUnit.test("Post - fired with correct parameters", function (assert) {
		assert.expect(1); // verifies the event handler was executed
		function onPost(oEvt) {
			assert.strictEqual(oEvt.getParameter("value"), "firedValue", "Post event was fired");
		}

		this.oFeedInput.attachPost(onPost);
		this.oFeedInput.setValue("firedValue");
		this.oFeedInput.setEnabled(true);
		qutils.triggerEvent("tap", "input-button");
		qutils.triggerEvent("click", "input-button");
	});

	QUnit.test("Post - not fired if disabled", function (assert) {
		assert.expect(0); // verifies the event handler was NOT executed
		function onPost(oEvt) {
			assert.strictEqual(oEvt.getParameter("value"), "firedValue", "Post event was fired");
		}

		this.oFeedInput.attachPost(onPost);
		this.oFeedInput.setEnabled(false);
		qutils.triggerEvent("tap", "input-button");
	});

	QUnit.test("Post - not fired if value contains only whitespaces", function (assert) {
		assert.expect(0); // verifies the event handler was NOT executed
		function onPost(oEvt) {
			assert.strictEqual(oEvt.getParameter("value"), "firedValue", "Post event was fired");
		}

		this.oFeedInput.attachPost(onPost);
		this.oFeedInput.setEnabled(true);
		this.oFeedInput.setValue(" ");
		qutils.triggerEvent("tap", "input-button");
	});

	QUnit.test("Post - not fired if enabled but value contains only whitespaces", function (assert) {
		assert.expect(0); // verifies the event handler was NOT executed
		function onPost(oEvt) {
			assert.strictEqual(oEvt.getParameter("value"), "firedValue", "Post event was fired");
		}

		this.oFeedInput.attachPost(onPost);
		this.oFeedInput.setValue(" ");
		this.oFeedInput.setEnabled(true);
		qutils.triggerEvent("tap", "input-button");
	});

	QUnit.test("Post - value is empty afterwards", function (assert) {
		assert.expect(2); // verifies the event handler was executed
		function onPost(oEvt) {
			assert.strictEqual(oEvt.getParameter("value"), "firedValue", "Post event was fired");
		}

		this.oFeedInput.attachPost(onPost);
		this.oFeedInput.setValue("firedValue");
		this.oFeedInput.setEnabled(true);
		qutils.triggerEvent("tap", "input-button");
		qutils.triggerEvent("click", "input-button");
		assert.strictEqual(this.oFeedInput.getValue(), "", "value should be empty");
	});

	QUnit.test("Post - fired when pressing the Enter key", function (assert) {
		assert.expect(1); //verifies the event handler was executed
		function onPost(oEvt) {
			assert.strictEqual(oEvt.getParameter("value"), "firedValue", "Post event was fired");
		}

		this.oFeedInput.attachPost(onPost);
		this.oFeedInput.setValue("firedValue");
		this.oFeedInput.setEnabled(true);
		qutils.triggerKeydown("input-button", KeyCodes.ENTER);
		qutils.triggerKeyEvent("keypress", "input-button", KeyCodes.ENTER);
		qutils.triggerKeyup("input-button", KeyCodes.ENTER);
	});

	QUnit.test("Post - fired when pressing the Space key", function (assert) {
		assert.expect(1); //verifies the event handler was executed
		function onPost(oEvt) {
			assert.strictEqual(oEvt.getParameter("value"), "firedValue", "Post event was fired");
		}

		this.oFeedInput.attachPost(onPost);
		this.oFeedInput.setValue("firedValue");
		this.oFeedInput.setEnabled(true);
		qutils.triggerKeydown("input-button", KeyCodes.SPACE);
		qutils.triggerKeyEvent("keypress", "input-button", KeyCodes.SPACE);
		qutils.triggerKeyup("input-button", KeyCodes.SPACE);
	});

	QUnit.test("Post - not fired when pressing 'A' Key", function (assert) {
		assert.expect(0); //verifies the event handler was NOT executed
		function onPost(oEvt) {
			assert.strictEqual(oEvt.getParameter("value"), "firedValue", "Post event was fired");
		}

		this.oFeedInput.attachPost(onPost);
		this.oFeedInput.setValue("firedValue");
		this.oFeedInput.setEnabled(true);
		qutils.triggerKeydown("input-button", KeyCodes.A);
		qutils.triggerKeyEvent("keypress", "input-button", KeyCodes.A);
		qutils.triggerKeyup("input-button", KeyCodes.A);
	});

	QUnit.module("Custom Methods", {
		beforeEach: async function () {
			this.oFeedInput = new FeedInput("input");
			this.oFeedInput.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oFeedInput.destroy();
		}
	});

	QUnit.test("enablePostButton method", async function(assert) {
		// Default: should be disabled when value is empty
		this.oFeedInput.setValue("");
		this.oFeedInput.enablePostButton();
		await nextUIUpdate();
		assert.strictEqual(this.oFeedInput._getPostButton().getEnabled(), false, "Post button is disabled when value is empty");

		// Should be enabled when value is set
		this.oFeedInput.setValue("test");
		this.oFeedInput.enablePostButton();
		await nextUIUpdate();
		assert.strictEqual(this.oFeedInput._getPostButton().getEnabled(), true, "Post button is enabled when value is set");

		// Explicitly enable
		this.oFeedInput.setValue("");
		this.oFeedInput.enablePostButton(true);
		await nextUIUpdate();
		assert.strictEqual(this.oFeedInput._getPostButton().getEnabled(), true, "Post button is enabled when enablePostButton(true) is called");

		// Explicitly disable
		this.oFeedInput.setValue("");
		this.oFeedInput.enablePostButton(false);
		await nextUIUpdate();
		assert.strictEqual(this.oFeedInput._getPostButton().getEnabled(), false, "Post button is disabled when enablePostButton(false) is called");

		// Explicitly enable
		this.oFeedInput.setValue("test");
		this.oFeedInput.enablePostButton(true);
		await nextUIUpdate();
		assert.strictEqual(this.oFeedInput._getPostButton().getEnabled(), true, "Post button is enabled");

		// Explicitly disable
		this.oFeedInput.setValue("test");
		this.oFeedInput.enablePostButton(false);
		await nextUIUpdate();
		assert.strictEqual(this.oFeedInput._getPostButton().getEnabled(), true, "Post button is enabled");
	});

	QUnit.test("_isControlEnabled method", function(assert) {
		// Should be false when value is empty
		this.oFeedInput.setValue("");
		this.oFeedInput._bEnablePostButton = false;
		assert.strictEqual(this.oFeedInput._isControlEnabled(), false, "_isControlEnabled returns false when value is empty and _bEnablePostButton is false");

		// Should be true when value is set
		this.oFeedInput.setValue("test");
		this.oFeedInput._bEnablePostButton = false;
		assert.strictEqual(this.oFeedInput._isControlEnabled(), true, "_isControlEnabled returns true when value is set and _bEnablePostButton is false");

		// Should be true when _bEnablePostButton is true, regardless of value
		this.oFeedInput.setValue("");
		this.oFeedInput._bEnablePostButton = true;
		assert.strictEqual(this.oFeedInput._isControlEnabled(), true, "_isControlEnabled returns true when _bEnablePostButton is true and value is empty");
		this.oFeedInput.setValue("test");
		assert.strictEqual(this.oFeedInput._isControlEnabled(), true, "_isControlEnabled returns true when _bEnablePostButton is true and value is set");
	});

	QUnit.test("ActionButton aggregation is rendered", async function(assert) {
		var oFeedInput = new FeedInput();
		// Only a sap.m.Button with icon and no text should be rendered
		oFeedInput.removeAllActions();
		var oButtonValid = new Button({icon: "sap-icon://add"});
		oFeedInput.addAggregation("actions", oButtonValid);
		oFeedInput.placeAt("qunit-fixture");
		await nextUIUpdate();
		var oActionButton = oFeedInput.getDomRef().querySelector(".sapMFeedInActionButton");
		assert.ok(oActionButton !== null, "ActionButton is rendered in the DOM when valid");

		// Button with text (should not be rendered)
		oFeedInput.removeAllActions();
		var oButtonWithText = new Button({icon: "sap-icon://add", text: "Not allowed"});
		oFeedInput.addAggregation("actions", oButtonWithText);
		await nextUIUpdate();
		oActionButton = oFeedInput.getDomRef().querySelector(".sapMFeedInActionButton");
		assert.ok(oActionButton === null, "ActionButton is not rendered when it has both icon and text");

		// Button with only text (should not be rendered)
		oFeedInput.removeAllActions();
		var oButtonTextOnly = new Button({text: "Not allowed"});
		oFeedInput.addAggregation("actions", oButtonTextOnly);
		await nextUIUpdate();
		oActionButton = oFeedInput.getDomRef().querySelector(".sapMFeedInActionButton");
		assert.ok(oActionButton === null, "ActionButton is not rendered when it has only text and no icon");

		// Button with neither icon nor text (should not be rendered)
		oFeedInput.removeAllActions();
		var oButtonEmpty = new Button();
		oFeedInput.addAggregation("actions", oButtonEmpty);
		await nextUIUpdate();
		oActionButton = oFeedInput.getDomRef().querySelector(".sapMFeedInActionButton");
		assert.ok(oActionButton === null, "ActionButton is not rendered when it has neither icon nor text");

		oFeedInput.destroy();
	});

	QUnit.test("_getActionButtonIfValid method", function(assert) {
		var oFeedInput = new FeedInput();

		// Valid: sap.m.Button with icon and no text
		oFeedInput.removeAllActions();
		var oButtonIconOnly = new Button({icon: "sap-icon://add"});
		oFeedInput.addAggregation("actions", oButtonIconOnly);
		assert.strictEqual(oFeedInput._getActionButtonIfValid(), oButtonIconOnly, "Returns the action button when it is a sap.m.Button with only icon and no text");

		// Invalid: sap.m.Button with icon and text
		oFeedInput.removeAllActions();
		var oButtonWithText = new Button({icon: "sap-icon://add", text: "Not allowed"});
		oFeedInput.addAggregation("actions", oButtonWithText);
		assert.strictEqual(oFeedInput._getActionButtonIfValid(), undefined, "Returns undefined when action button has both icon and text");

		// Invalid: sap.m.Button with text only
		oFeedInput.removeAllActions();
		var oButtonTextOnly = new Button({text: "Not allowed"});
		oFeedInput.addAggregation("actions", oButtonTextOnly);
		assert.strictEqual(oFeedInput._getActionButtonIfValid(), undefined, "Returns undefined when action button has only text and no icon");

		// Invalid: sap.m.Button with neither icon nor text
		oFeedInput.removeAllActions();
		var oButtonEmpty = new Button();
		oFeedInput.addAggregation("actions", oButtonEmpty);
		assert.strictEqual(oFeedInput._getActionButtonIfValid(), undefined, "Returns undefined when action button has neither icon nor text");

		// Invalid: not a sap.m.Button
		oFeedInput.removeAllActions();
		var oMenuButton = new MenuButton({icon: "sap-icon://add"});
		oFeedInput.addAggregation("actions", oMenuButton);
		assert.strictEqual(oFeedInput._getActionButtonIfValid(), undefined, "Returns undefined when action button is not a sap.m.Button");

		oFeedInput.destroy();
	});
});