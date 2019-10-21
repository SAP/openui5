sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.QuickViewCardScrollBar.QuickViewCardScrollBar", {

		onInit: function () {
			// load JSON sample data
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/m/sample/QuickViewCardScrollBar/model/data.json"));
			this.getView().setModel(oModel);
		},

		onBeforeRendering: function () {
			var oButton = this.byId('buttonBack');
			oButton.setEnabled(false);
		},

		onAfterRendering: function () {
			/* This code is for the purposes of the example only so that the QuickViewCard can be scrolled properly	on iPhone. */
			var oPageContent = this.byId("quickViewCardExamplePage").getDomRef("cont");

			oPageContent.addEventListener("touchmove", function (oEvent) {
				oEvent.stopPropagation();
			});
			/* This code is for the purposes of the example only so that the QuickViewCard can be scrolled properly	on iPhone. */

			this.byId("quickViewCardContainer").$().css("maxWidth", "320px");
		},

		onButtonBackClick: function () {
			var oQuickViewCard = this.byId("quickViewCard");
			oQuickViewCard.navigateBack();
		},

		onScrollSwitchChange: function (oEvent) {
			var oQuickViewCard = this.byId("quickViewCard");
			oQuickViewCard.setShowVerticalScrollBar(oEvent.getParameters().state);

			// QuickViewCards gets re-rendered (first page is opened) - there is no need of "Back" button
			var oButton = this.byId("buttonBack");
			oButton.setEnabled(false);
		},

		onHeaderSwitchChange: function (oEvent) {
			var oModel = this.getView().getModel(),
				aPages = oModel.getProperty("/pages");

			if (oEvent.getParameters().state) {
				aPages[0].title = "Adventure Company";
				aPages[0].icon = "sap-icon://building";
				aPages[0].description = "John Doe";
			} else {
				aPages[0].title = "";
				aPages[0].icon = "";
				aPages[0].description = "";
			}
			oModel.setProperty("/pages", aPages);

			// QuickViewCards gets re-rendered (first page is opened) - there is no need of "Back" button
			var oButton = this.byId("buttonBack");
			oButton.setEnabled(false);
		},

		onNavigate: function (oEvent) {
			var oButton = this.byId("buttonBack");
			oButton.setEnabled(!oEvent.getParameter("isTopPage"));
		}

	});
});