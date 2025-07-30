
sap.ui.define([
	"sap/ui/core/Control",
	"./ChartWrapperRenderer"
], function (Control, ChartWrapperRenderer) {
	"use strict";
	const ChartWrapper = Control.extend("sap.ui.mdc.demokit.sample.Chart.ChartJS.control.ChartWrapper", {
		metadata: {
			properties: {
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "auto"
				},
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "100%"
				},
				chartType: {
					type: "string",
					defaultValue: "bar"
				},
				datasets: {
					type: "array",
					defaultValue: null
				},
				scales: {
					type: "object",
					defaultValue: null
				},
				labels: {
					type: "array",
					defaultValue: []
				},
				displayLegend: {
					type: "boolean",
					defaultValue: true
				},
				showTooltip: {
					type: "boolean",
					defaultValue: true
				}
			},
			aggregations: {
				data: {type: "sap.ui.core.Element", multiple: true, bindable: "bindable"}
			},
			events: {
			}
		},
		init: function () {
		},
		onAfterRendering: function () {
			if (!this.chart) {
				const ctx = document.getElementById(this.getId() + "--canvas");
				/* eslint-disable no-undef */
				this.chart = new Chart(ctx, this._getConfig());
			}
		},
		renderer: ChartWrapperRenderer
	});
	ChartWrapper.prototype.mIcons = {
		"bar": "sap-icon://vertical-bar-chart",
		"line": "sap-icon://line-chart",
		// "scatter": "sap-icon://scatter-chart",
		"pie": "sap-icon://pie-chart",
		// "bubble": "sap-icon://bubble-chart",
		"radar": "sap-icon://radar-chart",
		"doughnut": "sap-icon://appear-offline",
		"polarArea": "sap-icon://sys-help"
	};
	ChartWrapper.prototype.mTexts = {
		"bar": "Bar Chart",
		"line": "Line Chart",
		// "scatter": "Scatter Chart",
		"pie": "Pie Chart",
		// "bubble": "Bubble Chart",
		"radar": "Radar Chart",
		"doughnut": "Doughnut Chart",
		"polarArea": "Polar Area Chart"
	};
	ChartWrapper.prototype.updateChart = function () {
		if (this.chart) {
			this.chart.update();
		}
	};
	ChartWrapper.prototype.getInnerChart = function () {
		return this.chart;
	};
	ChartWrapper.prototype.setChartType = function (sChartType) {
		const canvas = document.getElementById(this.getId() + "--canvas");
		const ctx = canvas.getContext("2d");

		if (this.chart) {
			this.chart.destroy();
		}
		const config = this._getConfig();
		config.type = sChartType;
		this.setProperty("chartType", sChartType, true);
		this.chart = new Chart(ctx, config);

		return this;
	};
	ChartWrapper.prototype.setDatasets = function (oDatasets) {
		this.setProperty("datasets", oDatasets);
		if (this.chart) {
			this.chart.config.data.datasets = oDatasets;
			this.chart.update();
		}
		return this;
	};
	ChartWrapper.prototype.setLabels = function (oLabels) {
		this.setProperty("labels", oLabels);
		if (this.chart) {
			this.chart.config.data.labels = oLabels;
			this.chart.update();
		}
		return this;
	};
	ChartWrapper.prototype.setScales = function (oScales) {
		this.setProperty("scales", oScales);
		if (this.chart) {
			this.chart.config.options.scales = oScales;
			this.chart.update();
		}
		return this;
	};
	ChartWrapper.prototype.setDisplayLegend = function (bVisible) {
		this.setProperty("displayLegend", bVisible);
		if (this.chart) {
			this.chart.config.options.plugins.legend.display = bVisible;
		}
		return this;
	};
	ChartWrapper.prototype.setShowTooltip = function (bVisible) {
		this.setProperty("showTooltip", bVisible);
		if (this.chart) {
			this.chart.config.options.plugins.tooltip.enabled = bVisible;
		}
		return this;
	};
	ChartWrapper.prototype.getChartTypeInfo = function () {
		const sChartType = this.getChartType();
		return {
			icon: this._getIconForType(sChartType),
			text: this._getTextForType(sChartType)
		};
	};
	ChartWrapper.prototype.getAvailableChartTypes = function () {
		const aAvailable = [];
		for (const [key, value] of Object.entries(this.mIcons)) {
			const oType = {};
			oType.key = key;
			oType.text = this._getTextForType(key);
			oType.icon = value;
			oType.selected = key === this.getChartType();
			aAvailable.push(oType);
		}
		return aAvailable;
	};
	ChartWrapper.prototype._getIconForType = function (sType) {
		return this.mIcons[sType];
	};
	ChartWrapper.prototype._getTextForType = function (sType) {
		return this.mTexts[sType];
	};
	ChartWrapper.prototype.zoom = function (oZoom) {
		this.chart.zoom(oZoom);
	};
	ChartWrapper.prototype._getConfig = function () {
		return {
			type: this.getChartType(),
			data: {
				labels: this.getLabels(),
				datasets: this.getDatasets()
			},
			options: {
				indexAxis: "x", // y: horizontal bar or line charts
				responsive: true,
				maintainAspectRatio: false,
				aspectRatio: 1,
				scales: this.getScales(),
				plugins: {
					legend: {
						display: this.getDisplayLegend(),
						position: "right"
					},
					tooltip: {
						enabled: this.getShowTooltip()
					},
					zoom: {
						pan: {
							enabled: true
						},
						zoom: {
							wheel: {
								enabled: true
							},
							mode: 'x',
							limits: {
								x: { min: 0, max: 2 },
								y: { min: 0, max: 2 }
							}
						}
					}
				}
			}
		};
	};
	return ChartWrapper;
}, /* bExport= */ true);
