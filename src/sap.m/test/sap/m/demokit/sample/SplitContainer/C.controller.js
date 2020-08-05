sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (jQuery, MessageToast, Controller, Log, JSONModel, Device) {
	"use strict";

	return Controller.extend("sap.m.sample.SplitContainer.C", {

		onInit: function() {
			var oDeviceModel = new JSONModel(Device);
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.getView().setModel(oDeviceModel, "device");
		},

		onAfterRendering: function () {
			var oSplitCont = this.getSplitContObj(),
				ref = oSplitCont.getDomRef() && oSplitCont.getDomRef().parentNode;
			// set all parent elements to 100% height, this should be done by app developer, but just in case
			if (ref && !ref._sapUI5HeightFixed) {
				ref._sapUI5HeightFixed = true;
				while (ref && ref !== document.documentElement) {
					var $ref = jQuery(ref);
					if ($ref.attr("data-sap-ui-root-content")) { // Shell as parent does this already
						break;
					}
					if (!ref.style.height) {
						ref.style.height = "100%";
					}
					ref = ref.parentNode;
				}
			}
		},

		onPressNavToDetail: function () {
			this.getSplitContObj().to(this.createId("detailDetail"));
		},

		onPressDetailBack: function () {
			this.getSplitContObj().backDetail();
		},

		onPressMasterBack: function () {
			this.getSplitContObj().backMaster();
		},

		onPressGoToMaster: function () {
			this.getSplitContObj().toMaster(this.createId("master2"));
		},

		onListItemPress: function (oEvent) {
			var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();

			this.getSplitContObj().toDetail(this.createId(sToPageId));
		},

		onPressModeBtn: function (oEvent) {
			var sSplitAppMode = oEvent.getSource().getSelectedButton().getCustomData()[0].getValue();

			this.getSplitContObj().setMode(sSplitAppMode);
			MessageToast.show("Split Container mode is changed to: " + sSplitAppMode, { duration: 5000 });
		},

		getSplitContObj: function () {
			var result = this.byId("SplitContDemo");
			if (!result) {
				Log.error("SplitApp object can't be found");
			}
			return result;
		}

	});
});