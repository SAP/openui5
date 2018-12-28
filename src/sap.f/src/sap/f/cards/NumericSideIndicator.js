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
		 *
		 * <h3>Overview</h3>
		 *
		 *
		 * <h3>Usage</h3>
		 *
		 * <h3>Responsive Behavior</h3>
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @experimental
		 * @since 1.62
		 * @see {@link TODO Card}
		 * @alias sap.f.cards.NumericSideIndicator
		 */
		var NumericSideIndicator = Control.extend("sap.f.cards.NumericSideIndicator", {
			metadata: {
				properties: {
					title: {
						"type": "string"
					},
					number: {
						"type": "string"
					},
					unit: {
						"type": "string"
					}
				},
				aggregations: {
					_title: { type: "sap.m.Text", multiple: false, visibility: "hidden" },
					_number: { type: "sap.m.Text", multiple: false, visibility: "hidden" },
					_unit: { type: "sap.m.Text", multiple: false, visibility: "hidden" }
				}
			}
		});

		NumericSideIndicator.prototype.setTitle = function(sValue) {
			this.setProperty("title", sValue, true);
			this._getTitle().setText(sValue);
			return this;
		};

		NumericSideIndicator.prototype.setNumber = function(sValue) {
			this.setProperty("number", sValue, true);
			this._getNumber().setText(sValue);
			return this;
		};

		NumericSideIndicator.prototype.setUnit = function(sValue) {
			this.setProperty("unit", sValue, true);
			this._getUnit().setText(sValue);
			return this;
		};

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