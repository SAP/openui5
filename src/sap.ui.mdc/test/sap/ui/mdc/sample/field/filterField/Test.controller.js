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
	'sap/ui/mdc/enums/BaseType',
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/core/Core",
	"sap/ui/core/date/UI5Date",
	"sap/m/DatePicker"
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
	BaseType,
	ConditionValidated,
	OperatorName,
	oCore,
	UI5Date,
	DatePicker
) {
	"use strict";

	return Controller.extend("sap.ui.mdc.base.sample.field.filterField.Test", {

		onInit: function(oEvent) {
			var oFormatSettings = oCore.getConfiguration().getFormatSettings();
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
				info: ""
			});
			oView.setModel(oViewModel, "view");

			// create a ConditionModel for the listbinding
			var oCM = new ConditionModel();
			var oConditionChangeBinding = oCM.bindProperty("/conditions", oCM.getContext("/"));
			oConditionChangeBinding.attachChange(this.handleConditionModelChange.bind(this));

			oCM.addCondition("ProductId", Condition.createCondition(OperatorName.EQ, ["22134T"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("Name", Condition.createCondition(OperatorName.StartsWith, ["Web"]));
			oCM.addCondition("Quantity", Condition.createCondition(OperatorName.EQ, [22]));
			oCM.addCondition("CountryId", Condition.createCondition(OperatorName.EQ, ["USA"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("RegionId", Condition.createCondition(OperatorName.EQ, ["02"], {"conditions/CountryId":"USA"}, undefined, ConditionValidated.Validated));
			oCM.addCondition("CityId", Condition.createCondition(OperatorName.EQ, ["02"], /*{"conditions/CountryId":"USA", "conditions/RegionId":"01"}*/undefined, undefined, ConditionValidated.Validated));

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
					var oFilter1 = new Filter({ path: sFieldPath, operator: FilterOperator.EQ, value1: "DE" });
					var oFilter2 = new Filter({ path: sFieldPath, operator: FilterOperator.EQ, value1: "FR" });
					return new Filter({ filters: [oFilter1, oFilter2], and: false });
				}
			}));

			FilterOperatorUtil.addOperator(new Operator({ // Date for DateTime FilterField
				name: "MYDATE",
				alias: {Date: "DATE", DateTime: "DATE"},
				filterOperator: FilterOperator.EQ,
				longText: "Date", // only needed for MultiValue
				tokenText: "Date", // only needed for MultiValue
				tokenParse: "^=([^=].*)$", // only needed for MultiValue
				tokenFormat: "{0}", // only needed for MultiValue
				valueTypes: [{name: "sap.ui.model.odata.type.DateTime", constraints: {displayFormat: "Date"}}], // use date type to have no time part
				createControl: function(oType, sPath, iIndex, sId)  { // only needed for MultiValue
					return new DatePicker(sId, { // render always a DatePicker, also for DateTime
						value: {path: sPath, type: oType, mode: 'TwoWay'},
						width: "100%"
					});
				},
				getModelFilter: function (oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
					if (oType.isA("sap.ui.model.odata.type.DateTime")) {
						// var oOperatorType = this._createLocalType(this.valueTypes[0]);
						var oFrom = UI5Date.getInstance(oCondition.values[0]); // do not modify original date object
						// var oModelFormat = oType.getModelFormat(); // use ModelFormat to convert in JS-Date and add 23:59:59
						// var oOperatorModelFormat = oOperatorType.getModelFormat(); // use ModelFormat to convert in JS-Date and add 23:59:59
						// var oDate = oOperatorModelFormat.parse(oFrom, false);
						// oFrom = oModelFormat.format(oDate);
						var oDate = UI5Date.getInstance(oFrom.getUTCFullYear(), oFrom.getUTCMonth(), oFrom.getUTCDate()); // TODO we need a Type function to convert it to a locale date
						oFrom = UI5Date.getInstance(oDate.getTime());
						oDate.setHours(23);
						oDate.setMinutes(59);
						oDate.setSeconds(59);
						oDate.setMilliseconds(999);
						// var oTo = oModelFormat.format(oDate);
						var oTo = UI5Date.getInstance(oDate.getTime());
						return new Filter({path: sFieldPath, operator: FilterOperator.BT, value1: oFrom, value2: oTo});
					} else {
						return new Filter({path: sFieldPath, operator: this.filterOperator, value1: oCondition.values[0]});
					}
				}
			}));
			FilterOperatorUtil.addOperatorForType(BaseType.DateTime, "MYDATE");
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
					oDataTypes[oField.getPropertyKey()] = { type: oField.getContentFactory().getDataType(), baseType: oField.getBaseType() };
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
			var oView = this.getView();
			var oForm = oView.byId("Form1");
			var oCM = oForm.getModel("cm");
			oCM.removeAllConditions();
		}
	});
});
