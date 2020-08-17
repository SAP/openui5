sap.ui.define([
	'sap/ui/core/Core',
	'sap/ui/core/library',
	'sap/ui/core/message/ControlMessageProcessor',
	'sap/ui/core/message/Message',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/Filter',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessagePopover',
	'sap/m/MessagePopoverItem',
	'sap/m/MessageBox'
], function(Core, coreLibrary, ControlMessageProcessor, Message, Controller, Filter, JSONModel, MessagePopover, MessagePopoverItem, MessageBox) {
	"use strict";

	var MessageType = coreLibrary.MessageType;

	return Controller.extend("sap.f.sample.SemanticPage.controller.SemanticPage", {
		onInit: function () {
			var oMessageProcessor = new ControlMessageProcessor(),
				oMessageManager = Core.getMessageManager();

			this.oModel = new JSONModel();
			this.oModel.loadData(sap.ui.require.toUrl("sap/f/sample/SemanticPage/model/model.json"), null, false);
			this.oSemanticPage = this.byId("mySemanticPage");
			this.oEditAction = this.byId("editAction");
			this.oSemanticPage.setModel(this.oModel);

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

		onEdit : function() {
			this.showFooter(true);
			this.oEditAction.setVisible(false);
		},

		onSave: function() {
			this.showFooter(false);
			this.oEditAction.setVisible(true);
			MessageBox.alert("Successfully saved!");
		},

		onCancel: function() {
			this.showFooter(false);
			this.oEditAction.setVisible(true);
		},

		showFooter: function(bShow) {
			this.oSemanticPage.setShowFooter(bShow);
		}
	});
});