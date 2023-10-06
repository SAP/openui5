/*!
 * ${copyright}
 */

sap.ui.define([
        "sap/ui/core/Core",
        "sap/ui/mdc/ActionToolbar",
        "sap/m/OverflowToolbarRenderer",
        "sap/m/OverflowToolbarButton",
        "sap/m/OverflowToolbarToggleButton",
        "sap/m/Title",
        "sap/ui/mdc/chart/ChartTypeButton",
        "./ChartSelectionDetails",
        "sap/m/ToolbarSeparator",
        "sap/m/OverflowToolbarLayoutData",
        "sap/ui/core/library",
        "sap/ui/Device",
        "sap/ui/core/ShortcutHintsMixin",
        "sap/ui/mdc/enums/ChartToolbarActionType"
    ],
    function (
        Core,
        ActionToolbar,
        OverflowToolbarRenderer,
        OverflowButton,
        OverflowToggleButton,
        Title,
        ChartTypeButton,
        ChartSelectionDetails,
        ToolbarSeparator,
        OverflowToolbarLayoutData,
        coreLibrary,
        Device,
        ShortcutHintsMixin,
        ChartToolbarActionType
    ) {
        "use strict";

		// shortcut for sap.ui.core.aria.HasPopup
		const AriaHasPopup = coreLibrary.aria.HasPopup;

        /**
         * Constructor for a new ChartToolbar.
         *
         * @param {string} [sId] id for the new control, generated automatically if no id is given
         * @param {object} [mSettings] initial settings for the new control
         * @class The ChartToolbar control is a sap.m.OverflowToolbar based on metadata and the configuration specified.
         * @extends sap.ui.mdc.ActionToolbar
         * @author SAP SE
         * @version ${version}
         * @constructor
         * @experimental As of version 1.88
         * @private
         * @since 1.88
         * @alias sap.ui.mdc.chart.ChartToolbar
         */
        const ChartToolbar = ActionToolbar.extend("sap.ui.mdc.chart.ChartToolbar", /** @lends sap.ui.mdc.chart.ChartToolbar.prototype */ {
            metadata: {
                library: "sap.ui.mdc",
                interfaces: [],
                defaultAggregation: "",
                properties: {},
                aggregations: {},
                associations: {},
                events: {}
            },
            renderer: OverflowToolbarRenderer
        });

        const MDCRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

        /**
         * Initialises the MDC Chart Selection Details
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        ChartToolbar.prototype.init = function () {
            ActionToolbar.prototype.init.apply(this, arguments);
        };

        /**
         * Creates the inner toolbar content.
         * @param {sap.ui.mdc.Chart} oChart Reference to the parent chart
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        ChartToolbar.prototype.createToolbarContent = function (oChart) {
            //Keep track of chart buttons to enable them later on
            this._chartInternalButtonsToEnable = [];

            /**add beginning**/
            this._oTitle = new Title(oChart.getId() + "-title", {
                text: oChart.getHeader(),
                level: oChart.getHeaderLevel(),
                width: oChart.getHeaderVisible() ? undefined : "0px"
            });
            this.addBegin(this._oTitle);

            /** variant management */
            if (oChart.getAggregation("variant")){
                this.addVariantManagement(oChart.getAggregation("variant"));
            }

            /**add end **/
            if (oChart.getShowSelectionDetails()){
                this._oChartSelectionDetails = new ChartSelectionDetails(oChart.getId() + "-selectionDetails", {});
                this._oChartSelectionDetails.attachBeforeOpen(function (oEvent) {
                    this._updateSelectionDetailsActions(oChart);
                }.bind(this));

                this.addEnd(this._oChartSelectionDetails);
            }

            //Check p13n mode property on the chart and enable only desired buttons
			const aP13nMode = oChart.getP13nMode() || [];

            if (  aP13nMode.indexOf("Item") > -1 && (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(ChartToolbarActionType.DrillDownUp) < 0)) {
                this._oDrillDownBtn = new OverflowButton(oChart.getId() + "-drillDown", {
                    icon: "sap-icon://drill-down",
                    tooltip: MDCRb.getText("chart.CHART_DRILLDOWN_TITLE"),
					text: MDCRb.getText("chart.CHART_DRILLDOWN_TITLE"),
                    enabled: false,
                    ariaHasPopup: AriaHasPopup.ListBox,
                    layoutData: new OverflowToolbarLayoutData({
                        closeOverflowOnInteraction: false
                    }),
                    press: function (oEvent) {
                        oChart._showDrillDown(this._oDrillDownBtn);
                    }.bind(this)
                });
                this.addEnd(this._oDrillDownBtn);
                this._chartInternalButtonsToEnable.push(this._oDrillDownBtn);
            }

            if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(ChartToolbarActionType.Legend) < 0) {
                this._oLegendBtn = new OverflowToggleButton(oChart.getId() +  "btnLegend", {
                    type: "Transparent",
                    text: MDCRb.getText("chart.LEGENDBTN_TEXT"),
                    tooltip: MDCRb.getText("chart.LEGENDBTN_TOOLTIP"),
                    icon: "sap-icon://legend",
                    pressed: "{$mdcChart>/legendVisible}",
                    enabled: false
                });
                this.addEnd(this._oLegendBtn);
                this._chartInternalButtonsToEnable.push(this._oLegendBtn);
            }

            if (!oChart.getIgnoreToolbarActions().length || oChart.getIgnoreToolbarActions().indexOf(ChartToolbarActionType.ZoomInOut)) {
                this.oZoomInButton = new OverflowButton(oChart.getId() + "btnZoomIn", {
                    icon: "sap-icon://zoom-in",
                    tooltip: MDCRb.getText("chart.TOOLBAR_ZOOM_IN"),
                    text: MDCRb.getText("chart.TOOLBAR_ZOOM_IN"),
                    enabled: false,
                    press: function onZoomOutButtonPressed(oControlEvent) {
                        oChart.zoomIn();
                        this.toggleZoomButtons(oChart);
                    }.bind(this)
                });

                this.oZoomOutButton = new OverflowButton(oChart.getId() + "btnZoomOut", {
                    icon: "sap-icon://zoom-out",
                    tooltip: MDCRb.getText("chart.TOOLBAR_ZOOM_OUT"),
                    text: MDCRb.getText("chart.TOOLBAR_ZOOM_OUT"),
                    enabled: false,
                    press: function onZoomOutButtonPressed(oControlEvent) {
                        oChart.zoomOut();
                        this.toggleZoomButtons(oChart);
                    }.bind(this)
                });
                this.addEnd(this.oZoomInButton);
                this.addEnd(this.oZoomOutButton);
                //Enabled via toggleZoomButtons()
            }

            if (aP13nMode.indexOf("Sort") > -1 || aP13nMode.indexOf("Item") > -1 || aP13nMode.indexOf("Filter") > -1) {
                this._oSettingsBtn = new OverflowButton(oChart.getId() + "-chart_settings", {
                    icon: "sap-icon://action-settings",//TODO the right icon for P13n chart dialog
                    tooltip: MDCRb.getText('chart.SETTINGS'),
                    text: MDCRb.getText('chart.SETTINGS'),
                    enabled: false,
                    press: function (oEvent) {
                        const aP13nMode = oChart.getP13nMode();
                        const iIdx = aP13nMode.indexOf("Type");
						if (iIdx > -1) {
							aP13nMode.splice(iIdx, 1);
						}

                        //TODO: Move this to p13n functionality?
                        if (oChart.isPropertyHelperFinal()){
                            oChart.getEngine().show(oChart, aP13nMode);
                        } else {
                            oChart.finalizePropertyHelper().then(function(){
                                oChart.getEngine().show(oChart, aP13nMode);
                            });
                        }
                    }
                });

                ShortcutHintsMixin.addConfig(this._oSettingsBtn, {
					addAccessibilityLabel: true,
					messageBundleKey: Device.os.macintosh ? "mdc.PERSONALIZATION_SHORTCUT_MAC" : "mdc.PERSONALIZATION_SHORTCUT" // Cmd+, or Ctrl+,
				},
				this
                );

                this.addEnd(this._oSettingsBtn);
                this._chartInternalButtonsToEnable.push(this._oSettingsBtn);
            }

            if (oChart._getTypeBtnActive()) {
                this._oChartTypeBtn = new ChartTypeButton(this.getId() + "-btnChartType", {
                    type: "Transparent",
                    enabled: false,
                    ariaHasPopup: AriaHasPopup.ListBox,
                    layoutData: new OverflowToolbarLayoutData({
                        closeOverflowOnInteraction: false
                    }),
                    chart: oChart
                });
                this.addEnd(this._oChartTypeBtn);
                this._chartInternalButtonsToEnable.push(this._oChartTypeBtn);
            }

        };

        /**
         * This adds a <code>VariantManagement</code> control at the beginning of the toolbar.
         * @param {sap.ui.fl.variantManagement} oVariantManagement the <code>VariantManagement</code> control to add to the toolbar
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        ChartToolbar.prototype.addVariantManagement = function(oVariantManagement) {

            if (oVariantManagement){
                if (this._oVariantManagement) {
                    this.removeBetween(this._oVariantManagement);
                }

                this._oVariantManagement = oVariantManagement;
                this.addBetween(this._oVariantManagement);
            }

        };

        /**
         * This checks the enablement of the zoom button in the toolbar.
         * @param {sap.ui.mdc.Chart} oChart Reference to the parent chart
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc, sap.fe
         */
        ChartToolbar.prototype.toggleZoomButtons = function (oChart) {
            const oZoomInfo = this._getZoomEnablement(oChart);

            if (oZoomInfo.enabled) {
                this.oZoomInButton.setEnabled(oZoomInfo.enabledZoomIn);
                this.oZoomOutButton.setEnabled(oZoomInfo.enabledZoomOut);
            } else {
                this.oZoomInButton.setEnabled(false);
                this.oZoomOutButton.setEnabled(false);
            }

        };

        /**
         * This updates the toolbar in accordance with the parent chart.
         * Only used internally.
         * @param {sap.ui.mdc.Chart} oChart Reference to the parent chart
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc, sap.fe
         */
        ChartToolbar.prototype.updateToolbar = function (oChart) {
            this.toggleZoomButtons(oChart);

            if (!this._toolbarInitialUpdated) {
                this.setEnabled(true);

                this._chartInternalButtonsToEnable.forEach(function(oBtn){
                    oBtn.setEnabled(true);
                });

                this._toolbarInitialUpdated = true;
            }

            const oSelectionHandler = oChart.getSelectionHandler();
            if (oSelectionHandler && oChart.getShowSelectionDetails()) {
                this._oChartSelectionDetails.attachSelectionHandler(oSelectionHandler.eventId, oSelectionHandler.listener);
            }
        };

        ChartToolbar.prototype._getVariantReference = function() {
            return this._oVariantManagement;
        };

        ChartToolbar.prototype._getZoomEnablement = function (oChart) {
            let zoomInfo;

            try {
                zoomInfo = oChart.getZoomState();
            } catch (error) {
                //Catch the case when an inner chart is not yet rendered
                zoomInfo = {enabled: false};
            }


            if (zoomInfo && zoomInfo.hasOwnProperty("currentZoomLevel") && zoomInfo.currentZoomLevel != null && zoomInfo.enabled) {
                const toolbarZoomInfo = {enabled: true};

                //TODO: Move this to the delegate since we don't know how other chart librariers handle this
                toolbarZoomInfo.enabledZoomOut = zoomInfo.currentZoomLevel > 0;
                toolbarZoomInfo.enabledZoomIn = zoomInfo.currentZoomLevel < 1;
                return toolbarZoomInfo;
            } else {
                return {enabled: false};
            }
        };

        ChartToolbar.prototype._updateSelectionDetailsActions = function (oChart) {

            //In case details button is disabled
            if (!oChart.getShowSelectionDetails()) {
                return;
            }

            const oSelectionDetailsActions = oChart.getSelectionDetailsActions();
            let oClone;

            if (oSelectionDetailsActions) {
                // Update item actions
                const aSelectionItems = this._oChartSelectionDetails.getItems();

                aSelectionItems.forEach(function (oItem) {
                    const aItemActions = oSelectionDetailsActions.getDetailsItemActions();
                    aItemActions.forEach(function (oAction) {
                        oClone = oAction.clone();
                        oItem.addAction(oClone);
                    });
                });

                // Update list actions
                const aDetailsActions = oSelectionDetailsActions.getDetailsActions();
                this._oChartSelectionDetails.removeAllActions();
                aDetailsActions.forEach(function (oAction) {
                    oClone = oAction.clone();
                    this._oChartSelectionDetails.addAction(oClone);
                }.bind(this));

                // Update group actions
                const aActionGroups = oSelectionDetailsActions.getActionGroups();
                this._oChartSelectionDetails.removeAllActionGroups();
                aActionGroups.forEach(function (oActionGroup) {
                    oClone = oActionGroup.clone();
                    this._oChartSelectionDetails.addActionGroup(oClone);
                }.bind(this));
            }

        };

        ChartToolbar.prototype._setHeaderLevel = function(sHeaderLevel) {
            this._oTitle.setLevel(sHeaderLevel);
        };

        ChartToolbar.prototype.setHeaderVisible = function(bVisible) {
            if (this._oTitle) {
                this._oTitle.setWidth(bVisible ? undefined : "0px");
            }
        };

        /**
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        ChartToolbar.prototype.getSettingsButton = function() {
            return this._oSettingsBtn;
        };

        return ChartToolbar;
    });
