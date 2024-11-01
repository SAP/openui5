sap.ui.define([
	"sap/base/Log",
	"sap/m/App",
	"sap/m/Button",
	"sap/m/FlexBox",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/RadioButton",
	"sap/m/RadioButtonGroup",
	"sap/ui/core/Element",
	"sap/ui/core/library",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/ResponsiveGridLayout"
], function(
	Log,
	App,
	Button,
	FlexBox,
	Label,
	Page,
	RadioButton,
	RadioButtonGroup,
	Element,
	coreLibrary,
	Form,
	FormContainer,
	FormElement,
	ResponsiveGridLayout
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	var iIndex = 100;

	function handleSelect(oEvent) {
		updateInfo();
	}

	function handlePressAdd(oEvent) {
		var oRBGroup = Element.getElementById("RBG5");

		iIndex++;
		var oButton = new RadioButton("RB5-" + iIndex);
		oButton.setText("Option " + iIndex);
		oRBGroup.addButton(oButton);

		updateInfo();
	}

	function handlePressInsertBefore(oEvent) {
		var oRBGroup = Element.getElementById("RBG5");

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
		var oRBGroup = Element.getElementById("RBG5");

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
		var oRBGroup = Element.getElementById("RBG5");

		if (oRBGroup.getButtons().length > 0) {
			oRBGroup.removeButton(0);
		}

		updateInfo();
	}

	function handlePressRemoveAll(oEvent) {
		var oRBGroup = Element.getElementById("RBG5");

		oRBGroup.removeAllButtons();

		updateInfo();
	}

	function handlePressDestroy(oEvent) {
		var oRBGroup = Element.getElementById("RBG5");

		oRBGroup.destroyButtons();

		updateInfo();
	}

	function handlePressEditable(oEvent) {
		var oButton = oEvent.getSource();
		var oRBGroup = Element.getElementById("RBG5");

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
		var oRBGroup = Element.getElementById("RBG5");

		oRBGroup.setEnabled(!oRBGroup.getEnabled());
		if (oRBGroup.getEnabled()){
			oButton.setText("Disable");
		} else {
			oButton.setText("Enable");
		}

		updateInfo();
	}

	function updateInfo(){
		var oRBGroup = Element.getElementById("RBG5");
		var oText2 = Element.getElementById("TF2");
		var oText3 = Element.getElementById("TF4");
		var oText5 = Element.getElementById("TF5");
		var oCB = Element.getElementById("CB1");
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

	var oLabeloRBGroupRBG5 = new Label({ text: "Group that is changed dynamically", labelFor: oRBGroupRBG5});

	var flexBoxRBG5 = new FlexBox("rbg5", {
		alignItems: "Start",
		direction: "Column",
		items: [
			oLabeloRBGroupRBG5, oRBGroupRBG5
		]});

	const form = new Form({
		editable: true,
		layout: new ResponsiveGridLayout({
			breakpointM: 200,
			labelSpanM: 6
		}),
		formContainers: [
			new FormContainer({
				formElements: [
					new FormElement({
						fields: [
							new Button({
								id: "B1",
								text: "Add",
								tooltip: "Add a RadioButton",
								press: handlePressAdd
							})
						]
					}),
					new FormElement({
						fields: [
							new Button({
								id: "B2",
								text: "Insert Before",
								tooltip: "Insert a RadioButton before selected one",
								press: handlePressInsertBefore
							}),
							new Button({
								id: "B3",
								text: "Insert After",
								tooltip: "Insert a RadioButton after selected one",
								press: handlePressInsertAfter
							})
						]
					}),
					new FormElement({
						fields: [
							new Button({
								id: "B4",
								text: "Remove",
								tooltip: "Remove first RadioButton",
								press: handlePressRemove
							}),
							new Button({
								id: "B5",
								text: "Remove all",
								tooltip: "Remove all RadioButtons",
								press: handlePressRemoveAll
							})
						]
					}),
					new FormElement({
						fields: [
							new Button({
								id: "B6",
								text: "Destroy",
								tooltip: "Destroy RadioButtons",
								press: handlePressDestroy
							})
						]
					}),
					new FormElement({
						fields: [
							new Button({
								id: "B7",
								text: "ReadOnly",
								tooltip: "Toggle Editable",
								press: handlePressEditable
							}),
							new Button({
								id: "B8",
								text: "Enabled",
								tooltip: "Toggle Enabled",
								press: handlePressEnabled
							})
						]
					})
				]
			})
		]
	});

	var app = new App("myApp", {
		initialPage:"rbg",
		autoFocus: false
	});

	var page = new Page("rbg", {
		title:"Test Page for sap.m.RadioButtonGroup",
		content : [
			flexBoxRBG1,
			flexBoxRBG1a,
			flexBoxRBG2,
			flexBoxRBG3,
			flexBoxRBG3a,
			flexBoxRBG4,
			flexBoxRBG5,
			form
		]
	});

	app.addPage(page);
	app.placeAt("body");
});
