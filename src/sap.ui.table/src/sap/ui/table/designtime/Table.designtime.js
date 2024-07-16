/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.table.Table control
sap.ui.define([
	"sap/ui/table/rowmodes/Type"
], function(
	RowModeType
) {
	"use strict";

	return {
		domRef: function(oTable) {
			const vRowMode = oTable.getRowMode();
			let bIsTableInAutoMode = false;

			if (vRowMode) {
				bIsTableInAutoMode = vRowMode === RowModeType.Auto || vRowMode.isA("sap.ui.table.rowmodes.Auto");
			}

			if (bIsTableInAutoMode) {
				//control domRef has height:0px set, but footer & scrollbar is missing
				return oTable.$("sapUiTableCnt").get(0);
			}

			return oTable.getDomRef();
		},
		aggregations: {
			columns: {
				domRef: ".sapUiTableCHA"
			},
			rows: {
				ignore: true
			},
			// fake aggregations with a dom ref pointing to scrollbars
			// since scrollbars aren't part of columns aggregation dom ref, this is needed to allow overlay scrolling
			hScroll: {
				ignore: false,
				domRef: function(oTable) {
					return oTable.$("hsb").get(0);
				}
			},
			// vertical scroll is not possible because it is not a common scorll of controls. The controls keeps the same on scrolling, just the data is changing
			scrollContainers: [
				{
					domRef: function(oTable) {
						return oTable.$("sapUiTableCnt").get(0);
					},
					aggregations: ["rows"]
				}
			]
		}
	};

});