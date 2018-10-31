/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/MessageItem",
	"sap/m/MessagePopover",
	"sap/ui/core/mvc/Controller"
], function (MessageItem, MessagePopover, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Sticky.Main", {
		/**
		 * Listens to all changes in the message model, decides whether to open the message popover
		 * and updates <code>iMessages</code> within the UI model.
		 *
		 * @param {object} oEvent
		 *   The change event
		 *
		 */
		handleMessagesChange : function (oEvent) {
			var aMessageContexts = oEvent.getSource().getCurrentContexts();

			function worthy(aMessageContexts) {
				return aMessageContexts.some(function (oContext) {
					return oContext.getObject().technical === true;
				});
			}

			if (!this.messagePopover.isOpen() && worthy(aMessageContexts)) {
				this.messagePopover.openBy(this.byId("messagesButton"));
			}
			this.getView().getModel("ui").setProperty("/iMessages", aMessageContexts.length);
		},

		onDiscard : function (oEvent) {
			var oOperation = this.getView().getModel().bindContext("/DiscardChanges(...)"),
				that = this;

			oOperation.execute().then(function () {
				sap.m.MessageToast.show("Sticky session dicarded");
				that.toggleSticky();
				that.selectedContext.refresh();
				delete that.selectedContext;
			}, function (oError) {
				sap.m.MessageToast.show("Failed to discard sticky session " + oError);
			});
		},

		onInit : function () {
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

			this.messagePopover.setModel(sap.ui.getCore().getMessageManager().getMessageModel(),
				"messages");

			this.messagePopover.getBinding("items").attachChange(this.handleMessagesChange, this);
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

		onMessagePopoverPress: function (oEvent) {
			this.messagePopover.toggle(oEvent.getSource());
		},

		onPrepare : function (oEvent) {
			var oItem = this.byId("Sticky").getSelectedItem(),
				oOperation,
				that = this;

			if (!oItem) {
				sap.m.MessageToast.show("No item selected");
				return;
			}

			oOperation = this.getView().getModel().bindContext(
				"com.sap.gateway.srvd.zrc_rap_sticky.v0001.PrepareForEdit(...)",
				oItem.getBindingContext());

			oOperation.execute().then(function (oStickyContext) {
				sap.m.MessageToast.show("Sticky session opened");
				that.toggleSticky(oStickyContext);
				that.selectedContext = oItem.getBindingContext();
			}, function (oError) {
				sap.m.MessageToast.show("Failed to open sticky session: " + oError);
			});
		},

		onSave : function (oEvent) {
			var oOperation,
				that = this;

			oOperation = this.getView().getModel().bindContext(
				"com.sap.gateway.srvd.zrc_rap_sticky.v0001.SaveChanges(...)" ,
				this.byId("Sticky::details").getBindingContext());

			oOperation.execute().then(function () {
				sap.m.MessageToast.show("Changes saved, sticky session closed");
				that.toggleSticky();
				that.selectedContext.refresh();
				delete that.selectedContext;
			}, function (oError) {
				sap.m.MessageToast.show("Failed to close sticky session: " + oError);
			});
		},

		toggleSticky : function (oStickyContext) {
			this.getView().getModel("ui").setProperty("/bSticky", !!oStickyContext);
			this.byId("Sticky::details").setBindingContext(oStickyContext);
		}
	});
});