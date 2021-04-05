sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/message/Message",
	"sap/ui/core/Fragment"
], function(Controller, Message, Fragment) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.ResponsiveTable.Controller", {

		onInit: function() {
			this.oDataStatePlugin = this.byId("dataStatePlugin");
			this.oMessageManager = sap.ui.getCore().getMessageManager();
			this.oMessageManager.registerObject(this.getView(), true);
			this.getView().setModel(this.oMessageManager.getMessageModel(), "message");
			this.getView().bindElement("/ProductList");
		},

		onMessagePopoverPress : function (oEvent) {
			var oSourceControl = oEvent.getSource();
			this._getMessagePopover().then(function(oMessagePopover){
				oMessagePopover.openBy(oSourceControl);
			});
		},

		onPluginEnablePress: function(oEvent) {
			this.oDataStatePlugin.setEnabled(oEvent.getParameter("pressed"));
		},

		onPluginFilterChange: function(oEvent) {
			this.sFilterValue = oEvent.getSource().getSelectedKey();
			this.oDataStatePlugin.refresh();
		},

		dataStateFilter: function(oMessage) {
			if (!this.sFilterValue) {
				return true;
			}

			return oMessage.getType() == this.sFilterValue;
		},

		clearMessages: function() {
			this.oMessageManager.removeAllMessages();
		},

		showRandomMessage: function() {
			var sTypes = Object.keys(sap.ui.core.ValueState);
			var sRandomType = sTypes[Math.floor(Math.random() * (sTypes.length - 1))];
			var sRandomText = Math.random().toString(36).substring(2);
			this.oDataStatePlugin.showMessage("Psst! This secret message is coming from the DataStateIndicator plugin: " + sRandomText, sRandomType);
		},

		addTableMessage: function(sType) {
			var sTableBindingPath = "/ProductList";
			this.oMessageManager.addMessages(
				new Message({
					message: "Hold on! " + sType + " message came out for the table.",
					fullTarget: sTableBindingPath,
					target: sTableBindingPath,
					type: sType,
					processor: this.getView().getModel()
				})
			);
		},

		//################ Private APIs ###################

		_getMessagePopover : function () {
			var oView = this.getView();

			// create popover lazily (singleton)
			if (!this._pMessagePopover) {
				this._pMessagePopover = Fragment.load({
					id: oView.getId(),
					name: "sap.ui.mdc.sample.ResponsiveTable.MessagePopover"
				}).then(function (oMessagePopover) {
					oView.addDependent(oMessagePopover);
					return oMessagePopover;
				});
			}
			return this._pMessagePopover;
		}

	});
}, true);
