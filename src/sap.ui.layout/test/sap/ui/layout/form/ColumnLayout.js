sap.ui.require([
	"sap/ui/core/library",
	"sap/ui/layout/library",
	"sap/m/library",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/ColumnLayout",
	"sap/ui/layout/form/ColumnElementData",
	"sap/ui/layout/form/ColumnContainerData",
	"sap/ui/core/Title",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Title",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Input",
	"sap/m/Select",
	"sap/ui/core/ListItem",
	"sap/m/DatePicker",
	"sap/m/RadioButtonGroup",
	"sap/m/RadioButton",
	"sap/m/TextArea",
	"sap/m/Link",
	"sap/m/ToggleButton",
	"sap/m/Button",
	"sap/m/Image",
	"sap/m/CheckBox",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem"
	],
	function(
		CoreLib,
		LayoutLib,
		MLib,
		Form,
		FormContainer,
		FormElement,
		ColumnLayout,
		ColumnElementData,
		ColumnContainerData,
		Title,
		Toolbar,
		ToolbarSpacer,
		mTitle,
		Label,
		Text,
		Input,
		Select,
		ListItem,
		DatePicker,
		RadioButtonGroup,
		RadioButton,
		TextArea,
		Link,
		ToggleButton,
		Button,
		Image,
		CheckBox,
		SegmentedButton,
		SegmentedButtonItem
		) {
	"use strict";

	var toggleLayoutData = function(oEvent){
		var oControl, oLayoutData;
		var oButton = sap.ui.getCore().byId("B1");
		if (oEvent.getParameter("pressed")){
			oControl = sap.ui.getCore().byId("C14-L1");
			oLayoutData = new ColumnElementData({cellsSmall: 2, cellsLarge: 12});
			oControl.setLayoutData(oLayoutData);
			oControl = sap.ui.getCore().byId("C14-I2");
			oLayoutData = new ColumnElementData({cellsSmall: 2, cellsLarge: 12});
			oControl.setLayoutData(oLayoutData);
			oButton.setEnabled(true);
		} else {
			oControl = sap.ui.getCore().byId("C14-L1");
			oControl.destroyLayoutData();
			oControl = sap.ui.getCore().byId("C14-I2");
			oControl.destroyLayoutData();
			oButton.setEnabled(false);
		}
	};

	var changeLayoutData = function(oEvent){
		var oControl = sap.ui.getCore().byId("C14-L1");
		var oLayoutData = oControl.getLayoutData();
		if (oLayoutData){
			oLayoutData.setCellsSmall(4);
			oLayoutData.setCellsLarge(2);
		}
		oControl = sap.ui.getCore().byId("C14-I2");
		oLayoutData = oControl.getLayoutData();
		if (oLayoutData){
			oLayoutData.setCellsSmall(4);
			oLayoutData.setCellsLarge(2);
		}
	};

	var specialColumns = function(oEvent){
		if (oEvent.getParameter("pressed")){
			oLayout1.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
			oLayout2.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
			oLayout3.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
			oLayout4.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
			oLayout5.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
		} else {
			oLayout1.resetProperty("columnsM").resetProperty("columnsL").resetProperty("columnsXL");
			oLayout2.resetProperty("columnsM").resetProperty("columnsL").resetProperty("columnsXL");
			oLayout3.resetProperty("columnsM").resetProperty("columnsL").resetProperty("columnsXL");
			oLayout4.resetProperty("columnsM").resetProperty("columnsL").resetProperty("columnsXL");
			oLayout5.resetProperty("columnsM").resetProperty("columnsL").resetProperty("columnsXL");
		}
	};

	var moveContainer = function(oEvent){
		var oContainer = sap.ui.getCore().byId("C12");
		oForm5.removeFormContainer(oContainer);
		if (oEvent.getParameter("pressed")){
			oForm5.insertFormContainer(oContainer, 0);
		} else {
			oForm5.insertFormContainer(oContainer, 1);
		}
	};

	var newContainer = function(oEvent){
		if (oEvent.getParameter("pressed")){
			oForm5.addFormContainer(oNewContainer);
		} else {
			oForm5.removeFormContainer(oNewContainer);
		}
	};

	var visibilityContainer = function(oEvent){
		var oContainer = sap.ui.getCore().byId("C13");
		if (oEvent.getParameter("pressed")){
			oContainer.setVisible(false);
		} else {
			oContainer.setVisible(true);
		}
	};

	var toggleLabelSize = function(oEvent){
		if (oEvent.getParameter("pressed")){
			oLayout1.setLabelCellsLarge(2);
			oLayout2.setLabelCellsLarge(2);
			oLayout3.setLabelCellsLarge(2);
			oLayout4.setLabelCellsLarge(2);
			oLayout5.setLabelCellsLarge(2);
		} else {
			oLayout1.resetProperty("labelCellsLarge");
			oLayout2.resetProperty("labelCellsLarge");
			oLayout3.resetProperty("labelCellsLarge");
			oLayout4.resetProperty("labelCellsLarge");
			oLayout5.resetProperty("labelCellsLarge");
		}
	};

	var toggleEmptyCells = function(oEvent){
		if (oEvent.getParameter("pressed")){
			oLayout1.setEmptyCellsLarge(2);
			oLayout2.setEmptyCellsLarge(2);
			oLayout3.setEmptyCellsLarge(2);
			oLayout4.setEmptyCellsLarge(2);
			oLayout5.setEmptyCellsLarge(2);
		} else {
			oLayout1.resetProperty("emptyCellsLarge");
			oLayout2.resetProperty("emptyCellsLarge");
			oLayout3.resetProperty("emptyCellsLarge");
			oLayout4.resetProperty("emptyCellsLarge");
			oLayout5.resetProperty("emptyCellsLarge");
		}
	};

	var toggleContainerData = function(oEvent){
		var oContainer1 = sap.ui.getCore().byId("C1");
		var oContainer3 = sap.ui.getCore().byId("C3");
		var oContainer4 = sap.ui.getCore().byId("C4");
		var oContainer9 = sap.ui.getCore().byId("C9");
		var oContainer11 = sap.ui.getCore().byId("C11");
		if (oEvent.getParameter("pressed")){
			oContainer1.destroyLayoutData();
			oContainer3.destroyLayoutData();
			oContainer4.destroyLayoutData();
			oContainer9.destroyLayoutData();
			oContainer11.destroyLayoutData();
		} else {
			oContainer1.setLayoutData(new ColumnContainerData({columnsM: 1, columnsL: 1, columnsXL: 1}));
			oContainer3.setLayoutData(new ColumnContainerData({columnsM: 1, columnsL: 1, columnsXL: 1}));
			oContainer4.setLayoutData(new ColumnContainerData({columnsM: 1, columnsL: 2, columnsXL: 2}));
			oContainer9.setLayoutData(new ColumnContainerData({columnsM: 1, columnsL: 2, columnsXL: 2}));
			oContainer11.setLayoutData(new ColumnContainerData({columnsM: 1, columnsL: 2, columnsXL: 2}));
		}
	};

	var toggleLayoutData2 = function(oEvent){
		var oLayoutData;
		var oContainer = sap.ui.getCore().byId("C3");
		var aElements = oContainer.getFormElements();
		var aFields;
		if (oEvent.getParameter("pressed")){
			aFields = aElements[0].getFields();
			oLayoutData = new ColumnElementData({cellsSmall: 2, cellsLarge: 2});
			aFields[0].setLayoutData(oLayoutData);
			aFields[0].setValueState("Warning");
			aFields = aElements[1].getFields();
			oLayoutData = new ColumnElementData({cellsSmall: 12, cellsLarge: 8});
			aFields[1].setLayoutData(oLayoutData);
			aFields[1].setValueState("Warning");
			aFields = aElements[2].getFields();
			oLayoutData = new ColumnElementData({cellsSmall: 12, cellsLarge: 12});
			aFields[2].setLayoutData(oLayoutData);
			aFields[2].setValueState("Warning");
			aFields = aElements[3].getFields();
			oLayoutData = new ColumnElementData({cellsSmall: 3, cellsLarge: 3});
			aFields[3].setLayoutData(oLayoutData);
			aFields[3].setValueState("Warning");
		} else {
			aFields = aElements[0].getFields();
			aFields[0].destroyLayoutData();
			aFields[0].setValueState("None");
			aFields = aElements[1].getFields();
			aFields[1].destroyLayoutData();
			aFields[1].setValueState("None");
			aFields = aElements[2].getFields();
			aFields[2].destroyLayoutData();
			aFields[2].setValueState("None");
			aFields = aElements[3].getFields();
			aFields[3].destroyLayoutData();
			aFields[3].setValueState("None");
		}
	};

	var oLayout1 = new ColumnLayout("L1");
	var oForm1 = new Form("F1",{
		title: "One Container",
		editable: true,
		layout: oLayout1,
		formContainers: [
			new FormContainer("C1",{
				title: "contact data",
				formElements: [
					new FormElement({
						label: new Label({text:"Name"}),
						fields: [new Input({value: "Mustermann", required: true})]
					}),
					new FormElement({
						label: new Label({text:"First Name"}),
						fields: [new Input({value: "Max", required: true})]
					}),
					new FormElement({
						label: "Street / Number",
						fields: [new Input({value: "Musterstraße"}),
										 new Input({value: "1", layoutData: new ColumnElementData({cellsSmall: 2, cellsLarge: 1})})]
					}),
					new FormElement({
						label: new Label({text: "Post code / City"}),
						fields: [new Input({value: "12345", layoutData: new ColumnElementData({cellsSmall: 3, cellsLarge: 2})}),
										 new Input({value: "Musterstadt"})]
					}),
					new FormElement({
						label: "Country",
						fields: [new Select({selectedKey: "DE",
							items: [new ListItem({key: "GB", text: "England"}),
											new ListItem({key: "US", text: "USA"}),
											new ListItem({key: "DE", text: "Germany"})]
						})]
					}),
					new FormElement({
						label: "Date of birth",
						fields: [new DatePicker({dateValue: new Date(2018, 0, 10), layoutData: new ColumnElementData({cellsSmall: 6, cellsLarge: 3})})]
					}),
					new FormElement({
						label: "Gender",
						fields: [new RadioButtonGroup({
							buttons: [new RadioButton({text: "male"}),
							          new RadioButton({text: "female"})]
						})]
					})
				]
			})
		]
	});
	oForm1.placeAt("content1");

	var oLayout2 = new ColumnLayout("L2");
	var oForm2 = new Form("F2",{
		title: "Two Containers",
		editable: true,
		layout: oLayout2,
		formContainers: [
			new FormContainer("C2",{
				title: "Container 1",
				formElements: [
					new FormElement({
						label: new Label({text: "Text Area"}),
						fields: [new TextArea({rows: 3})]
					}),
					new FormElement({
						label: "Label 2",
						fields: [new Link({text: "Link", href: "http://www.sap.com"}),
										 new Input()]
					}),
					new FormElement({
						label: "Label 3",
						fields: [new Input(),
										 new Input()]
					})
				]
			}),
			new FormContainer("C3",{
				toolbar: new Toolbar("C3-TB", {
					content: [new mTitle("C3-Title", {text: "Container 2", level: CoreLib.TitleLevel.H5, titleStyle: CoreLib.TitleLevel.H5, tooltip: "Title tooltip"}),
					          new ToolbarSpacer(),
					          new ToggleButton({text: "LayoutData", press: toggleLayoutData2})
					          ]
				}),
				ariaLabelledBy: "C3-Title",
				formElements: [
					new FormElement({
						label: new Label({text:"Label 1"}),
						fields: [new Input({value: "1", type: MLib.InputType.Number}),
						         new Input({value: "2", type: MLib.InputType.Number}),
						         new Input({value: "3", type: MLib.InputType.Number})]
					}),
					new FormElement({
						label: "Label 2",
						fields: [new Input({value: "1", type: MLib.InputType.Number}),
						         new Input({value: "2", type: MLib.InputType.Number}),
						         new Input({value: "3", type: MLib.InputType.Number}),
						         new Input({value: "4", type: MLib.InputType.Number})]
					}),
					new FormElement({
						label: new Label({text: "Label 3"}),
						fields: [new Input({value: "1", type: MLib.InputType.Number}),
						         new Input({value: "2", type: MLib.InputType.Number}),
						         new Input({value: "3", type: MLib.InputType.Number}),
						         new Input({value: "4", type: MLib.InputType.Number}),
						         new Input({value: "5", type: MLib.InputType.Number}),
						         new Input({value: "6", type: MLib.InputType.Number}),
						         new Input({value: "7", type: MLib.InputType.Number}),
						         new Input({value: "8", type: MLib.InputType.Number}),
						         new Input({value: "9", type: MLib.InputType.Number}),
						         new Input({value: "10", type: MLib.InputType.Number})]
					}),
					new FormElement({
						label: "Label 4",
						fields: [new Input({value: "1", type: MLib.InputType.Number}),
										 new Input({value: "2", type: MLib.InputType.Number}),
						         new Input({value: "3", type: MLib.InputType.Number}),
						         new Input({value: "4", type: MLib.InputType.Number}),
						         new Input({value: "5", type: MLib.InputType.Number}),
						         new Input({value: "6", type: MLib.InputType.Number}),
						         new Input({value: "7", type: MLib.InputType.Number}),
						         new Input({value: "8", type: MLib.InputType.Number}),
						         new Input({value: "9", type: MLib.InputType.Number}),
						         new Input({value: "10", type: MLib.InputType.Number}),
						         new Input({value: "11", type: MLib.InputType.Number}),
						         new Input({value: "12", type: MLib.InputType.Number}),
										 new Input({value: "13", type: MLib.InputType.Number}),
										 new Input({value: "14", type: MLib.InputType.Number}),
										 new Input({value: "15", type: MLib.InputType.Number})]
					})
				]
			})
		]
	});
	oForm2.placeAt("content2");

	var oLayout3 = new ColumnLayout("L3");
	var oForm3 = new Form("F3",{
		title: "Three Containers",
		editable: true,
		layout: oLayout3,
		formContainers: [
			new FormContainer("C4",{
				title: "Container 1",
				formElements: [
					new FormElement({
						label: "Label 1",
						fields: [new Input({required: true})]
					}),
					new FormElement({
						label: "Label 2",
						fields: [new Input()]
					}),
					new FormElement({
						label: "Label 3",
						fields: [new Input()]
					}),
					new FormElement({
						label: "Label 4",
						fields: [new Input()]
					}),
					new FormElement({
						label: "Text Area",
						fields: [new TextArea({required: true})]
					}),
					new FormElement({
						label: "Image",
						fields: [new Image({src: "../../commons/images/SAPLogo.gif", width: "73px", densityAware: false})]
					})
				]
			}),
			new FormContainer("C5",{
				toolbar: new Toolbar("C5-TB", {
					content: [new mTitle("C5-Title", {text: "Container 2", level: CoreLib.TitleLevel.H5, titleStyle: CoreLib.TitleLevel.H5, tooltip: "Title tooltip"}),
					          new ToolbarSpacer(),
					          new ToggleButton({icon: "sap-icon://sap-ui5", tooltip: "SAPUI5"})
					          ]
				}),
				formElements: [
					new FormElement({
						label: "Label 1",
						fields: [new Input({required: true})]
					}),
					new FormElement({
						label: "Label 2",
						fields: [new Input()]
					}),
					new FormElement({
						label: "Label 3",
						fields: [new Input()]
					}),
					new FormElement({
						label: "Label 4",
						fields: [new Input()]
					}),
					new FormElement({
						label: "Label 5",
						fields: [new Select("Sel_C5",{selectedKey: "DE",
							items: [new ListItem({key: "GB", text: "England"}),
											new ListItem({key: "US", text: "USA"}),
											new ListItem({key: "DE", text: "Germany"})]
						})]
					})
				]
			}),
			new FormContainer("C6",{
				title: "Container 3",
				tooltip: "This container is expandable",
				expandable: true,
				formElements: [
					new FormElement({
						fields: [new CheckBox({text: 'Kindergarden'}),
								new CheckBox({text: 'primary school'})]
					}),
					new FormElement({
						fields: [new CheckBox({text: 'high school'})]
					}),
					new FormElement({
						fields: [new CheckBox({text: 'college'})]
					}),
					new FormElement({
						fields: [new CheckBox({text: 'university'})]
					})
				]
			})
		]
	});
	oForm3.placeAt("content3");

	var oLayout4 = new ColumnLayout("L4");
	var oForm4 = new Form("F4",{
		title: "Four Containers",
		editable: false,
		layout: oLayout4,
		formContainers: [
			new FormContainer("C7",{
				title: "Container 1",
				formElements: [
					new FormElement({
						label: "Label 1",
						fields: [new Text({text: "Text 1"})]
					}),
					new FormElement({
						label: "Label 2",
						fields: [new Text({text: "Text 2"})]
					}),
					new FormElement({
						label: "Label 3",
						fields: [new Text({text: "Text 3"})]
					}),
					new FormElement({
						label: "Label 4",
						fields: [new Text({text: "Text 4"})]
					})
				]
			}),
			new FormContainer("C8",{
				title: "Container 2",
				formElements: [
					new FormElement({
						label: "Label 1",
						fields: [new Text({text: "Text 1"})]
					}),
					new FormElement({
						label: "Label 2",
						fields: [new Text({text: "Text 2"})]
					}),
					new FormElement({
						label: "Label 3",
						fields: [new Text({text: "Text 3"})]
					}),
					new FormElement({
						label: "Label 4",
						fields: [new Text({text: "Text 4"})]
					})
				]
			}),
			new FormContainer("C9",{
				toolbar: new Toolbar("C9-TB", {
					content: [new mTitle("C9-Title", {text: "Container 3", level: CoreLib.TitleLevel.H5, titleStyle: CoreLib.TitleLevel.H5, tooltip: "Title tooltip"}),
					          new ToolbarSpacer(),
					          new ToggleButton({icon: "sap-icon://sap-ui5", tooltip: "SAPUI5"})
					          ]
				}),
				formElements: [
					new FormElement({
						label: "Label 1",
						fields: [new Text({text: "Text 1"})]
					}),
					new FormElement({
						label: "Label 2",
						fields: [new Text({text: "Text 2"})]
					}),
					new FormElement({
						label: "Label 3",
						fields: [new Text({text: "Text 3"})]
					}),
					new FormElement({
						label: "Label 4",
						fields: [new Text({text: "Text 4"})]
					})
				]
			}),
			new FormContainer("C10",{
				title: "Container 4",
				formElements: [
					new FormElement({
						label: "Label 1",
						fields: [new Text({text: "Text 1"})]
					}),
					new FormElement({
						label: "Label 2",
						fields: [new Text({text: "Text 2"})]
					}),
					new FormElement({
						label: "Label 3",
						fields: [new Text({text: "Text 3"})]
					}),
					new FormElement({
						label: "Label 4",
						fields: [new Text({text: "Text 4"})]
					})
				]
			})
		]
	});
	oForm4.placeAt("content4");

	var oLayout5 = new ColumnLayout("L5");
	var oForm5 = new Form("F5",{
		title: "Five Containers",
		editable: true,
		layout: oLayout5,
		formContainers: [
			new FormContainer("C11",{
				title: "Container 1",
				formElements: [
					new FormElement({
						label: "Label 1",
						fields: [new Input({value: "Container 1", required: true})]
					}),
					new FormElement({
						label: "Label 2",
						fields: [new Input({value: "Container 1"})]
					}),
					new FormElement({
						label: "Label 3",
						fields: [new Input({value: "Container 1"})]
					}),
					new FormElement({
						label: "Label 4",
						fields: [new Input({value: "Container 1"})]
					})
				]
			}),
			new FormContainer("C12",{
				title: "Container 2",
				formElements: [
					new FormElement({
						label: "Label 1",
						fields: [new Input({value: "Container 2", valueState: "Warning", required: true})]
					}),
					new FormElement({
						label: "Label 2",
						fields: [new Input({value: "Container 2", valueState: "Warning"})]
					}),
					new FormElement({
						label: "Label 3",
						fields: [new Input({value: "Container 2", valueState: "Warning"})]
					}),
					new FormElement({
						label: "Label 4",
						fields: [new Input({value: "Container 2", valueState: "Warning"})]
					})
				]
			}),
			new FormContainer("C13",{
				title: "Container 3",
				formElements: [
					new FormElement({
						label: "Label 1",
						fields: [new Input({value: "Container 3", valueState: "Error", required: true})]
					}),
					new FormElement({
						label: "Label 2",
						fields: [new Input({value: "Container 3", valueState: "Error"})]
					}),
					new FormElement({
						label: "Label 3",
						fields: [new Input({value: "Container 3", valueState: "Error"})]
					}),
					new FormElement({
						label: "Label 4",
						fields: [new Input({value: "Container 3", valueState: "Error"})]
					})
				]
			}),
			new FormContainer("C14",{
				title: "Container 4",
				formElements: [
					new FormElement({
						label: new Label("C14-L1", {text:"Label 1"}),
						fields: [new Input("C14-I1", {value: "Container 4", valueState: "Success", required: true})]
					}),
					new FormElement({
						label: new Label("C14-L2", {text:"Label 2"}),
						fields: [new Input("C14-I2", {value: "Container 4", valueState: "Success"})]
					}),
					new FormElement({
						label: new Label("C14-L3", {text:"Label 3"}),
						fields: [new Input("C14-I3", {value: "Container 4", valueState: "Success"})]
					}),
					new FormElement({
						label: new Label("C14-L4", {text:"Label 4"}),
						fields: [new Input("C14-I4", {value: "Container 4", valueState: "Success"})]
					})
				]
			}),
			new FormContainer("C15",{
				formElements: [
					new FormElement({
						fields: [new ToggleButton({text: 'Field LayoutData',
															press: toggleLayoutData,
															layoutData: new ColumnElementData({cellsSmall: 4, cellsLarge: 4})}),
										 new Button("B1", {text: 'Change LayoutData',
															press: changeLayoutData,
															enabled: false,
															layoutData: new ColumnElementData({cellsSmall: 4, cellsLarge: 4})}),
										 new ToggleButton({text: "special columns",
															press: specialColumns,
															layoutData: new ColumnElementData({cellsSmall: 4, cellsLarge: 4})}),
										 new ToggleButton({text: "move Container",
															press: moveContainer,
															layoutData: new ColumnElementData({cellsSmall: 4, cellsLarge: 4})}),
										 new ToggleButton({text: "visibility Container",
															press: visibilityContainer,
															layoutData: new ColumnElementData({cellsSmall: 4, cellsLarge: 4})}),
										 new ToggleButton({text: "new Container",
															press: newContainer,
															layoutData: new ColumnElementData({cellsSmall: 4, cellsLarge: 4})}),
										 new ToggleButton({text: "Label size",
															press: toggleLabelSize,
															layoutData: new ColumnElementData({cellsSmall: 4, cellsLarge: 4})}),
										 new ToggleButton({text: "emty cells",
															press: toggleEmptyCells,
															layoutData: new ColumnElementData({cellsSmall: 4, cellsLarge: 4})}),
										 new ToggleButton({text: "Default container size",
															pressed: true,
															press: toggleContainerData,
															layoutData: new ColumnElementData({cellsSmall: 4, cellsLarge: 4})})]
					}),
					new FormElement({
						fields: [new Button({text: 'OK', type: MLib.ButtonType.Accept}),
										 new Button({text: 'Cancel', type: MLib.ButtonType.Reject})]
					})
				]
			})
		]
	});
	oForm5.placeAt("content5");

	var oTitle = new Title("TitleX",{text: "new Container", level: CoreLib.TitleLevel.H2});
	var oNewContainer = new FormContainer("CX",{
			title: oTitle,
			formElements: [
					new FormElement({
						label: new Label({text:"Label1"}),
						fields: [new Input({value: "Text1", required: true}),
						         new Input({value: "Text2"}),
						         new Input({value: "Text3"})]
					})
			]
	});

	var oLayout6 = new ColumnLayout("L6", {columnsM: 2});
	var oForm6 = new Form("F6",{
		toolbar: new Toolbar("F6-TB", {
			content: [
				new mTitle("F6-Title", {text: "column test", level: CoreLib.TitleLevel.H5, titleStyle: CoreLib.TitleLevel.H5, tooltip: "Title tooltip"}),
				new ToolbarSpacer(),
				new SegmentedButton({
					width: "auto",
					selectedKey: "C2",
					items: [
						new SegmentedButtonItem({key: "C1", text: "1 1 1 1"}),
						new SegmentedButtonItem({key: "C2", text: "1 2 2 2"}),
						new SegmentedButtonItem({key: "C3", text: "1 2 3 3"}),
						new SegmentedButtonItem({key: "C4", text: "1 2 3 4"})
					],
					selectionChange: function(oEvent) {
						var oItem = oEvent.getParameter("item");
						switch (oItem.getKey()) {
						case "C1":
							oLayout6.setColumnsM(1).setColumnsL(1).setColumnsXL(1);
							break;
						case "C2":
							oLayout6.setColumnsM(2).setColumnsL(2).setColumnsXL(2);
							break;
						case "C3":
							oLayout6.setColumnsM(2).setColumnsL(3).setColumnsXL(3);
							break;
						case "C4":
							oLayout6.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
							break;
						default:
							break;
						}
					}
				}),
				new Button({text: "add field",
					press: function(oEvent) {
						var oFormContainer = sap.ui.getCore().byId("C16");
						var iElements = oFormContainer.getFormElements().length +  1;
						var oFormElement = new FormElement({
							label: "Label" + iElements,
							fields: [new Input({value: iElements})]
						});
						oFormContainer.addFormElement(oFormElement);
					}})
			]
		}),
		ariaLabelledBy: "F6-Title",
		editable: true,
		layout: oLayout6,
		formContainers: [
			new FormContainer("C16",{
				formElements: [
					new FormElement({
						label: "Label 1",
						fields: [new Input({value: "1"})]
						})
					]
			})
		]
	});
	oForm6.placeAt("content6");

});