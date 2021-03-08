sap.ui.define([
	"./RevealGrid/RevealGrid",
	"sap/ui/core/mvc/Controller"
], function (RevealGrid, Controller) {
	"use strict";

	return Controller.extend("sap.ui.layout.sample.ProductHomeLayout.C", {

		onInit: function () {
			this.byId("logonRequestsCard").setManifest(this.formatSrc("cards/LogonRequestsCard/manifest.json"));
			this.byId("usersCard").setManifest(this.formatSrc("cards/UsersCard/manifest.json"));
		},

		onExit: function () {
			RevealGrid.destroy("mainGrid", this.getView());
			RevealGrid.destroy(this._getAllGroupsIds(), this.getView());
		},

		onRevealGridGroups: function () {
			RevealGrid.toggle(this._getAllGroupsIds(), this.getView(), this.byId("scrollCont"));
		},

		onRevealGridMain: function () {
			RevealGrid.toggle("mainGrid", this.getView(), this.byId("scrollCont"), true);
		},

		onTilePress: function () { },

		onLayoutChangeMain: function (oEvent) {
			var oHomeModel = this.getView().getModel("home"),
				sCurrentLayout = oEvent.getParameter("layout");

			oHomeModel.setProperty("/currentBreakpoint", sCurrentLayout);

			this._getAllGroupsIds().forEach(function (sGroupId) {
				var iCurrCols = oHomeModel.getProperty("/layout/" + sGroupId + "/columns/" + sCurrentLayout);

				if (!iCurrCols) {
					iCurrCols = oHomeModel.getProperty("/layout/" + sGroupId + "/columns/default");
				}

				oHomeModel.setProperty("/layout/" + sGroupId + "/columns/current", iCurrCols);
			});

		},

		onColumnsChange: function (oEvent) {

			// Depending on the available grid columns
			// the width of some cards can be adapted
			// to use more of the space

			var iGridColumns = oEvent.getParameter("columns"),
				oUsersCardLayoutData = this.getView().byId("usersCard").getLayoutData(),
				oUpfCardLayoutData = this.getView().byId("upfCard").getLayoutData(),
				iCardColumns = iGridColumns < 14 ? 4 : 5;

			oUsersCardLayoutData.setColumns(iCardColumns);
			oUpfCardLayoutData.setColumns(iCardColumns);
		},

		formatSrc: function (sSrc) {
			return sap.ui.require.toUrl("sap/ui/layout/sample/ProductHomeLayout/" + sSrc);
		},

		_getAllGroupsIds: function () {
			return [
				"group1",
				"group2",
				"group3",
				"group4"
			];
		}
	});

});