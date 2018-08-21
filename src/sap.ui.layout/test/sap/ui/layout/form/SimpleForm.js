sap.ui.require([
	"sap/ui/core/library",
	"sap/ui/layout/library",
	"sap/m/library",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/GridData",
	"sap/ui/layout/ResponsiveFlowLayoutData",
	"sap/ui/layout/form/GridElementData",
	"sap/ui/layout/form/GridContainerData",
	"sap/ui/layout/form/ColumnElementData",
	"sap/ui/layout/form/ColumnContainerData",
	"sap/ui/core/VariantLayoutData",
	"sap/ui/core/Title",
	"sap/m/Toolbar",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Title",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Input",
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
	"sap/m/Bar"
	],
	function(
		CoreLib,
		LayoutLib,
		MLib,
		SimpleForm,
		GridData,
		ResponsiveFlowLayoutData,
		GridElementData,
		GridContainerData,
		ColumnElementData,
		ColumnContainerData,
		VariantLayoutData,
		Title,
		Toolbar,
		OverflowToolbar,
		ToolbarSpacer,
		mTitle,
		Label,
		Text,
		Input,
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
		Bar
		) {
	"use strict";

	var oButtonLayout = new SegmentedButton("MyLayout", {
		selectedKey: "L1",
		items: [ new SegmentedButtonItem({key: "L1", text: "ResponsiveLayout"}),
		         new SegmentedButtonItem({key: "L2", text: "GridLayout"}),
		         new SegmentedButtonItem({key: "L3", text: "ResponsiveGridLayout"}),
		         new SegmentedButtonItem({key: "L4", text: "ColumnLayout"})
		        ],
		selectionChange: function(oEvent) {
			var oItem = oEvent.getParameter("item");
			switch (oItem.getKey()) {
			case "L1":
				oSimpleForm1.setLayout(LayoutLib.form.SimpleFormLayout.ResponsiveLayout);
				oSimpleForm2.setLayout(LayoutLib.form.SimpleFormLayout.ResponsiveLayout);
				break;

			case "L2":
				oSimpleForm1.setLayout(LayoutLib.form.SimpleFormLayout.GridLayout);
				oSimpleForm2.setLayout(LayoutLib.form.SimpleFormLayout.GridLayout);
				break;

			case "L3":
				oSimpleForm1.setLayout(LayoutLib.form.SimpleFormLayout.ResponsiveGridLayout);
				oSimpleForm2.setLayout(LayoutLib.form.SimpleFormLayout.ResponsiveGridLayout);
				break;

			case "L4":
				oSimpleForm1.setLayout(LayoutLib.form.SimpleFormLayout.ColumnLayout);
				oSimpleForm2.setLayout(LayoutLib.form.SimpleFormLayout.ColumnLayout);
				break;

			default:
				break;
			}
		}
	});

	var oSimpleForm1 = new SimpleForm(
			"SF1",
			{
				minWidth : 1024,
				maxContainerCols: 2,
				title: "Form title",
				editable: true,
				content:[
					new Title({text:"Title 1"}),
					new Label({text:"Label 1"}),
					new Input("I1",{value:"Value 1", required: true}),
					new Label({text:"Label 2"}),
					new Input("I2",{value:"Value 2/1"}),
					new Input("I3",{value:"Value 2/2",
						layoutData: new VariantLayoutData({multipleLayoutData: [
						                                   new GridElementData({hCells: "1"}),
						                                   new GridData({span: "L2 M2 S2"}),
						                                   new ColumnElementData({cellsSmall: 2, cellsLarge: 2})]})}),
					new Label({text:"Label 3"}),
					new Input({value:"Value 3/1"}),
					new Input({value:"Value 3/2"}),
					new Input({value:"Value 3/3"}),
					new Label({text:"Label 4"}),
					new CheckBox({selected:false}),
					new Label({text:"Label 5"}),
					new TextArea({value:"Long Text,Long Text,Long Text,Long Text,Long TextLong Text,Long TextLong Text,Long TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong Text"}),
					new Title({text:"Title 2"}),
					new Label({text:"Label 1"}),
					new Input({value:"Value 1"}),
					new Label({text:"Label 2"}),
					new Input({value:"Value 2/1"}),
					new Input({value:"Value 2/2"}),
					new Label({text:"Label 3"}),
					new Input({value:"Value 3/1"}),
					new Input({value:"Value 3/2"}),
					new Input({value:"Value 3/3"}),
					new Label("L4", {text:"Label 4"}),
					new CheckBox({selected:false}),
					new TextArea({layoutData:new ResponsiveFlowLayoutData({linebreak:true,weight:8}),value:"Long Text,Long Text,Long Text,Long Text,Long TextLong Text,Long TextLong Text,Long TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong Text",
						                  ariaLabelledBy: "L4"}),
					new Title({text:"Title 3"}),
					new Label({text:"Label 1"}),
					new Link({text:"Text 1", href:"http://www.sap.com"}),
					new Label({text:"Label 2"}),
					new Input({value:"Value 2/1"}),
					new Text({text:"Text 2/2"}),
					new Label({text:"Label 3"}),
					new Input({value:"Value 3/1 weight",layoutData:new ResponsiveFlowLayoutData({weight:2})}),
					new Text({text:"Text 3/2 weight",layoutData:new ResponsiveFlowLayoutData({weight:2})}),
					new Icon({src:"sap-icon://travel-expense",layoutData:new ResponsiveFlowLayoutData({weight:1})}),
					new Label("L4a", {text:"Label 4"}),
					new CheckBox({selected:false}),
					new TextArea({layoutData:new ResponsiveFlowLayoutData({linebreak:true,weight:8}),value:"Long Text,Long Text,Long Text,Long Text,Long TextLong Text,Long TextLong Text,Long TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong TextLong Text",
						                  ariaLabelledBy: "L4a"}),
					new Label({text:"This was invisible"}),
					new CheckBox("myCB",{selected:false,visible:false}),
					new Label({text:"a nice image"}),
					new Image({src: "../../../m/images/SAPLogo.jpg", densityAware: false}),
					new Label({text:"Change the visibility"}),
					new ToggleButton("myButton1",{text:"Hide Fields",press:function(oEvent) {
						if (oEvent.getParameter("pressed")) {
							sap.ui.getCore().byId("I1").setVisible(false);
							sap.ui.getCore().byId("I2").setVisible(false);
							sap.ui.getCore().byId("I3").setVisible(false);
						} else {
							sap.ui.getCore().byId("I1").setVisible(true);
							sap.ui.getCore().byId("I2").setVisible(true);
							sap.ui.getCore().byId("I3").setVisible(true);
						}
					}}),
					new Button("myButton3",{text:"Destroy",press:function(oEvent) {
						oSimpleForm1.destroy();
					}}),
					new ToggleButton("myButton4",{text:"Label colons",press:function(oEvent) {
						var bPressed = oEvent.getParameter("pressed");
						var oForm = sap.ui.getCore().byId("SF1");
						if (bPressed) {
							oForm.addStyleClass("sapUiFormLblColon");
						} else {
							oForm.removeStyleClass("sapUiFormLblColon");
						}
					}}),
					new Label({text:"BackgroundDesign"}),
					new SegmentedButton("BackCol", {
						width: "100%",
						selectedKey: "Back3",
						items: [ new SegmentedButtonItem({key: "Back1", text: LayoutLib.BackgroundDesign.Transparent}),
						         new SegmentedButtonItem({key: "Back2", text: LayoutLib.BackgroundDesign.Solid}),
						         new SegmentedButtonItem({key: "Back3", text: LayoutLib.BackgroundDesign.Translucent})
						        ],
						selectionChange: function(oEvent) {
							var oItem = oEvent.getParameter("item");
							var sDesign;
							switch (oItem.getKey()) {
							case "Back1":
								sDesign = LayoutLib.BackgroundDesign.Transparent;
								break;

							case "Back2":
								sDesign = LayoutLib.BackgroundDesign.Solid;
								break;

							default:
								sDesign = LayoutLib.BackgroundDesign.Translucent;
								break;
							}
							oSimpleForm1.setBackgroundDesign(sDesign);
						}
					})
				]
			});

	var oSimpleForm2 = new SimpleForm("SF2", {
		minWidth : 1024,
		maxContainerCols: 2,
		editable: false,
		backgroundDesign: LayoutLib.BackgroundDesign.Transparent,
		toolbar: new Toolbar("TB1", {
			content: [new mTitle("SF2-Title", {text: "Non-Editable SimpleForm with transparent background and Toolbars", level: CoreLib.TitleLevel.H4, titleStyle: CoreLib.TitleLevel.H4, tooltip: "Title tooltip"}),
			          new ToolbarSpacer(),
			          new Button({icon: "sap-icon://sap-ui5", tooltip: "SAPUI5"})
			          ]
		}),
		ariaLabelledBy: "SF2-Title",
		content:[
			new Toolbar("TB2", {
				content: [
					new mTitle("SF2C1-Title", {text: "Title 1", level: CoreLib.TitleLevel.H5, titleStyle: CoreLib.TitleLevel.H5, tooltip: "Title tooltip"}),
					new ToolbarSpacer(),
					new Button({icon: "sap-icon://sap-ui5", tooltip: "SAPUI5"})
					]
			}),
			new Label({text:"Label 1"}),
			new Text("T1",{text:"Value 1"}),
			new Label({text:"Label 2"}),
			new Text("T2",{text:"Value 2/1"}),
			new Text("T3",{text:"Value 2/2",
				layoutData: new VariantLayoutData({multipleLayoutData: [
					new GridElementData({hCells: "1"}),
					new GridData({span: "L2 M2 S2"}),
					new ColumnElementData({cellsSmall: 2, cellsLarge: 2})]})}),
			new OverflowToolbar("TB3", {
				content: [
					new mTitle("SF2C2-Title", {text: "Title 2", level: CoreLib.TitleLevel.H5, titleStyle: CoreLib.TitleLevel.H5, tooltip: "Title tooltip"}),
					new ToolbarSpacer(),
					new Button({icon: "sap-icon://sap-ui5", tooltip: "SAPUI5"})
					]
			}),
			new Label({text:"Label 1",
				layoutData: new VariantLayoutData({multipleLayoutData: [
					new GridData({span: "L4 M2 S5", linebreak: true}),
					new ColumnElementData({cellsSmall: 5, cellsLarge: 4})]})}),
			new Text({text:"Value 1"}),
			new Label({text:"Label 2",
				layoutData: new VariantLayoutData({multipleLayoutData: [
					new GridData({span: "L4 M2 S5", linebreak: true}),
					new ColumnElementData({cellsSmall: 5, cellsLarge: 4})]})}),
			new Text({text:"Value 2/1"}),
			new Text({text:"Value 2/2"})
		]
	});

	new App("myApp", {
		pages: new Page("page1", {
			title: "Test Page for sap.ui.layout.form.SimpleForm",
			content: [
			          oSimpleForm1,
			          oSimpleForm2
			         ],
			footer: new Bar({
								contentMiddle: [oButtonLayout]
							})
		})
	}).placeAt("body");

});