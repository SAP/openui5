sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel"
], function (Controller, History, JSONModel) {
	"use strict";

	var sNamespace = "com.sap.gateway.srvd.sadl_gw_appmusicdr_definition.v0001.";

	return Controller.extend("sap.ui.core.sample.odata.v4.MusicArtists.ObjectPage", {
		_onObjectMatched : function (oEvent) {
			var oView = this.getView(),
				oArtistContext = oView.getModel()
					.bindContext("/" + oEvent.getParameter("arguments").artistPath, null,
						{$$patchWithoutSideEffects : true})
					.getBoundContext();

			this.oActiveArtistContext = null;
			this.byId("objectPageForm").setBindingContext(oArtistContext);
			oArtistContext.requestObject("IsActiveEntity").then(function (bIsActiveEntity) {
				oView.getModel("ui-op").setProperty("/bEditMode", !bIsActiveEntity);
			});
		},

		onBack : function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			this.getView().getModel("ui-op").setProperty("/bEditMode", false);
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getOwnerComponent().getRouter().navTo("masterlist", null, true);
			}
		},

		onDiscardPress : function () {
			var oView = this.getView(),
				that = this;

			oView.setBusy(true);
			oView.getModel("ui-op").setProperty("/bEditMode", false);
			this.byId("objectPageForm").getBindingContext().delete().then(function () {
				if (that.oActiveArtistContext) {
					// show the active entity again
					that.byId("objectPageForm").setBindingContext(that.oActiveArtistContext);
				} else {
					// we started with a newly created entity so go back to master list
					sap.ui.core.UIComponent.getRouterFor(that).navTo("masterlist", true);
				}
				oView.setBusy(false);
			});
		},

		onEditPress : function () {
			var oView = this.getView(),
				that = this;

			oView.setBusy(true);
			// remember the active version to restore it on discard
			this.oActiveArtistContext = this.byId("objectPageForm").getBindingContext();
			oView.getModel().bindContext(sNamespace + "EditAction(...)", this.oActiveArtistContext,
					{$$inheritExpandSelect : true, $$patchWithoutSideEffects : true})
				.setParameter("PreserveChanges", false)
				.execute()
				.then(function (oInactiveArtistContext) {
					that.byId("objectPageForm").setBindingContext(oInactiveArtistContext);
					oView.getModel("ui-op").setProperty("/bEditMode", true);
					oView.setBusy(false);
			});
		},

		onInit : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.getRoute("objectpage").attachPatternMatched(this._onObjectMatched, this);
			this.getView().setModel(new JSONModel({bEditMode : false}), "ui-op");
		},

		onSavePress : function () {
			var oView = this.getView(),
				that = this;

			oView.setBusy(true);
			oView.getModel().bindContext(sNamespace + "ActivationAction(...)",
					this.byId("objectPageForm").getBindingContext(),
					{$$inheritExpandSelect : true, $$patchWithoutSideEffects : true})
				.execute()
				.then(function (oActiveArtistContext) {
					that.byId("objectPageForm").setBindingContext(oActiveArtistContext);
					oView.getModel("ui-op").setProperty("/bEditMode", false);
					oView.setBusy(false);
			});
		}
	});
});
