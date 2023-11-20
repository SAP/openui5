sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'../MockServer',
		'sap/ui/model/odata/v2/ODataModel'
	], function(Controller, MockServer, ODataModel) {
	"use strict";

	return Controller.extend("sap.m.sample.ComboBoxLazyLoading.controller.ComboBoxLazyLoading", {

		onInit: function() {

			MockServer.start({
				autoRespondAfter : 3000
			});

			// set explored app's demo model on this sample
			var oModel = new ODataModel("/mockserver");
			this.getView().setModel(oModel);
		},

		handleLoadItems: function(oControlEvent) {
			oControlEvent.getSource().getBinding("items").resume();
		}
	});
});