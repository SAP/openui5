
sap.ui.define([
	"sap/ui/mdc/ChartDelegate",
	"sap/ui/mdc/demokit/sample/Chart/ChartJS/control/ChartWrapper",
	"./ChartJSPropertyHelper",
	"sap/ui/mdc/chart/Item",
	"sap/ui/mdc/enums/ChartItemRoleType",
	"sap/ui/mdc/p13n/panels/ChartItemPanel",
	"sap/ui/model/Sorter"
], function (
	BaseDelegate,
	ChartWrapper,
	ChartJSPropertyHelper,
	ChartItem,
	ChartItemRoleType,
	ChartItemPanel,
	Sorter) {
	"use strict";
	const ChartDelegate = Object.assign({}, BaseDelegate);
	const mStateMap = new window.WeakMap();
	ChartDelegate._getState = function(oChart) {
		if (mStateMap.has(oChart)) {
			return mStateMap.get(oChart);
		}
		return {};
	};
	ChartDelegate._setState = function(oChart, oState) {
		mStateMap.set(oChart, oState);
	};
	ChartDelegate._getInnerChart = function(oChart) {
		return this._getState(oChart).innerChart;
	};
	// create the FilterFields for the Properties when the user open the settings filter Dialog
	ChartDelegate.getFilterDelegate = function (oChart) {
	    return {
	        addItem: function (oChart, sPropertyKey) {
				const oPropertyInfo = oChart.getPropertyHelper().getProperty(sPropertyKey);
	            return Promise.resolve(
					new sap.ui.mdc.FilterField(
						oChart.getId() + "--" + sPropertyKey,
						{
							propertyKey: oPropertyInfo.key,
							conditions: `{$filters>/conditions/${sPropertyKey}}`
						}
					)
				);
	        }
	    };
	};
	// called when a new Dimension or measere will be added (via Settings dialog or drill down)
	ChartDelegate.addItem = function (oChart, sPropertyKey, mPropertyBag, sRole) {
		return new Promise(function (resolve, reject) {
			const oPropertyInfo = oChart.getPropertyHelper().getProperty(sPropertyKey);
			const oItem = new ChartItem(oChart.getId() + "--Item--" + oPropertyInfo.key, {
				propertyKey: oPropertyInfo.key,
				label: oPropertyInfo.label,
				role: oPropertyInfo.role,
				type: oPropertyInfo.groupable ? "groupable" : "aggregatable"
			});
			resolve(oItem);
		});
	};
	// called when a Dimension or Measure will be removed (via Settings dialog or drill up (breadcrumb)
	ChartDelegate.removeItem = function (oChart, oItem, mPropertyBag) {
		oItem.destroy();
		return Promise.resolve(true);
	};
	//  * Inserts a chart item (measure / dimension for <code>sap.chart.Chart</code>) into the inner chart.<br>
	ChartDelegate.insertItemToInnerChart = function(oChart, oItem, iIndex) {
		// console.log("insertItemToInnerChart " + oItem.getLabel());
	};
	//??? this should be used to create the innerChart label and axis when a new oItem has benn added - at the moment all will be done inside the _rebind
	// * Removes a chart item (measure / dimension for <code>sap.chart.Chart</code>) from the inner chart.<br>
	ChartDelegate.removeItemFromInnerChart = function(oChart, oItem) {
		// console.log("removeItemFromInnerChart " + oItem.getLabel());
	};
	//??? this should be used to remove the innerChart label and axis when an oItem has benn removed - at the moment all will be done inside the _rebind
	// 1. create the inner Chart (ChartWrapper) and the required ChartImplemenationContainer!
	ChartDelegate.initializeInnerChart = function (oChart) {
		return new Promise(function (resolve, reject) {
			const oState = this._getState(oChart);
			oState.innerChart = new ChartWrapper( { width: oChart.getWidth() });
			this._setState(oChart, oState);
			resolve(oState.innerChart);
		}.bind(this));
	};
	// 2.
	//  * Creates the initial content for the chart before the metadata is retrieved.<br>
	//  * This can be used by chart libraries that can already show some information without the actual data (for example, axis labels, legend, ...).
	ChartDelegate.createInitialChartContent = function (oChart) {
	};
	// 3.
	// * Binds the inner chart to the back-end data and creates the inner chart content.
	ChartDelegate.createInnerChartContent = function (oChart, fnCallbackDataLoaded) {
		return new Promise(function (resolve, reject) {
			const oState = this._getState(oChart);
			oState.fnCallbackDataLoaded = fnCallbackDataLoaded;
			this._setState(oChart, oState);
			const oBindingInfo = this.getBindingInfo(oChart);
			this.updateBindingInfo(oChart, oBindingInfo); //Applies filters
			this.rebind(oChart, oBindingInfo);
			resolve();
		}.bind(this));
	};
	// chart Type has been changed and inner chart should be updated
	ChartDelegate.setChartType = function (oChart, sChartType) {
		this._getInnerChart(oChart).setChartType(sChartType);
		this._getInnerChart(oChart).updateChart();
	};
	// this is used to update the ChartType button icon and text/tooltip
	ChartDelegate.getChartTypeInfo = function (oChart) {
		let oChartType = {
			icon: "sap-icon://vertical-bar-chart",
			text: "Bar Chart"
		};
		if (this._getInnerChart(oChart)) {
			const sType = oChart.getChartType();
			const aChartTypes = this.getAvailableChartTypes(oChart);
			oChartType = aChartTypes.filter((oType) => {
				return oType.key === sType;
			})[0];
		}
		return {
			icon: oChartType.icon,
			text: oChartType.text
		};
	};
	// returns all available chart types for the drop down list
	ChartDelegate.getAvailableChartTypes = function (oChart) {
		return this._getInnerChart(oChart).getAvailableChartTypes();
	};
	// used dimensions which should be ignored on the drill down popover
	ChartDelegate.getDrillStack = function (oChart) {
		const aItems = oChart.getItems();
		const aDrillStack = [];
		aItems.forEach(function (oItem) {
			if (oItem.getType() === "groupable") {
				aDrillStack.push(oItem.getPropertyKey());
			}
		});
		return [{ dimension: aDrillStack }]; //TODO Why is it added to dimensions?
	};
	//all dimensions used to fill the View By/drill down popover. This is not required when the View By is not used.
	ChartDelegate.getSortedDimensions = function (oChart) {
		const sortPropertyDimensions = function(aProperties) {
			const aDimensions = aProperties.filter((oProperty) => {
				return oProperty.groupable; //Groupable means "Dimension" for sap.chart.Chart
			});
			if (aDimensions) {
				aDimensions.sort((a, b) => {
					if (a.label && b.label) {
						return a.label.localeCompare(b.label);
					}
				});
			}
			return aDimensions;
		};
		return new Promise(function (resolve, reject) {
			if (oChart.isPropertyHelperFinal()) {
				resolve(sortPropertyDimensions(oChart.getPropertyHelper().getProperties()));
			} else {
				oChart.finalizePropertyHelper().then(() => {
					resolve(sortPropertyDimensions(oChart.getPropertyHelper().getProperties()));
				});
			}
		});
	};
	// * Returns the binding info for given chart.
	ChartDelegate.getBindingInfo = function(oChart) {
		return {};
	};
	// * Updates the binding info with the relevant filters.<br>
	ChartDelegate.updateBindingInfo = function (oChart, oBindingInfo) {
		oBindingInfo.filters = this.getFilters(oChart);
		oBindingInfo.sorter = this.getSorters(oChart);
	};
	// * Checks the binding of the chart and rebinds it if required.
	ChartDelegate.rebind = function (oChart, oBindingInfo) {
		this._rebind(oChart, oBindingInfo);
		// this._getInnerChart(oChart).updateChart();
		// Should be called after a rebind load data or after rendering
		const oState = this._getState(oChart);
		oState.fnCallbackDataLoaded();
	};
	const bindingFormatter = function(oChart, aData) {
		const labels = [ /* ["Product 1", ...], ["Product 2", ...], ["Product 3", ...], ... */];
		const datasets = [
			// {
			// "label": "Price",
			// "backgroundColor": [
			// 	"rgba(249, 222, 89)",
			// 	"rgba(232, 166, 40)",
			// 	"rgba(249, 131, 101)",
			// 	"rgba(195, 49, 36)",
			// 	"rgba(161, 223, 251)"
			// ],
			// // "borderWidth": 0,
			// "data": [10, 20, 30, 15]
			// }
			// ...
		];
		const aItems = oChart.getItems();
		const aDimensionItems = aItems.filter(function(oItem) { return oItem.getType() === "groupable"; });
		const aMeasureItems = aItems.filter(function(oItem) { return oItem.getType() === "aggregatable"; });
		let sXLabel = "";
		aDimensionItems.forEach(function(oItem, index) {
			const sPropertyKey = oItem.getPropertyKey();
			const oProperty = oChart.getPropertyHelper().getProperty(sPropertyKey);
			sXLabel += (index ? " / " : "") + oProperty.label;
		});
		let sYLabel = "";
		aMeasureItems.forEach(function(oItem, index) {
			const sPropertyKey = oItem.getPropertyKey();
			const oProperty = oChart.getPropertyHelper().getProperty(sPropertyKey);
			sYLabel += (index ? " / " : "") + oProperty.label;
			const aColors = [
				"rgba(249, 222, 89)",
				"rgba(232, 166, 40)",
				"rgba(249, 131, 101)",
				"rgba(195, 49, 36)",
				"rgba(161, 223, 251)"
			];
			datasets.push({
					"backgroundColor": [aColors[index % 5]],
					data: []
				}
			);
			aData.forEach(function (oProd) {
				if (index === 0) {
					const aLabels = [];
					aDimensionItems.forEach(function(oItem) {
						const sPropertyKey =  oItem.getPropertyKey();
						const oProperty = oChart.getPropertyHelper()?.getProperty(sPropertyKey);
						aLabels.push(oProd[oProperty?.path]);
					});
					labels.push(aLabels);
				}
				const val = oProd[oProperty?.path];
				datasets[index].label = oProperty?.label;
				datasets[index].data.push(val);
			});
		});
		const scales = {
			x: {
				title: {
					display: true,
					text: sXLabel
				}
			},
			y: {
				title: {
					display: true,
					text: sYLabel
				},
				beginAtZero: true
			}
		};
		return { labels: labels, datasets: datasets, scales: scales};
	};
	ChartDelegate._rebind = function (oChart, oBindingInfo) {
		const oPayload = oChart.getDelegate().payload;
		const oDataBindingInfo = Object.assign({}, oBindingInfo);
		oDataBindingInfo.path = oPayload.model;
		oDataBindingInfo.factory = function(s, oContext) {
			return new sap.ui.core.Element();
		};
		this._getInnerChart(oChart).bindData(oDataBindingInfo);
		const aProductsModelData = [];
		const aProductsModelDataAll = oChart.getModel(oPayload.model.substring(0, oPayload.model.length - 2)).getData();
		this._getInnerChart(oChart).getData().forEach( function(oWrapper) {
			const index = oWrapper.oBindingContexts.products.sPath.substring(1);
			aProductsModelData.push(aProductsModelDataAll[index]);
		});
		const oResult = bindingFormatter(oChart, aProductsModelData);
		this._getInnerChart(oChart).setDatasets(oResult.datasets);
		this._getInnerChart(oChart).setLabels(oResult.labels);
		this._getInnerChart(oChart).setScales(oResult.scales);
	};
	// Returns the information whether the inner chart is currently bound.
	ChartDelegate.getInnerChartBound = function (oChart) {
		// why is this important for the chart?
		return true;
	};
	ChartDelegate.getPropertyHelperClass = function () {
		return ChartJSPropertyHelper;
	};
	ChartDelegate.fetchProperties = function (oChart) {
		const oPayload = oChart.getDelegate().payload;
		const aModelInfos = oChart.getModel(oPayload.infomodel).getData();
		return Promise.resolve(aModelInfos);
	};
	// connect the SelectionDetails button with the inner chart to show details on selected DataPoints
	ChartDelegate.getInnerChartSelectionHandler = function (oChart) {
        return {}; //{eventId: "_selectionDetails", listener: this._getInnerChart(oChart)};
    };
	// This function is used by <code>P13n</code> to determine which chart type supports which layout options.
	// There might be chart types that do not support certain layout options (for example, "Axis3").
	ChartDelegate.getChartTypeLayoutConfig = function () {
		// const aLayoutOptions = [ChartItemRoleType.axis1, ChartItemRoleType.axis2, ChartItemRoleType.category, ChartItemRoleType.series];
		const aLayoutOptions = [ChartItemRoleType.axis1, ChartItemRoleType.category];
		const aChartTypeLayout = [
			{ key: "bar", allowedLayoutOptions: aLayoutOptions },
			{ key: "line", allowedLayoutOptions: aLayoutOptions },
			{ key: "pie", allowedLayoutOptions: aLayoutOptions },
			// { key: "scatter", allowedLayoutOptions: aLayoutOptions },
			// { key: "bubble", allowedLayoutOptions: aLayoutOptions },
			{ key: "radar", allowedLayoutOptions: aLayoutOptions },
			{ key: "doughnut", allowedLayoutOptions: aLayoutOptions },
			{ key: "polarArea", allowedLayoutOptions: aLayoutOptions }
		];
		return aChartTypeLayout;
	};

	ChartDelegate.getAdaptionUI = function (oChart) {
		const oLayoutConfig = this.getChartTypeLayoutConfig().find(function (chart) { return chart.key === oChart.getChartType(); });
		oLayoutConfig.templateConfig = [{ kind: "Groupable" }, { kind: "Aggregatable" }];
		const oPanel = new ChartItemPanel({ panelConfig: oLayoutConfig });
		return Promise.resolve(oPanel);
	};
	ChartDelegate.zoomIn = function (oChart) {
		this._getInnerChart(oChart).zoom({ y: 1.1, x: 1.1 });
	};
	ChartDelegate.zoomOut = function (oChart) {
		this._getInnerChart(oChart).zoom({ y: 0.9, x: 0.9 });
	};
	ChartDelegate.getZoomState = function (oChart) {
		return { enabled: true, currentZoomLevel: 0.5 };
	};
	ChartDelegate.setLegendVisible = function (oChart, bVisible) {
		this._getInnerChart(oChart).setDisplayLegend(bVisible);
		this._getInnerChart(oChart).updateChart();
	};
	// * Sets tooltips to visible/invisible for the inner chart.
	ChartDelegate.setChartTooltipVisibility = function (oChart, bVisible) {
		this._getInnerChart(oChart).setShowTooltip(bVisible);
		this._getInnerChart(oChart).updateChart();
	};
	// returns the chart Items for updating the breadcrumb
	ChartDelegate.getDrillableItems = function (oChart) {
		return oChart.getItems().filter(function(oItem){ return oItem.getType() === "groupable"; }); //only groupable items are shown on breadcrumb
	};
	// This function returns an ID that should be used in the internal chart for the Measure/Dimension.<br>
	ChartDelegate.getInternalChartNameFromPropertyNameAndKind = function(sName, sKind, oChart) {
		return sName;
	};
	ChartDelegate.getSorters = function(oChart) {
		let aSorters;
		const aSorterProperties = oChart.getSortConditions() ? oChart.getSortConditions().sorters : [];
		aSorterProperties.forEach((oSortProperty) => {
			const oItem = oChart.getItems().find((oItem) => {
				return oItem.getPropertyKey() === oSortProperty.key;
			});
			//Ignore not visible Items
			if (!oItem) {
				return;
			}
			const oSorter = this._getSorterForItem(oItem, oSortProperty);
			if (aSorters) {
				aSorters.push(oSorter);
			} else {
				aSorters = [
					oSorter
				];
			}
		});
		return aSorters;
	};
	ChartDelegate._getSorterForItem = function(oItem, oSortProperty) {
		let sName = "";
		if (oItem.getType() === "aggregatable") {
			sName = this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "aggregatable", oItem.getParent());
		} else if (oItem.getType() === "groupable") {
			sName = this.getInternalChartNameFromPropertyNameAndKind(oSortProperty.key, "groupable", oItem.getParent());
		}
		return new Sorter(sName, oSortProperty.descending);
	};
	return ChartDelegate;
});
