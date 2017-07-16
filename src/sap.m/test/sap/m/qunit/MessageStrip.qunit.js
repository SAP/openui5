/*global QUnit,sinon*/

(function() {
	"use strict";

	jQuery.sap.require("sap.ui.qunit.qunit-css");
	jQuery.sap.require("sap.ui.thirdparty.qunit");
	jQuery.sap.require("sap.ui.qunit.qunit-junit");
	jQuery.sap.require("sap.ui.qunit.qunit-coverage");
	jQuery.sap.require("sap.ui.qunit.QUnitUtils");
	jQuery.sap.require("sap.ui.thirdparty.sinon");
	jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");
	sinon.config.useFakeTimers = false;
	var DOM_RENDER_LOCATION = "qunit-fixture";
	var CLASS_CLOSE_BUTTON = ".sapMMsgStripCloseButton";
	var CLASS_TEXT_MESSAGE = ".sapMMsgStripMessage";
	var CLASS_ICON = ".sapMMsgStripIcon";
	var CLASS_FORMATTED_TEXT = ".sapMFT";
	var CLASS_TEXT = ".sapMText";

	QUnit.module("API", {
		beforeEach: function() {
			this.oMessageStrip = new sap.m.MessageStrip();

			this.oMessageStrip.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oMessageStrip.destroy();
		}
	});

	QUnit.test("Initialization", function(assert) {
		// act
		this.oMessageStrip.setShowIcon(true);
		this.oMessageStrip.setShowCloseButton(true);
		sap.ui.getCore().applyChanges();

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

	QUnit.test("Setting None type", function(assert) {
		// act
		this.oMessageStrip.setType("None");
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(this.oMessageStrip.getType(), "Information", "should forward to Information");
	});

	QUnit.test("Setting custom icon on Error state", function(assert) {
		// act
		this.oMessageStrip.setType("Error");
		this.oMessageStrip.setCustomIcon("sap-icon://undo");
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(this.oMessageStrip.getCustomIcon(), "sap-icon://undo", "icon should be undo");
	});

	QUnit.test("Custom icon should not be set by the type icon", function(assert) {
		// act
		this.oMessageStrip.setType("Error");
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(this.oMessageStrip.getCustomIcon(), "", "custom icon should not be defined");
	});

	QUnit.test("Link control via setLink", function(assert) {
		var linkText = "Link Text";

		this.oMessageStrip.setLink(new sap.m.Link({ text: linkText }));
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oMessageStrip.getLink().getText(), linkText,
			"should be set as an aggregation and have the specified text");
	});

	QUnit.test("Link control via setAggregation", function(assert) {
		// arrange
		var oLink = new sap.m.Link({
			text: "Link Text"
		});

		// act
		this.oMessageStrip.setAggregation("link", oLink, false);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.oMessageStrip.$().find(".sapMLnk").length, 1, "should be set as an aggregation");
	});

	QUnit.test("Setting the text", function(assert) {
		// arrange
		var oText = this.oMessageStrip.getAggregation("_text");

		// act
		this.oMessageStrip.setText("Test example");
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(oText.getText(), "Test example", "should set the text of the hiddent aggregation");
		assert.strictEqual(oText.getText(), this.oMessageStrip.getText(), "should set the same text on the MS and it's internal aggregation text");
	});

	QUnit.test("setText", 2, function (oAssert) {
		// Arrange
		var sTestString = "test string",
			oFormattedText = new sap.m.FormattedText(),
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

	QUnit.test("setEnableFormattedText", function (oAssert) {
		// Arrange
		var oLimitSpy = sinon.spy(sap.m.FormattedText.prototype, "_setUseLimitedRenderingRules"),
			oSetterSpy = sinon.spy(sap.m.FormattedText.prototype, "setHtmlText"),
			sTestString = "test string",
			oFormattedText;

		// Act
		this.oMessageStrip.setEnableFormattedText(true);
		oFormattedText = this.oMessageStrip.getAggregation("_formattedText");

		// Assert
		oAssert.strictEqual(oLimitSpy.callCount, 1, "sap.m.FormattedText._setUseLimitedRenderingRules called once");
		oAssert.strictEqual(oSetterSpy.callCount, 1, "sap.m.FormattedText.setHtmlText called once");
		oAssert.ok(oFormattedText instanceof sap.m.FormattedText,
			"Internal aggregation of type sap.m.FormattedText is created");

		// Act - apply test string and trigger UI update
		this.oMessageStrip.setText(sTestString);
		sap.ui.getCore().applyChanges();

		// Assert
		oAssert.ok(oFormattedText.getDomRef(),
			"Internal sap.m.FormattedText is rendered in the DOM");
		oAssert.strictEqual(this.oMessageStrip.$().find(CLASS_FORMATTED_TEXT).html(), sTestString,
			"Rendered HTML in internal sap.m.FormattedText should match passed test string");

		// Act - toggle setter
		this.oMessageStrip.setEnableFormattedText(false);
		sap.ui.getCore().applyChanges();

		// Assert
		oAssert.notOk(oFormattedText.getDomRef(),
			"Internal sap.m.FormattedText is not rendered in the DOM");
		oAssert.strictEqual(this.oMessageStrip.$().find(CLASS_TEXT).html(), sTestString,
			"Rendered HTML should match passed test string");

		// Cleanup
		oLimitSpy.restore();
		oSetterSpy.restore();
	});

	QUnit.test("setText and enableFormattedText", function (oAssert) {
		// Arrange
		var sTestString = "<strong>Warning:</strong> something went wrong",
			oFormattedText;

		// Act
		this.oMessageStrip.setText(sTestString);
		this.oMessageStrip.setEnableFormattedText(true);
		sap.ui.getCore().applyChanges();

		oFormattedText = this.oMessageStrip.getAggregation("_formattedText");

		// Assert
		oAssert.ok(oFormattedText instanceof sap.m.FormattedText,
			"Internal sap.m.FormattedText is initiated and attached to the _formattedText hidden aggregation");
		oAssert.ok(oFormattedText.getDomRef(),
			"sap.m.FormattedText should be rendered in the DOM by the MessageStrip control");
		oAssert.strictEqual(this.oMessageStrip.$().find(CLASS_FORMATTED_TEXT).html(), sTestString,
			"Rendered HTML should match passed test string");
		oAssert.strictEqual(oFormattedText.getHtmlText(), sTestString,
			"Test string is propagated to the internal sap.m.FormattedText control");
	});

	QUnit.test("setText and sap.m.FormattedText - limiting sap.m.FormattedText valid HTML elements", function (oAssert) {
		// Arrange
		var oSpy = sinon.spy(sap.m.FormattedText.prototype, "_setUseLimitedRenderingRules"),
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
		sap.ui.getCore().applyChanges();

		// Arrange - get all html elements rendered and evaluate them as jQuery object
		$Result = jQuery(this.oMessageStrip.$().find(CLASS_FORMATTED_TEXT).html());

		// Assert
		oAssert.ok(sap.m.FormattedText.prototype._setUseLimitedRenderingRules,
			"sap.m.FormattedText should have this SAP-restricted method");
		oAssert.strictEqual(oSpy.callCount, 1, "The method should be called once by the 'setEnableFormattedText' setter.");
		oAssert.strictEqual($Result.length, 4, "Only 4 HTML elements are rendered and evaluated");
		oAssert.strictEqual($Result[0].localName, "a", "The element name should be 'a'");
		oAssert.strictEqual($Result[1].localName, "em", "The element name should be 'em'");
		oAssert.strictEqual($Result[2].localName, "strong", "The element name should be 'strong'");
		oAssert.strictEqual($Result[3].localName, "u", "The element name should be 'u'");

		// Cleanup
		oSpy.restore();
	});

	QUnit.module("Data binding", {
		beforeEach: function() {
			this.oMessageStrip = new sap.m.MessageStrip();

			this.oMessageStrip.placeAt(DOM_RENDER_LOCATION);

			sap.ui.getCore().applyChanges();
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

	QUnit.test("JSON model text binding", function(assert) {
		// arrange
		var oModel = new sap.ui.model.json.JSONModel(this.generateData());
		var sData = this.generateData().text;

		// act
		this.oMessageStrip.setModel(oModel);
		this.oMessageStrip.bindProperty("text", "/text");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.oMessageStrip.getText(), sData, "should work");
		assert.strictEqual(this.oMessageStrip.$().find(CLASS_TEXT).text(), sData, "should set the text to the internal aggregation");
	});


	QUnit.module("Events", {
		beforeEach: function() {
			this.oMessageStrip = new sap.m.MessageStrip({
				text: "Test",
				showCloseButton: true
			});

			this.oMessageStrip.placeAt(DOM_RENDER_LOCATION);

			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			if (this.oMessageStrip) {
				this.oMessageStrip.destroy();
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
			sap.ui.test.qunit.triggerEvent("tap", jQuery(CLASS_CLOSE_BUTTON)[0]);
		}, 0);

	});

	QUnit.test("Pressing enter on close button", function(assert) {
		assert.expect(1);
		var done = assert.async();

		this.oMessageStrip.attachClose(function() {
			assert.ok(true, "should trigger close event");
			done();
		});

		setTimeout(function() {
			jQuery(CLASS_CLOSE_BUTTON)[0].focus();
			sap.ui.test.qunit.triggerKeydown(jQuery(CLASS_CLOSE_BUTTON)[0], jQuery.sap.KeyCodes.ENTER);
		}, 0);
	});

	QUnit.test("Pressing space on close button", function(assert) {
		assert.expect(1);
		var done = assert.async();

		this.oMessageStrip.attachClose(function() {
			assert.ok(true, "should trigger close event");
			done();
		});

		setTimeout(function() {
			jQuery(CLASS_CLOSE_BUTTON)[0].focus();
			sap.ui.test.qunit.triggerKeydown(jQuery(CLASS_CLOSE_BUTTON)[0], jQuery.sap.KeyCodes.SPACE);
		}, 0);
	});

	QUnit.module("ARIA Support", {
		beforeEach: function() {
			this.oMessageStrip = new sap.m.MessageStrip({
				text: "Test",
				showCloseButton: true,
				link: new sap.m.Link({text: "Sample link"})
			});

			this.oMessageStrip.placeAt(DOM_RENDER_LOCATION);

			sap.ui.getCore().applyChanges();
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

	QUnit.test("Live region with aria-live should be present", function (assert) {
		var msgStripDom = this.oMessageStrip.getDomRef(),
			live = msgStripDom.getAttribute("aria-live");

		assert.strictEqual(live, "assertive", "aria-live=asserive is present");
	});

	QUnit.test("Labelledby attribute", function (assert) {
		var msgStripDom = this.oMessageStrip.getDomRef(),
			labelledBy = msgStripDom.getAttribute("aria-labelledby");

		assert.strictEqual(labelledBy, this.oMessageStrip.getId(),
			"should point to the element's id");
	});

	QUnit.test("Invisible aria type text should be present in the root element", function (assert) {
		var msgStripDom = this.oMessageStrip.getDomRef(),
			invisibleText = msgStripDom.querySelectorAll(".sapUiPseudoInvisibleText");

		assert.strictEqual(invisibleText.length, 1,
			"only one element with class .sapUiPseudoInvisibleText should be present");
	});

	QUnit.test("When link is set it should have aria-labelledby attribute", function (assert) {
		var link = this.oMessageStrip.getLink(),
			linkDom = link.getDomRef(),
			labelledBy = linkDom.getAttribute("aria-labelledby");

		assert.strictEqual(labelledBy, this.oMessageStrip.getId() + " " + link.getId(),
			"link aria-labelledby should point to the MessageStrip id");
	});

})();
