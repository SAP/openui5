sap.ui.define([
	"sap/ui/core/Messaging",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], (
	Messaging,
	Controller,
	JSONModel
) => {
	"use strict";

	return Controller.extend("mdc.sample.Controller", {

		onInit: function() {
			// init dates in Model
			const oModel = this.getView().getModel("data");
			const oDate = new Date();
			oModel.setProperty("/date", new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate()));
			oModel.setProperty("/dateTime", new Date());
			oModel.setProperty("/time", new Date("1970", "0", "1", oDate.getHours(), oDate.getMinutes(), oDate.getSeconds()));

			const oViewModel = new JSONModel({
				editMode: true
			});
			this.getView().setModel(oViewModel, "view");

			Messaging.registerObject(this.getView(), true);
		}

	});
});
