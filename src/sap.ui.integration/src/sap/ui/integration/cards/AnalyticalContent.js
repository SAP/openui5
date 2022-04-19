/*!
 * ${copyright}
 */
sap.ui.define([
	"./AnalyticalContentRenderer",
	"./BaseContent",
	"sap/ui/integration/library",
	"sap/ui/integration/util/BindingResolver",
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/ui/core/Core"
], function (
	AnalyticalContentRenderer,
	BaseContent,
	library,
	BindingResolver,
	Log,
	merge,
	Core
) {
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
	 * Needed for backward compatibility.
	 */
	var LegendAlignment = {
		"TopLeft": "topLeft",
		"Center": "center"
	};

	/**
	 * Enumeration with supported title alignments.
	 * Needed for backward compatibility.
	 */
	var TitleAlignment = {
		"Left": "left",
		"Center": "center",
		"Right": "right"
	};

	/**
	 * Chart type to vizType.
	 * Needed for backward compatibility.
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
	 * Creates the chart when data in the model is changed.
	 *
	 * @private
	 */
	AnalyticalContent.prototype.onDataChanged = function () {
		this._createChart();
		var oChart = this.getAggregation("_content");
		if (oChart) {
			var vizDS = oChart._getVizDataset(),
				noData = vizDS
					&& vizDS._FlatTableD
					&& vizDS._FlatTableD._data
					&& Array.isArray(vizDS._FlatTableD._data)
					&& (!vizDS._FlatTableD._data.length);
			if (noData) {
				this.getParent()._handleError("No data available", true);
			}
		}
	};

	/**
	 * Creates a chart depending on the configuration from the manifest.
	 *
	 * @private
	 */
	AnalyticalContent.prototype._createChart = function () {
		var oConfiguration = this.getParsedConfiguration();

		if (!oConfiguration.chartType) {
			Log.error("\"sap.card\".content.chartType is mandatory property.", null, "sap.ui.integration.widgets.Card");
			return;
		}

		var oResolvedConfiguration = BindingResolver.resolveValue(oConfiguration, this, "/");
		var oChart = new VizFrame({
			uiConfig: {
				applicationSet: "fiori"
			},
			height: "100%",
			width: "100%",
			vizType: ChartTypes[oResolvedConfiguration.chartType] || oResolvedConfiguration.chartType,
			vizProperties: this._getVizProperties(oResolvedConfiguration),
			dataset: this._getDataset(oConfiguration, oResolvedConfiguration),
			feeds: this._getFeeds(oResolvedConfiguration)
		});

		this.setAggregation("_content", oChart);
		this._attachActions(oConfiguration);

		if (oResolvedConfiguration.popover && oResolvedConfiguration.popover.active) {
			this._attachPopover();
		}
	};

	AnalyticalContent.prototype._attachActions = function (oConfiguration) {
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

	/**
	 * Creates vizFrame readable vizProperties object.
	 *
	 * @private
	 * @param {object} oResolvedConfiguration Manifest configuration with resolved bindings
	 * @returns {object} vizProperties object
	 */
	 AnalyticalContent.prototype._getVizProperties = function (oResolvedConfiguration) {
		if (!oResolvedConfiguration) {
			return null;
		}

		var oTitle = oResolvedConfiguration.title,
			oLegend = oResolvedConfiguration.legend,
			oPlotArea = oResolvedConfiguration.plotArea;

		var oVizProperties = {
			title: {
				style: {
					fontWeight: "normal"
				},
				layout: {
					respectPlotPosition: false
				}
			},
			legend: {},
			legendGroup: {
				layout: {}
			},
			plotArea: {
				window: {
					start: "firstDataPoint",
					end: "lastDataPoint"
				}
			},
			categoryAxis: {
				title: {}
			},
			valueAxis: {
				title: {}
			},
			interaction: {
				noninteractiveMode: true
			}
		};

		if (oResolvedConfiguration.actions || oResolvedConfiguration.popover) {
			var bChartsInteractive = oResolvedConfiguration.actionableArea === ActionableArea.Chart
									|| oResolvedConfiguration.popover && oResolvedConfiguration.popover.active;
			oVizProperties.interaction.noninteractiveMode = !bChartsInteractive;
		}

		if (oTitle) {
			oVizProperties.title.text = oTitle.text;
			oVizProperties.title.visible = oTitle.visible;
			oVizProperties.title.alignment = TitleAlignment[oTitle.alignment];
			Log.warning("\"sap.card\".content.title is deprecated. Use \"sap.card\".content.chartProperties instead", null, "sap.ui.integration.widgets.Card");
		}

		if (oLegend) {
			oVizProperties.legend.visible = oLegend.visible;
			oVizProperties.legendGroup.layout.position = LegendPosition[oLegend.position];
			oVizProperties.legendGroup.layout.alignment = LegendAlignment[oLegend.alignment];
			Log.warning("\"sap.card\".content.legend is deprecated. Use \"sap.card\".content.chartProperties instead", null, "sap.ui.integration.widgets.Card");
		}

		if (oPlotArea) {
			if (oPlotArea.dataLabel) {
				oVizProperties.plotArea.dataLabel = oPlotArea.dataLabel;
			}
			if (oPlotArea.categoryAxisText) {
				oVizProperties.categoryAxis.title.visible = oPlotArea.categoryAxisText.visible;
			}
			if (oPlotArea.valueAxisText) {
				oVizProperties.valueAxis.title.visible = oPlotArea.valueAxisText.visible;
			}
			Log.warning("\"sap.card\".content.plotArea is deprecated. Use \"sap.card\".content.chartProperties instead", null, "sap.ui.integration.widgets.Card");
		}

		merge(oVizProperties, oResolvedConfiguration.chartProperties);

		return oVizProperties;
	};

	/**
	 * @param {object} oConfiguration Parsed manifest configuration
	 * @param {object} oResolvedConfiguration Manifest configuration with resolved bindings
	 * @returns {sap.viz.ui5.data.FlattenedDataset} The data set for the VizFrame
	 */
	AnalyticalContent.prototype._getDataset = function (oConfiguration, oResolvedConfiguration) {
		var aMeasures, aDimensions;

		if (oConfiguration.dimensions) {
			aDimensions = oConfiguration.dimensions.map(function (oDimension, i) {
				return {
					name: oResolvedConfiguration.dimensions[i].name || oResolvedConfiguration.dimensions[i].label, // .label for backwards compatibility
					value: oDimension.value,
					displayValue: oDimension.displayValue,
					dataType: oDimension.dataType
				};
			});
		}

		if (oConfiguration.measures) {
			aMeasures = oConfiguration.measures.map(function (oMeasure, i) {
				return {
					name: oResolvedConfiguration.measures[i].name || oResolvedConfiguration.measures[i].label, // .label for backwards compatibility
					value: oMeasure.value
				};
			});
		}

		return new FlattenedDataset({
			measures: aMeasures,
			dimensions: aDimensions,
			data: {
				path: this.getBindingContext().getPath()
			}
		});
	};

	/**
	 * @param {object} oResolvedConfiguration Manifest configuration with resolved bindings
	 * @returns {sap.viz.ui5.controls.common.feeds.FeedItem[]} Feeds for the VizFrame
	 */
	AnalyticalContent.prototype._getFeeds = function (oResolvedConfiguration) {
		var aFeeds = oResolvedConfiguration.feeds;

		// Backwards compatibility
		if (oResolvedConfiguration.measureAxis || oResolvedConfiguration.dimensionAxis) {
			Log.warning("\"sap.card\".content.measureAxis and \"sap.card\".content.dimensionAxis are deprecated. Use \"sap.card\".content.feeds instead", null, "sap.ui.integration.widgets.Card");

			aFeeds = [
				{
					uid: oResolvedConfiguration.measureAxis,
					type: "Measure",
					values: oResolvedConfiguration.measures.map(function (oMeasure) {
						return oMeasure.label;
					})
				},
				{
					uid: oResolvedConfiguration.dimensionAxis,
					type: "Dimension",
					values: oResolvedConfiguration.dimensions.map(function (oDimension) {
						return oDimension.label;
					})
				}
			];
		}

		return aFeeds.map(function (oFeed) {
			return new FeedItem(oFeed);
		});
	};

	return AnalyticalContent;
});
