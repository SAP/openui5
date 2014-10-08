sap.ui.controller("sap.m.sample.ToolbarResponsive.Page", {

	onInit : function () {
		var oMediaModel = new sap.ui.model.json.JSONModel();
		this.getView().setModel(oMediaModel, "range");

		var sRange = sap.ui.Device.media.getCurrentRange("Std");
		this._setRangeModel(sRange);

		var that = this;
		sap.ui.Device.media.attachHandler(function (mParams) {
			that._setRangeModel(mParams.name);
		}, null, "Std");
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
		jQuery.sap.delayedCall(0, this, function () {
			this._actionSheet.openBy(oButton);
		});
	},

	onPress: function (oEvent) {
		sap.m.MessageToast.show(oEvent.oSource.getText());
	}
});
