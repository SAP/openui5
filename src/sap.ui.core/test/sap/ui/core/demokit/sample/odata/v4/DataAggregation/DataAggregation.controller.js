/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/json/JSONModel"
], function (MessageToast, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.DataAggregation.DataAggregation", {
		onBeforeRendering : function () {
			var oTable = this.byId("table");

			oTable.setBindingContext(oTable.getBinding("rows").getHeaderContext(), "headerContext");
			oTable.setModel(oTable.getModel(), "headerContext");
		},

		onInit : function () {
			this.getView().setModel(new JSONModel({
				iMessages : 0
			}), "ui");
			this.initMessagePopover("showMessages");
		},

		onToggleExpand : function (oEvent) {
			// get the context from the button's row
			var oRowContext = oEvent.getSource().getBindingContext();

			if (oRowContext.isExpanded()) {
				MessageToast.show("collapse not implemented yet");
			} else {
				oRowContext.expand();
			}
		}
	});
});