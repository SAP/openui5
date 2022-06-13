sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/enum/ConditionValidated",
	"sap/ui/mdc/field/MultiValueFieldDelegate",
	"sap/m/MessageBox",
	"sap/m/Token",
	"sap/base/util/merge",
	"sap/ui/thirdparty/jquery",
	"sap/m/MessageToast"
], function(
		Controller,
		Filter,
		FilterOperator,
		JSONModel,
		ConditionModel,
		Condition,
		FilterOperatorUtil,
		Operator,
		ConditionValidated,
		MultiValueFieldDelegate,
		MessageBox,
		Token,
		merge,
		jQuery,
		MessageToast
		) {
	"use strict";

	return Controller.extend("sap.ui.mdc.base.sample.field.multiValueField.Test", {

		onInit: function(oEvent) {
			var oView = this.getView();
			oView.bindElement("/ProductCollection('1239102')");

			var oViewModel = new JSONModel({
				test: true,
				items: [{ProductId: "22134T", Name: "Webcam"}],
				dateItems: [{date: new Date(2020, 4, 12)}]
			});
			oView.setModel(oViewModel, "view");

			// fake own delegate implementation
			MultiValueFieldDelegate.updateItems = function(oPayload, aConditions, oMultiValueField) {

				var oListBinding = oMultiValueField.getBinding("items");

				if (oListBinding.isA("sap.ui.model.json.JSONListBinding")) {
					// check if conditions are added, removed or changed
					var oBindingInfo = oMultiValueField.getBindingInfo("items");
					var sItemPath = oBindingInfo.path;
					var oTemplate = oBindingInfo.template;
					var oKeyBindingInfo = oTemplate.getBindingInfo("key");
					var oDescriptionBindingInfo = oTemplate.getBindingInfo("description");
					var sKeyPath = oKeyBindingInfo && oKeyBindingInfo.parts[0].path;
					var sDescriptionPath = oDescriptionBindingInfo && oDescriptionBindingInfo.parts[0].path;
					var oModel = oListBinding.getModel();
					var aItems = merge([], oModel.getProperty(sItemPath));

					// first remove items not longer exist
					if (aItems.length > aConditions.length) {
						aItems.splice(aConditions.length);
					}

					for (var i = 0; i < aConditions.length; i++) {
						var oCondition = aConditions[i];
						var oItem = aItems[i];
						if (!oItem) {
							// new Condition -> add item
							oItem = {};
							if (sKeyPath) {
								oItem[sKeyPath] = oCondition.values[0];
							}
							if (sDescriptionPath) {
								oItem[sDescriptionPath] = oCondition.values[1];
							}
							aItems.push(oItem);
						} else if (oCondition.values[0] !== oItem[sKeyPath]) {
							// condition changed -> remove item and insert new
							oItem = {};
							if (sKeyPath) {
								oItem[sKeyPath] = oCondition.values[0];
							}
							if (sDescriptionPath) {
								oItem[sDescriptionPath] = oCondition.values[1];
							}
							aItems.splice(i, 1, oItem);
						}
					}

					oModel.setProperty(sItemPath, aItems);
				} else {
					MessageBox.alert("No implementation for oData V2 model available.");
				}

			};

		},

		handleChange: function(oEvent) {
			var oField = oEvent.getSource();
//			var sValue = oEvent.getParameter("value");
//			var bValid = oEvent.getParameter("valid");
//			var aConditions = oEvent.getParameter("conditions");
			var oPromise = oEvent.getParameter("promise");
			var oText = this.byId("MyText");
			var oIcon = this.byId("MyIcon");
			var fnConditionsToText = function(aItems) {
				var sText;
				if (aItems) {
					for (var i = 0; i < aItems.length; i++) {
						var oItem = aItems[i];
						if (sText) {
							sText = sText + ", " + oItem.getKey();
						} else {
							sText = oItem.getKey();
						}
					}
				}
				return sText;
			};
			var fnMakeBusy = function() {
				var oAdditionalField;
				this._iBusyIndicatorDelay = oField.getBusyIndicatorDelay();
				oField.setBusyIndicatorDelay(0);
				oField.setBusy(true);

				// also set dependent Fields busy
				if (oField === this.getView().byId("IOFFCountry")) {
					oAdditionalField = this.getView().byId("IOFFRegion");
					oAdditionalField.setBusyIndicatorDelay(0);
					oAdditionalField.setBusy(true);
					oAdditionalField = this.getView().byId("IOFFCity");
					oAdditionalField.setBusyIndicatorDelay(0);
					oAdditionalField.setBusy(true);
				} else if (oField === this.getView().byId("IOFFRegion")) {
					oAdditionalField = this.getView().byId("IOFFCity");
					oAdditionalField.setBusyIndicatorDelay(0);
					oAdditionalField.setBusy(true);
				}
			}.bind(this);
			var fnRemoveBusy = function() {
				var oAdditionalField;
				oField.setBusy(false);
				oField.setBusyIndicatorDelay(this._iBusyIndicatorDelay);
				// also set dependent Fields un-busy
				if (oField === this.getView().byId("IOFFCountry")) {
					oAdditionalField = this.getView().byId("IOFFRegion");
					oAdditionalField.setBusyIndicatorDelay(this._iBusyIndicatorDelay);
					oAdditionalField.setBusy(false);
					oAdditionalField = this.getView().byId("IOFFCity");
					oAdditionalField.setBusyIndicatorDelay(this._iBusyIndicatorDelay);
					oAdditionalField.setBusy(false);
				} else if (oField === this.getView().byId("IOFFRegion")) {
					oAdditionalField = this.getView().byId("IOFFCity");
					oAdditionalField.setBusyIndicatorDelay(this._iBusyIndicatorDelay);
					oAdditionalField.setBusy(false);
				}
				this._iBusyIndicatorDelay = undefined;
			}.bind(this);

			if (oPromise) {
				fnMakeBusy();
				oIcon.setSrc("sap-icon://lateness");
				oIcon.setColor("Neutral");
				oText.setText("Parsing");
				oPromise.then(function(aConditions) {
					fnRemoveBusy();
					oIcon.setSrc("sap-icon://message-success");
					oIcon.setColor("Positive");
					oText.setText("Field: " + oField.getId() + " Change: value = " + fnConditionsToText(aConditions));
				}).catch(function(oException) {
					fnRemoveBusy();
					oIcon.setSrc("sap-icon://error");
					oIcon.setColor("Negative");
					if (oException && oException.message) {
						oText.setText(oException.message);
					} else {
						oText.setText(oException); // might be wrong value
					}
				});
			}
		},

		handleLiveChange: function(oEvent) {
			var oField = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			var bEscPressed = oEvent.getParameter("escPressed");
			var oText = this.byId("MyTextRight");
			var oIcon = this.byId("MyIconRight");
			oText.setText("Field: " + oField.getId() + " liveChange: value = " + sValue);

			if (!bEscPressed) {
				oIcon.setSrc("sap-icon://message-success");
				oIcon.setColor("Positive");
			} else {
				oIcon.setSrc("sap-icon://sys-cancel");
				oIcon.setColor("Warning");
			}
		},

		_formatItems: function(aItems) {
			var sText = "";

			for (var i = 0; i < aItems.length; i++) {
				var oItem = aItems[i];
				sText = sText + "[ProductId: " + oItem.ProductId + ", Name: " + oItem.Name + "]\n";
			}

			return sText;
		},

		_formatItemsForText: function(aItems) {
			var sText = "";

			for (var i = 0; i < aItems.length; i++) {
				var oItem = aItems[i];
				sText = sText + oItem.Name + "(" + oItem.ProductId + ")";
				if (i < aItems.length - 1 ) {
					sText += " · ";
				}
			}

			return sText;
		},

		_formatDateItems: function(aItems) {
			var sText = "";

			for (var i = 0; i < aItems.length; i++) {
				var oItem = aItems[i];
				sText = sText + "[date: " + oItem.date.toISOString() + "]\n";
			}

			return sText;
		},

		onEditPress: function (oEvent) {
			var oForm = this.byId("form");
			if (oEvent.getSource().getPressed()) {
				oForm.setEditable(true);
				// MessageToast.show(oEvent.getSource().getId() + " Pressed");
			} else {
				oForm.setEditable(false);
				// MessageToast.show(oEvent.getSource().getId() + " Unpressed");
			}
		},

		onSizePress: function (oEvent) {
			var $body = jQuery("body");

			if (oEvent.getSource().getPressed()) {
				$body.removeClass("sapUiSizeCompact");
				$body.addClass("sapUiSizeCozy");
				MessageToast.show("Cozy");
			} else {
				$body.removeClass("sapUiSizeCozy");
				$body.addClass("sapUiSizeCompact");
				MessageToast.show("Compact");
			}
		}
	});
});
