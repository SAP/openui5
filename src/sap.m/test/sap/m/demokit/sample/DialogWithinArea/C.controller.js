sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Popup",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/List",
	"sap/m/StandardListItem"
], function (Controller, Popup, JSONModel, Dialog, Button, ButtonType, List, StandardListItem) {
	"use strict";

	return Controller.extend("sap.m.sample.DialogWithinArea.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);

			// Set the element that will serve as within area for all popups (including dialogs)
			Popup.setWithinArea(this.byId("withinArea"));
		},

		onExit: function () {
			Popup.setWithinArea(null);
		},

		onDefaultDialogPress: function () {
			if (!this.oDefaultDialog) {
				this.oDefaultDialog = new Dialog({
					title: "Available Products",
					content: new List({
						items: {
							path: "/ProductCollection",
							template: new StandardListItem({
								title: "{Name}",
								counter: "{Quantity}"
							})
						}
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function () {
							this.oDefaultDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Close",
						press: function () {
							this.oDefaultDialog.close();
						}.bind(this)
					})
				});

				// to get access to the controller's model
				this.getView().addDependent(this.oDefaultDialog);
			}

			this.oDefaultDialog.open();
		},

		onResizableDialogPress: function () {
			if (!this.oResizableDialog) {
				this.oResizableDialog = new Dialog({
					title: "Resizable Available Products",
					contentWidth: "550px",
					contentHeight: "300px",
					resizable: true,
					content: new List({
						items: {
							path: "/ProductCollection",
							template: new StandardListItem({
								title: "{Name}",
								counter: "{Quantity}"
							})
						}
					}),
					endButton: new Button({
						text: "Close",
						press: function () {
							this.oResizableDialog.close();
						}.bind(this)
					})
				});

				//to get access to the controller's model
				this.getView().addDependent(this.oResizableDialog);
			}

			this.oResizableDialog.open();
		},

		onDraggableDialogPress: function () {
			if (!this.oDraggableDialog) {
				this.oDraggableDialog = new Dialog({
					title: "Draggable Available Products",
					contentWidth: "550px",
					contentHeight: "300px",
					draggable: true,
					content: new List({
						items: {
							path: "/ProductCollection",
							template: new StandardListItem({
								title: "{Name}",
								counter: "{Quantity}"
							})
						}
					}),
					endButton: new Button({
						text: "Close",
						press: function () {
							this.oDraggableDialog.close();
						}.bind(this)
					})
				});

				//to get access to the controller's model
				this.getView().addDependent(this.oDraggableDialog);
			}

			this.oDraggableDialog.open();
		}

	});
});