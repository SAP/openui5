/*!
 * ${copyright}
 */
sap.ui.define([
	"./AnalyticalContentRenderer",
	"./BaseContent",
	"sap/ui/integration/library",
	"sap/ui/integration/util/BindingResolver",
	"sap/base/Log",
	"sap/ui/core/Core"
], function (AnalyticalContentRenderer, BaseContent, library, BindingResolver, Log, Core) {
	"use strict";

	var ActionArea = library.CardActionArea;

	// lazy dependencies, loaded on the first attempt to create AnalyticalContent
	var VizFrame, FeedItem, FlattenedDataset, Popover;

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

	/**
	 * Enumeration for actionable parts of the analytical content
	 */
	var ActionableArea = {
		"Chart": "Chart",
		"Full": "Full"
	};

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
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: AnalyticalContentRenderer
	});

	AnalyticalContent.prototype.exit = function () {
		BaseContent.prototype.exit.apply(this, arguments);

		if (this._oPopover) {
			this._oPopover.destroy();
		}
	};

	/**
	 * @override
	 */
	AnalyticalContent.prototype.loadDependencies = function (oCardManifest) {
		return new Promise(function (resolve, reject) {
			Core.loadLibrary("sap.viz", { async: true })
				.then(function () {
					sap.ui.require([
						"sap/viz/ui5/controls/VizFrame",
						"sap/viz/ui5/controls/common/feeds/FeedItem",
						"sap/viz/ui5/controls/Popover",
						"sap/viz/ui5/data/FlattenedDataset"
					], function (_VizFrame, _FeedItem, _Popover, _FlattenedDataset) {
						VizFrame = _VizFrame;
						FeedItem = _FeedItem;
						Popover = _Popover;
						FlattenedDataset = _FlattenedDataset;
						resolve();
					}, function (sErr) {
						reject(sErr);
					});
				})
				.catch(function () {
					reject("Analytical content type is not available with this distribution.");
				});
		});
	};

	/**
	 * Creates vizFrame readable vizProperties object.
	 *
	 * @private
	 * @param {object} oConfiguration Configuration from the manifest with resolved bindings
	 * @returns {object} vizProperties object
	 */
	AnalyticalContent.prototype._getVizPropertiesObject = function (oConfiguration) {
		if (!oConfiguration) {
			return null;
		}

		var oTitle = oConfiguration.title,
			oLegend = oConfiguration.legend,
			oPlotArea = oConfiguration.plotArea;

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
			"interaction": {}
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

		if (oConfiguration.actions || oConfiguration.popover) {
			var bChartsInteractive = oConfiguration.actionableArea === ActionableArea.Chart
									|| oConfiguration.popover && oConfiguration.popover.active;
			oVizPropertiesObject.interaction.noninteractiveMode = !bChartsInteractive;
		} else {
			oVizPropertiesObject.interaction.noninteractiveMode = true;
		}

		return oVizPropertiesObject;
	};

	/**
	 * Creates the chart when data in the model is changed.
	 *
	 * @private
	 */
	AnalyticalContent.prototype.onDataChanged = function () {
		this._createChart();
	};

	/**
	 * Creates a chart depending on the configuration from the manifest.
	 *
	 * @private
	 */
	AnalyticalContent.prototype._createChart = function () {
		var oChartObject = this.getConfiguration(),
			aMeasures,
			aDimensions;

		if (!oChartObject.chartType) {
			Log.error("ChartType is a mandatory property");
			return;
		}

		var oResolvedChartObject = BindingResolver.resolveValue(oChartObject, this, "/");

		var aDimensionNames = [];
		if (oChartObject.dimensions) {
			aDimensions = [];
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
			aMeasures = [];
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
		this.setAggregation("_content", oChart);
		this._attachActions();

		if (oResolvedChartObject.popover && oResolvedChartObject.popover.active) {
			this._attachPopover();
		}
	};

	AnalyticalContent.prototype._attachActions = function () {
		var oConfiguration = this.getConfiguration();
		var oActionConfig = {
			area: ActionArea.Content,
			actions: oConfiguration.actions,
			control: this
		};

		if (oConfiguration.actionableArea === ActionableArea.Chart) {
			oActionConfig.eventName = "selectData";
			oActionConfig.actionControl = this.getAggregation("_content");

			this._oActions.setBindingPathResolver(function (oEvent) {
				var iIndex = oEvent.getParameter("data")[0].data._context_row_number;
				return this.getBindingContext().getPath() + "/" + iIndex;
			}.bind(this));
		} else {
			oActionConfig.eventName = "press";
		}

		this._oActions.attach(oActionConfig);
	};

	AnalyticalContent.prototype._attachPopover = function () {
		if (this._oPopover) {
			this._oPopover.destroy();
		}

		this._oPopover = new Popover();
		this._oPopover.connect(this.getAggregation("_content").getVizUid());
	};

	return AnalyticalContent;
});
