/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/m/Text',
	"sap/f/cards/NumericSideIndicatorRenderer"
], function (
		Control,
		Text
	) {
		"use strict";

		/**
		 * Constructor for a new <code>NumericSideIndicator</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Holds a set of side indicator attributes used in the {@link sap.f.cards.NumericHeader} control.
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.64
		 * @alias sap.f.cards.NumericSideIndicator
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var NumericSideIndicator = Control.extend("sap.f.cards.NumericSideIndicator", {
			metadata: {
				library: "sap.f",
				properties: {

					/**
					 * The title of the indicator
					 */
					title: { "type": "string", group: "Appearance" },

					/**
					 * The numeric value
					 */
					number: { "type": "string", group : "Data" },

					/**
					 * Defines the unit of measurement (scaling prefix) for the numeric value
					 */
					unit: { "type": "string", group : "Data" }
				},
				aggregations: {

					/**
					 * Used to display title
					 */
					_title: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

					/**
					 * Used to display the number part of the indicator
					 */
					_number: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

					/**
					 * Used to display the unit of measurement for the number
					 */
					_unit: { type: "sap.m.Text", multiple: false, visibility: "hidden" }
				}
			}
		});

		/**
		 * Sets the title.
		 *
		 * @public
		 * @param {string} sValue The text of the title
		 * @return {sap.f.cards.NumericSideIndicator} this pointer for chaining
		 */
		NumericSideIndicator.prototype.setTitle = function(sValue) {
			this.setProperty("title", sValue, true);
			this._getTitle().setText(sValue);
			return this;
		};

		/**
		 * Sets the numeric value.
		 *
		 * @public
		 * @param {string} sValue The text of the title
		 * @return {sap.f.cards.NumericSideIndicator} this pointer for chaining
		 */
		NumericSideIndicator.prototype.setNumber = function(sValue) {
			this.setProperty("number", sValue, true);
			this._getNumber().setText(sValue);
			return this;
		};

		/**
		 * Sets the unit of measurement.
		 *
		 * @public
		 * @param {string} sValue The text of the title
		 * @return {sap.f.cards.NumericSideIndicator} this pointer for chaining
		 */
		NumericSideIndicator.prototype.setUnit = function(sValue) {
			this.setProperty("unit", sValue, true);
			this._getUnit().setText(sValue);
			return this;
		};

		/**
		 * Lazily create a title and return it.
		 *
		 * @private
		 * @return {sap.m.Text} The title aggregation
		 */
		NumericSideIndicator.prototype._getTitle = function () {
			var oControl = this.getAggregation("_title");

			if (!oControl) {
				oControl = new Text({
					id: this.getId() + "-title",
					wrapping: false
				});
				this.setAggregation("_title", oControl);
			}

			return oControl;
		};

		/**
		 * Lazily create a number and return it.
		 *
		 * @private
		 * @return {sap.m.Text} The number aggregation
		 */
		NumericSideIndicator.prototype._getNumber = function () {
			var oControl = this.getAggregation("_number");

			if (!oControl) {
				oControl = new Text({
					id: this.getId() + "-number"
				});
				this.setAggregation("_number", oControl);
			}

			return oControl;
		};

		/**
		 * Lazily create a unit and return it.
		 *
		 * @private
		 * @return {sap.m.Text} The unit of measurement aggregation
		 */
		NumericSideIndicator.prototype._getUnit = function () {
			var oControl = this.getAggregation("_unit");

			if (!oControl) {
				oControl = new Text({
					id: this.getId() + "-unit"
				});
				this.setAggregation("_unit", oControl);
			}

			return oControl;
		};

		return NumericSideIndicator;
	});