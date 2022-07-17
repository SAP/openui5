/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/OverflowToolbarButton", "sap/m/ButtonRenderer", "sap/ui/base/ManagedObjectObserver", "sap/ui/core/library", "sap/m/library"
], function(OverflowToolbarButton, ButtonRenderer, ManagedObjectObserver, CoreLibrary, mobileLibrary) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	var HasPopup = CoreLibrary.aria.HasPopup;
	var ResponsivePopover, List, Bar, SearchField, StandardListItem, InvisibleText, Device, oRb;

	var ChartTypeButton = OverflowToolbarButton.extend("sap.ui.mdc.chart.ChartTypeButton", {
		metadata: {
			library: "sap.ui.mdc"
		},
		constructor: function(oMDCChart) {

			if (!oMDCChart) {
				OverflowToolbarButton.apply(this);
				return;
			}

			this.oMDCChartModel = oMDCChart.getManagedObjectModel();
			var mSettings = {
				type: "Transparent",
				press: function(oEvent) {
					this.displayChartTypes(oEvent.getSource(), oMDCChart);
				}.bind(this),
				id: oMDCChart.getId() + "-btnChartType",
				icon: '{$chart>/getChartTypeInfo/icon}',
				tooltip: '{$chart>/getChartTypeInfo/text}',
				text: '{$chart>/getChartTypeInfo/text}',
				ariaHasPopup: HasPopup.ListBox
			};
			this.oMDCChart = oMDCChart;
			OverflowToolbarButton.apply(this, [
				mSettings
			]);
			this.setModel(this.oMDCChartModel, "$chart");

			this._oObserver = new ManagedObjectObserver(function() {
				this.oMDCChartModel.checkUpdate(true);
			}.bind(this));
			this._oObserver.observe(this.oMDCChart, {
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
	 * @param oMDCChart the inner chart
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted Fiori Elements, sap.ui.mdc
	 */
	ChartTypeButton.prototype.displayChartTypes = function(oButton, oMDCChart) {
		if (!oMDCChart || !oButton) {
			return;
		}

		if (!this.oReadyPromise) {
			this.oReadyPromise = new Promise(function(resolve) {
				if (ResponsivePopover) {
					resolve(true);
				} else {
					sap.ui.require([
						"sap/m/ResponsivePopover", "sap/m/List", "sap/m/Bar", "sap/m/SearchField", "sap/m/StandardListItem", "sap/ui/core/InvisibleText", "sap/ui/Device"
					], function(ResponsivePopoverLoaded, ListLoaded, BarLoaded, SearchFieldLoaded, StandardListItemLoaded, InvisibleTextLoaded, DeviceLoaded) {
						ResponsivePopover = ResponsivePopoverLoaded;
						List = ListLoaded;
						Bar = BarLoaded;
						SearchField = SearchFieldLoaded;
						StandardListItem = StandardListItemLoaded;
						InvisibleText = InvisibleTextLoaded;
						Device = DeviceLoaded;
						if (!oRb) {
							sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc", true).then(function(oRbLoaded) {
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
				this.oPopover = this._createPopover(oButton, oMDCChart);
				this.oPopover.attachAfterClose(function(){
					this.oPopover.destroy();
					delete this.oPopover;
				}.bind(this));
				return this.oPopover.openBy(oButton);
			}
		}.bind(this));
	};

	/**
	 * Creates the popover
	 * @param oButton button opening the popover
	 * @param oMDCChart inner chart
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	ChartTypeButton.prototype._createPopover = function(oButton, oMDCChart) {
		var oItemTemplate = new StandardListItem({
			title: "{$chart>text}",
			icon: "{$chart>icon}",
			selected: "{$chart>selected}"
		});

		var oList = new List({
			mode: "SingleSelectMaster",
			items: {
				path: "$chart>/getAvailableChartTypes",
				template: oItemTemplate
			},
			selectionChange: function(oEvent) {
				//TODO: Implement Chart Type switch
				if (oEvent && oEvent.mParameters && oEvent.mParameters.listItem) {
					var oBinding = oEvent.mParameters.listItem.getBinding("title");
					if (oBinding) {
						var oCtx = oBinding.getContext();
						if (oCtx) {
							var oObj = oCtx.getObject();
							if (oObj && oObj.key) {
								sap.ui.require([
									"sap/ui/mdc/p13n/FlexUtil", "sap/ui/mdc/flexibility/Chart.flexibility"
								], function(FlexUtil,ChartFlex) {
									//var aChanges = [];

									oMDCChart.getEngine().createChanges({
										control: oMDCChart,
										key: "Type",
										state: {
											type: oObj.key
										}
									});
									/*
									aChanges.push(ChartFlex["setChartType"].changeHandler.createChange({
										control: oMDCChart,
										chartType: oObj.key
									}));
									FlexUtil.handleChanges(aChanges);*/
								});
							}
						}
					}
				}

				oPopover.close();
			}
		});

		var oSubHeader = new Bar();
		var oSearchField = new SearchField({
			placeholder: oRb.getText("chart.CHART_TYPE_SEARCH")
		});
		oSearchField.attachLiveChange(function(oEvent) {
			if (oMDCChart){
				this._triggerSearchInPopover(oEvent, oList);
			}
		}.bind(this));
		oSubHeader.addContentRight(oSearchField);

		var oPopover = new ResponsivePopover({
			id: oMDCChart.getId() + "-btnChartTypePopover",
			placement: PlacementType.VerticalPreferredBottom,
			subHeader: oSubHeader,
			contentWidth: "25rem"
		});

		oPopover.setModel(this.oMDCChartModel, "$chart");

		//Show header only in mobile scenarios
		//still support screen reader while on desktops.
		if (Device.system.desktop) {
			var oInvText = new InvisibleText({
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
			oSubHeader.setVisible(false);
		}

		/*
		oPopover.attachAfterClose(function(oEvent) {
			oPopover.destroy();
		});*/

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

		var parameters, i, sTitle, sTooltip, sValue, aItems;

		if (!oEvent || !oList) {
			return;
		}

		parameters = oEvent.getParameters();
		if (!parameters) {
			return;
		}

		sValue = parameters.newValue ? parameters.newValue.toLowerCase() : "";

		aItems = oList.getItems();
		for (i = 0; i < aItems.length; i++) {

			sTooltip = aItems[i].getTooltip();
			sTitle = aItems[i].getTitle();

			if ((sTitle && (sTitle.toLowerCase().indexOf(sValue) > -1)) || (sTooltip && (sTooltip.toLowerCase().indexOf(sValue) > -1))) {
				aItems[i].setVisible(true);
			} else {
				aItems[i].setVisible(false);
			}
		}
	};

	/**
	 * Closes the popover to select chart type
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted Fiori Elements, sap.ui.mdc
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
