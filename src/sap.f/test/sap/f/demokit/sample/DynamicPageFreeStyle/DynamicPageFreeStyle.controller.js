sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (jQuery, Controller, JSONModel) {
	"use strict";


	return Controller.extend("sap.f.sample.DynamicPageFreeStyle.DynamicPageFreeStyle", {
		onInit: function () {
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);
		},
		getPage : function() {
			return this.getView().byId("dynamicPageId");
		},
		onToggleFooter: function () {
			this.getPage().setShowFooter(!this.getPage().getShowFooter());
		}
	});
});