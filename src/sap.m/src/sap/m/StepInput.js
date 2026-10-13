/*!
 * ${copyright}
 */

// Provides control sap.m.StepInput.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/message/MessageMixin",
	"sap/ui/core/library",
	"sap/m/library",
	"./NumericInput",
	"./StepInputRenderer",
	"sap/ui/Device"
],
function(
	Control,
	MessageMixin,
	coreLibrary,
	library,
	NumericInput,
	StepInputRenderer,
	Device
) {
		"use strict";

		// shortcut for sap.ui.core.TextAlign
		const TextAlign = coreLibrary.TextAlign;

		// shortcut for sap.ui.core.ValueState
		const ValueState = coreLibrary.ValueState;

		// shortcut for sap.m.StepInputValidationMode
		const StepInputValidationMode = library.StepInputValidationMode;

		// shortcut for sap.m.StepModes
		const StepModeType = library.StepInputStepModeType;

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
		 * has a certain precision limit.
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
		 * This restriction comes from JavaScript itself and it cannot be worked around in a
		 * feasible way.
		 *
		 * <b>Note:</b> Formatting of decimal numbers is browser dependent, regardless of
		 * framework number formatting.
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
		 */
		const StepInput = Control.extend("sap.m.StepInput", /** @lends sap.m.StepInput.prototype */ {
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
					 * ValueState is managed internally only when validation is triggered by user interaction.
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
					 * Internal aggregation that contains the composite <code>NumericInput</code>.
					 */
					_numericInput: {type: "sap.m.NumericInput", multiple: false, visibility: "hidden"}
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
			renderer: StepInputRenderer
		});

		MessageMixin.call(StepInput.prototype);

		const aForwardedProperties = [
			"min", "max", "step", "stepMode", "largerStep", "value",
			"name", "placeholder", "required", "width",
			"valueState", "valueStateText", "editable", "enabled",
			"description", "fieldWidth", "textAlign"
		];

		/**
		 * Initializes the control by creating the inner NumericInput with step buttons enabled.
		 */
		StepInput.prototype.init = function () {
			const oNumericInput = new NumericInput(this.getId() + "-input");
			oNumericInput._setOwnerControlId(this.getId());
			oNumericInput.setProperty("_showStepButtons", true);
			oNumericInput.attachChange(function (oEvent) {
				this.fireChange({ value: oEvent.getParameter("value") });
			}.bind(this));
			oNumericInput.fireValidationError = function (mParams) {
				mParams.element = this;
				mParams.id = this.getId();
				this.fireValidationError(mParams);
			}.bind(this);
			oNumericInput.attachEvent("propertyChanged", function (oEvent) {
				const sName = oEvent.getParameter("name"),
					oValue = oEvent.getParameter("value");
				if (aForwardedProperties.indexOf(sName) !== -1 || sName === "displayValuePrecision" || sName === "validationMode" || sName === "valueState") {
					// When the value was normalised from null/undefined, NumericInput sets its
					// own property to the default (0) but StepInput must preserve null so that
					// getValue() correctly reflects the unloaded model state.
					if (sName === "value" && oEvent.getParameter("nullish")) {
						return;
					}
					this._bUpdatingFromNumericInput = true;
					Control.prototype.setProperty.call(this, sName, oValue, true);
					this._bUpdatingFromNumericInput = false;
				}
			}.bind(this));
			this.setAggregation("_numericInput", oNumericInput);
		};

		/**
		 * Returns the inner NumericInput control.
		 * @returns {sap.m.NumericInput}
		 * @private
		 */
		StepInput.prototype._getNumericInput = function () {
			return this.getAggregation("_numericInput");
		};

		StepInput.prototype.onBeforeRendering = function () {
			const oNumericInput = this._getNumericInput();

			// Properties safe to sync via raw setProperty (no side-effecting custom setter on NumericInput)
			[
				"step", "stepMode", "largerStep",
				"name", "placeholder", "required", "width",
				"valueStateText", "editable", "enabled",
				"description", "fieldWidth", "textAlign"
			].forEach(function (sProp) {
				const oValue = this.getProperty(sProp);
				if (oNumericInput.getProperty(sProp) !== oValue) {
					oNumericInput.setProperty(sProp, oValue, true);
				}
			}.bind(this));

			// min/max: use proper setter to trigger NumericInput's numeric validation
			const fMin = this.getMin();
			if (oNumericInput.getMin() !== fMin) {
				oNumericInput.setMin(fMin);
			}
			const fMax = this.getMax();
			if (oNumericInput.getMax() !== fMax) {
				oNumericInput.setMax(fMax);
			}

			// valueState: use proper setter to correctly manage _bValueStatePreset on NumericInput
			const sValueState = this.getValueState();
			if (oNumericInput.getValueState() !== sValueState) {
				oNumericInput.setValueState(sValueState);
			}

			const vTooltip = this.getTooltip();
			if (oNumericInput.getTooltip() !== vTooltip) {
				oNumericInput.setTooltip(vTooltip);
			}

			const iPrecision = this.getDisplayValuePrecision();
			if (iPrecision !== oNumericInput.getDisplayValuePrecision()) {
				oNumericInput.setDisplayValuePrecision(iPrecision);
			}

			// validationMode: use proper setter to trigger live change handler attach/detach
			const sValidationMode = this.getValidationMode();
			if (sValidationMode !== oNumericInput.getValidationMode()) {
				oNumericInput.setValidationMode(sValidationMode);
			}

			// value: use proper setter for full NumericInput value normalization.
			// Skip null — the framework sets the property to null when a binding context
			// is cleared (e.g. NavContainer navigation) before data has been fetched.
			// Forwarding null to NumericInput would normalise it to 0 and fire a change
			// event, causing a spurious write-back that breaks OData v4 bindings with
			// "Must not change a property before it has been read".
			const fValue = this.getProperty("value");
			if (fValue == null) {
				oNumericInput.setValue(fValue, true);
			} else if (fValue !== oNumericInput.getValue()) {
				oNumericInput.setValue(fValue);
			}
		};

		StepInput.prototype.setProperty = function (sPropertyName, oValue, bSuppressInvalidate) {
			Control.prototype.setProperty.call(this, sPropertyName, oValue, bSuppressInvalidate);
			if (this._bUpdatingFromNumericInput) {
				return this;
			}
			const oNumericInput = this._getNumericInput();
			if (!oNumericInput) {
				return this;
			}
			if (sPropertyName === "displayValuePrecision") {
				oNumericInput.setDisplayValuePrecision(oValue);
			} else if (sPropertyName === "validationMode") {
				oNumericInput.setValidationMode(oValue);
			} else if (sPropertyName === "min") {
				oNumericInput.setMin(oValue);
			} else if (sPropertyName === "max") {
				oNumericInput.setMax(oValue);
			} else if (sPropertyName === "valueState") {
				oNumericInput.setValueState(oValue);
			} else if (sPropertyName === "value") {
				if (oValue == null) {
					// Forward null/undefined so NumericInput clears its display to the default (0),
					// but suppress the model update so the normalised value is not written
					// back to the model — that would break OData v4 bindings that have not
					// yet been read (e.g. after NavContainer clears the binding context).
					oNumericInput.setValue(oValue, true);
				} else {
					oNumericInput.setValue(oValue);
				}
			} else if (aForwardedProperties.indexOf(sPropertyName) !== -1) {
				oNumericInput.setProperty(sPropertyName, oValue, bSuppressInvalidate);
			}
			return this;
		};

		/**
		 * Sets the validation mode.
		 *
		 * @param {sap.m.StepInputValidationMode} sValidationMode The validation mode value
		 * @returns {this} Reference to the control instance for chaining
		 */
		StepInput.prototype.setValidationMode = function (sValidationMode) {
			this._getNumericInput().setValidationMode(sValidationMode);
			Control.prototype.setProperty.call(this, "validationMode", sValidationMode, true);
			return this;
		};

		/**
		 * Sets the min value.
		 *
		 * @param {float} min The minimum value
		 * @returns {this} Reference to the control instance for chaining
		 */
		StepInput.prototype.setMin = function (min) {
			this._getNumericInput().setMin(min);
			Control.prototype.setProperty.call(this, "min", this._getNumericInput().getMin(), true);
			return this;
		};

		/**
		 * Sets the max value.
		 *
		 * @param {float} max The max value
		 * @returns {this} Reference to the control instance for chaining
		 */
		StepInput.prototype.setMax = function (max) {
			this._getNumericInput().setMax(max);
			Control.prototype.setProperty.call(this, "max", this._getNumericInput().getMax(), true);
			return this;
		};

		/*
		 * Sets the <code>displayValuePrecision</code>.
		 *
		 * @param {number} number The value precision
		 * @returns {this} Reference to the control instance for chaining
		 */
		StepInput.prototype.setDisplayValuePrecision = function (number) {
			this._getNumericInput().setDisplayValuePrecision(number);
			Control.prototype.setProperty.call(this, "displayValuePrecision", this._getNumericInput().getDisplayValuePrecision(), false);
			return this;
		};

		StepInput.prototype.setValueState = function (sValueState) {
			Control.prototype.setProperty.call(this, "valueState", sValueState, false);
			this._getNumericInput().setValueState(sValueState);
			return this;
		};

		StepInput.prototype.setValue = function (oValue) {
			this._iValuePrecision = this._getNumericInput()._getNumberPrecision(oValue);

			if (oValue == null) {
				// Forward null/undefined to NumericInput so its display resets to the
				// default, but suppress the model update so the normalised 0 is not
				// written back to the model — that would break OData v4 bindings that
				// have not yet been read (e.g. after NavContainer clears the context).
				this._getNumericInput().setValue(oValue, true);
				Control.prototype.setProperty.call(this, "value", oValue, true);
				return this;
			}

			if (isNaN(oValue)) {
				oValue = this._getNumericInput()._getDefaultValue(undefined, this._getNumericInput()._getMax(), this._getNumericInput()._getMin());
			} else {
				oValue = Number(oValue);
			}

			this._getNumericInput().setValue(oValue);
			Control.prototype.setProperty.call(this, "value", this._getNumericInput().getValue(), false);
			return this;
		};

		StepInput.prototype.getValue = function () {
			const oValue = this.getProperty("value");
			if (oValue == null) {
				return this._getNumericInput().getValue();
			}
			return oValue;
		};

		StepInput.prototype.setTooltip = function (vTooltip) {
			Control.prototype.setTooltip.call(this, vTooltip);
			this._getNumericInput().setTooltip(vTooltip);
			return this;
		};

		/**
		 * Returns the DOMNode Id to be used for the "labelFor" attribute of the label.
		 *
		 * @return {string} Id to be used for the <code>labelFor</code>
		 * @public
		 */
		StepInput.prototype.getIdForLabel = function () {
			return this._getNumericInput().getIdForLabel();
		};

		StepInput.prototype.getFocusDomRef = function () {
			return this._getNumericInput().getFocusDomRef();
		};

		StepInput.prototype.getAccessibilityInfo = function () {
			return this._getNumericInput().getAccessibilityInfo();
		};

		StepInput.prototype.onsapup = function (oEvent) {
			this._getNumericInput().onsapup(oEvent);
		};

		StepInput.prototype.onsapdown = function (oEvent) {
			this._getNumericInput().onsapdown(oEvent);
		};

		StepInput.prototype.onsappageup = function (oEvent) {
			this._getNumericInput().onsappageup(oEvent);
		};

		StepInput.prototype.onsappagedown = function (oEvent) {
			this._getNumericInput().onsappagedown(oEvent);
		};

		StepInput.prototype.onsappageupmodifiers = function (oEvent) {
			this._getNumericInput().onsappageupmodifiers(oEvent);
		};

		StepInput.prototype.onsappagedownmodifiers = function (oEvent) {
			this._getNumericInput().onsappagedownmodifiers(oEvent);
		};

		StepInput.prototype.onkeydown = function (oEvent) {
			this._getNumericInput().onkeydown(oEvent);
		};

		StepInput.prototype.onsapescape = function (oEvent) {
			this._getNumericInput().onsapescape(oEvent);
		};

		StepInput.prototype.onfocusout = function (oEvent) {
			this._getNumericInput().onfocusout(oEvent);
		};

		StepInput.prototype.bindProperty = function (sName, vBindingInfo) {
			Control.prototype.bindProperty.apply(this, arguments);
			const oNumericInput = this._getNumericInput();
			if (oNumericInput) {
				if (sName === "value") {
					// Do not mirror the "value" binding onto NumericInput at all — any
					// binding (even OneWay) would receive model updates and coerce null→0
					// via the float type, triggering a spurious write-back on OData v4
					// bindings that have not yet been read.
					// Instead expose a getter so NumericInput can read the binding type
					// constraints (scale, min, max) directly from StepInput's binding.
					oNumericInput._fnGetValueBinding = this.getBinding.bind(this, "value");
					return this;
				}
				const oBindingInfo = this.getBindingInfo(sName);
				const oClonedInfo = Object.assign({}, oBindingInfo);
				delete oClonedInfo.binding;
				delete oClonedInfo.modelChangeHandler;
				delete oClonedInfo.dataStateChangeHandler;
				delete oClonedInfo.modelRefreshHandler;
				oNumericInput.bindProperty(sName, oClonedInfo);
			}
			return this;
		};

		StepInput.prototype.unbindProperty = function (sName, bSuppressReset) {
			Control.prototype.unbindProperty.apply(this, arguments);
			const oNumericInput = this._getNumericInput();
			if (oNumericInput && !this._bIsBeingDestroyed) {
				if (sName === "value") {
					oNumericInput._fnGetValueBinding = null;
				} else {
					oNumericInput.unbindProperty(sName, bSuppressReset);
				}
			}
			return this;
		};

		StepInput.prototype.onAfterRendering = function () {
			const sEvent = Device.browser.firefox ? "DOMMouseScroll" : "mousewheel";
			const oNumericInput = this._getNumericInput();
			this.$().off(sEvent).on(sEvent, oNumericInput._onmousewheel);
		};

		StepInput.prototype.exit = function () {
			const sEvent = Device.browser.firefox ? "DOMMouseScroll" : "mousewheel";
			this.$().off(sEvent);
		};

		StepInput.prototype.addAriaLabelledBy = function (sId) {
			this._getNumericInput().addAriaLabelledBy(sId);
			return Control.prototype.addAssociation.call(this, "ariaLabelledBy", sId);
		};

		StepInput.prototype.removeAriaLabelledBy = function (sId) {
			this._getNumericInput().removeAriaLabelledBy(sId);
			return Control.prototype.removeAssociation.call(this, "ariaLabelledBy", sId);
		};

		StepInput.prototype.removeAllAriaLabelledBy = function () {
			this._getNumericInput().removeAllAriaLabelledBy();
			return Control.prototype.removeAllAssociation.call(this, "ariaLabelledBy");
		};

		StepInput.prototype.addAriaDescribedBy = function (sId) {
			this._getNumericInput().addAriaDescribedBy(sId);
			return Control.prototype.addAssociation.call(this, "ariaDescribedBy", sId);
		};

		StepInput.prototype.removeAriaDescribedBy = function (sId) {
			this._getNumericInput().removeAriaDescribedBy(sId);
			return Control.prototype.removeAssociation.call(this, "ariaDescribedBy", sId);
		};

		StepInput.prototype.removeAllAriaDescribedBy = function () {
			this._getNumericInput().removeAllAriaDescribedBy();
			return Control.prototype.removeAllAssociation.call(this, "ariaDescribedBy");
		};

		return StepInput;
	});
