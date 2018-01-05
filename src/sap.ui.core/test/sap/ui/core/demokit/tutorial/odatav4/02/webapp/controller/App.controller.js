sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.demo.odatav4.controller.App", {

		/**
		 *  Hook for initializing the controller
		 */
		onInit : function () {
			var oJSONData = {
				busy : false
			};
			var oModel = new JSONModel(oJSONData);
			this.getView().setModel(oModel, "appView");
		},

		/* =========================================================== */
		/*           begin: event handlers                             */
		/* =========================================================== */

		/**
		 * Refresh the data.
		 */
		onRefresh : function () {
			var oBinding = this.byId("people").getBinding("items");

			if (oBinding && oBinding.hasPendingChanges()) {
				MessageBox.error(this._getText("refreshFailedMessage"));
				return;
			}
			oBinding.refresh();
		},

		/* =========================================================== */
		/*           end: event handlers                               */
		/* =========================================================== */


		/**
		 * Convenience method for retrieving a translatable text.
		 * @param {string} sTextId - the ID of the text to be retrieved.
		 * @returns {string} the text belonging to the given ID.
		 */
		_getText : function (sTextId) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId);
		}
	});
});