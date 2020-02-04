/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.table.Table control
sap.ui.define([
	'sap/ui/table/utils/TableUtils'
],
	function(
		TableUtils
	) {
	"use strict";

	return {
		domRef : function(oTable){
			if (oTable._getRowMode().isA("sap.ui.table.rowmodes.AutoRowMode")){
				//control domRef has height:0px set, but footer & scrollbar is missing
				return oTable.$("sapUiTableCnt").get(0);
			}
			return oTable.getDomRef();
		},
		aggregations : {
			columns : {
				domRef : ".sapUiTableCHA"
			},
			rows : {
				ignore : function(oTable){
					//it is ugly to show overlays on the rows if no data is visible
					return TableUtils.isNoDataVisible(oTable);
				}
			},
			// fake aggregations with a dom ref pointing to scrollbars
			// since scrollbars aren't part of columns aggregation dom ref, this is needed to allow overlay scrolling
			hScroll : {
				ignore: false,
				domRef : function(oTable) {
					return oTable.$("hsb").get(0);
				}
			},
			vScroll : {
				ignore: false,
				domRef : function(oTable) {
					return oTable.$("vsb").get(0);
				}
			}
		},
		scrollContainers: [
			{
				domRef: function(oTable) {
					return oTable.$("sapUiTableCnt").get(0);
				},
				aggregations: ["rows"]
			}
		]
	};

});