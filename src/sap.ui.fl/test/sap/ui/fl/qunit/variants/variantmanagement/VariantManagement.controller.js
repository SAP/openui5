sap.ui.define([
	'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/m/MessageToast'
], function(Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.fl.sample.variantmanagement.VariantManagement", {

		onInit: function() {
			var oModel = new JSONModel({
				M0: {
					currentVariant: "2",
					defaultVariant: "2",
					modified: false,
					variants: [
						{
							key: "Standard",
							title: "Standard",
							author: "A",
							originalTitle: "Standard",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "1",
							title: "One",
							author: "A",
							originalTitle: "One",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "2",
							title: "Two",
							originalTitle: "Two",
							author: "B",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "3",
							title: "Three",
							originalTitle: "Three",
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
							originalTitle: "Four",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "5",
							title: "Five",
							originalTitle: "Five",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "6",
							title: "Six",
							originalTitle: "Six",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "7",
							title: "Seven",
							originalTitle: "Seven",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "8",
							title: "Eight",
							originalTitle: "Eight",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "9",
							title: "Nine",
							originalTitle: "Nine",
							toBeDeleted: false,
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
							originalTitle: "Standard",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "1",
							title: "ONE",
							originalTitle: "ONE",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "2",
							title: "TWO",
							originalTitle: "TWO",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: true,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "3",
							title: "THREE",
							originalTitle: "THREE",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "4",
							title: "FOUR",
							originalTitle: "FOUR",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "5",
							title: "FIVE",
							originalTitle: "FIVE",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "6",
							title: "SIX",
							originalTitle: "SIX",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "7",
							title: "SEVEN",
							originalTitle: "SEVEN",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "8",
							title: "EIGHT",
							originalTitle: "EIGHT",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}, {
							key: "9",
							title: "NINE",
							originalTitle: "NINE",
							toBeDeleted: false,
							favorite: true,
							originalFavorite: true,
							readOnly: false,
							executeOnSelect: false,
							originalExecuteOnSelect: false
						}
					]
				}
			});

			this.oVM = this.getView().byId("idVariantManagementCtrl");
			this.oVM.setModel(oModel, "$FlexVariants");

			var oCurrentVariantChangeBinding = oModel.bindProperty("currentVariant", this.oVM.getBindingContext("$FlexVariants"));
			oCurrentVariantChangeBinding.attachChange(function(oEvent) {
				MessageToast.show("currentVariant: " + oEvent.oSource.oValue);
			});

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

		},
		onSelect: function(oEvent) {
			var params = oEvent.getParameters();
			var sMessage = "New Variant Selected: " + params.key;
			MessageToast.show(sMessage);
			jQuery.sap.log.error(sMessage);
		}
	});
});
