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

		pressDialog: null,
		fixedSizeDialog: null,
		resizableDialog: null,
		draggableDialog: null,
		escapePreventDialog: null,
		confirmEscapePreventDialog: null,
		onDialogPress: function (oEvent) {
			var that = this;
			if (!that.pressDialog) {
				that.pressDialog = new Dialog({
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
							that.pressDialog.close();
						}
					})
				});

				//to get access to the global model
				this.getView().addDependent(that.pressDialog);
			}

			that.pressDialog.open();
		},

		onResizableDialog: function (oEvent) {
			var that = this;
			if (!that.resizableDialog) {
				that.resizableDialog = new Dialog({
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
							that.resizableDialog.close();
						}
					})
				});

				//to get access to the global model
				this.getView().addDependent(that.resizableDialog);
			}

			that.resizableDialog.open();
		},

		onDraggableDialog: function (oEvent) {
			var that = this;
			if (!that.draggableDialog) {
				that.draggableDialog = new Dialog({
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
							that.draggableDialog.close();
						}
					})
				});

				//to get access to the global model
				this.getView().addDependent(that.draggableDialog);
			}

			that.draggableDialog.open();
		},

		onDialogWithSizePress: function (oEvent) {
			var that = this;
			if (!that.fixedSizeDialog) {
				that.fixedSizeDialog = new Dialog({
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
							that.fixedSizeDialog.close();
						}
					})
				});

				//to get access to the global model
				this.getView().addDependent(that.fixedSizeDialog);
			}

			that.fixedSizeDialog.open();
		},

		onEscapePreventDialog: function(oEvent) {
			var that = this;
			if (!that.escapePreventDialog) {
				that.escapePreventDialog = new sap.m.Dialog({
					title: 'Try closing me with ESCAPE',
					buttons: [
						new sap.m.Button({
							text : "Simply close",
							press : function() {
								that.escapePreventDialog.close();
							}
						})
					],
					escapeHandler: function(oPromise) {
						if (!that.confirmEscapePreventDialog) {
							that.confirmEscapePreventDialog = new sap.m.Dialog({
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
											that.confirmEscapePreventDialog.close();
											oPromise.resolve();
										}
									}),
									new sap.m.Button({
										text : "No",
										press : function() {
											that.confirmEscapePreventDialog.close();
											oPromise.reject();
										}
									})
								]
							});
						}

						that.confirmEscapePreventDialog.open();
					}
				})
			}

			that.escapePreventDialog.open();
		}
	});


	return CController;

});
