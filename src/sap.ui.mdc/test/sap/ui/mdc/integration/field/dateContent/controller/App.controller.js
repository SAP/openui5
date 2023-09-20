sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (Controller, UIComponent, JSONModel) {
	"use strict";

	const oFieldDate = new Date(2022, 10, 28, 12, 45, 52);

	return Controller.extend("sap.ui.mdc.integration.field.dateContent.controller.App", {
		onInit: function () {
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
			const oDataModel = new JSONModel({
				date: oFieldDate,
				dateTime: oFieldDate,
				time: oFieldDate
			});
			this.getView().setModel(oDataModel, "data");
		}
	});
});
