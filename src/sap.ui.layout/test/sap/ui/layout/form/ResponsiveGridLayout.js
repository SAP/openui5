sap.ui.require([
	"sap/ui/core/library",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/SemanticFormElement",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/layout/GridData",
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
	"sap/m/ToggleButton",
	"sap/m/Button",
	"sap/m/Image",
	"sap/m/CheckBox"
	],
	function(
		CoreLib,
		Form,
		FormContainer,
		FormElement,
		SemanticFormElement,
		ResponsiveGridLayout,
		GridData,
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
		ToggleButton,
		Button,
		Image,
		CheckBox
		) {
	"use strict";

	// TODO: Fake iSematicFormContent on controls until it is official supported
	var myTypeCheck = function(vTypeName) {
		if (vTypeName === "sap.ui.core.ISemanticFormContent") {
			return true;
		} else {
			return this.getMetadata().isA(vTypeName);
		}
	};
	Input.prototype.isA = myTypeCheck;

	var changeLayoutData = function(oEvent){
		var oControl = sap.ui.getCore().byId("Sel_C5");
		var oLayoutData = oControl.getLayoutData();
		if (!oLayoutData){
			oLayoutData = new GridData({span: "L3 M3 S3"});
			oControl.setLayoutData(oLayoutData);
		} else {
			if (oLayoutData.getSpan() == "L3 M3 S3"){
				oLayoutData.setSpan("L4 M4 S4");
			} else {
				oLayoutData.setSpan("L3 M3 S3");
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

	var moveContainer = function(oEvent){

		var oForm = sap.ui.getCore().byId("F1");
		var oContainer = sap.ui.getCore().byId("C2");
		oForm.removeFormContainer(oContainer);
		if (oEvent.getParameter("pressed")){
			oForm.insertFormContainer(oContainer, 0);
		} else {
			oForm.insertFormContainer(oContainer, 1);
		}

	};

	var newContainer = function(oEvent){

		var oForm = sap.ui.getCore().byId("F1");
		if (oEvent.getParameter("pressed")){
			oForm.addFormContainer(oNewContainer);
		} else {
			oForm.removeFormContainer(oNewContainer);
		}

	};

	var visibilityContainer = function(oEvent){

		var oContainer = sap.ui.getCore().byId("C6");
		if (oEvent.getParameter("pressed")){
			oContainer.setVisible(false);
		} else {
			oContainer.setVisible(true);
		}

	};

	var toggleAdjustLabelSpan = function(oEvent){

		var oLayout = sap.ui.getCore().byId("L1");
		if (oEvent.getParameter("pressed")){
			oLayout.setAdjustLabelSpan(true);
		} else {
			oLayout.setAdjustLabelSpan(false);
		}

	};

	var oLayout1 = new ResponsiveGridLayout("L1");

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
					new SemanticFormElement({
						label: "Street / Number",
						fields: [new Input({value: "Dietmar-Hopp-Allee", layoutData: new GridData({span: "L6 M6 S11"})}),
										 new Input({value: "16", layoutData: new GridData({span: "L1 M1 S1"})})]
					}),
					new SemanticFormElement({
						label: new Label({text: "Post code / City"}),
						fields: [new Input({value: "69190", layoutData: new GridData({span: "L2 M2 S2"})}),
										 new Input({value: "Walldorf", layoutData: new GridData({span: "L5 M5 S11"})})]
					}),
					new FormElement({
						label: "Country",
						fields: [new Input({value: "DE", layoutData: new GridData({span: "L1 M1 S1"})}),
										 new Input({value: "Germany"})]
					}),
					new FormElement({
						label: "Date of birth",
						fields: [new DatePicker({dateValue: new Date(2012, 11, 12), layoutData: new GridData({span: "L3 M3 S3"})})]
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
						label: new Label({text: "Text Area", layoutData: new GridData({span: "L12 M12 S12"})}),
						fields: [new TextArea({layoutData: new GridData({span: "L12 M12 S12"})})]
					})
				]
			}),
			new FormContainer("C3",{
				title: new Title({text: "Full width", level: CoreLib.TitleLevel.H5}),
				formElements: [
					new FormElement({
						label: new Label({text:"Required"}),
						fields: [new Input({required: true})]
					}),
					new FormElement({
						label: "Colspan 9 / 1",
						fields: [new Text({text: "9 cells", layoutData: new GridData({span: "L9 M9 S9"})}),
										 new Text({text: "1 cell", layoutData: new GridData({span: "L1 M1 S1"})})]
					}),
					new FormElement({
						label: new Label({text: "Colspan 2 / 8"}),
						fields: [new Text({text: "2 cells", layoutData: new GridData({span: "L2 M2 S2"})}),
										 new Text({text: "8 cells", layoutData: new GridData({span: "L8 M8 S8"})})]
					}),
					new FormElement({
						label: "Colspan 1 / 9",
						fields: [new Link({text: "1 cell", layoutData: new GridData({span: "L1 M1 S1"})}),
										 new Input()]
					})
				],
			layoutData: new GridData({linebreak: true, span: "L12 M12 S12"})
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
										 new Input()]
					}),
					new FormElement({
						label: "Text Area",
						fields: [new TextArea({required: true})]
					}),
					new FormElement({
						label: "Image",
						fields: [new Image({src: "../../commons/images/SAPLogo.gif", width: "73px", densityAware: false})]
					})
				],
			layoutData: new GridData({linebreak: true, span: "L12 M12 S12"})
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
										 new Input({editable: false}),
										 new Input()]
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
				]
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
				]
			}),
			new FormContainer("C7",{
				formElements: [
					new FormElement({
						fields: [new Button({text: 'Change LayoutData',
															press: changeLayoutData,
															layoutData: new GridData({span: "L3 M3 S3"})}),
										 new Button({text: 'Reset LayoutData',
															press: deleteLayoutData,
															layoutData: new GridData({span: "L3 M3 S3"})}),
										 new ToggleButton({text: "move Container",
															press: moveContainer,
															layoutData: new GridData({span: "L3 M3 S3"})}),
										 new ToggleButton({text: "new Container",
															press: newContainer,
															layoutData: new GridData({span: "L3 M3 S3"})}),
										 new ToggleButton({text: "visibility Container",
															press: visibilityContainer,
															layoutData: new GridData({linebreak: true, span: "L3 M3 S3"})}),
										 new ToggleButton({text: "adjust Label Span",
															pressed: true,
															press: toggleAdjustLabelSpan,
															layoutData: new GridData({span: "L3 M3 S3"})}),
										 new Button({text: 'OK',
															layoutData: new GridData({span: "L1 M1 S1"})}),
										 new Button({text: 'Cancel',
															layoutData: new GridData({span: "L2 M2 S2"})})]
					})
				]
			})
		]
	});
	oForm1.placeAt("content");

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

});