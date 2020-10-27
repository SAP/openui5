sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/ui/core/message/Message",
	"sap/ui/core/library",
	"sap/ui/core/Fragment"
], function(Controller, JSONModel, BindingMode, Message, library, Fragment) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = library.ValueState;

	// shortcut for sap.ui.core.MessageType
	var MessageType = library.MessageType;

	return Controller.extend("sap.ui.core.sample.MessageManager.BasicMessages.Controller", {

		onInit : function () {
			var oMessageManager, oModel, oView;

			oView = this.getView();

			// set message model
			oMessageManager = sap.ui.getCore().getMessageManager();
			oView.setModel(oMessageManager.getMessageModel(), "message");

			// or just do it for the whole view
			oMessageManager.registerObject(oView, true);

			// create a default model with somde demo data
			oModel = new JSONModel({
				MandatoryInputValue: "",
				DateValue: null,
				IntegerValue: undefined,
				Dummy: ""
			});
			oModel.setDefaultBindingMode(BindingMode.TwoWay);
			oView.setModel(oModel);

		},

		onMessagePopoverPress : function (oEvent) {
			var oSourceControl = oEvent.getSource();
			this._getMessagePopover().then(function(oMessagePopover){
				oMessagePopover.openBy(oSourceControl);
			});
		},

		onSuccessPress : function(){
			var oMessage = new Message({
				message: "My generated success message",
				type: MessageType.Success,
				target: "/Dummy",
				processor: this.getView().getModel()
			});
			sap.ui.getCore().getMessageManager().addMessages(oMessage);
		},

		onErrorPress : function(){
			var oMessage = new Message({
				message: "My generated error message",
				type: MessageType.Error,
				target: "/Dummy",
				processor: this.getView().getModel()
			});
			sap.ui.getCore().getMessageManager().addMessages(oMessage);
		},

		onWarningPress : function(){
			var oMessage = new Message({
				message: "My generated warning message",
				type: MessageType.Warning,
				target: "/Dummy",
				processor: this.getView().getModel()
			});
			sap.ui.getCore().getMessageManager().addMessages(oMessage);
		},

		onInfoPress : function(){
			var oMessage = new Message({
				message: "My generated info message",
				type: MessageType.Information,
				target: "/Dummy",
				processor: this.getView().getModel()
			});
			sap.ui.getCore().getMessageManager().addMessages(oMessage);
		},

		onValueStatePress : function(){
			var oInput = this.getView().byId("valuesStateOnly");
			oInput.setValueState(ValueState.Error);
			oInput.setValueStateText("My ValueState text for Error");
		},

		onClearPress : function(){
			// does not remove the manually set ValueStateText we set in onValueStatePress():
			sap.ui.getCore().getMessageManager().removeAllMessages();
		},

		//################ Private APIs ###################

		_getMessagePopover: function () {
			var oView = this.getView();

			// create popover lazily (singleton)
			if (!this._pMessagePopover) {
				this._pMessagePopover = Fragment.load({
					id: oView.getId(),
					name: "sap.ui.core.sample.MessageManager.BasicMessages.MessagePopover"
				}).then(function (oMessagePopover) {
					oView.addDependent(oMessagePopover);
					return oMessagePopover;
				});
			}
			return this._pMessagePopover;
		}
	});

});
