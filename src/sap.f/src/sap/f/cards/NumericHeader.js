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
	"sap/f/cards/NumericHeaderRenderer"
], function (
		Control,
		NumericContent,
		Text,
		Data,
		JSONModel,
		NumericSideIndicator
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
				/**
				 * The title of the card
				 */
				title: { "type": "string", group: "Appearance" },

				/**
				 * The subtitle of the card
				 */
				subtitle: { "type": "string", group: "Appearance" },

				/**
				 * General unit of measurement for the header. Displayed as side information to the subtitle.
				 */
				unitOfMeasurement: { "type": "string", group : "Data" },

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
				unit: { "type": "string", group : "Data" },

				/**
				 * The direction of the trend arrow. Shows deviation for the value of the main number indicator.
				 */
				trend: { "type": "sap.m.DeviationIndicator", group: "Appearance", defaultValue : "None" },

				/**
				 * The semantic color which represents the state of the main number indicator
				 */
				state: { "type": "sap.m.ValueColor", group: "Appearance", defaultValue : "Neutral" },

				/**
				 * Additional text which adds more details to what is shown in the numeric header.
				 */
				details: { "type": "string", group: "Appearance" }
			},
			aggregations: {
				/**
				 * Additional side number indicators. For example "Deviation" and "Target". Not more than two side indicators should be used.
				 */
				sideIndicators: { type: "sap.f.cards.NumericSideIndicator", multiple: true }, // TODO limit to 2, or describe in doc

				/**
				 * Used to display title text
				 */
				_title: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Used to display subtitle text
				 */
				_subtitle: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Shows unit of measurement next to subtitle
				 */
				_unitOfMeasurement: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Display details
				 */
				_details: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Displays the main number indicator
				 */
				_mainIndicator: { type: "sap.m.NumericContent", multiple: false }
			},
			events: {
				press: {}
			}
		}
	});

	/**
	 * Sets the title
	 * @overwrite
	 * @public
	 * @param {string} sValue The text of the title
	 * @return {sap.f.cards.NumericHeader} this pointer for chaining
	 */
	NumericHeader.prototype.setTitle = function(sValue) {
		this.setProperty("title", sValue, true);
		this._getTitle().setText(sValue);
		return this;
	};

	/**
	 * Sets the subtitle
	 * @overwrite
	 * @public
	 * @param {string} sValue The text of the subtitle
	 * @return {sap.f.cards.NumericHeader} this pointer for chaining
	 */
	NumericHeader.prototype.setSubtitle = function(sValue) {
		this.setProperty("subtitle", sValue, true);
		this._getSubtitle().setText(sValue);
		return this;
	};

	/**
	 * Sets the general unit of measurement for the header. Displayed as side information to the subtitle.
	 * @overwrite
	 * @public
	 * @param {string} sValue The value of the unit of measurement
	 * @return {sap.f.cards.NumericHeader} this pointer for chaining
	 */
	NumericHeader.prototype.setUnitOfMeasurement = function(sValue) {
		this.setProperty("unitOfMeasurement", sValue, true);
		this._getUnitOfMeasurement().setText(sValue);
		return this;
	};

	/**
	 * Sets additional text which adds more details to what is shown in the numeric header
	 * @overwrite
	 * @public
	 * @param {string} sValue The text of the details
	 * @return {sap.f.cards.NumericHeader} this pointer for chaining
	 */
	NumericHeader.prototype.setDetails = function(sValue) {
		this.setProperty("details", sValue, true);
		this._getDetails().setText(sValue);
		return this;
	};

	/**
	 * Sets the value of the main number indicator
	 * @overwrite
	 * @public
	 * @param {string} sValue A string representation of the number
	 * @return {sap.f.cards.NumericHeader} this pointer for chaining
	 */
	NumericHeader.prototype.setNumber = function(sValue) {
		this.setProperty("number", sValue, true);
		this._getMainIndicator().setValue(sValue);
		return this;
	};

	/**
	 * Sets the unit of measurement (scaling prefix) for the main indicator.
	 * @overwrite
	 * @public
	 * @param {string} sValue The text of the title
	 * @return {sap.f.cards.NumericHeader} this pointer for chaining
	 */
	NumericHeader.prototype.setUnit = function(sValue) {
		this.setProperty("unit", sValue, true);
		this._getMainIndicator().setScale(sValue);
		return this;
	};

	/**
	 * Sets the direction of the trend arrow.
	 * @overwrite
	 * @public
	 * @param {sap.m.DeviationIndicator} sValue The direction of the trend arrow
	 * @return {sap.f.cards.NumericHeader} this pointer for chaining
	 */
	NumericHeader.prototype.setTrend = function(sValue) {
		this.setProperty("trend", sValue, true);
		this._getMainIndicator().setIndicator(sValue);
		return this;
	};

	/**
	 * Sets the semantic color which represents the state of the main number indicator
	 * @overwrite
	 * @public
	 * @param {sap.m.ValueColor} sValue The semantic color which represents the state
	 * @return {sap.f.cards.NumericHeader} this pointer for chaining
	 */
	NumericHeader.prototype.setState = function(sValue) {
		this.setProperty("state", sValue, true);
		this._getMainIndicator().setValueColor(sValue); // TODO convert ValueState to ValueColor
		return this;
	};

	/**
	 * @private
	 * @return {sap.m.Text} The title aggregation
	 */
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

	/**
	 * @private
	 * @return {sap.m.Text} The subtitle aggregation
	 */
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

	/**
	 * @private
	 * @return {sap.m.Text} The unit of measurement aggregation
	 */
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

	/**
	 * @private
	 * @return {sap.m.Text} The details aggregation
	 */
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

	/**
	 * @private
	 * @return {sap.m.NumericContent} The main indicator aggregation
	 */
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
