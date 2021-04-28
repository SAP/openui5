sap.ui.define([
    "sap/ui/test/actions/Press",
    "sap/base/Log"
], function (Press, Log) {
	"use strict";

	return {

        iLookAtTheScreen: function() {
			return this;
		},

        /**
         * Clicks on the "Zoom In" button in the toolbar of a mdc chart.
         * @param {string} sId The id of the mdc chart
         */
        iClickOnZoomIn : function(sId){
            return this.waitFor({
                id: sId,
                success: function(oChart){
                    var oZoomInBtn = oChart.getAggregation("_toolbar").getContent().filter(function(oContent){return oContent.getId().toLowerCase().includes("zoomin");})[0];
                    new Press().executeOn(oZoomInBtn);
                }
            });
        },

        /**
         * Clicks on the "Zoom Out" button in the toolbar of a mdc chart.
         * @param {string} sId The id of the mdc chart
         */
        iClickOnZoomOut : function(sId){
            return this.waitFor({
                id: sId,
                success: function(oChart){
                    var oZoomOutBtn = oChart.getAggregation("_toolbar").getContent().filter(function(oContent){return oContent.getId().toLowerCase().includes("zoomout");})[0];
                    new Press().executeOn(oZoomOutBtn);
                }
            });
        },

        /**
         * Clicks on the "Legend" toggle button in the toolbar of a mdc chart.
         * @param {string} sId The id of the mdc chart
         */
        iClickOnTheLegendToggleButton: function(sId){
            return this.waitFor({
                id: sId,
                success: function(oChart){
                    var oLegendBtn = oChart.getAggregation("_toolbar").getContent().filter(function(oContent){return oContent.getId().toLowerCase().includes("btnlegend");})[0];
                    new Press().executeOn(oLegendBtn);
                }
            });
        },

        /**
         * Clicks on the "Show Details" button in the toolbar of a mdc chart.
         * @param {*} sId The id of the mdc chart
         */
        iClickOnTheSelectionDetailsButton: function(sId){
            return this.waitFor({
                id: sId,
                success: function(oChart){
                    var oBtn = oChart.getAggregation("_toolbar").getContent().filter(function(oContent){return oContent.getId().toLowerCase().includes("selectiondetails");})[0];
                    new Press().executeOn(oBtn);
                }
            });
        },

        /**
         * Clicks on the "Drilldown" button in the toolbar of a mdc chart.
         * @param {string} sId The id of the mdc chart.
         */
        iClickOnTheDrillDownButton: function(sId){
            return this.waitFor({
                id: sId,
                success: function(oChart){
                    var oBtn = oChart.getAggregation("_toolbar").getContent().filter(function(oContent){return oContent.getId().toLowerCase().includes("drilldown");})[0];
                    new Press().executeOn(oBtn);
                }
            });
        },

        /**
         * Clicks on the "Chart Type" button in the toolbar of a mdc chart.
         * @param {string} sId The id of the mdc chart.
         */
        iClickOnTheChartTypeButton: function(sId){
            return this.waitFor({
                id: sId,
                success: function(oChart){
                    var oBtn = oChart.getAggregation("_toolbar").getContent().filter(function(oContent){return oContent.getId().toLowerCase().includes("charttype");})[0];
                    new Press().executeOn(oBtn);
                }
            });
        },

        /**
         * Clicks on the "Sort" button in the toolbar of a mdc chart.
         * @param {string} sId The id of the mdc chart.
         */
        iClickOnTheSortButton: function(sId){
            return this.waitFor({
                id: sId,
                success: function(oChart){
                    var oBtn = oChart.getAggregation("_toolbar").getContent().filter(function(oContent){return oContent.getId().toLowerCase().includes("sort_settings");})[0];
                    new Press().executeOn(oBtn);
                }
            });
        },

        /**
         * Clicks on the "Personalisation" button in the toolbar of a mdc chart.
         * @param {string} sId The id of the mdc chart.
         */
        iClickOnThePersonalisationButton: function(sId){
            return this.waitFor({
                id: sId,
                success: function(oChart){
                    var oBtn = oChart.getAggregation("_toolbar").getContent().filter(function(oContent){return oContent.getId().toLowerCase().includes("chart_settings");})[0];
                    new Press().executeOn(oBtn);
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
         * @param {string} sChartTypeName The name of the chart type
         */
        iClickOnTheBreadcrumbWithNameOnChart : function(sName, sId){
            return this.waitFor({
                controlType: "sap.m.Link",
                success: function(aLinks){
                    var aFilteredLinks = aLinks.filter(function(oLink){return (oLink.getText() === sName && oLink.getParent().getParent().getId() === sId);});

                    if (aFilteredLinks.length == 1){
                        new Press().executeOn(aFilteredLinks[0]);
                    } else {
                        Log.error("Expected 1 Link with text " + sName + " but found " + aFilteredLinks.length);
                    }
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
         * Selects given datapoints on given chart.
         * @param {array} aDataPoints Datapoint objects to select
         * @param {string} sId Id of the mdc chart
         */
        iSelectTheDatapointOnTheChart: function (aDataPoints, sId){

        }
    };
});
