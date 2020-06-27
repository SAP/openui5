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
	"sap/m/MessageToast",
	"sap/ui/mdc/condition/ConditionModel"

], function (Controller, UIComponent, JSONModel, Dialog, Button, ButtonType, Text, MessageToast, ConditionModel) {

	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.AuthorDetails", {
		onInit: function () {

			var oViewModel = new JSONModel({
				editMode: false
			});

			this.getView().setModel(oViewModel, "view");
			this.getView().setModel("cm", new ConditionModel());

			UIComponent.getRouterFor(this).getRoute("authordetails").attachPatternMatched(this._onRouteMatched, this);

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
				content: new Text({ text: "Really delete this author?" }),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: 'Submit',
					press: function () {
						oContext.delete("$auto").then(function () {
							MessageToast.show("Author deleted");
							oModel.refresh();
							dialog.close();
							UIComponent.getRouterFor(this).navTo("authors");
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
				MessageToast.show("Author successfully changed.");
				oModel.refresh();
				oViewModel.setProperty("/editMode", false);
				UIComponent.getRouterFor(this).navTo("authors");
			}.bind(this));
		},

		_onRouteMatched : function (oEvent) {

			var oView = this.getView(),
				oArgs = oEvent.getParameter("arguments"),
				sAuthorId = !isNaN(oArgs.authorId) && oArgs.authorId;

			oView.unbindElement();

			if (sAuthorId) {
				oView.bindElement("/Authors(" + sAuthorId + ")");
			} else {
				var oModel = oView.getModel(),
					oViewModel = oView.getModel("view"),
					oListBinding = oModel.bindList("/Authors", undefined, undefined, undefined, { $$updateGroupId: "booksGroup" }),
					oProperties = {
						"ID": parseInt(Math.random() * 1000000000),
						"name": "[my new author]",
						"dateOfBirth": "1981-01-14",
						"dateOfDeath": "2121-01-01",
						"countryOfOrigin_code": "US",
						"regionOfOrigin_code": "MWS",
						"cityOfOrigin_city": "CL"
					};

					var oContext = oListBinding.create(oProperties);
					oContext.created().then(function () {
						MessageToast.show("Author successfully created!");
					});
					oView.setBindingContext(oContext);
					oViewModel.setProperty("/editMode", true);
			}
		}

	});
});
