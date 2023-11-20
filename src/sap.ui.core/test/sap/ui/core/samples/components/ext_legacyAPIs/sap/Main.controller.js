sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Log, Controller, JSONModel) {
	"use strict";

	var MainController = Controller.extend("samples.components.ext_legacyAPIs.sap.Main", {

		onInit : function () {
			Log.info("samples.components.ext_legacyAPIs.sap.Main - onInit");

			var model = new JSONModel();
			model.setData({
				number: 42
			});
			this.getView().setModel(model);
		},

		destroySub2View: function() {
			this.byId("sub2View").destroy();
		},

		formatNumber: function(iNumber) {
			return "000" + iNumber;
		}

	});

	return MainController;

});
