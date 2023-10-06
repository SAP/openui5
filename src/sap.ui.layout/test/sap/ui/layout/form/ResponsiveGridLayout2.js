sap.ui.require([
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/SemanticFormElement",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/m/Label",
	"sap/m/Text"
	],
	function(
		Form,
		FormContainer,
		FormElement,
		SemanticFormElement,
		ResponsiveGridLayout,
		Label,
		Text
		) {
	"use strict";

	var oLayout1 = new ResponsiveGridLayout("L1");

	var oForm1 = new Form("F1",{
		title: "Form using ResponsiveGridLayout",
		editable: false,
		layout: oLayout1,
		formContainers: [
			new FormContainer("C1",{
				title: "Adress",
				expandable: true,
				formElements: [
					new FormElement({
						label: "ID",
						fields: [new Text({text: "SAP SE"})]
					}),
					new SemanticFormElement({
						label: "Street / Number",
						fields: [new Text({text: "Dietmar-Hopp-Allee"}), new Text({text: "16"})]
					}),
					new SemanticFormElement({
						label: new Label({text: "Post code / City"}),
						fields: [new Text({text: "69190"}), new Text({text: "Walldorf"})]
					}),
					new FormElement({
						label: "Country",
						fields: [new Text({text: "Germany"})]
					})]
				}),
			new FormContainer("C2",{
				title: "Contact",
				expandable: true,
				formElements: [
					new FormElement({
						label: "Phone",
						fields: [new Text({text:"0123456789"})]
					}),
					new FormElement({
						label: "Mail",
						fields: [new Text({text:"info@sap.com"})]
					}),
					new FormElement({
						label: "Web",
						fields: [new Text({text:"http://www.sap.com"})]
					})
				]
			})
		]
	});
	oForm1.placeAt("content");

	sap.ui.getCore().byId("C1").setExpandable(true); // to check button is not created twice

});