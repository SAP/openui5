/*global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/thirdparty/jquery",
	"sap/base/Log",
	"sap/m/MaskInput",
	"sap/m/MaskInputRule",
	"sap/m/Input",
	"sap/m/InputBase",
	"sap/m/Button",
	"sap/ui/Device",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/utils/nextUIUpdate",
	// provides jQuery.fn.cursorPos
	"sap/ui/dom/jquery/cursorPos"
], function(
	Localization,
	qutils,
	createAndAppendDiv,
	jQuery,
	Log,
	MaskInput,
	MaskInputRule,
	Input,
	InputBase,
	Button,
	Device,
	coreLibrary,
	KeyCodes,
	nextUIUpdate
) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	createAndAppendDiv("content");



	//the SUT won't be destroyed when single test is run
	var bSkipDestroy = new URLSearchParams(window.location.search).has("testId");
	QUnit.module("API", {
		beforeEach: async function () {
			this.oMaskInput = new MaskInput();
			this.oMaskInput.placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			if (!bSkipDestroy) {
				this.oMaskInput.destroy();
				await nextUIUpdate(this.clock);
			}
		}
	});

	QUnit.test("Mask setter", function (assert){
		var oControl = this.oMaskInput.setPlaceholderSymbol('#'),
			sMask1 = '1a9a-aa4', /* 1 and 4 are immutable characters*/
			sMask2 = 'aa9a-aa4';
		oControl.setMask(sMask1);
		assert.strictEqual(oControl.getMask(), sMask1, "The mask has the same value as the last set one");

		oControl.setMask(sMask2);
		assert.strictEqual(oControl.getMask(), sMask2, "The mask has the same value as the last set one");
	});

	QUnit.test("Setting empty mask should give a warning", function (assert){
		var oControl = this.oMaskInput;
		var oWarningSpy = this.spy(Log, 'warning'),
			oSetterSpy = this.spy(oControl, "setProperty");

		this.oMaskInput.setMask('');
		assert.ok(oSetterSpy.notCalled, "Invalid placeholder symbol is not accepted");
		assert.equal(oWarningSpy.calledOnce, true, "Log warning method called");
		assert.equal(oWarningSpy.getCall(0).args[0],
				"Setting an empty mask is pointless. Make sure you set it with a non-empty value.",
				"Verify the exact warning");
	});


	QUnit.test("Setting (invalid) placeholder symbol that is part of mask's regex", function (assert){
		var oControl = this.oMaskInput,
			sPlaceholderSymbol = '+',
			oDefinition = new MaskInputRule({
				maskFormatSymbol: '*',
				regex: '[a-z+]'
			});

		var oErrorSpy = this.spy(Log, 'error');
		oControl.addRule(oDefinition);
		var sOriginalPlaceholderSymbol = oControl.getPlaceholderSymbol();
		oControl.setPlaceholderSymbol(sPlaceholderSymbol);

		assert.equal(oErrorSpy.calledOnce, true, "Error log called");
		assert.equal(oErrorSpy.getCall(0).args[0],
				"Rejecting placeholder symbol because it is included as a regex in an existing mask input rule.",
				"Verify the exact error");
		assert.equal(oControl.getPlaceholderSymbol(), sOriginalPlaceholderSymbol, "The placeholder symbol must not be changed");
	});

	QUnit.test("Setting (invalid) regex that contains the placeholder symbol", function (assert){
		var oControl = this.oMaskInput,
			sPlaceholderSymbol = '+',
			oDefinition = new MaskInputRule({
				maskFormatSymbol: '*',
				regex: '[a-z+]'
			});

		var oErrorSpy = this.spy(Log, 'error');
		oControl.setPlaceholderSymbol(sPlaceholderSymbol);
		oControl.addRule(oDefinition);

		assert.equal(oErrorSpy.calledOnce, true, "Error log called");
		assert.equal(oErrorSpy.getCall(0).args[0],
				"Rejecting input mask rule because it includes the currently set placeholder symbol.",
				"Verify the exact error");
	});

	QUnit.test("setValue", async function (assert){
		//Prepare
		var oControl = this.oMaskInput.setPlaceholderSymbol('_').setMask('aa-aa');
		//Act
		oControl.setValue(null);
		//Assert
		assert.strictEqual(oControl.getValue(), "", "'getValue' is updated and returns correct VALIDATED value");
		assert.ok(!oControl._oTempValue.differsFromOriginal(), "When setting 'null' buffer is not modified");

		//Act
		oControl.setValue(undefined);
		//Assert
		assert.strictEqual(oControl.getValue(), "", "'getValue' is updated and returns correct VALIDATED value");
		assert.ok(!oControl._oTempValue.differsFromOriginal(), "When setting 'undefined' buffer is not modified");

		//Act
		oControl.setValue("");
		//Assert
		assert.strictEqual(oControl.getValue(), "", "'getValue' is updated and returns correct VALIDATED value");
		assert.ok(!oControl._oTempValue.differsFromOriginal(), "When setting empty string buffer is not modified");

		//Act
		oControl.setValue("bc-d9");
		//Assert
		assert.strictEqual(oControl.getValue(), "bc-d9", "When setValue is called with mask incompatible string, the value it is not modified.");
		assert.strictEqual(getMaskInputDomValue(oControl), "bc-d9", "The value was updated successfully (EVEN NOT VALID)");
		assert.ok(oControl._oTempValue.differsFromOriginal() && oControl._oTempValue._aContent.join('') == "bc-d_", "Buffer is successfully modified with the correct ALREADY VALIDATED value");

		//Act
		oControl.setValue("bc-de");
		//Assert
		assert.strictEqual(oControl.getValue(), "bc-de", "When setValue is called with mask compatible string, the value is not modified.");
		assert.strictEqual(getMaskInputDomValue(oControl), "bc-de", "The value was updated successfully");
		assert.ok(oControl._oTempValue.differsFromOriginal() && oControl._oTempValue._aContent.join('') == "bc-de", "Buffer is successfully modified");

		//Prepare
		oControl.setMask("ISBN99-99");
		var oOtherControl = new Input({value: "some other value"});
		oOtherControl.placeAt("content");
		await nextUIUpdate(this.clock);

		//Act
		oControl.focus();
		this.clock.tick(1000);
		qutils.triggerKeypress(oControl.getDomRef(), "1");
		qutils.triggerKeypress(oControl.getDomRef(), "2");
		qutils.triggerKeypress(oControl.getDomRef(), "3");
		this.clock.tick(1000);

		oOtherControl.focus();
		this.clock.tick(1000);

		oControl.setValue("");
		oControl.focus();
		this.clock.tick(1000);
		qutils.triggerKeypress(oControl.getDomRef(), "4");
		//Assert
		assert.equal(getMaskInputDomValue(oControl), "ISBN4_-__", "After setValue('') and retyping in the mask, previous value should not retain in DOM");

		//Act
		oOtherControl.focus();
		this.clock.tick(1000);
		//Assert
		assert.equal(oControl.getValue(), "ISBN4_-__",  "After setValue('') and retyping in the mask, previous value should not retain as 'value' property.");
		//Cleanup
		oOtherControl.destroy();
	});

	QUnit.test("Placeholder symbol default value", function (assert){
		var oControl = this.oMaskInput;
		assert.equal(oControl.getPlaceholderSymbol(), "_", "the placeholder symbol default value should be '_'");
	});

	QUnit.test("Placeholder symbol setter", function (assert){
		var oControl = this.oMaskInput,
			sPlaceHolderSymbol1 = '#',
			sPlaceHolderSymbol2 = '+';

		oControl.setPlaceholderSymbol(sPlaceHolderSymbol1);
		assert.strictEqual(oControl.getPlaceholderSymbol(), sPlaceHolderSymbol1, "The placeholder symbol has the same value as the last set one");

		oControl.setPlaceholderSymbol(sPlaceHolderSymbol2);
		assert.strictEqual(oControl.getPlaceholderSymbol(), sPlaceHolderSymbol2, "The placeholder symbol has the same value as the last set one");
	});

	QUnit.test("Setting an invalid placeholder symbol is not accepted", function (assert){
		var oControl = this.oMaskInput,
			oErrorSpy = this.spy(Log, 'error'),
			oSetterSpy = this.spy(oControl, 'setProperty');

		setAndValidate("more_than_one_character", this);
		setAndValidate("", this);

		function setAndValidate(sSymbol, oSandbox) {
			oErrorSpy.restore();
			oErrorSpy = oSandbox.spy(Log, 'error');
			oSetterSpy.restore();
			oSetterSpy = oSandbox.spy(oControl, 'setProperty');
			oControl.setPlaceholderSymbol(sSymbol);
			assert.ok(oSetterSpy.notCalled, "Invalid placeholder symbol [" + sSymbol + "] is not accepted");
			assert.ok(oErrorSpy.calledOnce, "When called with invalid parameter [" + sSymbol + "] setPlaceholderSymbol logs error.");
			assert.equal(oErrorSpy.getCall(0).args[0], "Invalid placeholder symbol string given",
					"Verify the exact error when setPlaceholderSymbol is called with invalid parameter [" + sSymbol + "]");
		}
	});


	QUnit.test("The mask default rules are: a:[A-Za-z] and 9:[0-9]", function (assert){
		var oControl = this.oMaskInput,
			aExpectedDefaultRules = [
				new MaskInputRule({
					maskFormatSymbol: "a",
					regex: "[A-Za-z]"
				}), new MaskInputRule({
					maskFormatSymbol: "9",
					regex: "[0-9]"
				})],
			i = 0;
		assert.equal(oControl.getRules().length, aExpectedDefaultRules.length, "2 default rules");
		for (i = 0; i < 2; i++) {
			assert.equal(oControl.getRules()[i].getMaskFormatSymbol(), aExpectedDefaultRules[i].getMaskFormatSymbol(), "Mask symbol for rule [" + (i + 1) + "]");
			assert.equal(oControl.getRules()[i].getRegex(), aExpectedDefaultRules[i].getRegex(), "Mask regex for rule [" + (i + 1) + "]");
		}
	});

	QUnit.test("Replace existing mask rule", function (assert){
		var oControl = this.oMaskInput.addRule(new MaskInputRule({
			maskFormatSymbol: "~",
			regex: '[@?]'
		}));
		oControl.addRule(new MaskInputRule({
			maskFormatSymbol: "~",
			regex: '[()]'
		}));
		assert.equal(oControl.getRules()[2].getMaskFormatSymbol(), "~", "There must be a rule with mask format symbol '~'");
		assert.equal(oControl.getRules()[2].getRegex(), "[()]", "The rule with mask format symbol '~' regex must be the last one set");
	});

	QUnit.test("Single escaped character", function (assert){
		var oControl = this.oMaskInput.setMask("999^9");

		oControl.focus();
		assert.strictEqual(getMaskInputDomValue(oControl), "___9", "Result value should have 1 escaped rule character as " +
				"immutable on their predefined place");
	});

	QUnit.test("Multiple escape characters in value", function (assert){
		var oControl = this.oMaskInput.setMask("^99aaa^aaa^a");

		oControl.focus();
		assert.strictEqual(getMaskInputDomValue(oControl), "9____a__a", "Result value should have 3 escaped rule characters as " +
				"immutable on their predefined place");
	});

	QUnit.test("Escape the escape character", function (assert){
		var oControl = this.oMaskInput.setMask("99^^99");

		oControl.focus();
		assert.strictEqual(getMaskInputDomValue(oControl), "__^__", "Result value should have 1 immutable character which is the" +
				"escape character");
	});

	QUnit.module("Helper functionality", {
		beforeEach: function () {
			this.oMaskInput = new MaskInput();
		},
		afterEach: function () {
			if (!bSkipDestroy) {
				this.oMaskInput.destroy();
			}
		}
	});

	QUnit.test("_getSkipIndexes", function (assert){
		var that = this;

		// Returns result of _getSkipIndexes as string - helper method to make the asserts more readable
		var getSkipIndexes = function (sValue) {
			return that.oMaskInput._getSkipIndexes(sValue).toString();
		};

		assert.strictEqual(this.oMaskInput._getSkipIndexes().length, 0, "Calling the method with no arguments should return " +
				"empty array");
		assert.strictEqual(getSkipIndexes("99^9"), "2", "One escape character should be at position 2");
		assert.strictEqual(getSkipIndexes("^99^9^"), "0,2,3", "Multiple escape characters. Consider here we are taking " +
				"care for fixing the position of every consecutive escape character after the first one");
		assert.strictEqual(getSkipIndexes("^99^^9^"), "0,2,4", "Escape the escape character");
		assert.strictEqual(getSkipIndexes("^^^^^^"), "0,1,2", "Six escape character should produce " +
				"3 skipped indexes (escape characters) and 3 escape characters as immutable as they are escaped");

	});

	QUnit.test("_getMaskArray", function (assert){
		var that = this;

		// Returns result of _getMaskArray as string - helper method to make the asserts more readable
		var getMaskArray = function (sMask, aSkipIndexes) {
			return that.oMaskInput._getMaskArray(sMask, aSkipIndexes).toString();
		};

		assert.strictEqual(this.oMaskInput._getMaskArray().length, 0, "Calling the method with no arguments should return " +
				"empty array");
		assert.strictEqual(getMaskArray("99^9", [2]), "9,9,9", "One skip index");
		assert.strictEqual(getMaskArray("^99^9^", [0, 2, 3]), "9,9,9", "Multiple skip indexes");
		assert.strictEqual(getMaskArray("^99^^9^", [0, 2, 4]), "9,9,^,9", "Escape the escape character");
		assert.strictEqual(getMaskArray("^^^^^^", [0, 1, 2]), "^,^,^", "Multiple escape the escape character. Should return " +
				"array of three escaped characters as immutable ones");

	});

	QUnit.module("Deletion", {
		beforeEach: async function () {
			this.oMaskInput = new MaskInput();
			this.oMaskInput.placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			if (!bSkipDestroy) {
				this.oMaskInput.destroy();
				await nextUIUpdate(this.clock);
			}
		},
		//sets certain properties, and deletes certain character
		setAndDel: function (sKey, sMask, sValue, iCarretPosition, iCarretEndPosition, oControl ) {
			if (!oControl) {
				oControl = this.oMaskInput;
			}
			oControl.setMask(sMask);
			oControl.setValue(sValue);

			if (oControl._bFocused) {
				oControl.onfocusin(); // an element can get focus only once, so this time only call the handler
			} else {
				oControl.focus();
				this.clock.tick(1000);
				oControl._bFocused = true;
			}

			if (iCarretEndPosition && iCarretEndPosition > iCarretPosition) {
				oControl.selectText(iCarretPosition, iCarretEndPosition);
			} else {
				setCursorPosition(iCarretPosition, oControl);
			}

			return this.justDel(sKey, oControl);
		},
		justDel: function (sKey, oControl) {
			qutils.triggerKeydown(oControl.getDomRef(), KeyCodes[sKey.toUpperCase()]);
			return getMaskInputDomValue(oControl);
		}

	});

	QUnit.test("Del button", function (assert){
		this.oMaskInput.setPlaceholderSymbol('_');
		assert.strictEqual(this.setAndDel('delete', 'aaaaa', 'abcde', 0), "_bcde", "Delete single character");
		assert.strictEqual(this.setAndDel('delete', 'aaaaa', 'abcd', 4), "abcd_", "Try deleting non existing character");
		assert.strictEqual(this.setAndDel('delete', '9a-9-aa', '2b-2-de', 1), '2_-2-de', "Delete parameter before immutable character");
		assert.strictEqual(this.setAndDel('delete', 'aaaaa', 'abcde', 0, 3), "___de", "Delete selection");
	});

	QUnit.test("Del BUTTON deletes more than one character", function(assert) {
		// Prepare
		this.oMaskInput.setPlaceholderSymbol('_');

		// Assert
		assert.strictEqual(this.setAndDel('delete', 'aaaaa', 'abcde', 0), "_bcde", "Delete first character");
		assert.strictEqual(this.justDel('delete', this.oMaskInput), "__cde", "Delete second character");
		assert.strictEqual(this.justDel('delete', this.oMaskInput), "___de", "Delete third character");
		assert.strictEqual(this.justDel('delete', this.oMaskInput), "____e", "Delete fourth character");
		assert.strictEqual(this.justDel('delete', this.oMaskInput), "_____", "Delete fifth character");
		assert.strictEqual(this.justDel('delete', this.oMaskInput), "_____", "Nothing to delete, no change");
	});

	QUnit.test("Backspace button", function (assert){
		this.oMaskInput.setPlaceholderSymbol('_');
		assert.strictEqual(this.setAndDel('backspace', '99/9', '12/3', 2), "1_/3", "Delete single character");
		assert.strictEqual(this.setAndDel('backspace', '99/9', '12/3', 3), "1_/3", "Delete single character behind immutable character");
		assert.strictEqual(this.setAndDel('backspace', '99/9', '12/3', 2, 4), "12/_", "Delete selection with immutable characters");
	});

	QUnit.module("Paste", {
		beforeEach: async function () {
			this.oMaskSerialNumber = new MaskInput({
				mask: "ZXYI-9999-9999-9999",
				placeholderSymbol: "_",
				placeholder: "Enter serial number"
			});
			this.oMaskPhoneNumber = new MaskInput({
				mask: "(02)-***-***",
				placeholderSymbol: "#",
				placeholder: "Enter telephone number",
				rules: [
					new MaskInputRule({
						maskFormatSymbol: "*",
						regex: "[0-9]"
					})
				]
			});

			this.oMaskSerialNumber.placeAt("content");
			this.oMaskPhoneNumber.placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			if (!bSkipDestroy) {
				this.oMaskSerialNumber.destroy();
				this.oMaskPhoneNumber.destroy();
				await nextUIUpdate(this.clock);
			}
		}
	});

	QUnit.test("All clipboard characters that match the mask are pasted into the input", function (assert){
		//since there is no way to really do a paste, set the value and focus the mask input,
		// so the corresponding mask is applied to the value
		this.oMaskSerialNumber.setValue("31 / 12 / 1981");
		this.oMaskSerialNumber.focus();
		this.clock.tick(1000);
		assert.equal(getMaskInputDomValue(this.oMaskSerialNumber), "ZXYI-3112-1981-____", "'31 / 12 / 1981' inside serial" +
		" number 'ZXYI-9999-9999-9999'");

		this.oMaskPhoneNumber.setValue("31 / 12 / 1981");
		this.oMaskPhoneNumber.focus();
		this.clock.tick(1000);
		assert.equal(getMaskInputDomValue(this.oMaskPhoneNumber), "(02)-311-219", "'31 / 12 / 1981' inside phone number" +
		" '(02)-***-***'");
	});

	QUnit.module("Focusing", {
		beforeEach: async function () {
			this.oMaskInput = new MaskInput();
			this.oMaskInput.placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			if (!bSkipDestroy) {
				this.oMaskInput.destroy();
				await nextUIUpdate(this.clock);
			}
		}
	});
	QUnit.test("Initial focusing on mask input", function (assert){
		var oControl = this.oMaskInput.setPlaceholderSymbol('#'),
			sMask = '1a9a-aa4';

		oControl.setMask(sMask);
		oControl.focus();
		this.clock.tick(1000);

		assert.strictEqual(getMaskInputDomValue(oControl), '1###-##4', "On intial focus, the mask that the user needs to follow is shown");
		checkForEmptyValue(oControl);
	});

	QUnit.test("Initial focusing of MaskInput - caret positioning", async function (assert){
		//arrange
		this.oMaskInput.setPlaceholderSymbol("_").setMask("9999-9999-99");
		await nextUIUpdate();
		this.oMaskInput.focus();
		this.clock.tick(1000);

		//assert
		checkCursorIsAtPosition(this.oMaskInput, 0, "On initial focus the caret is on the first placeholder symbol");
	});

	QUnit.test("Focus of MaskInput when it has incomplete value - caret positioning", async function (assert){
		//arrange
		this.oMaskInput.setPlaceholderSymbol("_").setMask("9999-9999-99");
		await nextUIUpdate();
		this.oMaskInput.focus();
		this.clock.tick(1000);
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "1");
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "2");
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "3");
		this.clock.tick(3000);
		this.oMaskInput.focus();
		this.clock.tick(1000);

		//assert
		assert.strictEqual(this.oMaskInput._getInputValue(), "123_-____-__", "The correct value is set through the keypress events");
		checkCursorIsAtPosition(this.oMaskInput, 3, "When partially value is present and we focus again the caret is on the first placeholder position");
	});

	QUnit.test("Focus of MaskInput when it has complete value - caret positioning", async function (assert){
		//arrange
		this.oMaskInput.setPlaceholderSymbol("_").setMask("9999-9999-99");
		await nextUIUpdate();
		this.oMaskInput.focus();
		this.clock.tick(1000);
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "1");
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "2");
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "3");
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "4");
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "5");
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "6");
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "7");
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "8");
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "9");
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "0");
		this.clock.tick(5000);
		jQuery(this.oMaskInput).trigger("focusout");
		this.clock.tick(1000);
		jQuery(this.oMaskInput).trigger("focusin");
		this.clock.tick(1000);

		//assert
		assert.strictEqual(this.oMaskInput._getInputValue(), "1234-5678-90", "The correct value is set through the keypress events");
		checkSelection(this.oMaskInput, 0, this.oMaskInput.getMask().length, "When complete value is present (no placeholders are left) and we focus the input all the input is selected");
	});

	QUnit.test("Focusout for input with deleted value restores an empty value", async function (assert){
		var oControl = this.oMaskInput.setPlaceholder("Enter number").setPlaceholderSymbol("#").setMask("999").setValue("123"),
			oOtherControl = new Input({value: "some other value"});
		oOtherControl.placeAt("content");
		await nextUIUpdate(this.clock);
		this.clock.tick(1000);

		oControl.focus();
		this.clock.tick(1000);
		qutils.triggerKeydown(oControl.getDomRef(), KeyCodes.DELETE);
		this.clock.tick(1000);

		oOtherControl.focus();
		this.clock.tick(1000);
		checkForEmptyValue(oControl);
		assert.strictEqual(getMaskInputDomValue(oControl), "", "Once deleted the DOM should be empty");
		oOtherControl.destroy();
	});

	QUnit.test("Focusout after partially filled value is set through the API validates it against MaskInput rules", async function (assert){
		var oControl = this.oMaskInput.setPlaceholderSymbol('#').setMask('99-99'),
			oOtherControl = new Input({value: "some other value"});

		oOtherControl.placeAt('content');
		await nextUIUpdate(this.clock);
		this.clock.tick(1000);

		oControl.setValue('#1-23');
		oControl.focus();
		assert.strictEqual(getMaskInputDomValue(oControl), "#1-23", "The value was not validated on focusin");
		assert.ok(oControl._oTempValue.differsFromOriginal() && oControl._oTempValue._aContent.join('') == "12-3#", "Buffer is successfully modified with the correct ALREADY VALIDATED value");


		oOtherControl.focus();
		this.clock.tick(1000);

		assert.strictEqual(getMaskInputDomValue(oControl), '12-3#', "DOM value is validated against MaskInput rules on focusout");
		assert.strictEqual(oControl._oTempValue._aContent.join(''), '12-3#', "The buffer value is identical with the DOM value");

		oOtherControl.destroy();
	});

	QUnit.test("Focus after invalid value is set through the API", function (assert){
		var oControl = this.oMaskInput.setPlaceholderSymbol('#'),
			sMask = 'aa-aa';

		oControl.setMask(sMask);

		// test setting a an invalid value
		oControl.setValue(12456);
		oControl.focus();
		this.clock.tick(1000);

		assert.strictEqual(getMaskInputDomValue(oControl), '##-##', "On intial focus, the mask that the user needs to follow is shown");
	});

	QUnit.test("Focus after partially filled value is set through the API", function (assert){
		var oControl = this.oMaskInput.setPlaceholderSymbol('#'),
			sMask = 'aa-aa';

		oControl.setMask(sMask);
		// test setting a an invalid value
		oControl.setValue('#a-bc');
		oControl.focus();
		this.clock.tick(1000);

		assert.strictEqual(getMaskInputDomValue(oControl), '#a-bc');
	});

	QUnit.module("Events", {
		beforeEach: async function () {
			this.oMaskInput = new MaskInput();
			this.oMaskInput.setMask("999");
			this.oMaskInput.placeAt("content");

			this.oOtherControl = new Button({text: "my button"});
			this.oOtherControl.placeAt("content");

			await nextUIUpdate(this.clock);
			this.oChangeListenerPassedEvent = null;
			this.spyChangeEvent = this.spy(this.changeListener.bind(this));
			this.oMaskInput.attachEvent("change", this.spyChangeEvent);

		},
		afterEach: async function () {
			if (!bSkipDestroy) {
				this.oMaskInput.destroy();
				this.oOtherControl.destroy();
				await nextUIUpdate(this.clock);
			}
		},
		changeListener: function () {
			this.oChangeListenerPassedEvent = jQuery.extend({}, arguments[0]);
		}
	});

	QUnit.test("Change event is called", function (assert){
		var oControl = this.oMaskInput;
		oControl.focus();
		this.clock.tick(1000);
		qutils.triggerKeypress(oControl.getDomRef(), "1");

		this.oOtherControl.focus();
		this.clock.tick(1000);

		assert.ok(this.spyChangeEvent.called, "Change event must be fired");
		assert.equal(this.oChangeListenerPassedEvent.mParameters.value, "1__", "Change event must have an exact value");
	});

	QUnit.test("Change event must not be called unless ENTER or focusout", function (assert){
		var oControl = this.oMaskInput;
		oControl.focus();
		this.clock.tick(1000);

		qutils.triggerKeypress(oControl.getDomRef(), "1");
		assert.ok(getMaskInputDomValue(oControl), "The '1' should go into the input");
		assert.ok(!this.spyChangeEvent.called, "Change event must not be called");
		qutils.triggerKeypress(oControl.getDomRef(), "8");
		assert.ok(getMaskInputDomValue(oControl), "The '18' should go into the input");
		assert.ok(!this.spyChangeEvent.called, "Change event must not be called");

		qutils.triggerKeydown(jQuery(oControl.getFocusDomRef()), KeyCodes.ENTER);

		assert.equal(this.spyChangeEvent.callCount, 1, "Change event must be called exactly once");
	});

	QUnit.test("Change event must not be called if Escape", function (assert){
		var oControl = this.oMaskInput;
		oControl.focus();
		this.clock.tick(1000);

		qutils.triggerKeypress(oControl.getDomRef(), "1");
		assert.ok(getMaskInputDomValue(oControl), "The '1' should go into the input");
		qutils.triggerKeydown(oControl.getDomRef(), KeyCodes.ESCAPE);
		assert.ok(!this.spyChangeEvent.called, "Change event must not be called");
	});

	QUnit.test("Change event must be called if the existing input value is entirely deleted", function(assert){
		var oControl = this.oMaskInput.setPlaceholder("Enter number").setPlaceholderSymbol("#").setMask("999").setValue("123");

		oControl.focus();
		this.clock.tick(1000);
		qutils.triggerKeydown(oControl.getDomRef(), KeyCodes.DELETE);

		this.oOtherControl.focus();
		this.clock.tick(1000);
		assert.ok(this.spyChangeEvent.called, "Change event must be called");
		assert.equal(this.oChangeListenerPassedEvent.mParameters.value, "", "Change event must have an exact value");
	});

	QUnit.test("Change event must not be called if existing value is not really changed", function(assert){
		var oControl = this.oMaskInput.setPlaceholder("Enter number").setPlaceholderSymbol("#").setMask("999").setValue("123");
		oControl.focus();
		this.clock.tick(1000);

		this.oOtherControl.focus();
		this.clock.tick(1000);
		assert.ok(!this.oChangeListenerPassedEvent, "Change event must not be called");
	});

	QUnit.test("Submit Event", async function(assert) {
		var oMaskInput = new MaskInput(),
			oFireSubmitFn = sinon.spy(oMaskInput, "fireSubmit");

		oMaskInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// Act
		oMaskInput.onfocusin();
		await nextUIUpdate(this.clock);
		qutils.triggerKeydown(oMaskInput.getDomRef("inner"), KeyCodes.ENTER);

		// Assert
		assert.ok(oFireSubmitFn.calledOnce, "Submit event fired");

		// Act
		oMaskInput.setEnabled(false);
		await nextUIUpdate(this.clock);
		qutils.triggerKeydown(oMaskInput.getDomRef("inner"), KeyCodes.ENTER);

		// Assert
		assert.ok(oFireSubmitFn.calledOnce, "Submit event is not fired on disabled MaskInput");

		// Act
		oMaskInput.setEnabled(true);
		oMaskInput.setEditable(false);
		await nextUIUpdate(this.clock);
		qutils.triggerKeydown(oMaskInput.getDomRef("inner"), KeyCodes.ENTER);

		// Assert
		assert.ok(oFireSubmitFn.calledOnce, "Submit event is not fired on non-editable MaskInput");

		// Clean up
		oFireSubmitFn.restore();
		oMaskInput.destroy();
	});


	QUnit.module("RTL support", {
		beforeEach: async function () {
			this.sTestLatinValue = "abcd";
			this.sTestHebrewValue = "אני רוצה";//"I want" in Hebrew
			this.sTestMixedValue = "1234אני רוצה";//"1234I want" in Hebrew
			this.oMaskInputLatin = new MaskInput( {
				textDirection: TextDirection.RTL,
				value: this.sTestLatinValue,
				mask: "aaaa"
			});
			this.oMaskInputLatin.placeAt("content");

			this.oMaskInputHebrew = new MaskInput({
				textDirection: TextDirection.RTL,
				value: this.sTestHebrewValue,
				mask: "~~~s~~~~",
				rules: [
					new MaskInputRule({
						maskFormatSymbol: "~",
						regex: "[\u0591-\u05F4]"
					}),
					new MaskInputRule({
						maskFormatSymbol: "s",
						regex: "[ ]"
					})
				]
			});
			this.oMaskInputHebrew.placeAt("content");

			await nextUIUpdate(this.clock);
		},

		afterEach: async function () {
			if (!bSkipDestroy) {
				this.oMaskInputLatin.destroy();
				this.oMaskInputHebrew.destroy();
				await nextUIUpdate(this.clock);
			}
		},
		testSelectedInputWithArrow: function(oControl, oClock, sArrowName, iExpectedPosition, sMessagePrefix) {
			oControl.focus();
			oClock.tick(1000);
			oControl.selectText(0, oControl.getValue().length);
			qutils.triggerKeydown(oControl.getDomRef(), sArrowName.toLowerCase() === "left" ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT);
			oClock.tick(1000);
			checkCursorIsAtPosition(oControl, iExpectedPosition, sMessagePrefix);

			//consecutive presses should not move the carret
			qutils.triggerKeydown(oControl.getDomRef(), sArrowName.toLowerCase() === "left" ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT);

			checkCursorIsAtPosition(oControl, iExpectedPosition, sMessagePrefix + " Consecutive presses do nothing");
		},
		testCarretAtPositionAndMoveWithArrow: function(oControl, oClock, iStartPosition, sArrowName, iExpectedPosition, sMessagePrefix) {
			oControl.focus();
			oClock.tick(1000);
			setCursorPosition(iStartPosition, oControl);
			qutils.triggerKeydown(oControl.getDomRef(),  sArrowName.toLowerCase() === "left"  ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT);

			checkCursorIsAtPosition(oControl, iExpectedPosition, sMessagePrefix);
		},
		testTypeInEmptyField: function(oControl, oClock, sUserInput, iExpectedPosition, sMessagePrefix) {
			var i = 0;
			oControl.focus();
			oClock.tick(1000);

			for (i = 0; i < sUserInput.length; i++) {
				qutils.triggerKeypress(oControl.getDomRef(), sUserInput[i]);
			}
			checkCursorIsAtPosition(oControl, iExpectedPosition, sMessagePrefix);
		}
	});

	QUnit.test("Left arrow on selected string moves the carret to the most left position", function(assert){
		this.testSelectedInputWithArrow(this.oMaskInputLatin, this.clock, "left", 0, "Latin content");
		this.testSelectedInputWithArrow(this.oMaskInputHebrew, this.clock, "left", this.sTestHebrewValue.length, "Hebrew content");
		//Note: When there is a hebrew content, selectionStarts & selectionEnd are mirrored.
	});

	QUnit.test("Right arrow on selected string moves the carret to the most right position", function(assert){
		this.testSelectedInputWithArrow(this.oMaskInputLatin, this.clock, "right", this.sTestLatinValue.length, "Latin content");
		this.testSelectedInputWithArrow(this.oMaskInputHebrew, this.clock, "right", 0, "Hebrew content");
	});

	QUnit.test("Left arrow when caret is at the middle moves to the left", function(assert){
		var iStartPositionHebrew = Math.floor(this.oMaskInputHebrew.getValue().length / 2),
			iStartPositionLatin = Math.floor(this.oMaskInputLatin.getValue().length / 2);
		this.testCarretAtPositionAndMoveWithArrow(this.oMaskInputHebrew, this.clock, iStartPositionHebrew, "left", iStartPositionHebrew + 1, "Hebrew content");
		this.testCarretAtPositionAndMoveWithArrow(this.oMaskInputLatin, this.clock, iStartPositionLatin, "left", iStartPositionLatin - 1, "Latin content");
		//Note: When there is a hebrew content, selectionStarts & selectionEnd are mirrored.
	});

	QUnit.test("Left arrow when caret is at the rightmost position moves to the left", function(assert){
		var iStartPositionLatin = Math.floor(this.oMaskInputLatin.getValue().length);
		for (var i = iStartPositionLatin; i > 0; i-- ) {
			this.testCarretAtPositionAndMoveWithArrow(this.oMaskInputLatin, this.clock, i, "left", i - 1, "Latin content. Start position: " + i);
		}
	});

	QUnit.test("Navigate the whole field with left arrow when caret is at the middle moves to the left between RTL and LTR characters", function(assert){
		// this test is needed because the native behavior of some browsers is different - we're mimicking IE11
		this.oMaskInputMixed = new MaskInput({
			textDirection: TextDirection.RTL,
			value: this.sTestMixedValue,
			mask: "9999~~~s~~~~",
			rules: [
				new MaskInputRule({
					maskFormatSymbol: "~",
					regex: "[\u0591-\u05F4]"
				}),
				new MaskInputRule({
					maskFormatSymbol: "s",
					regex: "[ ]"
				})
			]
		});
		this.oMaskInputMixed.placeAt("content");
		var iStartPosition = 4;
		this.testCarretAtPositionAndMoveWithArrow(this.oMaskInputMixed, this.clock, iStartPosition, "left", iStartPosition + 1, "Mixed content");
		this.testCarretAtPositionAndMoveWithArrow(this.oMaskInputMixed, this.clock, iStartPosition, "right", iStartPosition - 1, "Mixed content");
		this.oMaskInputMixed.destroy();

		//Note: When there is a hebrew content, selectionStarts & selectionEnd are mirrored.
	});

	QUnit.test("Right arrow when caret is at the middle moves to the right", function(assert){
		var iStartPositionHebrew = Math.floor(this.oMaskInputHebrew.getValue().length / 2),
			iStartPositionLatin = Math.floor(this.oMaskInputLatin.getValue().length / 2);
		this.testCarretAtPositionAndMoveWithArrow(this.oMaskInputHebrew, this.clock, iStartPositionHebrew, "right", iStartPositionHebrew - 1, "Hebrew content");
		this.testCarretAtPositionAndMoveWithArrow(this.oMaskInputLatin, this.clock, iStartPositionLatin, "right", iStartPositionLatin + 1, "Latin content");
		//Note: iStartPosition - 1 is correct, since when content is hebrew, selectionStarts & selectionEnd are mirrored.
	});

	QUnit.test("Navigate the whole field with right arrow when caret is at the leftmost moves to the right", function(assert){
		var iStartPositionLatin = Math.floor(this.oMaskInputLatin.getValue().length);
		for (var i = 0; i < iStartPositionLatin; i++ ) {
			this.testCarretAtPositionAndMoveWithArrow(this.oMaskInputLatin, this.clock, i, "right", i + 1, "Latin content. Start position: " + i);
		}
	});

	QUnit.test("Typing in a empty field (Latin content)", async function(assert){
		this.oMaskInputLatin.destroy();
		this.oMaskInputLatin = new MaskInput( {
			textDirection: TextDirection.RTL,
			mask: "aaaa"
		});
		this.oMaskInputLatin.placeAt("content");
		await nextUIUpdate(this.clock);
		this.clock.tick(1000);
		var sContent = "abc";
		this.testTypeInEmptyField(this.oMaskInputLatin, this.clock, sContent, 3, "Latin content");
		this.oMaskInputHebrew.focus(); //make sure complete handler for latin mask worked-out
		assert.equal(this.oMaskInputLatin.getValue(), sContent + "_", "Latin content check.");
	});

	QUnit.test("Typing in a empty field (Hebrew content)", async function(assert){
		this.oMaskInputHebrew.destroy();
		this.oMaskInputHebrew = new MaskInput({
			textDirection: TextDirection.RTL,
			value: this.sTestHebrewValue,
			mask: "~~~s~~~~",
			rules: [
				new MaskInputRule({
					maskFormatSymbol: "~",
					regex: "[\u0591-\u05F4]"
				}),
				new MaskInputRule({
					maskFormatSymbol: "s",
					regex: "[ ]"
				})
			]
		});
		this.oMaskInputHebrew.placeAt("content");
		await nextUIUpdate(this.clock);
		this.clock.tick(1000);
		var sContent =  "וצה"; /*3 chars*/
		this.testTypeInEmptyField(this.oMaskInputHebrew, this.clock, sContent, 3, "Hebrew content");
		this.oMaskInputLatin.focus(); //make sure complete handler for hebrew mask worked-out
		assert.equal(this.oMaskInputHebrew.getValue(), sContent + "_____", "Hebrew content check.");

	});

	QUnit.module("Others", {
		beforeEach: async function () {
			this.oMaskInput = new MaskInput();
			this.oMaskInput.placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			if (!bSkipDestroy) {
				this.oMaskInput.destroy();
				await nextUIUpdate(this.clock);
			}
		},
		sendAndValidate: function (iPos, sChar, sExpectedValue, oControl) {
			if (!oControl) {
				oControl = this.oMaskInput;
			}
			if (iPos !== -1) {
				setCursorPosition(iPos, oControl);
			}
			qutils.triggerKeypress(oControl.getDomRef(), sChar);
			QUnit.assert.equal(oControl._getInputValue(), sExpectedValue, "Typing '" + sChar + "' at position [" +
			(iPos === -1 ? "current" : iPos) + "] should resolve to a certain value");
		}
	});

	QUnit.test("DOM and 'value' should be updated according to the user input ", async function (assert) {
		var oControl = this.oMaskInput.setPlaceholderSymbol('_').setMask('aaaa'),
			oOtherControl = new Input({value: "some other value"});
		oOtherControl.placeAt("content");
		await nextUIUpdate(this.clock);
		this.clock.tick(1000);

		assert.strictEqual(getMaskInputDomValue(oControl), "", "Unless focused an empty dom value should remain empty");
		checkForEmptyValue(oControl);
		oControl.focus();
		this.clock.tick(1000);

		assert.strictEqual(getMaskInputDomValue(oControl), '____', "the maskInput has the expected mask string in the dom after focus is reached");
		checkForEmptyValue(oControl);
		oOtherControl.focus();
		this.clock.tick(1000);

		assert.strictEqual(getMaskInputDomValue(oControl), '', "the maskInput lost the focus without any user input characters, so the getValue should return an empty string");
		checkForEmptyValue(oControl);
		oOtherControl.destroy();

	});
	QUnit.test("Entering a rule incompatible characters is forbidden at any position for mask", function (assert){
		var oControl = this.oMaskInput.setMask("9a-9a").setPlaceholderSymbol("#");
		oControl.focus();
		this.clock.tick(1000);
		this.sendAndValidate(0, "b", "##-##");
		this.sendAndValidate(1, "7", "##-##");
		this.sendAndValidate(3, "c", "##-##");
		this.sendAndValidate(4, "6", "##-##");
	});

	QUnit.test("Entering a rule compatible character is possible at any position for mask", function (assert){
		var oControl = this.oMaskInput.setMask("9a-9a").setPlaceholderSymbol("#");
		oControl.focus();
		this.clock.tick(1000);
		this.sendAndValidate(-1, "1", "1#-##");
		this.sendAndValidate(-1, "b", "1b-##");
		this.sendAndValidate(-1, "3", "1b-3#");
		this.sendAndValidate(-1, "c", "1b-3c");
	});

	QUnit.test("Entering an separator will move the caret after it", function (assert){
		var oControl = this.oMaskInput.setMask("9-9").setPlaceholderSymbol("#");
		oControl.focus();
		this.clock.tick(1000);
		this.sendAndValidate(-1, "2", "2-#");
		var oSelection = getCurrentSelection(oControl);

		assert.ok(oSelection.iFrom === oSelection.iTo, "There must not be any selection");
		assert.equal(oSelection.iFrom, 2, "Cursor position.");
	});

	QUnit.test("Escape position the cursor at the first repalcable character", function (assert){
		var oControl = this.oMaskInput.setMask("9-9").setPlaceholderSymbol("#");
		oControl.focus();
		this.clock.tick(1000);
		this.sendAndValidate(-1, "2", "2-#");
		qutils.triggerKeydown(oControl.getDomRef(), KeyCodes.ESCAPE);
		this.clock.tick(1000);

		var oSelection = getCurrentSelection(oControl);
		assert.ok(oSelection.iFrom === oSelection.iTo, "There must not be any selection");
		assert.equal(oSelection.iFrom, 0, "Cursor position.");
	});

	QUnit.test("Click on mask input with an existing value selects the whole value", function (assert){
		var oControl = this.oMaskInput.setMask("a9a9a").setValue("b1c2d");
		oControl.focus();
		this.clock.tick(1000);

		var oSelection = getCurrentSelection(oControl);
		assert.equal(oSelection.iFrom, 0);
		assert.equal(oSelection.iTo, 5);
	});

	QUnit.test("Click on mask input with empty value should position the cursor at the first editable position", function (assert){
		var oControl = this.oMaskInput.setMask("(+35)a9a9a");
		oControl.focus();
		this.clock.tick(1000);

		checkCursorIsAtPosition(oControl, 5);
	});

	QUnit.test("Click on mask input with partially completed value should position the cursor at the first editable position", function (assert){
		var oControl = this.oMaskInput.setMask("(+35)a9a9a");
		oControl.setValue("a1");
		oControl.focus();
		this.clock.tick(1000);

		checkCursorIsAtPosition(oControl, 7);
	});

	QUnit.test("Esc key does reset the value back to the original", function (assert){
		var oControl = this.oMaskInput.setMask("aa-aa").setValue("ab-__");
		oControl.focus();
		this.clock.tick(1000);

		this.sendAndValidate(-1, "c", "ab-c_");
		qutils.triggerKeydown(oControl.getDomRef(), KeyCodes.ESCAPE);
		assert.equal(oControl.getValue(), "ab-__", "The value before focusing-in must be restored");
	});

	QUnit.test("Esc key - 'onsapescape' event is not prevented if the value is as initial", function (assert) {
		// Arrange
		var onsapescapeIBSpy = this.spy(InputBase.prototype, "onsapescape"),
			onsapescapeMISpy = this.spy(this.oMaskInput, "onsapescape");

		this.oMaskInput.setMask("9");

		// Act
		this.oMaskInput.focus();
		this.clock.tick(100);
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "1");

		// Assert
		assert.equal(getMaskInputDomValue(this.oMaskInput), "1", "'1' is set as value of the input");

		// Act
		qutils.triggerKeydown(this.oMaskInput.getDomRef(), KeyCodes.ESCAPE);

		// Assert
		assert.equal(getMaskInputDomValue(this.oMaskInput), "_", "The input is cleared after the first ESC press");
		assert.equal(onsapescapeMISpy.callCount, 1, "onsapescape of the MaskInput is called after the first ESC press");
		assert.equal(onsapescapeIBSpy.callCount, 1, "onsapescape of the InputBase is called after the first ESC press");

		// Act
		qutils.triggerKeydown(this.oMaskInput.getDomRef(), KeyCodes.ESCAPE);

		// Assert
		assert.equal(getMaskInputDomValue(this.oMaskInput), "_", "The input is cleared after the second ESC press");
		assert.equal(onsapescapeMISpy.callCount, 2, "onsapescape of the MaskInput is called after the second ESC press");
		assert.equal(onsapescapeIBSpy.callCount, 1, "onsapescape of the InputBase is not called after the second ESC press");

		// Cleanup
		onsapescapeIBSpy.restore();
		onsapescapeMISpy.restore();
	});

	QUnit.test("OnBeforeRendering captures any validation errors.", function (assert){
		var oControl = this.oMaskInput,
			oDefinition1 = new MaskInputRule({maskFormatSymbol: "-", regex: "[']"}),
			oDefinition2 = new MaskInputRule({maskFormatSymbol: "+", regex: "[()]"}),
			oWarningSpy = this.spy(Log, "warning");
		oControl.addRule(oDefinition1);
		oControl.addRule(oDefinition2);
		oDefinition1.setMaskFormatSymbol("+");

		this.clock.tick(1000);
		assert.ok(oWarningSpy.calledOnce, "Warning issued.");
		assert.equal(oWarningSpy.getCall(0).args[0],
				"Invalid mask input: Empty mask. Duplicated rule's maskFormatSymbol [+]", "Message");
	});

	QUnit.test("Once the user completed the input, the property 'value' is changed", async function (assert){
		var oControl = this.oMaskInput.setPlaceholder("Enter number").setPlaceholderSymbol("#").setMask("999").setValue("123"),
			oOtherControl = new Input({value: "some other value"});
		oOtherControl.placeAt("content");
		await nextUIUpdate(this.clock);
		this.clock.tick(1000);

		oControl.focus();
		this.clock.tick(1000);
		this.sendAndValidate(-1, "1", "1##");
		this.sendAndValidate(-1, "2", "12#");

		oOtherControl.focus();
		this.clock.tick(1000);
		assert.strictEqual(oControl.getValue(), "12#", "On complete the value should change");
		//user goes back and enters input
		oControl.focus();
		this.clock.tick(1000);
		this.sendAndValidate(-1, "3", "123");

		oOtherControl.focus();
		this.clock.tick(1000);
		assert.strictEqual(oControl.getValue(), "123", "On complete the value should change");

		oOtherControl.destroy();
	});

	QUnit.test("Backspace when only one character left should restore the default input value all browsers", function (assert){
		checkForDeleteAndBackspace.call(this);
	});


	QUnit.test("Adding rule with placeholderSymbol that matches existing rule", function(assert){
		//prepare
		var oRule1 = new MaskInputRule({maskFormatSymbol: "_", regex: "aaa"}),
				oRule2 = new MaskInputRule({maskFormatSymbol: "_", regex: "999"}),
				oSpyDestroyOldRule = this.spy(oRule1, "destroy");
		this.oMaskInput.destroyRules();

		//act
		this.oMaskInput.addRule(oRule1);
		this.oMaskInput.addRule(oRule2);

		//assert
		assert.equal(this.oMaskInput.getRules().length, 1, "Adding second rule with the same maskFormatSymbol does not increase the rules aggregation");
		assert.equal(this.oMaskInput.getRules()[0].getId(), oRule2.getId() , "The rules aggregation should contain the last added rule");
		assert.equal(oSpyDestroyOldRule.callCount, 1, "The old rule is destroyed");
	});

	QUnit.test("empty MaskInput does not throw exception when it is focused", function (assert) {
		// Arrange
		var oMaskInput = new MaskInput();

		// Act
		oMaskInput.onfocusin();

		// Assert
		assert.ok(true, "No exception is thrown");
	});

	QUnit.module("Android", {
		beforeEach: async function() {
			this.oMaskInput = new MaskInput();
			this.oMaskInput.placeAt("content");
			await nextUIUpdate(this.clock);

			this.fnIsChromeOnAndroidStub = this.stub(this.oMaskInput, "_isChromeOnAndroid").callsFake(function () {
				return true;
			});
		},
		afterEach: async function() {
			if (!bSkipDestroy) {
				this.oMaskInput.destroy();
				await nextUIUpdate(this.clock);
			}
		}
	});

	QUnit.test("Private: _buildKeyboardEventInfo(old, new, selection) when both strings are empty", function(assert) {
		// Act && Assert
		assert.equal(JSON.stringify(this.oMaskInput._buildKeyboardEventInfo("", "", {})), "{}", "..should return empty object");
	});

	QUnit.test("Private, Android specific:: _buildKeyboardEventInfo(old, new, selection) when second string contains new chars",
		function (assert) {

			// Act && Assert
			assert.equal(JSON.stringify(this.oMaskInput._buildKeyboardEventInfo("SAP-__", "SAP-98", {})), JSON.stringify({sChar: "9"}),
				"..should return info about the pressed key");
		});

	QUnit.test("Private, Android specific: _buildKeyboardEventInfo(old, new, previous selection) when second string is with fewer chars",
		function (assert) {
			// Act && Assert
			assert.equal(JSON.stringify(this.oMaskInput._buildKeyboardEventInfo("SAP-9_", "SAP-_", {})),
				JSON.stringify({bBackspace: true, sChar: "_"}),
				"..should return info about the backspace key and the corresponding pressed key");
		});

	QUnit.test("Private, Android specific: _buildKeyboardEventInfo(old, new, selection) when some part of the old string had been selected",
		function (assert) {
			// Act && Assert
			assert.equal(JSON.stringify(this.oMaskInput._buildKeyboardEventInfo("19:25", "19:3", {
					bHasSelection: true,
					iFrom: 3,
					iTo: 3
				})),
				JSON.stringify({
					bBackspace: true,
					sChar: "3"
				}),
				"..should return info about the backspace key and corresponding pressed key");
		});

	QUnit.test("Private, Android specific: _buildKeyboardEventInfo(old, new, selection) when the whole old string had been selected",
		function (assert) {
			// Act && Assert
			assert.equal(JSON.stringify(this.oMaskInput._buildKeyboardEventInfo("19:25", "1", {
					bHasSelection: true,
					iFrom: 0,
					iTo: 5
				})),
				JSON.stringify({
					bBackspace: true,
					sChar: "1"
				}),
				"..should return info about the backspace key");
		});

	QUnit.test("Private, Android specific: onkeydown, current state is stored", async function(assert) {
		// Prepare
		this.oMaskInput.setMask("99999");
		await nextUIUpdate();

		// Act
		this.oMaskInput.focus();
		setCursorPosition(2, this.oMaskInput);
		qutils.triggerKeydown(this.oMaskInput.getDomRef(), 229); // this is what Chrome for Android sends

		// Assert
		assert.equal(JSON.stringify(this.oMaskInput._oKeyDownStateAndroid),
			JSON.stringify({sValue: "_____", iCursorPosition: 2, oSelection: {iFrom: 2, iTo:2, bHasSelection: false}}),
			"State");
	});

	QUnit.test("Private, Android specific: When input event fires _onInputForAndroidHandler is called", async function(assert) {
		// Prepare
		var	fnOnInputForAndroidHandlerStub = this.spy(this.oMaskInput, "_onInputForAndroidHandler");

		this.oMaskInput.setMask("99999");
		await nextUIUpdate();

		// Act
		this.oMaskInput.oninput(new jQuery.Event());

		//Assert
		assert.equal(fnOnInputForAndroidHandlerStub.callCount, 1, "call check");

		// Cleanup
		fnOnInputForAndroidHandlerStub.restore();
	});

	QUnit.test("Private, Android specific: _onInputForAndroidHandler when a char is added",
		async function (assert) {
			// Prepare
			var done = assert.async(),
				oOnInputEvent = new jQuery.Event(),
				fnSpyPreventDefaultSpy = this.spy(oOnInputEvent, "preventDefault"),
				fnKeyPressHandlerStub = this.stub(this.oMaskInput, "_keyPressHandler").callsFake(function() {}),
				oBuildKeyboardEventInfoResponse = {"sChar": "9"},
				fnBuildKeyboardEventInfoStub = this.stub(this.oMaskInput, "_buildKeyboardEventInfo").callsFake(function() { return oBuildKeyboardEventInfoResponse;});

			this.oMaskInput.setMask("99999");
			await nextUIUpdate();
			this.oMaskInput._oKeyDownStateAndroid = {};

			// Act
			this.oMaskInput._onInputForAndroidHandler(oOnInputEvent);

			//Assert
			assert.equal(this.oMaskInput._oKeyDownStateAndroid, undefined, "..should delete previous keydown state for Android");
			assert.equal(fnSpyPreventDefaultSpy.callCount, 1, "..on input event should be prevented");

			setTimeout(function() {
				assert.equal(fnKeyPressHandlerStub.callCount, 1, "..should call keypress handler");
				assert.deepEqual(fnKeyPressHandlerStub.getCall(0).args, [oOnInputEvent, oBuildKeyboardEventInfoResponse],
					"..should call keypress handler with certain parameters");

				// Cleanup
				fnSpyPreventDefaultSpy.restore();
				fnKeyPressHandlerStub.restore();
				fnBuildKeyboardEventInfoStub.restore();
				done();
			}, 0);
			this.clock.tick(100); // _onInputForAndroidHandler has timeout, the test as well.
	});

	QUnit.test("Private, Android specific: _onInputForAndroidHandler when a char is deleted",
		async function (assert) {
			// Prepare
			var done = assert.async(),
				oOnInputEvent = new jQuery.Event(),
				fnSpyPreventDefaultSpy = this.spy(oOnInputEvent, "preventDefault"),
				fnRevertKeyStub = this.stub(this.oMaskInput, "_revertKey").callsFake(function() {}),
				oBuildKeyboardEventInfoResponse = {"bBackspace": true},
				fnBuildKeyboardEventInfoStub = this.stub(this.oMaskInput, "_buildKeyboardEventInfo").callsFake(function() { return oBuildKeyboardEventInfoResponse;});

			this.oMaskInput.setMask("99999");
			await nextUIUpdate();
			this.oMaskInput._oKeyDownStateAndroid = {oSelection: {}};

			// Act
			this.oMaskInput._onInputForAndroidHandler(oOnInputEvent);

			//Assert
			assert.equal(this.oMaskInput._oKeyDownStateAndroid, undefined, "..should delete previous keydown state for Android");
			assert.equal(fnSpyPreventDefaultSpy.callCount, 1, "..on input event should be prevented");

			setTimeout(function() {
				assert.equal(fnRevertKeyStub.callCount, 1, "..should call _revertKey");
				assert.deepEqual(fnRevertKeyStub.getCall(0).args, [oBuildKeyboardEventInfoResponse, {}],
					"..should call _revertKey handler with certain parameters");

				// Cleanup
				fnSpyPreventDefaultSpy.restore();
				fnRevertKeyStub.restore();
				fnBuildKeyboardEventInfoStub.restore();
				done();
			}, 0);
			this.clock.tick(100); // _onInputForAndroidHandler has timeout, the test as well.
		});

	QUnit.module("ARIA", {
		beforeEach: async function () {
			this.oMaskInput = new MaskInput({
				mask: "993-99-999",
				placeholderSymbol: "_",
				placeholder: "Enter Text"
			});
			this.oRenderer = this.oMaskInput.getRenderer();
			this.oMaskInput.placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			if (!bSkipDestroy) {
				this.oMaskInput.destroy();
				await nextUIUpdate(this.clock);
			}
		}
	});

	QUnit.test("Testing aria label", function (assert){
		var $AriaLabel = this.oMaskInput.$().find("#" + this.oMaskInput.getId() + "-labelledby");
		//assert
		assert.ok($AriaLabel.length > 0, "The hidden aria description is present in the DOM");
		assert.strictEqual(this.oRenderer.getLabelledByAnnouncement(this.oMaskInput), $AriaLabel.text(), "The message is rendered correctly");
	});

	QUnit.test("Testing aria roledescription", function (assert){
		var sCustomRole = this.oRenderer.getAccessibilityState(this.oMaskInput)["roledescription"];

		assert.strictEqual(sCustomRole, "Masked Edit", "Proper aria-roledescription is added");
	});

	QUnit.module("Clear Icon", {
		beforeEach: async function () {
			this.oMaskInput = new MaskInput({
				mask: "9",
				placeholderSymbol: "_",
				showClearIcon: true
			});
			this.oMaskInput.placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			if (!bSkipDestroy) {
				this.oMaskInput.destroy();
				await nextUIUpdate(this.clock);
			}
		}
	});

	QUnit.test("The icon appears/disappears correctly on direct typing", function (assert){
		var oClearIcon = this.oMaskInput._getClearIcon();

		// Act
		this.oMaskInput.focus();
		this.clock.tick(100);

		// Assert
		assert.notOk(oClearIcon.getVisible(), "Clear Icon is not visible when the value of the input is empty");

		// Act
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "1");

		// Assert
		assert.equal(getMaskInputDomValue(this.oMaskInput), "1", "'1' is set as value of the input");
		assert.ok(oClearIcon.getVisible(), "Clear Icon is visible when the value of the input is not empty");

		// Act
		qutils.triggerKeydown(this.oMaskInput.getDomRef(), KeyCodes.BACKSPACE);

		// Assert
		assert.equal(getMaskInputDomValue(this.oMaskInput), "_", "The input is cleared after the BACKSPACE press");
		assert.notOk(oClearIcon.getVisible(), "Clear Icon is not visible when the value of the input is empty");

	});

	QUnit.test("Appearance is not changed when ENTER is pressed", function (assert){
		var oClearIcon = this.oMaskInput._getClearIcon();

		// Act
		this.oMaskInput.focus();
		this.clock.tick(100);

		// Assert
		assert.notOk(oClearIcon.getVisible(), "Clear Icon is not visible when the value of the input is empty");

		// Act
		qutils.triggerKeydown(this.oMaskInput.getDomRef(), KeyCodes.ENTER);

		// Assert
		assert.notOk(oClearIcon.getVisible(), "Clear Icon is still not visible after ENTER press");

		// Act
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "1");

		// Assert
		assert.equal(getMaskInputDomValue(this.oMaskInput), "1", "'1' is set as value of the input");
		assert.ok(oClearIcon.getVisible(), "Clear Icon is visible when the value of the input is not empty");

		// Act
		qutils.triggerKeydown(this.oMaskInput.getDomRef(), KeyCodes.ENTER);

		// Assert
		assert.ok(oClearIcon.getVisible(), "Clear Icon is still visible after ENTER press");
	});

	QUnit.test("Appearance is not changed when focus in/focus out", function (assert){
		var oClearIcon = this.oMaskInput._getClearIcon(),
			oButton = new Button();

		oButton.placeAt("content");

		// Act
		this.oMaskInput.focus();
		this.clock.tick(100);

		// Assert
		assert.notOk(oClearIcon.getVisible(), "Clear Icon is not visible when the value of the input is empty");

		// Act
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "1");

		// Assert
		assert.equal(getMaskInputDomValue(this.oMaskInput), "1", "'1' is set as value of the input");
		assert.ok(oClearIcon.getVisible(), "Clear Icon is visible when the value of the input is not empty");

		// Act
		oButton.focus();

		// Assert
		assert.ok(oClearIcon.getVisible(), "Clear Icon is visible when focus is lost");

		// Cleanup
		oButton.destroy();
	});

	QUnit.module("liveChange event", {
		beforeEach: async function () {
			this.oMaskInput = new MaskInput({
				mask: "99",
				placeholderSymbol: "_"
			});
			this.oMaskInput.placeAt("content");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function () {
			if (!bSkipDestroy) {
				this.oMaskInput.destroy();
				await nextUIUpdate(this.clock);
			}
		}
	});

	QUnit.test("liveChange fires on direct typing", function (assert){
		var spyLiveChange = this.spy(this.oMaskInput, "_fireLiveChange");

		// Act
		this.oMaskInput.focus();
		this.clock.tick(100);

		// Act
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "1");

		// Assert
		assert.equal(spyLiveChange.callCount, 1, "liveChange fired");

		// Act
		qutils.triggerKeypress(this.oMaskInput.getDomRef(), "2");

		// Assert
		assert.equal(spyLiveChange.callCount, 2, "liveChange fired");

		// Act
		qutils.triggerKeydown(this.oMaskInput.getDomRef(), KeyCodes.BACKSPACE);

		// Assert
		assert.equal(spyLiveChange.callCount, 3, "liveChange fired");

		spyLiveChange = null;
	});


	// Helper functions

	function checkForDeleteAndBackspace() {
		var oRule = new MaskInputRule();
		oRule.setMaskFormatSymbol("h");
		oRule.setRegex("[ 1]");
		var oControl = this.oMaskInput.setMask("h9:99:99 ");
		oControl.addRule(oRule);

		oControl.focus();
		this.clock.tick(1000);
		this.sendAndValidate(0, "1", "1_:__:__ ", oControl);
		qutils.triggerKeydown(oControl.getDomRef(), KeyCodes.BACKSPACE);
		this.clock.tick(1000);
		QUnit.assert.equal(oControl._getInputValue(), "__:__:__ ", "the value after backspace should be empty");

		this.sendAndValidate(0, "1", "1_:__:__ ", oControl);
		setCursorPosition(0, oControl);
		qutils.triggerKeydown(oControl.getDomRef(), KeyCodes.DELETE);
		this.clock.tick(1000);
		QUnit.assert.equal(oControl._getInputValue(), "__:__:__ ", "the value after delete should be empty");

		this.sendAndValidate(0, "1", "1_:__:__ ", oControl);
		this.sendAndValidate(1, "2", "12:__:__ ", oControl);
		oControl.selectText(0, 2);
		this.clock.tick(1000);
		qutils.triggerKeydown(oControl.getDomRef(), KeyCodes.BACKSPACE);
		this.clock.tick(1000);
		QUnit.assert.equal(oControl._getInputValue(), "__:__:__ ", "the value after backspace should be empty");

		this.sendAndValidate(0, "1", "1_:__:__ ", oControl);
		this.sendAndValidate(1, "2", "12:__:__ ", oControl);
		oControl.selectText(0, 2);
		this.clock.tick(1000);
		qutils.triggerKeydown(oControl.getDomRef(), KeyCodes.DELETE);
		this.clock.tick(1000);
		QUnit.assert.equal(oControl._getInputValue(), "__:__:__ ", "the value after delete should be empty");
	}

	function setCursorPosition(iPosition, oControl) {
		var _$oControl = jQuery(oControl.getFocusDomRef());
		if (Device.browser.webkit) {
			return setCursorPositionWebkit(oControl, iPosition);
		}

		return _$oControl.cursorPos(iPosition);
	}
	function getMaskInputDomValue(oControl) {
		return jQuery(oControl.getDomRef("inner")).val();
	}

	function checkForEmptyValue(oControl) {
		QUnit.assert.ok(typeof oControl.getValue() === "undefined" || oControl.getValue() == null || oControl.getValue().length === 0,
				"The value [" + oControl.getValue() + "] should be empty ");
	}

	function setCursorPositionWebkit(oControl, iPosition) {
		var sValue = oControl.getValue(),
			$oControl = jQuery(oControl.getFocusDomRef()),
			iLength = sValue.length,
			bModified = false,
			bOnlyHebrewContent = new RegExp("[\u0591-\u05F4]").test(sValue),
			bRTLMode = Localization.getRTL() || oControl.getTextDirection() === "RTL";


		if (bRTLMode && !bOnlyHebrewContent) {
			if (iPosition === iLength) {
				iPosition = 0;
				bModified = true;
			} else if (iPosition === 0) {
				iPosition = iLength;
				bModified = true;
			}
			if (bModified) {
				Log.warning("Webkit bug for selection API. Modifying cursor position");
			}
		}
		return $oControl.cursorPos(iPosition);
	}

	/**
	 * @param {sap.ui.core.Control} oControl
	 * @returns {{iFrom: number, iTo: number}}
	 */
	function getCurrentSelection (oControl) {
		var $oControl = jQuery(oControl.getFocusDomRef())[0],
			oSelection;

		if (Device.browser.webkit) {
			oSelection = getCursorSelectionWebkit(oControl);
		} else {
			oSelection = {iFrom: $oControl.selectionStart, iTo: $oControl.selectionEnd};
		}
		return oSelection;
	}

	function checkCursorIsAtPosition (oControl, iExpectedPosition, sMessagePrefix) {
		var oSelection = getCurrentSelection(oControl);
		QUnit.assert.equal(oSelection.iFrom, oSelection.iTo, "Prerequisites: there must not be any selection(selectionStart & selectionEnd must be equal)");
		QUnit.assert.equal(oSelection.iFrom, iExpectedPosition, sMessagePrefix + ": Cursor position check");
	}

	function checkSelection(oControl, iExpectedStartPosition, iExpectedEndPosition, sMessagePrefix) {
		var oSelection = getCurrentSelection(oControl);
		QUnit.assert.deepEqual(oSelection, {iFrom: iExpectedStartPosition, iTo: iExpectedEndPosition}, sMessagePrefix + ": selection start check");
	}

	function getCursorSelectionWebkit(oControl) {
		var sValue = oControl.getValue(),
			$oControl = jQuery(oControl.getFocusDomRef())[0],
			iLength = sValue.length,
			oSelection = {iFrom: $oControl.selectionStart, iTo: $oControl.selectionEnd},
			bModified = false,
			bOnlyHebrewContent = new RegExp("[\u0591-\u05F4]").test(sValue),
			bRTLMode = Localization.getRTL() || oControl.getTextDirection() === "RTL";

		if (!bRTLMode || bOnlyHebrewContent) {
			return oSelection;
		}
		if (oSelection.iFrom === oSelection.iTo && oSelection.iFrom === iLength) {
			oSelection.iFrom = 0;
			oSelection.iTo = 0;
			bModified = true;
		} else if (oSelection.iFrom === 0) {
			oSelection.iFrom = iLength;
			oSelection.iTo = iLength;
			bModified = true;
		}
		if (bModified) {
			Log.warning("Webkit bug for selection API. Modifying selectionStart & selectionEnd returned values");
		}
		return oSelection;
	}
});
