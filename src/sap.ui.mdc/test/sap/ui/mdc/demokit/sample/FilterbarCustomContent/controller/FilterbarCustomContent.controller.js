sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Messaging",
	"../model/formatter",
	// In order to have a correctly working custom control, we need to import and load all relevant data types.
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/type/Int32"
], function(
	Controller,
	JSONModel,
	Messaging,
	formatter
) {
	"use strict";

	return Controller.extend("mdc.sample.controller.FilterbarCustomContent", {
		formatter: formatter,
		mConditions: new Map(),
		onInit: function() {
			const oView = this.getView();
			Messaging.registerObject(oView, true);

			const oModel = new JSONModel({
				conditionsText: "",
				editorHeight: 400
			});
			this.getView().setModel(oModel);
			this.initConditionsText();
		},
		handleFiltersChanged: function(oEvent) {
			const oConditions = oEvent.getSource().getConditions();
			this.updateConditionsText(oConditions);
		},
		initConditionsText: function() {
			const oFilterbar = this.getView().byId("customFilterbar");
			const oConditions = oFilterbar.getConditions();
			this.updateConditionsText(oConditions);
		},
		updateConditionsText: function(oConditions) {
			const oModel = this.getView().getModel();
			if (!oModel) {
				return;
			}
			const sConditions = JSON.stringify(oConditions, "\t", 4);
			oModel.setProperty("/conditionsText", sConditions);
		}
	});
});
