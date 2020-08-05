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

			var sRange = Device.media.getCurrentRange("Std");
			this._setRangeModel(sRange);

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
			var oButton = oEvent.oSource;

			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment("sap.m.sample.ToolbarResponsive.ActionSheet", this);
				this.getView().addDependent(this._actionSheet);
			}

			//delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			setTimeout(function () {
				this._actionSheet.openBy(oButton);
			}.bind(this), 0);
		},

		onPress: function (oEvent) {
			MessageToast.show(oEvent.oSource.getText());
		}
	});


	return PageController;

});
