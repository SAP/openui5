sap.ui.define([
	'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/m/MessageToast'
], function(Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.fl.sample.variantmanagement.VariantManagement", {

		onInit: function() {
			var oModel = new JSONModel([
				{
					defaultVariant: "2",
					initialDefaultVariant: "1",
					standardVariant: "Standard",
					modified: false,
					variants: [
						{
							key: "Standard",
							title: "Standard",
							author: "A",
							originalTitle: "Standard",
							toBeDeleted: false,
							readOnly: true
						}, {
							key: "1",
							title: "One",
							author: "A",
							originalTitle: "One",
							toBeDeleted: false,
							readOnly: false
						}, {
							key: "2",
							title: "Two",
							originalTitle: "Two",
							author: "B",
							toBeDeleted: false,
							readOnly: false
						}, {
							key: "3",
							title: "Three",
							originalTitle: "Three",
							global: true,
							toBeDeleted: false,
							readOnly: true
						}, {
							key: "4",
							title: "Four",
							originalTitle: "Four",
							toBeDeleted: false,
							readOnly: false
						}, {
							key: "5",
							title: "Five",
							originalTitle: "Five",
							toBeDeleted: false,
							readOnly: false
						}, {
							key: "6",
							title: "Six",
							originalTitle: "Six",
							toBeDeleted: false,
							readOnly: false
						}, {
							key: "7",
							title: "Seven",
							originalTitle: "Seven",
							toBeDeleted: false,
							readOnly: false
						}, {
							key: "8",
							title: "Eight",
							originalTitle: "Eight",
							toBeDeleted: false,
							readOnly: true
						}, {
							key: "9",
							title: "Nine",
							originalTitle: "Nine",
							toBeDeleted: false,
							readOnly: false
						}
					]
				}, {
					defaultVariant: "3",
					initialDefaultVariant: "3",
					standardVariant: "Standard",
					modified: false,
					variants: [
						{
							key: "Standard",
							title: "Standard",
							author: "A",
							originalTitle: "Standard",
							toBeDeleted: false,
							readOnly: true
						}, {
							key: "1",
							title: "ONE",
							originalTitle: "ONE",
							toBeDeleted: false,
							readOnly: true
						}, {
							key: "2",
							title: "TWO",
							originalTitle: "TWO",
							toBeDeleted: false,
							readOnly: true
						}, {
							key: "3",
							title: "THREE",
							originalTitle: "THREE",
							toBeDeleted: false,
							readOnly: false
						}, {
							key: "4",
							title: "FOUR",
							originalTitle: "FOUR",
							toBeDeleted: false,
							readOnly: false
						}, {
							key: "5",
							title: "FIVE",
							originalTitle: "FIVE",
							toBeDeleted: false,
							readOnly: false
						}, {
							key: "6",
							title: "SIX",
							originalTitle: "SIX",
							toBeDeleted: false,
							readOnly: false
						}, {
							key: "7",
							title: "SEVEN",
							originalTitle: "SEVEN",
							toBeDeleted: false,
							readOnly: false
						}, {
							key: "8",
							title: "EIGHT",
							originalTitle: "EIGHT",
							toBeDeleted: false,
							readOnly: false
						// initialExecuteOnSelection:
						}, {
							key: "9",
							title: "NINE",
							originalTitle: "NINE",
							toBeDeleted: false,
							readOnly: false
						}
					]
				}
			]);

			this.oVM = this.getView().byId("idVariantManagementCtrl");
			this.oVM.setModel(oModel, "$SapUiFlVariants");
			this.oVM.setBindingContext(oModel.getContext("/0"), "$SapUiFlVariants");

		},

		onMarkAsChanged: function(oEvent) {
			this.oVM.setModified(true);
		},
		onSave: function(oEvent) {
			var params = oEvent.getParameters();

			var sMode = params.overwrite ? "Update" : "New";

			var sMessage = sMode + "Name: " + params.name + "\nDefault: " + params.def + "\nOverwrite:" + params.overwrite + "\nSelected Item Key: " + params.key + "\nExe:" + params.exe;
			MessageToast.show(sMessage);
			jQuery.sap.log.error("\n" + sMessage);
		},
		onManage: function(oEvent) {
// var params = oEvent.getParameters();
// var renamed = params.renamed;
// var deleted = params.deleted;
// var exe = params.exe;

			var oModel = this.oVM.getModel("$SapUiFlVariants");
			var oData = this.oVM.getBindingContext().getObject();

			oData["variants"] = oData["variants"].filter(function(oItem) {
				return oItem.toBeDeleted === false;
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
