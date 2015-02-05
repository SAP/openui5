sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
	function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.TypeFloat.C", {

		_data : {
			"number" : "123.456"
		},

		onInit : function (evt) {
			var oModel = new JSONModel(this._data);
			this.getView().setModel(oModel);
		}
	});
});
