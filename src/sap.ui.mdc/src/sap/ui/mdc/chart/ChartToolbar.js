/*!
 * ${copyright}
 */

sap.ui.define([
        "sap/ui/core/Core",
        "sap/ui/mdc/library",
        "sap/ui/mdc/ActionToolbar",
        "sap/m/OverflowToolbarRenderer",
        "sap/m/OverflowToolbarButton",
        "sap/m/OverflowToolbarToggleButton",
        "sap/m/Title",
        "sap/ui/mdc/library",
        "sap/ui/mdc/chart/ChartTypeButton",
        "sap/ui/mdc/chart/ChartSettings",
        "./ChartSelectionDetails",
        "sap/m/ToolbarSeparator"
    ],
    function (
        Core,
        Control,
        ActionToolbar,
        OverflowToolbarRenderer,
        OverflowButton,
        OverflowToggleButton,
        Title,
        MDCLib,
        ChartTypeButton,
        ChartSettings,
        ChartSelectionDetails,
        ToolbarSeparator
    ) {
        "use strict";

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
        var ChartToolbar = ActionToolbar.extend("sap.ui.mdc.chart.ChartToolbar", /** @lends sap.ui.mdc.chart.ChartToolbar.prototype */ {
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

        var MDCRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

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
         * @param {sap.ui.mdc.Chart} oMDCChart Reference to the parent chart
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        ChartToolbar.prototype.createToolbarContent = function (oMDCChart) {
            //Keep track of chart buttons to enable them later on
            this._chartInternalButtonsToEnable = [];

            /**add beginning**/
            this._oTitle = new Title(oMDCChart.getId() + "-title", {
                text: oMDCChart.getHeader(),
                level: oMDCChart.getHeaderLevel()
            });
            this.addBegin(this._oTitle);

            /** variant management */
            if (oMDCChart.getVariant()){
                this.addVariantManagement(oMDCChart.getVariant());
            }

            /**add end **/
            this._oChartSelectionDetails = new ChartSelectionDetails(oMDCChart.getId() + "-selectionDetails", {});
            this._oChartSelectionDetails.attachBeforeOpen(function (oEvent) {
                this._updateSelectionDetailsActions(oMDCChart);
            }.bind(this));

            this.addEnd(this._oChartSelectionDetails);

            //Check p13n mode property on the chart and enable only desired buttons
			var aP13nMode = oMDCChart.getP13nMode() || [];

            if (  aP13nMode.indexOf("Item") > -1 && (!oMDCChart.getIgnoreToolbarActions().length || oMDCChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.DrillDownUp) < 0)) {
                this._oDrillDownBtn = new OverflowButton(oMDCChart.getId() + "-drillDown", {
                    icon: "sap-icon://drill-down",
                    tooltip: MDCRb.getText("chart.CHART_DRILLDOWN_TITLE"),
					text: MDCRb.getText("chart.CHART_DRILLDOWN_TITLE"),
                    enabled: false,
                    press: function (oEvent) {
                        oMDCChart._showDrillDown(this._oDrillDownBtn);
                    }.bind(this)
                });
                this.addEnd(this._oDrillDownBtn);
                this._chartInternalButtonsToEnable.push(this._oDrillDownBtn);
            }

            if (!oMDCChart.getIgnoreToolbarActions().length || oMDCChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.Legend) < 0) {
                this._oLegendBtn = new OverflowToggleButton(oMDCChart.getId() +  "btnLegend", {
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

            if (!oMDCChart.getIgnoreToolbarActions().length || oMDCChart.getIgnoreToolbarActions().indexOf(MDCLib.ChartToolbarActionType.ZoomInOut)) {
                this.oZoomInButton = new OverflowButton(oMDCChart.getId() + "btnZoomIn", {
                    icon: "sap-icon://zoom-in",
                    tooltip: MDCRb.getText("chart.TOOLBAR_ZOOM_IN"),
                    text: MDCRb.getText("chart.TOOLBAR_ZOOM_IN"),
                    enabled: false,
                    press: function onZoomOutButtonPressed(oControlEvent) {
                        oMDCChart.zoomIn();
                        this.toggleZoomButtons(oMDCChart);
                    }.bind(this)
                });

                this.oZoomOutButton = new OverflowButton(oMDCChart.getId() + "btnZoomOut", {
                    icon: "sap-icon://zoom-out",
                    tooltip: MDCRb.getText("chart.TOOLBAR_ZOOM_OUT"),
                    text: MDCRb.getText("chart.TOOLBAR_ZOOM_OUT"),
                    enabled: false,
                    press: function onZoomOutButtonPressed(oControlEvent) {
                        oMDCChart.zoomOut();
                        this.toggleZoomButtons(oMDCChart);
                    }.bind(this)
                });
                this.addEnd(this.oZoomInButton);
                this.addEnd(this.oZoomOutButton);
                //Enabled via toggleZoomButtons()
            }

            if (aP13nMode.indexOf("Sort") > -1 || aP13nMode.indexOf("Item") > -1) {
                this._oSettingsBtn = new OverflowButton(oMDCChart.getId() + "-chart_settings", {
                    icon: "sap-icon://action-settings",//TODO the right icon for P13n chart dialog
                    tooltip: MDCRb.getText('chart.PERSONALIZATION_DIALOG_TITLE'),
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_TITLE'),
                    enabled: false,
                    press: function (oEvent) {
                        var aP13nMode = oMDCChart.getP13nMode();
                        var iIdx = aP13nMode.indexOf("Type");
						if (iIdx > -1) {
							aP13nMode.splice(iIdx, 1);
						}

                        //TODO: Move this to p13n functionality?
                        if (oMDCChart.isPropertyHelperFinal()){
                            oMDCChart.getEngine().uimanager.show(oMDCChart, aP13nMode);
                        } else {
                            oMDCChart.finalizePropertyHelper().then(function(){
                                oMDCChart.getEngine().uimanager.show(oMDCChart, aP13nMode);
                            });
                        }
                    }
                });
                this.addEnd(this._oSettingsBtn);
                this._chartInternalButtonsToEnable.push(this._oSettingsBtn);
            }

            if (oMDCChart._getTypeBtnActive()) {
                this._oChartTypeBtn = new ChartTypeButton(oMDCChart);
                this._oChartTypeBtn.setEnabled(false);
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
         * @param {sap.ui.mdc.Chart} oMDCChart Reference to the parent chart
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc, sap.fe
         */
        ChartToolbar.prototype.toggleZoomButtons = function (oMDCChart) {
            var oZoomInfo = this._getZoomEnablement(oMDCChart);

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
         * @param {sap.ui.mdc.Chart} oMDCChart Reference to the parent chart
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc, sap.fe
         */
        ChartToolbar.prototype.updateToolbar = function (oMDCChart) {
            this.toggleZoomButtons(oMDCChart);

            if (!this._toolbarInitialUpdated) {
                this.setEnabled(true);

                this._chartInternalButtonsToEnable.forEach(function(oBtn){
                    oBtn.setEnabled(true);
                });

                this._toolbarInitialUpdated = true;
            }

            var oSelectionHandler = oMDCChart.getSelectionHandler();
            if (oSelectionHandler) {
                this._oChartSelectionDetails.attachSelectionHandler(oSelectionHandler.eventId, oSelectionHandler.listener);
            }
        };

        ChartToolbar.prototype._getZoomEnablement = function (oMDCChart) {
            var zoomInfo;

            try {
                zoomInfo = oMDCChart.getZoomState();
            } catch (error) {
                //Catch the case when an inner chart is not yet rendered
                zoomInfo = {enabled: false};
            }


            if (zoomInfo && zoomInfo.hasOwnProperty("currentZoomLevel") && zoomInfo.currentZoomLevel != null && zoomInfo.enabled) {
                var toolbarZoomInfo = {enabled: true};

                //TODO: Move this to the delegate since we don't know how other chart librariers handle this
                toolbarZoomInfo.enabledZoomOut = zoomInfo.currentZoomLevel > 0;
                toolbarZoomInfo.enabledZoomIn = zoomInfo.currentZoomLevel < 1;
                return toolbarZoomInfo;
            } else {
                return {enabled: false};
            }
        };

        ChartToolbar.prototype._updateSelectionDetailsActions = function (oMDCChart) {
            var oSelectionDetailsActions = oMDCChart.getSelectionDetailsActions(), oClone;

            if (oSelectionDetailsActions) {
                // Update item actions
                var aSelectionItems = this._oChartSelectionDetails.getItems();

                aSelectionItems.forEach(function (oItem) {
                    var aItemActions = oSelectionDetailsActions.getDetailsItemActions();
                    aItemActions.forEach(function (oAction) {
                        oClone = oAction.clone();
                        oItem.addAction(oClone);
                    });
                });

                // Update list actions
                var aDetailsActions = oSelectionDetailsActions.getDetailsActions();
                this._oChartSelectionDetails.removeAllActions();
                aDetailsActions.forEach(function (oAction) {
                    oClone = oAction.clone();
                    this._oChartSelectionDetails.addAction(oClone);
                }.bind(this));

                // Update group actions
                var aActionGroups = oSelectionDetailsActions.getActionGroups();
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

        return ChartToolbar;
    });
