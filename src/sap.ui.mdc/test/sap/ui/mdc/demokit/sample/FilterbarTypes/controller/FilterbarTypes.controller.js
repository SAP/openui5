sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../model/formatter"
], function(
	Controller,
	JSONModel,
	formatter
) {
	"use strict";

	return Controller.extend("mdc.sample.controller.FilterbarTypes", {
		formatter: formatter,
		onInit: function() {
			const oModel = new JSONModel({
				conditionsText: "",
				editorHeight: 400
			});
			this.getView().setModel(oModel);
		},
		onFiltersChanged: function(oEvent) {
			const oModel = this.getView().getModel();
			if (!oModel) {
				return;
			}

			const oConditions = this.getView().byId("mountainsFilterbar").getConditions();
			const sConditions = JSON.stringify(oConditions, "\t", 4);
			oModel.setProperty("/conditionsText", sConditions);
		}
	});
});
