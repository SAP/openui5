sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/Filter',
	'sap/ui/model/json/JSONModel'
], function(jQuery, Controller, Filter, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.DynamicPageListReport.DynamicPageListReport", {
		onInit: function () {
			this.oModel = new JSONModel();
			this.oModel.loadData(jQuery.sap.getModulePath("sap.m.sample.DynamicPageListReport", "/model.json"));
			this.getView().setModel(this.oModel);

			this.aKeys = ["Name", "Category", "SupplierName"];
			this.oSelectName = this.getSelect("slName");
			this.oSelectCategory = this.getSelect("slCategory");
			this.oSelectSupplierName = this.getSelect("slSupplierName");
		},

		onExit: function () {
			this.aKeys = [];
			this.aFilters = [];
			this.oModel = null;
		},

		onToggleFooter : function () {
			this.getPage().setShowFooter(!this.getPage().getShowFooter());
		},

		onSelectChange: function() {
			var aCurrentFilterValues = [];

			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectName));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectCategory));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectSupplierName));

			this.filterTable(aCurrentFilterValues);
		},

		filterTable: function (aCurrentFilterValues) {
			this.getTableItems().filter(this.getFilters(aCurrentFilterValues));
			this.updateFilterCriterias(this.getFilterCriterias(aCurrentFilterValues));
		},

		updateFilterCriterias : function (aFilterCriterias) {
			if (aFilterCriterias.length > 0) { /* We can`t use a single label and change only the model data, */
				this.removeSnappedLabel(); /* because in case of label with an empty text, */
				this.addSnappedLabel(); /* a space for the snapped content will be allocated and can lead to title misalignment */
				this.oModel.setProperty("/Filter/text", this.getFormattedSummaryText(aFilterCriterias));
			} else {
				this.removeSnappedLabel();
			}
		},

		addSnappedLabel : function() {
			this.getPageTitle().addSnappedContent(this.getSnappedLabel());
		},

		removeSnappedLabel : function() {
			this.getPageTitle().destroySnappedContent();
		},

		getFilters: function (aCurrentFilterValues) {
			this.aFilters = [];

			this.aFilters = this.aKeys.map(function (sCriteria, i) {
				return new sap.ui.model.Filter(sCriteria, sap.ui.model.FilterOperator.Contains, aCurrentFilterValues[i]);
			});

			return this.aFilters;
		},
		getFilterCriterias : function (aCurrentFilterValues){
			return this.aKeys.filter(function (el, i) {
				if (aCurrentFilterValues[i] !== "") return  el;
			});
		},
		getFormattedSummaryText : function (aFilterCriterias) {
				return "Filtered by: " + aFilterCriterias.join(", ");
		},

		getTable : function () {
			return this.getView().byId("idProductsTable");
		},
		getTableItems : function () {
			return this.getTable().getBinding("items");
		},
		getSelect : function (sId) {
			return this.getView().byId(sId);
		},
		getSelectedItemText : function (oSelect) {
			return oSelect.getSelectedItem() ? oSelect.getSelectedItem().getKey() : "";
		},
		getPage : function() {
			return this.getView().byId("dynamicPageId");
		},
		getPageTitle: function() {
			return this.getPage().getTitle();
		},
		getSnappedLabel : function () {
			return new sap.m.Label({text: "{/Filter/text}"});
		}
	});
});