sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, Controller, History, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.MusicArtists.PublicationObjectPage", {
		_onObjectMatched : function (oEvent) {
			var oEventArguments = oEvent.getParameter("arguments"),
				oView = this.getView(),
				oPublicationContext = oView.getModel()
					.bindContext("/"
						+ oEventArguments.artistPath
						+ "/"
						+ oEventArguments.publicationPath)
					.getBoundContext();

			oView.setBindingContext(oPublicationContext);
			oPublicationContext.requestObject("IsActiveEntity").then(function (bIsActiveEntity) {
				oView.getModel("ui-op").setProperty("/bEditMode", !bIsActiveEntity);
			});
		},

		onBack : function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			this.getView().getModel("ui-op").setProperty("/bEditMode", false);
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getOwnerComponent().getRouter().navTo("masterList", null, true);
			}
		},

		onInit : function () {
			var oRouter = UIComponent.getRouterFor(this);

			oRouter.getRoute("publicationObjectPage")
				.attachPatternMatched(this._onObjectMatched, this);
			this.getView().setModel(new JSONModel({bEditMode : false}), "ui-op");
		}
	});
});
