/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/m/Button', 'sap/m/DateTimeInput', 'sap/m/Input', 'sap/m/Label', 'sap/m/RadioButton', 'sap/m/Select', 'sap/ui/core/Item', 'sap/ui/core/Title', 'sap/ui/core/UIComponent', 'sap/ui/core/message/Message', 'sap/ui/layout/GridData', 'sap/ui/layout/form/Form', 'sap/ui/layout/form/FormContainer', 'sap/ui/layout/form/FormElement', 'sap/ui/layout/form/ResponsiveGridLayout', 'sap/ui/model/type/Date', 'sap/ui/model/type/Integer', 'sap/ui/model/type/String'],
	function(jQuery, Button, DateTimeInput, Input, Label, RadioButton, Select, Item, Title, UIComponent, Message, GridData, Form, FormContainer, FormElement, ResponsiveGridLayout, TypeDate, Integer, TypeString) {
	"use strict";


	// new Component
	var Component = UIComponent.extend("message.Component", {

		metadata : {
			version : "1.0",
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
		var oZip = new TypeString(null,{maxLength: 5});
		var oStreet = new Integer();
		// UI
		var oLayout = new ResponsiveGridLayout();
		var oForm = new Form({
			models: oModel,
			objectBindings:{path: "/form"},
			//title: new sap.ui.core.Title({text: "Form Title", tooltip: "Title tooltip"}),
			tooltip: "Form tooltip",
			editable: true,
			layout: oLayout,
			formContainers: [
				new FormContainer({
					title: "Component: Contact Data - validation undefined",
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
									value: {path: "streetnr", type: oStreet},
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
									value: {path: "zip", type: oZip},
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

		var oButton1 = new Button({
			text: "add Warning",
			press: function() {
				sap.ui.getCore().getMessageManager().addMessages(
					new Message({
						message: "Invalid order of characters in this name!",
						type: sap.ui.core.MessageType.Warning,
						target: "/form/name",
						processor: oModel
					})
				)
			}
		});
		var oButton2 = new Button({
			text: "add Info",
			press: function() {
				sap.ui.getCore().getMessageManager().addMessages(
					new Message({
						message: "Nice last name!",
						type: sap.ui.core.MessageType.Information,
						processor: oModel
					})
				)
			}
		});
		var oButton3 = new Button({
			text: "add Success",
			press: function() {
				sap.ui.getCore().getMessageManager().addMessages(
					new Message({
						message: "City sucessfully updated",
						type: sap.ui.core.MessageType.Success,
						target: "/form/city",
						processor: oModel
					})
				)
			}
		});
		var oButton5 = new Button({
			text: "add Success for ZIP",
			press: function() {
				sap.ui.getCore().getMessageManager().addMessages(
					new Message({
						message: "de Zip is gut!",
						type: sap.ui.core.MessageType.Success,
						target: "/form/zip",
						processor: oModel
					})
				)
			}
		});
	
		var oButton4 = new Button({
			text: "clear Messages",
			press: function() {
				sap.ui.getCore().getMessageManager().removeAllMessages();
			}
		});

		return oForm;
	};


	return Component;

});
