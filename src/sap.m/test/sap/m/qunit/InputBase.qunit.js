/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/InputBase",
	"sap/ui/core/library",
	"sap/m/Label",
	"sap/ui/thirdparty/jquery",
	"sap/m/Input",
	"sap/m/Button",
	"sap/m/Panel",
	"sap/ui/model/type/String",
	"sap/ui/model/json/JSONModel",
	"sap/m/Text",
	"sap/m/FormattedText",
	"sap/m/Link",
	"sap/m/InputBaseRenderer",
	"sap/ui/Device",
	"sap/ui/base/ManagedObject",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/utils/nextUIUpdate",
	// provides jQuery.fn.cursorPos
	"sap/ui/dom/jquery/cursorPos"
], function(
	Library,
	qutils,
	createAndAppendDiv,
	InputBase,
	coreLibrary,
	Label,
	jQuery,
	Input,
	Button,
	Panel,
	TypeString,
	JSONModel,
	Text,
	FormattedText,
	Link,
	InputBaseRenderer,
	Device,
	ManagedObject,
	KeyCodes,
	nextUIUpdate
) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	createAndAppendDiv("content");


	function runAllTimersAndRestore(oClock) {
		if (!oClock) {
			return;
		}

		oClock.runAll();
		oClock.restore();
	}

	// make jQuery.now work with Sinon fake timers (since jQuery 2.x, jQuery.now caches the native Date.now)
	jQuery.now = function() {
		return Date.now();
	};



	var XSS = "~!@#$%^&*()_+{}:\"|<>?\'\"><script>alert('xss')<\/script>";

	var fnTestControlProperty = function(mOptions) {
		var sProperty = mOptions.property.charAt(0).toUpperCase() + mOptions.property.slice(1);

		QUnit.test("method: get" + sProperty + "()", function(assert) {
			assert.strictEqual(mOptions.control["get" + sProperty](), mOptions.output, mOptions.description);
		});
	};

	/* =========================================================== */
	/* API module                                                  */
	/* =========================================================== */

	QUnit.module("API");

	/* ------------------------------ */
	/* tests for default values       */
	/* ------------------------------ */

	QUnit.test("default values", async function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.strictEqual(oInput.getValue(), "", 'The default value is ""');
		assert.strictEqual(oInput.getWidth(), "", 'The default width is ""');
		assert.strictEqual(oInput.getEnabled(), true, "By default the input field is enabled");
		assert.strictEqual(oInput.getVisible(), true, "By default the input field is visible");
		assert.strictEqual(oInput.getValueState(), "None", 'By default the value state is "None"');
		assert.strictEqual(oInput.getName(), "", 'The default name is ""');
		assert.strictEqual(oInput.getPlaceholder(), "", 'The default placeholder value is ""');
		assert.strictEqual(oInput.getEditable(), true, 'By default the input field is editable');
		assert.strictEqual(oInput.getTooltip(), null);

		// cleanup
		oInput.destroy();
	});

	/* ------------------------------ */
	/* getName()                      */
	/* ------------------------------ */

	fnTestControlProperty({
		control: new InputBase(),
		property: "name",
		output: "",
		description: 'The name is ""'
	});

	fnTestControlProperty({
		control: new InputBase({
			name: "my-input"
		}),
		property: "name",
		output: "my-input",
		description: 'The name is "my-input"'
	});

	/* ------------------------------ */
	/* getVisible()                   */
	/* ------------------------------ */

	fnTestControlProperty({
		control: new InputBase({
			visible: false
		}),
		property: "visible",
		output: false,
		description: "Is not visible"
	});

	fnTestControlProperty({
		control: new InputBase(),
		property: "visible",
		output: true,
		description: "Is visible"
	});

	/* ------------------------------ */
	/* getEnabled()                   */
	/* ------------------------------ */

	fnTestControlProperty({
		control: new InputBase(),
		property: "enabled",
		output: true,
		description: "Is enable"
	});

	fnTestControlProperty({
		control: new InputBase({
			enabled: false
		}),
		property: "enabled",
		output: false,
		description: "Is disabled"
	});

	/* ------------------------------ */
	/* getWidth()                     */
	/* ------------------------------ */

	fnTestControlProperty({
		control: new InputBase({
			width: "50%"
		}),
		property: "width",
		output: "50%",
		description: 'The "width" is "50%"'
	});

	fnTestControlProperty({
		control: new InputBase({
			width: "13rem"
		}),
		property: "width",
		output: "13rem",
		description: 'The "width" is "13rem"'
	});

	fnTestControlProperty({
		control: new InputBase({
			width: "200px"
		}),
		property: "width",
		output: "200px",
		description: 'The "width" is "200px"'
	});

	fnTestControlProperty({
		control: new InputBase({
			width: "4em"
		}),
		property: "width",
		output: "4em",
		description: 'The "width" is "4em"'
	});

	fnTestControlProperty({
		control: new InputBase(),
		property: "width",
		output: "",
		description: 'The "width" is "auto"'
	});

	fnTestControlProperty({
		control: new InputBase({
			width: "2in"
		}),
		property: "width",
		output: "2in",
		description: 'The "width" is "2in"'
	});

	fnTestControlProperty({
		control: new InputBase({
			width: "3cm"
		}),
		property: "width",
		output: "3cm",
		description: 'The "width" is "3cm"'
	});

	fnTestControlProperty({
		control: new InputBase({
			width: "125pt"
		}),
		property: "width",
		output: "125pt",
		description: 'The "width" is "125pt"'
	});

	/* ------------------------------ */
	/* getEditable()                  */
	/* ------------------------------ */

	fnTestControlProperty({
		control: new InputBase(),
		property: "editable",
		output: true,
		description: "Is editable"
	});

	fnTestControlProperty({
		control: new InputBase({
			editable: false
		}),
		property: "editable",
		output: false,
		description: "Is not editable"
	});

	/* ------------------------------ */
	/* getTextAlign()                 */
	/* ------------------------------ */

	fnTestControlProperty({
		control: new InputBase({
		}),
		property: "textAlign",
		output: TextAlign.Initial,
		description: '"textAlign" is "Initial"'
	});

	fnTestControlProperty({
		control: new InputBase({
			textAlign: TextAlign.Left
		}),
		property: "textAlign",
		output: TextAlign.Left,
		description: '"textAlign" is "Left"'
	});

	fnTestControlProperty({
		control: new InputBase({
			textAlign: TextAlign.End
		}),
		property: "textAlign",
		output: TextAlign.End,
		description: '"textAlign" is "End"'
	});

	/* ------------------------------ */
	/* getLabels()                    */
	/* ------------------------------ */

	QUnit.test("it should return an array with one object which is the current target of the ariaLabelledBy association", function(assert) {

		// system under test
		var oLabel = new Label();
		var oInput = new InputBase({
			ariaLabelledBy: [
				oLabel
			]
		});

		// assertions
		assert.strictEqual(oInput.getLabels().length, 1);
		assert.ok(oInput.getLabels()[0] === oLabel);

		// cleanup
		oInput.destroy();
		oLabel.destroy();
	});

	QUnit.test("it should return an array with one object which is the label referencing the text field", function(assert) {

		// system under test
		var oInput = new InputBase();
		var oLabel = new Label({
			labelFor: oInput
		});

		// assertions
		assert.strictEqual(oInput.getLabels().length, 1);
		assert.ok(oInput.getLabels()[0] === oLabel);

		// cleanup
		oInput.destroy();
		oLabel.destroy();
	});

	QUnit.test("it should return an array of objects which are the current targets of the ariaLabelledBy association and the labels referencing the text field", function(assert) {

		// system under test
		var oLabel1 = new Label({
			id: "lorem-ipsum-label",
			labelFor: oInput
		});
		var oInput = new InputBase({
			ariaLabelledBy: [
				"lorem-ipsum-label"
			]
		});
		var oLabel2 = new Label({
			labelFor: oInput
		});

		// assertions
		assert.strictEqual(oInput.getLabels().length, 2);
		assert.ok(oInput.getLabels()[0] === oLabel1);
		assert.ok(oInput.getLabels()[1] === oLabel2);

		// cleanup
		oInput.destroy();
		oLabel1.destroy();
		oLabel2.destroy();
	});

	QUnit.test("attribute aria-required should be set to the input field, when the associate label is required", async function(assert) {
		// Arrange
		var oLabel = new Label({
			id: "lorem-ipsum-label",
			labelFor: "inputRequired",
			required: true
		}).placeAt("content");

		var oInput = new InputBase("inputRequired", {
			ariaLabelledBy: [
				"lorem-ipsum-label"
			]
		}).placeAt("content");
		await nextUIUpdate();

		// Assert
		assert.ok(oInput.getFocusDomRef().getAttribute("aria-required"), "The attribute is set correctly");

		// Act
		oLabel.setRequired(false);
		await nextUIUpdate();

		// Assert
		assert.notOk(oInput.getFocusDomRef().getAttribute("aria-required"), "The attribute is removed");

		// cleanup
		oInput.destroy();
		oLabel.destroy();
	});

	/* ------------------------------ */
	/* setValue()                     */
	/* ------------------------------ */

	var fnSetValueTestCase1 = function(mSettings) {
		QUnit.test("method: setValue() initial rendering", async function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			await nextUIUpdate();

			// assertions
			assert.strictEqual(jQuery(oInput.getFocusDomRef()).val(), mSettings.output);

			// cleanup
			oInput.destroy();
		});
	};

	fnSetValueTestCase1({
		control: new InputBase({
			value: "Input value"
		}),
		output: "Input value"
	});

	fnSetValueTestCase1({
		control: new InputBase({
			value: ""
		}),
		output: ""
	});

	fnSetValueTestCase1({
		control: new InputBase({
			value: ManagedObject.escapeSettingsValue(XSS)
		}),
		output: XSS
	});

	var fnSetValueTestCase2 = function(mSettings) {
		QUnit.test("method: setValue() after the initial rendering", async function(assert) {

			// system under test
			var oInput = mSettings.control;
			var fnSetValueSpy = this.spy(oInput, "setValue");

			// arrange
			oInput.placeAt("content");
			await nextUIUpdate();
			var fnRerenderSpy = this.spy(oInput.getRenderer(), "render");

			// act
			oInput.setValue(mSettings.input);

			// assertions
			assert.strictEqual(jQuery(oInput.getFocusDomRef()).val(), mSettings.output);
			assert.ok(fnSetValueSpy.returned(oInput), "sap.m.InputBase.prototype.setValue() method returns the correct value");
			assert.strictEqual(fnRerenderSpy.callCount, 0, "Input is not rerendered with setValue calls");

			// cleanup
			oInput.destroy();
		});
	};

	fnSetValueTestCase2({
		control: new InputBase(),
		input: "Input value",
		output: "Input value"
	});

	fnSetValueTestCase2({
		control: new InputBase(),
		input: "",
		output: ""
	});

	fnSetValueTestCase2({
		control: new InputBase(),
		input: XSS,
		output: XSS
	});

	QUnit.test("setValue should not update the last value when old and new one is same", function(assert) {
		// system under test
		var sInitValue = "init";
		var sTestValue = "test";
		var oInput = new InputBase({
			value : sInitValue
		});

		// arrange
		var sLastValue = oInput.getLastValue();

		// act as twoway binding does
		oInput.setProperty("value", sTestValue, true);
		oInput.setValue(sTestValue);

		// assertions
		assert.strictEqual(sLastValue, sInitValue, "Last value did not change");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("setValue should update the dom when old and new dom value is not same", async function(assert) {

		// system under test
		var sValue = "test";
		var oInput = new InputBase({
			value : sValue
		});

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();

		// act - set dom value
		oInput.getFocusDomRef().value = sValue + sValue;

		// assertion - before setValue
		assert.notEqual(oInput.getFocusDomRef().value, oInput.getValue(), "Before setValue call dom value and value property are not same.");

		// act - set the same value
		oInput.setValue(sValue);

		// assertion - after setValue
		assert.strictEqual(oInput.getFocusDomRef().value, sValue, "Dom value and value property are same after setValue call.");

		// cleanup
		oInput.destroy();
	});

	/* ------------------------------ */
	/* setWidth()                     */
	/* ------------------------------ */

	var fnSetWidthTestCase1 = function(mSettings) {
		QUnit.test("method: setWidth() initial rendering", async function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			await nextUIUpdate();

			// assertions
			assert.strictEqual(oInput.getDomRef().style.width, mSettings.output);

			// cleanup
			oInput.destroy();
		});
	};

	fnSetWidthTestCase1({
		control: new InputBase({
			width: "200px"
		}),
		output: "200px"
	});

	fnSetWidthTestCase1({
		control: new InputBase({
			width: "100%"
		}),
		output: "100%"
	});

	fnSetWidthTestCase1({
		control: new InputBase({
			width: "auto"
		}),
		output: "auto"
	});

	var fnSetWidthTestCase2 = function(mSettings) {
		QUnit.test("method: setWidth() after initial rendering", async function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			await nextUIUpdate();

			// act
			oInput.setWidth(mSettings.input);
			await nextUIUpdate();

			// assertions
			assert.strictEqual(oInput.getDomRef().style.width, mSettings.output);

			// cleanup
			oInput.destroy();
		});
	};

	fnSetWidthTestCase2({
		control: new InputBase(),
		input: "200px",
		output: "200px"
	});

	fnSetWidthTestCase2({
		control: new InputBase(),
		input: "100%",
		output: "100%"
	});

	fnSetWidthTestCase2({
		control: new InputBase(),
		input: "auto",
		output: "auto"
	});

	/* ------------------------------ */
	/* setEnabled()                   */
	/* ------------------------------ */

	QUnit.test("method: setEnabled() initial rendering test case 1", async function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();

		// act
		oInput.setEnabled(false);
		await nextUIUpdate();

		// assertions
		assert.ok(oInput.$().hasClass("sapMInputBaseDisabled"), 'If the input is disabled, it should have the CSS class "sapMInputBaseDisabled"');
		assert.strictEqual(oInput.getFocusDomRef().getAttribute("disabled"), "disabled");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("method: setEnabled() test case 2", async function(assert) {

		// system under test
		var oInput = new InputBase({
			enabled: false
		});

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.ok(oInput.$().hasClass("sapMInputBaseDisabled"), 'If the input is disabled, it should have the CSS class "sapMInputBaseDisabled"');
		assert.strictEqual(oInput.getFocusDomRef().getAttribute("disabled"), "disabled");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("method: setEnabled() test case 3", async function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.strictEqual(jQuery(oInput.getFocusDomRef()).attr("disabled"), undefined);

		// cleanup
		oInput.destroy();
	});

	/* ------------------------------ */
	/* setValueState()                */
	/* ------------------------------ */

	var fnSetValueStateTestCase1 = function(mSettings) {
		QUnit.test("method: setValueState() initial rendering", async function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			await nextUIUpdate();

			// assertions
			assert.ok(oInput.$("content").hasClass(mSettings.output));

			// cleanup
			oInput.destroy();
		});
	};

	fnSetValueStateTestCase1({
		control: new InputBase({
			valueState: ValueState.Error
		}),
		output: "sapMInputBaseContentWrapperError"
	});

	fnSetValueStateTestCase1({
		control: new InputBase({
			valueState: ValueState.Warning
		}),
		output: "sapMInputBaseContentWrapperWarning"
	});

	fnSetValueStateTestCase1({
		control: new InputBase({
			valueState: ValueState.Success
		}),
		output: "sapMInputBaseContentWrapperSuccess"
	});

	fnSetValueStateTestCase1({
		control: new InputBase({
			valueState: ValueState.Information
		}),
		output: "sapMInputBaseContentWrapperInformation"
	});

	fnSetValueStateTestCase1({
		control: new InputBase({
			valueState: ValueState.Error
		}),
		output: "sapMInputBaseContentWrapperState"
	});

	var fnSetValueStateTestCase2 = function(mSettings) {
		QUnit.test("method: setValueState() after initial rendering", async function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			await nextUIUpdate();

			// act
			oInput.setValueState(mSettings.input);
			await nextUIUpdate();

			// assertions
			assert.ok(oInput.$("content").hasClass(mSettings.output), "Input should have the class " + mSettings.output);

			// cleanup
			oInput.destroy();
		});
	};

	fnSetValueStateTestCase2({
		control: new InputBase(),
		input: ValueState.Error,
		output: "sapMInputBaseContentWrapperError"
	});

	fnSetValueStateTestCase2({
		control: new InputBase(),
		input: ValueState.Warning,
		output: "sapMInputBaseContentWrapperWarning"
	});

	fnSetValueStateTestCase2({
		control: new InputBase(),
		input: ValueState.Success,
		output: "sapMInputBaseContentWrapperSuccess"
	});

	QUnit.test("method: setValueState() invalid values", async function(assert) {
		var oInput = new InputBase({
			valueState : null
		}).placeAt("content");
		await nextUIUpdate();

		assert.strictEqual(oInput.getValueState(), ValueState.None, "Invalid value state before rendering is converted to default value.");

		oInput.setValueState(ValueState.Error);
		await nextUIUpdate();

		assert.ok(oInput.$("content").hasClass("sapMInputBaseContentWrapperError"), "Input has the state class before testing the invalid value.");

		oInput.setValueState(undefined);
		await nextUIUpdate();

		assert.strictEqual(oInput.getValueState(), ValueState.None, "Invalid value state is converted to default value.");
		assert.ok(!oInput.$().hasClass("sapMInputBaseState"), "Input's state class is removed after setting the invalid value");

		oInput.destroy();
	});

	QUnit.test("valueState with editable and enabled", async function(assert) {
		// system under test
		var oInput = new InputBase({
			valueState: ValueState.Information,
			editable: false
		});

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();

		// assert
		assert.notOk(oInput.getDomRef("content").classList.contains("sapMInputBaseContentWrapperInformation"));

		// act
		oInput.setEditable(true);
		await nextUIUpdate();

		// assert
		assert.ok(oInput.getDomRef("content").classList.contains("sapMInputBaseContentWrapperInformation"));

		// act
		oInput.setEnabled(false);
		await nextUIUpdate();

		// assert
		assert.notOk(oInput.getDomRef("content").classList.contains("sapMInputBaseContentWrapperInformation"));

		// cleanup
		oInput.destroy();
	});

	QUnit.test("valueState Message popup should be opened on tap", async function(assert) {
		this.clock = sinon.useFakeTimers();

		// system under test
		var oInput = new InputBase({
			valueState: ValueState.Information
		});

		oInput.placeAt("content");
		await nextUIUpdate(this.clock);
		oInput.ontap();

		this.clock.tick(300);
		assert.ok(document.getElementById(oInput.getValueStateMessageId()), "ValueState Message is shown on tap");

		oInput.destroy();
		runAllTimersAndRestore(this.clock);
	});

	/* ------------------------------ */
	/* setName()                      */
	/* ------------------------------ */

	QUnit.test("method: setName() initial rendering", async function(assert) {

		// system under test
		var oInput = new InputBase({
			name: "myInput"
		});

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.strictEqual(jQuery(oInput.getFocusDomRef()).attr("name"), "myInput", 'The attribute name is "myInput"');

		// cleanup
		oInput.destroy();
	});

	QUnit.test("method: setName() after initial rendering", async function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();

		// act
		oInput.setName("myInput");
		await nextUIUpdate();

		// assertions
		assert.strictEqual(jQuery(oInput.getFocusDomRef()).attr("name"), "myInput", 'The attribute name is "myInput"');

		// cleanup
		oInput.destroy();
	});

	/* ------------------------------ */
	/* setPlaceholder()               */
	/* ------------------------------ */

	var fnSetPlaceholderTestCase2 = function(mSettings) {
		QUnit.test("method: setPlaceholder() after initial rendering", async function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			await nextUIUpdate();

			// act
			oInput.setPlaceholder(mSettings.input);
			await nextUIUpdate();

			// assertions
			assert.strictEqual(jQuery(oInput.getFocusDomRef()).attr("placeholder") || "", mSettings.output);

			// cleanup
			oInput.destroy();
		});
	};

	fnSetPlaceholderTestCase2({
		control: new InputBase(),
		input: "Input placeholder",
		output: "Input placeholder"
	});

	fnSetPlaceholderTestCase2({
		control: new InputBase(),
		input: "",
		output: ""
	});

	fnSetPlaceholderTestCase2({
		control: new InputBase(),
		input: XSS,
		output: XSS
	});


	/* ------------------------------ */
	/* setEditable()                  */
	/* ------------------------------ */

	var fnSetEditableTestCase1 = function(mSettings) {
		QUnit.test("method: setEditable() initial rendering", async function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			await nextUIUpdate();

			// assertions
			assert.strictEqual(jQuery(oInput.getFocusDomRef()).attr("readonly"), mSettings.output);

			// cleanup
			oInput.destroy();
		});
	};

	fnSetEditableTestCase1({
		control: new InputBase({
			editable: true
		}),
		output: undefined
	});

	fnSetEditableTestCase1({
		control: new InputBase({
			editable: false
		}),
		output: "readonly"
	});

	var fnSetEditableTestCase2 = function(mSettings) {
		QUnit.test("method: setEditable() after the initial rendering", async function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			await nextUIUpdate();

			// act
			oInput.setEditable(mSettings.input);
			await nextUIUpdate();

			// assertions
			assert.strictEqual(jQuery(oInput.getFocusDomRef()).attr("readonly"), mSettings.output);

			// cleanup
			oInput.destroy();
		});
	};

	fnSetEditableTestCase2({
		control: new InputBase(),
		input: true,
		output: undefined
	});

	fnSetEditableTestCase2({
		control: new InputBase(),
		input: false,
		output: "readonly"
	});

	/* ------------------------------ */
	/* setVisible()                   */
	/* ------------------------------ */

	QUnit.test("method: setVisible() initial rendering", async function(assert) {

		// system under test
		var oInput = new InputBase({
			visible: false
		});

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.strictEqual(oInput.$().length, 0);

		// cleanup
		oInput.destroy();
	});

	/* ------------------------------ */
	/* setTextAlign()                 */
	/* ------------------------------ */

	var fnSetTextAlignTestCase1 = function(mSettings) {
		QUnit.test("method: setTextAlign() initial rendering", async function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			await nextUIUpdate();

			// assertions
			assert.strictEqual(oInput.getFocusDomRef().style.textAlign, mSettings.output);

			// cleanup
			oInput.destroy();
		});
	};

	fnSetTextAlignTestCase1({
		control: new InputBase({
			textAlign: TextAlign.Begin
		}),
		output: "left"
	});

	fnSetTextAlignTestCase1({
		control: new InputBase({
			textAlign: TextAlign.Initial
		}),
		output: ""
	});

	var fnSetTextAlignTestCase2 = function(mSettings) {
		QUnit.test("method: setTextAlign() after the initial rendering", async function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			await nextUIUpdate();

			// act
			oInput.setTextAlign(mSettings.input);
			await nextUIUpdate();

			// assertions
			assert.strictEqual(oInput.getFocusDomRef().style.textAlign, mSettings.output);

			// cleanup
			oInput.destroy();
		});
	};

	fnSetTextAlignTestCase2({
		control: new InputBase(),
		input: TextAlign.End,
		output: "right"
	});

	fnSetTextAlignTestCase2({
		control: new InputBase({textAlign: TextAlign.End}),
		input: TextAlign.Initial,
		output: ""
	});

	/* ------------------------------ */
	/* destroy()                      */
	/* ------------------------------ */

	QUnit.test("method: destroy()", async function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();

		// act
		oInput.destroy();

		// assertions
		assert.strictEqual(oInput.$().length, 0);

		// cleanup
		oInput.destroy();
	});

	/* ------------------------------------- */
	/* valus state and valus state message() */
	/* ------------------------------------- */

	QUnit.test("it should open or close the value state message popup when the input gets or losses the focus event", async function(assert) {
		this.clock = sinon.useFakeTimers();

		// system under test
		var oErrorInput = new InputBase("errorinput", {
			value: "Error InputBase Test",
			valueState: "Error",
			valueStateText: "Error Message"
		});

		var oWarningInput = new InputBase("warninginput",{
			value: "Warning InputBase Test",
			valueState: "Warning",
			valueStateText: "Warning Message"
		});

		var fnSetErrorAnnounceSpy  = this.spy(oErrorInput, "setErrorMessageAnnouncementState");

		// arrange
		oErrorInput.placeAt("content");
		oWarningInput.placeAt("content");
		await nextUIUpdate(this.clock);
		oErrorInput.focus();
		this.clock.tick(500);

		// assert
		assert.ok(fnSetErrorAnnounceSpy.calledWith, false,
			"The error annoucement state should not be changed, when the control is on focus but no dynamic changes in the value state are made");
		assert.ok(document.getElementById("errorinput-message"), "error message popup is open on focusin");
		assert.equal(oErrorInput.getValueStateText(), "Error Message", "error message is correct");

		oErrorInput.getFocusDomRef().blur();
		this.clock.tick();

		assert.ok(!document.getElementById("errorinput-message"), "error message popup is closed when focus is out");

		oWarningInput.focus();
		this.clock.tick(500);
		assert.ok(document.getElementById("warninginput-message"), "warning message popup is open when focusin");
		assert.equal(oWarningInput.getValueStateText(), "Warning Message", "warning message is correct");

		oWarningInput.getFocusDomRef().blur();
		this.clock.tick();

		assert.ok(!document.getElementById("warninginput-message"), "warning message popup is closed when focus is out");

		oErrorInput.setShowValueStateMessage(false);
		await nextUIUpdate(this.clock);
		oErrorInput.focus();
		this.clock.tick(500);
		assert.ok(!document.getElementById("errorinput-message"), "no error message popup if showValueStateMessage is set to false");

		// cleanup
		fnSetErrorAnnounceSpy.restore();
		oErrorInput.destroy();
		oWarningInput.destroy();
		runAllTimersAndRestore(this.clock);
	});

	QUnit.test("it should update the value state message accordingly", async function(assert) {
		this.clock = sinon.useFakeTimers();
		var oCoreRB = Library.getResourceBundleFor("sap.ui.core"),
				oValueStateInput = new Input("vsinput", {
					placeholder: "value state changes while you are typing",
					liveChange: () => {
						var i = oValueStateInput.getValue().length;

						switch (i % 5) {
							case 1:
								oValueStateInput.setValueState("Warning");
								break;

							case 2:
								oValueStateInput.setValueState("Success");
								break;

							case 3:
								oValueStateInput.setValueState("Error");
								break;

							case 4:
								oValueStateInput.setValueState("Information");
								break;

							default: // 0
								oValueStateInput.setValueState("None");
								break;

						}
					}
				});

		var fnSetErrorAnnounceSpy  = this.spy(oValueStateInput, "setErrorMessageAnnouncementState");
		oValueStateInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// warning state
		oValueStateInput.updateDomValue("1").focus();
		qutils.triggerEvent("input", oValueStateInput.getFocusDomRef());
		await nextUIUpdate(this.clock);
		this.clock.runToLast();

		assert.ok(fnSetErrorAnnounceSpy.calledWith, false,
			"The error announcement state should not be changed, when the value state is not Error");
		assert.strictEqual(oValueStateInput.getValueState(), "Warning");
		assert.ok(document.getElementById("vsinput-message"), "warning message popup is open");
		assert.strictEqual(jQuery("#vsinput-message-text").text(), oCoreRB.getText("VALUE_STATE_WARNING"));
		assert.strictEqual(jQuery("#vsinput-message").text(), oCoreRB.getText("VALUE_STATE_WARNING"));

		// success state
		oValueStateInput.updateDomValue("12");
		qutils.triggerEvent("input", oValueStateInput.getFocusDomRef());
		await nextUIUpdate(this.clock);
		this.clock.runToLast();

		assert.strictEqual(oValueStateInput.getValueState(), "Success");
		assert.ok(document.getElementById("vsinput-message"), "Success message popup is open");
		assert.ok(jQuery("#vsinput-message").hasClass("sapUiInvisibleText"), "Success message popup is not visible");

		// error state
		oValueStateInput.updateDomValue("123");
		qutils.triggerEvent("input", oValueStateInput.getFocusDomRef());
		await nextUIUpdate(this.clock);
		this.clock.runToLast();

		assert.ok(fnSetErrorAnnounceSpy.calledWith, true,
			"The error annoucement state should be changed, when the control is on focus and there are dynamic changes");
		assert.strictEqual(oValueStateInput.getValueState(), "Error");
		assert.ok(document.getElementById("vsinput-message"), "error message popup is open");
		assert.strictEqual(jQuery("#vsinput-message-text").text(), oCoreRB.getText("VALUE_STATE_ERROR"));
		assert.strictEqual(jQuery("#vsinput-message").text(), oCoreRB.getText("VALUE_STATE_ERROR"));

		// information state
		oValueStateInput.updateDomValue("1234");
		qutils.triggerEvent("input", oValueStateInput.getFocusDomRef());
		await nextUIUpdate(this.clock);
		this.clock.runToLast();

		assert.strictEqual(oValueStateInput.getValueState(), "Information");
		assert.ok(document.getElementById("vsinput-message"), "Information message popup is open");
		assert.strictEqual(jQuery("#vsinput-message-text").text(), oCoreRB.getText("VALUE_STATE_INFORMATION"));
		assert.strictEqual(jQuery("#vsinput-message").text(), oCoreRB.getText("VALUE_STATE_INFORMATION"));

		// none state
		oValueStateInput.updateDomValue("12345");
		qutils.triggerEvent("input", oValueStateInput.getFocusDomRef());
		await nextUIUpdate(this.clock);
		this.clock.runToLast();

		assert.strictEqual(oValueStateInput.getValueState(), "None");
		assert.ok(!document.getElementById("vsinput-message"), "no message popup");

		// cleanup
		fnSetErrorAnnounceSpy.restore();
		oValueStateInput.destroy();

		runAllTimersAndRestore(this.clock);
	});

	/* =========================================================== */
	/* Text direction module                                       */
	/* =========================================================== */

	QUnit.module("Text direction");

	QUnit.test("textDirection set to RTL", async function(assert) {

		var oInput = new InputBase({
			placeholder: "Text direction set to RTL",
			textDirection: TextDirection.RTL
		});

		oInput.placeAt("content");
		await nextUIUpdate();

		assert.strictEqual(jQuery(oInput.getFocusDomRef()).attr("dir"), "rtl");

		oInput.destroy();

	});

	QUnit.test("textDirection set to LTR", async function(assert) {

		var oInput = new InputBase({
			placeholder: "Text direction set to LTR",
			textDirection: TextDirection.LTR
		});

		oInput.placeAt("content");
		await nextUIUpdate();

		assert.strictEqual(jQuery(oInput.getFocusDomRef()).attr("dir"), "ltr");

		oInput.destroy();

	});

	QUnit.test("textDirection set to RTL and textAlign set to BEGIN", async function(assert) {

		var oInput = new InputBase({
			placeholder: "Text direction set to RTL",
			textDirection: TextDirection.RTL,
			textAlign: TextAlign.Begin
		});

		oInput.placeAt("content");
		await nextUIUpdate();

		var $Input = jQuery(oInput.getFocusDomRef());

		assert.strictEqual($Input.attr("dir"), "rtl", "Dir attribute is set to rtl");
		assert.strictEqual($Input.css("text-align"), "right", "Text align style is shifted to right");

		oInput.destroy();

	});

	QUnit.test("textDirection set to LTR and textAlign set to END", async function(assert) {

		var oInput = new InputBase({
			placeholder: "Text direction set to LTR",
			textDirection: TextDirection.LTR,
			textAlign: TextAlign.End
		});

		oInput.placeAt("content");
		await nextUIUpdate();

		var $Input = jQuery(oInput.getFocusDomRef());

		assert.strictEqual($Input.attr("dir"), "ltr", "Dir attribute is set to ltr");
		assert.strictEqual($Input.css("text-align"), "right", "Text align style is shifted to right");

		oInput.destroy();

	});

	/* =========================================================== */
	/* Events module                                               */
	/* =========================================================== */

	QUnit.module("Events");

	QUnit.test("method: change() event", async function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();
		var fnFireChangeSpy = this.spy(oInput, "fireChange");

		// act
		qutils.triggerCharacterInput(oInput.getFocusDomRef(), "a");
		oInput.onChange();

		// assertions
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event is fired");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("it should prevent the change event from being fired", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var InputSubclass = InputBase.extend("InputSubclass", {
			renderer: {},
			preventChangeOnFocusLeave: function() {
				return true;
			}
		});

		var oInput = new InputSubclass();

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate(this.clock);
		oInput.focus();
		var fnFireChangeSpy = this.spy(oInput, "fireChange");
		qutils.triggerCharacterInput(oInput.getFocusDomRef(), "a");

		// act
		oInput.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assertions
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event should not be fired");

		// cleanup
		oInput.destroy();
		delete window.InputSubclass;
		runAllTimersAndRestore(this.clock);
	});

	QUnit.test("onChange should pass in additional parameters to the change event handler", async function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();
		oInput.focus();
		var fnFireChangeSpy = this.spy(oInput, "fireChange");
		qutils.triggerCharacterInput(oInput.getFocusDomRef(), "bar");

		// act
		oInput.onChange(null, {
			parameter1: true,
			parameter2: false
		});

		// assertions
		assert.strictEqual(fnFireChangeSpy.args[0][0].parameter1, true);
		assert.strictEqual(fnFireChangeSpy.args[0][0].parameter2, false);

		// cleanup
		oInput.destroy();
	});

	QUnit.test("onChange should pass in additional parameters to the change event handle", async function(assert) {
		this.clock = sinon.useFakeTimers();
		// system under test
		var InputSubclass = InputBase.extend("InputSubclass", {
			renderer: {}
		});

		InputSubclass.prototype.getChangeEventParams = function() {
			return {
				parameter1: false,
				parameter2: true
			};
		};

		var oInput = new InputSubclass();

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate(this.clock);
		oInput.focus();
		var fnFireChangeSpy = this.spy(oInput, "fireChange");
		qutils.triggerCharacterInput(oInput.getFocusDomRef(), "a");

		// act
		oInput.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assertions
		assert.strictEqual(fnFireChangeSpy.args[0][0].parameter1, false);
		assert.strictEqual(fnFireChangeSpy.args[0][0].parameter2, true);

		// cleanup
		oInput.destroy();
		delete window.InputSubclass;
		runAllTimersAndRestore(this.clock);
	});

	QUnit.test("onChange handler should fire the change event when last known and dom value are not same", async function(assert) {
		// system under test
		var sInitValue = "Test";
		var oInput = new InputBase({
			value : sInitValue
		});

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();
		var oInputDomRef = oInput.getFocusDomRef();
		var fnFireChangeSpy = this.spy(oInput, "fireChange");

		// act
		qutils.triggerKeydown(oInputDomRef, "ENTER");

		// assertion
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "Change event is not fired because initial value and dom value are same.");

		// change dom and cursor pos
		qutils.triggerCharacterInput(oInputDomRef, "a");

		// act
		qutils.triggerKeydown(oInputDomRef, "ENTER");

		// assertion
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "Change event is fired because last known value and dom value are not same.");

		// reset spy
		fnFireChangeSpy.resetHistory();

		// retest after change event is fired
		oInputDomRef.blur();

		// assertion
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "Change event is not fired again because last known value and dom value are same");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("onChange it should fire the change event sync", async function(assert) {

		// system under test
		var sExpectedValue = "lorem ipsum";
		var oInput = new InputBase();
		var oButton = new Button({
			text: "button"
		});

		// arrange
		oInput.placeAt("content");
		oButton.placeAt("content");
		await nextUIUpdate();
		oInput.focus();
		oInput.getFocusDomRef().value = sExpectedValue;
		var fnFireChangeSpy = this.spy(oInput, "fireChange");

		// act
		oButton.focus();

		// assert
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event is fired sync');
		assert.strictEqual(oInput.getValue(), sExpectedValue);
		assert.strictEqual(oInput.getProperty("value"), sExpectedValue);

		// cleanup
		oInput.destroy();
		oButton.destroy();
	});

	QUnit.test("escape should return the last known value and fire private liveChange event", async function(assert) {

		// system under test
		var sInitValue = "Test";
		var sNewValue = "SomethingThatIsNotSameWithTheInitialValue";

		var oInput = new InputBase({
			value : sInitValue
		});

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();
		var fnFireEventSpy = this.spy(oInput, "fireEvent");
		var fnOnEscapeSpy = this.spy(oInput, "onsapescape");

		// act - set dom value
		oInput.getFocusDomRef().value = sNewValue;

		// assertion - before escape
		assert.notEqual(oInput.getFocusDomRef().value, oInput.getValue(), "Before escape call dom value and value property are not same.");

		// act
		qutils.triggerKeydown(oInput.getFocusDomRef(), "ESCAPE");

		// assertion - after escape
		assert.strictEqual(oInput.getValue(), sInitValue, "Input value is returned to the inital value after escape.");
		assert.strictEqual(oInput.getFocusDomRef().value, oInput.getValue(), "Dom value and value property are same after escape.");
		assert.ok(fnFireEventSpy.calledWith("liveChange"), "Private liveChange event is fired on escape");

		// assertion - properties of liveChange event when escape is pressed
		assert.ok(fnFireEventSpy.calledWith("liveChange", sinon.match.has("escPressed", true)), "LiveChange event contains property 'escPressed' with value true.");
		assert.ok(fnFireEventSpy.calledWith("liveChange", sinon.match.has("previousValue", sNewValue)), "LiveChange event contains property 'previousValue' with value of inserted text before escape.");
		assert.ok(fnFireEventSpy.calledWith("liveChange", sinon.match.has("value", sInitValue)), "LiveChange event contains property 'value' with value of initial text.");

		assert.strictEqual(fnFireEventSpy.callCount, 1, "LiveChange event is fired once");
		assert.ok(fnOnEscapeSpy.args[0][0].isMarked(), "Escape is marked as handled");

		// reset spy
		fnFireEventSpy.resetHistory();

		// retest while dom and value property are same
		qutils.triggerKeydown(oInput.getFocusDomRef(), "ESCAPE");

		// assertion - after 2nd escape
		assert.strictEqual(fnFireEventSpy.callCount, 0, "LiveChange event is not fired again because dom and value property are same.");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("input event delegate should be fired in IE9 when CUT / DELETE / BACKSPACE is hit", async function(assert) {// TODO remove after the end of support for Internet Explorer

		// system under test
		var oInput = new InputBase({
			placeholder : "Test"
		});

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();
		var oInputDomRef = oInput.getFocusDomRef();
		var fnInputDelegateSpy = this.spy();
		var oInputDelegate = {
			oninput : fnInputDelegateSpy
		};

		// do it twice to test 2nd addEventDelegate removes the previous delegate
		oInput.addEventDelegate(oInputDelegate).addEventDelegate(oInputDelegate);

		// act
		oInputDomRef.focus();
		qutils.triggerCharacterInput(oInputDomRef, "a");
		qutils.triggerEvent("input", oInputDomRef);

		// assertion
		assert.strictEqual(fnInputDelegateSpy.callCount, 1, "input event delegate is called with character input");
		fnInputDelegateSpy.resetHistory();

		// cleanup
		oInput.destroy();
	});

	QUnit.test("opening value state message popup in IE should be canceled on control destruction", async function(assert) {// TODO remove after the end of support for Internet Explorer
		this.clock = sinon.useFakeTimers();
		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate(this.clock);

		// act
		try {
			oInput.focus();
			oInput.setValueState("Error");
			oInput.destroy();
			this.clock.tick(500);
		} catch (vError) {
			assert.ok(false, "some error happened after destroying the control");
			throw vError;
		}

		// assertion
		assert.ok(true, "opening the message popup is canceled");

		runAllTimersAndRestore(this.clock);
	});

	QUnit.test("onkeydown preventDefault handling", async function(assert) {// TODO remove after the end of support for Internet Explorer
		// system under test
		var oInput = new InputBase().placeAt("content"),
			oSpy = this.spy(),
			oFakeEvent = {
				preventDefault: oSpy,
				keyCode: KeyCodes.BACKSPACE
			},
			oStub = sinon.stub(oInput, "getDomRef").returns(undefined);

		await nextUIUpdate();

		try {
			// act
			oInput.onkeydown(oFakeEvent);
			// assertion
			assert.ok(true, "onkeydown() should not throw if no DOM reference is present");
		} catch (vError) {
			// assertion
			assert.ok(false, "onkeydown() should not throw if no DOM reference is present");
		} finally {
			// clean
			oStub.restore();
			oInput.destroy();
		}
	});

	/* =========================================================== */
	/* Focus And Cursor Position Module                            */
	/* =========================================================== */
	QUnit.module("FocusAndCursorPosition");

	QUnit.test("getFocusDomRef should point the input field", async function(assert) {
		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();

		// assertion - before escape
		assert.strictEqual(oInput.getFocusDomRef(), oInput.$().find("input")[0], "getFocusDomRef returns the input field.");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("onAfterRendering cursor position and dom values should set to the last known values", async function(assert) {
		// system under test
		var sTestValue = "Test";
		var sTestCurPos = sTestValue.length / 2;
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();
		var fnFireChangeSpy = this.spy(oInput, "fireChange");

		// act - set dom value and change cursor position
		oInput.focus();
		oInput.updateDomValue(sTestValue);
		jQuery(oInput.getFocusDomRef()).cursorPos(sTestCurPos);

		// invalidate the control after dom value changes
		oInput.setPlaceholder("placeholder");
		await nextUIUpdate();

		// assertions
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "Change event should not be fired during the rendering");

		// in test environment focus can leave the test page
		if (document.activeElement === oInput.getFocusDomRef() && !Device.browser.safari) {
			assert.strictEqual(jQuery(oInput.getFocusDomRef()).cursorPos(), sTestCurPos, "Cursor position reverted to the last know position after rendering.");
		}

		// cleanup
		oInput.destroy();
	});


	QUnit.test("onAfterRendering last dom value should not be reverted when setProperty('value', ..) is called", async function(assert) {
		// system under test
		var sTestValue = "Test";
		var sInitValue = "Initial";
		var sDomValue = "DomValue";
		var sTestCurPos = sTestValue.length / 2;
		var oInput = new InputBase({
			value : sInitValue
		});

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();

		// act - set dom value and set value property and change cursor position
		oInput.focus();
		oInput.updateDomValue(sDomValue);
		oInput.setProperty("value", sTestValue, true);
		jQuery(oInput.getFocusDomRef()).cursorPos(sTestCurPos);

		// invalidate the control after dom and property value changes
		oInput.setPlaceholder("placeholder");
		await nextUIUpdate();

		// assertion
		assert.strictEqual(jQuery(oInput.getFocusDomRef()).val(), sTestValue, "InputBase respected setProperty value call and did not revert the dom value.");

		// in test environment focus can leave the test page
		if (document.activeElement === oInput.getFocusDomRef() && !Device.browser.safari) { // Safari has issues with the cursor when the page is not "manually" focused
			assert.strictEqual(jQuery(oInput.getFocusDomRef()).cursorPos(), sTestCurPos, "Cursor position reverted to the last know position after rendering.");
		}

		// cleanup
		oInput.destroy();
	});


	QUnit.test("getFocusInfo and applyFocusInfo", async function(assert) {
		// system under test
		var sInitValue = "Test";
		var oInput = new InputBase({
			value : sInitValue
		});

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();
		var $Input = jQuery(oInput.getFocusDomRef());

		// act - get focus info and change cursor position of the dom element
		var oFocusInfo = oInput.getFocusInfo();
		oInput.updateDomValue("SomethingThatIsNotSameWithTheInitialValue");
		$Input.cursorPos(10);

		// act - reapply last known focus info
		oInput.applyFocusInfo(oFocusInfo);

		// assertion
		assert.strictEqual($Input.cursorPos(), oFocusInfo.cursorPos, "Cursor position is set to the correct position after apply focus.");

		// cleanup
		oInput.destroy();
	});

	// BCP 1570778270
	QUnit.test("it should correctly restore the value in case of invalidation", async function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		var sValue = "Lorem Ipsum";
		oInput.placeAt("content");
		await nextUIUpdate();
		oInput.focus();

		// act
		oInput.updateDomValue(sValue);
		oInput.setVisible(false);
		await nextUIUpdate();
		oInput.setVisible(true);
		await nextUIUpdate();

		// assert
		assert.strictEqual(oInput.getFocusDomRef().value, sValue);

		// cleanup
		oInput.destroy();
	});

	QUnit.test("getPopupAnchorDomRef should return the control's DOM reference", async function(assert) {
		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();

		// assertion - before escape
		assert.strictEqual(oInput.getPopupAnchorDomRef(), oInput.$()[0], "getFocusDomRef returns the control's DOM reference.");

		// cleanup
		oInput.destroy();
	});

	QUnit.module("TwowayBindingAndFormatters");
	QUnit.test("formatters should be applied for two-way binding formatters", async function(assert) {
		// custom formatter
		function smile(sValue) {
			return sValue + " :)";
		}

		var TypeSmile = TypeString.extend("my.model.types.Smile", {
			formatValue: smile
		});

		// model
		var sInitValue = "init";
		var sTestValue = "test";
		var oModel = new JSONModel({
			value : sInitValue
		});

		// arrange
		var oInput = new InputBase({
			value:{
				path: "/value",
				type: new TypeSmile()
			}
		});
		oInput.setModel(oModel);
		oInput.placeAt("content");
		await nextUIUpdate();

		// assertion
		assert.strictEqual(oInput.getValue(), smile(sInitValue), "Initial formatter is applied correctly");

		// in test enviroment focus can leave the test page
		if (document.activeElement != oInput.getFocusDomRef()) {
			return oInput.destroy();
		}

		// act
		oInput.getFocusDomRef().focus();
		oInput.updateDomValue(sTestValue);
		oInput.getFocusDomRef().blur();

		// assertion
		assert.strictEqual(oInput.getValue(), smile(sTestValue), "Test value formatter is applied correctly on change");

		// set the value again to check last value is correct
		oInput.getFocusDomRef().focus();
		oInput.updateDomValue(sTestValue);
		oInput.getFocusDomRef().blur();

		// assertion
		assert.strictEqual(oInput.getValue(), smile(sTestValue), "Test value formatter is applied correctly on change again");

		// cleanup
		oInput.destroy();
	});

	QUnit.module("Accessibility");
	QUnit.test("DOM aria properties", async function(assert) {

		var oInput = new InputBase().placeAt("content");
		var fnSetErrorAnnounceSpy  = this.spy(oInput, "setErrorMessageAnnouncementState");

		await nextUIUpdate();

		var $Input = jQuery(oInput.getFocusDomRef());
		assert.strictEqual($Input.attr("role"), "textbox", "Textbox role set correctly");
		assert.strictEqual($Input.attr("aria-invalid"), undefined, "No aria-invalid set for valueState=None");
		assert.strictEqual($Input.attr("readonly"), undefined, "No readonly attribute set for editable=true");
		assert.strictEqual($Input.attr("disabled"), undefined, "No disabled attribute set for enabled=true");
		assert.strictEqual($Input.attr("aria-labelledby"), undefined, "No aria-labelledby set by default");

		oInput.setValueState(ValueState.Warning);
		await nextUIUpdate();

		assert.ok(fnSetErrorAnnounceSpy.calledWith, false,
			"The error announcement state should not be changed, when the value state is not Error");
		assert.strictEqual($Input.attr("aria-invalid"), undefined, "valueState=Warning does not make control invalid");

		oInput.setValueState(ValueState.Success);
		await nextUIUpdate();

		assert.strictEqual($Input.attr("aria-invalid"), undefined, "valueState=Success does not make control invalid");

		oInput.setValueState(ValueState.Information);
		await nextUIUpdate();

		assert.strictEqual($Input.attr("aria-invalid"), undefined, "valueState=Information does not make control invalid");

		oInput.setValueState(ValueState.Error);
		await nextUIUpdate();

		assert.ok(fnSetErrorAnnounceSpy.calledWith, false,
			"The error announcement state should not be changed, when the control is not focused");
		assert.strictEqual($Input.attr("aria-invalid"), "true", "valueState=Error makes control invalid");

		oInput.focus();
		oInput.setValueState(ValueState.Error);
		await nextUIUpdate();

		assert.ok(fnSetErrorAnnounceSpy.calledWith, true,
			"The error annoucement state should be changed, when the control is on focus and there are dynamic changes");
		assert.strictEqual($Input.attr("aria-invalid"), "true", "valueState=Error makes control invalid");

		oInput.invalidate();
		await nextUIUpdate();
		$Input = jQuery(oInput.getFocusDomRef());
		assert.strictEqual($Input.attr("aria-invalid"), "true", "valueState=Error is at the dom after rendering");

		oInput.setEditable(false);
		await nextUIUpdate();
		$Input = jQuery(oInput.getFocusDomRef());
		assert.strictEqual($Input.attr("readonly"), "readonly", "readonly attribute is set for editable=false");

		oInput.setEnabled(false);
		await nextUIUpdate();
		$Input = jQuery(oInput.getFocusDomRef());
		assert.strictEqual($Input.attr("disabled"), "disabled", "disabled attribute is set for enabled=false");

		var oText = new Text("text");
		oInput.addAriaLabelledBy(oText);
		await nextUIUpdate();
		$Input = jQuery(oInput.getFocusDomRef());
		assert.strictEqual($Input.attr("aria-labelledby"), "text", "aria-labelledby set for assosiation");

		// cleanup
		fnSetErrorAnnounceSpy.restore();
		oInput.destroy();
		oText.destroy();
	});

	QUnit.test("it should not render the tooltip and the invisible element", async function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();

		// act
		oInput.setTooltip("");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oInput.$().attr("title"), undefined);
		assert.strictEqual(oInput.$("describedby").length, 0);

		// cleanup
		oInput.destroy();
	});

	QUnit.test("it should not render the tooltip and the invisible element (test case 2)", async function(assert) {

		// system under test
		var oInput = new InputBase({
			tooltip: "tooltip"
		});

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();

		// act
		oInput.setTooltip("");
		await nextUIUpdate();

		// assert
		assert.ok(oInput.$().attr("title") === undefined);
		assert.strictEqual(oInput.$("describedby").length, 0);

		// cleanup
		oInput.destroy();
	});

	// BCP 1580094855
	QUnit.test("it should not render the tooltip (test case 3)", async function(assert) {

		// arrange
		var CustomInput = InputBase.extend("CustomInput", {
			renderer: {
				getDescribedByAnnouncement: function() {
					return "lorem ipsum";
				}
			}
		});

		// system under test
		var oInput = new CustomInput({
			tooltip: "tooltip"
		});

		// arrange
		oInput.placeAt("content");
		await nextUIUpdate();

		// act
		oInput.setTooltip("");
		await nextUIUpdate();

		// assert
		assert.ok(oInput.$().attr("title") === undefined);

		// cleanup
		oInput.destroy();
		delete window.CustomInput;
	});

	QUnit.test("it should keep other describedby associations when the tooltip is set to empty string", async function(assert) {
		var CustomInput = InputBase.extend("CustomInput", {
			metadata: {
				associations: {
					ariaDescribedBy: {
						type: "sap.ui.core.Control",
						multiple: true,
						singularName: "ariaDescribedBy"
					}
				}
			},
			renderer: {}
		});

		// system under test
		var oText = new Text("text");
		var oInput = new CustomInput({
			tooltip: "tooltip",
			ariaDescribedBy: oText
		});

		// arrange
		oInput.placeAt("content");
		oText.placeAt("content");
		await nextUIUpdate();

		// act
		oInput.setTooltip("");

		// assert
		assert.strictEqual(oInput.getFocusDomRef().getAttribute("aria-describedby"), "text");

		// cleanup
		oText.destroy();
		oInput.destroy();
		delete window.CustomInput;
	});

	QUnit.test("Renderer Hooks", async function(assert) {
		var MyTextField = InputBase.extend("MyTextField", {
			metadata: {
				associations: {
					ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"}
				}
			},
			renderer: {
				getAriaRole: function() {
					return "combobox";
				},
				getAriaLabelledBy: function(oControl) {
					return "internal_labelledby_id";
				},
				getLabelledByAnnouncement: function(oControl) {
					return "my labelledby text";
				},
				getAriaDescribedBy: function(oControl) {
					return "internal_describedby_id";
				},
				getDescribedByAnnouncement: function(oControl) {
					return "my describedby text";
				},
				getAccessibilityState: function(oControl) {
					var mBaseAccessibilityState = InputBaseRenderer.getAccessibilityState.call(this, oControl);
					return jQuery.extend(mBaseAccessibilityState, {
						autocomplete: true
					});
				}
			}
		});

		var oInput = new MyTextField({
			valueState: ValueState.Error
		}).placeAt("content");
		await nextUIUpdate();

		var $Input = jQuery(oInput.getFocusDomRef());
		assert.strictEqual($Input.attr("role"), "combobox", "Control role set correctly");
		assert.strictEqual($Input.attr("aria-invalid"), "true", "Base functionality still works");
		assert.strictEqual($Input.attr("aria-labelledby"), "internal_labelledby_id", "Internal aria labelledby is set");
		assert.strictEqual($Input.attr("aria-describedby"), "internal_describedby_id", "Internal aria describedby is set");
		assert.strictEqual(oInput.$("labelledby").text(), "my labelledby text", "labelledby announcement is set");
		assert.strictEqual(oInput.$("describedby").text(), "my describedby text", "describedby announcement is set");

		var oText = new Text("text");
		oInput.addAriaLabelledBy(oText);
		oInput.addAriaDescribedBy(oText);
		await nextUIUpdate();
		$Input = jQuery(oInput.getFocusDomRef());
		assert.strictEqual($Input.attr("aria-labelledby"), "text internal_labelledby_id", "aria-labelledby is set for assosiation and internal together");
		assert.strictEqual($Input.attr("aria-describedby"), "text internal_describedby_id", "aria-describedby is set for assosiation and internal together");

		oInput.removeAriaLabelledBy(oText);
		oInput.removeAriaDescribedBy(oText);
		await nextUIUpdate();
		$Input = jQuery(oInput.getFocusDomRef());
		assert.strictEqual($Input.attr("aria-labelledby"), "internal_labelledby_id", "aria-labelledby is set only for internal");
		assert.strictEqual($Input.attr("aria-describedby"), "internal_describedby_id", "aria-describedby is set only for internal");

		oInput.destroy();
		oText.destroy();
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oRb = Library.getResourceBundleFor("sap.m");
		var oInput = new InputBase({value: "Value", tooltip: "Tooltip", placeholder: "Placeholder"});

		assert.ok(!!oInput.getAccessibilityInfo, "InputBase has a getAccessibilityInfo function");
		var oInfo = oInput.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, oInput.getRenderer().getAriaRole(), "AriaRole");
		assert.strictEqual(oInfo.type, oRb.getText("ACC_CTR_TYPE_INPUT"), "Type");
		assert.strictEqual(oInfo.description, "Value", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		oInput.setValue("");
		oInput.setEnabled(false);
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, oRb.getText("INPUTBASE_VALUE_EMPTY"), "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oInput.setEnabled(true);
		oInput.setEditable(false);
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oInput.destroy();
	});

	QUnit.test("_invisibleFormattedValueStateText", async function(assert) {
		var oInput = new InputBase({
			valueState: "Error",
			formattedValueStateText: new FormattedText({
				htmlText: "Value state message containing a %%0",
				controls: new Link({
					text: "link",
					href: "#"
				})
			})
		}).placeAt("content");
		await nextUIUpdate();

		assert.strictEqual(oInput.getAggregation("_invisibleFormattedValueStateText").getControls()[0].getDomRef().getAttribute("tabindex"), "-1", "The link shouldn't be tabbable");
		oInput.destroy();
	});

	QUnit.module("invalid input event when rendered with non-ASCII symbols");

	QUnit.test("In IE an Input with a non ASCII symbol should mark 'oninput' event invalid when it is rendered", async function (assert) {// TODO remove after the end of support for Internet Explorer

		var done = assert.async();
		var callCount = 0;
		var isInvalid = false;

		var oninputOverride = function (event) {
			InputBase.prototype.oninput.call(this, event);
			callCount++;
			isInvalid = event.isMarked("invalid");
		};

		var oInput = new InputBase({
			value: 'ä'
		}).placeAt("content");

		oInput.oninput = oninputOverride;
		await nextUIUpdate();

		setTimeout(function () {
			if (callCount) {
				assert.ok(isInvalid, "if the oninput event is called, it should be is marked as invalid");
			} else {
				assert.ok(true, "the oninput event is not called");
			}

			callCount = 0;
			oInput._$input.trigger("focus").val("ab").trigger("input");

			setTimeout(function () {
				assert.strictEqual(callCount, 1, "the oninput event is fired");
				assert.notOk(isInvalid, "the oninput event is valid");

				oInput.destroy();
				done();

			}, 100);
		}, 100);
	});

	QUnit.test("In IE an Input with a non ASCII symbol should mark 'oninput' event invalid when it is invalidated", async function (assert) {// TODO remove after the end of support for Internet Explorer

		var done = assert.async();
		var callCount = 0;
		var isInvalid = false;

		var oninputOverride = function (event) {
			InputBase.prototype.oninput.call(this, event);
			callCount++;
			isInvalid = event.isMarked("invalid");
		};

		var oInput = new InputBase({
			value: 'ä'
		}).placeAt("content");

		await nextUIUpdate();

		setTimeout(async function () {
			oInput.oninput = oninputOverride;

			oInput.invalidate();
			await nextUIUpdate();

			setTimeout(function () {
				if (callCount) {
					assert.ok(isInvalid, "if the oninput event is called, it should be is marked as invalid");
				} else {
					assert.ok(true, "the oninput event is not called");
				}

				callCount = 0;
				oInput._$input.trigger("focus").val("ab").trigger("input");

				setTimeout(function () {
					assert.strictEqual(callCount, 1, "the oninput event is fired");
					assert.notOk(isInvalid, "the oninput event is valid");

					oInput.destroy();
					done();

				}, 100);
			}, 100);
		}, 100);
	});

	QUnit.test("In IE an Input with a non ASCII symbol should mark 'oninput' event invalid when its parent is invalidated", async function (assert) {// TODO remove after the end of support for Internet Explorer

		var done = assert.async();
		var callCount = 0;
		var isInvalid = false;

		var oninputOverride = function (event) {
			InputBase.prototype.oninput.call(this, event);
			callCount++;
			isInvalid = event.isMarked("invalid");
		};

		var oInput = new InputBase({
			value: 'ä'
		});

		var oPanel = new Panel({
			content: oInput
		}).placeAt('content');
		await nextUIUpdate();

		setTimeout(async function () {
			oInput.oninput = oninputOverride;

			oPanel.invalidate();
			await nextUIUpdate();

			setTimeout(function () {
				if (callCount) {
					assert.ok(isInvalid, "if the oninput event is called, it should be is marked as invalid");
				} else {
					assert.ok(true, "the oninput event is not called");
				}

				callCount = 0;
				oInput._$input.trigger("focus").val("ab").trigger("input");

				setTimeout(function () {
					assert.strictEqual(callCount, 1, "the oninput event is fired");
					assert.notOk(isInvalid, "the oninput event is valid");

					oInput.destroy();
					done();

				}, 100);
			}, 100);
		}, 100);
	});

	QUnit.test("Safari should not fire change event when value is selected from IME Popover with Enter", async function(assert) {

		// arrange
		var oInput = new InputBase({
			value : "Initial value"
		});

		this.stub(InputBase.prototype, "isComposingCharacter").callsFake(function() {
			return true;
		});

		this.stub(Device, "browser").value({
			safari: true
		});

		oInput.placeAt("content");
		await nextUIUpdate();

		var oInputDomRef = oInput.getFocusDomRef(),
			fnFireChangeSpy = this.spy(oInput, "fireChange"),
			fnOnEnterSpy = this.spy(oInput, "onsapenter");

		// change dom and cursor pos
		qutils.triggerCharacterInput(oInputDomRef, "a");

		// act
		qutils.triggerKeydown(oInputDomRef, "ENTER");

		// assertion
		assert.notOk(fnFireChangeSpy.callCount, "Change event is not fired when the IME Popover is opened.");
		assert.ok(fnOnEnterSpy.args[0][0].isMarked("invalid"), "Enter is marked as invalid");

		// cleanup
		oInput.destroy();
	});

	QUnit.module("Width calculations");

	QUnit.test("_calculateIconsSpace", async function(assert) {
		var oInput = new InputBase(),
			oBeginIcon, oEndIcon;

		oInput.placeAt("content");
		await nextUIUpdate();

		assert.strictEqual(0, oInput._calculateIconsSpace(),
			"The space taken by the icon should be 0, when no icon present");

		oEndIcon = oInput.addEndIcon({src: "sap-icon://slim-arrow-down"});
		await nextUIUpdate();

		assert.strictEqual(oEndIcon.getDomRef().offsetWidth, oInput._calculateIconsSpace(),
			"The space taken by the icon should be calculated");

		oBeginIcon = oInput.addBeginIcon({src: "sap-icon://slim-arrow-down"});
		await nextUIUpdate();

		assert.strictEqual(oBeginIcon.getDomRef().offsetWidth + oEndIcon.getDomRef().offsetWidth,
			oInput._calculateIconsSpace(), "The space taken by the icons should be calculated" );

		oInput.destroy();
	});

	QUnit.module("Renderer hooks");

	QUnit.test("getInnerSuffix() is called", async function(assert) {
		var oInputBase = new InputBase({}),
			oRenderer = oInputBase.getRenderer();

		//spy writeInnerId()
		var fnOnInputBaseSpy = this.spy(oRenderer, "getInnerSuffix");

		oInputBase.placeAt("content");
		await nextUIUpdate();

		assert.strictEqual(fnOnInputBaseSpy.callCount, 1, "getInnerSuffix() is called");
		assert.strictEqual(oInputBase.$(oRenderer.getInnerSuffix()).length, 1, "The inner element has proper Id");

		// cleanup
		oInputBase.destroy();
	});

	QUnit.module("Value concurrency scenario", {
		beforeEach: async function () {
			this.oInput = new InputBase();
			this.oModel = new JSONModel();

			this.oInput.setPreferUserInteraction(true);
			this.oInput.bindProperty("value", {path: "/value"});
			this.oModel.setData({"value": 'Initial Value'});
			this.oInput.setModel(this.oModel);
			this.oInput.placeAt("content");
			await nextUIUpdate();
			this.oInputFocusDomRef = this.oInput.getFocusDomRef();
		},
		afterEach: function () {
			// cleanup
			this.oInput.destroy();
			this.oModel.destroy();
		}
	});

	QUnit.test("Value concurrency scenario - model update on a focused empty input with _bPreferUserInteraction = true", function(assert) {
		// assert
		assert.strictEqual(this.oInput.getValue(), "Initial Value",
			"The input value should be the one coming from the model");

		// act
		this.oInput.resetProperty('value');
		this.oInput.focus();
		this.oModel.setProperty('/value', "Model Value");

		// assert
		assert.strictEqual(this.oInput.getValue(), "Model Value",
			"The input value should be set from the model update");
		assert.strictEqual(document.activeElement.selectionEnd, this.oInput.getValue().length,
			"The value should be selected, since the user has focused the input and the new value is from the model");
	});

	QUnit.test("Value concurrency scenario - model update on a focused non-empty input with _bPreferUserInteraction = true", function(assert) {
		// act
		this.oInput.focus();
		this.oInputFocusDomRef.value = "User Value";
		this.oModel.setProperty('/value', "Model Value");
		qutils.triggerKeydown(this.oInputFocusDomRef, "ENTER");

		// assert
		assert.strictEqual(this.oInput.getValue(), "User Value",
			"The user input should not get overwritten by the model, when _bPreferUserInteraction is set to true");
	});

	QUnit.test("Value concurrency scenario - model update on a focused non-empty input with _bPreferUserInteraction = false", function(assert) {
		// act
		this.oInput.setPreferUserInteraction(false);
		this.oInput.focus();
		this.oInputFocusDomRef.value = "User Value 2";
		this.oModel.setProperty('/value', "Model Value");
		qutils.triggerKeydown(this.oInputFocusDomRef, "ENTER");

		// assert
		assert.strictEqual(this.oInput.getValue(), "Model Value",
			"The user input should be overwritten by the model, when _bPreferUserInteraction is set to false");
	});
});