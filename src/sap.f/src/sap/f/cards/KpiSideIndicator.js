/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/library',
	'sap/m/ObjectNumber',
	'sap/m/Text',
	"sap/f/cards/KpiSideIndicatorRenderer"
], function (
		Control,
		coreLibrary,
		ObjectNumber,
		Text
	) {
		"use strict";

		var TextAlign = coreLibrary.TextAlign;

		/**
		 * Constructor for a new <code>KpiSideIndicator</code>.
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
		 * @alias sap.f.cards.KpiSideIndicator
		 */
		var KpiSideIndicator = Control.extend("sap.f.cards.KpiSideIndicator", {
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
					_number: { type: "sap.m.ObjectNumber", multiple: false, visibility: "hidden" }
				}
			}
		});

		KpiSideIndicator.prototype.setTitle = function(sValue) {
			this.setProperty("title", sValue, true);
			this._getTitle().setText(sValue);
			return this;
		};

		KpiSideIndicator.prototype.setNumber = function(sValue) {
			this.setProperty("number", sValue, true);
			this._getNumber().setNumber(sValue);
			return this;
		};

		KpiSideIndicator.prototype.setUnit = function(sValue) {
			this.setProperty("unit", sValue, true);
			this._getNumber().setUnit(sValue);
			return this;
		};

		KpiSideIndicator.prototype._getTitle = function () {
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

		KpiSideIndicator.prototype._getNumber = function () {
			var oControl = this.getAggregation("_number");

			if (!oControl) {
				oControl = new ObjectNumber({
					id: this.getId() + "-number",
					textAlign: TextAlign.End,
					emphasized: false
				});
				this.setAggregation("_number", oControl);
			}

			return oControl;
		};

		return KpiSideIndicator;
	});