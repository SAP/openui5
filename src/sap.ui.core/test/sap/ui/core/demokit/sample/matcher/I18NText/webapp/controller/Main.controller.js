sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel'
], function (Controller, JSONModel, ResourceModel) {
	"use strict";

	return Controller.extend("appUnderTest.controller.Main", {

		onInit: function () {
			// set I18N model
			var oI18NModel = new ResourceModel({ bundleName: "appUnderTest.i18n.i18n"});
			this.getView().setModel(oI18NModel, "i18n");
		},

		onLoadProducts : function () {
			if (!this.getView().getModel()) {
				// set products model
				var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
				this.getView().setModel(oModel);
			}
		},

		onListUpdated : function() {
			var oView = this.getView(),
				oData = oView.getModel().getData(),
				iCount = (oData.ProductCollection) ? oData.ProductCollection.length : 0,
				oBundle = oView.getModel("i18n").getResourceBundle(),
				sTitle = oBundle.getText("listTitle", [ iCount ]);
			oView.byId("listTitle").setText(sTitle);
		}
	});
});