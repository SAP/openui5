/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/MaskInputRule",
	"sap/m/MaskInput",
	"sap/base/Log",
	"sap/ui/core/Core"
], function(createAndAppendDiv, MaskInputRule, MaskInput, Log, oCore) {
	"use strict";

	createAndAppendDiv("content");



	QUnit.module("API", {
		beforeEach: function () {
			this.oMaskInputRule = new MaskInputRule();
			this.oMaskInput = new MaskInput({rules: [this.oMaskInputRule]});
			this.oMaskInput.placeAt("content");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oMaskInput.destroy();
		}
	});

	QUnit.test("Mask Format Symbol setter", function (assert) {
		var oRule = this.oMaskInputRule,
				maskFormatSymbol1 = 'a',
				maskFormatSymbol2 = '9';
		oRule.setMaskFormatSymbol(maskFormatSymbol1);
		assert.strictEqual(oRule.getMaskFormatSymbol(), maskFormatSymbol1, "The mask format symbol has the same value as the last set one");

		oRule.setMaskFormatSymbol(maskFormatSymbol2);
		assert.strictEqual(oRule.getMaskFormatSymbol(), maskFormatSymbol2, "The mask format symbol has the same value as the last set one");
	});

	QUnit.test("Setting an invalid Mask Format Symbol is not accepted", function (assert) {
		var oRule = this.oMaskInputRule,
				oErrorSpy = this.spy(Log, 'error'),
				oSetterSpy = this.spy(oRule, 'setProperty');

		setAndValidate.call(this, "more_than_one_character");
		setAndValidate.call(this, "");

		function setAndValidate(sSymbol) {
			var sExpectedError = "The mask format symbol '" + sSymbol + "' is not valid";

			oErrorSpy.restore();
			oErrorSpy = this.spy(Log, 'error');
			oSetterSpy.restore();
			oSetterSpy = this.spy(oRule, 'setProperty');
			oRule.setMaskFormatSymbol(sSymbol);
			assert.ok(oSetterSpy.notCalled, "Invalid maskFormatSymbol [" + sSymbol + "] is not accepted");
			assert.ok(oErrorSpy.calledOnce, "When called with invalid parameter [" + sSymbol + "] setMaskFormatSymbol logs error.");
			assert.equal(oErrorSpy.getCall(0).args[0], sExpectedError,
					"Verify the exact error when setMaskFormatSymbol is called with invalid parameter [" + sSymbol + "]");
		}
	});

	QUnit.test("Mask Format Symbol default value", function (assert) {
		assert.equal(this.oMaskInputRule.getMaskFormatSymbol(), "*", "Default value");
	});

	QUnit.test("Regex setter", function (assert) {
		var oRule = this.oMaskInputRule,
				regex1 = 'a-z',
				regex2 = '0-9';
		oRule.setRegex(regex1);
		assert.strictEqual(oRule.getRegex(), regex1, "The regex has the same value as the last set one");

		oRule.setRegex(regex2);
		assert.strictEqual(oRule.getRegex(), regex2, "The regex has the same value as the last set one");
	});

	QUnit.test("Regex default value", function (assert) {
		assert.equal(this.oMaskInputRule.getRegex(), "[a-zA-Z0-9]", "Default value");
	});

	QUnit.test("Setting an invalid regex is not accepted", function (assert) {
		var oRule = this.oMaskInputRule,
				oErrorSpy = this.spy(Log, 'error'),
				oSetterSpy = this.spy(oRule, 'setProperty');

		setAndValidate.call(this, "");

		function setAndValidate(sRegex) {
			var sExpectedError = "The regex value '" + sRegex + "' is not valid";

			oErrorSpy.restore();
			oErrorSpy = this.spy(Log, 'error');
			oSetterSpy.restore();
			oSetterSpy = this.spy(oRule, 'setProperty');
			oRule.setRegex(sRegex);
			assert.ok(oSetterSpy.notCalled, "Invalid regex [" + sRegex + "] is not accepted");
			assert.ok(oErrorSpy.calledOnce, "When called with invalid parameter [" + sRegex + "] setRegex logs error.");
			assert.equal(oErrorSpy.getCall(0).args[0], sExpectedError,
					"Verify the exact error when setRegex is called with invalid parameter [" + sRegex + "]");
		}
	});
});