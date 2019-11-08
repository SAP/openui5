sap.ui.define([
	'jquery.sap.global', './Formatter', 'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/ui/core/message/Message'
], function(jQuery, Formatter, Controller, JSONModel, Message) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.TableDataState.Table", {

		onInit: function(evt) {
			this.oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.oTable = this.byId("table");
			this.oTable.setModel(this.oModel);
			this.oDataStatePlugin = this.byId("dataStatePlugin");
			this.oMessageManager = sap.ui.getCore().getMessageManager();
		},

		showRandomMessage: function() {
			var sTypes = Object.keys(sap.ui.core.ValueState);
			var sRandomType = sTypes[Math.floor(Math.random() * (sTypes.length - 1))];
			var sRandomText = Math.random().toString(36).substring(2);
			this.oDataStatePlugin.showMessage("Psst! This secret message is coming from the DataStateIndicator plugin: " + sRandomText, sRandomType);
		},

		onEnablePress: function(oEvent) {
			this.oDataStatePlugin.setEnabled(oEvent.getParameter("pressed"));
		},

		onCustomHandlingPress: function(oEvent) {
			this.bCustomHandling = oEvent.getParameter("pressed");
			if (this.bCustomHandling) {
				this.oDataStatePlugin.showMessage("");
			} else {
				this.byId("msgBtn").setVisible(false);
			}

			this.addTableMessage("Error");
		},

		onDataStateChange: function(oEvent) {
			if (!this.bCustomHandling) {
				return;
			}

			oEvent.preventDefault();

			var oDataState = oEvent.getParameter("dataState");
			var aMessages = oDataState.getMessages();
			var oMsgBtn = this.byId("msgBtn");
			if (aMessages.length) {
				oMsgBtn.setVisible(true).setText(aMessages.length);
				oMsgBtn.setIcon("sap-icon://message-" + aMessages[0].getType().toLowerCase());
			} else {
				oMsgBtn.setVisible(false);
			}
		},

		onFilterChange: function(oEvent) {
			this.sFilterValue = oEvent.getSource().getSelectedKey();
			this.addTableMessage("None");
		},

		dataStateFilter: function(oMessage) {
			if (!this.sFilterValue) {
				return true;
			}

			return oMessage.getType() == this.sFilterValue;
		},

		addTableMessage: function(sType) {
			var sBindingPath = this.oTable.getBinding("items").getPath();
			this.oMessageManager.addMessages(
				new Message({
					message: "Hold on! " + sType + " message came out for the table",
					target: sBindingPath,
					type: sType,
					processor: this.oModel
				})
			);
		},

		addInputMessage: function(sType) {
			var oBinding = this.oTable.getBinding("items");
			var sBindingPath = oBinding.getPath();
			var iItemsLength = this.oTable.getItems().length;
			var iRandomIndex = Math.floor(Math.random() * iItemsLength);
			this.oMessageManager.addMessages(
				new Message({
					message: sType + " message on Input at index " + (iRandomIndex + 1),
					target: sBindingPath + "/" + iRandomIndex + "/Name",
					fullTarget: sBindingPath + "/" + iRandomIndex + "/Name",
					type: sType,
					processor: this.oModel
				})
			);

			//  Hack to allow message propagation for easier testing
			var aMessages = this.oModel.getMessagesByPath(sBindingPath, true);
			var oDataState = oBinding.getDataState();
			oDataState.setModelMessages(aMessages);
			oBinding._fireDateStateChange(oDataState);
		},

		clearMessages: function() {
			this.oMessageManager.removeAllMessages();
		},

		onExit: function() {
			this.oModel.destroy();
		}

	});

	return TableController;

});