sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (jQuery, Controller, JSONModel) {
	"use strict";


	return Controller.extend("sap.f.sample.DynamicPageFreeStyle.DynamicPageFreeStyle", {
		onInit: function () {
			this.oModel = new JSONModel();
			this.oModel.loadData(jQuery.sap.getModulePath("sap.f.sample.DynamicPageListReport", "/model.json"), null, false);
			this.getView().setModel(this.oModel);
		},
		getPage : function() {
			return this.getView().byId("dynamicPageId");
		},
		onToggleFooter: function () {
			this.getPage().setShowFooter(!this.getPage().getShowFooter());
		}
	});
});