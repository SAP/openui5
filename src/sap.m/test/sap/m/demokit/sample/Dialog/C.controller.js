sap.ui.define([
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/Text",
	"sap/m/library",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/IconPool",
	"sap/ui/model/json/JSONModel"
], function (Button, Dialog, List, StandardListItem, Text, mobileLibrary, Controller, IconPool, JSONModel) {
	"use strict";

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	return Controller.extend("sap.m.sample.Dialog.C", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		pressDialog: null,
		fixedSizeDialog: null,
		resizableDialog: null,
		draggableDialog: null,
		escapePreventDialog: null,
		confirmEscapePreventDialog: null,
		responsivePaddingDialog: null,

		onDialogPress: function () {
			if (!this.pressDialog) {
				this.pressDialog = new Dialog({
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
							this.pressDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Close",
						press: function () {
							this.pressDialog.close();
						}.bind(this)
					})
				});

				//to get access to the global model
				this.getView().addDependent(this.pressDialog);
			}

			this.pressDialog.open();
		},

		onResizableDialog: function () {
			if (!this.resizableDialog) {
				this.resizableDialog = new Dialog({
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
							this.resizableDialog.close();
						}.bind(this)
					})
				});

				//to get access to the global model
				this.getView().addDependent(this.resizableDialog);
			}

			this.resizableDialog.open();
		},

		onDraggableDialog: function () {
			if (!this.draggableDialog) {
				this.draggableDialog = new Dialog({
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
							this.draggableDialog.close();
						}.bind(this)
					})
				});

				//to get access to the global model
				this.getView().addDependent(this.draggableDialog);
			}

			this.draggableDialog.open();
		},

		onDialogWithSizePress: function (oEvent) {
			if (!this.fixedSizeDialog) {
				this.fixedSizeDialog = new Dialog({
					title: "Available Products",
					contentWidth: "550px",
					contentHeight: "300px",
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
							this.fixedSizeDialog.close();
						}.bind(this)
					})
				});

				//to get access to the global model
				this.getView().addDependent(this.fixedSizeDialog);
			}

			this.fixedSizeDialog.open();
		},

		onEscapePreventDialog: function () {
			if (!this.escapePreventDialog) {
				this.escapePreventDialog = new Dialog({
					title: "Try closing me with ESCAPE",
					buttons: [
						new Button({
							text: "Simply close",
							press: function () {
								this.escapePreventDialog.close();
							}.bind(this)
						})
					],
					escapeHandler: function (oPromise) {
						if (!this.confirmEscapePreventDialog) {
							this.confirmEscapePreventDialog = new Dialog({
								icon: IconPool.getIconURI("message-information"),
								title: "Are you sure?",
								content: [
									new Text({
										text: "Your unsaved changes will be lost"
									})
								],
								type: DialogType.Message,
								buttons: [
									new Button({
										text: "Yes",
										press: function () {
											this.confirmEscapePreventDialog.close();
											oPromise.resolve();
										}.bind(this)
									}),
									new Button({
										text: "No",
										press: function () {
											this.confirmEscapePreventDialog.close();
											oPromise.reject();
										}.bind(this)
									})
								]
							});
						}

						this.confirmEscapePreventDialog.open();
					}.bind(this)
				});
			}

			this.escapePreventDialog.open();
		},

		onResponsivePaddingDialog: function () {
			if (!this.responsivePaddingDialog) {
				this.responsivePaddingDialog = new Dialog({
					title: "On SAP Quartz themes, the padding will adjust based on the width of the Dialog",
					contentWidth: "680px",
					contentHeight: "450px",
					resizable: true,
					draggable: true,
					subHeader: new sap.m.OverflowToolbar({
						content: new Text({ text: "Experiment with the responsive padding by resizing this Dialog." })
					}),
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
							this.responsivePaddingDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Close",
						press: function () {
							this.responsivePaddingDialog.close();
						}.bind(this)
					})
				});

				// Enable responsive padding by adding the appropriate classes to the control
				this.responsivePaddingDialog.addStyleClass("sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer sapUiResponsivePadding--subHeader");

				//to get access to the global model
				this.getView().addDependent(this.responsivePaddingDialog);
			}

			this.responsivePaddingDialog.open();
		}

	});
});