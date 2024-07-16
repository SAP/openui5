sap.ui.define([
  "sap/m/Label",
  "sap/ui/layout/VerticalLayout",
  "sap/m/Button",
  "sap/m/Dialog",
  "sap/m/Link",
  "sap/ui/layout/form/Form",
  "sap/ui/layout/form/FormLayout",
  "sap/ui/layout/form/FormContainer",
  "sap/ui/layout/form/FormElement",
  "sap/m/CheckBox",
  "sap/m/Input",
  "sap/ui/core/VariantLayoutData",
  "sap/ui/layout/form/GridContainerData"
], function(
  Label,
  VerticalLayout,
  Button,
  Dialog,
  Link,
  Form,
  FormLayout,
  FormContainer,
  FormElement,
  CheckBox,
  Input,
  VariantLayoutData,
  GridContainerData
) {
  "use strict";
  // Note: the HTML page 'AccessKeys.html' loads this module via data-sap-ui-on-init

  const label = new Label({ text: "Random Label" });

  new VerticalLayout({
	  content: [
		  new Button({
			  text: "Replace Device",
			  press: function () {
				  new Dialog({
					  content: [
						  new Button({
							  text: "Demo button starting with D",
							  press: function () {
								  new Dialog({
									  content: [
										  new Button({
											  text: "Inner button"
										  }),
									  ]
								  }).open();
							  }
						  }),
						  new Button({
							  text: "Remove Device"
						  }),
						  new Button({
							  text: "Add Device"
						  }),
						  new Button({
							  text: "Replace Order"
						  }),
					  ]
				  }).open();
			  }
		  }),
		  new Button({
			  text: "Demo button starting with D"
		  }),
		  new Button({
			  text: "Remove Device"
		  }),
		  new Button({
			  text: "Add Device"
		  }),
		  new Button({
			  text: "Place Order"
		  }),
		  new Button({
			  text: "Run Tests"
		  }),
		  new Link({
			  text: "Close Page (not labeled)"
		  }),
		  label,
		  new Link({
			  text: "I AM LABELED LINK",
			  ariaLabelledBy: label
		  }),
		  new Form({
			  editable: true,
			  layout: new FormLayout("L1"),
			  formContainers: [

				  new FormContainer("C3", {
					  tooltip: "This container is expandable",
					  expandable: true,
					  formElements: [
						  new FormElement({
							  fields: [new CheckBox({ text: 'high school' })]
						  }),
						  new FormElement({
							  fields: [new CheckBox({ text: 'college' })]
						  }),
						  new FormElement({
							  fields: [new CheckBox({ text: 'university' })]
						  }),
						  new FormElement({
							  fields: [new Label({ text: "Order: ", labelFor: "input1" }), new Input("input1")]
						  })
					  ],
					  layoutData: new VariantLayoutData({
						  multipleLayoutData: [new GridContainerData({ halfGrid: true })]
					  })
				  }),
			  ]
		  })
	  ]
  }).placeAt("content");


  ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'].forEach(function(sLetter) {
	  new Button({
		  text: sLetter
	  }).placeAt("content");
  });
});