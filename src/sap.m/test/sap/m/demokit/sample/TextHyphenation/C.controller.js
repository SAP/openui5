sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.TextHyphenation.C", {

		onInit: function () {
			var oModel = new JSONModel({data: {}});
			this.getView().setModel(oModel);
		},
		onSliderMoved: function (event) {
			var value = event.getParameter("value");
			this.byId("containerLayout").setWidth(value + "%");
		},
		onHyphenationChange: function(oEvent) {
			var wrappingTypeValue = oEvent.getParameter("state") ? "Hyphenated" : "Normal";

			for (var i = 0; i < 5; i++) {
				this.byId("text" + i).setWrappingType(wrappingTypeValue);

			}
		}
	});

	return CController;

});
