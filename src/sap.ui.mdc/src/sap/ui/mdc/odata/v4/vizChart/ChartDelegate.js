/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/mdc/odata/v4/ChartDelegate",
	"sap/m/Text",
	"sap/base/Log",
	"sap/ui/mdc/odata/v4/util/DelegateUtil",
	"sap/ui/mdc/chart/Item",
	"sap/ui/model/Sorter",
	"sap/ui/mdc/chart/ChartImplementationContainer",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/mdc/p13n/panels/ChartItemPanel",
	"sap/m/p13n/MessageStrip",
	"sap/ui/mdc/FilterBarDelegate",
	"sap/ui/mdc/chart/PropertyHelper",
	"sap/ui/thirdparty/jquery",
	"sap/ui/mdc/enums/ChartItemRoleType",
	"sap/base/util/merge"
], (
	Element,
	Library,
	V4ChartDelegate,
	Text,
	Log,
	DelegateUtil,
	MDCChartItem,
	Sorter,
	ChartImplementationContainer,
	ManagedObjectObserver,
	ChartItemPanel,
	MessageStrip,
	FilterBarDelegate,
	PropertyHelper,
	jQuery,
	ChartItemRoleType,
	merge
) => {
	"use strict";

	/**
	 * Module for vizChart delegate
	 * @namespace
	 * @name sap.ui.mdc.odata.v4.vizChart
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 */

	/**
	 * Example Delegate for {@link sap.ui.mdc.Chart Chart}. This class extends the {@link sap.ui.mdc.ChartDelegate ChartDelegate} object und make use of the {@link sap.ui.chart.Chart Chart}.<br>
	 *
	 * @namespace
	 * @author SAP SE
	 * @alias module:sap/ui/mdc/odata/v4/vizChart/ChartDelegate
	 * @extends module:sap/ui/mdc/odata/v4/ChartDelegate
	 * @since 1.88
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 *
	 */
	const ChartDelegate = Object.assign({}, V4ChartDelegate);

	const mStateMap = new window.WeakMap();
	let Chart;
	let Dimension;
	let TimeDimension;
	let Measure;
	let VizTooltip;

	//API to access state
	ChartDelegate._getState = function(oChart) {
		if (mStateMap.has(oChart)) {
			return mStateMap.get(oChart);
		}

		if (oChart) {
			Log.info("Couldn't get state for " + oChart.getId());
		}
	};

	ChartDelegate._setState = function(oChart, oState) {
		mStateMap.set(oChart, oState);
	};

	ChartDelegate._deleteState = function(oChart) {

		if (this._getState(oChart)) {
			if (this._getState(oChart).vizTooltip) {
				this._getState(oChart).vizTooltip.destroy();
			}

			if (this._getState(oChart).observer) {
				this._getState(oChart).observer.disconnect();
				this._getState(oChart).observer = null;
			}
		}

		return mStateMap.delete(oChart);
	};

	ChartDelegate._getChart = function(oChart) {

		if (mStateMap.has(oChart)) {
			return mStateMap.get(oChart).innerChart;
		}

		if (oChart) {
			Log.info("Couldn't get state for " + oChart.getId());
		}

		return undefined;

	};

	ChartDelegate._setChart = function(oChart, oInnerChart) {
		if (mStateMap.has(oChart)) {
			mStateMap.get(oChart).innerChart = oInnerChart;
		} else {
			mStateMap.set(oChart, { innerChart: oInnerChart });
		}
	};

	ChartDelegate._getInnerStructure = function(oChart) {
		if (mStateMap.has(oChart)) {
			return mStateMap.get(oChart).innerStructure;
		}

		if (oChart) {
			Log.info("Couldn't get state for " + oChart.getId());
		}

		return undefined;
	};

	ChartDelegate._setInnerStructure = function(oChart, oInnerStructure) {
		if (mStateMap.has(oChart)) {
			mStateMap.get(oChart).innerStructure = oInnerStructure;
		} else {
			mStateMap.set(oChart, { innerStructure: oInnerStructure });
		}
	};

	ChartDelegate.getFilterDelegate = function() {
		return FilterBarDelegate;
	};

	ChartDelegate.addCondition = function(sPropertyName, oControl, mPropertyBag) {
		return Promise.resolve();
	};

	ChartDelegate.removeCondition = function(sPropertyName, oControl, mPropertyBag) {
		return Promise.resolve();
	};

	ChartDelegate._getBindingInfoFromState = function(oChart) {
		if (mStateMap.has(oChart)) {
			const oBindingInfo = mStateMap.get(oChart).bindingInfo;
			if (oBindingInfo) {
				// existing events from BindingInfo must be removed
				delete oBindingInfo.events;
			}
			return oBindingInfo;
		}

		if (oChart) {
			Log.info("Couldn't get state for " + oChart.getId());
		}

		return undefined;
	};

	ChartDelegate._setBindingInfoForState = function(oChart, oBindingInfo) {
		if (mStateMap.has(oChart)) {
			mStateMap.get(oChart).bindingInfo = oBindingInfo;
		} else {
			mStateMap.set(oChart, { bindingInfo: oBindingInfo });
		}
	};

	ChartDelegate._setUpChartObserver = function(oChart) {
		const mChartMap = this._getState(oChart);

		if (!mChartMap.observer) {
			mChartMap.observer = new ManagedObjectObserver((oChange) => {
				if (oChange.type === "destroy") {
					this.exit(oChange.object);
				}
			});
		}

		mChartMap.observer.observe(oChart, {
			destroy: true
		});
	};


	/**
	 * Define a set of V4 specific functions which is specifically meant for the sap.chart.Chart control
	 *
	 * ...
	 */


	ChartDelegate.exit = function(oChart) {
		if (this._getInnerStructure(oChart)) {
			this._getInnerStructure(oChart).destroy();
		}

		this._deleteState(oChart);
	};

	ChartDelegate.zoomIn = function(oChart) {
		const oInnerChart = this._getChart(oChart);

		if (oInnerChart) {
			oInnerChart.zoom({ direction: "in" });
		}
	};

	ChartDelegate.zoomOut = function(oChart) {
		const oInnerChart = this._getChart(oChart);

		if (oInnerChart) {
			oInnerChart.zoom({ direction: "out" });
		}
	};

	ChartDelegate.getZoomState = function(oChart) {

		if (this._getChart(oChart)) {
			const oZoomInfo = this._getChart(oChart).getZoomInfo();

			if (oZoomInfo && oZoomInfo.hasOwnProperty("currentZoomLevel") && oZoomInfo.currentZoomLevel != null && oZoomInfo.enabled) {
				return {
					enabled: oZoomInfo.enabled,
					enabledZoomIn: oZoomInfo.currentZoomLevel < 1,
					enabledZoomOut: oZoomInfo.currentZoomLevel > 0
				};
			}
		}

		return { enabled : false };
	};

	ChartDelegate.getInnerChartSelectionHandler = function(oChart) {
		return { eventId: "_selectionDetails", listener: this._getChart(oChart) };
	};

	ChartDelegate.getChartTypeLayoutConfig = function() {

		if (this._aChartTypeLayout) {
			return this._aChartTypeLayout;
		}

		const aAxis1Only = [ChartItemRoleType.axis1, ChartItemRoleType.category, ChartItemRoleType.series];
		const aAxis1And2 = [ChartItemRoleType.axis1,
			ChartItemRoleType.axis2,
			ChartItemRoleType.category,
			ChartItemRoleType.series
		];
		const aCat2Axis1Only = [ChartItemRoleType.axis1, ChartItemRoleType.category, ChartItemRoleType.category2];
		const aCat1AllAxis = [ChartItemRoleType.axis1,
			ChartItemRoleType.axis2,
			ChartItemRoleType.axis3,
			ChartItemRoleType.category,
			ChartItemRoleType.series
		];

		this._aChartTypeLayout = [
			{ key: "column", allowedLayoutOptions: aAxis1Only },
			{ key: "bar", allowedLayoutOptions: aAxis1Only },
			{ key: "line", allowedLayoutOptions: aAxis1Only },
			{ key: "combination", allowedLayoutOptions: aAxis1Only },
			{ key: "pie", allowedLayoutOptions: aAxis1Only },
			{ key: "donut", allowedLayoutOptions: aAxis1Only },
			{ key: "dual_column", allowedLayoutOptions: aAxis1And2 },
			{ key: "dual_bar", allowedLayoutOptions: aAxis1And2 },
			{ key: "dual_line", allowedLayoutOptions: aAxis1And2 },
			{ key: "stacked_bar", allowedLayoutOptions: aAxis1Only },
			{ key: "scatter", allowedLayoutOptions: aAxis1And2 },
			{ key: "bubble", allowedLayoutOptions: aCat1AllAxis },
			{ key: "heatmap", allowedLayoutOptions: aCat2Axis1Only },
			{ key: "bullet", allowedLayoutOptions: aAxis1Only },
			{ key: "vertical_bullet", allowedLayoutOptions: aAxis1Only },
			{ key: "dual_stacked_bar", allowedLayoutOptions: aAxis1And2 },
			{ key: "100_stacked_bar", allowedLayoutOptions: aAxis1Only },
			{ key: "stacked_column", allowedLayoutOptions: aAxis1Only },
			{ key: "dual_stacked_column", allowedLayoutOptions: aAxis1And2 },
			{ key: "100_stacked_column", allowedLayoutOptions: aAxis1Only },
			{ key: "dual_combination", allowedLayoutOptions: aAxis1And2 },
			{ key: "dual_horizontal_combination", allowedLayoutOptions: aAxis1And2 },
			{ key: "dual_horizontal_combination", allowedLayoutOptions: aAxis1And2 },
			{ key: "dual_stacked_combination", allowedLayoutOptions: aAxis1And2 },
			{ key: "dual_horizontal_stacked_combination", allowedLayoutOptions: aAxis1And2 },
			{ key: "stacked_combination", allowedLayoutOptions: aAxis1Only },
			{ key: "100_dual_stacked_bar", allowedLayoutOptions: aAxis1Only },
			{ key: "100_dual_stacked_column", allowedLayoutOptions: aAxis1Only },
			{ key: "horizontal_stacked_combination", allowedLayoutOptions: aAxis1Only },
			{ key: "waterfall", allowedLayoutOptions: aCat2Axis1Only },
			{ key: "horizontal_waterfall", allowedLayoutOptions: aCat2Axis1Only }
		];

		return this._aChartTypeLayout;
	};

	/**
	 * This function returns a UI which is then shown inside the p13n Items panel.
	 * Depending on which chart is used, the panel might offer different functionality.
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @returns {sap.ui.core.Control} Adaptation UI to be used
	 * @experimental
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 */
	ChartDelegate.getAdaptionUI = function(oChart) {

		return Promise.resolve(this._setupAdaptionUI(oChart));
	};

	ChartDelegate._setupAdaptionUI = function(oChart) {
		let oLayoutConfig = this.getChartTypeLayoutConfig().find((it) => { return it.key === oChart.getChartType(); });

		//Default case -> everything allowed
		if (!oLayoutConfig) {
			const aRoles = [ChartItemRoleType.axis1,
				ChartItemRoleType.axis2,
				ChartItemRoleType.axis3,
				ChartItemRoleType.category,
				ChartItemRoleType.category2,
				ChartItemRoleType.series
			];
			oLayoutConfig = { key: oChart.getChartType(), allowedLayoutOptions: aRoles };
		}

		const aStandardSetup = [
			{ kind: "Groupable" }, { kind: "Aggregatable" }
		];

		oLayoutConfig.templateConfig = aStandardSetup;


		//var aRolesAvailable = [ChartItemRoleType.axis1, ChartItemRoleType.axis2, ChartItemRoleType.axis3, ChartItemRoleType.category, ChartItemRoleType.category2, ChartItemRoleType.series];
		const oArguments = { panelConfig: oLayoutConfig };

		const oPanel = new ChartItemPanel(oArguments);

		if (oChart.getChartType() === "heatmap") {
			const MDCRb = Library.getResourceBundleFor("sap.ui.mdc");
			oPanel.setMessageStrip(new MessageStrip({ text: MDCRb.getText("chart.PERSONALIZATION_DIALOG_MEASURE_WARNING"), type: "Warning" }));
		}

		return oPanel;
	};

	ChartDelegate.setLegendVisible = function(oChart, bVisible) {
		if (this._getChart(oChart)) {
			this._getChart(oChart).setVizProperties({
				'legend': {
					'visible': bVisible
				},
				'sizeLegend': {
					'visible': bVisible
				}
			});
		} else {
			Log.error("Could not set legend visibility since inner chart is not yet initialized!");
		}
	};

	/**
	 * Creates a Sorter for a given property.
	 * @param {sap.ui.mdc.chart.Item} oItem Item to create a sorter for
	 * @param {object} oSortProperty Sorting information
	 * @returns {sap.ui.model.Sorter} Sorter for given item
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 */
	ChartDelegate._getSorterForItem = function(oItem, oSortProperty) {
		//TODO: Check wether we really need this method.
		//TODO: Right now it is needed since the name of a property does not include the aggregation method -> leads to an error when calling back-end
		//TODO: In old chart, aggregation method was included in name since every method had their own Item

		if (oItem.getType() === "aggregatable") {
			return new Sorter(this._getAggregatedMeasureNameForMDCItem(oItem), oSortProperty.descending);
		} else if (oItem.getType() === "groupable") {
			return new Sorter(this.getInternalChartNameFromPropertyNameAndKind(oSortProperty.key, "groupable", oItem.getParent()), oSortProperty.descending);
		}

	};

	ChartDelegate.insertItemToInnerChart = function(oChart, oItem, iIndex) {
		//TODO: Create Measures/Dimension only when required?
		if (oItem.getType() === "groupable") {

			const sInnerDimName = this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "groupable", oChart);
			const oDim = this._getChart(oChart).getDimensionByName(sInnerDimName);

			if (!oDim) {
				this.createInnerDimension(oChart, oItem);
			} else {
				//Update Dimension
				oDim.setLabel(oItem.getLabel());
				oDim.setRole(oItem.getRole() ? oItem.getRole() : "category");
			}

			const bDrill = oChart._bDrillDown;
			if (bDrill && oDim) {
				this._getChart(oChart).drillDown(oDim);
				oChart._bDrillDown = false;
			} else if (!bDrill) {
				const aVisibleDimension = this._getChart(oChart).getVisibleDimensions();
				aVisibleDimension.splice(iIndex, 0, sInnerDimName); //Insert Item without deleting existing dimension
				this._getChart(oChart).setVisibleDimensions(aVisibleDimension);
			}

		} else if (oItem.getType() === "aggregatable") {
			this.createInnerMeasure(oChart, oItem);
			const aVisibleMeasures = this._getChart(oChart).getVisibleMeasures();
			aVisibleMeasures.splice(iIndex, 0, this._getAggregatedMeasureNameForMDCItem(oItem));
			this._getChart(oChart).setVisibleMeasures(aVisibleMeasures);
		}

		//Update coloring and semantical patterns on Item change
		this._prepareColoringForItem(oChart, oItem).then(() => {
			this._updateColoring(oChart, this._getChart(oChart).getVisibleDimensions(), this._getChart(oChart).getVisibleMeasures());
		});

		this._updateSemanticalPattern(oChart);

	};

	ChartDelegate.removeItemFromInnerChart = function(oChart, oItem) {
		if (oItem.getType() === "groupable" && this._getChart(oChart).getVisibleDimensions().includes(this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "groupable", oChart))) {

			if (this._getState(oChart).inResultDimensions.length > 0) {
				this._getChart(oChart).setInResultDimensions(this._getState(oChart).inResultDimensions);
			}

			if (oChart._iDrillUpIndex) {
				this._getChart(oChart).drillUp(oChart._iDrillUpIndex);
				oChart._iDrillUpIndex = 0;
			} else {
				let aNewVisibleDimensions = oChart.getItems().filter((oItem) => {
					return oItem.getType() === "groupable";
				});
				aNewVisibleDimensions = aNewVisibleDimensions.map( function(oItem) {
					return this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "groupable", oChart);
				}.bind(this));

				this._getChart(oChart).setVisibleDimensions(aNewVisibleDimensions);
			}

			//this._getChart(oChart).removeDimension(this._getChart(oChart).getDimensionByName(oChartItem.getPropertyKey()));

		} else if (oItem.getType() === "aggregatable" && this._getChart(oChart).getVisibleMeasures().includes(this._getAggregatedMeasureNameForMDCItem(oItem))) {
			const aNewVisibleMeasures = [];

			oChart.getItems().filter((oItem) => { return oItem.getType() === "aggregatable"; })
				.filter((item) => { return item !== oItem; })
				.forEach((oItem) => {
					aNewVisibleMeasures.push(this._getAggregatedMeasureNameForMDCItem(oItem));
				});

			this._getChart(oChart).setVisibleMeasures(aNewVisibleMeasures);

			this._getChart(oChart).removeMeasure(this._getChart(oChart).getMeasureByName(this._getAggregatedMeasureNameForMDCItem(oItem)));
		}

		//Update coloring and semantical patterns on Item change
		this._updateColoring(oChart, this._getChart(oChart).getVisibleDimensions(), this._getChart(oChart).getVisibleMeasures());

		this._updateSemanticalPattern(oChart);
	};

	ChartDelegate.addItem = function(oChart, sPropertyName, mPropertyBag, sRole) {
		if (oChart.getModel) {
			return Promise.resolve(this._createMDCChartItem(sPropertyName, oChart, sRole));
		}
	};

	ChartDelegate.removeItem = function(oProperty, oChart) {
		return Promise.resolve(true);
	};

	/**
	 * Creates an chart Item for given property.
	 * @param {string} sPropertyName the name of the property in the propertyInfo object.
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @param {string} sRole Role of the new item (if available)
 	 * @returns {Promise<sap.ui.mdc.chart.Item>} Created Item
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 */
	ChartDelegate._createMDCChartItem = function(sPropertyName, oChart, sRole) {

		return this._getPropertyInfosByName(sPropertyName, oChart).then((oPropertyInfo) => {
			if (!oPropertyInfo) {
				return null;
			}

			return this._createMDCItemFromProperty(oPropertyInfo, oChart.getId(), sRole);

		});

	};

	/**
	 * Creates an Item from given property info.
	 * @param {object} oPropertyInfo PropertyInfo object
	 * @param {string} idPrefix Prefix for the id of the item
	 * @param {string} sRole Role of the new item (if available)
	 * @returns {sap.ui.mdc.chart.Item} Created Item
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 */
	ChartDelegate._createMDCItemFromProperty = function(oPropertyInfo, idPrefix, sRole) {

		if (oPropertyInfo.groupable) {
			return new MDCChartItem(idPrefix + "--GroupableItem--" + oPropertyInfo.key, {
				propertyKey: oPropertyInfo.key,
				label: oPropertyInfo.label,
				type: "groupable",
				role: sRole ? sRole : "category"
			});
		}

		if (oPropertyInfo.aggregatable) {

			return new MDCChartItem(idPrefix + "--AggregatableItem--" + oPropertyInfo.key, {
				propertyKey: oPropertyInfo.key,
				label: oPropertyInfo.label,
				type: "aggregatable",
				role: sRole ? sRole : "axis1"
			});
		}

		return null;
	};

	ChartDelegate.initializeInnerChart = function(oChart) {

		return new Promise((resolve, reject) => {

			this._loadChart().then((aModules) => {
                if (!oChart.isDestroyed()) {
                    let oNoDataCont;

                    this._setInnerStructure(oChart, new ChartImplementationContainer(oChart.getId() + "--implementationContainer", {}));
                    oChart.addStyleClass("sapUiMDCChartTempTextOuter");

                    if (oChart.getNoData()) {
                        this._getInnerStructure(oChart).setChartNoDataContent(oChart.getNoData());
                    } else {
                        oNoDataCont = new Text({ text: oChart.getNoDataText() });
                        this._getInnerStructure(oChart).addStyleClass("sapUiMDCChartTempText");
                        this._getInnerStructure(oChart).setNoDataContent(oNoDataCont);
                    }

                    this._setUpChartObserver(oChart);

                    resolve(this._getInnerStructure(oChart)); //Not applicable in this case
                }
			});
		});
	};

	ChartDelegate.changedNoDataStruct = function(oChart, oControl) {
		const oInnerChart = this._getInnerStructure(oChart);
		if (oInnerChart) {
			oInnerChart.setChartNoDataContent(oControl);
			oInnerChart.invalidate();
		}
	};

	/**
	 * This function creates the content defined by the chart for the inner chart instance.
	 * For vizFrame, coloring dimensions/measures are set up here too.
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @returns {Promise} Resolved once chart content has been created
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 */
	ChartDelegate._createContentFromItems = function(oChart) {
		return new Promise((resolve, reject) => {
			//This is done so the user doesn't have to specify property path & aggregation method in the XML
			const aColorPromises = [];
			const aPropPromises = [];

			const aVisibleDimensions = [];
			const aVisibleMeasures = [];
			oChart.getItems().forEach((oItem, iIndex) => {

				//Uses excact chart item id
				aPropPromises.push(this._getPropertyInfosByName(oItem.getPropertyKey(), oChart).then((oPropertyInfo) => {
					//Skip a Item if there is no property representing the Item inside the backend
					if (!oPropertyInfo) {
						Log.error("sap.ui.mdc.Chart: Item " + oItem.getPropertyKey() + " has no property info representing it in the metadata. Make sure the name is correct and the metadata is defined correctly. Skipping the item!");
						return;
					}

					switch (oItem.getType()) {
						case "groupable":
							aVisibleDimensions.push(this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "groupable", oChart));

							this._addInnerDimension(oChart, oItem, oPropertyInfo);
							break;
						case "aggregatable":

							//TODO: Alias might be changing after backend request
							aVisibleMeasures.push(this._getAggregatedMeasureNameForMDCItem(oItem));

							this._addInnerMeasure(oChart, oItem, oPropertyInfo);
							break;

						default:
							Log.error("MDC Chart Item " + oItem.getId() + " with label " + oItem.getLabel() + " has no known type. Supported typed are: \"groupable\" & \"aggregatable\"");
					}

					aColorPromises.push(this._prepareColoringForItem(oChart, oItem));
				}));

			});

			Promise.all(aPropPromises).then(() => {
				this._getState(oChart).aColMeasures.forEach((sKey) => {

					if (this._getState(oChart).aInSettings.indexOf(sKey) == -1) {

						aColorPromises.push(new Promise((resolve, reject) => {
							oChart._getPropertyByNameAsync(sKey).then(function(oPropertyInfo) {
								const aggregationMethod = this.getPropertyAttribute(oChart, oPropertyInfo, "aggregationMethod");
								const path = this.getPropertyAttribute(oChart, oPropertyInfo, "path");
								const sName = this.getInternalChartNameFromPropertyNameAndKind(sKey, "aggregatable", oChart);
								const oMeasureSettings = {
									name: sName,
									label: oPropertyInfo.label,
									role: oPropertyInfo.role || "axis1"
								};

								if (aggregationMethod && path) {
									oMeasureSettings.analyticalInfo = {
										"propertyPath": path,
										"with": aggregationMethod
									};
								}

								const unitPath = this.getPropertyAttribute(oChart, oPropertyInfo, "unitPath");
								if (unitPath) {
									oMeasureSettings.unitBinding = unitPath;
								}

								const oMeasure = new Measure(oMeasureSettings);

								aVisibleMeasures.push(oMeasure);
								this._getChart(oChart).addMeasure(oMeasure);
								resolve();
							}); //this.getPropertyFromNameAndKind not used as the key is the name of the chart Item

						}));
					}

				});

				Promise.all(aColorPromises).then(() => {
					this._getChart(oChart).setVisibleDimensions(aVisibleDimensions);
					this._getChart(oChart).setVisibleMeasures(aVisibleMeasures);

					const aInResultDimensions = oChart.getDelegate().inResultDimensions; //TODO: Does this use internal name? If so, change _getPropertyInfosByName  below; Most likely not the case
					if (aInResultDimensions && aInResultDimensions instanceof Array && aInResultDimensions.length != 0) {

						const aInResultPromises = [];

						aInResultDimensions.forEach((sInResultDim) => {

							aInResultPromises.push(this._getPropertyInfosByName(sInResultDim, oChart).then((oPropertyInfo) => {
								const oDimension = ChartDelegate.innerDimensionFactory(oChart, undefined, oPropertyInfo);
								this._getChart(oChart).addDimension(oDimension);

								const sName = this.getInternalChartNameFromPropertyNameAndKind(oPropertyInfo.key, "groupable", oChart);
								this._getState(oChart).inResultDimensions.push(sName);

							}));

						});

						Promise.all(aInResultPromises).then(() => {
							this._getChart(oChart).setInResultDimensions(this._getState(oChart).inResultDimensions);
						});

					}

					this._updateColoring(oChart, aVisibleDimensions, aVisibleMeasures);
					this._updateSemanticalPattern(oChart);

					resolve();
				});
			});

		});
	};

	ChartDelegate.getInnerChart = function(oChart) {
		return this._getChart(oChart);
	};

	/**
	 * Prepares the internal vizFrame coloring for given chart Item.
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @param {sap.ui.mdc.chart.Item} oItem item to prepare coloring for
	 * @returns {Promise} resolved, once coloring is prepared
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 */
	ChartDelegate._prepareColoringForItem = function(oChart, oItem) {
		//COLORING
		return this._addCriticality(oChart, oItem).then(() => {
			this._getState(oItem.getParent()).aInSettings.push(oItem.getPropertyKey());

			if (oItem.getType() === "aggregatable") {

				//Uses excact Chart Item name
				this._getPropertyInfosByName(oItem.getPropertyKey(), oItem.getParent()).then((oPropertyInfo) => {
					this._getAdditionalColoringMeasuresForItem(oChart, oPropertyInfo).forEach((oMeasure) => {
						const oState = this._getState(oItem.getParent());
						if (oState.aColMeasures?.indexOf(oMeasure) == -1) {
							oState.aColMeasures.push(oMeasure);
						}
					});

				});
			}
		});

	};

	ChartDelegate._getAdditionalColoringMeasuresForItem = function(oChart, oPropertyInfo) {
		let aAdditional = [];

		const oDatapoint = this.getPropertyAttribute(oChart, oPropertyInfo, "datapoint");
		const oCriticality = oDatapoint?.criticality || null;

		if (oCriticality?.DynamicThresholds) {
			aAdditional = oCriticality.DynamicThresholds.usedMeasures;
		}

		return aAdditional;
	};

	/**
	 * Adds criticality to an item.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @param {sap.ui.mdc.chart.Item} oItem Item to add criticality to
	 * @returns {Promise} Resolved once criticality is added
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	ChartDelegate._addCriticality = function(oChart, oItem) {

		//Uses excact chart item name to idenfiy property
		return this._getPropertyInfosByName(oItem.getPropertyKey(), oItem.getParent()).then((oPropertyInfo) => {
			const oDatapoint = this.getPropertyAttribute(oChart, oPropertyInfo, "datapoint");
			const criticality = this.getPropertyAttribute(oChart, oPropertyInfo, "criticality");
			if (criticality || oDatapoint?.criticality) {
				const oColorings = this._getState(oItem.getParent()).oColorings || {
					Criticality: {
						DimensionValues: {},
						MeasureValues: {}
					}
				};

				const mChartCrit = {};

				if (oItem.getType() == "groupable") {
					const mCrit = criticality || [];

					for (const sKey in mCrit) {
						mChartCrit[sKey] = {
							Values: mCrit[sKey]
						};
					}

					const sDimName = this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "groupable", oItem.getParent());
					oColorings.Criticality.DimensionValues[sDimName] = mChartCrit;

				} else {
					const oDatapoint = this.getPropertyAttribute(oChart, oPropertyInfo, "datapoint");
					const mCrit = oDatapoint?.criticality || [];

					for (const sKey in mCrit) {
						mChartCrit[sKey] = mCrit[sKey];
					}

					const sMeasureName = this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "aggregatable", oItem.getParent());
					oColorings.Criticality.MeasureValues[sMeasureName] = mChartCrit;
				}

				const oState = this._getState(oItem.getParent());
				oState.oColorings = oColorings;
				this._setState(oItem.getParent(), oState);

			}

		});

	};

	/**
	 * Updates the coloring on the inner chart.
	 * @param {sap.ui.mdc.Chart} oChart chart
	 * @param {array} aVisibleDimensions Visible dimensions for inner chart
	 * @param {array} aVisibleMeasures Visible measures for inner chart
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.fe
	 */
	ChartDelegate._updateColoring = function(oChart, aVisibleDimensions, aVisibleMeasures) {
		const oInnerChart = this._getChart(oChart);
		const oState =  this._getState(oChart);
		const oTempColorings = jQuery.extend(true, {}, oState.oColorings);

		if (oTempColorings && oTempColorings.Criticality) {
			let oActiveColoring;

			//dimensions overrule
			for (let k = 0; k < aVisibleDimensions.length; k++) {
				const sVisibleDimension = aVisibleDimensions[k];
				if (oState.oColorings.Criticality.DimensionValues[sVisibleDimension]) {
					oActiveColoring = {
						coloring: "Criticality",
						parameters: {
							dimension: sVisibleDimension
						}
					};

					delete oTempColorings.Criticality.MeasureValues;
					break;
				}
			}

			if (!oActiveColoring) {
				delete oTempColorings.Criticality.DimensionValues;

				for (const sMeasure in oTempColorings.Criticality.MeasureValues) {

					if (aVisibleMeasures.indexOf(sMeasure) == -1) {
						delete oTempColorings.Criticality.MeasureValues[sMeasure];
					}
				}

				oActiveColoring = {
					coloring: "Criticality",
					parameters: {
						measure: aVisibleMeasures
					}
				};
			}

			if (oActiveColoring) {
				oInnerChart.setColorings(oTempColorings);
				oInnerChart.setActiveColoring(oActiveColoring);
			}
		}
	};

	/**
	 * Updates the semantical pattern for given measures.
	 *
	 * @param {sap.chart.Chart} oChart Inner chart
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 */
	ChartDelegate._updateSemanticalPattern = function(oChart) {

		const aVisibleMeasures = this._getChart(oChart).getVisibleMeasures();

		aVisibleMeasures.forEach((sVisibleMeasureName) => {
			//first draft only with semantic pattern
			const oPropertyInfo = this.getPropertyFromNameAndKind(sVisibleMeasureName, "aggregatable", oChart);

			if (!oPropertyInfo) {
				return;
			}

			const oDataPoint = this.getPropertyAttribute(oChart, oPropertyInfo, "datapoint");
			if (oDataPoint) {

				if (oDataPoint.targetValue || oDataPoint.foreCastValue) {
					const oActualMeasure = this._getChart(oChart).getMeasureByName(sVisibleMeasureName);

					oActualMeasure.setSemantics("actual");

					if (oDataPoint.targetValue != null) {
						const oReferenceMeasure = this._getChart(oChart).getMeasureByName(oDataPoint.targetValue);

						if (oReferenceMeasure) {
							oReferenceMeasure.setSemantics("reference");
						} else {
							Log.error("sap.ui.mdc.Chart: " + oDataPoint.targetValue + " is not a valid measure");
						}
					}

					if (oDataPoint.foreCastValue) {
						const oProjectionMeasure = this._getChart(oChart).getMeasureByName(oDataPoint.foreCastValue);

						if (oProjectionMeasure) {
							oProjectionMeasure.setSemantics("projected");
						} else {
							Log.error("sap.ui.comp.SmartChart: " + oDataPoint.ForecastValue.Path + " is not a valid measure");
						}
					}

					oActualMeasure.setSemanticallyRelatedMeasures({
						referenceValueMeasure: oDataPoint.targetValue,
						projectedValueMeasure: oDataPoint.foreCastValue
					});
				}
			}
		});

	};

	ChartDelegate.mMatchingIcon = {
		"bar": "sap-icon://horizontal-bar-chart",
		"bullet": "sap-icon://horizontal-bullet-chart",
		"bubble": "sap-icon://bubble-chart",
		"column": "sap-icon://vertical-bar-chart",
		"combination": "sap-icon://business-objects-experience",
		"dual_bar": "sap-icon://horizontal-bar-chart",
		"dual_column": "sap-icon://vertical-bar-chart",
		"dual_combination": "sap-icon://business-objects-experience",
		"dual_horizontal_combination": "sap-icon://business-objects-experience",
		"dual_horizontal_stacked_combination": "sap-icon://business-objects-experience",
		"dual_line": "sap-icon://line-chart",
		"dual_stacked_bar": "sap-icon://full-stacked-chart",
		"dual_stacked_column": "sap-icon://vertical-stacked-chart",
		"dual_stacked_combination": "sap-icon://business-objects-experience",
		"donut": "sap-icon://donut-chart",
		"heatmap": "sap-icon://heatmap-chart",
		"horizontal_stacked_combination": "sap-icon://business-objects-experience",
		"line": "sap-icon://line-chart",
		"pie": "sap-icon://pie-chart",
		"scatter": "sap-icon://scatter-chart",
		"stacked_bar": "sap-icon://full-stacked-chart",
		"stacked_column": "sap-icon://vertical-stacked-chart",
		"stacked_combination": "sap-icon://business-objects-experience",
		"treemap": "sap-icon://Chart-Tree-Map", // probably has to change
		"vertical_bullet": "sap-icon://vertical-bullet-chart",
		"100_dual_stacked_bar": "sap-icon://full-stacked-chart",
		"100_dual_stacked_column": "sap-icon://vertical-stacked-chart",
		"100_stacked_bar": "sap-icon://full-stacked-chart",
		"100_stacked_column": "sap-icon://full-stacked-column-chart",
		"waterfall": "sap-icon://vertical-waterfall-chart",
		"horizontal_waterfall": "sap-icon://horizontal-waterfall-chart"
	};

	ChartDelegate.getChartTypeInfo = function(oChart) {
		const sType = oChart.getChartType(),
			oMDCResourceBundle = Library.getResourceBundleFor("sap.ui.mdc"),
			oChartResourceBundle = Library.getResourceBundleFor("sap.chart");

		const mInfo = {
			icon: ChartDelegate.mMatchingIcon[sType],
			text: oMDCResourceBundle.getText("chart.CHART_TYPE_TOOLTIP", [
				oChartResourceBundle.getText("info/" + sType)
			])
		};

		return mInfo;
	};

	ChartDelegate.getAvailableChartTypes = function(oChart) {
		const aChartTypes = [];

		if (this._getChart(oChart)) {
			const aAvailableChartTypes = this._getChart(oChart).getAvailableChartTypes().available;
			const oChartResourceBundle = Library.getResourceBundleFor("sap.chart");

			for (let i = 0; i < aAvailableChartTypes.length; i++) {
				const sType = aAvailableChartTypes[i].chart;
				aChartTypes.push({
					key: sType,
					icon: ChartDelegate.mMatchingIcon[sType],
					text: oChartResourceBundle.getText("info/" + sType)
				});
			}
		}

		return aChartTypes;
	};

	ChartDelegate.getDrillStack = function(oChart) {
		//TODO: Generify the return values here for other chart frameworks
		const aDrillStack = Object.assign([], this._getChart(oChart).getDrillStack());

		aDrillStack.forEach((oStackEntry) => {
			// loop over nested dimension arrays -> give them the correct name for filtering
			oStackEntry.dimension = oStackEntry.dimension.map((sDimension) => {
				const oProperty = this.getPropertyFromNameAndKind(sDimension, "groupable", oChart);
				if (oProperty) {
					return oProperty.key;
				} else {
					Log.error("MDC Chart Delegate: Couldn't map chart dimension to groupable property: " + sDimension);
					return sDimension;
				}
			});
		});

		return aDrillStack;
	};

	ChartDelegate.getSortedDimensions = function(oChart) {
		return new Promise((resolve, reject) => {

			if (oChart.isPropertyHelperFinal()) {
				resolve(this._sortPropertyDimensions(oChart.getPropertyHelper().getProperties()));
			} else {
				oChart.finalizePropertyHelper().then(() => {
					resolve(this._sortPropertyDimensions(oChart.getPropertyHelper().getProperties()));
				});
			}
		});
	};

	ChartDelegate._sortPropertyDimensions = function(aProperties) {
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

	ChartDelegate.getDrillableItems = function(oChart) {
		const aFilteredItems = oChart.getItems().filter((oItem) => {
			return oItem.getType() === "groupable";
		});
		return aFilteredItems;
	};

	ChartDelegate.setChartType = function(oChart, sChartType) {
		this._getChart(oChart).setChartType(sChartType);
	};

	ChartDelegate.createInnerChartContent = function(oChart, fnCallbackDataLoaded) {

		return new Promise((resolve, reject) => {
			this._setChart(oChart, new Chart({
				id: oChart.getId() + "--innerChart",
				chartType: "column",
				height: "100%",
				width: "100%",
				isAnalytical: true,
				vizProperties: {
					plotArea: {
						scrollbar: { forceToShowInMobile: true }
					}
				}
			}));

			this._getChart(oChart).setCustomMessages({
				'NO_DATA': oChart.getNoDataText()
			});

			//Initialize empty; will get filled later on
			this._getState(oChart).inResultDimensions = [];

			this._getInnerStructure(oChart).removeStyleClass("sapUiMDCChartTempText");
			oChart.removeStyleClass("sapUiMDCChartTempTextOuter");
			oChart.addStyleClass("sapUiMDCChartGrid");

			const oState = this._getState(oChart);
			oState.aColMeasures = [];
			oState.aInSettings = [];
			this._setState(oChart, oState);

			//Create initial content during pre-processing
			this._createContentFromItems(oChart).then(() => {
				//Since zoom information is not yet available for sap.chart.Chart after data load is complete, do it on renderComplete instead
				//This is a workaround which is hopefully not needed in other chart libraries
				this._getChart(oChart).attachRenderComplete(() => {
					if (this._getState(oChart).toolbarUpdateRequested) {
						oChart._updateToolbar();
						this._getState(oChart).toolbarUpdateRequested = false;
					}
				});

				//this._getInnerStructure(oChart).removeAllContent();
				//this._getInnerStructure(oChart).setJustifyContent(FlexJustifyContent.Start);
				//this._getInnerStructure(oChart).setAlignItems(FlexAlignItems.Stretch);
				this._getInnerStructure(oChart).setContent(this._getChart(oChart));
				this._getInnerStructure(oChart).setShowNoDataStruct(false);

				oState.dataLoadedCallback = fnCallbackDataLoaded;

				this._setState(oChart, oState);
				let oBindingInfo;
				if (this._getBindingInfo) {
					oBindingInfo = this._getBindingInfo(oChart);
					Log.warning("mdc ChartDelegate", "calling the private delegate._getBindingInfo. Please make the function public!");
				} else {
					oBindingInfo = this.getBindingInfo(oChart);
				}
				this.updateBindingInfo(oChart, oBindingInfo); //Applies filters
				this._performInitialBind(oChart, oBindingInfo);

				resolve();
			});


		});

	};

	/**
	 * Performs the initial binding of the inner chart.
	 * It is used for the <code>vizFrame</code> to make sure that the inner chart is correctly initialized upon creation.
	 * Otherwise the chart will go into an error loop. <br><b>Note:</b> You must not override this setting.
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @param {object} oBindingInfo Binding info object
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 */
	ChartDelegate._performInitialBind = function(oChart, oBindingInfo) {
		if (oChart && oBindingInfo && this._getChart(oChart)) {
			this._addBindingListener(oBindingInfo, "dataReceived", this._onDataLoadComplete.bind(oChart));

			this._getChart(oChart).bindData(oBindingInfo);
			this._setBindingInfoForState(oChart, oBindingInfo);
			const oState = this._getState(oChart);
			oState.innerChartBound = true;

			this._checkForMeasureWarning(oChart);
		}
	};

	/**
	 * Requests a toolbar update once the inner chart is ready.
	 * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
	 *
	 * @private
	 */
	ChartDelegate.requestToolbarUpdate = function(oChart) {

		//Workaround as the sap.chart.Chart doesn't call renderComplete when no dimensions/measures are set up
		if (oChart.getItems().length === 0) {
			oChart._updateToolbar();
			return;
		}

		this._getState(oChart).toolbarUpdateRequested = true;
	};

	/**
	 * Creates and adds a dimension for the inner chart for a given chart item.
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @param {sap.ui.mdc.chart.Item} oItem Chart item to be added to the inner chart
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 */
	ChartDelegate.createInnerDimension = function(oChart, oItem) {
		//TODO: Check for Hierachy and Time
		//TODO: Check for role annotation

		this._getPropertyInfosByName(oItem.getPropertyKey(), oChart).then((oPropInfo) => {
			this._addInnerDimension(oChart, oItem, oPropInfo);
		});
	};

	/**
	 * Creates and adds a measure for the inner chart for given chart item.
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @param {sap.ui.mdc.chart.Item} oItem Chart item to be added to the inner chart
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 */
	ChartDelegate.createInnerMeasure = function(oChart, oItem) {

		this._getPropertyInfosByName(oItem.getPropertyKey(), oChart).then((oPropInfo) => {
			this._addInnerMeasure(oChart, oItem, oPropInfo);
		});
	};

	/**
	 * @private
	 */
	ChartDelegate._addInnerDimension = function(oChart, oChartItem, oPropertyInfo) {
		const oDimension = this.innerDimensionFactory(oChart, oChartItem, oPropertyInfo);
		this._getChart(oChart).addDimension(oDimension);
		if (oChart._bDrillDown) {
			this._getChart(oChart).drillDown(oDimension);
			oChart._bDrillDown = false;
		}
	};

    /**
     * @private
     */
    ChartDelegate.innerDimensionFactory = function (oChart, oItem, oPropertyInfo) {
		let oDimension;
		const sName = this.getInternalChartNameFromPropertyNameAndKind(oItem?.getPropertyKey() || oPropertyInfo.key, "groupable", oChart);

		let mSettings = {
			name: sName,
			role: oItem?.getRole() || oPropertyInfo.role,
			label: oItem?.getLabel() || oPropertyInfo.label,
			textFormatter: this.formatText.bind(oPropertyInfo)
		};

		const timeUnitType = this.getPropertyAttribute(oChart, oPropertyInfo, "timeUnitType");
		if (timeUnitType) {
			mSettings = merge(mSettings, {timeUnit: timeUnitType});
			oDimension = new TimeDimension(mSettings);
		} else {
			oDimension = new Dimension(mSettings);
		}

		const textProperty = this.getPropertyAttribute(oChart, oPropertyInfo, "textProperty");
		if (textProperty) {
			oDimension.setTextProperty(textProperty);
			oDimension.setDisplayText(true);
		}

        return oDimension;
    };

	/**
	 * @private
	 */
	ChartDelegate._addInnerMeasure = function(oChart, oItem, oPropertyInfo) {
		const oMeasure = this.innerMeasureFactory(oChart, oItem, oPropertyInfo);
		this._getChart(oChart).addMeasure(oMeasure);
	};


	/**
	 * Returns attributes of a configuration.
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @param {string} sPropertyInfoKey Key of the <code>propertyInfo</code> object that must be available in the configuration
	 * @param {string} sAttributeName Name of the attribute of the found configuration
	 * @returns {string|null} Value of the attribute
	 *
	 * This must be implemented by application delegates and has to provide the following attribute values listed below.
	 * {string} [aggregationMethod]
	 * 	The aggregation method used if the property is aggregatable
	 * {object} [datapoint]
	 *  Implementation-specific object containing information about the data point
	 * {object} [criticality]
	 *  Implementation-specific object containing information about the criticality
	 * {string} [textProperty]
	 * 	The text property used for the dimension
	 * {object} [textFormatter]
	 * 	The text formatter object that can be used to format the text property
	 * {object} [unitPath]
	 *  The name of the unit property that is be used to display and format measure values with a unit value on a <code>selectionDetails>/code> popover
	 * {string} [timeUnitType]
	 *  The <code>timeUnitType</code> type for a <code>TimeDimension</code>. If set, a <code>TimeDimension</code> is created instead of a <code>Dimension</code>.
	 *
	 * @public
	 */
	ChartDelegate.fetchConfigurationForVizchart = function(oChart, sPropertyInfoKey, sAttributeName) {
		return null;
	};

	/**
	 * Returns the value of the proertyInfo object attribute. Of not exist try to fetch the value via fetchConfigurationForVizchart.
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @param {object} oPropertyInfo PropertyInfo object
	 * @param {string} sAttributeName Name of the property attribute
	 * @returns {string|null} Value of the attribute
	 *
	 * @private
	 */
	ChartDelegate.getPropertyAttribute = function(oChart, oPropertyInfo, sAttributeName) {
		let value = oPropertyInfo.hasOwnProperty(sAttributeName) ? oPropertyInfo[sAttributeName] : null;
		if (!value) {
			value = this.fetchConfigurationForVizchart(oChart, oPropertyInfo.key, sAttributeName);
		}
		return value;
	};

	/**
	 * @private
	 */
	ChartDelegate.innerMeasureFactory = function(oChart, oItem, oPropertyInfo) {
		const aggregationMethod = this.getPropertyAttribute(oChart, oPropertyInfo, "aggregationMethod");
		const path = this.getPropertyAttribute(oChart, oPropertyInfo, "path");
		const oSettings = {
			name: this._getAggregatedMeasureNameForMDCItem(oItem), //aggregationMethod + oItem.getPropertyKey() under normal circumstances
			label: oItem?.getLabel() || oPropertyInfo.label,
			role: oItem?.getRole() || oPropertyInfo.role || "axis1"
		};

		if (aggregationMethod && path) {
			oSettings.analyticalInfo = {
				"propertyPath": path,
				"with": aggregationMethod
			};
		}

		const unitPath = this.getPropertyAttribute(oChart, oPropertyInfo, "unitPath");
		if (unitPath) {
			oSettings.unitBinding = unitPath;
		}

		return new Measure(oSettings);
	};

	ChartDelegate.rebind = function(oChart, oBindingInfo) {
		if (oChart && oBindingInfo && this._getChart(oChart)) {
			//TODO: bindData sap.chart.Chart specific and therefore needs to be changed to a general API.
			this._addBindingListener(oBindingInfo, "dataReceived", this._onDataLoadComplete.bind(oChart));

			//Will be enabled with future BLI
			//this._checkForMeasureWarning(oChart);
			this._getInnerStructure(oChart).setShowNoDataStruct(false);

			//TODO: Clarify why sap.ui.model.odata.v4.ODataListBinding.destroy this.bHasAnalyticalInfo is false
			//TODO: on second call, as it leads to issues when changing layout options within the settings dialog.
			//TODO: bHasAnalyticalInfo of inner chart binding should be true and in fact is true initially.
			if (oBindingInfo.binding) {
				oBindingInfo.binding.bHasAnalyticalInfo = true;
			}

			this._getChart(oChart).bindData(oBindingInfo);

			this._setBindingInfoForState(oChart, oBindingInfo);
			const oState = this._getState(oChart);
			oState.innerChartBound = true;
		}
	};

	//TODO: Write unit test for this!!
	ChartDelegate._checkForMeasureWarning = function(oChart) {

		if (!oChart.getNoData()) {
			return;
		}

		const aMeasures = oChart.getItems().filter((oItem) => {
			return oItem.getType() === "aggregatable";
		});

		if (aMeasures.length === 0) {
			this._getInnerStructure(oChart).setShowNoDataStruct(true);
			oChart.setBusy(false);
		} else {
			this._getInnerStructure(oChart).setShowNoDataStruct(false);
		}
	};

	ChartDelegate.getBindingInfo = function(oChart) {

		if (this._getBindingInfoFromState(oChart)) {
			return this._getBindingInfoFromState(oChart);
		}

		const oMetadataInfo = oChart.getDelegate().payload;
		const sEntitySetPath = "/" + oMetadataInfo.collectionName;
		const oBindingInfo = {
			path: sEntitySetPath
		};
		return oBindingInfo;
	};

	ChartDelegate.getInnerChartBound = function(oChart) {
		const oState = this._getState(oChart);
		return !!oState?.innerChartBound;
	};

	ChartDelegate.updateBindingInfo = function(oChart, oBindingInfo) {
		addSearchParameter(oChart, oBindingInfo);
		oBindingInfo.filters = this.getFilters(oChart);
		oBindingInfo.sorter = this.getSorters(oChart);
	};

	function addSearchParameter(oChart, oBindingInfo) {
		const oFilter = Element.getElementById(oChart.getFilter());
		if (!oFilter) {
			return;
		}

		const mConditions = oFilter.getConditions();
		// get the basic search
		const sSearchText = oFilter.getSearch instanceof Function ? oFilter.getSearch() : "";

		if (mConditions) {
			const sParameterPath = DelegateUtil.getParametersInfo(oFilter, mConditions);
			if (sParameterPath) {
				oBindingInfo.path = sParameterPath;
			}
		}

		if (!oBindingInfo.parameters) {
			oBindingInfo.parameters = {};
		}

		oBindingInfo.parameters["$search"] = sSearchText || undefined;
	}

	/**
	 * Gets currently available sorters based on the visualized data.
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @returns {array} Array containing available sorters
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
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

			//TODO: Check for inResultDimensions
			const oSorter = this._getSorterForItem(oItem, oSortProperty);

			if (aSorters) {
				aSorters.push(oSorter);
			} else {
				aSorters = [
					oSorter
				]; //[] has special meaning in sorting
			}
		});

		return aSorters;

	};

	ChartDelegate._getAggregatedMeasureNameForMDCItem = function(oItem) {
		return this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "aggregatable", oItem.getParent());
	};

	ChartDelegate.getInternalChartNameFromPropertyNameAndKind = function(sName, sKind, oChart) {
		return sName;
	};

	ChartDelegate.getPropertyFromNameAndKind = function(sName, sKind, oChart) {
		return oChart.getPropertyHelper().getProperty(sName);
	};

	ChartDelegate.setChartTooltipVisibility = function(oChart, bFlag) {

		if (this._getChart(oChart)) {
			if (bFlag) {
				if (!this._getState(oChart).vizTooltip) {

					const oState = this._getState(oChart);
					oState.vizTooltip = new VizTooltip();
					this._setState(oChart, oState);
				}
				// Make this dynamic for setter calls
				//this._vizTooltip.connect(this._oInnerChart.getVizUid());
				this._getState(oChart).vizTooltip.connect(this._getChart(oChart).getVizUid());
			} else if (this._getState(oChart).vizTooltip) {
				this._getState(oChart).vizTooltip.destroy();
			}
		} else {
			Log.error("Trying to set chart tooltip while inner chart was not yet initialized");
		}
	};

	/**
	 *
	 * Delegate specific part
	 *
	 */
	ChartDelegate._loadChart = function() {

		return new Promise((resolve) => {
			const aNotLoadedModulePaths = ['sap/chart/Chart',
				'sap/chart/data/Dimension',
				'sap/chart/data/TimeDimension',
				'sap/chart/data/Measure',
				'sap/viz/ui5/controls/VizTooltip'
			];

			function onModulesLoadedSuccess(fnChart, fnDimension, fnTimeDimension, fnMeasure, fnVizTooltip) {
				Chart = fnChart;
				Dimension = fnDimension;
				TimeDimension = fnTimeDimension;
				Measure = fnMeasure;
				VizTooltip = fnVizTooltip;

				resolve();
			}

			Library.load({name: "sap.viz"}).then(() => {
				sap.ui.require(aNotLoadedModulePaths, onModulesLoadedSuccess);
			});

		});

	};

	/**
	 * Gets the <code>PropertyHelper</code> used for the chart delegate.
	 * @returns {Promise} <code>Promise</code> with the property helper reference
	 */
	ChartDelegate.getPropertyHelperClass = function() {
		return PropertyHelper;
	};

    /**
     * This allows formatting for axis labels of the inner sap.chart.Chart.
     * Note: As the inner chart has no association to the propertyInfo, <code>this</code> will be bound to the propertyInfo object when calling this method.
     * @param {string} sKey Key value of the dimension
     * @param {string} sDesc Description provided by the metadata
     * @returns {string} Label which should be shown on the chart axis
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.formatText = function(sKey, sDesc) {
        return sKey;
    };

	ChartDelegate.setNoDataText = function(oChart, sText) {
		this._getChart(oChart).setCustomMessages({
			'NO_DATA': sText
		});
	};

	ChartDelegate.showOverlay = function(oChart, bShow) {
		if (this._getInnerStructure(oChart)) {
			this._getInnerStructure(oChart).showOverlay(bShow);
		}
	};

	//Gets internal property infos by excact property name
	ChartDelegate._getPropertyInfosByName = function(sName, oChart) {
		return oChart._getPropertyByNameAsync(sName);
	};


	ChartDelegate._getModel = function(oTable) {
		const oMetadataInfo = oTable.getDelegate().payload;
		return oTable.getModel(oMetadataInfo.model);
	};

	ChartDelegate._addBindingListener = function(oBindingInfo, sEventName, fHandler) {
		if (!oBindingInfo.events) {
			oBindingInfo.events = {};
		}

		if (!oBindingInfo.events[sEventName]) {
			oBindingInfo.events[sEventName] = fHandler;
		} else {
			// Wrap the event handler of the other party to add our handler.
			const fOriginalHandler = oBindingInfo.events[sEventName];
			oBindingInfo.events[sEventName] = function() {
				fHandler.apply(this, arguments);
				fOriginalHandler.apply(this, arguments);
			};
		}
	};

	//This is bound to chart
	ChartDelegate._onDataLoadComplete = function(mEventParams) {
		const oNoDataStruct = this.getControlDelegate()._getInnerStructure(this);

		if (this.getNoData()) {
			if (mEventParams.getSource() && mEventParams.getSource().getCurrentContexts().length === 0) {
				//var MDCRb = Library.getResourceBundleFor("sap.ui.mdc");
				//oNoDataStruct.setNoDataContent(new IllustratedMessage({title: this.getNoDataText(), description: MDCRb.getText("chart.NO_DATA_WITH_FILTERBAR"), illustrationType: mLib.IllustratedMessageType.BeforeSearch}));
				oNoDataStruct.setShowNoDataStruct(true);
			} else {
				oNoDataStruct.setShowNoDataStruct(false);
			}
		}

		this._innerChartDataLoadComplete(mEventParams);

		const oInnerChart = this.getControlDelegate()._getChart(this);
		this._announceUpdate(this.getChartType(), this.getHeader(), oInnerChart.getVisibleDimensions().length, oInnerChart.getVisibleMeasures().length);
	};

	return ChartDelegate;
});