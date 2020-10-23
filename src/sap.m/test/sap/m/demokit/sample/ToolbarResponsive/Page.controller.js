sap.ui.define([
		'sap/m/MessageToast',
		'sap/ui/Device',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(MessageToast, Device, Fragment, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.ToolbarResponsive.Page", {

		onInit : function () {
			var oMediaModel = new JSONModel();
			this.getView().setModel(oMediaModel, "range");

			var oRange = Device.media.getCurrentRange("Std");
			this._setRangeModel(oRange.name);

			Device.media.attachHandler(function (mParams) {
				this._setRangeModel(mParams.name);
			}.bind(this), null, "Std");
		},

		_setRangeModel : function (sRange) {
			var bIsPhone = sRange === "Phone",
				bIsTablet = sRange === "Tablet";

			this.getView().getModel("range").setData({
				isPhoneOrTablet : bIsPhone || bIsTablet,
				isNotPhoneOrTablet : !(bIsPhone || bIsTablet),
				isTablet : bIsTablet,
				isNoTablet : !bIsTablet,
				isPhone : bIsPhone,
				isNoPhone : !bIsPhone
			});
		},

		onOpen: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView();

			if (!this._pActionSheet) {
				this._pActionSheet = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.ToolbarResponsive.ActionSheet",
					controller: this
				}).then(function(oActionSheet){
					oView.addDependent(oActionSheet);
					return oActionSheet;
				});
			}

			this._pActionSheet.then(function(oActionSheet){
				oActionSheet.openBy(oButton);
			});
		},

		onPress: function (oEvent) {
			MessageToast.show(oEvent.getSource().getText());
		}
	});

	return PageController;

});
