/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Control', 'sap/ui/model/json/JSONModel', 'sap/m/FlexBox', 'sap/viz/ui5/controls/VizFrame', 'sap/viz/ui5/controls/common/feeds/FeedItem',
		'sap/viz/ui5/data/FlattenedDataset', 'sap/viz/ui5/data/DimensionDefinition', 'sap/viz/ui5/data/MeasureDefinition',  'sap/f/cards/Data'],
	function (Control, JSONModel, FlexBox, VizFrame, FeedItem, FlattenedDataset, DimensionDefinition, MeasureDefinition, Data) {
		"use strict";

		/**
		 * Constructor for a new <code>Analytical</code>.
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
		 * @alias sap.f.cards.content.Analytical
		 */
		var Analytical = Control.extend("sap.f.cards.content.Analytical", {
			metadata: {
				properties: {
					chart: {
						type: "object"
					}
				},
				aggregations: {
					_content: { multiple: false, visibility: "hidden" }
				}
			},
			renderer: function (oRm, oControl) {
				oRm.renderControl(oControl.getAggregation("_content"));
			}
		});

		Analytical.prototype.init = function () {

			var oModel = new JSONModel();
			this.setModel(oModel);

		};

		Analytical.prototype.exit = function () {
			if (this._oChart) {
				this._oChart.destroy();
				this._oChart = null;
			}

			if (this.oFlattendedDataset) {
				this.oFlattendedDataset.destroy();
				this.oFlattendedDataset = null;
			}


		};

		Analytical.prototype.setChart = function (oChartObject) {
			this.setProperty("chart", oChartObject, true);
			//interpret chart

			if (!oChartObject) {
				return this;
			}

			//handling the request
			var oRequest = oChartObject.data.request;

			if (oChartObject.json && !oRequest) {
				this._updateModel(oChartObject.json, oChartObject.path);
			}

			if (oRequest) {
				Data.fetch(oRequest).then(function (data) {
					this._updateModel(data, oChartObject.data.path, oChartObject);
				}.bind(this)).catch(function (oError) {
					// TODO: Handle errors. Maybe add error message
				});
			}


			return this;

		};

		Analytical.prototype._updateModel = function (oData, sPath, oChartObject) {
			var sChartType = oChartObject.type;

			this.getModel().setData(oData);
			var aDimensionNames = [];
			if (oChartObject.dimensions) {
				var aDimensions = [];
				for (var i = 0; i < oChartObject.dimensions.length; i++) {
					var oDimension = oChartObject.dimensions[i];
					var sName = oDimension.value.substring(1, oDimension.value.length - 1);
					aDimensionNames.push(sName);
					var oDimensionMap = {
						name: sName,
						value: oDimension.value
					};
					aDimensions.push(oDimensionMap);
				}

			}
			var aMeasureNames = [];
			if (oChartObject.measures) {
				var aMeasures = [];
				for (var i = 0; i < oChartObject.measures.length; i++) {
					var oMeasure = oChartObject.measures[i];
					var sName = oMeasure.value.substring(1, oMeasure.value.length - 1);
					aMeasureNames.push(sName);
					var oMeasureMap = {
						name: sName,
						value: oMeasure.value
					};
					aMeasures.push(oMeasureMap);
				}

			}
			this.oFlattendedDataset = new FlattenedDataset({
				measures: aMeasures,
				dimensions: aDimensions,
				data: {
					path: oChartObject.data.path
				}
			});
			this._oChart = new VizFrame({
				uiConfig: {
					applicationSet: 'fiori'
				},
				vizType: sChartType,
				dataset: this.oFlattendedDataset,
				legendVisible: oChartObject.legend,

				feeds: [
					new FeedItem({ uid: oChartObject.measureUid, type: 'Measure', values: aMeasureNames }),
					new FeedItem({ uid: oChartObject.dimensionUid, type: 'Dimension', values: aDimensionNames })
				]
			});

			this._oChart.setVizProperties(oChartObject.vizProperties);
			this.setAggregation("_content", this._oChart);
		};

		return Analytical;
	});
