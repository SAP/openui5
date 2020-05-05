sap.ui.define([
		'sap/ui/core/message/ControlMessageProcessor',
		'sap/ui/core/message/Message',
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/library',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessagePopover',
		'sap/m/MessagePopoverItem',
		'sap/m/MessageToast'
	], function(ControlMessageProcessor, Message, Controller, coreLibrary, JSONModel, MessagePopover, MessagePopoverItem, MessageToast) {
	"use strict";

	var MessageType = coreLibrary.MessageType;

	var PageController = Controller.extend("sap.m.sample.SemanticPageFullScreen.Page", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);


			var oMessageProcessor = new ControlMessageProcessor();
			var oMessageManager = sap.ui.getCore().getMessageManager();

			oMessageManager.registerMessageProcessor(oMessageProcessor);

			oMessageManager.addMessages(
					new Message({
						message: "Something wrong happened",
						type: MessageType.Error,
						processor: oMessageProcessor
					})
			);
		},
		onPress: function (oEvent) {

			MessageToast.show("Pressed custom button " + oEvent.getSource().getId());
		},
		onSemanticButtonPress: function (oEvent) {

			var sAction = oEvent.getSource().getMetadata().getName();
			sAction = sAction.replace(oEvent.getSource().getMetadata().getLibraryName() + ".", "");

			MessageToast.show("Pressed: " + sAction);
		},
		onNavButtonPress: function () {
			MessageToast.show("Pressed navigation button");
		},
		onMessagesButtonPress: function(oEvent) {

			var oMessagesButton = oEvent.getSource();
			if (!this._messagePopover) {
				this._messagePopover = new MessagePopover({
					items: {
						path: "message>/",
						template: new MessagePopoverItem({
							description: "{message>description}",
							type: "{message>type}",
							title: "{message>message}"
						})
					}
				});
				oMessagesButton.addDependent(this._messagePopover);
			}
			this._messagePopover.toggle(oMessagesButton);
		}
	});


	return PageController;

});