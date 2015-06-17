sap.ui.define([
		'jquery.sap.global',
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/List',
		'sap/m/StandardListItem',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Button, Dialog, List, StandardListItem, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.Dialog.C", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);
		},

		onDialogPress: function (oEvent) {
			var dialog = new Dialog({
				title: 'Available Products',
				content: new List({
					items: {
						path: '/ProductCollection',
						template: new StandardListItem({
							title: "{Name}",
							counter: "{Quantity}"
						})
					}
				}),
				beginButton: new Button({
					text: 'Close',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			//to get access to the global model
			this.getView().addDependent(dialog);
			dialog.open();
		},

		onResizableDialog: function (oEvent) {
			var dialog = new Dialog({
				title: 'Resizable Available Products',
				contentWidth: "550px",
				contentHeight: "300px",
				resizable: true,
				content: new List({
					items: {
						path: '/ProductCollection',
						template: new StandardListItem({
							title: "{Name}",
							counter: "{Quantity}"
						})
					}
				}),
				beginButton: new Button({
					text: 'Close',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			//to get access to the global model
			this.getView().addDependent(dialog);
			dialog.open();
		},

		onDraggableDialog: function (oEvent) {
			var dialog = new Dialog({
				title: 'Draggable Available Products',
				contentWidth: "550px",
				contentHeight: "300px",
				draggable: true,
				content: new List({
					items: {
						path: '/ProductCollection',
						template: new StandardListItem({
							title: "{Name}",
							counter: "{Quantity}"
						})
					}
				}),
				beginButton: new Button({
					text: 'Close',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			//to get access to the global model
			this.getView().addDependent(dialog);
			dialog.open();
		},

		onDialogWithSizePress: function (oEvent) {
			var dialog = new Dialog({
				title: 'Available Products',
				contentWidth: "550px",
				contentHeight: "300px",
				content: new List({
					items: {
						path: '/ProductCollection',
						template: new StandardListItem({
							title: "{Name}",
							counter: "{Quantity}"
						})
					}
				}),
				beginButton: new Button({
					text: 'Close',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			//to get access to the global model
			this.getView().addDependent(dialog);
			dialog.open();
		}
	});


	return CController;

});
