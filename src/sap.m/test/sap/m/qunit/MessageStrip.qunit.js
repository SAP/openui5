/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/events/KeyCodes",
	"sap/m/MessageStrip",
	"sap/m/Link",
	"sap/m/FormattedText",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/thirdparty/jquery"
], function(Library, KeyCodes, MessageStrip, Link, FormattedText, nextUIUpdate, JSONModel, qutils, jQuery) {
	"use strict";


	var DOM_RENDER_LOCATION = "qunit-fixture";
	var CLASS_CLOSE_BUTTON = ".sapMMsgStripCloseButton";
	var CLASS_TEXT_MESSAGE = ".sapMMsgStripMessage";
	var CLASS_ICON = ".sapMMsgStripIcon";
	var CLASS_FORMATTED_TEXT = ".sapMFT";
	var CLASS_TEXT = ".sapMText";
	var nAnimationLengthTimeout = 300;

	QUnit.module("API", {
		beforeEach: async function() {
			this.oMessageStrip = new MessageStrip();

			this.oMessageStrip.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oMessageStrip.destroy();
		}
	});

	QUnit.test("Initialization", async function(assert) {
		// act
		this.oMessageStrip.setShowIcon(true);
		this.oMessageStrip.setShowCloseButton(true);
		await nextUIUpdate();

		// assert
		assert.ok(this.oMessageStrip, "MessageStrip should be rendered");
		assert.strictEqual(jQuery(CLASS_CLOSE_BUTTON).length, 1, "Close Button should be rendered");
		assert.strictEqual(jQuery(CLASS_TEXT_MESSAGE).length, 1, "Text wrapper div should be rendered");
		assert.strictEqual(jQuery(CLASS_ICON).length, 1, "Icon div should be rendered");
	});

	QUnit.test("Default values", function(assert) {
		// assert
		assert.strictEqual(this.oMessageStrip.getText(), "", "text should be an empty string");
		assert.strictEqual(this.oMessageStrip.getType(), "Information", "type should be Information");
		assert.strictEqual(this.oMessageStrip.getCustomIcon(), "", "icon should be null");
		assert.strictEqual(this.oMessageStrip.getShowIcon(), false, "showIcon should be false");
		assert.strictEqual(this.oMessageStrip.getShowCloseButton(), false, "showCloseButton should be false");
	});

	QUnit.test("Setting None type", async function(assert) {
		// act
		this.oMessageStrip.setType("None");
		await nextUIUpdate();

		//assert
		assert.strictEqual(this.oMessageStrip.getType(), "Information", "should forward to Information");
	});

	QUnit.test("Setting undefined as type", async function(assert) {
		// act
		this.oMessageStrip.setType(undefined);
		await nextUIUpdate();

		//assert
		assert.strictEqual(this.oMessageStrip.getType(), "Information", "should forward to Information");
	});

	QUnit.test("Setting custom icon on Error state", async function(assert) {
		// act
		this.oMessageStrip.setType("Error");
		this.oMessageStrip.setCustomIcon("sap-icon://undo");
		await nextUIUpdate();

		//assert
		assert.strictEqual(this.oMessageStrip.getCustomIcon(), "sap-icon://undo", "icon should be undo");
	});

	QUnit.test("Custom icon should not be set by the type icon", async function(assert) {
		// act
		this.oMessageStrip.setType("Error");
		await nextUIUpdate();

		//assert
		assert.strictEqual(this.oMessageStrip.getCustomIcon(), "", "custom icon should not be defined");
	});

	QUnit.test("Link control via setLink", async function(assert) {
		var linkText = "Link Text";

		this.oMessageStrip.setLink(new Link({ text: linkText }));
		await nextUIUpdate();

		assert.strictEqual(this.oMessageStrip.getLink().getText(), linkText,
			"should be set as an aggregation and have the specified text");
	});

	QUnit.test("Link control via setAggregation", async function(assert) {
		// arrange
		var oLink = new Link({
			text: "Link Text"
		});

		// act
		this.oMessageStrip.setAggregation("link", oLink, false);
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oMessageStrip.$().find(".sapMLnk").length, 1, "should be set as an aggregation");
	});

	QUnit.test("Setting the text", async function(assert) {
		// arrange
		var oText = this.oMessageStrip.getAggregation("_text");

		// act
		this.oMessageStrip.setText("Test example");
		await nextUIUpdate();

		//assert
		assert.strictEqual(oText.getText(), "Test example", "should set the text of the hiddent aggregation");
		assert.strictEqual(oText.getText(), this.oMessageStrip.getText(), "should set the same text on the MS and it's internal aggregation text");
	});

	QUnit.test("setText", function (oAssert) {
		oAssert.expect(2);

		// Arrange
		var sTestString = "test string",
			oFormattedText = new FormattedText(),
			fnDone = oAssert.async();

		// Mock formatted text setter on the instance and attach to control aggregation
		oFormattedText.setHtmlText = function (sText) {
			// Assert
			oAssert.ok(true, "Mocked setter called");
			oAssert.strictEqual(sText, sTestString, "Correct arguments are propagated to the internal setter");
			fnDone();
		};
		this.oMessageStrip.setAggregation("_formattedText", oFormattedText);

		// Act
		this.oMessageStrip.setText(sTestString);

	});

	QUnit.test("setEnableFormattedText", async function (oAssert) {
		// Arrange
		var oLimitSpy = sinon.spy(FormattedText.prototype, "_setUseLimitedRenderingRules"),
			oSetterSpy = sinon.spy(FormattedText.prototype, "setHtmlText"),
			sTestString = "test string",
			oFormattedText;

		// Act
		this.oMessageStrip.setEnableFormattedText(true);
		oFormattedText = this.oMessageStrip.getAggregation("_formattedText");

		// Assert
		oAssert.strictEqual(oLimitSpy.callCount, 1, "sap.m.FormattedText._setUseLimitedRenderingRules called once");
		oAssert.strictEqual(oSetterSpy.callCount, 1, "sap.m.FormattedText.setHtmlText called once");
		oAssert.ok(oFormattedText instanceof FormattedText,
			"Internal aggregation of type sap.m.FormattedText is created");

		// Act - apply test string and trigger UI update
		this.oMessageStrip.setText(sTestString);
		await nextUIUpdate();

		// Assert
		oAssert.ok(oFormattedText.getDomRef(),
			"Internal sap.m.FormattedText is rendered in the DOM");
		oAssert.strictEqual(this.oMessageStrip.$().find(CLASS_FORMATTED_TEXT)[0].textContent, sTestString,
			"Rendered HTML in internal sap.m.FormattedText should match passed test string");

		// Act - toggle setter
		this.oMessageStrip.setEnableFormattedText(false);
		await nextUIUpdate();

		// Assert
		oAssert.notOk(oFormattedText.getDomRef(),
			"Internal sap.m.FormattedText is not rendered in the DOM");
		oAssert.strictEqual(this.oMessageStrip.$().find(CLASS_TEXT)[0].textContent, sTestString,
			"Rendered HTML should match passed test string");

		// Cleanup
		oLimitSpy.restore();
		oSetterSpy.restore();
	});

	QUnit.test("setText and enableFormattedText", async function (oAssert) {
		// Arrange
		var sTestString = "<strong>Warning:</strong> something went wrong",
			sTestStringSanitized = "<strong style=\"position: static !important;\">Warning:</strong> something went wrong",
			oFormattedText;

		// Act
		this.oMessageStrip.setText(sTestString);
		this.oMessageStrip.setEnableFormattedText(true);
		await nextUIUpdate();

		oFormattedText = this.oMessageStrip.getAggregation("_formattedText");

		// Assert
		oAssert.ok(oFormattedText instanceof FormattedText,
			"Internal sap.m.FormattedText is initiated and attached to the _formattedText hidden aggregation");
		oAssert.ok(oFormattedText.getDomRef(),
			"sap.m.FormattedText should be rendered in the DOM by the MessageStrip control");
		oAssert.strictEqual(this.oMessageStrip.$().find(CLASS_FORMATTED_TEXT).html(), sTestStringSanitized,
			"Rendered HTML should match passed test string");
		oAssert.strictEqual(oFormattedText.getHtmlText(), sTestString,
			"Test string is propagated to the internal sap.m.FormattedText control");
	});

	QUnit.test("setText and sap.m.FormattedText - limiting sap.m.FormattedText valid HTML elements", async function (oAssert) {
		// Arrange
		var oSpy = sinon.spy(FormattedText.prototype, "_setUseLimitedRenderingRules"),
			sHTMLString = [
				// If you change the order of elements here you should also change the order of the assertions below
				"a", "abbr", "blockquote", "br", "cite",
				"code", "em", "h1", "h2", "h3", "h4", "h5",
				"h6", "p", "pre", "strong", "span", "u",
				"dl", "dt", "dl", "ul", "ol", "li"
			].map(function (sValue) {
				return "<" + sValue + "></" + sValue + ">";
			}).join(""),
			$Result;

		// Act
		this.oMessageStrip.setEnableFormattedText(true);
		this.oMessageStrip.setText(sHTMLString);
		await nextUIUpdate();

		// Arrange - get all html elements rendered and evaluate them as jQuery object
		$Result = jQuery(this.oMessageStrip.$().find(CLASS_FORMATTED_TEXT).html());

		// Assert
		oAssert.ok(FormattedText.prototype._setUseLimitedRenderingRules,
			"sap.m.FormattedText should have this SAP-restricted method");
		oAssert.strictEqual(oSpy.callCount, 1, "The method should be called once by the 'setEnableFormattedText' setter.");
		oAssert.strictEqual($Result.length, 5, "Only 5 HTML elements are rendered and evaluated");
		oAssert.strictEqual($Result[0].localName, "a", "The element name should be 'a'");
		oAssert.strictEqual($Result[1].localName, "br", "The element name should be 'br'");
		oAssert.strictEqual($Result[2].localName, "em", "The element name should be 'em'");
		oAssert.strictEqual($Result[3].localName, "strong", "The element name should be 'strong'");
		oAssert.strictEqual($Result[4].localName, "u", "The element name should be 'u'");

		// Cleanup
		oSpy.restore();
	});

	QUnit.test("controls aggregation should be forwarded to the sap.m.FormattedText control", async function (assert) {
		// arrange
		this.oMessageStrip.setEnableFormattedText(true);
		this.oMessageStrip.addControl(new Link({text: "Link 1"}));
		this.oMessageStrip.addControl(new Link({text: "Link 2"}));
		this.oMessageStrip.setText("Message Strip with multiple links: %%0 %%1");
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oMessageStrip.getAggregation("_formattedText").getControls().length, 2, "links should be forwarded to the internal aggregation");
		assert.strictEqual(this.oMessageStrip.getDomRef().querySelectorAll(".sapMLnk").length, 2, "links should be rendered in the DOM");
	});

	QUnit.module("Data binding", {
		beforeEach: async function() {
			this.oMessageStrip = new MessageStrip();

			this.oMessageStrip.placeAt(DOM_RENDER_LOCATION);

			await nextUIUpdate();
		},
		afterEach: function() {
			this.oMessageStrip.destroy();
		},
		generateData: function() {
			return {
				"text": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
			};
		}
	});

	QUnit.test("JSON model text binding", async function(assert) {
		// arrange
		var oModel = new JSONModel(this.generateData());
		var sData = this.generateData().text;

		// act
		this.oMessageStrip.setModel(oModel);
		this.oMessageStrip.bindProperty("text", "/text");
		await nextUIUpdate();

		// assert
		assert.strictEqual(this.oMessageStrip.getText(), sData, "should work");
		assert.strictEqual(this.oMessageStrip.$().find(CLASS_TEXT).text(), sData, "should set the text to the internal aggregation");
	});


	QUnit.module("Events", {
		beforeEach: async function() {
			this.oMessageStrip = new MessageStrip({
				text: "Test",
				showCloseButton: true
			});

			this.oMessageStrip.placeAt(DOM_RENDER_LOCATION);

			await nextUIUpdate();

			this.oButton = this.oMessageStrip.getAggregation("_closeButton");
		},
		afterEach: function() {
			if (this.oMessageStrip) {
				this.oMessageStrip.destroy();
				this.oMessageStrip = null;
			}
			if (this.oButton) {
				this.oButton.destroy();
				this.oButton = null;
			}
		}
	});


	QUnit.test("Tapping on close button", function(assert) {
		assert.expect(1);
		var done = assert.async();
		this.oMessageStrip.attachClose(function() {
			assert.ok(true, 'should trigger close event');
			done();
		});

		setTimeout(function() {
			qutils.triggerEvent("tap", this.oButton);
		}.bind(this), nAnimationLengthTimeout);

	});

	QUnit.test("Pressing enter on close button", function(assert) {
		assert.expect(1);
		var done = assert.async();

		this.oMessageStrip.attachClose(function() {
			assert.ok(true, "should trigger close event");
			done();
		});

		setTimeout(function() {
			this.oButton.focus();
			qutils.triggerKeydown(this.oButton, KeyCodes.ENTER);
		}.bind(this), nAnimationLengthTimeout);
	});

	QUnit.test("Pressing space on close button", function(assert) {
		assert.expect(1);
		var done = assert.async();

		this.oMessageStrip.attachClose(function() {
			assert.ok(true, "should trigger close event");
			done();
		});

		setTimeout(function() {
			this.oButton.focus();
			qutils.triggerKeyup(this.oButton, KeyCodes.SPACE);
		}.bind(this), nAnimationLengthTimeout);
	});

	QUnit.test("close method is called", function(assert) {
		assert.expect(1);
		var done = assert.async(),
			that = this;

		this.oMessageStrip.attachClose(function() {
			assert.notOk(that.oMessageStrip.getVisible(), "Button is pressed");
			done();
		});

		setTimeout(function() {
			this.oMessageStrip.close();
		}.bind(this), nAnimationLengthTimeout);
	});

	QUnit.module("ARIA Support", {
		beforeEach: async function() {
			this.oMessageStrip = new MessageStrip({
				text: "Test",
				showCloseButton: true,
				link: new Link({text: "Sample link"})
			});

			this.oMessageStrip.placeAt(DOM_RENDER_LOCATION);

			await nextUIUpdate();
		},
		afterEach: function() {
			if (this.oMessageStrip) {
				this.oMessageStrip.destroy();
			}
		}
	});

	QUnit.test("Role note should be present", function (assert) {
		var msgStripDom = this.oMessageStrip.getDomRef(),
			role = msgStripDom.getAttribute("role");

		assert.strictEqual(role, "note", "role=note is present");
	});

	QUnit.test("Labelledby attribute", async function (assert) {
		//Arrange
		var oMessageStrip = new MessageStrip({
			text: "Some text",
			showCloseButton: true
		});

		oMessageStrip.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		var oMessageStripDomRef = oMessageStrip.getDomRef(),
			oMessageStripWithLinkDomRef = this.oMessageStrip.getDomRef(),
			sLabelledBy = oMessageStripDomRef.getAttribute("aria-labelledby");

		//Assert
		assert.strictEqual(sLabelledBy, oMessageStrip.getId(),
			"should point to the element's id");
		assert.notOk(oMessageStripWithLinkDomRef.hasAttribute("aria-labelledby"),
			"When link is available, the Messagestrip has no aria-lablledby attribute set");

		//Clean up
		oMessageStrip.destroy();
	});

	QUnit.test("Invisible aria type text should be present in the root element", function (assert) {
		var msgStripDom = this.oMessageStrip.getDomRef(),
			invisibleText = msgStripDom.querySelectorAll(".sapUiPseudoInvisibleText");

		assert.strictEqual(invisibleText.length, 1,
			"only one element with class .sapUiPseudoInvisibleText should be present");
	});

	QUnit.test("When link is set it should have aria-descrribedby attribute", function (assert) {
		var link = this.oMessageStrip.getLink(),
			linkDom = link.getDomRef(),
			describedBy = linkDom.getAttribute("aria-describedby"),
			sId = this.oMessageStrip.getId() + "-info" + " " + this.oMessageStrip.getAggregation("_text").getId();

			//assert
			assert.strictEqual(describedBy, sId, "link aria-describedby should point to the MessageStrip and Link id");

			//act
			this.oMessageStrip.setLink(new Link({text: "test"}));

			//assert
			assert.strictEqual(describedBy, sId, "aria-describedby is not changed");
	});

	QUnit.test("When we have a close button it should have an aria-labelledby attribute", async function (assert) {
		//Arrange
		var oRb = Library.getResourceBundleFor("sap.m");

		var $oCloseButton = this.oMessageStrip.$().find(".sapMMsgStripCloseButton"),
			$sCloseButtonLabelId = $oCloseButton.attr("aria-labelledby"),
			$sCloseButtonLabelText = document.getElementById($sCloseButtonLabelId).innerText,
			sInvisibleTextInformation = oRb.getText("MESSAGE_STRIP_INFORMATION_CLOSE_BUTTON"),
			sInvisibleTextWarning = oRb.getText("MESSAGE_STRIP_WARNING_CLOSE_BUTTON"),
			sInvisibleTextError = oRb.getText("MESSAGE_STRIP_ERROR_CLOSE_BUTTON"),
			sInvisibleTextSuccess = oRb.getText("MESSAGE_STRIP_SUCCESS_CLOSE_BUTTON");

		//Assert
		assert.strictEqual($sCloseButtonLabelText, sInvisibleTextInformation,
			"the aria-labelledby of the close button should indicate that the type of the message strip is Information");

		//Act
		this.oMessageStrip.setType("Error");
		await nextUIUpdate();

		//Assert
		assert.strictEqual(document.getElementById($oCloseButton.attr("aria-labelledby")).innerText, sInvisibleTextError,
			"the aria-labelledby of the close button should indicate that the type of the message strip is Error");

		//Act
		this.oMessageStrip.setType("Warning");
		await nextUIUpdate();

		//Assert
		assert.strictEqual(document.getElementById($oCloseButton.attr("aria-labelledby")).innerText, sInvisibleTextWarning,
			"the aria-labelledby of the close button should indicate that the type of the message strip is Warning");

		//Act
		this.oMessageStrip.setType("Success");
		await nextUIUpdate();

		//Assert
		assert.strictEqual(document.getElementById($oCloseButton.attr("aria-labelledby")).innerText, sInvisibleTextSuccess,
			"the aria-labelledby of the close button should indicate that the type of the message strip is Success");
	});

	QUnit.test("When we have a close button it should indicate that it closes a message strip", function (assert) {
		assert.strictEqual(jQuery(CLASS_CLOSE_BUTTON).attr('title'),
			Library.getResourceBundleFor("sap.m").getText("MESSAGE_STRIP_TITLE"),
			"the title of the close button should be set to 'Close'");
	});

	QUnit.test("Decorative icon should have aria-hidden set to true", async function(assert) {
		//Act
		this.oMessageStrip.setShowIcon(true);
		await nextUIUpdate();

		//Assert
		assert.equal(jQuery(".sapUiIcon").attr("aria-hidden"), "true", "The icon has an aria-hidden attribute set to true");
	});


	QUnit.test("Close button invisible text should be rendered only once", async function(assert) {
		//Arrange
		var oMessageStrip = new MessageStrip({
				type: "Error"
			}),
			oCloseButton = oMessageStrip.getAggregation("_closeButton");

		await nextUIUpdate();

		//Assert
		assert.equal(document.querySelectorAll("#" + oCloseButton.getAriaLabelledBy()).length, 1,
			"There should be only 1 invisible text element present in the dom");

		// Cleanup
		oMessageStrip.destroy();
	});

	QUnit.test("Should render aria-roledescription attribute with the correct text", async function(assert) {
		// Arrange
		var oResourceBundle = Library.getResourceBundleFor("sap.m"),
			oMessageStrip = new MessageStrip({
				text: "MessageStrip text message",
				type: "Warning"
			});

		// Act
		oMessageStrip.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oMessageStrip.getDomRef().getAttribute("aria-roledescription"), oResourceBundle.getText("MESSAGE_STRIP_ARIA_ROLE_DESCRIPTION"), "aria-roledescription is rendered correctly");

		// Cleanup
		oMessageStrip.destroy();
	});
});