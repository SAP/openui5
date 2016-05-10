/*!
 * ${copyright}
 */

// Provides control sap.m.StepInput.
sap.ui.define(["jquery.sap.global", "./Button", "./Input", "sap/ui/core/Control", "sap/ui/core/IconPool"],
	function (jQuery, Button, Input, Control, IconPool) {
		"use strict";

		/**
		 * Constructor for a new StepInput.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The <code>StepInput</code> control allows the user to change the input values with predefined increments (steps).
		 * @extends sap.ui.core.Control
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

				library: "sap.m",
				properties: {

					/**
					 * Sets the minimum possible value of the defined range.
					 */
					min: {type: "Number", group: "Data"},
					/**
					 * Sets the maximum possible value of the defined range.
					 */
					max: {type: "Number", group: "Data"},
					/**
					 * Increases/decreases the value of the input.
					 */
					step: {type: "Number", group: "Data", defaultValue: 1},
					/**
					 * TIncreases/decreases the value with a larger value than the set step only when using the PageUp/PageDown keys.
					 * Default value is 2 times larger than the set step.
					 */
					largerStep: {type: "Number", group: "Data", defaultValue: 2},
					/**
					 * Determines the value of the <code>StepInput</code> and can be set initially from the app developer.
					 */
					value: {type: "Number", group: "Data", defaultValue: 0},
					/**
					 * Defines the width of the control.
					 */
					width: {type: "sap.ui.core.CSSSize", group: "Dimension"},
					/**
					 * Accepts the core enumeration ValueState.type that supports <code>None</code>, <code>Error</code>, <code>Warning</code> and <code>Success</code>.
					 */
					valueState: {type: "sap.ui.core.ValueState", group: "Data", defaultValue: sap.ui.core.ValueState.None},
					/**
					 * Defines whether the control can be modified by the user or not.
					 * <b>Note:</b> A user can tab to the non-editable control, highlight it, and copy the text from it.
					 */
					editable: {type: "boolean", group: "Behavior", defaultValue: true},
					/**
					 * Indicates whether the user can interact with the control or not.
					 * <b>Note:</b> Disabled controls cannot be focused and they are out of the tab-chain.
					 */
					enabled: {type: "boolean", group: "Behavior", defaultValue: true}
				},
				aggregations: {
					/**
					 * Internal aggregation that contains the <code>Button</code> for incrementation.
					 */
					_incrementButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
					/**
					 * Internal aggregation that contains the <code>Button</code> for decrementation.
					 */
					_decrementButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
					/**
					 * Internal aggregation that contains the <code>Input</code>.
					 */
					_input: {type: "sap.m.Input", multiple: false, visibility: "hidden"}
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
				}
			}
		});

		/**
		 * Initializes the control.
		 */
		StepInput.prototype.init = function () {
			this._attachPressEvents();
			this._attachLiveChange();
		};

		/**
		 * Called before the control is rendered.
		 */
		StepInput.prototype.onBeforeRendering = function () {

			var vMin = this._getIntOrFloat(this.getMin()),
				vMax = this._getIntOrFloat(this.getMax()),
				vValue = this._getIntOrFloat(this.getValue());

			this._getInput().setValue(vValue);

			if (isNumber(vMin) && (vMin > vValue)) {
				this.setValue(vMin);
			}
			if (isNumber(vMax) && (vMax < vValue)) {
				this.setValue(vMax);
			}
			this._disableButtons(vValue, vMax, vMin);
		};

		/**
		 * Parses the number to the correct type.
		 *
		 * @param {Number} number Any number
		 * @returns {Number} Any number in the corresponding type
		 * @private
		 */
		StepInput.prototype._getIntOrFloat = function (number) {
			return this.isInteger(number) ? parseInt(number, 10) : parseFloat(number, 10);
		};

		/**
		 * Called after the control is rendered.
		 */
		StepInput.prototype.onAfterRendering = function () {
			this._writeAccessibilityState();
			this._getIncrementButton().$().attr('tabindex', '-1');
			this._getDecrementButton().$().attr('tabindex', '-1');
		};

		StepInput.prototype.setProperty = function (sPropertyName, oValue, bSuppressInvalidate) {
			this._writeAccessibilityState(sPropertyName, oValue);

			if (["enabled", "editable"].indexOf(sPropertyName) > -1) {
				this._getInput().setProperty(sPropertyName, oValue, bSuppressInvalidate);
			}

			return Control.prototype.setProperty.apply(this, arguments);
		};

		/**
		 * Sets the min value.
		 *
		 * @param {Number} number
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 */
		StepInput.prototype.setMin = function (number) {
			return this.setProperty("min", number, true);
		};

		/**
		 * Sets the max value.
		 *
		 * @param {Number} number
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 */
		StepInput.prototype.setMax = function (number) {
			return this.setProperty("max", number, true);
		};

		/**
		 * Lazily retrieves the <code>incrementButton</code>.
		 *
		 * @returns {sap.m.Button}
		 */
		StepInput.prototype._getIncrementButton = function () {
			if (!this.getAggregation("_incrementButton")) {
				this.setAggregation("_incrementButton", new Button({
					icon: IconPool.getIconURI("add"),
					id: this.getId() + "-incrementButton",
					type: sap.m.ButtonType.Transparent
				}));
			}
			return this.getAggregation("_incrementButton");
		};

		/**
		 * Lazily retrieves the <code>decrementButton</code>.
		 *
		 * @returns {sap.m.Button}
		 */
		StepInput.prototype._getDecrementButton = function () {
			if (!this.getAggregation("_decrementButton")) {
				this.setAggregation("_decrementButton", new Button({
					icon: IconPool.getIconURI("less"),
					id: this.getId() + "-decrementButton",
					type: sap.m.ButtonType.Transparent
				}));
			}
			return this.getAggregation("_decrementButton");
		};

		/**
		 * Lazily retrieves the <code>Input</code>.
		 *
		 * @returns {sap.m.Input}
		 */
		StepInput.prototype._getInput = function () {
			if (!this.getAggregation("_input")) {
				this.setAggregation("_input", new Input({
					// sap.m.StepInput should inherit visually sap.m.Input's styling
					width: this.getWidth(),
					id: this.getId() + "-input",
					textAlign: sap.ui.core.TextAlign.End,
					type: sap.m.InputType.Number,
					editable: this.getEditable(),
					enabled: this.getEnabled()
				}));
			}

			return this.getAggregation("_input");
		};

		/**
		 * Attaches an event handler to the event with the given identifier for the current control.
		 *
		 */
		StepInput.prototype._attachPressEvents = function () {
			this._getIncrementButton().attachPress(this._handleButtonPress.bind(this, true));
			this._getDecrementButton().attachPress(this._handleButtonPress.bind(this, false));
		};

		/**
		 * Handles the button press.
		 *
		 * @params {boolean} isPlusButton Indicates the pressed button either the increment or decrement one
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 */
		StepInput.prototype._handleButtonPress = function (isPlusButton) {
			//debugger;
			var vInputValue = this._calculateValue(1, isPlusButton),
				vMin = this._getIntOrFloat(this.getMin()),
				vMax = this._getIntOrFloat(this.getMax()),
				valueState = this._getInput().getValueState();

			if (valueState == sap.ui.core.ValueState.Error && (vInputValue == vMin || vInputValue == vMax)) {
				this.setValueState(sap.ui.core.ValueState.None);
			}

			this._disableButtons(this._getIntOrFloat(vInputValue));
			this.setValue(vInputValue);

			// Return the focus on the main element
			this.$().focus();

			return this;
		};

		/**
		 * Handles whether the increment and decrement buttons should be enabled/disabled based on different situations.
		 *
		 * @params {number} value Indicates the value in the input
		 * @params {number} max Indicates the max
		 * @params {number} min Indicates the min
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 */
		StepInput.prototype._disableButtons = function (value, max, min) {

			if (min < value && value < max) {
				this._getDecrementButton().setEnabled(true);
				this._getIncrementButton().setEnabled(true);
				return this;
			}

			if (value == min) {
				this._getDecrementButton().setEnabled(false);
			}

			if (value == max) {
				this._getIncrementButton().setEnabled(false);
			}

			return this;
		};

		/**
		 * Handles the <code>focusout</code> event.
		 *
		 */
		StepInput.prototype.onfocusout = function () {
			this._handleIncorrectValues();

			if (this.getValue() == "") {
				if (isNumber(this.getMin()) && this.getMin() > 0) {
					this.setValue(this.getMin());
				} else if (isNumber(this.getMax()) && this.getMax() < 0) {
					this.setValue(this.getMax());
				} else {
					this.setValue(0);
				}
			}
		};

		/**
		 * Sets the <code>valueState</code> if there is a value that is not within a given limit and enables/disables the
		 * buttons if the value is set outside the limits.
		 *
		 */
		StepInput.prototype._handleIncorrectValues = function () {
			var min = this._getIntOrFloat(this.getMin()),
				max = this._getIntOrFloat(this.getMax()),
				value = this._getIntOrFloat(this._getInput().getValue()),
				bIncrementEnabled = true,
				bDecrementEnabled = true;

			if (value > max || value < min) {
				this.setValueState(sap.ui.core.ValueState.Error);
			} else {
				this.setValueState(sap.ui.core.ValueState.None);
			}
			if (value >= max) {
				bIncrementEnabled = false;
			}
			if (value <= min) {
				bDecrementEnabled = false;
			}

			this._getIncrementButton().setEnabled(bIncrementEnabled);
			this._getDecrementButton().setEnabled(bDecrementEnabled);
		};

		StepInput.prototype.setValue = function (oValue) {
			this._getInput().setValue(oValue);
			return this.setProperty("value", oValue, true);

		};

		/**
		 * Handles the onsappageup.
		 *
		 * If there is a large step set, pageup increases the value with this larger step
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsappageup = function (oEvent) {
			this._applyValue(this._calculateValue(this.getLargerStep(), true));
			this._handleIncorrectValues();
		};

		/**
		 * Handles the <code>onsappagedown</code> - PageDown key decreases the value with the larger step.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsappagedown = function (oEvent) {
			this._applyValue(this._calculateValue(this.getLargerStep(), false));
			this._handleIncorrectValues();
		};

		/**
		 * Handles the Shift + PageUp key combination and sets the value to maximum.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsappageupmodifiers = function (oEvent) {
			if (isNumber(this.getMax()) && !(oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) && oEvent.shiftKey) {
				this._applyValue(this.getMax());
			}
		};

		function isNumber(number) {
			return !isNaN(number) && number !== null;
		}

		/**
		 * Handles the Shift + PageDown key combination and sets the value to minimum.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsappagedownmodifiers = function (oEvent) {
			if (isNumber(this.getMin()) && !(oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) && oEvent.shiftKey) {
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
			this._applyValue(this._calculateValue(1, true));
			this._handleIncorrectValues();
		};

		/**
		 * Handles the <code>onsapdown</code> and decreases the value with the default step (1).
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsapdown = function (oEvent) {
			oEvent.preventDefault(); //prevents the value to decrease by one (Chrome and Firefox default behavior)
			this._applyValue(this._calculateValue(1, false));
			this._handleIncorrectValues();
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
				this._applyValue(this._calculateValue(this.getLargerStep(), true));
			}
			if (oEvent.which === jQuery.sap.KeyCodes.ARROW_DOWN && !(oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) && oEvent.shiftKey) { //shift+down
				oEvent.preventDefault(); //preventing to be subtracted  both the minimum step (1) and the larger step
				this._applyValue(this._calculateValue(this.getLargerStep(), false));
			}
			this._handleIncorrectValues();
		};

		/**
		 * Handles the Еsc key and reverts the value in the input field to the previous one.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 */
		StepInput.prototype.onsapescape = function (oEvent) {
			this.getAggregation("_input").onsapescape(oEvent);
		};

		/**
		 * Attaches the <code>liveChange</code> handler for the input.
		 * @private
		 */
		StepInput.prototype._attachLiveChange = function () {
			this._getInput().attachLiveChange(this._liveChange, this);
		};

		/**
		 * Attaches the <code>liveChange</code> handler for the input.
		 * @private
		 */
		StepInput.prototype._liveChange = function () {
			this._handleIncorrectValues();
			this.setProperty("value", this._getInput().getValue(), true);
		};

		/**
		 * Applies change on the visible value but doesn't force the other checks that come with <code>this.setValue</code>.
		 * Usable for Keyboard Handling when resetting initial value with ESC key.
		 *
		 * @param fNewValue
		 * @private
		 */
		StepInput.prototype._applyValue = function (fNewValue) {
			if (!this.getEditable() || !this.getEnabled()) {
				return;
			}

			this.setProperty("value", fNewValue, true);
			this.getAggregation("_input")._$input.val(fNewValue);
		};

		/**
		 * Makes calculations regarding the operation and the number type.
		 *
		 * @param {String} iStepMultiplier Holds the step multiplier
		 * @param {Boolean} isPlusButton Holds the operation whether addition or subtraction
		 * returns {Number}
		 * @private
		 */
		StepInput.prototype._calculateValue = function (iStepMultiplier, isPlusButton) {
			var bValuePlusStepBiggerThanMax,
				bValueMinusStepLowerThanMin,
				vValuePlusStep,
				isValueInt = this.isInteger(this.getValue()),
				isStepInt = this.isInteger(this.getStep()),
				vInputValue = this._getIntOrFloat(this._getInput().getValue()),
				vStep = this._getIntOrFloat(this.getStep()),
				vMultipliedStep = this._getIntOrFloat(this.getStep() * iStepMultiplier),
				iSign = isPlusButton ? 1 : -1;

			bValuePlusStepBiggerThanMax = vInputValue + vStep >= this.getMax();
			bValueMinusStepLowerThanMin = vInputValue - vStep <= this.getMin();
			vValuePlusStep = vInputValue + iSign * vMultipliedStep;

			if (isPlusButton && isNumber(this.getMax()) && bValuePlusStepBiggerThanMax) {
				return this.getMax();
			}

			if (!isPlusButton && isNumber(this.getMin()) && bValueMinusStepLowerThanMin) {
				return this.getMin();
			}

			if (!isStepInt || !isValueInt) {
				return vValuePlusStep.toFixed(1);
			} else {
				return vValuePlusStep;
			}

			return this.getValue();
		};

		/**
		 * Handles the value state of the control.
		 *
		 * @param sValueState
		 * @returns {sap.m.StepInput} Reference to the control instance for chaining
		 */
		StepInput.prototype.setValueState = function (sValueState) {
			var bError = false,
				bWarning = false;

			if (sValueState == sap.ui.core.ValueState.Error) {
				this._getInput().setValueState(sap.ui.core.ValueState.Error);
				bError = true;
			}
			if (sValueState == sap.ui.core.ValueState.Warning){
				this._getInput().setValueState(sap.ui.core.ValueState.Warning);
				bWarning = true;
			}
			if (sValueState == sap.ui.core.ValueState.None){
				this._getInput().setValueState(sap.ui.core.ValueState.None);
				bError = false;
				bWarning = false;
			}

			jQuery.sap.delayedCall(0, this, function () {
				this.$().toggleClass("sapMStepInputError", bError).toggleClass("sapMStepInputWarning", bWarning);
			});

			return this;
		};

		/**
		 * Checks whether the value is integer.
		 *
		 * @params {number} vValue - Holds the value in the input
		 * @returns {boolean}
		 */
		StepInput.prototype.isInteger = function (vValue) {
			return vValue % 1 === 0;
		};

		/**
		 * Makes calculations regarding the operation and the number type.
		 *
		 * @params {boolean} bEditable - Indicates if the value is editable
		 */
		StepInput.prototype.setEditable = function (bEditable) {
			var args = Array.prototype.slice.call(arguments);

			bEditable = this.validateProperty('editable', bEditable);

				if (!bEditable) {
					this._getInput().setTextAlign(sap.ui.core.TextAlign.Begin);
					this.removeAggregation("_decrementButton", false);
					this.removeAggregation("_incrementButton");
				}

			StepInput.prototype.setProperty.apply(this, ["editable"].concat(args));
		};

		/**
		 * Writes the accessibility state.
		 *
		 * @params {string} sProp
		 * @params {string} sValue
		 */
		StepInput.prototype._writeAccessibilityState = function (sProp, sValue) {
			var vMin, vMax, sLabeledBy, sDescribedBy,
				$input = this.getDomRef("input-inner"),
				aArialState = [],
				mNameToAria = {
					"min": "aria-valuemin",
					"max": "aria-valuemax",
					"value": "aria-valuenow"
				};
			if (!$input){
				return;
			}

			if (sProp && mNameToAria[sProp]) {
				aArialState = [{aria: mNameToAria[sProp], value: sValue}];
			} else if (!sProp) {
				vMin = this.getMin();
				vMax = this.getMax();
				sLabeledBy = this.getAriaLabelledBy().join(" ");
				sDescribedBy = this.getAriaDescribedBy().join(" ");

				aArialState = [
					{aria: "role", value: "spinbutton"},
					{aria: "aria-valuenow", value: this.getValue()}
				];

				if (typeof vMin == "number") {
					aArialState.push({aria: "aria-valuemin", value: vMin});
				}
				if (typeof vMax == "number") {
					aArialState.push({aria: "aria-valuemax", value: vMax});
				}
				if (sLabeledBy) {
					aArialState.push({aria: "aria-labelledby", value: sLabeledBy});
				}
				if (sDescribedBy) {
					aArialState.push({aria: "aria-describedby", value: sDescribedBy});
				}
			}

			aArialState.forEach(function (oAria) {
				$input.setAttribute(oAria.aria, oAria.value);
			});
		};

		return StepInput;

	}, /* bExport= */ true);
