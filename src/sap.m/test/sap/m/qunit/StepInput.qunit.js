/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"jquery.sap.global",
	"sap/m/library",
	"sap/m/StepInput",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/ui/events/jquery/EventExtension",
	"sap/ui/model/json/JSONModel",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/layout/GridData",
	"jquery.sap.keycodes"
], function(
	qutils,
	createAndAppendDiv,
	jQuery,
	mobileLibrary,
	StepInput,
	coreLibrary,
	Device,
	EventExtension,
	JSONModel,
	Form,
	FormContainer,
	FormElement,
	ResponsiveGridLayout,
	GridData
) {
	// shortcut for sap.m.StepInputValidationMode
	var StepInputValidationMode = mobileLibrary.StepInputValidationMode;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.StepInputStepModeType
	var StepInputStepModeType = mobileLibrary.StepInputStepModeType;

	createAndAppendDiv("content");



	var oCore = sap.ui.getCore();
	var bSkipDestroy = !!jQuery.sap.getUriParameters().get("testId");
	var StepMode = StepInputStepModeType;

	QUnit.module("API", {
		beforeEach: function () {
			this.stepInput = new StepInput();

			this.stepInput.placeAt('qunit-fixture');
			oCore.applyChanges();
		},
		afterEach: function () {
			if (!bSkipDestroy) {
				this.stepInput.destroy();
			}
		}
	});

	QUnit.test("DOM", function (assert) {
		//assert
		var $stepInput = this.stepInput.$();
		assert.ok($stepInput.length > 0, "The control was successfully rendered");
		equals($stepInput.attr("tabindex"), "-1", "tabindex attribute should be negative");
	});

	QUnit.test("incrementButton", function (assert) {
		//prepare
		var oIncrementButton = this.stepInput._getIncrementButton();

		//assert
		assert.equal(oIncrementButton.getNoTabStop(), true, "the button should not be part of tabchain");
		assert.strictEqual(oIncrementButton.getMetadata().getName(), "sap.ui.core.Icon",
			"the picker aggregation holds an instance of an icon");

		assert.equal(oIncrementButton.getTooltip(), StepInput.STEP_INPUT_INCREASE_BTN_TOOLTIP, "The tooltip is correct");

		//act
		oIncrementButton.firePress();
		this.clock.tick(1000);

		//assert
		assert.strictEqual(this.stepInput.getValue(), 1,
			"The increment button successfully incremented the value");
	});

	QUnit.test("decrementButton", function (assert) {
		//prepare
		var oDecrementButton = this.stepInput._getDecrementButton();

		//assert
		assert.equal(oDecrementButton.getNoTabStop(), true, "the button should not be part of tabchain");
		assert.strictEqual(oDecrementButton.getMetadata().getName(), "sap.ui.core.Icon",
			"the step input _decrementButton aggregation holds an instance of an icon");

		assert.equal(oDecrementButton.getTooltip(), StepInput.STEP_INPUT_DECREASE_BTN_TOOLTIP, "The tooltip is correct");

		//act
		oDecrementButton.firePress();
		this.clock.tick(1000);

		//assert
		assert.strictEqual(this.stepInput.getValue(), -1,
			"The decrement button successfully decremented the value");
	});

	QUnit.test("increase and decrease buttons are created only when actually needed", function (assert) {
		//Prepare and Act
		var oSI = new StepInput({editable: false});
		oSI.placeAt('qunit-fixture');
		oCore.applyChanges();
		//Assert
		assert.equal(oSI._getDecrementButton().getVisible(), false,
			"No decrement button since the StepInput is not editable");
		assert.equal(oSI._getIncrementButton().getVisible(), false,
			"No increment button since the StepInput is not editable");

		//Act
		oSI.setEditable(true);
		oCore.applyChanges();

		//Assert
		assert.ok(oSI._getDecrementButton().getVisible(),
			"Decrement button is available once StepInput is editable");
		assert.ok(oSI._getIncrementButton().getVisible(),
			"Increment button is available once StepInput is editable");

		//destroy
		oSI.destroy();
	});

	QUnit.test("openInputTag is called", function (assert) {
		//Prepare and Act
		var oRenderSpy,
			oSI = new StepInput();

		oSI.placeAt('qunit-fixture');
		oCore.applyChanges();

		oRenderSpy = this.spy(oSI._getInput().getRenderer(), "openInputTag");
		//act
		oSI.setDescription("EUR");
		oCore.applyChanges();

		assert.strictEqual(oRenderSpy.callCount, 1, "openInputTag is called");

		//destroy
		oSI.destroy();
	});

	QUnit.test("closeInputTag is called", function (assert) {
		//Prepare and Act
		var oRenderSpy,
			oSI = new StepInput();

		oSI.placeAt('qunit-fixture');
		oCore.applyChanges();

		oRenderSpy = this.spy(oSI._getInput().getRenderer(), "closeInputTag");
		//act
		oSI.setDescription("EUR");
		oCore.applyChanges();

		//Assert
		assert.strictEqual(oRenderSpy.callCount, 1, "closeInputTag is called");

		//destroy
		oSI.destroy();
	});

	QUnit.test("input", function (assert) {
		//assert
		assert.strictEqual(this.stepInput._getInput().getMetadata().getName(), "sap.m.internal.NumericInput",
			"the input aggregation holds an instance of a numeric input");
		assert.strictEqual(this.stepInput.getValue(), 0, "The default value is correctly set in the input");

		//act
		this.stepInput._getInput().setValue("random string");
		//assert
		assert.strictEqual(this.stepInput.getValue(), 0, "The value is successfully set in the input");

	});

	QUnit.test("writeInnerAttributes is called", function (assert) {
		//Prepare and Act
		var oRenderSpy,
			oSI = new StepInput();

		oSI.placeAt('qunit-fixture');
		oCore.applyChanges();

		oRenderSpy = this.spy(oSI._getInput().getRenderer(), "writeInnerAttributes");
		//act
		oSI.setDescription("EUR");
		oCore.applyChanges();

		//Assert
		assert.strictEqual(oRenderSpy.callCount, 1, "writeInnerAttributes is called");

		//destroy
		oSI.destroy();
	});

	QUnit.test("default textAlign is set to 'End'", function (assert) {
		//assert
		assert.strictEqual(this.stepInput._getInput().getTextAlign(), "End",
			"Text align is 'End'");

		//act
		this.stepInput.setEditable(false);
		//assert
		assert.strictEqual(this.stepInput._getInput().getTextAlign(), "End",
			"Text align is 'End' also when is set to read-only");

		//act
		this.stepInput.setEditable(true);
		this.stepInput.setEnabled(false);
		//assert
		assert.strictEqual(this.stepInput._getInput().getTextAlign(), "End",
			"Text align is 'End' also when the control is disabled");
	});

	QUnit.test("textAlign changed to 'Center'", function (assert) {
		//assert
		this.stepInput.setTextAlign("Center");

		//assert
		assert.strictEqual(this.stepInput.getTextAlign(), "Center", "Step input's textAlign is set to 'Center'");
		assert.strictEqual(this.stepInput._getInput().getTextAlign(), "Center", "Input's text align is 'Center'");

	});

	QUnit.test("textAlign set to 'Center'", function (assert) {
		//Prepare and Act
		var oSI = new StepInput({textAlign: "Center"});

		oSI.placeAt('qunit-fixture');
		oCore.applyChanges();

		//assert
		assert.strictEqual(oSI.getTextAlign(), "Center", "Step input's textAlign is set to 'Center'");
		assert.strictEqual(oSI._getInput().getTextAlign(), "Center", "Input's text align is 'Center'");

		//destroy
		oSI.destroy();
	});

	QUnit.test("setMin", function (assert) {
		//act
		this.stepInput.setMin(undefined);

		//assert
		assert.strictEqual(this.stepInput.getMin(), undefined,
			"Value of undefined is set");

		//act
		this.stepInput.setMin("string");

		//assert
		assert.strictEqual(this.stepInput.getMin(), undefined,
			"Value of 'min' is not changed");

		//prepare
		oSpyDisableButtons = this.spy(this.stepInput, "_disableButtons");
		//act
		this.stepInput.setMin(9);
		oCore.applyChanges();
		//assert
		assert.equal(oSpyDisableButtons.callCount, 1, "setMin always calls _disableButtons so the buttons state is reflected");
		assert.strictEqual(oSpyDisableButtons.getCall(0).args[2], 9,
			"_disableButtons is called and argument 2 is 'min'");
	});

	QUnit.test("setMax", function (assert) {
		var oSpyDisableButtons;

		//act
		this.stepInput.setMax(undefined);
		//assert
		assert.strictEqual(this.stepInput.getMax(), undefined,
			"Value of undefined is set to the 'max'");

		//act
		this.stepInput.setMax("string");

		//assert
		assert.strictEqual(this.stepInput.getMax(), undefined,
			"Value of 'max' is not changed");

		//prepare
		oSpyDisableButtons = this.spy(this.stepInput, "_disableButtons");
		//Act
		this.stepInput.setMax(20);
		oCore.applyChanges();

		assert.equal(oSpyDisableButtons.callCount, 1,
			"setMax always calls _disableButtons so the buttons state is reflected");
		assert.strictEqual(oSpyDisableButtons.getCall(0).args[1], 20,
			"_disableButtons is called and argument 1 is 'max'");
	});

	QUnit.test("setValueState", function (assert) {
		//prepare
		var sValue = ValueState.Error;

		//act
		this.stepInput.setValueState(sValue);
		oCore.applyChanges();

		//assert
		assert.equal(this.stepInput.getValueState(), sValue, "valueState is set to " + sValue);
		assert.equal(this.stepInput._getInput().getValueState(), sValue, "valueState is properly propagated to the input aggregation");
	});

	QUnit.test("setValueStateText", function (assert) {
		assert.ok(this.stepInput.setValueStateText, "method setValueStateText exists");

		//prepare
		var sText = "Test Value";

		//act
		this.stepInput.setValueStateText(sText);

		//assert
		assert.equal(this.stepInput.getValueStateText(), sText, "valueStateText is set to " + sText);
		assert.equal(this.stepInput._getInput().getValueStateText(), sText, "valueStateText is properly propagated to the input aggregation");
	});

	QUnit.test('Testing for duplicate id', function (assert) {
		var oStepInput;

		try {
			oStepInput = new StepInput({
				editable: true
			});
			assert.equal(1, 1, "The control is created succesfully");
		} catch (e) {
			assert.equal(1, 0, "Throws an error " + e.stack);
		}

		// destroy
		if (oStepInput) {
			oStepInput.destroy();
		}
	});

	QUnit.test("description", function (assert) {
		var sNumericDescSuffix = "-descr";
		// arrange
		this.stepInput.setDescription("EUR");
		assert.strictEqual(this.stepInput.$("input" + sNumericDescSuffix).length, 0, "Description element is not yet rendered");
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(this.stepInput._getInput().getDescription(), this.stepInput.getDescription(), "the description is passed to the inner input aggregation");
		assert.strictEqual(this.stepInput.$("input" + sNumericDescSuffix).length, 1, "Description element is inside the DOM");
	});

	QUnit.test("fieldWidth", function (assert) {
		assert.strictEqual(this.stepInput.$().find(".sapMInputBaseContentWrapper")[0].style.width, "100%", "field width is set to 100% if the description is not set");

		// arrange
		this.stepInput.setDescription("EUR");
		sap.ui.getCore().applyChanges();
		//assert
		assert.strictEqual(this.stepInput.$().find(".sapMInputBaseContentWrapper")[0].style.width, "50%", "field width by default is 50%");
		// arrange
		this.stepInput.setFieldWidth("70%");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.stepInput._getInput().getFieldWidth(), this.stepInput.getFieldWidth(), "the fieldWidth is passed to the inner input aggregation");
		assert.strictEqual(this.stepInput.$().find(".sapMInputBaseContentWrapper")[0].style.width, "70%", "field width of 70% is correctly set to the Input wraper");
	});

	QUnit.test("validationMode", function (assert) {
		assert.strictEqual(this.stepInput.getValidationMode(), StepInputValidationMode.FocusOut, "validation mode is set to 'FocusOut' by default");

		// arrange
		this.oLiveChangeSpy = sinon.spy(this.stepInput, "_attachLiveChange");
		this.oDettachLiveChangeSpy = sinon.spy(this.stepInput, "_detachLiveChange");
		this.stepInput.setValidationMode(StepInputValidationMode.LiveChange);
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(this.stepInput.getValidationMode(), StepInputValidationMode.LiveChange, "validation mode is set to 'LiveChange'");
		assert.strictEqual(this.oLiveChangeSpy.callCount, 1, "'LiveChange' is attached to the StepInput");
		assert.strictEqual(this.oDettachLiveChangeSpy.callCount, 0, "Detach of 'LiveChange' is not called");

		// arrange
		this.stepInput.setValidationMode(StepInputValidationMode.FocusOut);
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(this.stepInput.getValidationMode(), StepInputValidationMode.FocusOut, "validation mode is set to 'FocusOut'");
		assert.strictEqual(this.oDettachLiveChangeSpy.callCount, 1, "'LiveChange' is detached (_dettachLiveChange is called once)");
		assert.strictEqual(this.oLiveChangeSpy.callCount, 1, "'LiveChange' is not called again");
	});

	QUnit.test("StepMode.MultiplicationAndDivision: value state when value does not fold by step", function (assert) {
		//Prepare
		this.stepInput.setStepMode(StepMode.Multiple);
		this.stepInput.setStep(5);
		this.stepInput.setValue(2);
		sap.ui.getCore().applyChanges();

		//Act
		this.stepInput._verifyValue();

		//Assert
		assert.equal(this.stepInput.getValueState(), "Error", "..should be set to 'Error'");
	});
	QUnit.module("Operations", {
		beforeEach: function () {
			this.stepInput = new StepInput({
				value: 3,
				max: 10
			});

			this.stepInput.placeAt('qunit-fixture');
			oCore.applyChanges();
		},
		afterEach: function () {
			if (!bSkipDestroy) {
				this.stepInput.destroy();
			}
		}
	});


	QUnit.test("Disable button based on the value", function (assert) {
		//assert
		assert.strictEqual(this.stepInput._getIncrementButton().$().hasClass("sapMStepInputIconDisabled"), false,
			"The increment button is enabled because the value fits to limits");
		assert.strictEqual(this.stepInput._getDecrementButton().$().hasClass("sapMStepInputIconDisabled"), false,
			"The decrement button is enabled because the value fits to limits");

		//act
		this.stepInput.setMin(3);
		oCore.applyChanges();

		//assert
		assert.strictEqual(this.stepInput._getDecrementButton().$().hasClass("sapMStepInputIconDisabled"), true,
			"The decrement button is disabled because there's min and min = value");

		//act
		this.stepInput.setValue(2);
		oCore.applyChanges();
		//assert
		assert.strictEqual(this.stepInput._getDecrementButton().$().hasClass("sapMStepInputIconDisabled"), true,
			"The decrement button is disabled because value < min");

		//act
		this.stepInput.setValue(4);
		oCore.applyChanges();
		//assert
		assert.strictEqual(this.stepInput._getDecrementButton().$().hasClass("sapMStepInputIconDisabled"), false,
			"The decrement button is enabled because the value > min");

		//act
		this.stepInput.setEnabled(false);
		oCore.applyChanges();
		//assert
		assert.strictEqual(this.stepInput._getIncrementButton().$().hasClass("sapMStepInputIconDisabled"), true,
			"The increment button is disabled because setEnabled is set to false");

		//act
		this.stepInput.setEnabled(true);
		oCore.applyChanges();
		//assert
		assert.strictEqual(this.stepInput._getIncrementButton().$().hasClass("sapMStepInputIconDisabled"), false,
			"The increment button is enabled because setEnabled is set to true");
		assert.strictEqual(this.stepInput._getDecrementButton().$().hasClass("sapMStepInputIconDisabled"), false,
			"The decrement button is enabled because setEnabled is set to true");
	});

	QUnit.test("Error state when setting values out of the limit", function (assert) {
		var oInput = this.stepInput._getInput();

		//act
		this.stepInput.setMin(3);
		oInput.focus();
		oInput.setValue(2);
		oInput.$().blur();
		this.stepInput._change();
		oCore.applyChanges();

		//assert
		assert.strictEqual(this.stepInput._getInput().getValueState(), "Error",
			"The value state is Error as it should be because the value is under the limit");

		//act
		//value becomes 3
		this.stepInput._getIncrementButton().firePress();
		oCore.applyChanges();

		//assert
		assert.strictEqual(this.stepInput._getInput().getValueState(), "None",
			"The value state is None as it should be because the value is equal to the min");
	});

	QUnit.test("_shouldDisableDecrementButton should work with valid and invalid values for min", function (assert) {
		assert.ok(this.stepInput._shouldDisableDecrementButton(1, 1), "Should disable decrement button if min and value are equal");
		assert.ok(this.stepInput._shouldDisableDecrementButton(1, 2), "Should disable decrement button if min is more than value");
		assert.notOk(this.stepInput._shouldDisableDecrementButton(1, undefined), "Should NOT disable decrement button if min value is 'undefined'");
	});

	QUnit.test("_shouldDisableIncrementButton should work with valid and invalid values for max", function (assert) {
		assert.ok(this.stepInput._shouldDisableIncrementButton(1, 1), "Should disable increment button if max and value are equal");
		assert.ok(this.stepInput._shouldDisableIncrementButton(1, -1), "Should disable increment button if max is less than value");
		assert.notOk(this.stepInput._shouldDisableIncrementButton(1, undefined), "Should NOT disable increment button if max value is 'undefined'");
	});


	QUnit.module("Floating point", {
		beforeEach: function () {
			this.stepInput = new StepInput({
				step: 1.1,
				max: 2,
				displayValuePrecision: 1
			});

			this.stepInput.placeAt('qunit-fixture');
			oCore.applyChanges();
		},
		afterEach: function () {
			if (!bSkipDestroy) {
				this.stepInput.destroy();
			}
		}
	});

	QUnit.test("working with floating point", function (assert) {
		//prepare & act
		var oIncrementButton = this.stepInput._getIncrementButton(),
			oDecrementButton = this.stepInput._getDecrementButton();
		oIncrementButton.firePress();
		oCore.applyChanges();

		//assert
		assert.strictEqual(this.stepInput.getValue(), 1.1, "The value is successfuly incremented");
		oDecrementButton.firePress();
		oCore.applyChanges();
		assert.strictEqual(this.stepInput.getValue(), 0,
			"The value is successfuly decremented");

		//act
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);
		this.clock.tick(1000);

		//assert
		assert.strictEqual(this.stepInput.getAggregation("_input")._getInputValue(), "1.1",
			"The input's value is successfully incremented");

		//act
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		this.clock.tick(1000);

		//assert
		assert.strictEqual(this.stepInput.getAggregation("_input")._getInputValue(), "0.0",
			"The value is successfully decremented");

		//act
		oIncrementButton.firePress();
		oIncrementButton.firePress();
		oCore.applyChanges();

		//assert
		assert.strictEqual(this.stepInput.getValue(), 2,
			"The value is successfully decremented");
	});

	QUnit.test("working with floating point value precision set to 2", function (assert) {
		this.stepInput.setDisplayValuePrecision(2);
		this.stepInput.setValue(431.15);
		this.stepInput.setMin(410.00);
		this.stepInput.setMax(440.00);
		this.stepInput.setStep(0.05);
		oCore.applyChanges();

		var oIncrementButton = this.stepInput._getIncrementButton(),
			oDecrementButton = this.stepInput._getDecrementButton();

		oIncrementButton.firePress();
		oCore.applyChanges();
		assert.strictEqual(this.stepInput.getValue(), 431.2,
			"The value is successfuly incremented");
		oDecrementButton.firePress();
		oCore.applyChanges();
		assert.strictEqual(this.stepInput.getValue(), 431.15,
			"The value is successfuly decremented");

		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);
		this.clock.tick(1000);
		assert.strictEqual(this.stepInput.getAggregation("_input")._getInputValue(), "431.20",
			"The input's value is successfully incremented");
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		this.clock.tick(1000);
		assert.strictEqual(this.stepInput.getAggregation("_input")._getInputValue(), "431.15",
			"The input's value is successfully decremented");
	});

	QUnit.test("working with floating point value precision set to 20", function (assert) {
		this.stepInput.setDisplayValuePrecision(20);
		this.stepInput.setValue(0.01);
		this.stepInput.setStep(0.06);
		oCore.applyChanges();
		var oIncrementButton = this.stepInput._getIncrementButton();

		oIncrementButton.firePress();
		assert.strictEqual(this.stepInput.getValue(), 0.07, "The value is successfuly incremented");
		assert.strictEqual(this.stepInput.getAggregation("_input")._getInputValue(), "0.07000000000000000000", "The input's value is successfully incremented");
	});

	QUnit.test("working with floating point value precision set to 17", function (assert) {
		this.stepInput.setDisplayValuePrecision(17);
		this.stepInput.setValue(0.01);
		this.stepInput.setStep(0.02);
		oCore.applyChanges();
		var oIncrementButton = this.stepInput._getIncrementButton();

		oIncrementButton.firePress();
		assert.strictEqual(this.stepInput.getValue(), 0.03, "The value is successfuly incremented");
		assert.strictEqual(this.stepInput.getAggregation("_input")._getInputValue(), "0.03000000000000000", "The input's value is successfully incremented");
	});

	QUnit.test("setting default displayValuePrecision when it is not correct", function (assert) {
		this.stepInput.setDisplayValuePrecision(25);
		oCore.applyChanges();

		assert.strictEqual(this.stepInput.getDisplayValuePrecision(), 0, "The displayValuePrecision is set to 0");
	});

	QUnit.test("setting default displayValuePrecision when it is not correct and can't be converted to int", function (assert) {
		this.stepInput.setDisplayValuePrecision("test");
		oCore.applyChanges();

		assert.strictEqual(this.stepInput.getDisplayValuePrecision(), 0, "The displayValuePrecision is set to 0");
	});

	QUnit.test("setting default displayValuePrecision when it is undefined", function (assert) {
		this.stepInput.setDisplayValuePrecision();
		oCore.applyChanges();

		assert.strictEqual(this.stepInput.getDisplayValuePrecision(), 0, "The displayValuePrecision is set to 0");
	});

	QUnit.test("setting displayValuePrecision to different values (including 0)", function (assert) {
		var oInput = this.stepInput._getInput();

		// act
		this.stepInput.setMax(20);
		this.stepInput.setDisplayValuePrecision(0);
		this.stepInput.placeAt('content');
		oCore.applyChanges();

		// assert
		assert.strictEqual(this.stepInput.getDisplayValuePrecision(), 0, "The displayValuePrecision is set to 0");

		// act
		oInput.onfocusin();
		oInput._$input.focus().val("3.12").trigger("input");
		this.clock.tick(300);
		oCore.applyChanges();

		// assert
		assert.strictEqual(oInput.getValue(), "3", "The value is proper (3)");

		// act
		this.stepInput.setDisplayValuePrecision(2);
		oInput.onfocusin();
		oInput._$input.focus().val("6.1267").trigger("input");
		this.clock.tick(300);
		oCore.applyChanges();

		// assert
		assert.strictEqual(oInput.getValue(), "6.12", "The value is proper (6.12)");

		// act
		this.stepInput.setDisplayValuePrecision(3);
		oInput.onfocusin();
		oInput._$input.focus().val("9.12588").trigger("input");
		this.clock.tick(300);
		oCore.applyChanges();

		// assert
		assert.strictEqual(oInput.getValue(), "9.125", "The value is proper (9.125)");

	});

	QUnit.test("displayValuePrecision formating when digits after the dot are more than the value precision", function (assert) {
		this.stepInput.setDisplayValuePrecision(2);
		this.stepInput.setValue(1.104);
		oCore.applyChanges();

		assert.strictEqual(this.stepInput.getValue(), 1.104, "The value is formated correctly");
		assert.strictEqual(this.stepInput.getAggregation("_input")._getInputValue(), "1.10", "The input value is correctly formatted");
	});

	QUnit.test("displayValuePrecision formating when digits after the dot are less than the value precision", function (assert) {
		this.stepInput.setDisplayValuePrecision(5);
		this.stepInput.setValue(1.104);
		oCore.applyChanges();

		assert.strictEqual(this.stepInput.getValue(), 1.104, "The value is formated correctly");
		assert.strictEqual(this.stepInput.getAggregation("_input")._getInputValue(), "1.10400", "The input value is correctly formatted");
	});

	QUnit.test("displayValuePrecision formating when there are no digits after the dot and the value precision is bigger than 0", function (assert) {
		this.stepInput.setDisplayValuePrecision(5);
		this.stepInput.setValue(0);
		oCore.applyChanges();

		assert.strictEqual(this.stepInput.getValue(), 0, "The value is formated correctly");
		assert.strictEqual(this.stepInput.getAggregation("_input")._getInputValue(), "0.00000", "The input value is correctly formatted");
	});

	QUnit.test("displayValuePrecision formating when there are digits after the dot and the value precision is 0", function (assert) {
		this.stepInput.setDisplayValuePrecision(0);
		this.stepInput.setValue(1.325);
		oCore.applyChanges();

		assert.strictEqual(this.stepInput.getValue(), 1.325, "The value is formated correctly");
		assert.strictEqual(this.stepInput.getAggregation("_input")._getInputValue(), "1", "The input value is correctly formatted");
	});

	QUnit.test("Formatting when displayValuePrecision is equal to the step precision", function (assert) {
		this.stepInput.setDisplayValuePrecision(4);
		this.stepInput.setStep(1.0035);
		this.stepInput.setValue(0.325);
		oCore.applyChanges();

		var oIncrementButton = this.stepInput._getIncrementButton();

		oIncrementButton.firePress();

		assert.strictEqual(this.stepInput.getValue(), 1.3285, "The value is formated correctly");
		assert.strictEqual(this.stepInput.getAggregation("_input")._getInputValue(), "1.3285", "The input value is correctly formatted");
	});

	QUnit.test("Formatting when displayValuePrecision is smaller than the step precision", function (assert) {
		this.stepInput.setDisplayValuePrecision(2);
		this.stepInput.setStep(1.0035);
		this.stepInput.setValue(0.325);
		oCore.applyChanges();

		var oIncrementButton = this.stepInput._getIncrementButton();

		oIncrementButton.firePress();

		assert.strictEqual(this.stepInput.getValue(), 1.3285, "The value is formated correctly");
		assert.strictEqual(this.stepInput.getAggregation("_input")._getInputValue(), "1.33", "The input value is correctly formatted");
	});

	QUnit.test("Formatting when displayValuePrecision is bigger than the step precision", function (assert) {
		this.stepInput.setDisplayValuePrecision(6);
		this.stepInput.setStep(1.0035);
		this.stepInput.setValue(0.325);
		oCore.applyChanges();

		var oIncrementButton = this.stepInput._getIncrementButton();

		oIncrementButton.firePress();

		assert.strictEqual(this.stepInput.getValue(), 1.3285, "The value is formated correctly");
		assert.strictEqual(this.stepInput.getAggregation("_input")._getInputValue(), "1.328500", "The input value is correctly formatted");
	});

	QUnit.test("Formatting when displayValuePrecision is equal to the step precision, but the given value is with smaller precision than the displayValuePrecision", function (assert) {
		var oSI = new StepInput({
			value: 431.5,
			min: 410.00,
			max: 440.00,
			step: 0.05,
			displayValuePrecision: 2
		});

		oSI.placeAt('qunit-fixture');
		oCore.applyChanges();

		assert.strictEqual(oSI.getValue(), 431.5, "The value is formated correctly");
		assert.strictEqual(oSI.getAggregation("_input")._getInputValue(), "431.50", "The input value is correctly formatted");

		oSI.destroy();
	});

	QUnit.test("Formatting when we have two different controls with values with different precision, but which will be resolved to one and the same display value", function (assert) {
		var oSI = new StepInput({
				value: 1.3267,
				step: 0.004999,
				displayValuePrecision: 3
			}),
			oIncBtn = oSI._getIncrementButton(),
			oSI2 = new StepInput({
				value: 1.3266999999999999999,
				step: 0.00499999999999,
				displayValuePrecision: 3
			}),
			oIncBtn2 = oSI2._getIncrementButton();

		oSI.placeAt('qunit-fixture');
		oSI2.placeAt('qunit-fixture');
		oCore.applyChanges();

		assert.strictEqual(oSI.getValue(), 1.3267, "The value is formatted correctly");
		assert.strictEqual(oSI.getAggregation("_input")._getInputValue(), "1.327", "The input value is rounded to the given displayValuePrecision");

		oIncBtn.firePress();

		assert.strictEqual(oSI.getValue(), 1.331699, "The value is formatted correctly");
		assert.strictEqual(oSI.getAggregation("_input")._getInputValue(), "1.332", "The input value is correctly formatted");

		//second test
		assert.strictEqual(oSI2.getValue(), 1.3266999999999999999, "The value is formated correctly");
		assert.strictEqual(oSI2.getAggregation("_input")._getInputValue(), "1.327", "The input value is rounded to the given displayValuePrecision");

		oIncBtn2.firePress();

		assert.strictEqual(oSI2.getValue(), 1.3316999999999899999, "The value is formated correctly");
		assert.strictEqual(oSI2.getAggregation("_input")._getInputValue(), "1.332", "The input value is correctly formatted");

		oSI.destroy();
		oSI2.destroy();
	});

	QUnit.module("Keyboard Handling", {
		beforeEach: function () {
			this.oChangeSpy = sinon.spy();
			this.stepInput = new StepInput({
				value: 4,
				max: 10,
				min: -4,
				change: this.oChangeSpy
			});

			this.stepInput.placeAt('qunit-fixture');
			oCore.applyChanges();
		},
		afterEach: function () {
			if (!bSkipDestroy) {
				this.stepInput.destroy();
			}
			this.oChangeSpy.reset();
		}
	});

	QUnit.test("Value is changed upon Enter press", function (assert) {
		//prepare
		var oInput = this.stepInput._getInput();

		//act
		jQuery(this.stepInput).focus();
		oInput.$("inner").val(7);

		//assert
		assert.strictEqual(this.stepInput.getValue(), 4, "Value should not be changed because ENTER is not pressed yet");
		assert.equal(this.oChangeSpy.callCount, 0, "Change Event should not be called");

		//act
		qutils.triggerKeydown(oInput.getDomRef(), jQuery.sap.KeyCodes.ENTER);

		//assert
		assert.equal(this.stepInput.getValue(), 7, "Value should be changed due to ENTER pressed");
		this.clock.tick(1000); //needed because the change event is fired inside a timeout callback
		assert.equal(this.oChangeSpy.callCount, 1, "Change Event should be called once");
	});

	QUnit.test("Change event is fired only once when element is focused, changed and then + button is clicked", function (assert) {
		//prepare
		var oInput = this.stepInput._getInput(),
			oIncrementBtn = this.stepInput._getIncrementButton();

		//assert
		assert.strictEqual(this.stepInput.getValue(), 4, "Value should not be changed because ENTER is not pressed yet"); //value not changed
		assert.equal(this.oChangeSpy.callCount, 0, "Change Event should not be called");

		//act
		oInput.focus();
		oInput.$("inner").val(7);
		//the following reacts on value change of the Input
		this.stepInput._checkInputValue();

		//No way to simulate real click on the “+” button, so make sure the same event handlers are called in the same order
		// we can't focus on the IncrementButton since it doesn't have tab index therefore we call blur on the Input
		oIncrementBtn.focus();
		this.clock.tick(0);
		oIncrementBtn.firePress();

		//assert
		assert.equal(this.stepInput.getValue(), 8, "Value should be changed from 7 to 8 due to increment button pressed");
		assert.equal(this.oChangeSpy.callCount, 1, "Change Event should be called once");
	});

	QUnit.test("Change event is fired only once when element is focused, changed and then - button is clicked", function (assert) {
		//prepare
		var oInput = this.stepInput._getInput(),
			oDecrementBtn = this.stepInput._getDecrementButton();

		//assert
		assert.strictEqual(this.stepInput.getValue(), 4, "Value should not be changed because ENTER is not pressed yet"); //value not changed
		assert.equal(this.oChangeSpy.callCount, 0, "Change Event should not be called");

		//act
		oInput.focus();
		oInput.$("inner").val(7);
		//the following reacts on value change of the Input
		this.stepInput._checkInputValue();

		//No way to simulate real click on the “-” button, so make sure the same event handlers are called in the same order
		// we can't focus on the IncrementButton since it doesn't have tab index therefore we call blur on the Input
		oDecrementBtn.focus();
		this.clock.tick(0);
		oDecrementBtn.firePress();

		//assert
		assert.equal(this.stepInput.getValue(), 6, "Value should be changed from 7 to 6 due to decrement button pressed");
		assert.equal(this.oChangeSpy.callCount, 1, "Change Event should be called once");
	});

	QUnit.test("Change Event is fired when  +/- buttons are clicked", function (assert) {
		//prepare
		var oIncrementBtn = this.stepInput._getIncrementButton(),
			oDecrementBtn = this.stepInput._getDecrementButton();

		//act
		jQuery(this.stepInput).focus();
		oIncrementBtn.firePress();

		//assert
		assert.equal(this.stepInput.getValue(), 5, "Value should be changed 5 due to increment button pressed");
		assert.equal(this.oChangeSpy.callCount, 1, "Change Event should be called once");
		this.oChangeSpy.reset();

		//act
		oDecrementBtn.firePress();

		//assert
		assert.equal(this.stepInput.getValue(), 4, "Value should be changed 4 due to decrement button pressed");
		assert.equal(this.oChangeSpy.callCount, 1, "Change Event should be called once");
	});

	QUnit.test("Change event is fired only once on focus out, when writing inside the input and then leaving the field", function (assert) {
		//prepare
		var oInput = this.stepInput._getInput();

		//assert
		assert.strictEqual(this.stepInput.getValue(), 4, "Value should not be changed"); //value not changed
		assert.equal(this.oChangeSpy.callCount, 0, "Change Event should not be called");

		//act
		oInput.focus();
		oInput.$("inner").val(7);
		qutils.triggerKeydown(oInput.getDomRef(), jQuery.sap.KeyCodes.ENTER);

		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getValue(), 7, "Value should be changed from 4 to 7 due to typing inside the input");
		assert.equal(this.oChangeSpy.callCount, 1, "Change Event should be called once");
	});

	QUnit.test("Change event is not fired on focus out, when nothing is changed inside the input", function (assert) {
		//prepare
		var oInput = this.stepInput._getInput();

		// focus the field
		jQuery(this.stepInput).focus();

		//assert
		assert.strictEqual(this.stepInput.getValue(), 4, "Value should not be changed"); //value not changed
		assert.equal(this.oChangeSpy.callCount, 0, "Change Event should not be called");

		//act
		oInput.$("inner").blur();

		//assert
		assert.equal(this.stepInput.getValue(), 4, "After focus out value should not be changed");
		assert.equal(this.oChangeSpy.callCount, 0, "After focus out Change Event should not be called");
	});

	QUnit.test("up/down increases/decreases the value", function (assert) {
		//act
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 5,
			"The input's value is increasing with 1 after arrow up");

		//act
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 4,
			"The input's value is decreasing with 1 after arrow down");

		//act
		this.stepInput.setStep(5);
		this.clock.tick(1000);
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 9,
			"The input's value is decreasing with 5 after arrow up");
	});

	QUnit.test("up/down increases/decreases the value when in warning value state", function (assert) {
		//arrange
		this.stepInput.setValueState("Warning");

		//act
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 5,
			"The input's value is increasing with 1 after arrow up");

		//arrange
		this.stepInput.setValueState("Warning");

		//act
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 4,
			"The input's value is decreasing with 1 after arrow down");

		//arrange
		this.stepInput.setValueState("Warning");

		//act
		this.stepInput.setStep(5);
		this.clock.tick(1000);
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 9,
			"The input's value is decreasing with 5 after arrow up");
	});

	QUnit.test("if the value is out of min/max range, pressing increase/decrease button the value will be set to min/max", function (assert) {
		//prepare
		var oIncrementBtn = this.stepInput._getIncrementButton(),
			oDecrementBtn = this.stepInput._getDecrementButton();

		//act
		jQuery(this.stepInput).focus();
		this.stepInput._getInput().setValue(-7);
		oIncrementBtn.firePress();

		//assert
		assert.equal(this.stepInput.getValue(), -4,
			"The input's value is restored to the min value -4 after it was set to -7 and increment button was pressed");

		//act
		this.stepInput._getInput().setValue(13);
		oDecrementBtn.firePress();

		//assert
		assert.equal(this.stepInput.getValue(), 10,
			"The input's value is restored to max value 10 after it was set to 13 and decrement button was pressed");
	});

	QUnit.test("if the value is out of min/max range, pressing up/down arrow the value will be set to min/max", function (assert) {
		//act
		this.stepInput.setValue(-7);
		oCore.applyChanges();
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), -4,
			"The input's value is restored to the min value -4 after it was set to -7 and arrow up was pressed");

		//act
		this.stepInput.setValue(13);
		oCore.applyChanges();
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 10,
			"The input's value is restored to max value 10 after it was set to 13 and arrow down was pressed");
	});

	QUnit.test("if the value is out of min/max range, pressing up/down arrow + alt the value will be set to min/max", function (assert) {
		//act
		this.stepInput.setValue(-7);
		oCore.applyChanges();
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP, false, true);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), -4,
				"The input's value is restored to the min value -4 after it was set to -7 and arrow up + alt was pressed");

		//act
		this.stepInput.setValue(13);
		oCore.applyChanges();
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN, false, true);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 10,
				"The input's value is restored to max value 10 after it was set to 13 and arrow down + alt was pressed");
	});

	QUnit.test("if the value is out of min/max range, pressing up/down arrow + ctrl the value will be set to min/max", function (assert) {
		//act
		this.stepInput.setValue(-7);
		oCore.applyChanges();
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP, false, false, true);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), -4,
				"The input's value is restored to the min value -4 after it was set to -7 and arrow up + ctrl was pressed");

		//act
		this.stepInput.setValue(13);
		oCore.applyChanges();
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN, false, false, true);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 10,
				"The input's value is restored to max value 10 after it was set to 13 and arrow down + ctrl was pressed");
	});

	QUnit.test("pageup and pagedown increases/decreases the value with a larger step", function (assert) {
		var oSpyPageUp = this.spy(this.stepInput, "onsappageup"),
			oSpyPageDown = this.spy(this.stepInput, "onsappagedown");
		//act
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.PAGE_UP);
		this.clock.tick(1000);

		//assert
		assert.equal(oSpyPageUp.callCount, 1, "page up is called once");
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 6, "The input's value is increasing with step=step*2 after pageup");

		//act
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.PAGE_DOWN);
		this.clock.tick(1000);

		//assert
		assert.equal(oSpyPageDown.callCount, 1, "page down is called once");
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 4,
			"The input's value is decreasing with step=step*2 after pagedown");

		//act
		this.stepInput.setStep(5);
		this.clock.tick(1000);
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.PAGE_UP);
		this.clock.tick(1000);

		//assert
		assert.equal(oSpyPageUp.callCount, 2, "page up is called second time");
		assert.equal(Number(this.stepInput.getAggregation("_input")._getInputValue()), 10,
			"The input's value is decreasing with step=step*2 after pageup");
	});

	QUnit.test("shift+up/down increases/decreases the value with a larger step if specified", function (assert) {
		//act
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP, true, false, false);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 6,
			"The input's value is increasing with step=2*step after arrow up");

		//act
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN, true, false, false);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 4,
			"The input's value is decreasing with step=1 after arrow down");

		//act
		this.stepInput.setStep(5);
		this.clock.tick(1000);
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP, true, false, false);
		this.clock.tick(1000);

		//assert
		assert.equal(Number(this.stepInput.getAggregation("_input")._getInputValue()), 10,
			"The input's value is decreasing with step=2*step after arrow up");
	});

	QUnit.test("shift+pageup/pagedown sets value to max/min", function (assert) {
		//act
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.PAGE_UP, true, false, false);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 10,
			"The input's value is set to max after page up");

		//act
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.PAGE_DOWN, true, false, false);
		this.clock.tick(1000);

		//asser
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), -4,
			"The input's value is set to min after page down");
	});

	QUnit.test("ctrl+shift+up/down sets value to max/min", function (assert) {
		//act
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP, true, false, true);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 10,
			"The input's value is set to max after page up");

		//act
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN, true, false, true);
		this.clock.tick(1000);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), -4,
			"The input's  value is set to min after page down");
	});

	QUnit.test("mousewheel up/down increases/decreases the value", function (assert) {
		//arrange
		var bFirefox = Device.browser.firefox;
		var sWheelEventType = bFirefox ? "DOMMouseScroll" : "mousewheel";
		var oWheelUpEvent = jQuery.Event(sWheelEventType, { originalEvent: { detail: bFirefox ? -1 : 0, wheelDelta: 13 } });
		var oWheelDownEvent = jQuery.Event(sWheelEventType, { originalEvent: { detail: bFirefox ? 1 : 0 , wheelDelta: -13 } });


		this.stepInput.focus();
		//act
		qutils.triggerEvent(sWheelEventType, this.stepInput.getDomRef(), oWheelUpEvent);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 5,
				"The input's value is increasing with 1 after mouse wheel up");

		//act
		qutils.triggerEvent(sWheelEventType, this.stepInput.getDomRef(), oWheelDownEvent);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 4,
				"The input's value is decreasing with 1 after mouse wheel down");
	});

	QUnit.test("mousewheel up/down not increases/decreases the value if the input is not focused", function (assert) {
		//arrange
		var bFirefox = Device.browser.firefox;
		var sWheelEventType = bFirefox ? "DOMMouseScroll" : "mousewheel";
		var oWheelUpEvent = jQuery.Event(sWheelEventType, { originalEvent: { detail: bFirefox ? -1 : 0, wheelDelta: 13 } });
		var oWheelDownEvent = jQuery.Event(sWheelEventType, { originalEvent: { detail: bFirefox ? 1 : 0 , wheelDelta: -13 } });

		//act
		qutils.triggerEvent(sWheelEventType, this.stepInput.getDomRef(), oWheelUpEvent);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 4,
			"The input's value is not increased");

		//act
		qutils.triggerEvent(sWheelEventType, this.stepInput.getDomRef(), oWheelDownEvent);

		//assert
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 4,
			"The input's value is not decreased");
	});


	function calcTime(oStepInput, val) {
		var time = 0;
		// initialize values needed for _calcWaitTimeout function
		oStepInput._waitTimeout = StepInput.INITIAL_WAIT_TIMEOUT;
		oStepInput._speed = StepInput.INITIAL_SPEED;

		for (var i = 0; i <= val; i++) {
			time = time + oStepInput._calcWaitTimeout();
		}

		return time;
	}

	function callIconDelegate(sEventName, oIcon) {
		var oEvent = {
				button : 0
			};
		oIcon.aBeforeDelegates[0].oDelegate[sEventName].call(oIcon, oEvent);
	}

	QUnit.module("Mouse events on increment/decrement button", {
		beforeEach: function () {
			this.oChangeSpy = sinon.spy();
			this.stepInput = new StepInput({
				value: 4,
				max: 10,
				min: -4,
				change: this.oChangeSpy
			});

			this.stepInput.placeAt('qunit-fixture');
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oChangeSpy.reset();
		}
	});


	QUnit.test("Mouse down on incrementButton", function (assert) {
		// time for which the value will get from 4 to 9
		var t = calcTime(this.stepInput, 4),
			incBtn = this.stepInput._getIncrementButton();
		// Act - mouse down on increment button
		callIconDelegate("onmousedown", incBtn);
		// hold down the increment button enough time so the value can get to 9
		this.clock.tick(t);

		// Act - mouse up on increment button
		callIconDelegate("onmouseup", incBtn);

		// assert that the value get to 9
		assert.equal(this.stepInput.getValue(), 9, "Input has value of 9");
	});

	QUnit.test("Mouse down on decrementButton", function (assert) {
		// time for which the value will get from 4 to -1
		var t = calcTime(this.stepInput, 4),
			decBtn = this.stepInput._getDecrementButton();

		// Act - mouse down on decrement button
		callIconDelegate("onmousedown", decBtn);
		// hold down the decrement button enough time so the value can get to -1
		this.clock.tick(t);

		// Act - mouse up on decrement button
		callIconDelegate("onmouseup", decBtn);

		// assert that the value get to -1
		assert.equal(this.stepInput.getValue(), -1, "Input has value of -1");
	});

	QUnit.test("Mouse down on incrementButton when having max value set", function (assert) {
		// time for which the value will get from 4 to 7
		var t = calcTime(this.stepInput, 2),
			incBtn = this.stepInput._getIncrementButton();

		// Act - mouse down on increment button
		callIconDelegate("onmousedown", incBtn);
		// hold down the increment button enough time so the value can get to 7
		this.clock.tick(t);

		// assert that the value get to 7
		assert.equal(this.stepInput._getInput().getValue(), '7', "Input has value of 7");

		// keep holding until the max value of 10 is reached and the increase button will be disabled
		this.clock.tick(2000);

		// Act - mouse up on increment button
		callIconDelegate("onmouseup", incBtn);

		// assert that the value is 10 and that the change event is fired
		assert.ok(this.stepInput._getInput().getValue() === '10', "Input has reached the max value of 10");

		assert.equal(this.oChangeSpy.callCount, 1, "Change Event should be called once");
	});

	QUnit.test("Mouse down on decrementButton when having min value set", function (assert) {
		// time for which the value will get from 4 to 1
		var t = calcTime(this.stepInput, 2),
			decBtn = this.stepInput._getDecrementButton();

		// Act - mouse down on decrement button
		callIconDelegate("onmousedown", decBtn);
		// hold down the decrement button enough time so the value can get to 1
		this.clock.tick(t);

		// assert that the value get to 1
		assert.equal(this.stepInput._getInput().getValue(), "1", "Input has value of 1");

		// keep holding until the min value of -4 is reached and the decrease button will be disabled
		this.clock.tick(2000);

		// Act - mouse up on decrement button
		callIconDelegate("onmouseup", decBtn);

		// assert that the value is 10 and that the change event is fired
		assert.ok(this.stepInput._getInput().getValue() === "-4", "Input has reached the min value of -4");
		assert.equal(this.oChangeSpy.callCount, 1, "Change Event should be called once");
	});

	QUnit.test("Mouse down and mouse out on incrementButton", function (assert) {
		// time for which the value will get from 4 to 9
		var t = calcTime(this.stepInput, 4),
			incBtn = this.stepInput._getIncrementButton();

		// Act - mouse down on increment button
		callIconDelegate("onmousedown", incBtn);
		// hold down the increment button enough time so the value can get to 7
		this.clock.tick(t);

		// Act - mouse out on increment button
		callIconDelegate("onmouseout", incBtn);

		// assert that the value get to 9
		assert.equal(this.stepInput.getValue(), 9, "Input has value of 9");

		assert.equal(this.oChangeSpy.callCount, 1, "Change Event should be called once");
	});


	QUnit.module("Touch events on increment/decrement button", {
		beforeEach: function () {
			this.oDeviceStub = sinon.sandbox;
			this.oDeviceStub.stub(Device, "system", {
				desktop : false,
				phone : false,
				tablet : true
			});
			this.oChangeSpy = sinon.spy();
			this.stepInput = new StepInput({
				value: 4,
				max: 10,
				min: -4,
				change: this.oChangeSpy
			});

			this.stepInput.placeAt('qunit-fixture');
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oDeviceStub.restore();
			this.oDeviceStub = null;
			this.oChangeSpy.reset();
		}
	});

	QUnit.test("Touch start on incrementButton", function (assert) {
		// time for which the value will get from 4 to 9
		var t = calcTime(this.stepInput, 4),
			incBtn = this.stepInput._getIncrementButton();

		// Act - mouse down on increment button
		callIconDelegate("onmousedown", incBtn);
		// hold down the increment button enough time so the value can get to 9
		this.clock.tick(t);

		// Act - mouse up on increment button
		callIconDelegate("onmouseup", incBtn);

		// assert that the value get to 9
		assert.equal(this.stepInput.getValue(), 9, "Input has value of 9");
	});

	QUnit.test("Touch start on decrementButton", function (assert) {
		// time for which the value will get from 4 to -1
		var t = calcTime(this.stepInput, 4),
			decBtn = this.stepInput._getDecrementButton();

		// Act - mouse down on decrement button
		callIconDelegate("onmousedown", decBtn);
		// hold down the decrement button enough time so the value can get to -1
		this.clock.tick(t);

		// Act - mouse up on decrement button
		callIconDelegate("onmouseup", decBtn);

		// assert that the value get to -1
		assert.equal(this.stepInput.getValue(), -1, "Input has value of -1");
	});

	QUnit.test("Touch start on incrementButton when having max value set", function (assert) {
		// time for which the value will get from 4 to 7
		var t = calcTime(this.stepInput, 2),
			incBtn = this.stepInput._getIncrementButton();

		// Act - mouse down on increment button
		callIconDelegate("onmousedown", incBtn);
		// hold down the increment button enough time so the value can get to 7
		this.clock.tick(t);

		// assert that the value get to 7
		assert.equal(this.stepInput._getInput().getValue(), "7", "Input has value of 7");

		// keep holding until the max value of 10 is reached and the increase button will be disabled
		this.clock.tick(2000);

		// Act - mouse up on increment button
		callIconDelegate("onmouseup", incBtn);

		// assert that the value is 10 and that the change event is fired
		assert.ok(this.stepInput._getInput().getValue() === "10", "Input has reached the max value of 10");
		assert.equal(this.oChangeSpy.callCount, 1, "Change Event should be called once");
	});

	QUnit.test("Mouse down on decrementButton when having min value set", function (assert) {
		// time for which the value will get from 4 to 1
		var t = calcTime(this.stepInput, 2),
			decBtn = this.stepInput._getDecrementButton();

		// Act - mouse down on decrement button
		callIconDelegate("onmousedown", decBtn);
		// hold down the decrement button enough time so the value can get to 1
		this.clock.tick(t);

		// assert that the value get to 1
		assert.equal(this.stepInput._getInput().getValue(), "1", "Input has value of 1");

		// keep holding until the min value of -4 is reached and the decrease button will be disabled
		this.clock.tick(2000);

		// Act - mouse up on decrement button
		callIconDelegate("onmouseup", decBtn);

		// assert that the value is 10 and that the change event is fired
		assert.ok(this.stepInput._getInput().getValue() === "-4", "Input has reached the min value of -4");
		assert.equal(this.oChangeSpy.callCount, 1, "Change Event should be called once");
	});


	QUnit.module("Accessibility", {
		beforeEach: function () {
			this.stepInput = new StepInput({
				value: 4,
				max: 10,
				min: -4,
				ariaLabelledBy: "__text0"
			});
			this.stepInput.placeAt('qunit-fixture');
			oCore.applyChanges();
		},
		afterEach: function () {
			if (!bSkipDestroy) {
				this.stepInput.destroy();
			}
		}
	});

	QUnit.test("Internal 'sap.m.Input' has correct ARIA attributes when StepInput is initialized with default values", function (assert) {
		//prepare
		var oSUT = new StepInput(),
			oInput = oSUT._getInput(),
			$Input;
		//act
		oSUT.placeAt('qunit-fixture');
		oCore.applyChanges();
		$Input = oInput.$("inner");
		//assert
		assert.ok($Input.is("[role]"), "Internal Input has 'role' attribute");
		assert.strictEqual($Input.attr("role"), "spinbutton", "Internal input's 'role' attribute has correct value");
		assert.ok($Input.is("[aria-valuenow]"), "Internal Input has 'aria-valuenow' attribute");
		assert.strictEqual($Input.attr("aria-valuenow"), "0", "Internal input's 'aria-valuenow' attribute has correct value");
		assert.notOk($Input.is("[aria-valuemin]"), "Internal Input doesn't have 'aria-valuemin' attribute");
		assert.notOk($Input.is("[aria-valuemax]"), "Internal Input doesn't have 'aria-valuemax' attribute");
		/* Inherited InputBase aria properties */
		assert.notOk(oInput.$().is("[title]"), "Internal Input wrapper doesn't have 'title' attribute");
		assert.notOk($Input.is("[name]"), "Internal Input doesn't have 'name' attribute");
		assert.notOk($Input.is("[placeholder]"), "Internal Input doesn't have 'placeholder' attribute");
		assert.notOk($Input.is("[aria-invalid]"), "Internal Input doesn't have 'aria-invalid' attribute");
		assert.notOk($Input.is("[aria-readonly]"), "Internal Input doesn't have 'aria-readonly' attribute");
		assert.notOk($Input.is("[aria-disabled]"), "Internal Input doesn't have 'aria-disabled' attribute");
		assert.notOk($Input.is("[aria-required]"), "Internal Input doesn't have 'aria-required' attribute");
		assert.notOk($Input.is("[aria-labelledby]"), "Internal Input doesn't have 'aria-labelledby' attribute");
		assert.notOk($Input.is("[aria-describedby]"), "Internal Input doesn't have 'aria-describedby' attribute");
		//clean
		oSUT.destroy();
	});

	QUnit.test("Internal 'sap.m.Input' has correct ARIA attributes when initialized with specific values", function (assert) {
		//prepare
		var oSUT = new StepInput({
				name: "useful name",
				required: true,
				editable: false,
				enabled: false,
				placeholder: 'useful placeholder',
				tooltip: 'useful tooltip',
				min: 0,
				max: 10,
				value: 15
			}),
			oInput = oSUT._getInput(),
			$Input;
		//act
		oSUT.placeAt('qunit-fixture');
		oCore.applyChanges();
		$Input = oInput.$("inner");
		//assert
		assert.ok($Input.is("[role]"), "Internal Input has 'role' attribute");
		assert.strictEqual($Input.attr("role"), "spinbutton", "Internal input's 'role' attribute has correct value");
		assert.ok($Input.is("[aria-valuenow]"), "Internal Input has 'aria-valuenow' attribute");
		assert.strictEqual($Input.attr("aria-valuenow"), "15", "Internal input's 'aria-valuenow' attribute has correct value");
		assert.ok($Input.is("[aria-valuemin]"), "Internal Input has 'aria-valuemin' attribute");
		assert.strictEqual($Input.attr("aria-valuemin"), "0", "Internal input's 'aria-valuemin' attribute has correct value");
		assert.ok($Input.is("[aria-valuemax]"), "Internal Input has 'aria-valuemax' attribute");
		assert.strictEqual($Input.attr("aria-valuemax"), "10", "Internal input's 'aria-valuemax' attribute has correct value");
		/* Inherited InputBase aria properties */
		assert.ok(oInput.$().is("[title]"), "Internal Input wrapper has 'title' attribute");
		assert.strictEqual(oInput.$().attr("title"), 'useful tooltip', "Internal input's wrapper 'title' attribute has correct value");
		assert.ok($Input.is("[name]"), "Internal Input has 'name' attribute");
		assert.strictEqual($Input.attr("name"), 'useful name', "Internal input's 'name' attribute has correct value");
		assert.ok($Input.is("[placeholder]"), "Internal Input has 'placeholder' attribute");
		assert.strictEqual($Input.attr("placeholder"), 'useful placeholder', "Internal input's 'placeholder' attribute has correct value");
		assert.notOk($Input.is("[aria-invalid]"), "Internal Input has 'aria-invalid' attribute");
		assert.ok($Input.is("[aria-readonly]"), "Internal Input has 'aria-readonly' attribute");
		assert.strictEqual($Input.attr("aria-readonly"), 'true', "Internal input's 'aria-readonly' attribute has correct value");
		assert.ok($Input.is("[aria-disabled]"), "Internal Input has 'aria-disabled' attribute");
		assert.strictEqual($Input.attr("aria-disabled"), 'true', "Internal input's 'aria-disabled' attribute has correct value");
		assert.ok($Input.is("[aria-required]"), "Internal Input has 'aria-required' attribute");
		assert.strictEqual($Input.attr("aria-required"), 'true', "Internal input's 'aria-required' attribute has correct value");
		//clean
		oSUT.destroy();
	});

	QUnit.test("StepInput correctly alters its internal 'sap.m.Input' ARIA attributes on property changes", function (assert) {
		//prepare
		var oInput = this.stepInput._getInput();
		var sInputSuffix = "inner";
		//assert - initial values
		assert.ok(oInput.$(sInputSuffix).is('[aria-valuenow]'), "'aria-valuenow' attribute is rendered in the DOM");
		assert.strictEqual(oInput.$(sInputSuffix).attr("aria-valuenow"), "4", "'aria-valuenow' attribute has correct initial value");
		//act - change the 'value' property
		this.stepInput.setValue(9);
		oCore.applyChanges();
		//assert - expect aria-valuenow to be changed accordingly
		assert.strictEqual(oInput.$(sInputSuffix).attr("aria-valuenow"), "9", "'aria-valuenow' attribute was updated when the 'value' property was changed");
		//act - change the 'editable' property
		this.stepInput.setEditable(false);
		oCore.applyChanges();
		//assert - expect 'aria-readonly=true' to be rendered in the DOM
		assert.ok(oInput.$(sInputSuffix).is('[aria-readonly]'), "'aria-readonly' attribute was rendered in the DOM");
		assert.strictEqual(oInput.$(sInputSuffix).attr("aria-readonly"), "true", "'aria-readonly' attribute was updated when the 'editable' property was changed");
		//act - change the 'editable' property
		this.stepInput.setEditable(true);
		oCore.applyChanges();
		//assert - expect 'aria-readonly' not to be rendered in the DOM
		assert.notOk(oInput.$(sInputSuffix).is('[aria-readonly]'), "'aria-readonly' attribute is not rendered in the DOM");
		//act - change the 'enabled' property
		this.stepInput.setEnabled(false);
		oCore.applyChanges();
		//assert - expect 'aria-disabled=true' to be rendered in the DOM
		assert.ok(oInput.$(sInputSuffix).is('[aria-disabled]'), "'aria-disabled' attribute was rendered");
		assert.strictEqual(oInput.$(sInputSuffix).attr("aria-disabled"), "true", "'aria-disabled' attribute was updated when the 'enabled' property was changed");
		//act - change the 'enabled' property
		this.stepInput.setEnabled(true);
		oCore.applyChanges();
		//assert - expect 'aria-disabled' not to be rendered on the DOM
		assert.notOk(oInput.$(sInputSuffix).is('[aria-disabled]'), "'aria-disabled' attribute is not rendered in the DOM");
		//act - simulate changing the 'value' outside the possible range with typing
		oInput.$(sInputSuffix).val(11);
		// loose focus
		this.stepInput._change();
		oCore.applyChanges();
		//assert - expect 'aria-invalid=true' to be rendered in the DOM
		assert.ok(oInput.$(sInputSuffix).is('[aria-invalid]'), "'aria-invalid' is rendered in the DOM");
		assert.strictEqual(oInput.$(sInputSuffix).attr('aria-invalid'), "true", "'aria-invalid' attribute was updated when the invalid value is typed and confirmed");
	});

	QUnit.test("labels are redirected to the inner input", function () {
		// Prepare
		var $label,
			$innerInput,
			oLabel = new sap.m.Label({
				labelFor: this.stepInput,
				text: "Doesn't matter"
			});

		oLabel.placeAt("qunit-fixture");
		oCore.applyChanges();

		$label = oLabel.$();
		$innerInput = this.stepInput.$().find(".sapMInputBaseInner");

		// Assert
		assert.strictEqual($label.attr("for"), $innerInput.attr("id"), "label's 'for' points exactly towards the inner input");

		// Cleanup
		oLabel.destroy();
	});

	QUnit.test("labels are redirected to the inner input when used inside of a form", function(assert) {
		// Prepare
		var oStepInputOne = new StepInput("first", {
				value: "36",
				layoutData: new GridData({span: "L4 M4 S4"})
			}),
			oStepInputTwo = new StepInput("second", {
				value: "75",
				layoutData: new GridData({span: "L4 M4 S4"})
			}),
			oForm = new Form({
				layout: new ResponsiveGridLayout(),
				formContainers: [
					new FormContainer({
						title: "test",
						formElements: [
							new FormElement({
								label: new sap.m.Label("medium", {text: "Medium"}),
								fields: [
									oStepInputOne,
									oStepInputTwo
								]
							})
						]
					})
				]
			});
		oForm.placeAt('qunit-fixture');
		oCore.applyChanges();

		// Act
		// Assert
		assert.strictEqual(oStepInputOne.$().find(".sapMInputBaseInner").attr("aria-labelledby"), "medium",
			"Inner input of the first StepInput has correct aria-lablledby argument");
		assert.strictEqual(oStepInputTwo.$().find(".sapMInputBaseInner").attr("aria-labelledby"), "medium",
			"Inner input of the second StepInput has correct aria-lablledby argument");

		// Cleanup
		oForm.destroy();
	});

	QUnit.test("Backwards reference to a label is added in aria-labelledby only on the inner input", function () {
		// Prepare
		var $label,
			$innerInput,
			oLabel = new sap.m.Label({
				labelFor: this.stepInput,
				text: "Doesn't matter"
			});

		oLabel.placeAt("qunit-fixture");
		oCore.applyChanges();

		$label = oLabel.$();
		$innerInput = this.stepInput.$().find(".sapMInputBaseInner");

		// Assert
		assert.notOk($label.attr("aria-labelledby"), "Root element doesn't have aria-labelledby");
		assert.strictEqual($innerInput.attr("aria-labelledby"), oLabel.getId() + " __text0",
			"Internal input has reference to the label and the default ariaLabelledBy");

		// Cleanup
		oLabel.destroy();
	});

	QUnit.test("Labels, default ariaLabelledBy and description are all added in aria-labelledby", function () {
		// Prepare
		var $innerInput,
			sExpectedReferences,
			oLabel = new sap.m.Label("the-label", {
				labelFor: this.stepInput,
				text: "Doesn't matter"
			});

		// Act
		this.stepInput.setDescription("Some description");
		oCore.applyChanges();

		$innerInput = this.stepInput.$().find(".sapMInputBaseInner");
		sExpectedReferences = "the-label __text0 " + this.stepInput._getInput().getId() + "-descr";

		//Assert
		assert.strictEqual($innerInput.attr("aria-labelledby"), sExpectedReferences, "All references are set");

		// Cleanup
		oLabel.destroy();
	});

	QUnit.module("binding", {
		beforeEach: function () {
			this.stepInput = new StepInput({
				value: {
					path: "/vValue"
				},
				displayValuePrecision: {
					path: "/vPrecision"
				},
				max: {
					path: "/vMax"
				},
				min: {
					path: "/vMin"
				}
			});
			this.oModel = new JSONModel();
			this.stepInput.placeAt('qunit-fixture');
			oCore.applyChanges();
		},
		afterEach: function () {
			if (!bSkipDestroy) {
				this.stepInput.destroy();
			}
		}
	});

	QUnit.test("When value set via binding is undefined", function (assert) {
		this.oModel.setData({});
		this.stepInput.setModel(this.oModel);
		oCore.applyChanges();

		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), 0, "The input is set correctly");
		assert.strictEqual(this.stepInput.getValue(), 0, "Value is set to the default one if it was undefined");
	});

	QUnit.test("value set via binding", function (assert) {
		this.oModel.setData({
			vValue: 6
		});
		this.stepInput.setModel(this.oModel);
		oCore.applyChanges();

		assert.strictEqual(this.stepInput.getValue(), 6, "Value is set correctly");
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), "6", "The input is set correctly");
	});

	QUnit.test("value set via binding and has precision", function (assert) {
		this.oModel.setData({
			vValue: 6,
			vPrecision: 3
		});
		this.stepInput.setModel(this.oModel);
		oCore.applyChanges();

		assert.strictEqual(this.stepInput.getValue(), 6, "Value is set correctly");
		assert.strictEqual(this.stepInput.getDisplayValuePrecision(), 3, "Value precision is set correctly");
		assert.strictEqual(this.stepInput.getAggregation("_input")._getInputValue(), "6.000", "The input is set and formated correctly");
	});

	QUnit.test("less than Min value set via binding", function (assert) {
		this.oModel.setData({
			vValue: 4,
			vMin: 5
		});
		this.stepInput.setModel(this.oModel);
		oCore.applyChanges();

		assert.strictEqual(this.stepInput.getValue(), 4, "Value is set correctly");
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), "4", "The input is set correctly");
	});

	QUnit.test("value 0 Min value set via binding", function (assert) {
		this.oModel.setData({
			vValue: 0,
			vMin: 5
		});
		this.stepInput.setModel(this.oModel);
		oCore.applyChanges();

		assert.strictEqual(this.stepInput.getValue(), 0, "Value is set correctly");
		assert.equal(this.stepInput.getAggregation("_input")._getInputValue(), "0", "The input is set correctly");
	});


	QUnit.module("calculate decimals", {
		beforeEach: function () {
			this.stepInput = new StepInput();

			this.stepInput.placeAt('qunit-fixture');
			oCore.applyChanges();
		},
		afterEach: function () {
			if (!bSkipDestroy) {
				this.stepInput.destroy();
			}
		}
	});

	QUnit.test("Adding additional zeros to reach the precision value", function (assert) {
		assert.strictEqual(this.stepInput._padZeroesRight("34", 5), "34000", "returns '34000'");
	});

	QUnit.test("Adding zeros equal to precision value", function (assert) {
		assert.strictEqual(this.stepInput._padZeroesRight("0", 5), "00000", "returns '00000'");
	});

	QUnit.module("onsapescape()", {
		beforeEach: function () {
			this.stepInput = new StepInput({});

			this.stepInput.placeAt('qunit-fixture');
			oCore.applyChanges();
		},
		afterEach: function () {
			if (!bSkipDestroy) {
				this.stepInput.destroy();
			}
		}
	});

	QUnit.test("onsapescape()", function (assert) {
		//prepare & act
		var oSpy = sinon.spy(this.stepInput, "onsapescape");
		this.stepInput.onsapescape();
		// Assert
		assert.equal(oSpy.callCount, 1, "onsapescape() of the input is called once");
	});

	QUnit.module("Private API", {
		beforeEach: function () {
			this.stepInput = new StepInput({});

			this.stepInput.placeAt('qunit-fixture');
			oCore.applyChanges();
		},
		afterEach: function () {
			if (!bSkipDestroy) {
				this.stepInput.destroy();
			}
		}
	});

	QUnit.test("_calculateValue() with positive numbers", function (assert) {
		//assert
		assert.strictEqual(this.stepInput._calculateNewValue(1, true), 1, "The value of 0 is increased by 1");

		//act
		this.stepInput.setMin(-1);
		//assert
		assert.strictEqual(this.stepInput._calculateNewValue(2, false), this.stepInput.getMin(),
			"The value of 0 is decreased by 2 but min > 2, so it returns min");

		//act
		this.stepInput.setMax(5);
		//assert
		assert.strictEqual(this.stepInput._calculateNewValue(6, true), this.stepInput.getMax(),
			"The value of 0 is increased by 6 but max < 6, so it returns max");

		//act
		this.stepInput.setMax(6);
		this.stepInput.setValue(3);

		//assert
		assert.strictEqual(this.stepInput._calculateNewValue(2, true),
			5,
			"The value of 3 is increased by 2 * 1(default step) and max is not returned");
		assert.strictEqual(this.stepInput._calculateNewValue(5, true),
			this.stepInput.getMax(),
			"The value of 3 is increased by 5 * 1 and the max is returned");
	});

	QUnit.test("_calculateNewValue() with negative numbers", function (assert) {
		//assert
		assert.strictEqual(this.stepInput._calculateNewValue(-1, true), 1, "The value of 0 is increased by 1");

		//act
		this.stepInput.setMin(-1);
		//assert
		assert.strictEqual(this.stepInput._calculateNewValue(-2, false), this.stepInput.getMin(),
			"The value of 0 is decreased by 2 but min > 2, so it returns min");

		//act
		this.stepInput.setMax(5);
		//assert
		assert.strictEqual(this.stepInput._calculateNewValue(-6, true), this.stepInput.getMax(),
			"The value of 0 is increased by 6 but max < 6, so it returns max");

		//act
		this.stepInput.setMax(6);
		this.stepInput.setValue(3);
		//assert
		assert.strictEqual(this.stepInput._calculateNewValue(-2, true),
			5,
			"The value of 3 is increased by 2 * 1(default step) and max is not returned");
		assert.strictEqual(this.stepInput._calculateNewValue(-5, true),
			this.stepInput.getMax(),
			"The value of 3 is increased by 5 * 1 and the max is returned");
	});


	QUnit.test("_closestFoldValue with step 5, larger step 1, and increasing", function (assert) {
		assert.equal(this.stepInput._calculateClosestFoldValue(-77, 5, 1), -75, '-77 + => -75');
		assert.equal(this.stepInput._calculateClosestFoldValue(-32, 5, 1), -30, '-32 + => -30');
		assert.equal(this.stepInput._calculateClosestFoldValue(-30, 5, 1), -25, '-30 + => -25');
		assert.equal(this.stepInput._calculateClosestFoldValue(-17, 5, 1), -15, '-17 + => -15');
		assert.equal(this.stepInput._calculateClosestFoldValue(-15, 5, 1), -10, '-15 + => -10');
		assert.equal(this.stepInput._calculateClosestFoldValue(-14, 5, 1), -10, '-14 + => -10');
		assert.equal(this.stepInput._calculateClosestFoldValue(-11, 5, 1), -10, '-11 + => -10');
		assert.equal(this.stepInput._calculateClosestFoldValue(-10, 5, 1), -5, '-10 + => -5');
		assert.equal(this.stepInput._calculateClosestFoldValue(-6, 5, 1), -5, '-6 + => -5');
		assert.equal(this.stepInput._calculateClosestFoldValue(-5, 5, 1), 0, '-5 + => 0');
		assert.equal(this.stepInput._calculateClosestFoldValue(-4, 5, 1), 0, '-4 + => 0');
		assert.equal(this.stepInput._calculateClosestFoldValue(-1, 5, 1), 0, '-1 + => 0');
		assert.equal(this.stepInput._calculateClosestFoldValue(0, 5, 1), 5, '0 + => 5');
		assert.equal(this.stepInput._calculateClosestFoldValue(1, 5, 1), 5, '1 + => 5');
		assert.equal(this.stepInput._calculateClosestFoldValue(4, 5, 1), 5, '4 + => 5');
		assert.equal(this.stepInput._calculateClosestFoldValue(5, 5, 1), 10, '5 + => 10');
		assert.equal(this.stepInput._calculateClosestFoldValue(6, 5, 1), 10, '6 + => 10');
		assert.equal(this.stepInput._calculateClosestFoldValue(10, 5, 1), 15, '10 + => 15');
		assert.equal(this.stepInput._calculateClosestFoldValue(11, 5, 1), 15, '11 + => 15');
		assert.equal(this.stepInput._calculateClosestFoldValue(14, 5, 1), 15, '14 + => 15');
		assert.equal(this.stepInput._calculateClosestFoldValue(15, 5, 1), 20, '15 + => 20');
		assert.equal(this.stepInput._calculateClosestFoldValue(17, 5, 1), 20, '17 + => 20');
		assert.equal(this.stepInput._calculateClosestFoldValue(30, 5, 1), 35, '30 + => 35');
		assert.equal(this.stepInput._calculateClosestFoldValue(32, 5, 1), 35, '32 + => 35');
		assert.equal(this.stepInput._calculateClosestFoldValue(77, 5, 1), 80, '77 + => 80');
	});

	QUnit.test("_closestFoldValue with step 1, larger step 1, and decreasing", function (assert) {
		assert.equal(this.stepInput._calculateClosestFoldValue(-77, 5, -1), -80, '-80 - => -80');
		assert.equal(this.stepInput._calculateClosestFoldValue(-32, 5, -1), -35, '-35 - => -35');
		assert.equal(this.stepInput._calculateClosestFoldValue(-30, 5, -1), -35, '-35 - => -35');
		assert.equal(this.stepInput._calculateClosestFoldValue(-17, 5, -1), -20, '-20 - => -20');
		assert.equal(this.stepInput._calculateClosestFoldValue(-15, 5, -1), -20, '-20 - => -20');
		assert.equal(this.stepInput._calculateClosestFoldValue(-14, 5, -1), -15, '-15 - => -15');
		assert.equal(this.stepInput._calculateClosestFoldValue(-11, 5, -1), -15, '-15 - => -15');
		assert.equal(this.stepInput._calculateClosestFoldValue(-10, 5, -1), -15, '-15 - => -15');
		assert.equal(this.stepInput._calculateClosestFoldValue(-6, 5, -1), -10, '-10 - => -10');
		assert.equal(this.stepInput._calculateClosestFoldValue(-5, 5, -1), -10, '-10 - => -10');
		assert.equal(this.stepInput._calculateClosestFoldValue(-4, 5, -1), -5, '-5 - => -5');
		assert.equal(this.stepInput._calculateClosestFoldValue(-1, 5, -1), -5, '-5 - => -5');
		assert.equal(this.stepInput._calculateClosestFoldValue(0, 5, -1), -5, '-5 - => -5');
		assert.equal(this.stepInput._calculateClosestFoldValue(1, 5, -1), 0, '0 - => 0');
		assert.equal(this.stepInput._calculateClosestFoldValue(4, 5, -1), 0, '0 - => 0');
		assert.equal(this.stepInput._calculateClosestFoldValue(5, 5, -1), 0, '0 - => 0');
		assert.equal(this.stepInput._calculateClosestFoldValue(6, 5, -1), 5, '5 - => 5');
		assert.equal(this.stepInput._calculateClosestFoldValue(10, 5, -1), 5, '5 - => 5');
		assert.equal(this.stepInput._calculateClosestFoldValue(11, 5, -1), 10, '10 - => 10');
		assert.equal(this.stepInput._calculateClosestFoldValue(14, 5, -1), 10, '10 - => 10');
		assert.equal(this.stepInput._calculateClosestFoldValue(15, 5, -1), 10, '10 - => 10');
		assert.equal(this.stepInput._calculateClosestFoldValue(17, 5, -1), 15, '15 - => 15');
		assert.equal(this.stepInput._calculateClosestFoldValue(30, 5, -1), 25, '25 - => 25');
		assert.equal(this.stepInput._calculateClosestFoldValue(32, 5, -1), 30, '30 - => 30');
		assert.equal(this.stepInput._calculateClosestFoldValue(77, 5, -1), 75, '75 - => 75');
	});

	QUnit.test("_closestFoldValue when input value is a floating point number, but displayValuePrecision=0, step and" +
		" larger step are integers", function (assert) {
		assert.equal(this.stepInput._calculateClosestFoldValue(35.7, 5, 1), 40, '37.5 + =>50');
		assert.equal(this.stepInput._calculateClosestFoldValue(-35.7, 5, -1), -40, '-37.5 - =>-40');
	});

	QUnit.test("_calculateNewValue: next value when current value does not fold into a mandatory step(StepMode.MultiplicationAndDivision)",
		function (assert) {
			//Prepare
			var fResult;
			this.stepInput.setStepMode(StepMode.Multiple);
			this.stepInput.setValue(-1);
			this.stepInput.setStep(5);
			sap.ui.getCore().applyChanges();

			//Act
			fResult = this.stepInput._calculateNewValue(1, true);

			//Assert
			assert.equal(fResult, 0, "..should result in next value that folds into the step");
		});

	QUnit.test("_calculateNewValue: previous value when current value does not fold into a mandatory step(StepMode.MultiplicationAndDivision)",
		function (assert) {
			//Prepare
			var fResult;
			this.stepInput.setStepMode(StepMode.Multiple);
			this.stepInput.setValue(-1);
			this.stepInput.setStep(5);
			sap.ui.getCore().applyChanges();

			//Act
			fResult = this.stepInput._calculateNewValue(1, false);

			//Assert
			assert.equal(fResult, -5, "..should result in previous value that folds into the step");
		});


	QUnit.test("_calculateNewValue: next value when current value does not fold into a mandatory step(StepMode.MultiplicationAndDivision)" +
		" and larger step is defined", function () {
		//Prepare
		var fResult;
		this.stepInput.setStepMode(StepMode.Multiple);
		this.stepInput.setValue(1);
		this.stepInput.setStep(5);
		this.stepInput.setLargerStep(3);
		sap.ui.getCore().applyChanges();

		//Act
		fResult = this.stepInput._calculateNewValue(3, true);

		//Assert
		assert.equal(fResult, 15, "..should result in next value that folds into the step");
	});

	QUnit.test("_calculateNewValue: previous value when current value does not fold into a mandatory step(StepMode.MultiplicationAndDivision)" +
		" and larger step is defined", function () {
		//Prepare
		var fResult;
		this.stepInput.setStepMode(StepMode.Multiple);
		this.stepInput.setValue(-1);
		this.stepInput.setStep(5);
		this.stepInput.setLargerStep(3);
		sap.ui.getCore().applyChanges();

		//Act
		fResult = this.stepInput._calculateNewValue(3, false);

		//Assert
		assert.equal(fResult, -15, "..should result in previous value that folds into the step");
	});


	QUnit.test("_calculateNewValue: next value when current value does not fold into a mandatory step(StepMode.MultiplicationAndDivision) " +
		"and next value is greater than max", function () {
		//Prepare
		var fResult;
		this.stepInput.setStepMode(StepMode.Multiple);
		this.stepInput.setMax(15);
		this.stepInput.setValue(12);
		this.stepInput.setStep(6);
		sap.ui.getCore().applyChanges();

		//Act
		fResult = this.stepInput._calculateNewValue(1, true);

		//Assert
		assert.equal(fResult, 15, "..should result in next value=max");
	});

	QUnit.test("_calculateNewValue: previous value when current value does not fold into a mandatory step(StepMode.Multiple" +
		") and previous value is less than min", function () {
		//Prepare
		var fResult;
		this.stepInput.setStepMode(StepMode.Multiple);
		this.stepInput.setValue(-10);
		this.stepInput.setStep(5);
		this.stepInput.setMin(-14);
		sap.ui.getCore().applyChanges();

		//Act
		fResult = this.stepInput._calculateNewValue(1, false);

		//Assert
		assert.equal(fResult, -14, "..should result in previous value=min");
	});

	QUnit.test("_calculateNewValue: when value and/or step are floating number values and step is mandatory", function (assert) {
		//Prepare
		var fResult1, fResult2;
		this.stepInput.setStepMode(StepMode.Multiple);
		this.stepInput.setValue(-7.0);
		this.stepInput.setDisplayValuePrecision(1);
		this.stepInput.setStep(5.0);

		var oStepInputNoMandatory = new StepInput({
			mandatory: false,
			value: -7.0,
			displayValuePrecision: 1,
			step: 5.0
		});
		oStepInputNoMandatory.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Act
		fResult1 = this.stepInput._calculateNewValue(1, true);
		fResult2 = oStepInputNoMandatory._calculateNewValue(1, true);

		//Assert
		assert.equal(fResult1, fResult2, "..should change the value as the mandatory was set to false");
	});


	QUnit.test("_calculateNewValue calls _calculateClosestFoldValue with right parameters", function (assert) {
		//Prepare
		this.stepInput.setStepMode(StepMode.Multiple);
		this.stepInput.setValue(0);
		this.stepInput._getInput().setValue(10);
		this.stepInput.setStep(5);
		this.stepInput.setLargerStep(3);

		var oSpyCalculateClosestFoldValue = this.spy(this.stepInput, "_calculateClosestFoldValue");

		//Act
		this.stepInput._calculateNewValue(3, true);
		this.stepInput._calculateNewValue(3, false);

		this.stepInput._getInput().setValue(0);//same as the StepInput.value property
		this.stepInput._calculateNewValue(3, true);


		//Assert
		assert.equal(oSpyCalculateClosestFoldValue.callCount, 3, "..certain times");
		assert.deepEqual(oSpyCalculateClosestFoldValue.getCall(0).args, [10, 15, 1], ".. with certain arguments when " +
			"called _calculateNewValue(3, true) and DOM value differs from StepInput <value>");
		assert.deepEqual(oSpyCalculateClosestFoldValue.getCall(1).args, [10, 15, -1], ".. with certain arguments when " +
			"called _calculateNewValue(3, false) and input value differs from StepInput <value>");
		assert.deepEqual(oSpyCalculateClosestFoldValue.getCall(2).args, [0, 15, 1], ".. with certain arguments when " +
			" called _calculateNewValue(3, true) and DOM value is the same as StepInput <value>");
	});

	QUnit.test("StepMode: '+', arrow Up, Page Up or Shift + Up calls _calculateNewValue", function (assert) {
		//Prepare
		this.stepInput.setStepMode(StepMode.Multiple);
		this.stepInput.setValue(-7);
		this.stepInput.setStep(5);
		sap.ui.getCore().applyChanges();

		var oSpyCalculateNewValue = this.spy(this.stepInput, "_calculateNewValue");

		//Act
		this.stepInput.focus();
		this.stepInput._getIncrementButton().firePress();
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP);
		this.clock.tick(1000);
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.PAGE_UP);
		this.clock.tick(1000);
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_UP, true, false, false);
		this.clock.tick(1000);

		//Assert
		assert.equal(oSpyCalculateNewValue.callCount, 4, "..certain times");
		assert.deepEqual(oSpyCalculateNewValue.getCall(0).args, [1], ".. with certain arguments when '+' pressed");
		assert.deepEqual(oSpyCalculateNewValue.getCall(1).args, [1], ".. with certain arguments when 'keyb. Up' is pressed");
		assert.deepEqual(oSpyCalculateNewValue.getCall(2).args, [this.stepInput.getLargerStep()],
			".. with certain arguments when 'keyb. Page Up' is pressed");
		assert.deepEqual(oSpyCalculateNewValue.getCall(3).args, [this.stepInput.getLargerStep()],
			".. with certain arguments when 'keyb. Shift + Up' is pressed");

		//Cleanup
		oSpyCalculateNewValue.restore();
	});

	QUnit.test("StepMode: '-', arrow Down, Page Down or Shift + Down calls _calculateNewValue", function (assert) {
		//Prepare
		this.stepInput.setStepMode(StepMode.Multiple);
		this.stepInput.setValue(-7);
		this.stepInput.setStep(5);
		sap.ui.getCore().applyChanges();

		var oSpyCalculateNewValue = this.spy(this.stepInput, "_calculateNewValue");

		//Act
		this.stepInput.focus();
		this.stepInput._getDecrementButton().firePress();
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN);
		this.clock.tick(1000);
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.PAGE_DOWN);
		this.clock.tick(1000);
		qutils.triggerKeydown(this.stepInput.getDomRef(), jQuery.sap.KeyCodes.ARROW_DOWN, true, false, false);
		this.clock.tick(1000);

		//Assert
		assert.equal(oSpyCalculateNewValue.callCount, 4, "..certain times");
		assert.deepEqual(oSpyCalculateNewValue.getCall(0).args, [-1], ".. with certain arguments when '-' pressed");
		assert.deepEqual(oSpyCalculateNewValue.getCall(1).args, [-1], ".. with certain arguments when 'keyb. Down' is pressed");
		assert.deepEqual(oSpyCalculateNewValue.getCall(2).args, [-this.stepInput.getLargerStep()],
			".. with certain arguments when 'keyb. Page Down' is pressed");
		assert.deepEqual(oSpyCalculateNewValue.getCall(3).args, [-this.stepInput.getLargerStep()],
			".. with certain arguments when 'keyb. Shift + Down' is pressed");

		//Cleanup
		oSpyCalculateNewValue.restore();
	});

	QUnit.test("_isNumericLike()", function (assert) {
		//assert
		assert.strictEqual(this.stepInput._isNumericLike(0), true, "The value of 0 is a number");
		assert.strictEqual(this.stepInput._isNumericLike("not a number"), false,
			"The value of 'not a number' is not a number");
		assert.strictEqual(this.stepInput._isNumericLike(null), false,
			"The value of null is not a number");
		assert.strictEqual(this.stepInput._isNumericLike(undefined), false,
			"The value of undefined is not a number");
		assert.strictEqual(this.stepInput._isNumericLike("5"), true,
			"The value '5' is a number");
		assert.strictEqual(this.stepInput._isNumericLike(""), false,
			"Empty string is not a number");
	});

	QUnit.test("_isInteger", function (assert) {
		assert.ok(this.stepInput._isInteger(1), "1 is integer");
		assert.ok(!this.stepInput._isInteger(null), "null in not integer");
		assert.ok(!this.stepInput._isInteger(undefined), "undefined is not integer");
		assert.ok(!this.stepInput._isInteger(-2.00000000009), "-2.00000000009 is not integer");
		assert.ok(!this.stepInput._isInteger(-2.99999999999), "-2.99999999999 is not integer");
	});

	QUnit.test("_applyValue()", function (assert) {
		// Prepare & act
		var oSpy = sinon.spy(this.stepInput, "setValue");
		this.stepInput.setEnabled(false);
		this.stepInput._applyValue(7);
		// Assert
		assert.equal(oSpy.callCount, 0, "setValue() is not called after setEnabled(false)");
		assert.strictEqual(this.stepInput.getValue(), 0, "'value' still holds the old value");

		// Act
		this.stepInput.setEnabled(true);
		this.stepInput.setEditable(false);
		this.stepInput._applyValue(8);
		// Assert
		assert.equal(oSpy.callCount, 0, "setValue() is not called after setEditable(false)");
		assert.strictEqual(this.stepInput.getValue(), 0, "'value' still holds the old value");
	});

	QUnit.test("_inputLiveChangeHandler() & _restrictCharsWhenDecimal()", function (assert) {
		//prepare
		var oSpy = sinon.spy(this.stepInput._getInput(), "setProperty"),
			oRestrictSpy = sinon.spy(this.stepInput, "_restrictCharsWhenDecimal"),
			oEvent = {
				getParameter : function () {
					return "1.2345";
				},
				getSource : function () {
					return {
						getProperty : function (){
							return "1.234";
						}
					};
				}
			};

		//act
		this.stepInput.setDisplayValuePrecision(3);
		this.stepInput._inputLiveChangeHandler.call(this.stepInput._getInput(), oEvent);

		//assert
		assert.equal(oSpy.callCount, 2,
				"_inputLiveChangeHandler always calls setProperty(). If the displayValuePrecision is bigger than the characters after the decimal mark - setProperty is called two times");
		assert.equal(oRestrictSpy.callCount, 1,
				"_inputLiveChangeHandler always calls _restrictCharsWhenDecimal");
		assert.strictEqual(oSpy.getCall(0).args[0], "valueState",
				"setProperty is called and it's first parameter is 'valueState'");
		assert.strictEqual(oSpy.getCall(0).args[1], "Error",
				"setProperty is called and it's second parameter is Error");
		assert.strictEqual(oSpy.getCall(0).args[2], true,
				"setProperty is called and it's third parameter is 'true'");
		assert.strictEqual(oSpy.getCall(1).args[0], "value",
				"setProperty is called and it's first parameter is 'value'");
		assert.strictEqual(oSpy.getCall(1).args[1], "1.234",
				"setProperty is called and it's second parameter is 1.234");
		assert.strictEqual(oSpy.getCall(1).args[2], true,
				"setProperty is called and it's third parameter is 'true'");

		//act
		this.stepInput._restrictCharsWhenDecimal(oEvent);

		//assert
		assert.strictEqual(this.stepInput._getInput().$("inner").val(), "1.234",
				"the digits's length is correct - equal to the displayValuePrecision");
	});

	QUnit.test("_showWrongValueVisualEffect() triggers an error state for 1s and set it back to the previous state", function (assert) {
		//act
		this.stepInput._showWrongValueVisualEffect();

		//assert
		assert.strictEqual(this.stepInput._getInput().getValueState(), "Error", "input's valueState is set to Error");
		assert.strictEqual(this.stepInput.getValueState(), "None", "it's only a visual effect");

		//act
		this.clock.tick(1000);

		//assert
		assert.strictEqual(this.stepInput._getInput().getValueState(), "None", "input's valueState is back to None");
	});

	QUnit.test("_iRealPrecision is updated on each value change", function (assert) {
		//Prepare
		var oIncrementButton = this.stepInput._getIncrementButton();
		this.stepInput.setDisplayValuePrecision(2);
		this.stepInput.setStep(0.05); //make sure the precision is different than the one in the value one
		this.stepInput.setValue(1.20);
		sap.ui.getCore().applyChanges();

		//Act
		this.stepInput.setValue(1.567); //make sure the precision is different than the one in the step above
		oIncrementButton.firePress();
		this.clock.tick(100);

		//Assert
		assert.strictEqual(this.stepInput._iRealPrecision, 3, "iRealPrecision for value 1.567 is 3");
		assert.strictEqual(this.stepInput.getValue(), 1.617, "Value is set correctly: 1.567 + 0.05 = 1.617. ");
		assert.strictEqual(this.stepInput.getAggregation("_input")._getInputValue(), "1.62",
			"The input is set and formatted correctly: 1.57 + 0.05 = 1.62.");
	});

	QUnit.test("_sumValues", function (assert) {
		//Act && Assert
		assert.equal(this.stepInput._sumValues(1.1376, 0.2, 1, 4), 1.3376, "sumValues(1.1376, 0.2, 1, 4)=1.3376");
		assert.equal(this.stepInput._sumValues(1.1376, 0.2, -1, 4), 0.9376, "sumValues(1.1376, 0.2, -1, 4)= 0.9376");
		assert.equal(this.stepInput._sumValues(1.1376, 0.2, 1, 3), 1.337, "sumValues(1.1376, 0.2, 1, 3)=1.337");
		assert.equal(this.stepInput._sumValues(1.1376, 0.2, -1, 3), 0.937, "sumValues(1.1376, 0.2, -1, 3)=0.937");
		assert.equal(this.stepInput._sumValues(0.29, 0.01, 1, 2), 0.3, "_sumValues(0.29, 0.01, 1, 2) = 0.3");
	});

	QUnit.test("_disableButtons works accordingly when enabled: false and min & max available", function (assert) {
		this.stepInput.setMin(0).setMax(10).setEnabled(false).setValue(5);
		oCore.applyChanges();

		assert.strictEqual(this.stepInput._getIncrementButton().$().hasClass("sapMStepInputIconDisabled"), true,
			"the increment button is still disabled after setValue");
		assert.strictEqual(this.stepInput._getDecrementButton().$().hasClass("sapMStepInputIconDisabled"), true,
			"the decrement button is still disabled after setValue");
	});

	QUnit.test("_disableButtons works when the enablement of the control is toggled", function (assert) {
		this.stepInput.setValue(5);

		this.stepInput.setEnabled(false);
		oCore.applyChanges();

		this.stepInput.setEnabled(true);
		oCore.applyChanges();

		assert.strictEqual(this.stepInput._getIncrementButton().$().hasClass("sapMStepInputIconDisabled"), false,
			"the increment button is enabled after the StepInput is enabled again");
		assert.strictEqual(this.stepInput._getDecrementButton().$().hasClass("sapMStepInputIconDisabled"), false,
			"the decrement button is enabled after the StepInput is enabled again");
	});

	QUnit.test("_verifyValue does not touch the value", function(assert) {
		// arrange
		this.stepInput.setMin(2);
		this.stepInput.setDisplayValuePrecision(2);
		sap.ui.getCore().applyChanges();

		// act
		this.stepInput._getInput().setValue("1");
		this.stepInput._verifyValue(); // it shouldn't invalidate
		sap.ui.getCore().applyChanges(); // so here should not re-render

		// assert
		assert.strictEqual(this.stepInput._getInput().getValue(), "1", "value has not been touched");
	});

	QUnit.test("_verifyValue respects binding min/max constraints", function(assert) {
		// arrange
		this.stepInput.setModel(new JSONModel({ value: 11 }));
		this.stepInput.bindProperty("value", {
			path: "/value",
			type: new sap.ui.model.type.Float(null, {
				maximum: 10
			})
		});

		// act
		this.stepInput._verifyValue();

		// assert
		assert.strictEqual(this.stepInput._getInput().getValueState(), ValueState.Error, "value state is correct");
		assert.strictEqual(this.stepInput._getInput().getValueStateText(), "Enter a number with a maximum value of 10", "value state text is correct");
	});

	QUnit.test("_verifyValue prefers binding max constraint over max property setting", function(assert) {
		// arrange
		this.stepInput.setMax(13);
		this.stepInput.setModel(new JSONModel({ value: 11 }));
		this.stepInput.bindProperty("value", {
			path: "/value",
			type: new sap.ui.model.type.Float(null, {
				maximum: 10
			})
		});

		// act
		this.stepInput._verifyValue();

		// assert
		assert.strictEqual(this.stepInput._getInput().getValueStateText(), "Enter a number with a maximum value of 10", "value state text is correct");
	});

	QUnit.test("_disableButtons is called with respect of min/max binding constraints", function(assert) {
		// arrange
		var oSpyDisableButtons;

		this.stepInput.setModel(new JSONModel({ value: 9 }));
		this.stepInput.bindProperty("value", {
			path: "/value",
			type: new sap.ui.model.type.Float(null, {
				maximum: 10
			})
		});

		oSpyDisableButtons = this.spy(this.stepInput, "_disableButtons");

		// act
		this.stepInput.setValue(11);

		// assert
		assert.strictEqual(oSpyDisableButtons.getCall(0).args[1], 10,
			"_disableButtons called with the max argument as the maximum binding cnonstraint");
		assert.strictEqual(this.stepInput._getIncrementButton().getEnabled(), false, "increment is disabled");
	});

	QUnit.module("Misc");

	QUnit.test("increment/decrement buttons enabled state", function (assert) {
		// arrange
		var oStepInput = new StepInput({
			value: 5,
			min: 6,
			max: 8
		});
		oStepInput.placeAt('qunit-fixture');
		oCore.applyChanges();

		// assert
		assert.ok(!oStepInput._getDecrementButton().getEnabled(), "Decrease button is disabled when the value is less then the min value");
		// act
		oStepInput.setValue(7);
		// assert
		assert.ok(oStepInput._getDecrementButton().getEnabled(), "Decrease button is not disabled when the value is bigger then the min value and the control is enabled");
		//act
		oStepInput.setValue(6);
		oStepInput.setEnabled(false);
		// assert
		assert.ok(!oStepInput._getDecrementButton().getEnabled(), "Decrease button is disabled when the control is disabled");

		//act
		oStepInput.setEnabled(true);
		// assert
		assert.ok(oStepInput._getIncrementButton().getEnabled(), "Increase button is not disabled when the value is less then the max value and the control is enabled");
		// act
		oStepInput.setValue(9);
		// assert
		assert.ok(!oStepInput._getIncrementButton().getEnabled(), "Increase button is disabled when the value is bigger then the max value");
		//act
		oStepInput.setValue(7);
		oStepInput.setEnabled(false);
		// assert
		assert.ok(!oStepInput._getIncrementButton().getEnabled(), "Increase button is disabled when the control is disabled");

		// clean up
		oStepInput.destroy();
	});

	QUnit.test("setProperty sets the default properties of StepInput to the Input, when the value of the propery is not valid", function (assert) {
		// arrange
		var oStepInput = new StepInput();

		oStepInput.placeAt('qunit-fixture');
		oCore.applyChanges();

		// act
		// set "undefined" alignment
		oStepInput.setTextAlign();
		oCore.applyChanges();

		// assert
		assert.strictEqual(oStepInput._getInput().getTextAlign(), oStepInput.getTextAlign(), "textAlign of the Input should be the same as the textAlign of the StepInput");

		oStepInput.destroy();
	});
});