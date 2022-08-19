sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
	"sap/m/MessageToast",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/field/MultiValueFieldDelegate",
	"delegates/odata/v4/FieldBaseDelegate" // to have it loaded before rendering starts
], function (Controller, UIComponent, JSONModel, Dialog, Button, mobileLibrary, Text, MessageToast, ConditionModel, MultiValueFieldDelegate, FieldBaseDelegate) {

	"use strict";

	var ButtonType = mobileLibrary.ButtonType;

	return Controller.extend("sap.ui.v4demo.controller.AuthorDetails", {
		onInit: function () {

			var oViewModel = new JSONModel({
				editMode: false
			});

			this.getView().setModel(oViewModel, "view");

			UIComponent.getRouterFor(this).getRoute("authordetails").attachPatternMatched(this._onRouteMatched, this);

			// fake own delegate implementation
			MultiValueFieldDelegate.updateItems = function(oPayload, aConditions, oMultiValueField) {

				var oListBinding = oMultiValueField.getBinding("items");

				if (oListBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
					// check if conditions are added, removed or changed
					var oBindingInfo = oMultiValueField.getBindingInfo("items");
					var oTemplate = oBindingInfo.template;
					var oKeyBindingInfo = oTemplate.getBindingInfo("key");
					var oDescriptionBindingInfo = oTemplate.getBindingInfo("description");
					var sKeyPath = oKeyBindingInfo && oKeyBindingInfo.parts[0].path;
					var sDescriptionPath = oDescriptionBindingInfo && oDescriptionBindingInfo.parts[0].path;
					var aContexts = oListBinding.getCurrentContexts();
					var oContext;
					var i = 0;

					// first remove items not longer exist
					if (aContexts.length > aConditions.length) {
						for (i = aConditions.length; i < aContexts.length; i++) {
							oContext = aContexts[i];
							oContext.delete("$auto");
						}
					}

					for (i = 0; i < aConditions.length; i++) {
						var oCondition = aConditions[i];
						oContext = aContexts[i];
						if (!oContext) {
							// new Condition -> add item
							var oItem = {};
							if (sKeyPath) {
								var iIndex = sKeyPath.indexOf("/");
								if (iIndex >= 0) {
									// TODO: how to get the object if bound to key of an object?
									var sPropertyPath = sKeyPath.substr(iIndex + 1);
									sKeyPath = sKeyPath.substr(0, iIndex);
									var oKey = {};
									oKey[sPropertyPath] = oCondition.values[0];
									oItem[sKeyPath] = oKey;
								} else {
									oItem[sKeyPath] = oCondition.values[0];
								}
							}
							if (sDescriptionPath) {
								oItem[sDescriptionPath] = oCondition.values[1];
							}
							oListBinding.create(oItem, false, true); // put on end
						} else if (oCondition.values[0] !== oContext.getValue(sKeyPath)) {
							// condition changed -> remove item and insert new

						}
					}
				}

			};
		},

		onEditButtonPress: function (oEvent) {
			var oViewModel = this.getView().getModel("view");
			var bEditMode = oViewModel.getProperty("editMode");

			if (!bEditMode) {
				sap.ui.require(["sap/ui/mdc/field/FieldInput", "sap/ui/mdc/field/FieldMultiInput", "sap/m/Token"]); // as only rendered in edit mode
			}

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
			UIComponent.getRouterFor(this).navTo("authors");
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
				oView.bindElement({path: "/Authors(" + sAuthorId + ")", parameters: {$expand: 'genres'}});
			} else {
				// unbind addtitinalValue as update dont work
				oView.byId("fCountry").unbindProperty("additionalValue");
				oView.byId("fRegion").unbindProperty("additionalValue");
				oView.byId("fCity").unbindProperty("additionalValue");

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
		},

		onMultiChange: function(oEvent) {
			var oModel = this.getView().getModel();
			oModel.submitBatch(oModel.getUpdateGroupId());
		}

	});
});
