/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/m/Button', 'sap/m/DateTimeInput', 'sap/m/Input', 'sap/m/Label', 'sap/m/RadioButton', 'sap/m/Select', 'sap/ui/core/Item', 'sap/ui/core/Title', 'sap/ui/core/UIComponent', 'sap/ui/core/message/Message', 'sap/ui/layout/GridData', 'sap/ui/layout/form/Form', 'sap/ui/layout/form/FormContainer', 'sap/ui/layout/form/FormElement', 'sap/ui/layout/form/ResponsiveGridLayout', 'sap/ui/model/json/JSONModel', 'sap/ui/model/type/Date', 'sap/ui/model/type/Integer', 'sap/ui/model/type/String'],
	function(jQuery, Button, DateTimeInput, Input, Label, RadioButton, Select, Item, Title, UIComponent, Message, GridData, Form, FormContainer, FormElement, ResponsiveGridLayout, JSONModel, TypeDate, Integer, TypeString) {
	"use strict";


	// new Component
	var Component = UIComponent.extend("components.disabled.Component", {

		metadata : {
			version : "1.0",
			handleValidation : false,
			dependencies : {
				version : "1.8",
				libs : [ "sap.ui.core" ]
			},
			properties:{
				//i18nBundle: {name: "geti18nBundle", type: "string", defaultValue: "samples.components.orders.i18n.messagebundle"},
				//model: { name: "model", type: "Object", defaultValue: null}
			}
		}
	});

	// create the component content, set the models
	Component.prototype.createContent = function(){
		var oDate = new TypeDate();
		var oString = new TypeString(null,{maxLength: 5});
		var oInteger = new Integer();
		// UI
		var oModel = new JSONModel();
		var oData = {
			form: {
				firstname: "Fritz",
				lastname: "Heiner",
				street: "im",
				nr: 1,
				zip: "12345"
			}
		};
		oModel.setData(oData);

		var oLayout = new ResponsiveGridLayout();
		var oForm = new Form({
			models: oModel,
			objectBindings:{path: "/form"},
			//title: new Title({text: "Form Title", tooltip: "Title tooltip"}),
			tooltip: "Form tooltip",
			editable: true,
			layout: oLayout,
			formContainers: [
				new FormContainer({
					title: "Component: Contact Data - validation disabled",
					formElements: [
						new FormElement({
							label: "Name",
							fields: [
								new Input({value: "{surname}"})
							]
						}),
						new FormElement({
							label: "First name",
							fields: [
								new Input({value: "{name}"})
							]
						}),
						new FormElement({
							label: "Date of birth",
							fields: [
								new DateTimeInput({value: {path:"birthdate", type: oDate}})
							]
						}),
						new FormElement({
							label: "Gender",
							fields: [
								new RadioButton({text: "male", selected: true, groupName: "MyTest"}),
							    new RadioButton({text: "female", selected: false, groupName: "MyTest"})
							]
						})
					]
				}),
				new FormContainer({
					title: new Title({text: "Address", tooltip: "Title tooltip"}),
					formElements: [
						new FormElement({
							label: new Label({text:"Street"}),
							fields: [
								new Input({value: "{street}"}),
								new Input({
									id:"nr_disabled",
									value: {path: "nr", type: oInteger},
									layoutData: new GridData({span: "L2 M2 S2"})
								})
							]
						}),
						new FormElement({
							label: "City",
							fields: [
								new Input({value: "{city}"})
							]
						}),
						new FormElement({
							label: new Label({text: "Post code"}),
							fields: [
								new Input({
									id:"zip_disabled",
									value: {path: "zip", type: oString},
									layoutData: new GridData({span: "L2 M2 S2"})
								})
							]
						}),
						new FormElement({
							label: "Country",
							fields: [
								new Select({
									selectedKey: "{country}",
									items: [
										new Item({key: "DE", text: "Germany"}),
								        new Item({key: "US", text: "USA"}),
								        new Item({key: "UK", text: "England"})
									]
								})
							]
						})
					]
				})
			]
		});

		return oForm;
	};


	return Component;

});
