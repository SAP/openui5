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
			var oArtistContext,
				oView = this.getView(),
				that = this;

			if (History.getInstance().getDirection() !== "Backwards") {
				// we came from the master list view
				oArtistContext = oView.getModel()
					.bindContext("/" + oEvent.getParameter("arguments").artistPath, null,
						{$$patchWithoutSideEffects : true})
					.getBoundContext();

				this.oActiveArtistContext = null;
				oView.setBindingContext(oArtistContext);
				oArtistContext.requestObject("IsActiveEntity").then(function (bIsActiveEntity) {
					if (!bIsActiveEntity) {
						that._attachPatchEventHandlers(oArtistContext.getBinding());
					}
					oView.getModel("ui-op").setProperty("/bEditMode", !bIsActiveEntity);
				});
			}
		},

		_navToPublication : function (sPath) {
			// make these strings router compatible :-(
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this),
				aSegments = sPath.slice(1).split("/");

			oRouter.navTo("publicationObjectPage", {
					artistPath : aSegments[0],
					publicationPath : aSegments[1]
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

		onChange : function () {
			this.bSideEffectFieldChanged = true;
		},

		onCreate : function () {
			var oEntityContext = this.getView().byId("_Publication").getBinding("items")
					.create(),
				that = this;

			oEntityContext.created().then(function () {
				that._navToPublication(oEntityContext.getPath());
			});
		},

		onDiscard : function () {
			var oView = this.getView(),
				that = this;

			oView.setBusy(true);
			this.byId("draftIndicator").clearDraftState();
			oView.getModel("ui-op").setProperty("/bEditMode", false);
			oView.getBindingContext().delete().then(function () {
				if (that.oActiveArtistContext) {
					// show the active entity again
					oView.setBindingContext(that.oActiveArtistContext);
				} else {
					// we started with a newly created entity so go back to master list
					sap.ui.core.UIComponent.getRouterFor(that).navTo("masterList", true);
				}
				oView.setBusy(false);
			});
		},

		onEdit : function () {
			var oView = this.getView(),
				that = this;

			oView.setBusy(true);
			// remember the active version to restore it on discard
			this.oActiveArtistContext = oView.getBindingContext();
			oView.getModel().bindContext(sNamespace + "EditAction(...)", this.oActiveArtistContext,
					{$$inheritExpandSelect : true, $$patchWithoutSideEffects : true})
				.setParameter("PreserveChanges", false)
				.execute()
				.then(function (oInactiveArtistContext) {
					oView.setBindingContext(oInactiveArtistContext);
					that._attachPatchEventHandlers(oInactiveArtistContext.getBinding());
					oView.getModel("ui-op").setProperty("/bEditMode", true);
					oView.setBusy(false);
			});
		},

		onInit : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.getRoute("objectPage").attachPatternMatched(this._onObjectMatched, this);
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

		onRefresh : function () {
			this.getView().getBindingContext().refresh();
		},

		onSave : function () {
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
					oView.setBindingContext(oActiveArtistContext);
					oView.getModel("ui-op").setProperty("/bEditMode", false);
					oView.setBusy(false);
			});
		},

		onSelect : function (oEvent) {
			this._navToPublication(oEvent.getSource().getBindingContext().getPath());
		},

		onValidateFieldGroup : function (oEvent) {
			if (this.bSideEffectFieldChanged) {
				this.bSideEffectFieldChanged = false;
				//TODO lock fields affected by side effects
				this.byId("objectPageForm").getBindingContext().requestSideEffects([{
//						$PropertyPath : "CountryOfOrigin"
//					}, {
						$PropertyPath : "CountryOfOrigin_Text"
					}, {
						$NavigationPropertyPath : "_Publication"
					}]).then(
						function () {
							// unlock fields affected by side effects
						},
						function () {
							// user has option to retry loading side effects or cancel
						}
					);
			}
		}
	});
});
