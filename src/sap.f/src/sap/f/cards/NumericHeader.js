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
		Log
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
				manifestContent: {
					"type": "object"
				},
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
				numberUnit: {
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

	NumericHeader.prototype.setManifestContent = function(oManifestContent) {
		this.setProperty("manifestContent", oManifestContent, true);
		this._bIsUsingManifestContent = true;
		this._initFromManifestContent(oManifestContent);
		return this;
	};

	NumericHeader.prototype.setTitle = function(sValue) {
		if (this._bIsUsingManifestContent) {
			Log.warning("Can not set title if there is a manifestContent.", "sap.f.cards.NumericHeader");
			return this;
		}

		this.setProperty("title", sValue, true);
		this._getTitle().setText(sValue);
		return this;
	};

	NumericHeader.prototype.setSubtitle = function(sValue) {
		if (this._bIsUsingManifestContent) {
			Log.warning("Can not set subtitle if there is a manifestContent.", "sap.f.cards.NumericHeader");
			return this;
		}

		this.setProperty("subtitle", sValue, true);
		this._getSubtitle().setText(sValue);
		return this;
	};

	NumericHeader.prototype.setUnitOfMeasurement = function(sValue) {
		if (this._bIsUsingManifestContent) {
			Log.warning("Can not set unitOfMeasurement if there is a manifestContent.", "sap.f.cards.NumericHeader");
			return this;
		}

		this.setProperty("unitOfMeasurement", sValue, true);
		this._getUnitOfMeasurement().setText(sValue);
		return this;
	};

	NumericHeader.prototype.setDetails = function(sValue) {
		if (this._bIsUsingManifestContent) {
			Log.warning("Can not set details if there is a manifestContent.", "sap.f.cards.NumericHeader");
			return this;
		}

		this.setProperty("details", sValue, true);
		this._getDetails().setText(sValue);
		return this;
	};

	NumericHeader.prototype.setNumber = function(sValue) {
		if (this._bIsUsingManifestContent) {
			Log.warning("Can not set number if there is a manifestContent.", "sap.f.cards.NumericHeader");
			return this;
		}

		this.setProperty("number", sValue, true);
		this._getMainIndicator().setValue(sValue);
		return this;
	};

	NumericHeader.prototype.setNumberUnit = function(sValue) {
		if (this._bIsUsingManifestContent) {
			Log.warning("Can not set numberUnit if there is a manifestContent.", "sap.f.cards.NumericHeader");
			return this;
		}

		this.setProperty("numberUnit", sValue, true);
		this._getMainIndicator().setScale(sValue);
		return this;
	};

	NumericHeader.prototype.setTrend = function(sValue) {
		if (this._bIsUsingManifestContent) {
			Log.warning("Can not set trend if there is a manifestContent.", "sap.f.cards.NumericHeader");
			return this;
		}

		this.setProperty("trend", sValue, true);
		this._getMainIndicator().setIndicator(sValue);
		return this;
	};

	NumericHeader.prototype.setState = function(sValue) {
		if (this._bIsUsingManifestContent) {
			Log.warning("Can not set state if there is a manifestContent.", "sap.f.cards.NumericHeader");
			return this;
		}

		this.setProperty("state", sValue, true);
		this._getMainIndicator().setValueColor(sValue); // TODO convert ValueState to ValueColor
		return this;
	};

	NumericHeader.prototype.addSideIndicator = function(oValue) {
		if (this._bIsUsingManifestContent) {
			Log.warning("Can not add side indicators if there is a manifestContent.", "sap.f.cards.NumericHeader");
			return this;
		}

		this.addAggregation("sideIndicators", oValue);
		return this;
	};

	// TODO there is too much copy-pasted code

	NumericHeader.prototype.applySettings = function (mSettings, oScope) {
		if (mSettings.manifestContent) {
			this.setManifestContent(mSettings.manifestContent);
			delete mSettings.manifestContent;
		}

		Control.prototype.applySettings.apply(this, [mSettings, oScope]);

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

	NumericHeader.prototype._initFromManifestContent = function (oManifestContent) {
		this._applyManifestContentSettings(oManifestContent);

		if (oManifestContent.data) {
			this._handleData(oManifestContent.data);
		}
	};

	NumericHeader.prototype._applyManifestContentSettings = function (oManifestContent) {
		if (oManifestContent.title) {
			this._getTitle().applySettings({
				text: oManifestContent.title
			});
		}
		if (oManifestContent.subtitle) {
			this._getSubtitle().applySettings({
				text: oManifestContent.subtitle
			});
		}
		if (oManifestContent.unitOfMeasurement) {
			this._getUnitOfMeasurement().applySettings({
				text: oManifestContent.unitOfMeasurement
			});
		}
		if (oManifestContent.details) {
			this._getDetails().applySettings({
				text: oManifestContent.details
			});
		}

		if (oManifestContent.mainIndicator.number) {
			this._getMainIndicator().applySettings({
				value: oManifestContent.mainIndicator.number,
				scale: oManifestContent.mainIndicator.unit,
				indicator: oManifestContent.mainIndicator.trend,
				valueColor: oManifestContent.mainIndicator.state // TODO convert ValueState to ValueColor
			});
		}

		if (oManifestContent.sideIndicators) { // TODO validate that it is an array and with no more than 2 elements
			this.destroySideIndicators();

			oManifestContent.sideIndicators.forEach(function (oIndicator) {
				// TODO Maybe we need a second private aggregation, so it does not conflict with sideIndicators
				this.addAggregation("sideIndicators", new NumericSideIndicator(oIndicator));
			}.bind(this));
		}
	};

	NumericHeader.prototype._handleData = function (oData) {
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

		this.setModel(oModel)
			.bindElement({
				path: oData.path || "/"
			});

		// TODO Check if model is destroyed when header is destroyed
	};

	return NumericHeader;
});
