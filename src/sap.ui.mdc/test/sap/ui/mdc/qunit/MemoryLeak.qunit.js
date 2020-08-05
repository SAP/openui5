// Some controls, like Field and FilterField cannot be tested using the generic memory leak test
// as there are asynchronous loadings of delegate and inner controls.
// Therefore special tests are added

/* global QUnit*/

sap.ui.define([
	"sap/ui/qunit/utils/MemoryLeakCheck",
	"sap/ui/mdc/field/FieldBase",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/field/FieldValueHelp",
	"sap/ui/mdc/field/ValueHelpPanel",
	"sap/ui/mdc/field/DefineConditionPanel",
	"sap/ui/mdc/field/FieldValueHelpMTableWrapper",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/field/FieldBaseDelegate", // make sure delegate is loaded
	"sap/m/library",
	"sap/m/Input", // make sure inner control is loaded
	"sap/m/MultiInput", // make sure inner control is loaded
	"sap/m/Popover",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/ScrollContainer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/String"
], function (
		MemoryLeakCheck,
		FieldBase,
		Field,
		FilterField,
		FieldValueHelp,
		ValueHelpPanel,
		DefineConditionPanel,
		FieldValueHelpMTableWrapper,
		ConditionModel,
		Condition,
		FilterOperatorUtil,
		FieldBaseDelegate,
		mLibrary,
		Input,
		MultiInput,
		Popover,
		Dialog,
		Button,
		Label,
		Text,
		Table,
		Column,
		ColumnListItem,
		ScrollContainer,
		JSONModel,
		StringType
	) {
	"use strict";

	MemoryLeakCheck.checkControl("FieldBase", function() {
		var oField = new FieldBase("F1", {
			dataType: 'sap.ui.model.type.String' // set to prevent test to set dummy value
		});
		// configure the Field
		return oField;
	});

	MemoryLeakCheck.checkControl("Field", function() {
		var oField = new Field("F1", {
			dataType: 'sap.ui.model.type.String' // set to prevent test to set dummy value
		});
		// configure the Field
		return oField;
	});

	MemoryLeakCheck.checkControl("FilterField", function() {
		var oField = new FilterField("F1", {
			dataType: 'sap.ui.model.type.String', // set to prevent test to set dummy value
			dataTypeFormatOptions: {}, // set to prevent test to set dummy value
			dataTypeConstraints: {maxLength: 1000}, // set to prevent test to set dummy value
			operators: ["EQ", "BT", "GE", "LE"] // set to prevent test to set dummy value
		});
		// configure the Field
		return oField;
	});

	var oModel = new JSONModel({
		items:[{text: "Item 1", key: "I1", additionalText: "Text 1", filter: "XXX"},
			   {text: "Item 2", key: "I2", additionalText: "Text 2", filter: "XXX"},
			   {text: "X-Item 3", key: "I3", additionalText: "Text 3", filter: "YYY"}]
		});
	sap.ui.getCore().setModel(oModel);

	MemoryLeakCheck.checkControl("FieldValueHelp Suggestion", function() {
		// don't need to be really rendered or opened, just test if inner controls are cleared.
		var oItemTemplate = new ColumnListItem({
			type: "Active",
			cells: [new Text({text: "{key}"}),
					new Text({text: "{text}"}),
					new Text({text: "{additionalText}"})]
		});

		var oFieldHelp = new FieldValueHelp("FH1", {
			content: new FieldValueHelpMTableWrapper({
				table: new Table({
					width: "26rem",
					columns: [ new Column({header: new Label({text: "Id"})}),
							   new Column({header: new Label({text: "Text"})}),
							   new Column({header: new Label({text: "Info"})})],
					items: {path: "/items", template: oItemTemplate}
				})
			}),
			filterFields: "text",
			keyPath: "key",
			descriptionPath: "text",
			showConditionPanel: true,
			title: "Title"
		});
		var oField = new FilterField("F1", {
			dataType: 'sap.ui.model.type.String', // set to prevent test to set dummy value
			fieldHelp: "FH1",
			dependents: [oFieldHelp, oItemTemplate]
		});
		// configure the Field
		oFieldHelp.open(true);
		return oField;
	});

	MemoryLeakCheck.checkControl("FieldValueHelp Dialog", function() {
		// don't need to be really rendered or opened, just test if inner controls are cleared.
		var oItemTemplate = new ColumnListItem({
			type: "Active",
			cells: [new Text({text: "{key}"}),
					new Text({text: "{text}"}),
					new Text({text: "{additionalText}"})]
		});

		var oFieldHelp = new FieldValueHelp("FH1", {
			content: new FieldValueHelpMTableWrapper({
				table: new Table({
					width: "26rem",
					columns: [ new Column({header: new Label({text: "Id"})}),
							   new Column({header: new Label({text: "Text"})}),
							   new Column({header: new Label({text: "Info"})})],
					items: {path: "/items", template: oItemTemplate}
				})
			}),
			filterFields: "text",
			keyPath: "key",
			descriptionPath: "text",
			showConditionPanel: true,
			title: "Title"
		});
		var oField = new FilterField("F1", {
			dataType: 'sap.ui.model.type.String', // set to prevent test to set dummy value
			conditions: [Condition.createItemCondition("I1"),
						 Condition.createCondition("BT", ["A", "Z"])],
			fieldHelp: "FH1",
			dependents: [oFieldHelp, oItemTemplate]
		});
		// configure the Field
		oField.onfocusin(); // to trigger connect
		oFieldHelp.open(false);
		return oField;
	});

	MemoryLeakCheck.checkControl("DefineConditionPanel", function() {
		var oDataType = new StringType();
		var oFormatOptions = {
				valueType: oDataType,
				maxConditions: -1,
				delegate: FieldBaseDelegate
		};

		var oDCP = new DefineConditionPanel("DCP1", {
			conditions: [Condition.createCondition("EQ", ["Test1"]),
						 Condition.createCondition("BT", ["A", "Z"])],
			formatOptions: oFormatOptions
		});
		// configure the Field
		return oDCP;
	});

	QUnit.start();

});
