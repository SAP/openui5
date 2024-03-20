sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"./Routing"
], function (MessageBox, Controller, History, UIComponent, JSONModel, Routing) {
	"use strict";

	var sNamespace = "com.sap.gateway.srvd.sadl_gw_appmusicdr_definition.v0001.";

	return Controller.extend("sap.ui.core.sample.odata.v4.MusicArtists.ObjectPage", {
		/*
		 * A context pointing to the active artist; in "Discard" we set the view back to this
		 * context.
		 */
		oActiveArtistContext : null,

		/*
		 * The context that is to become the view's parent context in _onObjectMatched. This may be
		 * the return value context when "Edit" or "Save" is finished, or it is the context pointing
		 * to the latest active artist in "Discard".
		 */
		oArtistContext : null,

		_attachPatchEventHandlers : function (oBinding) {
			oBinding.attachPatchSent(this.onPatchSent, this);
			oBinding.attachPatchCompleted(this.onPatchCompleted, this);
		},

		_detachPatchEventHandlers : function (oBinding) {
			oBinding.detachPatchSent(this.onPatchSent, this);
			oBinding.detachPatchCompleted(this.onPatchCompleted, this);
		},

		_onObjectMatched : function (oEvent) {
			var oArtistContext, // The context to be set at the view
				oParentContext, // The parent context for the hidden binding
				oView = this.getView(),
				that = this;

			// We must ensure that the action bindings for "Edit" and "Save" do not become
			// dependents of the view's binding. If we do, we run into trouble when setting the
			// return value context at the view. Then the view's binding would destroy its own
			// element context which then would destroy the action binding and its return value
			// context.
			//
			// So we use a hidden binding which is not part of the view as root binding for the
			// object page. Make the action bindings for "Edit" and "Save" dependents of this
			// binding. The view gets a binding with empty path and its parent context will always
			// be the element context of the latest binding in this hidden chain.
			// Note: This cannot be done in onInit because the model is not yet available then
			this.oHiddenBinding ??= this.oView.getModel().bindContext("", null,
				{$$patchWithoutSideEffects : true});
			if (History.getInstance().getDirection() !== "Backwards") {
				if (this.oArtistContext) { // used for return value contexts or in Discard
					oArtistContext = this.oArtistContext;
					this.oArtistContext = null;
				} else {
					// We came from the master list view or a bookmark. Use the context from the
					// list that has been passed via the Routing module or create one for the given
					// path.
					oParentContext = Routing.getAndRemoveEntityContext("objectPage")
						|| oView.getModel().createBindingContext(
								"/" + oEvent.getParameter("arguments").artistPath);
					this.oHiddenBinding.setContext(oParentContext);
					oArtistContext = this.oHiddenBinding.getBoundContext();
					this.oActiveArtistContext = null;
				}
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
			var oRouter = UIComponent.getRouterFor(this),
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
				oView.setBusy(false);
				if (that.oActiveArtistContext) {
					// show the active entity again
					that.oArtistContext = that.oActiveArtistContext;
					Routing.navigateToArtist(that, that.oArtistContext, true);
				} else {
					// we started with a newly created entity so go back to master list
					UIComponent.getRouterFor(that).navTo("masterList", true);
				}
			});
		},

		onEdit : function () {
			var oView = this.getView(),
				that = this;

			oView.setBusy(true);
			// remember the active version to restore it on discard
			this.oActiveArtistContext = oView.getBindingContext();
			oView.getModel().bindContext(sNamespace + "Edit(...)", this.oActiveArtistContext,
					{$$inheritExpandSelect : true, $$patchWithoutSideEffects : true})
				.setParameter("PreserveChanges", false)
				.invoke()
				.then(function (oInactiveArtistContext) {
					oView.setBusy(false);
					that.oArtistContext = oInactiveArtistContext;
					Routing.navigateTo(that, "objectPage",
						{artistPath : oInactiveArtistContext.getPath().slice(1)}, true);
			});
		},

		onInit : function () {
			var oRouter = UIComponent.getRouterFor(this);

			oRouter.getRoute("objectPage").attachPatternMatched(this._onObjectMatched, this);
			this.getView().setModel(new JSONModel({bEditMode : false}), "ui-op");
		},

		onPatchCompleted : function (oEvent) {
			if (oEvent.getParameter("success")) {
				this.byId("draftIndicator").showDraftSaved();
			} else {
				MessageBox.show("Error while saving changes", {
					icon : MessageBox.Icon.ERROR
				});
			}
		},

		onPatchSent : function () {
			this.byId("draftIndicator").showDraftSaving();
		},

		onSave : function () {
			var oView = this.getView(),
				oOldBindingContext = oView.getBindingContext(),
				that = this;

			oView.setBusy(true);
			this.byId("draftIndicator").clearDraftState();
			oView.getModel().bindContext(sNamespace + "Activation(...)", oOldBindingContext,
					{$$inheritExpandSelect : true, $$patchWithoutSideEffects : true})
				.invoke()
				.then(function (oActiveArtistContext) {
					oView.setBusy(false);
					that._detachPatchEventHandlers(oOldBindingContext.getBinding());
					that.oArtistContext = oActiveArtistContext;
					Routing.navigateTo(that, "objectPage",
						{artistPath : oActiveArtistContext.getPath().slice(1)}, true);
			});
		},

		onSelect : function (oEvent) {
			this._navToPublication(oEvent.getSource().getBindingContext().getPath());
		},

		onValidateFieldGroup : function () {
			if (this.bSideEffectFieldChanged) {
				this.bSideEffectFieldChanged = false;
				//TODO lock fields affected by side effects
				this.byId("objectPageForm").getBindingContext().requestSideEffects([{
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
