sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	var mode = "";

	return Controller.extend("flexiblecolumnlayout.FlexibleColumnLayout", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oFCL = this.byId("fcl");

			this.oRouter.attachRouteMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var sRouteName = oEvent.getParameter("name");
			var bFullScreen = oEvent.getParameters().arguments.fs === "fs";
			var sFullScreenColumn = "None";

			if (bFullScreen) {
				if (sRouteName === "detail") {
					sFullScreenColumn = "Mid";
				}
				if (sRouteName === "detailDetail") {
					sFullScreenColumn = "End";
				}
			}

			oModel.setProperty("/fullScreenColumn", sFullScreenColumn);
		},

		onLayoutChanged: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();

			var iBegin = oEvent.getParameter("beginColumnWidth"),
				iMid = oEvent.getParameter("midColumnWidth"),
				iEnd = oEvent.getParameter("endColumnWidth"),
				iMaxColumnsCount = oEvent.getParameter("maxColumnsCount"),
				sLayout = iBegin + "/" + iMid + "/" + iEnd;

			if (iMaxColumnsCount === 1) {

				oModel.setProperty("/detail/fullScreenButton/visible", false);
				oModel.setProperty("/detail/closeButton/visible", true);
				oModel.setProperty("/detailDetail/fullScreenButton/visible", false);
				oModel.setProperty("/detailDetail/closeButton/visible", true);

			} else {
				if (sLayout === "67/33/0" || sLayout === "33/67/0") {
					oModel.setProperty("/detail/fullScreenButton/icon", "sap-icon://full-screen");
					oModel.setProperty("/detail/fullScreenButton/visible", true);
					oModel.setProperty("/detail/closeButton/visible", true);
				}

				if (sLayout === "25/50/25" || sLayout === "25/25/50" || sLayout === "0/67/33") {
					oModel.setProperty("/detail/fullScreenButton/visible", false);
					oModel.setProperty("/detail/closeButton/visible", false);
					oModel.setProperty("/detailDetail/fullScreenButton/icon", "sap-icon://full-screen");
					oModel.setProperty("/detailDetail/fullScreenButton/visible", true);
					oModel.setProperty("/detailDetail/closeButton/visible", true);
				}

				if (sLayout === "0/100/0") {
					oModel.setProperty("/detail/fullScreenButton/icon", "sap-icon://exit-full-screen");
					oModel.setProperty("/detail/fullScreenButton/visible", true);
					oModel.setProperty("/detail/closeButton/visible", true);
				}

				if (sLayout === "0/0/100") {
					oModel.setProperty("/detailDetail/fullScreenButton/icon", "sap-icon://exit-full-screen");
					oModel.setProperty("/detailDetail/fullScreenButton/visible", true);
					oModel.setProperty("/detailDetail/closeButton/visible", true);
				}
			}
		}
	});
}, true);
