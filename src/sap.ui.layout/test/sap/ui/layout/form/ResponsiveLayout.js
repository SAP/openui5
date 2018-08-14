sap.ui.require([
	"sap/ui/core/library",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/ResponsiveLayout",
	"sap/ui/layout/ResponsiveFlowLayoutData",
	"sap/ui/core/Title",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Input",
	"sap/m/DatePicker",
	"sap/m/RadioButton",
	"sap/m/RadioButtonGroup",
	"sap/m/TextArea",
	"sap/m/Link",
	"sap/m/ToggleButton",
	"sap/m/Button"
	],
	function(
		CoreLib,
		Form,
		FormContainer,
		FormElement,
		ResponsiveLayout,
		ResponsiveFlowLayoutData,
		Title,
		Label,
		Text,
		Input,
		DatePicker,
		RadioButton,
		RadioButtonGroup,
		TextArea,
		Link,
		ToggleButton,
		Button
		) {
	"use strict";

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

	var newElement = function(oEvent){

		if (oEvent.getParameter("pressed")){
			oNewContainer.addFormElement(oNewElement);
		} else {
			oNewContainer.removeFormElement(oNewElement);
		}

	};

	var newField = function(oEvent){

		if (oEvent.getParameter("pressed")){
			oNewElement.addField(oNewField);
		} else {
			oNewElement.removeField(oNewField);
		}

	};

	var toggleExpandable = function(oEvent){

		var oContainer = sap.ui.getCore().byId("CX");
		oContainer.setExpandable(oEvent.getParameter("pressed"));

	};

	var toggleTitle = function(oEvent){

		var oContainer = sap.ui.getCore().byId("CX");
		if (oEvent.getParameter("pressed")){
			oContainer.setTitle(sap.ui.getCore().byId("TitleX"));
		} else {
			oContainer.setTitle();
		}

	};

	var lineBreakContainer = function(oEvent){

		var oContainer = sap.ui.getCore().byId("CX");
		var oLayoutData = oContainer.getLayoutData();
		oLayoutData.setLinebreak(oEvent.getParameter("pressed"));

	};

	var lineBreakElement = function(oEvent){

		var oElement = sap.ui.getCore().byId("EX");
		var oLayoutData = oElement.getLayoutData();
		if (!oLayoutData){
			oLayoutData = new ResponsiveFlowLayoutData({linebreak: oEvent.getParameter("pressed"), margin: false});
			oElement.setLayoutData(oLayoutData);
		} else {
			oLayoutData.setLinebreak(oEvent.getParameter("pressed"));
		}

	};

	var lineBreakField = function(oEvent){

		var oField = sap.ui.getCore().byId("TX");
		var oLayoutData = oField.getLayoutData();
		if (!oLayoutData){
			oLayoutData = new ResponsiveFlowLayoutData({linebreak: oEvent.getParameter("pressed")});
			oField.setLayoutData(oLayoutData);
		} else {
			oLayoutData.setLinebreak(oEvent.getParameter("pressed"));
		}

	};

	var iState = 0;
	var switchVisible = function(oEvent){
		if ( iState == 0 ){
			sap.ui.getCore().byId("C4E4").setVisible(false);
			iState++;
		} else if ( iState == 1 ){
			sap.ui.getCore().byId("C4E1").setVisible(false);
			sap.ui.getCore().byId("C4E4").setVisible(true);
			iState++;
		} else {
			sap.ui.getCore().byId("C4E1").setVisible(true);
			iState = 0;
		}
	};

	var oLayout1 = new ResponsiveLayout("L1");

	var oForm1 = new Form("F1",{
		title: new Title({text: "Form Title", icon: "../../commons/images/help.gif", tooltip: "Title tooltip", emphasized: true}),
		editable: true,
		layout: oLayout1,
		formContainers: [
			new FormContainer("C1",{
				title: "contact data",
				tooltip: "Test",
				formElements: [
					new FormElement({
						label: new Label({text:"ID"}),
						fields: [new Input({value: "SAP SE", required: true})]
					}),
					new FormElement({
						label: "Street / Number",
						fields: [new Input({value: "Dietmar-Hopp-Allee"}),
										 new Input({value: "16", width: "4em"})]
					}),
					new FormElement({
						label: new Label({text: "Post code / City"}),
						fields: [new Input({value: "69190", width: "5em"}),
										 new Input({value: "Walldorf"})]
					}),
					new FormElement({
						label: "Country",
						fields: [new Input({value: "DE", width: "3em"}),
										 new Input({value: "Germany"})]
					}),
					new FormElement({
						label: "Date of birth",
						fields: [new DatePicker({dateValue: new Date(2012, 11, 12)})]
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
				title: new Title({text: "Address", icon: "../../commons/images/mail.gif", tooltip: "Title tooltip", level: CoreLib.TitleLevel.H4, emphasized: true}),
				expandable: true,
				formElements: [
					new FormElement({
						label: new Label({text:"Label1"}),
						fields: [new Input({value: "Text1", required: true}),
						         new Input({value: "Text2"}),
						         new Input({value: "Text3"})]
					}),
					new FormElement({
						label: "Label2",
						fields: [new Input({value: "1"}),
										 new Input({value: "2"})]
					}),
					new FormElement({
						fields: [new Input({value: "A"}),
										 new Input({value: "B"})]
					})
				]
			}),
			new FormContainer("C3",{
				formElements: [
					new FormElement({
						fields: [new TextArea({value: "Text", width: "100%",
										layoutData: new ResponsiveFlowLayoutData({minWidth: 300})})]
					})
				]
			}),
			new FormContainer("C4",{
				title: new Title({text: "contact data using LayoutData", icon: "sap-icon://email"}),
				tooltip: "Test",
				expandable: true,
				formElements: [
					new FormElement("C4E1",{
						label: new Label({text:"ID"}),
						fields: [new Input({value: "SAP SE", required: true, layoutData: new ResponsiveFlowLayoutData({weight: 3})})],
						layoutData: new ResponsiveFlowLayoutData({linebreak: true, margin: false})
					}),
					new FormElement("C4E2",{
						label: "Street / Number",
						fields: [new Input({value: "Dietmar-Hopp-Allee", layoutData: new ResponsiveFlowLayoutData({weight: 2})}),
										 new Input({value: "16", width: "4em", layoutData: new ResponsiveFlowLayoutData({weight: 1})})],
						layoutData: new ResponsiveFlowLayoutData({linebreak: true, margin: false})
					}),
					new FormElement("C4E3",{
						label: new Label({text: "Post code / City"}),
						fields: [new Input({value: "69190", width: "5em", layoutData: new ResponsiveFlowLayoutData({weight: 1})}),
										 new Input({value: "Walldorf", layoutData: new ResponsiveFlowLayoutData({weight: 2})})],
						layoutData: new ResponsiveFlowLayoutData({linebreak: true, margin: false})
					}),
					new FormElement("C4E4",{
						label: "Country",
						fields: [new Input({value: "DE", width: "3em", layoutData: new ResponsiveFlowLayoutData({weight: 1})}),
										 new Input({value: "Germany", layoutData: new ResponsiveFlowLayoutData({weight: 2})})],
						layoutData: new ResponsiveFlowLayoutData({linebreak: true, margin: false})
					}),
					new FormElement("C4E5",{
						label: "Date of birth",
						fields: [new DatePicker({dateValue: new Date(2012, 11, 12)})],
						layoutData: new ResponsiveFlowLayoutData({linebreak: true, margin: false})
					}),
					new FormElement("C4E6",{
						label: "Gender",
						fields: [new RadioButtonGroup({
							buttons: [new RadioButton({text: "male"}),
							          new RadioButton({text: "female"})]
						})]
					}),
					new FormElement("C4E7",{
						fields: [new Button({text: "Visibility", press: switchVisible})],
						layoutData: new ResponsiveFlowLayoutData({linebreak: true, margin: false, weight: 2})
					})
				],
			layoutData: new ResponsiveFlowLayoutData({linebreak: true, minWidth: 400, margin: false})
			}),
			new FormContainer("C5",{
				formElements: [
					new FormElement({
						fields: [
							new ToggleButton("B1",{text: "move Container", press: moveContainer}),
							new ToggleButton("B2",{text: "new Container", press: newContainer}),
							new ToggleButton("B3",{text: "new Element", press: newElement}),
							new ToggleButton("B4",{text: "new Field", press: newField}),
							new ToggleButton("B5",{text: "expandable", press: toggleExpandable}),
							new ToggleButton("B6",{text: "title",pressed: true, press: toggleTitle}),
							new ToggleButton("B7",{text: "LineBreak Container",pressed: true, press: lineBreakContainer,
								layoutData: new ResponsiveFlowLayoutData({linebreak: true})}),
							new ToggleButton("B8",{text: "LineBreak Element", press: lineBreakElement}),
							new ToggleButton("B9",{text: "LineBreak Field", press: lineBreakField})
						]
					})
				],
			layoutData: new ResponsiveFlowLayoutData({linebreak: true, margin: false})
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
			],
			layoutData: new ResponsiveFlowLayoutData({linebreak: true, margin: false})
	});

	var oNewElement = new FormElement("EX",{
		label: new Label({text:"new Label"}),
		fields: [new Input({value: "new Text", required: true})]
	});

	var oNewField = new Input("TX", {value: "new Field", valueState: CoreLib.ValueState.Warning});

});