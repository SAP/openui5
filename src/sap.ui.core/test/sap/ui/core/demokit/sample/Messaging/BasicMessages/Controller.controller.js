sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/BindingMode",
	"sap/ui/model/json/JSONModel"
], function(coreLibrary, Messaging, Message, MessageType, Controller, BindingMode, JSONModel) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	const { ValueState } = coreLibrary;

	return Controller.extend("sap.ui.core.sample.Messaging.BasicMessages.Controller", {

		onInit() {
			const oView = this.getView();

			// set message model
			oView.setModel(Messaging.getMessageModel(), "message");

			// or just do it for the whole view
			Messaging.registerObject(oView, true);

			// create a default model with somde demo data
			const oModel = new JSONModel({
				MandatoryInputValue: "",
				DateValue: null,
				IntegerValue: undefined,
				Dummy: ""
			});
			oModel.setDefaultBindingMode(BindingMode.TwoWay);
			oView.setModel(oModel);
		},

		async onMessagePopoverPress(oEvent) {
			const oSourceControl = oEvent.getSource();
			const oMessagePopover = await this._getMessagePopover();
			oMessagePopover.openBy(oSourceControl);
		},

		onSuccessPress() {
			const oMessage = new Message({
				message: "My generated success message",
				type: MessageType.Success,
				target: "/Dummy",
				processor: this.getView().getModel()
			});
			Messaging.addMessages(oMessage);
		},

		onErrorPress() {
			const oMessage = new Message({
				message: "My generated error message",
				type: MessageType.Error,
				target: "/Dummy",
				processor: this.getView().getModel()
			});
			Messaging.addMessages(oMessage);
		},

		onWarningPress() {
			const oMessage = new Message({
				message: "My generated warning message",
				type: MessageType.Warning,
				target: "/Dummy",
				processor: this.getView().getModel()
			});
			Messaging.addMessages(oMessage);
		},

		onInfoPress() {
			const oMessage = new Message({
				message: "My generated info message",
				type: MessageType.Information,
				target: "/Dummy",
				processor: this.getView().getModel()
			});
			Messaging.addMessages(oMessage);
		},

		onValueStatePress() {
			const oInput = this.getView().byId("valuesStateOnly");
			oInput.setValueState(ValueState.Error);
			oInput.setValueStateText("My ValueState text for Error");
		},

		onClearPress() {
			// does not remove the manually set ValueStateText we set in onValueStatePress():
			Messaging.removeAllMessages();
		},

		//################ Private APIs ###################

		_getMessagePopover() {
			return this.loadFragment({
				name: "sap.ui.core.sample.Messaging.BasicMessages.MessagePopover"
			});
		}
	});

});
