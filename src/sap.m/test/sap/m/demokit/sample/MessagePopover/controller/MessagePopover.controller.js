sap.ui.define([
	'sap/m/MessagePopover',
	'sap/m/MessageItem',
	'sap/m/MessageToast',
	'sap/m/Link',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(MessagePopover, MessageItem, MessageToast, Link, Controller, JSONModel) {
	"use strict";

	var oMessagePopover;

	return Controller.extend("sap.m.sample.MessagePopover.controller.MessagePopover", {
		onInit: function () {
			// create any data and a model and set it to the view

			var oLink = new Link({
				text: "Show more information",
				href: "http://sap.com",
				target: "_blank"
			});

			var oMessageTemplate = new MessageItem({
				type: '{type}',
				title: '{title}',
				activeTitle: "{active}",
				description: '{description}',
				subtitle: '{subtitle}',
				counter: '{counter}',
				link: oLink
			});

			var sErrorDescription = 'First Error message description. \n' +
				'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod' +
				'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,' +
				'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo' +
				'consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse' +
				'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non' +
				'proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

			oMessagePopover = new MessagePopover({
				items: {
					path: '/',
					template: oMessageTemplate
				},
				activeTitlePress: function () {
					MessageToast.show('Active title is pressed');
				}
			});

			var aMockMessages = [{
				type: 'Error',
				title: 'Error message',
				active: true,
				description: sErrorDescription,
				subtitle: 'Example of subtitle',
				counter: 1
			}, {
				type: 'Warning',
				title: 'Warning without description',
				description: ''
			}, {
				type: 'Success',
				title: 'Success message',
				description: 'First Success message description',
				subtitle: 'Example of subtitle',
				counter: 1
			}, {
				type: 'Error',
				title: 'Error message',
				description: 'Second Error message description',
				subtitle: 'Example of subtitle',
				counter: 2
			}, {
				type: 'Information',
				title: 'Information message',
				description: 'First Information message description',
				subtitle: 'Example of subtitle',
				counter: 1
			}];

			var oModel = new JSONModel();
			oModel.setData(aMockMessages);
			this.getView().setModel(oModel);
			this.byId("messagePopoverBtn").addDependent(oMessagePopover);
		},

		// Display the button type according to the message with the highest severity
		// The priority of the message types are as follows: Error > Warning > Success > Info
		buttonTypeFormatter: function () {
			var sHighestSeverityIcon;
			var aMessages = this.getView().getModel().oData;

			aMessages.forEach(function (sMessage) {
				switch (sMessage.type) {
					case "Error":
						sHighestSeverityIcon = "Negative";
						break;
					case "Warning":
						sHighestSeverityIcon = sHighestSeverityIcon !== "Negative" ? "Critical" : sHighestSeverityIcon;
						break;
					case "Success":
						sHighestSeverityIcon = sHighestSeverityIcon !== "Negative" && sHighestSeverityIcon !== "Critical" ?  "Success" : sHighestSeverityIcon;
						break;
					default:
						sHighestSeverityIcon = !sHighestSeverityIcon ? "Neutral" : sHighestSeverityIcon;
						break;
				}
			});

			return sHighestSeverityIcon;
		},

		// Display the number of messages with the highest severity
		highestSeverityMessages: function () {
			var sHighestSeverityIconType = this.buttonTypeFormatter();
			var sHighestSeverityMessageType;

			switch (sHighestSeverityIconType) {
				case "Negative":
					sHighestSeverityMessageType = "Error";
					break;
				case "Critical":
					sHighestSeverityMessageType = "Warning";
					break;
				case "Success":
					sHighestSeverityMessageType = "Success";
					break;
				default:
					sHighestSeverityMessageType = !sHighestSeverityMessageType ? "Information" : sHighestSeverityMessageType;
					break;
			}

			return this.getView().getModel().oData.reduce(function(iNumberOfMessages, oMessageItem) {
				return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
			}, 0);
		},

		// Set the button icon according to the message with the highest severity
		buttonIconFormatter: function () {
			var sIcon;
			var aMessages = this.getView().getModel().oData;

			aMessages.forEach(function (sMessage) {
				switch (sMessage.type) {
					case "Error":
						sIcon = "sap-icon://message-error";
						break;
					case "Warning":
						sIcon = sIcon !== "sap-icon://message-error" ? "sap-icon://message-warning" : sIcon;
						break;
					case "Success":
						sIcon = "sap-icon://message-error" && sIcon !== "sap-icon://message-warning" ? "sap-icon://message-success" : sIcon;
						break;
					default:
						sIcon = !sIcon ? "sap-icon://message-information" : sIcon;
						break;
				}
			});

			return sIcon;
		},

		handleMessagePopoverPress: function (oEvent) {
			oMessagePopover.toggle(oEvent.getSource());
		}
	});

});