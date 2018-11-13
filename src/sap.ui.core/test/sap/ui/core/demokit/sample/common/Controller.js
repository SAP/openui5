/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/MessageItem",
	"sap/m/MessagePopover",
	"sap/ui/core/mvc/Controller"
], function (MessageItem, MessagePopover, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.common.Controller", {
		/**
		 * Creates a new sap.m.MessagePopover within the controller which is bound to the global
		 * sap.ui.model.message.MessageModel. The MessagePopover listens to MessageModel changes
		 * and will be automatically opened for new error messages.
		 *
		 * @param {string} sOpenButtonId
		 *   The ID of the Button where the MessagePopover has to be opened
		 *
		 */
		initMessagePopover : function (sOpenButtonId) {
			this.messagePopover = new MessagePopover({
				items : {
					path :"messages>/",
					template : new MessageItem({
						description : "{messages>description}",
						longtextUrl : "{messages>descriptionUrl}",
						title : "{messages>message}",
						type : "{messages>type}"})
				}
			});
			this.messagePopoverButtonId = sOpenButtonId;

			/*
			 * Listens to all changes in the message model, decides whether to open the message
			 * popover and updates <code>iMessages</code> within the UI model.
			 *
			 * @param {object} oEvent
			 *   The change event
			 *
			 */
			function handleMessagesChange(oEvent) {
				var aMessageContexts = oEvent.getSource().getCurrentContexts(),
					oView = this.getView();

				function isWorthy(aMessageContexts) {
					return aMessageContexts.some(function (oContext) {
						return oContext.getObject().technical === true;
					});
				}

				if (!this.messagePopover.isOpen() && isWorthy(aMessageContexts)) {
					this.messagePopover.openBy(this.byId(this.messagePopoverButtonId));
				}
				if (oView.getModel("ui")
					&& oView.getModel("ui").getProperty("/iMessages") !== undefined) {
					oView.getModel("ui").setProperty("/iMessages", aMessageContexts.length);
				}
			}

			this.messagePopover.setModel(sap.ui.getCore().getMessageManager().getMessageModel(),
				"messages");
			this.messagePopover.getBinding("items").attachChange(handleMessagesChange, this);
			this.messagePopover.attachAfterClose(function (oEvent) {
				var oMessageManager = sap.ui.getCore().getMessageManager(),
					aMessages;

				// remove all bound messages which have to be handled by the application
				aMessages = oMessageManager.getMessageModel().getData().filter(function (oMessage) {
					return oMessage.persistent;
				});
				oMessageManager.removeMessages(aMessages);
			});
		},

		/**
		 * Destroys the MessagePopover when the controller is destroyed.
		 */
		onExit : function () {
			this.messagePopover.destroy();
		},

		/**
		 * Opens or closes the MessagePopover on demand if it was initializied via
		 * initMessagePopover.
		 */
		onToggleMessagePopover: function () {
			this.messagePopover.toggle(this.byId(this.messagePopoverButtonId));
		}
	});

});