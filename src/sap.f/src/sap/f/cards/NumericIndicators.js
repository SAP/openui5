/*!
 * ${copyright}
 */
sap.ui.define([
	"./NumericIndicatorsRenderer",
	"sap/ui/core/Control",
	"sap/m/NumericContent"
], function (
	NumericIndicatorsRenderer,
	Control,
	NumericContent
) {
	"use strict";

	/**
	 * Constructor for a new <code>NumericIndicators</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Displays general information in the header.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @experimental 1.98
	 * @since 1.98
	 * @alias sap.f.cards.NumericIndicators
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NumericIndicators = Control.extend("sap.f.cards.NumericIndicators", {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				 * The numeric value of the main number indicator.
				 * If the value contains more than five characters, only the first five are displayed. Without rounding the number.
				 */
				number: { "type": "string", group : "Data" },

				/**
				 * Defines the unit of measurement (scaling prefix) for the main indicator.
				 * Financial characters can be used for currencies and counters. The International System of Units (SI) prefixes can be used.
				 * If the unit contains more than three characters, only the first three characters are displayed.
				 */
				scale: { "type": "string", group : "Data" },

				/**
				 * The direction of the trend arrow. Shows deviation for the value of the main number indicator.
				 */
				trend: { "type": "sap.m.DeviationIndicator", group: "Appearance", defaultValue : "None" },

				/**
				 * The semantic color which represents the state of the main number indicator.
				 * Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 */
				state: { "type": "sap.m.ValueColor", group: "Appearance", defaultValue : "Neutral" },

				/**
				 * The alignment of the side indicators.
				 */
				sideIndicatorsAlignment: { "type": "sap.f.cards.NumericHeaderSideIndicatorsAlignment", group: "Appearance", defaultValue : "Begin" }
			},
			aggregations: {

				/**
				 * Additional side number indicators. For example "Deviation" and "Target". Not more than two side indicators should be used.
				 */
				sideIndicators: { type: "sap.f.cards.NumericSideIndicator", multiple: true },

				/**
				 * Displays the main number indicator
				 */
				_mainIndicator: { type: "sap.m.NumericContent", multiple: false, visibility: "hidden" }
			}
		},
		renderer: NumericIndicatorsRenderer
	});

	/**
	 * Sets the value of the main number indicator.
	 *
	 * @public
	 * @param {string} sValue A string representation of the number
	 * @return {this} <code>this</code> pointer for chaining
	 */
	NumericIndicators.prototype.setNumber = function(sValue) {
		this.setProperty("number", sValue);
		this._getMainIndicator().setValue(sValue);
		return this;
	};

	/**
	 * Sets the unit of measurement (scaling prefix) for the main indicator.
	 *
	 * @public
	 * @param {string} sValue The text of the title
	 * @return {this} <code>this</code> pointer for chaining
	 */
	NumericIndicators.prototype.setScale = function(sValue) {
		this.setProperty("scale", sValue, true);
		this._getMainIndicator().setScale(sValue);
		return this;
	};

	/**
	 * Sets the direction of the trend arrow.
	 *
	 * @public
	 * @param {sap.m.DeviationIndicator} sValue The direction of the trend arrow
	 * @return {this} <code>this</code> pointer for chaining
	 */
	NumericIndicators.prototype.setTrend = function(sValue) {
		this.setProperty("trend", sValue, true);
		this._getMainIndicator().setIndicator(sValue);
		return this;
	};

	/**
	 * Sets the semantic color which represents the state of the main number indicator.
	 *
	 * @public
	 * @param {sap.m.ValueColor} sValue The semantic color which represents the state
	 * @return {this} <code>this</code> pointer for chaining
	 */
	NumericIndicators.prototype.setState = function(sValue) {
		this.setProperty("state", sValue, true);
		this._getMainIndicator().setValueColor(sValue);
		return this;
	};

	/**
	 * Lazily create numeric content and return it.
	 *
	 * @private
	 * @return {sap.m.NumericIndicators} The main indicator aggregation
	 */
	NumericIndicators.prototype._getMainIndicator = function () {
		var oControl = this.getAggregation("_mainIndicator");

		if (!oControl) {
			oControl = new NumericContent({
				id: this.getId() + "-mainIndicator",
				withMargin: false,
				nullifyValue: false,
				animateTextChange: false,
				truncateValueTo: 100
			});
			this.setAggregation("_mainIndicator", oControl);
		}

		return oControl;
	};

	return NumericIndicators;
});
