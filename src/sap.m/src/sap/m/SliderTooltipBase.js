/*!
* ${copyright}
*/

sap.ui.define(['sap/ui/core/Control', './library', './SliderTooltipBaseRenderer'],
function(Control, Library, SliderTooltipBaseRenderer) {
		"use strict";

		/**
		 * Constructor for a new SliderTooltipBase.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A Control that visualizes <code>Slider</code> and <code>RangeSlider</code> tooltips.
		 *
		 * @extends sap.ui.core.Control
		 * @abstract
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.56
		 * @alias sap.m.SliderTooltipBase
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var SliderTooltipBase = Control.extend("sap.m.SliderTooltipBase", /** @lends sap.m.SliderTooltipBase.prototype */ {
			metadata: {
				library: "sap.m"
			}
		});

		SliderTooltipBase.prototype.init = function () {
			this.fValue = 0;
		};

		/**
		 * Updates value of the tooltip.
		 *
		 * @param {float} fValue The new value
		 * @private
		 * @ui5-restricted sap.m.Slider
		 */
		SliderTooltipBase.prototype.setValue = function (fValue) {
			this.fValue = fValue;
			this.sliderValueChanged(fValue);
		};

		/**
		 * Gets the value of the tooltip.
		 *
		 * @returns {float} The current value of the tooltip.
		 * @protected
		 */
		SliderTooltipBase.prototype.getValue = function () {
			return this.fValue;
		};

		/**
		 * Called once the value of the Slider is changed by interaction.
		 *
		 * @param {float}[fValue] The new Slider value
		 * @protected
		 */
		SliderTooltipBase.prototype.sliderValueChanged = function (fValue) {};

		/**
		 * Formats the Slider value to the Tooltip's specific string.
		 *
		 * <b>Note:</b> It's important to set this formatter with the right output in
		 * order to receive proper accessibility response.
		 *
		 * @param {float} fValue The option array
		 * @returns {string|float} The formatted value
		 *
		 * @function
		 * @name sap.m.SliderTooltipBase.getLabel
		 */

		return SliderTooltipBase;
});