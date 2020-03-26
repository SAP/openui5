/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/ui/integration/library",
		"sap/ui/integration/cards/BaseContent",
		"sap/ui/integration/cards/BindingResolver",
		"sap/viz/ui5/controls/VizFrame",
		"sap/viz/ui5/controls/common/feeds/FeedItem",
		"sap/viz/ui5/data/FlattenedDataset",
		"sap/base/Log",
		"sap/ui/core/Core",
		"jquery.sap.global"
	],
	function (library, BaseContent, BindingResolver, VizFrame, FeedItem, FlattenedDataset, Log, Core, jQuery) {
		"use strict";

		/**
		 * Enumeration with supported legend positions.
		 */
		var LegendPosition = {
			"Top": "top",
			"Bottom": "bottom",
			"Left": "left",
			"Right": "right"
		};

		/**
		 * Enumeration with supported legend alignments.
		 */
		var LegendAlignment = {
			"TopLeft": "topLeft",
			"Center": "center"
		};

		/**
		 * Enumeration with supported title alignments.
		 */
		var TitleAlignment = {
			"Left": "left",
			"Center": "center",
			"Right": "right"
		};

		/**
		 * Enumeration with supported chart types.
		 */
		var ChartTypes = {
			"Line": "line",
			"StackedColumn": "stacked_column",
			"StackedBar": "stacked_bar",
			"Donut": "donut"
		};

		var AreaType = library.AreaType;

		/**
		 * Constructor for a new <code>AnalyticalContent</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A control that is a wrapper around sap.viz library and allows the creation of analytical
		 * controls (like charts) based on object configuration.
		 *
		 * @extends sap.ui.integration.cards.BaseContent
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.62
		 * @alias sap.ui.integration.cards.AnalyticalContent
		 */
		var AnalyticalContent = BaseContent.extend("sap.ui.integration.cards.AnalyticalContent", {
			renderer: {}
		});

		/**
		 * Creates vizFrame readable vizProperties object.
		 *
		 * @private
		 * @param {Object} oChartObject Chart information
		 * @returns {Object} oVizPropertiesObject vizFrame vizProperties object
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
					"style": {
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
				},
				"interaction": {
					"noninteractiveMode": true
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

		/**
		 * Updates model when data is received and set chart as content.
		 *
		 * @private
		 */
		AnalyticalContent.prototype._updateModel = function () {
			BaseContent.prototype._updateModel.apply(this, arguments);
			this._createChart();
		};

		/**
		 * Creates a chart depending on the configuration from the manifest.
		 *
		 * @private
		 */
		AnalyticalContent.prototype._createChart = function () {
			var oChartObject = this.getConfiguration();

			if (!oChartObject.chartType) {
				Log.error("ChartType is a mandatory property");
				return;
			}

			var oResolvedChartObject = BindingResolver.resolveValue(oChartObject, this.getModel(), "/");

			var aDimensionNames = [];
			if (oChartObject.dimensions) {
				var aDimensions = [];
				for (var i = 0; i < oChartObject.dimensions.length; i++) {
					var oDimension = oChartObject.dimensions[i];
					var sName = oResolvedChartObject.dimensions[i].label;
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
					var sName = oResolvedChartObject.measures[i].label;
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
					path: this.getBindingContext().getPath()
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
					new FeedItem({
						uid: oChartObject.measureAxis,
						type: 'Measure',
						values: aMeasureNames
					}),
					new FeedItem({
						uid: oChartObject.dimensionAxis,
						type: 'Dimension',
						values: aDimensionNames
					})
				]
			});

			var oVizProperties = this._getVizPropertiesObject(oResolvedChartObject);
			oChart.setVizProperties(oVizProperties);

			this._oActions.setAreaType(AreaType.Content);
			this._oActions.attach(oChartObject, this);

			this.setAggregation("_content", oChart);
		};

		AnalyticalContent.prototype.onBeforeRendering = function () {
			if (this._handleHostConfiguration) {
				//implementation is added with sap.ui.integration.host.HostConfiguration
				this._handleHostConfiguration();
			}
		};

		//add host configuration handler for analytical content
		AnalyticalContent.prototype._handleHostConfiguration = function () {
			var oParent = this.getParent(),
				oContent = this.getAggregation("_content");
			if (oParent && oParent.getHostConfigurationId && oContent) {
				var oHostConfiguration = Core.byId(oParent.getHostConfigurationId());
				if (oHostConfiguration) {
					var oSettings = oHostConfiguration.generateJSONSettings("vizProperties"),
						oVizProperties = oContent.getVizProperties();
					oVizProperties = jQuery.extend(true, oVizProperties, oSettings);
					oContent.setVizProperties(oVizProperties);
				}
			}
		};

		return AnalyticalContent;
	});
