sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/mdc/enums/OperatorName",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/base/i18n/Formatting"
], function(
	Controller,
	JSONModel,
	Condition,
	FieldEditMode,
	OperatorName,
	mobileLibrary,
	MessageToast,
	Formatting
) {
	"use strict";

	var ButtonType = mobileLibrary.ButtonType;

	return Controller.extend("sap.ui.mdc.sample.field.Test", {

		onInit: function(oEvent) {

			Formatting.setUnitMappings({
				"g": "mass-gram",
				"kg": "mass-kilogram",
				"mg": "mass-milligram",
				"t": "mass-metric-ton",
				"cm": "length-centimeter"
			});

			var oView = this.getView();
			oView.bindElement("/ProductCollection('1239102')");

			var oViewModel = new JSONModel({
				editMode: false,
				ODataUnitCodeList: {
					"G" : {Text : "gram", UnitSpecificScale : 2},
					"KG" : {Text : "Kilogram", UnitSpecificScale : 3},
					"MG" : {Text : "Milligram", UnitSpecificScale : 4},
					"TO" : {Text : "ton", UnitSpecificScale : 5}
				},
				ODataCurrencyCodeList: {
					"EUR" : {Text : "Euro", UnitSpecificScale : 2},
					"USD" : {Text : "US-Dollar", UnitSpecificScale : 2},
					"JPY" : {Text : "Japan Yen", UnitSpecificScale : 0},
					"SEK" : {Text : "Swedish krona", UnitSpecificScale : 5}
				},
				field: {
					value: "22134T",
					additionalValue: null,
					additionalDateValue: null
				},
				collectiveSearch: [
								   {key: "1", description: "Search 1"},
								   {key: "2", description: "Search 2"}
								   ]
			});
			this.getView().setModel(oViewModel, "view");
		},

		handleChange: function(oEvent) {
			var oField = oEvent.getSource();
//			var sValue = oEvent.getParameter("value");
//			var bValid = oEvent.getParameter("valid");
			var oPromise = oEvent.getParameter("promise");
			var oText = this.byId("MyText");
			var oIcon = this.byId("MyIcon");
			var fnMakeBusy = function() {
				var oAdditionalField;
				this._iBusyIndicatorDelay = oField.getBusyIndicatorDelay();
				oField.setBusyIndicatorDelay(0);
				oField.setBusy(true);

				// also set dependent Fields busy
				if (oField === this.getView().byId("IOFCountry")) {
					oAdditionalField = this.getView().byId("IOFRegion");
					oAdditionalField.setBusyIndicatorDelay(0);
					oAdditionalField.setBusy(true);
					oAdditionalField = this.getView().byId("IOFCity");
					oAdditionalField.setBusyIndicatorDelay(0);
					oAdditionalField.setBusy(true);
				} else if (oField === this.getView().byId("IOFRegion")) {
					oAdditionalField = this.getView().byId("IOFCity");
					oAdditionalField.setBusyIndicatorDelay(0);
					oAdditionalField.setBusy(true);
				}
			}.bind(this);
			var fnRemoveBusy = function() {
				var oAdditionalField;
				oField.setBusy(false);
				oField.setBusyIndicatorDelay(this._iBusyIndicatorDelay);
				// also set dependent Fields un-busy
				if (oField === this.getView().byId("IOFCountry")) {
					oAdditionalField = this.getView().byId("IOFRegion");
					oAdditionalField.setBusyIndicatorDelay(this._iBusyIndicatorDelay);
					oAdditionalField.setBusy(false);
					oAdditionalField = this.getView().byId("IOFCity");
					oAdditionalField.setBusyIndicatorDelay(this._iBusyIndicatorDelay);
					oAdditionalField.setBusy(false);
				} else if (oField === this.getView().byId("IOFRegion")) {
					oAdditionalField = this.getView().byId("IOFCity");
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

				oPromise.then(function(sValue) {
					fnRemoveBusy();
					oIcon.setSrc("sap-icon://message-success");
					oIcon.setColor("Positive");
					oText.setText("Field: " + oField.getId() + " Change: value = " + sValue);
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

		handlePress: function(oEvent) {
			var oField = oEvent.oSource;
			var oText = this.byId("MyText");
			var oIcon = this.byId("MyIcon");
			oText.setText("Field: " + oField.getId() + " Press");
			oIcon.setSrc("sap-icon://message-success");
			oIcon.setColor("Positive");
		},

		handleSubmit: function(oEvent) {
			var oField = oEvent.oSource;
			var oPromise = oEvent.getParameter("promise");

			if (oPromise) {
				oPromise.then(function(sValue) {
					MessageToast.show("ENTER on " + oField.getId() + " value: " + sValue);
				}).catch(function(oException) {
					MessageToast.show("ENTER wth error on " + oField.getId());
				});
			}
		},

		toggleDisplay: function(oEvent) {
			var sId;
			switch (oEvent.oSource) {
			case this.getView().byId("B11"):
				sId = "F11";
				break;

			case this.getView().byId("B24"):
				sId = "F24";
				break;

			case this.getView().byId("B3-5"):
				sId = "F3-5";
				break;

			case this.getView().byId("B3-6"):
				sId = "F3-6";
				break;

			case this.getView().byId("B3-7"):
				sId = "F3-7";
				break;

			default:
				return;
			}

			var oField = this.byId(sId);
			var bPressed = oEvent.getParameter("pressed");
			if (bPressed) {
				oField.setEditMode(FieldEditMode.Display);
			} else {
				oField.setEditMode(FieldEditMode.Editable);
			}
		},

		handleButton: function(oEvent) {
			var oApp = this.byId("MyApp");
			var oItem = oEvent.getParameter("item");
			var sKey = oItem.getKey();
			var oCurrentPage = oApp.getCurrentPage();
			var oNewPage = this.byId(sKey);
			var sPageId = oNewPage.getId();
			oApp.to(sPageId);
			oNewPage.setFooter(oCurrentPage.getFooter());
		},

		handleIconPress: function(oEvent) {
			var oButton = oEvent.oSource;
			var oValueHelp = oButton.getParent().getParent();
			var vKey = oButton.getIcon().substr(11);
			oValueHelp.fireSelectEvent([Condition.createCondition(OperatorName.EQ, [vKey])]);
		},

		handleBeforeOpen: function(oEvent) {
			var oValueHelp = oEvent.oSource;
			var aConditions = oValueHelp.getConditions();
			var aButtons = oValueHelp.getContent().getItems();
			var vKey;

			if (aConditions.length === 1) {
				vKey = aConditions[0].values[0];
			}
			for (var i = 0; i < aButtons.length; i++) {
				var oButton = aButtons[i];
				if (oButton.getIcon().substr(11) == vKey) {
					oButton.setType(ButtonType.Emphasized);
				} else {
					oButton.setType(ButtonType.Default);
				}
			}
		},

		handleAsyncVHOpen: function(oEvent) {
			setTimeout(function() {
				var oWrapper = this.getView().byId("FVH2-W");
				var oTable = this.getView().byId("FVH2-T");
				if (!oWrapper.getTable()) {
					oWrapper.setTable(oTable);
				}
			}.bind(this), 100);
		},

		validateFieldGroup: function(oEvent) {
			var aFieldGroup = oEvent.getParameters().fieldGroupIds;
			if (aFieldGroup.indexOf("MyFieldGroup") > -1) { //own FieldGroup
				var oField = oEvent.getSource();
				MessageToast.show("FieldGroup left on " + oField.getId());
			}
		}

	});
});
