/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/MessageBox"
], function(jQuery, MessageBox) {
	"use strict";

	QUnit.module("jQuery.htmlPrefilter self-closing-check");

	QUnit.test("Result of htmlPrefilter is same as input", function (assert) {
		this.stub(console, "error");
		this.stub(MessageBox, "alert");
		this.stub(window, "alert");
		this.stub(sap.ui, "require");
		assert.equal(jQuery.htmlPrefilter("<br><div/>"), "<br><div/>");
		assert.equal(jQuery.htmlPrefilter("<br/><img/><input/>"), "<br/><img/><input/>");
		assert.equal(jQuery.htmlPrefilter("<div/><span/><input/></span>"), "<div/><span/><input/></span>");
		assert.equal(jQuery.htmlPrefilter("<div><svg/></div>"), "<div><svg/></div>");
		assert.equal(jQuery.htmlPrefilter("<div><math/></div>"), "<div><math/></div>");
	});

	// Check which unit tests need to be executed,
	// the self-closing-check can be enabled or disabled via URL parameter.

	// Unit tests when enabled:
	if (/(?:\?|&)sap-ui-xx-self-closing-check=(?:x|X|true)/.exec(window.location.search)) {

		QUnit.module("jQuery.htmlPrefilter self-closing-check enabled");

		QUnit.test("check if enabled", function (assert) {
			assert.ok(/(?:\?|&)sap-ui-xx-self-closing-check=(?:x|X|true)/.exec(window.location.search));
		});

		QUnit.test("MessageBox alert is shown", function (assert) {
			assert.expect(9);

			var done = assert.async();
			var oConsoleErrorStub = this.stub(console, "error");
			this.stub(MessageBox, "alert").callsFake(function (oMsgText) {
				if (oMsgText && oMsgText.isA("sap.m.FormattedText") && /summary/.test(oMsgText.getHtmlText())) {
					finalAssertions();
				}
			});
			this.stub(window, "alert").callsFake(function (sText) {
				if (/summary/.test(sText)) {
					finalAssertions();
				}
			});

			function finalAssertions() {

				assert.ok(oConsoleErrorStub.called, "Error was logged");

				assert.equal(oConsoleErrorStub.getCall(0).args[0], 'jQuery incompatibility: non-void HTML tags must not use self-closing syntax.\n' +
					'HTML element used as self-closing tag: <div/>\n' +
					'HTML element should be closed correctly, such as: <div></div>\n' +
					'Please check the following note for more information:\n' +
					'https://launchpad.support.sap.com/#/notes/2944336 or\n' +
					'https://github.com/SAP/openui5/blob/master/docs/self_closing_tags_fix_instructions.md',
					"Console Error content should be valid"
				);

				assert.equal(MessageBox.alert.callCount, 3, "MessageBox.alert was called at three times");

				var oMessageBoxAlertCallOne = MessageBox.alert.getCall(0);
				assert.equal(oMessageBoxAlertCallOne.args[1].title, "Incompatibility detected");

				assert.ok(oMessageBoxAlertCallOne.args[0].isA("sap.m.FormattedText"), "First finding - should be a sap.m.FormattedText control");
				var sHtmlTextOne = 'jQuery&#x20;incompatibility&#x3a;&#x20;non-void&#x20;HTML&#x20;tags&#x20;must&#x20;not&#x20;use&#x20;self-closing&#x20;syntax.' +
					'<br>HTML&#x20;element&#x20;used&#x20;as&#x20;self-closing&#x20;tag&#x3a;&#x20;&lt;div&#x2f;&gt;<br>HTML&#x20;element&#x20;should&#x20;be&#x20;' +
					'closed&#x20;correctly,&#x20;such&#x20;as&#x3a;&#x20;&lt;div&gt;&lt;&#x2f;div&gt;<br>Please&#x20;check&#x20;the&#x20;following&#x20;note&#x20;' +
					'for&#x20;more&#x20;information&#x3a;<br><a href=\"https://launchpad.support.sap.com/#/notes/2944336\" target=\"_blank\" class=\"sapMLnk\">' +
					'https://launchpad.support.sap.com/#/notes/2944336</a> or<br><a href=\"https://github.com/SAP/openui5/blob/master/docs/self_closing_tags_fix_instructions.md\" ' +
					'target=\"_blank\" class=\"sapMLnk\">https://github.com/SAP/openui5/blob/master/docs/self_closing_tags_fix_instructions.md</a>';
				assert.deepEqual(oMessageBoxAlertCallOne.args[0].getHtmlText(), sHtmlTextOne, "First finding - HTML content is valid");

				var oMessageBoxCallTwo = MessageBox.alert.getCall(1);
				assert.equal(oMessageBoxCallTwo.args[1].title, "Incompatibility detected");
				assert.ok(oMessageBoxCallTwo.args[0].isA("sap.m.FormattedText"), "Second finding - should be a sap.m.FormattedText control");
				var sHtmlTextTwo = 'jQuery&#x20;incompatibility&#x3a;&#x20;non-void&#x20;HTML&#x20;tags&#x20;must&#x20;not&#x20;use&#x20;self-closing&#x20;syntax.' +
					'<br>HTML&#x20;element&#x20;used&#x20;as&#x20;self-closing&#x20;tag&#x3a;&#x20;&lt;span&#x2f;&gt;<br>HTML&#x20;element&#x20;should&#x20;be&#x20;' +
					'closed&#x20;correctly,&#x20;such&#x20;as&#x3a;&#x20;&lt;span&gt;&lt;&#x2f;span&gt;<br>Please&#x20;check&#x20;the&#x20;following&#x20;note&#x20;' +
					'for&#x20;more&#x20;information&#x3a;<br><a href=\"https://launchpad.support.sap.com/#/notes/2944336\" target=\"_blank\" class=\"sapMLnk\">' +
					'https://launchpad.support.sap.com/#/notes/2944336</a> or<br><a href=\"https://github.com/SAP/openui5/blob/master/docs/self_closing_tags_fix_instructions.md\" ' +
					'target=\"_blank\" class=\"sapMLnk\">https://github.com/SAP/openui5/blob/master/docs/self_closing_tags_fix_instructions.md</a>';
				assert.deepEqual(oMessageBoxCallTwo.args[0].getHtmlText(), sHtmlTextTwo, "Second finding - HTML content is valid");

				done();
			}

			// act: Create two self-closing tags + the final marker
			jQuery("<div/><span/><summary/>");

		});

		QUnit.test("MessageBox alert is not shown for single normal HTML element", function (assert) {
			var done = assert.async();
			var oConsoleErrorStub = this.stub(console, "error");
			this.stub(MessageBox, "alert").callsFake(function (oMsgText) {
				if (oMsgText && oMsgText.isA("sap.m.FormattedText") && /summary/.test(oMsgText.getHtmlText())) {
					finalAssertions();
				}
			});
			this.stub(window, "alert").callsFake(function (sText) {
				if (/summary/.test(sText)) {
					finalAssertions();
				}
			});

			// Act
			jQuery("<div/>");
			jQuery("<span/>");
			jQuery("<br><img/>"); // void
			jQuery("<br><svg/>"); // SVG namespace
			jQuery("<br><path/>"); // SVG namespace
			jQuery("<br><circle/>"); // SVG namespace
			jQuery("<br><math/>"); // MathML namespace

			// trigger assertions
			jQuery("<br><summary/>");

			function finalAssertions() {
				assert.equal(oConsoleErrorStub.callCount, 1, "No error was logged for the first 3 calls to jQuery");
				assert.equal(MessageBox.alert.callCount, 1, "MessageBox.alert was not called for the first 3 calls to jQuery");
				done();
			}
		});

		QUnit.test("Fallback to alert when sap.ui.require is not available", function (assert) {
			var done = assert.async();
			var oConsoleErrorStub = this.stub(console, "error");
			this.stub(MessageBox, "alert").callsFake(function (oMsgText) {
				finalAssertions();
			});
			this.stub(window, "alert").callsFake(function (sText) {
				finalAssertions();
			});
			this.stub(sap.ui, "require").throws();

			function finalAssertions() {
				assert.ok(oConsoleErrorStub.calledTwice, "Error was logged");
				assert.equal(oConsoleErrorStub.getCall(0).args[0], "jQuery incompatibility: non-void HTML tags must not use self-closing syntax.\n" +
					"HTML element used as self-closing tag: <div/>\n" +
					"HTML element should be closed correctly, such as: <div></div>\n" +
					"Please check the following note for more information:\n" +
					"https://launchpad.support.sap.com/#/notes/2944336 or\n" +
					"https://github.com/SAP/openui5/blob/master/docs/self_closing_tags_fix_instructions.md",
					"Console Error content should be valid"
				);
				assert.equal(oConsoleErrorStub.getCall(1).args[0], "Exception in error handling: Error: Error. Falling back to alert().");

				assert.ok(window.alert.called, "Native alert was called.");
				assert.equal(window.alert.getCall(0).args[0], "jQuery incompatibility: non-void HTML tags must not use self-closing syntax.\n" +
					"HTML element used as self-closing tag: <div/>\n" +
					"HTML element should be closed correctly, such as: <div></div>\n" +
					"Please check the following note for more information:\n" +
					"https://launchpad.support.sap.com/#/notes/2944336 or\n" +
					"https://github.com/SAP/openui5/blob/master/docs/self_closing_tags_fix_instructions.md",
					"Native alert was called."
				);

				done();
			}

			// act
			jQuery("<br><div/>");

		});

		QUnit.test("Fallback to alert when sap.ui.require ErrorHandler is called", function (assert) {
			assert.expect(6);
			var done = assert.async();
			var oConsoleErrorStub = this.stub(console, "error");
			this.stub(MessageBox, "alert").callsFake(function (oMsgText) {
				finalAssertions();
			});
			this.stub(window, "alert").callsFake(function (sText) {
				finalAssertions();
			});
			this.stub(sap.ui, "require")
			.withArgs(["sap/m/MessageBox", "sap/m/FormattedText", "sap/base/security/encodeXML"], sinon.match.any, sinon.match.any)
			.callsFake(function (aDependencies, fnCallback, fnErrBack) {
				fnErrBack(new Error());
				assert.ok(true, "sap.ui.require ErrorHandler was called.");
			});
			sap.ui.require.callThrough();

			function finalAssertions() {
				assert.ok(oConsoleErrorStub.calledTwice, "Errors were logged");

				assert.equal(oConsoleErrorStub.getCall(0).args[0], "jQuery incompatibility: non-void HTML tags must not use self-closing syntax.\n" +
					"HTML element used as self-closing tag: <div/>\n" +
					"HTML element should be closed correctly, such as: <div></div>\n" +
					"Please check the following note for more information:\n" +
					"https://launchpad.support.sap.com/#/notes/2944336 or\n" +
					"https://github.com/SAP/openui5/blob/master/docs/self_closing_tags_fix_instructions.md",
					"Console Error content should be valid"
				);

				assert.equal(oConsoleErrorStub.getCall(1).args[0], "Showing error with UI5 controls failed. Falling back to alert().", "Fallback to alert error is shown.");

				assert.ok(window.alert.called, "Native alert was called.");
				assert.equal(window.alert.getCall(0).args[0], "jQuery incompatibility: non-void HTML tags must not use self-closing syntax.\n" +
					"HTML element used as self-closing tag: <div/>\n" +
					"HTML element should be closed correctly, such as: <div></div>\n" +
					"Please check the following note for more information:\n" +
					"https://launchpad.support.sap.com/#/notes/2944336 or\n" +
					"https://github.com/SAP/openui5/blob/master/docs/self_closing_tags_fix_instructions.md",
					"Native alert was called.");
				done();
			}

			// act
			jQuery("<br><div/>");
		});

	} else {

		// Unit tests when disabled:
		QUnit.module("jQuery.htmlPrefilter self-closing-check disabled (default)");

		QUnit.test("check if disabled", function(assert) {
			assert.notOk(/(?:\?|&)sap-ui-xx-self-closing-check=(?:x|X|true)/.exec(window.location.search));
		});

		QUnit.test("MessageBox alert should not be shown", function(assert) {
			var oConsoleErrorStub = this.stub(console, "error");

			// act: Create two self-closing tags + the final marker
			jQuery("<div/><span/><summary/>");

			assert.notOk(oConsoleErrorStub.called, "No error was logged");
		});

		QUnit.test("MessageBox alert is not shown for single normal HTML element", function(assert) {
			var oConsoleErrorStub = this.stub(console, "error");

			// Act
			jQuery("<div/>");
			jQuery("<span/>");
			jQuery("<br><img/>"); // void
			jQuery("<br><svg/>"); // SVG namespace
			jQuery("<br><path/>"); // SVG namespace
			jQuery("<br><circle/>"); // SVG namespace
			jQuery("<br><math/>"); // MathML namespace

			// trigger assertions
			jQuery("<br><summary/>");

			assert.notOk(oConsoleErrorStub.called, "No error was logged");
		});

		QUnit.test("No fallback to alert when sap.ui.require is not available", function(assert) {
			var oConsoleErrorStub = this.stub(console, "error");

			this.stub(sap.ui, "require").throws();

			// act
			jQuery("<br><div/>");

			assert.notOk(oConsoleErrorStub.called, "No error was logged");

		});

	}
});
