sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
	function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.TypeFileSize.C", {
		
		_data : {
			"fileSize" : 100
		},

		onInit : function (evt) {
			var fsf = sap.ui.core.format.FileSizeFormat.getInstance(100);
			var fsData = {"fileSize" : fsf};
			var oModel = new JSONModel(this._data);
			this.getView().setModel(oModel);
		}
	});
});
