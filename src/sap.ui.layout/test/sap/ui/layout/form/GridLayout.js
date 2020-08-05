sap.ui.require([
	"sap/ui/core/library",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/GridLayout",
	"sap/ui/layout/form/GridElementData",
	"sap/ui/layout/form/GridContainerData",
	"sap/ui/core/Title",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Input",
	"sap/m/Select",
	"sap/ui/core/ListItem",
	"sap/m/DatePicker",
	"sap/m/RadioButton",
	"sap/m/RadioButtonGroup",
	"sap/m/TextArea",
	"sap/m/Link",
	"sap/m/Button",
	"sap/m/Image",
	"sap/m/CheckBox",
	"sap/m/MessageBox"
	],
	function(
		CoreLib,
		Form,
		FormContainer,
		FormElement,
		GridLayout,
		GridElementData,
		GridContainerData,
		Title,
		Label,
		Text,
		Input,
		Select,
		ListItem,
		DatePicker,
		RadioButton,
		RadioButtonGroup,
		TextArea,
		Link,
		Button,
		Image,
		CheckBox,
		MessageBox
		) {
	"use strict";

	var changeLayoutData = function(oEvent){
		var oControl = sap.ui.getCore().byId("Sel_C5");
		var oLayoutData = oControl.getLayoutData();
		if (!oLayoutData){
			oLayoutData = new GridElementData({hCells: "3"});
			oControl.setLayoutData(oLayoutData);
		} else {
			if (oLayoutData.getHCells() == "3"){
				oLayoutData.setHCells("4");
			} else {
				oLayoutData.setHCells("3");
			}
		}
	};

	var deleteLayoutData = function(oEvent){
		var oControl = sap.ui.getCore().byId("Sel_C5");
		var oLayoutData = oControl.getLayoutData();
		if (oLayoutData){
			oControl.setLayoutData(null);
		}
	};

	var oLayout1 = new GridLayout("L1");
	var oLayout2 = new GridLayout("L2");
	var oLayout3 = new GridLayout("L3");
	var oLayout4 = new GridLayout("L4");

	var oForm1 = new Form("F1",{
		title: new Title({text: "Form Title", icon: "../../commons/images/help.gif", tooltip: "Title tooltip", emphasized: true}),
		editable: true,
		layout: oLayout1,
		formContainers: [
			new FormContainer("C1",{
				title: "contact data",
				formElements: [
					new FormElement({
						label: new Label({text:"ID"}),
						fields: [new Input({value: "SAP SE", required: true})]
					}),
					new FormElement({
						label: "Street / Number",
						fields: [new Input({value: "Dietmar-Hopp-Allee", layoutData: new GridElementData({hCells: "12"})}),
										 new Input({value: "16", layoutData: new GridElementData({hCells: "1"})})]
					}),
					new FormElement({
						label: new Label({text: "Post code / City"}),
						fields: [new Input({value: "69190", layoutData: new GridElementData({hCells: "2"})}),
										 new Input({value: "Walldorf", layoutData: new GridElementData({hCells: "11"})})]
					}),
					new FormElement({
						label: "Country",
						fields: [new Input({value: "DE", layoutData: new GridElementData({hCells: "1"})}),
										 new Input({value: "Germany", layoutData: new GridElementData({hCells: "12"})})]
					}),
					new FormElement({
						label: "Date of birth",
						fields: [new DatePicker({dateValue: new Date(2012, 11, 12), layoutData: new GridElementData({hCells: "2"})})]
					}),
					new FormElement({
						label: "Gender",
						fields: [new RadioButtonGroup({
							buttons: [new RadioButton({text: "male"}),
							          new RadioButton({text: "female"})]
						})]
					})
				]
			}),
			new FormContainer("C2",{
				title: "Text Area",
				formElements: [
					new FormElement({
						label: "Text Area",
						fields: [new TextArea({layoutData: new GridElementData({hCells: "full"})})]
					})
				]
			}),
			new FormContainer("C3",{
				title: new Title({text: "Two Column", level: CoreLib.TitleLevel.H5}),
				formElements: [
					new FormElement({
						label: new Label({text:"Required"}),
						fields: [new Input({required: true})]
					}),
					new FormElement({
						label: "Colspan 4 / 1",
						fields: [new Text({text: "4 cells", layoutData: new GridElementData({hCells: "4"})}),
										 new Text({text: "1 cell", layoutData: new GridElementData({hCells: "1"})})]
					}),
					new FormElement({
						label: new Label({text: "Colspan 2 / 3"}),
						fields: [new Text({text: "2 cells", layoutData: new GridElementData({hCells: "2"})}),
										 new Text({text: "3 cells", layoutData: new GridElementData({hCells: "3"})})]
					}),
					new FormElement({
						label: "Colspan 1 / 4",
						fields: [new Link({text: "1 cell", layoutData: new GridElementData({hCells: "1"})}),
										 new Input({layoutData: new GridElementData({hCells: "4"})})]
					})
				],
			layoutData: new GridContainerData({halfGrid: true})
			}),
			new FormContainer("C4",{
				title: new Title({text: "Form Layout", level: CoreLib.TitleLevel.H5}),
				formElements: [
					new FormElement({
						label: new Label({text:"ID"}),
						fields: [new Input({required: true})]
					}),
					new FormElement({
						label: "Street / Number",
						fields: [new Input({layoutData: new GridElementData({hCells: "4"})}),
										 new Input({layoutData: new GridElementData({hCells: "1"})})]
					}),
					new FormElement({
						label: new Label({text: "Post code / City"}),
						fields: [new Input({showValueHelp: true, valueHelpRequest: function(oEvent) { MessageBox.alert("Value help requested"); }, layoutData: new GridElementData({hCells: "2"})}),
										 new Input({layoutData: new GridElementData({hCells: "3"})})]
					}),
					new FormElement({
						label: "Country",
						fields: [new Input({layoutData: new GridElementData({hCells: "1"})}),
										 new Input({layoutData: new GridElementData({hCells: "4"})})]
					}),
					new FormElement({
						label: "Text Area",
						fields: [new TextArea({required: true, layoutData: new GridElementData({hCells: "full"})})]
					}),
					new FormElement({
						label: "Image",
						fields: [new Image({src: "../../commons/images/SAPLogo.gif", densityAware: false, layoutData: new GridElementData({hCells: "2"})})]
					})
				],
			layoutData: new GridContainerData({halfGrid: true})
			}),
			new FormContainer("C5",{
				title: new Title({text: "Address", icon: "../../commons/images/mail.gif", tooltip: "Title tooltip", level: CoreLib.TitleLevel.H5}),
				formElements: [
					new FormElement({
						label: new Label({text:"Street"}),
						fields: [new Input(),
										 new Input({enabled: false})]
					}),
					new FormElement({
						label: "City",
						fields: [new Input(),
										 new Input({editable: false, layoutData: new GridElementData({hCells: "2"})}),
										 new Input({layoutData: new GridElementData({hCells: "2"})})]
					}),
					new FormElement({
						label: new Label({text: "Post code"}),
						fields: [new Input()]
					}),
					new FormElement({
						label: "Country",
						fields: [new Select("Sel_C5",{
							items: [new ListItem({text: "Germany"}),
											new ListItem({text: "USA"}),
											new ListItem({text: "England"})]
						})]
					})
				],
			layoutData: new GridContainerData({halfGrid: true})
			}),
			new FormContainer("C6",{
				title: new Title({text: "Education", icon: "sap-icon://education", level: CoreLib.TitleLevel.H5}),
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
				],
				layoutData: new GridContainerData({halfGrid: true})
			}),
			new FormContainer("C7",{
				formElements: [
					new FormElement({
						fields: [new Button({text: 'Change LayoutData',
															press: changeLayoutData,
															layoutData: new GridElementData({hCells: "3"})}),
										 new Button({text: 'Reset LayoutData',
															press: deleteLayoutData,
															layoutData: new GridElementData({hCells: "3"})}),
										 new Button({text: 'OK',
															layoutData: new GridElementData({hCells: "1"})}),
										 new Button({text: 'Cancel',
															layoutData: new GridElementData({hCells: "1"})})]
					})
				],
				layoutData: new GridContainerData({halfGrid: false})
			}),
			new FormContainer("C8",{
				title: new Title({text: "Test for vCells"}),
				formElements: [
								new FormElement({
									label: new Label("Label1", {text:"Label1"}),
									fields: [new TextArea({height: "9rem", layoutData: new GridElementData({vCells: 3})}),
													 new TextArea({height: "6rem", layoutData: new GridElementData({vCells: 2})}),
													 new TextArea({height: "3rem", layoutData: new GridElementData({vCells: 1})})
														]
								}),
								new FormElement({
									fields: [new TextArea({height: "3rem", ariaLabelledBy: "Label1", layoutData: new GridElementData({vCells: 1})}),
													 new TextArea({height: "6rem", ariaLabelledBy: "Label1", layoutData: new GridElementData({vCells: 2})})
														]
								}),
								new FormElement({
									label: new Label({text:"Label3"}),
									fields: [new TextArea({height: "3rem", layoutData: new GridElementData({vCells: 1})})
														]
								})
				],
				layoutData: new GridContainerData({halfGrid: true})
			})
		]
	});
	oForm1.placeAt("content");

	var oForm2 = new Form("F2",{
		title: new Title({text: "Form: One Column (Fixed Width)"}),
		editable: true,
		layout: oLayout2,
		formContainers: [
			new FormContainer("C9",{
				formElements: [
					new FormElement({
						label: new Label({text:"ID"}),
						fields: [new Input({required: true})]
					}),
					new FormElement({
						label: "Street / Number",
						fields: [new Input(),
										 new Input()]
					}),
					new FormElement({
						label: new Label({text: "Post code / City"}),
						fields: [new Input(),
										 new Input()]
					}),
					new FormElement({
						label: "Country",
						fields: [new Input(),
										 new Input(),
										 new Input()]
					})
				]
			})
		]
	});
	oForm2.placeAt("content");

	var oForm3 = new Form("F3",{
		title: new Title({text: "Form: One Column A (Responsive)"}),
		editable: true,
		layout: oLayout3,
		formContainers: [
			new FormContainer("C10",{
				formElements: [
					new FormElement({
						label: new Label({text:"ID"}),
						fields: [new Input({required: true})]
					}),
					new FormElement({
						label: "Street / Number",
						fields: [new Input({layoutData: new GridElementData({hCells: "4"})}),
										 new Input({layoutData: new GridElementData({hCells: "1"})})]
					}),
					new FormElement({
						label: new Label({text: "Post code / City"}),
						fields: [new Input({layoutData: new GridElementData({hCells: "2"})}),
										 new Input({layoutData: new GridElementData({hCells: "3"})})]
					}),
					new FormElement({
						label: "Country",
						fields: [new Input({layoutData: new GridElementData({hCells: "1"})}),
										 new Input({layoutData: new GridElementData({hCells: "4"})})]
					})
				]
			})
		]
	});
	oForm3.placeAt("content2");

	var oForm4 = new Form("F4",{
		title: new Title({text: "Form: One Column B (Responsive)"}),
		editable: true,
		layout: oLayout4,
		formContainers: [
			new FormContainer("C11",{
				formElements: [
					new FormElement({
						label: new Label({text:"ID"}),
						fields: [new Input({required: true})]
					}),
					new FormElement({
						label: "Street / Number",
						fields: [new Input({layoutData: new GridElementData({hCells: "4"})}),
										 new Input({layoutData: new GridElementData({hCells: "1"})})]
					}),
					new FormElement({
						label: new Label({text: "Post code / City"}),
						fields: [new Input({layoutData: new GridElementData({hCells: "2"})}),
										 new Input({layoutData: new GridElementData({hCells: "3"})})]
					}),
					new FormElement({
						label: "Country",
						fields: [new Input({layoutData: new GridElementData({hCells: "1"})}),
										 new Input({layoutData: new GridElementData({hCells: "4"})})]
					})
				]
			})
		]
	});
	oForm4.placeAt("content3");

});