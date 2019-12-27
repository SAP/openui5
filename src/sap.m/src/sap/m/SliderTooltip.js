/*!
* ${copyright}
*/

sap.ui.define([
	'./library',
	'./SliderUtilities',
	'./SliderTooltipBase',
	'sap/ui/core/Control',
	'sap/ui/core/library',
	'./delegate/ValueStateMessage',
	'./SliderTooltipRenderer'
],
function(
	Library,
	SliderUtilities,
	SliderTooltipBase,
	Control,
	coreLibrary,
	ValueStateMessage,
	SliderTooltipRenderer
) {
		"use strict";

		var ValueState = coreLibrary.ValueState;

		/**
		 * Constructor for a new SliderTooltip.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A Control that visualizes <code>Slider</code> and <code>RangeSlider</code> tooltips.
		 *
		 * @extends sap.m.SliderTooltipBase
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.54
		 * @alias sap.m.SliderTooltip
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var SliderTooltip = SliderTooltipBase.extend("sap.m.SliderTooltip", /** @lends sap.m.SliderTooltip.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * Defines the value of the control.
					 */
					value: { type: "float", group: "Data", defaultValue: 0, bindable: "bindable" },

					/**
					 * The minimum value.
					 */
					min: { type: "float", group: "Data", defaultValue: 0 },

					/**
					 * The maximum value.
					 */
					max: { type: "float", group: "Data", defaultValue: 100 },

					/**
					 * Defines whether the control can be modified by the user or not.
					 */
					editable: { type: "boolean", defaultValue: false },

					/**
					 * Defines the step of Tooltips's input.
					 */
					step: { type: "float", group: "Data", defaultValue: 1 },

					/**
					 * Visualizes the validation state of the control, e.g. <code>Error</code>, <code>Warning</code>, <code>Success</code>.
					 */
					valueState: { type: "sap.ui.core.ValueState", group: "Appearance", defaultValue: ValueState.None },

					/**
					 * Defines the width of the control.
					 */
					width: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null }
				},
				associations: {
					/**
					 * Association to controls / IDs that label this control (see WAI-ARIA attribute aria-labelledby).
					 */
					ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
				},
				events: {
					change: {
						parameters: {
							/**
							 * The new <code>value</code> of the <code>control</code>.
							 */
							value: { type: "float" }
						}
					}
				}
			}
		});

		SliderTooltip.prototype.init = function () {
			this._oValueStateMessage = new ValueStateMessage(this);

			this._fLastValidValue = 0;
		};

		SliderTooltip.prototype.onBeforeRendering = function () {
			SliderTooltipBase.prototype.setValue.call(this, this.getValue());
		};

		SliderTooltip.prototype.onAfterRendering = function () {
			if (this.getDomRef()) {
				this.getFocusDomRef().toggleClass(SliderUtilities.CONSTANTS.TOOLTIP_CLASS + "NotEditable", !this.getEditable());
			}
		};

		SliderTooltip.prototype.getValueStateText = function () {
			return "";
		};

		SliderTooltip.prototype.getFocusDomRef = function () {
			return this.$("input");
		};

		SliderTooltip.prototype.getDomRefForValueStateMessage = function () {
			return this.getDomRef();
		};

		/**
		 * Changes the value of tooltip depending on Slider's value.
		 *
		 * Default value is <code>0</code>.
		 *
		 * @param {float} fValue New value for property <code>value</code>.
		 * @public
		 */
		SliderTooltip.prototype.sliderValueChanged = function (fValue) {

			if (this.getDomRef()) {
				this.getFocusDomRef().val(fValue);
			}

			// remember last valid value of the input
			this._fLastValidValue = fValue;

			this.setValueState(ValueState.None);
		};

		/**
		 * Setter for property <code>valueState</code>.
		 *
		 * Default value is <code>None</code>.
		 *
		 * @param {sap.ui.core.ValueState} sValueState New value for property <code>valueState</code>.
		 * @return {sap.m.SliderTooltip} <code>this</code> to allow method chaining.
		 * @public
		 */
		SliderTooltip.prototype.setValueState = function (sValueState) {
			var bErrorState, bOpenValueStateMessage;
			// validate given value
			sValueState = this.validateProperty("valueState", sValueState);

			this.setProperty("valueState", sValueState, true);

			bErrorState = (sValueState === ValueState.Error);
			bOpenValueStateMessage = this.getDomRef() && bErrorState;

			this._oValueStateMessage[bOpenValueStateMessage ? "open" : "close"]();
			this.$().toggleClass(SliderUtilities.CONSTANTS.TOOLTIP_CLASS + "ErrorState", bErrorState);

			return this;
		};

		SliderTooltip.prototype.onfocusout = function (oEvent) {
			var fValue = parseFloat(this.getFocusDomRef().val());
			this._validateValue(fValue);
		};

		SliderTooltip.prototype.onsapenter = function (oEvent) {
			var fValue = parseFloat(this.getFocusDomRef().val());
			this._validateValue(fValue);
		};

		SliderTooltip.prototype.onsapescape = function (oEvent) {
			this.sliderValueChanged(this._fLastValidValue);
			this.setValueState(ValueState.None);
		};

		SliderTooltip.prototype._validateValue = function (fValue) {
			if (this._isValueValid(fValue)) {
				this.sliderValueChanged(fValue);
				this.fireChange({ value: fValue });
			} else {
				this.setValueState(ValueState.Error);
			}
		};

		SliderTooltip.prototype._isValueValid = function (fValue) {
			return !(isNaN(fValue) || fValue < this.getMin() || fValue > this.getMax());
		};

		return SliderTooltip;
});