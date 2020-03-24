/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/InputBase",
	"sap/ui/core/library",
	"sap/m/Label",
	"jquery.sap.global",
	"sap/m/Input",
	"sap/m/Button",
	"sap/m/Panel",
	"sap/ui/model/type/String",
	"sap/ui/model/json/JSONModel",
	"sap/m/Text",
	"sap/m/InputBaseRenderer",
	"sap/ui/Device",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Icon"
], function(
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
	InputBaseRenderer,
	Device,
	ManagedObject,
	Icon
) {
	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	createAndAppendDiv("content");



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

	QUnit.test("default values", function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

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

	QUnit.test("attribute required should be set to the input field, when the associate label is required", function(assert) {
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
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(oInput.getFocusDomRef().getAttribute("required"), "required", "The attribute is set correctly");

		// Act
		oLabel.setRequired(false);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.notOk(oInput.getFocusDomRef().getAttribute("required"), "The attribute is removed");

		// cleanup
		oInput.destroy();
		oLabel.destroy();
	});

	/* ------------------------------ */
	/* setValue()                     */
	/* ------------------------------ */

	var fnSetValueTestCase1 = function(mSettings) {
		QUnit.test("method: setValue() initial rendering", function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			sap.ui.getCore().applyChanges();

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
		QUnit.test("method: setValue() after the initial rendering", function(assert) {

			// system under test
			var oInput = mSettings.control;
			var fnSetValueSpy = this.spy(oInput, "setValue");

			// arrange
			oInput.placeAt("content");
			sap.ui.getCore().applyChanges();
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

	var fnSetValueTestCase3 = function(mSettings) {
		QUnit.test("method: setValue() initial rendering should respect getMaxLength", function(assert) {

			// arrange - stub for max length before rendering
			sap.m.InputBase.prototype.getMaxLength = undefined;
			this.stub(InputBase.prototype, "getMaxLength", function() {
				return mSettings.maxLength;
			});

			// system under test
			var oInput = new InputBase(mSettings.control || {});

			// arrange
			oInput.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			assert.strictEqual(jQuery(oInput.getFocusDomRef()).val(), mSettings.output);

			// cleanup
			oInput.destroy();
		});
	};

	fnSetValueTestCase3({
		maxLength : 0,
		control: {
			value : "Test"
		},
		output: "Test"
	});

	fnSetValueTestCase3({
		maxLength : 5,
		control: {
			value : "Test"
		},
		output: "Test"
	});

	fnSetValueTestCase3({
		maxLength : 2,
		control: {
			value : "Test"
		},
		output: "Te"
	});

	var fnSetValueTestCase4 = function(mSettings) {
		QUnit.test("method: setValue() after the initial rendering should respect getMaxLength", function(assert) {

			// stub for max length
			sap.m.InputBase.prototype.getMaxLength = undefined;
			this.stub(InputBase.prototype, "getMaxLength", function() {
				return mSettings.maxLength;
			});

			// system under test
			var oInput = new InputBase(mSettings.control || {});
			var fnSetValueSpy = this.spy(oInput, "setValue");

			// arrange
			oInput.placeAt("content");
			sap.ui.getCore().applyChanges();
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

	fnSetValueTestCase4({
		maxLength : 0,
		input : "Test",
		output: "Test"
	});

	fnSetValueTestCase4({
		maxLength : 5,
		input : "Test",
		output: "Test"
	});

	fnSetValueTestCase4({
		maxLength : 2,
		input : "Test",
		output: "Te"
	});

	QUnit.test("setValue should not update the last value when old and new one is same", function(assert) {
		// system under test
		var sInitValue = "init";
		var sTestValue = "test";
		var oInput = new InputBase({
			value : sInitValue
		});

		// arrange
		var sLastValue = oInput._lastValue;

		// act as twoway binding does
		oInput.setProperty("value", sTestValue, true);
		oInput.setValue(sTestValue);

		// assertions
		assert.strictEqual(sLastValue, sInitValue, "Last value did not change");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("setValue should update the dom when old and new dom value is not same", function(assert) {

		// system under test
		var sValue = "test";
		var oInput = new InputBase({
			value : sValue
		});

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

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
		QUnit.test("method: setWidth() initial rendering", function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			sap.ui.getCore().applyChanges();

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
		QUnit.test("method: setWidth() after initial rendering", function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			sap.ui.getCore().applyChanges();

			// act
			oInput.setWidth(mSettings.input);
			sap.ui.getCore().applyChanges();

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

	QUnit.test("method: setEnabled() initial rendering test case 1", function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oInput.setEnabled(false);
		sap.ui.getCore().applyChanges();

		// assertions
		assert.ok(oInput.$().hasClass("sapMInputBaseDisabled"), 'If the input is disabled, it should have the CSS class "sapMInputBaseDisabled"');
		assert.strictEqual(oInput.getFocusDomRef().getAttribute("disabled"), "disabled");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("method: setEnabled() test case 2", function(assert) {

		// system under test
		var oInput = new InputBase({
			enabled: false
		});

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.ok(oInput.$().hasClass("sapMInputBaseDisabled"), 'If the input is disabled, it should have the CSS class "sapMInputBaseDisabled"');
		assert.strictEqual(oInput.getFocusDomRef().getAttribute("disabled"), "disabled");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("method: setEnabled() test case 3", function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(jQuery(oInput.getFocusDomRef()).attr("disabled"), undefined);

		// cleanup
		oInput.destroy();
	});

	/* ------------------------------ */
	/* setValueState()                */
	/* ------------------------------ */

	var fnSetValueStateTestCase1 = function(mSettings) {
		QUnit.test("method: setValueState() initial rendering", function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			sap.ui.getCore().applyChanges();

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
		QUnit.test("method: setValueState() after initial rendering", function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			sap.ui.getCore().applyChanges();
			var fnRerenderSpy = this.spy(oInput.getRenderer(), "render");

			// act
			oInput.setValueState(mSettings.input);

			// assertions
			assert.ok(oInput.$("content").hasClass(mSettings.output), "Input should have the class " + mSettings.output);
			assert.strictEqual(fnRerenderSpy.callCount, 0, "Input is not rerendered with setValueState calls");

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

	QUnit.test("method: setValueState() invalid values", function(assert) {
		var oInput = new InputBase({
			valueState : null
		}).placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oInput.getValueState(), ValueState.None, "Invalid value state before rendering is converted to default value.");

		oInput.setValueState(ValueState.Error);
		assert.ok(oInput.$("content").hasClass("sapMInputBaseContentWrapperError"), "Input has the state class before testing the invalid value.");

		oInput.setValueState(undefined);
		assert.strictEqual(oInput.getValueState(), ValueState.None, "Invalid value state is converted to default value.");
		assert.ok(!oInput.$().hasClass("sapMInputBaseState"), "Input's state class is removed after setting the invalid value");

		oInput.destroy();
	});

	/* ------------------------------ */
	/* setName()                      */
	/* ------------------------------ */

	QUnit.test("method: setName() initial rendering", function(assert) {

		// system under test
		var oInput = new InputBase({
			name: "myInput"
		});

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(jQuery(oInput.getFocusDomRef()).attr("name"), "myInput", 'The attribute name is "myInput"');

		// cleanup
		oInput.destroy();
	});

	QUnit.test("method: setName() after initial rendering", function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oInput.setName("myInput");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(jQuery(oInput.getFocusDomRef()).attr("name"), "myInput", 'The attribute name is "myInput"');

		// cleanup
		oInput.destroy();
	});

	/* ------------------------------ */
	/* setPlaceholder()               */
	/* ------------------------------ */

	var fnSetPlaceholderTestCase2 = function(mSettings) {
		QUnit.test("method: setPlaceholder() after initial rendering", function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			sap.ui.getCore().applyChanges();

			// act
			oInput.setPlaceholder(mSettings.input);
			sap.ui.getCore().applyChanges();

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
		QUnit.test("method: setEditable() initial rendering", function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			sap.ui.getCore().applyChanges();

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
		QUnit.test("method: setEditable() after the initial rendering", function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			sap.ui.getCore().applyChanges();

			// act
			oInput.setEditable(mSettings.input);
			sap.ui.getCore().applyChanges();

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

	QUnit.test("method: setVisible() initial rendering", function(assert) {

		// system under test
		var oInput = new InputBase({
			visible: false
		});

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oInput.$().length, 0);

		// cleanup
		oInput.destroy();
	});

	/* ------------------------------ */
	/* setTextAlign()                 */
	/* ------------------------------ */

	var fnSetTextAlignTestCase1 = function(mSettings) {
		QUnit.test("method: setTextAlign() initial rendering", function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			sap.ui.getCore().applyChanges();

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
		QUnit.test("method: setTextAlign() after the initial rendering", function(assert) {

			// system under test
			var oInput = mSettings.control;

			// arrange
			oInput.placeAt("content");
			sap.ui.getCore().applyChanges();

			// act
			oInput.setTextAlign(mSettings.input);
			sap.ui.getCore().applyChanges();

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

	QUnit.test("method: destroy()", function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

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

	QUnit.test("it should open or close the value state message popup when the input gets or losses the focus event", function(assert) {

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

		// arrange
		oErrorInput.placeAt("content");
		oWarningInput.placeAt("content");
		sap.ui.getCore().applyChanges();
		oErrorInput.focus();
		this.clock.tick(500);

		// assert
		assert.ok(jQuery.sap.domById("errorinput-message"), "error message popup is open on focusin");
		assert.equal(oErrorInput.getValueStateText(), "Error Message", "error message is correct");

		oErrorInput.getFocusDomRef().blur();
		assert.ok(!jQuery.sap.domById("errorinput-message"), "error message popup is closed when focus is out");

		oWarningInput.focus();
		this.clock.tick(500);
		assert.ok(jQuery.sap.domById("warninginput-message"), "warning message popup is open when focusin");
		assert.equal(oWarningInput.getValueStateText(), "Warning Message", "warning message is correct");

		oWarningInput.getFocusDomRef().blur();
		assert.ok(!jQuery.sap.domById("warninginput-message"), "warning message popup is closed when focus is out");

		oErrorInput.setShowValueStateMessage(false);
		sap.ui.getCore().applyChanges();
		oErrorInput.focus();
		this.clock.tick(500);
		assert.ok(!jQuery.sap.domById("errorinput-message"), "no error message popup if showValueStateMessage is set to false");

		// cleanup
		oErrorInput.destroy();
		oWarningInput.destroy();
	});

	QUnit.test("it should update the value state message accordingly", function(assert) {
		var oCoreRB = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core"),
				oMobileRB = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
				oValueStateInput = new Input("vsinput", {
					placeholder: "value state changes while you are typing",
					liveChange: function() {
						var i = oValueStateInput.getValue().length;

						switch (i % 5) {
							case 0:
								oValueStateInput.setValueState("None");
								break;

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
						}
					}
				});

		oValueStateInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		// warning state
		oValueStateInput.updateDomValue("1").focus();
		sap.ui.test.qunit.triggerEvent("input", oValueStateInput.getFocusDomRef());
		this.clock.tick(1000);
		assert.strictEqual(oValueStateInput.getValueState(), "Warning");
		assert.ok(jQuery.sap.domById("vsinput-message"), "warning message popup is open");
		assert.strictEqual(jQuery.sap.byId("vsinput-message-text").text(), oCoreRB.getText("VALUE_STATE_WARNING"));
		assert.strictEqual(jQuery.sap.byId("vsinput-message").text(), oMobileRB.getText("INPUTBASE_VALUE_STATE_WARNING") + oCoreRB.getText("VALUE_STATE_WARNING"));

		// success state
		oValueStateInput.updateDomValue("12");
		sap.ui.test.qunit.triggerEvent("input", oValueStateInput.getFocusDomRef());
		this.clock.tick(1000);
		oValueStateInput.getValueState();
		assert.strictEqual(oValueStateInput.getValueState(), "Success");
		assert.ok(jQuery.sap.domById("vsinput-message"), "Success message popup is open");
		assert.ok(jQuery.sap.byId("vsinput-message").hasClass("sapUiInvisibleText"), "Success message popup is not visible");

		// error state
		oValueStateInput.updateDomValue("123");
		sap.ui.test.qunit.triggerEvent("input", oValueStateInput.getFocusDomRef());
		this.clock.tick(1000);
		oValueStateInput.getValueState();
		assert.strictEqual(oValueStateInput.getValueState(), "Error");
		assert.ok(jQuery.sap.domById("vsinput-message"), "error message popup is open");
		assert.strictEqual(jQuery.sap.byId("vsinput-message-text").text(), oCoreRB.getText("VALUE_STATE_ERROR"));
		assert.strictEqual(jQuery.sap.byId("vsinput-message").text(), oMobileRB.getText("INPUTBASE_VALUE_STATE_ERROR") + oCoreRB.getText("VALUE_STATE_ERROR"));

		// information state
		oValueStateInput.updateDomValue("1234");
		sap.ui.test.qunit.triggerEvent("input", oValueStateInput.getFocusDomRef());
		this.clock.tick(1000);
		oValueStateInput.getValueState();
		assert.strictEqual(oValueStateInput.getValueState(), "Information");
		assert.ok(jQuery.sap.domById("vsinput-message"), "Information message popup is open");
		assert.strictEqual(jQuery.sap.byId("vsinput-message-text").text(), oCoreRB.getText("VALUE_STATE_INFORMATION"));
		assert.strictEqual(jQuery.sap.byId("vsinput-message").text(), oMobileRB.getText("INPUTBASE_VALUE_STATE_INFORMATION") + oCoreRB.getText("VALUE_STATE_INFORMATION"));

		// none state
		oValueStateInput.updateDomValue("12345");
		sap.ui.test.qunit.triggerEvent("input", oValueStateInput.getFocusDomRef());
		assert.strictEqual(oValueStateInput.getValueState(), "None");
		assert.ok(!jQuery.sap.domById("vsinput-message"), "no message popup");

		// cleanup
		oValueStateInput.destroy();
	});

	/* =========================================================== */
	/* Text direction module                                       */
	/* =========================================================== */

	QUnit.module("Text direction");

	QUnit.test("textDirection set to RTL", function(assert) {

		var oInput = new InputBase({
			placeholder: "Text direction set to RTL",
			textDirection: TextDirection.RTL
		});

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(jQuery(oInput.getFocusDomRef()).attr("dir"), "rtl");

		oInput.destroy();

	});

	QUnit.test("textDirection set to LTR", function(assert) {

		var oInput = new InputBase({
			placeholder: "Text direction set to LTR",
			textDirection: TextDirection.LTR
		});

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(jQuery(oInput.getFocusDomRef()).attr("dir"), "ltr");

		oInput.destroy();

	});

	QUnit.test("textDirection set to RTL and textAlign set to BEGIN", function(assert) {

		var oInput = new InputBase({
			placeholder: "Text direction set to RTL",
			textDirection: TextDirection.RTL,
			textAlign: TextAlign.Begin
		});

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		var $Input = jQuery(oInput.getFocusDomRef());

		assert.strictEqual($Input.attr("dir"), "rtl", "Dir attribute is set to rtl");
		assert.strictEqual($Input.css("text-align"), "right", "Text align style is shifted to right");

		oInput.destroy();

	});

	QUnit.test("textDirection set to LTR and textAlign set to END", function(assert) {

		var oInput = new InputBase({
			placeholder: "Text direction set to LTR",
			textDirection: TextDirection.LTR,
			textAlign: TextAlign.End
		});

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		var $Input = jQuery(oInput.getFocusDomRef());

		assert.strictEqual($Input.attr("dir"), "ltr", "Dir attribute is set to ltr");
		assert.strictEqual($Input.css("text-align"), "right", "Text align style is shifted to right");

		oInput.destroy();

	});

	/* =========================================================== */
	/* Events module                                               */
	/* =========================================================== */

	QUnit.module("Events");

	QUnit.test("method: change() event", function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnFireChangeSpy = this.spy(oInput, "fireChange");

		// act
		sap.ui.test.qunit.triggerCharacterInput(oInput.getFocusDomRef(), "a");
		oInput.onChange();

		// assertions
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "The change event is fired");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("it should prevent the change event from being fired", function(assert) {

		// system under test
		InputBase.extend("InputSubclass", {
			renderer: {},
			preventChangeOnFocusLeave: function() {
				return true;
			}
		});

		var oInput = new InputSubclass();

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();
		oInput.focus();
		var fnFireChangeSpy = this.spy(oInput, "fireChange");
		sap.ui.test.qunit.triggerCharacterInput(oInput.getFocusDomRef(), "a");

		// act
		oInput.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assertions
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "The change event should not be fired");

		// cleanup
		oInput.destroy();
		InputSubclass = null;
		delete window.InputSubclass;
	});

	QUnit.test("onChange should pass in additional parameters to the change event handler", function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();
		oInput.focus();
		var fnFireChangeSpy = this.spy(oInput, "fireChange");
		sap.ui.test.qunit.triggerCharacterInput(oInput.getFocusDomRef(), "bar");

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

	QUnit.test("onChange should pass in additional parameters to the change event handle", function(assert) {

		// system under test
		InputBase.extend("InputSubclass", {
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
		sap.ui.getCore().applyChanges();
		oInput.focus();
		var fnFireChangeSpy = this.spy(oInput, "fireChange");
		sap.ui.test.qunit.triggerCharacterInput(oInput.getFocusDomRef(), "a");

		// act
		oInput.getFocusDomRef().blur();
		this.clock.tick(0);	// when a blur event occurs the "sapfocusleave" is fired async

		// assertions
		assert.strictEqual(fnFireChangeSpy.args[0][0].parameter1, false);
		assert.strictEqual(fnFireChangeSpy.args[0][0].parameter2, true);

		// cleanup
		oInput.destroy();
		InputSubclass = null;
		delete window.InputSubclass;
	});

	QUnit.test("onChange handler should fire the change event when last known and dom value are not same", function(assert) {
		// system under test
		var sInitValue = "Test";
		var oInput = new InputBase({
			value : sInitValue
		});

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();
		var oInputDomRef = oInput.getFocusDomRef();
		var fnFireChangeSpy = this.spy(oInput, "fireChange");

		// act
		sap.ui.test.qunit.triggerKeydown(oInputDomRef, "ENTER");

		// assertion
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "Change event is not fired because initial value and dom value are same.");

		// change dom and cursor pos
		sap.ui.test.qunit.triggerCharacterInput(oInputDomRef, "a");

		// act
		sap.ui.test.qunit.triggerKeydown(oInputDomRef, "ENTER");

		// assertion
		assert.strictEqual(fnFireChangeSpy.callCount, 1, "Change event is fired because last known value and dom value are not same.");

		// reset spy
		fnFireChangeSpy.reset();

		// retest after change event is fired
		oInputDomRef.blur();

		// assertion
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "Change event is not fired again because last known value and dom value are same");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("onChange it should fire the change event sync", function(assert) {

		// system under test
		var sExpectedValue = "lorem ipsum";
		var oInput = new InputBase();
		var oButton = new Button({
			text: "button"
		});

		// arrange
		oInput.placeAt("content");
		oButton.placeAt("content");
		sap.ui.getCore().applyChanges();
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

	QUnit.test("escape should return the last known value and fire private liveChange event", function(assert) {

		// system under test
		var sInitValue = "Test";
		var sNewValue = "SomethingThatIsNotSameWithTheInitialValue";

		var oInput = new InputBase({
			value : sInitValue
		});

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnFireEventSpy = this.spy(oInput, "fireEvent");
		var fnOnEscapeSpy = this.spy(oInput, "onsapescape");

		// act - set dom value
		oInput.getFocusDomRef().value = sNewValue;

		// assertion - before escape
		assert.notEqual(oInput.getFocusDomRef().value, oInput.getValue(), "Before escape call dom value and value property are not same.");

		// act
		sap.ui.test.qunit.triggerKeyboardEvent(oInput.getFocusDomRef(), "ESCAPE");

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
		fnFireEventSpy.reset();

		// retest while dom and value property are same
		sap.ui.test.qunit.triggerKeyboardEvent(oInput.getFocusDomRef(), "ESCAPE");

		// assertion - after 2nd escape
		assert.strictEqual(fnFireEventSpy.callCount, 0, "LiveChange event is not fired again because dom and value property are same.");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("input event delegate should be fired in IE9 when CUT / DELETE / BACKSPACE is hit", function(assert) {// TODO remove after the end of support for Internet Explorer

		// system under test
		var oInput = new InputBase({
			placeholder : "Test"
		});

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();
		var oInputDomRef = oInput.getFocusDomRef();
		var fnInputDelegateSpy = this.spy();
		var oInputDelegate = {
			oninput : fnInputDelegateSpy
		};

		// do it twice to test 2nd addEventDelegate removes the previous delegate
		oInput.addEventDelegate(oInputDelegate).addEventDelegate(oInputDelegate);

		// act
		oInputDomRef.focus();
		sap.ui.test.qunit.triggerCharacterInput(oInputDomRef, "a");
		sap.ui.test.qunit.triggerEvent("input", oInputDomRef);

		// assertion
		assert.strictEqual(fnInputDelegateSpy.callCount, 1, "input event delegate is called with character input");
		fnInputDelegateSpy.reset();

		// cleanup
		oInput.destroy();
	});

	/* =========================================================== */
	/* Focus And Cursor Position Module                            */
	/* =========================================================== */
	QUnit.module("FocusAndCursorPosition");

	QUnit.test("getFocusDomRef should point the input field", function(assert) {
		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertion - before escape
		assert.strictEqual(oInput.getFocusDomRef(), oInput.$().find("input")[0], "getFocusDomRef returns the input field.");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("onAfterRendering cursor position and dom values should set to the last known values", function(assert) {
		// system under test
		var sTestValue = "Test";
		var sTestCurPos = sTestValue.length / 2;
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();
		var fnFireChangeSpy = this.spy(oInput, "fireChange");

		// act - set dom value and change cursor position
		oInput.focus();
		oInput.updateDomValue(sTestValue);
		jQuery(oInput.getFocusDomRef()).cursorPos(sTestCurPos);

		// invalidate the control after dom value changes
		oInput.setPlaceholder("placeholder");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(fnFireChangeSpy.callCount, 0, "Change event should not be fired during the rendering");

		// in test environment focus can leave the test page
		if (document.activeElement === oInput.getFocusDomRef() && !Device.browser.safari) {
			assert.strictEqual(jQuery(oInput.getFocusDomRef()).cursorPos(), sTestCurPos, "Cursor position reverted to the last know position after rendering.");
		}

		// cleanup
		oInput.destroy();
	});


	QUnit.test("onAfterRendering last dom value should not be reverted when setProperty('value', ..) is called", function(assert) {
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
		sap.ui.getCore().applyChanges();

		// act - set dom value and set value property and change cursor position
		oInput.focus();
		oInput.updateDomValue(sDomValue);
		oInput.setProperty("value", sTestValue, true);
		jQuery(oInput.getFocusDomRef()).cursorPos(sTestCurPos);

		// invalidate the control after dom and property value changes
		oInput.setPlaceholder("placeholder");
		sap.ui.getCore().applyChanges();

		// assertion
		assert.strictEqual(jQuery(oInput.getFocusDomRef()).val(), sTestValue, "InputBase respected setProperty value call and did not revert the dom value.");

		// in test environment focus can leave the test page
		if (document.activeElement === oInput.getFocusDomRef() && !Device.browser.safari) { // Safari has issues with the cursor when the page is not "manually" focused
			assert.strictEqual(jQuery(oInput.getFocusDomRef()).cursorPos(), sTestCurPos, "Cursor position reverted to the last know position after rendering.");
		}

		// cleanup
		oInput.destroy();
	});


	QUnit.test("getFocusInfo and applyFocusInfo", function(assert) {
		// system under test
		var sInitValue = "Test";
		var oInput = new InputBase({
			value : sInitValue
		});

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();
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
	QUnit.test("it should correctly restore the value in case of invalidation", function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		var sValue = "Lorem Ipsum";
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();
		oInput.focus();

		// act
		oInput.updateDomValue(sValue);
		oInput.setVisible(false);
		sap.ui.getCore().applyChanges();
		oInput.setVisible(true);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oInput.getFocusDomRef().value, sValue);

		// cleanup
		oInput.destroy();
	});

	QUnit.test("getPopupAnchorDomRef should return the control's DOM reference", function(assert) {
		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertion - before escape
		assert.strictEqual(oInput.getPopupAnchorDomRef(), oInput.$()[0], "getFocusDomRef returns the control's DOM reference.");

		// cleanup
		oInput.destroy();
	});

	QUnit.module("TwowayBindingAndFormatters");
	QUnit.test("formatters should be applied for two-way binding formatters", function(assert) {
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
		sap.ui.getCore().setModel(oModel);

		// arrange
		var oInput = new InputBase({
			value:{
				path: "/value",
				type: new TypeSmile()
			}
		});
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

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
	QUnit.test("DOM aria properties", function(assert) {

		var oInput = new InputBase().placeAt("content");
		sap.ui.getCore().applyChanges();

		var $Input = jQuery(oInput.getFocusDomRef());
		assert.strictEqual($Input.attr("role"), "textbox", "Textbox role set correctly");
		assert.strictEqual($Input.attr("aria-invalid"), undefined, "No aria-invalid set for valueState=None");
		assert.strictEqual($Input.attr("readonly"), undefined, "No readonly attribute set for editable=true");
		assert.strictEqual($Input.attr("disabled"), undefined, "No disabled attribute set for enabled=true");
		assert.strictEqual($Input.attr("aria-labelledby"), undefined, "No aria-labelledby set by default");

		oInput.setValueState(ValueState.Warning);
		assert.strictEqual($Input.attr("aria-invalid"), undefined, "valueState=Warning does not make control invalid");

		oInput.setValueState(ValueState.Success);
		assert.strictEqual($Input.attr("aria-invalid"), undefined, "valueState=Success does not make control invalid");

		oInput.setValueState(ValueState.Information);
		assert.strictEqual($Input.attr("aria-invalid"), undefined, "valueState=Information does not make control invalid");

		oInput.setValueState(ValueState.Error);
		assert.strictEqual($Input.attr("aria-invalid"), "true", "valueState=Error makes control invalid");

		oInput.rerender();
		sap.ui.getCore().applyChanges();
		$Input = jQuery(oInput.getFocusDomRef());
		assert.strictEqual($Input.attr("aria-invalid"), "true", "valueState=Error is at the dom after rendering");

		oInput.setEditable(false);
		sap.ui.getCore().applyChanges();
		$Input = jQuery(oInput.getFocusDomRef());
		assert.strictEqual($Input.attr("readonly"), "readonly", "readonly attribute is set for editable=false");

		oInput.setEnabled(false);
		sap.ui.getCore().applyChanges();
		$Input = jQuery(oInput.getFocusDomRef());
		assert.strictEqual($Input.attr("disabled"), "disabled", "disabled attribute is set for enabled=false");

		var oText = new Text("text");
		oInput.addAriaLabelledBy(oText);
		sap.ui.getCore().applyChanges();
		$Input = jQuery(oInput.getFocusDomRef());
		assert.strictEqual($Input.attr("aria-labelledby"), "text", "aria-labelledby set for assosiation");

		// cleanup
		oInput.destroy();
		oText.destroy();
	});

	QUnit.test("it should not render the tooltip and the invisible element", function(assert) {

		// system under test
		var oInput = new InputBase();

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oInput.setTooltip("");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oInput.$().attr("title"), undefined);
		assert.strictEqual(oInput.$("describedby").length, 0);

		// cleanup
		oInput.destroy();
	});

	QUnit.test("it should not render the tooltip and the invisible element (test case 2)", function(assert) {

		// system under test
		var oInput = new InputBase({
			tooltip: "tooltip"
		});

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oInput.setTooltip("");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oInput.$().attr("title") === undefined);
		assert.strictEqual(oInput.$("describedby").length, 0);

		// cleanup
		oInput.destroy();
	});

	// BCP 1580094855
	QUnit.test("it should not render the tooltip (test case 3)", function(assert) {

		// arrange
		InputBase.extend("CustomInput", {
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
		sap.ui.getCore().applyChanges();

		// act
		oInput.setTooltip("");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oInput.$().attr("title") === undefined);

		// cleanup
		oInput.destroy();
		CustomInput = null;
		delete window.CustomInput;
	});

	QUnit.test("it should keep other describedby associations when the tooltip is set to empty string", function(assert) {
		InputBase.extend("CustomInput", {
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
		sap.ui.getCore().applyChanges();

		// act
		oInput.setTooltip("");

		// assert
		assert.strictEqual(oInput.getFocusDomRef().getAttribute("aria-describedby"), "text");

		// cleanup
		oText.destroy();
		oInput.destroy();
		CustomInput = null;
		delete window.CustomInput;
	});

	QUnit.test("Renderer Hooks", function(assert) {
		InputBase.extend("my.TextField", {
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

		var oInput = new my.TextField({
			valueState: ValueState.Error
		}).placeAt("content");
		sap.ui.getCore().applyChanges();

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
		sap.ui.getCore().applyChanges();
		$Input = jQuery(oInput.getFocusDomRef());
		assert.strictEqual($Input.attr("aria-labelledby"), "text internal_labelledby_id", "aria-labelledby is set for assosiation and internal together");
		assert.strictEqual($Input.attr("aria-describedby"), "text internal_describedby_id", "aria-describedby is set for assosiation and internal together");

		oInput.removeAriaLabelledBy(oText);
		oInput.removeAriaDescribedBy(oText);
		sap.ui.getCore().applyChanges();
		$Input = jQuery(oInput.getFocusDomRef());
		assert.strictEqual($Input.attr("aria-labelledby"), "internal_labelledby_id", "aria-labelledby is set only for internal");
		assert.strictEqual($Input.attr("aria-describedby"), "internal_describedby_id", "aria-describedby is set only for internal");

		oInput.destroy();
		oText.destroy();
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		var oInput = new InputBase({value: "Value", tooltip: "Tooltip", placeholder: "Placeholder"});
		assert.ok(!!oInput.getAccessibilityInfo, "InputBase has a getAccessibilityInfo function");
		var oInfo = oInput.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, oInput.getRenderer().getAriaRole(), "AriaRole");
		assert.strictEqual(oInfo.type, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_INPUT"), "Type");
		assert.strictEqual(oInfo.description, "Value", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		oInput.setValue("");
		oInput.setEnabled(false);
		oInfo = oInput.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "", "Description");
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


	QUnit.module("invalid input event");
	QUnit.test("iE10+ should mark event invalid when an input field with a native placeholder is focused", function(assert) {// TODO remove after the end of support for Internet Explorer
		this.stub(InputBase.prototype, "bShowLabelAsPlaceholder", false);
		var fnOnInputSpy = this.spy(InputBase.prototype, "oninput");
		this.stub(Device, "browser", {
			msie: true,
			version: 10
		});

		var oInput = new InputBase({
			placeholder : "Test"
		}).placeAt("content");
		sap.ui.getCore().applyChanges();

		var oInputDomRef = oInput.getFocusDomRef();
		oInputDomRef.focus();
		sap.ui.test.qunit.triggerEvent("input", oInputDomRef);

		// This fix should be valid only for input tag elements
		assert.strictEqual(oInput._getInputElementTagName(), "INPUT", "Input tag element is used");
		assert.strictEqual(fnOnInputSpy.callCount, 1, "input event is triggered");
		assert.ok(fnOnInputSpy.args[0][0].isMarked("invalid"), 1, "input event is marked as invalid");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("iE11 should mark event invalid when an readonly input field fires input event", function(assert) {// TODO remove after the end of support for Internet Explorer
		var fnOnInputSpy = this.spy(InputBase.prototype, "oninput");
		this.stub(Device, "browser", {
			msie: true,
			version: 11
		});

		var oInput = new InputBase({
			editable : false
		}).placeAt("content");
		sap.ui.getCore().applyChanges();

		var oInputDomRef = oInput.getFocusDomRef();
		oInputDomRef.focus();
		sap.ui.test.qunit.triggerEvent("input", oInputDomRef);

		assert.strictEqual(fnOnInputSpy.callCount, 1, "input event is triggered");
		assert.ok(fnOnInputSpy.args[0][0].isMarked("invalid"), 1, "input event is marked as invalid");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("IE should mark event invalid when is fired with the same value", function (assert) {// TODO remove after the end of support for Internet Explorer
		this.stub(Device, "browser", {
			msie: true,
			version: 11
		});

		var done = assert.async();
		var oninputOverride = function (event) {
			InputBase.prototype.oninput.call(this, event);

			assert.ok(event.isMarked("invalid"), "input event is marked as invalid");

			this.destroy();

			done();
		};

		var oInput = new InputBase({
			value: ''
		}).placeAt("content");

		oInput.oninput = oninputOverride;
		sap.ui.getCore().applyChanges();

		oInput.oninput({
			setMarked: function (vl) {
				this.invalid = vl === "invalid";
			},
			isMarked: function () {
				return this.invalid;
			}
		});
	});


	QUnit.module("invalid input event when rendered with non-ASCII symbols", {
		beforeEach: function () {
			sinon.config.useFakeTimers = false;
		},
		afterEach: function () {
			sinon.config.useFakeTimers = true;
		}
	});

	QUnit.test("In IE an Input with a non ASCII symbol should mark 'oninput' event invalid when it is rendered", function (assert) {// TODO remove after the end of support for Internet Explorer

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
		sap.ui.getCore().applyChanges();

		setTimeout(function () {
			if (callCount) {
				assert.ok(isInvalid, "if the oninput event is called, it should be is marked as invalid");
			} else {
				assert.ok(true, "the oninput event is not called");
			}

			callCount = 0;
			oInput._$input.focus().val("ab").trigger("input");

			setTimeout(function () {
				assert.strictEqual(callCount, 1, "the oninput event is fired");
				assert.notOk(isInvalid, "the oninput event is valid");

				oInput.destroy();
				done();

			}, 100);
		}, 100);
	});

	QUnit.test("In IE an Input with a non ASCII symbol should mark 'oninput' event invalid when it is invalidated", function (assert) {// TODO remove after the end of support for Internet Explorer

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

		sap.ui.getCore().applyChanges();

		setTimeout(function () {
			oInput.oninput = oninputOverride;

			oInput.invalidate();
			sap.ui.getCore().applyChanges();

			setTimeout(function () {
				if (callCount) {
					assert.ok(isInvalid, "if the oninput event is called, it should be is marked as invalid");
				} else {
					assert.ok(true, "the oninput event is not called");
				}

				callCount = 0;
				oInput._$input.focus().val("ab").trigger("input");

				setTimeout(function () {
					assert.strictEqual(callCount, 1, "the oninput event is fired");
					assert.notOk(isInvalid, "the oninput event is valid");

					oInput.destroy();
					done();

				}, 100);
			}, 100);
		}, 100);
	});

	QUnit.test("In IE an Input with a non ASCII symbol should mark 'oninput' event invalid when its parent is invalidated", function (assert) {// TODO remove after the end of support for Internet Explorer

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
		sap.ui.getCore().applyChanges();

		setTimeout(function () {
			oInput.oninput = oninputOverride;

			oPanel.invalidate();
			sap.ui.getCore().applyChanges();

			setTimeout(function () {
				if (callCount) {
					assert.ok(isInvalid, "if the oninput event is called, it should be is marked as invalid");
				} else {
					assert.ok(true, "the oninput event is not called");
				}

				callCount = 0;
				oInput._$input.focus().val("ab").trigger("input");

				setTimeout(function () {
					assert.strictEqual(callCount, 1, "the oninput event is fired");
					assert.notOk(isInvalid, "the oninput event is valid");

					oInput.destroy();
					done();

				}, 100);
			}, 100);
		}, 100);
	});


	QUnit.module("Width calculations");

	QUnit.test("_calculateIconsSpace", function(assert) {
		var oInput = new InputBase(),
			oBeginIcon, oEndIcon;

		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(0, oInput._calculateIconsSpace(),
			"The space taken by the icon should be 0, when no icon present");

		oEndIcon = oInput.addEndIcon({src: "sap-icon://slim-arrow-down"});
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oEndIcon.getDomRef().offsetWidth, oInput._calculateIconsSpace(),
			"The space taken by the icon should be calculated");

		oBeginIcon = oInput.addBeginIcon({src: "sap-icon://slim-arrow-down"});
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oBeginIcon.getDomRef().offsetWidth + oEndIcon.getDomRef().offsetWidth,
			oInput._calculateIconsSpace(), "The space taken by the icons should be calculated" );

		oInput.destroy();
	});

	QUnit.module("Renderer hooks");

	QUnit.test("getInnerSuffix() is called", function(assert) {
		var oInputBase = new InputBase({}),
			oRenderer = oInputBase.getRenderer();

		//spy writeInnerId()
		var fnOnInputBaseSpy = this.spy(oRenderer, "getInnerSuffix");

		oInputBase.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(fnOnInputBaseSpy.callCount, 1, "getInnerSuffix() is called");
		assert.strictEqual(oInputBase.$(oRenderer.getInnerSuffix()).length, 1, "The inner element has proper Id");

		// cleanup
		oInputBase.destroy();
	});

	QUnit.module("Value concurrency scenario", {
		beforeEach: function () {
			this.oInput = new InputBase();
			this.oModel = new JSONModel();

			this.oInput._setPreferUserInteraction(true);
			this.oInput.bindProperty("value", {path: "/value"});
			this.oModel.setData({"value": 'Initial Value'});
			sap.ui.getCore().setModel(this.oModel);
			this.oInput.placeAt("content");
			sap.ui.getCore().applyChanges();
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
		sap.ui.test.qunit.triggerKeydown(this.oInputFocusDomRef, "ENTER");

		// assert
		assert.strictEqual(this.oInput.getValue(), "User Value",
			"The user input should not get overwritten by the model, when _bPreferUserInteraction is set to true");
	});

	QUnit.test("Value concurrency scenario - model update on a focused non-empty input with _bPreferUserInteraction = false", function(assert) {
		// act
		this.oInput._setPreferUserInteraction(false);
		this.oInput.focus();
		this.oInputFocusDomRef.value = "User Value 2";
		this.oModel.setProperty('/value', "Model Value");
		sap.ui.test.qunit.triggerKeydown(this.oInputFocusDomRef, "ENTER");

		// assert
		assert.strictEqual(this.oInput.getValue(), "Model Value",
			"The user input should be overwritten by the model, when _bPreferUserInteraction is set to false");
	});
});