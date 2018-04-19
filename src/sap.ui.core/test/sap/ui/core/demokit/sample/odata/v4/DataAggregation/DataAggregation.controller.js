/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.DataAggregation.DataAggregation", {
		onBeforeRendering : function () {
			var oTable = this.byId("table");

			oTable.setBindingContext(oTable.getBinding("rows").getHeaderContext(), "headerContext");
			oTable.setModel(oTable.getModel(), "headerContext");
		}
	});
});