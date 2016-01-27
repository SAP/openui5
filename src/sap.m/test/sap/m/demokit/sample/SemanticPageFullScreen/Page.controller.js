sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessagePopover',
		'sap/m/MessagePopoverItem'
	], function(jQuery, Controller, JSONModel, MessagePopover, MessagePopoverItem) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.SemanticPageFullScreen.Page", {

	onInit: function () {
		var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);

		this._initMessageDisplay();
	},
	onPress: function (oEvent) {

		sap.m.MessageToast.show("Pressed custom button " + oEvent.getSource().getId());
	},
	onSemanticButtonPress: function (oEvent) {

		var sAction = oEvent.getSource().getMetadata().getName();
		sAction = sAction.replace(oEvent.getSource().getMetadata().getLibraryName() + ".", "");

		sap.m.MessageToast.show("Pressed: " + sAction);
	},
	onNavButtonPress: function () {
		sap.m.MessageToast.show("Pressed navigation button");
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
	},
	_initMessageDisplay: function (oEvent) {

		var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor(),
			oMessageManager = sap.ui.getCore().getMessageManager();

		oMessageManager.registerMessageProcessor(oMessageProcessor);

		// adding some test message
		oMessageManager.addMessages(
			new sap.ui.core.message.Message({
				message: "Something wrong happened",
				type: sap.ui.core.MessageType.Error,
				processor: oMessageProcessor
			})
		);

		var messagesActionBtn = this.getView().byId("messagesActionBtn"); /* the semantic
		 messagesAction button provides out of the box styling and positioning in accord with
		 the design quidelines for Fiori applications */

		/* the application needs to set the 'count' property of the button
		 (for the current count of messages in the application)
		 and also (by design recommendation) the 'visible' property of the messagesActionBtn
		 (to make the button visible only if there are messages to notify the user for) */
		messagesActionBtn.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");

		/* bind the count of the semantic messagesAction button to the current count of displayable messages */
		var fnCountFormatter = function (aMessages) {
			return aMessages.length;
		};
		messagesActionBtn.bindProperty("count", "message>/", fnCountFormatter);

		/* bind the visibility of the semantic messagesAction button to the current count of messages
		 so that the button is displayed only if there are messages to notify the user for */
		var fnVisibilityFormatter = function (aMessages) {
			return aMessages && aMessages.length > 0;
		};
		messagesActionBtn.bindProperty("visible", "message>/", fnVisibilityFormatter);
	}
});


	return PageController;

});
