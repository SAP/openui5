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
					originalDefaultVariant: "2",
					modified: false,
					variantsEditable: true,
					showFavorites: true,
					variants: [
						{
							key: "Standard",
							title: "Standard",
							author: "A",
							favorite: true,
							originalFavorite: true,
							remove: false,
							rename: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false,
							visible: true,
							change: true
						}, {
							key: "1",
							title: "One",
							author: "A",
							share: false,
							favorite: true,
							originalFavorite: true,
							remove: true,
							rename: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false,
							visible: true,
							change: true
						}, {
							key: "2",
							title: "Two",
							author: "B",
							favorite: true,
							originalFavorite: true,
							remove: true,
							rename: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false,
							visible: true,
							change: true
						}, {
							key: "3",
							title: "Three",
							share: true,
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							remove: false,
							rename: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false,
							visible: true,
							change: false
						}, {
							key: "4",
							title: "Four",
							favorite: true,
							originalFavorite: true,
							remove: true,
							rename: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false,
							visible: true,
							change: true
						}, {
							key: "5",
							title: "Five",
							favorite: true,
							originalFavorite: true,
							remove: true,
							rename: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false,
							visible: true,
							change: true
						}, {
							key: "6",
							title: "Six",
							favorite: true,
							originalFavorite: true,
							remove: true,
							rename: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false,
							visible: true,
							change: true
						}, {
							key: "7",
							title: "Seven",
							favorite: true,
							originalFavorite: true,
							remove: false,
							rename: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false,
							visible: true,
							change: false
						}, {
							key: "8",
							title: "Eight",
							favorite: true,
							originalFavorite: true,
							remove: true,
							rename: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false,
							visible: true,
							change: true
						}, {
							key: "9",
							title: "Nine",
							favorite: true,
							originalFavorite: true,
							remove: false,
							rename: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false,
							visible: true,
							change: false
						}
					]
				},

				M1: {
					defaultVariant: "3",
					currentVariant: "3",
					modified: false,
					variantsEditable: false,
					showFavorites: false,
					variants: []
				}
			});

			this.oModel.updateCurrentVariant = function(sVariantMgmtRef, sNewVariantRef) {
				this.oData[sVariantMgmtRef].currentVariant = sNewVariantRef;
			}; // overrule default

			this.oVM = this.getView().byId("idVariantManagementCtrl");
			this.oVM._getLocalId = function() {
				return this.getId();
			};

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
			var bShowExe = this.oVM.getShowExecuteOnSelection();
			// var bShowDef = this.oVM.getShowAsDefault();

			this.oVM.destroy();
			var oVM = new VariantManagement(sVMId);
			oVM._getLocalId = function() {
				return this.getId();
			};
			oParent.addContent(oVM);

			this.oVM = this.getView().byId("idVariantManagementCtrl");
			this.oVM.setShowExecuteOnSelection(bShowExe);
			// this.oVM.setShowAsDefault(bShowDef);

			this.oVM.setModel(this.oModel, "$FlexVariants");

			var oCurrentVariantChangeBinding = this.oModel.bindProperty("currentVariant", this.oVM.getBindingContext("$FlexVariants"));
			oCurrentVariantChangeBinding.attachChange(function(oEvent) {
				MessageToast.show("currentVariant: " + oEvent.oSource.oValue);
			});

		},

		onToggleErrorState: function(oEvent) {
			this.oVM.setInErrorState(!this.oVM.getInErrorState());
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
			var oModel = this.oVM.getModel("$FlexVariants");
			var oData = this.oVM.getBindingContext("$FlexVariants").getObject();

			oData.showFavorites = !oData.showFavorites;

			oModel.checkUpdate(true);
		},

		onOpenMamageDialogBtn: function(oEvent) {
			this.oVM.openManagementDialog(true);
		},

		onToggleEditableVariantsBtn: function(oEvent) {

			var oModel = this.oVM.getModel("$FlexVariants");
			var oData = this.oVM.getBindingContext("$FlexVariants").getObject();

			oData.variantsEditable = !oData.variantsEditable;

			oModel.checkUpdate(true);
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
				return oItem.visible;
			});

			oData.originalDefaultVariant = oData.defaultVariant;

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
