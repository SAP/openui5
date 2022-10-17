sap.ui.define([
	"sap/m/DatePicker",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/RadioButton",
	"sap/m/RadioButtonGroup",
	"sap/m/Select",
	"sap/m/Text",
	"sap/ui/core/Item",
	"sap/ui/core/Title",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/layout/GridData"
], function(DatePicker, Input, Label, RadioButton, RadioButtonGroup, Select, Text, Item, Title, Form, FormContainer, FormElement, ResponsiveGridLayout, GridData) {
	"use strict";

	new Form("F1",{
		title: new Title({text: "Customer data"}),
		editable: true,
		layout: new ResponsiveGridLayout("L1"),
		formContainers: [
			new FormContainer("C1",{
				title: "contact data",
				formElements: [
					new FormElement({
						label: "Name",
						fields: [new Input({value: "Mustermann"})]
					}),
					new FormElement({
						label: "First name",
						fields: [new Input({value: "Max"})]
					}),
					new FormElement({
						label: "Date of birth",
						fields: [new DatePicker()]
					}),
					new FormElement({
						label: "Gender",
						fields: [new RadioButtonGroup({
							columns: 2,
							buttons: [
								new RadioButton({text: "male", selected: true}),
								new RadioButton({text: "female", selected: false})
								]
							})]
					}),
					new FormElement({
						label: "Info",
						fields: [new Text({text:"additional information"})]
					})
					]
			}),
			new FormContainer("C2",{
				title: new Title({text: "Address"}),
				formElements: [
					new FormElement({
						label: new Label({text:"Street / Housenumber"}),
						fields: [new Input({placeholder: "Street"}),
						         new Input({placeholder: "Number", layoutData: new GridData({span: "L2 M2 S2"})
						         })]
					}),
					new FormElement({
						label: "City",
						fields: [new Input()]
					}),
					new FormElement({
						label: new Label({text: "Post code"}),
						fields: [new Input({layoutData: new GridData({span: "L2 M2 S2"})})]
					}),
					new FormElement({
						label: "Country",
						fields: [new Select({
							items: [new Item({text: "Germany"}),
							        new Item({text: "USA"}),
							        new Item({text: "England"})]
						})]
					})
				]
			})]
	}).placeAt("content1");

	new Form("F2",{
		title: new Title({text: "Employee"}),
		editable: false,
		layout: new ResponsiveGridLayout("L2"),
		formContainers: [
			new FormContainer({
				title: "contact data",
				formElements: [
					new FormElement({
						label: "Name",
						fields: [new Text({text: "Mustermann"})]
					}),
					new FormElement({
						label: "First name",
						fields: [new Text({text: "Max"})]
					}),
					new FormElement({
						label: "Info",
						fields: [new Text({text:"additional information"})]
					})
					]
			}),
			new FormContainer({
				title: new Title({text: "Address"}),
				formElements: [
					new FormElement({
						label: new Label({text:"Street / Housenumber"}),
						fields: [new Text({text: "Main street"}),
						         new Text({text: "1", layoutData: new GridData({span: "L2 M2 S2"})
						         })]
					}),
					new FormElement({
						label: "City",
						fields: [new Text({text: "Main city"})]
					}),
					new FormElement({
						label: new Label({text: "Post code"}),
						fields: [new Text({text: "12345", layoutData: new GridData({span: "L2 M2 S2"})})]
					})
				]
			})]
	}).placeAt("content2");
});
