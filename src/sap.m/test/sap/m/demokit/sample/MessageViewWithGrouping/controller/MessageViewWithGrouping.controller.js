sap.ui.define([
	'sap/m/MessageView',
	'sap/m/MessagePopoverItem',
	'sap/m/Link',
	'sap/m/Dialog',
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/IconPool',
	'sap/ui/model/json/JSONModel',
	'sap/m/Button',
	'sap/m/Bar',
	'sap/m/Text'
], function(MessageView, MessagePopoverItem, Link, Dialog, Controller, IconPool, JSONModel, Button, Bar, Text) {
	"use strict";

	var oLink = new Link({
		text: "Show more information",
		href: "http://sap.com",
		target: "_blank"
	});

	var oMessageTemplate = new MessagePopoverItem({
		type: '{type}',
		title: '{title}',
		description: '{description}',
		subtitle: '{subtitle}',
		counter: '{counter}',
		groupName: '{group}',
		link: oLink
	});

	return Controller.extend("sap.m.sample.MessageViewWithGrouping.controller.MessageViewWithGrouping", {
		onInit: function () {
			var that = this;
			// create any data and a model and set it to the view

			var sErrorDescription = 'First Error message description. \n' +
				'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod' +
				'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,' +
				'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo' +
				'consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse' +
				'cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non' +
				'proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

			var aMockMessages = [{
				type: 'Error',
				title: 'Account 801 requires an assignment',
				description: sErrorDescription,
				subtitle: 'Role is invalid',
				group: "Purchase Order 450001"
			}, {
				type: 'Warning',
				title: 'Account 821 requires a check',
				description: sErrorDescription,
				subtitle: 'Undefined task',
				group: "Purchase Order 450001"
			}, {
				type: 'Warning',
				title: 'Enter a text with maximum 6 characters length',
				description: sErrorDescription,
				group: "Purchase Order 450002"
			}, {
				type: 'Warning',
				title: 'Enter a text with maximum 8 characters length',
				description: sErrorDescription,
				group: "Purchase Order 450002"
			}, {
				type: 'Error',
				title: 'Account 802 requires an assignment',
				description: sErrorDescription,
				subtitle: 'Role is invalid',
				group: "Purchase Order 450002"
			}, {
				type: 'Information',
				title: 'Account 804 requires an assignment',
				description: sErrorDescription,
				subtitle: 'Information type subtitle',
				group: "Purchase Order 450002"
			}, {
				type: 'Error',
				title: 'Technical message without object relation',
				description: sErrorDescription,
				group: "General"
			}, {
				type: 'Warning',
				title: 'Global System will be down on Sunday',
				description: sErrorDescription,
				group: "General"
			}, {
				type: 'Error',
				title: 'Global System will be down on Sunday',
				description: sErrorDescription,
				group: "General"
			}, {
				type: 'Error',
				title: 'An Error',
				subtitle: "Ungrouped message",
				description: sErrorDescription
			}, {
				type: 'Warning',
				title: 'A Warning',
				subtitle: "Ungrouped message",
				description: sErrorDescription
			}];

			var oModel = new JSONModel();
			oModel.setData(aMockMessages);

			var oBackButton = new Button({
				icon: IconPool.getIconURI("nav-back"),
				visible: false,
				press: function () {
					that.oMessageView.navigateBack();
					this.setVisible(false);
				}
			});

			this.oMessageView = new MessageView({
					showDetailsPageHeader: false,
					itemSelect: function () {
						oBackButton.setVisible(true);
					},
					items: {
						path: '/',
						template: oMessageTemplate
					},
					groupItems: true
				});

			this.getView().setModel(oModel);
			this.getView().addDependent(this.oMessageView);

			this.oDialog = new Dialog({
				content: this.oMessageView,
				contentHeight: "50%",
				contentWidth: "50%",
				endButton: new Button({
					text: "Close",
					press: function() {
						this.getParent().close();
					}
				}),
				customHeader: new Bar({
					contentMiddle: [
						new Text({ text: "Publish order"})
					],
					contentLeft: [oBackButton]
				}),
				verticalScrolling: false
			});
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

		handleMessageViewPress: function (oEvent) {
			this.oMessageView.navigateBack();
			this.oDialog.open();
		}
	});
});