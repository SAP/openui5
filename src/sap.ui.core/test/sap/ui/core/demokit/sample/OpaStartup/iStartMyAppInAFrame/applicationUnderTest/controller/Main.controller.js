sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("appUnderTest.controller.Main", {
		onInit: function () {
			var that = this;
			// delays must be less than 1000ms to avoid the long timeout check
			// must be different from one another to avoid long polling check
			// should not be very long as we start tracking after UI5 is bootstrapped and so we loose the first 11-13 timeouts
			// and so there is a high chance that we will be able to synchronize before being able to track and wait for the next timeout
			// in real apps this is not a problem because there are no such long timeouts that are real work that must be waited
			function delay(count) {
				setTimeout(function() {
					if (count == 0) {
						var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
						that.getView().setModel(oModel);
					} else {
						delay(count - 1);
					}
				},100 + count);
			}
			delay(40);
		}
	});

});