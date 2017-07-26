sap.ui.define([
	'sap/ui/core/mvc/Controller', 'sap/ui/fl/variants/VariantModel', 'sap/ui/fl/variants/VariantManagement', 'sap/m/MessageToast'
], function(Controller, VariantModel, VariantManagement, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.fl.sample.variantmanagement.VariantManagement", {

		onInit: function() {
			this.oModel = new VariantModel({
				"__xmlview0--idVariantManagementCtrl": {
					currentVariant: "2",
					defaultVariant: "2",
					modified: false,
					variants: [
						{
							key: "Standard",
							title: "Standard",
							author: "A",
							favorite: true,
							originalFavorite: true,
							readOnly: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "1",
							title: "One",
							author: "A",
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "2",
							title: "Two",
							author: "B",
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "3",
							title: "Three",
							global: true,
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "4",
							title: "Four",
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "5",
							title: "Five",
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "6",
							title: "Six",
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "7",
							title: "Seven",
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "8",
							title: "Eight",
							favorite: true,
							originalFavorite: true,
							readOnly: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "9",
							title: "Nine",
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}
					]
				},

				M1: {
					defaultVariant: "3",
					currentVariant: "3",
					modified: false,
					variants: [
						{
							key: "Standard",
							title: "Standard",
							author: "A",
							favorite: true,
							originalFavorite: true,
							readOnly: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "1",
							title: "ONE",
							favorite: true,
							originalFavorite: true,
							readOnly: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "2",
							title: "TWO",
							favorite: true,
							originalFavorite: true,
							readOnly: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "3",
							title: "THREE",
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "4",
							title: "FOUR",
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "5",
							title: "FIVE",
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "6",
							title: "SIX",
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "7",
							title: "SEVEN",
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "8",
							title: "EIGHT",
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "9",
							title: "NINE",
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}
					]
				}
			});

			this.oModel._updateCurrentVariant = function(sVariantMgmtRef, sNewVariantRef) {
				this.oData[sVariantMgmtRef].currentVariant = sNewVariantRef;
			}; // overrule default

			this.oVM = this.getView().byId("idVariantManagementCtrl");
			this.oVM.setModel(this.oModel, "$FlexVariants");

			var oCurrentVariantChangeBinding = this.oModel.bindProperty("currentVariant", this.oVM.getBindingContext("$FlexVariants"));
			oCurrentVariantChangeBinding.attachChange(function(oEvent) {
				MessageToast.show("currentVariant: " + oEvent.oSource.oValue);
			});

		},

		onDestroyVMBtn: function(oEvent) {
			var oParent = this.oVM.getParent();

			oParent.removeContent(this.oVM);
			var sVMId = this.oVM.getId();
			var bShowFav = this.oVM.getShowFavorites();
			var bShowShare = this.oVM.getShowShare();
			var bShowExe = this.oVM.getShowExecuteOnSelection();
			// var bShowDef = this.oVM.getShowAsDefault();

			this.oVM.destroy();
			var oVM = new VariantManagement(sVMId);
			oParent.addContent(oVM);

			this.oVM = this.getView().byId("idVariantManagementCtrl");
			this.oVM.setShowFavorites(!bShowFav);
			this.oVM.setShowShare(bShowShare);
			this.oVM.setShowExecuteOnSelection(bShowExe);
			// this.oVM.setShowAsDefault(bShowDef);

			this.oVM.setModel(this.oModel, "$FlexVariants");

			var oCurrentVariantChangeBinding = this.oModel.bindProperty("currentVariant", this.oVM.getBindingContext("$FlexVariants"));
			oCurrentVariantChangeBinding.attachChange(function(oEvent) {
				MessageToast.show("currentVariant: " + oEvent.oSource.oValue);
			});

		},

		onToggleShowShareBtn: function(oEvent) {
			this.oVM.setShowShare(!this.oVM.getShowShare());
		},
		onToggleShowExeOnSeltBtn: function(oEvent) {
			this.oVM.setShowExecuteOnSelection(!this.oVM.getShowExecuteOnSelection());
		},
		onToggleShowAsDefaultBtn: function(oEvent) {
			this.oVM.setShowSetAsDefault(!this.oVM.getShowSetAsDefault());
		},
		onToggleFavoritesBtn: function(oEvent) {
			this.oVM.setShowFavorites(!this.oVM.getShowFavorites());
		},

		onOpenMamageDialogBtn: function(oEvent) {
			this.oVM.openManagementDialog(true);
		},

		onToggleManageBtn: function(oEvent) {
			this.oVM.setShowManage(!this.oVM.getShowManage());
		},
		onToggleSaveBtn: function(oEvent) {
			this.oVM.setShowSave(!this.oVM.getShowSave());
		},
		onToggleSaveAsBtn: function(oEvent) {
			this.oVM.setShowSaveAs(!this.oVM.getShowSaveAs());
		},

		onMarkAsChanged: function(oEvent) {
			this.oVM.setModified(true);
		},

		onSave: function(oEvent) {
			var params = oEvent.getParameters();

			var sMode = params.overwrite ? "Update" : "New";

			var sMessage = sMode + "Name: " + params.name + "\nDefault: " + params.def + "\nOverwrite:" + params.overwrite + "\nSelected Item Key: " + params.key + "\nExecute:" + params.execute;
			MessageToast.show(sMessage);
			jQuery.sap.log.error("\n" + sMessage);
		},
		onManage: function(oEvent) {

			var oModel = this.oVM.getModel("$FlexVariants");
			var oData = this.oVM.getBindingContext("$FlexVariants").getObject();

			oData["variants"] = oData["variants"].filter(function(oItem) {
				return oItem.toBeDeleted === false;
			});

			oData["variants"].forEach(function(oItem) {
				if (oItem.title !== oItem.originalTitle) {
					oItem.originalTitle = oItem.title;
				}

				if (oItem.executeOnSelect !== oItem.originalExecuteOnSelect) {
					oItem.originalExecuteOnSelect = oItem.executeOnSelect;
				}

				if (oItem.executeOnSelect !== oItem.originalExecuteOnSelect) {
					oItem.originalExecuteOnSelect = oItem.executeOnSelect;
				}

				if (oItem.favorite !== oItem.originalFavorite) {
					oItem.originalFavorite = oItem.favorite;
				}
			});

			oModel.checkUpdate(true);

		}
	});
});
