/*!
 * ${copyright}
 */

jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.declare("components.Component");

// new Component
sap.ui.core.UIComponent.extend("components.Component", {

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
components.Component.prototype.createContent = function(){
	oDate = new sap.ui.model.type.Date();
	oString = new sap.ui.model.type.String(null,{maxLength: 5});
	oInteger = new sap.ui.model.type.Integer();
	// UI
	var oModel = new sap.ui.model.json.JSONModel();
	var oData = {
		form: {
			firstname: "Fritz",
			lastname: "Heiner",
			street: "im",
			nr: 1,
			zip: "12345"
		}
	}
	oModel.setData(oData);
	var oLayout = new sap.ui.layout.form.ResponsiveGridLayout();
	var oForm = new sap.ui.layout.form.Form({
		models: oModel,
		objectBindings:{path: "/form"},
		//title: new sap.ui.core.Title({text: "Form Title", tooltip: "Title tooltip"}),
		tooltip: "Form tooltip",
		editable: true,
		layout: oLayout,
		formContainers: [
			new sap.ui.layout.form.FormContainer({
				title: "Component: Contact Data - validation undefined",
				formElements: [
					new sap.ui.layout.form.FormElement({
						label: "Name",
						fields: [
							new sap.m.Input({value: "{surname}"})
						]
					}),
					new sap.ui.layout.form.FormElement({
						label: "First name",
						fields: [
							new sap.m.Input({value: "{name}"})
						]
					}),
					new sap.ui.layout.form.FormElement({
						label: "Date of birth",
						fields: [
							new sap.m.DateTimeInput({value: {path:"birthdate", type: oDate}})
						]
					}),
					new sap.ui.layout.form.FormElement({
						label: "Gender",
						fields: [
							new sap.m.RadioButton({text: "male", selected: true, groupName: "MyTest"}),
						    new sap.m.RadioButton({text: "female", selected: false, groupName: "MyTest"})
						]
					})
				]
			}),
			new sap.ui.layout.form.FormContainer({
				title: new sap.ui.core.Title({text: "Address", tooltip: "Title tooltip"}),
				formElements: [
					new sap.ui.layout.form.FormElement({
						label: new sap.m.Label({text:"Street"}),
						fields: [
							new sap.m.Input({value: "{street}"}),
							new sap.m.Input({
								id:"nr",
								value: {path: "nr", type: oInteger},
								layoutData: new sap.ui.layout.GridData({span: "L2 M2 S2"})
							})
						]
					}),
					new sap.ui.layout.form.FormElement({
						label: "City",
						fields: [
							new sap.m.Input({value: "{city}"})
						]
					}),
					new sap.ui.layout.form.FormElement({
						label: new sap.m.Label({text: "Post code"}),
						fields: [
							new sap.m.Input({
								id:"zip",
								value: {path: "zip", type: oString},
								layoutData: new sap.ui.layout.GridData({span: "L2 M2 S2"})
							})
						]
					}),
					new sap.ui.layout.form.FormElement({
						label: "Country",
						fields: [
							new sap.m.Select({
								selectedKey: "{country}",
								items: [
									new sap.ui.core.Item({key: "DE", text: "Germany"}),
							        new sap.ui.core.Item({key: "US", text: "USA"}),
							        new sap.ui.core.Item({key: "UK", text: "England"})
								]
							})
						]
					})
				]
			})
		]
	});

	var oButton1 = new sap.m.Button({
		text: "add Warning",
		press: function() {
			sap.ui.getCore().getMessageManager().addMessages(
				new sap.ui.core.message.Message({
					message: "Invalid order of characters in this name!",
					type: sap.ui.core.MessageType.Warning,
					target: "/form/name",
					processor: oModel
				})
			)
		}
	});
	var oButton2 = new sap.m.Button({
		text: "add Info",
		press: function() {
			sap.ui.getCore().getMessageManager().addMessages(
				new sap.ui.core.message.Message({
					message: "Nice last name!",
					type: sap.ui.core.MessageType.Information,
					processor: oModel
				})
			)
		}
	});
	var oButton3 = new sap.m.Button({
		text: "add Success",
		press: function() {
			sap.ui.getCore().getMessageManager().addMessages(
				new sap.ui.core.message.Message({
					message: "City sucessfully updated",
					type: sap.ui.core.MessageType.Success,
					target: "/form/city",
					processor: oModel
				})
			)
		}
	});
	var oButton5 = new sap.m.Button({
		text: "add Success for ZIP",
		press: function() {
			sap.ui.getCore().getMessageManager().addMessages(
				new sap.ui.core.message.Message({
					message: "de Zip is gut!",
					type: sap.ui.core.MessageType.Success,
					target: "/form/zip",
					processor: oModel
				})
			)
		}
	});
	
	var oButton4 = new sap.m.Button({
		text: "clear Messages",
		press: function() {
			sap.ui.getCore().getMessageManager().removeAllMessages();
		}
	});

	return oForm;
};
