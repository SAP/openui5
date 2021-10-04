sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
		"use strict";

		return Controller.extend("sap.m.sample.MaskInput.Page", {

			onInit: function () {
				// create model
				var oModel = new JSONModel();
				oModel.setData({
					showClearIcon: true
				});
				this.getView().setModel(oModel);
			}
		});
	});
