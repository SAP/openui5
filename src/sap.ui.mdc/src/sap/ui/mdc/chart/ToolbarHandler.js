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
	"sap/ui/mdc/chart/ChartSettings",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/ui/core/ShortcutHintsMixin"
], function(
	MDCLib,
	ActionToolbar,
	Title,
	OverflowButton,
	OverflowToggleButton,
	ChartTypeButton,
	ChartSettings,
	CoreLibrary,
	Device,
	ShortcutHintsMixin
) {
	"use strict";

	var HasPopup = CoreLibrary.aria.HasPopup;

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
		createToolbar: function(oChart, aUserActions, bInitNotBound) {
			aUserActions = aUserActions || [];

			if (!oChart.getAggregation("_toolbar")) {
				var oToolbar = new ActionToolbar(oChart.getId() + "--toolbar", {
					design: "Transparent",
					begin: [
						new Title(oChart.getId() + "-title", {
							text: oChart.getHeader()
						})
					]
				});

				oChart.setAggregation("_toolbar", oToolbar);

				this.initializeToolbarNotBound(oChart);
				this.addActions(oToolbar, aUserActions); //Add actions after chart content for correct sorting
				if (!bInitNotBound){
					this.updateToolbar(oChart);
				}
			}
		},

		addActions: function(oToolbar, aActions) {
			aActions.forEach(function(action) {
				oToolbar.addAction(action);
			});
		},

		initializeToolbarNotBound: function(oChart) {
			var oToolbar = oChart.getAggregation("_toolbar");

			if (!oToolbar) {
				return;
			}

			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.ZoomInOut)) {

				this._oZoomInButton = new OverflowButton({
					tooltip: MDCRb.getText("chart.TOOLBAR_ZOOM_IN"),
					icon: "sap-icon://zoom-in",
					enabled: "{= ${$mdcChart>/_chart/getZoomInfo/enabled} && ${$mdcChart>/_chart/getZoomInfo/currentZoomLevel} < 1}"
				});

				this._oZoomOutButton = new OverflowButton({
					tooltip: MDCRb.getText("chart.TOOLBAR_ZOOM_OUT"),
					icon: "sap-icon://zoom-out",
					enabled: "{= ${$mdcChart>/_chart/getZoomInfo/enabled} && ${$mdcChart>/_chart/getZoomInfo/currentZoomLevel} > 0}"
				});

				oToolbar.addEnd(this._oZoomInButton);
				oToolbar.addEnd(this._oZoomOutButton);
			}


			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.DrillDownUp) < 0) {
				oChart._oDrillDownBtn = new OverflowButton(oChart.getId() + "-drillDown", {
					icon: "sap-icon://drill-down",
					enabled: false,
					tooltip: MDCRb.getText("chart.CHART_DRILLDOWN_TITLE"),
					text: MDCRb.getText("chart.CHART_DRILLDOWN_TITLE"),
					press: [
						oChart._showDrillDown, oChart
					]
				});
				oToolbar.addEnd(oChart._oDrillDownBtn);
			}

			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.Legend) < 0) {
				this._legendBtn = new OverflowToggleButton(oChart.getId() + "-chart_legend", {
					type: "Transparent",
					text: MDCRb.getText("chart.LEGENDBTN_TEXT"),
					icon: "sap-icon://legend",
					enabled: false,
					pressed: false
				});

				oToolbar.addEnd(this._legendBtn);
			}

			//Check p13n mode property on the chart and enable only desired buttons
			var aP13nMode = oChart.getP13nMode() || [];

			if (aP13nMode.indexOf("Item") > -1) {
				this._chartSettingsBtn = new OverflowButton(oChart.getId() + "-chart_settings", {
					tooltip: MDCRb.getText('chart.PERSONALIZATION_DIALOG_TITLE'),
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_TITLE'),
					icon: "sap-icon://action-settings",//TODO the right icon for P13n chart dialog
					ariaHasPopup: HasPopup.ListBox,
					enabled: false
				});
				oToolbar.addEnd(this._chartSettingsBtn);

				ShortcutHintsMixin.addConfig(this._chartSettingsBtn, {
						addAccessibilityLabel: true,
						messageBundleKey: Device.os.macintosh ? "mdc.PERSONALIZATION_SHORTCUT_MAC" : "mdc.PERSONALIZATION_SHORTCUT" // Cmd+, or Ctrl+,
					},
					oChart // we need the chart instance, otherwise the messageBundleKey does not find the resource bundle
				);

			}

			if (aP13nMode.indexOf("Sort") > -1) {
				this._sortBtn = new OverflowButton(oChart.getId() + "-sort_settings", {
					ariaHasPopup: HasPopup.ListBox,
					icon: "sap-icon://sort",
					tooltip: MDCRb.getText('sort.PERSONALIZATION_DIALOG_TITLE'),
					text: MDCRb.getText('sort.PERSONALIZATION_DIALOG_TITLE'),
					enabled: false
				});
				oToolbar.addEnd(this._sortBtn);
			}

			if (aP13nMode.indexOf("Type") > -1) {
				this._chartTypeBtn = new ChartTypeButton(oChart);
				oToolbar.addEnd(this._chartTypeBtn);
			}

			oToolbar.setEnabled(false);
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

			//oToolbar.destroyEnd(true);

			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.ZoomInOut)) {
				var oInnerChart = oChart.getAggregation("_chart");

				this._oZoomInButton.setTooltip(MDCRb.getText("chart.TOOLBAR_ZOOM_IN"));
				this._oZoomInButton.setText(MDCRb.getText("chart.TOOLBAR_ZOOM_IN"));
				this._oZoomInButton.attachPress(function onZoomInButtonPressed(oControlEvent) {
					this.handleZoomIn(oInnerChart, this._oZoomInButton, this._oZoomOutButton);
				}.bind(this));

				this._oZoomOutButton.setTooltip(MDCRb.getText("chart.TOOLBAR_ZOOM_OUT"));
				this._oZoomOutButton.setText(MDCRb.getText("chart.TOOLBAR_ZOOM_OUT"));
				this._oZoomOutButton.attachPress(function onZoomInButtonPressed(oControlEvent) {
					this.handleZoomOut(oInnerChart, this._oZoomInButton, this._oZoomOutButton);
				}.bind(this));

				if (oInnerChart) {
					oInnerChart.attachRenderComplete(function onInnerChartRenderCompleted(oControlEvent) {
						var oZoomInfo = oInnerChart.getZoomInfo();
						this.handleInnerChartRenderCompleted(oZoomInfo, this._oZoomInButton, this._oZoomOutButton);
					}, this);
				}
			}


			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.DrillDownUp) < 0) {

				oChart._oDrillDownBtn.setEnabled(true);
			}

			if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.Legend) < 0) {
				this._legendBtn.setEnabled(true);
				this._legendBtn.setPressed(oChart.getLegendVisible());
				this._legendBtn.attachPress(function(){
					oChart.setLegendVisible(!oChart.getLegendVisible());
					this._legendBtn.setPressed(oChart.getLegendVisible());
				}.bind(this));
			}

			//Check p13n mode property on the chart and enable only desired buttons
			var aP13nMode = oChart.getP13nMode() || [];

			if (aP13nMode.indexOf("Item") > -1) {

				this._chartSettingsBtn.setEnabled(true);
				this._chartSettingsBtn.attachPress(function(oEvent) {
					var oSource = oEvent.getSource();
					oChart._getPropertyData().then(function(aProperties) {
						ChartSettings.showPanel(oChart, "Chart", oSource, aProperties);
					});
				});
			}

			if (aP13nMode.indexOf("Sort") > -1) {
				this._sortBtn.setEnabled(true);
				this._sortBtn.attachPress(function(oEvent) {
					var oSource = oEvent.getSource();
					oChart._getPropertyData().then(function(aProperties) {
						ChartSettings.showPanel(oChart, "Sort", oSource, aProperties);
					});
				});
			}

			if (aP13nMode.indexOf("Type") > -1) {
				this._chartTypeBtn.bindToInnerChart(oChart);
				//oToolbar.addEnd(new ChartTypeButton(oChart));
			}


			oToolbar.setEnabled(true);
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
