/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/ButtonType",
	'sap/m/Text',
	"sap/m/MessageToast"

], function (Controller, UIComponent, JSONModel, Dialog, Button, ButtonType, Text, MessageToast) {

	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.BookDetails", {
		onInit: function () {

			var oViewModel = new JSONModel({
				editMode: false
			});
			this.getView().setModel(oViewModel, "view");
			UIComponent.getRouterFor(this).getRoute("bookdetails").attachPatternMatched(this._onRouteMatched, this);
		},

		onEditButtonPress: function (oEvent) {
			var oViewModel = this.getView().getModel("view");
			var bEditMode = oViewModel.getProperty("editMode");

			oViewModel.setProperty("/editMode", !bEditMode);

		},

		onDeleteButtonPress: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext(),
				oModel = this.getView().getModel();

			var dialog = new Dialog({
				title: 'Confirm',
				type: 'Message',
				content: new Text({ text: "Really delete this book?" }),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: 'Submit',
					press: function () {
						oContext.delete("$auto").then(function () {
							MessageToast.show("Book deleted");
							oModel.refresh();
							dialog.close();
							UIComponent.getRouterFor(this).navTo("books");
						}.bind(this));

					}.bind(this)
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		onCancelPress: function (oEvent) {

			var oModel = this.getView().getModel(),
				oViewModel = this.getView().getModel("view");

			oModel.resetChanges();
			oViewModel.setProperty("/editMode", false);
		},

		onSavePress: function (oEvent) {

			var oModel = this.getView().getModel(),
				oViewModel = this.getView().getModel("view");

			oModel.submitBatch(oModel.getUpdateGroupId()).then(function () {
				MessageToast.show("Book successfully changed.");
				oModel.refresh();
				oViewModel.setProperty("/editMode", false);
				UIComponent.getRouterFor(this).navTo("books");
			}.bind(this));
		},

		_onRouteMatched : function (oEvent) {
			var oView = this.getView(),
				oArgs = oEvent.getParameter("arguments"),
				sBookId = !isNaN(oArgs.bookId) && oArgs.bookId;

			oView.unbindElement();

			if (sBookId) {
				oView.bindElement("/Books(" + sBookId + ")");
			} else {
				var oModel = oView.getModel(),
					oViewModel = oView.getModel("view"),
					oListBinding = oModel.bindList("/Books", undefined, undefined, undefined, { $$updateGroupId: "booksGroup" }),
					oProperties = {
						"ID": parseInt(Math.random() * 1000000000),
						"title": "[My new book]",
						"descr": "",
						"stock": 1,
						"price": "0",
						"author_ID": 105,
						"currency_code": "USD"
					};

					var oContext = oListBinding.create(oProperties);
					oContext.created().then(function () {
						MessageToast.show("Book successfully created!");
					});
					oView.setBindingContext(oContext);
					oViewModel.setProperty("/editMode", true);
			}
		}
	});
});
