/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/m/NumericContent',
	'sap/m/Text',
	'sap/f/cards/Data',
	'sap/ui/model/json/JSONModel',
	"sap/f/cards/NumericSideIndicator",
	"sap/base/Log",
	"sap/f/cards/NumericHeaderRenderer"
], function (
		Control,
		NumericContent,
		Text,
		Data,
		JSONModel,
		NumericSideIndicator,
		NumericHeaderRenderer
	) {
		"use strict";

	/**
	 * Constructor for a new <code>NumericHeader</code>.
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
	 * @alias sap.f.cards.NumericHeader
	 */
	var NumericHeader = Control.extend("sap.f.cards.NumericHeader", {
		metadata: {
			interfaces: ["sap.f.cards.IHeader"],
			properties: {
				title: {
					"type": "string" // TODO required
				},
				subtitle: {
					"type": "string"
				},
				unitOfMeasurement: {
					"type": "string"
				},
				details: {
					"type": "string"
				},
				number: { // TODO what if value is not a number, is the naming still ok?
					"type": "string"
				},
				unit: {
					"type": "string"
				},
				trend: {
					"type": "sap.m.DeviationIndicator"
				},
				state: {
					"type": "sap.m.ValueColor" // TODO ValueState
				}
			},
			aggregations: {

				sideIndicators: { type: "sap.f.cards.NumericSideIndicator", multiple: true }, // TODO limit to 2, or describe in doc

				_title: { type: "sap.m.Text", multiple: false, visibility: "hidden" },
				_subtitle: { type: "sap.m.Text", multiple: false, visibility: "hidden" },
				_unitOfMeasurement: { type: "sap.m.Text", multiple: false, visibility: "hidden" },
				_details: { type: "sap.m.Text", multiple: false, visibility: "hidden" },
				_mainIndicator: { type: "sap.m.NumericContent", multiple: false } // TODO required
			}
		}
	});

	NumericHeader.prototype.setTitle = function(sValue) {
		this.setProperty("title", sValue, true);
		this._getTitle().setText(sValue);
		return this;
	};

	NumericHeader.prototype.setSubtitle = function(sValue) {
		this.setProperty("subtitle", sValue, true);
		this._getSubtitle().setText(sValue);
		return this;
	};

	NumericHeader.prototype.setUnitOfMeasurement = function(sValue) {
		this.setProperty("unitOfMeasurement", sValue, true);
		this._getUnitOfMeasurement().setText(sValue);
		return this;
	};

	NumericHeader.prototype.setDetails = function(sValue) {
		this.setProperty("details", sValue, true);
		this._getDetails().setText(sValue);
		return this;
	};

	NumericHeader.prototype.setNumber = function(sValue) {
		this.setProperty("number", sValue, true);
		this._getMainIndicator().setValue(sValue);
		return this;
	};

	NumericHeader.prototype.setUnit = function(sValue) {
		this.setProperty("unit", sValue, true);
		this._getMainIndicator().setScale(sValue);
		return this;
	};

	NumericHeader.prototype.setTrend = function(sValue) {
		this.setProperty("trend", sValue, true);
		this._getMainIndicator().setIndicator(sValue);
		return this;
	};

	NumericHeader.prototype.setState = function(sValue) {
		this.setProperty("state", sValue, true);
		this._getMainIndicator().setValueColor(sValue); // TODO convert ValueState to ValueColor
		return this;
	};

	NumericHeader.prototype.addSideIndicator = function(oValue) {
		this.addAggregation("sideIndicators", oValue);
		return this;
	};

	NumericHeader.prototype._getTitle = function () {
		var oControl = this.getAggregation("_title");

		if (!oControl) {
			oControl = new Text({
				id: this.getId() + "-title",
				wrapping: true,
				maxLines: 3
			});
			this.setAggregation("_title", oControl);
		}

		return oControl;
	};

	NumericHeader.prototype._getSubtitle = function () {
		var oControl = this.getAggregation("_subtitle");

		if (!oControl) {
			oControl = new Text({
				id: this.getId() + "-subtitle",
				wrapping: true,
				maxLines: 2
			});
			this.setAggregation("_subtitle", oControl);
		}

		return oControl;
	};

	NumericHeader.prototype._getUnitOfMeasurement = function () {
		var oControl = this.getAggregation("_unitOfMeasurement");

		if (!oControl) {
			oControl = new Text({
				id: this.getId() + "-unitOfMeasurement",
				wrapping: false
			});
			this.setAggregation("_unitOfMeasurement", oControl);
		}

		return oControl;
	};

	NumericHeader.prototype._getDetails = function () {
		var oControl = this.getAggregation("_details");

		if (!oControl) {
			oControl = new Text({
				id: this.getId() + "-details",
				wrapping: false
			});
			this.setAggregation("_details", oControl);
		}

		return oControl;
	};

	NumericHeader.prototype._getMainIndicator = function () {
		var oControl = this.getAggregation("_mainIndicator");

		if (!oControl) {
			oControl = new NumericContent({
				id: this.getId() + "-mainIndicator",
				withMargin: false,
				animateTextChange: false,
				truncateValueTo: 5
			});
			this.setAggregation("_mainIndicator", oControl);
		}

		return oControl;
	};

	/**
	 * Creates an instance of NumericHeader with the given options
	 *
	 * @private
	 * @static
	 * @param {map} mConfiguration A map containing the header configuration options.
	 * @return {sap.f.cards.NumericHeader} The created NumericHeader
	 */
	NumericHeader.create = function(mConfiguration) {
		var mSettings = {
			title: mConfiguration.title,
			subtitle: mConfiguration.subtitle,
			unitOfMeasurement: mConfiguration.unitOfMeasurement,
			details: mConfiguration.details
		};

		if (mConfiguration.mainIndicator) {
			mSettings.number = mConfiguration.mainIndicator.number;
			mSettings.unit = mConfiguration.mainIndicator.unit;
			mSettings.trend = mConfiguration.mainIndicator.trend;
			mSettings.state = mConfiguration.mainIndicator.state; // TODO convert ValueState to ValueColor
		}

		if (mConfiguration.sideIndicators) {
			mSettings.sideIndicators = mConfiguration.sideIndicators.map(function (mIndicator) { // TODO validate that it is an array and with no more than 2 elements
				return new NumericSideIndicator(mIndicator);
			});
		}

		var oHeader = new NumericHeader(mSettings);

		if (mConfiguration.data) {
			this._handleData(oHeader, mConfiguration.data);
		}

		return oHeader;
	};

	/**
	 * Creates an instance of NumericHeader with the given options
	 *
	 * @private
	 * @static
	 * @param {sap.f.cards.NumericHeader} oHeader The header for which the data is
	 * @param {object} oData Data configuration
	 */
	NumericHeader._handleData = function (oHeader, oData) {
		var oModel = new JSONModel();

		var oRequest = oData.request;
		if (oData.json && !oRequest) {
			oModel.setData(oData.json);
		}

		if (oRequest) {
			Data.fetch(oRequest).then(function (data) {
				oModel.setData(data);
				oModel.refresh();

				// oHeader.rerender(); // TODO sometimes is needed, sometimes not?!?!
				// Also check warning "Couldn't rerender '__header1', as its DOM location couldn't be determined - "

			}).catch(function (oError) {
				// TODO: Handle errors. Maybe add error message
			});
		}

		oHeader.setModel(oModel)
			.bindElement({
				path: oData.path || "/"
			});

		// TODO Check if model is destroyed when header is destroyed
	};

	return NumericHeader;
});
