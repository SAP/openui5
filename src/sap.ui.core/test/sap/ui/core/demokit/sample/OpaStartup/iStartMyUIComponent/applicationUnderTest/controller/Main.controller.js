sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.sample.appUnderTest.controller.Main", {
		onInit: function () {
			var that = this;
			// delays must be less than 1000ms to avoid the long timeout check
			// must be different from one another to avoid long polling check
			setTimeout(function () {
				setTimeout(function(){
					setTimeout(function(){
						setTimeout(function(){
							var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
							that.getView().setModel(oModel);
						},993);
					},992);
				},991);
			},990);
		}
	});

});