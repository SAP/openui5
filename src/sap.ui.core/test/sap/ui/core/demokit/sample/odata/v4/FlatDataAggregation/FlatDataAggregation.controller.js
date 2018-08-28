/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend(
			"sap.ui.core.sample.odata.v4.FlatDataAggregation.FlatDataAggregation", {
		onBeforeRendering : function () {
//TODO
//			var oTable = this.byId("table");
//
//			oTable.setBindingContext(oTable.getBinding("rows").getHeaderContext(), "headerContext");
//			oTable.setModel(oTable.getModel(), "headerContext");
		},

		onRefresh : function (oEvent) {
			this.byId("table").getBinding("items").refresh();
		}
	});
});