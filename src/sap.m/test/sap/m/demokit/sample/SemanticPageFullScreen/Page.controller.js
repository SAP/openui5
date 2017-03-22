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


		var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
		var oMessageManager = sap.ui.getCore().getMessageManager();

		oMessageManager.registerMessageProcessor(oMessageProcessor);

		oMessageManager.addMessages(
				new sap.ui.core.message.Message({
					message: "Something wrong happened",
					type: sap.ui.core.MessageType.Error,
					processor: oMessageProcessor
				})
		);
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
	}
});


	return PageController;

});
