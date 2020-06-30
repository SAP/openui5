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

	function uuidv4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		  return v.toString(16);
		});
	  }

	return Controller.extend("sap.ui.v4demo.controller.OrderItemDetails", {

		onInit: function () {

			var oViewModel = new JSONModel({
				editMode: false
			});

			this.getView().setModel(oViewModel, "view");

			UIComponent.getRouterFor(this).getRoute("orderitemdetails").attachPatternMatched(this._onRouteMatched, this);
		},

		onEditButtonPress: function (oEvent) {
			var oViewModel = this.getView().getModel("view");
			var bEditMode = oViewModel.getProperty("editMode");

			oViewModel.setProperty("/editMode", !bEditMode);

		},

		navigateToParent: function () {
			var aSplittedHash = window.location.hash.split("/"),
				sOrderId = aSplittedHash[aSplittedHash.length - 2];
			UIComponent.getRouterFor(this).navTo("orderdetails", {
				orderId: sOrderId
			});
		},

		onDeleteButtonPress: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext(),
				oModel = this.getView().getModel();

			var dialog = new Dialog({
				title: 'Confirm',
				type: 'Message',
				content: new Text({ text: "Really delete this order item?" }),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: 'Submit',
					press: function () {
						oContext.delete("$auto").then(function () {
							MessageToast.show("OrderItem deleted");
							oModel.refresh();
							dialog.close();
							this.navigateToParent();

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
				MessageToast.show("OrderItem successfully changed.");
				oModel.refresh();
				oViewModel.setProperty("/editMode", false);

				this.navigateToParent();

			}.bind(this));
		},

		_onRouteMatched : function (oEvent) {
			var oView = this.getView(),
				oArgs = oEvent.getParameter("arguments"),
				sOrderId = oArgs.orderId != "add" && oArgs.orderId,
				sOrderItemId = oArgs.orderItemId != "add" && oArgs.orderItemId;

			oView.unbindElement();

			if (sOrderItemId) {
				oView.bindElement("/OrderItems(" + sOrderItemId + ")");
			} else {
				var oModel = oView.getModel(),
					oViewModel = oView.getModel("view"),
					oListBinding = oModel.bindList("/OrderItems", undefined, undefined, undefined, { $$updateGroupId: "booksGroup" }),
					oProperties = {
						"ID": uuidv4(),
						"amount": 1,
						"netAmount": "11.11",
						"parent_ID": sOrderId,
						"book_ID": 201
					};

					var oContext = oListBinding.create(oProperties);
					oContext.created().then(function () {
						MessageToast.show("Order successfully created!");
					});
					oView.setBindingContext(oContext);
					oViewModel.setProperty("/editMode", true);
			}
		}
	});
});
