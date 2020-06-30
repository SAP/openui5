/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/library",
	"../ActionToolbar",
	"sap/m/Title",
	"sap/m/OverflowToolbarButton",
	"sap/m/OverflowToolbarToggleButton",
	"sap/ui/mdc/chart/ChartTypeButton",
	"sap/ui/mdc/chart/ChartSettings"
], function(
	MDCLib,
	ActionToolbar,
	Title,
	OverflowButton,
	OverflowToggleButton,
	ChartTypeButton,
	ChartSettings
) {
	"use strict";

	/**
	 * Toolbar helper class for sap.ui.mdc.Chart.
	 *
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.60
	 * @alias sap.ui.mdc.chart.ToolbarHandler
	 */
	var MDCRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
	var ToolbarHandler = {

		/**
		 *
		 * Creates a new toolbar for the mdc.Chart based on actions
		 */
		createToolbar: function(oChart, aUserActions) {
			aUserActions = aUserActions || [];

			if (!oChart.getAggregation("_toolbar")) {
				var oToolbar = new ActionToolbar(oChart.getId() + "--toolbar", {
					design: "Transparent",
					begin: [
						new Title(oChart.getId() + "-title", {
							text: oChart.getHeader()
						})
					],
					actions: aUserActions
				});

				oChart.setAggregation("_toolbar", oToolbar);
				this.updateToolbar(oChart);
			}
		},

		/**
		 *
		 * Updates the mdc.Chart toolbar content
		 */
		updateToolbar: function(oChart) {
			var oToolbar = oChart.getAggregation("_toolbar");

			if (!oToolbar) {
				return;
			}

			oToolbar.destroyEnd();

			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.ZoomInOut)) {
				var oInnerChart = oChart.getAggregation("_chart"),
					oZoomInButton,
					oZoomOutButton;

				oZoomInButton = new OverflowButton({
					tooltip: MDCRb.getText("chart.TOOLBAR_ZOOM_IN"),
					icon: "sap-icon://zoom-in",
					enabled: "{= ${$mdcChart>/_chart/getZoomInfo/enabled} && ${$mdcChart>/_chart/getZoomInfo/currentZoomLevel} < 1}",
					press: function onZoomInButtonPressed(oControlEvent) {
						this.handleZoomIn(oInnerChart, oZoomInButton, oZoomOutButton);
					}.bind(this)
				});

				oZoomOutButton = new OverflowButton({
					tooltip: MDCRb.getText("chart.TOOLBAR_ZOOM_OUT"),
					icon: "sap-icon://zoom-out",
					enabled: "{= ${$mdcChart>/_chart/getZoomInfo/enabled} && ${$mdcChart>/_chart/getZoomInfo/currentZoomLevel} > 0}",
					press: function onZoomOutButtonPressed(oControlEvent) {
						this.handleZoomOut(oInnerChart, oZoomInButton, oZoomOutButton);
					}.bind(this)
				});

				oToolbar.addEnd(oZoomInButton);
				oToolbar.addEnd(oZoomOutButton);

				if (oInnerChart) {
					oInnerChart.attachRenderComplete(function onInnerChartRenderCompleted(oControlEvent) {
						var oZoomInfo = oInnerChart.getZoomInfo();
						this.handleInnerChartRenderCompleted(oZoomInfo, oZoomInButton, oZoomOutButton);
					}, this);
				}
			}


			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.DrillDownUp) < 0) {
				oChart._oDrillDownBtn = new OverflowButton(oChart.getId() + "-drillDown", {
					icon: "sap-icon://drill-down",
					tooltip: MDCRb.getText("chart.CHART_DRILLDOWN_TITLE"),
					press: [
						oChart._showDrillDown, oChart
					]
				});
				oToolbar.addEnd(oChart._oDrillDownBtn);
			}

			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.Legend) < 0) {
				oToolbar.addEnd(new OverflowToggleButton({
					type: "Transparent",
					text: MDCRb.getText("chart.LEGENDBTN_TEXT"),
					tooltip: MDCRb.getText("chart.LEGENDBTN_TOOLTIP"),
					icon: "sap-icon://legend",
					pressed: "{$mdcChart>/legendVisible}"
				}));
			}

			//Check p13n mode property on the chart and enable only desired buttons
			var aP13nMode = oChart.getP13nMode() || [];

			if (aP13nMode.indexOf("Item") > -1) {
				oToolbar.addEnd(new OverflowButton(oChart.getId() + "-chart_settings", {
					icon: "sap-icon://action-settings",//TODO the right icon for P13n chart dialog
					tooltip: MDCRb.getText('chart.PERSONALIZATION_DIALOG_TITLE'),
					press: function(oEvent) {
						var oSource = oEvent.getSource();
						oChart._getPropertyData().then(function(aProperties) {
							ChartSettings.showPanel(oChart, "Chart", oSource, aProperties);
						});
					}
				}));
			}

			if (aP13nMode.indexOf("Sort") > -1) {
				oToolbar.addEnd(new OverflowButton(oChart.getId() + "-sort_settings", {
					icon: "sap-icon://sort",
					tooltip: MDCRb.getText('sort.PERSONALIZATION_DIALOG_TITLE'),
					press: function(oEvent) {
						var oSource = oEvent.getSource();
						oChart._getPropertyData().then(function(aProperties) {
							ChartSettings.showPanel(oChart, "Sort", oSource, aProperties);
						});
					}
				}));
			}

			if (aP13nMode.indexOf("Type") > -1) {
				oToolbar.addEnd(new ChartTypeButton(oChart));
			}
		},

		handleInnerChartRenderCompleted: function(oZoomInfo, oZoomInButton, oZoomOutButton) {
			this.toggleZoomButtonsEnabledState(oZoomInfo, oZoomInButton, oZoomOutButton);
		},

		handleZoomIn: function(oInnerChart, oZoomInButton, oZoomOutButton) {
			oInnerChart.zoom({ direction: "in" });
			var oZoomInfo = oInnerChart.getZoomInfo();
			this.toggleZoomButtonsEnabledState(oZoomInfo, oZoomInButton, oZoomOutButton);
		},

		handleZoomOut: function(oInnerChart, oZoomInButton, oZoomOutButton) {
			oInnerChart.zoom({ direction: "out" });
			var oZoomInfo = oInnerChart.getZoomInfo();
			this.toggleZoomButtonsEnabledState(oZoomInfo, oZoomInButton, oZoomOutButton);
		},

		toggleZoomButtonsEnabledState: function(oZoomInfo, oZoomInButton, oZoomOutButton) {
			var vZoomLevel = oZoomInfo.currentZoomLevel;

			// zooming isn't applicable, perhaps all data points are plotted
			if (vZoomLevel == null) { // zoom level is null or undefined
				oZoomInButton.setEnabled(false);
				oZoomOutButton.setEnabled(false);
				return;
			}

			// zoomed out all the way
			if (vZoomLevel === 0) {
				oZoomInButton.setEnabled(true);
				oZoomOutButton.setEnabled(false);

				// if the zoom out button is disabled and it currently has focus,
				// set the focus to the zoom in button
				if (oZoomOutButton.getFocusDomRef() === document.activeElement) {
					oZoomInButton.focus();
				}

				return;
			}

			// zoomed in all the way
			if (vZoomLevel === 1) {
				oZoomOutButton.setEnabled(true);
				oZoomInButton.setEnabled(false);

				// if the zoom in button is disabled and it currently has focus,
				// set the focus to the zoom out button
				if (oZoomInButton.getFocusDomRef() === document.activeElement) {
					oZoomOutButton.focus();
				}

				return;
			}

			// the zoom level is between 0 and 1
			oZoomInButton.setEnabled(true);
			oZoomOutButton.setEnabled(true);
		}
	};

	return ToolbarHandler;
});
