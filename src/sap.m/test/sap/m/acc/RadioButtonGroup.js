sap.ui.define([
	"sap/base/Log",
	"sap/m/App",
	"sap/m/Button",
	"sap/m/FlexBox",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/m/RadioButton",
	"sap/m/RadioButtonGroup",
	"sap/ui/commons/layout/MatrixLayout",
	"sap/ui/commons/layout/MatrixLayoutCell",
	"sap/ui/commons/library",
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(
	Log,
	App,
	Button,
	FlexBox,
	Label,
	MessageToast,
	Page,
	RadioButton,
	RadioButtonGroup,
	MatrixLayout,
	MatrixLayoutCell,
	commonsLibrary,
	oCore,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.ui.commons.layout.VAlign
	var VAlign = commonsLibrary.layout.VAlign;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	var iIndex = 100;

	function handleSelect(oEvent) {
		updateInfo();
	}

	function handlePressAdd(oEvent) {
		var oRBGroup = oCore.byId("RBG5");

		iIndex++;
		var oButton = new RadioButton("RB5-" + iIndex);
		oButton.setText("Option " + iIndex);
		oRBGroup.addButton(oButton);

		updateInfo();
	}

	function handlePressInsertBefore(oEvent) {
		var oRBGroup = oCore.byId("RBG5");

		iIndex++;
		var oButton = new RadioButton("RB5-" + iIndex);
		oButton.setText("Option " + iIndex);
		if (iIndex > 1){
			var iIndexIns = oRBGroup.getSelectedIndex();
		} else {
			var iIndexIns = 0;
		}
		oRBGroup.insertButton(oButton, iIndexIns);

		updateInfo();
	}

	function handlePressInsertAfter(oEvent) {
		var oRBGroup = oCore.byId("RBG5");

		iIndex++;
		var oButton = new RadioButton("RB5-" + iIndex);
		oButton.setText("Option " + iIndex);
		if (iIndex > 1){
			var iIndexIns = oRBGroup.getSelectedIndex() + 1;
		} else {
			var iIndexIns = 0;
		}
		oRBGroup.insertButton(oButton, iIndexIns);

		updateInfo();
	}

	function handlePressRemove(oEvent) {
		var oRBGroup = oCore.byId("RBG5");

		if (oRBGroup.getButtons().length > 0) {
			oRBGroup.removeButton(0);
		}

		updateInfo();
	}

	function handlePressRemoveAll(oEvent) {
		var oRBGroup = oCore.byId("RBG5");

		oRBGroup.removeAllButtons();

		updateInfo();
	}

	function handlePressDestroy(oEvent) {
		var oRBGroup = oCore.byId("RBG5");

		oRBGroup.destroyButtons();

		updateInfo();
	}

	function handlePressEditable(oEvent) {
		var oButton = oEvent.getSource();
		var oRBGroup = oCore.byId("RBG5");

		oRBGroup.setEditable(!oRBGroup.getEditable());
		if (oRBGroup.getEditable()){
			oButton.setText("ReadOnly");
		} else {
			oButton.setText("Editable");
		}

		updateInfo();
	}

	function handlePressEnabled(oEvent) {
		var oButton = oEvent.getSource();
		var oRBGroup = oCore.byId("RBG5");

		oRBGroup.setEnabled(!oRBGroup.getEnabled());
		if (oRBGroup.getEnabled()){
			oButton.setText("Disable");
		} else {
			oButton.setText("Enable");
		}

		updateInfo();
	}

	function updateInfo(){
		var oRBGroup = oCore.byId("RBG5");
		var oText2 = oCore.byId("TF2");
		var oText3 = oCore.byId("TF4");
		var oText5 = oCore.byId("TF5");
		var oCB = oCore.byId("CB1");
		if (oRBGroup.getButtons().length > 0){
			oText2.setValue(oRBGroup.getSelectedIndex());
			if (oRBGroup.getSelectedButton()) {
				oText3.setValue(oRBGroup.getSelectedButton().getId());
				oCB.setSelected(oRBGroup.getSelectedButton().getEnabled());
			} else {
				oText3.setValue("");
				oCB.setSelected(false);
			}

			oText5.setEnabled(true);
		} else {
			oText2.setValue("");
			oText3.setValue("");
			oCB.setSelected(false);
			oText5.setEnabled(false);
		}
	}

	// Simple RadioButtonGroup
	var oRBGroupRBG1 = new RadioButtonGroup("RBG1");
	oRBGroupRBG1.setTooltip("Group 1");

	var oButton = new RadioButton("RB1-1");
	oButton.setText("Option 1");
	oButton.setEditable(false);
	oButton.setTooltip("Tooltip 1");
	oRBGroupRBG1.addButton(oButton);

	oButton = new RadioButton("RB1-2");
	oButton.setText("Option 2");
	oButton.setTooltip("Tooltip 2");
	oButton.setEditable(false);
	oRBGroupRBG1.addButton(oButton);

	oButton = new RadioButton("RB1-3");
	oButton.setText("Option 3");
	oButton.setTooltip("Tooltip 3");
	oRBGroupRBG1.addButton(oButton);

	var oLabeloRBGroupRBG1 = new Label({ text: "Simple group: ", labelFor: oRBGroupRBG1});

	var flexBoxRBG1 = new FlexBox("rbg1", {
		alignItems: "Start",
		direction: "Column",
		items: [
			oLabeloRBGroupRBG1, oRBGroupRBG1
		]});

	var oRBGroupRBG1a = new RadioButtonGroup("RBG1a");
	oRBGroupRBG1a.setTooltip("Group 1a");
	oRBGroupRBG1a.setColumns(2);

	var oButton = new RadioButton("RB1a-1");
	oButton.setText("Option 1");
	oButton.setTooltip("Tooltip 1");
	oRBGroupRBG1a.addButton(oButton);

	oButton = new RadioButton("RB1a-2");
	oButton.setText("Option 2");
	oButton.setTooltip("Tooltip 2");
	oRBGroupRBG1a.addButton(oButton);

	var oLabeloRBGroupRBG1a = new Label({ text: "Simple group 2: ", labelFor: oRBGroupRBG1a});

	var flexBoxRBG1a = new FlexBox("rbg1a", {
		alignItems: "Start",
		direction: "Column",
		items: [
			oLabeloRBGroupRBG1a, oRBGroupRBG1a
		]});

	var oRBGroupRBG2 = new RadioButtonGroup("RBG2");
	oRBGroupRBG2.setColumns(2);
	oRBGroupRBG2.setValueState(ValueState.Warning);

	var oButton = new RadioButton("RB2-1");
	oButton.setText("Option 1");
	oRBGroupRBG2.addButton(oButton);
	oButton = new RadioButton("RB2-3");
	oButton.setText("Option 3");
	oRBGroupRBG2.addButton(oButton);
	oButton = new RadioButton("RB2-2");
	oButton.setText("Option 2");
	oRBGroupRBG2.addButton(oButton);

	var oLabeloRBGroupRBG2 = new Label({ text: "Group with 2 columns: ", labelFor: oRBGroupRBG2});

	var flexBoxRBG2 = new FlexBox("rbg2", {
		alignItems: "Start",
		direction: "Column",
		items: [
			oLabeloRBGroupRBG2, oRBGroupRBG2
		]});

	// RadioButtonGroup with 3 columns and different length but given width
	var oRBGroupRBG3 = new RadioButtonGroup("RBG3");
	oRBGroupRBG3.setColumns(3);

	var oButton = new RadioButton("RB3-1");
	oButton.setText("Long Option Number 1");
	oRBGroupRBG3.addButton(oButton);
	oButton = new RadioButton("RB3-3");
	oButton.setText("Option 3");
	oButton.setEnabled(false);
	oRBGroupRBG3.addButton(oButton);
	oButton = new RadioButton("RB3-5");
	oButton.setText("Nr.5");
	oRBGroupRBG3.addButton(oButton);
	var oButton = new RadioButton("RB3-2");
	oButton.setText("Long Option 2");
	oRBGroupRBG3.addButton(oButton);
	oButton = new RadioButton("RB3-4");
	oButton.setText("Option 4");
	oRBGroupRBG3.addButton(oButton);
	oButton = new RadioButton("RB3-6");
	oButton.setText("Nr.6");
	oRBGroupRBG3.addButton(oButton);

	var oLabeloRBGroupRBG3 = new Label({ text: "Group with 3 columns and width 100% in container of 350px ", labelFor: oRBGroupRBG3});

	var flexBoxRBG3 = new FlexBox("rbg3", {
		alignItems: "Start",
		direction: "Column",
		items: [
			oLabeloRBGroupRBG3, oRBGroupRBG3
		]});

	// RadioButtonGroup with 2 columns and different length but given width 2
	var oRBGroupRBG3a = new RadioButtonGroup("RBG3a");
	oRBGroupRBG3a.setColumns(2);

	var oButton = new RadioButton("RB3a-1");
	oButton.setText("Long Option Number 1");
	oRBGroupRBG3a.addButton(oButton);
	oButton = new RadioButton("RB3a-3");
	oButton.setText("Option 3");
	oButton.setEnabled(false);
	oRBGroupRBG3a.addButton(oButton);
	oButton = new RadioButton("RB3a-2");
	oButton.setText("Nr.2");
	oRBGroupRBG3a.addButton(oButton);

	var oLabeloRBGroupRBG3a = new Label({ text: "Group with 2 columns and width 200px - test for cutting: ", labelFor: oRBGroupRBG3a});

	var flexBoxRBG3a = new FlexBox("rbg3a", {
		alignItems: "Start",
		direction: "Column",
		items: [
			oLabeloRBGroupRBG3a, oRBGroupRBG3a
		]});

	// RadioButtonGroup with 3 columns ans 1 row
	var oRBGroupRBG4 = new RadioButtonGroup("RBG4", {
		columns : 4,
		valueState : ValueState.Error
	});
	oRBGroupRBG4.setColumns(4);

	var oButton = new RadioButton("RB4-1");
	oButton.setText("Option 1");
	oButton.setTooltip("Tooltip 1");
	oRBGroupRBG4.addButton(oButton);
	oButton = new RadioButton("RB4-2");
	oButton.setText("Option 2");
	oButton.setTooltip("Tooltip 2");
	oRBGroupRBG4.addButton(oButton);
	oButton = new RadioButton("RB4-3");
	oButton.setText("Option 3");
	oButton.setTooltip("Tooltip 3");
	oRBGroupRBG4.addButton(oButton);

	var oLabeloRBGroupRBG4 = new Label({ text: "Group with 3 RadioButtons in 1 Row: ", labelFor: oRBGroupRBG4});

	var flexBoxRBG4 = new FlexBox("rbg4", {
		alignItems: "Start",
		direction: "Column",
		items: [
			oLabeloRBGroupRBG4, oRBGroupRBG4
		]});

	// test for methods
	var oLyt = new MatrixLayout("matrix1");
	oLyt.setLayoutFixed(false);
	oLyt.setColumns(4);

	var oRBGroupRBG5 = new RadioButtonGroup("RBG5");
	oRBGroupRBG5.setColumns(2);
	oRBGroupRBG5.setSelectedIndex(-1);
	oRBGroupRBG5.attachSelect(handleSelect);
	oButton = new RadioButton("RB5-1");
	oButton.setText("Option 1");
	oButton.setTooltip("Tooltip 1");
	oRBGroupRBG5.addButton(oButton);
	oButton = new RadioButton("RB5-2");
	oButton.setText("Option 2");
	oButton.setTooltip("Tooltip 2");
	oRBGroupRBG5.addButton(oButton);
	oButton = new RadioButton("RB5-3");
	oButton.setText("Option 3");
	oButton.setTooltip("Tooltip 3");
	oRBGroupRBG5.addButton(oButton);

	var oCell1 = new MatrixLayoutCell("Cell1");
	oCell1.addContent(oRBGroupRBG5);
	oCell1.setVAlign(VAlign.Top);
	oCell1.setColSpan(2);
	oCell1.setRowSpan(5);

	var oButton = new Button("B1");
	oButton.setText("Add");
	oButton.setTooltip("Add a RadioButton");
	oButton.attachPress(handlePressAdd);

	oLyt.createRow(oCell1, oButton);

	oButton = new Button("B2");
	oButton.setText("Insert Before");
	oButton.setTooltip("Insert a RadioButton before selected one");
	oButton.attachPress(handlePressInsertBefore);

	var oButton2 = new Button("B3");
	oButton2.setText("Insert After");
	oButton2.setTooltip("Insert a RadioButton after selected one");
	oButton2.attachPress(handlePressInsertAfter);
	oLyt.createRow(oButton, oButton2);

	oButton = new Button("B4");
	oButton.setText("Remove");
	oButton.setTooltip("Remove first RadioButton");
	oButton.attachPress(handlePressRemove);

	oButton2 = new Button("B5");
	oButton2.setText("Remove all");
	oButton2.setTooltip("Remove all RadioButtons");
	oButton2.attachPress(handlePressRemoveAll);

	oLyt.createRow(oButton, oButton2);

	oButton = new Button("B6");
	oButton.setText("Destroy");
	oButton.setTooltip("Destroy RadioButtons");
	oButton.attachPress(handlePressDestroy);

	oLyt.createRow(oButton);

	oButton = new Button("B7");
	oButton.setText("ReadOnly");
	oButton.setTooltip("Toggle Editable");
	oButton.attachPress(handlePressEditable);

	oButton2 = new Button("B8");
	oButton2.setText("Enabled");
	oButton2.setTooltip("toggle Enabled");
	oButton2.attachPress(handlePressEnabled);

	oLyt.createRow(oButton, oButton2);

	var app = new App("myApp", {
		initialPage:"rbg",
		autoFocus: false
	});

	var page = new Page("rbg", {
		title:"Test Page for sap.m.RadioButtonGroup",
		content : [
			flexBoxRBG1,flexBoxRBG1a,flexBoxRBG2,flexBoxRBG3,flexBoxRBG3a,flexBoxRBG4
		]
	});

	app.addPage(page);
	app.placeAt("body");
});
