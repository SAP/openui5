sap.ui.define([
	'sap/m/MessagePopover',
	'sap/m/MessageItem',
	'sap/m/MessageToast',
	'sap/m/Link',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (MessagePopover, MessageItem, MessageToast, Link, Controller, JSONModel) {
	"use strict";

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
		link: oLink,
		markupDescription: true
	});

	var oMessagePopover = new MessagePopover({
		items: {
			path: '/',
			template: oMessageTemplate
		},
		activeTitlePress: function () {
			MessageToast.show('Active title is pressed');
		}
	});


	return Controller.extend("sap.m.sample.MessagePopoverAsyncMessageHandling.controller.MessagePopoverAsyncMessageHandling", {
		onInit: function () {
			// create any data and a model and set it to the view

			var sErrorDescription = "<h2>Heading h2</h2>" +
				"<p>Paragraph. At vero eos et accusamus et iusto odio dignissimos ducimus qui ...</p>" +
				"<ul>" +
				"	<li>Unordered list item 1 <a href=\"http://sap.com/some/url\">Absolute URL that is disabled after validation.</a></li>" +
				"	<li>Unordered list item 2</li>" +
				"</ul>" +
				"<ol>" +
				"	<li>Ordered list item 1 <a href=\"#\">Relative URL that is allowed after validation.</a></li>" +
				"	<li>Ordered list item 2</li>" +
				"</ol>";

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

			oMessagePopover.setAsyncURLHandler(function (config) {
				var allowed = config.url.lastIndexOf("http", 0) < 0;

				config.promise.resolve({
					allowed: allowed,
					id: config.id
				});
			});

			oMessagePopover.setAsyncDescriptionHandler(function (config) {
				config.promise.resolve({
					allowed: true,
					id: config.id
				});
			});

			oMessagePopover.attachLongtextLoaded(function () {
				MessageToast.show("Description validation has been performed.");
			});

			oMessagePopover.attachUrlValidated(function () {
				MessageToast.show("URL validation has been performed.");
			});

			var oModel = new JSONModel();
			oModel.setData(aMockMessages);
			this.getView().setModel(oModel);
			this.byId("messagePopoverBtn").addDependent(oMessagePopover);
		},

		// Display the button type according to the message with the highest severity
		// The priority of the message types are as follows: Error > Warning > Success > Info
		buttonTypeFormatter: function () {
			var sHighestSeverity;
			var aMessages = this.getView().getModel().oData;

			aMessages.forEach(function (sMessage) {
				switch (sMessage.type) {
					case "Error":
						sHighestSeverity = "Negative";
						break;
					case "Warning":
						sHighestSeverity = sHighestSeverity !== "Negative" ? "Critical" : sHighestSeverity;
						break;
					case "Success":
						sHighestSeverity = sHighestSeverity !== "Negative" && sHighestSeverity !== "Critical" ?  "Success" : sHighestSeverity;
						break;
					default:
						sHighestSeverity = !sHighestSeverity ? "Neutral" : sHighestSeverity;
						break;
				}
			});

			return sHighestSeverity;
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