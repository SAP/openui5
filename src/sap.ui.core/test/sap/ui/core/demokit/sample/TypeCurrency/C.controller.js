sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
	function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.TypeCurrency.C", {

		_data : {
			"number" : ["99.99","$"]
		},

		onInit : function (evt) {
			var oModel = new JSONModel(this._data);
			this.getView().setModel(oModel);
		}
	});
});
