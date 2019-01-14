/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Control', 'sap/ui/model/json/JSONModel', 'sap/m/FlexBox', 'sap/viz/ui5/controls/VizFrame', 'sap/viz/ui5/controls/common/feeds/FeedItem',
		'sap/viz/ui5/data/FlattenedDataset', 'sap/viz/ui5/data/DimensionDefinition', 'sap/viz/ui5/data/MeasureDefinition',  'sap/f/cards/Data', "sap/base/Log"],
	function (Control, JSONModel, FlexBox, VizFrame, FeedItem, FlattenedDataset, DimensionDefinition, MeasureDefinition, Data, Log) {
		"use strict";

		var LegendPosition = {
			"Top": "top",
			"Bottom": "bottom",
			"Left": "left",
			"Right": "right"
		};

		var LegendAlignment = {
			"TopLeft": "topLeft",
			"Center" : "center"
		};

		var TitleAlignment = {
			"Left": "left",
			"Center": "center",
			"Right": "right"
		};

		var ChartTypes = {
			"Line": "line",
			"StackedColumn": "stacked_column",
			"StackedBar": "stacked_bar",
			"Donut": "donut"
		};

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
					configuration: { type: "object" }
				},
				aggregations: {
					_content: { multiple: false, visibility: "hidden" }
				}
			},
			constructor: function (vId, mSettings) {
				if (typeof vId !== "string"){
					mSettings = vId;
				}

				if (mSettings.serviceManager) {
					this._oServiceManager = mSettings.serviceManager;
					delete mSettings.serviceManager;
				}

				Control.apply(this, arguments);
			},
			renderer: function (oRm, oControl) {
				oRm.write("<div");
				oRm.writeElementData(oControl);
				oRm.addClass("sapFCardContentAnalytical");
				oRm.writeClasses();
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

			this._setChart(oContent);
		};

		AnalyticalContent.prototype.exit = function () {};

		/**
		 * Creates vizFrame readable vizProperties object.
		 * @param {Object} oChartObject Chart information
		 * @returns {Object} oVizPropertiesObject vizFrame vizProperties object
		 * @since 1.61
		 * @private
		 */
		AnalyticalContent.prototype._getVizPropertiesObject = function (oChartObject) {
				var oTitle = oChartObject.title,
					oLegend = oChartObject.legend,
					oPlotArea = oChartObject.plotArea;

			if (!oChartObject) {
				return this;
			}
			var oVizPropertiesObject = {
				"title": {
					"style" : {
						"fontWeight": "normal"
					},
					"layout": {
						"respectPlotPosition": false
					}
				},
				"legend": {},
				"legendGroup": {
					"layout": {}
				},
				"plotArea": {
					"window": {
						"start": "firstDataPoint",
						"end": "lastDataPoint"
					}
				},
			"categoryAxis": {
					"title": {}
				},
				"valueAxis": {
					"title": {}
				}
			};
			if (oTitle) {
				oVizPropertiesObject.title.text = oTitle.text;
				oVizPropertiesObject.title.visible = oTitle.visible;
				oVizPropertiesObject.title.alignment = TitleAlignment[oTitle.alignment];
			}
			if (oLegend) {
				oVizPropertiesObject.legend.visible = oLegend.visible;
				oVizPropertiesObject.legendGroup.layout.position = LegendPosition[oLegend.position];
				oVizPropertiesObject.legendGroup.layout.alignment = LegendAlignment[oLegend.alignment];
			}

			if (oPlotArea) {
				if (oPlotArea.dataLabel) {
					oVizPropertiesObject.plotArea.dataLabel = oPlotArea.dataLabel;
				}
				if (oPlotArea.categoryAxisText) {
					oVizPropertiesObject.categoryAxis.title.visible = oPlotArea.categoryAxisText.visible;
				}
				if (oPlotArea.valueAxisText) {
					oVizPropertiesObject.valueAxis.title.visible = oPlotArea.valueAxisText.visible;
				}
			}
			return oVizPropertiesObject;

		};

		AnalyticalContent.prototype._setChart = function (oChartObject) {
			if (!oChartObject) {
				return;
			}

			//handling the request
			if (oChartObject.data) {
				var oRequest = oChartObject.data.request;
			}

			if (oChartObject.data.json && !oRequest) {
				this._updateModel(oChartObject.data.json, oChartObject.data.path, oChartObject);
			}

			if (oRequest) {
				Data.fetch(oRequest).then(function (data) {
					this._updateModel(data, oChartObject.data.path, oChartObject);
				}.bind(this)).catch(function (oError) {
					// TODO: Handle errors. Maybe add error message
				});
			}
		};

		/**
		 * Updates model when data is received.
		 * @param {Object} oData Data to be set on the model
		 * @param {Object} sPath Binding path
		 * @param {Object} oChartObject Chart information
		 * @since 1.61
		 * @private
		 */
		AnalyticalContent.prototype._updateModel = function (oData, sPath, oChartObject) {
			var sChartType = oChartObject.chartType;

			if (!sChartType) {
				Log.error("ChartType is a mandatory property");
				return;
			}

			this.getModel().setData(oData);

			var oChart = this._createChart(oChartObject, sPath);
			this.setAggregation("_content", oChart);
		};

		/**
		 * Creates a chart depending one the configuration form the manifest.
		 * @param {Object} sPath Binding path
		 * @param {Object} oChartObject Chart information
		 * @returns {object} oChart configured chart
		 * @since 1.61
		 * @private
		 */
		AnalyticalContent.prototype._createChart = function (oChartObject, sPath) {
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
			 var oFlattendedDataset = new FlattenedDataset({
				measures: aMeasures,
				dimensions: aDimensions,
				data: {
					path: sPath || "/"
				}
			});
			var oChart = new VizFrame({
				uiConfig: {
					applicationSet: 'fiori'
				},
				height: "100%",
				width: "100%",
				vizType: ChartTypes[oChartObject.chartType],
				dataset: oFlattendedDataset,
				legendVisible: oChartObject.legend,
				feeds: [
					new FeedItem({ uid: oChartObject.measureAxis, type: 'Measure', values: aMeasureNames }),
					new FeedItem({ uid: oChartObject.dimensionAxis, type: 'Dimension', values: aDimensionNames })
				]
			});
			var oVizProperties = this._getVizPropertiesObject(oChartObject);
			oChart.setVizProperties(oVizProperties);

			return oChart;
		};

		return AnalyticalContent;
	});
