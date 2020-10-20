/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/m/MessageToast",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/json/JSONModel"
], function (UriParameters, MessageToast, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.DataAggregation.DataAggregation", {
		onBeforeRendering : function () {
			var oTable = this.byId("table");

			oTable.setBindingContext(oTable.getBinding("rows").getHeaderContext(), "headerContext");
			oTable.setModel(oTable.getModel(), "headerContext");
			oTable.getBinding("rows").resume(); // now that "ui" model is available...
		},

		onExit : function () {
			this.getView().getModel("ui").destroy();
		},

		onInit : function () {
			this.getView().setModel(new JSONModel({
				iMessages : 0,
				iVisibleRowCount :
					parseInt(UriParameters.fromQuery(location.search).get("visibleRowCount")) || 5
			}), "ui");
			this.initMessagePopover("showMessages");
		},

		onToggleExpand : function (oEvent) {
			// get the context from the button's row
			var oRowContext = oEvent.getSource().getBindingContext();

			if (oRowContext.isExpanded()) {
				oRowContext.collapse();
			} else {
				oRowContext.expand();
			}
		}
	});
});