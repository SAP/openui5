sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/IconPool",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/Text"
], function (Controller, JSONModel, IconPool, Dialog, Button, mobileLibrary, List, StandardListItem, Text) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	return Controller.extend("sap.m.sample.Dialog.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
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

		onDialogWithSizePress: function () {
			if (!this.oFixedSizeDialog) {
				this.oFixedSizeDialog = new Dialog({
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
						type: ButtonType.Emphasized,
						text: "Close",
						press: function () {
							this.oFixedSizeDialog.close();
						}.bind(this)
					})
				});

				//to get access to the controller's model
				this.getView().addDependent(this.oFixedSizeDialog);
			}

			this.oFixedSizeDialog.open();
		},

		onResizableDialogPress: function () {
			if (!this.oResizableDialog) {
				this.oResizableDialog = new Dialog({
					title: "Resizable (only on Desktop) - Available Products",
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
						type: ButtonType.Emphasized,
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
					title: "Draggable (only on Desktop) - Available Products",
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
						type: ButtonType.Emphasized,
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
		},

		onEscapePreventDialogPress: function () {
			if (!this.oEscapePreventDialog) {
				this.oEscapePreventDialog = new Dialog({
					title: "Dialog with prevent close",
					content: new Text({ text: "Try to close this Dialog with the Escape key" }).addStyleClass("sapUiSmallMargin"),
					buttons: [
						new Button({
							type: ButtonType.Emphasized,
							text: "Simply close",
							press: function () {
								this.oEscapePreventDialog.close();
							}.bind(this)
						})
					],
					escapeHandler: function (oPromise) {
						if (!this.oConfirmEscapePreventDialog) {
							this.oConfirmEscapePreventDialog = new Dialog({
								title: "Are you sure?",
								content: new Text({ text: "Your unsaved changes will be lost" }),
								type: DialogType.Message,
								icon: IconPool.getIconURI("message-information"),
								buttons: [
									new Button({
										type: ButtonType.Emphasized,
										text: "Yes",
										press: function () {
											this.oConfirmEscapePreventDialog.close();
											oPromise.resolve();
										}.bind(this)
									}),
									new Button({
										text: "No",
										press: function () {
											this.oConfirmEscapePreventDialog.close();
											oPromise.reject();
										}.bind(this)
									})
								]
							});
						}

						this.oConfirmEscapePreventDialog.open();
					}.bind(this)
				});
			}

			this.oEscapePreventDialog.open();
		},

		onResponsivePaddingDialogPress: function () {
			if (!this.oResponsivePaddingDialog) {
				this.oResponsivePaddingDialog = new Dialog({
					title: "On SAP Quartz and Horizon themes, the padding will adjust based on the width of the Dialog",
					contentWidth: "760px",
					contentHeight: "450px",
					resizable: true,
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
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function () {
							this.oResponsivePaddingDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Close",
						press: function () {
							this.oResponsivePaddingDialog.close();
						}.bind(this)
					})
				});

				// Enable responsive padding by adding the appropriate classes to the control
				this.oResponsivePaddingDialog.addStyleClass("sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer sapUiResponsivePadding--subHeader");

				//to get access to the controller's model
				this.getView().addDependent(this.oResponsivePaddingDialog);
			}

			this.oResponsivePaddingDialog.open();
		}

	});
});