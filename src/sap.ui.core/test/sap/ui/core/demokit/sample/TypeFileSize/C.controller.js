sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/format/FileSizeFormat',
		'sap/ui/model/json/JSONModel'
	], function (Controller, FileSizeFormat, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.TypeFileSize.C", {

		_data : {
			"fileSize" : 100
		},

		onInit : function (evt) {
			var oModel = new JSONModel(this._data);
			this.getView().setModel(oModel);
		}
	});
});
