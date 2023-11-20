sap.ui.define([
	'sap/m/App',
	'sap/ui/core/UIComponent',
	'sap/ui/core/mvc/XMLView'
], function (App, Component, XMLView) {
	"use strict";

	var OPC = Component.extend("testdata.mvc.stashed.Component", {
		metadata: {
			version: "1.0",
			manifest: "json"
		},
		createContent: function() {
			var oApp = new App();
			var oModel = this.getModel();
			var oMetaModel = oModel.getMetaModel();
			oMetaModel.loaded().then(function() {
				return XMLView.create({
				   viewName: "testdata.mvc.stashed.OP",
				   models : oModel,
				   preprocessors : {
					   xml : {
						   bindingContexts : {
							   "meta" : oMetaModel.getMetaContext("/BusinessPartnerSet")
						   },
						   models : {
							   "meta" : oMetaModel
							}
						}
					}
				});
			}).then(function(oView) {
				oApp.addPage(oView);
			});
			return oApp;
		}
	});

	return OPC;

});
