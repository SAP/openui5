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
        "sap/ui/mdc/chartNew/ChartTypeButtonNew",
        "sap/ui/mdc/chart/ChartSettings",
        "./ChartSelectionDetailsNew"
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
        ChartSelectionDetailsNew
    ) {
        "use strict";

        /**
         /**
         * Constructor for a new ChartToolbarNew.
         *
         * @param {string} [sId] id for the new control, generated automatically if no id is given
         * @param {object} [mSettings] initial settings for the new control
         * @class The ChartToolbarNew control creates a sap.m.OverflowToolbar based on metadata and the configuration specified.
         * @extends sap.m.OverflowToolbar
         * @author SAP SE
         * @version ${version}
         * @constructor
         * @experimental As of version ...
         * @private
         * @since 1.88
         * @alias sap.ui.mdc.chartNew.ChartToolbarNew
         * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
         */
        var ChartToolbar = ActionToolbar.extend("sap.ui.mdc.chartNew.ChartToolbarNew", /** @lends sap.ui.mdc.chartNew.ChartToolbarNew.prototype */ {
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

        ChartToolbar.prototype.createToolbarContent = function (oMDCChart) {
            /**add beginning**/
            var title = new Title(oMDCChart.getId() + "-title", {
                text: oMDCChart.getHeader()
            });
            this.addBegin(title);

            /**add end **/
            this._oChartSelectionDetails = new ChartSelectionDetailsNew(oMDCChart.getId() + "-selectionDetails", {});
            this._oChartSelectionDetails.attachBeforeOpen(function (oEvent) {
                this._updateSelectionDetailsActions(oMDCChart);
            }.bind(this));

            this.addEnd(this._oChartSelectionDetails);

            this._oDrillDownBtn = new OverflowButton(oMDCChart.getId() + "-drillDown", {
                icon: "sap-icon://drill-down",
                press: function (oEvent) {
                    oMDCChart._showDrillDown(this._oDrillDownBtn);
                }.bind(this),
                enabled: false
            });
            this.addEnd(this._oDrillDownBtn);

            this._oLegendBtn = new OverflowToggleButton({
                type: "Transparent",
                text: MDCRb.getText("chart.LEGENDBTN_TEXT"),
                tooltip: MDCRb.getText("chart.LEGENDBTN_TOOLTIP"),
                icon: "sap-icon://legend",
                pressed: "{$mdcChart>/legendVisible}",
                enabled: false //gets enabled by updateToolbar function once inner chart is ready
            });
            this.addEnd(this._oLegendBtn);

            this.oZoomInButton = new OverflowButton({
                icon: "sap-icon://zoom-in",
                enabled: false,
                press: function onZoomOutButtonPressed(oControlEvent) {
                    oMDCChart.zoomIn();
                    this.toggleZoomButtons(oMDCChart);
                }.bind(this)
            });

            this.oZoomOutButton = new OverflowButton({
                icon: "sap-icon://zoom-out",
                enabled: false,
                press: function onZoomOutButtonPressed(oControlEvent) {
                    oMDCChart.zoomOut();
                    this.toggleZoomButtons(oMDCChart);
                }.bind(this)
            });
            this.addEnd(this.oZoomInButton);
            this.addEnd(this.oZoomOutButton);

            this._oSettingsBtn = new OverflowButton(oMDCChart.getId() + "-chart_settings", {
                icon: "sap-icon://action-settings",//TODO the right icon for P13n chart dialog
                enabled: false,
                press: function (oEvent) {
                    var oSource = oEvent.getSource();
                    ChartSettings.showPanel(oMDCChart, "Chart", oSource);
                }
            });
            this.addEnd(this._oSettingsBtn);

            this._oSortBtn = new OverflowButton(oMDCChart.getId() + "-sort_settings", {
                icon: "sap-icon://sort",
                press: function (oEvent) {
                    var oSource = oEvent.getSource();
                    ChartSettings.showPanel(oMDCChart, "Sort", oSource, oMDCChart._getPropertyData());
                },
                enabled: false
            });

            this.addEnd(this._oSortBtn);

            this._oChartTypeBtn = new ChartTypeButton(oMDCChart);
            this._oChartTypeBtn.setEnabled(false);
            this.addEnd(this._oChartTypeBtn);
        };

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

        ChartToolbar.prototype.updateToolbar = function (oMDCChart) {
            this.toggleZoomButtons(oMDCChart);
            //TODO: Check enablement for buttons
            //TODO: Sort & P13n & DrillDown Buttons should not be enabled in ever scenario!
            this._oLegendBtn.setEnabled(true);
            this._oChartTypeBtn.setEnabled(true);
            this._oSettingsBtn.setEnabled(true);
            this._oSortBtn.setEnabled(true);
            this._oDrillDownBtn.setEnabled(true);

            var oSelectionHandler = oMDCChart.getSelectionHandler();
            this._oChartSelectionDetails.attachSelectionHandler(oSelectionHandler.eventId, oSelectionHandler.listener);
        };

        ChartToolbar.prototype._getZoomEnablement = function (oMDCChart) {
            var zoomInfo = oMDCChart.getZoomState();

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
        return ChartToolbar;
    }, true);
