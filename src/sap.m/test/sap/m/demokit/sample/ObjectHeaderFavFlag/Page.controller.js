sap.ui.define([
		'sap/m/MessageToast',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
], function(MessageToast, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.ObjectHeaderFavFlag.Page", {

		onInit : function () {

			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);

			// set local favorite model
			this.getView().setModel(new JSONModel({}), "ff");
			this._updateFFModel(true, true);
		},

		handleFavorite : function () {
			this._updateFFModel(true, null);
			MessageToast.show("The object has been favorited");
		},

		handleUnfavorite : function () {
			this._updateFFModel(false, null);
			MessageToast.show("The object has been unfavorited");
		},

		handleFlag : function () {
			this._updateFFModel(null, true);
			MessageToast.show("The object has been flagged");
		},

		handleUnflag : function () {
			this._updateFFModel(null, false);
			MessageToast.show("The object has been unflagged");
		},

		_updateFFModel : function (fav, flag) {
			var model = this.getView().getModel("ff"),
				data = model.getData();

			if (fav !== null) {
				data.isFavorite = fav;
				data.isNoFavorite = !fav;
			}
			if (flag !== null) {
				data.isFlagged = flag;
				data.isNotFlagged = !flag;
			}
			model.setData(data);
		}
	});

});