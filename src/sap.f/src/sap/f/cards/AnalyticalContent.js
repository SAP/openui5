/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Control', 'sap/ui/model/json/JSONModel', 'sap/m/FlexBox', 'sap/viz/ui5/controls/VizFrame', 'sap/viz/ui5/controls/common/feeds/FeedItem',
		'sap/viz/ui5/data/FlattenedDataset', 'sap/viz/ui5/data/DimensionDefinition', 'sap/viz/ui5/data/MeasureDefinition',  'sap/f/cards/Data', "sap/base/Log"],
	function (Control, JSONModel, FlexBox, VizFrame, FeedItem, FlattenedDataset, DimensionDefinition, MeasureDefinition, Data, Log) {
		"use strict";

		/**
		 * Constructor for a new <code>AnalyticalContent</code>.
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
		 * @alias sap.f.cards.AnalyticalContent
		 */
		var AnalyticalContent = Control.extend("sap.f.cards.AnalyticalContent", {
			metadata: {
				properties: {
					chart: {
						type: "object"
					},
					configuration: { type: "object" }
				},
				aggregations: {
					_content: { multiple: false, visibility: "hidden" }
				}
			},
			renderer: function (oRm, oControl) {
				oRm.write("<div");
				oRm.writeElementData(oControl);
				oRm.write(">");
				oRm.renderControl(oControl.getAggregation("_content"));
				oRm.write("</div>");
			}
		});

		AnalyticalContent.prototype.init = function () {
			var oModel = new JSONModel();
			this.setModel(oModel);
		};

		AnalyticalContent.prototype.setConfiguration = function (oContent) {

			this.setProperty("configuration", oContent);

			if (!oContent) {
				return;
			}

			if (oContent.chart) {
				this._setChart(oContent.chart);
			}
		};

		AnalyticalContent.prototype.exit = function () {
			if (this._oChart) {
				this._oChart.destroy();
				this._oChart = null;
			}

			if (this.oFlattendedDataset) {
				this.oFlattendedDataset.destroy();
				this.oFlattendedDataset = null;
			}
		};
		AnalyticalContent.prototype._getVizPropertiesObject = function (oChartObject) {
				var oTitle = oChartObject.title,
					oLegend = oChartObject.legend,
					oPlotArea = oChartObject.plotArea;

			if (!oChartObject) {
				return this;
			}
			var oVizObject = {
				"title": {},
				"legend": {},
				"legendGroup": {
					"layout": {}
				},
				"window": {
					"start": "firstDataPoint",
					"end": "lastDataPoint"
				},
				"plotArea": {},
				"categoryAxis": {
					"title": {}
				},
				"valueAxis": {
					"title": {}
				}
			};
			if (oTitle) {
				oVizObject.title.text = oTitle.text;
				oVizObject.title.visible = oTitle.visible;
				oVizObject.title.alignment = oTitle.alignment;
			}
			if (oLegend) {
				oVizObject.legend.visible = oLegend.visible;
				oVizObject.legendGroup.layout.position = oLegend.position;
				oVizObject.legendGroup.layout.alignment = oLegend.alignment;
			}

			if (oPlotArea) {
				if (oPlotArea.dataLabel) {
					oVizObject.plotArea.dataLabel = oPlotArea.dataLabel;
				}
				if (oPlotArea.categoryAxis) {
					oVizObject.categoryAxis.title.visible = oPlotArea.categoryAxisText.visible;
				}
				if (oPlotArea.valueAxis) {
					oVizObject.valueAxis.title.visible = oPlotArea.valueAxisText.visible;
				}
			}
			return oVizObject;

		};

		AnalyticalContent.prototype.setChart = function (oChartObject) {
			this.setProperty("chart", oChartObject, true);
			this._setChart(oChartObject);
			return this;
		};

		AnalyticalContent.prototype._setChart = function (oChartObject) {
			if (!oChartObject) {
				return;
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
		};

		AnalyticalContent.prototype._updateModel = function (oData, sPath, oChartObject) {
			var sChartType = oChartObject.chartType;

			if (!sChartType) {
				Log.error("ChartType is a mandatory property");
				return;
			}

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
				height: "100%",
				width: "100%",
				vizType: sChartType,
				dataset: this.oFlattendedDataset,
				legendVisible: oChartObject.legend,

				feeds: [
					new FeedItem({ uid: oChartObject.measureAxis, type: 'Measure', values: aMeasureNames }),
					new FeedItem({ uid: oChartObject.dimensionAxis, type: 'Dimension', values: aDimensionNames })
				]
			});
			var oVizProperties = this._getVizPropertiesObject(oChartObject);
			this._oChart.setVizProperties(oVizProperties);
			this.setAggregation("_content", this._oChart);
		};

		return AnalyticalContent;
	});
