sap.ui.require([
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
	"sap/m/Input",
	"sap/m/Select",
	"sap/ui/core/ListItem",
	"sap/m/CheckBox"
	],
	function(
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
		Input,
		Select,
		ListItem,
		CheckBox
		) {
	"use strict";

	var handleLayoutChange = function(oEvent){
		var sKey = oEvent.getParameter("selectedItem").getKey();
		var oLayout = oForm.getLayout();
		var sOldKey = oLayout.getId();
		var aContainers = oForm.getFormContainers();

		oLayout.destroy();

		// initialize LayoutData
		for (var i = 0; i < aContainers.length; i++){
			var oLD = aContainers[i].getLayoutData();
			if (oLD){
				oLD.destroy();
			}
		}

		switch (sKey) {
		case "RGL":
			oLayout = new ResponsiveGridLayout("RGL", {
				labelSpanS: parseInt(sap.ui.getCore().byId("I-labelSpanS").getValue()),
				labelSpanM: parseInt(sap.ui.getCore().byId("I-labelSpanM").getValue()),
				labelSpanL: parseInt(sap.ui.getCore().byId("I-labelSpanL").getValue()),
				labelSpanXL: parseInt(sap.ui.getCore().byId("I-labelSpanXL").getValue()),
				adjustLabelSpan: sap.ui.getCore().byId("CB-adjustLabelSpan").getSelected(),
				emptySpanS: parseInt(sap.ui.getCore().byId("I-emptySpanS").getValue()),
				emptySpanM: parseInt(sap.ui.getCore().byId("I-emptySpanM").getValue()),
				emptySpanL: parseInt(sap.ui.getCore().byId("I-emptySpanL").getValue()),
				emptySpanXL: parseInt(sap.ui.getCore().byId("I-emptySpanXL").getValue()),
				columnsM: parseInt(sap.ui.getCore().byId("I-columnsM").getValue()),
				columnsL: parseInt(sap.ui.getCore().byId("I-columnsL").getValue()),
				columnsXL: parseInt(sap.ui.getCore().byId("I-columnsXL").getValue()),
				singleContainerFullSize: sap.ui.getCore().byId("CB-singleContainerFullSize").getSelected(),
				breakpointM: parseInt(sap.ui.getCore().byId("I-breakpointM").getValue()),
				breakpointL: parseInt(sap.ui.getCore().byId("I-breakpointL").getValue()),
				breakpointXL: parseInt(sap.ui.getCore().byId("I-breakpointXL").getValue())
			});
			break;

		case "RL":
			oLayout = new ResponsiveLayout("RL", {
			});
			break;

		case "GL":
			var bSingleColumn = sap.ui.getCore().byId("CB-singleColumn").getSelected();
			oLayout = new GridLayout("GL", {
				singleColumn: bSingleColumn
			});
			var aContainers = oForm.getFormContainers();
			for (var i = 0; i < aContainers.length; i++){
				aContainers[i].setLayoutData(new GridContainerData({halfGrid: true}));
			}
			break;

		case "CL":
			oLayout = new ColumnLayout("CL", {
				columnsM: parseInt(sap.ui.getCore().byId("I-columnsM-CL").getValue()),
				columnsL: parseInt(sap.ui.getCore().byId("I-columnsL-CL").getValue()),
				columnsXL: parseInt(sap.ui.getCore().byId("I-columnsXL-CL").getValue()),
				labelCellsLarge: parseInt(sap.ui.getCore().byId("I-labelCellsLarge").getValue()),
				emptyCellsLarge: parseInt(sap.ui.getCore().byId("I-emptyCellsLarge").getValue())
			});
			break;

		default:
			oLayout = null;
			break;
		}

		oForm.setLayout(oLayout);
		sap.ui.getCore().byId("C-" + sOldKey).setVisible(false);
		sap.ui.getCore().byId("C-" + sKey).setVisible(true);
	};

	var handleFieldsChange = function(oEvent){
		var iFields = parseInt(oEvent.getParameter("value"));
		var oElement = sap.ui.getCore().byId("E-Fields");
		var aFields = oElement.getFields();

		if (aFields.length > iFields) {
			for (var i = iFields; i < aFields.length; i++){
				aFields[i].destroy();
			}
		} else {
			for (var i = aFields.length; i < iFields; i++){
				var oControl = new Input();
				if (i == 1){
					// for second field use LayoutData
					oControl.setLayoutData(new VariantLayoutData({
						multipleLayoutData: [new GridElementData({hCells: "3"}),
						                     new GridData({span: "XL3 L3 M3 S3"}),
						                     new ResponsiveFlowLayoutData({weight: 3}),
						                     new ColumnElementData({cellsLarge: 3, cellsSmall: 3})]}));
				}
				oElement.addField(oControl);
			}
		}
	};

	var oForm = new Form("F1",{
		title: "Parameter Test",
		editable: true,
		layout: new ResponsiveGridLayout("RGL"),
		formContainers: [
			new FormContainer("C1",{
				title: "Layout",
				formElements: [
					new FormElement({
						label: "Layout",
						fields: [new Select("Sel_Layout",{ selectedKey: "RGL",
							items: [new ListItem({key: "RGL", text: "ResponsiveGridLayout"}),
											new ListItem({key: "RL", text: "ResponsiveLayout"}),
											new ListItem({key: "GL", text: "Grid"}),
											new ListItem({key: "CL", text: "ColumnLayout"})],
							change: handleLayoutChange
						})]
					}),
					new FormElement({
						label: "Number of fields",
						fields: [new Input({value: "1", type: MLib.InputType.Number, change: handleFieldsChange})]
					})
				]
			}),
			new FormContainer("C-RGL",{
				title: "Layout parameter",
				visible: true,
				formElements: [
					new FormElement({
						label: "labelSpan (S, M, L, XL)",
						fields: [new Input("I-labelSpanS",{
											value: sap.ui.getCore().byId("RGL").getLabelSpanS(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setLabelSpanS(parseInt(sValue));
											}}),
										 new Input("I-labelSpanM",{
											value: sap.ui.getCore().byId("RGL").getLabelSpanM(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setLabelSpanM(parseInt(sValue));
											}}),
										 new Input("I-labelSpanL",{
											value: sap.ui.getCore().byId("RGL").getLabelSpanL(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setLabelSpanL(parseInt(sValue));
											}}),
										 new Input("I-labelSpanXL",{
											value: sap.ui.getCore().byId("RGL").getLabelSpanXL(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setLabelSpanXL(parseInt(sValue));
											}})]
					}),
					new FormElement({
						label: "adjustLabelSpan",
						fields: [new CheckBox("CB-adjustLabelSpan",{
											selected: sap.ui.getCore().byId("RGL").getAdjustLabelSpan(),
											select: function(oEvent){
												var oLayout = sap.ui.getCore().byId("RGL");
												var bSelected = oEvent.getParameter("selected");
												oLayout.setAdjustLabelSpan(bSelected);
											}})]
					}),
					new FormElement({
						label: "emptySpan (S, M, L, XL)",
						fields: [new Input("I-emptySpanS",{
											value: sap.ui.getCore().byId("RGL").getEmptySpanS(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setEmptySpanS(parseInt(sValue));
											}}),
										 new Input("I-emptySpanM",{
											value: sap.ui.getCore().byId("RGL").getEmptySpanM(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setEmptySpanM(parseInt(sValue));
											}}),
										 new Input("I-emptySpanL",{
											value: sap.ui.getCore().byId("RGL").getEmptySpanL(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setEmptySpanL(parseInt(sValue));
											}}),
										 new Input("I-emptySpanXL",{
											value: sap.ui.getCore().byId("RGL").getEmptySpanXL(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setEmptySpanXL(parseInt(sValue));
											}})]
					}),
					new FormElement({
						label: "columns (M, L, XL)",
						fields: [new Input("I-columnsM",{
											value: sap.ui.getCore().byId("RGL").getColumnsM(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setColumnsM(parseInt(sValue));
											}}),
										 new Input("I-columnsL",{
											value: sap.ui.getCore().byId("RGL").getColumnsL(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setColumnsL(parseInt(sValue));
											}}),
										 new Input("I-columnsXL",{
											value: sap.ui.getCore().byId("RGL").getColumnsXL(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setColumnsXL(parseInt(sValue));
											}})]
					}),
					new FormElement({
						label: "singleContainerFullSize",
						fields: [new CheckBox("CB-singleContainerFullSize",{
											selected: sap.ui.getCore().byId("RGL").getSingleContainerFullSize(),
											select: function(oEvent){
												var oLayout = sap.ui.getCore().byId("RGL");
												var bSelected = oEvent.getParameter("selected");
												oLayout.setSingleContainerFullSize(bSelected);
											}})]
					}),
					new FormElement({
						label: "breakpoint (M, L, XL)",
						fields: [new Input("I-breakpointM",{
											value: sap.ui.getCore().byId("RGL").getBreakpointM(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setBreakpointM(parseInt(sValue));
											}}),
										 new Input("I-breakpointL",{
											value: sap.ui.getCore().byId("RGL").getBreakpointL(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setBreakpointL(parseInt(sValue));
											}}),
										 new Input("I-breakpointXL",{
											value: sap.ui.getCore().byId("RGL").getBreakpointXL(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setBreakpointXL(parseInt(sValue));
											}})]
					})
				]
			}),
			new FormContainer("C-RL",{
				title: "Layout parameter",
				visible: false,
				formElements: [
					new FormElement({
						label: "no properties",
						fields: [new Input({enabled: false,
											change: function(oEvent){
//												var oLayout = sap.ui.getCore().byId("RL");
											}})]
					})
				]
			}),
			new FormContainer("C-GL",{
				title: "Layout parameter",
				visible: false,
				formElements: [
					new FormElement({
						label: "singleColumn",
						fields: [new CheckBox("CB-singleColumn", {selected: false,
											select: function(oEvent){
												var oLayout = sap.ui.getCore().byId("GL");
												var bSelected = oEvent.getParameter("selected");
												oLayout.setSingleColumn(bSelected);
											}})]
					})
				]
			}),
			new FormContainer("C-CL",{
				title: "Layout parameter",
				visible: false,
				formElements: [
					new FormElement({
						label: "columns (M, L, XL)",
						fields: [new Input("I-columnsM-CL",{
											value: 1,
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("CL");
												var sValue = oEvent.getParameter("value");
												oLayout.setColumnsM(parseInt(sValue));
											}}),
										 new Input("I-columnsL-CL",{
											value: 2,
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("CL");
												var sValue = oEvent.getParameter("value");
												oLayout.setColumnsL(parseInt(sValue));
											}}),
										 new Input("I-columnsXL-CL",{
											value: 2,
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("CL");
												var sValue = oEvent.getParameter("value");
												oLayout.setColumnsXL(parseInt(sValue));
											}})]
					}),
					new FormElement({
						label: "labelCellsLarge",
						fields: [new Input("I-labelCellsLarge",{
											value: 4,
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("CL");
												var sValue = oEvent.getParameter("value");
												oLayout.setLabelCellsLarge(parseInt(sValue));
											}})]
					}),
					new FormElement({
						label: "emptyCellsLarge",
						fields: [new Input("I-emptyCellsLarge",{
											value: 0,
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = sap.ui.getCore().byId("CL");
												var sValue = oEvent.getParameter("value");
												oLayout.setEmptyCellsLarge(parseInt(sValue));
											}})]
					})
				]
			}),
			new FormContainer("C-Fields",{
				title: "Fields",
				formElements: [
					new FormElement({
						label: "First element",
						fields: [new Input()]
					}),
					new FormElement("E-Fields", {
						label: "Dynamic element",
						fields: [new Input()]
					}),
					new FormElement({
						label: "Last element",
						fields: [new Input()]
					})
				]
			}),
			new FormContainer("C-Dummy1",{
				title: "Dummy1",
				formElements: [
					new FormElement({
						label: "Element1",
						fields: [new Input()]
					}),
					new FormElement({
						label: "Element2",
						fields: [new Input()]
					})
				]
			}),
			new FormContainer("C-Dummy2",{
				title: "Dummy2",
				formElements: [
					new FormElement({
						label: "Element1",
						fields: [new Input()]
					}),
					new FormElement({
						label: "Element2",
						fields: [new Input()]
					})
				]
			}),
			new FormContainer("C-Dummy3",{
				title: "Dummy3",
				formElements: [
					new FormElement({
						label: "Element1",
						fields: [new Input()]
					}),
					new FormElement({
						label: "Element2",
						fields: [new Input()]
					})
				]
			})
		]
	}).placeAt("content");

});