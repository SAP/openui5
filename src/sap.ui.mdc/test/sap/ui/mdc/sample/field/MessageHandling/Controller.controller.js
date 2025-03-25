sap.ui.define([
	"./localService/mockserver",
	"sap/ui/core/Element",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel"
], function(
	mockserver,
	Element,
	Messaging,
	Message,
	MessageType,
	Controller,
	ODataModel,
	JSONModel
) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.field.MessageHandling.Controller", {

		onInit() {
			// set message model
			this.getView().setModel(Messaging.getMessageModel(), "message");

			// activate automatic message generation for complete view
			Messaging.registerObject(this.getView(), true);

			const sODataServiceUrl = "/here/goes/your/odata/service/url/";

			// init our mock server
			mockserver.init(sODataServiceUrl);

			// data service
			this.getView().setModel(
				new ODataModel(sODataServiceUrl, {
					defaultBindingMode : "TwoWay"
				})
			);

			this.getView().bindElement("/Employees(1)");

			var oViewModel = new JSONModel({
				ODataUnitCodeList: {
					"D" : {Text : "Days", UnitSpecificScale : 2},
					"H" : {Text : "Hours", UnitSpecificScale : 2}
				}
			});
			this.getView().setModel(oViewModel, "view");

		},

		async onMessagePopoverPress(oEvent) {
			const oSourceControl = oEvent.getSource();
			const oMessagePopover = await this._getMessagePopover();
			oMessagePopover.openBy(oSourceControl);
		},

		onDelete() {
			const sPath = this.getView().getBindingContext().getPath();
			this.getView().getModel().remove(sPath);
		},

		onClearPress() {
			Messaging.removeAllMessages();
		},

		addMessage(oEvent) {
			const oButton = oEvent.getSource();
			let sId = oButton.getId();

			sId = sId.slice(0, sId.indexOf("-AddMessage"));
			const oField = Element.getElementById(sId);
			let oBinding;


			if (oField.isA("sap.ui.mdc.Field")) {
				oBinding = oField.getBinding("value");
				if (oBinding.isA("sap.ui.model.CompositeBinding")) {
					oBinding = oBinding.getBindings()[0];
				}
			} else if (oField.isA("sap.ui.mdc.MultiValueField")) {
				oBinding = oField.getBinding("items");
			}

			const sPath = oBinding?.getResolvedPath();
			const oMessage = new Message({
				message: "My error message",
				type: MessageType.Error,
				target: sPath,
				fullTarget: sPath,
				processor: this.getView().getModel()
			});
			Messaging.addMessages(oMessage);
		},

		handleMessagePress(oEvent) {
			const oItem = oEvent.getParameter("item");
			const oMessage = oItem.getBinding("title")?.getContext()?.getObject(); // title is bound to message
			const aControlIds = oMessage?.getControlIds();
			if (aControlIds?.[0]) {
				const oControl = Element.getElementById(aControlIds[0]);
				oControl.focus();
			}
		},

		//################ Private APIs ###################

		_getMessagePopover() {
			return this.loadFragment({
				name: "sap.ui.mdc.sample.field.MessageHandling.MessagePopover"
			});
		}

	});

});
