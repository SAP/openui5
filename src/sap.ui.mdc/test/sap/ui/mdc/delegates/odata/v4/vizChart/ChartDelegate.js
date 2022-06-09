/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the chart and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"delegates/odata/v4/FilterBarDelegate", "sap/ui/mdc/odata/v4/vizChart/ChartDelegate"
	], function (FilterBarDelegate, VizChartDelegate) {
	"use strict";

    var ChartDelegate = Object.assign({}, VizChartDelegate);

    ChartDelegate.getFilterDelegate = function() {
        return FilterBarDelegate;
    };

	return ChartDelegate;
});