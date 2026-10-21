/* global QUnit */
sap.ui.define([
	"sap/ui/base/BindingParser",
	"sap/ui/rta/util/validateText",
	"sap/ui/thirdparty/sinon-4"
],
function(
	BindingParser,
	validateText,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("validateText", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When a valid string is passed", function(assert) {
			validateText("Potato");
			assert.ok(true, "then no errors were thrown");
		});

		QUnit.test("When two equal strings are passed", function(assert) {
			try {
				validateText("Potato", "Potato");
			} catch (oError) {
				assert.strictEqual(oError.message, "sameTextError", "then the sameTextError error was thrown");
			}
		});

		QUnit.test("When the text is an empty string (default validator)", function(assert) {
			var sEmptyTextKey = "\xa0";
			var oAction = { validators: ["noEmptyText"] };
			assert.throws(
				validateText.bind(this, sEmptyTextKey, "Test", oAction),
				Error("Please enter a name."),
				"then the empty text error was thrown"
			);
		});

		QUnit.test("When a custom validator is used", function(assert) {
			function validatorFunction(sText) {
				return sText === "Potato";
			}
			var oAction = {
				validators: [{
					validatorFunction,
					errorMessage: "Not a Potato"
				}]
			};
			try {
				validateText("notPotato", "Potato", oAction);
			} catch (oError) {
				assert.strictEqual(oError.message, "Not a Potato", "then the custom error was thrown");
			}
		});

		QUnit.test("When a Binding is passed as text", function(assert) {
			try {
				validateText("{Binding}");
			} catch (oError) {
				assert.strictEqual(
					oError.message,
					"The name must not contain \"{\". Please choose a different name.",
					"then binding error was thrown");
			}
		});

		QUnit.test("When a the Binding is passed as text", function(assert) {
			sandbox.stub(BindingParser, "complexParser").throws(new Error());
			try {
				validateText("Wrong Binding");
			} catch (oError) {
				assert.strictEqual(
					oError.message,
					"The name must not contain \"{\". Please choose a different name.",
					"then binding error was thrown");
			}
		});

		QUnit.test("When skipSameTextValidator is set and equal strings are passed", function(assert) {
			assert.ok(true, "sameTextError is not thrown when skipSameTextValidator is set");
			validateText("Potato", "Potato", { skipSameTextValidator: true });
		});

		QUnit.test("When skipSameTextValidator is set and a binding is passed", function(assert) {
			assert.throws(
				validateText.bind(this, "{Binding}", "{Binding}", { skipSameTextValidator: true }),
				Error("The name must not contain \"{\". Please choose a different name."),
				"then the binding error is still thrown"
			);
		});

		QUnit.test("When equal strings are passed, sameText is checked before noBindingText", function(assert) {
			assert.throws(
				validateText.bind(this, "{Binding}", "{Binding}"),
				Error("sameTextError"),
				"then sameTextError is thrown before the binding error"
			);
		});
	});

	QUnit.module("validateText.getTrimmedText", function() {
		QUnit.test("When texts with and without surrounding whitespace are passed", (assert) => {
			assert.strictEqual(validateText.getTrimmedText("Potato"), "Potato", "then a clean text is returned unchanged");
			assert.strictEqual(validateText.getTrimmedText("Potato "), "Potato", "then a trailing blank is removed");
			assert.strictEqual(validateText.getTrimmedText(" Potato"), "Potato", "then a leading blank is removed");
			assert.strictEqual(validateText.getTrimmedText("  Potato  "), "Potato", "then surrounding blanks are removed");
		});

		QUnit.test("When empty or whitespace-only text is passed", (assert) => {
			const sEmptyTextKey = "\xa0";
			assert.strictEqual(validateText.getTrimmedText(""), sEmptyTextKey, "then the sentinel is returned for an empty string");
			assert.strictEqual(validateText.getTrimmedText("   "), sEmptyTextKey, "then the sentinel is returned for spaces only");
			assert.strictEqual(validateText.getTrimmedText(sEmptyTextKey), sEmptyTextKey, "then the sentinel is returned for a nbsp");
			assert.strictEqual(validateText.getTrimmedText(undefined), sEmptyTextKey, "then the sentinel is returned for undefined");
			assert.strictEqual(validateText.getTrimmedText(null), sEmptyTextKey, "then the sentinel is returned for null");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});