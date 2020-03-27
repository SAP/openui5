sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/Icon',
	'sap/m/Link',
	'sap/m/MessageItem',
	'sap/m/MessageView',
	'sap/m/Button',
	'sap/m/Bar',
	'sap/m/Text',
	'sap/m/ResponsivePopover'
], function(Controller, JSONModel, Icon, Link, MessageItem, MessageView, Button, Bar, Text, ResponsivePopover) {
	"use strict";

	return Controller.extend("sap.m.sample.MessageViewInsideResponsivePopover.controller.MessageViewInsideResponsivePopover", {

		onInit: function () {

			var that = this;
			var	oLink = new Link({
				text: "Show more information",
				href: "http://sap.com",
				target: "_blank"
			});

			var oMessageTemplate = new MessageItem({
				type: '{type}',
				title: '{title}',
				description: '{description}',
				subtitle: '{subtitle}',
				counter: '{counter}',
				markupDescription: "{markupDescription}",
				link: oLink
			});

			var aMockMessages = [{
				type: 'Error',
				title: 'Error message',
				description: 'First Error message description. \n' +
				'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod',
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

			var oModel = new JSONModel(),
				that = this;

			oModel.setData(aMockMessages);

			this.oMessageView = new MessageView({
					showDetailsPageHeader: false,
					itemSelect: function () {
						oBackButton.setVisible(true);
					},
					items: {
						path: "/",
						template: oMessageTemplate
					}
				});
			var	oBackButton = new Button({
					icon: sap.ui.core.IconPool.getIconURI("nav-back"),
					visible: false,
					press: function () {
						that.oMessageView.navigateBack();
						this.setVisible(false);
					}
				});

			this.oMessageView.setModel(oModel);

			var oCloseButton =  new Button({
					text: "Close",
					press: function () {
						that._oPopover.close();
					}
				}),
				oPopoverBar = new Bar({
						contentLeft: [oBackButton],
						contentMiddle: [
							new Icon({
								color: "#bb0000",
								src: "sap-icon://message-error"}),
							new Text({
								text: "Messages"
							})
						]
				});

			this._oPopover = new ResponsivePopover({
				customHeader: oPopoverBar,
				contentWidth: "20%",
				contentHeight: "40%",
				verticalScrolling: false,
				modal: true,
				content: [this.oMessageView],
				endButton:oCloseButton
			});
		},

		handlePopoverPress: function (oEvent) {
			this.oMessageView.navigateBack();
			this._oPopover.openBy(oEvent.getSource());
		}
	});
});
