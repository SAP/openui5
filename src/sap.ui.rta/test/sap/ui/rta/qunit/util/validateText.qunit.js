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
			var oAction = {validators: ["noEmptyText"]};
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
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});