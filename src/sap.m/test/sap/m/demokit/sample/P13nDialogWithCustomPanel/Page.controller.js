sap.ui.define([
	'jquery.sap.global', 'sap/m/MessageToast', 'sap/ui/core/Fragment', 'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/ui/model/resource/ResourceModel'
], function(jQuery, MessageToast, Fragment, Controller, JSONModel, ResourceModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.P13nDialogWithCustomPanel.Page", {

		oPersonalizationDialog: null,
		bShowResetEnabled: false,
		bIsReseted: false,

		handleOK: function(oEvent) {
			this._storeShowResetEnabled();
			this.oPersonalizationDialog.close();
			// this.getView().removeDependents();
		},

		handleCancel: function(oEvent) {
			this.oPersonalizationDialog.close();
		},

		handleReset: function(oEvent) {
			this.bIsReseted = true;
			MessageToast.show("Reset button has been clicked", {
				width: "auto"
			});
		},

		handleSelect: function(oEvent) {
			var aPanels = this.oPersonalizationDialog.getPanels().filter(function(oPanel) {
				return oPanel.getType() === "custom1";
			});
			if (!aPanels.length) {
				return;
			}
			var fListener = aPanels[0].getChangeNotifier();
			if (fListener) {
				fListener(this);
			}
		},

		onPersonalizationDialogPress: function(oEvent) {
			var oPersonalizationDialog = this._getDialog();

			oPersonalizationDialog.setShowResetEnabled(this.bShowResetEnabled);
			this.bIsReseted = false;

			oPersonalizationDialog.open();
		},

		onAddColumnsItem: function(oEvent) {
			sap.m.MessageToast.show("Event 'addColumnsItem' fired in order to move the selected column item", {
				width: "auto"
			});
		},

		onChangeColumnsItem: function(oEvent) {
			MessageToast.show("Event 'changeColumnsItem' fired in order to move the selected column item", {
				width: "auto"
			});
		},

		_storeShowResetEnabled: function() {
			if (this.bIsReseted) {
				this.bShowResetEnabled = false;
			} else {
				this.bShowResetEnabled = this.oPersonalizationDialog.getShowResetEnabled();
			}
		},

		_getDialog: function() {
			if (this.oPersonalizationDialog) {
				return this.oPersonalizationDialog;
			}

			// associate controller with the fragment
			this.oPersonalizationDialog = sap.ui.xmlfragment("sap.m.sample.P13nDialogWithCustomPanel.PersonalizationDialog", this);
			this.getView().addDependent(this.oPersonalizationDialog);

			this.getView().setModel(new sap.ui.model.json.JSONModel("test-resources/sap/m/demokit/sample/P13nDialogWithCustomPanel/products.json"));

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oPersonalizationDialog);

			// set explored app's demo model on this sample
			this.getView().setModel(new JSONModel("test-resources/sap/m/demokit/sample/P13nDialog/products.json"));
			this.getView().setModel(new ResourceModel({
				bundleName: "sap.m.sample.P13nDialog.i18n.i18n"
			}), "i18n");

			return this.oPersonalizationDialog;
		}

	});
	return PageController;
});
