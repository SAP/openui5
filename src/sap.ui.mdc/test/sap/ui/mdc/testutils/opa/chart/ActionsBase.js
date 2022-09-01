sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/base/Log",
    "sap/ui/test/matchers/Ancestor",
    "sap/ui/test/matchers/PropertyStrictEquals",
    "sap/ui/test/matchers/Properties",
    "../p13n/Util",
	"../p13n/waitForP13nButtonWithMatchers",
	"../p13n/waitForP13nDialog"
], function (Opa5, Press, Log, Ancestor, PropertyStrictEquals, Properties, p13nUtil, waitForP13nButtonWithMatchers, waitForP13nDialog) {
	"use strict";

    var oCore = Opa5.getWindow().sap.ui.getCore();
    var oMDCBundle = oCore.getLibraryResourceBundle("sap.ui.mdc");

    var waitForMDCChartWithId = function(sId, oSettings) {
        return this.waitFor({
            id: sId,
            controlType: "sap.ui.mdc.Chart",
            success: function(oMDCChart) {
                if (oSettings && typeof oSettings.success === "function") {
                    oSettings.success.call(this, oMDCChart);
                }
            },
            actions: oSettings.actions ? oSettings.actions : []
        });
    };

    var iClickOnOverflowToolbarButton = function(oMDCChart, oSettings) {
        this.waitFor({
            controlType: "sap.m.OverflowToolbar",
            matchers: new Ancestor(oMDCChart),
            success: function(aOverflowToolbars) {
                var oOverflowToolbar = aOverflowToolbars[0];
                oSettings.matchers.push(new Ancestor(oOverflowToolbar, false));
                this.waitFor({
                    controlType: oSettings.controlType,
                    matchers: oSettings.matchers,
                    actions: new Press()
                });

                if (oSettings && typeof oSettings.success === "function") {
                    oSettings.success.call(this);
                }
            }
        });
    };


    var iClickOnOverflowToolbarButtonWithIcon = function(oMDCChart, sIcon, oSettings) {

        var oTempSettings = oSettings ? oSettings : {};
        oTempSettings.controlType =  "sap.m.OverflowToolbarButton";
        oTempSettings.matchers = [
            new PropertyStrictEquals({
                name: "icon",
                value: sIcon
            })
        ];

        iClickOnOverflowToolbarButton.call(this, oMDCChart, oTempSettings);
    };

    var iClickOnOverflowToolbarToggleButtonWithIcon = function(oMDCChart, sIcon, oSettings) {

        var oTempSettings = oSettings ? oSettings : {};
        oTempSettings.controlType =  "sap.m.OverflowToolbarToggleButton";
        oTempSettings.matchers = [
            new PropertyStrictEquals({
                name: "icon",
                value: sIcon
            })
        ];

        iClickOnOverflowToolbarButton.call(this, oMDCChart, oTempSettings);
    };

    var iClickOnButtonWithText = function(oMDCChart, sText, oSettings) {

        var oTempSettings = oSettings ? oSettings : {};
        oTempSettings.controlType =  "sap.m.Button";
        oTempSettings.matchers = [
            new PropertyStrictEquals({
                name: "text",
                value: sText
            })
        ];

        iClickOnOverflowToolbarButton.call(this, oMDCChart, oTempSettings);
    };

	return {
        iOpenThePersonalizationDialog: function(oControl, oSettings) {
            var sControlId = typeof oControl === "string" ? oControl : oControl.getId();
            var aDialogMatchers = [];
            var aButtonMatchers = [];
            return this.waitFor({
                id: sControlId,
                success: function(oControlInstance) {
                    Opa5.assert.ok(oControlInstance);

                    aButtonMatchers.push(new Ancestor(oControlInstance));

                    aDialogMatchers.push(new Ancestor(oControlInstance, false));

                    // Add matcher for p13n button icon
                    aButtonMatchers.push(new Properties({
                        icon: p13nUtil.icons.settings
                    }));
                    aDialogMatchers.push(new Properties({
                        title: oMDCBundle.getText("p13nDialog.VIEW_SETTINGS")
                    }));

                    waitForP13nButtonWithMatchers.call(this, {
                        actions: new Press(),
                        matchers: aButtonMatchers,
                        success: function() {
                            waitForP13nDialog.call(this, {
                                matchers: aDialogMatchers,
                                success:  function(oP13nDialog) {
                                    if (oSettings && typeof oSettings.success === "function") {
                                        oSettings.success.call(this, oP13nDialog);
                                    }
                                }
                            });
                        },
                        errorMessage: "Control '" + sControlId + "' has no P13n button"
                    });
                },
                errorMessage: "Control '" + sControlId + "' not found."
            });
        },
        /**
         * Clicks on the "Zoom In" button in the toolbar of a mdc chart.
         * @param {string} sId The id of the mdc chart
         */
        iClickOnZoomIn : function(sId){
            return waitForMDCChartWithId.call(this, sId, {
                success: function(oMDCChart){
                    iClickOnOverflowToolbarButtonWithIcon.call(this, oMDCChart, "sap-icon://zoom-in");
                }
            });
        },

        /**
         * Clicks on the "Zoom Out" button in the toolbar of a mdc chart.
         * @param {string} sId The id of the mdc chart
         */
        iClickOnZoomOut : function(sId){
            return waitForMDCChartWithId.call(this, sId, {
                success: function(oMDCChart){
                    iClickOnOverflowToolbarButtonWithIcon.call(this, oMDCChart, "sap-icon://zoom-out");
                }
            });
        },

        /**
         * Clicks on the "Legend" toggle button in the toolbar of a mdc chart.
         * @param {string} sId The id of the mdc chart
         */
        iClickOnTheLegendToggleButton : function(sId){
            return waitForMDCChartWithId.call(this, sId, {
                success: function(oMDCChart){
                    iClickOnOverflowToolbarToggleButtonWithIcon.call(this, oMDCChart, "sap-icon://legend");
                }
            });
        },

        /**
         * Clicks on the "Show Details" button in the toolbar of a mdc chart.
         * @param {*} sId The id of the mdc chart
         */
        iClickOnTheSelectionDetailsButton: function(sId){

            return waitForMDCChartWithId.call(this, sId, {
                success: function(oMDCChart){
                    this.waitFor({
                        controlType: "sap.m.Button",
                        id: sId + "-selectionDetails-button",
                        actions: new Press()
                    });
                }
            });
        },

        /**
         * Clicks on the "Drilldown" button in the toolbar of a mdc chart.
         * @param {string} sId The id of the mdc chart.
         */
        iClickOnTheDrillDownButton: function(sId){
            return waitForMDCChartWithId.call(this, sId, {
                success: function(oMDCChart){
                    iClickOnButtonWithText.call(this, oMDCChart, oCore.getLibraryResourceBundle("sap.ui.mdc").getText("chart.CHART_DRILLDOWN_TITLE"));
                }
            });
        },

        /**
         * Clicks on the "Chart Type" button in the toolbar of a mdc chart.
         * @param {string} sId The id of the mdc chart.
         */
        iClickOnTheChartTypeButton: function(sId, oSettings){
            return waitForMDCChartWithId.call(this, sId, {
                success: function(oMDCChart){
                    this.waitFor({
                        controlType: "sap.ui.mdc.chart.ChartTypeButton",
                        matchers: new Ancestor(oMDCChart),
                        actions: new Press(),
                        success: function(){
                            if (oSettings && typeof oSettings.success === "function") {
                                oSettings.success.call(this);
                            }
                        }
                    });
                }
            });
        },

        /**
         * Clicks on the "Personalisation" button in the toolbar of a mdc chart.
         * @param {string} sId The id of the mdc chart.
         */
        iClickOnThePersonalisationButton: function(sId){
            return waitForMDCChartWithId.call(this, sId, {
                success: function(oMDCChart){
                    iClickOnOverflowToolbarButtonWithIcon.call(this, oMDCChart, "sap-icon://action-settings");
                }
            });
        },

        /**
         * Selects a specific chart type for a mdc chart in an open chart type popover
         * @param {string} sChartTypeName The name of the chart type
         */
        iSelectChartTypeInPopover: function(sChartTypeName){
			return this.waitFor({
				controlType: "sap.m.StandardListItem",
				success: function(aListItems) {

                    var oListItem = aListItems.filter(function(oItem){
                        return oItem.getTitle() == sChartTypeName;
                    })[0];

                    if (!oListItem){
                        Log.error("No chart type with name " + sChartTypeName + " was found in open popovers");
                    } else {
                        new Press().executeOn(oListItem);
                    }
				},
				errorMessage: "No chartType list items found"
			});
        },

        /**
         * Clicks on an drill-down breadcrumb with given name for given mdc chart
         * @param {string} sName The name of the chart type
         * @param {string} sId Id of the mdc chart.
         */
        iClickOnTheBreadcrumbWithName: function(sName, sId){

            return waitForMDCChartWithId.call(this, sId, {
                success: function(oMDCChart){
                    this.waitFor({
                        controlType: "sap.m.Link",
                        matchers: new Ancestor(oMDCChart),
                        success: function(aLinks){
                            var aFilteredLinks = aLinks.filter(function(oLink){return (oLink.getText() === sName && oLink.getParent().getParent().getId() === sId);});

                            if (aFilteredLinks.length == 1){
                                new Press().executeOn(aFilteredLinks[0]);
                            } else {
                                Log.error("Expected 1 Link with text " + sName + " but found " + aFilteredLinks.length);
                            }
                        }
                    });
                }
            });
        },

        /**
         * Selects a specific dimension to drill-down for a mdc chart in an open chart drill-down popover
         * @param {string} sDrillName Name of the Dimension which should be drilled-down
         */
        iSelectANewDrillDimensionInPopover: function(sDrillName){
			return this.waitFor({
				controlType: "sap.m.StandardListItem",
				success: function(aListItems) {

                    var oListItem = aListItems.filter(function(oItem){
                        return oItem.getTitle() == sDrillName;
                    })[0];

                    if (!oListItem){
                        Log.error("No chart type with name " + sDrillName + " was found in open popovers");
                    } else {
                        new Press().executeOn(oListItem);
                    }
				},
				errorMessage: "No chartType list items found"
			});
        },

        /**
         * Performs a drill-down on the MDC Chart
         * @param {string} sId The id of the MDC Chart
         * @param {string} sDrillName Name of the Dimension which should be drilled-down.
         */
         iDrillDownInDimension: function(sId, sDrillName) {
            return waitForMDCChartWithId.call(this, sId, {
                success: function(oMDCChart){
                    iClickOnButtonWithText.call(this, oMDCChart, oCore.getLibraryResourceBundle("sap.ui.comp").getText("CHART_DRILLDOWNBTN_TEXT"), {
                        success: function(){
                            this.iSelectChartTypeInPopover(sDrillName);
                        }
                    });
                }
            });
        },

            /**
         * Performs a drill-down on the MDC Chart
         * @param {string} sId The id of the MDC Chart
         * @param {string} sChartTypeName Name of the Dimension which should be drilled-down.
         */
        iSelectAChartType: function(sId, sChartTypeName) {
           return waitForMDCChartWithId.call(this, sId, {
                success: function(oMDCChart){
                    this.iClickOnTheChartTypeButton.call(this, sId, {
                        success: function(){
                            this.iSelectANewDrillDimensionInPopover(sChartTypeName);
                        }
                    });
                }
            });
        },

         /**
         * Selects given datapoints on given chart.
         * @param {array} aDataPoints Datapoint objects to select
         * @param {string} sId Id of the mdc chart
         */
        iSelectTheDatapoint: function (aDataPoints, sId){

        },

        /**
         * Selectes given categories (dimensions) for the given mdc chart
         * @param {object} oCategories Categories to select
         * @param {string} sId Id of the mdc chart
         */
        iSelectTheCategories: function (oCategories, sId){

        }
    };
});
