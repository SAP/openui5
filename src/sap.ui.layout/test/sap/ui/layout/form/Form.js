sap.ui.require([
	"sap/ui/core/library",
	"sap/ui/layout/library",
	"sap/m/library",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/FormLayout",
	"sap/ui/layout/form/ResponsiveLayout",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/layout/form/GridLayout",
	"sap/ui/layout/form/ColumnLayout",
	"sap/ui/layout/GridData",
	"sap/ui/layout/ResponsiveFlowLayoutData",
	"sap/ui/layout/form/GridElementData",
	"sap/ui/layout/form/GridContainerData",
	"sap/ui/layout/form/ColumnElementData",
	"sap/ui/layout/form/ColumnContainerData",
	"sap/ui/core/VariantLayoutData",
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
	"sap/m/RadioButton",
	"sap/m/TextArea",
	"sap/m/Link",
	"sap/m/ToggleButton",
	"sap/m/Button",
	"sap/m/Image",
	"sap/m/CheckBox",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/ui/core/Icon",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Bar",
	"sap/m/Switch"
	],
	function(
		CoreLib,
		LayoutLib,
		MLib,
		Form,
		FormContainer,
		FormElement,
		FormLayout,
		ResponsiveLayout,
		ResponsiveGridLayout,
		GridLayout,
		ColumnLayout,
		GridData,
		ResponsiveFlowLayoutData,
		GridElementData,
		GridContainerData,
		ColumnElementData,
		ColumnContainerData,
		VariantLayoutData,
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
		RadioButton,
		TextArea,
		Link,
		ToggleButton,
		Button,
		Image,
		CheckBox,
		SegmentedButton,
		SegmentedButtonItem,
		Icon,
		App,
		Page,
		Bar,
		Switch
		) {
	"use strict";

	var oButtonLayout = new SegmentedButton("MyLayout", {
		selectedKey: "L1",
		items: [ new SegmentedButtonItem({key: "L1", text: "FormLayout"}),
		         new SegmentedButtonItem({key: "L2", text: "ResponsiveLayout"}),
		         new SegmentedButtonItem({key: "L3", text: "GridLayout"}),
		         new SegmentedButtonItem({key: "L4", text: "ResponsiveGridLayout"}),
		         new SegmentedButtonItem({key: "L5", text: "ColumnLayout"})
		        ],
		selectionChange: function(oEvent) {
			var oItem = oEvent.getParameter("item");
			switch (oItem.getKey()) {
			case "L1":
				oForm1.setLayout(oLayout1);
				oForm2.setLayout(oLayoutA);
				oForm3.setLayout(oLayoutA3);
				break;

			case "L2":
				oForm1.setLayout(oLayout2);
				oForm2.setLayout(oLayoutB);
				oForm3.setLayout(oLayoutB3);
				break;

			case "L3":
				oForm1.setLayout(oLayout3);
				oForm2.setLayout(oLayoutC);
				oForm3.setLayout(oLayoutC3);
				break;

			case "L4":
				oForm1.setLayout(oLayout4);
				oForm2.setLayout(oLayoutD);
				oForm3.setLayout(oLayoutD3);
				break;

			case "L5":
				oForm1.setLayout(oLayout5);
				oForm2.setLayout(oLayoutE);
				oForm3.setLayout(oLayoutE3);
				break;

			default:
				break;
			}
		}
	});

	var oButtonCompact = new ToggleButton({text: 'compact',
		press: function(oEvent) {
			var bPressed = oEvent.getParameter("pressed");
			document.body.classList.toggle("sapUiSizeCompact", bPressed);
		}
	});

	var oLayout1 = new FormLayout("L1");
	var oLayout2 = new ResponsiveLayout("L2");
	var oLayout3 = new GridLayout("L3");
	var oLayout4 = new ResponsiveGridLayout("L4");
	var oLayout5 = new ColumnLayout("L5");

	var oForm1 = new Form("F1",{
		title: new Title({text: "Form Title", icon: "sap-icon://sap-ui5", tooltip: "Title tooltip"}),
		tooltip: "Form tooltip",
		editable: true,
		layout: oLayout1,
		formContainers: [
			new FormContainer("C1",{
				title: "contact data",
				formElements: [
					new FormElement("F1C1E1", {
						label: "Name",
						fields: [new Input({value: "Name", required: true})]
					}),
					new FormElement({
						label: "First name",
						fields: [new Input()]
					}),
					new FormElement({
						label: "Date of birth",
						fields: [new DatePicker()]
					}),
					new FormElement({
						label: "Gender",
						fields: [new RadioButton({text: "male", selected: true, groupName: "MyTest"}),
						         new RadioButton({text: "female", selected: false, groupName: "MyTest"})]
					}),
					new FormElement({
						label: "Info",
						fields: [new Link({text: "Test", href: "http://www.sap.com"})]
					}),
					new FormElement({
						label: "A label with an extremely long text to see if the truncation works and the : is still visible after the ellipsis",
						fields: [new Text({text: "Test"})]
					}),
					new FormElement({
						label: "Image",
						fields: [new Image({src:"../../../m/images/SAPLogo.jpg", densityAware: false})]
					})
					]
			}),
			new FormContainer("C2",{
				title: new Title({text: "Address", icon: "sap-icon://address-book", tooltip: "Title tooltip"}),
				formElements: [
					new FormElement({
						label: new Label({text:"Street"}),
						fields: [new Input(),
						         new Input({
													layoutData: new VariantLayoutData({
														multipleLayoutData: [new GridElementData({hCells: "1"}),
														                     new GridData({span: "L2 M2 S2"}),
														                     new ColumnElementData({cellsSmall: 2, cellsLarge: 2})]})
						         })]
					}),
					new FormElement({
						label: "City",
						fields: [new Input()]
					}),
					new FormElement({
						label: new Label({text: "Post code"}),
						fields: [new Input({
													layoutData: new VariantLayoutData({
														multipleLayoutData: [new GridElementData({hCells: "2"}),
														                     new GridData({span: "L2 M2 S2"}),
														                     new ColumnElementData({cellsSmall: 2, cellsLarge: 2})]})
											})]
					}),
					new FormElement({
						label: "Country",
						fields: [new Select({selectedKey: "DE",
							items: [new ListItem({key: "GB", text: "England"}),
											new ListItem({key: "US", text: "USA"}),
											new ListItem({key: "DE", text: "Germany"})]
						})]
					})
				],
				layoutData: new VariantLayoutData({
					multipleLayoutData: [new GridContainerData({halfGrid: true})]})
			}),
			new FormContainer("C3",{
				title: new Title({text: "Education", emphasized: true}),
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
					}),
					new FormElement({
						visible: false,
						fields: [new Input({value: 'you shold not see me'})]
					})
				],
				layoutData: new VariantLayoutData({
					multipleLayoutData: [new GridContainerData({halfGrid: true})]})
			}),
			new FormContainer("C4",{
				formElements: [
					new FormElement({
						fields: [new ToggleButton({text: 'move container',
													press: function(oEvent) {
														var bPressed = oEvent.getParameter("pressed");
														var oContainer = sap.ui.getCore().byId("C1");
														oForm1.removeFormContainer(oContainer);
														if (bPressed) {
															oForm1.insertFormContainer(oContainer, 1);
														} else {
															oForm1.insertFormContainer(oContainer, 0);
														}
													},
													layoutData: new VariantLayoutData({
														multipleLayoutData: [new GridElementData({hCells: "2"})]})
											}),
											new ToggleButton({text: 'move element',
												press: function(oEvent) {
													var bPressed = oEvent.getParameter("pressed");
													var oContainer = sap.ui.getCore().byId("C1");
													var oElement = sap.ui.getCore().byId("F1C1E1");
													oContainer.removeFormElement(oElement);
													if (bPressed) {
														oContainer.insertFormElement(oElement, 1);
													} else {
														oContainer.insertFormElement(oElement, 0);
													}
												},
													layoutData: new VariantLayoutData({
														multipleLayoutData: [new GridElementData({hCells: "2"})]})
											}),
											new ToggleButton({text: 'label conons',
												press: function(oEvent) {
													var bPressed = oEvent.getParameter("pressed");
													if (bPressed) {
														oForm1.addStyleClass("sapUiFormLblColon");
													} else {
														oForm1.removeStyleClass("sapUiFormLblColon");
													}
												},
													layoutData: new VariantLayoutData({
														multipleLayoutData: [new GridElementData({hCells: "2"})]})
											})]
					})
				],
				layoutData: new VariantLayoutData({
					multipleLayoutData: [new GridContainerData({halfGrid: true})]})
			}),
			new FormContainer("C5",{
				visible: false,
				title: "invisible",
				formElements: [
					new FormElement({
						fields: [new Input({value: 'Hello'})]
					})
				]
			}),
			new FormContainer("C6",{
				title: "Background",
				formElements: [
					new FormElement({
						label: "BackgroundDesign",
						fields: [new SegmentedButton("BackCol", {
							width: "100%",
							selectedKey: MLib.BackgroundDesign.Translucent,
							items: [ new SegmentedButtonItem("Back1", {key: MLib.BackgroundDesign.Transparent, text: "Transparent"}),
							         new SegmentedButtonItem("Back2", {key: MLib.BackgroundDesign.Solid, text: "Solid"}),
							         new SegmentedButtonItem("Back3", {key: MLib.BackgroundDesign.Translucent, text: "Translucent"})
							        ],
							selectionChange: function(oEvent) {
								var oItem = oEvent.getParameter("item");
								var sBackground = oItem.getKey();
								oLayout1.setBackgroundDesign(sBackground);
								oLayout2.setBackgroundDesign(sBackground);
								oLayout3.setBackgroundDesign(sBackground);
								oLayout4.setBackgroundDesign(sBackground);
								oLayout5.setBackgroundDesign(sBackground);
							}
						})]
					})
				],
			layoutData: new VariantLayoutData({
				multipleLayoutData: [new ResponsiveFlowLayoutData({linebreak: true})]})
			})
			]
	});

	//////////////// Form 2 ////////////////////////////////////////////////////////////////////////////////////////

	var oLayoutA = new FormLayout("L_A");
	var oLayoutB = new ResponsiveLayout("L_B");
	var oLayoutC = new GridLayout("L_C");
	var oLayoutD = new ResponsiveGridLayout("L_D");
	var oLayoutE = new ColumnLayout("L_E", {columnsM: 2, columnsL: 3, columnsXL: 4});

	var oForm2 = new Form("F2",{
		toolbar: new Toolbar("TB1", {
								content: [new Icon({src: "sap-icon://car-rental", size: "2rem"}),
								          new mTitle("F2-Title", {text: "Car", level: CoreLib.TitleLevel.H4, titleStyle: CoreLib.TitleLevel.H4, tooltip: "Title tooltip"}),
								          new ToolbarSpacer(),
								          new Link({text: "Link", href: "http://www.sap.com"}),
								          new Button({text: "Text"}),
								          new Button({icon: "sap-icon://sap-ui5", tooltip: "SAPUI5"})
								          ]
							}),
		ariaLabelledBy: "F2-Title",
		tooltip: "Form tooltip",
		editable: true,
		layout: oLayoutA,
		formContainers: [
			new FormContainer("F2C1",{
				toolbar: new Toolbar("TB2", {
						content: [new mTitle("F2C1-Title", {text: "technical data", level: CoreLib.TitleLevel.H5, titleStyle: CoreLib.TitleLevel.H5, tooltip: "Title tooltip"}),
						          new ToolbarSpacer(),
						          new Link({text: "Link", href: "http://www.sap.com"}),
						          new Button({text: "Text"}),
						          new Button({icon: "sap-icon://sap-ui5", tooltip: "SAPUI5"})
						          ]
					}),
				ariaLabelledBy: "F2C1-Title",
				formElements: [
					new FormElement({
						label: "Manufacturer",
						fields: [new Input()]
					}),
					new FormElement({
						label: "Model",
						fields: [new Input()]
					}),
					new FormElement({
						label: "initial registration",
						fields: [new DatePicker()]
					}),
					new FormElement({
						label: "Engine",
						fields: [new RadioButton({text: "diesel", selected: true, groupName: "MyEngine"}),
						         new RadioButton({text: "gas", selected: false, groupName: "MyEngine"})]
						}),
					new FormElement({
						label: "Automatic transmission",
						fields: [new Switch({state: true})]
						})],
				layoutData: new VariantLayoutData({
					multipleLayoutData: [new GridContainerData({halfGrid: true})]})
			}),
			new FormContainer("F2C2",{
				title: "You should not see me !!!",
				toolbar: new Toolbar("TB3", {
					content: [
						new Button({icon: "sap-icon://slim-arrow-down",
							press: function(oEvent) {
								var oContainer = sap.ui.getCore().byId("F2C2");
								if (oContainer.getExpanded()) {
									oContainer.setExpanded(false);
									oEvent.oSource.setIcon("sap-icon://slim-arrow-right");
								} else {
									oContainer.setExpanded(true);
									oEvent.oSource.setIcon("sap-icon://slim-arrow-down");
								}
							}}),
						new mTitle("F2C2-Title", {text: "other data", level: CoreLib.TitleLevel.H5, titleStyle: CoreLib.TitleLevel.H5, tooltip: "Title tooltip"}),
						new ToolbarSpacer(),
						new Link({text: "Link", href: "http://www.sap.com"}),
						new Button({text: "Text"})
					]
				}),
				ariaLabelledBy: "F2C2-Title",
				expandable: true,
				formElements: [
					new FormElement({
						label: "license tag",
						fields: [new Input()]
					}),
					new FormElement({
						label: "driver",
						fields: [new Input()]
					})
				],
				layoutData: new VariantLayoutData({
					multipleLayoutData: [new GridContainerData({halfGrid: true})]})
			})
		]
	});

	//////////////// Form 3 ////////////////////////////////////////////////////////////////////////////////////////

	var oLayoutA3 = new FormLayout("L_A3");
	var oLayoutB3 = new ResponsiveLayout("L_B3");
	var oLayoutC3 = new GridLayout("L_C3");
	var oLayoutD3 = new ResponsiveGridLayout("L_D3");
	var oLayoutE3 = new ColumnLayout("L_E3");

	var oForm3 = new Form("F3",{
		title: "only one container",
		editable: true,
		layout: oLayoutA3,
		formContainers: [
			new FormContainer("F3C1",{
				title: "Title",
				formElements: [
					new FormElement({
						label: "Label",
						fields: [
							new Input(),
							new ToggleButton({
								text: "Title",
								pressed: true,
								press: function(oEvent) {
									var bPressed = oEvent.getParameter("pressed");
									var oContainer = sap.ui.getCore().byId("F3C1");
									if (bPressed) {
										oContainer.setTitle("Title");
									} else {
										oContainer.setTitle();
									}
								}
							})]
						})]
			})
		]
	});

	new App("myApp", {
		pages: new Page("page1", {
			title: "Test Page for sap.ui.layout.form.Form",
			content: [
			          oForm1,
			          oForm2,
			          oForm3
			          ],
			footer: new Bar({
								contentMiddle: [oButtonLayout, oButtonCompact]
							})
		})
	}).placeAt("body");

});