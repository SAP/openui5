sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'../Formatter',
	'sap/ui/model/json/JSONModel'
], function ( Controller, Formatter,JSONModel) {
	"use strict";


	return Controller.extend("sap.uxap.sample.ObjectPageSubSectionHiddenTitle.controller.ObjectPageSubSectionHiddenTitle", {

			onInit: function () {

				// set explored app's demo model on this sample
				var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
				this.getView().setModel(oModel);
			}
	});

});

