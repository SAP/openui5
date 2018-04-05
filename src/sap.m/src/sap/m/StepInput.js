/*!
 * ${copyright}
 */

// Provides control sap.m.StepInput.
sap.ui.define(["jquery.sap.global", "sap/ui/core/Icon", "./Input", "./InputRenderer", "sap/ui/core/Control", "sap/ui/core/IconPool", "sap/ui/core/library", "sap/ui/core/Renderer", "sap/m/library", "jquery.sap.keycodes"],
	function (jQuery, Icon, Input, InputRenderer, Control, IconPool, coreLibrary, Renderer, library) {
		"use strict";

		// shortcut for sap.m.InputType
		var InputType = library.InputType;

		// shortcut for sap.ui.core.TextAlign
		var TextAlign = coreLibrary.TextAlign;

		// shortcut for sap.ui.core.ValueState
		var ValueState = coreLibrary.ValueState;

		/**
		 * Constructor for a new <code>StepInput</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Allows the user to change the input values with predefined increments (steps).
		 *
		 * <h3>Overview</h3>
		 *
		 * The <code>StepInput</code> consists of an input field and buttons with icons to increase/decrease the value.
		 *
		 * The user can change the value of the control by pressing the increase/decrease buttons,
		 * by typing a number directly, by using the keyboard up/down and page up/down,
		 * or by using the mouse scroll wheel. Decimal values are supported.
		 *
		 * <h3>Usage</h3>
		 *
		 * The default step is 1 but the app developer can set a different one.
		 *
		 * On desktop, the control supports a larger step, when using the keyboard page up/down keys.
		 * You can set a multiple of the step with the use of the <code>largerStep</code> property.
		 * The default value is 2 (two times the set step). For example, when using the keyboard page up/down keys
		 * the value increases/decreases with a double of the default step. If the set step is 2, the larger step is also 2
		 * and the current value is 1, using the page up key will increase the value to 5 (1 + 2*2).
		 *
		 * App developers can set a maximum and minimum value for the <code>StepInput</code>.
		 * The increase/decrease button and the up/down keyboard navigation become disabled when
		 * the value reaches the max/min or a new value is entered from the input which is greater/less than the max/min.
		 *
		 * <i>When to use</i>
		 * <ul>
		 * <li>To adjust amounts, quantities, or other values quickly.</li>
		 * <li>To adjust values for a specific step.</li>
		 * </ul>
		 *
		 * <i>When not to use</i>
		 * <ul>
		 * <li>To enter a static number (for example, postal code, phone number, or ID). In this case,
		 * use the regular {@link sap.m.Input} instead.</li>
		 * <li>To display a value that rarely needs to be adjusted and does not pertain to a particular step.
		 * In this case, use the regular {@link sap.m.Input} instead.</li>
		 * <li>To enter dates and times. In this case, use the {@link sap.m.DatePicker}, {@link sap.m.DateRangeSelection},
		 * {@link sap.m.TimePicker}, or {@link sap.m.DateTimePicker} instead.</li>
		 * </ul>
		 *
		 * @extends sap.ui.core.Control
		 * @implements sap.ui.core.IFormContent
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.40
		 * @alias sap.m.StepInput
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var StepInput = Control.extend("sap.m.StepInput", /** @lends sap.m.StepInput.prototype */ {
			metadata: {

				interfaces: ["sap.ui.core.IFormContent"],
				library: "sap.m",
				properties: {

					/**
					 * Sets the minimum possible value of the defined range.
					 */
					min: {type: "float", group: "Data"},
					/**
					 * Sets the maximum possible value of the defined range.
					 */
					max: {type: "float", group: "Data"},
					/**
					 * Increases/decreases the value of the input.
					 * <ul><b>Note:</b> <li>The value of the <code>step</code> property should not contain more digits after the decimal point than what is set to the <code>displayValuePrecision</code> property, as it may lead to an increase/decrease that is not visible for the user. For example, if the <code>value</code> is set to 1.22 and the <code>displayValuePrecision</code> is set to one digit after the decimal, the user will see 1.2. In this case, if the <code>value</code> of the <code>step</code> property is set to 1.005 and the user selects <code>increase</code>, the resulting value will increase to 1.2261 but the displayed value will remain as 1.2 as it will be rounded to the first digit after the decimal point.</li> <li>Depending on what is set for the <code>value</code> and the <code>displayValuePrecision</code> properties, it is possible the displayed value to be rounded to a higher number, for example to 3.0 when the actual value is 2.99.</li></ul>
					 */
					step: {type: "float", group: "Data", defaultValue: 1},
					/**
					 * Increases/decreases the value with a larger value than the set step only when using the PageUp/PageDown keys.
					 * Default value is 2 times larger than the set step.
					 */
					largerStep: {type: "float", group: "Data", defaultValue: 2},
					/**
					 * Determines the value of the <code>StepInput</code> and can be set initially from the app developer.
					 */
					value: {type: "float", group: "Data", defaultValue: 0},
					/**
					 * Defines the name of the control for the purposes of form submission.
					 * @since 1.44.15
					 */
					name: { type: "string", group: "Misc", defaultValue: null },
					/**
					 * Defines a short hint intended to aid the user with data entry when the control has no value.
					 * @since 1.44.15
					 */
					placeholder: { type: "string", group: "Misc", defaultValue: null },
					/**
					 * Indicates that user input is required. This property is only needed for accessibility purposes when a single relationship between
					 * the field and a label (see aggregation <code>labelFor</code> of <code>sap.m.Label</code>) cannot be established
					 * (e.g. one label should label multiple fields).
					 * @since 1.44.15
					 */
					required : {type : "boolean", group : "Misc", defaultValue : false},
					/**
					 * Defines the width of the control.
					 */
					width: {type: "sap.ui.core.CSSSize", group: "Dimension"},
					/**
					 * Accepts the core enumeration ValueState.type that supports <code>None</code>, <code>Error</code>, <code>Warning</code> and <code>Success</code>.
					 */
					valueState: {type: "sap.ui.core.ValueState", group: "Data", defaultValue: ValueState.None},
					/**
					 * Defines the text that appears in the value state message pop-up.
					 * @since 1.52
					 */
					valueStateText: { type: "string", group: "Misc", defaultValue: null },
					/**
					 * Defines whether the control can be modified by the user or not.
					 * <b>Note:</b> A user can tab to the non-editable control, highlight it, and copy the text from it.
					 */
					editable: {type: "boolean", group: "Behavior", defaultValue: true},
					/**
					 * Indicates whether the user can interact with the control or not.
					 * <b>Note:</b> Disabled controls cannot be focused and they are out of the tab-chain.
					 */
					enabled: {type: "boolean", group: "Behavior", defaultValue: true},
					/**
					 * Determines the number of digits after the decimal point.
					 *
					 * The value should be between 0 (default) and 20.
					 * In case the value is not valid it will be set to the default value.
					 * @since 1.46
					 */
					displayValuePrecision: {type: "int", group: "Data", defaultValue: 0}
				},
				aggregations: {
					/**
					 * Internal aggregation that contains the <code>Button</code> for incrementation.
					 */
					_incrementButton: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"},
					/**
					 * Internal aggregation that contains the <code>Button</code> for decrementation.
					 */
					_decrementButton: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"},
					/**
					 * Internal aggregation that contains the <code>Input</code>.
					 */
					_input: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}
				},
				associations: {
					/**
					 * Association to controls / IDs that label this control (see WAI-ARIA attribute aria-labelledby).
					 */
					ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"},
					/**
					 * Association to controls / IDs which describe this control (see WAI-ARIA attribute aria-describedby).
					 */
					ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"}
				},
				events: {
					/**
					 * Is fired when one of the following happens: <br>
					 * <ol>
					 *  <li>the text in the input has changed and the focus leaves the input field or the enter key
					 *  is pressed.</li>
					 *  <li>One of the decrement or increment buttons is pressed</li>
					 * </ol>
					 */
					change: {
						parameters: {
							/**
							 * The new <code>value</code> of the <code>control</code>.
							 */
							value: {type: "string"}
						}
					}
				}
			},
			constructor : function (vId, mSettings) {
				Control.prototype.constructor.apply(this, arguments);
				if (this.getEditable()) {
					this._getOrCreateDecrementButton();
					this._getOrCreateIncrementButton();
				}

				if (typeof vId !== "string"){
					mSettings = vId;
				}

				if (mSettings && mSettings.value === undefined){
					this.setValue(this._getDefaultValue(undefined, mSettings.max, mSettings.min));
				}
			}
		});

		// get resource translation bundle;
		var oLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		StepInput.STEP_INPUT_INCREASE_BTN_TOOLTIP = oLibraryResourceBundle.getText("STEP_INPUT_INCREASE_BTN");
		StepInput.STEP_INPUT_DECREASE_BTN_TOOLTIP = oLibraryResourceBundle.getText("STEP_INPUT_DECREASE_BTN");

		/**
		 * Map between StepInput properties and their corresponding aria attributes.
		 */
		var mNameToAria = {
			"min": "aria-valuemin",
			"max": "aria-valuemax",
			"value": "aria-valuenow"
		};

		/**
		 * Property names which when set are directly forwarded to inner input <code>setProperty</code> method
		 * @type {Array.<string>}
		 */
		var aForwardableProps = ["enabled", "editable", "name", "placeholder", "required", "valueStateText"];

		//Accessibility behaviour of the Input needs to be extended
		var NumericInputRenderer = Renderer.extend(InputRenderer);

		/**
		 * Overwrites the accessibility state using the getAccessibilityState method of the InputBaseRenderer.
		 *
		 * @param {NumericInput} oNumericInput
		 * @returns {Array} mAccAttributes
		 */
		NumericInputRenderer.getAccessibilityState = function(oNumericInput) {
			var mAccAttributes = sap.m.InputBaseRenderer.getAccessibilityState(oNumericInput),
				oStepInput = oNumericInput.getParent(),
				fMin = oStepInput.getMin(),
				fMax = oStepInput.getMax(),
				fNow = oStepInput.getValue(),
				sLabeledBy = oStepInput.getAriaLabelledBy().join(" "),
				sDescribedBy = oStepInput.getAriaDescribedBy().join(" ");

			mAccAttributes["role"] = "spinbutton";
			mAccAttributes["valuenow"] = fNow;

			if (typeof fMin === "number") {
				mAccAttributes["valuemin"] = fMin;
			}

			if (typeof fMax === "number") {
				mAccAttributes["valuemax"] = fMax;
			}

			if (sDescribedBy){
				mAccAttributes["describedby"] = sDescribedBy;
			}

			if (sLabeledBy){
				mAccAttributes["labelledby"] = sLabeledBy;
			}

			return mAccAttributes;
		};

		/**
		 * Write the id of the inner input
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		NumericInputRenderer.writeInnerId = function(oRm, oControl) {
			oRm.writeAttribute("id", oControl.getId() + "-" + NumericInputRenderer.getInnerSuffix(oControl));
		};

		/**
		 * Define own inner ID suffix.
		 * @returns {string} The own inner ID suffix
		 */
		NumericInputRenderer.getInnerSuffix = function() {
			return "inner";
		};

		var NumericInput = Input.extend("sap.m.internal.NumericInput", {
			constructor: function(sId, mSettings) {
				return Input.apply(this, arguments);
			},
			renderer: NumericInputRenderer
		});

		/**
		 * Initializes the control.
		 */
		StepInput.prototype.init = function () {
			this._iRealPrecision = 0;
			this._attachChange();
			this._attachLiveChange();
		};

		/**
		 * Called before the control is rendered.
		 */
		StepInput.prototype.onBeforeRendering = function () {
			var fMin = this.getMin(),
				fMax = this.getMax(),
				vValue = this.getValue();

			this._iRealPrecision = this._getRealValuePrecision();

			this._getInput().setValue(this._getFormatedValue(vValue));

			if (this._isNumericLike(fMin) && (fMin > vValue)) {
				this.setValue(fMin);
			}
			if (this._isNumericLike(fMax) && (fMax < vValue)) {
				this.setValue(fMax);
			}
			this._disableButtons(vValue, fMax, fMin);
		};

		StepInput.prototype.setProperty = function (sPropertyName, oValue, bSuppressInvalidate) {
			this._writeAccessibilityState(sPropertyName, oValue);

			if (aForwardableProps.indexOf(sPropertyName) > -1) {
				this._getInput().setProperty(sPropertyName, oValue, bSuppressInvalidate);
			}

			return Control.prototype.setProperty.call(this, sPropertyName, oValue, bSuppressInvalidate);
		};

		/*
		 * Sets the min value.
		 *
		 * @param {float} min The minimum value
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 */
		StepInput.prototype.setMin = function (min) {
			var oResult,
				vValue = this.getValue(),
				bSuppressInvalidate = (vValue !== 0 && !vValue);

			if (min === undefined) {
				return this.setProperty("min", min, true);
			}
			if (!this._validateOptionalNumberProperty("min", min)) {
				return this;
			}

			oResult = this.setProperty("min", min, bSuppressInvalidate);
			this._disableButtons(vValue, this.getMax(), min);

			this._verifyValue();

			return oResult;
		};

		/*
		 * Sets the max value.
		 *
		 * @param {float} max The max value
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 */
		StepInput.prototype.setMax = function (max) {
			var oResult,
				vValue = this.getValue(),
				bSuppressInvalidate = (vValue !== 0 && !vValue);

			if (max === undefined) {
				return this.setProperty("max", max, true);
			}
			if (!this._validateOptionalNumberProperty("max", max)) {
				return this;
			}

			oResult =  this.setProperty("max", max, bSuppressInvalidate);
			this._disableButtons(this.getValue(), max, this.getMin());

			this._verifyValue();
			return oResult;
		};

		/**
		 * Verifies if the given value is of a numeric type.
		 *
		 * @param {string} name Property name
		 * @param {variant} value Property value
		 * @returns {boolean} The result of the check. Numbers of type "string" are also valid.
		 * @private
		 */
		StepInput.prototype._validateOptionalNumberProperty = function (name, value) {
			if (this._isNumericLike(value)) {
				return true;
			}

			jQuery.sap.log.error("The value of property '" + name + "' must be a number");
			return false;
		};

		/*
		 * Sets the <code>displayValuePrecision</code>.
		 *
		 * @param {number} number The value precision
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 */
		StepInput.prototype.setDisplayValuePrecision = function (number) {
			var vValuePrecision,
				vValue = this.getValue(),
				bSuppressInvalidate = (vValue !== 0 && !vValue);

			if (isValidPrecisionValue(number)) {
				vValuePrecision = parseInt(number, 10);
			} else {
				vValuePrecision = 0;
				jQuery.sap.log.warning(this + ": ValuePrecision (" + number + ") is not correct. It should be a number between 0 and 20! Setting the default ValuePrecision:0.");
			}

			return this.setProperty("displayValuePrecision", vValuePrecision, bSuppressInvalidate);
		};

		/**
		 * Sets a new tooltip for this object.
		 * @link sap.ui.core.Element#setTooltip
		 * @param {string|sap.ui.core.TooltipBase} sTooltip The value of tooltip
		 */
		StepInput.prototype.setTooltip = function (sTooltip) {
			//We need to call the special logic implemented in InputBase.prototype.setTooltip
			this._getInput().setTooltip(sTooltip);
		};

		/**
		 * Retrieves the <code>incrementButton</code>.
		 * @returns {sap.ui.core.Icon} the icon that serves as (lightweight) button
		 * @private
		 */
		StepInput.prototype._getIncrementButton = function () {
			return this.getAggregation("_incrementButton");
		};

		/**
		 * Retrieves the <code>decrementButton</code>.
		 * @returns {sap.ui.core.Icon} the icon that serves as (lightweight) button
		 * @private
		 */
		StepInput.prototype._getDecrementButton = function () {
			return this.getAggregation("_decrementButton");
		};

		/**
		 * Creates the <code>incrementButton</code>.
		 * @returns {sap.ui.core.Icon} the icon that serves as (lightweight) button
		 * @private
		 */
		StepInput.prototype._createIncrementButton = function () {
			this.setAggregation("_incrementButton", new Icon({
				src: IconPool.getIconURI("add"),
				id: this.getId() + "-incrementBtn",
				noTabStop: true,
				press: this._handleButtonPress.bind(this, true),
				tooltip: StepInput.STEP_INPUT_INCREASE_BTN_TOOLTIP
			}));
			return this.getAggregation("_incrementButton");
		};

		/**
		 * Creates the <code>decrementButton</code>.
		 * @returns {sap.ui.core.Icon} the icon that serves as (lightweight) button
		 * @private
		 */
		StepInput.prototype._createDecrementButton = function() {
			this.setAggregation("_decrementButton", new Icon({
				src: IconPool.getIconURI("less"),
				id: this.getId() + "-decrementBtn",
				noTabStop: true,
				press: this._handleButtonPress.bind(this, false),
				tooltip: StepInput.STEP_INPUT_DECREASE_BTN_TOOLTIP
			}));

			return this.getAggregation("_decrementButton");
		};

		/**
		 * Lazily retrieves the <code>Input</code>.
		 *
		 * @returns {sap.m.Input} The underlying input control
		 * @private
		 */
		StepInput.prototype._getInput = function () {
			if (!this.getAggregation("_input")) {
				var oNumericInput = new NumericInput({
					id: this.getId() + "-input",
					textAlign: TextAlign.End,
					type: InputType.Number,
					editable: this.getEditable(),
					enabled: this.getEnabled(),
					liveChange: this._inputLiveChangeHandler
				});
				this.setAggregation("_input", oNumericInput);
			}

			return this.getAggregation("_input");
		};

		/**
		 * Handles the button press.
		 *
		 * @param {boolean} isPlusButton Indicates the pressed button either the increment or decrement one
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 * @private
		 */
		StepInput.prototype._handleButtonPress = function (isPlusButton) {
			var oNewValue = this._calculateNewValue(1, isPlusButton),
				fMin = this.getMin(),
				fMax = this.getMax();

			this._disableButtons(oNewValue.displayValue, fMax, fMin);
			this.setValue(oNewValue.value);
			this._verifyValue();

			if (this._iChangeEventTimer) {
				jQuery.sap.clearDelayedCall(this._iChangeEventTimer);
			}
			if (this._sOldValue !== this.getValue()) {
				this.fireChange({value: this.getValue()});
			}

			// Return the focus on the main element
			this.$().focus();

			return this;
		};

		/**
		 * Handles whether the increment and decrement buttons should be enabled/disabled based on different situations.
		 *
		 * @param {number} value Indicates the value in the input
		 * @param {number} max Indicates the max
		 * @param {number} min Indicates the min
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 */
		StepInput.prototype._disableButtons = function (value, max, min) {

			if (!this.getDomRef() || !this._isNumericLike(value)){
				return;
			}

			var bMaxIsNumber = this._isNumericLike(max),
				bMinIsNumber = this._isNumericLike(min);

			if (this._getDecrementButton()) {
				if (bMinIsNumber && min < value && this.getEnabled()) {
					this._getDecrementButton().$().removeClass("sapMStepInputIconDisabled");
				}
				if (bMinIsNumber && value <= min) {
					this._getDecrementButton().$().addClass("sapMStepInputIconDisabled");
				}
			}
			if (this._getIncrementButton()) {
				if (bMaxIsNumber && value < max && this.getEnabled()) {
					this._getIncrementButton().$().removeClass("sapMStepInputIconDisabled");
				}
				if (bMaxIsNumber && value >= max) {
					this._getIncrementButton().$().addClass("sapMStepInputIconDisabled");
				}
			}

			return this;
		};

		/**
		 * Handles the <code>focusout</code> event.
		 *
		 */
		StepInput.prototype.onfocusout = function () {
			// when the value is set programaticaly (e.g. with setValue())
			// and the user pass through the field and then leave it
			// we have to verify the value inside since the Input does not fire change event
			this._verifyValue();
		};

		/**
		 * Sets the <code>valueState</code> if there is a value that is not within a given limit.
		 */
		StepInput.prototype._verifyValue = function () {
			var min = this.getMin(),
				max = this.getMax(),
				value = parseFloat(this._getInput().getValue());

			if (!this._isNumericLike(value)){
				return;
			}

			if ((this._isNumericLike(max) && value > max) || (this._isNumericLike(min) && value < min)) {
				this.setValueState(ValueState.Error);
			} else {
				this.setValueState(ValueState.None);
			}
		};

		/*
		 * Sets the <code>value</code> by doing some rendering optimizations in case the first rendering was completed.
		 * Otherwise the value is set in onBeforeRendering, where we have all needed parameters for obtaining correct value.
		 * @param {object} oValue The value to be set
		 *
		 */
		StepInput.prototype.setValue = function (oValue) {
			var oResult;

			if (oValue == undefined) {
				oValue = 0;
			}

			this._sOldValue = this.getValue();

			if (!this._validateOptionalNumberProperty("value", oValue)) {
				return this;
			}

			this._getInput().setValue(this._getFormatedValue(oValue));

			this._disableButtons(oValue, this.getMax(), this.getMin());

			oResult = this.setProperty("value", parseFloat(oValue), true);

			this._iRealPrecision = this._getRealValuePrecision();
			return oResult;
		};

		/**
		 * Formats the <code>vValue</code> accordingly to the <code>displayValuePrecision</code> property.
		 * if vValue is undefined or null, the property <code>value</code> will be used.
		 *
		 * @returns formated value as a String
		 * @private
		 */
		StepInput.prototype._getFormatedValue = function (vValue) {
			var iPrecision = this.getDisplayValuePrecision(),
				iValueLength,
				sDigits;

			if (vValue == undefined) {
				vValue = this.getValue();
			}

			if (iPrecision <= 0) {
				// return value without any decimals
				return parseFloat(vValue).toFixed(0);
			}

			sDigits = vValue.toString().split(".");

			if (sDigits.length === 2) {
				iValueLength = sDigits[1].length;
				if (iValueLength > iPrecision) {
					return parseFloat(vValue).toFixed(iPrecision);
				}
				return sDigits[0] + "." + this._padZeroesRight(sDigits[1], iPrecision);
			} else {
				return vValue.toString() + "." + this._padZeroesRight("0", iPrecision);
			}

		};

		/**
		 * Adds zeros to the value according to the given iPrecision.
		 *
		 * @param {string} value The value to which the zeros will be added
		 * @param {int} precision The given precision
		 * @returns {string} value padded with zeroes
		 * @private
		 */
		StepInput.prototype._padZeroesRight = function (value, precision) {
			var sResult = "",
				iValueLength = value.length;

			// add zeros
			for (var i = iValueLength; i < precision; i++) {
				sResult = sResult + "0";
			}
			sResult = value + sResult;

			return sResult;
		};

		/**
		 * Handles the <code>onsappageup</code>.
		 *
		 * Increases the value with the larger step.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsappageup = function (oEvent) {
			this._applyValue(this._calculateNewValue(this.getLargerStep(), true).displayValue);
			this._verifyValue();
			// prevent document scrolling when page up key is pressed
			oEvent.preventDefault();
		};

		/**
		 * Handles the <code>onsappagedown</code> - PageDown key decreases the value with the larger step.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsappagedown = function (oEvent) {
			this._applyValue(this._calculateNewValue(this.getLargerStep(), false).displayValue);
			this._verifyValue();
			// prevent document scrolling when page down key is pressed
			oEvent.preventDefault();
		};

		/**
		 * Handles the Shift + PageUp key combination and sets the value to maximum.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsappageupmodifiers = function (oEvent) {
			if (this._isNumericLike(this.getMax()) && !(oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) && oEvent.shiftKey) {
				this._applyValue(this.getMax());
			}
		};

		/**
		 * Handles the Shift + PageDown key combination and sets the value to minimum.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsappagedownmodifiers = function (oEvent) {
			if (this._isNumericLike(this.getMin()) && !(oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) && oEvent.shiftKey) {
				this._applyValue(this.getMin());
			}
		};

		/**
		 * Handles the <code>onsapup</code> and increases the value with the default step (1).
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsapup = function (oEvent) {
			oEvent.preventDefault(); //prevents the value to increase by one (Chrome and Firefox default behavior)
			this._applyValue(this._calculateNewValue(1, true).displayValue);
			this._verifyValue();
		};

		/**
		 * Handles the <code>onsapdown</code> and decreases the value with the default step (1).
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsapdown = function (oEvent) {
			oEvent.preventDefault(); //prevents the value to decrease by one (Chrome and Firefox default behavior)
			this._applyValue(this._calculateNewValue(1, false).displayValue);
			this._verifyValue();
		};

		/**
		 * Handles the Ctrl + Shift + Up/Down and Shift + Up/Down key combinations and sets the value to maximum/minimum
		 * or increases/decreases the value with the larger step.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onkeydown = function (oEvent) {
			if (oEvent.which === jQuery.sap.KeyCodes.ARROW_UP && !oEvent.altKey && oEvent.shiftKey &&
				(oEvent.ctrlKey || oEvent.metaKey)) { //ctrl+shift+up
				this._applyValue(this.getMax());
			}
			if (oEvent.which === jQuery.sap.KeyCodes.ARROW_DOWN && !oEvent.altKey && oEvent.shiftKey &&
				(oEvent.ctrlKey || oEvent.metaKey)) { //ctrl+shift+down
				this._applyValue(this.getMin());
			}
			if (oEvent.which === jQuery.sap.KeyCodes.ARROW_UP && !(oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) && oEvent.shiftKey) { //shift+up
				oEvent.preventDefault(); //preventing to be added both the minimum step (1) and the larger step
				this._applyValue(this._calculateNewValue(this.getLargerStep(), true).displayValue);
			}
			if (oEvent.which === jQuery.sap.KeyCodes.ARROW_DOWN && !(oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) && oEvent.shiftKey) { //shift+down
				oEvent.preventDefault(); //preventing to be subtracted  both the minimum step (1) and the larger step
				this._applyValue(this._calculateNewValue(this.getLargerStep(), false).displayValue);
			}
			this._verifyValue();
		};

		/**
		 * Handles the Esc key and reverts the value in the input field to the previous one.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsapescape = function (oEvent) {
			this._getInput().onsapescape(oEvent);
		};

		/**
		 * Attaches the <code>liveChange</code> handler for the input.
		 * @private
		 */
		StepInput.prototype._attachLiveChange = function () {
			this._getInput().attachLiveChange(this._liveChange, this);
		};

		StepInput.prototype._attachChange = function () {
			this._getInput().attachChange(this._change, this);
		};

		/**
		 * Attaches the <code>liveChange</code> handler for the input.
		 * @private
		 */
		StepInput.prototype._liveChange = function () {
			this._verifyValue();
			this._disableButtons(this._getInput().getValue(), this.getMax(), this.getMin());
		};

		/**
		 * Handles the <code>change</code> event for the input.
		 * @param {Object} oEvent The fired event
		 * @private
		 */
		StepInput.prototype._change = function (oEvent) {
			this._sOldValue = this.getValue();

			this._verifyValue();
			this.setValue(this._getDefaultValue(this._getInput().getValue(), this.getMax(), this.getMin()));

			if (this._iChangeEventTimer) {
				jQuery.sap.clearDelayedCall(this._iChangeEventTimer);
			}

			/* In case the reason for change event is pressing +/- button(input loses focus),
			 * this will lead to firing the StepInput#change event twice.
			 * This is why we "schedule" a task for event firing, which will be executed unless the +/- button press handler
			 * invalidates it.
			 **/
			this._iChangeEventTimer = jQuery.sap.delayedCall(100, this, function() {
				if (this._sOldValue !== this.getValue()) {
					this.fireChange({value: this.getValue()});
				}
			});

		};

		/**
		 * Applies change on the visible value but doesn't force the other checks that come with <code>this.setValue</code>.
		 * Usable for Keyboard Handling when resetting initial value with ESC key.
		 *
		 * @param {float} fNewValue The new value to be applied
		 * @private
		 */
		StepInput.prototype._applyValue = function (fNewValue) {
			if (!this.getEditable() || !this.getEnabled()) {
				return;
			}

			// the property Value is not changing because this is a live change where the final value is not yet confirmed by the user
			this.getAggregation("_input")._$input.val(this._getFormatedValue(fNewValue));
		};

		/**
		 * Makes calculations regarding the operation and the number type.
		 *
		 * @param {number} stepMultiplier Holds the step multiplier
		 * @param {boolean} isIncreasing Holds the operation(or direction) whether addition(increasing) or subtraction(decreasing)
		 * @returns {{value, displayValue}} The result of the calculation where:
		 * <ul>
		 * <li>value is the result of the computation where the real stepInput <value> is used</li>
		 * <li>displayValue is the result of the computation where the DOM value (also sap.m.Input.getValue()) is used</li>
		 * </ul>
		 * @private
		 */
		StepInput.prototype._calculateNewValue = function (stepMultiplier, isIncreasing) {
			var fStep = this.getStep(),
				fMax = this.getMax(),
				fMin = this.getMin(),
				fRealValue = this.getValue(),
				fInputValue = parseFloat(this._getDefaultValue(this._getInput().getValue(), fMax, fMin)),
				iSign = isIncreasing ? 1 : -1,
				fMultipliedStep = Math.abs(fStep) * Math.abs(stepMultiplier),
				fResult = fInputValue + iSign * fMultipliedStep,
				fDisplayValueResult,
				fValueResult,
				iDisplayValuePrecision = this.getDisplayValuePrecision();

			if (iDisplayValuePrecision > 0) {
				fDisplayValueResult = this._sumValues(fInputValue, fMultipliedStep, iSign, iDisplayValuePrecision);
			} else {
				fDisplayValueResult = fInputValue + iSign * fMultipliedStep;
			}

			fValueResult = this._sumValues(fRealValue, fMultipliedStep, iSign, this._iRealPrecision);

			if (isIncreasing && this._isNumericLike(fMax)){
				if (fResult >= fMax) { //calculated value is bigger than max
					fValueResult = fMax;
					fDisplayValueResult = fMax;
				}
			}

			if (!isIncreasing && this._isNumericLike(fMin)){
				if (fResult <= fMin) { //calculated value is less than min
					fValueResult = fMin;
					fDisplayValueResult = fMin;
				}
			}

			return {value: fValueResult, displayValue: fDisplayValueResult};
		};

		/**
		 * Returns the bigger value precision by comparing
		 * the precision of the value and the precision of the step.
		 *
		 * @returns {int} number of digits after the dot
		 */
		StepInput.prototype._getRealValuePrecision = function () {
			var sDigitsValue = this.getValue().toString().split("."),
				sDigitsStep = this.getStep().toString().split("."),
				iDigitsValueL,
				iDigitsStepL;

			iDigitsValueL = (!sDigitsValue[1]) ? 0 : sDigitsValue[1].length;
			iDigitsStepL = (!sDigitsStep[1]) ? 0 : sDigitsStep[1].length;

			return (iDigitsValueL > iDigitsStepL) ? iDigitsValueL : iDigitsStepL;
		};

		/*
		 * Handles the value state of the control.
		 *
		 * @param  {string} valueState The given value state
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 */
		StepInput.prototype.setValueState = function (valueState) {
			var bError = false,
				bWarning = false;

			switch (valueState) {
				case ValueState.Error:
					bError = true;
					break;
				case ValueState.Warning:
					bWarning = true;
					break;
				case ValueState.Success:
				case ValueState.None:
					break;
				default:
					return this;
			}
			this._getInput().setValueState(valueState);

			jQuery.sap.delayedCall(0, this, function () {
				this.$().toggleClass("sapMStepInputError", bError).toggleClass("sapMStepInputWarning", bWarning);
			});

			this.setProperty("valueState", valueState, true);

			return this;
		};

		/*
		 * Sets the editable property.
		 *
		 * @param {boolean} editable - Indicates if the value is editable
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 */
		StepInput.prototype.setEditable = function (editable) {
			var oResult = StepInput.prototype.setProperty.call(this, "editable", editable);
			editable = this.getEditable();

			if (this.getEditable()) {
				this._getOrCreateDecrementButton().setVisible(true);
				this._getOrCreateIncrementButton().setVisible(true);
			} else {
				this._getDecrementButton() && this._getDecrementButton().setVisible(false);
				this._getIncrementButton() && this._getIncrementButton().setVisible(false);
			}

			return oResult;
		};

		/**
		 * Checks whether there is an existing instance of a <code>_decrementButton</code> or it has to be created one.
		 *
		 * @returns {sap.ui.core.Icon} the icon that serves as (lightweight) button
		 * @private
		 */
		StepInput.prototype._getOrCreateDecrementButton = function(){
			return this.getAggregation("_decrementButton") ? this._getDecrementButton() : this._createDecrementButton();
		};

		/**
		 * Checks whether there is an existing instance of a <code>_incrementButton</code> or it has to be created one.
		 *
		 * @returns {sap.ui.core.Icon} the icon that serves as (lightweight) button
		 * @private
		 */
		StepInput.prototype._getOrCreateIncrementButton = function(){
			return this.getAggregation("_incrementButton") ? this._getIncrementButton() : this._createIncrementButton();
		};

		/**
		 * <code>liveChange</code> handler.
		 * @param {sap.ui.base.Event} oEvent Event object
		 * @private
		 */
		StepInput.prototype._inputLiveChangeHandler = function (oEvent) {
			this.setProperty("value", oEvent.getParameter("newValue"), true);
		};

		/**
		 * Returns a default value depending of the given value, min and max properties.
		 *
		 * @param {number} value Indicates the value
		 * @param {number} max Indicates the max
		 * @param {number} min Indicates the min
		 * @returns {number} The default value
		 * @private
		 */
		StepInput.prototype._getDefaultValue = function (value, max, min) {
			if (value !== "" && value !== undefined) {
				return this._getInput().getValue();
			}

			if (this._isNumericLike(min) && min > 0) {
				return min;
			} else if (this._isNumericLike(max) && max < 0) {
				return max;
			} else {
				return 0;
			}

		};

		/**
		 * Checks whether the value is a number.
		 *
		 * @param {variant} val - Holds the value
		 * @returns {boolean} Whether the value is a number
		 * @private
		 */
		StepInput.prototype._isNumericLike = function (val) {
			return !isNaN(val) && val !== null && val !== "";
		};

		StepInput.prototype._writeAccessibilityState = function (sProp, sValue) {
			var $input = this._getInput().getDomRef(NumericInputRenderer.getInnerSuffix());

			if (!$input){
				return;
			}

			if (sProp && mNameToAria[sProp]) {
				$input.setAttribute(mNameToAria[sProp], sValue);
			}
		};

		/*
		 * Sums 2 real values by converting them to integers before summing them and restoring the result back to a real value.
		 * This avoids rounding issues.
		 * @param {number} fValue1 the first value to sum
		 * @param {number} fValue2 the second value to sum
		 * @param {int} iSign +1 if the values should be summed, or -1 if the second should be extracted from the first
		 * @param {int} iPrecision the precision the computation should be. Best would be to equal the precision of the
		 * bigger of fValue1 and fValue2.
		 * @returns {number}
		 * @private
		 */
		StepInput.prototype._sumValues = function(fValue1, fValue2, iSign, iPrecision) {
			var iPrecisionMultiplier = Math.pow(10, iPrecision);

			return (parseInt(fValue1 * iPrecisionMultiplier, 10) +
				(iSign * parseInt(fValue2 * iPrecisionMultiplier, 10))) / iPrecisionMultiplier;
		};

		/*
		 * displayValuePrecision should be a number between 0 and 20
		 * @returns {boolean}
		 */
		function isValidPrecisionValue(value) {
			return (typeof (value) === 'number') && !isNaN(value) && value >= 0 && value <= 20;
		}

		return StepInput;
	});
