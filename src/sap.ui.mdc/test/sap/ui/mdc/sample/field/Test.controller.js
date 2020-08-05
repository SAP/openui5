sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/EditMode"
], function(Controller, Filter, FilterOperator, JSONModel, Condition, EditMode) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.field.Test", {

		onInit: function(oEvent) {
			var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings();
			oFormatSettings.setUnitMappings({
				"g": "mass-gram",
				"kg": "mass-kilogram",
				"mg": "mass-milligram",
				"t": "mass-metric-ton"
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
					additionalValue: null
				}
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

		toggleDisplay: function(oEvent) {
			var sId;
			switch (oEvent.oSource) {
			case this.getView().byId("B11"):
				sId = "F11";
				break;

			case this.getView().byId("B3-5"):
				sId = "F3-5";
				break;

			default:
				return;
			}

			var oField = this.byId(sId);
			var bPressed = oEvent.getParameter("pressed");
			if (bPressed) {
				oField.setEditMode(EditMode.Display);
			} else {
				oField.setEditMode(EditMode.Editable);
			}
		},

		handleButton: function(oEvent) {
			var oApp = this.byId("MyApp");
			var sKey = oEvent.getParameter("key");
			var oCurrentPage = oApp.getCurrentPage();
			var oNewPage = this.byId(sKey);
			var sPageId = oNewPage.getId();
			oApp.to(sPageId);
			oNewPage.setFooter(oCurrentPage.getFooter());
		},

		handleIconPress: function(oEvent) {
			var oButton = oEvent.oSource;
			var oFieldHelp = oButton.getParent().getParent();
			var vKey = oButton.getIcon().substr(11);
			oFieldHelp.fireSelectEvent([Condition.createCondition("EQ", [vKey])]);
		},

		handleBeforeOpen: function(oEvent) {
			var oFieldHelp = oEvent.oSource;
			var aConditions = oFieldHelp.getConditions();
			var aButtons = oFieldHelp.getContent().getItems();
			var vKey;

			if (aConditions.length === 1) {
				vKey = aConditions[0].values[0];
			}
			for (var i = 0; i < aButtons.length; i++) {
				var oButton = aButtons[i];
				if (oButton.getIcon().substr(11) == vKey) {
					oButton.setType(sap.m.ButtonType.Emphasized);
				} else {
					oButton.setType(sap.m.ButtonType.Default);
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
		}

	});
}, true);
