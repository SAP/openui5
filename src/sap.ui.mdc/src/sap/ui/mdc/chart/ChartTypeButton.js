/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/m/Button", "sap/m/ButtonRenderer", "sap/ui/base/ManagedObjectObserver"
], function(Button, ButtonRenderer, ManagedObjectObserver) {
	"use strict";

	var ResponsivePopover, List, Bar, SearchField, StandardListItem, InvisibleText, Device, oRb;

	var ChartTypeButton = Button.extend("sap.ui.mdc.chart.ChartTypeButton", {
		constructor: function(oChart) {
			this.oChartModel = oChart.getManagedObjectModel();
			var mSettings = {
				type: "Transparent",
				press: function(oEvent) {
					this.displayChartTypes(oEvent.getSource(), oChart);
				}.bind(this),
				id: oChart.getId() + "-btnChartType",
				icon: '{$chart>/getTypeInfo/icon}',
				tooltip: '{$chart>/getTypeInfo/text}'
			};

			this.oChart = oChart;
			Button.apply(this, [
				mSettings
			]);
			this.setModel(this.oChartModel, "$chart");

			this._oObserver = new ManagedObjectObserver(function() {
				this.oChartModel.checkUpdate(true);
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
		renderer: ButtonRenderer.render
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

	ChartTypeButton.prototype.displayChartTypes = function(oButton, oChart) {
		if (!oChart || !oButton) {
			return;
		}

		if (this.oPopover) {
			return this.oPopover.openBy(oButton);
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
			this.oPopover = this._createPopover(oButton, oChart);
			return this.oPopover.openBy(oButton);
		}.bind(this));
	};

	ChartTypeButton.prototype._createPopover = function(oButton, oChart) {
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
									var aChanges = [];
									aChanges.push(ChartFlex["setChartType"].changeHandler.createChange({
										control: oChart,
										chartType: oObj.key
									}));
									FlexUtil.handleChanges(aChanges, oChart);
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
			this._triggerSearchInPopover(oEvent, oList);
		});
		oSubHeader.addContentRight(oSearchField);

		var oPopover = new ResponsivePopover({
			placement: "Bottom",
			subHeader: oSubHeader,
			contentWidth: "25rem"
		});

		oPopover.setModel(this.oChartModel, "$chart");

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

		return oPopover;
	};

	ChartTypeButton.prototype.exit = function() {
		Button.prototype.exit.apply(this, arguments);
		if (this.oPopover) {
			this.oPopover.destroy();
			this.oPopover = null;
		}
	};

	return ChartTypeButton;

}, true);
