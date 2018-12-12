/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/library',
	'sap/ui/model/json/JSONModel',
	'sap/m/NumericContent',
	'sap/m/ObjectNumber',
	'sap/m/VBox',
	'sap/m/Text',
	'sap/m/Label',
	'sap/f/cards/Data',
	"sap/f/cards/KpiHeaderRenderer"
], function (
		Control,
		coreLibrary,
		JSONModel,
		NumericContent,
		ObjectNumber,
		VBox,
		Text,
		Label,
		Data
	) {
		"use strict";

		var TextAlign = coreLibrary.TextAlign;

	/**
	 * Constructor for a new <code>Kpi</code>.
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
	 * @since 1.60
	 * @see {@link TODO Card}
	 * @alias sap.f.cards.KpiHeader
	 */
		var KpiHeader = Control.extend("sap.f.cards.KpiHeader", {
			metadata: {
				interfaces: ["sap.f.cards.IHeader"],
				properties: {
					data: {
						"type": "object"
					},
					title: {
						"type": "string"
					},
					subtitle: {
						"type": "string"
					},
					unitOfMeasurement: {
						"type": "string"
					},
					mainIndicator: {
						"type": "object"
                    },
                    sideIndicators: {
                        "type": "array"
                    },
                    details: {
						"type": "string"
					}
				},
				aggregations: {
					_title: { type: "sap.m.Text", multiple: false, visibility: "hidden" },
					_subtitle: { type: "sap.m.Text", multiple: false, visibility: "hidden" },
					_unitOfMeasurement: { type: "sap.m.Text", multiple: false, visibility: "hidden" },
					_mainIndicator: { type: "sap.m.NumericContent", multiple: false, visibility: "hidden" },
					_sideIndicators: { type: "sap.m.VBox", multiple: true, visibility: "hidden" },
					_details: { type: "sap.m.Text", multiple: false, visibility: "hidden" }
				}
			}
		});

		KpiHeader.prototype.init = function () {
			this.setModel(new JSONModel());
		};

		KpiHeader.prototype._createContent = function (oMapping) {
			// TODO reuse title and subtitle if possible
			// TODO create aggregation only if it does not exist already.

			if (oMapping.title) { // TODO required?
				this.setAggregation("_title", new Text({
					id: this.getId() + "-title",
					wrapping: true,
					maxLines: 3,
					text: oMapping.title
				}));
			}

			if (oMapping.subtitle) {
				this.setAggregation("_subtitle", new Text({
					id: this.getId() + "-subtitle",
					wrapping: true,
					maxLines: 2,  // todo the other subtitle is max lines 3, check if this should be different?
					text: oMapping.subtitle
				}));
			}

			if (oMapping.unitOfMeasurement) {
				this.setAggregation("_unitOfMeasurement", new Text({
					id: this.getId() + "-unitOfMeasurement",
					wrapping: false,
					text: oMapping.unitOfMeasurement
				}));
			}

			if (oMapping.mainIndicator) { // TODO required
				this.setAggregation("_mainIndicator", new NumericContent({
					id: this.getId() + "-mainIndicator",
					withMargin: false,
					animateTextChange: false,
					truncateValueTo: 5,
					// TODO
					// icon
					// truncateValueTo
					value: oMapping.mainIndicator.number,
					scale: oMapping.mainIndicator.unit,
					indicator: oMapping.mainIndicator.trend,
					valueColor: oMapping.mainIndicator.state // TODO convert ValueState to ValueColor
				}));
			}

			if (oMapping.sideIndicators) {
				// TODO validate that it is an array and with no more than 2 elements
				oMapping.sideIndicators.forEach(function (oIndicator, iIndex) {
					this.addAggregation("_sideIndicators", new VBox({
						id: this.getId() + "-sideIndicator" + iIndex,
						items: [
							new Text({
								id: this.getId() + "-sideIndicator" + iIndex + "-title",
								wrapping: false,
								text: oIndicator.title // TODO translations
							}),
							new ObjectNumber({
								id: this.getId() + "-sideIndicator" + iIndex + "-value",
								textAlign: TextAlign.End,
								emphasized: false,
								number: oIndicator.number,
								unit: oIndicator.unit
							})
							//new Text({textAlign: TextAlign.End, wrapping: false})
						]
					}));
				}.bind(this));
			}

			if (oMapping.details) {
				this.setAggregation("_details", new Text({
					id: this.getId() + "-details",
					wrapping: false,
					text: oMapping.details
				}));
			}
		};

		KpiHeader.prototype.applySettings = function (mSettings, oScope) {
			var oData = mSettings.data;

			if (oData) {
				this.setData(oData);
				delete mSettings.data;
			}

			Control.prototype.applySettings.apply(this, [mSettings, oScope]);

            mSettings.data = oData;

			this._createContent(mSettings);

			return this;
		};

		KpiHeader.prototype.setData = function (oData) {

			this.setProperty("data", oData);

			if (!oData) {
				return this;
			}

			//handling the request
			var oRequest = oData.request;

			if (oData.json && !oRequest) {
				this._updateModel(oData.json, oData.path);
			}

			if (oRequest) {
				Data.fetch(oRequest).then(function (data) {
					this._updateModel(data, oData.path);
				}.bind(this)).catch(function (oError) {
					// TODO: Handle errors. Maybe add error message
				});
			}

			return this;
		};

		KpiHeader.prototype._updateModel = function (oData, sPath) {
			this.getModel().setData(oData);

			this.bindElement({
				path: sPath || "/"
			});
		};

		return KpiHeader;
	});