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
	"sap/ui/mdc/enums/ConditionValidated",
	'sap/ui/mdc/enums/FieldEditMode',
	"sap/ui/mdc/enums/OperatorName",
	"sap/m/Table",
	"sap/m/ColumnListItem",
	"sap/m/Column",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/MessageToast",
	"sap/base/i18n/Formatting"
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
	ConditionValidated,
	FieldEditMode,
	OperatorName,
	Table,
	ColumnListItem,
	Column,
	Label,
	Text,
	MessageToast,
	Formatting
) {
	"use strict";

	return Controller.extend("sap.ui.mdc.base.sample.field.fieldBase.Test", {

		onInit: function(oEvent) {
			Formatting.setUnitMappings({
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
			var oConditionChangeBinding = oCM.bindProperty("/conditions", oCM.getContext("/conditions"));
			oConditionChangeBinding.attachChange(this.handleConditionModelChange.bind(this));

			oCM.addCondition("ProductId", Condition.createCondition(OperatorName.EQ, ["22134T"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("Name", Condition.createCondition(OperatorName.StartsWith, ["Web"], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("Date", Condition.createCondition(OperatorName.EQ, [new Date(1397520000000)], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("Quantity", Condition.createCondition(OperatorName.EQ, [22], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("Description", Condition.createCondition(OperatorName.Contains, ["USB"], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("Status", Condition.createCondition(OperatorName.EQ, ["S1"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("WeightMeasure,WeightUnit", Condition.createCondition(OperatorName.EQ, [[700, "g"]], undefined, undefined, ConditionValidated.NotValidated));

			//set the model on your view
			oView.setModel(oCM, "cm");

			var fnFireChange = function(aConditions, bValid, vWrongValue, oPromise) { this.fireEvent("change", { conditions: aConditions, valid: bValid, promise: oPromise }); };
			var fnGetOperators = function() { return [OperatorName.EQ]; };
			var oBaseField = oView.byId("FB1");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField.getSupportedOperators = fnGetOperators; // fake Field
			oBaseField = oView.byId("FB2");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField.getSupportedOperators = fnGetOperators; // fake Field
			oBaseField = oView.byId("FB3");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB4");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB5");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB6");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB7");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.getSupportedOperators = fnGetOperators; // fake Field
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB8");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.getSupportedOperators = fnGetOperators; // fake Field
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB9");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB9a");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB9b");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB9c");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB10");
			var oCM2 = new ConditionModel(); // dummy for Link
			oView.setModel(oCM2, "cm2");
			oCM2.addCondition("Link", Condition.createCondition(OperatorName.EQ, ["My Link"]));
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB11");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB12");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB13");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB14");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB15");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB16");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB16b");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB17");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB18");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField.getSupportedOperators = fnGetOperators; // fake Field
			oBaseField = oView.byId("FB19");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB20");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB21");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB-Country");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);

			// add custom operators
			var oOperator = FilterOperatorUtil.getOperator(OperatorName.EQ);
			var oMyOperator = new Operator({
				name: "myEQ",
				filterOperator: oOperator.filterOperator,
				tokenParse: oOperator.tokenParse,
				tokenFormat: oOperator.tokenFormat,
				tokenText: "My Equal",
				valueTypes: oOperator.valueTypes,
				displayFormats: oOperator.displayFormats,
				format: oOperator.format,
				parse: oOperator.parse,
				getValues: oOperator.getValues,
				isEmpty: oOperator.isEmpty,
				getCheckValue: oOperator.getCheckValue,
				checkValidated: oOperator.checkValidated,
				validateInput: oOperator.validateInput
			});
			FilterOperatorUtil.addOperator(oMyOperator);
			oMyOperator = new Operator({
				name: "myNE",
				filterOperator: FilterOperator.NE,
				tokenParse: "^!=(.+)$",
				tokenFormat: "!(={0})",
				tokenText: "My NotEqual",
				valueTypes: oOperator.valueTypes,
				displayFormats: oOperator.displayFormats,
				format: function(oCondition, oType, sDisplayFormat) {
						return "!=" + oOperator.format(oCondition, oType, sDisplayFormat);
					},
					parse: oOperator.parse,
				getValues: oOperator.getValues,
				isEmpty: oOperator.isEmpty,
				getCheckValue: oOperator.getCheckValue,
				checkValidated: oOperator.checkValidated,
				validateInput: oOperator.validateInput,
				exclude: true
			});
			FilterOperatorUtil.addOperator(oMyOperator);

			oBaseField = oView.byId("FB-MatrId");
			oBaseField.fireChangeEvent = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField.getSupportedOperators = function() {return [OperatorName.GT, OperatorName.LT, "myEQ", "myNE"];};

		},

		handleChange: function(oEvent) {
			var oField = oEvent.getSource();
			//			var aConditions = oEvent.getParameter("conditions");
			//			var bValid = oEvent.getParameter("valid");
			var oPromise = oEvent.getParameter("promise");
			var oText = this.byId("MyText");
			var oIcon = this.byId("MyIcon");

			if (oPromise) {
				this._iBusyIndicatorDelay = oField.getBusyIndicatorDelay();
				oField.setBusyIndicatorDelay(0);
				oField.setBusy(true);

				oIcon.setSrc("sap-icon://lateness");
				oIcon.setColor("Neutral");
				oText.setText("Pending update");

				oPromise.then(function(aConditions) {
					oField.setBusy(false);
					oField.setBusyIndicatorDelay(this._iBusyIndicatorDelay);
					this._iBusyIndicatorDelay = undefined;

					oIcon.setSrc("sap-icon://message-success");
					oIcon.setColor("Positive");

					oText.setText("Field: " + oField.getId() + " Change: value = " + fnConditionsToText(aConditions));
				}.bind(this)).catch(function(oException) {
					oField.setBusy(false);
					oField.setBusyIndicatorDelay(this._iBusyIndicatorDelay);
					this._iBusyIndicatorDelay = undefined;

					oIcon.setSrc("sap-icon://error");
					oIcon.setColor("Negative");
					if (oException && oException.message) {
						oText.setText(oException.message);
					} else {
						oText.setText(oException); // might be wrong value
					}
				}.bind(this));
			}
		},

		handleConditionModelChange: function(oEvent) {
			var oCM = this.getView().getModel("cm");
			var oConditions = oCM.getAllConditions();
			var oDataTypes = {};
			var oView = this.getView();
			var oForm = oView.byId("Form1");
			var aFormContainers = oForm.getFormContainers();

			for (var i = 0; i < aFormContainers.length; i++) {
				var aFormElements = aFormContainers[i].getFormElements();
				for (var j = 0; j < aFormElements.length; j++) {
					var aFields = aFormElements[j].getFields();
					for (var k = 0; k < aFields.length; k++) {
						var oField = aFields[k];
						if (oField.isA("sap.ui.mdc.field.FieldBase")) {
							oDataTypes[""] = { type: oField._oContentFactory.getDataType() };
						}
					}
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
				oPromise.then(function(aConditions) {
					MessageToast.show("ENTER on " + oField.getId() + " value: " + fnConditionsToText(aConditions));
				}).catch(function(oException) {
					MessageToast.show("ENTER wth error on " + oField.getId());
				});
			}
		},

		toggleDisplay: function(oEvent) {
			var oField = this.byId("F11");
			var bPressed = oEvent.getParameter("pressed");
			if (bPressed) {
				oField.setEditMode(FieldEditMode.Display);
			} else {
				oField.setEditMode(FieldEditMode.Editable);
			}
		},

		handleButton: function(oEvent) {
			var oApp = this.byId("MyApp");
			var sKey = oEvent.getParameter("item").getKey();
			var oCurrentPage = oApp.getCurrentPage();
			var oNewPage = this.byId(sKey);
			var sPageId = oNewPage.getId();
			oApp.to(sPageId);
			oNewPage.setFooter(oCurrentPage.getFooter());
		},

		handleStatusOpen: function(oEvent) {
			var oValueHelp = oEvent.oSource;
			var oWrapper = oValueHelp.getContent();
			setTimeout(function() { // test async table assignment
				var oTable = oWrapper.getTable();
				if (!oTable) {
					var oItem = new ColumnListItem({
						type: "Active",
						cells: [new Text({ text: "{StatusId}" }),
						new Text({ text: "{Name}" })]
					});
					oTable = new Table("StatusTable", {
						width: "20rem",
						columns: [new Column({ header: new Label({ text: "{/#Status/StatusId/@sap:label}" }), width: "4rem" }),
						new Column({ header: new Label({ text: "{/#Status/Name/@sap:label}" }) })],
						items: { path: '/StatusCollection', template: oItem }
					});
					oWrapper.setTable(oTable);
				}
			}, 1000);
		},

		clearFilters: function(oEvent) {
			var oCM = this.getView().getModel("cm");
			oCM.removeAllConditions();
		},

		handleModeChange: function(oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			var oView = this.getView();
			var oBaseField = oView.byId("FB9");
			oBaseField.setEditMode(oItem.getKey());
			oBaseField = oView.byId("FB9a");
			oBaseField.setEditMode(oItem.getKey());
			oBaseField = oView.byId("FB9b");
			oBaseField.setEditMode(oItem.getKey());
			oBaseField = oView.byId("FB9c");
			oBaseField.setEditMode(oItem.getKey());
		},

		toggleCountryFilterBar: function(oEvent) {
			var bActive = oEvent.getParameter("selected");
			var oView = this.getView();
			var oFH = oView.byId("FH-Country");
			var oFB = oView.byId("FH-FB-Country");
			var oVHTable = oView.byId("VH-Country-Dialog-MTable");
			var oVHFB = oView.byId("VH-FB-Country");

			if (bActive) {
				oFH.setFilterBar(oFB);
				oVHTable.setFilterBar(oVHFB);
			} else {
				oFH.setFilterBar();
				oVHTable.setFilterBar();
			}
		},

		toggleCountrySearch: function(oEvent) {
			var bActive = oEvent.getParameter("selected");
			var oView = this.getView();
			var oFH = oView.byId("FH-Country");
			var oVHTable = oView.byId("VH-Country-Dialog-MTable");

			if (bActive) {
				oFH.setFilterFields("*countryId,text*");
				oVHTable.setFilterFields("*countryId,text*");
			} else {
				oFH.setFilterFields("");
				oVHTable.setFilterFields("");
			}
		},

		toggleVH: function(oEvent) {
			var oView = this.getView();
			var oField = oView.byId("FB-MatrId");
			var bPressed = oEvent.getParameter("pressed");
			if (bPressed) {
				var aConditions = oField.getConditions();
				if (aConditions.length > 1) {
					oField.setConditions([aConditions[0]]); // clear conditions as FixedList only allows one
				}
				oField.setMaxConditions(1);
				oField.setValueHelp(oView.byId("LFH-MatrId"));
			} else {
				oField.setValueHelp(oView.byId("VH-MatrId-FL"));
				oField.setMaxConditions(-1);
			}
		}

	});

	function fnConditionsToText(aConditions) {
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
	}

});
