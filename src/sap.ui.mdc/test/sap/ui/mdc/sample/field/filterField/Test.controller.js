sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/FilterConverter",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/enum/ConditionValidated"
], function(
	Controller,
	Filter,
	FilterOperator,
	JSONModel,
	ConditionModel,
	Condition,
	FilterConverter,
	FilterOperatorUtil,
	Operator,
	ConditionValidated
) {
	"use strict";

	return Controller.extend("sap.ui.mdc.base.sample.field.filterField.Test", {

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
				weightUnits: [
					{
						id: "g",
						unit: "g",
						text: "gram"
					},
					{
						id: "kg",
						unit: "kg",
						text: "kilogram"
					},
					{
						id: "mg",
						unit: "mg",
						text: "milligram"
					},
					{
						id: "t",
						unit: "t",
						text: "ton"
					}
				]
			});
			oView.setModel(oViewModel, "view");

			// create a ConditionModel for the listbinding
			var oCM = new ConditionModel();
			var oConditionChangeBinding = oCM.bindProperty("/conditions", oCM.getContext("/"));
			oConditionChangeBinding.attachChange(this.handleConditionModelChange.bind(this));

			oCM.addCondition("ProductId", Condition.createCondition("EQ", ["22134T"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("Name", Condition.createCondition("StartsWith", ["Web"]));
			oCM.addCondition("Quantity", Condition.createCondition("EQ", [22]));
			oCM.addCondition("CountryId", Condition.createCondition("EQ", ["USA"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("RegionId", Condition.createCondition("EQ", ["01"], {"CountryId":"USA"}, undefined, ConditionValidated.Validated));
			oCM.addCondition("CityId", Condition.createCondition("EQ", ["02"], /*{"CountryId":"USA", "RegionId":"01"}*/undefined, undefined, ConditionValidated.Validated));

			//set the model on Form just to have it somehow local
			var oForm = this.byId("Form1");
			oForm.setModel(oCM, "cm");

			// add custom operators
			FilterOperatorUtil.addOperator(new Operator({
				name: "EUROPE",
				tokenParse: "^#tokenText#$",
				tokenFormat: "#tokenText#",
				tokenText: "Europe",
				longText: "European countries",
				valueTypes: [],
				getModelFilter: function(oCondition, sFieldPath) {
					var oFilter1 = new Filter({ path: sFieldPath, operator: "EQ", value1: "DE" });
					var oFilter2 = new Filter({ path: sFieldPath, operator: "EQ", value1: "FR" });
					return new Filter({ filters: [oFilter1, oFilter2], and: false });
				}
			}));
		},

		handleChange: function(oEvent) {
			var oField = oEvent.getSource();
			//			var sValue = oEvent.getParameter("value");
			//			var bValid = oEvent.getParameter("valid");
			//			var aConditions = oEvent.getParameter("conditions");
			var oPromise = oEvent.getParameter("promise");
			var oText = this.byId("MyText");
			var oIcon = this.byId("MyIcon");
			var fnConditionsToText = function(aConditions) {
				var sText;
				if (aConditions) {
					for (var i = 0; i < aConditions.length; i++) {
						var oCondition = aConditions[i];
						if (sText) {
							sText = sText + ", " + oCondition.values[0];
						} else {
							sText = oCondition.values[0];
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

		handleConditionModelChange: function(oEvent) {
			var oDataTypes = {};
			var oView = this.getView();
			var oForm = oView.byId("Form1");
			var oCM = oForm.getModel("cm");
			var oConditions = oCM.getAllConditions();
			var aFormContent = oForm.getContent();

			for (var i = 0; i < aFormContent.length; i++) {
				var oField = aFormContent[i];
				if (oField.isA("sap.ui.mdc.field.FieldBase")) {
					oDataTypes[oField.getFieldPath()] = { type: oField._oContentFactory.getDataType() };
				}
			}

			var oFilter = FilterConverter.createFilters(oConditions, oDataTypes);
			var oTextArea = oView.byId("Cond");
			var oTable = oView.byId("myTable");
			var oListBinding = oTable.getBinding("items");
			oListBinding.filter(oFilter);
			var sVariant = oCM.serialize();
			oTextArea.setValue(sVariant);
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
			//		},
			//
			//		handleGo: function(oEvent) { // TODO: need trigger in FieldHelp
			//			var oFilterConditionModel = oEvent.oSource.getModel("filter");
			//			if (oFilterConditionModel) {
			//				var oFilter = oFilterConditionModel.getFilters();
			//				oFilterConditionModel._oListBinding.filter(oFilter); // TODO: function on CM
			//			}
		},
		clearFilters: function(oEvent) {
			var oCM = this.getView().getModel("cm");
			oCM.removeAllConditions();
		}
	});
}, true);
