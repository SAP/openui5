sap.ui.define([
	"sap/ui/layout/form/SimpleForm",
	"sap/m/App",
	"sap/m/Label",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/Page",
    "sap/ui/core/library",
	"sap/m/RadioButton",
	"sap/m/RadioButtonGroup",
	"sap/m/FlexBox",
	"sap/m/Text",
	"sap/ui/core/Element",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/CheckBox",
	"sap/m/VBox",
	"sap/m/HBox",
	"sap/m/Input"

], function(
	SimpleForm,
	App,
	Label,
	JSONModel,
	Button,
	Page,
    coreLibrary,
	RadioButton,
	RadioButtonGroup,
	FlexBox,
	Text,
	Element,
	IconTabBar,
	IconTabFilter,
	CheckBox,
	VBox,
	HBox,
	Input
) {
	"use strict";

	//Shortcuts
	const ValueState = coreLibrary.ValueState,
		TextDirection = coreLibrary.TextDirection;

	var iIndex = 100;

	function handleTextChange(oEvent) {
		var oText = oEvent.oSource;
		var oRBGroup = Element.getElementById("RBG5");

		if (isNaN(oText.getValue())){
			oText.setValueState(sap.ui.core.ValueState.Error);
			return;
		} else {
			oText.setValueState(sap.ui.core.ValueState.None);
		}

		oRBGroup.setSelectedIndex( parseInt(oText.getValue()) );
		updateInfo();
	}

	function handleTextChangeID(oEvent) {
		var oText = oEvent.oSource;
		var oRBGroup = Element.getElementById("RBG5");

		for (var i = 0; i < oRBGroup.getButtons().length; i++){
			if (oText.getValue() == oRBGroup.getButtons()[i].getId()){
				var oButton = oRBGroup.getButtons()[i];
			}
		}

		if (!oButton){
			oText.setValueState(sap.ui.core.ValueState.Error);
			return;
		} else {
			oText.setValueState(sap.ui.core.ValueState.None);
		}

		oRBGroup.setSelectedButton(oButton);
		updateInfo();
	}

	function handleTextChangeText(oEvent) {
		var oText = oEvent.oSource;
		var oRBGroup = Element.getElementById("RBG5");

		if (oRBGroup.getSelectedButton()) {
			oRBGroup.getSelectedButton().setText(oText.getValue());
		}

		updateInfo();
	}

	function handleSelect(oEvent) {
		updateInfo();
	}

	function handlePressAdd(oEvent) {
		var oButton = oEvent.oSource;
		var oRBGroup = Element.getElementById("RBG5");

		iIndex++;
		var oButton = new RadioButton("RB5-" + iIndex);
		oButton.setText("Option " + iIndex);
		oRBGroup.addButton(oButton);

		updateInfo();
	}

	function handlePressInsertBefore(oEvent) {
		var oButton = oEvent.oSource;
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
		var oButton = oEvent.oSource;
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
		var oButton = oEvent.oSource;
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
		var oButton = oEvent.oSource;
		var oRBGroup = Element.getElementById("RBG5");

		oRBGroup.setEnabled(!oRBGroup.getEnabled());
		if (oRBGroup.getEnabled()){
			oButton.setText("Disable");
		} else {
			oButton.setText("Enable");
		}

		updateInfo();
	}

	function handleToggleEnabled(oEvent) {
		var oCB = oEvent.oSource;
		var oRBGroup = Element.getElementById("RBG5");

		if (oRBGroup.getSelectedButton()) {
			oRBGroup.getSelectedButton().setEnabled(oCB.getSelected());
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
	oButton.setEnabled(false);
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
	oButton = new RadioButton("RB2-2");
	oButton.setText("Option 2");
	oRBGroupRBG2.addButton(oButton);
	oButton = new RadioButton("RB2-3");
	oButton.setText("Option 3");
	oRBGroupRBG2.addButton(oButton);

	var oLabeloRBGroupRBG2 = new Label({ text: "Group with 2 colums: ", labelFor: oRBGroupRBG2});

	var flexBoxRBG2 = new FlexBox("rbg2", {
	alignItems: "Start",
	direction: "Column",
	items: [
		oLabeloRBGroupRBG2, oRBGroupRBG2
	]});

	// RadioButtonGroup with 3 columns and different length but given width
	var oRBGroupRBG3 = new RadioButtonGroup("RBG3");
	oRBGroupRBG3.setColumns(3);
	oRBGroupRBG3.setWidth("350px");

	var oButton = new RadioButton("RB3-1");
	oButton.setText("Long Option Number 1");
	oRBGroupRBG3.addButton(oButton);
	oButton = new RadioButton("RB3-2");
	oButton.setText("Option 2");
	oButton.setEnabled(false);
	oRBGroupRBG3.addButton(oButton);
	oButton = new RadioButton("RB3-3");
	oButton.setText("Nr.3");
	oRBGroupRBG3.addButton(oButton);
	var oButton = new RadioButton("RB3-4");
	oButton.setText("Long Option 4");
	oRBGroupRBG3.addButton(oButton);
	oButton = new RadioButton("RB3-5");
	oButton.setText("Option 5");
	oRBGroupRBG3.addButton(oButton);
	oButton = new RadioButton("RB3-6");
	oButton.setText("Nr.6");
	oRBGroupRBG3.addButton(oButton);

	var oLabeloRBGroupRBG3 = new Label({ text: "Group with 3 colums and width 100% in container of 350px - test for cutting: ", labelFor: oRBGroupRBG3});

	var oLabeloRBGroupRBG31 = new Label({ text: "Groups with 3 colums and different number of rows: "});

	var flexBoxRBG31 = new VBox("vbRbg31", {
		items: [
			oLabeloRBGroupRBG31,
			new RadioButtonGroup({
				columns: 3,
				buttons: [
					new RadioButton({text: "Text"}),
					new RadioButton({text: "Text"}),
					new RadioButton({text: "Text"})
				]
			}),
			new RadioButtonGroup({
				columns: 3,
				buttons: [
					new RadioButton({text: "Text"}),
					new RadioButton({text: "Text"}),
					new RadioButton({text: "Text"}),
					new RadioButton({text: "Text"}),
					new RadioButton({text: "Text"}),
					new RadioButton({text: "Text"})
				]
			}),
			new RadioButtonGroup({
				columns: 3,
				buttons: [
					new RadioButton({text: "Text"}),
					new RadioButton({text: "Text text tex text text"}),
					new RadioButton({text: "Text"}),
					new RadioButton({text: "Text"}),
					new RadioButton({text: "Text"}),
					new RadioButton({text: "Text"})
				]
			}),
			new RadioButtonGroup({
				columns: 3,
				width: "250px",
				buttons: [
					new RadioButton({text: "Text"}),
					new RadioButton({text: "Text text tex text text"}),
					new RadioButton({text: "Text"})
				]
			})
		]
	});

	var flexBoxRBG3 = new FlexBox("rbg3", {
	alignItems: "Start",
	direction: "Column",
	items: [
		oLabeloRBGroupRBG3, oRBGroupRBG3
	]});

	// RadioButtonGroup with 2 columns and different length but given width 2
	var oRBGroupRBG3a = new RadioButtonGroup("RBG3a");
	oRBGroupRBG3a.setColumns(2);
	oRBGroupRBG3a.setWidth("200px");

	var oButton = new RadioButton("RB3a-1");
	oButton.setText("Long Option Number 1");
	oRBGroupRBG3a.addButton(oButton);
	oButton = new RadioButton("RB3a-2");
	oButton.setText("Option 2");
	oButton.setEnabled(false);
	oRBGroupRBG3a.addButton(oButton);
	oButton = new RadioButton("RB3a-3");
	oButton.setText("Nr.3");
	oRBGroupRBG3a.addButton(oButton);

	var oLabeloRBGroupRBG3a = new Label({ text: "Group with 2 colums and width 200px - test for cutting: ", labelFor: oRBGroupRBG3a});

	var flexBoxRBG3a = new FlexBox("rbg3a", {
	alignItems: "Start",
	direction: "Column",
	items: [
		oLabeloRBGroupRBG3a, oRBGroupRBG3a
	]});

	// RadioButtonGroup with 3 colums ans 1 row
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

	var oRBGroupRBG5 = new RadioButtonGroup("RBG5");
	oRBGroupRBG5.setColumns(2);
	oRBGroupRBG5.setSelectedIndex(-1);
	oRBGroupRBG5.attachSelect(handleSelect);
	oButton = new RadioButton("RB5-1");
	oButton.setText("Option 1");
	oRBGroupRBG5.addButton(oButton);
	oButton = new RadioButton("RB5-2");
	oButton.setText("Option 2");
	oRBGroupRBG5.addButton(oButton);
	oButton = new RadioButton("RB5-3");
	oButton.setText("Option 3");
	oRBGroupRBG5.addButton(oButton);


	var oButton1 = new Button("B1");
	oButton1.setText("Add");
	oButton1.attachPress(handlePressAdd);

	var oButton3 = new Button("B2");
	oButton3.setText("Insert Before");
	oButton3.attachPress(handlePressInsertBefore);

	var oButton4 = new Button("B3");
	oButton4.setText("Insert After");
	oButton4.attachPress(handlePressInsertAfter);

	var oButton5 = new Button("B4");
	oButton5.setText("Remove");
	oButton5.attachPress(handlePressRemove);

	var oButton6 = new Button("B5");
	oButton6.setText("Remove all");
	oButton6.attachPress(handlePressRemoveAll);


	var oButton7 = new Button("B6");
	oButton7.setText("Destroy");
	oButton7.attachPress(handlePressDestroy);


	var oButton8 = new Button("B7");
	oButton8.setText("ReadOnly");
	oButton8.attachPress(handlePressEditable);

	var oButton2 = new Button("B8");
	oButton2.setText("Enabled");
	oButton2.attachPress(handlePressEnabled);


	var oLabel = new Label("Label1");
	oLabel.setText("Set Selected Index");

	var oText = new Input("TF1");
	oText.attachChange(handleTextChange);
	oText.setWidth("5em");
	oLabel.setLabelFor(oText);

	var oLabel2 = new Label("Label2");
	oLabel2.setText("Selected Index");

	var oText2 = new Input("TF2");
	oText2.setEditable(false);
	oText2.setWidth("5em");
	oText2.setValue(oRBGroupRBG5.getSelectedIndex());
	oLabel2.setLabelFor(oText2);

	var oLabel3 = new Label("Label3");
	oLabel3.setText("Set Selected ID");

	var oText3 = new Input("TF3");
	oText3.attachChange(handleTextChangeID);
	oText3.setWidth("5em");
	oLabel3.setLabelFor(oText3);

	var oLabel4 = new Label("Label4");
	oLabel4.setText("Selected ID");

	var oText4 = new Input("TF4");
	oText4.setEditable(false);
	oText4.setWidth("5em");
	if (oRBGroupRBG5.getSelectedButton()) {
		oText4.setValue(oRBGroupRBG5.getSelectedButton().getId());
	} else {
		oText4.setValue("");
	}

	oLabel4.setLabelFor(oText4);

	var oLabel5 = new Label("Label5");
	oLabel5.setText("Text");

	var oText5 = new Input("TF5");
	oText5.attachChange(handleTextChangeText);
	oLabel5.setLabelFor(oText);
	oText5.setWidth("5em");

	var oCheckBox = new CheckBox("CB1");
	oCheckBox.setText("Enabled");
	oCheckBox.setTooltip("Set Enabled for selected Radiobutton");
	oCheckBox.setSelected(false);
	oCheckBox.attachSelect(handleToggleEnabled);

	var oLabeloRBGroupRBG5 = new Label({ text: "Test for interaction: ", labelFor: oRBGroupRBG5});

	var flexBoxRBG5 = new FlexBox("rbg5", {
	alignItems: "Start",
	direction: "Column",
	items: [
		new VBox({
			items: [oLabeloRBGroupRBG5, oRBGroupRBG5]
		}),
		new HBox({
			items: [oButton1,oButton2,oButton3,oButton4,oButton5, oButton6, oButton7, oButton8]
		}),
		new SimpleForm({
			maxContainerCols: 2,
			content: [oLabel, oText, oLabel2, oText2, oLabel3, oText3, oLabel4, oText4, oLabel5, oText5]
		})
	]});

	var oRBGroupRBG6 = new RadioButtonGroup("RBG6", {
		textDirection: TextDirection.RTL,
		width: "400px",
		columns: 2,
		buttons: [
			new RadioButton("RB6-1", {
				text: "Option 1, First Column"
			}),
			new RadioButton("RB6-2", {
				text: "Option 2, Second Column"
			}),
			new RadioButton("RB6-3", {
				text: "Option 3"
			}),
			new RadioButton("RB6-4", {
				text: "Option 4"
			})
		]
	});

	var oLabeloRBGroupRBG6 = new Label({ text: "Group with 2 colums, width 400px, RTL: ", labelFor: oRBGroupRBG6});

	var flexBoxRBG6 = new FlexBox("rbg6", {
	alignItems: "Start",
	direction: "Column",
	items: [
		oLabeloRBGroupRBG6, oRBGroupRBG6
	]});

	var aItems = {
		radioSelected: 2,
		columns: 3,
		radioButtons: [
			{
				Text: "Value",
				Enabled: true,
				FieldType: "First"

			},
			{
				Text: "Data Object",
				Enabled: true,
				FieldType: "Second"

			},
			{
				Text: "Func",
				Enabled: true,
				FieldType: "Third"

			}
		]

	};


	var oRadioGroup = new RadioButtonGroup({
		selectedIndex : "{aitems>/radioSelected}",
		columns : "{aitems>/columns}",
		buttons: {
			path: "aitems>/radioButtons",
			template: new RadioButton({
				text: "{aitems>Text}",
				enabled: "{aitems>Enabled}"
			})
		}
	});

	oRadioGroup.setModel(new JSONModel(aItems), "aitems");

	var oLabeloRBGroupRBG7 = new Label({ text: "Group created with data binding", labelFor: oRadioGroup});

	var flexBoxRBG7 = new FlexBox("rbg7", {
		alignItems: "Start",
		direction: "Column",
		items: [
			oLabeloRBGroupRBG7, oRadioGroup
		]});

	var page = new Page("rbg", {
		title:"Test Page for RadioButtonGroup",
		content: [
			new IconTabBar("itb1", {
				expandable: false,
				items: [
					new IconTabFilter("sample1", {
						key: "key1",
						text: "Sample 1",
						tooltip: "Neutral with long text",
						content: [
							flexBoxRBG1,
							flexBoxRBG1a,
							flexBoxRBG2,
							flexBoxRBG3,
							flexBoxRBG31
						]
					}),
					new IconTabFilter("sample2", {
						key: "key2",
						text: "Sample 2",
						content: [
							flexBoxRBG3a,
							flexBoxRBG4,
							flexBoxRBG6,
							flexBoxRBG7
						]
					}),
					new IconTabFilter({
						key: "key3",
						text: "Sample 3",
						content: [
							flexBoxRBG5
						]
					})
				]
			})
		]
	});
	var app = new App("myApp", {initialPage:"rbg", autoFocus: false});

	app.addPage(page);
	app.placeAt("content");
});
