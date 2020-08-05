sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/base/Log"
], function (MessageToast, Controller, Log) {
	"use strict";

	return Controller.extend("sap.m.sample.SplitApp.C", {

		onInit: function () {
			this.getSplitAppObj().setHomeIcon({
				'phone': 'phone-icon.png',
				'tablet': 'tablet-icon.png',
				'icon': 'desktop.ico'
			});
		},

		onOrientationChange: function (oEvent) {
			var bLandscapeOrientation = oEvent.getParameter("landscape"),
				sMsg = "Orientation now is: " + (bLandscapeOrientation ? "Landscape" : "Portrait");
			MessageToast.show(sMsg, { duration: 5000 });
		},

		onPressNavToDetail: function () {
			this.getSplitAppObj().to(this.createId("detailDetail"));
		},

		onPressDetailBack: function () {
			this.getSplitAppObj().backDetail();
		},

		onPressMasterBack: function () {
			this.getSplitAppObj().backMaster();
		},

		onPressGoToMaster: function () {
			this.getSplitAppObj().toMaster(this.createId("master2"));
		},

		onListItemPress: function (oEvent) {
			var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();

			this.getSplitAppObj().toDetail(this.createId(sToPageId));
		},

		onPressModeBtn: function (oEvent) {
			var sSplitAppMode = oEvent.getSource().getSelectedButton().getCustomData()[0].getValue();

			this.getSplitAppObj().setMode(sSplitAppMode);
			MessageToast.show("Split Container mode is changed to: " + sSplitAppMode, { duration: 5000 });
		},

		getSplitAppObj: function () {
			var result = this.byId("SplitAppDemo");
			if (!result) {
				Log.info("SplitApp object can't be found");
			}
			return result;
		}

	});
});