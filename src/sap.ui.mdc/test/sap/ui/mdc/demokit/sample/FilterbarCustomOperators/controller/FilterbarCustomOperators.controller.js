sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/condition/FilterConverter",
	"../Operators",
	"../model/formatter",
	// In order to have a correctly working custom operator, we need to import and load all relevant data types.
	"sap/ui/model/type/String",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Boolean",
	"sap/ui/model/type/Float",
	"sap/ui/model/odata/type/Date"
], function(
	Controller,
	JSONModel,
	FilterConverter,
	Operators,
	formatter
) {
	"use strict";

	return Controller.extend("mdc.sample.controller.FilterbarCustomOperators", {
		formatter: formatter,
		onInit: function() {
			const oModel = new JSONModel({
				conditionsText: "",
				modelFilterText: "",
				editorHeight: 400
			});
			this.getView().setModel(oModel);
			this.initConditionsText();
		},
		handleFiltersChanged: function(oEvent) {
			const oFilterbar = oEvent.getSource();
			const oConditions = oFilterbar.getConditions();
			this.updateConditionsText(oConditions, oFilterbar);
		},
		initConditionsText: function() {
			const oFilterbar = this.getView().byId("mountainsFilterbar");
			const oConditions = oFilterbar.getConditions();
			this.updateConditionsText(oConditions, oFilterbar);
		},
		updateConditionsText: function(oConditions, oFilterbar) {
			const oModel = this.getView().getModel();
			if (!oModel) {
				return;
			}

			const oConditionTypes = FilterConverter.createConditionTypesMapFromFilterBar(oConditions, oFilterbar);
			const oModelFilter = FilterConverter.createFilters(oConditions, oConditionTypes);

			const sConditions = JSON.stringify(oConditions, "\t", 4);
			const sModelFilter = this.stringifyModelFilter(oModelFilter);
			oModel.setProperty("/conditionsText", sConditions);
			oModel.setProperty("/modelFilterText", sModelFilter);
		},
		stringifyModelFilter: function(oModelFilter) {
			if (!oModelFilter) {
				return "{}";
			}
			const oCleanObject = JSON.parse(JSON.stringify(oModelFilter));
			delete oCleanObject._bMultiFilter;
			if ("aFilters" in oCleanObject){
				oCleanObject.aFilters.forEach((oFilter) => {
					delete oFilter._bMultiFilter;
					if ("aFilters" in oFilter) {
						oFilter.aFilters.forEach((oFilter) => {
							delete oFilter._bMultiFilter;
						});
					}
				});
			}

			return JSON.stringify(oCleanObject, "\t", 4);
		}
	});
});
