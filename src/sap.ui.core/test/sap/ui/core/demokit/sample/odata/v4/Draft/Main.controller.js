/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Draft.Main", {

		onExit : function () {
			this.oUIModel.destroy(); // avoid changes on UI elements if this view destroys
			Controller.prototype.onExit.apply(this);
		},

		onInit : function () {
			var oUIModel,
				oView = this.getView(),
				that = this;

			this.oUIModel = oUIModel = new JSONModel({
				sError : "",
				iMessages : 0,
				oProductsTable : null,
				bShowList : true,
				sShowListIcon : "sap-icon://close-command-field",
				sShowListTooltip : "Hide List"
			});
			oView.setModel(this.oUIModel, "ui");

			oView.getModel().attachDataReceived(function (oEvent) {
				var oError = oEvent.getParameter("error");

				if (oError) {
					if (oError.cause) {
						// Ignore follow-up errors, take the root cause error
						oError = oError.cause;
					}

					if (!oUIModel.getProperty("/sError")) {
						oUIModel.setProperty("/sError", "Entity: " + oEvent.getParameter("path")
							 + " " + oError.toString());
						UIComponent.getRouterFor(that).navTo("error", {}, true);
					}
				}
			});
		}
	});
});
