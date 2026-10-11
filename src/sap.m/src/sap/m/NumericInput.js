/*!
 * ${copyright}
 */

// Provides control sap.m.NumericInput.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"sap/ui/core/Lib",
	"sap/ui/core/message/MessageMixin",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/ValidateException",
	"sap/ui/Device",
	"sap/ui/core/library",
	"sap/m/library",
	"./NumericInputBase",
	"./NumericInputRenderer",
	"sap/ui/events/KeyCodes",
	"sap/base/Log"
],
function(
	Control,
	IconPool,
	Library,
	MessageMixin,
	NumberFormat,
	ValidateException,
	Device,
	coreLibrary,
	library,
	NumericInputBase,
	NumericInputRenderer,
	KeyCodes,
	Log
) {
		"use strict";

		// shortcut for sap.ui.core.TextAlign
		const TextAlign = coreLibrary.TextAlign;

		// shortcut for sap.ui.core.ValueState
		const ValueState = coreLibrary.ValueState;

		// shortcut for sap.m.NumericInputValidationMode
		const NumericInputValidationMode = library.NumericInputValidationMode;

		// shortcut for sap.m.NumericInputStepModeType
		const StepModeType = library.NumericInputStepModeType;

		/**
		 * Constructor for a new <code>NumericInput</code> control.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Allows the user to change the input values with predefined increments (steps).
		 *
		 * @extends sap.ui.core.Control
		 * @implements sap.ui.core.IFormContent
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @ui5-experimental-since 1.154
		 * @alias sap.m.NumericInput
		 */
		const NumericInput = Control.extend("sap.m.NumericInput", /** @lends sap.m.NumericInput.prototype */ {
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
					 * Increases or decreases the value of the input.
					 */
					step: {type: "float", group: "Data", defaultValue: 1},

					/**
					 * Defines the calculation mode for the provided <code>step</code> and <code>largerStep</code>.
					 */
					stepMode: {type: "sap.m.NumericInputStepModeType", group: "Data", defaultValue: StepModeType.AdditionAndSubtraction},

					/**
					 * Defines the larger <code>step</code> used to increase or decrease the value when the user presses PageUp or PageDown.
					 * The default value is 2 times the value of the <code>step</code> property.
					 */
					largerStep: {type: "float", group: "Data", defaultValue: 2},

					/**
					 * Determines the value of the control.
					 */
					value: {type: "float", group: "Data", defaultValue: 0},

					/**
					 * Defines the name of the control for the purposes of form submission.
					 */
					name: { type: "string", group: "Misc", defaultValue: null },

					/**
					 * Defines a short hint intended to aid the user with data entry when the control has no value.
					 */
					placeholder: { type: "string", group: "Misc", defaultValue: null },

					/**
					 * Indicates that user input is required.
					 */
					required : {type : "boolean", group : "Misc", defaultValue : false},

					/**
					 * Defines the width of the control.
					 */
					width: {type: "sap.ui.core.CSSSize", group: "Dimension"},

					/**
					 * Defines the value state of the control. Possible values are <code>None</code>, <code>Error</code>, <code>Warning</code>, and <code>Success</code>.
					 */
					valueState: {type: "sap.ui.core.ValueState", group: "Data", defaultValue: ValueState.None},

					/**
					 * Defines the text that appears in the value state message pop-up.
					 */
					valueStateText: { type: "string", group: "Misc", defaultValue: null },

					/**
					 * Defines whether the control can be modified by the user.
					 */
					editable: {type: "boolean", group: "Behavior", defaultValue: true},

					/**
					 * Indicates whether the user can interact with the control.
					 */
					enabled: {type: "boolean", group: "Behavior", defaultValue: true},

					/**
					 * Determines the number of digits after the decimal point.
					 */
					displayValuePrecision: {type: "int", group: "Data", defaultValue: 0},

					/**
					 * Determines the description text after the input field, for example units of measurement, currencies.
					 */
					description: {type : "string", group : "Misc", defaultValue : null},

					/**
					 * Determines the distribution of space between the input field and the description text.
					 */
					fieldWidth: {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : '50%'},

					/**
					 * Defines the horizontal alignment of the text that is displayed inside the input field.
					 */
					textAlign: {type: "sap.ui.core.TextAlign", group: "Appearance", defaultValue: TextAlign.End},

					/**
					 * Defines when the validation of the typed value will happen.
					 */
					validationMode: {type: "sap.m.NumericInputValidationMode", group: "Misc", defaultValue: NumericInputValidationMode.FocusOut},

					/**
					 * Controls the visibility of the increment and decrement step buttons.
					 * @private
					 */
					_showStepButtons: {type: "boolean", group: "Appearance", defaultValue: false, visibility: "hidden"}
				},
				aggregations: {

					/**
					 * Internal aggregation that contains the <code>Input</code>.
					 */
					_input: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}
				},
				associations: {

					/**
					 * Association to controls or IDs that label this control (see WAI-ARIA attribute <code>aria-labelledby</code>).
					 */
					ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"},

					/**
					 * Association to controls or IDs that describe this control (see WAI-ARIA attribute <code>aria-describedby</code>).
					 */
					ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"}
				},
				events: {

					/**
					 * Fired when one of the following happens: <br>
					 * <ol>
					 * <li>The text in the input has changed and the focus leaves the input field or the enter key
					 * is pressed.</li>
					 * <li>One of the decrement or increment buttons is pressed</li>
					 * </ol>
					 */
					change: {
						parameters: {

							/**
							 * The new <code>value</code> of the control.
							 */
							value: {type: "string"}
						}
					},
					/**
					 * Fired when a property is changed internally (e.g. via user interaction or binding).
					 * @private
					 */
					propertyChanged: {
						visibility: "hidden",
						parameters: {

							/**
							 * The name of the property that was changed.
							 */
							name: {type: "string"},

							/**
							 * The new value of the changed property.
							 */
							value: {type: "any"}
						}
					}
				},
				dnd: { draggable: false, droppable: true }
			},
			constructor : function (vId, mSettings) {
				Control.prototype.constructor.apply(this, arguments);

				if (typeof vId !== "string"){
					mSettings = vId;
				}

				if (mSettings && mSettings.value === undefined){
					this.setValue(this._getDefaultValue(undefined, mSettings.max, mSettings.min));
				}
			},

			renderer: NumericInputRenderer
		});

		// get resource translation bundle;
		const oLibraryResourceBundle = Library.getResourceBundleFor("sap.m");
		NumericInput.INCREASE_BTN_TOOLTIP = oLibraryResourceBundle.getText("STEP_INPUT_INCREASE_BTN");
		NumericInput.DECREASE_BTN_TOOLTIP = oLibraryResourceBundle.getText("STEP_INPUT_DECREASE_BTN");

		NumericInput.INITIAL_WAIT_TIMEOUT = 500;
		NumericInput.ACCELLERATION = 0.8;
		NumericInput.MIN_WAIT_TIMEOUT = 50;
		NumericInput.INITIAL_SPEED = 120; //milliseconds
		NumericInput._TOLERANCE = 10; // pixels

		/**
		 * Property names which when set are directly forwarded to inner input <code>setProperty</code> method
		 * @type {Array.<string>}
		 */
		const aForwardableProps = ["enabled", "editable", "name", "placeholder", "required", "valueStateText", "description", "fieldWidth", "textAlign"];

		MessageMixin.call(NumericInput.prototype);

		/**
		 * Initializes the control.
		 */
		NumericInput.prototype.init = function () {
			this._iRealPrecision = 0;
			this._attachChange();
			this._bPaste = false; //needed to indicate when a paste is made
			this._bNeedsVerification = false; // the control needs verification of the value state
			this._bValueStatePreset = true; //If there is a pre-defined value it will be set
			this._onmousewheel = this._onmousewheel.bind(this);
			this._oncontextmenu = function(e) {
				if (this._btndown === false && e.target.className.indexOf("sapMInputBaseIconContainer") !== -1) {
					e.preventDefault();
				}
			}.bind(this);
			window.addEventListener("contextmenu", this._oncontextmenu);
		};

		/**
		 * Called before the control is rendered.
		 */
		NumericInput.prototype.onBeforeRendering = function () {
			const fMin = this._getMin(),
				fMax = this._getMax(),
				vValue = this._sOriginalValue || this.getValue(),
				bEditable = this.getEditable(),
				bShowStepButtons = this.getProperty("_showStepButtons"),
				oInput = this._getInput();

			this._iRealPrecision = this._getRealValuePrecision();

			!this.bLiveChange && !this._bDelayedEventFire && oInput.setValue(this._getFormattedValue(vValue));
			oInput.setValueState(this.getValueState());
			if (bShowStepButtons) {
				this._getOrCreateDecrementButton().setVisible(bEditable);
				this._getOrCreateIncrementButton().setVisible(bEditable);
			}
			oInput.setTooltip(this.getTooltip());
			this._disableButtons(vValue, fMax, fMin);
			if (this._bNeedsVerification && !this._bValueStatePreset) {
				this._verifyValue();
				this._bNeedsVerification = false;
			}

			this.bLiveChange = false;
		};

		NumericInput.prototype.onAfterRendering = function () {
			const sEvent = Device.browser.firefox ? "DOMMouseScroll" : "mousewheel";
			// When hosted inside another control (e.g. StepInput), that control owns the
			// mousewheel listener on its outer DOM node. Skip registering here to prevent
			// the handler firing twice (once on this node, once after bubbling to the parent).
			if (!this._sOwnerControlId) {
				this.$().off(sEvent, this._onmousewheel).on(sEvent, this._onmousewheel);
			} else {
				this.$().off(sEvent, this._onmousewheel);
			}
		};

		NumericInput.prototype.exit = function () {
			this.$().off(Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", this._onmousewheel);
			window.removeEventListener("contextmenu", this._oncontextmenu);
			this._sOriginalValue = null;
		};

		NumericInput.prototype.setProperty = function (sPropertyName, oValue, bSuppressInvalidate) {
			Control.prototype.setProperty.call(this, sPropertyName, oValue, bSuppressInvalidate);

			if (aForwardableProps.indexOf(sPropertyName) > -1) {
				this._getInput().setProperty(sPropertyName, this.getProperty(sPropertyName), bSuppressInvalidate);
			}

			return this;
		};

		/**
		 * Sets the validation mode.
		 *
		 * @param {sap.m.NumericInputValidationMode} sValidationMode The validation mode value
		 * @returns {this} Reference to the control instance for chaining
		 */
		NumericInput.prototype.setValidationMode = function (sValidationMode) {
			if (this.getValidationMode() !== sValidationMode) {
				switch (sValidationMode) {
					case NumericInputValidationMode.FocusOut:
						this._detachLiveChange();
						break;
					case NumericInputValidationMode.LiveChange:
						this._attachLiveChange();
						break;
				}
				this.setProperty("validationMode", sValidationMode);
				this.fireEvent("propertyChanged", { name: "validationMode", value: sValidationMode });
			}
			return this;
		};

		/**
		 * Sets the minimum value.
		 *
		 * @param {float} min The minimum value
		 * @returns {this} Reference to the control instance for chaining
		 */
		NumericInput.prototype.setMin = function (min) {
			if (min !== undefined && !this._validateOptionalNumberProperty("min", min)) {
				return this;
			}

			this.setProperty("min", min);
			return this;
		};

		/**
		 * Sets the maximum value.
		 *
		 * @param {float} max The maximum value
		 * @returns {this} Reference to the control instance for chaining
		 */
		NumericInput.prototype.setMax = function (max) {
			if (max !== undefined && !this._validateOptionalNumberProperty("max", max)) {
				return this;
			}

			this.setProperty("max", max);
			return this;
		};

		/**
		 * Verifies if the given value is of a numeric type.
		 *
		 * @param {string} name Property name
		 * @param {variant} value Property value
		 * @returns {boolean} The result of the check. Numbers of type "string" are also valid.
		 * @private
		 */
		NumericInput.prototype._validateOptionalNumberProperty = function (name, value) {
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
		 * @returns {this} Reference to the control instance for chaining
		 */
		NumericInput.prototype.setDisplayValuePrecision = function (number) {
			let vValuePrecision;

			if (isValidPrecisionValue(number)) {
				vValuePrecision = parseInt(number);
			} else {
				vValuePrecision = 0;
				Log.warning(this + ": ValuePrecision (" + number + ") is not correct. It should be a number between 0 and 20! Setting the default ValuePrecision:0.");
			}

			this.setProperty("displayValuePrecision", vValuePrecision);

			this._getNumberFormatter(true);

			this.fireEvent("propertyChanged", { name: "displayValuePrecision", value: vValuePrecision });

			return this;
		};

		/**
		 * Retrieves the <code>incrementButton</code>.
		 * @returns {sap.ui.core.Icon} The icon that serves as a lightweight button
		 * @private
		 */
		NumericInput.prototype._getIncrementButton = function () {
			const endIcons = this._getInput().getAggregation("_endIcon") || [];
			let oIncrementIcon = null;

			if (endIcons.length) {
				oIncrementIcon = endIcons[endIcons.length - 1];
			}

			return oIncrementIcon;
		};

		/**
		 * Retrieves the <code>decrementButton</code>.
		 * @returns {sap.ui.core.Icon} The icon that serves as a lightweight button
		 * @private
		 */
		NumericInput.prototype._getDecrementButton = function () {
			const beginIcons = this._getInput().getAggregation("_beginIcon");
			return beginIcons ? beginIcons[0] : null;
		};

		/**
		 * Creates the <code>incrementButton</code>.
		 * @returns {sap.ui.core.Icon} The icon that serves as a lightweight button
		 * @private
		 */
		NumericInput.prototype._createIncrementButton = function () {
			const oInput = this._getInput();
			const oIcon = oInput.addEndIcon({
					src: IconPool.getIconURI("add"),
					id: this.getId() + "-incrementBtn",
					noTabStop: true,
					decorative: !Device.support.touch || Device.system.desktop ? true : false,
					press: this._handleButtonPress.bind(this, 1),
					useIconTooltip: false,
					alt: NumericInput.INCREASE_BTN_TOOLTIP,
					tooltip: NumericInput.INCREASE_BTN_TOOLTIP
				});

			oIcon.getEnabled = function () {
				return !this._shouldDisableIncrementButton(this._parseNumber(oInput.getValue()), this._getMax());
			}.bind(this);

			oIcon.$().attr("tabindex", "-1");
			this._attachEvents(oIcon, true);

			oIcon.addEventDelegate({
				onAfterRendering: function () {
					oIcon.$().attr("tabindex", "-1");
				}
			});

			return oIcon;
		};

		/**
		 * Creates the <code>decrementButton</code>.
		 * @returns {sap.ui.core.Icon} The icon that serves as a lightweight button
		 * @private
		 */
		NumericInput.prototype._createDecrementButton = function() {
			const oInput = this._getInput();
			const oIcon = oInput.addBeginIcon({
					src: IconPool.getIconURI("less"),
					id: this.getId() + "-decrementBtn",
					noTabStop: true,
					decorative: !Device.support.touch || Device.system.desktop ? true : false,
					press: this._handleButtonPress.bind(this, -1),
					useIconTooltip: false,
					alt: NumericInput.DECREASE_BTN_TOOLTIP,
					tooltip: NumericInput.DECREASE_BTN_TOOLTIP
				});

			oIcon.getEnabled = function () {
				return !this._shouldDisableDecrementButton(this._parseNumber(oInput.getValue()), this._getMin());
			}.bind(this);

			oIcon.$().attr("tabindex", "-1");
			this._attachEvents(oIcon, false);

			oIcon.addEventDelegate({
				onAfterRendering: function () {
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
		NumericInput.prototype._getInput = function () {
			if (!this.getAggregation("_input")) {
				const oNumericInputBase = new NumericInputBase({
					id: this.getId() + "-input",
					textAlign: this.getTextAlign(),
					editable: this.getEditable(),
					enabled: this.getEnabled(),
					description: this.getDescription(),
					fieldWidth: this.getFieldWidth(),
					liveChange: this._inputLiveChangeHandler.bind(this)
				});
				oNumericInputBase._setParent(this);
				this.setAggregation("_input", oNumericInputBase);
			}

			return this.getAggregation("_input");
		};

		/**
		 * Changes the value of the control and fires the <code>change</code> event.
		 *
		 * @param {boolean} bForce If true, will force value change
		 * @returns {this} Reference to the control instance for chaining
		 * @private
		 */
		NumericInput.prototype._changeValue = function (bForce) {
			this._bValueStatePreset = false;

			// Handle the special case where string representation needs formatting
			let bShouldFireChange = (this._fTempValue != this._fOldValue) || bForce;

			// Check if we need to format string representation (e.g., ".50" -> "0.50")
			if (!bShouldFireChange && this._sTempValue && typeof this._sTempValue === 'string') {
				const fParsedInput = this._parseNumber(this._sTempValue);
				const sFormattedValue = this._getFormattedValue(this._fTempValue);
				// Round the parsed input according to displayValuePrecision so inputs like
				// ".4" with displayValuePrecision=0 are treated as 0 after rounding.
				const iPrecision = this._getDisplayValuePrecision();
				const fParsedRounded = !isNaN(fParsedInput) ? Math.round(fParsedInput * Math.pow(10, iPrecision)) / Math.pow(10, iPrecision) : NaN;

				if (!isNaN(fParsedInput) && !isNaN(fParsedRounded) &&
					fParsedRounded === this._fTempValue &&
					this._sTempValue !== sFormattedValue && fParsedInput !== this._fTempValue) {
					bShouldFireChange = true;
				}
			}

			const bIsValueWithCorrectPrecision = this._isValueWithCorrectPrecision(this._sTempValue);
			const oInput = this._getInput();
			if (bShouldFireChange) {
				// change the value and fire the event
				this.setValue(this._fTempValue);
				oInput.setValue(bIsValueWithCorrectPrecision ? this._getFormattedValue() : this._sTempValue);
				this._verifyValue();
				this.fireChange({value: this._fTempValue});
			} else {
				// just update the visual value and buttons
				oInput.setValue(bIsValueWithCorrectPrecision ? this._getFormattedValue() : this._sTempValue);
				this._disableButtons(this._parseNumber(oInput.getValue()), this._getMax(), this._getMin());
				this._verifyValue();
			}

			return this;
		};

		/**
		 * Handles the press of the increment or decrement button.
		 *
		 * @param {float} fMultiplier The direction and multiplier for the value change. Use a positive value to increment and a negative value to decrement.
		 * @returns {this} Reference to the control instance for chaining
		 * @private
		 */
		NumericInput.prototype._handleButtonPress = function (fMultiplier)	{
			// Focus the input on mobile devices when button is pressed
			if (Device.system.phone || Device.system.tablet) {
				this.focus();
			}

			if (!this._bSpinStarted) {
				// short click, just a single inc/dec button
				this._bDelayedEventFire = false;
				this._changeValueWithStep(fMultiplier, true);
				this._btndown = false;
				this._changeValue();
			} else {
				// long click, skip it
				this._bSpinStarted = false;
			}
			this._bNeedsVerification = true;
			return this;
		};

		/**
		 * Changes the value by the requested step multiplier.
		 *
		 * @param {float} fMultiplier The direction and multiplier for the value change. Use a positive value to increment and a negative value to decrement.
		 * @param {boolean} bFromButton Indicates if the change is triggered by a button press
		 * @returns {this} Reference to the control instance for chaining
		 * @private
		 */
		NumericInput.prototype._changeValueWithStep = function (fMultiplier, bFromButton) {
			let fNewValue,
				fDelta;
			const oInput = this._getInput();

			// Clear _sTempValue when button is pressed to avoid precision check issues
			if (bFromButton) {
				this._sTempValue = undefined;
			} else {
				this._sTempValue = oInput.getValue();
			}

			// calculate precision multiplier
			if (isNaN(this._iValuePrecision)) {
				this._iValuePrecision = this._getNumberPrecision(this.getValue());
			}
			const iMultiplier = Math.pow(10, Math.max(this._getDisplayValuePrecision(), this._iValuePrecision));

			if (isNaN(this._fTempValue) || this._fTempValue === undefined) {
				this._fTempValue = this.getValue();
			}

			// When typing (fMultiplier === 0), directly use the parsed input value to avoid floating-point errors
			// When performing step operations, use delta-based approach
			if (fMultiplier === 0) {
				// Direct value assignment when typing
				let sInputValue = oInput.getValue();

				// Handle empty input value - use default value (min if set, otherwise 0)
				if (sInputValue === "") {
					this._fTempValue = this._getDefaultValue(sInputValue, this._getMax(), this._getMin());
				} else {
					const sGroupSeparator = this._getNumberFormatter().oFormatOptions.groupingSeparator;
					sInputValue = Device.system.desktop ? sInputValue.replaceAll(sGroupSeparator, "") : sInputValue;
					this._fTempValue = this._parseNumber(sInputValue);
				}
			} else {
				// Delta-based approach for step operations
				fDelta = this._checkInputValue();
				this._fTempValue += fDelta;
				// Round to avoid floating-point precision issues during step operations
				this._fTempValue = Math.round(this._fTempValue * iMultiplier) / iMultiplier;
			}			// calculate new value
			fNewValue = fMultiplier !== 0 ? this._calculateNewValue(fMultiplier) : this._fTempValue;// fix value precision (but not when typing with displayValuePrecision=0)
			if (fMultiplier === 0) {
				// Skip rounding when displayValuePrecision=0 and not from button press (i.e., during typing)
				if (!(this._getDisplayValuePrecision() === 0 && !bFromButton)) {
					fNewValue = Math.round(fNewValue * iMultiplier) / iMultiplier;
				}
			}

			// save new temp value
			if (fMultiplier !== 0 || fDelta !== 0 || this._bDelayedEventFire) {
				this._fTempValue = fNewValue;
			}

			if (this._bDelayedEventFire) {
				this._applyValue(fNewValue);
				this._disableButtons(this._parseNumber(this._getFormattedValue(fNewValue)), this._getMax(), this._getMin());
				this._bNeedsVerification = true;
			}

			return this;
		};

		/**
		 * Handles whether the increment and decrement buttons should be enabled or disabled based on different situations.
		 *
		 * @param {number} iValue The current value of the input
		 * @param {number} iMax The maximum value allowed
		 * @param {number} iMin The minimum value allowed
		 * @returns {this} Reference to the control instance for chaining
		 */
		NumericInput.prototype._disableButtons = function (iValue, iMax, iMin) {

			if (!this._isNumericLike(iValue)) {
				return;
			}

			const oIncrementButton = this._getIncrementButton(),
				oDecrementButton = this._getDecrementButton(),
				bShouldDisableDecrement = this._shouldDisableDecrementButton(iValue, iMin),
				bShouldDisableIncrement = this._shouldDisableIncrementButton(iValue, iMax);

			oDecrementButton && oDecrementButton.toggleStyleClass("sapMNumericInputIconDisabled", bShouldDisableDecrement);
			oIncrementButton && oIncrementButton.toggleStyleClass("sapMNumericInputIconDisabled", bShouldDisableIncrement);

			return this;
		};

		NumericInput.prototype._shouldDisableDecrementButton = function (iValue, iMin) {
			const bMinIsNumber = this._isNumericLike(iMin),
				bEnabled = this.getEnabled(),
				bReachedMin = bMinIsNumber && iMin >= iValue; // min is set and it's bigger or equal to the value
			return bEnabled ? bReachedMin : true; // if enabled - set the value according to the min value, if not - set disable flag to true
		};

		NumericInput.prototype._shouldDisableIncrementButton = function (iValue, iMax) {
			const bMaxIsNumber = this._isNumericLike(iMax),
				bEnabled = this.getEnabled(),
				bReachedMax = bMaxIsNumber && iMax <= iValue; // max is set and it's lower or equal to the value
			return bEnabled ? bReachedMax : true; // if enabled - set the value according to the max value, if not - set disable flag to true;
		};

		/**
		 * Sets the <code>valueState</code> if there is a value that is not within a given limit.
		 */
		NumericInput.prototype._verifyValue = function () {
			const min = this._getMin(),
				oInput = this._getInput(),
				max = this._getMax(),
				sValue = oInput.getValue(),
				value = this._parseNumber(oInput.getValue()),
				oCoreMessageBundle = Library.getResourceBundleFor("sap.ui.core"),
				oBinding = this.getBinding("value"),
				oBindingType = oBinding && oBinding.getType && oBinding.getType(),
				sBindingConstraintMax = oBindingType && oBindingType.oConstraints && oBindingType.oConstraints.maximum,
				sBindingConstraintMin = oBindingType && oBindingType.oConstraints && oBindingType.oConstraints.minimum,
				oBindingValueState = this.getBinding("valueState"),
				aViolatedConstraints = [];
			let sMessage,
				bHasValidationErrorListeners = false,
				oEventProvider;

			if (oBindingValueState && oBindingValueState.oValue && this._bValueStatePreset) {
				return;
			}

			if (!this._isNumericLike(value)) {
				return;
			}

			oEventProvider = this;
			do {
				bHasValidationErrorListeners = oEventProvider.hasListeners("validationError");
				oEventProvider = oEventProvider.getEventingParent();
			} while (oEventProvider && !bHasValidationErrorListeners);

			if (this._isMoreThanMax(value)) {
				if (bHasValidationErrorListeners && sBindingConstraintMax) {
					return;
				}
				sMessage = this.getValueStateText() ? this.getValueStateText() : oCoreMessageBundle.getText("EnterNumberMax", [max]);
				aViolatedConstraints.push("maximum");
			} else if (this._isLessThanMin(value)) {
				if (bHasValidationErrorListeners && sBindingConstraintMin) {
					return;
				}
				sMessage = this.getValueStateText() ? this.getValueStateText() : oCoreMessageBundle.getText("EnterNumberMin", [min]);
				aViolatedConstraints.push("minimum");
			} else if (this._areFoldChangeRequirementsFulfilled() && (value % this.getStep() !== 0)) {
				sMessage = this.getValueStateText() ? this.getValueStateText() : oCoreMessageBundle.getText("Float.Invalid");
			} else if (!this._isValueWithCorrectPrecision(sValue)) {
				aViolatedConstraints.push("precision");
				sMessage = oCoreMessageBundle.getText("EnterNumberWithPrecision", [this._getDisplayValuePrecision()]);
			}

			if (sMessage) {
				// there is error message

				// first set valueState and valueStateText
				this.setProperty("valueState", ValueState.Error, true);
				this.fireEvent("propertyChanged", { name: "valueState", value: ValueState.Error });
				oInput.setValueState(ValueState.Error);
				oInput.setValueStateText(sMessage);

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
				this.fireEvent("propertyChanged", { name: "valueState", value: ValueState.None });
				oInput.setValueState(ValueState.None);
			}
		};

		/**
		 * Returns the precision of a number.
		 * @param {float} fNumber The number whose precision is to be obtained
		 * @returns {int} The precision of the number passed as parameter
		 *
		 */
		 NumericInput.prototype._getNumberPrecision = function(fNumber) {
			const aNumberParts = !isNaN(fNumber) && fNumber !== null ? fNumber.toString().split('.') : [];

			return aNumberParts.length > 1 ? aNumberParts[1].length : 0;
		};

		NumericInput.prototype.setValueState = function(sValueState) {
			this._bValueStatePreset = true;
			this.setProperty("valueState", sValueState);
			this._getInput().setValueState(sValueState);

			return this;
		};

		/*
		 * Sets the value by doing some rendering optimizations in case the first rendering was completed.
		 * Otherwise the value is set in <code>onBeforeRendering</code>, where we have all needed parameters for obtaining the
		 * correct value.
		 * @param {object} oValue The value to be set
		 */
		NumericInput.prototype.setValue = function (oValue) {
			let oResult;
			const oInput = this._getInput();

			this._iValuePrecision = this._getNumberPrecision(oValue);

			if (isNaN(oValue) || oValue === null) {
				oValue = this._getDefaultValue(undefined, this._getMax(), this._getMin());
			} else {
				oValue = Number(oValue);
			}

			if (!this._validateOptionalNumberProperty("value", oValue)) {
				return this;
			}

			this._sOriginalValue = oValue;
			this._bDelayedEventFire = false;
			oInput.setValue(oValue);
			this._disableButtons(this._parseNumber(oInput.getValue()), this._getMax(), this._getMin());

			if (oValue !== this._fOldValue) {
				// save current value (for ESC restoring)
				this._fOldValue = oValue;
				this.setProperty("value", oValue, false);
				this.fireEvent("propertyChanged", { name: "value", value: oValue });
				oResult = this;
			} else {
				oResult = this;
			}
			this._iRealPrecision = this._getRealValuePrecision();
			this._fTempValue = oValue;
			this._bValueStatePreset = false;// Only clear a stale error state once the control is rendered, so we don't
			// validate half-initialized bound values during the templating phase (stepinp1.html).
			if (this.getDomRef()) {
				this._clearErrorIfValueValid();
			}

			return oResult;
		};

		/**
		 * Clears the existing error <code>valueState</code> only if the current value is valid.
		 * This method never sets an error state, so it is safe to call it from
		 * <code>setValue</code> without interfering with the initial binding or templating
		 * phase, where bound values may not be available yet.
		 *
		 * @private
		 */
		NumericInput.prototype._clearErrorIfValueValid = function () {
			// Only act if we currently show an error that was not explicitly preset via setValueState
			if (this.getValueState() !== ValueState.Error || this._bValueStatePreset) {
				return;
			}

			var value = this._parseNumber(this._getInput().getValue());

			if (!this._isNumericLike(value)) {
				return;
			}

			var bValid = !this._isMoreThanMax(value) &&
				!this._isLessThanMin(value) &&
				!(this._areFoldChangeRequirementsFulfilled() && (value % this.getStep() !== 0)) &&
				this._isValueWithCorrectPrecision(this._getInput().getValue());

			if (bValid) {
				this.setProperty("valueState", ValueState.None, true);
				this._getInput().setValueState(ValueState.None);
				this.fireEvent("propertyChanged", { name: "valueState", value: ValueState.None });
			}
		};

		NumericInput.prototype._getNumberFormatter = function(bReset) {
			const iCurrentPrecision = this._getDisplayValuePrecision();
			if (!this._formatter || bReset || this._iFormatterPrecision !== iCurrentPrecision) {
				this._formatter = NumberFormat.getFloatInstance({ decimals: iCurrentPrecision });
				this._iFormatterPrecision = iCurrentPrecision;
			}

			return this._formatter;
		};

		/**
		 * Formats the given value according to the <code>displayValuePrecision</code> property.
		 * If the value is undefined or null, the <code>value</code> property is used.
		 *
		 * @returns formatted value as a String
		 * @private
		 */
		NumericInput.prototype._getFormattedValue = function (vValue) {
			const iPrecision = this._getDisplayValuePrecision();
			let iValueLength;

			if (vValue == undefined) {
				vValue = this.getValue();
			}

			if (Device.system.desktop) {
				return this._getNumberFormatter().format(vValue);
			}

			if (iPrecision <= 0) {
				// return value without any decimals
				return parseFloat(vValue).toFixed(0);
			}

			const sDigits = vValue.toString().split(".");

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
		NumericInput.prototype._padZeroesRight = function (value, precision) {
			let sResult = "";
			const iValueLength = value.length;

			// add zeros
			for (let i = iValueLength; i < precision; i++) {
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
		NumericInput.prototype._checkInputValue = function () {
			let sInputValue = this._getInput().getValue();
			let fDelta = 0;

			// check for empty input value, and if so - return the last saved value
			if (sInputValue === "") {
				sInputValue = this._getDefaultValue(sInputValue, this._getMax(), this._getMin()).toString();
			}

			if (Device.system.desktop) {
				const sGroupSeparator = this._getNumberFormatter().oFormatOptions.groupingSeparator;
				sInputValue = sInputValue.replaceAll(sGroupSeparator, "");
			}

			// calculates delta (difference) between input value and real control value
			if (this._getFormattedValue(this._fTempValue) !== this._getFormattedValue(sInputValue)) {
				fDelta = this._parseNumber(sInputValue) - this._fTempValue;
			}
			return fDelta;
		};

		NumericInput.prototype._verifyValueIfNeeded = function () {
			if (this._bNeedsVerification) {
				this._verifyValue();
				this._bNeedsVerification = false;
			}
		};

		/**
		 * Handles the <code>onsappageup</code>.
		 *
		 * Increases the value with the larger step.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		NumericInput.prototype.onsappageup = function (oEvent) {
			// prevent document scrolling when page up key is pressed
			oEvent.preventDefault();

			if (this.getEditable()) {
				this._bDelayedEventFire = true;
				this._changeValueWithStep(this.getLargerStep(), true);
				this._verifyValueIfNeeded();
			}
		};

		/**
		 * Handles the <code>onsappagedown</code> - PageDown key decreases the value with the larger step.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		NumericInput.prototype.onsappagedown = function (oEvent) {
			// prevent document scrolling when page down key is pressed
			oEvent.preventDefault();

			if (this.getEditable()) {
				this._bDelayedEventFire = true;
				this._changeValueWithStep(-this.getLargerStep(), true);
				this._verifyValueIfNeeded();
			}
		};

		/**
		 * Handles the Shift+PageUp key combination and sets the value to maximum.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		NumericInput.prototype.onsappageupmodifiers = function (oEvent) {
			if (this.getEditable() && this._isNumericLike(this._getMax()) && !(oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) && oEvent.shiftKey) {
				this._bDelayedEventFire = true;
				this._fTempValue = this._parseNumber(this._getInput().getValue());
				this._changeValueWithStep(this._getMax() - this._fTempValue, true);
				this._verifyValueIfNeeded();
			}
		};

		/**
		 * Handles the Shift+PageDown key combination and sets the value to minimum.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		NumericInput.prototype.onsappagedownmodifiers = function (oEvent) {
			if (this.getEditable() && this._isNumericLike(this._getMin()) && !(oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) && oEvent.shiftKey) {
				this._bDelayedEventFire = true;
				this._fTempValue = this._parseNumber(this._getInput().getValue());
				this._changeValueWithStep(-(this._fTempValue - this._getMin()), true);
				this._verifyValueIfNeeded();
			}
		};

		/**
		 * Handles the <code>onsapup</code> and increases the value with the default step (1).
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		NumericInput.prototype.onsapup = function (oEvent) {
			oEvent.preventDefault(); //prevents the value to increase by one (Chrome and Firefox default behavior)

			if (this.getEditable()) {
				this._bDelayedEventFire = true;
				this._changeValueWithStep(1, true);
				this._verifyValueIfNeeded();
				oEvent.setMarked();
			}
		};

		/**
		 * Handles the <code>onsapdown</code> and decreases the value with the default step (1).
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		NumericInput.prototype.onsapdown = function (oEvent) {
			oEvent.preventDefault(); //prevents the value to decrease by one (Chrome and Firefox default behavior)

			if (this.getEditable()) {
				this._bDelayedEventFire = true;
				this._changeValueWithStep(-1, true);
				this._verifyValueIfNeeded();
				oEvent.setMarked();
			}
		};

		NumericInput.prototype._onmousewheel = function (oEvent) {
			const oDomRef = this.getDomRef();
			const bIsFocused = oDomRef && oDomRef.contains(document.activeElement);
			if (bIsFocused && this.getEditable() && this.getEnabled()) {
				oEvent.preventDefault();
				const oOriginalEvent = oEvent.originalEvent,
					bDirectionPositive = oOriginalEvent.detail ? (-oOriginalEvent.detail > 0) : (oOriginalEvent.wheelDelta > 0);
				this._bDelayedEventFire = true;
				this._changeValueWithStep((bDirectionPositive ? 1 : -1), true);
				this._verifyValueIfNeeded();
			}
		};

		/**
		 * Handles the Ctrl+Shift+Up, Ctrl+Shift+Down, Shift+Up, and Shift+Down key combinations.
		 * Sets the value to the maximum or minimum, or increases or decreases the value with the larger step.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		NumericInput.prototype.onkeydown = function (oEvent) {
			let fStep,
				fMax,
				fMin;

			if (!this.getEditable()) {
				return;
			}

			if (oEvent.which === KeyCodes.ENTER && this._fTempValue !== this.getValue()) {
				oEvent.preventDefault();
				this._changeValue();
				return;
			}

			this._bPaste = (oEvent.ctrlKey || oEvent.metaKey) && (oEvent.which === KeyCodes.V);

			if (oEvent.which === KeyCodes.ARROW_UP && !oEvent.altKey && oEvent.shiftKey && (oEvent.ctrlKey || oEvent.metaKey)) { //ctrl+shift+up
				fMax = this._getMax();
				this._fTempValue = this._parseNumber(this._getInput().getValue());
				fStep = (fMax !== undefined) ? fMax - this._fTempValue : 0;
			} else if (oEvent.which === KeyCodes.ARROW_DOWN && !oEvent.altKey && oEvent.shiftKey && (oEvent.ctrlKey || oEvent.metaKey)) { //ctrl+shift+down
				fMin = this._getMin();
				this._fTempValue = this._parseNumber(this._getInput().getValue());
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
		NumericInput.prototype.onsapescape = function (oEvent) {
			if (this._fOldValue !== this._fTempValue) {
				this._applyValue(this._fOldValue);
				this._bNeedsVerification = true;
			}
		};

		/**
		 * Attaches the <code>liveChange</code> handler for the input.
		 * @private
		 */
		NumericInput.prototype._attachLiveChange = function () {
			this._getInput().attachLiveChange(this._liveChange, this);
		};

		/**
		 * Detaches the <code>liveChange</code> handler for the input.
		 * @private
		 */
		NumericInput.prototype._detachLiveChange = function () {
			this._getInput().detachLiveChange(this._liveChange, this);
		};

		/**
		 * Attaches the <code>change</code> handler for the input.
		 * @private
		 */
		NumericInput.prototype._attachChange = function () {
			this._getInput().attachChange(this._change, this);
		};

		/**
		 * Attaches the <code>liveChange</code> handler for the input.
		 * @private
		 */
		NumericInput.prototype._liveChange = function (oEvent) {
			this._disableButtons(this._parseNumber(this._getInput().getValue()), this._getMax(), this._getMin());
			this._verifyValue();
			this._bValueStatePreset = false;
		};

		/**
		 * Handles the <code>change</code> event for the input.
		 * @param {Object} oEvent The fired event
		 * @private
		 */
		NumericInput.prototype._change = function (oEvent) {
			let fOldValue;
			const oInput = this._getInput();
			const oNewValue = oInput.getValue();
			const bIsNotInValidRange = this._isLessThanMin(oNewValue) || this._isMoreThanMax(oNewValue);

			if (!this._isButtonFocused() ) {

				if (!this._btndown || bIsNotInValidRange) {
					fOldValue = this._parseNumber(this._getFormattedValue());
					if (this._fOldValue === undefined) {
						this._fOldValue = fOldValue;
					}

					this._sTempValue = oNewValue;

					this._bDelayedEventFire = false;
					this._changeValueWithStep(0);
					this._changeValue();
					this._bNeedsVerification = true;
				} else {
					this._fTempValue = this._parseNumber(oInput.getValue());
				}

				this._verifyValueIfNeeded();
			}
		};

		NumericInput.prototype._isMoreThanMax = function(iValue) {
			return this._isNumericLike(this._getMax()) && this._getMax() < iValue;
		};

		NumericInput.prototype._isLessThanMin = function(iValue) {
			return this._isNumericLike(this._getMin()) && this._getMin() > iValue;
		};

		/**
		 * Updates the visible value without forcing the additional checks performed by <code>setValue</code>.
		 * Used for keyboard handling when resetting the initial value with the Esc key.
		 *
		 * @param {float} fNewValue The new value to be applied
		 * @private
		 */
		NumericInput.prototype._applyValue = function (fNewValue) {
			// the property Value is not changing because this is a live change where the final value is not yet confirmed by the user
			this._getInput().setValue(this._getFormattedValue(fNewValue));
		};

		/**
		 * Makes calculations regarding the operation and the number type.
		 *
		 * @param {float} fStepMultiplier Holds the step multiplier
		 * @param {boolean} bIsIncreasing Holds the operation(or direction) whether addition(increasing) or subtraction(decreasing)
		 * @returns {{value: number, displayValue: number}} The result of the calculation
		 * @private
		 */
		NumericInput.prototype._calculateNewValue = function (fStepMultiplier, bIsIncreasing) {
			if (bIsIncreasing === undefined ) {
				bIsIncreasing = fStepMultiplier < 0 ? false : true;
			}
			const fStep = this.getStep(),
				fMax = this._getMax(),
				fMin = this._getMin(),
				fInputValue = parseFloat(this._getDefaultValue(this._getInput().getValue(), fMax, fMin)),
				iSign = bIsIncreasing ? 1 : -1,
				fMultipliedStep = Math.abs(fStep) * Math.abs(fStepMultiplier),
				fTempValue = (this._fTempValue === undefined || isNaN(this._fTempValue)) ? this.getValue() : this._fTempValue;
			let fResult = fInputValue + iSign * fMultipliedStep,
				fValueResult;

			if (this._areFoldChangeRequirementsFulfilled()) {
				fResult = fValueResult = this._calculateClosestFoldValue(fInputValue, fMultipliedStep, iSign);
			} else {
				fValueResult = this._sumValues(fTempValue, fMultipliedStep, iSign, this._iRealPrecision);
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
		NumericInput.prototype._getRealValuePrecision = function () {
			const sDigitsValue = this.getValue().toString().split("."),
				sDigitsStep = this.getStep().toString().split("."),
				sDigitsLargerStep = this.getLargerStep().toString().split(".");

			const iDigitsValueL = (!sDigitsValue[1]) ? 0 : sDigitsValue[1].length;
			const iDigitsStepL = (!sDigitsStep[1]) ? 0 : sDigitsStep[1].length;
			const iDigitsLargerStepL = (!sDigitsLargerStep[1]) ? 0 : sDigitsLargerStep[1].length;

			return Math.max(iDigitsValueL, iDigitsStepL, iDigitsLargerStepL);
		};

		/**
		 * Checks whether there is an existing instance of a decrement button or it has to be created.
		 *
		 * @returns {sap.ui.core.Icon} The icon that serves as a lightweight button
		 * @private
		 */
		NumericInput.prototype._getOrCreateDecrementButton = function(){
			return this._getDecrementButton() || this._createDecrementButton();
		};

		/**
		 * Checks if there is an existing increment button instance or it has to be created.
		 *
		 * @returns {sap.ui.core.Icon} The icon that serves as a lightweight button
		 * @private
		 */
		NumericInput.prototype._getOrCreateIncrementButton = function(){
			return this._getIncrementButton() || this._createIncrementButton();
		};

		/**
		 * <code>liveChange</code> handler.
		 * @param {sap.ui.base.Event} oEvent Event object
		 * @private
		 */
		NumericInput.prototype._inputLiveChangeHandler = function (oEvent) {
			this.bLiveChange = true;
			this._getInput().setProperty("value", oEvent.getParameter("value"), true);
		};

		NumericInput.prototype._isValueWithCorrectPrecision = function (sValue) {
			const sDecimalSeparator = Device.system.desktop ? this._getNumberFormatter().oFormatOptions.decimalSeparator : ".",
				iCharsSet = this._getDisplayValuePrecision();

			// If the value starts with the decimal separator, normalize it to "0.xxx" for the precision check
			if (sValue && sValue.indexOf(sDecimalSeparator) === 0) {
				sValue = `0${sValue}`;
			}

			const iDecimalMark = sValue?.indexOf(sDecimalSeparator);

			if (iDecimalMark < 0 && iCharsSet > 0) {
				// if there is no decimal mark but displayValuePrecision is more than 0 -> invalid
				return false;
			}

			if (iDecimalMark >= 0 && iCharsSet >= 0) { // only for decimals
				const sEventValueAfterTheDecimal = sValue?.split(sDecimalSeparator)[1],
					iCharsAfterTheDecimalSign = sEventValueAfterTheDecimal ? sEventValueAfterTheDecimal.length : 0;

				// if the characters after the decimal are more or less than the displayValuePrecision -> invalid
				if (iCharsAfterTheDecimalSign !== iCharsSet) {
					return false;
				}
			}

			return true;
		};

		/**
		 * Returns a default value depending on the given value, min, and max properties.
		 *
		 * @param {number} value The input value
		 * @param {number} max The maximum value
		 * @param {number} min The minimum value
		 * @returns {number} The default value
		 * @private
		 */
		NumericInput.prototype._getDefaultValue = function (value, max, min) {
			if (value !== "" && value !== undefined) {
				return this._parseNumber(this._getInput().getValue());
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
		NumericInput.prototype._isNumericLike = function (val) {
			return !isNaN(val) && val !== null && val !== "";
		};

		/**
		 * Determines if a given value is an integer
		 * @param {string|number} val the value to check
		 * @returns {boolean} true if the given value is integer, false otherwise
		 * @private
		 */
		NumericInput.prototype._isInteger = function(val) {
			return val === parseInt(val);
		};

		NumericInput.prototype._isButtonFocused = function () {
			const oIncrementButton = this._getIncrementButton(),
				oDecrementButton = this._getDecrementButton();
			return (oIncrementButton && document.activeElement === oIncrementButton.getDomRef()) ||
				(oDecrementButton && document.activeElement === oDecrementButton.getDomRef());
		};

		/*
		 * Sums two real values by converting them to integers before summing and restoring the result to a real value.
		 * @param {number} fValue1 The first value to sum
		 * @param {number} fValue2 The second value to sum
		 * @param {int} iSign <code>1</code> to sum the values, or <code>-1</code> to subtract the second from the first
		 * @param {int} iPrecision The precision the computation should be.
		 * @returns {number}
		 * @private
		 */
		NumericInput.prototype._sumValues = function(fValue1, fValue2, iSign, iPrecision) {
			const iPrecisionMultiplier = Math.pow(10, iPrecision),
				iValue1 = parseInt((fValue1 * iPrecisionMultiplier).toFixed(1)),
				iValue2 = parseInt((fValue2 * iPrecisionMultiplier).toFixed(1));
			return (iValue1 + (iSign * iValue2)) / iPrecisionMultiplier;
		};


		/**
		 * Determines if the stepMode of type ${@link sap.m.NumericInputStepModeType.Multiple} can be applied.
		 * @returns {boolean}
		 * @private
		 */
		NumericInput.prototype._areFoldChangeRequirementsFulfilled = function () {
			return this.getStepMode() === StepModeType.Multiple &&
				this._getDisplayValuePrecision() === 0 &&
				this._isInteger(this.getStep()) &&
				this._isInteger(this.getLargerStep());
		};

		/**
		 * Calculates the next or previous value that is fold by the provided step.
		 * @param {number} fValue The base value
		 * @param {number} step The step to increase the value to
		 * @param {number} iSign The direction: <code>1</code> for increment, <code>-1</code> for decrement
		 * @returns {number} The next or previous value
		 * @private
		 */
		NumericInput.prototype._calculateClosestFoldValue = function(fValue, step, iSign) {
			let fResult = Math.floor(fValue),
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
		 * Calculates the timeout before <code>_spinValues</code> is called.
		 */
		NumericInput.prototype._calcWaitTimeout = function() {
			this._speed *= NumericInput.ACCELLERATION;
			this._waitTimeout = ((this._waitTimeout - this._speed) < NumericInput.MIN_WAIT_TIMEOUT ? NumericInput.MIN_WAIT_TIMEOUT : (this._waitTimeout - this._speed));

			return this._waitTimeout;
		};

		/*
		 * Called when the increment or decrement button is pressed and held to update the value.
		 * @param {boolean} bIncrementButton Whether this is the increment button. If <code>true</code>, the value is spun up; if
		 * <code>false</code>, the value is spun down.
		 */
		NumericInput.prototype._spinValues = function(bIncrementButton) {
			this._spinTimeoutId = setTimeout(function () {
				if (this._btndown) {
					this._bSpinStarted = true;
					this._bDelayedEventFire = true;
					this._changeValueWithStep(bIncrementButton ? 1 : -1, true);
					this._disableButtons(this._parseNumber(this._getInput().getValue()), this._getMax(), this._getMin());
					if ((this._getIncrementButton().getEnabled() && bIncrementButton) || (this._getDecrementButton().getEnabled() && !bIncrementButton)) {
						this._spinValues(bIncrementButton);
					}
				}
			}.bind(this), this._calcWaitTimeout());
		};

		/*
		 * Attaches events to the increment or decrement button.
		 * @param {object} oBtn - The button to which the events are attached
		 * @param {boolean} bIncrementButton - Whether this is the increment button. If <code>true</code>, the value is spun up; if
		 * <code>false</code>, the value is spun down.
		 */
		NumericInput.prototype._attachEvents = function (oBtn, bIncrementButton) {
			// Desktop events
			const oEvents = {
					onmousedown: function (oEvent) {
						// check if the left mouse button is down
						if (oEvent.button === 0 && !this._btndown) {
							this._btndown = true;
							this._waitTimeout = NumericInput.INITIAL_WAIT_TIMEOUT;
							this._speed = NumericInput.INITIAL_SPEED;
							this._spinValues(bIncrementButton);
						}
					}.bind(this),
					onmouseup: function (oEvent) {
						// check if the left mouse button is up
						// handled in touchend for mobile
						// but the touchend comes before mousedown on android
						if (oEvent.button === 0) {
							this._bDelayedEventFire = undefined;
							this._btndown = false;
							this._stopSpin();
						}
					}.bind(this),
					onmouseout: function (oEvent) {
						if (this._btndown) {
							this._bDelayedEventFire = undefined;
							this._stopSpin();
						}
					}.bind(this),
					oncontextmenu: function (oEvent) {
						// Context menu is shown on "long-touch"
						// so prevent of showing it while "long-touching" on the button
						oEvent.stopImmediatePropagation(true);
						if (oEvent.originalEvent && oEvent.originalEvent.cancelable) {
							oEvent.preventDefault();
						}
						oEvent.stopPropagation();
					},
					ontouchend: function(oEvent) {
						if (Device.system.phone || Device.system.tablet) {
							this._bDelayedEventFire = undefined;
							this._btndown = false;
							this._stopSpin();
						}

						if (oEvent.originalEvent && oEvent.originalEvent.cancelable) {
							oEvent.preventDefault();
						}
						if (bIncrementButton) {
							this._getIncrementButton().invalidate();
						} else {
							this._getDecrementButton().invalidate();
						}
					}.bind(this)
				};

				oBtn.addDelegate(oEvents, true);

		};

		/**
		 * Stops an initiated spin and applies changes to the value.
		 * @private
		 */
		NumericInput.prototype._stopSpin = function() {
			this._resetSpinValues();
			if (this._bSpinStarted) {
				this._changeValue();
			}
		};

		NumericInput.prototype._getDisplayValuePrecision = function() {
			const oBinding = this.getBinding("value"),
				oBindingType = oBinding && oBinding.getType && oBinding.getType(),
				sBindingConstraintScale = oBindingType && oBindingType.oConstraints && oBindingType.oConstraints.scale;

			const iParsed = parseInt(sBindingConstraintScale);
			return sBindingConstraintScale !== undefined && !isNaN(iParsed) ? iParsed : this.getDisplayValuePrecision();
		};

		NumericInput.prototype._getMin = function() {
			const oBinding = this.getBinding("value"),
				oBindingType = oBinding && oBinding.getType && oBinding.getType(),
				sBindingConstraintMin = oBindingType && oBindingType.oConstraints && oBindingType.oConstraints.minimum;

			return sBindingConstraintMin !== undefined ? parseFloat(sBindingConstraintMin) : this.getMin();
		};

		NumericInput.prototype._getMax = function() {
			const oBinding = this.getBinding("value"),
				oBindingType = oBinding && oBinding.getType && oBinding.getType(),
				sBindingConstraintMax = oBindingType && oBindingType.oConstraints && oBindingType.oConstraints.maximum;

			return sBindingConstraintMax !== undefined ? parseFloat(sBindingConstraintMax) : this.getMax();
		};

		/**
		 * Returns the DOM node ID to be used for the <code>labelFor</code> attribute of the label.
		 *
		 * @return {string} The owner control's ID, or <code>undefined</code> if not set
		 * @public
		 */
		NumericInput.prototype.getIdForLabel = function () {
			return this._getInput().getIdForLabel();
		};

		NumericInput.prototype.onfocusout = function ( oEvent ) {
			if (!this._btndown) {
				this._changeValueWithStep(0);
				if (this._bDelayedEventFire && (this._fTempValue !== this._fOldValue)) {
					this._bDelayedEventFire = undefined;
					this._changeValue();
				}
			}
		};

		NumericInput.prototype.getFocusDomRef = function() {
			return this.getAggregation("_input").getFocusDomRef();
		};

		/*
		 * Resets timeouts and speed to initial values.
		 */
		NumericInput.prototype._resetSpinValues = function() {
			clearTimeout(this._spinTimeoutId);
			this._waitTimeout = 500;
			this._speed = 120;
		};

		NumericInput.prototype.getAccessibilityInfo = function() {
			return {
				type: Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_STEPINPUT"),
				description: this.getValue() || "",
				focusable: this.getEnabled(),
				enabled: this.getEnabled(),
				editable: this.getEnabled() && this.getEditable()
			};
		};

		NumericInput.prototype._parseNumber = function(sValue) {
			if (Device.system.desktop) {
				return this._getNumberFormatter().parse(sValue);
			}

			return Number(sValue);
		};

		/**
		 * Sets the ID of the owner control whose accessibility attributes should be applied to the inner input.
		 *
		 * @param {string} sId The owner control's ID
		 * @private
		 */
		NumericInput.prototype._setOwnerControlId = function(sId) {
			this._sOwnerControlId = sId;
		};

		/**
		 * Returns the ID of the owner control set via {@link #_setOwnerControlId}.
		 *
		 * @returns {string|undefined} The owner control's ID, or undefined if not set
		 * @private
		 */
		NumericInput.prototype._getOwnerControlId = function() {
			return this._sOwnerControlId;
		};

		return NumericInput;
	});
