sap.ui.define([
	'sap/ui/core/library',
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/message/ControlMessageProcessor',
	'sap/ui/core/message/Message',
	'sap/ui/model/json/JSONModel',
	'sap/ui/Device',
	'sap/m/MessagePopover',
	'sap/m/MessagePopoverItem',
	'sap/m/MessageToast'
], function(coreLibrary, Controller, ControlMessageProcessor, Message, JSONModel, Device, MessagePopover, MessagePopoverItem, MessageToast) {
	"use strict";

	var MessageType = coreLibrary.MessageType;

	return Controller.extend("sap.f.sample.SemanticPageFreeStyle.controller.SemanticPageFreeStyle", {
		onInit: function () {
			this.oModel = new JSONModel();
			this.oModel.loadData(sap.ui.require.toUrl("sap/f/sample/SemanticPageFreeStyle/model/model.json"), null, false);
			this.oModel.setProperty("/notMobile", !Device.system.phone);
			this.oSemanticPage = this.byId("mySemanticPage");
			this.oSemanticPage.setModel(this.oModel);

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

		onSaveButtonPress: function(oEvent) {
			MessageToast.show("Pressed custom button " + oEvent.getSource().getId());
		},

		showFooter: function() {
			this.oSemanticPage.setShowFooter(!this.oSemanticPage.getShowFooter());
		}
	});
});