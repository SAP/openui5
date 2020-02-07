/*!
 * ${copyright}
 */

// Provides control sap.m.StepInput.
sap.ui.define([
	"sap/ui/core/Icon",
	"./Input",
	"./InputBase",
	"./InputRenderer",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"sap/ui/core/LabelEnablement",
	"sap/ui/core/message/MessageMixin",
	"sap/ui/model/ValidateException",
	"sap/ui/Device",
	"sap/ui/core/library",
	"sap/ui/core/Renderer",
	"sap/m/library",
	"./StepInputRenderer",
	"sap/ui/events/KeyCodes",
	"sap/base/Log"
],
function(
	Icon,
	Input,
	InputBase,
	InputRenderer,
	Control,
	IconPool,
	LabelEnablement,
	MessageMixin,
	ValidateException,
	Device,
	coreLibrary,
	Renderer,
	library,
	StepInputRenderer,
	KeyCodes,
	Log
) {
		"use strict";

		// shortcut for sap.m.InputType
		var InputType = library.InputType;

		// shortcut for sap.ui.core.TextAlign
		var TextAlign = coreLibrary.TextAlign;

		// shortcut for sap.ui.core.ValueState
		var ValueState = coreLibrary.ValueState;

		// shortcut for sap.m.StepInputValidationMode
		var StepInputValidationMode = library.StepInputValidationMode;

		// shortcut fro sap.m.StepModes
		var StepModeType = library.StepInputStepModeType;

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
		 * <b>Note:</b> The control uses a JavaScript number to keep its value, which
		 * has a certain precision limitation.
		 *
		 * In general, exponential notation is used:
		 * <ul>
		 * <li>if there are more than 21 digits before the decimal point.</li>
		 * <li>if number starts with "0." followed by more than five zeros.</li>
		 * </ul>
		 *
		 * Exponential notation is not supported by the control and using it may lead to
		 * unpredictable behavior.
		 *
		 * Also, the JavaScript number persists its precision up to 16 digits. If the user enters
		 * a number with a greater precision, the value will be rounded.
		 *
		 * This limitation comes from JavaScript itself and it cannot be worked around in a
		 * feasible way.
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
		 * @see {@link fiori:https://experience.sap.com/fiori-design-web/step-input/ Step Input}
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var StepInput = Control.extend("sap.m.StepInput", /** @lends sap.m.StepInput.prototype */ {
			metadata: {

				interfaces: ["sap.ui.core.IFormContent"],
				library: "sap.m",
				designtime: "sap/m/designtime/StepInput.designtime",
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
					 * Defines the calculation mode for the provided <code>step</code> and <code>largerStep</code>.
					 *
					 * If the user increases/decreases the value by <code>largerStep</code>, this calculation will consider
					 * it as well. For example, if the current <code>value</code> is 3, <code>step</code> is 5,
					 * <code>largerStep</code> is 5 and the user chooses PageUp, the calculation logic will consider
					 * the value of 3x5=15 to decide what will be the next <code>value</code>.
					 *
					 * @since 1.54
					 */
					stepMode: {type: "sap.m.StepInputStepModeType", group: "Data", defaultValue: StepModeType.AdditionAndSubtraction},
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
					displayValuePrecision: {type: "int", group: "Data", defaultValue: 0},
					/**
					 * Determines the description text after the input field, for example units of measurement, currencies.
					 * @since 1.54
					 */
					description: {type : "string", group : "Misc", defaultValue : null},
					/**
					 * Determines the distribution of space between the input field
					 * and the description text . Default value is 50% (leaving the other
					 * 50% for the description).
					 *
					 * <b>Note:</b> This property takes effect only if the
					 * <code>description</code> property is also set.
					 * @since 1.54
					 */
					fieldWidth: {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : '50%'},
					/**
					 * Defines the horizontal alignment of the text that is displayed inside the input field.
					 * @since 1.54
					 */
					textAlign: {type: "sap.ui.core.TextAlign", group: "Appearance", defaultValue: TextAlign.End},
					/**
					 * Defines when the validation of the typed value will happen. By default this happens on focus out.
					 * @since 1.54
					 */
					validationMode: {type: "sap.m.StepInputValidationMode", group: "Misc", defaultValue: StepInputValidationMode.FocusOut}
				},
				aggregations: {
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
				},
				dnd: { draggable: false, droppable: true }
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

		StepInput.INITIAL_WAIT_TIMEOUT = 500;
		StepInput.ACCELLERATION = 0.8;
		StepInput.MIN_WAIT_TIMEOUT = 50;
		StepInput.INITIAL_SPEED = 120; //milliseconds
		StepInput._TOLERANCE = 10; // pixels

		/**
		 * Property names which when set are directly forwarded to inner input <code>setProperty</code> method
		 * @type {Array.<string>}
		 */
		var aForwardableProps = ["enabled", "editable", "name", "placeholder", "required", "valueStateText", "description", "fieldWidth", "textAlign"];


		/****************************************** NUMERIC INPUT CONTROL ****************************************************/

		var NumericInputRenderer = Renderer.extend(InputRenderer);

		NumericInputRenderer.writeInnerAttributes = function(oRm, oControl) {
			var oStepInput = oControl.getParent();
			// inside the Input this function also sets explicitly textAlign to "End" if the type
			// of the Input is Numeric (our case)
			// so we have to overwrite it by leaving only the text direction
			// and the textAlign will be controlled by textAlign property of the StepInput
			oRm.writeAttribute("type", oControl.getType().toLowerCase());
			if (sap.ui.getCore().getConfiguration().getRTL()) {
				oRm.writeAttribute("dir", "ltr");
			}
			oRm.writeAccessibilityState(oStepInput);
		};

		//Accessibility behavior of the Input needs to be extended
		/**
		 * Overwrites the accessibility state using the <code>getAccessibilityState</code> method of the <code>InputBaseRenderer</code>.
		 *
		 * @param {NumericInput} oNumericInput The numeric input instance
		 * @returns {Array} mAccAttributes
		 */
		NumericInputRenderer.getAccessibilityState = function(oNumericInput) {
			var mAccAttributes = InputRenderer.getAccessibilityState(oNumericInput),
				oStepInput = oNumericInput.getParent(),
				fMin = oStepInput._getMin(),
				fMax = oStepInput._getMax(),
				fNow = oStepInput.getValue(),
				sDescription = oStepInput.getDescription(),
				aAriaLabelledByRefs = oStepInput.getAriaLabelledBy(),
				// If we don't check this manually, we won't have the labels, which were referencing SI,
				// in aria-labelledby (which normally comes out of the box). This is because writeAccessibilityState
				// is called for NumericInput, while any labels will be for the parent StepInput.
				aReferencingLabels = LabelEnablement.getReferencingLabels(oStepInput),
				sDescribedBy = oStepInput.getAriaDescribedBy().join(" "),
				sResultingLabelledBy;

			mAccAttributes["role"] = "spinbutton";
			mAccAttributes["valuenow"] = fNow;

			if (sDescription) {
				// If there is a description, we should add a reference to it in the aria-labelledby
				aAriaLabelledByRefs.push(oStepInput._getInput().getId() + "-descr");
			}

			sResultingLabelledBy = aReferencingLabels.concat(aAriaLabelledByRefs).join(" ");

			if (typeof fMin === "number") {
				mAccAttributes["valuemin"] = fMin;
			}

			if (typeof fMax === "number") {
				mAccAttributes["valuemax"] = fMax;
			}

			if (sDescribedBy){
				mAccAttributes["describedby"] = sDescribedBy;
			}

			if (sResultingLabelledBy){
				mAccAttributes["labelledby"] = sResultingLabelledBy;
			}

			return mAccAttributes;
		};

		var NumericInput = Input.extend("sap.m.internal.NumericInput", {
			metadata: {
				library: "sap.m"
			},
			constructor: function(sId, mSettings) {
				return Input.apply(this, arguments);
			},
			renderer: NumericInputRenderer
		});

		NumericInput.prototype.onBeforeRendering = function() {
			InputBase.prototype.onBeforeRendering.call(this);

			this._deregisterEvents();
		};

		NumericInput.prototype.setValue = function(sValue) {
			Input.prototype.setValue.apply(this, arguments);

			if (this.getDomRef()) {
				document.getElementById(this.getId() + "-inner").setAttribute("aria-valuenow", sValue);
			}

			return this;
		};

		MessageMixin.call(StepInput.prototype);

		/**
		 * Initializes the control.
		 */
		StepInput.prototype.init = function () {
			this._iRealPrecision = 0;
			this._attachChange();
			this._bPaste = false; //needed to indicate when a paste is made
			this._onmousewheel = this._onmousewheel.bind(this);
			window.addEventListener("contextmenu", function(e) {
				if (this._btndown === false && e.target.className.indexOf("sapMInputBaseIconContainer") !== -1) {
					e.preventDefault();
				}
			}.bind(this));
		};

		/**
		 * Called before the control is rendered.
		 */
		StepInput.prototype.onBeforeRendering = function () {
			var fMin = this._getMin(),
				fMax = this._getMax(),
				vValue = this._getInput()._$input.val() || this.getValue(),
				bEditable = this.getEditable();

			this._iRealPrecision = this._getRealValuePrecision();

			this._getInput().setValue(this._getFormattedValue(vValue));
			this._getInput().setValueState(this.getValueState());
			this._getInput().setTooltip(this.getTooltip());
			this._getOrCreateDecrementButton().setVisible(bEditable);
			this._getOrCreateIncrementButton().setVisible(bEditable);

			this._disableButtons(vValue, fMax, fMin);
			this.$().unbind(Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", this._onmousewheel);
		};

		StepInput.prototype.onAfterRendering = function () {
			this.$().bind(Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", this._onmousewheel);
		};

		StepInput.prototype.exit = function () {
			this.$().unbind(Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", this._onmousewheel);
		};

		StepInput.prototype.setProperty = function (sPropertyName, oValue, bSuppressInvalidate) {
			Control.prototype.setProperty.call(this, sPropertyName, oValue, bSuppressInvalidate);

			if (aForwardableProps.indexOf(sPropertyName) > -1) {
				this._getInput().setProperty(sPropertyName, this.getProperty(sPropertyName), bSuppressInvalidate);
			}

			return this;
		};

		/**
		 * Sets the validation mode.
		 *
		 * @param {sap.m.StepInputValidationMode} sValidationMode The validation mode value
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 */
		StepInput.prototype.setValidationMode = function (sValidationMode) {
			if (this.getValidationMode() !== sValidationMode) {
				switch (sValidationMode) {
					case StepInputValidationMode.FocusOut:
						this._detachLiveChange();
						break;
					case StepInputValidationMode.LiveChange:
						this._attachLiveChange();
						break;
				}
				this.setProperty("validationMode", sValidationMode);
			}
			return this;
		};

		/**
		 * Sets the min value.
		 *
		 * @param {float} min The minimum value
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 */
		StepInput.prototype.setMin = function (min) {
			if (min !== undefined && !this._validateOptionalNumberProperty("min", min)) {
				return this;
			}

			return this.setProperty("min", min);
		};

		/**
		 * Sets the max value.
		 *
		 * @param {float} max The max value
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 */
		StepInput.prototype.setMax = function (max) {
			if (max !== undefined && !this._validateOptionalNumberProperty("max", max)) {
				return this;
			}

			return this.setProperty("max", max);
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

			Log.error("The value of property '" + name + "' must be a number");
			return false;
		};

		/*
		 * Sets the <code>displayValuePrecision</code>.
		 *
		 * @param {number} number The value precision
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 */
		StepInput.prototype.setDisplayValuePrecision = function (number) {
			var vValuePrecision;

			if (isValidPrecisionValue(number)) {
				vValuePrecision = parseInt(number);
			} else {
				vValuePrecision = 0;
				Log.warning(this + ": ValuePrecision (" + number + ") is not correct. It should be a number between 0 and 20! Setting the default ValuePrecision:0.");
			}

			return this.setProperty("displayValuePrecision", vValuePrecision);
		};

		/**
		 * Retrieves the <code>incrementButton</code>.
		 * @returns {sap.ui.core.Icon} the icon that serves as (lightweight) button
		 * @private
		 */
		StepInput.prototype._getIncrementButton = function () {
			var endIcons = this._getInput().getAggregation("_endIcon");
			return endIcons ? endIcons[0] : null; //value state icon comes from sap.m.Input constructor and is at index 0
		};

		/**
		 * Retrieves the <code>decrementButton</code>.
		 * @returns {sap.ui.core.Icon} the icon that serves as (lightweight) button
		 * @private
		 */
		StepInput.prototype._getDecrementButton = function () {
			var beginIcons = this._getInput().getAggregation("_beginIcon");
			return beginIcons ? beginIcons[0] : null;
		};

		/**
		 * Creates the <code>incrementButton</code>.
		 * @returns {sap.ui.core.Icon} the icon that serves as (lightweight) button
		 * @private
		 */
		StepInput.prototype._createIncrementButton = function () {
			var oIcon = this._getInput().addEndIcon({
					src: IconPool.getIconURI("add"),
					id: this.getId() + "-incrementBtn",
					noTabStop: true,
					press: this._handleButtonPress.bind(this, 1),
					tooltip: StepInput.STEP_INPUT_INCREASE_BTN_TOOLTIP
				});

			oIcon.getEnabled = function () {
				return !this._shouldDisableIncrementButton(Number(this._getInput().getValue()), this._getMax());
			}.bind(this);

			oIcon.$().attr("tabindex", "-1");
			this._attachEvents(oIcon, true);

			oIcon.addEventDelegate({
				onAfterRendering: function () {
					// Set it to -1 so it still won't be part of the tabchain but can be document.activeElement
					// see _change method, _isButtonFocused call
					oIcon.$().attr("tabindex", "-1");
				}
			});

			return oIcon;
		};

		/**
		 * Creates the <code>decrementButton</code>.
		 * @returns {sap.ui.core.Icon} the icon that serves as (lightweight) button
		 * @private
		 */
		StepInput.prototype._createDecrementButton = function() {
			var oIcon = this._getInput().addBeginIcon({
					src: IconPool.getIconURI("less"),
					id: this.getId() + "-decrementBtn",
					noTabStop: true,
					press: this._handleButtonPress.bind(this, -1),
					tooltip: StepInput.STEP_INPUT_DECREASE_BTN_TOOLTIP
				});

			oIcon.getEnabled = function () {
				return !this._shouldDisableDecrementButton(Number(this._getInput().getValue()), this._getMin());
			}.bind(this);

			oIcon.$().attr("tabindex", "-1");
			this._attachEvents(oIcon, false);

			oIcon.addEventDelegate({
				onAfterRendering: function () {
					// Set it to -1 so it still won't be part of the tabchain but can be document.activeElement
					// see _change method, _isButtonFocused call
					oIcon.$().attr("tabindex", "-1");
				}
			});

			return oIcon;
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
					textAlign: this.getTextAlign(),
					type: InputType.Number,
					editable: this.getEditable(),
					enabled: this.getEnabled(),
					description: this.getDescription(),
					fieldWidth: this.getFieldWidth(),
					liveChange: this._inputLiveChangeHandler
				});
				this.setAggregation("_input", oNumericInput);
			}

			return this.getAggregation("_input");
		};

		/**
		 * Changes the value of the control and fires the change event.
		 *
		 * @param {boolean} bForce If true, will force value change
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 * @private
		 */
		StepInput.prototype._changeValue = function (bForce) {
			if ((this._fTempValue != this._fOldValue) || bForce) {
				// change the value and fire the event
				this.setValue(this._fTempValue);
				this.fireChange({value: this._fTempValue});
			} else {
				// just update the visual value and buttons
				this._applyValue(this._fTempValue);
				this._disableButtons(Number(this._getInput().getValue()), this._getMax(), this._getMin());
			}
			return this;
		};

		/**
		 * Handles the press of the increase/decrease buttons.
		 *
		 * @param {float} fMultiplier Indicates the direction - increment (positive value)
		 * or decrement (negative value) and multiplier for modifying the value
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 * @private
		 */
		StepInput.prototype._handleButtonPress = function (fMultiplier)	{
			if (!this._bSpinStarted) {
				// short click, just a single inc/dec button
				this._bDelayedEventFire = false;
				this._changeValueWithStep(fMultiplier);
				this._btndown = false;
				this._changeValue();
			} else {
				// long click, skip it
				this._bSpinStarted = false;
			}
			return this;
		};

		/**
		 * Changes the value with requested step multiplier.
		 *
		 * @param {float} fMultiplier Indicates the direction - increment (positive value)
		 * or decrement (negative value), and multiplier for modifying the value
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 * @private
		 */
		StepInput.prototype._changeValueWithStep = function (fMultiplier) {
			var fNewValue,
				fDelta;

			if (isNaN(this._fTempValue) || this._fTempValue === undefined) {
				this._fTempValue = this.getValue();
			}

			// check input value to correct requested step if necessary
			fDelta = this._checkInputValue();
			this._fTempValue += fDelta;

			// calculate new value
			fNewValue = fMultiplier !== 0 ? this._calculateNewValue(fMultiplier) : this._fTempValue;

			// save new temp value
			if (fMultiplier !== 0 || fDelta !== 0 || this._bDelayedEventFire) {
				this._fTempValue = fNewValue;
			}

			if (this._bDelayedEventFire) {
				this._applyValue(fNewValue);
				this._disableButtons(Number(this._getFormattedValue(fNewValue)), this._getMax(), this._getMin());
				this._verifyValue();
			}

			return this;
		};

		/**
		 * Handles whether the increment and decrement buttons should be enabled/disabled based on different situations.
		 *
		 * @param {number} iValue Indicates the value in the input
		 * @param {number} iMax Indicates the max
		 * @param {number} iMin Indicates the min
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 */
		StepInput.prototype._disableButtons = function (iValue, iMax, iMin) {

			if (!this._isNumericLike(iValue)) {
				return;
			}

			var oIncrementButton = this._getIncrementButton(),
				oDecrementButton = this._getDecrementButton(),
				bShouldDisableDecrement = this._shouldDisableDecrementButton(iValue, iMin),
				bShouldDisableIncrement = this._shouldDisableIncrementButton(iValue, iMax);

			oDecrementButton && oDecrementButton.toggleStyleClass("sapMStepInputIconDisabled", bShouldDisableDecrement);
			oIncrementButton && oIncrementButton.toggleStyleClass("sapMStepInputIconDisabled", bShouldDisableIncrement);

			return this;
		};

		StepInput.prototype._shouldDisableDecrementButton = function (iValue, iMin) {
			var bMinIsNumber = this._isNumericLike(iMin),
				bEnabled = this.getEnabled(),
				bReachedMin = bMinIsNumber && iMin >= iValue; // min is set and it's bigger or equal to the value
			return bEnabled ? bReachedMin : true; // if enabled - set the value according to the min value, if not - set disable flag to true
		};

		StepInput.prototype._shouldDisableIncrementButton = function (iValue, iMax) {
			var bMaxIsNumber = this._isNumericLike(iMax),
				bEnabled = this.getEnabled(),
				bReachedMax = bMaxIsNumber && iMax <= iValue; // max is set and it's lower or equal to the value
			return bEnabled ? bReachedMax : true; // if enabled - set the value according to the max value, if not - set disable flag to true;
		};

		/**
		 * Sets the <code>valueState</code> if there is a value that is not within a given limit.
		 */
		StepInput.prototype._verifyValue = function () {
			var min = this._getMin(),
				max = this._getMax(),
				value = parseFloat(this._getInput().getValue()),
				oCoreMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core"),
				oBinding = this.getBinding("value"),
				oBindingType = oBinding && oBinding.getType && oBinding.getType(),
				sBindingConstraintMax = oBindingType && oBindingType.oConstraints && oBindingType.oConstraints.maximum,
				sBindingConstraintMin = oBindingType && oBindingType.oConstraints && oBindingType.oConstraints.minimum,
				sMessage,
				aViolatedConstraints = [],
				bHasValidationErrorListeners = false,
				oEventProvider;

			if (!this._isNumericLike(value)) {
				return;
			}

			oEventProvider = this;
			do {
				bHasValidationErrorListeners = oEventProvider.hasListeners("validationError");
				oEventProvider = oEventProvider.getEventingParent();
			} while (oEventProvider && !bHasValidationErrorListeners);

			if (this._isNumericLike(max) && value > max) {
				if (bHasValidationErrorListeners && sBindingConstraintMax) {
					return;
				}
				sMessage = oCoreMessageBundle.getText("EnterNumberMax", [max]);
				aViolatedConstraints.push("maximum");
			} else if (this._isNumericLike(min) && value < min) {
				if (bHasValidationErrorListeners && sBindingConstraintMin) {
					return;
				}
				sMessage = oCoreMessageBundle.getText("EnterNumberMin", [min]);
				aViolatedConstraints.push("minimum");
			} else if (this._areFoldChangeRequirementsFulfilled() && (value % this.getStep() !== 0)) {
				sMessage = oCoreMessageBundle.getText("Float.Invalid");
			}

			if (sMessage) {
				// there is error message

				// first set valueState and valueStateText
				this.setProperty("valueState", ValueState.Error, true);
				this._getInput().setValueState(ValueState.Error);
				this._getInput().setValueStateText(sMessage);

				// then, if there are listeners, fire an exception
				if (bHasValidationErrorListeners) {
					this.fireValidationError({
						element: this,
						exception: new ValidateException(sMessage, aViolatedConstraints),
						id: this.getId(),
						message: sMessage,
						property: "value"
					});
				}
			} else {
				// no errors
				this.setProperty("valueState", ValueState.None, true);
				this._getInput().setValueState(ValueState.None);
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

			if (isNaN(oValue) || oValue === null) {
				oValue = this._getDefaultValue(undefined, this._getMax(), this._getMin());
			} else {
				oValue = Number(oValue);
			}

			if (!this._validateOptionalNumberProperty("value", oValue)) {
				return this;
			}

			this._applyValue(oValue);
			this._disableButtons(Number(this._getInput().getValue()), this._getMax(), this._getMin());

			if (oValue !== this._fOldValue) {
				// save current value (for ESC restoring)
				this._fOldValue = oValue;
				oResult = this.setProperty("value", oValue);
				this._verifyValue();
			} else {
				oResult = this;
			}
			this._iRealPrecision = this._getRealValuePrecision();
			this._fTempValue = oValue;
			return oResult;
		};

		/**
		 * Formats the <code>vValue</code> accordingly to the <code>displayValuePrecision</code> property.
		 * if vValue is undefined or null, the property <code>value</code> will be used.
		 *
		 * @returns formated value as a String
		 * @private
		 */
		StepInput.prototype._getFormattedValue = function (vValue) {
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
		 * Checks the current value of the input and sets the control value according to it
		 *
		 * @private
		 */
		StepInput.prototype._checkInputValue = function () {
			var sInputValue = this._getInput().getValue(),
				fDelta = 0;

			// check for empty input value, and if so - return the last saved value
			if (sInputValue === "") {
				sInputValue = this._getDefaultValue(sInputValue, this._getMax(), this._getMin()).toString();
			}

			// fix the entered value if the precision is 0; and filter 'e/E' meanwhile
			if (this.getDisplayValuePrecision() === 0) {
				sInputValue = Math.round(Number(sInputValue.toLowerCase().split('e')[0])).toString();
			}

			// calculates delta (difference) between input value and real control value
			if (this._getFormattedValue(this._fTempValue) !== sInputValue) {
				fDelta = Number(sInputValue) - this._fTempValue;
			}
			return fDelta;
		};

		/**
		 * Handles the <code>onsappageup</code>.
		 *
		 * Increases the value with the larger step.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsappageup = function (oEvent) {
			// prevent document scrolling when page up key is pressed
			oEvent.preventDefault();
			this._bDelayedEventFire = true;
			this._changeValueWithStep(this.getLargerStep());
		};

		/**
		 * Handles the <code>onsappagedown</code> - PageDown key decreases the value with the larger step.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsappagedown = function (oEvent) {
			// prevent document scrolling when page down key is pressed
			oEvent.preventDefault();
			this._bDelayedEventFire = true;
			this._changeValueWithStep(-this.getLargerStep());
		};

		/**
		 * Handles the Shift + PageUp key combination and sets the value to maximum.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsappageupmodifiers = function (oEvent) {
			if (this._isNumericLike(this._getMax()) && !(oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) && oEvent.shiftKey) {
				this._bDelayedEventFire = true;
				this._fTempValue = Number(this._getInput().getValue());
				this._changeValueWithStep(this._getMax() - this._fTempValue);
			}
		};

		/**
		 * Handles the Shift + PageDown key combination and sets the value to minimum.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsappagedownmodifiers = function (oEvent) {
			if (this._isNumericLike(this._getMin()) && !(oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) && oEvent.shiftKey) {
				this._bDelayedEventFire = true;
				this._fTempValue = Number(this._getInput().getValue());
				this._changeValueWithStep(-(this._fTempValue - this._getMin()));
			}
		};

		/**
		 * Handles the <code>onsapup</code> and increases the value with the default step (1).
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsapup = function (oEvent) {
			oEvent.preventDefault(); //prevents the value to increase by one (Chrome and Firefox default behavior)
			this._bDelayedEventFire = true;
			this._changeValueWithStep(1);
		};

		/**
		 * Handles the <code>onsapdown</code> and decreases the value with the default step (1).
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsapdown = function (oEvent) {
			oEvent.preventDefault(); //prevents the value to decrease by one (Chrome and Firefox default behavior)
			this._bDelayedEventFire = true;
			this._changeValueWithStep(-1);
		};

		StepInput.prototype._onmousewheel = function (oEvent) {
			var bIsFocused = this.getDomRef().contains(document.activeElement);
			if (bIsFocused) {
				oEvent.preventDefault();
				var oOriginalEvent = oEvent.originalEvent,
					bDirectionPositive = oOriginalEvent.detail ? (-oOriginalEvent.detail > 0) : (oOriginalEvent.wheelDelta > 0);
				this._bDelayedEventFire = true;
				this._changeValueWithStep((bDirectionPositive ? 1 : -1));
			}
		};

		/**
		 * Handles the Ctrl + Shift + Up/Down and Shift + Up/Down key combinations and sets the value to maximum/minimum
		 * or increases/decreases the value with the larger step.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onkeydown = function (oEvent) {
			var fStep,
				fMax,
				fMin;

			if (oEvent.which === KeyCodes.ENTER && this._fTempValue !== this.getValue()) {
				oEvent.preventDefault();
				this._changeValue();
				return false;
			}

			if (oEvent.which === KeyCodes.TAB) {
				oEvent.stopPropagation();
				this._getInput()._$input[0].focus();
				return false;
			}

			this._bPaste = (oEvent.ctrlKey || oEvent.metaKey) && (oEvent.which === KeyCodes.V);

			if (oEvent.which === KeyCodes.ARROW_UP && !oEvent.altKey && oEvent.shiftKey && (oEvent.ctrlKey || oEvent.metaKey)) { //ctrl+shift+up
				fMax = this._getMax();
				this._fTempValue = Number(this._getInput().getValue());
				fStep = (fMax !== undefined) ? fMax - this._fTempValue : 0;
			} else if (oEvent.which === KeyCodes.ARROW_DOWN && !oEvent.altKey && oEvent.shiftKey && (oEvent.ctrlKey || oEvent.metaKey)) { //ctrl+shift+down
				fMin = this._getMin();
				this._fTempValue = Number(this._getInput().getValue());
				fStep = (fMin !== undefined) ? -(this._fTempValue - fMin) : 0;
			} else if (oEvent.which === KeyCodes.ARROW_UP && !(oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) && oEvent.shiftKey) { //shift+up
				fStep = this.getLargerStep();
			} else if (oEvent.which === KeyCodes.ARROW_DOWN && !(oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) && oEvent.shiftKey) { //shift+down
				fStep = -this.getLargerStep();
			} else if (oEvent.which === KeyCodes.ARROW_UP && (oEvent.ctrlKey || oEvent.metaKey)) { // ctrl + up
				fStep = 1;
			} else if (oEvent.which === KeyCodes.ARROW_DOWN && (oEvent.ctrlKey || oEvent.metaKey)) { // ctrl + down
				fStep = -1;
			} else if (oEvent.which === KeyCodes.ARROW_UP && oEvent.altKey) { // alt + up
				fStep = 1;
			} else if (oEvent.which === KeyCodes.ARROW_DOWN && oEvent.altKey) { // alt + down
				fStep = -1;
			}

			// do change if there is any step set
			if (fStep !== undefined) {
				oEvent.preventDefault();
				if (fStep !== 0) {
					this._bDelayedEventFire = true;
					this._changeValueWithStep(fStep);
				}
			}
		};

		/**
		 * Handles the Esc key and reverts the value in the input field to the previous one.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsapescape = function (oEvent) {
			if (this._fOldValue !== this._fTempValue) {
				this._applyValue(this._fOldValue);
				this._verifyValue();
			}
		};

		/**
		 * Attaches the <code>liveChange</code> handler for the input.
		 * @private
		 */
		StepInput.prototype._attachLiveChange = function () {
			this._getInput().attachLiveChange(this._liveChange, this);
		};

		/**
		 * Detaches the <code>liveChange</code> handler for the input.
		 * @private
		 */
		StepInput.prototype._detachLiveChange = function () {
			this._getInput().detachLiveChange(this._liveChange, this);
		};

		/**
		 * Attaches the <code>change</code> handler for the input.
		 * @private
		 */
		StepInput.prototype._attachChange = function () {
			this._getInput().attachChange(this._change, this);
		};

		/**
		 * Attaches the <code>liveChange</code> handler for the input.
		 * @private
		 */
		StepInput.prototype._liveChange = function () {
			this._verifyValue();
			this._disableButtons(Number(this._getInput().getValue()), this._getMax(), this._getMin());
		};

		/**
		 * Handles the <code>change</code> event for the input.
		 * @param {Object} oEvent The fired event
		 * @private
		 */
		StepInput.prototype._change = function (oEvent) {
			var fOldValue;

			if (!this._isButtonFocused()) {

				if (!this._btndown) {
					fOldValue = Number(this._getFormattedValue());
					if (this._fOldValue === undefined) {
						this._fOldValue = fOldValue;
					}

					this._bDelayedEventFire = false;
					this._changeValueWithStep(0);
					this._changeValue();
				} else {
					this._fTempValue = Number(this._getInput().getValue());
				}
			}
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
			this._getInput().setValue(this._getFormattedValue(fNewValue));
		};

		/**
		 * Makes calculations regarding the operation and the number type.
		 *
		 * @param {float} fStepMultiplier Holds the step multiplier
		 * @param {boolean} bIsIncreasing Holds the operation(or direction) whether addition(increasing) or subtraction(decreasing)
		 * @returns {{value, displayValue}} The result of the calculation where:
		 * <ul>
		 * <li>value is the result of the computation where the real stepInput <value> is used</li>
		 * <li>displayValue is the result of the computation where the DOM value (also sap.m.Input.getValue()) is used</li>
		 * </ul>
		 * @private
		 */
		StepInput.prototype._calculateNewValue = function (fStepMultiplier, bIsIncreasing) {
			if (bIsIncreasing === undefined ) {
				bIsIncreasing = fStepMultiplier < 0 ? false : true;
			}
			var fStep = this.getStep(),
				fMax = this._getMax(),
				fMin = this._getMin(),
				fInputValue = parseFloat(this._getDefaultValue(this._getInput().getValue(), fMax, fMin)),
				iSign = bIsIncreasing ? 1 : -1,
				fMultipliedStep = Math.abs(fStep) * Math.abs(fStepMultiplier),
				fResult = fInputValue + iSign * fMultipliedStep,
				fValueResult;

			if (this._areFoldChangeRequirementsFulfilled()) {
				fResult = fValueResult = this._calculateClosestFoldValue(fInputValue, fMultipliedStep, iSign);
			} else {
				fValueResult = this._sumValues(this._fTempValue, fMultipliedStep, iSign, this._iRealPrecision);
			}

			// if there is a maxValue set, check if the calculated value is bigger
			// and if so set the calculated value to the max one
			if (this._isNumericLike(fMax) && fResult >= fMax) {
				fValueResult = fMax;
			}

			// if there is a minValue set, check if the calculated value is less
			// and if so set the calculated value to the min one
			if (this._isNumericLike(fMin) && fResult <= fMin) {
				fValueResult = fMin;
			}

			return fValueResult;
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

		/**
		 * Checks whether there is an existing instance of a decrement button or it has to be created.
		 *
		 * @returns {sap.ui.core.Icon} the icon that serves as (lightweight) button
		 * @private
		 */
		StepInput.prototype._getOrCreateDecrementButton = function(){
			return this._getDecrementButton() || this._createDecrementButton();
		};

		/**
		 * Checks whether there is an existing instance of an increment button or it has to be created.
		 *
		 * @returns {sap.ui.core.Icon} the icon that serves as (lightweight) button
		 * @private
		 */
		StepInput.prototype._getOrCreateIncrementButton = function(){
			return this._getIncrementButton() || this._createIncrementButton();
		};

		/**
		 * <code>liveChange</code> handler.
		 * @param {sap.ui.base.Event} oEvent Event object
		 * @private
		 */
		StepInput.prototype._inputLiveChangeHandler = function (oEvent) {
			var iValue = this.getParent()._restrictCharsWhenDecimal(oEvent);

			this.setProperty("value", iValue ? iValue : oEvent.getParameter("newValue"), true);
		};

		/**
		 * Handles the value after the decimal point when user types or pastes.
		 *
		 * @param {sap.ui.base.Event} oEvent Event object
		 * @private
		 */
		StepInput.prototype._restrictCharsWhenDecimal = function (oEvent) {
			var iDecimalMark = oEvent.getParameter("value").indexOf("."),
				iCharsSet = this.getDisplayValuePrecision(),
				sEventValue = oEvent.getParameter("value"),
				sValue;

			if (iDecimalMark > 0 && iCharsSet >= 0) { //only for decimals
				var sEventValueAfterTheDecimal = sEventValue.split('.')[1],
					iCharsAfterTheDecimalSign = sEventValueAfterTheDecimal ? sEventValueAfterTheDecimal.length : 0,
					sCharsBeforeTheEventDecimalValue = sEventValue.split('.')[0],
					sCharsAfterTheEventDecimalValue = iCharsSet > 0 ? sEventValue.substring(sEventValue.indexOf('.') + 1, sEventValue.length) : '';

				//scenario 1 - user typing after the decimal mark:
				if (!this._bPaste) {
					//if the characters after the decimal are more than the displayValuePrecision -> keep the current value after the decimal
					if (iCharsAfterTheDecimalSign > iCharsSet) {
						sValue = sCharsBeforeTheEventDecimalValue + (iCharsSet > 0 ? "." + sCharsAfterTheEventDecimalValue.substr(0, iCharsSet) : '');
						this._showWrongValueVisualEffect();
					}

					//scenario 2 - paste - cut the chars with length, bigger than displayValuePrecision
				} else {
					if (sEventValue.indexOf(".")){
						sValue = sEventValue.split('.')[0] + (iCharsSet > 0 ? "." + sEventValueAfterTheDecimal.substring(0, iCharsSet) : '');
					}
					this._bPaste = false;
				}
			} else {
				sValue = sEventValue;
			}

			this._getInput().updateDomValue(sValue);
			return sValue;
		};

		/**
		 * Triggers the value state "Error" for 1s, and resets the state to the previous one.
		 *
		 * @private
		 */
		StepInput.prototype._showWrongValueVisualEffect = function() {
			var sOldValueState = this.getValueState(),
				oInput = this._getInput();

			if (sOldValueState === ValueState.Error) {
				return;
			}

			oInput.setValueState(ValueState.Error);
			setTimeout(oInput["setValueState"].bind(oInput, sOldValueState), 1000);
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
				return Number(this._getInput().getValue());
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

		/**
		 * Determines if a given value is an integer
		 * @param {string|number} val the value to check
		 * @returns {boolean} true if the given value is integer, false otherwise
		 * @private
		 */
		StepInput.prototype._isInteger = function(val) {
			return val === parseInt(val);
		};

		StepInput.prototype._isButtonFocused = function () {
			return document.activeElement === this._getIncrementButton().getDomRef() ||
				document.activeElement === this._getDecrementButton().getDomRef();
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
			var iPrecisionMultiplier = Math.pow(10, iPrecision),
			//For most of the cases fValue1 * iPrecisionMultiplier  will produce the integer (ex. 0.11 * 100 = 11),
			//so toFixed won't change anything.
			//For some cases fValue1 * iPrecisionMultiplier will produce a floating point number(ex. 0.29 * 100 = 28.999999999999996),
			//but we still can call toFixed as this floating point number is always as closest as
			//possible(i.e. no rounding errors could appear) to the real integer we expect.
				iValue1 = parseInt((fValue1 * iPrecisionMultiplier).toFixed(1)),
				iValue2 = parseInt((fValue2 * iPrecisionMultiplier).toFixed(1));
			return (iValue1 + (iSign * iValue2)) / iPrecisionMultiplier;
		};


		/**
		 * Determine if the stepMode of type ${@link sap.m.StepInputStepModeType.Multiple} can be applied
		 * depending on the step, larger step, and display value precision.
		 * @returns {boolean}
		 * @private
		 */
		StepInput.prototype._areFoldChangeRequirementsFulfilled = function () {
			return this.getStepMode() === StepModeType.Multiple &&
				this.getDisplayValuePrecision() === 0 &&
				this._isInteger(this.getStep()) &&
				this._isInteger(this.getLargerStep());
		};

		/**
		 * Calculates next/previous value that is fold by the provided step
		 * @param {number} fValue the base value
		 * @param {number} step the step to increase the value to
		 * @param {number} iSign direction, where if 1 -> increase, -1-> decrease.
		 * @returns {number} the next/previous value.
		 * @private
		 */
		StepInput.prototype._calculateClosestFoldValue = function(fValue, step, iSign) {
			var fResult = Math.floor(fValue),
				iLoopCount = step;

			do {
				fResult += iSign;
				iLoopCount--;
			} while (fResult % step !== 0 && iLoopCount);

			if (fResult % step !== 0) {
				Log.error("Wrong next/previous value " + fResult + " for " + fValue + ", step: " + step +
					" and sign: " + iSign, this);
			}

			return fResult;
		};

		/*
		 * displayValuePrecision should be a number between 0 and 20
		 * @returns {boolean}
		 */
		function isValidPrecisionValue(value) {
			return (typeof (value) === 'number') && !isNaN(value) && value >= 0 && value <= 20;
		}

		// speed spin of values functionality

		/*
		 * Calculates the time which should be waited until _spinValues function is called.
		 */
		StepInput.prototype._calcWaitTimeout = function() {
			this._speed *= StepInput.ACCELLERATION;
			this._waitTimeout = ((this._waitTimeout - this._speed) < StepInput.MIN_WAIT_TIMEOUT ? StepInput.MIN_WAIT_TIMEOUT : (this._waitTimeout - this._speed));

			return this._waitTimeout;
		};

		/*
		 * Called when the increment or decrement button is pressed and held to set new value.
		 * @param {boolean} bIncrementButton - is this the increment button or not so the values should be spin accordingly up or down
		 */
		StepInput.prototype._spinValues = function(bIncrementButton) {
			this._spinTimeoutId = setTimeout(function () {
				if (this._btndown) {
					this._bSpinStarted = true;
					this._bDelayedEventFire = true;
					this._changeValueWithStep(bIncrementButton ? 1 : -1);
					this._disableButtons(Number(this._getInput().getValue()), this._getMax(), this._getMin());
					if ((this._getIncrementButton().getEnabled() && bIncrementButton) || (this._getDecrementButton().getEnabled() && !bIncrementButton)) {
						this._spinValues(bIncrementButton);
					}
				}
			}.bind(this), this._calcWaitTimeout());
		};

		/*
		 * Attaches events to increment and decrement buttons.
		 * @param {object} oBtn - button to which events will be attached
		 * @param {boolean} bIncrementButton - is this the increment button or not so the values should be spin accordingly up or down
		 */
		StepInput.prototype._attachEvents = function (oBtn, bIncrementButton) {
			// Desktop events
			var oEvents = {
					onmousedown: function (oEvent) {
						// check if the left mouse button is down
						if (oEvent.button === 0 && !this._btndown) {
							this._btndown = true;
							this._waitTimeout = StepInput.INITIAL_WAIT_TIMEOUT;
							this._speed = StepInput.INITIAL_SPEED;
							this._spinValues(bIncrementButton);
						}
					}.bind(this),
					onmouseup: function (oEvent) {
						// check if the left mouse button is up
						if (oEvent.button === 0) {
							this._bDelayedEventFire = undefined;
							this._btndown = false;
							_resetSpinValues.call(this);
							if (this._bSpinStarted) {
								this._changeValue();
							}
						}
					}.bind(this),
					onmouseout: function (oEvent) {
						if (this._btndown) {
							this._bDelayedEventFire = undefined;
							if (this._bSpinStarted) {
								_resetSpinValues.call(this);
								this._changeValue();
							}
						}
					}.bind(this),
					oncontextmenu: function (oEvent) {
						if (!sap.ui.Device.os.android) {
							// Context menu is shown on "long-touch"
							// so prevent of showing it while "long-touching" on the button
							oEvent.stopImmediatePropagation(true);
							if (oEvent.originalEvent && oEvent.originalEvent.cancelable) {
								oEvent.preventDefault();
							}
							oEvent.stopPropagation();
						}
					}
				};

				oBtn.addDelegate(oEvents, true);

		};

		StepInput.prototype._getMin = function() {
			var oBinding = this.getBinding("value"),
				oBindingType = oBinding && oBinding.getType && oBinding.getType(),
				sBindingConstraintMin = oBindingType && oBindingType.oConstraints && oBindingType.oConstraints.minimum;

			return sBindingConstraintMin ? parseFloat(sBindingConstraintMin) : this.getMin();
		};

		StepInput.prototype._getMax = function() {
			var oBinding = this.getBinding("value"),
				oBindingType = oBinding && oBinding.getType && oBinding.getType(),
				sBindingConstraintMax = oBindingType && oBindingType.oConstraints && oBindingType.oConstraints.maximum;

			return sBindingConstraintMax ? parseFloat(sBindingConstraintMax) : this.getMax();
		};

		/**
		 * Returns the DOMNode Id to be used for the "labelFor" attribute of the label.
		 *
		 * By default, this is the Id of the control itself.
		 *
		 * @return {string} Id to be used for the <code>labelFor</code>
		 * @public
		 */
		StepInput.prototype.getIdForLabel = function () {
			// The NumericInput inherits from the InputBase
			return this._getInput().getIdForLabel();
		};

		StepInput.prototype.onfocusout = function ( oEvent ) {
			if (!this._btndown) {
				this._changeValueWithStep(0);
				if (this._bDelayedEventFire && (this._fTempValue) !== this._fOldValue) {
					this._bDelayedEventFire = undefined;
					this._changeValue();
				}
			}
		};

		/*
		 * Resets timeouts and speed to initial values.
		 */
		function _resetSpinValues() {
			if (this._btndown) {
				clearTimeout(this._spinTimeoutId);
				this._waitTimeout = 500;
				this._speed = 120;
			}
		}

		return StepInput;
	});