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
	"sap/ui/mdc/enum/ConditionValidated",
	'sap/ui/mdc/enum/EditMode',
	"sap/m/Table",
	"sap/m/ColumnListItem",
	"sap/m/Column",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/MessageToast"
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
	EditMode,
	Table,
	ColumnListItem,
	Column,
	Label,
	Text,
	MessageToast
) {
	"use strict";

	return Controller.extend("sap.ui.mdc.base.sample.field.fieldBase.Test", {

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
			var oConditionChangeBinding = oCM.bindProperty("/conditions", oCM.getContext("/conditions"));
			oConditionChangeBinding.attachChange(this.handleConditionModelChange.bind(this));

			oCM.addCondition("ProductId", Condition.createCondition("EQ", ["22134T"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("Name", Condition.createCondition("StartsWith", ["Web"], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("Date", Condition.createCondition("EQ", [new Date(1397520000000)], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("Quantity", Condition.createCondition("EQ", [22], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("Description", Condition.createCondition("Contains", ["USB"], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("Status", Condition.createCondition("EQ", ["S1"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("WeightMeasure,WeightUnit", Condition.createCondition("EQ", [[700, "g"]], undefined, undefined, ConditionValidated.NotValidated));

			//set the model on your view
			oView.setModel(oCM, "cm");

			var fnFireChange = function(aConditions, bValid, vWrongValue, oPromise) { this.fireEvent("change", { conditions: aConditions, valid: bValid, promise: oPromise }); };
			var fnGetOperators = function() { return ["EQ"]; };
			var oBaseField = oView.byId("FB1");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField._getOperators = fnGetOperators; // fake Field
			oBaseField = oView.byId("FB2");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField._getOperators = fnGetOperators; // fake Field
			oBaseField = oView.byId("FB3");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB4");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB5");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB6");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB7");
			oBaseField._fireChange = fnFireChange;
			oBaseField._getOperators = fnGetOperators; // fake Field
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB8");
			oBaseField._fireChange = fnFireChange;
			oBaseField._getOperators = fnGetOperators; // fake Field
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB9");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB9a");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB9b");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB9c");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB10");
			var oCM2 = new ConditionModel(); // dummy for Link
			oView.setModel(oCM2, "cm2");
			oCM2.addCondition("Link", Condition.createCondition("EQ", ["My Link"]));
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB11");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB12");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB13");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB14");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB15");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB16");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB16b");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB17");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB18");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField._getOperators = fnGetOperators; // fake Field
			oBaseField = oView.byId("FB19");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB20");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB21");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField = oView.byId("FB-Country");
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);

			// add custom operators
			var oOperator = FilterOperatorUtil.getOperator("EQ");
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
				filterOperator: "NE",
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
			oBaseField._fireChange = fnFireChange;
			oBaseField.attachEvent("change", this.handleChange, this);
			oBaseField._getOperators = function() {return ["GT", "LT", "myEQ", "myNE"];};

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
					oText.setText(oException.message);
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
							oDataTypes[oField.getFieldPath()] = { type: oField._oContentFactory.getDataType() };
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

		handleStatusOpen: function(oEvent) {
			var oFieldHelp = oEvent.oSource;
			var oWrapper = oFieldHelp.getContent();
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

			if (bActive) {
				oFH.setFilterBar(oFB);
			} else {
				oFH.setFilterBar();
			}
		},

		toggleCountrySearch: function(oEvent) {
			var bActive = oEvent.getParameter("selected");
			var oView = this.getView();
			var oFH = oView.byId("FH-Country");

			if (bActive) {
				oFH.setFilterFields("*countryId,text*");
			} else {
				oFH.setFilterFields("");
			}
		},

		toggleFH: function(oEvent) {
			var oView = this.getView();
			var oField = oView.byId("FB-MatrId");
			var bPressed = oEvent.getParameter("pressed");
			if (bPressed) {
				var aConditions = oField.getConditions();
				if (aConditions.length > 1) {
					oField.setConditions([aConditions[0]]); // clear conditions as ListFieldHelp only allows one
				}
				oField.setMaxConditions(1);
				oField.setFieldHelp(oView.byId("LFH-MatrId"));
			} else {
				oField.setFieldHelp(oView.byId("FVH-MatrId"));
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

}, true);
