sap.ui.define([
	"sap/ui/core/Element",
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
		Element,
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
				labelSpanS: parseInt(Element.getElementById("I-labelSpanS").getValue()),
				labelSpanM: parseInt(Element.getElementById("I-labelSpanM").getValue()),
				labelSpanL: parseInt(Element.getElementById("I-labelSpanL").getValue()),
				labelSpanXL: parseInt(Element.getElementById("I-labelSpanXL").getValue()),
				adjustLabelSpan: Element.getElementById("CB-adjustLabelSpan").getSelected(),
				emptySpanS: parseInt(Element.getElementById("I-emptySpanS").getValue()),
				emptySpanM: parseInt(Element.getElementById("I-emptySpanM").getValue()),
				emptySpanL: parseInt(Element.getElementById("I-emptySpanL").getValue()),
				emptySpanXL: parseInt(Element.getElementById("I-emptySpanXL").getValue()),
				columnsM: parseInt(Element.getElementById("I-columnsM").getValue()),
				columnsL: parseInt(Element.getElementById("I-columnsL").getValue()),
				columnsXL: parseInt(Element.getElementById("I-columnsXL").getValue()),
				singleContainerFullSize: Element.getElementById("CB-singleContainerFullSize").getSelected(),
				breakpointM: parseInt(Element.getElementById("I-breakpointM").getValue()),
				breakpointL: parseInt(Element.getElementById("I-breakpointL").getValue()),
				breakpointXL: parseInt(Element.getElementById("I-breakpointXL").getValue())
			});
			break;

		/** @deprecated */
		case "RL":
			oLayout = new ResponsiveLayout("RL", {
			});
			break;

		/** @deprecated */
		case "GL":
			var bSingleColumn = Element.getElementById("CB-singleColumn").getSelected();
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
				columnsM: parseInt(Element.getElementById("I-columnsM-CL").getValue()),
				columnsL: parseInt(Element.getElementById("I-columnsL-CL").getValue()),
				columnsXL: parseInt(Element.getElementById("I-columnsXL-CL").getValue()),
				labelCellsLarge: parseInt(Element.getElementById("I-labelCellsLarge").getValue()),
				emptyCellsLarge: parseInt(Element.getElementById("I-emptyCellsLarge").getValue())
			});
			break;

		default:
			oLayout = null;
			break;
		}

		oForm.setLayout(oLayout);
		Element.getElementById("C-" + sOldKey).setVisible(false);
		Element.getElementById("C-" + sKey).setVisible(true);
	};

	var handleFieldsChange = function(oEvent){
		var iFields = parseInt(oEvent.getParameter("value"));
		var oElement = Element.getElementById("E-Fields");
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
						multipleLayoutData: [
							/** @deprecated */
							new GridElementData({hCells: "3"}),
							new GridData({span: "XL3 L3 M3 S3"}),
							new ResponsiveFlowLayoutData({weight: 3}),
							new ColumnElementData({cellsLarge: 3, cellsSmall: 3})
						]})
					);
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
							items: [
								new ListItem({key: "RGL", text: "ResponsiveGridLayout"}),
								/** @deprecated */
								new ListItem({key: "RL", text: "ResponsiveLayout"}),
								/** @deprecated */
								new ListItem({key: "GL", text: "Grid"}),
								new ListItem({key: "CL", text: "ColumnLayout"})
							],
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
											value: Element.getElementById("RGL").getLabelSpanS(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = Element.getElementById("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setLabelSpanS(parseInt(sValue));
											}}),
										 new Input("I-labelSpanM",{
											value: Element.getElementById("RGL").getLabelSpanM(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = Element.getElementById("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setLabelSpanM(parseInt(sValue));
											}}),
										 new Input("I-labelSpanL",{
											value: Element.getElementById("RGL").getLabelSpanL(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = Element.getElementById("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setLabelSpanL(parseInt(sValue));
											}}),
										 new Input("I-labelSpanXL",{
											value: Element.getElementById("RGL").getLabelSpanXL(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = Element.getElementById("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setLabelSpanXL(parseInt(sValue));
											}})]
					}),
					new FormElement({
						label: "adjustLabelSpan",
						fields: [new CheckBox("CB-adjustLabelSpan",{
											selected: Element.getElementById("RGL").getAdjustLabelSpan(),
											select: function(oEvent){
												var oLayout = Element.getElementById("RGL");
												var bSelected = oEvent.getParameter("selected");
												oLayout.setAdjustLabelSpan(bSelected);
											}})]
					}),
					new FormElement({
						label: "emptySpan (S, M, L, XL)",
						fields: [new Input("I-emptySpanS",{
											value: Element.getElementById("RGL").getEmptySpanS(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = Element.getElementById("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setEmptySpanS(parseInt(sValue));
											}}),
										 new Input("I-emptySpanM",{
											value: Element.getElementById("RGL").getEmptySpanM(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = Element.getElementById("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setEmptySpanM(parseInt(sValue));
											}}),
										 new Input("I-emptySpanL",{
											value: Element.getElementById("RGL").getEmptySpanL(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = Element.getElementById("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setEmptySpanL(parseInt(sValue));
											}}),
										 new Input("I-emptySpanXL",{
											value: Element.getElementById("RGL").getEmptySpanXL(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = Element.getElementById("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setEmptySpanXL(parseInt(sValue));
											}})]
					}),
					new FormElement({
						label: "columns (M, L, XL)",
						fields: [new Input("I-columnsM",{
											value: Element.getElementById("RGL").getColumnsM(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = Element.getElementById("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setColumnsM(parseInt(sValue));
											}}),
										 new Input("I-columnsL",{
											value: Element.getElementById("RGL").getColumnsL(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = Element.getElementById("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setColumnsL(parseInt(sValue));
											}}),
										 new Input("I-columnsXL",{
											value: Element.getElementById("RGL").getColumnsXL(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = Element.getElementById("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setColumnsXL(parseInt(sValue));
											}})]
					}),
					new FormElement({
						label: "singleContainerFullSize",
						fields: [new CheckBox("CB-singleContainerFullSize",{
											selected: Element.getElementById("RGL").getSingleContainerFullSize(),
											select: function(oEvent){
												var oLayout = Element.getElementById("RGL");
												var bSelected = oEvent.getParameter("selected");
												oLayout.setSingleContainerFullSize(bSelected);
											}})]
					}),
					new FormElement({
						label: "breakpoint (M, L, XL)",
						fields: [new Input("I-breakpointM",{
											value: Element.getElementById("RGL").getBreakpointM(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = Element.getElementById("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setBreakpointM(parseInt(sValue));
											}}),
										 new Input("I-breakpointL",{
											value: Element.getElementById("RGL").getBreakpointL(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = Element.getElementById("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setBreakpointL(parseInt(sValue));
											}}),
										 new Input("I-breakpointXL",{
											value: Element.getElementById("RGL").getBreakpointXL(),
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = Element.getElementById("RGL");
												var sValue = oEvent.getParameter("value");
												oLayout.setBreakpointXL(parseInt(sValue));
											}})]
					})
				]
			}),
			/** @deprecated */
			new FormContainer("C-RL",{
				title: "Layout parameter",
				visible: false,
				formElements: [
					new FormElement({
						label: "no properties",
						fields: [new Input({enabled: false,
											change: function(oEvent){
//												var oLayout = Element.getElementById("RL");
											}})]
					})
				]
			}),
			/** @deprecated */
			new FormContainer("C-GL",{
				title: "Layout parameter",
				visible: false,
				formElements: [
					new FormElement({
						label: "singleColumn",
						fields: [new CheckBox("CB-singleColumn", {selected: false,
											select: function(oEvent){
												var oLayout = Element.getElementById("GL");
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
												var oLayout = Element.getElementById("CL");
												var sValue = oEvent.getParameter("value");
												oLayout.setColumnsM(parseInt(sValue));
											}}),
										 new Input("I-columnsL-CL",{
											value: 2,
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = Element.getElementById("CL");
												var sValue = oEvent.getParameter("value");
												oLayout.setColumnsL(parseInt(sValue));
											}}),
										 new Input("I-columnsXL-CL",{
											value: 2,
											type: MLib.InputType.Number,
											change: function(oEvent){
												var oLayout = Element.getElementById("CL");
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
												var oLayout = Element.getElementById("CL");
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
												var oLayout = Element.getElementById("CL");
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