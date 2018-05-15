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
		onDialogPress: function () {
			if (!this.pressDialog) {
				this.pressDialog = new Dialog({
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
							this.fixedSizeDialog.close();
						}.bind(this)
					})
				});

				//to get access to the global model
				this.getView().addDependent(this.fixedSizeDialog);
			}

			this.fixedSizeDialog.open();
		},

		onEscapePreventDialog: function() {
			if (!this.escapePreventDialog) {
				this.escapePreventDialog = new sap.m.Dialog({
					title: 'Try closing me with ESCAPE',
					buttons: [
						new sap.m.Button({
							text : "Simply close",
							press : function() {
								this.escapePreventDialog.close();
							}.bind(this)
						})
					],
					escapeHandler: function(oPromise) {
						if (!this.confirmEscapePreventDialog) {
							this.confirmEscapePreventDialog = new sap.m.Dialog({
								icon : sap.ui.core.IconPool.getIconURI("message-information"),
								title : "Are you sure?",
								content : [
									new sap.m.Text({
										text : "Your unsaved changes will be lost"
									})
								],
								type : sap.m.DialogType.Message,
								buttons : [
									new sap.m.Button({
										text : "Yes",
										press : function() {
											this.confirmEscapePreventDialog.close();
											oPromise.resolve();
										}.bind(this)
									}),
									new sap.m.Button({
										text : "No",
										press : function() {
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
		}
	});
});