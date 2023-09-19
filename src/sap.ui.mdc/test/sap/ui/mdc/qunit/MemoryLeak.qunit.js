// Some controls, like Field and FilterField cannot be tested using the generic memory leak test
// as there are asynchronous loadings of delegate and inner controls.
// Therefore special tests are added

/* global QUnit*/

sap.ui.define([
	"sap/ui/qunit/utils/MemoryLeakCheck",
	"sap/ui/mdc/field/FieldBase",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/FilterField",
	"sap/ui/mdc/MultiValueField",
	"sap/ui/mdc/field/FieldBaseDelegate", // make sure delegate is loaded
	"sap/ui/mdc/field/MultiValueFieldDelegate", // make sure delegate is loaded
	"sap/ui/mdc/valuehelp/base/DefineConditionPanel",
	"sap/ui/mdc/field/FieldInput", // make sure inner control is loaded
	"sap/ui/mdc/field/FieldMultiInput", // make sure inner control is loaded
	"sap/ui/mdc/ValueHelp",
	"sap/ui/mdc/valuehelp/Popover",
	"sap/ui/mdc/valuehelp/Dialog",
	"sap/ui/mdc/valuehelp/content/MTable",
	"sap/ui/mdc/valuehelp/content/Conditions",
	"sap/ui/mdc/filterbar/vh/FilterBar", // make sure inner control is loaded
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/m/library",
	"sap/m/Popover",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/ScrollContainer",
	"sap/m/VBox",
	"sap/m/Panel",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/ValueStateHeader",
	"sap/ui/layout/FixFlex",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/String",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/core/Core"
], function (
		MemoryLeakCheck,
		FieldBase,
		Field,
		FilterField,
		MultiValueField,
		FieldBaseDelegate,
		MultiValueFieldDelegate,
		DefineConditionPanel,
		FieldInput,
		FieldMultiInput,
		ValueHelp,
		VHPopover,
		VHDialog,
		MTable,
		VHConditions,
		VHFilterBar,
		ConditionModel,
		Condition,
		FilterOperatorUtil,
		mLibrary,
		Popover,
		Dialog,
		Button,
		Label,
		Text,
		Table,
		Column,
		ColumnListItem,
		ScrollContainer,
		VBox,
		Panel,
		Toolbar,
		ToolbarSpacer,
		ValueStateHeader,
		FixFlex,
		JSONModel,
		StringType,
		ResourceModel,
		oCore
	) {
	"use strict";

	MemoryLeakCheck.checkControl("FieldBase", function() {
		const oField = new FieldBase("F1", {
			dataType: 'sap.ui.model.type.String' // set to prevent test to set dummy value
		});
		// configure the Field
		return oField;
	});

	MemoryLeakCheck.checkControl("Field", function() {
		const oField = new Field("F1", {
			dataType: 'sap.ui.model.type.String' // set to prevent test to set dummy value
		});
		// configure the Field
		return oField;
	});

	MemoryLeakCheck.checkControl("FilterField", function() {
		const oField = new FilterField("F1", {
			dataType: 'sap.ui.model.type.String', // set to prevent test to set dummy value
			dataTypeFormatOptions: {}, // set to prevent test to set dummy value
			dataTypeConstraints: {maxLength: 1000}, // set to prevent test to set dummy value
			operators: ["EQ", "BT", "GE", "LE"] // set to prevent test to set dummy value
		});
		// configure the Field
		return oField;
	});

	MemoryLeakCheck.checkControl("MultiValueField", function() {
		const oField = new MultiValueField("F1", {
			dataType: 'sap.ui.model.type.String', // set to prevent test to set dummy value
			dataTypeFormatOptions: {}, // set to prevent test to set dummy value
			dataTypeConstraints: {maxLength: 1000} // set to prevent test to set dummy value
		});
		// configure the Field
		return oField;
	});

	const oModel = new JSONModel({
		items:[{text: "Item 1", key: "I1", additionalText: "Text 1", filter: "XXX"},
			   {text: "Item 2", key: "I2", additionalText: "Text 2", filter: "XXX"},
			   {text: "X-Item 3", key: "I3", additionalText: "Text 3", filter: "YYY"}]
		});
	oCore.setModel(oModel);

	MemoryLeakCheck.checkControl("ValueHelp Typeahead", function() {
		// don't need to be really rendered or opened, just test if inner controls are cleared.
		const oItemTemplate = new ColumnListItem({
			type: "Active",
			cells: [new Text({text: "{key}"}),
					new Text({text: "{text}"}),
					new Text({text: "{additionalText}"})]
		});

		const oMTable = new MTable("VH1-MTable", {
			filterFields: "text",
			keyPath: "key",
			descriptionPath: "text",
			table: new Table("VH1-Table", {
				width: "26rem",
				columns: [ new Column({header: new Label({text: "Id"})}),
						new Column({header: new Label({text: "Text"})}),
						new Column({header: new Label({text: "Info"})})],
				items: {path: "/items", template: oItemTemplate}
			})
		});
		const oPopover = new VHPopover("VH1-Pop", {
			title: "Title",
			content: oMTable
		});
		const oValueHelp = new ValueHelp("VH1", {
			typeahead: oPopover
		});
		const oField = new FilterField("F1", {
			dataType: 'sap.ui.model.type.String', // set to prevent test to set dummy value
			valueHelp: "VH1",
			dependents: [oValueHelp, oItemTemplate]
		});
		// configure the Field und ValueHelp faking somme calls what would be triggered by opening (as Test canno be async here)
		oField.onfocusin(); // to connect ValueHelp
		oMTable.getContent(); // to create internal controls
		oPopover.getContainerControl(); // to create internal controls
		oValueHelp.open(true);
		return oField;
	});

	MemoryLeakCheck.checkControl("ValueHelp Dialog", function() {
		// don't need to be really rendered or opened, just test if inner controls are cleared.
		const oItemTemplate = new ColumnListItem({
			type: "Active",
			cells: [new Text({text: "{key}"}),
					new Text({text: "{text}"}),
					new Text({text: "{additionalText}"})]
		});

		const oMTable = new MTable("VH1-MTable", {
			filterFields: "text",
			keyPath: "key",
			descriptionPath: "text",
			table: new Table("VH1-Table", {
				width: "26rem",
				columns: [ new Column({header: new Label({text: "Id"})}),
						new Column({header: new Label({text: "Text"})}),
						new Column({header: new Label({text: "Info"})})],
				items: {path: "/items", template: oItemTemplate}
			})
		});
		const oDialog = new VHDialog("VH1-Dia", {
			title: "Title",
			content: [oMTable, new VHConditions("VH1-Cond", {label: "Label"})]
		});
		const oValueHelp = new ValueHelp("VH1", {
			dialog: oDialog
		});
		const oField = new FilterField("F1", {
			dataType: 'sap.ui.model.type.String', // set to prevent test to set dummy value
			conditions: [Condition.createItemCondition("I1"),
						 Condition.createCondition("BT", ["A", "Z"])],
			valueHelp: "VH1",
			dependents: [oValueHelp, oItemTemplate]
		});
		// configure the Field und ValueHelp faking somme calls what would be triggered by opening (as Test canno be async here)
		oField.onfocusin(); // to connect ValueHelp
		oMTable.getContent(); // to create internal controls
		oDialog.getContainerControl(); // to create internal controls
		oValueHelp.open(true);
		return oField;
	});

	MemoryLeakCheck.checkControl("DefineConditionPanel", function() {
		const oDataType = new StringType();
		const oConfig = {
				dataType: oDataType,
				maxConditions: -1,
				delegate: FieldBaseDelegate
		};

		const oDCP = new DefineConditionPanel("DCP1", {
			conditions: [Condition.createCondition("EQ", ["Test1"]),
						 Condition.createCondition("BT", ["A", "Z"])],
			config: oConfig
		});

		return oDCP;
	});

	QUnit.start();

});
