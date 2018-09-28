sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel"
], function (MessageBox, Controller, History, JSONModel) {
	"use strict";

	var sNamespace = "com.sap.gateway.srvd.sadl_gw_appmusicdr_definition.v0001.";

	return Controller.extend("sap.ui.core.sample.odata.v4.MusicArtists.ObjectPage", {
		_attachPatchEventHandlers : function (oBinding) {
			oBinding.attachPatchSent(this.onPatchSent, this);
			oBinding.attachPatchCompleted(this.onPatchCompleted, this);
		},

		_detachPatchEventHandlers : function (oBinding) {
			oBinding.detachPatchSent(this.onPatchSent, this);
			oBinding.detachPatchCompleted(this.onPatchCompleted, this);
		},

		_onObjectMatched : function (oEvent) {
			var oView = this.getView(),
				oArtistContext = oView.getModel()
					.bindContext("/" + oEvent.getParameter("arguments").artistPath, null,
						{$$patchWithoutSideEffects : true})
					.getBoundContext(),
				that = this;

			this.oActiveArtistContext = null;
			this.byId("objectPageForm").setBindingContext(oArtistContext);
			oArtistContext.requestObject("IsActiveEntity").then(function (bIsActiveEntity) {
				if (!bIsActiveEntity) {
					that._attachPatchEventHandlers(oArtistContext.getBinding());
				}
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
			this.byId("draftIndicator").clearDraftState();
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
					that._attachPatchEventHandlers(oInactiveArtistContext.getBinding());
					oView.getModel("ui-op").setProperty("/bEditMode", true);
					oView.setBusy(false);
			});
		},

		onInit : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.getRoute("objectpage").attachPatternMatched(this._onObjectMatched, this);
			this.getView().setModel(new JSONModel({bEditMode : false}), "ui-op");
		},

		onPatchCompleted : function (oEvent) {
			if (oEvent.getParameter("success")) {
				this.byId("draftIndicator").showDraftSaved();
			} else {
				MessageBox.show("Error while saving changes", {
					icon: MessageBox.Icon.ERROR
				});
			}
		},

		onPatchSent : function () {
			this.byId("draftIndicator").showDraftSaving();
		},

		onSavePress : function () {
			var oOldBindingContext = this.byId("objectPageForm").getBindingContext(),
				oView = this.getView(),
				that = this;

			oView.setBusy(true);
			this.byId("draftIndicator").clearDraftState();
			oView.getModel().bindContext(sNamespace + "ActivationAction(...)", oOldBindingContext,
					{$$inheritExpandSelect : true, $$patchWithoutSideEffects : true})
				.execute()
				.then(function (oActiveArtistContext) {
					that._detachPatchEventHandlers(oOldBindingContext.getBinding());
					that.byId("objectPageForm").setBindingContext(oActiveArtistContext);
					oView.getModel("ui-op").setProperty("/bEditMode", false);
					oView.setBusy(false);
			});
		}
	});
});
