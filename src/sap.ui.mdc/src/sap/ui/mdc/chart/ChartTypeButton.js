/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/OverflowToolbarButton",
	"sap/m/ButtonRenderer",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/m/IllustratedMessage",
	"sap/m/library",
	"sap/base/util/merge",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Lib"
], function(OverflowToolbarButton, ButtonRenderer, ManagedObjectObserver, CoreLibrary, mobileLibrary, IllustratedMessage, MLib, merge, Filter, JSONModel, Lib) {
	"use strict";

	// shortcut for sap.m.PlacementType
	const PlacementType = mobileLibrary.PlacementType;

	const HasPopup = CoreLibrary.aria.HasPopup;
	let ResponsivePopover, List, SearchField, StandardListItem, InvisibleText, Device, oRb;

	const ChartTypeButton = OverflowToolbarButton.extend("sap.ui.mdc.chart.ChartTypeButton", {
		metadata: {
			library: "sap.ui.mdc"
		},
		constructor: function(oChart, mSettings) {

			if (!oChart) {
				OverflowToolbarButton.apply(this);
				return;
			}

			this.oChartModel = oChart.getManagedObjectModel();
			mSettings = merge(mSettings, {
				type: "Transparent",
				press: function(oEvent) {
					this.displayChartTypes(oEvent.getSource(), oChart);
				}.bind(this),
				id: oChart.getId() + "-btnChartType",
				icon: '{$chart>/ChartTypeInfo/icon}',
				tooltip: '{$chart>/ChartTypeInfo/text}',
				text: '{$chart>/ChartTypeInfo/text}',
				ariaHasPopup: HasPopup.ListBox
			});
			this.oChart = oChart;
			OverflowToolbarButton.apply(this, [
				mSettings
			]);

			const oModel = new JSONModel();
			oModel.setProperty("/ChartTypeInfo", this.oChart.getChartTypeInfo());
			this.setModel(oModel, "$chart");

			this._oObserver = new ManagedObjectObserver(function(oChange) {
				if (oChange.name === "chartType") {
					oModel.setProperty("/ChartTypeInfo", this.oChart.getChartTypeInfo());
				}
			}.bind(this));
			this._oObserver.observe(this.oChart, {
				aggregations: [
					"items"
				],
				properties: [
					"chartType"
				]
			});

		},
		renderer: ButtonRenderer
	});

	ChartTypeButton.mMatchingIcon = {
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

	/**
     * Shows popover to select chart type
     * @param oButton button opening the popover
     * @param oChart the chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
	ChartTypeButton.prototype.displayChartTypes = function(oButton, oChart) {
		if (!oChart || !oButton) {
			return;
		}

		if (!this.oReadyPromise) {
			this.oReadyPromise = new Promise(function(resolve) {
				if (ResponsivePopover) {
					resolve(true);
				} else {
					sap.ui.require([
						"sap/m/ResponsivePopover", "sap/m/List", "sap/m/SearchField", "sap/m/StandardListItem", "sap/ui/core/InvisibleText", "sap/ui/Device"
					], function(ResponsivePopoverLoaded, ListLoaded, SearchFieldLoaded, StandardListItemLoaded, InvisibleTextLoaded, DeviceLoaded) {
						ResponsivePopover = ResponsivePopoverLoaded;
						List = ListLoaded;
						SearchField = SearchFieldLoaded;
						StandardListItem = StandardListItemLoaded;
						InvisibleText = InvisibleTextLoaded;
						Device = DeviceLoaded;
						if (!oRb) {
							Lib.getResourceBundleFor("sap.ui.mdc")/* LFUI5: For asynchronous loading, load the lib asynchronously and on promise resolution get the resource bundle. */.then(function(oRbLoaded) {
								oRb = oRbLoaded;
								resolve(true);
							});
						} else {
							resolve(true);
						}

					});
				}
			});
		}

		this.oReadyPromise.then(function() {
			if (!this.oPopover){
				this.oPopover = this._createPopover(oChart);

				this.oPopover.attachAfterClose(function(){
					this.oPopover.destroy();
					delete this.oPopover;
				}.bind(this));

				return this.oPopover.openBy(oButton);

			} else if (this.oPopover) {
				this.oPopover.close();
			}
		}.bind(this));
	};

	/**
	 * Creates the popover
	 * @param {sap.ui.mdc.Chart} oChart chart
     * @returns {sap.m.ResponsivePopover} the instance of the created popover
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	ChartTypeButton.prototype._createPopover = function(oChart) {
		const oItemTemplate = new StandardListItem({
			title: "{$chartTypes>text}",
			icon: "{$chartTypes>icon}",
			selected: "{$chartTypes>selected}"
		});

		const oList = new List({
			mode: "SingleSelectMaster",
			noData: new IllustratedMessage({title: oRb.getText("chart.NO_CHART_TYPES_AVAILABLE"), description: oRb.getText("chart.NO_CHART_TYPES_AVAILABLE_ACTION"),  illustrationType: MLib.IllustratedMessageType.AddDimensions}),
			items: {
				path: "$chartTypes>/AvailableChartTypes",
				template: oItemTemplate
			},
			selectionChange: function(oEvent) {
				//TODO: Implement Chart Type switch
				if (oEvent && oEvent.mParameters && oEvent.mParameters.listItem) {
					const oBinding = oEvent.mParameters.listItem.getBinding("title");
					if (oBinding) {
						const oCtx = oBinding.getContext();
						if (oCtx) {
							const oObj = oCtx.getObject();
							if (oObj && oObj.key) {
								sap.ui.require([
									"sap/ui/mdc/flexibility/Chart.flexibility"
								], function(ChartFlex) {

									oChart.getEngine().createChanges({
										control: oChart,
										key: "Type",
										state: {
											properties: {
												chartType: oObj.key
											}
										}
									}).then(function(vResult) {
										oChart.getControlDelegate().requestToolbarUpdate(oChart);
									});

								});
							}
						}
					}
				}

				oPopover.close();
			}
		});

		const oSearchField = new SearchField({
			placeholder: oRb.getText("chart.CHART_TYPE_SEARCH"),
			liveChange: function(oEvent) {
				if (oChart){
					this._triggerSearchInPopover(oEvent, oList);
				}
			}.bind(this)
		});

		const oPopover = new ResponsivePopover({
			id: oChart.getId() + "-btnChartTypePopover",
			placement: PlacementType.VerticalPreferredBottom,
			contentWidth: "25rem"
		});

		// The ResponsivePopover only supports controls with sap.m.IBar interface, which is not the case when we place a SearchField as subHeader.
		// On a Desktop we do not have any problem (the ResponsivePopoverRender is used in this case).
		// On a Phone the Dialog renderer is used and the subHeader will not work. So we add the search field in this case into the content.
		if (!Device.system.phone) {
			oPopover.setSubHeader(oSearchField);
		} else {
			oPopover.addContent(oSearchField);
		}

		const oModel = new JSONModel();
		oModel.setProperty("/AvailableChartTypes", this.oChart.getAvailableChartTypes());
		oPopover.setModel(oModel, "$chartTypes");

		//Show header only in mobile scenarios
		//still support screen reader while on desktops.
		if (Device.system.desktop) {
			const oInvText = new InvisibleText({
				text: oRb.getText("chart.CHART_TYPELIST_TEXT")
			});
			oPopover.setShowHeader(false);
			oPopover.addContent(oInvText);
			oPopover.addAriaLabelledBy(oInvText);
		} else {
			oPopover.setTitle(oRb.getText("chart.CHART_TYPELIST_TEXT"));
		}

		oPopover.addContent(oList);

		if (oList.getItems().length < 7) {
			oSearchField.setVisible(false);
		}

		return oPopover;
	};

	/**
	 * Triggers a search in the drill-down popover
	 *
	 * @param {object} oEvent The event arguments
	 * @param {sap.m.List} oList The list to search in
	 * @private
	 */
	ChartTypeButton.prototype._triggerSearchInPopover = function(oEvent, oList) {

		if (!oEvent || !oList) {
			return;
		}

		const sSearchValue = oEvent.getParameter("newValue");
		let oSearchFilter = [];
		if (sSearchValue) {
			oSearchFilter = new Filter("text", "Contains", sSearchValue);
		}
		oList.getBinding("items").filter(oSearchFilter);
	};

    /**
     * Closes the popover to select chart type
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
	ChartTypeButton.prototype.exit = function() {
		OverflowToolbarButton.prototype.exit.apply(this, arguments);
		if (this.oPopover) {
			this.oPopover.destroy();
			this.oPopover = null;
		}
	};

	return ChartTypeButton;
});
