sap.ui.define([
	'jquery.sap.global',
	'./Formatter',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Text'
],	function(jQuery, Formatter, Controller, JSONModel, Button, Dialog, Text) {
	"use strict";

	var TableController = Controller.extend("view.Table", {

		onInit: function () {
			var oModel = new JSONModel();
			jQuery.getJSON("products.json", function (oResponse) {
				oModel.setData({
					"ProductCollection": oResponse
				});
			});
			this.getView().setModel(oModel);
		},

		onPopinLayoutChanged: function() {
			var oTable = this.byId("idProductsTable");
			var oComboBox = this.byId("idPopinLayout");
			var sPopinLayout = oComboBox.getSelectedKey();
			switch (sPopinLayout) {
				case "Block":
					oTable.setPopinLayout(sap.m.PopinLayout.Block);
					break;
				case "GridLarge":
					oTable.setPopinLayout(sap.m.PopinLayout.GridLarge);
					break;
				case "GridSmall":
					oTable.setPopinLayout(sap.m.PopinLayout.GridSmall);
					break;
				default:
					oTable.setPopinLayout(sap.m.PopinLayout.Block);
					break;
			}
		},

		onMessageDialogPress: function (oEvent) {
			var dialog = new Dialog({
				title: 'Message',
				type: 'Message',
					content: new Text({
						text: 'Success'
					}),
				beginButton: new Button({
					text: 'OK',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		}
	});

	return TableController;

});
